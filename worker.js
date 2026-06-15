// Nishkam Middle Leadership — Cloudflare Worker
// Two jobs:
//   1) POST /api/feedback   -> proxies the scenario tool's request to the Claude API
//                              (your ANTHROPIC_API_KEY stays here, never in the page).
//   2) /api/reflection      -> POST stores a questionnaire response in KV;
//                              GET ?code=<LEAD_CODE> returns all responses (programme lead only).
//
// Bindings/secrets expected (see wrangler.toml + CLOUDFLARE-SETUP.md):
//   env.REFLECTIONS        KV namespace (stores responses)
//   env.ANTHROPIC_API_KEY  secret  (your Claude API key)
//   env.LEAD_CODE          secret  (the programme-lead access code)
//   env.MODEL              var     (Claude model id, defaults to claude-sonnet-4-6)
//   env.ALLOWED_ORIGIN     var     (your GitHub Pages origin, or "*")

const ANTHROPIC_VERSION = "2023-06-01";
const MAX_TOKENS_CAP = 1500;

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}
function json(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
  });
}

export default {
  async fetch(request, env) {
    const origin = env.ALLOWED_ORIGIN || "*";
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    // ---------- 1) Claude feedback proxy ----------
    if (url.pathname === "/api/feedback" && request.method === "POST") {
      if (!env.ANTHROPIC_API_KEY) return json({ error: "Server not configured" }, 500, origin);
      let body;
      try { body = await request.json(); } catch (e) { return json({ error: "Invalid JSON" }, 400, origin); }

      // Accept either {messages:[...]} (what the tool sends) or {prompt:"..."}.
      const messages = body.messages || (body.prompt ? [{ role: "user", content: String(body.prompt) }] : null);
      if (!messages) return json({ error: "No messages provided" }, 400, origin);

      try {
        const payload = {
          model: env.MODEL || "claude-sonnet-4-6",
          max_tokens: Math.min(Number(body.max_tokens) || 1000, MAX_TOKENS_CAP),
          messages,
        };
        if (body.system) payload.system = String(body.system);
        const upstream = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-api-key": env.ANTHROPIC_API_KEY,
            "anthropic-version": ANTHROPIC_VERSION,
          },
          body: JSON.stringify(payload),
        });
        const data = await upstream.json();
        // Pass Claude's response straight back; the page reads data.content[].text.
        return json(data, upstream.status, origin);
      } catch (e) {
        return json({ error: "Upstream request failed" }, 502, origin);
      }
    }

    // ---------- 2) Reflection storage ----------
    if (url.pathname === "/api/reflection") {
      if (!env.REFLECTIONS) return json({ error: "Storage not configured" }, 500, origin);

      // Participant submits a response
      if (request.method === "POST") {
        let obj;
        try { obj = await request.json(); } catch (e) { return json({ error: "Invalid JSON" }, 400, origin); }
        if (!obj || typeof obj !== "object" || Array.isArray(obj)) return json({ error: "Invalid payload" }, 400, origin);
        const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
        obj._id = id;
        obj._received = new Date().toISOString();
        await env.REFLECTIONS.put("resp:" + id, JSON.stringify(obj));
        return json({ ok: true }, 200, origin);
      }

      // Programme lead reads the cohort (code-gated, server-side)
      if (request.method === "GET") {
        const code = url.searchParams.get("code") || "";
        if (!env.LEAD_CODE || code !== env.LEAD_CODE) return json({ error: "Unauthorised" }, 401, origin);
        const responses = [];
        let cursor;
        do {
          const list = await env.REFLECTIONS.list({ prefix: "resp:", limit: 1000, cursor });
          for (const k of list.keys) {
            const v = await env.REFLECTIONS.get(k.name);
            if (v) { try { responses.push(JSON.parse(v)); } catch (e) {} }
          }
          cursor = list.list_complete ? null : list.cursor;
        } while (cursor);
        return json({ responses }, 200, origin);
      }

      if (request.method === "DELETE") {
        const code = url.searchParams.get("code") || "";
        if (!env.LEAD_CODE || code !== env.LEAD_CODE) return json({ error: "Unauthorised" }, 401, origin);
        const keys = [];
        let cursor;
        do {
          const list = await env.REFLECTIONS.list({ prefix: "resp:", limit: 1000, cursor });
          for (const k of list.keys) keys.push(k.name);
          cursor = list.list_complete ? null : list.cursor;
        } while (cursor);
        for (const name of keys) await env.REFLECTIONS.delete(name);
        return json({ ok: true, deleted: keys.length }, 200, origin);
      }
    }

    return json({ error: "Not found" }, 404, origin);
  },
};

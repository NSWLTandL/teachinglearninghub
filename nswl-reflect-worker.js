// nswl-reflect — reflection storage Worker for the Middle Leaders questionnaire.
// Separate from the AI proxy Worker (nswl-mlt). Backed by a Cloudflare KV namespace.
//
// Bindings this Worker expects (set in the Cloudflare dashboard, see SETUP guide):
//   KV namespace  ->  variable name: REFLECTIONS
//   Variable      ->  CLEAR_CODE  (the programme-lead code; e.g. nishkam-lead)
//
// Routes:
//   POST /submit   body = the response JSON           -> stores one response
//   GET  /list                                        -> { responses: [...] }
//   POST /clear    body = { code }                    -> deletes all responses (code must match CLEAR_CODE)
//   GET  /                                            -> health check

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };
    if (request.method === "OPTIONS") return new Response(null, { headers: cors });

    const json = (obj, status = 200) =>
      new Response(JSON.stringify(obj), {
        status,
        headers: { ...cors, "Content-Type": "application/json" },
      });

    try {
      if (url.pathname === "/submit" && request.method === "POST") {
        const body = await request.json();
        const id = Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
        await env.REFLECTIONS.put("resp:" + id, JSON.stringify(body));
        return json({ ok: true, id });
      }

      if (url.pathname === "/list" && request.method === "GET") {
        const out = [];
        let cursor;
        do {
          const res = await env.REFLECTIONS.list({ prefix: "resp:", cursor });
          for (const k of res.keys) {
            const v = await env.REFLECTIONS.get(k.name);
            if (v) { try { out.push(JSON.parse(v)); } catch (e) {} }
          }
          cursor = res.list_complete ? null : res.cursor;
        } while (cursor);
        return json({ responses: out });
      }

      if (url.pathname === "/clear" && request.method === "POST") {
        const body = await request.json().catch(() => ({}));
        if (!env.CLEAR_CODE || body.code !== env.CLEAR_CODE) {
          return json({ ok: false, error: "unauthorised" }, 403);
        }
        let cursor, n = 0;
        do {
          const res = await env.REFLECTIONS.list({ prefix: "resp:", cursor });
          for (const k of res.keys) { await env.REFLECTIONS.delete(k.name); n++; }
          cursor = res.list_complete ? null : res.cursor;
        } while (cursor);
        return json({ ok: true, deleted: n });
      }

      if (url.pathname === "/") return json({ ok: true, service: "nswl-reflect" });
      return json({ ok: false, error: "not found" }, 404);
    } catch (e) {
      return json({ ok: false, error: String(e) }, 500);
    }
  },
};

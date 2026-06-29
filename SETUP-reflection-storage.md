# Pooled storage for the Middle Leaders reflection tool

This adds a small, separate Cloudflare Worker (`nswl-reflect`) that genuinely
collects reflection submissions across devices and lets the programme lead clear
them. Your existing AI Worker (`nswl-mlt`) is **not touched** — the RAG helper and
all the scenario testers keep working exactly as they do now.

Everything below is done in the Cloudflare dashboard. No terminal needed.

## 1. Create a KV namespace

1. Cloudflare dashboard → **Storage & Databases → KV** (older menus: Workers & Pages → KV).
2. **Create namespace**. Name it `nswl-reflections`. Create.

## 2. Create the Worker

1. **Workers & Pages → Create → Workers → Create Worker**.
2. Name it `nswl-reflect`. Deploy the starter, then **Edit code**.
3. Delete the starter code, paste the whole contents of `nswl-reflect-worker.js`,
   then **Deploy**.

## 3. Bind the namespace and the clear code

In the Worker: **Settings → Variables and Secrets** (and **Bindings**):

- **KV Namespace Binding**: variable name `REFLECTIONS` → select the
  `nswl-reflections` namespace.
- **Environment Variable**: `CLEAR_CODE` = `nishkam-lead`
  (this must match `LEAD_CODE` in the questionnaire page).

**Deploy** again so the bindings take effect.

## 4. Check the URL

The Worker should be at `https://nswl-reflect.w-milligan.workers.dev`, which is
already set as `STORE_URL` in the questionnaire page. If Cloudflare gives it a
different address, open `mlt-reflection-questionnaire.html` and change the
`STORE_URL` line near the top to match (no trailing slash).

Quick test: visiting the Worker URL in a browser should show
`{"ok":true,"service":"nswl-reflect"}`.

## 5. Upload the page

Upload the updated `mlt-reflection-questionnaire.html` to the repo and hard-refresh.

## How it behaves now

- A staff member submits from their own device → the response is stored in KV.
- The programme lead view pulls the pooled responses from every device.
- **Clear all results** sends your lead code to the Worker, which deletes the
  whole store, then the view resets to empty.

If the Worker is ever unreachable, the page quietly falls back to the old
in-browser storage so it still functions; once the Worker is back, pooling
resumes.

## Notes

- The Worker allows requests from any origin (`Access-Control-Allow-Origin: *`),
  which is what lets the GitHub Pages site call it. Submissions are anonymous
  cohort reflections, and clearing requires the lead code.
- To change the lead code later, update `CLEAR_CODE` in the Worker **and**
  `LEAD_CODE` in the page so they stay in step.

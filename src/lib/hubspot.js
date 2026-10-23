// src/lib/hubspot.js
// IDs from a HubSpot form embed code pasted into ACF (server + client safe). Both snippets:
//  - legacy:  hbspt.forms.create({ region: "eu1", portalId: "123", formId: "abc-…" })
//  - current: <div class="hs-form-frame" data-region="eu1" data-portal-id="123" data-form-id="abc-…">
export function parseHubspotEmbed(code) {
  const s = String(code || "");
  const pick = (...res) => res.map((re) => s.match(re)?.[1]).find(Boolean) || "";
  const portalId = pick(/portalId\s*:\s*["']?(\d+)/, /data-portal-id=["'](\d+)/);
  const formId = pick(/formId\s*:\s*["']([\w-]+)/, /data-form-id=["']([\w-]+)/);
  const region = pick(/region\s*:\s*["']([\w-]+)/, /data-region=["']([\w-]+)/) || "eu1";
  return portalId && formId ? { portalId, formId, region } : null;
}

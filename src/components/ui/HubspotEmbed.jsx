"use client";

// Renders a HubSpot form from the embed code pasted into ACF. Both HubSpot snippets work:
//  - legacy:  hbspt.forms.create({ region: "eu1", portalId: "123", formId: "abc-…" })
//  - current: <div class="hs-form-frame" data-region="eu1" data-portal-id="123" data-form-id="abc-…">
// Only the IDs are read from the pasted code — no pasted script is ever executed.

import React from "react";
import { parseHubspotEmbed } from "@/lib/hubspot";

let scriptPromise;
function loadHubspot(region) {
  if (window.hbspt?.forms) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = `https://js${region === "eu1" ? "-eu1" : ""}.hsforms.net/forms/embed/v2.js`;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }
  return scriptPromise;
}

export default function HubspotEmbed({ code, className = "" }) {
  const ref = React.useRef(null);
  const config = React.useMemo(() => parseHubspotEmbed(code), [code]);

  React.useEffect(() => {
    if (!config || !ref.current) return;
    const target = ref.current;
    const id = `hs-form-${config.formId}`;
    target.id = id;
    let cancelled = false;
    loadHubspot(config.region)
      .then(() => {
        if (cancelled || !window.hbspt?.forms) return;
        target.innerHTML = "";
        window.hbspt.forms.create({ region: config.region, portalId: config.portalId, formId: config.formId, target: `#${id}` });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [config]);

  if (!config) return null;
  return <div ref={ref} className={className} />;
}

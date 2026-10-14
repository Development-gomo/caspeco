// Internal API route — called by middleware to fetch WP redirects
// Runs on Node.js runtime (full process.env access)

import { WP_BASE } from "@/config";
import { maskWpString } from "@/lib/wpMask";

const PER_PAGE = 200;

export async function GET() {
  const allItems = [];
  let page = 0;

  const credentials = btoa(
    `${process.env.WP_API_USER}:${process.env.WP_API_PASS}`
  );

  while (true) {
    const res = await fetch(
      `${WP_BASE}/redirection/v1/redirect?per_page=${PER_PAGE}&page=${page}`,
      {
        cache: "no-store",
        headers: { Authorization: `Basic ${credentials}` },
      }
    );

    if (!res.ok) break;

    const data = await res.json();
    const items = Array.isArray(data?.items) ? data.items : [];
    allItems.push(...items);

    if (items.length < PER_PAGE) break;
    page++;
  }

  // Only what proxy.js needs, with CMS URLs masked so a redirect never points at the WP host
  const rules = allItems
    .filter((r) => r?.enabled !== false)
    .map((r) => ({
      url: r.url,
      action_code: r.action_code,
      match_type: r.match_type,
      action_data: { url: maskWpString(r.action_data?.url || "") },
      match_data: { source: { flag_trailing: r.match_data?.source?.flag_trailing ?? false } },
    }));
  return Response.json(rules);
}

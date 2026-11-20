// src/app/api/gone/route.js
// Target of the /assets/* and /static/* rewrites (next.config.mjs) for everything except
// /assets/uploads: a plain 404 with no WordPress lookup. (Not "_gone": app-router folders
// starting with "_" are private and not routable.)

const notFound = () => new Response("Not found", { status: 404, headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" } });

export const GET = notFound;
export const HEAD = notFound;

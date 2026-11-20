// src/app/api/[...path]/route.js
// Catch-all for unknown /api/* URLs: a plain 404 with no page render and no WordPress call.
// Static siblings (content/[...path], revalidate, gone) are more specific and win over this.
export { GET, HEAD } from "../gone/route";

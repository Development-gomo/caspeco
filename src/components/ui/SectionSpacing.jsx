import { spacingAttrs } from "@/lib/content";

// Wraps a rendered section only when its ACF Spacing tab disables a side; otherwise returns the
// node untouched (same markup as before). The wrapper has no box (display: contents in globals.css).
export function withSpacing(block, node, key) {
  if (!node) return node;
  const attrs = spacingAttrs(block);
  if (!attrs["data-sec-pt"] && !attrs["data-sec-pb"]) return node;
  return <div key={key} {...attrs}>{node}</div>;
}

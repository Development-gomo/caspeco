// src/components/sections/home/CasperChatAnimation.jsx
// Coded Casper AI chat for the home_ai_section media box: a rebuild of docs/Casper-overlay-black.mp4 driven by ACF
// text (chat_exchanges / chat_suggestions etc., see docs/ARCHITECTURE.md). Scene A: each question is typed into a user
// bubble, Casper's answer card fades in word by word, an optional progress bar fills and counts up. Scene B: suggestion
// bubbles. Then it loops.
// One requestAnimationFrame clock runs only while the box is >= 35% in view and the tab is visible. Everything on screen
// is a pure function of that clock time, so pausing just stops the clock. Text is rendered as React text nodes only.
// The animated layer is aria-hidden; an sr-only transcript carries the content.

"use client";

import React from "react";
import { flushSync } from "react-dom";
import { cubicBezier, easeInOut, easeOut, useInView, useReducedMotion } from "framer-motion";
import { countSegmentChars, parseChatText, sliceSegments } from "@/lib/content";

// All times in seconds of the film at speed 100 (timestamps from the frame-by-frame measurement of the video)
const TIMING = {
  lead: 0.1, // B1 starts entering at 0.10 (with loopGap: ~0.3 s of nothing at the loop seam)
  // User bubble
  bubbleFade: 0.25, // opacity 0.10 → 0.35
  bubbleShiftHold: 0.1, // offset held 0.10-0.20 ...
  bubbleShift: 0.35, // ... then eases to 0 by 0.55
  bubbleBlurHold: 0.15, // blurred until ~0.25-0.5 ...
  bubbleBlur: 0.3, // ... sharp by 0.55
  typeDelay: 0.42, // first glyph 0.42 after the bubble starts (0.10 → 0.52, 5.93 → 6.37)
  charTime: 0.035, // 31 chars in 1.08 s; keystrokes jitter 17-83 ms (see jitter())
  caretPeriod: 1.0, // blink: ON 0.1-0.5, OFF 0.5-1.0, ON 1.0-1.5 ... (B2: ON 6.0-6.35, OFF 6.37-6.85)
  caretPhase: 0.08, // the ON half starts ~0.08 before the bubble does
  caretTail: 0.35, // caret removed 0.45 (B1) / 0.25 (B2) after the last char
  // Casper card
  answerGap: 0.6, // typing end → card start: 1.60 → 2.20 and 7.12 → 7.72
  cardIn: 0.5, // opacity + rise 2.20 → ~2.70
  cardBlur: 0.4, // not measured on the card; same family as the bubbles, kept short
  wordDelay: 0.32, // card start → first word fading in ("Casper:" 50% at 2.63 / 8.15)
  // Word stagger shrinks with length: card 1 spreads 12 gaps over 0.85 s (71 ms), card 2 22 gaps over 1.27 s (58 ms)
  // → spread = wordSpreadBase + wordGap × gaps, at most wordStaggerMax per gap
  wordSpreadBase: 0.35,
  wordGap: 0.042,
  wordStaggerMax: 0.075,
  wordFade: 0.22, // each word 10 → 90% in ~0.2-0.25 s
  barDelay: 0.28, // last word 3.57 → card starts growing 3.85
  barGrow: 0.55, // card grows by the bar row 3.85 → 4.40
  barFill: 1.3, // bar fill + count-up 4.40 → 5.70
  afterBar: 0.23, // bar end 5.70 → next bubble 5.93
  afterAnswer: 1.2, // not in the film (only its last card has no bar): reading pause before the next question
  afterQuestion: 1.0, // not in the film: a question with no answer
  // Scene change
  convoHold: 1.55, // last word 9.50 → conversation fade-out 11.05
  outStagger: 0.04, // fade-out starts 11.05 / 11.07 / 11.10 / 11.17, top to bottom
  outDur: 0.42, // each gone ~0.4-0.45 s after it starts; suggestion 1 follows right away (11.60)
  // Suggestions
  suggStagger: 0.65, // 11.60 / 12.25 / 12.92 / 13.57
  suggFade: 0.3, // opacity 11.58 → 11.90
  suggShiftHold: 0.25, // offset held to ~11.85 ...
  suggShift: 0.3, // ... 0 by ~12.15
  suggBlur: 0.6, // sharp ~12.2; the last one counts as "shown" from here (endHold starts)
  suggOutStagger: 0.065, // fade-out starts 15.85 … 15.95
  suggOutDur: 0.5, // S1 15.85 → gone 16.40
  loopGap: 0.2, // black 16.5 → 16.7, then the next loop starts (plus lead)
};

// Sizes in CSS px (the spec's CSS column, video px × 0.653)
// Column: the film's is 286, but Tenon sets ~5% wider than the film's font. 310 keeps the example copy on the film's
// lines (card 1 breaks after "which is", "Help me set the 2027 budget…" stays on one line).
const COLUMN_W = 310;
const PAD_BOTTOM = 12; // space kept under the newest box when a long conversation scrolls
const SHIFT = { bubbleX: 8, bubbleY: 8.5, cardY: 6.5, suggY: 9, outY: 13, suggOutY: 2.5 };
const BLUR = { bubble: 2, card: 1.5, word: 2, sugg: 2, out: 2.5 };
const BAR_ROW = 24.2; // gap + bar row: how much a card grows when its bar appears (37 video px)
const TRACK_W = 180; // bar track (276 video px)
const LABEL_GAP = 17; // track → % label (26 video px)
const FILL_EASE = cubicBezier(0.62, 0.08, 0.36, 0.94); // least-squares fit to the film's 14 fill samples (S-curve, slow tail)
const TOP_FADE = { maskImage: "linear-gradient(to bottom, transparent 0, #000 32px)", WebkitMaskImage: "linear-gradient(to bottom, transparent 0, #000 32px)" };

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const prog = (t, start, dur) => (dur > 0 ? clamp01((t - start) / dur) : t >= start ? 1 : 0);

// ── Props → plain data ──────────────────────────────────────────────────────────────────────────────────────────────

// chat_speed: 50-200, 100 = film speed (200 plays twice as fast); empty / invalid → 100
function toSpeed(v) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.min(200, Math.max(50, n)) : 100;
}

// chat_loop: ACF true/false arrives as true/false (or 1/"1"/0/"0"). A missing field (undefined/null) keeps the default
// (on); an explicit false/0/"0"/"" (or "false"/"off"/"no") turns looping off.
function toLoop(v) {
  if (v === undefined || v === null) return true;
  if (typeof v === "string") return !["", "0", "false", "off", "no"].includes(v.trim().toLowerCase());
  return Boolean(v);
}

// chat_end_hold: seconds; empty / invalid → 2.5 (capped at 30)
function toHold(v) {
  const n = parseFloat(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) && n >= 0 ? Math.min(n, 30) : 2.5;
}

// progress_percent: ACF Number returns "" when empty → no bar; otherwise clamped 0-100
function toPercent(v) {
  if (typeof v !== "number" && typeof v !== "string") return null;
  const s = String(v).trim().replace(",", ".").replace(/\s*%$/, "");
  if (!/^-?\d+(\.\d+)?$/.test(s)) return null;
  return Math.min(100, Math.max(0, Number(s)));
}

// progress_label: empty → "{n}%"; otherwise the first number inside it counts up, the text around it stays
const NUMBER = /^(\D*?)(\d+(?:[.,]\d+)?)(.*)$/s;
function toLabel(label, pct) {
  const text = typeof label === "string" ? label.trim() : typeof label === "number" ? String(label) : "";
  const m = (text || `${+pct.toFixed(1)}%`).match(NUMBER);
  return m ? { prefix: m[1], num: m[2], suffix: m[3] } : { prefix: text, num: "", suffix: "" };
}

// Format v like the original number string (same decimals and separator), as CountUp does
function formatNumber(v, original) {
  const dec = original.split(/[.,]/)[1];
  const sep = original.includes(",") ? "," : ".";
  const [i, d] = v.toFixed(dec?.length || 0).split(".");
  return d ? `${i}${sep}${d}` : i;
}

function labelText({ prefix, num, suffix }, k) {
  if (!num) return prefix;
  return `${prefix}${formatNumber(parseFloat(num.replace(",", ".")) * k, num)}${suffix}`;
}

function trimSegments(segments) {
  const out = segments.map((s) => ({ ...s }));
  while (out.length && !out[0].text.trim()) out.shift();
  while (out.length && !out[out.length - 1].text.trim()) out.pop();
  if (out.length) {
    out[0].text = out[0].text.trimStart();
    out[out.length - 1].text = out[out.length - 1].text.trimEnd();
  }
  return out;
}

const plain = (segments) => segments.map((s) => s.text).join("");

// Segments → words for the card reveal. A word may span segments ("SEK 21.3M" bold + "," regular). Only ordinary
// whitespace splits, so a non-breaking space glues words into one reveal step.
function toWords(segments) {
  const tokens = [];
  let word = null;
  let count = 0;
  for (const seg of segments) {
    for (const piece of seg.text.split(/([ \t\r\n]+)/)) {
      if (!piece) continue;
      if (/^[ \t\r\n]+$/.test(piece)) {
        word = null;
        tokens.push({ space: piece });
      } else {
        if (!word) {
          word = { index: count++, parts: [] };
          tokens.push(word);
        }
        word.parts.push({ text: piece, bold: seg.bold, label: !!seg.label });
      }
    }
  }
  return { tokens, count };
}

// Rows with neither question nor answer and empty suggestions are dropped
function normalise(exchanges, suggestions, casperLabel) {
  const label = (typeof casperLabel === "string" && casperLabel.trim()) || "Casper:";
  const rows = (Array.isArray(exchanges) ? exchanges : [])
    .map((row) => {
      if (!row || typeof row !== "object") return null;
      const question = trimSegments(parseChatText(row.question));
      const answer = trimSegments(parseChatText(row.answer));
      if (!question.length && !answer.length) return null;
      const pct = answer.length ? toPercent(row.progress_percent) : null;
      return {
        question,
        chars: countSegmentChars(question),
        answer,
        words: answer.length ? toWords([{ text: label, bold: true, label: true }, { text: " ", bold: false }, ...answer]) : null,
        bar: pct === null ? null : { pct, label: toLabel(row.progress_label, pct) },
      };
    })
    .filter(Boolean);
  const chips = (Array.isArray(suggestions) ? suggestions : [])
    .map((row) => trimSegments(parseChatText(typeof row === "string" ? row : row?.text)))
    .filter((s) => s.length);
  return { label, exchanges: rows, suggestions: chips };
}

// ── Timeline (film seconds) ─────────────────────────────────────────────────────────────────────────────────────────

// Deterministic keystroke jitter, 0.55-1.45 × charTime (averages 1), so server and client agree
function jitter(i) {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return 0.55 + 0.9 * (x - Math.floor(x));
}

function buildTimeline({ exchanges, suggestions }, { rate, loop, endHold }) {
  const T = TIMING;
  const hold = endHold * rate; // endHold is real seconds; the clock runs `rate` film seconds per second
  const steps = []; // scene A boxes in screen order
  const turns = [];
  let cursor = T.lead;
  let aEnd = 0;

  exchanges.forEach((ex, i) => {
    const turn = {};
    if (ex.chars) {
      const times = [];
      let at = cursor + T.typeDelay;
      for (let k = 0; k < ex.chars; k++) {
        times.push(at);
        at += T.charTime * jitter(i * 97 + k);
      }
      const typeEnd = times[times.length - 1];
      turn.bubble = { index: steps.length, start: cursor, times, caretOff: typeEnd + T.caretTail };
      steps.push(turn.bubble);
      cursor = typeEnd + (ex.words ? T.answerGap : T.afterQuestion);
      aEnd = turn.bubble.caretOff;
    }
    if (ex.words) {
      const gaps = ex.words.count - 1;
      const card = { index: steps.length, start: cursor, wordsStart: cursor + T.wordDelay };
      card.stagger = gaps > 0 ? Math.min(T.wordStaggerMax, (T.wordSpreadBase + T.wordGap * gaps) / gaps) : 0;
      card.wordsEnd = card.wordsStart + gaps * card.stagger + T.wordFade;
      let end = card.wordsEnd;
      if (ex.bar) {
        card.growStart = card.wordsEnd + T.barDelay;
        card.fillStart = card.growStart + T.barGrow;
        end = card.fillStart + T.barFill;
      }
      turn.card = card;
      steps.push(card);
      cursor = end + (ex.bar ? T.afterBar : T.afterAnswer);
      aEnd = end;
    }
    turns.push(turn);
  });

  const n = steps.length;
  const m = suggestions.length;
  let bStart = T.lead;
  let duration = 0;
  let stopAt = 0;
  let stillAt = 0;
  if (n) {
    // the last scene's hold is chat_end_hold; between the scenes the film's 1.55 s
    const fadeStart = aEnd + (m ? T.convoHold : hold);
    steps.forEach((s, k) => {
      s.out = fadeStart + k * T.outStagger;
    });
    bStart = fadeStart + (n - 1) * T.outStagger + T.outDur;
    duration = bStart + T.loopGap;
    stopAt = aEnd;
    stillAt = aEnd;
  }
  const chips = suggestions.map((_, j) => ({ index: j, start: bStart + j * T.suggStagger }));
  if (m) {
    const settled = chips[m - 1].start + T.suggBlur;
    const fadeStart = settled + hold;
    chips.forEach((s, j) => {
      s.out = fadeStart + j * T.suggOutStagger;
    });
    duration = fadeStart + (m - 1) * T.suggOutStagger + T.suggOutDur + T.loopGap;
    stopAt = settled;
    if (!n) stillAt = settled;
  }
  // loop off: play once and stay on the last scene's finished state
  return { turns, steps, chips, duration, stopAt: loop ? duration : stopAt, stillAt };
}

// ── Visual state as a function of t ─────────────────────────────────────────────────────────────────────────────────

// Blur only while it is visible (entrances / exits); otherwise no filter at all
function motionStyle({ opacity, x = 0, y = 0, blur = 0 }) {
  return {
    opacity,
    transform: x || y ? `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)` : undefined,
    filter: blur > 0.05 && opacity > 0.001 ? `blur(${blur.toFixed(2)}px)` : undefined,
  };
}

// Scene A fade-out: blur + drift up
function exitAt(t, start) {
  const p = easeInOut(prog(t, start, TIMING.outDur));
  return { fade: 1 - p, y: -SHIFT.outY * p, blur: BLUR.out * p };
}

function bubbleFrame(step, t) {
  const T = TIMING;
  const d = t - step.start;
  const shift = 1 - easeInOut(prog(d, T.bubbleShiftHold, T.bubbleShift));
  const out = exitAt(t, step.out);
  let typed = 0;
  while (typed < step.times.length && step.times[typed] <= t) typed++;
  const caretOn = t >= step.start && t < step.caretOff && (t - step.start + T.caretPhase) % T.caretPeriod < T.caretPeriod / 2;
  return {
    style: motionStyle({
      opacity: easeOut(prog(d, 0, T.bubbleFade)) * out.fade,
      x: SHIFT.bubbleX * shift,
      y: SHIFT.bubbleY * shift + out.y,
      blur: BLUR.bubble * (1 - easeInOut(prog(d, T.bubbleBlurHold, T.bubbleBlur))) + out.blur,
    }),
    typed,
    caretOn,
  };
}

function cardFrame(step, t) {
  const T = TIMING;
  const d = t - step.start;
  const k = easeOut(prog(d, 0, T.cardIn));
  const out = exitAt(t, step.out);
  const grow = step.growStart === undefined ? 0 : easeInOut(prog(t, step.growStart, T.barGrow));
  return {
    style: motionStyle({ opacity: k * out.fade, y: SHIFT.cardY * (1 - k) + out.y, blur: BLUR.card * (1 - easeOut(prog(d, 0, T.cardBlur))) + out.blur }),
    grow,
    rowOpacity: prog(grow, 0.5, 0.4), // track + "0%" show once the card has made room (visible by 4.2 in the film)
    fill: step.fillStart === undefined ? 0 : FILL_EASE(prog(t, step.fillStart, T.barFill)),
  };
}

function wordStyle(step, i, t) {
  const p = prog(t, step.wordsStart + i * step.stagger, TIMING.wordFade);
  return motionStyle({ opacity: easeOut(p), blur: BLUR.word * (1 - p) });
}

function chipStyle(step, t) {
  const T = TIMING;
  const d = t - step.start;
  const shift = 1 - easeInOut(prog(d, T.suggShiftHold, T.suggShift));
  const p = easeInOut(prog(t, step.out, T.suggOutDur));
  return motionStyle({
    opacity: easeOut(prog(d, 0, T.suggFade)) * (1 - p),
    y: SHIFT.suggY * shift - SHIFT.suggOutY * p,
    blur: BLUR.sugg * (1 - easeOut(prog(d, 0, T.suggBlur))) + BLUR.out * p,
  });
}

// When a long conversation overflows the box, the column scrolls up as each new box arrives (none in the film)
const scrollTarget = (layout, step) => Math.max(0, (layout.bottoms[step.index] ?? 0) + PAD_BOTTOM - layout.boxH);
function scrollAt(t, steps, layout) {
  if (!layout) return 0;
  let off = 0;
  let prev = 0;
  for (const step of steps) {
    const p = easeInOut(prog(t, step.start - 0.1, 0.5));
    if (p <= 0) break;
    const target = scrollTarget(layout, step);
    off = prev + (target - prev) * p;
    prev = target;
  }
  return off;
}

// ── Measuring ───────────────────────────────────────────────────────────────────────────────────────────────────────

// Boxes hug their widest line like the film's (CSS shrink-to-fit keeps a wrapped box at its max-width), and the
// scene A box bottoms drive the overflow scroll. Read with the fitted widths removed, so the natural wraps are measured.
function readLayout(root) {
  const fits = {};
  root.querySelectorAll("[data-fit]").forEach((el) => {
    const text = el.querySelector("[data-fit-text]");
    if (!text) return;
    const box = text.getBoundingClientRect();
    let right = box.left;
    const range = document.createRange();
    const walker = document.createTreeWalker(text, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (!node.nodeValue.trim()) continue;
      range.selectNodeContents(node);
      for (const r of range.getClientRects()) if (r.width > 0) right = Math.max(right, r.right);
    }
    let inner = right - box.left;
    const label = el.querySelector("[data-fit-label]");
    if (label) inner = Math.max(inner, TRACK_W + LABEL_GAP + label.getBoundingClientRect().width);
    fits[el.dataset.fit] = Math.ceil((inner + el.getBoundingClientRect().width - box.width) * 2) / 2 + 0.5;
  });
  const column = root.querySelector("[data-chat-column]");
  const bottoms = [];
  column?.querySelectorAll("[data-chat-item]").forEach((el) => {
    bottoms[Number(el.dataset.chatItem)] = column.offsetTop + el.offsetTop + el.offsetHeight;
  });
  return { boxH: root.clientHeight, bottoms, fits };
}

const subscribeVisibility = (cb) => {
  document.addEventListener("visibilitychange", cb);
  return () => document.removeEventListener("visibilitychange", cb);
};
const pageIsVisible = () => document.visibilityState !== "hidden";
const noSubscribe = () => () => {};
const isTrue = () => true;
const isFalse = () => false;

// ── Rendering ───────────────────────────────────────────────────────────────────────────────────────────────────────

// Highlights are explicit (bold + yellow); the chat must not rely on .cs-highlight, which colours every span
function Segment({ seg, hidden }) {
  const style = hidden ? { color: "transparent" } : undefined;
  return seg.bold ? (
    <span className="font-bold text-(--color-yellow)" style={style}>
      {seg.text}
    </span>
  ) : (
    <span style={style}>{seg.text}</span>
  );
}

// The whole question is in the bubble from the start (untyped part transparent), so it is full size from the first
// frame like the film and the typing never re-wraps. The caret is out of flow and sits at its static position, i.e.
// right after the last typed character.
function Bubble({ step, segments, t, width }) {
  const f = bubbleFrame(step, t);
  const typed = sliceSegments(segments, f.typed);
  let skip = f.typed;
  const rest = [];
  for (const seg of segments) {
    if (skip >= seg.text.length) skip -= seg.text.length;
    else {
      rest.push({ text: seg.text.slice(skip), bold: seg.bold });
      skip = 0;
    }
  }
  return (
    <div
      data-chat-item={step.index}
      data-fit={`q${step.index}`}
      className="relative w-fit max-w-[56%] self-end rounded-[3.9px] border-[0.65px] border-[#636769] bg-[#2f3336] px-[13.1px] py-[9.1px] whitespace-pre-line text-pretty"
      style={{ ...f.style, width }}
    >
      <p data-fit-text>
        {typed.map((seg, i) => (
          <Segment key={`t${i}`} seg={seg} />
        ))}
        {f.caretOn && <span className="absolute mt-px h-[13px] w-[1.3px] bg-(--color-yellow)" />}
        {rest.map((seg, i) => (
          <Segment key={`r${i}`} seg={seg} hidden />
        ))}
      </p>
    </div>
  );
}

// The card keeps its final size in the layout (bar row included); only the background box grows when the bar appears,
// so nothing below ever moves
function Card({ step, ex, t, width }) {
  const f = cardFrame(step, t);
  return (
    <div
      data-chat-item={step.index}
      data-fit={`a${step.index}`}
      className="relative w-fit max-w-full self-start px-[13.75px] py-[12.45px]"
      style={{ ...f.style, width }}
    >
      <span
        className="absolute inset-x-0 top-0 rounded-[3.9px] border-[0.65px] border-[#2b2d2f] bg-[#020608]"
        style={{ bottom: ex.bar ? (1 - f.grow) * BAR_ROW : 0 }}
      />
      <p data-fit-text className="relative">
        {ex.words.tokens.map((tok, i) =>
          tok.space !== undefined ? (
            tok.space.includes("\n") ? <br key={i} /> : tok.space
          ) : (
            <span key={i} className="inline-block" style={wordStyle(step, tok.index, t)}>
              {tok.parts.map((part, j) => (
                <span key={j} className={part.label ? "font-bold" : part.bold ? "font-bold text-(--color-yellow)" : undefined}>
                  {part.text}
                </span>
              ))}
            </span>
          )
        )}
      </p>
      {ex.bar && (
        <div className="relative mt-[9.2px] flex h-[15px] items-center" style={{ opacity: f.rowOpacity }}>
          <span className="relative h-[7.8px] min-w-0 flex-[1_1_180px] rounded-full border-[0.65px] border-(--color-yellow)">
            <span className="absolute -inset-y-[0.65px] left-0 rounded-full bg-(--color-yellow)" style={{ width: `${ex.bar.pct * f.fill}%` }} />
          </span>
          {/* the final label reserves the width; the live one counts up right-aligned over it */}
          <span data-fit-label className="relative ml-[17px] shrink-0 whitespace-nowrap text-[11.8px] leading-[15px]">
            <span className="invisible">{labelText(ex.bar.label, 1)}</span>
            <span className="absolute top-0 right-0">{labelText(ex.bar.label, f.fill)}</span>
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * Props: exchanges = ACF chat_exchanges rows ({ question, answer, progress_percent, progress_label }),
 * suggestions = chat_suggestions rows ({ text }), casperLabel, speed (chat_speed), loop (chat_loop),
 * endHold (chat_end_hold), className (sizing from the parent). Fills its parent: give the wrapper a size.
 */
export default function CasperChatAnimation({ exchanges, suggestions, casperLabel, speed, loop, endHold, className = "" }) {
  const rootRef = React.useRef(null);
  const clockRef = React.useRef({ sig: "", t: 0 });
  const [clock, setClock] = React.useState({ sig: "", t: 0 });
  const [layout, setLayout] = React.useState(null);

  const content = React.useMemo(() => normalise(exchanges, suggestions, casperLabel), [exchanges, suggestions, casperLabel]);
  const rate = toSpeed(speed) / 100;
  const looping = toLoop(loop);
  const hold = toHold(endHold);
  const timeline = React.useMemo(() => buildTimeline(content, { rate, loop: looping, endHold: hold }), [content, rate, looping, hold]);
  // Content identity: a change restarts the timeline (a new array with the same rows does not)
  const sig = React.useMemo(() => JSON.stringify([content, rate, looping, hold]), [content, rate, looping, hold]);

  // Server and first client render are identical (idle, nothing visible); motion starts after mount
  const mounted = React.useSyncExternalStore(noSubscribe, isTrue, isFalse);
  const pageVisible = React.useSyncExternalStore(subscribeVisibility, pageIsVisible, isTrue);
  const inView = useInView(rootRef, { amount: 0.35 });
  const reduce = useReducedMotion();
  const still = mounted && !!reduce;
  const playing = mounted && !still && inView && pageVisible && timeline.duration > 0;

  // The clock: accumulates film time only while playing, so a pause resumes exactly where it stopped
  React.useEffect(() => {
    if (!playing) return undefined;
    if (clockRef.current.sig !== sig) clockRef.current = { sig, t: 0 };
    let raf = 0;
    let last = null;
    const tick = (now) => {
      if (last !== null) {
        const next = clockRef.current.t + (Math.min(now - last, 100) / 1000) * rate;
        clockRef.current = { sig, t: looping ? next % timeline.duration : Math.min(next, timeline.stopAt) };
        setClock(clockRef.current);
        if (!looping && clockRef.current.t >= timeline.stopAt) return;
      }
      last = now;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, sig, rate, looping, timeline]);

  // Measure box widths / bottoms on mount, resize and font load
  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    let frame = 0;
    let alive = true;
    const measure = () => {
      if (!alive) return;
      flushSync(() => setLayout((l) => (l?.fits ? { ...l, fits: null } : l)));
      setLayout(readLayout(root));
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    const ro = new ResizeObserver(schedule);
    ro.observe(root);
    root.querySelectorAll("[data-chat-column], [data-chat-chips]").forEach((el) => ro.observe(el));
    document.fonts?.ready.then(schedule);
    return () => {
      alive = false;
      cancelAnimationFrame(frame);
      ro.disconnect();
    };
  }, [sig]);

  const { exchanges: rows, suggestions: chips, label } = content;
  if (!rows.length && !chips.length) return null;

  const t = still ? timeline.stillAt : clock.sig === sig ? clock.t : 0;
  const { steps } = timeline;
  const maxScroll = layout && steps.length ? scrollTarget(layout, steps[steps.length - 1]) : 0;
  const scroll = still ? maxScroll : scrollAt(t, steps, layout);
  const fit = (key) => (layout?.fits?.[key] ? `${layout.fits[key]}px` : undefined);

  return (
    <div ref={rootRef} className={`relative h-full w-full overflow-hidden text-[13.1px] leading-[15px] text-white ${className}`}>
      <div className="sr-only">
        {rows.map((ex, i) => (
          <React.Fragment key={i}>
            {ex.question.length > 0 && <p>{plain(ex.question)}</p>}
            {ex.answer.length > 0 && (
              <p>
                {label} {plain(ex.answer)}
                {ex.bar ? ` (${labelText(ex.bar.label, 1)})` : ""}
              </p>
            )}
          </React.Fragment>
        ))}
        {chips.length > 0 && (
          <ul>
            {chips.map((chip, j) => (
              <li key={j}>{plain(chip)}</li>
            ))}
          </ul>
        )}
      </div>

      <div aria-hidden className="pointer-events-none absolute inset-0 select-none">
        {steps.length > 0 && (
          // first bubble near the top of the box, like the film
          <div className="absolute inset-0 pt-3" style={maxScroll > 0 ? TOP_FADE : undefined}>
            <div
              data-chat-column
              className="relative mx-auto flex w-full flex-col gap-[43px]"
              style={{ maxWidth: COLUMN_W, transform: scroll ? `translate3d(0, ${(-scroll).toFixed(2)}px, 0)` : undefined }}
            >
              {rows.map((ex, i) => {
                const turn = timeline.turns[i];
                return (
                  <div key={i} className="flex flex-col gap-[9.5px]">
                    {turn.bubble && <Bubble step={turn.bubble} segments={ex.question} t={t} width={fit(`q${turn.bubble.index}`)} />}
                    {turn.card && <Card step={turn.card} ex={ex} t={t} width={fit(`a${turn.card.index}`)} />}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {chips.length > 0 && (
          // suggestions are centred in the box (their block sits around the middle of the film's frame)
          <div className="absolute inset-0 flex flex-col justify-center-safe py-3">
            <div data-chat-chips className="mx-auto flex w-full flex-col items-start gap-[9.2px]" style={{ maxWidth: COLUMN_W }}>
              {chips.map((chip, j) => (
                <div
                  key={j}
                  data-fit={`s${j}`}
                  className="w-fit max-w-full rounded-[3.9px] border-[0.65px] border-[#636769] bg-[#2f3336] px-[13.1px] py-[8.5px] whitespace-pre-line text-pretty"
                  style={{ ...chipStyle(timeline.chips[j], t), width: fit(`s${j}`) }}
                >
                  <p data-fit-text>
                    {chip.map((seg, k) => (
                      <Segment key={k} seg={seg} />
                    ))}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

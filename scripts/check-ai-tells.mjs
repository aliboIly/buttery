#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { extname } from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

export const AGENT_PATHS = [
  "AGENTS.md",
  "CLAUDE.md",
  ".claude/",
  ".gemini/",
  "docs/DX_AND_AI.md",
  "docs/AGENT_EVAL.md",
  "packages/cli/",
  "packages/mcp/",
];

const SELF = new Set([
  "scripts/check-ai-tells.mjs",
  "scripts/check-ai-tells.test.mjs",
]);

const POLICY_FILES = new Set(["AGENTS.md"]);

const PROSE_FILES = [
  /^README\.md$/,
  /^(?:apps|packages)\/[^/]+\/README\.md$/,
  /^packages\/[^/]+\/docs\/.+\.md$/,
  /(?:^|\/)CHANGELOG\.md$/,
  /^\.changeset\/(?!README\.md$)[^/]+\.md$/,
];

const SKIPPED_FILES = [
  /(?:^|\/)pnpm-lock\.yaml$/,
  /(?:^|\/)Cargo\.lock$/,
  /^apps\/[^/]+\/src-tauri\/(?:gen|icons)\//,
  /^LICENSE$/,
];

const BINARY_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".ico",
  ".icns",
  ".woff",
  ".woff2",
  ".ttf",
  ".otf",
  ".pdf",
  ".zip",
  ".mov",
  ".mp4",
]);

const SCRIPT_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".mts",
  ".cts",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
]);

const HASH_COMMENT_EXTENSIONS = new Set([".toml", ".yaml", ".yml", ".sh"]);

const ATTRIBUTION_RULES = [
  {
    pattern: /^\s*co-authored-by:/gim,
    fix: "Remove the Co-Authored-By trailer.",
  },
  {
    pattern:
      /\bgenerated (?:with|by)\s+\[?(?:claude|chatgpt|copilot|codex|gemini|cursor|an? ai\b|ai\b)/gi,
    fix: 'Remove the "generated with" line.',
  },
  { pattern: /\u{1F916}/gu, fix: "Remove the robot emoji." },
  {
    pattern: /noreply@anthropic\.com/gi,
    fix: "Remove the attribution address.",
  },
];

const AGENT_NAME =
  /\b(?:Claude|Anthropic|ChatGPT|OpenAI|Codex|Gemini|Copilot|LLMs?|GPT-?\d[\w.]*|AI)\b/g;

const FILLER = [
  "seamless",
  "seamlessly",
  "robust",
  "leverage",
  "leverages",
  "leveraged",
  "leveraging",
  "comprehensive",
  "delve",
  "delves",
  "delving",
  "elevate",
  "elevates",
  "elevating",
  "cutting-edge",
  "game-changer",
  "game-changing",
  "supercharge",
  "supercharged",
  "effortless",
  "effortlessly",
  "empower",
  "empowers",
  "empowering",
  "unleash",
  "revolutionary",
  "paradigm",
  "tapestry",
  "plethora",
  "myriad",
  "meticulous",
  "meticulously",
  "embark",
  "testament",
  "it's worth noting",
  "it is worth noting",
  "dive into",
  "deep dive",
  "rest assured",
  "look no further",
  "in today's",
];

const FILLER_PATTERN = new RegExp(
  `\\b(?:${FILLER.map((word) => word.replaceAll("-", "\\-")).join("|")})\\b`,
  "gi",
);

const CODE_LINE = [
  /^(?:import|export)\s.+(?:\sfrom\s+["'].+["']|[{;])\s*;?$/,
  /^(?:const|let|var)\s+[\w${}[\],\s:]+=/,
  /^(?:return|await|throw|yield)\b.*;$/,
  /^(?:if|for|while|switch|catch)\s*\(.*\)\s*\{?$/,
  /^(?:else|try|finally)\s*\{$/,
  /^function\s+[\w$]+\s*\(/,
  /^class\s+[\w$]+\s*(?:extends\s+[\w$.]+\s*)?\{/,
  /^(?:interface\s+[\w$]+\s*\{|type\s+[\w$]+(?:<.+>)?\s*=)/,
  /^[\w$.[\]]+\s*(?:[+\-*/%]?=|\+\+|--)\s*.*;$/,
  /^[\w$.[\]]+\(.*\);$/,
  /^<\/?[A-Z][\w.]*(?:\s[^>]*)?\/?>$/,
  /^[}\])]+[;,)]*$/,
  /^[a-z-]+\s*:\s*[^;]+;$/,
  /^[.#]?[\w-]+(?:\s*[>+~]?\s*[.#]?[\w-]+)*\s*\{$/,
  /^[.#]?[a-z][\w-]*(?:[\s>+~.#:[\]="'-]+[\w-]*)*\s*\{[^{}]*;\s*\}$/i,
];

const COMMENT_RULES = [
  {
    id: "changelog-comment",
    test: (text) =>
      /^(?:added|updated|fixed|changed|removed|renamed|moved|refactored|new(?::|$)|now\b)/i.test(
        text,
      ),
    message: "reads like a change log",
    fix: "Delete it; git has the history.",
  },
  {
    id: "narrating-comment",
    skipInDocs: true,
    test: (text) =>
      /^(?:this (?:function|component|hook|method|file|class|module|code|line|block|helper|variable|constant|effect|type)\b|here we\b|now we\b|we (?:need|now|then|first|will|can|have to)\b|let's\b|(?:first|then|next|finally),|step \d)/i.test(
        text,
      ),
    message: "narrates the code",
    fix: "Delete it, or keep one line that says why if the reason isn't obvious.",
  },
  {
    id: "reader-comment",
    test: (text) =>
      /^(?:feel free|make sure|don't forget|remember to|you (?:can|should|need|might|may|will))\b/i.test(
        text,
      ),
    message: "talks to the reader",
    fix: "Delete it.",
  },
  {
    id: "banner-comment",
    test: (text) => /[=\-*#~_+]{4,}/.test(text),
    message: "is a section banner",
    fix: "Delete it; split the file if it needs sections.",
  },
  {
    id: "emoji-comment",
    test: (text) => /\p{Extended_Pictographic}/u.test(text),
    message: "has an emoji",
    fix: "Remove the emoji.",
  },
  {
    id: "todo-comment",
    test: (text) =>
      /\b(?:TODO|FIXME|XXX|HACK)\b/.test(text) &&
      !/#\d+|https?:\/\//.test(text),
    message: "is a TODO without an issue link",
    fix: "Link the issue or delete it.",
  },
  {
    id: "commented-out-code",
    codeOnly: true,
    test: (text) => CODE_LINE.some((pattern) => pattern.test(text)),
    message: "looks like commented-out code",
    fix: "Delete it; git keeps the old version.",
  },
];

const CONVENTIONAL_SUBJECT =
  /^(?:\u{1F9C8} )?(?:feat|fix|docs|chore|refactor|perf|test|build|ci|style|revert)(?:\([\w./-]+\))?!?: \S/u;

const NON_IMPERATIVE =
  /^(?:added|adds|adding|updated|updates|updating|fixed|fixes|fixing|changed|changes|changing|removed|removes|removing|implemented|implements|implementing|created|creates|creating|refactored|refactors|improved|improves|moved|moves)\b/i;

const GENERATED_SUBJECT = /^(?:Merge |Revert "|fixup! |squash! |amend! )/;

function lineStarts(text) {
  const starts = [0];
  for (let index = 0; index < text.length; index += 1) {
    if (text[index] === "\n") starts.push(index + 1);
  }
  return starts;
}

function lineAt(starts, index) {
  let low = 0;
  let high = starts.length - 1;
  while (low < high) {
    const middle = Math.ceil((low + high) / 2);
    if ((starts[middle] ?? 0) <= index) low = middle;
    else high = middle - 1;
  }
  return low + 1;
}

function isAgentPath(path) {
  return AGENT_PATHS.some((entry) =>
    entry.endsWith("/") ? path.startsWith(entry) : path === entry,
  );
}

export function findAttribution(text) {
  const starts = lineStarts(text);
  return ATTRIBUTION_RULES.flatMap(({ pattern, fix }) =>
    [...text.matchAll(pattern)].map((match) => ({
      line: lineAt(starts, match.index),
      rule: "attribution",
      message: `has tool attribution ("${match[0].trim()}")`,
      fix,
    })),
  );
}

export function findAgentNames(text) {
  const starts = lineStarts(text);
  return [...text.matchAll(AGENT_NAME)].map((match) => ({
    line: lineAt(starts, match.index),
    rule: "agent-name",
    message: `names "${match[0]}" outside the agent files`,
    fix: `Agent tool names belong only in ${AGENT_PATHS.join(", ")}.`,
  }));
}

function maskMarkdown(text) {
  let inFence = false;
  return text.split("\n").map((line) => {
    if (/^\s*(?:```|~~~)/.test(line)) {
      inFence = !inFence;
      return "";
    }
    if (inFence) return "";
    return line
      .replace(/`[^`]*`/g, (code) => " ".repeat(code.length))
      .replace(/<!--.*?-->/g, "");
  });
}

function blocksOf(lines) {
  const blocks = [];
  let current = null;
  lines.forEach((line, index) => {
    const startsItem = /^\s*(?:[-*+]|\d+\.)\s|^\s*\|/.test(line);
    if (line.trim() === "" || startsItem) {
      if (current) blocks.push(current);
      current = line.trim() === "" ? null : { line: index + 1, text: line };
      return;
    }
    if (current) current.text += ` ${line}`;
    else current = { line: index + 1, text: line };
  });
  if (current) blocks.push(current);
  return blocks;
}

export function findProseTells(text) {
  const lines = maskMarkdown(text.replaceAll("\r\n", "\n"));
  const findings = [];

  lines.forEach((line, index) => {
    for (const match of line.replaceAll("’", "'").matchAll(FILLER_PATTERN)) {
      findings.push({
        line: index + 1,
        rule: "filler",
        message: `uses "${match[0]}"`,
        fix: "Say plainly what it does.",
      });
    }
  });

  for (const block of blocksOf(lines)) {
    const dashes = block.text.split("—").length - 1;
    const denseSentence = block.text
      .split(/(?<=[.!?])\s+/)
      .some((sentence) => sentence.split("—").length - 1 >= 2);
    if (denseSentence || dashes >= 3) {
      findings.push({
        line: block.line,
        rule: "em-dash",
        message: "leans on em dashes",
        fix: "Split the sentence or use commas, colons or parentheses.",
      });
    }
    if (
      /^(?:in summary|to summarize|to sum up|in conclusion|in short|overall),?\s/i.test(
        block.text.trim(),
      )
    ) {
      findings.push({
        line: block.line,
        rule: "recap",
        message: "opens with a recap",
        fix: "Delete the recap; the reader just read it.",
      });
    }
  }

  let run = 0;
  lines.forEach((line, index) => {
    const boldLabel =
      /^\s*(?:[-*+]|\d+\.)\s+\*\*[^*]+\*\*(?=[\s:.\u2014\u2013-]|$)/.test(line);
    run = boldLabel ? run + 1 : 0;
    if (run === 2) {
      findings.push({
        line: index,
        rule: "bold-label-list",
        message: "is a bold-label bullet list",
        fix: "Write the items as plain sentences or a table.",
      });
    }
  });

  return findings;
}

function docLines(raw) {
  const lines = [];
  let inExample = false;
  let inFence = false;
  raw.split("\n").forEach((line, offset) => {
    const text = line
      .replace(/^\s*\/\*\*+/, "")
      .replace(/\*+\/\s*$/, "")
      .replace(/^\s*\*\s?/, "")
      .trim();
    if (/^(?:```|~~~)/.test(text)) {
      inFence = !inFence;
      return;
    }
    if (text.startsWith("@")) inExample = text.startsWith("@example");
    if (inExample || inFence || text.startsWith("@example")) return;
    lines.push({ offset, text, doc: true });
  });
  return lines;
}

function blockLines(raw) {
  return raw.split("\n").map((line, offset) => ({
    offset,
    text: line
      .replace(/^\s*\/\*+/, "")
      .replace(/\*+\/\s*$/, "")
      .replace(/^\s*\*\s?/, "")
      .trim(),
    doc: false,
  }));
}

function commentsFromRaw(raw, line) {
  if (raw.startsWith("/**") && raw !== "/**/") {
    return docLines(raw).map((entry) => ({
      ...entry,
      line: line + entry.offset,
    }));
  }
  if (raw.startsWith("/*")) {
    return blockLines(raw).map((entry) => ({
      ...entry,
      line: line + entry.offset,
    }));
  }
  const doc = /^\/\/[/!]/.test(raw);
  return [{ line, text: raw.replace(/^\/\/[/!]?/, "").trim(), doc }];
}

async function scriptComments(path, text) {
  const { default: ts } = await import("typescript");
  const ext = extname(path);
  const kind =
    ext === ".tsx"
      ? ts.ScriptKind.TSX
      : ext === ".jsx"
        ? ts.ScriptKind.JSX
        : [".js", ".mjs", ".cjs"].includes(ext)
          ? ts.ScriptKind.JS
          : ts.ScriptKind.TS;
  const source = ts.createSourceFile(
    path,
    text,
    ts.ScriptTarget.Latest,
    true,
    kind,
  );
  const starts = lineStarts(text);
  const seen = new Set();
  const comments = [];

  const collect = (ranges) => {
    for (const range of ranges ?? []) {
      if (seen.has(range.pos)) continue;
      seen.add(range.pos);
      comments.push(
        ...commentsFromRaw(
          text.slice(range.pos, range.end),
          lineAt(starts, range.pos),
        ),
      );
    }
  };
  const visit = (node) => {
    collect(ts.getTrailingCommentRanges(text, node.getFullStart()));
    collect(ts.getLeadingCommentRanges(text, node.getFullStart()));
    for (const child of node.getChildren(source)) visit(child);
  };
  visit(source);
  return comments;
}

function scannedComments(text, { lineComments, singleQuotes }) {
  const starts = lineStarts(text);
  const comments = [];
  let index = 0;
  while (index < text.length) {
    const char = text[index];
    const next = text[index + 1];
    if (char === '"' || (singleQuotes && char === "'")) {
      index += 1;
      while (
        index < text.length &&
        text[index] !== char &&
        text[index] !== "\n"
      ) {
        index += text[index] === "\\" ? 2 : 1;
      }
      index += 1;
    } else if (char === "/" && next === "*") {
      const end = text.indexOf("*/", index + 2);
      const stop = end === -1 ? text.length : end + 2;
      comments.push(
        ...commentsFromRaw(text.slice(index, stop), lineAt(starts, index)),
      );
      index = stop;
    } else if (lineComments && char === "/" && next === "/") {
      const end = text.indexOf("\n", index);
      const stop = end === -1 ? text.length : end;
      comments.push(
        ...commentsFromRaw(text.slice(index, stop), lineAt(starts, index)),
      );
      index = stop;
    } else {
      index += 1;
    }
  }
  return comments;
}

function htmlComments(text) {
  const starts = lineStarts(text);
  return [...text.matchAll(/<!--([\s\S]*?)-->/g)].flatMap((match) =>
    (match[1] ?? "").split("\n").map((line, offset) => ({
      line: lineAt(starts, match.index) + offset,
      text: line.trim(),
      doc: false,
    })),
  );
}

function hashComments(text) {
  return text.split("\n").flatMap((line, index) => {
    if (index === 0 && line.startsWith("#!")) return [];
    const match = /^(?:[^"'#]|"[^"]*"|'[^']*')*#(.*)$/.exec(line);
    return match
      ? [{ line: index + 1, text: (match[1] ?? "").trim(), doc: false }]
      : [];
  });
}

async function commentsOf(path, text) {
  const ext = extname(path);
  if (SCRIPT_EXTENSIONS.has(ext))
    return { comments: await scriptComments(path, text), code: true };
  if (ext === ".css") {
    return {
      comments: scannedComments(text, {
        lineComments: false,
        singleQuotes: true,
      }),
      code: true,
    };
  }
  if (ext === ".rs") {
    return {
      comments: scannedComments(text, {
        lineComments: true,
        singleQuotes: false,
      }),
      code: true,
    };
  }
  if (ext === ".html") return { comments: htmlComments(text), code: false };
  if (HASH_COMMENT_EXTENSIONS.has(ext) || path.startsWith(".githooks/")) {
    return { comments: hashComments(text), code: false };
  }
  return { comments: [], code: false };
}

export async function findCommentTells(path, text) {
  const { comments, code } = await commentsOf(path, text);
  return comments.flatMap(({ line, text: comment, doc }) => {
    if (comment === "") return [];
    return COMMENT_RULES.filter(
      (rule) =>
        !(rule.skipInDocs && doc) &&
        !(rule.codeOnly && !code) &&
        rule.test(comment),
    ).map((rule) => ({
      line,
      rule: rule.id,
      message: `comment ${rule.message}`,
      fix: rule.fix,
    }));
  });
}

export async function findTells(path, text) {
  const findings = [];
  if (!POLICY_FILES.has(path)) findings.push(...findAttribution(text));
  if (!isAgentPath(path)) findings.push(...findAgentNames(text));
  findings.push(...(await findCommentTells(path, text)));
  if (PROSE_FILES.some((pattern) => pattern.test(path))) {
    findings.push(...findProseTells(text));
  }
  return findings.sort((a, b) => a.line - b.line);
}

function stripCommentLines(message) {
  const scissors = message.search(/^# -+ >8 -+$/m);
  const body = scissors === -1 ? message : message.slice(0, scissors);
  return body
    .split("\n")
    .filter((line) => !line.startsWith("#"))
    .join("\n")
    .trim();
}

export function findCommitTells(rawMessage) {
  const message = stripCommentLines(rawMessage.replaceAll("\r\n", "\n"));
  if (message === "" || GENERATED_SUBJECT.test(message)) return [];
  const subject = message.split("\n", 1)[0] ?? "";
  const summary = subject.replace(/^[^:]*:\s*/, "");
  const findings = [];

  if (!CONVENTIONAL_SUBJECT.test(subject)) {
    findings.push({
      line: 1,
      rule: "commit-subject",
      message: `"${subject}" isn't a conventional commit subject`,
      fix: 'Use "type(scope): summary", e.g. "feat(core): add spacing tokens".',
    });
  }
  if ([...subject].length > 72) {
    findings.push({
      line: 1,
      rule: "commit-subject",
      message: `subject is ${[...subject].length} characters`,
      fix: "Keep it to 72 or fewer.",
    });
  }
  if (NON_IMPERATIVE.test(summary)) {
    findings.push({
      line: 1,
      rule: "commit-subject",
      message: "subject isn't in the imperative",
      fix: 'Write "add", not "added" or "adds".',
    });
  }
  const starts = lineStarts(message);
  for (const match of message.matchAll(
    /\bthis (?:commit|pr|pull request)\b/gi,
  )) {
    findings.push({
      line: lineAt(starts, match.index),
      rule: "commit-body",
      message: `says "${match[0]}"`,
      fix: "Say what changed and why, without the preamble.",
    });
  }
  for (const match of message.replaceAll("’", "'").matchAll(FILLER_PATTERN)) {
    findings.push({
      line: lineAt(starts, match.index),
      rule: "filler",
      message: `uses "${match[0]}"`,
      fix: "Say plainly what changed.",
    });
  }
  findings.push(...findAttribution(message), ...findAgentNames(message));
  return findings.sort((a, b) => a.line - b.line);
}

function repoFiles() {
  const output = execFileSync(
    "git",
    ["ls-files", "-z", "--cached", "--others", "--exclude-standard"],
    { encoding: "utf8" },
  );
  return [...new Set(output.split("\0").filter(Boolean))];
}

function isCheckable(path) {
  return (
    !SELF.has(path) &&
    !BINARY_EXTENSIONS.has(extname(path).toLowerCase()) &&
    !SKIPPED_FILES.some((pattern) => pattern.test(path)) &&
    existsSync(path)
  );
}

function format(label, findings) {
  return findings
    .map(
      ({ line, rule, message, fix }) =>
        `  ${label}:${line}  ${rule}: ${message}. ${fix}`,
    )
    .join("\n");
}

async function main(args) {
  if (args[0] === "--commit-msg") {
    const file = args[1];
    if (!file) {
      process.stderr.write(
        "check-ai-tells: --commit-msg needs the message file path.\n",
      );
      return 2;
    }
    const findings = findCommitTells(readFileSync(file, "utf8"));
    if (findings.length === 0) return 0;
    process.stderr.write(
      `check-ai-tells found problems in the commit message:\n${format("message", findings)}\n`,
    );
    return 1;
  }

  const paths = (args.length > 0 ? args : repoFiles()).filter(isCheckable);
  const reports = [];
  for (const path of paths) {
    const text = readFileSync(path, "utf8");
    if (text.includes("\0")) continue;
    const findings = await findTells(path, text);
    if (findings.length > 0) reports.push(format(path, findings));
  }
  if (reports.length === 0) {
    process.stdout.write(
      `check-ai-tells: ${paths.length} files, no findings.\n`,
    );
    return 0;
  }
  process.stderr.write(
    `check-ai-tells found problems:\n${reports.join("\n")}\n`,
  );
  return 1;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  process.exitCode = await main(process.argv.slice(2));
}

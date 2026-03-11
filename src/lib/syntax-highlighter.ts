export type TokenType =
  | "keyword"
  | "string"
  | "number"
  | "comment"
  | "tag"
  | "attribute"
  | "operator"
  | "function"
  | "className"
  | "punctuation"
  | "plain";

export type Token = {
  type: TokenType;
  content: string;
};

const KEYWORDS = new Set([
  "const",
  "let",
  "var",
  "function",
  "return",
  "if",
  "else",
  "for",
  "while",
  "import",
  "export",
  "from",
  "default",
  "class",
  "extends",
  "new",
  "this",
  "typeof",
  "async",
  "await",
  "try",
  "catch",
  "throw",
  "switch",
  "case",
  "break",
  "true",
  "false",
  "null",
  "undefined",
  // React hooks & identifiers
  "useState",
  "useEffect",
  "useRef",
  "useMemo",
  "useCallback",
  "React",
  "props",
  "children",
]);

// Order matters: longer operators first so they match before shorter ones.
const OPERATORS = [
  "===",
  "!==",
  "=>",
  "&&",
  "||",
  "??",
  ">=",
  "<=",
  "=",
  "?",
  ":",
  "+",
  "-",
  "*",
  "/",
  "!",
  "<",
  ">",
];

const PUNCTUATION = new Set(["{", "}", "(", ")", "[", "]", ";", ",", "."]);

export function tokenize(code: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < code.length) {
    // 1. Single-line comments
    if (code[i] === "/" && code[i + 1] === "/") {
      const end = code.indexOf("\n", i);
      const slice = end === -1 ? code.slice(i) : code.slice(i, end);
      tokens.push({ type: "comment", content: slice });
      i += slice.length;
      continue;
    }

    // 2. Multi-line comments
    if (code[i] === "/" && code[i + 1] === "*") {
      const end = code.indexOf("*/", i + 2);
      const slice = end === -1 ? code.slice(i) : code.slice(i, end + 2);
      tokens.push({ type: "comment", content: slice });
      i += slice.length;
      continue;
    }

    // 3. Strings: double-quoted, single-quoted, template literals
    if (code[i] === '"' || code[i] === "'" || code[i] === "`") {
      const quote = code[i];
      let j = i + 1;
      while (j < code.length) {
        if (code[j] === "\\" && j + 1 < code.length) {
          j += 2; // skip escaped char
          continue;
        }
        if (code[j] === quote) {
          j++;
          break;
        }
        j++;
      }
      tokens.push({ type: "string", content: code.slice(i, j) });
      i = j;
      continue;
    }

    // 4. JSX tags: <tagName, </tagName, />
    if (code[i] === "<" && i + 1 < code.length) {
      // Self-closing end: />
      if (code[i] === "/" && code[i + 1] === ">") {
        tokens.push({ type: "tag", content: "/>" });
        i += 2;
        continue;
      }
      // Opening or closing JSX tag
      const tagMatch = code.slice(i).match(/^<\/?[A-Za-z][A-Za-z0-9.]*/);
      if (tagMatch) {
        tokens.push({ type: "tag", content: tagMatch[0] });
        i += tagMatch[0].length;
        continue;
      }
    }

    // Self-closing tag end />
    if (code[i] === "/" && code[i + 1] === ">") {
      tokens.push({ type: "tag", content: "/>" });
      i += 2;
      continue;
    }

    // 5. Whitespace — preserve as plain
    if (/\s/.test(code[i])) {
      let j = i + 1;
      while (j < code.length && /\s/.test(code[j])) j++;
      tokens.push({ type: "plain", content: code.slice(i, j) });
      i = j;
      continue;
    }

    // 6. Words: identifiers, keywords, className, functions
    if (/[A-Za-z_$]/.test(code[i])) {
      let j = i + 1;
      while (j < code.length && /[A-Za-z0-9_$]/.test(code[j])) j++;
      const word = code.slice(i, j);

      // className special token
      if (word === "className") {
        tokens.push({ type: "className", content: word });
        i = j;
        continue;
      }

      // Attribute: word followed by = inside JSX (simple heuristic)
      if (code[j] === "=" && code[j + 1] !== "=") {
        // Check if we're likely in JSX context by scanning back for a tag
        const recent = tokens.slice(-10);
        const inJsx = recent.some(
          (t) => t.type === "tag" || t.type === "attribute"
        );
        if (inJsx) {
          tokens.push({ type: "attribute", content: word });
          i = j;
          continue;
        }
      }

      // Keyword check
      if (KEYWORDS.has(word)) {
        tokens.push({ type: "keyword", content: word });
        i = j;
        continue;
      }

      // Function: word followed by (
      if (code[j] === "(") {
        tokens.push({ type: "function", content: word });
        i = j;
        continue;
      }

      tokens.push({ type: "plain", content: word });
      i = j;
      continue;
    }

    // 7. Numbers
    if (/[0-9]/.test(code[i])) {
      let j = i + 1;
      while (j < code.length && /[0-9.]/.test(code[j])) j++;
      tokens.push({ type: "number", content: code.slice(i, j) });
      i = j;
      continue;
    }

    // 8. Operators (try longest match first)
    let matchedOp = false;
    for (const op of OPERATORS) {
      if (code.startsWith(op, i)) {
        tokens.push({ type: "operator", content: op });
        i += op.length;
        matchedOp = true;
        break;
      }
    }
    if (matchedOp) continue;

    // 9. Punctuation
    if (PUNCTUATION.has(code[i])) {
      tokens.push({ type: "punctuation", content: code[i] });
      i++;
      continue;
    }

    // 10. Everything else — single character as plain
    tokens.push({ type: "plain", content: code[i] });
    i++;
  }

  return tokens;
}

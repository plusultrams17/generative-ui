export type PatchOperation = {
  type: "replace" | "insert" | "delete";
  lineStart: number;
  lineEnd: number;
  original: string;
  replacement: string;
};

export type PatchResult = {
  operations: PatchOperation[];
  patchedCode: string;
  summary: string;
};

const COLOR_MAP: Record<string, string> = {
  "赤": "red", "青": "blue", "緑": "green", "黄": "yellow", "紫": "purple",
  "ピンク": "pink", "オレンジ": "orange", "灰": "gray", "白": "white", "黒": "black",
  "水色": "cyan", "藍": "indigo", "茶": "amber",
  red: "red", blue: "blue", green: "green", yellow: "yellow", purple: "purple",
  pink: "pink", orange: "orange", gray: "gray", white: "white", black: "black",
  cyan: "cyan", indigo: "indigo", amber: "amber",
};

const TAILWIND_COLOR_REGEX = /\b(bg|text|border|ring|from|to|via)-(red|blue|green|yellow|purple|pink|orange|gray|white|black|cyan|indigo|amber|slate|zinc|neutral|stone|emerald|teal|sky|violet|fuchsia|rose|lime)(-\d{2,3})?\b/g;

function findColorInInstruction(instruction: string): string | null {
  for (const [key, value] of Object.entries(COLOR_MAP)) {
    if (instruction.includes(key)) return value;
  }
  return null;
}

function changeColor(code: string, targetColor: string): PatchResult {
  const lines = code.split("\n");
  const operations: PatchOperation[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (TAILWIND_COLOR_REGEX.test(line)) {
      TAILWIND_COLOR_REGEX.lastIndex = 0;
      const newLine = line.replace(TAILWIND_COLOR_REGEX, (match, prefix, _color, shade) => {
        return `${prefix}-${targetColor}${shade || "-500"}`;
      });
      if (newLine !== line) {
        operations.push({
          type: "replace",
          lineStart: i + 1,
          lineEnd: i + 1,
          original: line,
          replacement: newLine,
        });
      }
    }
  }

  if (operations.length === 0) {
    return { operations: [], patchedCode: code, summary: "カラークラスが見つかりませんでした" };
  }

  const patchedLines = [...lines];
  for (const op of operations) {
    patchedLines[op.lineStart - 1] = op.replacement;
  }
  return {
    operations,
    patchedCode: patchedLines.join("\n"),
    summary: `色を ${targetColor} に変更しました（${operations.length}箇所）`,
  };
}

function addButton(code: string): PatchResult {
  const lines = code.split("\n");
  const operations: PatchOperation[] = [];

  // Find the last closing tag to insert before it
  let insertIndex = -1;
  for (let i = lines.length - 1; i >= 0; i--) {
    const trimmed = lines[i].trim();
    if (trimmed.match(/^<\/\w+>$/) || trimmed === ");") {
      insertIndex = i;
      break;
    }
  }

  if (insertIndex === -1) {
    return { operations: [], patchedCode: code, summary: "挿入位置が見つかりませんでした" };
  }

  const indent = lines[insertIndex].match(/^(\s*)/)?.[1] || "      ";
  const buttonCode = `${indent}<button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">ボタン</button>`;

  operations.push({
    type: "insert",
    lineStart: insertIndex + 1,
    lineEnd: insertIndex + 1,
    original: "",
    replacement: buttonCode,
  });

  const patchedLines = [...lines];
  patchedLines.splice(insertIndex, 0, buttonCode);

  return {
    operations,
    patchedCode: patchedLines.join("\n"),
    summary: "ボタンを追加しました",
  };
}

function changeText(code: string, instruction: string): PatchResult {
  // Extract target text from instruction: 「テキストを○○に変えて」
  const textMatch = instruction.match(/テキストを[「『]?(.+?)[」』]?に/);
  if (!textMatch) {
    return { operations: [], patchedCode: code, summary: "変更先のテキストを特定できませんでした" };
  }
  const newText = textMatch[1];

  const lines = code.split("\n");
  const operations: PatchOperation[] = [];

  // Find JSX text nodes (content between > and <)
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const textNodeMatch = line.match(/(>\s*)([^<>{}\n]+?)(\s*<)/);
    if (textNodeMatch && textNodeMatch[2].trim().length > 0) {
      const originalText = textNodeMatch[2].trim();
      // Skip class names, attributes, etc.
      if (originalText.includes("=") || originalText.includes("className")) continue;
      const newLine = line.replace(textNodeMatch[2], newText);
      operations.push({
        type: "replace",
        lineStart: i + 1,
        lineEnd: i + 1,
        original: line,
        replacement: newLine,
      });
      // Only replace the first text node found
      break;
    }
  }

  if (operations.length === 0) {
    return { operations: [], patchedCode: code, summary: "テキストノードが見つかりませんでした" };
  }

  const patchedLines = [...lines];
  for (const op of operations) {
    patchedLines[op.lineStart - 1] = op.replacement;
  }
  return {
    operations,
    patchedCode: patchedLines.join("\n"),
    summary: `テキストを「${newText}」に変更しました`,
  };
}

function changePadding(code: string, direction: "up" | "down"): PatchResult {
  const lines = code.split("\n");
  const operations: PatchOperation[] = [];
  const paddingRegex = /\b(p|px|py|pt|pb|pl|pr|ps|pe)-(\d+)\b/g;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (paddingRegex.test(line)) {
      paddingRegex.lastIndex = 0;
      const newLine = line.replace(paddingRegex, (match, prefix, size) => {
        const num = parseInt(size, 10);
        const newNum = direction === "up" ? Math.min(num + 2, 16) : Math.max(num - 2, 0);
        return `${prefix}-${newNum}`;
      });
      if (newLine !== line) {
        operations.push({
          type: "replace",
          lineStart: i + 1,
          lineEnd: i + 1,
          original: line,
          replacement: newLine,
        });
      }
    }
  }

  if (operations.length === 0) {
    return { operations: [], patchedCode: code, summary: "パディングクラスが見つかりませんでした" };
  }

  const patchedLines = [...lines];
  for (const op of operations) {
    patchedLines[op.lineStart - 1] = op.replacement;
  }

  return {
    operations,
    patchedCode: patchedLines.join("\n"),
    summary: `パディングを${direction === "up" ? "大きく" : "小さく"}しました（${operations.length}箇所）`,
  };
}

function addRounded(code: string): PatchResult {
  const lines = code.split("\n");
  const operations: PatchOperation[] = [];
  const roundedRegex = /\brounded(-\w+)?\b/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes("className")) {
      if (roundedRegex.test(line)) {
        // Upgrade rounded
        const newLine = line
          .replace(/\brounded\b(?!-)/, "rounded-lg")
          .replace(/\brounded-sm\b/, "rounded-md")
          .replace(/\brounded-md\b/, "rounded-lg")
          .replace(/\brounded-lg\b/, "rounded-xl")
          .replace(/\brounded-xl\b/, "rounded-2xl");
        if (newLine !== line) {
          operations.push({
            type: "replace",
            lineStart: i + 1,
            lineEnd: i + 1,
            original: line,
            replacement: newLine,
          });
        }
      } else {
        // Add rounded
        const newLine = line.replace(/className="([^"]*)"/, 'className="$1 rounded-lg"');
        if (newLine !== line) {
          operations.push({
            type: "replace",
            lineStart: i + 1,
            lineEnd: i + 1,
            original: line,
            replacement: newLine,
          });
        }
      }
    }
  }

  if (operations.length === 0) {
    return { operations: [], patchedCode: code, summary: "classNameが見つかりませんでした" };
  }

  const patchedLines = [...lines];
  for (const op of operations) {
    patchedLines[op.lineStart - 1] = op.replacement;
  }
  return {
    operations,
    patchedCode: patchedLines.join("\n"),
    summary: `丸みを追加/変更しました（${operations.length}箇所）`,
  };
}

function addBorder(code: string): PatchResult {
  const lines = code.split("\n");
  const operations: PatchOperation[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes("className") && !line.includes("border")) {
      const newLine = line.replace(/className="([^"]*)"/, 'className="$1 border border-gray-200"');
      if (newLine !== line) {
        operations.push({
          type: "replace",
          lineStart: i + 1,
          lineEnd: i + 1,
          original: line,
          replacement: newLine,
        });
      }
    }
  }

  if (operations.length === 0) {
    return { operations: [], patchedCode: code, summary: "ボーダーを追加する要素が見つかりませんでした" };
  }

  const patchedLines = [...lines];
  for (const op of operations) {
    patchedLines[op.lineStart - 1] = op.replacement;
  }
  return {
    operations,
    patchedCode: patchedLines.join("\n"),
    summary: `ボーダーを追加しました（${operations.length}箇所）`,
  };
}

function changeSize(code: string, direction: "up" | "down"): PatchResult {
  const lines = code.split("\n");
  const operations: PatchOperation[] = [];
  const textSizes = ["text-xs", "text-sm", "text-base", "text-lg", "text-xl", "text-2xl", "text-3xl"];
  const widthRegex = /\b(w|h)-(\d+)\b/g;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let newLine = line;
    let changed = false;

    // Handle text size
    for (let j = 0; j < textSizes.length; j++) {
      if (newLine.includes(textSizes[j])) {
        const targetIdx = direction === "up" ? Math.min(j + 1, textSizes.length - 1) : Math.max(j - 1, 0);
        if (targetIdx !== j) {
          newLine = newLine.replace(textSizes[j], textSizes[targetIdx]);
          changed = true;
        }
      }
    }

    // Handle w-/h- numbers
    if (widthRegex.test(newLine)) {
      widthRegex.lastIndex = 0;
      newLine = newLine.replace(widthRegex, (match, prefix, size) => {
        const num = parseInt(size, 10);
        const newNum = direction === "up" ? Math.min(num + 4, 96) : Math.max(num - 4, 4);
        if (newNum !== num) changed = true;
        return `${prefix}-${newNum}`;
      });
    }

    if (changed) {
      operations.push({
        type: "replace",
        lineStart: i + 1,
        lineEnd: i + 1,
        original: line,
        replacement: newLine,
      });
    }
  }

  if (operations.length === 0) {
    return { operations: [], patchedCode: code, summary: "サイズクラスが見つかりませんでした" };
  }

  const patchedLines = [...lines];
  for (const op of operations) {
    patchedLines[op.lineStart - 1] = op.replacement;
  }
  return {
    operations,
    patchedCode: patchedLines.join("\n"),
    summary: `サイズを${direction === "up" ? "大きく" : "小さく"}しました（${operations.length}箇所）`,
  };
}

function toggleHidden(code: string, hide: boolean): PatchResult {
  const lines = code.split("\n");
  const operations: PatchOperation[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes("className")) {
      if (hide && !line.includes("hidden")) {
        const newLine = line.replace(/className="([^"]*)"/, 'className="$1 hidden"');
        if (newLine !== line) {
          operations.push({
            type: "replace",
            lineStart: i + 1,
            lineEnd: i + 1,
            original: line,
            replacement: newLine,
          });
          break; // Only hide the first element
        }
      } else if (!hide && line.includes("hidden")) {
        const newLine = line.replace(/\s*\bhidden\b/, "");
        if (newLine !== line) {
          operations.push({
            type: "replace",
            lineStart: i + 1,
            lineEnd: i + 1,
            original: line,
            replacement: newLine,
          });
        }
      }
    }
  }

  if (operations.length === 0) {
    return { operations: [], patchedCode: code, summary: hide ? "非表示にする要素が見つかりませんでした" : "hidden クラスが見つかりませんでした" };
  }

  const patchedLines = [...lines];
  for (const op of operations) {
    patchedLines[op.lineStart - 1] = op.replacement;
  }
  return {
    operations,
    patchedCode: patchedLines.join("\n"),
    summary: hide ? "要素を非表示にしました" : "hidden を解除しました",
  };
}

function addCenter(code: string): PatchResult {
  const lines = code.split("\n");
  const operations: PatchOperation[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes("className") && !line.includes("items-center") && !line.includes("justify-center")) {
      let newLine = line;
      if (!line.includes("flex")) {
        newLine = newLine.replace(/className="([^"]*)"/, 'className="$1 flex items-center justify-center"');
      } else {
        newLine = newLine.replace(/className="([^"]*)"/, 'className="$1 items-center justify-center"');
      }
      if (newLine !== line) {
        operations.push({
          type: "replace",
          lineStart: i + 1,
          lineEnd: i + 1,
          original: line,
          replacement: newLine,
        });
        break; // Only center the first container
      }
    }
  }

  if (operations.length === 0) {
    return { operations: [], patchedCode: code, summary: "中央寄せする要素が見つかりませんでした" };
  }

  const patchedLines = [...lines];
  for (const op of operations) {
    patchedLines[op.lineStart - 1] = op.replacement;
  }
  return {
    operations,
    patchedCode: patchedLines.join("\n"),
    summary: "中央寄せにしました",
  };
}

function addShadow(code: string): PatchResult {
  const lines = code.split("\n");
  const operations: PatchOperation[] = [];
  const shadowRegex = /\bshadow(-\w+)?\b/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes("className")) {
      if (shadowRegex.test(line)) {
        // Upgrade shadow
        const newLine = line
          .replace(/\bshadow\b(?!-)/, "shadow-md")
          .replace(/\bshadow-sm\b/, "shadow-md")
          .replace(/\bshadow-md\b/, "shadow-lg")
          .replace(/\bshadow-lg\b/, "shadow-xl");
        if (newLine !== line) {
          operations.push({
            type: "replace",
            lineStart: i + 1,
            lineEnd: i + 1,
            original: line,
            replacement: newLine,
          });
        }
      } else {
        const newLine = line.replace(/className="([^"]*)"/, 'className="$1 shadow-md"');
        if (newLine !== line) {
          operations.push({
            type: "replace",
            lineStart: i + 1,
            lineEnd: i + 1,
            original: line,
            replacement: newLine,
          });
        }
      }
    }
  }

  if (operations.length === 0) {
    return { operations: [], patchedCode: code, summary: "影を追加する要素が見つかりませんでした" };
  }

  const patchedLines = [...lines];
  for (const op of operations) {
    patchedLines[op.lineStart - 1] = op.replacement;
  }
  return {
    operations,
    patchedCode: patchedLines.join("\n"),
    summary: `影を追加/変更しました（${operations.length}箇所）`,
  };
}

export function applyTextPatch(code: string, instruction: string): PatchResult {
  const normalized = instruction.toLowerCase();

  // 1. Color change
  const targetColor = findColorInInstruction(instruction);
  if (targetColor && (normalized.includes("色") || normalized.includes("カラー") || normalized.includes("color"))) {
    return changeColor(code, targetColor);
  }

  // 2. Add button
  if (normalized.includes("ボタンを追加") || normalized.includes("ボタン追加") || normalized.includes("add button")) {
    return addButton(code);
  }

  // 3. Change text
  if (normalized.includes("テキストを") && (normalized.includes("変え") || normalized.includes("変更"))) {
    return changeText(code, instruction);
  }

  // 4. Padding
  if (normalized.includes("パディング") || normalized.includes("余白") || normalized.includes("padding")) {
    const direction = normalized.includes("小さ") || normalized.includes("減") || normalized.includes("少") ? "down" : "up";
    return changePadding(code, direction);
  }

  // 5. Rounded
  if (normalized.includes("丸み") || normalized.includes("角丸") || normalized.includes("rounded") || normalized.includes("ラウンド")) {
    return addRounded(code);
  }

  // 6. Border
  if (normalized.includes("ボーダー") || normalized.includes("枠線") || normalized.includes("border")) {
    return addBorder(code);
  }

  // 7. Size
  if (normalized.includes("サイズ") || normalized.includes("大きく") || normalized.includes("小さく") || normalized.includes("size")) {
    const direction = normalized.includes("小さ") || normalized.includes("縮小") || normalized.includes("small") ? "down" : "up";
    return changeSize(code, direction);
  }

  // 8. Hidden/Show
  if (normalized.includes("非表示") || normalized.includes("隠") || normalized.includes("hide")) {
    return toggleHidden(code, true);
  }
  if (normalized.includes("表示して") || normalized.includes("表示する") || normalized.includes("show")) {
    return toggleHidden(code, false);
  }

  // 9. Center
  if (normalized.includes("中央") || normalized.includes("センター") || normalized.includes("center")) {
    return addCenter(code);
  }

  // 10. Shadow
  if (normalized.includes("影") || normalized.includes("シャドウ") || normalized.includes("shadow")) {
    return addShadow(code);
  }

  return {
    operations: [],
    patchedCode: code,
    summary: "この変更は手動で行う必要があります",
  };
}

export type PropInfo = {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: string;
};

export type ComponentDoc = {
  componentName: string;
  description: string;
  props: PropInfo[];
  dependencies: string[];
  tailwindClasses: string[];
  hasState: boolean;
  hasEffects: boolean;
  eventHandlers: string[];
  estimatedLines: number;
  installCommand: string;
  usageExample: string;
  markdownDoc: string;
};

// Known React hooks (not external deps)
const REACT_HOOKS = [
  "useState",
  "useEffect",
  "useRef",
  "useMemo",
  "useCallback",
  "useReducer",
  "useContext",
  "useLayoutEffect",
  "useId",
  "useTransition",
  "useDeferredValue",
  "useSyncExternalStore",
];

// Map of common identifiers to their npm packages
const KNOWN_DEPS: Record<string, string> = {
  // Icons
  lucide: "lucide-react",
  // Animation
  motion: "framer-motion",
  "animate-presence": "framer-motion",
  // Date
  "date-fns": "date-fns",
  dayjs: "dayjs",
  moment: "moment",
  // Charts
  recharts: "recharts",
  "chart.js": "chart.js",
  // Form
  "react-hook-form": "react-hook-form",
  zod: "zod",
  // UI
  "@radix-ui": "@radix-ui/react-*",
  clsx: "clsx",
  "class-variance-authority": "class-variance-authority",
  "tailwind-merge": "tailwind-merge",
  // HTTP
  axios: "axios",
  swr: "swr",
  "@tanstack/react-query": "@tanstack/react-query",
};

function extractComponentName(code: string): string {
  // Match: export default function Name
  let match = code.match(
    /export\s+default\s+function\s+([A-Z]\w*)/
  );
  if (match) return match[1];

  // Match: function App() or function ComponentName()
  match = code.match(/function\s+([A-Z]\w*)\s*\(/);
  if (match) return match[1];

  // Match: const Name = () => or const Name = function
  match = code.match(
    /(?:const|let)\s+([A-Z]\w*)\s*=\s*(?:\([^)]*\)\s*=>|function)/
  );
  if (match) return match[1];

  return "App";
}

function extractProps(code: string): PropInfo[] {
  const props: PropInfo[] = [];

  // Match destructured props: function Comp({ name, email, ... })
  const funcPropsMatch = code.match(
    /function\s+[A-Z]\w*\s*\(\s*\{([^}]*)\}/
  );
  // Also match arrow: const Comp = ({ name, email }) =>
  const arrowPropsMatch = code.match(
    /(?:const|let)\s+[A-Z]\w*\s*=\s*\(\s*\{([^}]*)\}\s*(?::[^)]+)?\)\s*=>/
  );

  const propsStr = funcPropsMatch?.[1] || arrowPropsMatch?.[1];
  if (!propsStr) return props;

  const propEntries = propsStr.split(",").map((p) => p.trim()).filter(Boolean);

  for (const entry of propEntries) {
    // Handle: name = "default"
    const defaultMatch = entry.match(/^(\w+)\s*=\s*(.+)$/);
    // Handle: name: type
    const typeMatch = entry.match(/^(\w+)\s*:\s*(\w+)$/);
    // Handle: just name
    const simpleMatch = entry.match(/^(\w+)$/);

    if (defaultMatch) {
      props.push({
        name: defaultMatch[1],
        type: inferType(defaultMatch[2].trim()),
        required: false,
        defaultValue: defaultMatch[2].trim(),
      });
    } else if (typeMatch) {
      props.push({
        name: typeMatch[1],
        type: typeMatch[2],
        required: true,
      });
    } else if (simpleMatch) {
      props.push({
        name: simpleMatch[1],
        type: "unknown",
        required: true,
      });
    }
  }

  // Also check for TypeScript type/interface definitions
  const typeDefMatch = code.match(
    /type\s+\w*Props\w*\s*=\s*\{([^}]+)\}/
  );
  if (typeDefMatch) {
    const typeDef = typeDefMatch[1];
    const typeLines = typeDef.split(";").concat(typeDef.split("\n"));
    for (const line of typeLines) {
      const propTypeMatch = line.trim().match(/^(\w+)(\??)\s*:\s*(.+?)(?:;|$)/);
      if (propTypeMatch) {
        const existing = props.find((p) => p.name === propTypeMatch[1]);
        if (existing) {
          existing.type = propTypeMatch[3].trim();
          if (propTypeMatch[2] === "?") existing.required = false;
        } else {
          props.push({
            name: propTypeMatch[1],
            type: propTypeMatch[3].trim(),
            required: propTypeMatch[2] !== "?",
          });
        }
      }
    }
  }

  return props;
}

function inferType(value: string): string {
  if (value === "true" || value === "false") return "boolean";
  if (/^["'`]/.test(value)) return "string";
  if (/^\d+$/.test(value)) return "number";
  if (/^\[/.test(value)) return "array";
  if (/^\{/.test(value)) return "object";
  if (/^null$/.test(value)) return "null";
  return "unknown";
}

function extractDependencies(code: string): string[] {
  const deps = new Set<string>();

  // Scan import statements
  const importRegex = /import\s+.*?\s+from\s+["']([^"']+)["']/g;
  let match;
  while ((match = importRegex.exec(code)) !== null) {
    const mod = match[1];
    if (!mod.startsWith(".") && !mod.startsWith("@/")) {
      deps.add(mod);
    }
  }

  // Scan for known library patterns in code
  for (const [pattern, pkg] of Object.entries(KNOWN_DEPS)) {
    if (code.includes(pattern)) {
      deps.add(pkg);
    }
  }

  // Detect lucide icons by common icon name patterns
  const iconPattern = /\b(?:ChevronDown|ChevronUp|ChevronLeft|ChevronRight|ArrowLeft|ArrowRight|Check|X|Plus|Minus|Search|Menu|Home|Settings|User|Mail|Phone|Star|Heart|Edit|Trash|Download|Upload|Copy|Share|Eye|EyeOff|Lock|Unlock|Bell|Calendar|Clock|Map|Image|Camera|File|Folder|Filter|Grid|List|Sun|Moon|Cloud|Loader|AlertCircle|Info|HelpCircle)\b/;
  if (iconPattern.test(code)) {
    deps.add("lucide-react");
  }

  // Always include react
  deps.add("react");

  return Array.from(deps).sort();
}

function extractTailwindClasses(code: string): string[] {
  const classCount = new Map<string, number>();

  // Match className="..." and className={`...`} and className={cn("...")}
  const classNameRegex = /className\s*=\s*(?:"([^"]*)"|{`([^`]*)`}|\{[^}]*"([^"]*)"[^}]*\})/g;
  let match;
  while ((match = classNameRegex.exec(code)) !== null) {
    const classStr = match[1] || match[2] || match[3] || "";
    const classes = classStr.split(/\s+/).filter(Boolean);
    for (const cls of classes) {
      // Skip template expressions
      if (cls.includes("${") || cls.includes("{")) continue;
      classCount.set(cls, (classCount.get(cls) || 0) + 1);
    }
  }

  // Sort by frequency, return top 10
  return Array.from(classCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([cls]) => cls);
}

function extractEventHandlers(code: string): string[] {
  const handlers = new Set<string>();
  const handlerRegex = /\b(on[A-Z]\w+)\s*=\s*\{/g;
  let match;
  while ((match = handlerRegex.exec(code)) !== null) {
    handlers.add(match[1]);
  }
  return Array.from(handlers).sort();
}

function generateUsageExample(
  componentName: string,
  props: PropInfo[]
): string {
  if (props.length === 0) {
    return `<${componentName} />`;
  }

  const propStrings = props
    .filter((p) => p.required)
    .map((p) => {
      switch (p.type) {
        case "string":
          return `${p.name}="${p.name}"`;
        case "number":
          return `${p.name}={0}`;
        case "boolean":
          return p.name;
        case "function":
        case "() => void":
          return `${p.name}={() => {}}`;
        default:
          if (p.type.includes("=>") || p.type.includes("function")) {
            return `${p.name}={() => {}}`;
          }
          return `${p.name}={${p.name}}`;
      }
    });

  if (propStrings.length === 0) {
    return `<${componentName} />`;
  }

  if (propStrings.join(" ").length < 60) {
    return `<${componentName} ${propStrings.join(" ")} />`;
  }

  return `<${componentName}\n  ${propStrings.join("\n  ")}\n/>`;
}

function generateInstallCommand(deps: string[]): string {
  const installable = deps.filter(
    (d) => d !== "react" && d !== "react-dom" && d !== "next"
  );
  if (installable.length === 0) return "";
  return `npm install ${installable.join(" ")}`;
}

function generateMarkdown(doc: Omit<ComponentDoc, "markdownDoc">): string {
  const lines: string[] = [];

  lines.push(`# ${doc.componentName}`);
  lines.push("");
  lines.push(`## 概要`);
  lines.push(doc.description);
  lines.push("");

  if (doc.installCommand) {
    lines.push(`## インストール`);
    lines.push("");
    lines.push("```bash");
    lines.push(doc.installCommand);
    lines.push("```");
    lines.push("");
  }

  if (doc.props.length > 0) {
    lines.push(`## Props一覧`);
    lines.push("");
    lines.push("| Name | Type | Required | Default |");
    lines.push("|------|------|----------|---------|");
    for (const prop of doc.props) {
      lines.push(
        `| ${prop.name} | \`${prop.type}\` | ${prop.required ? "Yes" : "No"} | ${prop.defaultValue ? `\`${prop.defaultValue}\`` : "-"} |`
      );
    }
    lines.push("");
  }

  lines.push(`## 使用例`);
  lines.push("");
  lines.push("```tsx");
  lines.push(doc.usageExample);
  lines.push("```");
  lines.push("");

  lines.push(`## 技術詳細`);
  lines.push("");
  lines.push(`- **状態管理:** ${doc.hasState ? "あり" : "なし"}`);
  lines.push(`- **副作用:** ${doc.hasEffects ? "あり" : "なし"}`);
  lines.push(`- **行数:** ${doc.estimatedLines}`);
  if (doc.eventHandlers.length > 0) {
    lines.push(
      `- **イベントハンドラー:** ${doc.eventHandlers.map((h) => `\`${h}\``).join(", ")}`
    );
  }
  lines.push("");

  if (doc.tailwindClasses.length > 0) {
    lines.push(`## 使用しているTailwindクラス`);
    lines.push("");
    lines.push(
      doc.tailwindClasses.map((cls) => `\`${cls}\``).join(", ")
    );
    lines.push("");
  }

  if (doc.dependencies.length > 0) {
    lines.push(`## 依存関係`);
    lines.push("");
    for (const dep of doc.dependencies) {
      lines.push(`- ${dep}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

export function generateDocs(
  code: string,
  title: string,
  description: string
): ComponentDoc {
  const componentName = extractComponentName(code);
  const props = extractProps(code);
  const dependencies = extractDependencies(code);
  const tailwindClasses = extractTailwindClasses(code);
  const hasState = /\buseState\b/.test(code);
  const hasEffects = /\buseEffect\b/.test(code);
  const eventHandlers = extractEventHandlers(code);
  const estimatedLines = code.split("\n").length;
  const installCommand = generateInstallCommand(dependencies);
  const usageExample = generateUsageExample(componentName, props);

  const partialDoc = {
    componentName,
    description: description || title,
    props,
    dependencies,
    tailwindClasses,
    hasState,
    hasEffects,
    eventHandlers,
    estimatedLines,
    installCommand,
    usageExample,
  };

  return {
    ...partialDoc,
    markdownDoc: generateMarkdown(partialDoc),
  };
}

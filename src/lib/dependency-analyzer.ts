export type DepNodeType = "component" | "hook" | "library" | "html" | "style" | "utility";

export type DepNode = {
  id: string;
  label: string;
  type: DepNodeType;
  count: number;
};

export type DepEdge = {
  from: string;
  to: string;
};

export type DependencyGraph = {
  nodes: DepNode[];
  edges: DepEdge[];
  rootId: string;
};

const REACT_HOOKS = new Set([
  "useState", "useEffect", "useRef", "useMemo", "useCallback",
  "useContext", "useReducer", "useLayoutEffect", "useImperativeHandle",
  "useDebugValue", "useDeferredValue", "useTransition", "useId",
  "useSyncExternalStore", "useInsertionEffect",
]);

const HTML_ELEMENTS = [
  "div", "span", "button", "input", "form", "table", "img", "a",
  "p", "h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "li",
  "section", "article", "nav", "header", "footer", "main", "aside",
  "label", "textarea", "select", "option", "svg", "path",
];

export function analyzeDependencies(code: string, componentName: string): DependencyGraph {
  const nodes: DepNode[] = [];
  const edges: DepEdge[] = [];
  const rootId = "root";
  let nodeIdx = 0;

  nodes.push({
    id: rootId,
    label: componentName,
    type: "component",
    count: 1,
  });

  // 1. Parse import statements
  const importRegex = /import\s+(?:\{([^}]+)\}|(\w+))(?:\s*,\s*(?:\{([^}]+)\}|(\w+)))?\s+from\s+["']([^"']+)["']/g;
  let match: RegExpExecArray | null;

  while ((match = importRegex.exec(code)) !== null) {
    const namedImports = (match[1] || "") + (match[3] || "");
    const defaultImport = match[2] || match[4] || "";
    const source = match[5];

    // Handle named imports
    if (namedImports) {
      const names = namedImports.split(",").map((s) => s.trim().split(/\s+as\s+/)[0].trim()).filter(Boolean);
      for (const name of names) {
        if (REACT_HOOKS.has(name)) {
          const id = `node-${++nodeIdx}`;
          const usageCount = (code.match(new RegExp(`\\b${name}\\b`, "g")) || []).length - 1;
          nodes.push({ id, label: name, type: "hook", count: Math.max(usageCount, 1) });
          edges.push({ from: rootId, to: id });
        }
      }
    }

    // Add library node (skip relative imports)
    if (!source.startsWith(".") && !source.startsWith("@/")) {
      const libId = `node-${++nodeIdx}`;
      const label = source.replace(/^@/, "");
      nodes.push({ id: libId, label, type: "library", count: 1 });
      edges.push({ from: rootId, to: libId });
    }

    // Default import as component if uppercase
    if (defaultImport && /^[A-Z]/.test(defaultImport)) {
      const usageCount = (code.match(new RegExp(`<${defaultImport}[\\s/>]`, "g")) || []).length;
      if (usageCount > 0) {
        const id = `node-${++nodeIdx}`;
        nodes.push({ id, label: defaultImport, type: "component", count: usageCount });
        edges.push({ from: rootId, to: id });
      }
    }
  }

  // 2. Detect HTML element usage
  for (const el of HTML_ELEMENTS) {
    const regex = new RegExp(`<${el}[\\s/>]`, "g");
    const matches = code.match(regex);
    if (matches && matches.length > 0) {
      const id = `node-${++nodeIdx}`;
      nodes.push({ id, label: `<${el}>`, type: "html", count: matches.length });
      edges.push({ from: rootId, to: id });
    }
  }

  // 3. Detect Tailwind CSS usage
  const classNameMatches = code.match(/className=/g);
  if (classNameMatches && classNameMatches.length > 0) {
    const id = `node-${++nodeIdx}`;
    nodes.push({ id, label: "Tailwind CSS", type: "style", count: classNameMatches.length });
    edges.push({ from: rootId, to: id });
  }

  // 4. Detect custom component usage (uppercase JSX tags not already tracked)
  const existingLabels = new Set(nodes.map((n) => n.label));
  const customCompRegex = /<([A-Z][a-zA-Z]+)[\s/>]/g;
  const customCounts: Record<string, number> = {};
  let compMatch: RegExpExecArray | null;
  while ((compMatch = customCompRegex.exec(code)) !== null) {
    const name = compMatch[1];
    if (!existingLabels.has(name)) {
      customCounts[name] = (customCounts[name] || 0) + 1;
    }
  }
  for (const [name, count] of Object.entries(customCounts)) {
    const id = `node-${++nodeIdx}`;
    nodes.push({ id, label: name, type: "component", count });
    edges.push({ from: rootId, to: id });
  }

  // 5. Detect utility function definitions (top-level const functions)
  const utilRegex = /(?:^|\n)\s*(?:const|function)\s+([a-z][a-zA-Z0-9]*)\s*(?:=\s*(?:\([^)]*\)|[a-zA-Z0-9_]+)\s*=>|=\s*function|\()/g;
  const utilNames = new Set<string>();
  let utilMatch: RegExpExecArray | null;
  while ((utilMatch = utilRegex.exec(code)) !== null) {
    const name = utilMatch[1];
    // Skip hooks and common patterns
    if (!name.startsWith("use") && name !== "render" && name !== "default") {
      utilNames.add(name);
    }
  }
  for (const name of utilNames) {
    const usageCount = (code.match(new RegExp(`\\b${name}\\b`, "g")) || []).length - 1;
    if (usageCount > 0) {
      const id = `node-${++nodeIdx}`;
      nodes.push({ id, label: name, type: "utility", count: usageCount });
      edges.push({ from: rootId, to: id });
    }
  }

  return { nodes, edges, rootId };
}

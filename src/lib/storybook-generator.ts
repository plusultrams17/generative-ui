export type StoryMeta = {
  title: string;
  component: string;
  tags: string[];
  argTypes: Record<string, { control: string; description: string }>;
};

export type Story = {
  name: string;
  args: Record<string, unknown>;
  code: string;
};

export type StorybookResult = {
  meta: StoryMeta;
  stories: Story[];
  fullCode: string;
  mdxDoc: string;
};

type DetectedProp = {
  name: string;
  type: "string" | "boolean" | "function" | "number" | "unknown";
};

function toPascalCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join("");
}

function extractComponentName(code: string): string {
  let match = code.match(/export\s+default\s+function\s+([A-Z]\w*)/);
  if (match) return match[1];

  match = code.match(/function\s+([A-Z]\w*)\s*\(/);
  if (match) return match[1];

  match = code.match(
    /(?:const|let)\s+([A-Z]\w*)\s*=\s*(?:\([^)]*\)\s*=>|function)/
  );
  if (match) return match[1];

  return "Component";
}

function detectProps(code: string): DetectedProp[] {
  const props: DetectedProp[] = [];
  const seen = new Set<string>();

  function addProp(name: string, type: DetectedProp["type"]) {
    if (!seen.has(name)) {
      seen.add(name);
      props.push({ name, type });
    }
  }

  // Detect from Props type definition: type XxxProps = { ... }
  const propsTypeMatch = code.match(
    /type\s+\w*Props\w*\s*=\s*\{([^}]*)\}/
  );
  if (propsTypeMatch) {
    const body = propsTypeMatch[1];
    const propLines = body.match(/(\w+)\??\s*:\s*([^;\n]+)/g);
    if (propLines) {
      for (const line of propLines) {
        const m = line.match(/(\w+)\??\s*:\s*(.+)/);
        if (m) {
          const name = m[1];
          const typeStr = m[2].trim();
          let type: DetectedProp["type"] = "unknown";
          if (/string/.test(typeStr)) type = "string";
          else if (/boolean/.test(typeStr)) type = "boolean";
          else if (/number/.test(typeStr)) type = "number";
          else if (/=>|function|Function/.test(typeStr)) type = "function";
          addProp(name, type);
        }
      }
    }
  }

  // Detect from destructured function parameters: function Xxx({ a, b, c })
  const destructuredMatch = code.match(
    /function\s+[A-Z]\w*\s*\(\s*\{([^}]*)\}/
  );
  if (destructuredMatch) {
    const params = destructuredMatch[1].split(",").map((s) => s.trim());
    for (const param of params) {
      const name = param.split(/[=:]/)[0].trim();
      if (name && /^[a-zA-Z]\w*$/.test(name) && !seen.has(name)) {
        addProp(name, inferPropType(name));
      }
    }
  }

  // Detect common prop patterns from JSX usage
  const commonProps: Record<string, DetectedProp["type"]> = {
    className: "string",
    onClick: "function",
    onChange: "function",
    onSubmit: "function",
    value: "string",
    label: "string",
    title: "string",
    disabled: "boolean",
    children: "unknown",
    placeholder: "string",
    name: "string",
    id: "string",
    checked: "boolean",
    open: "boolean",
    variant: "string",
    size: "string",
  };

  for (const [propName, propType] of Object.entries(commonProps)) {
    // Check if used as props.xxx or {xxx} destructuring
    const usagePattern = new RegExp(
      `(?:props\\.${propName}\\b|\\b${propName}\\s*[=,}])`,
      "m"
    );
    if (usagePattern.test(code) && !seen.has(propName)) {
      addProp(propName, propType);
    }
  }

  return props;
}

function inferPropType(name: string): DetectedProp["type"] {
  if (/^on[A-Z]/.test(name)) return "function";
  if (/^(is|has|show|can|should|disabled|checked|open|loading|visible|active|selected|readonly|required)/.test(name))
    return "boolean";
  if (/^(count|index|max|min|step|size|width|height|length|total|page|limit|offset)$/.test(name))
    return "number";
  return "string";
}

function controlForType(type: DetectedProp["type"]): string {
  switch (type) {
    case "string":
      return "text";
    case "boolean":
      return "boolean";
    case "number":
      return "number";
    case "function":
      return "action";
    default:
      return "text";
  }
}

function descriptionForProp(name: string, type: DetectedProp["type"]): string {
  if (name === "children") return "子要素";
  if (name === "className") return "カスタムCSSクラス";
  if (name === "onClick") return "クリック時のハンドラ";
  if (name === "onChange") return "値変更時のハンドラ";
  if (name === "onSubmit") return "送信時のハンドラ";
  if (name === "disabled") return "無効状態";
  if (name === "label") return "ラベルテキスト";
  if (name === "title") return "タイトル";
  if (name === "value") return "現在の値";
  if (name === "placeholder") return "プレースホルダーテキスト";
  if (name === "variant") return "バリアントスタイル";
  if (name === "size") return "サイズ";
  if (type === "function") return `${name} ハンドラ`;
  if (type === "boolean") return `${name} フラグ`;
  return `${name} プロパティ`;
}

function defaultValueForProp(
  name: string,
  type: DetectedProp["type"]
): unknown {
  if (name === "children") return "サンプルテキスト";
  if (name === "label") return "ラベル";
  if (name === "title") return "タイトル";
  if (name === "placeholder") return "入力してください";
  if (name === "value") return "サンプル値";
  if (name === "variant") return "default";
  if (name === "size") return "md";
  if (name === "className") return "";
  switch (type) {
    case "string":
      return "サンプル";
    case "boolean":
      return false;
    case "number":
      return 0;
    case "function":
      return undefined;
    default:
      return undefined;
  }
}

export function generateStorybook(
  code: string,
  componentTitle: string,
  componentDescription: string
): StorybookResult {
  const componentName = extractComponentName(code);
  const pascalName = toPascalCase(componentTitle) || componentName;
  const detectedProps = detectProps(code);

  // Build argTypes
  const argTypes: StoryMeta["argTypes"] = {};
  for (const prop of detectedProps) {
    if (prop.name === "children") continue; // skip children from argTypes
    argTypes[prop.name] = {
      control: controlForType(prop.type),
      description: descriptionForProp(prop.name, prop.type),
    };
  }

  const meta: StoryMeta = {
    title: `Components/${pascalName}`,
    component: componentName,
    tags: ["autodocs"],
    argTypes,
  };

  // Build stories
  const defaultArgs: Record<string, unknown> = {};
  for (const prop of detectedProps) {
    const val = defaultValueForProp(prop.name, prop.type);
    if (val !== undefined) {
      defaultArgs[prop.name] = val;
    }
  }

  const customArgs: Record<string, unknown> = { ...defaultArgs };
  for (const prop of detectedProps) {
    if (prop.type === "string" && prop.name !== "className") {
      customArgs[prop.name] = `カスタム${descriptionForProp(prop.name, prop.type)}`;
    }
    if (prop.type === "boolean") {
      customArgs[prop.name] = true;
    }
  }

  const stories: Story[] = [
    {
      name: "Default",
      args: defaultArgs,
      code: generateStoryCode("Default", defaultArgs),
    },
    {
      name: "WithCustomProps",
      args: customArgs,
      code: generateStoryCode("WithCustomProps", customArgs),
    },
    {
      name: "Mobile",
      args: defaultArgs,
      code: generateMobileStoryCode(defaultArgs),
    },
    {
      name: "Dark",
      args: defaultArgs,
      code: generateDarkStoryCode(defaultArgs),
    },
  ];

  // Build full story file code
  const fullCode = buildFullStoryCode(componentName, pascalName, meta, stories);

  // Build MDX documentation
  const mdxDoc = buildMdxDoc(componentName, pascalName, componentDescription);

  return { meta, stories, fullCode, mdxDoc };
}

function generateStoryCode(
  storyName: string,
  args: Record<string, unknown>
): string {
  const argsStr = formatArgs(args);
  return `export const ${storyName}: Story = {
  args: ${argsStr},
};`;
}

function generateMobileStoryCode(args: Record<string, unknown>): string {
  const argsStr = formatArgs(args);
  return `export const Mobile: Story = {
  args: ${argsStr},
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};`;
}

function generateDarkStoryCode(args: Record<string, unknown>): string {
  const argsStr = formatArgs(args);
  return `export const Dark: Story = {
  args: ${argsStr},
  decorators: [
    (Story) => (
      <div className="dark bg-gray-900 p-4">
        <Story />
      </div>
    ),
  ],
};`;
}

function formatArgs(args: Record<string, unknown>): string {
  const entries = Object.entries(args).filter(
    ([, v]) => v !== undefined && v !== ""
  );
  if (entries.length === 0) return "{}";

  const lines = entries.map(([k, v]) => {
    if (typeof v === "string") return `    ${k}: ${JSON.stringify(v)},`;
    if (typeof v === "boolean") return `    ${k}: ${v},`;
    if (typeof v === "number") return `    ${k}: ${v},`;
    return `    ${k}: ${JSON.stringify(v)},`;
  });

  return `{\n${lines.join("\n")}\n  }`;
}

function buildFullStoryCode(
  componentName: string,
  pascalName: string,
  meta: StoryMeta,
  stories: Story[]
): string {
  const argTypesStr = Object.entries(meta.argTypes)
    .map(
      ([name, config]) =>
        `    ${name}: { control: '${config.control}', description: '${config.description}' },`
    )
    .join("\n");

  const storiesStr = stories.map((s) => s.code).join("\n\n");

  return `import type { Meta, StoryObj } from '@storybook/react';
import { ${componentName} } from './${componentName}';

const meta: Meta<typeof ${componentName}> = {
  title: '${meta.title}',
  component: ${componentName},
  tags: ${JSON.stringify(meta.tags)},
  argTypes: {
${argTypesStr}
  },
};

export default meta;
type Story = StoryObj<typeof ${componentName}>;

${storiesStr}
`;
}

function buildMdxDoc(
  componentName: string,
  pascalName: string,
  description: string
): string {
  return `import { Meta, Canvas, ArgsTable, Stories } from '@storybook/blocks';
import * as ${pascalName}Stories from './${componentName}.stories';

<Meta of={${pascalName}Stories} />

# ${pascalName}

${description}

## 使用例

<Canvas of={${pascalName}Stories.Default} />

## プロパティ

<ArgsTable of={${pascalName}Stories} />

## 全ストーリー

<Stories />
`;
}

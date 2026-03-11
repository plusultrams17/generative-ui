export type VariantType =
  | "dark"
  | "compact"
  | "rounded"
  | "bordered"
  | "colorful"
  | "minimal";

export type ComponentVariant = {
  type: VariantType;
  label: string;
  description: string;
  code: string;
};

type Replacement = [RegExp, string];

/**
 * Safely replace Tailwind class names within className strings.
 * Operates on the content inside className="..." or className={'...'} or template literals.
 */
function replaceClasses(
  code: string,
  replacements: Replacement[]
): string {
  let result = code;
  for (const [pattern, replacement] of replacements) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

/** Word-boundary-safe class pattern: matches the class as a whole word inside strings */
function classPattern(cls: string): RegExp {
  // Escape regex special chars in class name
  const escaped = cls.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?<=["'\\s])${escaped}(?=["'\\s])`, "g");
}

function applyDark(code: string): string {
  const replacements: Replacement[] = [
    // Backgrounds
    [classPattern("bg-white"), "bg-gray-900"],
    [classPattern("bg-gray-50"), "bg-gray-800"],
    [classPattern("bg-gray-100"), "bg-gray-700"],
    // Text
    [classPattern("text-gray-900"), "text-gray-100"],
    [classPattern("text-gray-800"), "text-gray-200"],
    [classPattern("text-gray-700"), "text-gray-300"],
    [classPattern("text-gray-600"), "text-gray-400"],
    [classPattern("text-gray-500"), "text-gray-400"],
    [classPattern("text-black"), "text-gray-100"],
    // Borders
    [classPattern("border-gray-200"), "border-gray-700"],
    [classPattern("border-gray-300"), "border-gray-600"],
    [classPattern("border-gray-100"), "border-gray-700"],
  ];
  return replaceClasses(code, replacements);
}

function applyCompact(code: string): string {
  const replacements: Replacement[] = [
    // Padding - order matters: larger values first
    [classPattern("p-8"), "p-4"],
    [classPattern("p-6"), "p-3"],
    [classPattern("p-4"), "p-2"],
    [classPattern("px-8"), "px-4"],
    [classPattern("px-6"), "px-3"],
    [classPattern("py-8"), "py-4"],
    [classPattern("py-6"), "py-3"],
    // Gap
    [classPattern("gap-8"), "gap-4"],
    [classPattern("gap-6"), "gap-3"],
    [classPattern("gap-4"), "gap-2"],
    // Text sizes
    [classPattern("text-3xl"), "text-xl"],
    [classPattern("text-2xl"), "text-lg"],
    [classPattern("text-xl"), "text-base"],
    [classPattern("text-lg"), "text-sm"],
    // Margins
    [classPattern("mb-8"), "mb-4"],
    [classPattern("mb-6"), "mb-3"],
    [classPattern("mb-4"), "mb-2"],
    [classPattern("mt-8"), "mt-4"],
    [classPattern("mt-6"), "mt-3"],
    [classPattern("mt-4"), "mt-2"],
    [classPattern("my-8"), "my-4"],
    [classPattern("my-6"), "my-3"],
    [classPattern("space-y-6"), "space-y-3"],
    [classPattern("space-y-4"), "space-y-2"],
    [classPattern("space-x-6"), "space-x-3"],
    [classPattern("space-x-4"), "space-x-2"],
  ];
  return replaceClasses(code, replacements);
}

function applyRounded(code: string): string {
  const replacements: Replacement[] = [
    // Order: more specific first
    [classPattern("rounded-none"), "rounded-xl"],
    [classPattern("rounded-2xl"), "rounded-3xl"],
    [classPattern("rounded-xl"), "rounded-2xl"],
    [classPattern("rounded-lg"), "rounded-2xl"],
    [classPattern("rounded-md"), "rounded-xl"],
    [classPattern("rounded-sm"), "rounded-lg"],
    // bare "rounded" needs careful matching to not collide with rounded-*
    [/(?<=["'\s])rounded(?=["'\s])/g, "rounded-lg"],
  ];
  return replaceClasses(code, replacements);
}

function applyBordered(code: string): string {
  let result = code;
  // Upgrade border to border-2 (avoid matching border-2 or border-t etc.)
  result = result.replace(
    /(?<=["'\s])border(?=["'\s])/g,
    "border-2 border-gray-300"
  );
  // Add shadow-lg to elements that have rounded (likely card-like)
  result = result.replace(
    /(?<=["'\s])(rounded-(?:sm|md|lg|xl|2xl|3xl|full))(?=["'\s])/g,
    "$1 shadow-lg"
  );
  return result;
}

function applyColorful(code: string): string {
  const replacements: Replacement[] = [
    [classPattern("bg-blue-500"), "bg-gradient-to-r from-purple-500 to-pink-500"],
    [classPattern("bg-blue-600"), "bg-gradient-to-r from-purple-600 to-pink-600"],
    [classPattern("bg-blue-700"), "bg-gradient-to-r from-purple-700 to-pink-700"],
    [classPattern("bg-indigo-500"), "bg-gradient-to-r from-blue-500 to-cyan-500"],
    [classPattern("bg-indigo-600"), "bg-gradient-to-r from-blue-600 to-cyan-600"],
    [classPattern("bg-green-500"), "bg-gradient-to-r from-emerald-400 to-teal-500"],
    [classPattern("bg-green-600"), "bg-gradient-to-r from-emerald-500 to-teal-600"],
    [classPattern("bg-red-500"), "bg-gradient-to-r from-rose-500 to-orange-500"],
    [classPattern("bg-red-600"), "bg-gradient-to-r from-rose-600 to-orange-600"],
    [classPattern("bg-purple-500"), "bg-gradient-to-r from-violet-500 to-fuchsia-500"],
    [classPattern("bg-purple-600"), "bg-gradient-to-r from-violet-600 to-fuchsia-600"],
    [classPattern("bg-gray-900"), "bg-gradient-to-br from-gray-900 to-gray-700"],
    [classPattern("text-blue-500"), "text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500"],
    [classPattern("text-blue-600"), "text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600"],
  ];
  return replaceClasses(code, replacements);
}

function applyMinimal(code: string): string {
  let result = code;
  // Remove shadow classes
  result = result.replace(/(?<=["'\s])shadow(?:-sm|-md|-lg|-xl|-2xl|-inner|-none)?(?=["'\s])/g, "");
  // Remove rounded classes
  result = result.replace(/(?<=["'\s])rounded(?:-sm|-md|-lg|-xl|-2xl|-3xl|-full|-none)?(?=["'\s])/g, "");
  // Remove ring classes
  result = result.replace(/(?<=["'\s])ring(?:-[0-9]+)?(?:\s+ring-[a-z]+-[0-9]+(?:\/[0-9]+)?)?(?=["'\s])/g, "");
  // Replace border with border-transparent
  result = result.replace(
    /(?<=["'\s])border(?=["'\s])/g,
    "border border-transparent"
  );
  // Clean up double spaces that may have been introduced
  result = result.replace(/  +/g, " ");
  return result;
}

const VARIANT_CONFIG: Record<
  VariantType,
  { label: string; description: string; transform: (code: string) => string }
> = {
  dark: {
    label: "ダークモード",
    description: "暗い背景に明るいテキストのダークテーマ",
    transform: applyDark,
  },
  compact: {
    label: "コンパクト",
    description: "余白とフォントサイズを縮小した省スペース版",
    transform: applyCompact,
  },
  rounded: {
    label: "まるみ",
    description: "角丸を大きくした柔らかいデザイン",
    transform: applyRounded,
  },
  bordered: {
    label: "ボーダー強調",
    description: "ボーダーとシャドウを強調した立体感のあるデザイン",
    transform: applyBordered,
  },
  colorful: {
    label: "カラフル",
    description: "グラデーションを使った鮮やかなカラーリング",
    transform: applyColorful,
  },
  minimal: {
    label: "ミニマル",
    description: "シャドウや装飾を取り除いたフラットデザイン",
    transform: applyMinimal,
  },
};

export const VARIANT_TYPES: VariantType[] = [
  "dark",
  "compact",
  "rounded",
  "bordered",
  "colorful",
  "minimal",
];

export function generateVariant(
  originalCode: string,
  type: VariantType
): ComponentVariant {
  const config = VARIANT_CONFIG[type];
  return {
    type,
    label: config.label,
    description: config.description,
    code: config.transform(originalCode),
  };
}

export function generateVariants(originalCode: string): ComponentVariant[] {
  return VARIANT_TYPES.map((type) => generateVariant(originalCode, type));
}

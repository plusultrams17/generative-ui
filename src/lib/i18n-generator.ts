export type I18nLocale = "ja" | "en" | "zh" | "ko" | "es" | "fr";

export type ExtractedText = {
  original: string;
  key: string;
  context?: string;
};

export type I18nTranslations = Record<I18nLocale, Record<string, string>>;

export type I18nResult = {
  extractedTexts: ExtractedText[];
  translations: I18nTranslations;
  i18nSetupCode: string;
  componentCode: string;
};

export const LOCALE_LABELS: Record<I18nLocale, string> = {
  ja: "日本語",
  en: "English",
  zh: "中文",
  ko: "한국어",
  es: "Español",
  fr: "Français",
};

// Japanese to key mapping
const JA_KEY_MAP: Record<string, string> = {
  "送信": "submit",
  "キャンセル": "cancel",
  "名前": "name",
  "メール": "email",
  "検索": "search",
  "削除": "delete",
  "編集": "edit",
  "保存": "save",
  "閉じる": "close",
  "確認": "confirm",
  "設定": "settings",
  "ログイン": "login",
  "ログアウト": "logout",
  "パスワード": "password",
  "タイトル": "title",
  "説明": "description",
  "作成": "create",
  "更新": "update",
  "戻る": "back",
  "次へ": "next",
  "完了": "done",
  "追加": "add",
  "一覧": "list",
  "詳細": "details",
  "ホーム": "home",
  "お気に入り": "favorites",
  "通知": "notification",
  "メッセージ": "message",
  "プロフィール": "profile",
  "電話番号": "phone_number",
  "住所": "address",
  "コメント": "comment",
  "いいね": "like",
  "シェア": "share",
  "ダウンロード": "download",
  "アップロード": "upload",
  "カート": "cart",
  "購入": "purchase",
  "注文": "order",
};

// Japanese to English translation mapping
const JA_EN_MAP: Record<string, string> = {
  "送信": "Submit",
  "キャンセル": "Cancel",
  "名前": "Name",
  "メール": "Email",
  "検索": "Search",
  "削除": "Delete",
  "編集": "Edit",
  "保存": "Save",
  "閉じる": "Close",
  "確認": "Confirm",
  "設定": "Settings",
  "ログイン": "Login",
  "ログアウト": "Logout",
  "パスワード": "Password",
  "タイトル": "Title",
  "説明": "Description",
  "作成": "Create",
  "更新": "Update",
  "戻る": "Back",
  "次へ": "Next",
  "完了": "Done",
  "追加": "Add",
  "一覧": "List",
  "詳細": "Details",
  "ホーム": "Home",
  "お気に入り": "Favorites",
  "通知": "Notification",
  "メッセージ": "Message",
  "プロフィール": "Profile",
  "電話番号": "Phone Number",
  "住所": "Address",
  "コメント": "Comment",
  "いいね": "Like",
  "シェア": "Share",
  "ダウンロード": "Download",
  "アップロード": "Upload",
  "カート": "Cart",
  "購入": "Purchase",
  "注文": "Order",
};

// Japanese to Chinese translation mapping
const JA_ZH_MAP: Record<string, string> = {
  "送信": "提交",
  "キャンセル": "取消",
  "名前": "姓名",
  "メール": "邮箱",
  "検索": "搜索",
  "削除": "删除",
  "編集": "编辑",
  "保存": "保存",
  "閉じる": "关闭",
  "確認": "确认",
  "設定": "设置",
  "ログイン": "登录",
  "ログアウト": "退出登录",
  "パスワード": "密码",
  "タイトル": "标题",
  "説明": "描述",
  "作成": "创建",
  "更新": "更新",
  "戻る": "返回",
  "次へ": "下一步",
  "完了": "完成",
  "追加": "添加",
};

// Japanese to Korean translation mapping
const JA_KO_MAP: Record<string, string> = {
  "送信": "전송",
  "キャンセル": "취소",
  "名前": "이름",
  "メール": "이메일",
  "検索": "검색",
  "削除": "삭제",
  "編集": "편집",
  "保存": "저장",
  "閉じる": "닫기",
  "確認": "확인",
  "設定": "설정",
  "ログイン": "로그인",
  "ログアウト": "로그아웃",
  "パスワード": "비밀번호",
  "タイトル": "제목",
  "説明": "설명",
  "作成": "생성",
  "更新": "업데이트",
  "戻る": "뒤로",
  "次へ": "다음",
  "完了": "완료",
  "追加": "추가",
};

// Japanese to Spanish translation mapping
const JA_ES_MAP: Record<string, string> = {
  "送信": "Enviar",
  "キャンセル": "Cancelar",
  "名前": "Nombre",
  "メール": "Correo electrónico",
  "検索": "Buscar",
  "削除": "Eliminar",
  "編集": "Editar",
  "保存": "Guardar",
  "閉じる": "Cerrar",
  "確認": "Confirmar",
  "設定": "Configuración",
  "ログイン": "Iniciar sesión",
  "ログアウト": "Cerrar sesión",
  "パスワード": "Contraseña",
  "タイトル": "Título",
  "説明": "Descripción",
  "作成": "Crear",
  "更新": "Actualizar",
  "戻る": "Volver",
  "次へ": "Siguiente",
  "完了": "Completado",
  "追加": "Agregar",
};

// Japanese to French translation mapping
const JA_FR_MAP: Record<string, string> = {
  "送信": "Envoyer",
  "キャンセル": "Annuler",
  "名前": "Nom",
  "メール": "E-mail",
  "検索": "Rechercher",
  "削除": "Supprimer",
  "編集": "Modifier",
  "保存": "Sauvegarder",
  "閉じる": "Fermer",
  "確認": "Confirmer",
  "設定": "Paramètres",
  "ログイン": "Se connecter",
  "ログアウト": "Se déconnecter",
  "パスワード": "Mot de passe",
  "タイトル": "Titre",
  "説明": "Description",
  "作成": "Créer",
  "更新": "Mettre à jour",
  "戻る": "Retour",
  "次へ": "Suivant",
  "完了": "Terminé",
  "追加": "Ajouter",
};

const TRANSLATION_MAPS: Record<I18nLocale, Record<string, string>> = {
  ja: {}, // identity
  en: JA_EN_MAP,
  zh: JA_ZH_MAP,
  ko: JA_KO_MAP,
  es: JA_ES_MAP,
  fr: JA_FR_MAP,
};

function isJapanese(text: string): boolean {
  return /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/.test(text);
}

function textToKey(text: string): string {
  const trimmed = text.trim();

  // Check Japanese key map first
  if (JA_KEY_MAP[trimmed]) {
    return JA_KEY_MAP[trimmed];
  }

  // For partially matching Japanese text, try to find a substring match
  if (isJapanese(trimmed)) {
    for (const [ja, key] of Object.entries(JA_KEY_MAP)) {
      if (trimmed.includes(ja)) {
        return key;
      }
    }
    // Fallback: use a hash-like approach for unknown Japanese
    let hash = 0;
    for (let i = 0; i < trimmed.length; i++) {
      hash = ((hash << 5) - hash + trimmed.charCodeAt(i)) | 0;
    }
    return `text_${Math.abs(hash).toString(36)}`;
  }

  // For English/Latin text, convert to snake_case
  return trimmed
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40) || "text";
}

function shouldExclude(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return true;
  // Exclude numbers only
  if (/^\d+$/.test(trimmed)) return true;
  // Exclude symbols only
  if (/^[^a-zA-Z\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]+$/.test(trimmed)) return true;
  // Exclude very short strings (single char that isn't CJK)
  if (trimmed.length === 1 && !/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/.test(trimmed)) return true;
  return false;
}

export function extractTexts(code: string): ExtractedText[] {
  const texts: ExtractedText[] = [];
  const seen = new Set<string>();

  function addText(original: string, context?: string) {
    const trimmed = original.trim();
    if (shouldExclude(trimmed) || seen.has(trimmed)) return;
    seen.add(trimmed);
    texts.push({
      original: trimmed,
      key: textToKey(trimmed),
      context,
    });
  }

  // Extract JSX text nodes: >text<
  const jsxTextPattern = />([^<>{}\n]+)</g;
  let match;
  while ((match = jsxTextPattern.exec(code)) !== null) {
    addText(match[1], "JSX text");
  }

  // Extract placeholder="xxx"
  const placeholderPattern = /placeholder=["']([^"']+)["']/g;
  while ((match = placeholderPattern.exec(code)) !== null) {
    addText(match[1], "placeholder");
  }

  // Extract aria-label="xxx"
  const ariaLabelPattern = /aria-label=["']([^"']+)["']/g;
  while ((match = ariaLabelPattern.exec(code)) !== null) {
    addText(match[1], "aria-label");
  }

  // Extract title="xxx"
  const titlePattern = /title=["']([^"']+)["']/g;
  while ((match = titlePattern.exec(code)) !== null) {
    addText(match[1], "title");
  }

  return texts;
}

export function generateTranslations(texts: ExtractedText[]): I18nTranslations {
  const translations: I18nTranslations = {
    ja: {},
    en: {},
    zh: {},
    ko: {},
    es: {},
    fr: {},
  };

  for (const text of texts) {
    const original = text.original;

    // Japanese: use original text
    translations.ja[text.key] = original;

    // For other languages, try to find translation in maps
    for (const locale of ["en", "zh", "ko", "es", "fr"] as I18nLocale[]) {
      const map = TRANSLATION_MAPS[locale];
      if (map[original]) {
        translations[locale][text.key] = map[original];
      } else if (isJapanese(original)) {
        // Try partial match
        let translated = original;
        for (const [ja, localeText] of Object.entries(map)) {
          if (original.includes(ja)) {
            translated = translated.replace(ja, localeText);
          }
        }
        translations[locale][text.key] = translated;
      } else {
        // Non-Japanese text: keep as-is for all languages
        translations[locale][text.key] = original;
      }
    }
  }

  return translations;
}

export function generateI18nCode(code: string): I18nResult {
  const extractedTexts = extractTexts(code);
  const translations = generateTranslations(extractedTexts);

  // Generate i18n setup code
  const i18nSetupCode = `import { IntlProvider, FormattedMessage } from 'react-intl';

const messages = ${JSON.stringify(translations, null, 2)};

type Locale = ${Object.keys(LOCALE_LABELS).map(l => `"${l}"`).join(" | ")};

function AppWithI18n({ locale = "ja", children }: { locale?: Locale; children: React.ReactNode }) {
  return (
    <IntlProvider locale={locale} messages={messages[locale]}>
      {children}
    </IntlProvider>
  );
}`;

  // Generate component code with FormattedMessage replacements
  let componentCode = code;

  for (const text of extractedTexts) {
    const escaped = text.original.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    if (text.context === "JSX text") {
      // Replace >text< with ><FormattedMessage id="key" defaultMessage="text" /><
      const pattern = new RegExp(`>(\\s*)${escaped}(\\s*)<`, "g");
      componentCode = componentCode.replace(
        pattern,
        `>$1<FormattedMessage id="${text.key}" defaultMessage="${text.original}" />$2<`
      );
    } else if (text.context === "placeholder") {
      // Replace placeholder="text" with placeholder={intl.formatMessage({ id: "key" })}
      componentCode = componentCode.replace(
        new RegExp(`placeholder=["']${escaped}["']`, "g"),
        `placeholder={intl.formatMessage({ id: "${text.key}" })}`
      );
    } else if (text.context === "aria-label") {
      componentCode = componentCode.replace(
        new RegExp(`aria-label=["']${escaped}["']`, "g"),
        `aria-label={intl.formatMessage({ id: "${text.key}" })}`
      );
    } else if (text.context === "title") {
      componentCode = componentCode.replace(
        new RegExp(`title=["']${escaped}["']`, "g"),
        `title={intl.formatMessage({ id: "${text.key}" })}`
      );
    }
  }

  return {
    extractedTexts,
    translations,
    i18nSetupCode,
    componentCode,
  };
}

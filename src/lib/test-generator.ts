export type TestFormat = "playwright" | "rtl";

export type TestCase = {
  name: string;
  code: string;
};

export type GeneratedTests = {
  playwright: TestCase[];
  rtl: TestCase[];
};

type ElementDetection = {
  type: string;
  playwrightTest: TestCase;
  rtlTest: TestCase;
};

function extractComponentName(code: string): string {
  let match = code.match(/export\s+default\s+function\s+([A-Z]\w*)/);
  if (match) return match[1];

  match = code.match(/function\s+([A-Z]\w*)\s*\(/);
  if (match) return match[1];

  match = code.match(
    /(?:const|let)\s+([A-Z]\w*)\s*=\s*(?:\([^)]*\)\s*=>|function)/
  );
  if (match) return match[1];

  return "App";
}

function detectElements(code: string): ElementDetection[] {
  const detections: ElementDetection[] = [];

  // Button detection
  if (/<(?:button|Button)\b/i.test(code)) {
    detections.push({
      type: "button",
      playwrightTest: {
        name: "ボタンをクリックできる",
        code: `test('ボタンをクリックできる', async ({ page }) => {
  const button = page.getByRole('button');
  await expect(button.first()).toBeVisible();
  await button.first().click();
});`,
      },
      rtlTest: {
        name: "ボタンをクリックできる",
        code: `test('ボタンをクリックできる', () => {
  render(<Component />);
  const button = screen.getAllByRole('button')[0];
  expect(button).toBeInTheDocument();
  fireEvent.click(button);
});`,
      },
    });
  }

  // Input detection
  if (/<(?:input|Input|textarea)\b/i.test(code)) {
    detections.push({
      type: "input",
      playwrightTest: {
        name: "入力フィールドにテキストを入力できる",
        code: `test('入力フィールドにテキストを入力できる', async ({ page }) => {
  const input = page.getByRole('textbox');
  await expect(input.first()).toBeVisible();
  await input.first().fill('テストテキスト');
  await expect(input.first()).toHaveValue('テストテキスト');
});`,
      },
      rtlTest: {
        name: "入力フィールドにテキストを入力できる",
        code: `test('入力フィールドにテキストを入力できる', () => {
  render(<Component />);
  const input = screen.getAllByRole('textbox')[0];
  expect(input).toBeInTheDocument();
  fireEvent.change(input, { target: { value: 'テストテキスト' } });
  expect(input).toHaveValue('テストテキスト');
});`,
      },
    });
  }

  // Form detection
  if (/<form\b/i.test(code)) {
    detections.push({
      type: "form",
      playwrightTest: {
        name: "フォームを送信できる",
        code: `test('フォームを送信できる', async ({ page }) => {
  const form = page.locator('form');
  await expect(form).toBeVisible();
  // フォーム内の入力フィールドを埋める
  const inputs = page.getByRole('textbox');
  for (let i = 0; i < await inputs.count(); i++) {
    await inputs.nth(i).fill('テストデータ');
  }
  // 送信ボタンをクリック
  const submitButton = form.getByRole('button', { name: /送信|submit/i });
  if (await submitButton.count() > 0) {
    await submitButton.click();
  }
});`,
      },
      rtlTest: {
        name: "フォームを送信できる",
        code: `test('フォームを送信できる', () => {
  render(<Component />);
  const form = document.querySelector('form');
  expect(form).toBeInTheDocument();
  // フォーム内の入力フィールドを埋める
  const inputs = screen.getAllByRole('textbox');
  inputs.forEach(input => {
    fireEvent.change(input, { target: { value: 'テストデータ' } });
  });
  fireEvent.submit(form!);
});`,
      },
    });
  }

  // Table detection
  if (/<(?:table|thead|tbody)\b/i.test(code)) {
    detections.push({
      type: "table",
      playwrightTest: {
        name: "テーブルが正しく表示される",
        code: `test('テーブルが正しく表示される', async ({ page }) => {
  const table = page.getByRole('table');
  await expect(table).toBeVisible();
  // ヘッダー行の確認
  const headerCells = page.getByRole('columnheader');
  await expect(headerCells.first()).toBeVisible();
  // データ行の確認
  const rows = page.getByRole('row');
  expect(await rows.count()).toBeGreaterThan(1);
});`,
      },
      rtlTest: {
        name: "テーブルが正しく表示される",
        code: `test('テーブルが正しく表示される', () => {
  render(<Component />);
  const table = screen.getByRole('table');
  expect(table).toBeInTheDocument();
  // ヘッダー行の確認
  const headerCells = screen.getAllByRole('columnheader');
  expect(headerCells.length).toBeGreaterThan(0);
  // データ行の確認
  const rows = screen.getAllByRole('row');
  expect(rows.length).toBeGreaterThan(1);
});`,
      },
    });
  }

  // Image detection
  if (/<img\b/i.test(code)) {
    detections.push({
      type: "img",
      playwrightTest: {
        name: "画像が表示される",
        code: `test('画像が表示される', async ({ page }) => {
  const img = page.getByRole('img');
  await expect(img.first()).toBeVisible();
  // alt属性の確認
  await expect(img.first()).toHaveAttribute('alt');
});`,
      },
      rtlTest: {
        name: "画像が表示される",
        code: `test('画像が表示される', () => {
  render(<Component />);
  const images = screen.getAllByRole('img');
  expect(images.length).toBeGreaterThan(0);
  // alt属性の確認
  images.forEach(img => {
    expect(img).toHaveAttribute('alt');
  });
});`,
      },
    });
  }

  // Link detection
  if (/<(?:a|Link)\b/i.test(code)) {
    detections.push({
      type: "link",
      playwrightTest: {
        name: "リンクが正しく設定されている",
        code: `test('リンクが正しく設定されている', async ({ page }) => {
  const link = page.getByRole('link');
  await expect(link.first()).toBeVisible();
  // href属性の確認
  await expect(link.first()).toHaveAttribute('href');
});`,
      },
      rtlTest: {
        name: "リンクが正しく設定されている",
        code: `test('リンクが正しく設定されている', () => {
  render(<Component />);
  const links = screen.getAllByRole('link');
  expect(links.length).toBeGreaterThan(0);
  // href属性の確認
  links.forEach(link => {
    expect(link).toHaveAttribute('href');
  });
});`,
      },
    });
  }

  // Select detection
  if (/<select\b/i.test(code)) {
    detections.push({
      type: "select",
      playwrightTest: {
        name: "セレクトボックスで選択できる",
        code: `test('セレクトボックスで選択できる', async ({ page }) => {
  const select = page.getByRole('combobox');
  await expect(select.first()).toBeVisible();
  // オプションの確認
  const options = page.getByRole('option');
  expect(await options.count()).toBeGreaterThan(0);
});`,
      },
      rtlTest: {
        name: "セレクトボックスで選択できる",
        code: `test('セレクトボックスで選択できる', () => {
  render(<Component />);
  const select = screen.getAllByRole('combobox')[0];
  expect(select).toBeInTheDocument();
  // オプションの確認
  const options = screen.getAllByRole('option');
  expect(options.length).toBeGreaterThan(0);
});`,
      },
    });
  }

  // Checkbox detection
  if (/<(?:input[^>]*type\s*=\s*["']checkbox["']|checkbox)\b/i.test(code) || /checkbox/i.test(code)) {
    detections.push({
      type: "checkbox",
      playwrightTest: {
        name: "チェックボックスを切り替えできる",
        code: `test('チェックボックスを切り替えできる', async ({ page }) => {
  const checkbox = page.getByRole('checkbox');
  await expect(checkbox.first()).toBeVisible();
  await checkbox.first().check();
  await expect(checkbox.first()).toBeChecked();
  await checkbox.first().uncheck();
  await expect(checkbox.first()).not.toBeChecked();
});`,
      },
      rtlTest: {
        name: "チェックボックスを切り替えできる",
        code: `test('チェックボックスを切り替えできる', () => {
  render(<Component />);
  const checkbox = screen.getAllByRole('checkbox')[0];
  expect(checkbox).toBeInTheDocument();
  fireEvent.click(checkbox);
  expect(checkbox).toBeChecked();
  fireEvent.click(checkbox);
  expect(checkbox).not.toBeChecked();
});`,
      },
    });
  }

  return detections;
}

export function generateTests(code: string, title: string): GeneratedTests {
  const componentName = extractComponentName(code);
  const detections = detectElements(code);

  const playwrightTests: TestCase[] = [];
  const rtlTests: TestCase[] = [];

  // Rendering test (always included)
  playwrightTests.push({
    name: "コンポーネントが正しくレンダリングされる",
    code: `test('コンポーネントが正しくレンダリングされる', async ({ page }) => {
  // コンポーネントがページ上に存在することを確認
  await expect(page.locator('#root')).toBeVisible();
  // コンテンツが空でないことを確認
  const content = await page.locator('#root').textContent();
  expect(content?.trim().length).toBeGreaterThan(0);
});`,
  });

  rtlTests.push({
    name: "コンポーネントが正しくレンダリングされる",
    code: `test('コンポーネントが正しくレンダリングされる', () => {
  const { container } = render(<${componentName} />);
  expect(container).toBeInTheDocument();
  expect(container.textContent?.trim().length).toBeGreaterThan(0);
});`,
  });

  // Accessibility basic check (always included)
  playwrightTests.push({
    name: "アクセシビリティの基本チェック",
    code: `test('アクセシビリティの基本チェック', async ({ page }) => {
  // インタラクティブ要素にアクセシブルな名前があることを確認
  const buttons = page.getByRole('button');
  for (let i = 0; i < await buttons.count(); i++) {
    const name = await buttons.nth(i).getAttribute('aria-label') ??
                 await buttons.nth(i).textContent();
    expect(name?.trim().length).toBeGreaterThan(0);
  }
  // 画像にalt属性があることを確認
  const images = page.getByRole('img');
  for (let i = 0; i < await images.count(); i++) {
    await expect(images.nth(i)).toHaveAttribute('alt');
  }
  // 見出しの階層が正しいことを確認
  const headings = page.getByRole('heading');
  if (await headings.count() > 0) {
    await expect(headings.first()).toBeVisible();
  }
});`,
  });

  rtlTests.push({
    name: "アクセシビリティの基本チェック",
    code: `test('アクセシビリティの基本チェック', () => {
  render(<${componentName} />);
  // インタラクティブ要素にアクセシブルな名前があることを確認
  const buttons = screen.queryAllByRole('button');
  buttons.forEach(button => {
    const hasLabel = button.getAttribute('aria-label') ||
                     button.textContent?.trim();
    expect(hasLabel).toBeTruthy();
  });
  // 画像にalt属性があることを確認
  const images = screen.queryAllByRole('img');
  images.forEach(img => {
    expect(img).toHaveAttribute('alt');
  });
});`,
  });

  // Element-specific tests
  for (const detection of detections) {
    playwrightTests.push(detection.playwrightTest);
    rtlTests.push(detection.rtlTest);
  }

  return {
    playwright: playwrightTests,
    rtl: rtlTests,
  };
}

"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import type { ThemeTokens } from "@/stores/theme-custom-store";

type SandboxFrameProps = {
  code: string;
  onError?: (error: string) => void;
  onLoad?: () => void;
  maxWidth?: string;
  themeTokens?: ThemeTokens;
  animationCSS?: string;
};

export function SandboxFrame({ code, onError, onLoad, maxWidth, themeTokens, animationCSS }: SandboxFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(400);

  const generateSrcdoc = useCallback(() => {
    const themeVars = themeTokens
      ? `
    :root {
      --primary: ${themeTokens.primaryColor};
      --bg: ${themeTokens.backgroundColor};
      --text: ${themeTokens.textColor};
      --accent: ${themeTokens.accentColor};
      --radius: ${themeTokens.borderRadius};
      --font: ${themeTokens.fontFamily};
      --spacing: ${themeTokens.spacing};
    }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: var(--font);
    }`
      : "";

    const animationBlock = animationCSS
      ? `<style id="animation-styles">${animationCSS}</style>`
      : "";

    const tailwindConfig = themeTokens
      ? `<script>
  tailwind.config = {
    theme: {
      extend: {
        colors: {
          primary: 'var(--primary)',
          accent: 'var(--accent)',
        },
        borderRadius: {
          DEFAULT: 'var(--radius)',
        },
      }
    }
  }
<\/script>`
      : "";

    // Escape user code for embedding in a script text content
    const escapedCode = code.replace(/<\/script>/gi, "<\\/script>");

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <script src="https://cdn.tailwindcss.com"><\/script>
  ${tailwindConfig}
  <style>
    body {
      margin: 0;
      padding: 16px;
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      background: transparent;
    }
    * { box-sizing: border-box; }
    ${themeVars}
  </style>
  ${animationBlock}
</head>
<body>
  <div id="root"></div>
  <script type="text/plain" id="user-code">${escapedCode}<\/script>
  <script type="module">
    try {
      const [ReactModule, ReactDOMModule, BabelModule] = await Promise.all([
        import('https://esm.sh/react@19?bundle'),
        import('https://esm.sh/react-dom@19/client?bundle'),
        import('https://esm.sh/@babel/standalone?bundle'),
      ]);

      const React = ReactModule.default || ReactModule;
      window.React = React;

      // Expose common hooks as globals so user code can use React.useState etc.
      Object.keys(ReactModule).forEach(key => {
        if (key !== 'default' && key !== '__esModule') {
          React[key] = React[key] || ReactModule[key];
        }
      });

      const { createRoot } = ReactDOMModule;
      window.ReactDOM = { createRoot };

      const Babel = BabelModule.default || BabelModule;

      // Get and compile user code
      const userCode = document.getElementById('user-code').textContent;
      const compiled = Babel.transform(userCode, {
        presets: ['react'],
        filename: 'component.jsx',
      }).code;

      // Execute user code to define App
      const execFn = new Function(compiled);
      execFn();

      // Render
      const root = createRoot(document.getElementById('root'));
      root.render(React.createElement(window.App || App));

      window.parent.postMessage({ type: 'sandbox-loaded' }, '*');

      // Observe height changes
      const ro = new ResizeObserver(() => {
        const h = document.documentElement.scrollHeight;
        window.parent.postMessage({ type: 'sandbox-height', height: h }, '*');
      });
      ro.observe(document.body);

    } catch (error) {
      document.getElementById('root').innerHTML =
        '<div style="color:#ef4444;padding:12px;border:1px solid #fecaca;border-radius:8px;background:#fef2f2;font-size:14px;">' +
        '<strong>レンダリングエラー</strong><br/>' + error.message + '</div>';
      window.parent.postMessage(
        { type: 'sandbox-error', error: error.message },
        '*'
      );
    }
  <\/script>
</body>
</html>`;
  }, [code, themeTokens, animationCSS]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "sandbox-error") {
        onError?.(event.data.error);
      }
      if (event.data?.type === "sandbox-loaded") {
        onLoad?.();
      }
      if (event.data?.type === "sandbox-height") {
        setHeight(Math.min(Math.max(event.data.height + 32, 150), 800));
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onError, onLoad]);

  return (
    <div
      className="mx-auto transition-all duration-300 ease-in-out"
      style={{ maxWidth: maxWidth || "100%", width: "100%" }}
    >
      <iframe
        ref={iframeRef}
        srcDoc={generateSrcdoc()}
        sandbox="allow-scripts"
        allow=""
        className="w-full rounded-lg border bg-white dark:bg-zinc-950"
        style={{ height: `${height}px`, transition: "height 0.2s ease" }}
        title="Component Preview"
      />
    </div>
  );
}

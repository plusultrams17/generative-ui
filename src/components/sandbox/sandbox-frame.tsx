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

    // Encode user code as base64 to avoid all escaping issues
    const base64Code = btoa(unescape(encodeURIComponent(code)));

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <script src="https://cdn.tailwindcss.com"><\/script>
  ${tailwindConfig}
  <script src="https://unpkg.com/react@18/umd/react.production.min.js"><\/script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"><\/script>
  <script src="https://unpkg.com/@babel/standalone@7/babel.min.js"><\/script>
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
  <script>
    (function() {
      try {
        // Decode user code from base64
        var userCode = decodeURIComponent(escape(atob("${base64Code}")));

        // Compile JSX with Babel
        var compiled = Babel.transform(userCode, {
          presets: ['react']
        }).code;

        // Execute compiled code in global scope via script element
        var scriptEl = document.createElement('script');
        scriptEl.textContent = compiled;
        document.body.appendChild(scriptEl);

        // Find App component
        var AppComponent = window.App;
        if (typeof AppComponent === 'undefined') {
          throw new Error('App component not found. Code must define: function App() { ... }');
        }

        // Render
        var root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(React.createElement(AppComponent));

        window.parent.postMessage({ type: 'sandbox-loaded' }, '*');

        // Observe height changes
        var ro = new ResizeObserver(function() {
          var h = document.documentElement.scrollHeight;
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
    })();
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

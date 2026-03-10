(() => {
  "use strict";

  // ===== DOM Elements =====
  const app = document.getElementById("app");
  const editor = document.getElementById("editor");
  const preview = document.getElementById("preview");
  const wordCount = document.getElementById("word-count");
  const btnCopy = document.getElementById("btn-copy");
  const btnExport = document.getElementById("btn-export");
  const btnFullscreen = document.getElementById("btn-fullscreen");
  const btnTheme = document.getElementById("btn-theme");
  const divider = document.getElementById("divider");
  const editorPane = document.getElementById("editor-pane");
  const previewPane = document.getElementById("preview-pane");
  const toolbar = document.getElementById("toolbar");
  const mobileTabs = document.getElementById("mobile-tabs");

  // ===== State =====
  let currentTheme = localStorage.getItem("md-theme") || "light";
  let saveTimeout = null;

  // ===== Markdown Parser =====
  function parseMarkdown(md) {
    let html = "";
    const lines = md.split("\n");
    let i = 0;
    let inCodeBlock = false;
    let codeContent = "";
    let inUl = false;
    let inOl = false;

    function closeList() {
      if (inUl) { html += "</ul>\n"; inUl = false; }
      if (inOl) { html += "</ol>\n"; inOl = false; }
    }

    function parseInline(text) {
      // Escape HTML
      text = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

      // Images: ![alt](url)
      text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');

      // Links: [text](url)
      text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

      // Inline code (must come before bold/italic to avoid conflicts)
      text = text.replace(/`([^`]+)`/g, "<code>$1</code>");

      // Bold: **text**
      text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

      // Strikethrough: ~~text~~
      text = text.replace(/~~([^~]+)~~/g, "<del>$1</del>");

      // Italic: *text*
      text = text.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "<em>$1</em>");

      return text;
    }

    while (i < lines.length) {
      const line = lines[i];

      // Code blocks
      if (line.trimStart().startsWith("```")) {
        if (!inCodeBlock) {
          closeList();
          inCodeBlock = true;
          codeContent = "";
          i++;
          continue;
        } else {
          inCodeBlock = false;
          const escaped = codeContent
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
          html += "<pre><code>" + escaped + "</code></pre>\n";
          i++;
          continue;
        }
      }

      if (inCodeBlock) {
        codeContent += (codeContent ? "\n" : "") + line;
        i++;
        continue;
      }

      // Blank line
      if (line.trim() === "") {
        closeList();
        i++;
        continue;
      }

      // Horizontal rule
      if (/^-{3,}$/.test(line.trim()) || /^\*{3,}$/.test(line.trim()) || /^_{3,}$/.test(line.trim())) {
        closeList();
        html += "<hr>\n";
        i++;
        continue;
      }

      // Headers
      const headerMatch = line.match(/^(#{1,3})\s+(.+)/);
      if (headerMatch) {
        closeList();
        const level = headerMatch[1].length;
        html += `<h${level}>${parseInline(headerMatch[2])}</h${level}>\n`;
        i++;
        continue;
      }

      // Blockquote
      if (line.trimStart().startsWith("> ")) {
        closeList();
        let quoteLines = [];
        while (i < lines.length && lines[i].trimStart().startsWith("> ")) {
          quoteLines.push(lines[i].replace(/^>\s?/, ""));
          i++;
        }
        html += "<blockquote>" + quoteLines.map(l => "<p>" + parseInline(l) + "</p>").join("\n") + "</blockquote>\n";
        continue;
      }

      // Unordered list
      const ulMatch = line.match(/^[-*+]\s+(.+)/);
      if (ulMatch) {
        if (inOl) { html += "</ol>\n"; inOl = false; }
        if (!inUl) { html += "<ul>\n"; inUl = true; }
        html += `<li>${parseInline(ulMatch[1])}</li>\n`;
        i++;
        continue;
      }

      // Ordered list
      const olMatch = line.match(/^\d+\.\s+(.+)/);
      if (olMatch) {
        if (inUl) { html += "</ul>\n"; inUl = false; }
        if (!inOl) { html += "<ol>\n"; inOl = true; }
        html += `<li>${parseInline(olMatch[1])}</li>\n`;
        i++;
        continue;
      }

      // Paragraph
      closeList();
      html += `<p>${parseInline(line)}</p>\n`;
      i++;
    }

    // Close any open code block
    if (inCodeBlock) {
      const escaped = codeContent
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      html += "<pre><code>" + escaped + "</code></pre>\n";
    }

    closeList();
    return html;
  }

  // ===== Update Preview =====
  function updatePreview() {
    const md = editor.value;
    preview.innerHTML = parseMarkdown(md);
    updateWordCount(md);
    scheduleSave(md);
  }

  // ===== Word & Character Count =====
  function updateWordCount(text) {
    const chars = text.length;
    const trimmed = text.trim();
    const words = trimmed === "" ? 0 : trimmed.split(/\s+/).length;
    wordCount.textContent = `${chars} 文字 / ${words} 単語`;
  }

  // ===== LocalStorage Auto-save =====
  function scheduleSave(text) {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      localStorage.setItem("md-content", text);
    }, 500);
  }

  function loadSavedContent() {
    const saved = localStorage.getItem("md-content");
    if (saved !== null) {
      editor.value = saved;
    } else {
      editor.value = `# Markdownエディタへようこそ！

これは**ライブプレビュー**付きのMarkdownエディタです。

## 機能

- **太字**テキスト
- *斜体*テキスト
- ~~取り消し線~~テキスト
- \`インラインコード\`

### コードブロック

\`\`\`
function hello() {
  console.log("こんにちは！");
}
\`\`\`

> これは引用ブロックです。

1. 番号付きリスト
2. 二番目の項目
3. 三番目の項目

[リンクの例](https://example.com)

---

左側で編集すると、右側にプレビューが表示されます。`;
    }
    updatePreview();
  }

  // ===== Theme =====
  function applyTheme(theme) {
    currentTheme = theme;
    app.className = theme;
    if (app.classList.contains("fullscreen")) {
      app.classList.add("fullscreen");
    }
    btnTheme.textContent = theme === "light" ? "🌙 ダーク" : "☀️ ライト";
    localStorage.setItem("md-theme", theme);
  }

  // ===== Toolbar Actions =====
  function insertAtCursor(before, after, defaultText) {
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const selected = editor.value.substring(start, end) || defaultText;
    const replacement = before + selected + after;

    editor.focus();
    // Use execCommand for undo support, fall back to manual insert
    const success = document.execCommand("insertText", false, "");
    if (!success) {
      editor.setRangeText(replacement, start, end, "select");
    } else {
      // execCommand cleared selection, restore manually
      editor.setRangeText(replacement, start, end, "select");
    }

    // Select the inserted text (excluding markers)
    editor.selectionStart = start + before.length;
    editor.selectionEnd = start + before.length + selected.length;
    updatePreview();
  }

  function insertAtLineStart(prefix) {
    const start = editor.selectionStart;
    const val = editor.value;
    // Find the beginning of the current line
    const lineStart = val.lastIndexOf("\n", start - 1) + 1;
    const before = val.substring(0, lineStart);
    const after = val.substring(lineStart);

    editor.value = before + prefix + after;
    editor.selectionStart = editor.selectionEnd = start + prefix.length;
    editor.focus();
    updatePreview();
  }

  const toolbarActions = {
    h1: () => insertAtLineStart("# "),
    h2: () => insertAtLineStart("## "),
    h3: () => insertAtLineStart("### "),
    bold: () => insertAtCursor("**", "**", "太字テキスト"),
    italic: () => insertAtCursor("*", "*", "斜体テキスト"),
    strike: () => insertAtCursor("~~", "~~", "取り消し線"),
    code: () => insertAtCursor("`", "`", "コード"),
    codeblock: () => insertAtCursor("```\n", "\n```", "コードをここに入力"),
    link: () => insertAtCursor("[", "](https://example.com)", "リンクテキスト"),
    image: () => insertAtCursor("![", "](https://example.com/image.png)", "画像の説明"),
    ul: () => insertAtLineStart("- "),
    ol: () => insertAtLineStart("1. "),
    blockquote: () => insertAtLineStart("> "),
    hr: () => {
      const start = editor.selectionStart;
      const val = editor.value;
      const insert = "\n---\n";
      editor.value = val.substring(0, start) + insert + val.substring(start);
      editor.selectionStart = editor.selectionEnd = start + insert.length;
      editor.focus();
      updatePreview();
    },
  };

  // ===== Copy Markdown =====
  function copyMarkdown() {
    navigator.clipboard.writeText(editor.value).then(() => {
      const original = btnCopy.textContent;
      btnCopy.textContent = "✓ コピー済み";
      setTimeout(() => { btnCopy.textContent = original; }, 1500);
    }).catch(() => {
      // Fallback
      editor.select();
      document.execCommand("copy");
      const original = btnCopy.textContent;
      btnCopy.textContent = "✓ コピー済み";
      setTimeout(() => { btnCopy.textContent = original; }, 1500);
    });
  }

  // ===== Export HTML =====
  function exportHTML() {
    const htmlContent = `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>エクスポート</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Hiragino Kaku Gothic ProN", sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; line-height: 1.8; color: #1a1a1a; }
  h1 { border-bottom: 1px solid #ccc; padding-bottom: 0.3em; }
  h2 { border-bottom: 1px solid #eee; padding-bottom: 0.2em; }
  code { background: #f1f5f9; padding: 2px 6px; border-radius: 3px; font-family: monospace; }
  pre { background: #f1f5f9; padding: 12px 16px; border-radius: 6px; overflow-x: auto; }
  pre code { background: none; padding: 0; }
  blockquote { border-left: 4px solid #3b82f6; background: #eff6ff; padding: 8px 16px; margin: 0.8em 0; border-radius: 0 4px 4px 0; }
  img { max-width: 100%; }
  a { color: #2563eb; }
  hr { border: none; border-top: 2px solid #e5e7eb; margin: 1.5em 0; }
</style>
</head>
<body>
${preview.innerHTML}
</body>
</html>`;
    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "markdown-export.html";
    a.click();
    URL.revokeObjectURL(url);
  }

  // ===== Fullscreen =====
  function toggleFullscreen() {
    app.classList.toggle("fullscreen");
    const isFs = app.classList.contains("fullscreen");
    btnFullscreen.textContent = isFs ? "⛶ 通常" : "⛶ 全画面";
  }

  // ===== Divider Drag =====
  function initDividerDrag() {
    let isDragging = false;

    divider.addEventListener("mousedown", (e) => {
      isDragging = true;
      divider.classList.add("dragging");
      e.preventDefault();
    });

    document.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      const mainRect = document.getElementById("main").getBoundingClientRect();
      const offset = e.clientX - mainRect.left;
      const totalWidth = mainRect.width;
      const pct = Math.min(Math.max(offset / totalWidth * 100, 15), 85);
      editorPane.style.flex = "none";
      editorPane.style.width = pct + "%";
      previewPane.style.flex = "1";
    });

    document.addEventListener("mouseup", () => {
      if (isDragging) {
        isDragging = false;
        divider.classList.remove("dragging");
      }
    });
  }

  // ===== Mobile Tabs =====
  function initMobileTabs() {
    const tabBtns = mobileTabs.querySelectorAll(".tab-btn");
    tabBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        tabBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const tab = btn.dataset.tab;
        if (tab === "editor") {
          editorPane.classList.remove("hidden");
          previewPane.classList.add("hidden");
        } else {
          editorPane.classList.add("hidden");
          previewPane.classList.remove("hidden");
        }
      });
    });
    // Default: show editor, hide preview on mobile
    previewPane.classList.add("hidden");
  }

  // ===== Keyboard Shortcuts =====
  function initKeyboardShortcuts() {
    editor.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "b") {
        e.preventDefault();
        toolbarActions.bold();
      } else if ((e.ctrlKey || e.metaKey) && e.key === "i") {
        e.preventDefault();
        toolbarActions.italic();
      } else if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        toolbarActions.link();
      } else if (e.key === "Tab") {
        e.preventDefault();
        insertAtCursor("  ", "", "");
      }
    });
  }

  // ===== Event Listeners =====
  function init() {
    // Theme
    applyTheme(currentTheme);
    btnTheme.addEventListener("click", () => {
      applyTheme(currentTheme === "light" ? "dark" : "light");
    });

    // Editor input
    editor.addEventListener("input", updatePreview);

    // Toolbar
    toolbar.addEventListener("click", (e) => {
      const btn = e.target.closest(".tool-btn");
      if (!btn) return;
      const action = btn.dataset.action;
      if (toolbarActions[action]) {
        toolbarActions[action]();
      }
    });

    // Header buttons
    btnCopy.addEventListener("click", copyMarkdown);
    btnExport.addEventListener("click", exportHTML);
    btnFullscreen.addEventListener("click", toggleFullscreen);

    // Divider drag
    initDividerDrag();

    // Mobile tabs
    initMobileTabs();

    // Keyboard shortcuts
    initKeyboardShortcuts();

    // Load saved content
    loadSavedContent();

    // Escape exits fullscreen
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && app.classList.contains("fullscreen")) {
        toggleFullscreen();
      }
    });
  }

  init();
})();

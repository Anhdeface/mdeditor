// ===== MATERIAL DESIGN MARKDOWN EDITOR =====
class MaterialMarkdownEditor {
    constructor() {
        this.elements = {};
        this.state = {
            isResizing: false,
            startX: 0,
            startLeftWidth: 0,
            renderMode: 'custom', // 'custom' or 'basic'
            theme: 'light',
            wordCount: 0,
            characterCount: 0,
            lineCount: 0,
            autoSaveTimer: null
        };
        
        this.init();
    }

    // ===== INITIALIZATION =====
    init() {
        this.cacheElements();
        this.bindEvents();
        this.updatePreview();
        this.updateStats();
        this.setupKeyboardShortcuts();
        this.loadSettings();
        this.loadAutoSave();
    }

    cacheElements() {
        this.elements = {
            editor: document.getElementById('mdEditor'),
            preview: document.getElementById('mdPreview'),
            charCount: document.getElementById('mdCharCount'),
            wordCount: document.getElementById('mdWordCount'),
            lineCount: document.getElementById('mdLineCount'),
            exportBtn: document.getElementById('mdExport'),
            clearBtn: document.getElementById('mdClear'),
            saveBtn: document.getElementById('mdSave'),
            loadBtn: document.getElementById('mdLoad'),
            fileInput: document.getElementById('mdFileInput'),
            divider: document.getElementById('mdDivider'),
            shortcuts: document.querySelectorAll('.md-shortcut-btn'),
            renderModeToggle: document.getElementById('mdRenderMode'),
            themeToggle: document.getElementById('mdThemeToggle'),
            customChip: document.getElementById('mdCustomChip'),
            basicChip: document.getElementById('mdBasicChip')
        };
    }

    bindEvents() {
        // Editor events
        this.elements.editor.addEventListener('input', () => this.handleEditorInput());
        
        // Button events
        this.elements.exportBtn.addEventListener('click', () => this.exportToHtml());
        this.elements.clearBtn.addEventListener('click', () => this.clearEditor());
        this.elements.saveBtn.addEventListener('click', () => this.saveToFile());
        this.elements.loadBtn.addEventListener('click', () => this.loadFile());
        this.elements.fileInput.addEventListener('change', (e) => this.handleFileLoad(e));
        
        // Render mode toggle
        if (this.elements.renderModeToggle) {
            this.elements.renderModeToggle.addEventListener('click', () => this.toggleRenderMode());
        }
        
        // Theme toggle
        if (this.elements.themeToggle) {
            this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());
        }
        
        // Chip events
        if (this.elements.customChip) {
            this.elements.customChip.addEventListener('click', () => this.setRenderMode('custom'));
        }
        if (this.elements.basicChip) {
            this.elements.basicChip.addEventListener('click', () => this.setRenderMode('basic'));
        }
        
        // Divider events
        this.elements.divider.addEventListener('mousedown', (e) => this.startResize(e));
        document.addEventListener('mousemove', (e) => this.handleResize(e));
        document.addEventListener('mouseup', () => this.stopResize());
        
        // Toolbar shortcuts
        this.elements.shortcuts.forEach(btn => {
            btn.addEventListener('click', () => this.handleShortcut(btn));
        });
        
        // Add Material Design ripple effects
        this.addRippleEffects();
    }

    // ===== MATERIAL DESIGN EFFECTS =====
    addRippleEffects() {
        const buttons = document.querySelectorAll('.md-btn, .md-shortcut-btn');
        
        buttons.forEach(button => {
            button.addEventListener('click', function(e) {
                const ripple = document.createElement('span');
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.cssText = `
                    position: absolute;
                    width: ${size}px;
                    height: ${size}px;
                    left: ${x}px;
                    top: ${y}px;
                    background: rgba(255, 255, 255, 0.5);
                    border-radius: 50%;
                    transform: scale(0);
                    animation: ripple 0.6s linear;
                    pointer-events: none;
                `;
                
                this.style.position = 'relative';
                this.style.overflow = 'hidden';
                this.appendChild(ripple);
                
                setTimeout(() => {
                    ripple.remove();
                }, 600);
            });
        });
        
        // Add ripple animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes ripple {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // ===== RENDER MODE FUNCTIONALITY =====
    toggleRenderMode() {
        this.state.renderMode = this.state.renderMode === 'custom' ? 'basic' : 'custom';
        this.updateRenderMode();
        this.updatePreview();
        this.saveSettings();
        this.showSnackbar(`Switched to ${this.state.renderMode} rendering`, 'info');
    }

    setRenderMode(mode) {
        this.state.renderMode = mode;
        this.updateRenderMode();
        this.updatePreview();
        this.saveSettings();
        this.showSnackbar(`Render mode: ${mode}`, 'info');
    }

    updateRenderMode() {
        const preview = this.elements.preview;
        
        // Remove all render classes
        preview.classList.remove('md-custom-render', 'md-basic-render');
        
        // Add current render class
        preview.classList.add(`md-${this.state.renderMode}-render`);
        
        // Update chip states
        if (this.elements.customChip && this.elements.basicChip) {
            this.elements.customChip.classList.toggle('active', this.state.renderMode === 'custom');
            this.elements.basicChip.classList.toggle('active', this.state.renderMode === 'basic');
        }
        
        // Update toggle button if exists
        if (this.elements.renderModeToggle) {
            this.elements.renderModeToggle.textContent = 
                this.state.renderMode === 'custom' ? 'Custom Render' : 'Basic Render';
        }
    }

    // ===== THEME FUNCTIONALITY =====
    toggleTheme() {
        this.state.theme = this.state.theme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        this.saveSettings();
        this.showSnackbar(`${this.state.theme.charAt(0).toUpperCase() + this.state.theme.slice(1)} theme`, 'info');
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.state.theme);
        
        // Update theme toggle button if exists
        if (this.elements.themeToggle) {
        const icon = this.elements.themeToggle.querySelector('i');
        if (icon) {
          icon.className = this.state.theme === 'light' ? 'ri-moon-line' : 'ri-sun-line';
        }
      }
    }

    // ===== EDITOR FUNCTIONALITY =====
    handleEditorInput() {
        this.updatePreview();
        this.updateStats();
        this.autoSave();
    }

    updatePreview() {
        const markdown = this.elements.editor.value;
        
        fetch('/preview', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ markdown })
        })
        .then(response => response.json())
        .then(data => {
            this.elements.preview.innerHTML = data.html;
            this.updateRenderMode();
        })
        .catch(error => {
            console.error('Error updating preview:', error);
            this.showSnackbar('Failed to update preview', 'error');
        });
    }

    updateStats() {
        const text = this.elements.editor.value;
        
        // Character count
        this.state.characterCount = text.length;
        this.elements.charCount.textContent = `${this.state.characterCount} chars`;
        
        // Word count
        const words = text.trim().split(/\s+/).filter(word => word.length > 0);
        this.state.wordCount = words.length;
        this.elements.wordCount.textContent = `${this.state.wordCount} words`;
        
        // Line count
        const lines = text.split('\n');
        this.state.lineCount = lines.length;
        this.elements.lineCount.textContent = `${this.state.lineCount} lines`;
    }

    // ===== TOOLBAR SHORTCUTS =====
    handleShortcut(button) {
        const action = button.dataset.action;
        const textarea = this.elements.editor;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);
        
        let replacement = '';
        let cursorOffset = 0;
        
        switch (action) {
            case 'bold':
                replacement = `**${selectedText || 'bold text'}**`;
                cursorOffset = selectedText ? 0 : -5;
                break;
            case 'italic':
                replacement = `*${selectedText || 'italic text'}*`;
                cursorOffset = selectedText ? 0 : -6;
                break;
            case 'heading':
                replacement = `## ${selectedText || 'Heading'}`;
                cursorOffset = selectedText ? 0 : -3;
                break;
            case 'link':
                replacement = `[${selectedText || 'link text'}](url)`;
                cursorOffset = selectedText ? -5 : -9;
                break;
            case 'code':
                replacement = `\`${selectedText || 'code'}\``;
                cursorOffset = selectedText ? 0 : -2;
                break;
            case 'codeblock':
                replacement = `\`\`\`javascript\n${selectedText || '// code here'}\n\`\`\``;
                cursorOffset = selectedText ? -5 : -13;
                break;
            case 'quote':
                replacement = `> ${selectedText || 'quote'}`;
                cursorOffset = selectedText ? 0 : -2;
                break;
            case 'list':
                replacement = `- ${selectedText || 'list item'}`;
                cursorOffset = selectedText ? 0 : -2;
                break;
            case 'numberedlist':
                replacement = `1. ${selectedText || 'numbered item'}`;
                cursorOffset = selectedText ? 0 : -4;
                break;
            case 'hr':
                replacement = '\n---\n';
                cursorOffset = -1;
                break;
            case 'table':
                replacement = '\n| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |\n';
                cursorOffset = -1;
                break;
        }
        
        this.insertText(replacement, cursorOffset);
    }

    insertText(text, cursorOffset = 0) {
        const textarea = this.elements.editor;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        
        textarea.value = textarea.value.substring(0, start) + text + textarea.value.substring(end);
        
        const newCursorPos = start + text.length + cursorOffset;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        textarea.focus();
        
        this.handleEditorInput();
    }

    // ===== FILE OPERATIONS =====
    exportToHtml() {
        const markdown = this.elements.editor.value;
        
        fetch('/preview', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ markdown })
        })
        .then(response => response.json())
        .then(data => {
            const htmlContent = this.generateMaterialHtmlExport(data.html);
            this.downloadFile(htmlContent, 'material-markdown.html', 'text/html');
            this.showSnackbar('HTML exported successfully!', 'success');
        })
        .catch(error => {
            console.error('Error exporting:', error);
            this.showSnackbar('Failed to export HTML', 'error');
        });
    }

    generateMaterialHtmlExport(content) {
        const theme = this.state.theme;
        const themeStyles = theme === 'dark' ? `
            body { background: #0f172a; color: #f8fafc; }
            .material-header { background: #1e293b; color: #f8fafc; border-bottom: 1px solid rgba(255,255,255,0.1); }
            .material-content { background: #1e293b; color: #f8fafc; border: 1px solid rgba(255,255,255,0.05); }
            pre { background: #0f172a; }
            code { background: rgba(255,255,255,0.1); color: #ec4899; }
            blockquote { background: rgba(255,255,255,0.05); color: #94a3b8; border-left-color: #ec4899; }
            th { background: rgba(255,255,255,0.05); color: #f8fafc; }
            td, th { border-color: rgba(255,255,255,0.1); }
            a { color: #818cf8; }
        ` : '';
        
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Modern Markdown Export</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Nunito:wght@400;500;600;700;800&family=Fira+Code:wght@400;500&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.min.css">
    <style>
        body { 
            font-family: 'Inter', sans-serif; 
            background: #f8fafc; 
            color: #1e293b; 
            max-width: 900px; 
            margin: 0 auto; 
            padding: 2rem; 
            line-height: 1.7;
        }
        .material-header {
            background: rgba(255,255,255,0.8);
            backdrop-filter: blur(10px);
            color: #1e293b;
            padding: 1.5rem;
            border-radius: 16px;
            margin-bottom: 2rem;
            font-family: 'Nunito', sans-serif;
            font-weight: 700;
            font-size: 1.5rem;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            display: flex;
            align-items: center;
            gap: 10px;
            border: 1px solid rgba(255,255,255,0.5);
        }
        .material-content {
            background: rgba(255,255,255,0.8);
            backdrop-filter: blur(10px);
            padding: 3rem;
            border-radius: 16px;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(255,255,255,0.5);
        }
        h1, h2, h3, h4, h5, h6 {
            font-family: 'Nunito', sans-serif;
            font-weight: 800;
            color: #1e293b;
            margin-top: 1.5em;
            margin-bottom: 0.8em;
            line-height: 1.3;
        }
        h1 { 
            font-size: 2.5rem; 
            background: -webkit-linear-gradient(135deg, #6366f1, #ec4899);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            border-bottom: 2px solid rgba(0,0,0,0.05);
            padding-bottom: 0.5rem;
        }
        h2 { font-size: 2rem; }
        h3 { font-size: 1.5rem; }
        p { margin-bottom: 1.2rem; }
        code { 
            background: rgba(0,0,0,0.05); 
            padding: 0.2rem 0.4rem; 
            border-radius: 6px; 
            font-family: 'Fira Code', monospace;
            font-size: 0.9rem;
            color: #db2777;
        }
        pre { 
            background: #1e1e1e; 
            padding: 1.5rem; 
            border-radius: 12px; 
            overflow-x: auto; 
            margin: 1.5rem 0;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
        }
        pre code { background: none; padding: 0; color: #f8f8f2; }
        blockquote { 
            border-left: 4px solid #ec4899; 
            margin: 1.5rem 0; 
            padding: 1.5rem; 
            color: #64748b; 
            background: rgba(236, 72, 153, 0.05);
            border-radius: 0 12px 12px 0;
            font-style: italic;
        }
        table { 
            border-collapse: separate;
            border-spacing: 0;
            width: 100%; 
            margin: 1.5rem 0; 
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 0 0 1px rgba(0,0,0,0.05);
        }
        th, td { 
            border-bottom: 1px solid rgba(0,0,0,0.05); 
            padding: 1rem; 
            text-align: left; 
        }
        th { 
            background: rgba(0,0,0,0.02); 
            font-weight: 700;
            color: #1e293b;
        }
        tr:last-child td { border-bottom: none; }
        a { color: #6366f1; text-decoration: none; font-weight: 600; border-bottom: 2px solid transparent; transition: border-color 0.2s; }
        a:hover { border-bottom-color: #6366f1; }
        img { max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
        hr { border: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(0,0,0,0.1), transparent); margin: 2rem 0; }
        ${themeStyles}
    </style>
</head>
<body>
    <div class="material-header">
        <span>MD Editor Export</span>
    </div>
    <div class="material-content">
        ${content}
    </div>
</body>
</html>`;
    }

    saveToFile() {
        const content = this.elements.editor.value;
        this.downloadFile(content, 'material-document.md', 'text/markdown');
        this.showSnackbar('Document saved successfully!', 'success');
    }

    loadFile() {
        this.elements.fileInput.click();
    }

    handleFileLoad(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            this.elements.editor.value = e.target.result;
            this.handleEditorInput();
            this.showSnackbar('File loaded successfully!', 'success');
        };
        reader.onerror = () => {
            this.showSnackbar('Failed to load file', 'error');
        };
        reader.readAsText(file);
        
        // Reset file input
        event.target.value = '';
    }

    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // ===== UI FUNCTIONALITY =====
    clearEditor() {
        if (confirm('Are you sure you want to clear the editor? This action cannot be undone.')) {
            this.elements.editor.value = '';
            this.handleEditorInput();
            this.showSnackbar('Editor cleared', 'info');
        }
    }

    // ===== RESIZE FUNCTIONALITY =====
    startResize(e) {
        this.state.isResizing = true;
        this.state.startX = e.pageX;
        const editorPane = document.querySelector('.md-editor-pane');
        this.state.startLeftWidth = editorPane.offsetWidth;
        
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
        e.preventDefault();
    }

    handleResize(e) {
        if (!this.state.isResizing) return;
        
        const deltaX = e.pageX - this.state.startX;
        const newLeftWidth = this.state.startLeftWidth + deltaX;
        const containerWidth = document.querySelector('.md-editor-container').offsetWidth;
        
        if (newLeftWidth > 200 && newLeftWidth < containerWidth - 200) {
            const editorPane = document.querySelector('.md-editor-pane');
            const previewPane = document.querySelector('.md-preview-pane');
            
            editorPane.style.width = newLeftWidth + 'px';
            previewPane.style.width = (containerWidth - newLeftWidth) + 'px';
        }
    }

    stopResize() {
        if (this.state.isResizing) {
            this.state.isResizing = false;
            document.body.style.cursor = 'default';
            document.body.style.userSelect = 'auto';
        }
    }

    // ===== KEYBOARD SHORTCUTS =====
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ignore shortcuts if editor is not focused
            if (document.activeElement !== this.elements.editor && e.key !== 's' && e.key !== 'e' && e.key !== 'r') {
                return;
            }

            // Ctrl/Cmd + S: Save
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.saveToFile();
            }
            
            // Ctrl/Cmd + E: Export
            else if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
                e.preventDefault();
                this.exportToHtml();
            }
            
            // Ctrl/Cmd + B: Bold
            else if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
                e.preventDefault();
                this.handleShortcut(document.querySelector('[data-action="bold"]'));
            }
            
            // Ctrl/Cmd + I: Italic
            else if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
                e.preventDefault();
                this.handleShortcut(document.querySelector('[data-action="italic"]'));
            }
            
            // Ctrl/Cmd + K: Link
            else if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.handleShortcut(document.querySelector('[data-action="link"]'));
            }
            
            // Ctrl/Cmd + `: Inline Code
            else if ((e.ctrlKey || e.metaKey) && e.key === '`') {
                e.preventDefault();
                this.handleShortcut(document.querySelector('[data-action="code"]'));
            }
            
            // Ctrl/Cmd + Shift + C: Code Block
            else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
                e.preventDefault();
                this.handleShortcut(document.querySelector('[data-action="codeblock"]'));
            }
            
            // Ctrl/Cmd + Shift + Q: Block Quote
            else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Q') {
                e.preventDefault();
                this.handleShortcut(document.querySelector('[data-action="quote"]'));
            }
            
            // Ctrl/Cmd + Shift + L: Unordered List
            else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'L') {
                e.preventDefault();
                this.handleShortcut(document.querySelector('[data-action="list"]'));
            }
            
            // Ctrl/Cmd + Shift + N: Numbered List
            else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'N') {
                e.preventDefault();
                this.handleShortcut(document.querySelector('[data-action="numberedlist"]'));
            }
            
            // Ctrl/Cmd + Shift + H: Heading
            else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'H') {
                e.preventDefault();
                this.handleShortcut(document.querySelector('[data-action="heading"]'));
            }
            
            // Ctrl/Cmd + Shift + T: Table
            else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
                e.preventDefault();
                this.handleShortcut(document.querySelector('[data-action="table"]'));
            }
            
            // Ctrl/Cmd + Shift + D: Horizontal Line
            else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
                e.preventDefault();
                this.handleShortcut(document.querySelector('[data-action="hr"]'));
            }
            
            // Ctrl/Cmd + R: Toggle render mode
            else if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
                e.preventDefault();
                this.toggleRenderMode();
            }
            
            // Ctrl/Cmd + Shift + M: Toggle Theme
            else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'M') {
                e.preventDefault();
                this.toggleTheme();
            }
            
            // Ctrl/Cmd + L: Clear Editor
            else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Delete') {
                e.preventDefault();
                this.clearEditor();
            }
        });
    }

    // ===== SETTINGS =====
    saveSettings() {
        const settings = {
            renderMode: this.state.renderMode,
            theme: this.state.theme
        };
        localStorage.setItem('material-editor-settings', JSON.stringify(settings));
    }

    loadSettings() {
        const saved = localStorage.getItem('material-editor-settings');
        if (saved) {
            try {
                const settings = JSON.parse(saved);
                this.state.renderMode = settings.renderMode || 'custom';
                this.state.theme = settings.theme || 'light';
                this.applyTheme();
                this.updateRenderMode();
            } catch (e) {
                console.error('Failed to load settings:', e);
            }
        }
    }

    // ===== AUTO SAVE =====
    autoSave() {
        clearTimeout(this.state.autoSaveTimer);
        this.state.autoSaveTimer = setTimeout(() => {
            localStorage.setItem('material-markdown-content', this.elements.editor.value);
        }, 1000);
    }

    loadAutoSave() {
        const savedContent = localStorage.getItem('material-markdown-content');
        if (savedContent && this.elements.editor.value === '') {
            this.elements.editor.value = savedContent;
            this.handleEditorInput();
        }
    }

    // ===== MATERIAL SNACKBAR =====
    showSnackbar(message, type = 'info') {
        const snackbar = document.createElement('div');
        snackbar.className = `md-snackbar ${type}`;
        snackbar.textContent = message;
        
        document.body.appendChild(snackbar);
        
        setTimeout(() => {
            snackbar.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            snackbar.classList.remove('show');
            setTimeout(() => {
                if (snackbar.parentNode) {
                    snackbar.parentNode.removeChild(snackbar);
                }
            }, 300);
        }, 3000);
    }
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    window.materialEditor = new MaterialMarkdownEditor();
});

// ===== EXPORT FOR GLOBAL ACCESS =====
window.MaterialMarkdownEditor = MaterialMarkdownEditor;

console.log('----------------------------------------------');
console.log('Markdown Editor is running'); 
console.log('----------------------------------------------');
console.log('Developed by Julian Kmut - github.com/anhdeface');
console.log('----------------------------------------------');
console.log('Telegram: @udp0xxbot');
console.log('----------------------------------------------');
console.log('Enjoy coding with Markdown!');
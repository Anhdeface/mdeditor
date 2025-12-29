// ===== MARKDOWN EDITOR APPLICATION =====
class MarkdownEditor {
    constructor() {
        this.elements = {};
        this.state = {
            isResizing: false,
            startX: 0,
            startLeftWidth: 0,
            currentTheme: 'light',
            wordCount: 0,
            characterCount: 0,
            lineCount: 0
        };
        
        this.init();
    }

    // ===== INITIALIZATION =====
    init() {
        this.cacheElements();
        this.bindEvents();
        this.loadTheme();
        this.updatePreview();
        this.updateStats();
        this.setupKeyboardShortcuts();
    }

    cacheElements() {
        this.elements = {
            editor: document.getElementById('markdownEditor'),
            preview: document.getElementById('preview'),
            charCount: document.getElementById('charCount'),
            wordCount: document.getElementById('wordCount'),
            lineCount: document.getElementById('lineCount'),
            exportBtn: document.getElementById('exportHtml'),
            clearBtn: document.getElementById('clearBtn'),
            themeToggle: document.getElementById('themeToggle'),
            divider: document.getElementById('divider'),
            saveBtn: document.getElementById('saveBtn'),
            loadBtn: document.getElementById('loadBtn'),
            fileInput: document.getElementById('fileInput'),
            shortcuts: document.querySelectorAll('.shortcut-btn')
        };
    }

    bindEvents() {
        // Editor events
        this.elements.editor.addEventListener('input', () => this.handleEditorInput());
        
        // Button events
        this.elements.exportBtn.addEventListener('click', () => this.exportToHtml());
        this.elements.clearBtn.addEventListener('click', () => this.clearEditor());
        this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());
        this.elements.saveBtn.addEventListener('click', () => this.saveToFile());
        this.elements.loadBtn.addEventListener('click', () => this.loadFile());
        this.elements.fileInput.addEventListener('change', (e) => this.handleFileLoad(e));
        
        // Divider events
        this.elements.divider.addEventListener('mousedown', (e) => this.startResize(e));
        document.addEventListener('mousemove', (e) => this.handleResize(e));
        document.addEventListener('mouseup', () => this.stopResize());
        
        // Toolbar shortcuts
        this.elements.shortcuts.forEach(btn => {
            btn.addEventListener('click', () => this.handleShortcut(btn));
        });
        
        // Prevent context menu on divider
        this.elements.divider.addEventListener('contextmenu', (e) => e.preventDefault());
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
            this.elements.preview.classList.add('fade-in');
            setTimeout(() => this.elements.preview.classList.remove('fade-in'), 300);
        })
        .catch(error => {
            console.error('Error updating preview:', error);
            this.showError('Failed to update preview');
        });
    }

    updateStats() {
        const text = this.elements.editor.value;
        
        // Character count
        this.state.characterCount = text.length;
        this.elements.charCount.textContent = `${this.state.characterCount} characters`;
        
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
        
        // Visual feedback
        button.classList.add('active');
        setTimeout(() => button.classList.remove('active'), 200);
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
            const htmlContent = this.generateHtmlExport(data.html);
            this.downloadFile(htmlContent, 'markdown-export.html', 'text/html');
            this.showSuccess('HTML exported successfully!');
        })
        .catch(error => {
            console.error('Error exporting:', error);
            this.showError('Failed to export HTML');
        });
    }

    generateHtmlExport(content) {
        const theme = this.state.currentTheme;
        const themeStyles = theme === 'dark' ? `
            body { background: #0f172a; color: #f8fafc; }
            pre { background: #1e293b; }
            code { background: #334155; color: #60a5fa; }
        ` : '';
        
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Markdown Export</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/${theme === 'dark' ? 'github-dark' : 'github'}.min.css">
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            max-width: 800px; margin: 0 auto; padding: 2rem; line-height: 1.6; 
        }
        h1 { font-size: 2em; font-weight: bold; margin-bottom: 0.5em; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5em; }
        h2 { font-size: 1.5em; font-weight: bold; margin-bottom: 0.5em; margin-top: 1.5em; }
        h3 { font-size: 1.2em; font-weight: bold; margin-bottom: 0.5em; margin-top: 1em; }
        p { margin-bottom: 1em; }
        code { background: #f4f4f4; padding: 0.2em 0.4em; border-radius: 3px; font-family: monospace; }
        pre { background: #f4f4f4; padding: 1em; border-radius: 5px; overflow-x: auto; }
        pre code { background: none; padding: 0; }
        blockquote { border-left: 4px solid #3b82f6; margin: 0; padding-left: 1em; color: #666; background: #f8fafc; padding: 1em; }
        table { border-collapse: collapse; width: 100%; margin-bottom: 1em; }
        th, td { border: 1px solid #ddd; padding: 0.5em; text-align: left; }
        th { background-color: #f4f4f4; }
        img { max-width: 100%; height: auto; }
        ${themeStyles}
    </style>
</head>
<body>
    ${content}
</body>
</html>`;
    }

    saveToFile() {
        const content = this.elements.editor.value;
        this.downloadFile(content, 'document.md', 'text/markdown');
        this.showSuccess('Document saved successfully!');
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
            this.showSuccess('File loaded successfully!');
        };
        reader.onerror = () => {
            this.showError('Failed to load file');
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
            this.showInfo('Editor cleared');
        }
    }

    toggleTheme() {
        this.state.currentTheme = this.state.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        this.saveTheme();
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.state.currentTheme);
        const icon = this.elements.themeToggle.querySelector('i');
        icon.className = this.state.currentTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    }

    saveTheme() {
        localStorage.setItem('markdown-editor-theme', this.state.currentTheme);
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('markdown-editor-theme') || 'light';
        this.state.currentTheme = savedTheme;
        this.applyTheme();
    }

    // ===== RESIZE FUNCTIONALITY =====
    startResize(e) {
        this.state.isResizing = true;
        this.state.startX = e.pageX;
        const editorPane = document.querySelector('.editor-pane');
        this.state.startLeftWidth = editorPane.offsetWidth;
        
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
        e.preventDefault();
    }

    handleResize(e) {
        if (!this.state.isResizing) return;
        
        const deltaX = e.pageX - this.state.startX;
        const newLeftWidth = this.state.startLeftWidth + deltaX;
        const containerWidth = document.querySelector('.editor-container').offsetWidth;
        
        if (newLeftWidth > 200 && newLeftWidth < containerWidth - 200) {
            const editorPane = document.querySelector('.editor-pane');
            const previewPane = document.querySelector('.preview-pane');
            
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
            if (document.activeElement !== this.elements.editor && e.key !== 's' && e.key !== 'e') {
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
        });
    }

    // ===== AUTO SAVE =====
    autoSave() {
        clearTimeout(this.autoSaveTimer);
        this.autoSaveTimer = setTimeout(() => {
            localStorage.setItem('markdown-editor-content', this.elements.editor.value);
        }, 1000);
    }

    loadAutoSave() {
        const savedContent = localStorage.getItem('markdown-editor-content');
        if (savedContent && this.elements.editor.value === '') {
            this.elements.editor.value = savedContent;
            this.handleEditorInput();
        }
    }

    // ===== NOTIFICATIONS =====
    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showInfo(message) {
        this.showNotification(message, 'info');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '500',
            zIndex: '1000',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease'
        });
        
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            info: '#3b82f6'
        };
        
        notification.style.background = colors[type] || colors.info;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    window.markdownEditor = new MarkdownEditor();
    
    // Load auto-saved content
    setTimeout(() => {
        window.markdownEditor.loadAutoSave();
    }, 100);
});

// ===== EXPORT FOR GLOBAL ACCESS =====
window.MarkdownEditor = MarkdownEditor;

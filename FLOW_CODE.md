# Luồng Code (Flow) Của Markdown Editor

## Tổng Quan
Tài liệu này mô tả chi tiết luồng hoạt động của ứng dụng Markdown Editor từ khi người dùng truy cập đến khi xem trước markdown.

---

## 1. Khởi Động Server

### Step 1: Cấu Hình Express & Các Middleware

```
server.js khởi động
    ↓
Require các thư viện (express, marked, highlight.js, ...)
    ↓
Tạo ứng dụng Express: const app = express()
    ↓
Cấu hình Marked options:
  - highlight function cho code blocks
  - breaks: true (xuống dòng)
  - gfm: true (GitHub Flavored Markdown)
    ↓
Đặt view engine là EJS
    ↓
Cấu hình thư mục views: views/
    ↓
Cấu hình static files: public/
    ↓
Middleware Express.json() (xử lý JSON)
```

### Step 2: Lắng Nghe Port

```
app.listen(PORT, callback)
    ↓
In ra console thông tin server
    ↓
Server sẵn sàng nhận request
```

---

## 2. User Truy Cập Trang Web

### Luồng: User → Browser → Server

```
Người dùng nhập URL vào trình duyệt
    ↓
Browser gửi GET request
    ↓

┌─────────────────────────────────────────┐
│ Server Route Handler                    │
│ app.get('/', (req, res) => {...})       │
└─────────────────────────────────────────┘
    ↓
res.render('material', {
  title: 'Material Markdown Editor',
  initialContent: '# Welcome to Material Editor\n...'
})
    ↓
EJS Template Engine xử lý:
  - views/material.ejs
  - Thay thế {{ title }} bằng 'Material Markdown Editor'
  - Thay thế {{ initialContent }} bằng nội dung welcome
  - Nhúng link CSS từ public/css/material.css
  - Nhúng script từ public/js/material.js
    ↓
Server trả về HTML hoàn chỉnh
    ↓
Browser nhận HTML, parse CSS, chạy JavaScript
    ↓
Giao diện Markdown Editor hiển thị trên màn hình
```

### Route Khác: /classic

```
Tương tự như '/' nhưng:
  - Render views/index.ejs (thay vì material.ejs)
  - CSS: public/css/styles.css
  - JavaScript: public/js/app.js
```

---

## 3. Người Dùng Nhập Markdown

### Step 1: Typing in Editor

```
Người dùng mở giao diện Markdown Editor
    ↓
Thấy textarea hoặc contenteditable element
    ↓
Nhập markdown text:
  # Hello World
  **Bold text**
  ```javascript
  console.log('Hello');
  ```
```

### Step 2: Live Preview Trigger

```
Client-side JavaScript (app.js hoặc material.js) lắng nghe:
  - oninput event (khi người dùng gõ)
  - onchange event
  - setTimeout (sau mỗi 500ms chẳng hạn)
    ↓
Lấy nội dung markdown từ textarea/contenteditable
    ↓
Gửi AJAX POST request tới server:
  POST /preview
  Content-Type: application/json
  
  Body: {
    markdown: "# Hello World\n**Bold text**\n..."
  }
```

---

## 4. Server Xử Lý Markdown

### Luồng: /preview Route Handler

```
┌──────────────────────────────────────────────┐
│ app.post('/preview', (req, res) => {         │
└──────────────────────────────────────────────┘
    ↓
Lấy markdown từ request:
  const { markdown } = req.body
    ↓
┌──────────────────────────────────────────────┐
│ Xử lý Marked + Highlight.js                  │
│ const html = marked(markdown)                │
└──────────────────────────────────────────────┘
    ↓
Marked parsing:
  1. Phân tích cấu trúc markdown
  2. Tìm code blocks (```)
  3. Gọi highlight function (từ highlight.js)
  4. Tô vẽ code bằng HTML spans + CSS classes
  5. Chuyển # thành <h1>, ** thành <strong>, etc.
    ↓
Kết quả: HTML string
  <h1>Hello World</h1>
  <p><strong>Bold text</strong></p>
  <pre><code class="language-javascript hljs">
    <span class="hljs-built_in">console</span>.log(...)
  </code></pre>
    ↓
Trả về JSON response:
  res.json({ 
    html: "<h1>Hello World</h1>..." 
  })
```

---

## 5. Client Nhận & Hiển Thị Preview

### Step 1: AJAX Response Handler

```
Client JavaScript nhận response JSON
    ↓
Lấy HTML từ response:
  const { html } = response
    ↓
Tìm preview container (div#preview hoặc tương tự)
    ↓
Cập nhật nội dung:
  document.getElementById('preview').innerHTML = html
    ↓
Browser render HTML
    ↓
Giao diện preview cập nhật real-time
```

### Step 2: CSS Styling & Syntax Highlighting

```
Browser áp dụng CSS từ:
  - public/css/styles.css (Classic)
  - public/css/material.css (Material)
    ↓
Highlight.js CSS classes được áp dụng:
  - .hljs-keyword (từ khóa)
  - .hljs-function (hàm)
  - .hljs-string (chuỗi)
  - .hljs-number (số)
    ↓
Code được tô vẽ với màu sắc khác nhau
    ↓
Preview giao diện đẹp, dễ đọc
```

---

## 6. Biểu Đồ Tổng Quan (Flow Diagram)

```
┌─────────────────────────────────────────────────────────────┐
│                     MARKDOWN EDITOR FLOW                     │
└─────────────────────────────────────────────────────────────┘

         BROWSER (Client-Side)
    ┌──────────────────────────────┐
    │  1. User Access / or /classic│
    │  GET / → server.js           │
    └──────────────┬───────────────┘
                   │
         SERVER (Express.js)
    ┌──────────────▼───────────────┐
    │  2. app.get(route)            │
    │     - res.render(ejs template)│
    │     - Load CSS + JS from /public
    └──────────────┬───────────────┘
                   │
    ┌──────────────▼───────────────┐
    │  3. Browser parse HTML/CSS/JS │
    │     Editor + Preview ready    │
    └──────────────┬───────────────┘
                   │
         BROWSER (Client-Side)
    ┌──────────────▼───────────────┐
    │  4. User type markdown        │
    │     app.js/material.js        │
    │     Listen to input events    │
    └──────────────┬───────────────┘
                   │
    ┌──────────────▼───────────────┐
    │  5. AJAX POST /preview        │
    │     Send: {markdown: "..."}   │
    └──────────────┬───────────────┘
                   │
         SERVER (Express.js)
    ┌──────────────▼───────────────┐
    │  6. app.post('/preview')      │
    │     marked(markdown)          │
    │     + hljs.highlight()        │
    └──────────────┬───────────────┘
                   │
    ┌──────────────▼───────────────┐
    │  7. Return JSON:              │
    │     {html: "<h1>...</h1>"}    │
    └──────────────┬───────────────┘
                   │
         BROWSER (Client-Side)
    ┌──────────────▼───────────────┐
    │  8. Receive JSON response     │
    │     innerHTML = html          │
    │     Apply CSS styling         │
    └──────────────┬───────────────┘
                   │
    ┌──────────────▼───────────────┐
    │  9. Display Preview           │
    │     Color syntax highlighting │
    │     Formatted markdown output │
    └──────────────────────────────┘
```

---

## 7. Chi Tiết Từng File

### server.js
- **Khởi tạo Express**
- **Cấu hình Marked & Highlight.js**
- **Định nghĩa routes** (/, /classic, /preview)
- **Xử lý POST request** markdown

### views/material.ejs
- **HTML skeleton** cho Material Design
- **Textarea/Editor** để nhập markdown
- **Preview container** để hiển thị HTML
- **Link CSS & JS**

### views/index.ejs
- **HTML skeleton** cho Classic theme
- **Tương tự material.ejs** nhưng giao diện khác

### public/js/app.js
- **addEventListener** cho input
- **Fetch API** để gửi POST request
- **Update preview** với kết quả

### public/js/material.js
- **Tương tự app.js**
- **Thêm logic riêng** cho Material Design
- **Animations, interactions**

### public/css/styles.css
- **CSS cho Classic theme**
- **Editor layout, typography**
- **Color scheme**

### public/css/material.css
- **CSS cho Material Design theme**
- **Material Design principles**
- **Shadows, ripple effects**

---

## 8. Luồng Request-Response

### GET / (Material)
```
Request:  GET / HTTP/1.1
Response: 200 OK + HTML (from views/material.ejs)
          + CSS (from public/css/material.css)
          + JS (from public/js/material.js)
```

### GET /classic
```
Request:  GET /classic HTTP/1.1
Response: 200 OK + HTML (from views/index.ejs)
          + CSS (from public/css/styles.css)
          + JS (from public/js/app.js)
```

### POST /preview
```
Request:  POST /preview HTTP/1.1
          Content-Type: application/json
          
          {
            "markdown": "# Hello\n**Bold**"
          }

Response: 200 OK
          Content-Type: application/json
          
          {
            "html": "<h1>Hello</h1><p><strong>Bold</strong></p>"
          }
```

---

## 9. Thứ Tự Thực Thi Trong Trình Duyệt

1. **Parse HTML** từ EJS template
2. **Load CSS** từ public/css/
3. **Load JavaScript** từ public/js/
4. **DOM Ready** - Document loaded
5. **Attach event listeners** - app.js/material.js chạy
6. **User interactions** - typing, clicking
7. **AJAX requests** - gửi markdown
8. **Update DOM** - hiển thị preview

---

## 10. Ví Dụ Cụ Thể

### Input Markdown
```markdown
# My Title
This is **bold** and this is *italic*.

## Code Example
```javascript
function hello() {
  console.log("Hello, World!");
}
```
```

### Output HTML (sau khi xử lý)
```html
<h1>My Title</h1>
<p>This is <strong>bold</strong> and this is <em>italic</em>.</p>
<h2>Code Example</h2>
<pre><code class="language-javascript hljs">
<span class="hljs-keyword">function</span> 
<span class="hljs-title function_">hello</span>() {
  <span class="hljs-variable language_">console</span>.<span class="hljs-title function_">log</span>(<span class="hljs-string">"Hello, World!"</span>);
}
</code></pre>
```

### CSS Applied
- Highlight.js tô vẽ: keyword (màu), function (màu), string (màu), etc.
- Material.css: styling container, padding, fonts
- Result: Beautiful colored syntax highlighting

---

**Tác giả**: Julian Kmut (github.com/anhdeface)  
**Liên hệ**: @udp0xxbot (Telegram)  
**Ngày cập nhật**: 2025-12-29

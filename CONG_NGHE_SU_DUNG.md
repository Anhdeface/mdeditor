# Công Nghệ Và Thư Viện Được Sử Dụng

## Tổng Quan
Dự án **Markdown Editor** là một ứng dụng web cho phép người dùng viết, chỉnh sửa và xem trước markdown với giao diện hiện đại. Dự án sử dụng các công nghệ phổ biến trong phát triển web hiện đại.

---

## 1. Backend - Máy Chủ Node.js

### Express.js (v5.2.1)
- **Mục đích**: Framework web phía server
- **Chức năng chính**:
  - Quản lý các route HTTP (GET, POST)
  - Xử lý request từ client
  - Cấu hình middleware (JSON parsing, static files)
  - Lắng nghe và phục vụ ứng dụng trên port 3000

### Node.js CommonJS
- **Loại module**: Sử dụng `commonjs` thay vì ES modules
- **Cách require**: `require()` để import các thư viện
- **Lý do**: Tương thích, đơn giản, phổ biến

---

## 2. Xử Lý Markdown

### Marked (v17.0.1)
- **Mục đích**: Chuyển đổi markdown thành HTML
- **Chức năng chính**:
  - Parse markdown text thành HTML
  - Hỗ trợ GitHub Flavored Markdown (GFM)
  - Tích hợp với highlight.js để tô vẽ cú pháp code
  - Hỗ thích line breaks (`breaks: true`)

### Highlight.js (v11.11.1)
- **Mục đích**: Tô vẽ cú pháp code (syntax highlighting)
- **Chức năng chính**:
  - Nhận diện ngôn ngữ lập trình tự động
  - Tô vẽ các khối code với màu sắc
  - Tương thích với nhiều ngôn ngữ
  - Tích hợp sâu với Marked để xử lý code blocks

---

## 3. Giao Diện & Template

### EJS (v3.1.10)
- **Mục đích**: Template engine cho phía server
- **Chức năng chính**:
  - Render HTML pages động từ server
  - Truyền dữ liệu từ server sang views (ví dụ: initialContent, title)
  - Hỗ trợ JavaScript logic trong template
  - Tạo các trang web tương tác

---

## 4. Cấu Trúc Thư Mục & Tài Nguyên

### Public Folder
```
public/
  ├── css/
  │   ├── material.css        (Giao diện Material Design)
  │   └── styles.css          (Giao diện Classic)
  ├── js/
  │   ├── app.js              (Logic client-side chính)
  │   └── material.js         (Logic riêng cho Material Design)
  └── images/
```

### Views Folder (EJS Templates)
```
views/
  ├── index.ejs               (Giao diện Classic)
  ├── material.ejs            (Giao diện Material Design)
  └── docs.ejs                (Trang tài liệu - khả năng lưu trữ)
```

---

## 5. Quy Trình Công Nghệ

```
Client Browser
      ↓
Gửi request → Express Server
      ↓
EJS render HTML + CSS + JS
      ↓
Client nhận giao diện
      ↓
JavaScript (app.js, material.js)
      ↓
Gửi markdown qua POST /preview
      ↓
Server xử lý (Marked + Highlight.js)
      ↓
Trả JSON với HTML đã render
      ↓
Client hiển thị preview
```

---

## 6. Tính Năng Chính

| Tính Năng | Công Nghệ | Mô Tả |
|-----------|-----------|-------|
| Live Preview | Marked, Highlight.js | Xem trước markdown real-time |
| Syntax Highlighting | Highlight.js | Tô vẽ code blocks |
| Giao Diện Material | CSS + EJS | Design hiện đại, chuyên nghiệp |
| Giao Diện Classic | CSS + EJS | Giao diện đơn giản, truyền thống |
| Xử Lý Markdown | Marked | Chuyển markdown → HTML |

---

## 7. Port & Cấu Hình

- **Port mặc định**: 3000
- **Port tùy chỉnh**: Từ biến môi trường `process.env.PORT`
- **View Engine**: EJS
- **Static Files**: Từ thư mục `/public`

---

## 8. Yêu Cầu & Cài Đặt

```bash
# Cài đặt dependencies
npm install

# Chạy server
npm start (hoặc node server.js)

# Truy cập ứng dụng
http://localhost:3000
```

---

**Phiên bản**: 1.0.0  
**Tác giả**: Julian Kmut (github.com/anhdeface)  
**Liên hệ**: @udp0xxbot (Telegram)

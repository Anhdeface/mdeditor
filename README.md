# 📝 Markdown Editor

Một ứng dụng web đơn giản và hiệu quả để viết, chỉnh sửa và xem trước markdown với giao diện thân thiện.

## ✨ Tính Năng

- 🎨 **Hai giao diện**: Material Design và Classic
- 👁️ **Live Preview**: Xem trước markdown real-time
- 🎯 **Syntax Highlighting**: Tô vẽ code với nhiều ngôn ngữ
- 📱 **Responsive**: Hoạt động trên nhiều thiết bị
- ⚡ **Nhanh chóng**: Xử lý markdown tức thì

## 🚀 Cài Đặt & Chạy

### Yêu Cầu
- Node.js (v14 trở lên)
- npm hoặc yarn

### Các Bước

1. **Clone hoặc tải dự án**
```bash
cd MarkDownEditor
```

2. **Cài đặt dependencies**
```bash
npm install
```

3. **Chạy server**
```bash
node server.js
```

4. **Truy cập ứng dụng**
```
http://localhost:3000
```

## 🎯 Cách Sử Dụng

### Giao Diện Material (Mặc định)
Truy cập: `http://localhost:3000`
- Nhập markdown ở phía trái
- Xem preview ở phía phải
- Hỗ trợ đầy đủ cú pháp markdown

### Giao Diện Classic
Truy cập: `http://localhost:3000/classic`
- Giao diện đơn giản, tối giản
- Cùng tính năng live preview

## 💻 Công Nghệ

| Công Nghệ | Phiên Bản | Mục Đích |
|-----------|----------|---------|
| Express | 5.2.1 | Framework web server |
| EJS | 3.1.10 | Template engine |
| Marked | 17.0.1 | Chuyển đổi markdown → HTML |
| Highlight.js | 11.11.1 | Tô vẽ cú pháp code |
| Node.js | Latest | Runtime JavaScript |

## 📦 Cấu Trúc Dự Án

```
MarkDownEditor/
├── server.js              # Server chính (Express)
├── package.json           # Dependencies & config
├── public/                # Tài nguyên tĩnh
│   ├── css/
│   │   ├── material.css
│   │   └── styles.css
│   ├── js/
│   │   ├── app.js
│   │   └── material.js
│   └── images/
├── views/                 # EJS templates
│   ├── material.ejs
│   ├── index.ejs
│   └── docs.ejs
└── README.md             # File này
```

## 📚 Tài Liệu Chi Tiết

- [Công Nghệ Sử Dụng](CONG_NGHE_SU_DUNG.md) - Giải thích thư viện & framework
- [Flow Code](FLOW_CODE.md) - Mô tả chi tiết luồng hoạt động

## 🔧 Cấu Hình

### Port mặc định
```
http://localhost:3000
```

### Thay đổi port (tuỳ chọn)
```bash
PORT=8080 node server.js
```

## 📝 Ghi Chú

- Preview cập nhật tự động khi bạn gõ
- Hỗ trợ GitHub Flavored Markdown (GFM)
- Code blocks hỗ trợ syntax highlighting
- Line breaks được xử lý chính xác

## 👨‍💻 Tác Giả

**Julian Kmut** (QuocAnh)
- GitHub: [github.com/anhdeface](https://github.com/anhdeface)
- Telegram: [@udp0xxbot](https://t.me/udp0xxbot)

## 📄 Giấy Phép

MIT License - Xem file package.json

## 🎉 Thành Công!

Nếu bạn thấy ứng dụng hoạt động tốt, hãy tận hưởng viết markdown với Markdown Editor!

---

**Phiên bản**: 1.0.23  
**Cập nhật**: 2025-12-29  
**Trạng thái**: Active Development

# Game Work Hub

Web quản lý công việc DA: tổng quan game theo team, link & note theo team, ghi chú, công việc theo kỳ báo cáo.
Web chỉ gồm file tĩnh nên chạy được trên GitHub Pages. Dữ liệu được **mã hoá** bằng tên đăng nhập + mật khẩu, nên người không có mật khẩu không đọc được nội dung, kể cả khi mở mã nguồn.

## Cấu trúc

| File | Vai trò |
| --- | --- |
| `index.html`, `css/`, `js/` | Giao diện và logic (công khai, không chứa dữ liệu) |
| `data.enc.json` | Dữ liệu đã mã hoá (được phép đưa lên GitHub) |
| `tools/tao-du-lieu.html` | Công cụ chạy trên máy để tạo / đổi mật khẩu cho `data.enc.json` |
| `seed.plain.json` | Dữ liệu gốc **chưa mã hoá**. Đã nằm trong `.gitignore`, **không đưa lên GitHub** |

## Hai giao diện

- **Bản thường:** `index.html` (thanh bên trái, giao diện gọn).
- **Bản pixel:** `pixel/index.html` (phong cách "Cream pixel": thanh tab có nhân vật pixel đi theo tab, bong bóng thoại, thẻ sticker). Hình nhân vật nằm trong `pixel/assets/`.

Hai bản dùng chung `data.enc.json`, cùng tài khoản và cùng dữ liệu đã chỉnh sửa trong trình duyệt, nên đổi qua lại thoải mái. Khi đưa lên GitHub Pages, bản pixel ở địa chỉ `.../pixel/`.

## Tạo dữ liệu lần đầu

1. Mở `tools/tao-du-lieu.html` bằng trình duyệt (bấm đúp vào file).
2. Mục 1: chọn `seed.plain.json`, đặt tên đăng nhập và mật khẩu, bấm tạo.
3. Đặt file `data.enc.json` vừa tải về vào thư mục gốc (cạnh `index.html`).

## Chạy thử trên máy

```bash
python -m http.server 8000
```

Mở `http://localhost:8000`.

## Lưu ý

- Chỉnh sửa trên web được lưu (đã mã hoá) trong **trình duyệt của người sửa**. Muốn cả team thấy bản mới: bấm **Tải bản sao lưu** ở thanh bên, rồi thay `data.enc.json` trong thư mục web bằng file vừa tải và đưa lên GitHub.
- Quên mật khẩu thì không khôi phục được dữ liệu trong `data.enc.json`; hãy tạo lại từ `seed.plain.json`.
- GitHub Pages là trang công khai: ai có link cũng mở được trang đăng nhập, nhưng không đọc được dữ liệu nếu không có mật khẩu.

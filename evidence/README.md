# Kết quả kiểm chứng GoNarra V7

- **22/22 domain checks:** xem `core-tests.txt` — tính lịch, travel/return, time budget, must-visits, locks, supported/unknown Adjust.
- **63/63 app state checks:** xem `app-state-tests.json` — Node VM chạy action handlers/render code với DOM/Audio stub, gồm Start, AI context, audio và tài khoản demo. Không phải browser/native.
- **34/34 asset/static checks:** xem `assets-and-contrast.json` — WAV/nguồn/local dependencies, production logo SVG/Brand Assets và 9 cặp màu rắn. Không phải chứng nhận WCAG toàn app.
- **Browser refresh:** xem `browser-refresh.json` và `screenshots/refresh/` cho các luồng UI mới đã quan sát. Phạm vi cụ thể và phần chưa kiểm được tách riêng.
- **Baseline trước refresh:** `browser-review.json` ghi 24 observations đạt, 2 inconclusive. Phép tắt server/reload/nghe WAV thuộc baseline đó; chưa lặp lại trên refresh này. Không cộng baseline thành pass cho UI mới.

Screenshots là ảnh browser review, khung layout logic 402×874; không phải ảnh chụp iPhone thật, cũng không đồng nghĩa export tất cả màn ở physical3×.

Các kiểm tra dùng catalogue, script và fixture hiện tại. Chưa có usability/field study, live LLM/RAG, native GPS/SDK directions, xác minh venue hoặc quyền xuất bản media.

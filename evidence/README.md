# Kết quả kiểm chứng GoNarra V7

- **22/22 domain checks:** xem `core-tests.txt` — tính lịch, travel/return, time budget, must-visits, locks, supported/unknown Adjust.
- **28/28 app state checks:** xem `app-state-tests.json` — Node VM chạy action handlers/render code với DOM stub, không phải browser/native.
- **32/32 asset/static checks:** xem `assets-and-contrast.json` — WAV/nguồn/local dependencies và 9 cặp màu rắn. Không phải chứng nhận WCAG toàn app.
- **24 browser observations đạt; 2 inconclusive:** xem `browser-review.json`. Dùng CUA, thao tác qua UI, đọc DOM và screenshot. Hai phép quan sát không kết luận vì màn hình đổi giữa các bước; không được tính pass.
- **Offline thật ở mức browser/origin:** tải gói 12.0 MB, tắt máy chủ HTTP local, reload app từ service worker và phát cathedral WAV tới 34.9 giây. Không chỉ bật fault switch. Không thử native background audio, browser eviction hoặc OS airplane mode.

Screenshots là ảnh browser review, khung layout logic 402×874; không phải ảnh chụp iPhone thật, cũng không đồng nghĩa export tất cả màn ở physical3×.

Các kiểm tra dùng catalogue, script và fixture hiện tại. Chưa có usability/field study, live LLM/RAG, native GPS/SDK directions, xác minh venue hoặc quyền xuất bản media.

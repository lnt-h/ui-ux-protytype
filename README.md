# GoNarra V7 — iPhone 17 interactive prototype

Bản prototype local cho tour Đà Nẵng: tour sẵn, workflow AI tạo/chỉnh lịch, câu chuyện audio và hỏi theo địa điểm. Visual update theo hướng map sáng + thẻ nổi navy/ice; frame review iPhone 17 **402 × 874**, kích thước xuất mục tiêu @3× **1206 × 2622** (ảnh hiện tại là browser review captures).

Repo này là bản standalone để mở trực tiếp trong VS Code. Toàn bộ prototype, tài liệu sản phẩm/UX, ảnh review, test và bằng chứng kiểm tra đều nằm trong cùng một thư mục; không phụ thuộc thư mục GoNarra V6 ban đầu.

## Mở và chạy

- Mở `index.html` để đọc handbook và xem prototype nhúng.
- Mở `prototype/index.html` trực tiếp để thử welcome, tạo/sửa tour, nghe audio và lưu tiến độ.
- Để kiểm tra download/offline: chạy `python3 scripts/serve.py`, rồi mở **http://127.0.0.1:8767/prototype/**. Trên macOS có thể chạy `Open-GoNarra.command`.
- Offline cần localhost/HTTPS và browser hỗ trợ Service Worker/Cache API. Mở bằng `file://` không hỗ trợ tính năng này.
- Không cài thư viện, không cần API key. Python chỉ phục vụ file local; prototype không có backend.

## Nên thử theo thứ tự

1. Welcome 2 bước → Home. Chọn pin, mở/thu discovery panel, tìm một địa điểm, nghe story.
2. Create with AI → thời gian/phương tiện → sở thích/must-visits → proposal → review → save.
3. Customize: đổi duration, move, remove/Undo, add, lock/unlock; Cancel giữ tour cũ.
4. Adjust with AI: dùng 4 shortcut được hỗ trợ; review trước/sau rồi Apply hoặc Keep current.
5. Start → bản đồ/chỉ dẫn mẫu → Steps → I'm here → Listen/Transcript/Info/Ask → +15 preview → Finish stop.
6. Pause/resume, skip, end early hoặc finish tour; kiểm đếm và tải lại trang.
7. Tour saved → Download → đợi Ready offline → tắt mạng rồi reload/nghe nội dung đã tải. Thử fault switch trong Settings để xem recovery.

Review panel ở desktop và Settings trên điện thoại có thể tạo tình huống. **Scenario controls thay dữ liệu V7 local**, có thể tạo review tour hoặc pause tour đang active. Dùng profile test riêng nếu cần. Reset chỉ xóa khóa/cache GoNarra V7; không sửa V6.

## Phần chạy thật và phần mô phỏng

| Chạy trong browser | Mô phỏng/chưa tích hợp |
|---|---|
| Player đọc 5 WAV có nội dung thực, seek/speed, transcript | AI model/RAG, route provider và turn-by-turn SDK |
| Tính lịch từ cùng một travel fixture; preview/apply/cancel | Travel/arrival estimates, GPS location và step navigation |
| Nhiều trip, một active, progress/favorites/answers lưu local | Native background GPS, audio interruptions và cloud sync |
| Cache asset thật qua localhost/HTTPS; manifest theo revision | Venue closures, live hours/fees/accessibility và real-time rerouting |

**Ask** khớp các câu mẫu theo đúng POI và hiện nguồn; ngoài phạm vi có fallback. **AI Generate/Adjust** dùng quy tắc local. Story audio là giọng hệ thống Samantha tạo trước từ script gốc, chưa có review phát âm/English/thực địa hoặc quyền xuất bản thương mại. Ảnh kế thừa V6 chưa có provenance đầy đủ. Map là vector minh họa, không là bản đồ đường phố đã được tính route.

## Tài liệu

- `Product-Handbook.html`: toàn bộ 8 tài liệu, có mục lục.
- `docs/01-Product-UX.md`: phạm vi và inventory.
- `docs/02-Flow-State-Contract.md`: dữ liệu, trạng thái và thay đổi.
- `docs/03-AI-Offline-Contract.md`: AI, audio, cache và tích hợp tương lai.
- `docs/04-Validation-Handoff.md`: acceptance và roadmap.
- `docs/05-Content-Sources.md`: nguồn nội dung và asset.
- `docs/06-Mobile-UX-Research.md`: nghiên cứu guideline chính thức, giả thuyết cần UAT.
- `docs/07-Design-System.md`: frame, màu, typography, components và motion.
- `docs/08-Review-Results.md`: kết quả kiểm tra và giới hạn còn lại.
- `evidence/`: kết quả thật đã chạy; không đồng nghĩa native/field/UAT.

## Kiểm tra lại

Chạy `node scripts/test-core.cjs`, `node scripts/test-app.cjs` và `node scripts/check-assets.cjs`. Các bài kiểm tra này dùng Node sẵn có, không có dependency install. Browser observations được ghi riêng trong `evidence/browser-review.json` khi đã thực hiện, không tự suy từ Node tests.

Dữ liệu lưu trên browser/origin hiện tại. Mở bằng file và localhost tạo kho lưu khác nhau. Browser có thể xóa cache; JSON export giữ itinerary/nguồn/text, không chứa audio bytes và không tự import vào ứng dụng.

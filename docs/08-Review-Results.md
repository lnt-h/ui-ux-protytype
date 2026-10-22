# Kết quả review và bàn giao

## Bản giao diện đã cập nhật

- Welcome hai bước: collage nền sáng → ảnh biển tràn nền, navy overlay, có Skip/Back và nhớ đã hoàn thành.
- Home map minh họa + photo pins; selected card đồng bộ; discovery drawer có compact/medium/full và nút đổi mức. Explore giữ view danh sách.
- Tour preview và Route Overview dùng chung stop/order; nguồn lịch/tổng/return time là `core.js`.
- Focused leg có sample instruction, Steps, mini-player, itinerary và arrival thủ công. Audio và progress không bị gộp thành cùng một trạng thái.
- Arrival đã rút gọn ảnh và player để Play thấy trong viewport đầu; Listen/Transcript/Info/Ask và +15 preview theo đúng POI.
- Màu navy/ice/slate, controls đồng bộ, reduced-motion fallback và khung review iPhone17 402×874 logic.

## Kiểm tra đã thực hiện

| Loại | Kết quả | Ý nghĩa |
|---|---|---|
| Domain/core | 22/22 | Tính lịch, must-visits, giới hạn, protected prefix, unknown intent |
| App state | 28/28 | Action/mutation guards trong NodeVM, không là browser test |
| Asset/static | 32/32 | WAV có nội dung, reference hợp lệ,9solidcolorpairs đạt4.5:1 |
| Browser UI | 24 observed-pass,2inconclusive | Flow thực đã quan sát; không coi2caseinconclusive làpass |
| Origin unreachable | Shell reload + audio played to end | Sau cache đủ, tắt serverlocal rồi mởlại và nghe cathedralWAV |

Xem [evidence README](../evidence/README.md), [browser review](../evidence/browser-review.json), [app state](../evidence/app-state-tests.json) và [asset/contrast](../evidence/assets-and-contrast.json). Dữ liệu/ảnh trong `screens/` minh họa đúng một trạng thái review, không tự tạo kết quả UAT.

## Giới hạn còn lại

Chưa chạy trên iPhone vật lý/VoiceOver/background interruptions; chưa live LLM/RAG, map SDK/GPS hoặc street-route calculation. Hai assertions browser được ghi inconclusive do view đổi giữa các bước. Phần lớn các cặp màu rất dễ đọc, nhưng hai cặp được đo chỉ vừa vượt4.5:1; ảnh/gradient và accessibility toàn app cần audit tiếp.

Mục tiêu export physical3× là1206×2622; bundle hiện chứa browser review captures ở kích thước browser, không giả thành ảnh3×. Dùng prototype để inspect flow và docs để triển khai; field-test/nghiên cứu khách cần thực hiện riêng theo handoff.

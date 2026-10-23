# GoNarra V7 — iPhone 17 interactive prototype

Bản prototype tour Đà Nẵng: tour sẵn, workflow AI tạo/chỉnh lịch, câu chuyện audio và hỏi theo địa điểm. Cập nhật **trực tiếp trên V7** theo hướng map sáng + white sheet, collage du lịch và thẻ navy/ice; frame review iPhone 17 **402 × 874**, kích thước xuất mục tiêu @3× **1206 × 2622**. Ảnh review là browser captures, không physical iPhone hoặc bản export 3×.

Repo này là bản standalone để mở trực tiếp trong VS Code. Toàn bộ prototype, tài liệu sản phẩm/UX, ảnh review, test và bằng chứng kiểm tra đều nằm trong cùng một thư mục; không phụ thuộc thư mục GoNarra V6 ban đầu.

## Mở và chạy

- Mở `index.html` để đọc handbook và xem prototype nhúng.
- Mở `prototype/index.html` trực tiếp để thử welcome, tạo/sửa tour, nghe audio và lưu tiến độ.
- Mở `brand-assets.html` để xem, copy SVG trực tiếp sang Figma hoặc tải từng phiên bản logo.
- Để kiểm tra download/offline: chạy `python3 scripts/serve.py`, rồi mở **http://127.0.0.1:8767/prototype/**. Trên macOS có thể chạy `Open-GoNarra.command`.
- Offline cần localhost/HTTPS và browser hỗ trợ Service Worker/Cache API. Mở bằng `file://` không hỗ trợ tính năng này.
- Không cài thư viện, không cần API key. Python chỉ phục vụ file local; prototype không có backend.

## Nên thử theo thứ tự

1. Welcome 3 bước **Hear stories → Discover → AI plan**; Skip/Back được, Home → Profile → Settings có Replay.
2. Home: compact có search + Continue hoặc Plan my day 2h/4h/6h; medium thêm card; full thêm tours. Search chuyển sang Explore cùng query.
3. Detail: hero ảnh lớn, About/Story; Listen ngay tại trang, transcript và Ask sheet đúng POI. Hiện mỗi POI có một ảnh phù hợp; chưa dựng gallery nhiều góc giả. Nghe riêng không đổi trip.
4. Bốn tab **Home · Explore · AI Guide · Trips**. AI Guide có context Da Nang/POI/current trip; các shortcut lập ngày/chỉnh lịch vẫn là local demo và preview trước Apply.
5. Tour detail/proposal → Start trực tiếp, không màn Ready bắt buộc. Save for later là phụ; bản chưa bắt đầu phù hợp được tái dùng. Có active trip khác cần chọn Pause current & Start hoặc Keep current.
6. Edit: đổi duration, move, remove/Undo, add, lock/unlock; Cancel giữ tour cũ. Adjust dùng shortcut hỗ trợ; chỉ upcoming chưa khóa được đổi khi active.
7. Focused leg → sample Steps/mini-player/Ask sheet → I'm here → Story/About/+15 preview → Finish stop. Pause/resume/skip/end dùng progress thật lưu local.
8. Tour card/detail → Download một chạm → ready theo cache/manifest → tắt mạng rồi reload/nghe nội dung đã tải. Download tùy chọn, không chặn Start; quản lý tại Trips → Downloads.
9. Home profile icon → Profile/Settings; thử Guest, Login/Sign up, Forgot/Reset và Sign out. Đây là **UI demo local**, không server authentication/email thật; password không lưu/truyền. Sign out giữ trips/downloads. Playback speed và reduced motion trong Settings tác động player/CSS thật và nhớ local.

Một Audio object phát từng bài; Play POI khác pause/nhớ vị trí bài cũ. Return to current stop và Back không tự phát lại hoặc advance trip. Không có weather mẫu trên Home; chưa thêm provider thời tiết/GPS hoặc routes trong lần chỉnh UI này.

Chế độ người dùng mặc định có Profile và Settings riêng. Thêm **`?review=1`** vào URL prototype để hiện Review panel và fault/scenario tools; các công cụ không bày cạnh tác vụ du lịch thông thường. **Scenario controls thay dữ liệu V7 local**, có thể tạo review tour hoặc pause tour đang active. Dùng browser profile test riêng nếu cần. Reset chỉ xóa khóa/cache GoNarra V7; không sửa V6. Reset khác Sign out: Sign out chỉ đóng demo session.

## Phần chạy thật và phần mô phỏng

| Chạy trong browser | Mô phỏng/chưa tích hợp |
|---|---|
| Player đọc 5 WAV có nội dung thực, seek/speed, transcript | AI model/RAG, route provider và turn-by-turn SDK |
| Tính lịch từ cùng một travel fixture; preview/apply/cancel | Travel/arrival estimates, GPS location và step navigation |
| Nhiều trip, một active, progress/favorites/answers lưu local | Native background GPS, audio interruptions và cloud sync |
| Cache asset thật qua localhost/HTTPS; manifest theo revision | Venue closures, live hours/fees/accessibility và real-time rerouting |
| Profile/session/form validation local; speed/reduced-motion preferences thật | Server authentication, xác minh email, email recovery, social OAuth hoặc bảo mật dữ liệu theo account |

**Ask** khớp câu mẫu theo đúng POI và hiện nguồn; city/trip scope chỉ có demo actions/giới hạn được công bố, ngoài phạm vi fallback. **AI Generate/Adjust** dùng quy tắc local; tab/sheet mới không là LLM. Story audio là giọng hệ thống Samantha tạo trước từ script gốc, chưa có review phát âm/English/thực địa hoặc quyền xuất bản thương mại. Ảnh kế thừa V6 chưa có provenance đầy đủ. Map là vector minh họa; Google Maps là lựa chọn phụ cho directions thật, không SDK chỉ đường bên trong app.

## Tài liệu

- `Product-Handbook.html`: toàn bộ 8 tài liệu, có mục lục.
- `brand-assets.html`: thư viện logo có Copy SVG/Download; dùng chung source với logo trong prototype.
- `prototype/assets/brand/`: master SVG, production variants, token JSON và hướng dẫn import Figma.
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

Chạy `node scripts/test-core.cjs`, `node scripts/test-app.cjs` và `node scripts/check-assets.cjs`. Các bài kiểm tra dùng Node sẵn có, không dependency install. Run hiện tại ghi **22/22 core, 63/63 app-state trong Node VM và 34/34 asset/static checks**; app hash/timestamp trong evidence. Hai kiểm tra asset mới xác nhận bộ SVG production không có live text, dùng chung hình học g và trang Brand Assets hoạt động hoàn toàn local. VM không kiểm rendering/media/service worker thật, static contrast chỉ 9 cặp được chỉ định.

Browser refresh ở localhost:8770 đã quan sát welcome, Home/Detail, quick-plan 4h → proposal 3 stops → Start trực tiếp, focused Ask, WAV Play/Pause/progress, optional demo login/Profile, Settings và one-tap download/đúng package. Xem `evidence/browser-refresh.json`; `evidence/browser-review.json` là baseline trước refresh. Bản refresh này chưa lặp lại test ngắt mạng/tắt server rồi reload; không nhận Ready badge là bằng chứng offline playback mới.

Sau khi sửa tài liệu, chạy `node scripts/build-handbook.mjs` để tạo lại `index.html` và `Product-Handbook.html`; script dùng bộ Markdown renderer được bundle trong repo, không cần cài thêm package.

Kết quả/screenshot baseline trước đợt UI refresh không tự là pass cho source mới. Đọc timestamp/hash, current run và giới hạn tại `docs/08-Review-Results.md`; các acceptance case mới nằm trong tài liệu 04.

Dữ liệu lưu trên browser/origin hiện tại. Mở bằng file và localhost tạo kho lưu khác nhau. Browser có thể xóa cache; JSON export giữ itinerary/nguồn/text, không chứa audio bytes và không tự import vào ứng dụng.

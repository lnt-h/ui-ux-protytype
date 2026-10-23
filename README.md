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
2. Home: compact summary có lối mở; medium/full cùng feed cuộn **inline city weather, Continue/Plan my day 2h/4h/6h, hai stories/hai collection previews, tour strip và một Essentials entry**. Full chỉ tăng vùng đọc, không gate tours. Search/collection sang Explore cùng query/filter; forecast đầy đủ ở màn chi tiết.
3. Explore dùng danh sách ngang một cột để tên, mô tả và metadata đọc được trên 402 px. Detail có hero lớn, About/Story, hai highlights khác ý và practical facts chính; chỉ một hàng hành động cố định **Listen · Add to plan**, không lặp CTA trong nội dung. Rhythm/tips/etiquette/source nằm trong disclosure. Một ảnh phù hợp/POI, chưa gallery giả. Nghe riêng không đổi trip.
4. Bốn tab **Home · Explore · AI Guide · Trips**; ba root tab sau không lặp tên trong top bar. AI Guide có context Da Nang/POI/current trip, quick-plan/câu hỏi ngắn, nút giọng nói và capability disclosure. Voice là flow demo một lượt: xem sample → listening state → sửa transcript → Send; không truy cập microphone hay giả đã ghi âm. Mọi thay đổi lịch vẫn preview trước Apply.
5. Tour detail/proposal → Start trực tiếp, không màn Ready bắt buộc. Save for later là phụ; bản chưa bắt đầu phù hợp được tái dùng. Có active trip khác cần chọn Pause current & Start hoặc Keep current.
6. Edit: đổi duration, move, remove/Undo, add, lock/unlock; Cancel giữ tour cũ. Adjust dùng shortcut hỗ trợ; chỉ upcoming chưa khóa được đổi khi active.
7. Focused leg → sample Steps/mini-player/Ask sheet → I'm here → Story/About/+15 preview → Finish stop. Pause/resume/skip/end dùng progress thật lưu local.
8. Tour card/detail → Download một chạm → ready theo cache/manifest → tắt mạng rồi reload/nghe nội dung đã tải. Download tùy chọn, không chặn Start; quản lý tại Trips → Downloads.
9. Home profile icon → Profile/Settings; thử Guest, Login/Sign up, Forgot/Reset và Sign out. Đây là **UI demo local**, không server authentication/email thật; password không lưu/truyền. Sign out giữ trips/downloads. Playback speed và reduced motion trong Settings tác động player/CSS thật và nhớ local.

Một Audio object phát từng bài; Play POI khác pause/nhớ vị trí bài cũ. Return to current stop và Back không tự phát lại hoặc advance trip. Weather dùng **Open-Meteo** cho city Đà Nẵng cố định, nhãn model/source/time/units và loading/stale/unavailable; không nhiệt độ mẫu hoặc GPS near-you. Cần mạng cho forecast mới; lỗi weather không chặn các tác vụ local và không tự đổi itinerary. Map/routes vẫn là fixture.

Chế độ người dùng mặc định có Profile và Settings riêng. Thêm **`?review=1`** vào URL prototype để hiện Review panel và fault/scenario tools; các công cụ không bày cạnh tác vụ du lịch thông thường. **Scenario controls thay dữ liệu V7 local**, có thể tạo review tour hoặc pause tour đang active. Dùng browser profile test riêng nếu cần. Reset chỉ xóa khóa/cache GoNarra V7; không sửa V6. Reset khác Sign out: Sign out chỉ đóng demo session.

## Phần chạy thật và phần mô phỏng

| Chạy trong browser | Mô phỏng/chưa tích hợp |
|---|---|
| Player đọc 5 WAV có nội dung thực, seek/speed, transcript | AI model/RAG, route provider và turn-by-turn SDK |
| Tính lịch từ cùng một travel fixture; preview/apply/cancel | Travel/arrival estimates, GPS location và step navigation |
| Nhiều trip, một active, progress/favorites/answers lưu local | Native background GPS, audio interruptions và cloud sync |
| Cache asset thật qua localhost/HTTPS; manifest theo revision | Venue closures, live hours/fees/accessibility và real-time rerouting |
| Forecast qua Open-Meteo cho Đà Nẵng, source/time/state độc lập | Weather sensor tại POI, marine assessment hoặc tự viết lại itinerary theo thời tiết |
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

Chạy `node scripts/test-core.cjs`, `node scripts/test-app.cjs`, `node scripts/test-weather.cjs` và `node scripts/check-assets.cjs`. Các bài kiểm tra dùng Node sẵn có, không dependency install. Snapshot hiện tại ghi **22/22 core, 78/78 app-state, 21/21 weather và 34/34 asset/static checks**; app hash/timestamp nằm trong evidence. App-state có voice review/cancel-context, hierarchy Home/Explore/Detail và empty Trips; VM không kiểm microphone thật, rendering/media/service worker hoặc thiết bị vật lý. Static contrast chỉ đo 9 cặp được chỉ định. Acceptance mới V59–V79 trong docs 04.

Browser refresh ở localhost:8770 đã quan sát welcome, Home/Detail, quick-plan 4h → proposal 3 stops → Start trực tiếp, focused Ask, WAV Play/Pause/progress, optional demo login/Profile, Settings và one-tap download/đúng package. Xem `evidence/browser-refresh.json`; `evidence/browser-review.json` là baseline trước refresh. Bản refresh này chưa lặp lại test ngắt mạng/tắt server rồi reload; không nhận Ready badge là bằng chứng offline playback mới.

Weather API của [Open-Meteo](https://open-meteo.com/en/docs) là dịch vụ bên ngoài, khác assets local. Free API dành cho noncommercial theo [terms](https://open-meteo.com/en/terms); trước dùng thương mại cần kiểm điều kiện/gói phù hợp và giữ attribution. Không có key provider trong bundle. Cách đặt nội dung/source và hướng phát triển được cập nhật trong docs 01/03/04/05/06/07.

Sau khi sửa tài liệu, chạy `node scripts/build-handbook.mjs` để tạo lại `index.html` và `Product-Handbook.html`; script dùng bộ Markdown renderer được bundle trong repo, không cần cài thêm package.

Kết quả/screenshot baseline trước đợt UI refresh không tự là pass cho source mới. Đọc timestamp/hash, current run và giới hạn tại `docs/08-Review-Results.md`; các acceptance case mới nằm trong tài liệu 04.

Dữ liệu lưu trên browser/origin hiện tại. Mở bằng file và localhost tạo kho lưu khác nhau. Browser có thể xóa cache; JSON export giữ itinerary/nguồn/text, không chứa audio bytes và không tự import vào ứng dụng.

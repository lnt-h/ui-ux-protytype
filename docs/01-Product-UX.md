# GoNarra V7 — Sản phẩm và UX

Cập nhật ngày **23/10/2026**, trực tiếp trên source V7 hiện có. Tài liệu mô tả thiết kế được chốt và các hành vi cần kiểm; chưa phải bằng chứng sản phẩm native, kết quả UAT hay xác nhận thị trường. UI dùng English; bộ tài liệu dùng tiếng Việt. Kết quả thực nằm trong `evidence/` và được giải thích ở [04-Validation-Handoff.md](04-Validation-Handoff.md). Các kết quả trước đợt chỉnh UI không tự áp dụng cho source mới. Cơ sở UX ở [06-Mobile-UX-Research.md](06-Mobile-UX-Research.md), tokens/layout ở [07-Design-System.md](07-Design-System.md).

## 1. Sản phẩm được chốt

**GoNarra cho khách chọn một tour chuẩn bị sẵn hoặc tạo một ngày khám phá theo sở thích, tự chỉnh lịch và nghe/hỏi về địa điểm qua cùng một thư viện câu chuyện.** Không bắt tạo tour để mở một story.

Ba cửa vào dùng chung dữ liệu và player:

| Hoàn cảnh | Cửa vào | Kết quả đầu tiên |
|---|---|---|
| Muốn một hành trình biên tập sẵn | Home/Explore → Tour detail → Start tour | Tạo hoặc dùng lại bản cá nhân thích hợp, bắt đầu trực tiếp; Save for later là lựa chọn phụ |
| Đã có lựa chọn hoặc cần một ngày riêng | Home Plan my day 2h/4h/6h hoặc AI Guide → quick form → proposal | Một lịch demo có thể chỉnh, khóa điểm cần giữ, xem trước rồi nhận |
| Đã ở điểm hoặc chỉ muốn nghe | Search/Explore/Story library → Place/story | Nghe, đọc transcript hoặc Ask theo POI; không trip/GPS/account |

Phân khúc làm việc: khách tự khám phá Đà Nẵng, đọc/nghe English, muốn vừa chủ động lịch vừa hiểu nơi ghé. Đây là giả thuyết; chưa có interview để xác nhận nhu cầu, tần suất hay willingness-to-pay. V7 hỗ trợ một ngày; phương tiện chính là **car/taxi passenger**. Walking là fixture so sánh nếu có dữ liệu tương ứng, không phải chứng minh route đi bộ đã khảo sát.

## 2. Thay đổi có chủ đích từ V6

| V6 | Quyết định V7 |
|---|---|
| Mô phỏng hướng dẫn từng chặng trong app, ba nhóm phương tiện/driver | Tập trung car passenger; trong app có map/chặng và các bước chỉ dẫn mẫu. Google Maps là hỗ trợ tùy chọn khi cần chỉ đường thật. Không GPS/SDK turn-by-turn hoặc driver experience thật trong đợt chỉnh UI này. |
| AI generate/refine là local rules; Ask chưa được thể hiện | Có tab AI Guide riêng và Ask theo ngữ cảnh dạng sheet. Cùng engine demo bounded/local rules và câu mẫu có nguồn, fallback ngoài phạm vi; chưa LLM/RAG live. |
| Download chỉ đổi trạng thái mẫu, không có file | Tải asset thật bằng Cache API/service worker khi phục vụ qua localhost/HTTPS; manifest kiểm trạng thái. Gói có gì được ghi đúng theo asset thực. |
| My Trips/localStorage | Giữ guest/local-first, nhiều trip và tối đa một active. Bổ sung Profile/login UI tự chọn dạng local demo; chưa server authentication, account ownership hoặc cloud sync. |
| Màn và dữ liệu tình huống lỗi | Giữ các case riêng trong Review panel; tách rõ khỏi lỗi provider/GPS thật. |

Các giới hạn này là thay đổi scope để có lát cắt chạy được, không phải kết luận V6 đã triển khai sai. Không áp lại gate đăng nhập hay car-only PRD DaNavi cũ như một yêu cầu ngầm.

## 3. Inventory màn hình và supporting surfaces

ID dưới đây phục vụ trace review, không yêu cầu một URL/file riêng cho mỗi màn. Màn dài có thể cuộn; sheet không được tính thành một app độc lập.

| ID | Màn/cụm | Hành động chính | Trạng thái cần có |
|---|---|---|---|
| UX01 | Home map + persistent drawer | Search chuyển Explore; Continue hoặc Plan my day | Compact: search + Continue/Plan; medium thêm card; full thêm tour; không live location/thời tiết mẫu |
| UX02 | Explore list/search results | Tìm và mở tour/POI/story | Một search state dùng chung; nhận nguyên query từ Home; kết quả/rỗng/filter |
| UX03 | Ready-made tours | Chọn template | Nội dung mẫu, mode/ngôn ngữ/phạm vi rõ |
| UX04 | Tour detail | Start tour; Save for later; một Edit | Template bất biến; tái dùng bản chưa bắt đầu phù hợp; download badge/one-tap; nudge không chặn Start |
| UX05 | Place detail | Listen tại chỗ; About/Story; Add to trip; Ask sheet | Hero ảnh; source; transcript; gallery ngang khi có nhiều ảnh phù hợp; current trip và player context độc lập |
| UX06 | Story browsing trong Explore | Chọn story/POI trực tiếp | Không thêm CTA thư viện trùng; không đổi trip đang đi; transcript fallback |
| UX07 | Quick planning form | Chọn 2h/4h/6h; start/time/mode, mở thêm khi cần | Required fields và defaults rõ; inputs giữ; không ép chat thay form |
| UX08 | Preferences | Interests/pace/must-keep | Không tìm thấy candidate; không hứa facts thiếu |
| UX09 | Generating | Chờ demo/hủy/thử lại | Local demo label; lỗi giả lập; không kết quả rỗng giả thành thành công |
| UX10 | Proposal/Itinerary | Xem schedule/reasons inline; một Edit; Start/Save | Valid/conflict/unknown; preview trước Apply; chưa overwrite bản cũ |
| UX11 | Manual editor | Add/remove/move/duration/undo | Draft, cancel phục hồi, vượt time budget |
| UX12 | Adjust request | Nhập mục tiêu; chọn locked places | Chỉ hỗ trợ demo requests công bố; giữ current/past |
| UX13 | Review changes | Apply/Keep current | Trước/sau, travel/visit/total; stale revision |
| UX14 | Start action, không màn Ready bắt buộc | Start hoặc xử lý active trip khác | Pause & Start / Keep; không tự End; không tạo trip trùng khi nhấn lại; download tùy chọn |
| UX15 | Focused active leg map | Steps; mini-player; I'm here; Ask sheet | Ẩn tab bar chỉ ở focused mode; ba chỉ dẫn mẫu; Maps phụ; pause/skip/end qua options |
| UX16 | Arrival | Story/player/transcript; About; Ask sheet | Arrival khác Finish stop; +15 preview; missing audio |
| UX17 | My Trips | Mở/sửa/start/resume trip | Planned/paused/active/completed/ended early; local persistence |
| UX18 | Downloads | Tải/refresh/remove theo trip; export JSON | Actual bytes/items; failed/update-needed/unavailable; JSON không chứa audio bytes |
| UX19 | Recap | Xem visited/skipped/not visited | Completed khác ended early; đếm xác nhận thực |
| UX20 | Profile từ header Home → Settings riêng & Review panel | Profile/guest; playback speed; reduced motion; Replay; downloads/about/privacy | Không thêm bottom tab; settings có tác dụng thật trong browser; fault tools chỉ review mode |
| UX21 | Welcome ba bước | Hear stories → Discover → AI plan; Next/Back/Skip/Start | Bỏ qua được; lưu onboarded; replay từ Settings; không auth/GPS/download gate |
| UX22 | Route overview | Chọn pin/list/card; xem route | Map toàn vùng nội dung + drawer ba mức; selection không ghi arrival |
| UX23 | AI Guide tab và contextual Ask sheet | Hỏi trong scope Da Nang / POI / Current trip; tạo/chỉnh lịch | Chung engine; context chip rõ; sheet giữ origin; mở rộng/back không mất Detail/leg; không trả lời tự do giả |
| UX24 | Profile | Xem/sửa tên và profile local; mở Settings; login/signup hoặc Sign out | Guest dùng app đầy đủ; không giả cloud/account security; signout giữ trips/downloads |
| UX25 | Login / Sign up | Nhập form có validation và mở demo session | UI demo local; không xác thực danh tính qua server; password không lưu/truyền; không social OAuth giả |
| UX26 | Forgot / Reset password | Xem flow phục hồi và nhập lại form demo | Không email được gửi, không reset tài khoản thật/token server; trạng thái nói đúng local demo |

Supporting surfaces: nguồn, duration picker, chọn/add place, move menu, xác nhận remove/undo, +15/time warning, Steps, pause/end/start-another confirmation, change preview và lỗi tải. Mỗi tác vụ phải có đường hủy/quay lại giữ input thích hợp. Home drawer là persistent/nonmodal, không phải modal dialog; sheet xác nhận/Steps là tương tác riêng, không chồng nhiều modal.

## 4. Nguyên tắc tương tác

- Giữ navy/ice/slate; bổ sung collage ảnh du lịch, hero/gallery và map phía sau white sheet theo ảnh reference người dùng gửi. Welcome kể lợi ích nghe chuyện trước, khám phá kế tiếp, AI lập ngày cuối cùng. Không đưa pricing/rating/flight/hotel từ ảnh reference vào app khi chưa có dữ liệu/chức năng tương ứng. Ảnh kế thừa là minh họa, không xác nhận media rights hay entrance.
- Frame review có **402×874 vùng logical bên trong**; device border/chrome là phần trình bày prototype. Export ở 3× là 1206×2622 cho vùng nội dung; không chụp outer frame rồi gọi cùng kích thước. Native cần safe-area thật; browser hẹp responsive và không dùng khung desktop.
- Search, named start anchors và Play không cần location. V7 hiện **không gọi geolocation** và không geocode địa chỉ nhập tự do. Location screen/review states chỉ giải thích manual path; không là permission/GPS thật. Nếu thêm browser/native API sau này chỉ xin đúng action, không lúc mở app.
- Một chuyến có nhiều stop nhưng chỉ một current stop. Mở story/Ask của POI khác không đổi stop hiện tại.
- Chủ động Play POI khác tạm dừng bài cũ, nhớ vị trí từng bài rồi phát bài mới bằng cùng một Audio object. Chip Return to current stop chỉ đưa về đúng current context, không tự phát lại bài cũ; audio kết thúc không auto-resume bài khác hoặc advance trip.
- Manual edits dùng thao tác trực tiếp; không gọi AI chỉ để kéo thứ tự, đổi duration hay +15. AI xử lý mục tiêu bằng đề xuất, không tự ghi dữ liệu.
- Proposal, editor draft và +15 đều phải thể hiện cái gì chưa áp dụng. Cancel/Keep current không làm mất bản đã chấp nhận.
- Arrival xác nhận đã tới; **Finish stop** mới chuyển sang stop kế. Skip không được tính là visited. Pause không complete và không tự thay vị trí.
- Tour template gốc bất biến. Start/customize tạo hoặc mở bản cá nhân. Start tái dùng bản cùng template/ngày chưa bắt đầu và chưa chỉnh; không ghi đè bản đã customize. Tên mặc định có ngày; nhấn Start lặp không sinh thêm bản. Nếu có trip active khác, chỉ Pause & Start sau xác nhận; Keep giữ nguyên cả hai.
- Không ép mọi người nghe theo thứ tự hay tạo trip. Library/Detail luôn có direct playback/transcript; quay về vẫn giữ trip đang đi.
- Home map dùng pin ảnh và selected card, drawer đổi ba mức bằng grip/tap và pointer drag. Compact chỉ giữ search + Continue hoặc Plan my day; medium thêm selected/place cards; full mới có curated tours. Explore list giữ lối vào dễ đọc. Không bày cả catalog ở Home; map + ba mức vẫn là giả thuyết cần UAT.
- Tabs chính **Home · Explore · AI Guide · Trips**. AI thay Plan, không thêm tab thứ năm; lịch/edit ở Trips. Profile là icon trên header Home, Settings là màn riêng bên trong Profile; có Replay welcome và Downloads. Ask từ Detail/leg mở sheet trên màn gốc. Focused leg có Ask current-stop dù tab bar ẩn; Steps chỉ đổi demo instruction selection, không tự chuyển progress.
- Chưa có weather provider: ẩn weather khỏi Home mặc định. Nếu thêm sample trong Review sau này, nhãn Sample phải ở ngay giá trị. Không hiển thị nhiệt độ/forecast giả như dữ liệu hiện tại hoặc tự đổi itinerary theo thời tiết.

Review panel/fault tools chỉ hiện khi thêm `?review=1` vào URL. Profile → Settings mặc định ưu tiên playback speed, reduced motion, replay welcome, downloads và thông tin/privacy của build; không lẫn fault toggles với tùy chỉnh du lịch. Review không phải sandbox bất biến: một số case tạo review trip, thay request form hoặc pause trip active và lưu trong khóa V7. Dùng browser profile test riêng hoặc export plan trước seed. Reset demo data khác Sign out: Reset chỉ dữ liệu/cache V7; Sign out chỉ đóng demo session, không xóa trips/downloads.

## 5. Nội dung và audio

POI, story, template và personal trip là các đối tượng riêng. Hai loại tour tham chiếu cùng story library; thay route/thời lượng không sinh lại bài kể. Bữa trưa generic là một break, không phải nhà hàng đã xác minh.

Script/nguồn và tình trạng từng asset được mô tả ở [05-Content-Sources.md](05-Content-Sources.md). Bundle hiện có năm WAV sample cho Cathedral/Museum/Beach/Mountain/Bridge, giọng hệ thống Samantha tạo trước; lunch không có audio. Đây là **synthetic audio sample**, không live AI voice, human narration, production-reviewed hay public/commercial rights đã xác minh. Player đọc file thực; thiếu/lỗi file thì dùng transcript và trạng thái lỗi, không chạy progress giả. File tồn tại không thay evidence đã nghe/đã kiểm player.

Download theo **personal trip**: tour card/detail có badge trạng thái và action một chạm; action template chỉ chuẩn bị/tái dùng bản cá nhân rồi tải, không Start. Start luôn có gợi ý tải nhẹ, không một Ready/download gate. Quản lý dung lượng/xóa/cập nhật gói nằm ở Trips → Downloads. Chưa có package riêng cho một POI ở Place detail. Story đã cache qua trip nghe được độc lập; playback online không cần trip. Download gồm audio/ảnh/tour info theo manifest, không street map hoặc AI mới.

Asset hiện có chỉ một ảnh phù hợp mỗi POI. Detail dùng hero lớn thật; hướng gallery ngang được giữ cho khi có thêm media đủ nguồn, không nhân một ảnh thành nhiều thumbnail hoặc lấy ảnh venue khác làm góc chụp. Giá/rating/thời tiết trong ảnh reference không trở thành dữ liệu sản phẩm.

GPS không biết khách đang nhìn gì. Story mô tả đối tượng bằng tên/ảnh hoặc điều kiện rõ như “nếu bạn đang nhìn mặt tiền trong ảnh”. Không khẳng định “bên trái/trước mặt bạn” từ GPS đơn lẻ. Giờ/giá/entrance chưa xác minh giữ nhãn chưa xác minh; không gán từ nguồn cũ thành facts live.

## 6. Ranh giới prototype

V7 cần chứng minh browser interactions, tính lịch thống nhất, bảo toàn draft/proposal/current stop, local persistence, media playback khi có file, caching có kiểm tra và Ask demo theo nguồn. Chưa chứng minh native GPS/background/audio focus, turn-by-turn SDK, live LLM, đồng bộ cloud, booking/payment, quyền ảnh hay tính khả thi thực địa của fixture.

Profile/auth screens là **local UI demo**, chưa tạo tài khoản thật, chưa thanh toán hoặc gọi model trong background. Password chỉ dùng kiểm form trong phiên, không persist/truyền đi; không gọi một demo session là đăng nhập được bảo mật, không giả gửi email hoặc social OAuth. Guest luôn có thể khám phá/nghe/lập/lưu tour. Mọi số thời gian/tổng stop/tình trạng itinerary lấy từ state/core; không hardcode tổng khác trong screenshot/docs. Một màn đẹp hoặc JSON test không chứng minh PMF hay khả năng xuất bản app store.

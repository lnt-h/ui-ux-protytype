# GoNarra V7 — Sản phẩm và UX

Ngày: 22/10/2026. Tài liệu mô tả baseline V7 để xây và review prototype; chưa phải bằng chứng sản phẩm native, kết quả UAT hay xác nhận thị trường. UI dùng English; bộ tài liệu dùng tiếng Việt. Các kết quả kiểm tra thực tế, khi có, nằm trong `evidence/` và được giải thích ở [04-Validation-Handoff.md](04-Validation-Handoff.md). Cơ sở UX ở [06-Mobile-UX-Research.md](06-Mobile-UX-Research.md), tokens/layout ở [07-Design-System.md](07-Design-System.md).

## 1. Sản phẩm được chốt

**GoNarra cho khách chọn một tour chuẩn bị sẵn hoặc tạo một ngày khám phá theo sở thích, tự chỉnh lịch và nghe/hỏi về địa điểm qua cùng một thư viện câu chuyện.** Không bắt tạo tour để mở một story.

Ba cửa vào dùng chung dữ liệu và player:

| Hoàn cảnh | Cửa vào | Kết quả đầu tiên |
|---|---|---|
| Muốn một hành trình biên tập sẵn | Home → Ready-made tours → Tour detail → Use this tour | Có bản cá nhân lưu local; từ Ready có Start/Download |
| Đã có lựa chọn hoặc cần một ngày riêng | Create with AI → requirements/preferences → proposal | Một lịch demo có thể chỉnh, khóa điểm cần giữ, xem trước rồi nhận |
| Đã ở điểm hoặc chỉ muốn nghe | Search/Explore/Story library → Place/story | Nghe, đọc transcript hoặc Ask theo POI; không trip/GPS/account |

Phân khúc làm việc: khách tự khám phá Đà Nẵng, đọc/nghe English, muốn vừa chủ động lịch vừa hiểu nơi ghé. Đây là giả thuyết; chưa có interview để xác nhận nhu cầu, tần suất hay willingness-to-pay. V7 hỗ trợ một ngày; phương tiện chính là **car/taxi passenger**. Walking là fixture so sánh nếu có dữ liệu tương ứng, không phải chứng minh route đi bộ đã khảo sát.

## 2. Thay đổi có chủ đích từ V6

| V6 | Quyết định V7 |
|---|---|
| Mô phỏng hướng dẫn từng chặng trong app, ba nhóm phương tiện/driver | Tập trung car passenger; trong app là itinerary/leg summary, **Open Google Maps** để chỉ đường. Không SDK turn-by-turn hay driver experience trong milestone này. |
| AI generate/refine là local rules; Ask chưa được thể hiện | Giữ generate/refine demo và thêm contextual Ask demo có câu hỗ trợ/nguồn, fallback ngoài phạm vi. Không nói đã tích hợp LLM/RAG live. |
| Download chỉ đổi trạng thái mẫu, không có file | Tải asset thật bằng Cache API/service worker khi phục vụ qua localhost/HTTPS; manifest kiểm trạng thái. Gói có gì được ghi đúng theo asset thực. |
| My Trips/localStorage | Giữ guest/local-first, mở rộng nhiều trip, một trip active tại một thời điểm; không thêm login/auth/cloud sync. |
| Màn và dữ liệu tình huống lỗi | Giữ các case riêng trong Review panel; tách rõ khỏi lỗi provider/GPS thật. |

Các giới hạn này là thay đổi scope để có lát cắt chạy được, không phải kết luận V6 đã triển khai sai. Không áp lại gate đăng nhập hay car-only PRD DaNavi cũ như một yêu cầu ngầm.

## 3. Inventory màn hình và supporting surfaces

ID dưới đây phục vụ trace review, không yêu cầu một URL/file riêng cho mỗi màn. Màn dài có thể cuộn; sheet không được tính thành một app độc lập.

| ID | Màn/cụm | Hành động chính | Trạng thái cần có |
|---|---|---|---|
| UX01 | Home map + persistent drawer | Search; pin/card; create; ready-made; resume | Compact/medium/full; selected place; không live location |
| UX02 | Explore list/search results | Mở tour/POI/story | List riêng với Home map; kết quả/rỗng/filter |
| UX03 | Ready-made tours | Chọn template | Nội dung mẫu, mode/ngôn ngữ/phạm vi rõ |
| UX04 | Tour detail | Use this tour; Customize copy | Template bất biến; tạo bản saved trước Start/Download |
| UX05 | Place detail | Play/Read/Ask; Add to trip | Không có audio; sources; không trip/GPS |
| UX06 | Story library | Chọn story/POI trực tiếp | Không đổi trip đang đi; transcript fallback |
| UX07 | Requirements | Start/end/time window/mode | Required fields; input được giữ |
| UX08 | Preferences | Interests/pace/must-keep | Không tìm thấy candidate; không hứa facts thiếu |
| UX09 | Generating | Chờ demo/hủy/thử lại | Local demo label; lỗi giả lập; không kết quả rỗng giả thành thành công |
| UX10 | Proposal/Itinerary | Xem schedule/reasons; nhận/lưu | Valid/conflict/unknown; chưa overwrite bản cũ |
| UX11 | Manual editor | Add/remove/move/duration/undo | Draft, cancel phục hồi, vượt time budget |
| UX12 | Adjust request | Nhập mục tiêu; chọn locked places | Chỉ hỗ trợ demo requests công bố; giữ current/past |
| UX13 | Review changes | Apply/Keep current | Trước/sau, travel/visit/total; stale revision |
| UX14 | Trip ready | Xác nhận trip/start; download tùy chọn | Save khác download; passenger; location tùy chọn |
| UX15 | Focused active leg map | Demo step/Steps; mini-player; Maps; I'm here | Ba chỉ dẫn mẫu chọn thủ công, không live guidance; pause/skip/end qua options |
| UX16 | Arrival | Listen / Transcript / Info / Ask | Arrival khác Finish stop; +15 preview; missing audio |
| UX17 | My Trips | Mở/sửa/start/resume trip | Planned/paused/active/completed/ended early; local persistence |
| UX18 | Downloads | Tải/refresh/remove theo trip; export JSON | Actual bytes/items; failed/update-needed/unavailable; JSON không chứa audio bytes |
| UX19 | Recap | Xem visited/skipped/not visited | Completed khác ended early; đếm xác nhận thực |
| UX20 | Preferences & Review panel | Xem giới hạn; inject/seed case | Controls ghi rõ simulated; seed có thể lưu review trip và pause trip đang active |
| UX21 | Welcome hai bước | Next/Back/Skip/Let's explore | Bỏ qua được; lưu onboarded; không auth/GPS/download gate |
| UX22 | Route overview | Chọn pin/list/card; xem route | Map toàn vùng nội dung + drawer ba mức; selection không ghi arrival |

Supporting surfaces: nguồn, duration picker, chọn/add place, move menu, xác nhận remove/undo, +15/time warning, Steps, pause/end/start-another confirmation, change preview và lỗi tải. Mỗi tác vụ phải có đường hủy/quay lại giữ input thích hợp. Home drawer là persistent/nonmodal, không phải modal dialog; sheet xác nhận/Steps là tương tác riêng, không chồng nhiều modal.

## 4. Nguyên tắc tương tác

- Giữ navy/blue và ảnh V6 làm tham chiếu, áp một visual system chung. Welcome bước một là collage nhẹ, bước hai là ảnh/gradient navy với chữ sáng. Ảnh kế thừa là minh họa, không xác nhận media rights hay entrance.
- Frame review có **402×874 vùng logical bên trong**; device border/chrome là phần trình bày prototype. Export ở 3× là 1206×2622 cho vùng nội dung; không chụp outer frame rồi gọi cùng kích thước. Native cần safe-area thật; browser hẹp responsive và không dùng khung desktop.
- Search, named start anchors và Play không cần location. V7 hiện **không gọi geolocation** và không geocode địa chỉ nhập tự do. Location screen/review states chỉ giải thích manual path; không là permission/GPS thật. Nếu thêm browser/native API sau này chỉ xin đúng action, không lúc mở app.
- Một chuyến có nhiều stop nhưng chỉ một current stop. Mở story/Ask của POI khác không đổi stop hiện tại.
- Manual edits dùng thao tác trực tiếp; không gọi AI chỉ để kéo thứ tự, đổi duration hay +15. AI xử lý mục tiêu bằng đề xuất, không tự ghi dữ liệu.
- Proposal, editor draft và +15 đều phải thể hiện cái gì chưa áp dụng. Cancel/Keep current không làm mất bản đã chấp nhận.
- Arrival xác nhận đã tới; **Finish stop** mới chuyển sang stop kế. Skip không được tính là visited. Pause không complete và không tự thay vị trí.
- Tour template gốc bất biến. Start/customize từ template tạo hoặc mở bản cá nhân, không sửa template cho những lần khác.
- Không ép mọi người nghe theo thứ tự hay tạo trip. Library/Detail luôn có direct playback/transcript; quay về vẫn giữ trip đang đi.
- Home map dùng pin ảnh và selected card, drawer đổi ba mức bằng grip/tap và pointer drag. Explore list giữ lối vào dễ đọc; map + ba mức là quyết định thiết kế chưa có UAT, không một xu hướng đã chứng minh tốt hơn list.
- Tabs chính **Home · Explore · Plan · Trips**. Ask nằm trong context POI; không thêm tab AI thứ năm. Focused leg bỏ cạnh tranh nhiều CTA; Steps chỉ đổi demo instruction selection, không tự chuyển trip progress.

Review panel là công cụ tạo tình huống, không phải sandbox bất biến: một số case tạo review trip, thay request form hoặc pause một trip đang active và lưu trong khóa V7. Nên dùng profile test riêng hoặc export plan trước khi seed. Reset chỉ tác động dữ liệu/cache V7; không đụng prototype V6 hay browser data khác.

## 5. Nội dung và audio

POI, story, template và personal trip là các đối tượng riêng. Hai loại tour tham chiếu cùng story library; thay route/thời lượng không sinh lại bài kể. Bữa trưa generic là một break, không phải nhà hàng đã xác minh.

Script/nguồn và tình trạng từng asset được mô tả ở [05-Content-Sources.md](05-Content-Sources.md). Bundle hiện có năm WAV sample cho Cathedral/Museum/Beach/Mountain/Bridge, giọng hệ thống Samantha tạo trước; lunch không có audio. Đây là **synthetic audio sample**, không live AI voice, human narration, production-reviewed hay public/commercial rights đã xác minh. Player đọc file thực; thiếu/lỗi file thì dùng transcript và trạng thái lỗi, không chạy progress giả. File tồn tại không thay evidence đã nghe/đã kiểm player.

Download hiện theo **saved trip**: tạo/lưu personal copy rồi mở Ready → Download. Chưa có nút tạo package riêng cho một POI tại Detail. Story đã được cache qua một trip có thể nghe độc lập trong library; direct story playback online không cần trip. Đây là phạm vi implementation hiện tại, không hứa mọi story đang browse đã tải sẵn.

GPS không biết khách đang nhìn gì. Story mô tả đối tượng bằng tên/ảnh hoặc điều kiện rõ như “nếu bạn đang nhìn mặt tiền trong ảnh”. Không khẳng định “bên trái/trước mặt bạn” từ GPS đơn lẻ. Giờ/giá/entrance chưa xác minh giữ nhãn chưa xác minh; không gán từ nguồn cũ thành facts live.

## 6. Ranh giới prototype

V7 cần chứng minh browser interactions, tính lịch thống nhất, bảo toàn draft/proposal/current stop, local persistence, media playback khi có file, caching có kiểm tra và Ask demo theo nguồn. Chưa chứng minh native GPS/background/audio focus, turn-by-turn SDK, live LLM, đồng bộ cloud, booking/payment, quyền ảnh hay tính khả thi thực địa của fixture.

Không có tài khoản, không thanh toán, không gọi model trong background. Mọi số thời gian/tổng stop/tình trạng itinerary lấy từ state/core; không hardcode một tổng khác trong screenshot hoặc tài liệu. Không dùng một màn đẹp hay một JSON test để suy ra PMF hoặc khả năng xuất bản app store.

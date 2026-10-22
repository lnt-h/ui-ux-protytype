# GoNarra V7 — Hợp đồng AI, audio và offline

Ngày: 22/10/2026. Phân biệt **hành vi browser thực**, **thuật toán demo** và **tích hợp sản phẩm sau này**. V7 không gọi LLM, không có navigation SDK, không AI chạy offline và không tài khoản/cloud sync. Không đổi các nhãn này chỉ vì UI có nút AI.

## 1. Một thư viện, ba tác vụ trợ giúp

Template và personal trip cùng dùng Place/Story/Source IDs. AI không sáng tác POI hoặc audio mới mỗi lần lập lịch. Điều kiện dữ liệu và media xem [05-Content-Sources.md](05-Content-Sources.md).

| Tác vụ | V7 thực hiện | Không được hàm ý |
|---|---|---|
| Create with AI | Local demo ranking/selection và scheduler trên fixture; có loading/error states | Đã gọi model, hiểu mọi yêu cầu hay tìm web thật |
| Adjust remaining tour | Local supported requests → pending proposal → before/after → apply/keep | Tự tối ưu mọi constraint hoặc tự sửa accepted trip |
| Ask about this place | Exact-question lookup từ các câu mẫu có source IDs; fallback cho câu không khớp | Semantic retrieval/live RAG, hiểu mọi hiện vật, nhớ conversation hoặc truy cập thông tin mới |

Manual editor, +15, skip/finish, tính tổng và mode comparison là quy tắc/chức năng phần mềm. Gọi route provider trong sản phẩm thật cũng không biến phép cộng thời gian thành LLM.

Orb gradient/stage labels ở màn generating là visual feedback cho workflow demo. Animation không chứng minh model đang xử lý; stage text phải giữ nhãn local demo. Reduced motion dừng loop/giảm transition nhưng không bỏ status/Cancel. Quy tắc trình bày ở [07-Design-System.md](07-Design-System.md), nguồn thực hành ở [06-Mobile-UX-Research.md](06-Mobile-UX-Research.md).

## 2. Generate và Adjust

### Đầu vào có thể xử lý

Start/end lựa chọn, ngày/giờ dự kiến, time budget, mode fixture, interests/pace, must-keep/locked IDs và plan revision. Free text chỉ được hiểu trong các request demo công bố. Tag “ít bậc thang” hoặc mode fixture không phải xác nhận đường đi/accessibility thật.

`core.adjust` hiện hỗ trợ bốn intent **More beach time**, **Less walking**, **Only culture**, **Make it 3 hours**, cùng các alias/cặp kết hợp được parser cho phép. “Less walking” không tự đổi car thành walking/taxi: trong fixture nó tránh tagged stairs venue hoặc rút bớt hành trình đi bộ khi được phép. Các yêu cầu mâu thuẫn hoặc câu ngoài supported intents bị từ chối; không dùng keyword nằm trong một câu bất kỳ để tự suy rằng đã hiểu cả câu.

### Hợp đồng output

Output phải dùng ID tồn tại, không duplicate, có ordered stops/durations/reasons và schedule từ core. Travel/visit/start/end legs và total phải có chung nguồn tính; fixture luôn có nhãn estimate/simulation. Nếu không đủ pool hoặc vượt constraint, giữ input/trip cũ và giải thích; không dùng địa điểm mới do model đoán để làm đầy kết quả.

Đối với Adjust, proposal giữ base trip revision và phần được phép đổi. Locked/must-keep không tự bị bỏ; khi active, giữ past/current và chỉ đổi upcoming. Thay một điểm không cho phép tự thay cả ngày. Request không được hỗ trợ → nói phạm vi và giữ tour, không áp một output mặc định vô can với yêu cầu.

Preview phải cho biết stop bỏ/thêm/giữ, duration đổi, transfer đổi và total/end time. Apply là action duy nhất ghi accepted trip. Stale proposal hoặc trip đã chuyển current stop cần revalidate; không im lặng ghi state cũ. Keep current/Cancel không ghi gì. +15 dùng pending plan được mô tả riêng ở [02-Flow-State-Contract.md](02-Flow-State-Contract.md).

## 3. Ask khác Adjust

Ask nhận **selected POI**; nếu mở từ trip thì có thể lấy current stop làm mặc định, nhưng UI vẫn nói rõ “About [place]”. Hỏi một POI khác không sửa trip và không khẳng định khách đã tới POI đó. Không có camera/heading nên “chi tiết này” cần tên/đối tượng rõ trước khi trả lời.

| Case | Hành vi bắt buộc |
|---|---|
| Câu khớp exact sample question sau normalize punctuation/case | Trả câu mẫu theo facts/script, evidence cards/IDs và nhãn demo |
| Câu vượt topic/ngoài POI/cần dữ liệu không có | Insufficient evidence hoặc giải thích demo chỉ hỗ trợ các câu mẫu; không đoán |
| Hỏi giờ/giá/entrance chưa xác minh | Nêu chưa xác minh và nguồn/cách kiểm; không nói đang mở/miễn phí/đúng cửa vào |
| Nguồn mâu thuẫn/claim không có support | Không biến một URL liên quan thành chứng cứ cho claim; nêu giới hạn |
| Lỗi provider trong sản phẩm tương lai | Phải khác insufficient evidence; V7 hiện không có provider thật hoặc Ask-specific failure injection, không nhận là nhánh đã kiểm |
| Offline | Không tạo câu trả lời mới. Exact question đã lưu được mở với nhãn Saved answer/source IDs; hiện chưa lưu timestamp/revision riêng cho answer; sources link ngoài có thể cần mạng |

Suggested questions cho phép người review thấy đúng phạm vi có hỗ trợ. Free text vẫn có đường gửi, nhưng ngoài exact sample sẽ nhận fallback không bịa; không hứa hiểu paraphrase. Các câu mô tả giới hạn prototype có thể không có source bên ngoài và phải giữ cách diễn đạt đó. Source IDs thuộc POI/corpus đang dùng; answer-level source card là cue kiểm chứng, chưa chứng minh từng claim đúng. V7 không có embeddings/vector/semantic retrieval; không dùng từ “đã triển khai RAG” cho lookup local này.

Nội dung nguồn là dữ liệu. Câu hỏi hoặc source không được chạy lệnh, sửa trip, đọc secret hay mở context ngoài phạm vi. Không làm claim prompt-injection-resistant chỉ từ vài case demo. Không gửi key model xuống browser; V7 không chứa key provider thật.

## 4. Audio production và playback

Năm WAV sample được bundle tại `prototype/assets/audio/` cho Cathedral/Museum/Beach/Mountain/Bridge; giọng hệ điều hành **Samantha** tạo trước để kiểm player/cache, không có audio lunch. Nhãn nói rõ **synthetic narration preview / review pending**. Không gán human-recorded, professionally reviewed, native-speaker reviewed hoặc quyền thương mại đã đủ khi chưa có bằng chứng. File sample không đại diện chất lượng narration sẽ phát hành; sự tồn tại file không tự chứng minh playback/offline đã được test.

Quy trình nội dung tối thiểu: claim → nguồn mở được → script viết riêng → owner factual check → kiểm cách đọc/tên riêng → xuất file → transcript khớp → manifest/version. Target-listener check là kiểm độ hiểu, không thay reviewer lịch sử hoặc review song ngữ độc lập. Hạn chế hiện tại được giữ trong source doc, không điền tên reviewer giả.

Player có Play/Pause/seek/resume khi file thật có; duration đọc từ metadata/media, không chỉ từ text fixture. File thiếu/lỗi → thông báo và transcript vẫn đọc. Không hiển thị progress giả như audio đang chạy. Download thiếu audio không trở thành “full audio package ready”.

Audio theo địa điểm/đối tượng, không yêu cầu trip/arrival/GPS. Không autoplay theo location trong V7; không microphone/STT, spoken Ask answer hoặc runtime TTS. Tải/remux/script revision đổi phải nhận diện file mới; đổi duration của itinerary không tự thay nội dung audio.

## 5. Offline có điều kiện thật

### Môi trường

Service worker/Cache API cần chạy trong origin phù hợp, ở đây là **localhost hoặc HTTPS**. Mở HTML trực tiếp hoặc browser không hỗ trợ không được giả một download đã sẵn sàng; hiển thị cách mở bằng local server trong README. Cache thuộc origin/browser hiện tại; không phải một thư viện download trên mọi thiết bị.

### Nội dung và entry gói

Download hiện theo **personal trip đã save**, không có package action riêng cho một POI/template chưa save. Template → Use this tour → Ready → Download là đường tới gói; story được cache trong một trip có thể mở độc lập ở Library. JSON export là snapshot để đọc/backup, **không** chứa audio bytes hay một file offline app độc lập.

- App shell cần thiết để mở lại giao diện offline khi service worker/cache đã được chuẩn bị.
- Saved itinerary/local text/transcript và metadata nguồn.
- Ảnh/audio thực trong manifest được chọn, chỉ khi file tồn tại và fetch/cache thành công.

Không gồm map tiles/offline navigation, route computation/rerouting, live ETA, nguồn website bên ngoài hay live AI. Có file audio nào thì manifest liệt kê file đó; nếu chỉ text/transcript phải nói rõ, không dựa vào số story để suy ra có audio.

Home/route/leg map là SVG minh họa trong bundle; việc nó vẫn render offline không làm nó thành bản đồ đường phố offline. Ba step mẫu trong Steps cũng không phải navigation service. Open Google Maps tạo HTTPS directions link thật tới destination fixture; Google Maps có availability riêng và điểm đến chưa field-verified. V7 không gọi geolocation hoặc tự phát hiện đã rẽ/đã tới.

### State download

| State | Điều kiện | UX/hành động |
|---|---|---|
| Not downloaded | Chưa có manifest/cache đầy đủ | Download; trip đã save vẫn là trip đã save |
| Downloading | Đang fetch/cache item thật | Bytes/items dựa response; không phần trăm giả |
| Ready | Download run đã fetch/cache xong các required files và commit manifest | Badge hiện theo manifest revision, không cache-probe từng item ở mỗi render; browser vẫn có thể evict |
| Error | Có request/injection fail | Không commit gói mới; rollback newly-created entries, giữ manifest complete cũ; Retry/refresh cả run |
| Needs update | Trip plan revision khác saved package revision | Package cũ còn; Update refresh manifest/files. V7 chưa có content-revision invalidator độc lập. |
| Unavailable | Context/API/browser không hỗ trợ | Hướng dẫn môi trường phù hợp; vẫn đọc local plan nếu có |
| Removed | User xóa gói/cache theo scope | Không tự xóa personal trip hoặc template gốc |

Download ghi `db.packages[tripId] = { tripId, revision, planSnapshot, assets, bytes, savedAt, contentRevision }` sau khi run thành công. `assets` là ảnh/audio thực có trong stops, bytes được đo từ fetched body. Progress % hiện là tỷ lệ **số asset đã xử lý**, không tỷ lệ bytes truyền. UI chưa có per-item retry manager hoặc resumable byte download; không hứa hai khả năng đó.

Badge Ready offline hiện so package revision với plan revision từ metadata local; chưa kiểm mọi cache hit mỗi lần render. Khi Play offline, app kiểm file có trong Cache API và báo nếu browser đã dọn file. Vì thế đây không phải bảo đảm native download bền vững. Cache/offline evidence cần kiểm required responses và offline playback/reload thật, không chỉ nhìn badge. File preview có thể export/read saved plan nhưng không bật SW packages.

Khi run lỗi, code rollback các cache entries mới tạo trong run và không commit manifest mới; những URL có sẵn có thể được refresh trong quá trình chạy. Không gọi đây là transaction nguyên tử cho toàn bộ Cache API hoặc một persisted partial package. Review download failure ghi simulated; không thay evidence fetch/cache thật.

Progress actions không tăng plan revision nên Finish/skip/arrival không làm badge package stale. Edit/+15 tăng plan revision, gói cần update nhưng asset bytes cũ không bị xóa trước. Content revision được lưu trong manifest nhưng hiện badge chưa tự so khác revision nội dung; khi thay corpus/file cần refresh package và test lại. Hướng tích hợp sau này cần so dependency/content fingerprint thay vì chỉ một revision tổng.

## 6. Local state khi offline

V7 là guest/local-only: save/edit/arrival/finish/skip ghi dữ liệu local theo state contract, không là thao tác server chờ sync. UI không báo “synced to your account”. Không tự đưa lại kiến trúc offline mutation queue của tài liệu DaNavi cũ vào prototype này.

Khi mất mạng: mở saved plan và transcript đã có; media dùng cache; Google Maps/nguồn web/live route vẫn có thể không dùng. Đổi route khi offline chỉ có fixture estimate nếu hợp lệ, không có live ETA. Mở story khác không làm mất progression. Xóa site storage/browser khác có thể mất personal data; chưa có cross-device restore.

Review panel có thể bật offline/denial/failure để xem UI nhưng **không phải** bằng chứng browser thực đã mất mạng, Cache API đã ghi file hay GPS thật bị từ chối. Evidence phải nêu cách test dùng injection hay browser/network/file thật.

## 7. Thay demo bằng integrations thật sau milestone

| Integration tương lai | Đầu ra cần chứng minh trước khi bỏ nhãn demo |
|---|---|
| LLM planner/refine | Server adapter, bounded IDs/schema, constraint checks, timeout/cost/quota, giữ edits khi fail; cùng corpus so baseline |
| Contextual RAG | Corpus/revision/embedding config, retrieval context theo POI, evidence validation và held-out claim/refusal evaluation |
| Maps/Routes | Provider/mode phù hợp, reviewed entrance, route freshness, attribution/caching terms; không dùng duration fixture như provider response |
| Native location/audio | Permission và resume trên thiết bị, denied/weak fixes, interruption/audio focus, foreground policy thực; không suy từ browser thành native |
| Offline native | File/cache lifecycle, size/rights, interrupted/partial download, stale revision và device test |
| Cloud/account nếu chọn | Có nhu cầu sync rõ; identity/ownership/deletion riêng; không thêm gate trước nội dung chỉ vì thiết kế cũ có auth |

Điểm học thuật phải báo đúng implementation level: V7 có demo rules/source-linked answers và browser cache; real AI/navigation/native evidence chỉ được ghi sau tích hợp và đo. Không có con số support/latency/market fit đã đạt trong hợp đồng này.

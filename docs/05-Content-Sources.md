# GoNarra V7 — Nội dung, nguồn và quyền sử dụng

Ngày đối chiếu nguồn ban đầu: **22/10/2026**, múi giờ Việt Nam; cập nhật mô tả bundle/nội dung ngày **23/10/2026**. Dữ liệu ở `prototype/data.js`, revision `2026-10-22-draft-1`; companion biên tập `prototype/content.js` revision `2026-10-23-rich-content-1` bổ sung chiều sâu các màn từ cùng corpus. Dùng cho **prototype review/demo**. Đã đọc nguồn công khai dưới đây; chưa có bilingual reviewer, narrator hoặc đánh giá thực địa. Deploy một prototype không tự xác nhận media rights hoặc biên tập độc lập.

## Phạm vi nội dung

Ba script English gốc dài khoảng 100–140 từ cho Cathedral, Museum, Beach; hai đoạn giới thiệu ngắn cho Bridge và Mountain. Chúng được viết riêng cho prototype từ dữ kiện chọn lọc, không sao chép audio hoặc nguyên bài. Câu khuyến nghị cách trải nghiệm là lời biên tập của GoNarra, không phải sự kiện lịch sử hay kết quả nghiên cứu người dùng. Script độc lập thứ tự, không dùng “bên trái”, “phía trước” hoặc giả định hướng nhìn từ GPS.

`questions` là **câu hỏi/trả lời mẫu có sẵn**, phục vụ review giao diện và nguồn; không phải bằng chứng hệ thống đã thực hiện retrieval, RAG hay trả lời câu hỏi tự do bằng mô hình. `sourceIds: []` ở câu về giới hạn prototype xác nhận khả năng của bản demo, không đóng giả citation bên ngoài.

## Nguồn và nhóm claim

| Source ID | Nguồn, ngày bài nếu hiển thị | Claim được dùng / giới hạn |
|---|---|---|
| `cathedral-tourism` | Trung tâm Xúc tiến Du lịch Đà Nẵng, [Nhà thờ giáo xứ Chính tòa Đà Nẵng](https://danangfantasticity.com/en/nha-tho-giao-xu-chanh-toa-da-nang-vn), **15/09/2015**, nội dung tiếng Việt dù URL `/en/`. | Tên Con Gà, hình con gà, liên hệ Thánh Phêrô, Gothic. Phần English là bản diễn đạt của prototype, chưa được reviewer song ngữ duyệt. Không dùng số đo hoặc lịch lễ. |
| `museum-tourism` | Trung tâm Xúc tiến Du lịch Đà Nẵng, [Da Nang Museum of Cham Sculpture](https://danangfantasticity.com/en/danang-museum-of-cham-sculpture/overview-da-nang-museum-of-cham-sculpture), **07/09/2020**, tiếng Anh. | Bối cảnh sưu tập, các mốc 1915/1919, cảm hứng kiến trúc và tên gallery. Không tái sử dụng giờ, vé hoặc mô tả dịch vụ như xác nhận hiện tại. |
| `beach-tourism` | Trung tâm Xúc tiến Du lịch Đà Nẵng, [Enjoy Da Nang at Two Beaches](https://danangfantasticity.com/en/enjoy-da-nang-at-two-beaches-named-among-lonely-planets-10-best-beaches-in-vietnam), **13/07/2026**, tiếng Anh. | Biển gắn với đời sống đô thị, đi bộ, vận động và thư giãn. Không dùng giải thưởng, lịch festival hoặc nhận định nước an toàn để bơi. |
| `mountain-vnat` | Cục Du lịch Quốc gia Việt Nam, [A walk around Marble Mountains](https://vietnam.travel/things-to-do/around-marble-mountains), không thấy ngày xuất bản, tiếng Anh. | Năm yếu tố trong tên núi, hang/chùa và việc leo bậc. Không lấy giờ/giá hoặc niên đại chi tiết vào corpus. |
| `bridge-wsp` | WSP, [Fire-breathing Dragon Bridge, Vietnam](https://www.wsp.com/en-gb/projects/fire-breathing-dragon-bridge-vietnam), không thấy ngày xuất bản, tiếng Anh. | Đơn vị thiết kế kế thừa mô tả sáu làn, cảm hứng rồng thời Lý, mở tháng 3/2013 và khả năng phun lửa/nước. Không xác nhận lịch biểu diễn. |

Đây là nguồn chính thức/đơn vị tham gia dự án phù hợp để bắt đầu đối chiếu; không phải bảo đảm mọi dòng đều đúng. Đặc biệt, bài cũ có thể giữ giờ/giá đã thay đổi; corpus này chủ động không đưa các dữ kiện vận hành đó vào script. Ngày truy cập không thay thế ngày xuất bản. Trước pilot cần chủ dự án review fact, tên riêng và English; sau đó nhờ **1–2 người dùng mục tiêu nghe thử**, ghi lỗi phát âm/độ rõ và sửa. Hiện chưa thực hiện các bước review đó.

## Audio và disclosure

Chủ dự án xác nhận **không có người đọc English hoặc reviewer hỗ trợ**, nên hướng mới là **TTS tạo trước từ script biên tập có nguồn**, thay cho baseline human narration. Không sinh chuyện lịch sử theo thời gian thực và không clone giọng của người khác.

Bundle hiện có **năm WAV thực** tại `prototype/assets/audio/<placeid>.wav` cho Cathedral/Museum/Beach/Mountain/Bridge; lunch không audio. Giọng hệ điều hành Samantha được tạo trước từ script gốc, không runtime TTS hoặc human narration. Đây là **synthetic preview để review**; file có nội dung và player đọc metadata thật nhưng chưa là review English/phát âm, narrator approval hoặc giấy phép public/commercial đã xác minh. Nhãn sản phẩm nêu synthetic narration/review pending; không giả claim “recorded by a local guide”.

Nếu có spike ElevenLabs sau này: [hướng dẫn quyền xuất bản chính thức](https://help.elevenlabs.io/hc/en-us/articles/13313564601361-Can-I-publish-the-content-I-generate-on-the-platform), kiểm tra **22/10/2026**, phân biệt Free noncommercial có attribution với generation trong paid plan có commercial license theo điều khoản; Beta có giới hạn riêng. Audio tạo khi Free không tự có quyền thương mại khi mua gói sau đó. Chỉ thử preset hợp lệ, kiểm tra plan/model/voice cụ thể và lưu bằng chứng; chưa tạo tài khoản, mua gói hay dùng provider này. [Use Policy](https://elevenlabs.io/use-policy), cập nhật **09/10/2026**, quy định quyền/consent đối với giọng và nội dung. Đây là kiểm tra điều kiện provider, không phải tư vấn pháp lý hoặc xác nhận đã đủ quyền.

## Ảnh kế thừa

Các file `cathedral.png`, `museum.png`, `mountain.png`, `beach.png`, `coast.png` được **copy nguyên trạng** từ `/Users/lengoctanhien/Downloads/GoNarra-V6 2/prototype/assets/`. Không chỉnh bản V6. Đã xem `coast.png`: ảnh thể hiện Cầu Rồng, vì vậy dùng cho bridge và thumbnail tour river-coast. Lunch dùng ảnh này chỉ như minh họa nhịp nghỉ trong tour, **không phải ảnh nhà hàng**. Chưa nhận diện tác giả/stock provider, nguồn gốc chụp hay AI, giấy phép, attribution hoặc quyền thương mại của cả năm ảnh. **Không coi là đã cleared để phát hành public/commercial**. Cần thay bằng ảnh tự sở hữu hoặc có license được lưu trước phát hành.

Ảnh UI reference do người dùng gửi dùng để định hướng collage welcome, map/white sheet, gallery và AI conversation; không là nguồn facts, rating/giá, forecast hoặc ảnh địa điểm Đà Nẵng. Không đưa ảnh mockup/reference vào catalog POI như ảnh chụp venue thật. Gallery chỉ dùng asset hiện có phù hợp; không bịa thêm các góc chụp.

## Nội dung bổ sung và day brief

Home/Explore/Detail có thêm mô tả biên tập, collection, highlights và practical notes từ cùng POI/corpus. Mục đích là giúp hiểu vì sao ghé, điều nên chú ý và lượng thời gian thiết kế; không tạo POI mới để lấp card. Tên collection như văn hóa/sông/biển là taxonomy biên tập, không ranking, recommendation đã cá nhân hóa hoặc giải thưởng. Metadata story/transcript lấy từ library; counts về saved/confirmed/downloads lấy state thực. Không bịa review count, rating 4.8, ticket price, hours, distance from you hoặc travel ETA live.

`GN_CONTENT` chứa `places` (hook, highlights có source IDs, visit rhythm, practical facts có status, tips/etiquette/mobility, audio takeaways), `tours` (độ phù hợp, journey highlights, included/not included, start/end/planning note), `collections` và `city` tips. Ba collection hiện tại là **Read the city**, **A little more open air**, **Start with one story**; chúng chỉ lọc các IDs đã có trong library. Các trường biên tập không được engine coi như operational facts hoặc dùng để validate route/accessibility.

Practical notes phân biệt điều đã có nguồn với gợi ý trải nghiệm và điều cần hỏi venue. “Suggested visit” là thời lượng thiết kế đã nêu trong fixture; effort/environment là mô tả giới hạn, không xác nhận accessible entrance hoặc phù hợp mọi người. Source list và status đặt trong disclosure dễ mở, không lặp cả đoạn cảnh báo trên tất cả card. Nội dung city notes chưa field-tested và không thay hướng dẫn của venue hoặc cảnh báo địa phương.

Weather là nguồn dữ liệu mới, tách khỏi corpus lịch sử/biên tập:

| Nguồn | Phạm vi sử dụng | Cách trình bày |
|---|---|---|
| [Open-Meteo Weather Forecast API](https://open-meteo.com/en/docs), đối chiếu 23/10/2026 | Model forecast theo tọa độ Đà Nẵng cố định; các trường response hiện dùng trong weather adapter | City + units + condition text + forecast/update time + source; không GPS, sensor tại venue hoặc dự báo an toàn biển |
| [Open-Meteo Terms](https://open-meteo.com/en/terms), đối chiếu 23/10/2026 | Điều kiện Free API noncommercial/attribution; production thương mại kiểm gói phù hợp | Link attribution gần weather; trạng thái stale/error không bị thay bằng số demo |

Dữ liệu current của weather provider vẫn là model, không chứng minh thời tiết tại thời điểm/điểm người dùng đứng. Network response thực và việc parse/hiển thị là các phần cần evidence riêng; không gọi một fixture weather trong unit test là quan sát forecast live. Không nhét forecast vào tour package như thể tự cập nhật offline hoặc dùng nó để overwrite itinerary.

## Fixture hành trình và vị trí

- Cathedral, museum, beach, mountain, bridge có tọa độ **xấp xỉ để mô phỏng**. Không phải kết quả geocoding đã kiểm tra hay tọa độ cổng/điểm dừng xe an toàn. Bridge là điểm ven sông mô phỏng, không cố ý dẫn khách lên lòng cầu.
- Lunch là **break placeholder**, không phải một quán đã xác minh; `coordinates: null`, không có booking, nguồn POI hoặc audio. Engine giữ break ở vị trí trước đó, không phát sinh điểm ăn giả.
- Duration/minDuration là tham số thiết kế để thử flow và chỉnh lịch, không phải thời lượng đã đo hoặc lời bảo đảm phù hợp cho mọi khách. Travel fixtures do engine sở hữu là số mô phỏng; không gọi live Routes hoặc kiểm tra giờ mở cửa.
- Hai tour mẫu chưa được đi thử. River-coast: Cathedral → Museum → Lunch → Beach. Slow-coast: Beach → Lunch → Bridge. Không cam kết mọi khách hoàn thành, không hứa swimming/show và không làm accessibility claim từ category/tag.

Trước khi có pilot dùng để đi thật, thay fixture bằng tọa độ lối vào được field-test, xác nhận dữ kiện vận hành liên quan ngày đi, quyền tài sản, review nội dung/giọng và hành vi mất mạng. Prototype hiện tại dùng để làm các điểm đó cụ thể và review được, chưa phải một tour đã sẵn sàng đưa khách đi.

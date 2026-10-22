# GoNarra V7 — Nội dung, nguồn và quyền sử dụng

Ngày đối chiếu nguồn: **22/10/2026**, múi giờ Việt Nam. Dữ liệu ở `prototype/data.js`, revision `2026-10-22-draft-1`, dùng cho **prototype đánh giá nội bộ**. Đã đọc nguồn công khai dưới đây; chưa có bilingual reviewer, narrator hoặc đánh giá thực địa. Có nguồn không đồng nghĩa đã được biên tập viên độc lập phê duyệt.

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

Khi tạo file dữ liệu, `story.audio` đều là `null`. Bản đóng gói có thể được root bổ sung file preview từ giọng tổng hợp của hệ điều hành tại `assets/audio/<placeid>.m4a` cho năm POI có script; lunch không có audio. Các file này là **synthetic preview để review**, không có nghĩa đã qua nghe kiểm tra, được narrator đọc, hoặc có giấy phép public/commercial đã xác minh. Nhãn dùng trong sản phẩm: “Synthetic narration preview — not reviewed for public release.” Không giả claim “recorded by a local guide”.

Nếu có spike ElevenLabs sau này: [hướng dẫn quyền xuất bản chính thức](https://help.elevenlabs.io/hc/en-us/articles/13313564601361-Can-I-publish-the-content-I-generate-on-the-platform), kiểm tra **22/10/2026**, phân biệt Free noncommercial có attribution với generation trong paid plan có commercial license theo điều khoản; Beta có giới hạn riêng. Audio tạo khi Free không tự có quyền thương mại khi mua gói sau đó. Chỉ thử preset hợp lệ, kiểm tra plan/model/voice cụ thể và lưu bằng chứng; chưa tạo tài khoản, mua gói hay dùng provider này. [Use Policy](https://elevenlabs.io/use-policy), cập nhật **09/10/2026**, quy định quyền/consent đối với giọng và nội dung. Đây là kiểm tra điều kiện provider, không phải tư vấn pháp lý hoặc xác nhận đã đủ quyền.

## Ảnh kế thừa

Các file `cathedral.png`, `museum.png`, `mountain.png`, `beach.png`, `coast.png` được **copy nguyên trạng** từ `/Users/lengoctanhien/Downloads/GoNarra-V6 2/prototype/assets/`. Không chỉnh bản V6. Đã xem `coast.png`: ảnh thể hiện Cầu Rồng, vì vậy dùng cho bridge và thumbnail tour river-coast. Lunch dùng ảnh này chỉ như minh họa nhịp nghỉ trong tour, **không phải ảnh nhà hàng**. Chưa nhận diện tác giả/stock provider, nguồn gốc chụp hay AI, giấy phép, attribution hoặc quyền thương mại của cả năm ảnh. **Không coi là đã cleared để phát hành public/commercial**. Cần thay bằng ảnh tự sở hữu hoặc có license được lưu trước phát hành.

## Fixture hành trình và vị trí

- Cathedral, museum, beach, mountain, bridge có tọa độ **xấp xỉ để mô phỏng**. Không phải kết quả geocoding đã kiểm tra hay tọa độ cổng/điểm dừng xe an toàn. Bridge là điểm ven sông mô phỏng, không cố ý dẫn khách lên lòng cầu.
- Lunch là **break placeholder**, không phải một quán đã xác minh; `coordinates: null`, không có booking, nguồn POI hoặc audio. Engine giữ break ở vị trí trước đó, không phát sinh điểm ăn giả.
- Duration/minDuration là tham số thiết kế để thử flow và chỉnh lịch, không phải thời lượng đã đo hoặc lời bảo đảm phù hợp cho mọi khách. Travel fixtures do engine sở hữu là số mô phỏng; không gọi live Routes hoặc kiểm tra giờ mở cửa.
- Hai tour mẫu chưa được đi thử. River-coast: Cathedral → Museum → Lunch → Beach. Slow-coast: Beach → Lunch → Bridge. Không cam kết mọi khách hoàn thành, không hứa swimming/show và không làm accessibility claim từ category/tag.

Trước khi có pilot dùng để đi thật, thay fixture bằng tọa độ lối vào được field-test, xác nhận dữ kiện vận hành liên quan ngày đi, quyền tài sản, review nội dung/giọng và hành vi mất mạng. Prototype hiện tại dùng để làm các điểm đó cụ thể và review được, chưa phải một tour đã sẵn sàng đưa khách đi.

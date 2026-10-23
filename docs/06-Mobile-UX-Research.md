# Nghiên cứu thực hành mobile UX

Đối chiếu nguồn sơ cấp ban đầu ngày **22/10/2026**; cập nhật quyết định thiết kế ngày **23/10/2026** từ review của người dùng. Đây là guideline review và design rationale, **chưa có interview/UAT**. Không gọi lần chỉnh UI là nghiên cứu người dùng đã hoàn tất. HIG/WCAG không chứng minh khách Đà Nẵng thích Home bản đồ, ba mức drawer, ba welcome hay giọng AI.

## Nguồn và áp dụng

| Nguồn đã đọc | Điểm hỗ trợ | Áp dụng GoNarra |
|---|---|---|
| Apple [Onboarding](https://developer.apple.com/design/human-interface-guidelines/onboarding) | Trải nghiệm ngắn, có thể bỏ qua; hướng dẫn đúng ngữ cảnh | Welcome ba thông điệp khác nhau, Skip; không auth/GPS/download bắt buộc. HIG không quy định phải đúng ba bước. |
| Apple [Sheets](https://developer.apple.com/design/human-interface-guidelines/sheets) | Sheet phục vụ tác vụ có phạm vi; nonmodal giữ tương tác với nền; tránh chồng sheet | Home drawer ảnh hưởng selection trên map; form/editor dài có màn riêng |
| Apple [Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) | Chữ lớn, text thay audio, controls rõ và cách thay gesture | Transcript, text scale, Expand/Collapse và move buttons |
| Apple [Playing audio](https://developer.apple.com/design/human-interface-guidelines/playing-audio) | Controls nhất quán, tôn trọng output/interruptions | Play có chủ ý; mini-player cùng state với player đầy đủ |
| Apple [Reduced Motion evaluation](https://developer.apple.com/help/app-store-connect/manage-app-accessibility/reduced-motion-evaluation-criteria) | Giảm motion gây khó chịu, giữ cách truyền trạng thái thay thế | Orb tĩnh/fade khi reduced motion; stage label vẫn còn |
| W3C [Contrast minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) | Text thường ≥4.5:1, large text ≥3:1 theo định nghĩa SC | Đo từng cặp text/background thật; không suy từ palette |
| W3C [Dragging movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html) | Action dùng drag cần single-pointer alternative khi áp dụng | Drawer có nút đổi mức; pin/list và reorder có nút |
| Apple [Q&A: 10 Questions with Design Evangelism](https://developer.apple.com/news/?id=s8sl4tpa) | Phân nhóm feature theo mục tiêu, hierarchy/progressive disclosure và labels của tab | Thêm thông tin hữu ích theo tầng đọc, không tăng một hàng CTA hoặc giấu tours sau snap; giữ bốn tab có nhãn |
| Android Developers [Accessibility API defaults](https://developer.android.com/develop/ui/compose/accessibility/api-defaults) | Target tương tác tối thiểu 48dp trong Material; icon cần semantics | Dùng làm điểm đối chiếu khi enrich filter/weather/retry; prototype web giữ minimum riêng và kiểm gap/focus, không gọi CSS px bằng dp |
| Android Developers [Bottom sheets](https://developer.android.com/develop/ui/compose/components/bottom-sheets) | Sheet có state show/hide và dismiss rõ | Ask/weather phụ có đường đóng, không chồng lên một sheet khác hoặc dùng sheet như màn Home bị gate |

Apple HIG Motion được mở nhưng nội dung trực tiếp yêu cầu JavaScript; bản Markdown không tải được trong công cụ. Các quy tắc motion ở đây dựa trên hai nguồn Apple đã đọc ở trên, không trích giả nội dung trang chưa đọc.

## Quyết định có lý do, chưa được người dùng xác nhận

**Home map + persistent drawer** giúp liên hệ POI và vị trí, nhưng dễ che pin, tạo cạnh tranh scroll/drag và khiến khách tưởng map đang live. Map ghi rõ illustrative/demo; không marker “you are here” giả. Search luôn dễ tiếp cận và chuyển sang Explore cùng query, không tạo search flow thứ hai. Chọn pin cập nhật selected card; chọn card/list cập nhật pin. Không nhảy current trip stop.

Review tiếp chỉ ra Home thiếu thông tin; review sau đó yêu cầu bỏ phần không cần thiết và weather không trông ghép thêm. Contract chốt: **compact** summary search + Continue/Plan/lối mở; **medium/full cùng feed cuộn**, full chỉ tăng diện tích, không gate tour. Weather ngắn gắn city context → next action → hai stories → hai collection previews → hai tours trong strip → một Essentials entry. Bỏ spotlight/tips/footer trang trí trùng. Explore giữ catalog/cả ba collections. Có nút đổi mức mang label/state; drawer nonmodal, map còn thấy dùng được. Tỷ lệ phải thích nghi chữ lớn/keyboard và CTA.

**Navigation tập trung** cho active leg: map/sơ đồ + instruction mẫu + mini-player + I'm here; Steps mở sheet, Maps là lựa chọn ngoài khi cần directions thật. Tabs ẩn trong focused view, nhưng Ask current-stop vẫn hiện và mở sheet giữ màn nền. Back về Home/Trips giữ trip/index/player, không ngầm arrival/finish. Route preview có pin/list selection; đây là đọc lịch, không chứng minh SDK navigation/GPS live.

**Welcome ba bước** ưu tiên khác biệt nghe chuyện: Hear stories at each stop → Discover your Da Nang → A day that fits you. Skip đi Home, không lặp mỗi lần; Settings có Replay. Không xin GPS sớm; hiện prototype chưa gọi API location. Ba bước là lựa chọn đã chốt với chủ dự án, cần kiểm khả năng nhớ/skip/completion, không claim “trend tốt hơn”.

**AI Guide thay tab Plan**, vẫn tổng cộng bốn tab Home/Explore/AI Guide/Trips. Trips giữ lịch/save/edit; AI là nơi hỏi/lập/đề nghị chỉnh, với contextual sheet từ Detail/leg. Cùng engine cho ba scope city/POI/current trip; chưa model/RAG live. Composer có mic cạnh Send để voice dễ tìm, nhưng V7 dùng staged sample có bước review/sửa trước Send, nói rõ không truy cập microphone hoặc lưu recording. Đây là cách kiểm flow/placement trước khi tích hợp quyền và speech provider, không phải bằng chứng voice input đã chạy. Hội thoại không bắt buộc cho chỉnh tay.

**Profile và Settings** nằm ở entry header Home, không thêm bottom tab. Guest vẫn dùng nội dung và trips; login/signup/forgot/reset chỉ kiểm flow UI local theo yêu cầu demo. Không xin sign-in trước giá trị nghe/khám phá và không trình bày recovery như email thật đã gửi. Settings playback speed/reduced motion tác động player/CSS thật; không thêm những toggle không có hiệu lực để làm màn trông đầy đủ.

**Detail** lấy cảm hứng hero/gallery của ảnh reference: hero lớn, About/Story và một footer action row Listen/Add to plan; Ask nằm đúng context thay vì lặp nhiều CTA lớn. Bổ sung highlights/why visit, suggested time, what to expect và practical notes với disclosure nguồn/unknowns; không lặp tên/ảnh/CTA thành các card rỗng. Suggested time là khoảng khái quát được biên tập, không giờ mở cửa giả. Hiện mỗi POI một ảnh; gallery ngang chỉ bổ sung khi có thêm ảnh phù hợp. Không sao chép booking/price/rating khi thiếu dữ liệu. Một player chuyển bài có chủ ý và giữ vị trí, tách khỏi arrival/finish. **Offline** vẫn thấy qua badge/action; quản lý sâu ở Trips.

**Weather** có adapter Open-Meteo thay quyết định ẩn trước đây. Home dùng dòng inline hòa vào city context: temperature/condition/rain giờ + valid time/source; forecast đầy đủ ở màn chi tiết. Loading/stale/unavailable không lấy số reference. Current là model, không sensor/GPS tại khách. Prompt Museum khi rain probability giờ ≥50% chỉ mở lựa chọn đọc, không đổi tour/claim venue mở. Đây là lựa chọn thiết kế theo review, chưa chứng minh task success. [Provider documentation](https://open-meteo.com/en/docs) và [terms](https://open-meteo.com/en/terms) được đối chiếu 23/10/2026; commercial khác prototype không thu phí.

**Explore/Tour/Trips/AI/Profile** chỉ tăng thông tin giúp quyết định: filter/kết quả, tour visit/transfer breakdown, Trips progress/next action, Profile counts thật. AI giữ quick-plan + hai câu hỏi city/context và capability disclosure, bỏ task grid lặp. Detail giữ hai highlights khác ý/practical facts chính, rhythm/tips/etiquette đọc khi mở. Root Explore/AI Guide/Trips bỏ top bar lặp tên tab; bottom bốn label và heading nội dung vẫn giữ. Nội dung phụ vào disclosure; đổi trip vẫn preview/confirm. Mục tiêu là relevance, không độ dài trang hay số card.

Những quyết định này là suy luận áp dụng từ guideline và review sản phẩm, không câu bắt buộc nguyên văn trong HIG/Material. Trang HIG Layout/Accessibility bản JavaScript không trả nội dung cho công cụ ở lượt đối chiếu này; rationale về hierarchy/labels lấy từ Q&A Apple chính thức đã đọc, không giả đã đọc Markdown thất bại. Material 3 guideline trực tiếp cũng yêu cầu JavaScript; tham chiếu triển khai/accessibility dùng tài liệu Android chính thức thay vì nguồn mirror.

Visual reference chỉ là định hướng: collage du lịch cho welcome, trắng/navy/ice cho Detail, map + white sheet cho Home, conversation nhẹ cho AI. Không là bằng chứng usability, market trend, accessibility hoặc quyền sao chép sản phẩm khác.

## Review cần thực hiện

So cùng task trên Home map và Explore list: tìm đúng POI, mở story, tạo plan, resume trip. Ghi wrong turns, thời gian và trợ giúp; chưa tự kết luận map nhanh hơn. Kiểm cả ba mức drawer bằng tap/keyboard, chữ lớn và reduced motion; map controls không bị che. Kiểm trở lại từ focused leg vẫn đúng progress và player.

Kiểm thêm khả năng tìm AI Guide và Ask sheet, phân biệt câu hỏi với đề xuất thay lịch, đóng sheet về đúng origin, Start không tạo bản rác, nghe POI ngoài trip rồi trở lại mà không tự phát/advance. Ghi tỷ lệ hoàn thành và trợ giúp theo task thật; không suy từ ít nút hơn thành ít lỗi hơn.

Trong lượt enrich cần kiểm khách tìm được tours/collections bằng scroll ở medium, hiểu city/model weather khác near-you và phân biệt dữ liệu cũ/lỗi. Weather load/refresh không cướp scroll/focus của form/card đang đọc. So nhiệm vụ tìm một điểm hợp sở thích, hiểu thời gian/giới hạn rồi Start; không đo chất lượng bằng số card hoặc độ dài trang. Trên màn khác kiểm người dùng trả lời được “vì sao ghé”, “ngày này tốn bao lâu”, “đang nghe/đi đâu”, “AI sắp đổi gì” mà không cần đọc hết docs.

Ảnh export và browser checks chứng minh layout/interaction trong môi trường ghi nhận, không thay native safe-area, VoiceOver, interruption hoặc field/UAT. Hướng “chuyên nghiệp” được bảo vệ bằng hierarchy, consistency và trạng thái đúng; hiệu quả với khách cần evidence sau này.

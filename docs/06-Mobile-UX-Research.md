# Nghiên cứu thực hành mobile UX

Đối chiếu nguồn sơ cấp ngày **22/10/2026**. Đây là guideline review và quyết định thiết kế, **chưa có interview/UAT**. HIG/WCAG không chứng minh khách Đà Nẵng thích Home bản đồ, ba mức drawer hay giọng AI.

## Nguồn và áp dụng

| Nguồn đã đọc | Điểm hỗ trợ | Áp dụng GoNarra |
|---|---|---|
| Apple [Onboarding](https://developer.apple.com/design/human-interface-guidelines/onboarding) | Trải nghiệm ngắn, có thể bỏ qua; hướng dẫn đúng ngữ cảnh | Welcome hai bước, Skip; không auth/GPS/download bắt buộc |
| Apple [Sheets](https://developer.apple.com/design/human-interface-guidelines/sheets) | Sheet phục vụ tác vụ có phạm vi; nonmodal giữ tương tác với nền; tránh chồng sheet | Home drawer ảnh hưởng selection trên map; form/editor dài có màn riêng |
| Apple [Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) | Chữ lớn, text thay audio, controls rõ và cách thay gesture | Transcript, text scale, Expand/Collapse và move buttons |
| Apple [Playing audio](https://developer.apple.com/design/human-interface-guidelines/playing-audio) | Controls nhất quán, tôn trọng output/interruptions | Play có chủ ý; mini-player cùng state với player đầy đủ |
| Apple [Reduced Motion evaluation](https://developer.apple.com/help/app-store-connect/manage-app-accessibility/reduced-motion-evaluation-criteria) | Giảm motion gây khó chịu, giữ cách truyền trạng thái thay thế | Orb tĩnh/fade khi reduced motion; stage label vẫn còn |
| W3C [Contrast minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) | Text thường ≥4.5:1, large text ≥3:1 theo định nghĩa SC | Đo từng cặp text/background thật; không suy từ palette |
| W3C [Dragging movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html) | Action dùng drag cần single-pointer alternative khi áp dụng | Drawer có nút đổi mức; pin/list và reorder có nút |

Apple HIG Motion được mở nhưng nội dung trực tiếp yêu cầu JavaScript; bản Markdown không tải được trong công cụ. Các quy tắc motion ở đây dựa trên hai nguồn Apple đã đọc ở trên, không trích giả nội dung trang chưa đọc.

## Quyết định có lý do, chưa được người dùng xác nhận

**Home map + persistent drawer** giúp liên hệ POI và vị trí, nhưng dễ che pin, tạo cạnh tranh scroll/drag và khiến khách tưởng map đang live. Vì vậy map ghi rõ illustrative/demo; không marker “you are here” giả. Search luôn thấy; Explore list là lối vào ngang hàng. Chọn pin cập nhật selected card; chọn card/list cập nhật pin. Không nhảy current trip stop.

Ba mức drawer là giả thuyết: peek để thấy địa điểm đang chọn; half để thấy Create AI/tour/resume; expanded để đọc danh sách. Có nút Expand/Collapse mang label và state; không bắt phải đoán gesture. Drawer không phải modal, map phần còn thấy vẫn dùng được; modal xác nhận mới khóa nền. Không mở một sheet mới lên sheet cũ. Tỷ lệ/cao độ cần thích nghi khi chữ lớn/keyboard, không cố giữ ba mức nếu làm mất CTA.

**Navigation tập trung** cho active leg: map/sơ đồ + current instruction mẫu + mini-player + I'm here; Steps mở sheet, Maps ngoài mở directions thật. Back về Home/Trips giữ trip/index/player, không ngầm arrival/finish. Route preview có pin/list selection; đây là đọc lịch, không chứng minh SDK navigation/GPS live.

Welcome hai bước nói giá trị và quyền chủ động; Skip đi Home, không lặp mỗi lần mở. AI orb là cue thị giác; semantic stages mô tả local demo, không tạo phần trăm hoặc lời hứa model đang suy nghĩ thật. Audio synthetic có label; transcript/Info/Ask mở theo POI, độc lập trip.

## Review cần thực hiện

So cùng task trên Home map và Explore list: tìm đúng POI, mở story, tạo plan, resume trip. Ghi wrong turns, thời gian và trợ giúp; chưa tự kết luận map nhanh hơn. Kiểm cả ba mức drawer bằng tap/keyboard, chữ lớn và reduced motion; map controls không bị che. Kiểm trở lại từ focused leg vẫn đúng progress và player.

Ảnh export và browser checks chứng minh layout/interaction trong môi trường ghi nhận, không thay native safe-area, VoiceOver, interruption hoặc field/UAT. Hướng “chuyên nghiệp” được bảo vệ bằng hierarchy, consistency và trạng thái đúng; hiệu quả với khách cần evidence sau này.

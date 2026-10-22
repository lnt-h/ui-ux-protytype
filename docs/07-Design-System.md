# GoNarra V7 — Design system

Ngày 22/10/2026. Hợp đồng thiết kế mobile; cơ sở phương pháp và giới hạn ở [06-Mobile-UX-Research.md](06-Mobile-UX-Research.md). UI English, docs Vietnamese; các quy tắc dưới đây là lựa chọn dự án, không tự là chứng nhận HIG/WCAG.

## Frame, layout và type

Frame review theo yêu cầu **402×874 logical px**, export **1206×2622 ở 3×**. Status bar/safe-area trong ảnh prototype là chrome minh họa, không là OS thật. Native dùng safe-area thực theo thiết bị/orientation; không hardcode phần inset từ ảnh vào mọi máy. Browser rộng/hẹp vẫn responsive, form/list cuộn được.

Một font system hỗ trợ Vietnamese: `-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`. Body 16 CSS px, line-height khoảng 1.5; heading theo hierarchy, không dùng font thứ hai để trang trí. 16 CSS px là baseline prototype, không tuyên bố bằng default 17 pt iOS. Chữ quan trọng không truncate. Control mục tiêu tối thiểu **44×44 logical px**; spacing đủ tránh chạm nhầm. Gutter 20, compact 16; spacing 4/8/12/16/20/24/32. Native đo/tune lại theo platform.

## Màu theo vai trò

| Token | Màu | Vai trò |
|---|---|---|
| Ink | `#021024` | Text chính/navy sâu |
| Brand navy | `#052659` | Heading, selected emphasis |
| Brand mid | `#5483B3` | Đồ họa/phụ trợ; chưa mặc định làm body text |
| Brand light | `#7DA0CA` | Highlight/tint/icon decoration |
| Sky | `#C1E8FF` | Background map/card nhẹ |
| Slate | `#4A5C6A` | Secondary text trên nền phù hợp |
| Neutral | `#CCD0CF` | Border/surface phụ; không mặc định dùng làm chữ nhỏ |
| Action/route | `#2D6AFF` | Primary CTA, selected pin, route |
| Canvas | `#FFFFFF` | Card, form, đọc nội dung |

White/light-blue/navy tạo hierarchy; ảnh giữ aspect ratio, không đặt text quan trọng trực tiếp lên ảnh/map nhiều chi tiết. Tinted status phải có text/icon, không chỉ màu. Contrast từng cặp cần được tính và ghi evidence riêng; chưa gọi cả palette đạt AA. Error/success/warning dùng semantic role riêng, không đổi nghĩa theo màn.

## Components và hành vi

- **Welcome:** hai bước có Skip/Back/Continue; không auth hoặc permission.
- **Home map/drawer:** search trên; selected pin/card đồng bộ; ba mức peek/half/expanded bằng drag nếu có và nút; Create AI, curated tour, resume rõ. Explore list giữ riêng.
- **Primary tabs:** Home · Explore · Plan · Trips. Ask là action theo POI, không tab AI thứ năm.
- **Route preview:** numbered pins, stop list, selected state; chọn pin không ghi arrival. **Active leg:** top instruction demo, map, mini-player, I'm here; Steps/itinerary sheet và external Maps.
- **Detail/Arrival:** ảnh + nội dung trắng/light blue; Listen/Transcript/Info/Ask thống nhất context. Full player và mini-player dùng cùng audio state; thiếu file có transcript/error thật.
- **Forms/editor:** một cột, validation cạnh field, move buttons thay drag, Cancel giữ accepted state. CTA cố định không che keyboard/safe area; long content cuộn được.
- **Sheet/modal:** Home drawer persistent/nonmodal; task confirmation modal có Close/Cancel. Không chồng modal; focus trở lại trigger sau dismiss.

Radius vừa phải theo component: controls 12–16, cards 20–24, drawer 28; border/shadow nhẹ để phân lớp. Không phối nhiều hiệu ứng mạnh cho một card. Line icons thống nhất; icon-only có accessible name.

## Motion và verification

Orb dùng blue gradient chuyển động chậm, không nhấp nháy/parallax lớn; loading không giả live LLM. Action feedback ngắn, chuyển trạng thái khoảng 120–240 ms là target thiết kế. `prefers-reduced-motion` dừng lặp orb và giảm transition, vẫn giữ stage text/status. Không dùng animation để cản Cancel hoặc giấu lỗi.

Review ở frame gốc, compact width, chữ lớn, keyboard và reduced motion. Đo contrast/touch targets, kiểm pin/list/drawer/focus/player và regression trip state. Chỉ ghi đạt phần đã đo; design tokens không thay native accessibility testing.

# GoNarra V7 — Design system

Cập nhật ngày **23/10/2026**, cùng V7 hiện có. Hợp đồng thiết kế mobile; cơ sở và giới hạn ở [06-Mobile-UX-Research.md](06-Mobile-UX-Research.md). UI English, docs Vietnamese; các quy tắc là lựa chọn dự án, không tự là chứng nhận HIG/WCAG.

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
| Action/route | `#2D6AFF` | Selected pin/route, action accents; primary button thường navy để contrast dễ kiểm |
| Canvas | `#FFFFFF` | Card, form, đọc nội dung |

White/light-blue/navy tạo hierarchy; ảnh giữ aspect ratio, không đặt text quan trọng trực tiếp lên ảnh/map nhiều chi tiết. Tinted status phải có text/icon, không chỉ màu. Contrast từng cặp cần được tính và ghi evidence riêng; chưa gọi cả palette đạt AA. Error/success/warning dùng semantic role riêng, không đổi nghĩa theo màn.

## Components và hành vi

- **Welcome:** ba bước Hear stories → Discover → AI/day; collage ảnh/blue gradient và hình preview nhỏ minh họa lợi ích. Một headline, một câu giải thích, một CTA; Skip/Back rõ; không auth/permission/download gate. Settings Replay không reset dữ liệu.
- **Home map/drawer:** map sáng, header/search gọn, pin ảnh/card đồng bộ. Compact chỉ search + Continue hoặc Plan my day với 2h/4h/6h; medium thêm card; full thêm tour. Grip có drag và nút thay thế. Home search chuyển Explore cùng query. Không chèn weather giả; header có Profile, Settings là màn riêng bên trong.
- **Primary tabs:** Home · Explore · AI Guide · Trips, bốn mục có label. AI thay Plan; Trips quản lý itinerary/edit/downloads. Không thêm AI FAB cạnh tab AI và không dùng tab như lệnh Start.
- **Route preview:** numbered pins, stop list, selected state; chọn pin không ghi arrival. **Active leg:** top instruction demo, map, mini-player, I'm here; tabs ẩn trong focused mode, Ask current-stop vẫn có dạng sheet; Steps/itinerary và Maps phụ.
- **Detail/Arrival:** hero ảnh lớn + nội dung trắng/ice, About/Story; inline player và transcript trong Story; Add to trip phụ; Ask sheet đúng POI. Hiện mỗi POI có một ảnh, chưa có gallery nhiều ảnh; hướng gallery ngang chỉ áp dụng khi đủ ảnh phù hợp, không bịa góc chụp. Full/inline/mini-player dùng cùng audio state; thiếu file có transcript/error thật. Player đang nghe POI khác có Return to current stop, không autoplay khi trở về.
- **AI Guide/sheet:** city/POI/current-trip context chip; suggested questions khi trống; input/Send dễ thấy; source và demo/fallback label đọc được. Sheet giữ origin/focus khi đóng; expanded/back vẫn có đường về. Thẻ proposal nêu protected/locked stops, diff và Apply/Keep; không dùng chat bubble thay review thay đổi.
- **Tour card/detail:** badge Not downloaded/Ready offline/Needs update theo manifest và action Download/Update một chạm. Lỗi tải có thông báo trong phiên, không badge Error đã lưu riêng. Start là CTA chính; Save for later và một Edit là phụ. Download nudge không chặn Start. Không lặp Customize/Edit/Back lớn cùng màn.
- **Forms/editor:** một cột, validation cạnh field, move buttons thay drag, Cancel giữ accepted state. CTA cố định không che keyboard/safe area; long content cuộn được.
- **Profile / auth demo:** Guest và demo session hiển thị khác rõ; optional Login/Sign up, edit profile và Sign out không chiếm tab. Login/signup/forgot/reset dùng form có label, validation, password visibility nếu hỗ trợ và đường Back rõ. Nhãn local demo luôn dễ thấy; không social OAuth button giả hoặc thông báo email đã gửi thật. Password không persist/truyền.
- **Settings:** màn riêng cho playback speed thật, reduced motion persistent, Downloads, Replay welcome, About/privacy; Sign out ở profile khác reset demo data có confirm. Native background/notification/location switches không được thêm như đang có integration thật.
- **Sheet/modal:** Home drawer persistent/nonmodal; Ask task sheet có Close; confirmations có Cancel. Tránh modal chồng; focus trở lại trigger khi dismiss. Active-trip guard nêu tên chuyến với Pause current & Start / Keep current; không tự End. Chỉ dùng sheet Start nếu có quyết định thật cần xử lý, không dựng lại Ready bằng sheet.

Radius vừa phải theo component: controls 12–16, cards 20–24, drawer 28; border/shadow nhẹ để phân lớp. Không phối nhiều hiệu ứng mạnh cho một card. Line icons thống nhất; icon-only có accessible name.

Reference mới ưu tiên **collage ảnh welcome, map + white sheet, hero/gallery và conversation thoáng**. Giữ palette navy/ice/slate để các màn cùng một sản phẩm; không đưa flight/hotel/pricing/rating hoặc forecast từ mockup tham khảo vào app khi chưa có dữ liệu/chức năng. Tránh glass/blur lên vùng cần đọc; text trên ảnh có nền/overlay đủ rõ và cần đo riêng.

## Motion và verification

Orb dùng blue gradient chuyển động chậm, không nhấp nháy/parallax lớn; loading không giả live LLM. Action feedback ngắn, chuyển trạng thái khoảng 120–240 ms là target thiết kế. `prefers-reduced-motion` dừng lặp orb và giảm transition, vẫn giữ stage text/status. Không dùng animation để cản Cancel hoặc giấu lỗi.

Review ở frame gốc, compact width, chữ lớn, keyboard và reduced motion. Đo contrast/touch targets, kiểm pin/list/drawer/focus/player và regression trip state. Chỉ ghi đạt phần đã đo; design tokens không thay native accessibility testing.

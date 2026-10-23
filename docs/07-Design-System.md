# GoNarra V7 — Design system

Cập nhật ngày **23/10/2026**, cùng V7 hiện có. Hợp đồng thiết kế mobile; cơ sở và giới hạn ở [06-Mobile-UX-Research.md](06-Mobile-UX-Research.md). UI English, docs Vietnamese; các quy tắc là lựa chọn dự án, không tự là chứng nhận HIG/WCAG.

## Frame, layout và type

Frame review theo yêu cầu **402×874 logical px**, export **1206×2622 ở 3×**. Status bar/safe-area trong ảnh prototype là chrome minh họa, không là OS thật. Native dùng safe-area thực theo thiết bị/orientation; không hardcode phần inset từ ảnh vào mọi máy. Browser rộng/hẹp vẫn responsive, form/list cuộn được.

Một font system hỗ trợ Vietnamese: `-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`. Body 16 CSS px, line-height khoảng 1.5; heading theo hierarchy, không dùng font thứ hai để trang trí. 16 CSS px là baseline prototype, không tuyên bố bằng default 17 pt iOS. Chữ quan trọng không truncate. Control mục tiêu tối thiểu **44×44 logical px**; spacing đủ tránh chạm nhầm. Gutter 20, compact 16; spacing 4/8/12/16/20/24/32. Native đo/tune lại theo platform.

## Logo và handoff Figma

Logo trong prototype lấy trực tiếp từ `prototype/assets/brand/`, không dựng lại bằng text/CSS và không dùng icon tai nghe thay thế. `gonarra-wordmark-color.svg` là production wordmark mặc định; `gonarra-logo-master.svg` là sheet trình bày để import vào Figma. Trang `brand-assets.html` cho phép copy SVG hoặc tải từng file mà không cần thư viện ngoài.

Wordmark dùng hệ nét bo tròn 26 unit và kerning quang học đã cân lại: o/n 15, n/a 14, a/r 14, r/r 14, r/a 14 unit. Không áp thêm `letter-spacing` trong code hoặc Figma. Minimum: wordmark 60 px, logo có tagline 200 px, g mark 16 px; clear space tối thiểu bằng một chiều cao thị giác của chữ o. Chữ g của icon và wordmark dùng đúng một master hình học. Tagline trong asset production đã outline và không phụ thuộc font.

Token thương hiệu: Deep Ocean `#0B3045`, Teal `#0B8EA8`, Sun `#F6A623`, Sky `#F0F9FF`. Chấm Sun giữ màu cam ở bản full-color/reverse; bản đơn sắc đổi đồng bộ. Không kéo giãn, không xoay, không outline, không đổ bóng và không đổi riêng màu chấm.

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
- **Home map/drawer:** map sáng, header/search gọn, pin ảnh/card đồng bộ. Compact summary search + Continue/Plan/lối mở; **medium/full cùng feed cuộn**, full chỉ tăng vùng đọc. Inline city weather, next action, hai story cards/hai collection previews, compact strip hai tours và một Essentials entry. Không spotlight/tips/footer trang trí lặp. Grip có drag/nút thay thế; Explore nhận cùng query; Profile trên header.
- **Weather/day brief:** Home là dòng thông tin trong city context, không thẻ widget lớn hoặc gradient bóng trông ghép thêm. Temperature/condition/rain giờ + valid time/source đọc được; forecast đầy đủ ở màn chi tiết. Loading không số giả; stale/cached/unavailable có text/Retry. Rain ≥50% cho prompt Museum phụ, không auto-apply tour/claim mở cửa. Không animation cloud/sun liên tục hoặc gọi city forecast là vị trí khách.
- **Feed section:** title giải thích nội dung, mô tả một dòng nếu cần và View all chỉ khi có destination thật. Story có ảnh/POI/category/thời gian đúng nghĩa; collection có tên/lý do chọn, mở Explore với filter có thể xóa. Horizontal rail cho item song song, feed chính vertical; không carousel tự chạy. Nội dung không mất khi đổi snap.
- **Explore:** search + category/collection/filter rõ, kết quả/count và Clear; ở 402 px dùng danh sách ngang một cột để ảnh, tên, summary và metadata có đủ chiều rộng đọc. Không ép hai card vào một hàng hoặc nhồi source/hours vào thumbnail. Empty state nêu filter/query đang dùng và action phục hồi; không hiện danh sách khác như thể đã match.
- **Primary tabs:** Home · Explore · AI Guide · Trips, bốn mục có label. AI thay Plan; Trips quản lý itinerary/edit/downloads. Không thêm AI FAB cạnh tab AI và không dùng tab như lệnh Start.
- **Root headers:** Explore/AI Guide/Trips bỏ top bar chỉ lặp tên bottom tab. Giữ heading nội dung thực sự giải thích task; các màn con vẫn có Back/title phù hợp. Không bỏ label bottom để tiết kiệm chỗ.
- **Route preview:** numbered pins, stop list, selected state; chọn pin không ghi arrival. **Active leg:** top instruction demo, map, mini-player, I'm here; tabs ẩn trong focused mode, Ask current-stop vẫn có dạng sheet; Steps/itinerary và Maps phụ.
- **Detail/Arrival:** hero lớn + trắng/ice, About/Story; hai highlights khác ý và practical facts chính, không lặp duration. Visit rhythm/tips/etiquette/source/unknowns qua disclosure. Detail thường chỉ có một footer action row Listen/Add to plan; Story cung cấp player/transcript và Ask đúng POI, không thêm nút Listen thứ hai trong body. Một ảnh/POI, chưa gallery giả. Các player cùng audio state; lỗi có transcript. Return current không autoplay.
- **Tour/proposal:** summary nêu experience/độ phù hợp, stops có thứ tự, visit/transfer/budget breakdown lấy cùng core; chuẩn bị/download/inclusions đọc theo nhóm. Một primary Start, Save/Edit phụ; không lặp đủ buttons cả body/footer. Reasons inline/disclosure và diff giữ rõ action Apply.
- **Trips/Profile:** counts/progress là state thật với nhãn rõ; active/paused có next action ưu tiên, planned/history là nhóm dễ scan. Empty Trips đi thẳng vào CTA phù hợp, không ưu tiên dashboard ba số 0. Profile gom activity/shortcuts/settings theo mục tiêu; không thêm card trang trí rỗng hoặc số liệu account cloud giả.
- **AI Guide/sheet:** city/POI/current-trip context chip; quick-plan + hai câu hỏi city khi trống, capability disclosure; bỏ task grid trùng. Weather là một entry phụ theo context. Composer giữ mic và Send thành hai target riêng; voice sheet có intro, listening state, transcript editable và review-before-send, cùng nhãn no recording/no live speech. Sheet giữ origin/focus, expanded/back có đường về. Proposal nêu protected/locked stops, diff/Apply/Keep; không dùng chat bubble thay review.
- **Tour card/detail:** badge Not downloaded/Ready offline/Needs update theo manifest và action Download/Update một chạm. Lỗi tải có thông báo trong phiên, không badge Error đã lưu riêng. Start là CTA chính; Save for later và một Edit là phụ. Download nudge không chặn Start. Không lặp Customize/Edit/Back lớn cùng màn.
- **Forms/editor:** một cột, validation cạnh field, move buttons thay drag, Cancel giữ accepted state. CTA cố định không che keyboard/safe area; long content cuộn được.
- **Profile / auth demo:** Guest và demo session hiển thị khác rõ; optional Login/Sign up, edit profile và Sign out không chiếm tab. Login/signup/forgot/reset dùng form có label, validation, password visibility nếu hỗ trợ và đường Back rõ. Nhãn local demo luôn dễ thấy; không social OAuth button giả hoặc thông báo email đã gửi thật. Password không persist/truyền.
- **Settings:** màn riêng cho playback speed thật, reduced motion persistent, Downloads, Replay welcome, About/privacy; Sign out ở profile khác reset demo data có confirm. Native background/notification/location switches không được thêm như đang có integration thật.
- **Sheet/modal:** Home drawer persistent/nonmodal; Ask task sheet có Close; confirmations có Cancel. Tránh modal chồng; focus trở lại trigger khi dismiss. Active-trip guard nêu tên chuyến với Pause current & Start / Keep current; không tự End. Chỉ dùng sheet Start nếu có quyết định thật cần xử lý, không dựng lại Ready bằng sheet.

Radius vừa phải theo component: controls 12–16, cards 20–24, drawer 28; border/shadow nhẹ để phân lớp. Không phối nhiều hiệu ứng mạnh cho một card. Line icons thống nhất; icon-only có accessible name.

Reference mới ưu tiên **collage ảnh welcome, map + white sheet, hero/gallery và conversation thoáng**. Giữ palette navy/ice/slate để các màn cùng một sản phẩm; không đưa flight/hotel/pricing/rating hoặc forecast từ mockup tham khảo vào app khi chưa có dữ liệu/chức năng. Tránh glass/blur lên vùng cần đọc; text trên ảnh có nền/overlay đủ rõ và cần đo riêng.

## Content density và responsive review

Mục tiêu là thông tin cần cho quyết định, **không kéo dài mọi trang**. Lớp đầu gồm title + insight/metadata + next action. Giữ schedule breakdown hoặc practical facts khi có ích; nhóm phụ vào disclosure có label. Bỏ headline/metadata/duration, task grids và nút trùng thay vì dựng thêm card. Source/unknown chi tiết trong disclosure, nhãn ngắn gần dữ liệu cần phân biệt thật/mô phỏng. Một trạng thái không được chỉ bằng màu.

Giữ text/facts trong flow tự nhiên, không fixed height làm cắt dòng khi font lớn. Card rail không gây scroll ngang cả trang; không nested button giữa card và Download. Feed có bottom padding cho tab bar/mini-player, còn modal/composer có vùng cuộn riêng không che Send/Close. Cập nhật weather không làm mất draft, focus hoặc scroll của tác vụ khác. Kiểm minimum target của control mới, tab label, keyboard focus, reduced motion và 402×874/hẹp hơn; không nhận toàn app đạt accessibility từ token palette.

## Motion và verification

Orb dùng blue gradient chuyển động chậm, không nhấp nháy/parallax lớn; loading không giả live LLM. Action feedback ngắn, chuyển trạng thái khoảng 120–240 ms là target thiết kế. `prefers-reduced-motion` dừng lặp orb và giảm transition, vẫn giữ stage text/status. Không dùng animation để cản Cancel hoặc giấu lỗi.

Review ở frame gốc, compact width, chữ lớn, keyboard và reduced motion. Đo contrast/touch targets, kiểm pin/list/drawer/focus/player và regression trip state. Chỉ ghi đạt phần đã đo; design tokens không thay native accessibility testing.

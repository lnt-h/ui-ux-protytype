# Kết quả review và bàn giao

## Lần chỉnh UI trên cùng V7 — 23/10/2026

Phạm vi được chốt: bốn tab Home/Explore/AI Guide/Trips; welcome ba bước Story → Discover → AI/day; Home phân nội dung theo ba snap; Detail About/Story nghe tại chỗ; contextual Ask sheet và tab AI dùng chung context engine. Start trực tiếp, reuse bản chưa bắt đầu phù hợp và xác nhận pause chuyến khác; download vẫn có badge/action trên card/detail. Một audio session giữ vị trí nghe từng story, không đổi trip progress. Profile từ Home, Settings riêng và optional login/signup/forgot/reset demo local được bổ sung, giữ guest và trips khi Sign out; chưa server auth/email/cloud.

Acceptance cases V01–V75 ở [04-Validation-Handoff.md](04-Validation-Handoff.md) là kế hoạch kiểm, không toàn bộ đã được kiểm trên browser. Các runs và quan sát thực hiện trong đợt refresh được tách dưới đây. Profile/auth/Settings có state checks riêng; browser chỉ có các journey được ghi cụ thể. Đợt refresh đầu không thêm weather; lượt enrich tiếp theo bổ sung adapter weather riêng như phần dưới. GPS/route SDK/LLM/RAG/server auth/native background vẫn chưa tích hợp. Detail hiện một hero ảnh phù hợp mỗi POI, không gallery giả.

## Lượt tăng chiều sâu nội dung trên cùng V7

Review tiếp yêu cầu thêm thông tin, rồi chốt **chỉ giữ phần cần cho quyết định**, tránh kéo dài mọi màn. Home medium/full cùng feed: weather inline trong city context, next action, hai stories/hai collection previews, compact tour strip và một Essentials entry; full chỉ tăng chiều cao. Bỏ story spotlight/tips/footer trang trí lặp. Detail giữ hai highlights/practical facts, rhythm/tips/etiquette ở disclosure. AI bỏ task grid trùng; Trips/Profile dùng counts/state thực. Root Explore/AI Guide/Trips bỏ top bar lặp tên tab, giữ bốn label bottom và heading nội dung.

Weather bổ sung nguồn Open-Meteo cho Đà Nẵng cố định với nguồn/time/units và state lỗi/cũ; không là GPS, sensor tại POI, marine assessment hoặc automatic trip rewrite. Nguồn UX/điều kiện provider được ghi tại docs 03/05/06. Logo production/master/brand assets giữ cùng hợp đồng.

Regression hiện tại đã chạy lại sau lượt hoàn thiện voice/hierarchy: **22/22 core, 78/78 app-state, 21/21 weather và 34/34 asset/static**. Browser review trên frame iPhone 17 402×874 đã quan sát Home map/drawer, Explore list một cột, AI Guide + voice review sheet, Trips empty state và Detail một action row. Đây vẫn là browser prototype review, chưa là UAT/VoiceOver/device test hoặc microphone integration.

## Baseline trước lần chỉnh UI này

Kết quả dưới đây thuộc bản V7 trước đợt thay tab/welcome/Detail/Start/audio hiện tại. Nó giải thích bằng chứng đã có, **không thay regression run trên source mới**. Mỗi artifact chỉ có giá trị cho hash/environment và case mà nó ghi.

| Loại | Kết quả | Ý nghĩa |
|---|---|---|
| Domain/core | 22/22 | Tính lịch, must-visits, giới hạn, protected prefix, unknown intent |
| App state | 28/28 | Action/mutation guards trong NodeVM, không là browser test |
| Asset/static | 34/34 | WAV có nội dung, reference hợp lệ, production logo SVG/Brand Assets và 9 solid-color pairs đạt 4.5:1 |
| Browser UI | 24 observed-pass, 2 inconclusive | Flow cũ đã quan sát; không coi 2 case inconclusive là pass |
| Origin unreachable | Shell reload + audio played to end | Sau cache đủ, tắt server local rồi mở lại và nghe Cathedral WAV |

Xem [evidence README](../evidence/README.md), [browser review](../evidence/browser-review.json), [app state](../evidence/app-state-tests.json) và [asset/contrast](../evidence/assets-and-contrast.json). Đọc timestamp/hash để phân biệt baseline với run mới có thể thay artifact cùng tên. Screens cũ không tự minh họa layout sau refresh hoặc tạo kết quả UAT. Chỉ bổ sung kết quả hiện tại khi đã thực chạy/quan sát; không cộng baseline và rerun thành tổng ca độc lập.

## Scripted checks trong đợt refresh

| Kiểm tra có evidence | Kết quả snapshot | Phạm vi và giới hạn |
|---|---|---|
| Core/domain | 22/22 | [core-tests.txt](../evidence/core-tests.txt); engine fixture và constraints; không live route/model/GPS |
| App state mở rộng | 78/78 | [app-state-tests.json](../evidence/app-state-tests.json), run 23/10/2026; app hash nằm trong JSON. DOM/Audio giả trong Node VM; thêm voice review/context/audio-intent và hierarchy Home/Explore/Detail/Trips; không layout, microphone, media hoặc service worker thật. |
| Weather adapter | 21/21 | Parser, units, timezone, cache/stale/error/concurrency; không xác minh forecast ngoài thực địa hoặc UI network trên thiết bị. |
| Asset/static | 34/34 | `assets-and-contrast.json`, snapshot 23/10/2026; 5 WAV có data, local refs/shell dependencies, production logo SVG/Brand Assets và 9 cặp màu được chỉ định. Không đo toàn bộ CSS/ảnh/gradient mới. |

App-state run hiện ghi `appSha256: 3ba7ae3c98fbaf2c61f5c9bc3811f0b4481298b89d6915686a0db5f89afd3bd4`. 78 cases gồm các guard cũ và Start/dedup, một player/positions, AI/voice context, welcome, hierarchy responsive, optional guest/login/signup/recovery/profile/signout, actual speed/motion preferences và modal form behavior. Password test kiểm giá trị đã nhập không xuất hiện trong localStorage; đây không là security audit hoặc server authentication test.

Không cộng 28 app baseline với 78 app refresh: suite mới chứa lại các guard cũ. App đổi sau timestamp/hash phải rerun phù hợp; các con số là kết quả snapshot, không cam kết cho mọi chỉnh sửa tiếp. VM pass không được quy thành browser/media/SW pass.

## Browser refresh đã quan sát

Môi trường: browser desktop, prototype phục vụ tại **localhost:8770**, khung review iPhone 17. Các thao tác thực và phạm vi ghi ở [browser-refresh.json](../evidence/browser-refresh.json); ledger này độc lập với `browser-review.json` baseline.

| Journey/quan sát | Kết quả được ghi nhận | Giới hạn |
|---|---|---|
| Welcome | Cả ba bước Story/Discover/AI hiển thị đúng nội dung | Snapshot/interaction browser, không completion research |
| Home và Detail | Home map/medium drawer; Detail About và Story mở được | Không thay đo mọi snap/font scale/VoiceOver |
| Quick plan → Start | Submit 4h tạo proposal 3 stops; Start đi thẳng active leg | Fixture/local rules, không thời gian tuyến thật |
| Focused Ask | POI sheet mở đúng stop, trả câu mẫu kèm nguồn, đóng trở về/focus | Câu mẫu demo, không free-form LLM/RAG |
| Audio | WAV thực Play/Pause; quan sát tiến độ khoảng 0:09 / 0:34 | Có mạng; không native interruption/background hoặc đánh giá narration |
| Profile và Login | Guest Profile → Login form → sample login → demo profile | Signup/recovery/signout có VM coverage; không nhận chúng là browser journeys đã quan sát đầy đủ |
| Settings | Speed 1.25 và Reduce animation được chọn, UI giữ lựa chọn | Persistence/reload có state-test coverage; không native device settings |
| Download | Explore prepared tour → Download một chạm → Ready offline; Manage mở đúng gói From river to coast khoảng 12 MB | Fetch/cache trong browser đã quan sát; **chưa tắt mạng/tắt server rồi reload trên bản refresh này** |

Không gọi các quan sát chọn lọc trên là tất cả V01–V58 đã pass. Browser refresh không lặp lại phép tắt origin của baseline; không dựa badge Ready để suy offline playback/reload mới đã kiểm. Screenshot trong đợt này cũng là browser capture, không ảnh iPhone vật lý.

## Giới hạn còn lại

Chưa chạy trên iPhone vật lý/VoiceOver/background interruptions; chưa live LLM/RAG, map SDK/GPS, server auth/email hoặc street-route calculation. Weather provider là adapter riêng của lượt enrich, cần đọc evidence network/render hiện tại thay vì kết quả browser refresh đầu. Browser refresh đầu chưa kiểm mạng thật bị ngắt; server-off reload/playback là evidence baseline riêng. Hai assertions baseline inconclusive do view đổi giữa các bước. Hai cặp màu chỉ vừa vượt 4.5:1; ảnh/gradient/component mới và accessibility toàn app cần audit theo source hiện tại.

Mục tiêu export physical 3× là 1206×2622; bundle chứa browser review captures, không giả thành ảnh 3× hoặc iPhone thật. Dùng prototype để inspect flow và docs để triển khai; field-test/nghiên cứu khách thực hiện riêng theo handoff.

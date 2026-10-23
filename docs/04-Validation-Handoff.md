# GoNarra V7 — Kiểm chứng và bàn giao

Cập nhật ngày **23/10/2026** cho lần chỉnh UI trên cùng V7. Tài liệu là **acceptance plan và cách đọc evidence**, không là biên bản tuyên bố test pass. Chỉ kết quả thực trong `evidence/` với thời điểm, environment, case và outcome mới là evidence đã chạy. Source mới cần chạy lại; kết quả của UI cũ không tự thành pass cho tab/sheet/Start/audio mới. File/case chưa có kết quả ghi **NOT RUN / chưa có bằng chứng**.

## 1. Bàn giao cần đọc theo thứ tự

1. README ở root: cách chạy localhost, giới hạn và entry point.
2. [01-Product-UX.md](01-Product-UX.md): identity, scope V7 và screen inventory.
3. [02-Flow-State-Contract.md](02-Flow-State-Contract.md): state, invariants, draft/proposal/+15 và progression.
4. [03-AI-Offline-Contract.md](03-AI-Offline-Contract.md): local demo khác live AI, audio và download thật.
5. [05-Content-Sources.md](05-Content-Sources.md): sources, script/media status và dữ kiện chưa xác minh.
6. [06-Mobile-UX-Research.md](06-Mobile-UX-Research.md) và [07-Design-System.md](07-Design-System.md): nguồn primary UX, các giả thuyết Home/drawer và visual tokens.
7. `evidence/`: đọc tên file thực có trong gói; JSON có outcome/case cụ thể, ảnh có viewport và screen name. Không mặc định tên ví dụ dưới đây đã tồn tại.

Artifacts kỳ vọng: kiểm tra core/state, browser journeys, render/screenshots và cache/audio checks; có thể được gộp trong JSON theo runner thực. Evidence index phải chỉ đúng file tồn tại, công cụ/môi trường, điểm pass/fail/not run và giới hạn. Screenshot chỉ chứng minh UI được render ở trạng thái đó; không tự chứng minh logic, asset download, route live hoặc audio đã nghe.

File hiện có: [app-state-tests.json](../evidence/app-state-tests.json) ghi VM action/state suite, counts và hash `app.js`. VM dùng DOM/Audio tối thiểu nên không chứng minh browser render/media/SW. [test-core.cjs](../scripts/test-core.cjs) là executable suite; script tồn tại không tự là pass evidence. Nếu hash/code đổi sau một run, xem kết quả đó như snapshot cũ đến khi chạy lại. Browser/cache/audio/contrast results chỉ được bổ sung khi quan sát thực và có artifact tương ứng.

## 2. Acceptance journeys cần chạy

Các case dưới đây dùng fixture và app state sạch riêng của prototype; không xóa toàn bộ browser/site data khác. Ghi device/browser/viewport/URL, fixture/code version và injection dùng hay không. Khi một case fail, lưu actual vs expected và retest sau sửa; không thay expected để hợp thức hóa.

| ID | Scenario/thao tác | Expected quan trọng |
|---|---|---|
| V01 | Home search → Explore nhận query tên/local alias → Detail | Một search state; giữ query; đúng POI/empty state; không đổi active trip |
| V02 | Detail About/Story → Listen/Transcript khi chưa có trip | Phát tại trang, không player-route gate/account/GPS; missing media có transcript/label thật |
| V03 | Play POI B khi audio active-trip A đang phát → Return current → Play A | Một Audio object; A pause/nhớ vị trí; B phát; Back/Return không autoplay; current/progress giữ; Play A resume đúng vị trí |
| V04 | Template detail → Customize copy → chỉnh/lưu | Có personal trip ID riêng; template gốc không đổi |
| V05 | Home 2h/4h/6h hoặc AI Guide → quick form → generate → proposal | Budget truyền đúng; inputs giữ; IDs/constraints/tổng nhất quán; demo label rõ; reasons inline |
| V06 | Hủy/lỗi generation bằng Review panel | Không tạo trip rỗng; input và accepted trip cũ giữ nguyên; retry/cancel được |
| V07 | Manual editor up/down/duration/add/remove/last-remove Undo/cancel | Draft tính lại từ core; Undo lần remove cuối đúng; Cancel phục hồi accepted plan; không nhận drag đã triển khai |
| V08 | Editor valid Update; editor known conflict Update | Valid áp một lần; conflict không giả thành plan hợp lệ; draft không mất |
| V09 | Adjust supported request → preview → Keep current | Request có diff/reasons; giữ tour gốc, không apply ngầm |
| V10 | Active Adjust → lock upcoming → preview/Apply hoặc từ chối | Past/current + locked upcoming được thể hiện và giữ; chỉ upcoming chưa khóa đổi; no-candidate/constraint có lý do |
| V11 | Unsupported Adjust request / stale base proposal | Không áp fallback vô nghĩa hoặc overwrite revision mới; bản cũ giữ |
| V12 | Active trip → +15 → Keep current | Duration, total và trip revision không bị thay bởi preview |
| V13 | +15 → Review later visits/Adjust remaining → Apply | Pending +15 chỉ commit khi xác nhận; past/current/must-keep đúng contract |
| V14 | Tour detail/proposal → Start trực tiếp → I'm here nhiều lần → Finish | Không Ready gate; tạo/tái dùng personal trip; arrival một lần; Finish mới chuyển next |
| V15 | Skip current | Không cộng visited; chuyển đúng next và summary ghi skipped |
| V16 | Pause → refresh → Resume | Đúng trip/current/confirmed state; không tự arrival/complete |
| V17 | Start tour khác khi active → Keep rồi Pause current & Start | Keep giữ cả hai, không bản rác; Confirm chỉ pause trip cũ, không End; một active; double-click không clone |
| V18 | End early trước khi hết stop | Outcome ended early; confirmed/skipped/not visited đúng, không full-completed giả |
| V19 | Xử lý hết stop qua Finish/Skip | Completed; recap không gọi skipped là visited |
| V20 | My Trips nhiều bản, refresh/chuyển trip | Không trùng ID/mất state/cross-write; lưu local được công bố |
| V21 | Detail Ask sheet → supported question → đóng; AI Guide cùng POI | Context/source đúng; giữ Detail/selection; cùng engine, không mutate trip hoặc autoplay |
| V22 | Ask unknown/wrong-POI/operational fact chưa verified | Fallback/insufficient evidence; không bịa facts hoặc citation |
| V23 | Ask offline; mở exact saved answer nếu có | Nhãn Saved answer; no-cache fallback rõ; không gọi đây là AI offline/provider-failure test |
| V24 | Open Maps và trở lại app | Đúng destination theo fixture, có thông báo giới hạn; không advance trip |
| V25 | Named anchors/location info và location-off/weak injection | Manual path dùng được; không permission request thật; source của case là review injection |
| V26 | Browser geolocation allowed/denied/timeout | **Not implemented** trong V7 hiện tại; không điền pass từ V25. Chỉ test sau khi thêm API thật. |
| V27 | Tour card/detail one-tap Download trên localhost | Chuẩn bị/reuse personal copy, không Start; required files/cache/bytes thật; badge đúng; save khác download |
| V28 | Inject download failure hoặc asset request fail | Không commit manifest mới; rollback newly-created cache entries, giữ previous complete package; retry toàn run |
| V29 | Edit trip/+15/finish rồi xem package | Plan-revision badge update đúng; progression không làm stale. Test ghi rõ content-revision invalidation chưa tự động. |
| V30 | Browser offline/reload sau khi shell+package ready | Saved plan/text và cached media mở được; không tuyên bố offline Maps/AI |
| V31 | Remove download rồi mở saved trip | Xóa đúng gói/cache scope; trip còn, missing asset được nói đúng |
| V32 | Player dùng file sample thực: play/pause/seek/resume | Media time/duration thật, không fake progress; label synthetic/unreviewed |
| V33 | Thiếu file hoặc audio lỗi | Player báo unavailable/error; transcript đọc được; package không hứa audio đủ |
| V34 | Compact viewport, scroll, keyboard, touch actions | CTA không che nội dung quan trọng; move thay drag; labels readable |
| V35 | Closure current chưa arrival → chọn replacement → Keep hoặc Apply | Closure là simulated; Keep không đổi, Apply chỉ thay current eligible và tính lại; locked cần unlock xác nhận trước |
| V36 | Closure current đã confirmed hoặc stale proposal sau progress đổi | Không thay venue đã visited, không overwrite history; sửa upcoming hoặc báo stale |
| V37 | Welcome 3 bước Story → Discover → AI/day → Back/Skip/complete → reload | Không auth/GPS; onboarded persistence; Settings Replay không reset trip; skip mỗi bước |
| V38 | Home pin/card + compact/medium/full bằng button và grip | Compact search+Continue/Plan; medium thêm card; full tour; selection đồng bộ; không current mutation |
| V39 | Route overview pin/list → selected card/Detail → back | Đúng selected POI; itinerary/progress không mutate; step/time là fixture |
| V40 | Focused leg → Steps → mini-player → Ask current-stop sheet → đóng → Home/Resume | Tabs ẩn nhưng Ask còn; đúng context/return; sample step không advance; một Audio object; giữ current/progress |
| V41 | Frame nội dung 402×874, compact browser, chữ lớn/reduced motion | Export 3× đúng vùng logical; simulated chrome khác native safe area; CTA/labels không che nhau |
| V42 | Main tabs Home/Explore/AI Guide/Trips; Home → Profile → Settings | Đúng 4 tab, không Plan/Profile tab thứ năm; trips/edit không mất; Replay welcome/Downloads tìm được |
| V43 | Start template hai lần cùng ngày khi có pristine upcoming copy | Dùng lại đúng ID, không nhân bản; Continue active/paused giữ pointer; auto-name có ngày |
| V44 | Start template khi bản cùng template/ngày đã customized hoặc visited | Không ghi đè plan/progress cũ; chỉ reuse pristine unstarted hoặc user chọn rõ customized trip |
| V45 | AI city/POI/current-trip scopes; sheet mở rộng rồi Back | Scope chip khớp engine/source; city không giả POI source; origin đúng; không ngầm tạo/apply trip |
| V46 | Unsupported/conflicting AI query trong sheet/tab | Nêu demo scope/lock/budget phù hợp; không bịa hoặc biến câu hỏi thành mutation |
| V47 | Listen B tự ended, đóng sheet/đi Back nhiều lần | Không resume A tự động, không đổi arrival/stop; Play A có chủ ý mới tiếp tục |
| V48 | Home mặc định và Start chưa download | Không weather sample như thật; Start vẫn được; download nudge không bắt qua màn Ready mới |
| V49 | Tour cards/detail downloaded/error/stale badge; Trips Downloads | Badge/action đồng nhất manifest; một chạm tải/cập nhật; xóa media không xóa trip |
| V50 | Home profile icon → Guest profile → Settings → Back | Profile/Settings là màn riêng, origin hợp lý; guest vẫn nghe/lập/lưu tour; không auth gate |
| V51 | Login form trống/email sai/field thiếu rồi hợp lệ | Validation rõ; valid mở demo session local có nhãn; không network auth hoặc xác nhận email ownership |
| V52 | Sign up tên/email/password dưới 8 ký tự hoặc chưa acknowledge demo | Không nhận form invalid; valid tạo profile/session demo, không lưu/truyền password hoặc giả account server |
| V53 | Forgot → Reset → invalid/valid → trở lại Login/Profile | Không báo email thật đã gửi/token server thật/password account thật đổi; form recovery demo dùng được |
| V54 | Edit profile → reload → Sign out với trip active/download đã có | Profile local đổi đúng; signout đóng session, giữ trip/status/pointer/cache/favorites/settings; không auto End/Delete |
| V55 | Guest và demo session → đổi speed trong Settings và player | `Audio.playbackRate` và control đồng nhất; setting giữ qua render/reload trong browser hỗ trợ |
| V56 | Reduced motion Settings → animation/CSS → reload | Motion preference được áp thật và nhớ local; stage/status vẫn đọc được; không native accessibility claim |
| V57 | Settings Replay/Downloads/About/privacy và reset-data entry | Mở đúng mục; Replay không reset trips; reset data cần confirm và khác Sign out |
| V58 | Inspect storage, URL và network sau login/signup/forgot/reset | Không password/credential token trong storage/query/network; local session không coi là security/account boundary |

Nếu UI/runner không hỗ trợ một nhánh trong gói hiện tại, ghi “not implemented/not run” thay vì gộp cùng một case pass rộng hơn. Core test không thay browser journey; browser journey không thay device field test.

## 3. Kiểm tính lịch và dữ liệu

Unit/state cases tập trung các invariant dễ gây mất dữ liệu: sum visit/transfer/start/end legs, thay thứ tự/duration, duplicate/missing IDs, sparse pool, must-keep, active prefix, +15 pending, stale apply và arrival idempotence. Expected nên tính độc lập từ fixture input hoặc invariant; không chỉ snapshot chính hàm cần kiểm.

Check cùng plan ở proposal/editor/review/tour detail/active không có tổng hardcode khác. Time strings xuất phát cùng schedule. Unknown/unverified hours/entrances không thành verified/open. Lunch generic không thành nhà hàng có tọa độ giả. Tọa độ fixture không được gọi reviewed entrance.

Đối với Ask demo, chấm supported answer/source mapping, unsupported fallback và no-trip-mutation. Không tính “RAG accuracy” từ số câu mẫu match local. Nếu nguồn có citation nhưng không support claim, ghi fail; không coi link hợp lệ là đủ.

## 4. Cách đọc bằng chứng browser/cache/audio

- Browser checks: thao tác thực, outcome và state sau action; phân biệt programmatic/core calls với click journey.
- Screens/render: viewport, route/state, full content và console errors. Ảnh trông hợp lý không chứng minh every control works.
- Export review: vùng logical bên trong là 402×874 → 1206×2622 ở 3×; outer desktop border khác kích thước này. Status bar/island/home indicator là minh họa. Không dùng ảnh để suy native safe-area/thiết bị thật đã được test.
- Cache checks: origin, service worker control state, manifest revision, required URLs/cache hits, partial fail và offline reload. Review-panel offline alone không chứng minh browser offline.
- Audio checks: file tồn tại/bytes/duration và playback events. OS synthetic file không phải người kể đã review; automated playback event không thay nghe chất lượng hoặc phát âm.
- Location checks: explicit API call/permissions nếu có; simulated denial/GPS state ghi simulated. Browser geolocation không chứng minh native/background arrival.
- Accessibility checks: semantic labels, keyboard/focus, scaling/contrast theo phần đã kiểm; không gọi một bảng contrast là chứng nhận toàn app.

Không ghi pass date/model/reviewer giả. Failure/retest giữ trong ledger; report summary phải dùng đúng denominators và environment.

### Phạm vi implementation cần giữ khi đọc kết quả

- Review scenario có thể tạo/persist seed trip, thay request preferences và pause trip active cũ trong storage V7. Đây không là view-only control; dùng profile test riêng. Reset chỉ khóa/cache V7, không xóa V6 hoặc browser dữ liệu khác.
- Ask hiện exact sample match, cache answer theo POI/question local; chưa có semantic retrieval, timestamp/revision expiry hay Ask-specific provider failure.
- Download hiện từ saved trip; metadata-ready không bảo đảm cache chưa bị browser evict. Có actual fetch/cache/media checks mới chứng minh offline. JSON export không phải audio package.
- Browser location hiện không được gọi; mọi location-off/weak là manual/review UI. Không ghi GPS SDK test passed.
- Closure replacement current chưa visited là exception có explicit unlock/preview/apply, cần xem V35/V36 evidence; không sửa một arrival đã confirmed hoặc coi simulated closure là tin venue thật.

## 5. Cổng hoàn thành prototype

Một bản handoff đáng review phải có ba entry journeys hoạt động, một trip đi hết được, cancel/keep bảo toàn dữ liệu, không double-count arrival, Ask demo có support/fallback, playback/cache đúng asset thật và review controls riêng. Profile/Settings/auth demo phải đi hết được, guest không bị khóa, signout không mất trip, password không được persist/truyền và recovery không giả email/server action. Không còn lỗi mất trip, nhảy current stop hoặc downloaded giả trong các case đã chạy.

Nếu phần offline/audio/API browser chưa chạy được trong môi trường người nhận, docs/UI phải hạ claim và hướng dẫn điều kiện chạy; không đổi simulation thành bằng chứng thật. Native, live AI/Routes, venue facts/media rights và user value chưa đạt chỉ vì prototype gate đạt.

## 6. Lộ trình sau handoff trong 2–3 tháng

Đồ án ưu tiên một vertical slice có chứng cứ. Giờ/tuần/rubric/budget còn phải chốt; bảng là thứ tự 8–12 tuần, không cam kết tiến độ. Giữ UI V7 có thể dùng lại; không thêm brand/module mới để thay bằng chứng còn thiếu.

| Giai đoạn | Đầu ra | Gate để mở phần tiếp |
|---|---|---|
| Tuần 1 | Review V7 thực, xác nhận objectives/capacity; kiểm nguồn/script và 1–2 sample audio với người nghe; thử đúng hoàn cảnh direct listen/template/custom | Ghi giả thuyết/negative cases; xác định phần prototype còn mô phỏng; scope có người chịu trách nhiệm |
| Tuần 2–3 | Một template và corpus nhỏ đã review, real media rights, một nền tảng native; server/model/map adapter spikes | Một POI và một route/Ask live có evidence; không gọi fixture là production |
| Tuần 4–5 | Live bounded planner/adjust + source-grounded Ask; edit/progress/cancel đúng, external Maps | IDs/facts/constraints/ownership hoặc local-data policy rõ; provider fail không mất trip |
| Tuần 6 | Download/media trên thiết bị, location explicit, interruption/resume; field trial nhỏ | Không fake ready/ETA, entrance/content được kiểm theo phạm vi; defect/retest |
| Tuần 7 | Held-out planner/Ask evaluation, usability tasks với người target độc lập khi có thể | Báo counts/latency/cost/support/refusal và giới hạn; freeze feature |
| Tuần 8 | Sửa blockers, report, demo và reproduction | Objective met/partial/unmet có evidence; source/version/data-rights status thật |
| Tuần 9–12 nếu có | Retest, tăng content có review và chất lượng; chưa mặc định auth/payment/SDK navigation | Chỉ mở scope khi core và học thuật đã có evidence |

Tách tuning set khỏi evaluation set; pin model/prompt/corpus khi chấm real AI. Cùng input/facts, so planner AI với deterministic baseline; chấm preference/feasibility/latency, không optimality chưa định nghĩa. Ask cần supported/unanswerable/wrong-POI/conflicting facts/adversarial, claim support và false refusal; không chỉ chấm có nguồn.

Usability sample nhỏ báo số ca independent/assisted/fail và lỗi quan trọng; SUS nếu dùng là cảm nhận usability, không tỷ lệ hoàn thành. Participant consent/recording/retention phải có trước thu thập; không ghi persona/quote hư cấu. Chưa có PMF, willingness-to-pay hoặc user satisfaction thật thì ghi chưa có.

## 7. Release/handoff notes

Handoff browser này không phải app store release. Muốn pilot thật cần đối chiếu actual corpus/entrance, quyền ảnh/audio/offline, English/listener quality, secrets/provider terms/budget, target device và research consent. Chỉ thêm cloud account khi scope có nhu cầu sync; khi đó identity/ownership/logout/deletion là work riêng, không cho login flow cũ âm thầm lọt vào guest prototype.

Người nhận nên bắt đầu bằng localhost và ba entry, sau đó dùng Review panel cho failure cases, rồi đối chiếu evidence JSON. Cần phân biệt “review được một trạng thái” với “đã kiểm chứng hệ thống thật ở ngoài thực địa”.

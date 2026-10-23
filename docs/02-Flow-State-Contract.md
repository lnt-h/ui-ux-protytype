# GoNarra V7 — Flow, state và bảo toàn dữ liệu

Hợp đồng cập nhật ngày **23/10/2026**, cùng source V7. Tên dưới đây mô tả ý nghĩa dữ liệu; property thực trong `prototype/core.js`/`app.js` là nguồn để debug. Giữ các invariant và acceptance dưới đây; không gọi kết quả kiểm thử là đã đạt chỉ vì có mô tả.

## 1. Các đối tượng không được gộp

| Đối tượng | Dữ liệu tối thiểu/ý nghĩa |
|---|---|
| Place | Stable ID, name/aliases, category/tags, source IDs, facts/review state; tọa độ fixture có nhãn. Generic break không có entrance giả. |
| Story | ID, POI ID, title, transcript/script revision, source IDs, audio asset nếu có, audio/review status. |
| Template | ID/version, ordered stop IDs/durations, mode và mô tả; bản gốc bất biến. |
| Personal trip | Unique ID, name/origin/template reference, start/end/time budget/mode/preferences/must-keep, stops, revisions, status/current pointer và arrival/finish/skip records. |
| Editor draft | Trip/proposal nguồn, base revision, bản copy đang sửa, một last-removed-stop Undo, validation state. Không chính là accepted trip. |
| Change proposal | Trip nguồn và base revision, pending changes, reasons, before/after schedule, conflicts; chỉ apply khi người dùng xác nhận và base còn phù hợp. |
| App selection | Trip đang xem, active trip, selected POI/story/tab. Selection để đọc không phải progression. |
| Download manifest | Trip reference/plan snapshot, plan/content revision, required asset URLs, total bytes và thời điểm save. Không chỉ một boolean downloaded; badge hiện dựa revision metadata. |
| Ask result | Selected POI, normalized exact question, response/source IDs và demo/fallback label. Saved answer có nhãn Saved answer; hiện chưa lưu timestamp/content revision cho từng answer. |
| AI entry context | Scope city/POI/current trip, ID tương ứng, màn mở sheet và state cần trở lại. Mở hội thoại không đổi trip/current hoặc tự apply. |
| Audio session | Một Audio object; POI/story đang nghe, vị trí nghe của từng story và playback status. Độc lập với trip progression; navigation/back không phải lệnh Play. |
| Demo identity/session | Profile/name/email và trạng thái session local; không mật khẩu, credential verifier, server token hoặc quyền sở hữu cloud. Guest và demo signed-in dùng cùng local trips. |
| User settings | Playback speed và reduced-motion preference local; tác động audio/CSS thực, không gọi API ngoài. Replay/about/privacy/downloads là entry riêng. |

V7 giữ nhiều personal trips. Template/library dùng chung, nhưng sửa một trip không lan sang trip khác. Chỉ một trip active toàn app; bắt đầu trip khác cần dialog xác nhận pause trip cũ. Cancel dialog giữ nguyên cả hai.

### Interface core hiện có để bàn giao

`GN_DATA.places` dùng IDs `cathedral`, `museum`, `lunch`, `beach`, `mountain`, `bridge`; start fixture là `river` hoặc một POI có tọa độ, không dùng lunch làm start. Đây là năm POI được đặt tên và một break, không phải sáu địa điểm đã xác minh. Templates `river-coast` và `slow-coast` là fixture, chưa field-test.

```text
plan = { id, title, revision, date, startId, startMinutes, budget,
         mode, endMode, stops: [{ id, duration, locked }] }
schedule(plan) -> { stops[{ arrival, departure, travelMinutes, distanceKm, ... }],
                    totalMinutes, finishMinutes, overBudget, travelMinutes,
                    visitMinutes, returnMinutes, returnDistanceKm, distanceKm,
                    routeKind: 'demo-fixture', hoursStatus: 'unverified' }
generate({ ...requirements, interests, pace, mustVisit })
  -> { ok: true, plan, explanations } hoặc { ok: false, reason, requiredMinutes? }
adjust(plan, { intent, lockedIds, preserveIds })
  -> { ok: true, plan, changes, explanations } hoặc { ok: false, reason, ... }
validate(plan) -> danh sách lỗi; [] chỉ có nghĩa hợp lệ theo fixture/rules
```

Core giới hạn bốn stops, tính cả break nếu được chọn; generation cần ít nhất hai stops. `endMode` hiện là `last` hoặc `start`, không geocode một địa chỉ tùy ý. Date/time window trong cùng ngày; duration min theo POI, max 180 phút/stop, budget 1–720 phút trong validation. Đây là giới hạn implementation demo, không phải tiêu chuẩn du lịch. Core không tự lưu trip, không gọi model/maps/GPS và không quản lý player/Cache API; app layer chịu các phần đó.

### Mapping app storage hiện tại

`localStorage['gonarra-v7-review']` chứa `{ version: 7, trips, favorites, packages, req, answers, onboarded }`, bổ sung `audioPositions`, `aiConversations`, `settings` và `account/session` demo khi sử dụng tính năng mới. `settings` mặc định speed 1/reducedMotion false; thiếu field mới không reset trip cũ. `account` chỉ name/email; `session` active/demo, không password hoặc server token. Trip là `{ id, plan, status, progress: { index, phase, visited, skipped }, createdAt, completedAt? }`; status code là `upcoming/active/paused/completed/ended` (planned/active/paused/completed/ended early trong docs). Phase `leg/stop` tách tới nơi với đã xác nhận.

`ui.edit` có `source/tripId/basePlan/plan/undo`, plan/progress stamps và unlock/extension guards; `ui.pending` là plan +15 chưa áp; `ui.review` có before/plan/kind/context/request/changes và guard data. `ui.route/placeId/tripId/stopTab`, `homeSnap/selectedMapPlace/selectedRoutePlace/navStep/welcomeStep` là context trong bộ nhớ; AI sheet thêm origin/context riêng. Refresh mở Welcome nếu chưa onboarded, hoặc Home để Resume; không hứa khôi phục mọi màn draft đang mở. `db.answers` lưu theo POI + normalized exact question; AI UI không đồng nghĩa có provider conversation memory. Vị trí nghe được giữ theo story trong phạm vi app hỗ trợ; không hứa cloud sync hoặc khôi phục qua reset storage.

## 2. Luồng các cửa vào

**Welcome:** lần đầu → 1 Hear stories at each stop → 2 Discover your Da Nang → 3 A day that fits you → Start → Home. Skip đi thẳng Home; Back trở về bước trước. Hoàn thành/Skip lưu `db.onboarded`; không permission/account/download. Home header → Settings → Replay welcome không xóa trips hoặc tiến độ.

**Ready-made:** Home/Explore → tour detail → Start tour. Action chuẩn bị/tái dùng personal trip thích hợp, xử lý active guard rồi vào leg, không đi qua màn Ready bắt buộc. Save for later lưu bản chưa bắt đầu; một Edit cho customize. Copy giữ template reference, không sửa template. Download một chạm ở card/detail chuẩn bị/tái dùng personal copy trước khi cache; Download không Start và Save không đồng nghĩa media đã ở trên máy.

**AI custom:** Home Plan my day 2h/4h/6h hoặc AI Guide → quick form/defaults và các lựa chọn chi tiết khi cần → generating demo → proposal có reasons inline → Edit/Adjust hoặc Start tour/Save for later. Inputs giữ khi hủy/lỗi; chưa accept không thay trip cũ. Missing/invalid known fields bị chặn trước generate. Start nhận đúng proposal người dùng đã review, không mở Ready và không bỏ bước preview/apply khi đang chỉnh một accepted trip.

Quick form dùng lại `req.endMode` và `req.mustVisit`, không reset chúng khi chọn chip thời gian hay Submit. Hint phải nói đúng final stop/return-to-start và số must-visits đang giữ; More options là cửa xem/chỉnh chúng. Đây không phải AI tự đoán các ràng buộc ẩn.

**Nghe riêng:** Explore/Detail → About hoặc Story/player/transcript; Listen phát tại Detail. Chủ động Play story B khi A đang phát → lưu vị trí A, Pause A, phát/resume B. Không cần confirmation cho thao tác nghe có thể đảo ngược; không tạo active trip, không ghi arrival và không đổi current pointer. Return to current stop đưa về đúng current context và không auto-play. Ended B không tự resume A hoặc chuyển stop.

**AI Guide / Ask:** tab AI Guide có city scope mặc định; người dùng đổi POI hoặc current-trip scope với context chip rõ. Detail Ask mở sheet đúng POI trên Detail; focused leg Ask mở sheet current stop. Dismiss giữ nguyên origin/selection/scroll và audio intent; mở rộng full screen rồi Back trở lại đúng origin. Sheet và tab dùng chung engine. Unsupported request nói phạm vi demo; câu hỏi không tự trở thành Adjust hoặc mutation.

**Profile / Settings:** Home profile icon → Profile → Settings riêng. Guest có lối Login/Sign up nhưng vẫn dùng app đầy đủ; profile local edit và Settings không buộc đăng nhập. Playback speed đổi `Audio.playbackRate` và control player; reduced motion đổi CSS behavior và được nhớ local cùng preference. Replay welcome, Downloads, About/privacy có entry rõ.

**Auth UI demo:** Login/Sign up kiểm format/required/confirm field theo form, mở session local nếu hợp lệ; không gửi network authentication. Forgot/Reset mô phỏng recovery UI và nói rõ **không gửi email, không đổi mật khẩu tài khoản thật**. Password chỉ tồn tại tạm trong input/validation; không đưa vào localStorage, transcript/AI context, query string, log hoặc network. Không dùng social sign-in giả. Sign out đóng session/ẩn profile cá nhân thích hợp nhưng giữ trips, progress, downloads, favorites và user settings; không tự pause/end/delete vì signout. Cloud ownership chưa có nên demo session không được coi là ranh giới bảo mật giữa những người cùng browser.

**Chỉnh đã có:** My Trips → trip → manual draft hoặc Adjust → kiểm trước/sau → update. Nếu đang active chỉ được tác động phần upcoming; past/current được giữ, trừ +15 current duration và closure replacement trước arrival theo hai flow riêng, có xác nhận rõ.

### Home map, drawer và focused navigation

- `homeSnap` là `compact/medium/full`; kích thước theo viewport/chữ, không native detent cố định. Compact có search + Continue hoặc Plan my day; medium thêm selected/place cards; full thêm curated tours. Grip button cycle hoặc pointer drag đổi mức; đổi mức không tạo/sửa trip. Search Home chuyển sang Explore cùng query thay vì tạo search state thứ hai; Explore giữ list/filter đầy đủ.
- Home pin → `selectedMapPlace` và selected card. Route map/list → `selectedRoutePlace` của itinerary đang xem. Cả hai chỉ selection; không ghi arrival. Route overview dùng cùng stops/timing và cho mở Detail của selected POI.
- Active leg giữ progress pointer; top instruction và Steps modal có **ba step mẫu**. `navStep` đổi theo người review chọn, không theo GPS, khoảng cách live hoặc nhận biết đã rẽ. Số phút/km là schedule fixture, không tự cập nhật từ vị trí thật.
- Mini-player dùng cùng `Audio` object với full player, không tạo stream khác. I'm here xác nhận thủ công. Về Home/Trips giữ plan/progress/audio state trong phiên; không auto Pause/Finish chỉ vì điều hướng. Focused leg ẩn bottom tabs để tập trung nhưng có Ask current-stop dạng sheet.
- Modal đóng bằng Close/Cancel/Escape khi phù hợp; thao tác xem step không thay accepted plan. Home drawer là nonmodal, không dùng cùng state với confirmation dialog.

Thiết kế và phép kiểm gesture/focus/reduced motion chi tiết ở [06-Mobile-UX-Research.md](06-Mobile-UX-Research.md) và [07-Design-System.md](07-Design-System.md).

## 3. State chuyến đi

| Từ state | Action | Kết quả |
|---|---|---|
| Chưa có trip | Accept proposal/template copy | Planned trip lưu local; không tự Start |
| Template/proposal | Start tour trực tiếp | Tạo/tái dùng personal trip, active guard rồi bắt đầu; không Ready gate |
| Planned | Start hợp lệ | Active, current là stop đầu chưa xử lý |
| Active | I'm here | Ghi xác nhận arrival cho current stop, đếm confirmed/visited; **không** chuyển next |
| Active, đã arrival | Finish stop | Ghi hoàn tất stop; chuyển current tới stop chưa xử lý kế tiếp |
| Active | Skip current | Ghi skipped, không ghi visited; chuyển next |
| Active | Pause | Paused; giữ pointer/confirmed/finished/skipped |
| Paused | Resume | Active ở đúng pointer, không auto-arrive hoặc replay một action |
| Active/Paused | End early + confirm | Ended early; giữ actual confirmed/skipped và những điểm chưa đi |
| Active | Không còn stop chưa xử lý sau Finish/Skip | Completed; summary ghi số confirmed/skipped, không nói tất cả đã tham quan nếu có skipped |
| Bất kỳ draft/proposal | Cancel/Keep current | Hủy pending state; accepted trip giữ nguyên |

`current` và `confirmed/visited` không đồng nghĩa: một người có thể đã tới current stop nhưng chưa Finish stop. Vì vậy count confirmed phải dựa record arrival, không đếm index hay số audio đã phát. I'm here idempotent cho cùng stop; nhiều lần nhấn không tăng số visited. Play/seek/Ask không ghi arrival hoặc finish.

Start chặn empty/invalid known constraints và giải thích lý do. Fixture unknown không biến thành guarantee thực địa; cảnh báo demo vẫn hiện. Kết thúc sớm và completed là hai outcome riêng; Resume card chỉ dành cho trip còn active/paused phù hợp, không hiện một trip đã kết thúc như chưa xong.

### Start, chống trùng và chuyến đang active

1. Target là trip hiện tại còn active/paused → Continue/Resume chính bản đó, không clone/reset current pointer.
2. Target từ template → tìm bản cùng template và ngày, chưa bắt đầu và chưa customize. Nếu có thì tái dùng; không ghi đè bản đã chỉnh hoặc đã đi. Không có candidate phù hợp mới tạo ID; tên mặc định có ngày để nhận diện.
3. Có active trip khác → dialog nêu hai trip, **Pause current & Start / Keep current**. Không tự End chuyến cũ. Cancel không đổi trạng thái/tiến độ hoặc lưu thêm bản rác; xác nhận thực hiện target/pause một lần.
4. Nhấn Start lặp/replay action không tạo thêm trip. Bản customized chỉ dùng lại khi người dùng chủ động chọn nó từ Trips; không coi là pristine template copy.
5. Download nudge/badge ở card/detail là tùy chọn, Start online vẫn dùng được. Không mở sheet chỉ để lặp lại title/Start/download như màn Ready cũ.

## 4. State chỉnh tay và proposal

Manual editor mở một bản draft của trip, không ghi trực tiếp từng gesture vào accepted trip. V7 dùng **Move up/down**, chưa triển khai drag; duration picker, add, remove và Undo lần remove cuối cùng cập nhật draft/schedule. Cancel phục hồi toàn bộ thứ tự/duration ban đầu. Update đi qua Review; Apply cần validation và base revision còn đúng. Nếu conflict/stale thì giữ draft và cho re-open/review, không overwrite âm thầm. Đây là invariant cần evidence, không phải pass claim.

| State | UI/hành vi |
|---|---|
| Unchanged draft | Xem bản sao; Update không hứa có thay đổi |
| Dirty valid | Hiện tổng tính lại, diffs; có Update/Cancel |
| Dirty conflict | Nêu trường vượt budget/duplicate/missing stop; giữ draft; không save như hợp lệ |
| Removed stop | Undo khôi phục đúng stop/thứ tự/duration trong draft |
| Applying | Khóa lệnh apply lặp; sau thành công cập nhật một lần |
| Base stale | Nêu bản nguồn đã đổi; không ghi đè state mới; giữ lựa chọn để xem lại |

AI Adjust có request, must-keep/locked IDs và phần được phép đổi. Chỉ đổi **upcoming chưa khóa** khi active: past/current giữ, locked upcoming cũng giữ. UI review hiển thị riêng phần protected/locked và lý do từ chối nếu yêu cầu không khả thi. Request ngoài demo-supported set nhận thông báo phạm vi, không sinh kết quả giả. Review có trước/sau: stop giữ/bỏ/thêm, duration đổi, transfer và total. Apply recheck locks/active prefix/base revision ngay trước ghi. Keep current không thay dữ liệu.

## 5. +15 và xử lý thời gian

**+15 mở preview, chưa commit duration.** Pending plan tăng duration current stop thêm 15 phút, tính lại kết thúc/travel/total bằng core và chỉ rõ có vượt budget không. Không dùng một số giờ kết thúc hardcode khác với itinerary.

Các lựa chọn:

- **Apply longer schedule / Confirm +15:** xác nhận tăng duration current; giữ các stop khác, thông báo budget/warnings tương ứng.
- **Review later visits:** mở manual draft trên pending +15 plan; chỉ chỉnh upcoming. Cancel quay về accepted trip chưa +15.
- **Adjust remaining tour:** tạo demo AI proposal từ pending +15 plan, giữ current duration đã tăng trong đề xuất và giữ past/current/must-keep; chưa apply cho tới review xác nhận.
- **Keep current plan:** thoát, không tăng duration và không sửa lịch.

Thời gian chưa đủ cho phần còn lại không cho phép tự bỏ điểm khóa. Một rule “trễ hơn ngưỡng” hoặc review-panel injection là cảnh báo; không tự gọi AI hoặc áp một plan mới. Không tuyên bố prototype có đồng hồ/GPS phát hiện khách thật ở quá lâu nếu chưa có implementation và evidence.

## 6. Tính lịch và context

Một hàm core là nguồn chung cho visit sum, transfer sum, start leg, end leg nếu có, total/end time, budget remaining và conflicts. Generated plan, manual draft, +15 preview, change review và recap lấy từ cùng schedule; không duy trì số tổng riêng trong UI.

Routes trong V7 là fixture, không live ETA. Nếu break generic chưa có vị trí, nó là khoảng nghỉ có semantics rõ; không dựng tọa độ nhà hàng và không gọi travel của nó là route provider thật. Thay mode chỉ nhận sau preview/confirm nếu mode fixture được hỗ trợ. Không suy từ mode label thành tính khả thi đường hoặc quyền lưu/vẽ map SDK.

Selected POI dùng cho Detail/Ask/player; current trip stop dùng cho progression. I'm here/Finish/Skip phải kiểm current stop của trip được action hướng tới; mở story khác không đổi field đó. External Maps dùng tọa độ/địa điểm có nhãn fixture; không khẳng định entrance đã field-verified. Khi quay lại không auto-advance; refresh/restore trip và cho manual action.

## 7. Persistence và mất mạng

- Accepted trips, progress và selection cần thiết lưu localStorage với schema version; refresh khôi phục ID/state, không tạo trip trùng.
- Draft/input giữ qua điều hướng/lỗi đúng scope; không hứa draft chưa save sống qua mọi storage reset nếu chưa kiểm.
- Local-only nghĩa là dữ liệu trên trình duyệt/thiết bị này; xóa site data hoặc đổi browser không có cloud backup. Không dùng nút reset không xác nhận; chỉ reset khóa của prototype.
- Profile/session cũng local-only. Sign out không phải Reset; login email khác không chuyển sang một account library được server bảo vệ. Không có password/token server trong storage hoặc audio/AI metadata. Validation pass không xác nhận người dùng sở hữu email.
- Save/arrival/finish/skip của V7 là **local mutations**, không chờ server xác nhận và không được gắn nhãn “synced”. Đây khác bản thiết kế DaNavi có offline server queue.
- Offline có saved local plan/text và media đã cache thật. New Generate/Adjust và POI answer chưa lưu bị chặn theo offline state dù thuật toán demo là local; đây là mô phỏng giới hạn sản phẩm tương lai, không LLM offline. POI Ask chỉ mở exact question đã lưu, nhãn Saved answer/source IDs cũ; chưa có expiration/revision check riêng. Static city/help text hoặc lịch sử hội thoại đã ở local có thể đọc offline, không là câu trả lời AI mới.
- Download thất bại không xóa trip đã lưu. Trip edit đổi manifest dependency; giữ asset bytes không đổi, cho retry/update phần thiếu, không nhận cả gói ready chỉ vì metadata đã ghi.

### Closure review case

Closure trong Review panel là **mô phỏng**, không là tin venue thật. Nhánh replacement cho chọn một POI khác chưa nằm trong plan, preview route/timing rồi confirm, chỉ khi current chưa arrival/visited hoặc skipped. Nếu target locked, cần xác nhận unlock riêng trước xem alternatives; Keep locked không sửa plan. Apply kiểm plan/progress stamps và giữ các stop còn lại; không ứng viên thì báo rõ.

Đây là exception có chủ ý của quy tắc current fixed. Current đã confirmed không được thay bằng venue khác để viết lại lịch sử; UI chuyển sang chỉnh upcoming, hoặc dùng Finish/end. Skip chỉ hợp lệ khi chưa confirmed. +15 cho phép chính người dùng tăng duration của current đã confirmed, kể cả current locked, nhưng giữ ID/lock flag/past history và cần apply rõ. Chưa có closure service thật; phải xem evidence tương ứng trước gọi nhánh replacement đã test pass.

## 8. Invariants để review

1. Template không bị sửa qua personal trip; trip này không đổi trip khác.
2. Tối đa một active trip; start another phải có xác nhận pause trip hiện tại.
3. Arrival count từ confirmed records, skip không phải visited, Play không advance.
4. Cancel/Keep current không ghi pending proposal/draft/+15 vào accepted trip.
5. Trong active trip, mọi apply giữ past/current/locked prefix, ngoại trừ +15 đã xác nhận hoặc current-unvisited closure replacement đã unlock/preview/apply đúng flow riêng.
6. Mọi total/diff/time warning có cùng input/revision và core tính lịch.
7. Story context và trip progression độc lập.
8. Saved trip, cached assets và readiness của package là ba trạng thái riêng.
9. Start trực tiếp không sinh bản trùng khi nhấn lại; không tự kết thúc active trip khác hoặc ghi đè customized copy.
10. Một Audio object phát tối đa một story; đổi bài có chủ ý giữ vị trí cũ, Back/Return/Ended không tự phát bài khác hoặc ghi progress.
11. Ask sheet giữ origin; scope hiển thị và scope dùng để lookup/adjust phải khớp. Tab AI không tạo một accepted plan thứ hai ngầm.
12. Guest không bị auth gate; Sign out giữ dữ liệu chuyến đi. Password không persist/truyền; Forgot không claim email đã gửi và Reset không claim đổi tài khoản thật.
13. Settings có effect thực: speed khớp audio/player, reduced motion khớp CSS; Reload giữ preference local trong phạm vi browser hỗ trợ.

Kịch bản xác minh và cách đọc kết quả ở [04-Validation-Handoff.md](04-Validation-Handoff.md).

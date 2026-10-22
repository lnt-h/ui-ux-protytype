# GoNarra V7 — Flow, state và bảo toàn dữ liệu

Baseline hợp đồng ngày 22/10/2026. Tên dưới đây mô tả ý nghĩa dữ liệu; tên property thực trong `prototype/core.js`/`app.js` là nguồn để debug. Sau thay đổi code phải giữ các invariant và acceptance ở đây; không gọi kết quả kiểm thử là đã đạt chỉ vì có mô tả.

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

`localStorage['gonarra-v7-review']` chứa `{ version: 7, trips, favorites, packages, req, answers, onboarded }`. Trip là `{ id, plan, status, progress: { index, phase, visited, skipped }, createdAt, completedAt? }`; status trong code là `upcoming/active/paused/completed/ended` (tương ứng planned/active/paused/completed/ended early trong tài liệu). Phase `leg/stop` tách hành trình tới nơi với giai đoạn đã xác nhận.

`ui.edit` có `source/tripId/basePlan/plan/undo`, plan/progress stamps và unlock/extension guards; `ui.pending` là plan +15 chưa áp; `ui.review` có before/plan/kind/context/request/changes và guard data. `ui.route/placeId/tripId/stopTab`, `homeSnap/selectedMapPlace/selectedRoutePlace/navStep/welcomeStep` là context trong bộ nhớ. Refresh mở Welcome nếu chưa onboarded, hoặc Home để Resume; không hứa khôi phục mọi màn draft đang mở. `db.answers` lưu global theo POI + normalized exact question, không gắn lịch sử chat vào trip hoặc gửi memory tới provider.

## 2. Luồng các cửa vào

**Welcome:** lần đầu → bước 1 → Next → bước 2 → Let's explore → Home; Skip ở mỗi bước đi thẳng Home, Back ở bước 2 về bước 1. Hoàn thành/Skip lưu `db.onboarded`; không permission/account/download. Replay từ review/settings không xóa trips.

**Ready-made:** Home/Explore → tours → tour detail → Use this tour → saved Ready, hoặc Customize copy trước Save. Copy giữ template reference, nhận ID riêng. Download hiện mở từ saved trip; Download không Start và Save không đồng nghĩa có media trên máy.

**AI custom:** Requirements → Preferences/must-keep → generating demo → proposal/reasons → manual editor hoặc Adjust → preview → accept/save → Ready → Start. Inputs giữ khi hủy/lỗi; chưa accept không thay trip cũ. Những field thiếu/invalid bị chặn trước generate.

**Nghe riêng:** Search/Library/Detail → player/transcript/Info/Ask → back. Không tạo active trip, không ghi arrival và không đổi current pointer. Quay lại chuyến cũ vẫn đúng stop/player context.

**Chỉnh đã có:** My Trips → trip → manual draft hoặc Adjust → kiểm trước/sau → update. Nếu đang active chỉ được tác động phần upcoming; past/current được giữ, trừ +15 current duration và closure replacement trước arrival theo hai flow riêng, có xác nhận rõ.

### Home map, drawer và focused navigation

- `homeSnap` là `compact/medium/full`; CSS hiện đặt khoảng 24%/48%/82% phần map-content. Đây là preset prototype, không native detent cố định cho mọi máy. Grip button cycle hoặc pointer drag đổi mức; đổi mức không tạo/sửa trip. Explore giữ list độc lập.
- Home pin → `selectedMapPlace` và selected card. Route map/list → `selectedRoutePlace` của itinerary đang xem. Cả hai chỉ selection; không ghi arrival. Route overview dùng cùng stops/timing và cho mở Detail của selected POI.
- Active leg giữ progress pointer; top instruction và Steps modal có **ba step mẫu**. `navStep` đổi theo người review chọn, không theo GPS, khoảng cách live hoặc nhận biết đã rẽ. Số phút/km là schedule fixture, không tự cập nhật từ vị trí thật.
- Mini-player dùng cùng `Audio` object với full player, không tạo một stream khác. I'm here vẫn cần xác nhận thủ công. Về Home/Trips từ focused view giữ plan/progress/audio state trong phiên; không auto Pause/Finish chỉ do điều hướng.
- Modal đóng bằng Close/Cancel/Escape khi phù hợp; thao tác xem step không thay accepted plan. Home drawer là nonmodal, không dùng cùng state với confirmation dialog.

Thiết kế và phép kiểm gesture/focus/reduced motion chi tiết ở [06-Mobile-UX-Research.md](06-Mobile-UX-Research.md) và [07-Design-System.md](07-Design-System.md).

## 3. State chuyến đi

| Từ state | Action | Kết quả |
|---|---|---|
| Chưa có trip | Accept proposal/template copy | Planned trip lưu local; không tự Start |
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

AI Adjust có request, must-keep/locked IDs và phần được phép đổi. Những request ngoài demo-supported set nhận thông báo phạm vi, không sinh kết quả giả. Review changes phải có trước/sau: stop nào giữ/bỏ/thêm, duration nào đổi, transfer và total. Apply phải recheck locked/active prefix/base revision ngay trước ghi. Keep current không thay dữ liệu.

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
- Save/arrival/finish/skip của V7 là **local mutations**, không chờ server xác nhận và không được gắn nhãn “synced”. Đây khác bản thiết kế DaNavi có offline server queue.
- Offline có saved local plan/text và các media đã được cache thật. New Generate/Adjust/Ask bị chặn theo offline state dù thuật toán demo là local; đây là mô phỏng giới hạn sản phẩm tương lai, không phải LLM offline. Ask chỉ mở lại exact question đã lưu, nhãn Saved answer và source IDs cũ; hiện chưa có expiration/revision check riêng cho cached answer.
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

Kịch bản xác minh và cách đọc kết quả ở [04-Validation-Handoff.md](04-Validation-Handoff.md).

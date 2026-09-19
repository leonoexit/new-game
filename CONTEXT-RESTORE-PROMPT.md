# Prompt Khôi Phục Ngữ Cảnh — Little Valley Cards

Tiếp tục dự án tại `/Volumes/LeNguyen02SSD/Programming/new-game`.

Trước khi sửa code, đọc đầy đủ:

- `PROJECT-STATUS.md`
- `prototype/little-valley-cards/README.md`
- `CONTEXT-RESTORE-PROMPT.md`
- `STYLE.md`, `little-valley-cards-art-bible-v0.1.md` và `.agents/skills/little-valley-cards-art/SKILL.md` nếu làm raster art

Không khôi phục One Good Day. Không discard thay đổi hiện có. Không commit/push nếu user chưa yêu cầu. Không tự điều khiển browser; user là hands-on tester.

## Git checkpoint

Commit cuối đã push là:

```text
c99babe — Add tap interaction alongside drag controls
```

Các experiment World-time, Shipping Bin, Tool system, Hand và day-only settlement đều đang là WIP chưa commit và phải được bảo toàn.

## Core đã được kiểm chứng

Little Valley Cards là solo farm-management game màn dọc, nơi card là vật thể tồn tại liên tục. Không có draw pile, play limit, Action Points công khai hoặc fixed target row. Vùng dưới màn hình là Hand của persistent cards, không phải random-card system.

Tap và drag dùng cùng engine. Selection chỉ là UI state tạm thời. Core loop hai plot/một Farmer đã được user playtest tích cực; phải bảo vệ tốc độ, tactile feel, output trực tiếp trên board, quyền tự sắp xếp và palette handheld tươi sáng.

## Hand

Backpack UI đã bị loại bỏ. Hand là khu chứa card vật thể cầm nắm được và Landmark card:

- Tool, Seeds và Carrots là portable;
- Hoe, Watering Can và Sickle bắt đầu trong Hand;
- tap/play item trong Hand để equip;
- nếu Farmer đang mang item khác, item cũ quay lại Hand;
- kéo portable card vào Hand để cất;
- Farmer có một carrying slot;
- Tool, Seeds và Carrots được sort gần nhau; Landmark cards nằm group riêng;
- card trong Hand vẫn là chính object đó, không bị clone hoặc chuyển thành dữ liệu inventory trừu tượng.

## Tool system

- Sickle cắt cỏ từ Wild Soil và tạo Cleared Ground.
- Hoe xới Cleared Ground thành Empty Plot.
- Watering Can có đúng một card và hai charges.
- Stone Well refill chính card Watering Can, không spawn Water/container.
- Mature Carrots được Farmer hái bằng tay không; Farmer phải free hands.
- Harvested Carrots đi thẳng vào Hand.
- Tool không bị consume và toàn world luôn có đúng một card của mỗi Tool.

Hand có nút **Free hands** để trả vật đang mang trước khi harvest.

## Water và Seeds không còn thứ tự bắt buộc

Sau khi clear, cả hai flow đều hợp lệ:

```text
Empty Plot -> water -> Watered Plot -> sow -> Watered Carrot Plot
Empty Plot -> sow -> thirsty Carrot Plot -> water -> Watered Carrot Plot
```

Cleared Ground, Watered Plot và Watered Carrots đều có art riêng để state tự giải thích bằng hình.

## Money và economy

Coin Purse card đã bị loại khỏi runtime. Money là `state.coins` và hiển thị trên HUD.

General Store nằm ở Valley Town và có nút Buy Seeds giá hai coins. Farmer phải ở Town mới mua được. Seeds mua xong đi thẳng vào Hand. Sáu coins là milestone không khóa simulation. Automated economy tiếp tục qua lần mua thứ hai và đạt mười coins.

## Landmark và Area

- Home Farm và Valley Town là hai card table riêng, được access bằng Landmark card trong Hand.
- Chơi Valley Town Landmark để chuyển Farmer và carried card sang Town.
- Chơi Home Farm Landmark để quay lại Farm.
- Landmark vẫn tồn tại trong Hand sau khi chơi.
- Không còn carousel hoặc remote-table browsing state.
- Store thuộc Town; plots, Well và Shipping Bin thuộc Farm.
- End Day chỉ khả dụng khi Farmer ở Home Farm.
- Travel chưa tốn time trong experiment hiện tại.

## Action Point direction — chưa triển khai

Game sẽ có một lượng **Action Point (AP) hữu hạn mỗi ngày** để người chơi phải tính toán hành động tiếp theo. Đây là hướng thiết kế đã thống nhất, nhưng runtime hiện tại vẫn chưa có AP; không được mô tả như feature đã hoàn thành.

Nguyên tắc hiện tại:

- equip/play Tool từ Hand: **0 AP**;
- đổi Tool hoặc trả card về Hand: **0 AP**;
- chơi Landmark để di chuyển Area: **1 AP**;
- mua Seeds: **0 AP**;
- bỏ Carrots vào Shipping Bin: **0 AP**;
- thực hiện Sickle, Hoe, sow, water, refill hoặc harvest lên target: baseline **1 AP**;
- kéo Farmer tới target hiện chỉ là cách chọn/resolve card interaction, chưa phải movement system và không có AP riêng;
- water một plot card đại diện vùng 3×3 vẫn chỉ **1 AP**, không dùng 2 AP ở baseline;
- AP chỉ trừ khi Landmark/work interaction resolve thành công, không trừ khi select, drag, swap, buy hoặc deposit;
- hết AP có thể tự kết thúc ngày; End Day thủ công vẫn được giữ.

Con số **10 AP** trước đó chỉ là placeholder, không có ý nghĩa đặc biệt. **8 AP** có thể là baseline thử nghiệm đầu tiên: Landmark Town → mua Seeds → Landmark Farm → Sickle → Hoe → sow → water một plot tốn khoảng 6 AP, còn lại một ít dư địa nhưng chưa đủ thoải mái cho hai plot.

AP tạo ra quyết định trong ngày. Day boundary vẫn cần để reset AP, làm crop growth và thanh toán Shipping Bin, nhưng chưa cần khôi phục Morning/Afternoon/Evening/Night.

Ý tưởng mở bỏ ngỏ: các Person card trong tương lai có thể tăng AP tạm thời, giảm AP tiêu hao của một nhóm action, hoặc thay đổi luật AP trong một ngày. Chưa chốt ontology, giá trị hay cách kích hoạt.

## Time sau playtest

Morning/Afternoon/Evening/Night và work marks đã bị tháo khỏi playable UI vì user không cảm được tác động và chúng không tạo decision.

Time hiện chỉ có day boundary trung thực:

- End Day làm watered crops trưởng thành qua đêm;
- End Day thanh toán Shipping Bin;
- day counter tăng;
- work, movement, equip và purchase không tiêu hidden time;
- General Store luôn mở nhưng chỉ dùng được khi Farmer ở Town.

Lưu ý: câu trên chỉ nói về time system hiện tại. Khi AP được triển khai, travel và purchase sẽ có AP cost hiển thị rõ ràng.

Đây chưa phải strategic time management. Không thêm Weather, Season, story, NPC schedule hoặc travel cost trước khi có một trade-off thật sự.

## Art mới

Cleared Ground, Watered Plot, Watered Carrots, General Store, Home Farm Landmark và Valley Town Landmark có image riêng. Source, prompt, processed output và review preview nằm trong các thư mục tương ứng dưới `art/style-studies/`; runtime files nằm trong `prototype/little-valley-cards/assets/`.

## Việc cần làm ngay khi quay lại

1. Chạy test, syntax checks và `git diff --check`.
2. Hands-on test Hand ở đáy: item cards gần nhau, Landmark group riêng, không còn Backpack/Carousel.
3. Test chuỗi Landmark → Store → Landmark → Tool → sow/water → End Day → harvest → Shipping Bin.
4. Kiểm tra Landmark active có trạng thái `Here`, vẫn nằm trong Hand, và carried card đi cùng Farmer.
5. Kiểm tra drag về Hand, swap item, responsive mobile và Hand không che target.
6. Giữ server `http://127.0.0.1:8080/` chạy; không commit/push.

## Những điều còn bỏ ngỏ

- Hand đáy màn hình có tạo cảm giác cầm bài tốt hơn Backpack không?
- Landmark chỉ là navigation card hay sau này có thêm tác dụng riêng?
- Có cần giới hạn số card trong Hand không?
- Khi nào travel mới cần tốn time hoặc tạo trade-off?
- AP baseline nên là 8, 10 hay một con số khác sau hands-on playtest?
- Person cards sẽ cộng AP, giảm cost, hay tạo modifier theo action?
- AP có reset cứng mỗi ngày hay có thể giữ lại một phần?

## Verification

```sh
cd /Volumes/LeNguyen02SSD/Programming/new-game
npm --prefix prototype/little-valley-cards test
git diff --check
git status --short
```

Expected:

```text
Hand/Landmark/day-cycle smoke test passed: Landmark cards travel between Farm and Town, item cards stay grouped in Hand, Tools work, hand-harvest resolves, and the repeat economy remains valid.
```

Sau khi checks pass, mở server chỉ trên localhost:

```sh
cd prototype/little-valley-cards
python3 -m http.server 8080 --bind 127.0.0.1
```

Gửi user `http://127.0.0.1:8080/` và chờ hands-on feedback.

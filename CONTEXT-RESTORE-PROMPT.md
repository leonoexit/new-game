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
f3e19b7 — Build persistent hand and landmark travel loop
```

Toàn bộ AP v0.1, crop lifecycle, Green Beans, compact UI, generated backgrounds và Landmark swap hiện là WIP chưa commit và phải được bảo toàn. Không reset/discard worktree.

`stardew rules.pdf` là tài liệu user thêm và vẫn đang untracked; không xóa hoặc sửa file này.

## Core đã được kiểm chứng

Little Valley Cards là solo farm-management game màn dọc, nơi card là vật thể tồn tại liên tục. Không có draw pile, play limit hoặc fixed target row. Game có AP công khai theo ngày; vùng dưới màn hình là Hand của persistent cards, không phải random-card system.

Tap và drag dùng cùng engine. Selection chỉ là UI state tạm thời. Core loop hai plot/một Farmer đã được user playtest tích cực; phải bảo vệ tốc độ, tactile feel, output trực tiếp trên board, quyền tự sắp xếp và palette handheld tươi sáng.

Khi Farmer đang cầm item, target hợp lệ tự glow và có thể tap trực tiếp mà không cần select Farmer trước. Carried item render trên Farmer. Description trên card bị ẩn trong trạng thái thường và chỉ hiện bằng long-press.

Kéo carried item lên target resolve qua Farmer nên stack Seeds còn lại vẫn dùng được. Kéo item ra chỗ trống mới detach; kéo vào Hand để cất.

Farm Lane và các semantic board zone đã bị loại bỏ. Farm và Town dùng generated native-pixel background riêng để gợi Area mà không chiếm vùng đặt card.

UI đã được nén về một màn hình portrait: HUD duy nhất chứa Day, Area, AP, coins và End Day; brand strip, day strip, hint box, Area ribbon và status bar cũ đã bị loại bỏ. Table chiếm toàn bộ phần giữa HUD và Hand cố định.

User xác nhận điều khiển hiện vẫn còn vài chỗ bất tiện nhưng có thể sửa sau. Không ưu tiên polish gesture trước bước thiết kế crop tiếp theo, trừ khi interaction bị block hoàn toàn.

## Đánh giá architecture hiện tại

Project ổn ở mức **prototype có kỷ luật**, chưa phải Clean Architecture hoàn chỉnh:

- `data.js` chứa CARD_DEFS, CROPS và config;
- `engine.js` dùng pure state transition và không phụ thuộc DOM;
- `app.js` render UI, localStorage và pointer/drag gesture;
- `smoke-test.mjs` bảo vệ core loop.

Technical debt hiện tại:

- `engine.js` đang ôm crop, AP, travel, store, shipping và text message;
- `CARD_DEFS` trộn domain tag với presentation/art path;
- `app.js` trộn render, persistence và input controller;
- action/crop transition vẫn phụ thuộc nhiều vào string `typeId`.

Không làm big-bang architecture refactor lúc này. Boundary nhỏ `crop-system.js` đã được tách để chứa sow, water, overnight growth, harvest, regrow, rain và week label. `engine.js` tiếp tục điều phối AP/action; chưa cần tạo nhiều layer enterprise.

## Hand

Backpack UI đã bị loại bỏ. Hand là khu chứa card vật thể cầm nắm được và Landmark card:

- Tool, Seeds, Carrots và Green Beans là portable;
- Hoe, Watering Can và Sickle bắt đầu trong Hand;
- tap/play item trong Hand để equip;
- nếu Farmer đang mang item khác, item cũ quay lại Hand;
- kéo portable card vào Hand để cất;
- Farmer có một carrying slot;
- Tool, Seeds và Produce được sort gần nhau; Landmark đích nằm trong Hand và phải được kéo lên table để travel;
- các card cùng type trong Hand render thành một chồng, badge cộng tổng quantity và chơi lá trên cùng;
- card trong Hand vẫn là chính object đó, không bị clone hoặc chuyển thành dữ liệu inventory trừu tượng.

Seeds và Produce cùng loại tự gộp thành một card `×N`; Tool và Landmark vẫn giữ identity riêng.

## Tool system

- Sickle cắt cỏ từ Wild Soil và tạo Cleared Ground.
- Sickle cũng remove crop thirsty/watered/mature với giá 1 AP, không tạo Produce và trả Land về Empty Plot.
- Hoe xới Cleared Ground thành Empty Plot.
- Watering Can có đúng một card và hai charges.
- Watering Can rỗng và có nước dùng hai artwork riêng; charge một hoặc hai dùng filled art có mặt nước nhìn thấy được.
- Stone Well refill chính card Watering Can, không spawn Water/container.
- Mature crop được Farmer hái bằng tay không; Farmer phải free hands.
- Harvested Produce đi thẳng vào Hand.
- Tool không bị consume và toàn world luôn có đúng một card của mỗi Tool.

Hand có nút **Return item** để trả vật đang mang trước khi harvest. Carried item thả ngoài valid target cũng tự về Hand; không còn detach thành loose board card.

Long-press item trong Hand mở inspection panel. Seed description phải nêu đủ cost, số watered nights tới first harvest, yield và regrow; không quay lại generic one-line description.

## Water và Seeds không còn thứ tự bắt buộc

Home Farm có đúng hai Land card persistent: một Empty Plot đã sẵn sàng và một Wild Soil để dạy Sickle → Hoe. Land không spawn hoặc bị consume; prepared field không tự quay lại Wild Soil.

Sau khi clear, cả hai flow đều hợp lệ:

```text
Empty Plot -> water -> Watered Plot -> sow -> Watered Carrot Plot
Empty Plot -> sow -> thirsty Carrot Plot -> water -> Watered Carrot Plot
```

Cleared Ground, Watered Plot và Watered Carrots đều có art riêng để state tự giải thích bằng hình.

## Crop lifecycle v0.1

- Carrots cần hai đêm được tưới để trưởng thành.
- Sow vào Watered Plot tính là đã tưới trong ngày hiện tại.
- End Day chỉ advance crop đã tưới; crop chưa mature trở lại thirsty vào sáng hôm sau.
- Không tưới thì growth pause, không chết và không reset.
- Watered Plot chưa gieo sẽ khô lại thành Empty Plot qua đêm.
- Mature crop chờ tới khi harvest; harvest trả chính Land card đó về Empty Plot.

Green Beans đã được thêm như crop khác biệt:

- Store bán một Green Bean Seed giá hai coins;
- lần đầu cần ba watered nights, thu hoạch bốn Beans;
- vines giữ lại trên Land và regrow sau hai watered nights;
- missed water chỉ pause;
- dry, watered, mature, seed và produce dùng artwork riêng.

## Money và economy

Coin Purse card đã bị loại khỏi runtime. Money là `state.coins` và hiển thị trên HUD.

General Store nằm ở Valley Town và bán từng đơn vị Seed: một coin mua một Carrot Seed, hai coins mua một Green Bean Seed. Mua nhiều lần tăng `×N` trên Seed card cùng loại. Farmer phải ở Town mới mua được. Sáu coins là milestone không khóa simulation.

## Landmark và Area

- Home Farm và Valley Town là hai card table riêng. Landmark của Area hiện tại nằm face-up trên table; Landmark đích nằm trong Hand.
- Kéo Valley Town Landmark từ Hand lên table để chuyển Farmer và carried card sang Town.
- Kéo Home Farm Landmark từ Hand lên table để quay lại Farm.
- Tap Landmark chỉ hiện nhắc thao tác, không travel.
- Landmark được chơi trở thành table card mới; Landmark của Area trước quay lại Hand.
- Không còn carousel hoặc remote-table browsing state.
- Store thuộc Town; plots, Well và Shipping Bin thuộc Farm.
- End Day khả dụng ở mọi Area và Farmer luôn thức dậy tại Home Farm.
- Mỗi lượt travel tốn một AP.

## Action Point v0.1 — đã triển khai

Mỗi ngày bắt đầu với **8 Action Point (AP)** hiển thị trên HUD. Đây là baseline playtest, chưa phải con số balance cuối cùng.

Nguyên tắc hiện tại:

- equip/play Tool từ Hand: **0 AP**;
- đổi Tool hoặc trả card về Hand: **0 AP**;
- chơi Landmark để di chuyển Area: **1 AP**;
- mua Seeds: **0 AP**;
- bỏ Carrots vào Shipping Bin: **0 AP**;
- thực hiện Sickle, remove crop, Hoe, sow, water, refill hoặc harvest lên target: baseline **1 AP**;
- kéo Farmer tới target hiện chỉ là cách chọn/resolve card interaction, chưa phải movement system và không có AP riêng;
- water một plot card đại diện vùng 3×3 vẫn chỉ **1 AP**, không dùng 2 AP ở baseline;
- AP chỉ trừ khi Landmark/work interaction resolve thành công, không trừ khi select, drag, swap, buy hoặc deposit;
- hết AP không tự kết thúc ngày để free actions vẫn dùng được;
- End Day ở bất kỳ Area nào reset AP về tám và đưa Farmer cùng carried card về Home Farm.

Con số **10 AP** trước đó chỉ là placeholder. **8 AP** đang là baseline thử nghiệm đầu tiên: Landmark Town → mua Seeds → Landmark Farm → Sickle → Hoe → sow → water một plot tốn khoảng 6 AP, còn lại một ít dư địa nhưng chưa đủ thoải mái cho hai plot.

AP tạo ra quyết định trong ngày. Day boundary vẫn cần để reset AP, làm crop growth và thanh toán Shipping Bin, nhưng chưa cần khôi phục Morning/Afternoon/Evening/Night.

Ý tưởng mở bỏ ngỏ: các Person card trong tương lai có thể tăng AP tạm thời, giảm AP tiêu hao của một nhóm action, hoặc thay đổi luật AP trong một ngày. Chưa chốt ontology, giá trị hay cách kích hoạt.

## Time sau playtest

Morning/Afternoon/Evening/Night và work marks đã bị tháo khỏi playable UI vì user không cảm được tác động và chúng không tạo decision.

Time hiện chỉ có day boundary trung thực:

- End Day advance watered crops một growth step qua đêm;
- End Day thanh toán Shipping Bin;
- day counter tăng;
- work và travel tiêu AP công khai; equip và purchase miễn phí;
- General Store luôn mở nhưng chỉ dùng được khi Farmer ở Town.

Đây mới là opportunity budget theo ngày, chưa phải strategic time management đầy đủ. Carrot hai đêm và Green Beans regrow đã được triển khai.

Kết luận hiện tại: không thêm hunger, HP, tax, Tool durability hay Crop Remains. Crop khóa Land và missed watering đốt thời gian, nhưng tuần kết thúc không phá hủy tiến độ; farm phải tạo cảm giác là một thế giới persistent.

Crop lifecycle hiện có **Micro-season v0.1 — Spring Week 7 ngày**. Bảy ngày chỉ là test horizon, chưa phải độ dài season canonical.

Behavior đã chốt để playtest:

- HUD hiện `Spring Wn · Day n/7`;
- End Day thứ bảy tạo season boundary thật;
- Weekly Journal hiện coins kiếm được, harvest count và crop đang tiếp tục lớn;
- Continue Farm bắt đầu tuần mới nhưng giữ nguyên toàn bộ Land, crop, Tool, supplies và coins;
- Reset Farm là full restart riêng biệt.

## Art mới

Cleared Ground, Watered Plot, Watered Carrots, Green Beans lifecycle, General Store, Home Farm Landmark và Valley Town Landmark có image riêng. Home Farm và Valley Town cũng có generated table background riêng. Source, prompt, processed output và review preview nằm trong các thư mục tương ứng dưới `art/style-studies/`; runtime files nằm trong `prototype/little-valley-cards/assets/`.

Filled Watering Can có source, processed output và record tại `art/style-studies/item-card-watering-can-filled-v0.1/`; runtime file là `watering-can-filled.png`.

## Micro-season v0.1 — đã triển khai

- HUD hiển thị `Spring Wn · Day n/7`.
- End Day ngày 7 vẫn xử lý crop growth và shipping, rồi kết thúc tuần thay vì tạo ngày 8.
- Weekly Journal theo dõi coins kiếm từ shipment, số lần harvest và crop đang lớn.
- Continue Farm sang tuần kế tiếp với nguyên trạng farm; không còn Crop Remains hoặc cleanup mode.
- `crop-system.js` sở hữu sow, water, overnight growth, harvest, regrow và season label; `engine.js` tiếp tục điều phối.
- Rainy Home Farm background đã runtime-approved. Forecast prototype cố định ngày 6 có mưa; đầu ngày mưa tự water Empty Plot và thirsty crop, không tốn AP. HUD hiện Sun/Rain.

## Việc cần làm ngay khi quay lại

Hands-on test một Spring Week hoàn chỉnh. Không tự điều khiển browser nếu người dùng chưa yêu cầu.

1. Đọc đủ bốn tài liệu đầu prompt và chạy verification trước khi sửa.
2. Không commit/push nếu user chưa yêu cầu; bảo toàn toàn bộ uncommitted art/code và `stardew rules.pdf`.
3. Hands-on playtest qua boundary của hai Spring Week để xác nhận farm continuity.
4. Thiết kế thêm crop variety và Quality nhưng chỉ khi mỗi crop có hành vi/card transformation riêng.
5. Sau playtest mới balance price, yield, growth days, AP hoặc week length.
6. Chỉ quay lại polish gesture/layout sau khi crop-season loop không còn blocker.
7. Khởi động localhost server khi cần; user tự thao tác browser.

## Những điều còn bỏ ngỏ

- Weekly Journal hiện cho Continue Farm hoặc Reset Farm; cần playtest độ rõ của transition này.
- Green Beans hiện yield bốn và regrow hai đêm có vượt Carrot quá mạnh trong bảy ngày không?
- AP baseline 8 có còn đúng khi thêm season deadline và cleanup cost không?
- Waking at Home sau End Day có tạo daily return loop hay trở thành teleport miễn phí từ Town?
- Landmark chỉ là navigation card hay sau này có passive effect riêng?
- Hand có cần giới hạn khi mỗi lần mua tạo một persistent Seed card?
- Crop thứ ba nào bổ sung lựa chọn khác Carrot nhanh và Green Beans regrow? Chưa chọn trước playtest season.
- Có nên thay End Day button bằng Bed/Sleep card sau khi behavior ổn định?
- Person cards về sau nên tăng AP, giảm action cost hay sửa luật theo ngày?

## Verification

```sh
cd /Volumes/LeNguyen02SSD/Programming/new-game
npm --prefix prototype/little-valley-cards test
git diff --check
git status --short
```

Expected:

```text
Crop/AP/Week smoke test passed: finite Land persists, crops grow and regrow correctly, the Weekly Journal pauses after day 7, and Continue Farm preserves the world into the next week.
```

Sau khi checks pass, mở server chỉ trên localhost:

```sh
cd prototype/little-valley-cards
python3 -m http.server 8080 --bind 127.0.0.1
```

Gửi user `http://127.0.0.1:8080/` và chờ hands-on feedback.

# Prompt Khôi Phục Ngữ Cảnh — Little Valley Cards

Hãy tiếp tục dự án game **Little Valley Cards** tại:

`/Volumes/LeNguyen02SSD/Programming/new-game`

Trước khi sửa code, hãy đọc đầy đủ:

- `PROJECT-STATUS.md`
- `prototype/little-valley-cards/README.md`
- `STYLE.md` và `little-valley-cards-art-bible-v0.1.md` nếu làm art
- `.agents/skills/little-valley-cards-art/SKILL.md` nếu tạo hoặc chỉnh raster artwork

Không khôi phục các prototype hoặc tài liệu cũ đã bị loại. Không commit, push hoặc hoàn tác những thay đổi Git hiện có nếu tôi chưa yêu cầu. Pivot Little Valley Cards và Actor Stack v0.2 đã được push lên `origin/main` tại commit `3230a68`; thay đổi two-plot sau commit này có thể vẫn chưa commit.

## 1. Tóm tắt cốt lõi

Little Valley Cards hiện là game quản lý nông trại mobile màn dọc, trong đó **các lá bài chính là những vật thể vật lý tồn tại trong thế giới**. Không còn hand, draw pile, play-three, Action Points, fixed target row, inventory panel hay UI quan hệ NPC.

Người chơi kéo card trên một persistent board. Khi Person card được thả vào tương tác hợp lệ, công việc chủ động resolve ngay; stack biến đổi hoặc sản phẩm mới bật ra ngay trên bàn. Chỉ crop growth và đồng hồ ngày còn dùng thời gian. Không gian và sự lộn xộn của bàn phải trở thành lịch sử trực quan của trang trại.

Prototype hiện tại tại `prototype/little-valley-cards/` đã có vòng chơi hai plot, một Farmer:

```text
Farmer + Wild Soil x2 -> Empty Plot x2
Farmer + Carrot Seeds -> Farmer [carrying Seeds]
Farmer [carrying Seeds] + Empty Plot -> Carrot Plot
Farmer + Stone Well -> Farmer [carrying Water]
Farmer [carrying Water] + Carrot Plot -> timed growth
Farmer + Mature Carrots -> Carrots x3
Carrots + Roadside Market -> Coin Purse x6 -> win
```

Các tính năng đã chạy:

- kéo/thả card tự do trên board dọc;
- target hợp lệ phát sáng;
- active work resolve ngay; crop growth vẫn có thời gian;
- card Water, Carrots và Coin Purse được spawn vật lý;
- đồng hồ hai phút chỉ bắt đầu sau nước đi hợp lệ đầu tiên và tạm dừng khi đang giữ card;
- local save/reset;
- hai plot cạnh tranh nhưng chỉ có một Farmer, tạo lựa chọn thứ tự lao động đầu tiên;
- Actor Stack cho Seeds và Water: attach, kéo compound stack, detach, target validation và item lifecycle;
- mọi runtime card đều có generated pixel artwork;
- Person card có visual language riêng: frame teal, icon người và badge `READY`/`CARRYING`;

User đã playtest ngày 2026-09-19 và kết luận gameplay **thực sự vui**, tự nguyện loop việc trồng cây nhiều lần dù content còn rất ít. Đây là validation quan trọng: không quay lại các hướng card-hand/pair-matching cũ.

Art direction đã được đóng gói trong project skill `little-valley-cards-art`: native pixel art, high-key fresh palette, colored outlines; artwork action/world là horizontal 8:5, item/portrait là square; card frame, icon, progress và targeting phải do code/UI vẽ. Asset runtime hiện tại chỉ được duyệt cho prototype, chưa phải canonical identity.

## 2. Mạch tư duy hiện tại

Actor Stack v0.2 đã được implement và kiểm chứng. Actor thực sự mang item:

```text
Farmer + Stone Well
        -> Farmer [carrying Water]

Farmer [carrying Water] + Carrot Plot
        -> work timer
        -> Farmer + Watered Plot
```

Tương tự:

```text
Farmer + Seeds -> Farmer [carrying Seeds]
Farmer [carrying Seeds] + Empty Plot -> Planted Plot
```

Ngữ pháp hiện tại:

- Actor là chủ thể.
- Item/tool là thứ actor đang cầm hoặc trang bị.
- Land/building là mục tiêu.
- Progress là động từ đang diễn ra.
- Một actor stack di chuyển như một đơn vị; sau công việc item có thể bị tiêu thụ, biến đổi hoặc được trả lại.

Actor luôn là động từ chủ động: kéo Farmer vào loose Seeds/Water để nhặt; công việc tại Well tự attach Water ngay khi hoàn tất. Kéo Farmer di chuyển cả stack; kéo phần item lộ ra sẽ detach. Seeds tiêu hao từng đơn vị và phần còn lại tiếp tục được mang. Water bị consume sau khi tưới. Busy state áp dụng cho cả actor và carried item.

Không contextual-gate việc nhặt item hoặc dùng Well chỉ để ép đúng recipe order. Farmer có thể chuẩn bị resource trước khi có destination. Highlight diễn đạt khả năng vật lý, không chỉ ra nước đi tối ưu; hint mô tả trạng thái thế giới thay vì ra lệnh kéo card cụ thể.

Board hiện đã có hai Wild Soil, hai seed units và một Farmer. Mục tiêu là bán hai harvest lấy sáu coin. Đây là phép thử đầu tiên về labour pressure mà không thêm crop, NPC hoặc economy mới.

NPC về sau cũng là Person card có chức năng lao động, không phải dialogue tree. Công trình và input quyết định việc gì xảy ra; nhân vật cung cấp lao động và modifier riêng. Lore/backstory là khám phá tùy chọn thông qua phản ứng cơ học với item/location, không có friendship bar hay màn hình quan hệ bắt buộc.

Mục tiêu dài hạn đang được cân nhắc: khôi phục trang trại bỏ hoang và chuẩn bị đủ để sống qua mùa đông đầu tiên. Chưa implement và chưa khóa chính thức.

## 3. Hành động tiếp theo

1. Chạy baseline:

   ```sh
   cd /Volumes/LeNguyen02SSD/Programming/new-game/prototype/little-valley-cards
   npm test
   ```

2. Kiểm tra `git status` và bảo toàn toàn bộ intentional deletions/uncommitted work hiện có.

3. Yêu cầu user playtest trực tiếp loop hai plot, một Farmer. Quan sát:

   - việc chọn thứ tự clear/sow/water/harvest có tạo quyết định thật hay chỉ thêm thao tác;
   - board có còn đọc được khi hai crop ở các trạng thái khác nhau;
   - nhịp hai phút và mục tiêu sáu coin có quá dễ hoặc quá gấp;
   - carrying/detach còn tự nhiên khi chuyển liên tục giữa hai plot.

4. Chạy browser prototype tại `http://127.0.0.1:8080/`, kiểm tra console và mobile portrait. Server có thể không còn chạy ở phiên mới; nếu cần hãy khởi động lại bằng:

   ```sh
   python3 -m http.server 8080
   ```

5. Nếu two-plot loop vẫn vui và rõ ràng, thử Person card thứ hai như Mira với đúng một specialization cơ học. Chưa thêm crop, lore hoặc economy lớn trong cùng experiment.

## 4. Những điều còn bỏ ngỏ

- Two-plot loop có tạo labour pressure thú vị hay chỉ nhân đôi thao tác?
- Water nên là `Water`, `Bucket of Water`, hay cần vòng đời `Empty Bucket -> Filled Bucket -> Empty Bucket`?
- Nhân vật thứ hai nên tạo parallelism tới mức nào trước khi làm game quá dễ?
- Khi Farmer thu hoạch, Carrots nên spawn rời trên bàn hay trở thành item đang được Farmer mang?
- Mobile drag/scroll có glitch nào trên thiết bị thật? Hiện mới kiểm tra trong in-app browser desktop; board background hỗ trợ vertical scroll còn card giữ pointer drag.
- Hai phút có phải nhịp ngày đúng hay chỉ là thông số test?
- Full game cần fail state cứng, hậu quả mềm khi thiếu winter supplies, hay cả hai?
- Khi nào Mira xuất hiện, cô ấy ở lại theo điều kiện gì, và specialization đầu tiên là gì?

## Cleanup đã thực hiện

Ngày 2026-09-19 đã loại khỏi active tree:

- GDD cũ và paper prototype `A Day in Three Cards`;
- contact sheet của universal pair-card demo;
- Sow action study cũ;
- runtime `sow.png` không còn được code tham chiếu.

Chúng được chuyển vào macOS Trash tại `little-valley-cards-cleanup-2026-09-19`, không xoá vĩnh viễn. Những asset Water/Harvest và các source/processed/record khác được giữ vì runtime hiện tại vẫn sử dụng chúng. One Good Day cũ vẫn có thể phục hồi từ Git commit `ebe2196`.

Hãy tiếp tục từ **two plots + one Farmer**. Playtest labour pressure trước; nếu đạt, experiment kế tiếp là Person card thứ hai với một specialization rõ ràng.

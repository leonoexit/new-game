# Prompt Khôi Phục Ngữ Cảnh — Little Valley Cards

Hãy tiếp tục dự án game **Little Valley Cards** tại:

`/Volumes/LeNguyen02SSD/Programming/new-game`

Trước khi sửa code, hãy đọc đầy đủ:

- `PROJECT-STATUS.md`
- `prototype/little-valley-cards/README.md`
- `STYLE.md` và `little-valley-cards-art-bible-v0.1.md` nếu làm art
- `.agents/skills/little-valley-cards-art/SKILL.md` nếu tạo hoặc chỉnh raster artwork

Không khôi phục các prototype hoặc tài liệu cũ đã bị loại. Không commit, push hoặc hoàn tác những thay đổi Git hiện có nếu tôi chưa yêu cầu; worktree đang có nhiều intentional deletions từ dự án One Good Day và toàn bộ thay đổi Little Valley Cards hiện vẫn chưa commit.

## 1. Tóm tắt cốt lõi

Little Valley Cards hiện là game quản lý nông trại mobile màn dọc, trong đó **các lá bài chính là những vật thể vật lý tồn tại trong thế giới**. Không còn hand, draw pile, play-three, Action Points, fixed target row, inventory panel hay UI quan hệ NPC.

Người chơi kéo card trên một persistent board. Person card được giao vào một stack công việc; công việc chiếm dụng người đó trong một khoảng thời gian, sau đó stack biến đổi hoặc sản phẩm mới bật ra ngay trên bàn. Không gian và sự lộn xộn của bàn phải trở thành lịch sử trực quan của trang trại.

Prototype hiện tại tại `prototype/little-valley-cards/` đã có vòng chơi hoàn chỉnh:

```text
Farmer + Wild Soil -> Empty Plot
Carrot Seeds on Empty Plot, then Farmer -> Carrot Plot
Farmer + Stone Well -> Water
Water + Carrot Plot -> timed growth
Farmer + Mature Carrots -> Carrots x3
Carrots + Roadside Market -> Coin Purse x3 -> win
```

Các tính năng đã chạy:

- kéo/thả card tự do trên board dọc;
- target hợp lệ phát sáng;
- worker jobs và crop growth có thời gian;
- card Water, Carrots và Coin Purse được spawn vật lý;
- đồng hồ hai phút chỉ bắt đầu sau nước đi hợp lệ đầu tiên và tạm dừng khi đang giữ card;
- local save/reset;
- mọi runtime card đều có generated pixel artwork;
- Person card có visual language riêng: frame teal, icon người và badge `READY`; khi bận chuyển frame vàng, portrait tối, phủ `WORKING` + giây còn lại và có progress trên chính actor.

User đã playtest ngày 2026-09-19 và kết luận gameplay **thực sự vui**, tự nguyện loop việc trồng cây nhiều lần dù content còn rất ít. Đây là validation quan trọng: không quay lại các hướng card-hand/pair-matching cũ.

Art direction đã được đóng gói trong project skill `little-valley-cards-art`: native pixel art, high-key fresh palette, colored outlines; artwork action/world là horizontal 8:5, item/portrait là square; card frame, icon, progress và targeting phải do code/UI vẽ. Asset runtime hiện tại chỉ được duyệt cho prototype, chưa phải canonical identity.

## 2. Mạch tư duy hiện tại

Điểm dừng hiện nay là phát hiện rằng current interaction vẫn bỏ qua một bước vật lý quan trọng. Ví dụ Farmer không nên tạo ra Water rồi để Water tự bay tới ruộng. Actor phải thực sự mang item:

```text
Farmer + Water Bucket
        -> Farmer [carrying Water]

Farmer [carrying Water] + Carrot Plot
        -> work timer
        -> Farmer + Empty Bucket + Watered Plot
```

Tương tự:

```text
Farmer + Seeds -> Farmer [carrying Seeds]
Farmer [carrying Seeds] + Empty Plot -> Planted Plot
```

Ngữ pháp được đề xuất:

- Actor là chủ thể.
- Item/tool là thứ actor đang cầm hoặc trang bị.
- Land/building là mục tiêu.
- Progress là động từ đang diễn ra.
- Một actor stack di chuyển như một đơn vị; sau công việc item có thể bị tiêu thụ, biến đổi hoặc được trả lại.

Đây không nên được vá riêng cho Water. Nó là thay đổi nền tảng cho toàn bộ interaction engine. Chưa thêm NPC, cây mới, lore hoặc economy lớn cho tới khi actor-carrying stack được kiểm chứng.

NPC về sau cũng là Person card có chức năng lao động, không phải dialogue tree. Công trình và input quyết định việc gì xảy ra; nhân vật cung cấp lao động và modifier riêng. Lore/backstory là khám phá tùy chọn thông qua phản ứng cơ học với item/location, không có friendship bar hay màn hình quan hệ bắt buộc.

Mục tiêu dài hạn đang được cân nhắc: khôi phục trang trại bỏ hoang và chuẩn bị đủ để sống qua mùa đông đầu tiên. Chưa implement và chưa khóa chính thức.

## 3. Hành động tiếp theo

1. Chạy baseline:

   ```sh
   cd /Volumes/LeNguyen02SSD/Programming/new-game/prototype/little-valley-cards
   npm test
   ```

2. Kiểm tra `git status` và bảo toàn toàn bộ intentional deletions/uncommitted work hiện có.

3. Thiết kế **Actor Stack v0.2** trước khi code:

   - actor mang tối đa một item trong test đầu;
   - item được attach rõ ràng vào actor;
   - cả stack kéo đi như một đơn vị;
   - title/status đọc được như `Farmer · Carrying Water`;
   - target validation dựa trên actor + carried item + destination;
   - resolution phải quy định item bị consume, transform hay return;
   - có cách tháo item khỏi actor mà không làm mất card.

4. Implement Actor Stack chỉ cho hai chuỗi **Seeds** và **Water**. Tái sử dụng art hiện có; chưa cần gen ảnh mới trừ khi xuất hiện item mới thật sự như Empty Bucket.

5. Cập nhật smoke test để bao phủ attach, move compound stack, detach, resolve, item lifecycle và busy actor state.

6. Chạy browser prototype tại `http://127.0.0.1:8080/`, tự kéo thử toàn bộ loop, kiểm tra console error, sau đó test viewport/mobile portrait. Server có thể không còn chạy ở phiên mới; nếu cần hãy khởi động lại bằng:

   ```sh
   python3 -m http.server 8080
   ```

7. Chỉ sau khi Actor Stack cảm thấy tự nhiên mới thêm hai plot + một Farmer để tạo lựa chọn lao động thật. Sau đó mới test nhân vật thứ hai như Mira.

## 4. Những điều còn bỏ ngỏ

- Actor stack nên hiển thị hai card lệch nhau hay hợp thành một card tạm thời?
- Khi actor cầm item, người chơi kéo card actor hay kéo cả vùng stack?
- Thả item khỏi actor bằng thao tác nào để hợp mobile: kéo ngược ra, tap, hay long-press?
- Water nên là `Water`, `Bucket of Water`, hay cần vòng đời `Empty Bucket -> Filled Bucket -> Empty Bucket`?
- Seeds nên được actor mang trước khi tới plot hay có thể đặt sẵn trên plot như hiện tại? Mục tiêu là chọn một grammar thống nhất, không giữ hai cách chỉ vì code cũ.
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

Hãy tiếp tục từ **Actor Stack v0.2**, không mở rộng content trước khi grammar này được playtest.

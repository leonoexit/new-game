# One Good Day — event system v0.1

**Trạng thái:** đã nối phiên bản tối thiểu vào prototype event-card v0.5  
**Phạm vi:** vertical slice 5 ngày  
**Câu hỏi:** trade-off, quan hệ cá nhân và thế giới tự tiến triển có thể cùng tồn tại không?

## 1. Trạng thái chung

Người chơi bắt đầu với:

| Trạng thái | Giá trị đầu | Nguy hiểm | Ý nghĩa |
|---|---:|---:|---|
| Tiền | 50G | dưới 0G | Chi phí sinh hoạt và khoản nợ cuối mùa |
| Tình trạng farm | 3/5 | 0/5 | Đất, nước, hàng rào và khả năng chống chịu |
| Sức sống | 3/5 | 0/5 | Mức người chơi còn có thể gánh vác cuộc sống |

Ba trạng thái này luôn hiện trên HUD. Chạm 0 không nhất thiết kết thúc lượt chơi ngay, nhưng mở một khủng hoảng bắt buộc vào sáng hôm sau. Nếu khủng hoảng không được giải quyết, vertical slice kết thúc sớm.

Không có chỉ số `Gắn kết` chung. Mỗi actor giữ trạng thái riêng:

- `field`: tình trạng tưới, thùng mưa, cổng, ký ức về các dự án;
- `mira`: tin tưởng 0–5, ký ức và arc của quán;
- `rowan`: tin tưởng 0–5, ký ức và arc sửa chữa;
- `iris`: tin tưởng 0–5, ký ức và arc con đường rừng.

Các activity actor tương lai như chuồng trại, sông, mỏ và vùng hái lượm dùng cùng cấu trúc với `field`, nhưng không được thêm vào vertical slice này.

## 2. Quy tắc thời gian

Mỗi event có bốn trạng thái:

```text
scheduled → available → resolved
                    ↘ carried → expired
```

- `appears`: ngày event bắt đầu xuất hiện.
- `deadline`: ngày cuối có thể chọn.
- Nếu không chọn và chưa đến deadline, event được mang sang ngày sau với premise thay đổi.
- Nếu không chọn vào deadline, `onExpire` chạy dù người chơi đang làm việc khác.
- Một lựa chọn có thể lên lịch một `beat` hoặc event tiếp theo.
- `Beat` là diễn biến ngắn không cần lựa chọn và không dùng hết ngày.
- Mỗi ngày người chơi chỉ giải quyết một commitment event.

Như vậy “bỏ lỡ” không phải một đoạn văn cố định. Nó là một chuyển trạng thái thật.

## 3. Hợp đồng dữ liệu của một event

```js
{
  id,
  actor,
  appears,
  deadline,
  variants,
  choices: [{
    label,
    sharedEffects: { money, farm, vitality },
    actorEffects: { trust, flags, memory },
    schedules: [{ day, type, id }]
  }],
  onCarry,
  onExpire
}
```

Một lựa chọn được xem là đủ ý nghĩa khi nó tạo ra ít nhất hai trong ba loại hệ quả:

1. thay đổi trạng thái chung;
2. thay đổi actor;
3. thay đổi timeline.

Không yêu cầu mọi lựa chọn đều hiện số chính xác. UI có thể chỉ báo hướng tăng/giảm như Reigns; kết quả cụ thể được kể vào buổi tối.

## 4. Ma trận 5 ngày

### Ngày 1 — Người mới và mảnh đất cũ

#### `field_irrigation_ditch`

- Actor: Ruộng
- Xuất hiện: ngày 1
- Deadline: ngày 3
- Premise ngày 1: con mương cũ bị đá và cỏ chặn.
- Nếu mang sang ngày 2: đất bắt đầu khô ở mép luống.
- Nếu mang sang ngày 3: đây là cơ hội cuối trước khi nắng làm đất chai.

| Lựa chọn | Trạng thái chung | Actor nhớ | Timeline |
|---|---|---|---|
| Tự khơi dòng | Farm +2, Sức sống −2 | `field.irrigation = restored`; “Đã tự khơi dòng nước” | Beat sáng hôm sau: nghe nước chảy về ruộng |
| Thuê người phụ | Tiền −20G, Farm +2, Sức sống −1 | `field.irrigation = restored`; biết tên vài hàng xóm | Beat sáng hôm sau: hàng xóm để lại một bó cọc tre |

`onExpire` cuối ngày 3:

- Farm −1.
- `field.irrigation = blocked`.
- Event chống bão ngày 5 khó hơn.

#### `mira_hill_delivery`

- Actor: Mira
- Xuất hiện: ngày 1
- Deadline: ngày 1
- Premise: Mira mời người mới cùng giao bánh lên xóm đồi.

| Lựa chọn | Trạng thái chung | Actor nhớ | Timeline |
|---|---|---|---|
| Đi hết tuyến cùng Mira | Sức sống −1, Tiền +5G | Mira +2; nhớ cuộc trò chuyện trên đường về | Ngày 2 mở biến thể thân mật của `mira_orders_after_rain` |
| Nhận phần đường gần | Farm +1, Tiền +5G | Mira +1; nhớ rằng bạn đã giúp nhưng về sớm | Ngày 2 mở biến thể thực tế của event kế tiếp |

`onExpire`:

- Mira tự giao hàng.
- Quan hệ không giảm, nhưng ngày 2 cô vẫn gọi bạn là “người mới”.
- Beat tối: vài nhà trên đồi đã nghe về bạn từ lời kể của Mira, không phải từ cuộc gặp trực tiếp.

### Ngày 2 — Những việc có thể để lại, nhưng không biến mất

#### `field_rain_barrel`

- Actor: Ruộng
- Xuất hiện: ngày 2
- Deadline: ngày 4
- Nếu đã khơi mương: premise nhấn mạnh dự phòng cho ngày khô.
- Nếu mương còn tắc: premise nhấn mạnh đây là nguồn nước duy nhất trước mắt.

| Lựa chọn | Trạng thái chung | Actor nhớ | Timeline |
|---|---|---|---|
| Vá thùng đúng cách | Tiền −15G, Farm +1, Sức sống −1 | `field.rainBarrel = repaired` | Khi bão đến, farm tránh một mức thiệt hại |
| Ghép máng gỗ tạm | Farm +1, Sức sống −2 | `field.rainBarrel = temporary` | Ngày 5 máng có thể hỏng nếu cổng cũng chưa sửa |

`onCarry`:

- Ngày 3: những vòng sắt bắt đầu rỉ thêm.
- Ngày 4: chi phí vá đúng cách tăng thành 20G.

`onExpire` cuối ngày 4:

- `field.rainBarrel = broken`.
- Không trừ chỉ số ngay; hậu quả được tính trong bão ngày 5.

#### `mira_orders_after_rain`

- Actor: Mira
- Xuất hiện: ngày 2
- Deadline: ngày 2
- Premise và lời chào thay đổi theo ký ức ngày 1.

| Lựa chọn | Trạng thái chung | Actor nhớ | Timeline |
|---|---|---|---|
| Đi hết tuyến cùng Mira | Tiền +10G, Sức sống −1 | Mira +2; nhớ tách trà sau chuyến giao hàng | Beat tối: Mira kể về lễ hội ngày 3 |
| Thuê xe kéo giúp cô | Tiền −10G, Sức sống +1 | Mira +1; nhớ cách giúp thực tế | Lễ hội ngày 3 bắt đầu với quán đã chuẩn bị tốt hơn |

`onExpire`:

- Mira −1 nếu người chơi đã bỏ lỡ cả event ngày 1.
- Quán mở muộn.
- `mira.cafePrepared = false`, làm event lễ hội ngày 3 khó hơn.

### Ngày 3 — Ba việc cùng đến hạn

Ngày này có tối đa ba card:

1. `mira_festival_repairs`;
2. `rowan_gate_latch`;
3. `field_irrigation_ditch` nếu chưa giải quyết.

#### `mira_festival_repairs`

- Actor: Mira
- Xuất hiện: ngày 3
- Deadline: ngày 3
- Nếu quán đã chuẩn bị tốt: mức Sức sống cần bỏ ra giảm 1.

| Lựa chọn | Trạng thái chung | Actor nhớ | Timeline |
|---|---|---|---|
| Tự tay giúp Mira | Farm −1, Sức sống −2 hoặc −1 | Mira +2; `cafeRepaired = true` | Ngày 4 có beat lễ hội; sáng ngày 5 Mira gửi chìa khóa và bữa sáng |
| Trả tiền thuê thợ | Tiền −20G, Sức sống không đổi | Mira +1; nhớ rằng bạn không bỏ mặc cô | Rowan biết bạn đã thuê người khác; mở một câu thoại riêng |

`onExpire`:

- Mira −1.
- Quán được chống tạm và lễ hội bắt đầu muộn.
- Ngày 4: Rowan đã đến giúp Mira. Quan hệ giữa hai NPC tiến triển dù không có người chơi.

#### `rowan_gate_latch`

- Actor: Rowan
- Xuất hiện: ngày 3
- Deadline: ngày 4

| Lựa chọn | Trạng thái chung | Actor nhớ | Timeline |
|---|---|---|---|
| Làm cùng Rowan | Farm +1, Sức sống −1 | Rowan +2; `field.gate = repaired` | Cổng chịu được bão ngày 5 |
| Trả Rowan tiền công | Tiền −25G, Farm +1 | Rowan +1; `field.gate = repaired` | Beat tối: Rowan để lại sợi dây đo cho dự án tương lai |

`onCarry`:

- Ngày 4 Rowan nói anh chỉ còn giữ chiếc chốt đến cuối chiều.

`onExpire` cuối ngày 4:

- `field.gate = broken`.
- Hậu quả được tính trong bão ngày 5.

### Ngày 4 — Một con đường chỉ mở trong thời tiết này

#### `iris_stream_marks`

- Actor: Iris
- Xuất hiện: ngày 4
- Deadline: ngày 4
- Event xảy ra bất kể trạng thái của Mira, Rowan và farm.

| Lựa chọn | Trạng thái chung | Actor nhớ | Timeline |
|---|---|---|---|
| Theo Iris qua suối | Sức sống −1 | Iris +2; `forestPath = known`; nhận đá sông ấm | Event hái thuốc ngày 5 an toàn hơn |
| Chỉ khảo sát đường về | Farm +1 | Iris +1; `forestPath = marked` | Ngày 5 có thể chỉ đường cho Iris nhưng không đi sâu cùng cô |

`onExpire`:

- Iris không giảm quan hệ.
- `forestPath = lostForNow`.
- Những đốm sáng biến mất, nhưng một event mùa sau được lên lịch.

Ngày 4 cũng có thể chứa các event `field_rain_barrel` hoặc `rowan_gate_latch` đang ở deadline. Người chơi nhìn thấy tối đa ba card dựa trên lịch sử thật của lượt chơi.

### Ngày 5 — Cơn bão gom các hệ quả lại

Trước khi chọn commitment, các beat đã lên lịch chạy trước:

- Nếu giúp sửa quán: Mira gửi bữa sáng, Sức sống +1, và chìa khóa quán.
- Nếu khơi mương cùng hàng xóm: nhận cọc tre, giảm một mức Sức sống khi gia cố farm.
- Nếu biết đường rừng: event của Iris có chi phí thấp hơn.

Ba commitment có thể xuất hiện:

#### `field_storm_preparation`

| Lựa chọn | Trạng thái chung | Actor nhớ | Timeline/kết quả |
|---|---|---|---|
| Ở nhà gia cố | Farm +2, Sức sống −2; giảm còn −1 nếu có cọc tre | Ruộng ghi nhớ “đã chọn bảo vệ nhà” | Thiệt hại từ thùng, cổng và mương được tính sau lựa chọn |
| Bán nhanh nông sản | Tiền +35G, Farm −1 | `field.stormRisk = accepted` | Mỗi hạng mục chưa sửa làm Farm giảm thêm 1 |

#### `rowan_storm_call`

| Lựa chọn | Trạng thái chung | Actor nhớ | Timeline/kết quả |
|---|---|---|---|
| Đến phụ Rowan | Farm −1, Sức sống −1 | Rowan +3 | Gia đình lớn tuổi qua bão an toàn; Rowan mở arc mới |
| Gửi vật liệu rồi về | Tiền −10G, Farm không đổi | Rowan +1 | Rowan hiểu sự thỏa hiệp; không mở ký ức thân thiết |

Nếu cổng nhà chưa sửa, chọn Rowan làm Farm giảm thêm 1.

#### `iris_storm_herbs`

| Lựa chọn | Trạng thái chung | Actor nhớ | Timeline/kết quả |
|---|---|---|---|
| Theo Iris cứu cây thuốc | Farm −1, Sức sống −2 hoặc −1 nếu biết đường | Iris +2; nhận bó lá thuốc | Cây thuốc được giữ lại cho mùa sau |
| Chỉ Iris đường cao | Sức sống không đổi | Iris +1 nếu đã đánh dấu đường; nếu không, lựa chọn này bị khóa | Iris trở về an toàn nhưng chỉ cứu được một phần cây |

`onExpire` của hai card không được chọn chạy sau commitment:

- Rowan vẫn giúp gia đình kia; quan hệ với người chơi không đổi, nhưng anh nhớ người chơi đã không đến nếu từng hứa trước đó.
- Iris mất một phần cây thuốc; nếu chưa biết đường rừng, event kết thúc mà không trách người chơi.
- Farm chịu thiệt hại theo các hạng mục chưa sửa, dù người chơi có xem card farm hay không.

## 5. Điều kiện kết thúc vertical slice

Ưu tiên đọc kết quả theo thứ tự:

1. Farm ≤ 0: “Bạn còn một mái nhà, nhưng mùa tới sẽ bắt đầu bằng việc sửa lại từ đầu.”
2. Sức sống ≤ 0: “Bạn đã giữ quá nhiều lời hứa và không còn sức để nghe ngày mới gọi.”
3. Tiền < 0: “Khoản nợ đã bắt đầu quyết định thay bạn.”
4. Một actor đạt tin tưởng ≥ 4: ending riêng của actor đó.
5. Farm ≥ 4 và còn ít nhất 20G: ending về một nơi có thể sống lâu dài.
6. Còn lại: ending mở về năm ngày đầu chưa tạo ra câu trả lời.

Không có ending “đúng”. Một lượt chơi tốt là lượt khiến người chơi hiểu cái giá của điều mình đã ưu tiên.

## 6. Những gì cần quan sát khi chơi

- Người chơi có nhìn các trạng thái chung trước khi chọn card không?
- Người chơi có nhớ một cá nhân cụ thể, thay vì chỉ nhớ thanh chỉ số đã tăng không?
- Một event được mang sang ngày sau có tạo cảm giác thế giới đang chờ nhưng không đứng yên không?
- `onExpire` có tạo tiếc nuối hợp lý hay cảm giác bị phạt vô cớ?
- Các beat miễn phí có làm timeline sống hơn mà không biến thành thêm một lớp menu không?
- Cơn bão ngày 5 có gom được lịch sử của bốn ngày trước thành một kết quả dễ hiểu không?

Nếu người chơi chỉ tối ưu ba trạng thái chung, hệ thống quan hệ chưa đủ mạnh. Nếu người chơi luôn chọn actor yêu thích bất kể nguy hiểm, trade-off chưa đủ mạnh. Mục tiêu là để cả hai lực cùng tồn tại.

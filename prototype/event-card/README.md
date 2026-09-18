# One Good Day — vertical slice 5 ngày

Mở trực tiếp `index.html`, hoặc chạy static server tại repository rồi truy cập `/prototype/event-card/`.

Prototype hiện kiểm nghiệm ba lớp cùng lúc:

- cân bằng Tiền, Tình trạng farm và Sức sống;
- quan hệ, ký ức và trạng thái riêng của từng actor;
- event có ngày xuất hiện, deadline, trạng thái kéo dài và hậu quả khi hết hạn;
- các beat buổi sáng xuất hiện ngắn gọn ngay trên màn chọn, không còn màn trung gian;
- tối đa ba lời gọi được trình bày thành carousel vuốt ngang;
- trên máy tính dùng nút mũi tên cạnh tiêu đề để chuyển thẻ;
- hai lựa chọn trực tiếp cho mỗi event, với mũi tên báo trước hướng tác động; không còn bước xác nhận thứ hai;
- evening summary cho lựa chọn, event được mang sang ngày sau và event đã tự khép lại;
- cơn bão ngày 5 tổng hợp những phần farm đã hoặc chưa chuẩn bị;
- localStorage, reset và ending sớm nếu một trạng thái sụp đổ.

Ruộng và nhân vật dùng chung mô hình actor tiến triển lâu dài. Sau này chuồng trại, sông, mỏ và vùng hái lượm có thể dùng cùng cấu trúc, nhưng chưa có trong vertical slice này.

## Câu hỏi kiểm thử

- Các mũi tên tác động có giúp lựa chọn rõ hơn mà không biến nhân vật thành bài toán số không?
- Bạn có nhìn trạng thái chung trước khi chọn card không?
- Bạn có nhớ mình đã làm gì với một người cụ thể, hay chỉ nhớ chỉ số tăng giảm?
- Khi một event được mang sang ngày sau, thế giới có cảm giác đang chờ nhưng không đứng yên không?
- Event hết hạn có tạo tiếc nuối hợp lý hay cảm giác bị phạt vô cớ?
- Các beat buổi sáng có làm timeline sống hơn mà không tạo thêm một lớp việc vặt không?
- Cơn bão ngày 5 có phản ánh rõ lịch sử của bốn ngày trước không?
- Bạn có muốn chơi lại để thử giữ một cân bằng khác không?

`event-system-v0.1.md` là bản thiết kế chi tiết đứng sau runtime này.

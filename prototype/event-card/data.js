const ART = {
  farm: "../../art/approved/style-references/farm-high-key-style-reference-v0.1.png",
  miraTea: "../../art/approved/style-references/mira-tea-interaction-style-reference-v0.1.png",
  miraRepair: "../../art/approved/event-cards/mira-festival-repairs-v0.1.png",
  forest: "../../art/approved/locations/iris-forest-edge-location-reference-v0.1.png",
};

const ACTORS = {
  field: { label: "Ruộng", kind: "activity", role: "ĐẤT & MÙA VỤ" },
  mira: { label: "Mira", kind: "person", role: "CHỦ QUÁN CÀ PHÊ" },
  rowan: { label: "Rowan", kind: "person", role: "THỢ MỘC" },
  iris: { label: "Iris", kind: "person", role: "NGƯỜI DẪN RỪNG" },
};

const GAME = { finalDay: 5, startingMoney: 50, startingFarm: 3, startingVitality: 3, meterMax: 5 };

const DAYS = [
  { weather: "☀ Trời quang", morning: ["Con mương cũ vẫn im nước.", "Mira đang chuẩn bị một chuyến hàng lên xóm đồi."] },
  { weather: "☁ Nhiều mây", morning: ["Không phải việc nào đang chờ cũng còn ở đó mãi."] },
  { weather: "🌦 Mưa nhẹ", morning: ["Lễ hội bắt đầu tối nay.", "Ba lời gọi cùng đến hạn."] },
  { weather: "☀ Sau mưa", morning: ["Nước suối rút, để lộ một lối chỉ tồn tại hôm nay."] },
  { weather: "⛈ Gió mạnh", morning: ["Cơn bão sẽ gom lại mọi việc đã làm — và chưa làm."] },
];

const EVENTS = [
  {
    id: "field_irrigation_ditch", actor: "field", appears: 1, deadline: 3,
    category: "DỰ ÁN NÔNG TRẠI", title: "Con mương bị lấp", art: ART.farm,
    alt: "Ngôi nhà nhỏ và những luống đất dưới nắng sớm.",
    premises: {
      1: "Dòng nước cũ dẫn về nông trại đã bị đá và cỏ chặn kín.",
      2: "Đất bắt đầu khô ở mép luống. Con mương vẫn có thể cứu được.",
      3: "Nắng đang làm đất chai lại. Đây là ngày cuối để khơi dòng nước cũ.",
    },
    carryText: "Con mương vẫn đang chờ; đất sẽ khô thêm vào ngày mai.",
    choices: [
      {
        id: "dig", label: "Tự khơi dòng", hint: "Giữ tiền, đổi bằng sức của chính mình.",
        result: "Đến chiều, nước lại róc rách qua mép ruộng.",
        effects: { farm: 2, vitality: -2, flags: ["irrigation_restored"], memory: "Đã tự tay khơi lại dòng nước cũ." },
        schedules: [{ day: 2, text: "Bạn thức dậy cùng tiếng nước chảy về ruộng." }],
      },
      {
        id: "hire", label: "Thuê người phụ", hint: "Tốn tiền, nhưng giữ lại một phần sức lực.",
        result: "Vài đôi tay biến công việc nặng thành một buổi làm chung.",
        effects: { money: -20, farm: 2, vitality: -1, flags: ["irrigation_restored", "met_farm_neighbors"], memory: "Đã cùng hàng xóm khơi lại dòng nước." },
        schedules: [{ day: 2, text: "Hàng xóm để lại một bó cọc tre bên hiên.", flags: ["bamboo_stakes"] }],
      },
    ],
    onExpire: { text: "Đất quanh con mương chai lại. Việc khơi dòng phải đợi qua mùa.", effects: { farm: -1, flags: ["irrigation_blocked"] } },
  },
  {
    id: "mira_hill_delivery", actor: "mira", appears: 1, deadline: 1,
    category: "QUAN HỆ", title: "Chuyến hàng lên xóm đồi", art: ART.miraTea,
    alt: "Mira chào người nông dân mới bên một tách trà ấm.",
    premise: "Mira phải giao bánh trước khi quán mở. Cô mời người mới đi cùng để biết đường và biết người.",
    choices: [
      { id: "full_route", label: "Đi hết tuyến cùng Mira", hint: "Mệt hơn, nhưng có thời gian để hiểu nhau.", result: "Khi trở về, thị trấn đã bớt xa lạ và giỏ bánh đã trống.", effects: { money: 5, vitality: -1, relationships: { mira: 2 }, flags: ["joined_mira_delivery"], memory: "Đã cùng Mira giao bánh lên xóm đồi." } },
      { id: "near_route", label: "Nhận phần đường gần", hint: "Giúp cô rồi trở về chăm việc nhà.", result: "Bạn giao phần hàng gần quảng trường và quay về trước khi nắng gắt.", effects: { money: 5, farm: 1, relationships: { mira: 1 }, flags: ["helped_mira_delivery"], memory: "Đã giúp Mira giao phần hàng gần quảng trường." } },
    ],
    onExpire: { text: "Mira tự đi chuyến hàng. Xóm đồi biết về bạn qua lời kể của cô.", schedules: [{ day: 2, text: "Mira vẫn gọi bạn là “người mới” khi gặp lại." }] },
  },
  {
    id: "field_rain_barrel", actor: "field", appears: 2, deadline: 2,
    category: "DỰ ÁN NÔNG TRẠI", title: "Chiếc thùng hứng mưa", art: ART.farm,
    alt: "Nông trại sáng màu với thùng gỗ cạnh ngôi nhà.",
    premise: "Một chiếc thùng cũ có thể giữ nước cho ngày khô, nhưng cần cả buổi để cứu nó.",
    choices: [
      { id: "repair", label: "Vá thùng đúng cách", hint: "Đổi tiền và sức lấy một thứ bền lâu.", result: "Những vòng sắt cuối cùng chịu khép lại. Thùng đã sẵn sàng đón mưa.", effects: { money: -15, farm: 1, vitality: -1, flags: ["rain_barrel_repaired"], memory: "Đã sửa chiếc thùng hứng mưa." } },
      { id: "gutter", label: "Ghép máng gỗ tạm", hint: "Không tốn tiền, nhưng công việc nặng hơn.", result: "Chiếc máng thô không đẹp, nhưng đã dẫn được nước về sát ruộng.", effects: { farm: 1, vitality: -2, flags: ["rain_gutter_built"], memory: "Đã dựng máng dẫn nước tạm." } },
    ],
    onExpire: { text: "Mưa ngấm vào các vòng sắt. Chiếc thùng vỡ hẳn trước tối.", effects: { flags: ["rain_barrel_broken"] } },
  },
  {
    id: "mira_orders_after_rain", actor: "mira", appears: 2, deadline: 2,
    category: "QUAN HỆ", title: "Những đơn hàng sau mưa", art: ART.miraTea,
    alt: "Mira đưa một tách trà cho người nông dân đang mệt.",
    premise: "Đường trơn làm đơn hàng bị dồn lại. Mira cần một người giúp trước khi bánh nguội.",
    choices: [
      { id: "walk", label: "Đi hết tuyến cùng Mira", hint: "Kiếm thêm tiền, nhưng mất một phần sức.", result: "Hai người trở về với giỏ trống, giày lấm bùn và một tách trà nóng.", effects: { money: 10, vitality: -1, relationships: { mira: 2 }, flags: ["shared_tea_with_mira"], memory: "Đã cùng Mira giao hàng và uống trà sau mưa." }, schedules: [{ day: 3, text: "Mira nhắc rằng lễ hội sẽ bắt đầu tối nay." }] },
      { id: "cart", label: "Thuê xe kéo giúp cô", hint: "Tốn tiền, đổi lại một buổi sáng nhẹ hơn.", result: "Chuyến hàng kịp giờ. Mira nhớ rằng bạn đã nhìn thấy điều cô thực sự cần.", effects: { money: -10, vitality: 1, relationships: { mira: 1 }, flags: ["cafe_prepared"], memory: "Đã thuê xe giúp Mira giao hàng sau mưa." } },
    ],
    onExpire: { text: "Mira tự đi hết tuyến đường trơn. Quán mở muộn.", effects: { relationships: { mira: -1 }, flags: ["cafe_unprepared"] } },
  },
  {
    id: "mira_festival_repairs", actor: "mira", appears: 3, deadline: 3,
    category: "QUAN HỆ", urgency: "Tối nay", title: "Trước giờ lễ hội", art: ART.miraRepair,
    alt: "Mira giữ cánh chớp cửa sổ quán đang bung khỏi bản lề.",
    premise: "Cánh chớp quán đang bung khỏi bản lề. Lễ hội sẽ bắt đầu trước khi trời tối.",
    choices: [
      { id: "help", label: "Tự tay giúp Mira", hint: "Quán được cứu, nhưng nhà và sức lực phải nhường chỗ.", result: "Cánh chớp vừa khít trước khi khách đầu tiên tới.", effects: { farm: -1, vitality: -1, relationships: { mira: 2 }, flags: ["cafe_repaired"], memory: "Đã giúp Mira sửa quán trước lễ hội." }, schedules: [{ day: 5, text: "Mira gửi bữa sáng và chìa khóa quán để cảm ơn.", vitality: 1, inventory: "Chìa khóa quán" }] },
      { id: "hire_worker", label: "Trả tiền thuê thợ", hint: "Giữ sức và farm, đổi bằng khoản tiền đáng kể.", result: "Người thợ đến kịp lúc. Mira hiểu rằng bạn đã không bỏ mặc cô.", effects: { money: -20, relationships: { mira: 1 }, flags: ["cafe_repaired_by_worker"], memory: "Đã thuê người sửa quán cho Mira." } },
    ],
    onExpire: { text: "Mira chống tạm cánh chớp. Rowan đến giúp và lễ hội bắt đầu muộn.", effects: { relationships: { mira: -1 }, flags: ["festival_delayed"] }, schedules: [{ day: 4, text: "Rowan đã giúp Mira sửa phần còn lại mà không có bạn." }] },
  },
  {
    id: "rowan_gate_latch", actor: "rowan", appears: 3, deadline: 4,
    category: "BẢO TRÌ", title: "Chiếc chốt cổng", art: ART.farm, artStatus: "ẢNH TẠM",
    alt: "Ảnh nông trại tạm dùng cho sự kiện sửa cổng của Rowan.",
    premises: { 3: "Rowan có một chốt vừa khít, nhưng hôm nay anh cần người phụ giữ tấm ván.", 4: "Rowan chỉ còn giữ chiếc chốt đến cuối chiều. Cổng vẫn kêu trong gió." },
    carryText: "Rowan giữ chiếc chốt thêm một ngày; ngày mai là cơ hội cuối.",
    choices: [
      { id: "work", label: "Làm cùng Rowan", hint: "Farm vững hơn, đổi bằng sức lực.", result: "Cánh cổng đóng lại bằng một tiếng cạch chắc chắn.", effects: { farm: 1, vitality: -1, relationships: { rowan: 2 }, flags: ["gate_repaired"], memory: "Đã cùng Rowan sửa cổng." } },
      { id: "pay", label: "Trả Rowan tiền công", hint: "Giữ sức, nhưng tiền lại mỏng đi.", result: "Rowan làm việc một mình và để lại sợi dây đo cho dự án sau.", effects: { money: -25, farm: 1, relationships: { rowan: 1 }, flags: ["gate_repaired"], inventory: "Dây đo", memory: "Đã thuê Rowan sửa cổng." } },
    ],
    onExpire: { text: "Rowan cất chiếc chốt. Cánh cổng phải tự chịu cơn bão sắp tới.", effects: { flags: ["gate_broken"] } },
  },
  {
    id: "iris_stream_marks", actor: "iris", appears: 4, deadline: 4,
    category: "BÍ ẨN", urgency: "Hôm nay", title: "Dấu vết bên suối", art: ART.forest,
    alt: "Lối mòn qua con suối trong rừng với đá phủ rêu và đốm sáng nhỏ.",
    premise: "Iris chỉ những vệt sáng quanh đá bước. Con đường sẽ biến mất khi nước đổi dòng.",
    choices: [
      { id: "follow", label: "Theo Iris qua suối", hint: "Mất sức, đổi lấy một con đường và ký ức mới.", result: "Những đốm sáng dẫn tới một phiến đá ấm giữa bóng râm.", effects: { vitality: -1, relationships: { iris: 2 }, flags: ["forest_path_known"], inventory: "Đá sông ấm", memory: "Đã theo Iris qua suối." } },
      { id: "survey", label: "Khảo sát đường về", hint: "Giữ khoảng cách, nhưng tìm được thứ hữu ích cho farm.", result: "Bạn đánh dấu đường cao và tìm thấy một rãnh nước cũ dẫn về phía nhà.", effects: { farm: 1, relationships: { iris: 1 }, flags: ["forest_path_marked"], memory: "Đã cùng Iris đánh dấu đường cao." } },
    ],
    onExpire: { text: "Nước đổi dòng và những đốm sáng biến mất. Iris nói con đường sẽ trở lại vào mùa khác.", effects: { flags: ["forest_path_lost"] } },
  },
  {
    id: "field_storm_preparation", actor: "field", appears: 5, deadline: 5,
    category: "THỜI TIẾT", urgency: "Khẩn cấp", title: "Trước cơn gió lớn", art: ART.farm,
    alt: "Ngôi nhà và các luống rau trước khi thời tiết chuyển xấu.",
    premise: "Mái kho rung lên từng nhịp. Những gì chưa sửa trong bốn ngày qua sắp bị thử thách.",
    choices: [
      { id: "reinforce", label: "Ở nhà gia cố", hint: "Bảo vệ farm, nhưng dùng nốt sức còn lại.", result: "Nút dây cuối cùng được siết chặt ngay khi gió đổi hướng.", effects: { farm: 2, vitality: -2, flags: ["farm_storm_ready"], memory: "Đã chọn ở lại bảo vệ farm trong bão." } },
      { id: "sell", label: "Bán nhanh nông sản", hint: "Có tiền ngay, chấp nhận rủi ro ở nhà.", result: "Bạn bán được những gì có thể trước khi chợ đóng.", effects: { money: 35, farm: -1, flags: ["storm_risk_taken"], memory: "Đã bán nhanh nông sản trước bão." } },
    ],
    onExpire: { text: "Không ai ở nhà khi gió tới. Những phần chưa sửa của farm bắt đầu bung ra." },
  },
  {
    id: "rowan_storm_call", actor: "rowan", appears: 5, deadline: 5,
    category: "QUAN HỆ", urgency: "Trước tối", title: "Một mái nhà khác", art: ART.farm, artStatus: "ẢNH TẠM",
    alt: "Ảnh phong cảnh tạm cho sự kiện giúp Rowan trước bão.",
    premise: "Rowan đang gia cố nhà của một gia đình lớn tuổi. Anh không yêu cầu, chỉ hỏi bạn có rảnh không.",
    choices: [
      { id: "join", label: "Đến phụ Rowan", hint: "Một mái nhà khác được cứu; farm của bạn tự chống chịu.", result: "Hai người đóng tấm ván cuối cùng trong tiếng gió rít.", effects: { farm: -1, vitality: -1, relationships: { rowan: 3 }, flags: ["helped_rowan_in_storm"], memory: "Đã đến giúp Rowan trước bão." } },
      { id: "materials", label: "Gửi vật liệu rồi về", hint: "Giúp một phần, đổi bằng tiền thay vì sức lực.", result: "Rowan nhận dây và ván, rồi bảo bạn mau về nhà.", effects: { money: -10, relationships: { rowan: 1 }, flags: ["sent_storm_materials"], memory: "Đã gửi vật liệu giúp Rowan trước bão." } },
    ],
    onExpire: { text: "Rowan làm việc đến tối cùng những người khác. Gia đình kia vẫn an toàn." },
  },
  {
    id: "iris_storm_herbs", actor: "iris", appears: 5, deadline: 5,
    category: "BÍ ẨN", urgency: "Trước mưa", title: "Những lá thuốc cuối cùng", art: ART.forest,
    alt: "Con suối và lối rừng sáng trước khi mưa lớn.",
    premise: "Một khoảnh cây thuốc sẽ bị nước cuốn. Iris muốn cứu chúng trước khi mưa xuống.",
    choices: [
      { id: "follow", label: "Theo Iris vào rừng", hint: "Cứu cây thuốc, nhưng bỏ farm và sức lực phía sau.", result: "Hai người trở về ướt sũng với một túi lá thơm.", effects: { farm: -1, vitality: -2, relationships: { iris: 2 }, flags: ["storm_herbs_saved"], inventory: "Bó lá thuốc", memory: "Đã cứu cây thuốc cùng Iris." } },
      { id: "guide", label: "Chỉ đường cao cho Iris", hint: "Ít gần gũi hơn, nhưng không bỏ mặc cô.", result: "Iris đi theo đường cao và trở về muộn nhưng an toàn.", effects: { relationships: { iris: 1 }, flags: ["guided_iris_safely"], memory: "Đã chỉ Iris đường tránh nước xiết." } },
    ],
    onExpire: { text: "Cơn mưa đến trước. Một phần cây thuốc trôi theo dòng nước." },
  },
];

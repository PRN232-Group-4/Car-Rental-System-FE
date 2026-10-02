**TÀI LIỆU ĐẶC TẢ YÊU CẦU PHẦN MỀM**  
*Software Requirements Specification (SRS)*

**HỆ THỐNG CHO THUÊ PHƯƠNG TIỆN**  
**VEHICLE RENTAL SYSTEM (VRS)**

*(Trước đây: Car Rental System)*

**Phiên bản: 2.0**

Công nghệ: ASP.NET Core Web API · Next.js · PostgreSQL · Flutter

Ngày ban hành: 30/09/2026

*Căn cứ: mô hình conceptual và DDL PostgreSQL sau buổi review cuối với giảng viên*

# **Lịch sử thay đổi tài liệu**

| Phiên bản | Ngày | Người thực hiện | Nội dung thay đổi |
| :---- | :---- | :---- | :---- |
| 0.1 | 10/09/2026 | Nhóm phát triển | Khởi tạo bản nháp, thu thập yêu cầu từ giảng viên |
| 1.0 | 17/09/2026 | Nhóm phát triển | Hoàn thiện SRS v1.0 trên ERD 13 bảng (Car Rental System): thuê theo giờ/dài hạn, bản đồ giám sát, bảo dưỡng |
| 1.5 | 27/09/2026 | Nhóm phát triển | Cập nhật conceptual theo góp ý mentor: hướng chauffeur-driven, thêm Facilities, Package, Vehicle\_Assignment |
| 2.0 | 30/09/2026 | Nhóm phát triển | Viết lại SRS theo conceptual và DDL PostgreSQL cuối cùng: đổi tên thành Vehicle Rental System, thêm Rental\_Policy, Subscription, Inspection, tách Invoice/Payment; bỏ mô-đun bản đồ GPS thời gian thực do DDL không còn lưu toạ độ |

# **Mục lục**

 

# **1\. Giới thiệu**

## **1.1. Mục đích tài liệu**

Tài liệu này thay thế SRS v1.0, đặc tả lại yêu cầu phần mềm của hệ thống cho thuê phương tiện — đổi tên từ Car Rental System thành Vehicle Rental System (VRS) — theo đúng mô hình conceptual và DDL PostgreSQL đã được giảng viên và mentor duyệt ở buổi review cuối. Đây là tài liệu tham chiếu thống nhất giữa nhóm phát triển, giảng viên và mentor trong giai đoạn thiết kế chi tiết, lập trình và kiểm thử.

## **1.2. Phạm vi sản phẩm — những gì đã thay đổi so với v1.0**

So với bản Car Rental System ban đầu (chỉ thuê ô tô), phạm vi v2.0 mở rộng và thay đổi ở các điểm sau:

• Đa loại phương tiện: hệ thống quản lý bốn loại xe — Ô tô, Xe máy, Ô tô điện, Xe máy điện — mỗi loại có thuộc tính kỹ thuật riêng (ví dụ ô tô điện có dung lượng pin, quãng đường tối đa; ô tô xăng có hộp số, dung tích cốp).

• Thuê theo giờ (có hoặc không tài xế) và thuê dài hạn vẫn giữ nguyên tinh thần ban đầu, nhưng nay đi kèm cơ chế gán xe/tài xế (Vehicle\_Assignment) cho phép đổi cả xe lẫn tài xế giữa chừng nếu phát sinh sự cố.

• Gói thuê bao (Subscription Plan): khách hàng có thể mua gói giờ thuê trả trước thay vì thanh toán từng lượt.

• Kiểm định xe trước và sau mỗi lượt thuê (Inspection): ghi nhận tình trạng xe, số km/dung lượng pin còn lại, hư hỏng phát sinh.

• Chính sách thuê có thể cấu hình theo loại xe (Rental Policy): thuế VAT, phí trễ giờ, tỉ lệ đặt cọc — không còn hard-code.

• Tách bạch Hoá đơn (Invoice) chỉ dùng cho thuê trực tiếp, và Thanh toán (Payment) dùng chung cho cả hai hình thức (trực tiếp và theo gói).

• Không còn mô-đun bản đồ giám sát vị trí xe theo thời gian thực (GPS/toạ độ) — DDL hiện chỉ lưu current\_location dạng mô tả văn bản. Mục 1.2.1 nêu rõ đây là điểm cần xác nhận lại với giảng viên.

Ngoài phạm vi (out of scope) của v2.0: thuê xe tải chuyên dụng, tích hợp bảo hiểm tự động, ứng dụng đa ngôn ngữ, chia sẻ xe ngang hàng.

### **1.2.1. Điểm cần xác nhận lại (giả định đang áp dụng)**

Ba điểm sau đây được suy ra hợp lý từ DDL hiện có nhưng không được nêu tường minh; SRS này áp dụng giả định mặc định và đề nghị nhóm xác nhận lại với mentor/giảng viên trước khi khoá thiết kế:

• Cơ sở tính đặt cọc: yêu cầu gốc là "đặt cọc 10% so với giá trị xe", nhưng bảng vehicles không lưu giá trị tài sản (giá mua/giá trị bảo hiểm) của xe, chỉ có giá thuê theo giờ và theo tháng. SRS này giả định deposit\_percentage trong Rental\_Policy được nhân với tổng giá trị đơn thuê dự kiến (total\_price), không phải giá trị xe. Nếu ý định ban đầu là % trên giá trị tài sản xe, cần bổ sung một cột giá trị xe vào bảng vehicles.

• Mô-đun bản đồ giám sát đội xe theo yêu cầu gốc của giảng viên ("map quản lý xem xe ở đâu") được thu gọn thành hiển thị vị trí hiện tại dạng văn bản/chi nhánh, do DDL không còn bảng lưu lịch sử toạ độ. Nếu vẫn cần bản đồ thời gian thực, cần bổ sung lại cơ chế lưu toạ độ định kỳ.

• Sơ đồ conceptual do nhóm vẽ vẫn còn một đường quan hệ trực tiếp Staff–Vehicles ("drives"), nhưng DDL không có cột nào hiện thực hoá quan hệ này — SRS lấy DDL làm nguồn xác thực và không đặc tả quan hệ đó; đề nghị xoá đường thừa này khỏi sơ đồ conceptual cho khớp.

## **1.3. Thuật ngữ và từ viết tắt**

| Thuật ngữ | Giải thích |
| :---- | :---- |
| VRS | Vehicle Rental System — tên hệ thống trong tài liệu này (thay cho CRS) |
| Vehicle Type | Loại phương tiện: Ô tô, Xe máy, Ô tô điện, Xe máy điện |
| Staff | Nhân viên nội bộ; nếu is\_driver \= true thì đồng thời đóng vai trò tài xế (không còn bảng Driver riêng) |
| Vehicle Assignment | Bản ghi gán một xe và (tuỳ chọn) một tài xế cho một đơn thuê trong một khoảng thời gian; một đơn thuê có thể có nhiều bản ghi để hỗ trợ đổi xe/tài xế giữa chừng |
| Rental Policy | Chính sách áp dụng cho một loại xe: thuế VAT, phí trễ giờ, tỉ lệ đặt cọc |
| Subscription Plan | Gói thuê bao trả trước, quy đổi ra số giờ sử dụng (included\_hours) |
| Customer Subscription | Gói mà một khách hàng cụ thể đã đăng ký, còn lại remaining\_hours để dùng dần |
| Inspection | Phiếu kiểm định tình trạng xe, thực hiện trước (pre\_rental) và sau (post\_rental) mỗi đơn thuê |
| Invoice | Hoá đơn — chỉ phát sinh cho đơn thuê trực tiếp (không dùng gói) |
| Payment | Giao dịch thanh toán/hoàn tiền — dùng chung cho cả đơn thuê trực tiếp và đơn thuê theo gói |
| Report | Báo cáo/khiếu nại do khách hàng gửi, gắn với một đơn thuê hoặc một phiếu bảo dưỡng cụ thể |
| RBAC | Role-Based Access Control — phân quyền qua bảng roles và user\_roles (một người dùng có thể có nhiều vai trò) |

## **1.4. Tài liệu tham khảo**

• SRS v1.0 — Car Rental System (17/09/2026).

• Sơ đồ conceptual "Chauffeur-Driven Rental" sau góp ý mentor (27/09/2026).

• Sơ đồ conceptual và tệp DDL PostgreSQL "Vehicle Rental System v2" sau buổi review cuối cùng với giảng viên (30/09/2026) — nguồn xác thực chính cho tài liệu này.

• IEEE Std 830-1998 — Recommended Practice for Software Requirements Specifications.

# **2\. Tổng quan**

## **2.1. Kiến trúc và công nghệ**

Kiến trúc bốn thành phần giữ nguyên như v1.0:

| Thành phần | Công nghệ | Vai trò |
| :---- | :---- | :---- |
| Web Portal | Next.js (React, TypeScript, Tailwind CSS) | Cổng quản trị cho Staff/Admin; website đặt xe cho khách |
| Mobile App | Flutter (Android/iOS) | Ứng dụng khách hàng, ứng dụng tài xế/nhân viên (staff có is\_driver \= true) |
| Backend API | ASP.NET Core Web API (.NET 8), Entity Framework Core | Xử lý nghiệp vụ, phân quyền RBAC, tích hợp thanh toán |
| Cơ sở dữ liệu | PostgreSQL 15 | 26 bảng theo DDL v2; ràng buộc nghiệp vụ dùng CHECK constraint và trigger thay vì khoá ngoại tường minh |

Lưu ý kỹ thuật quan trọng: DDL v2 chủ động không khai báo FOREIGN KEY (ghi rõ trong comment "no foreign keys"), các cột \*\_id chỉ là khoá ngoại về mặt logic. Tầng ứng dụng (Entity Framework Core) chịu trách nhiệm đảm bảo toàn vẹn tham chiếu; cần bổ sung FK thật ở migration hoặc validate chặt ở tầng service để tránh dữ liệu mồ côi.

## **2.2. Nhóm chức năng chính**

| Nhóm chức năng | Tóm tắt | Thay đổi so với v1.0 |
| :---- | :---- | :---- |
| Tài khoản & phân quyền | Đăng ký, đăng nhập, RBAC nhiều vai trò trên một người dùng | Không đổi nhiều |
| Hồ sơ Staff/Customer | Users là gốc; Staff và Customer là hồ sơ mở rộng 1-1 | Gộp Driver vào Staff (cờ is\_driver) |
| Phòng ban & chi nhánh | Department, Facilities | Thêm Department |
| Quản lý phương tiện đa loại | Vehicle\_Types \+ 4 bảng thuộc tính riêng | Mới — trước đây chỉ có ô tô |
| Chính sách thuê | VAT, phí trễ, % cọc theo từng loại xe | Mới, thay cho hard-code |
| Gói thuê bao | Subscription\_Plans, Customer\_Subscriptions | Mới |
| Đặt & quản lý đơn thuê | Rental \+ Hour\_Rental\_Detail/Longterm\_Rental\_Contract | Có nhánh is\_subscription |
| Gán xe & tài xế | Vehicle\_Assignment, hỗ trợ đổi giữa chừng | Thay cho Vehicle\_Drivers cũ |
| Kiểm định xe | Inspection trước/sau mỗi lượt thuê | Mới |
| Hoá đơn & thanh toán | Invoice (chỉ thuê trực tiếp) \+ Payment (cả hai loại) | Tách rõ 2 khái niệm |
| Bảo dưỡng xe | Vehicle\_Maintenance, có thể phát sinh từ Inspection không đạt | Bổ sung liên kết Inspection |
| Báo cáo/khiếu nại khách hàng | Reports gắn với Rental hoặc Vehicle\_Maintenance | Đổi ý nghĩa: khiếu nại, không phải báo cáo thống kê |
| Bản đồ vị trí xe | current\_location dạng văn bản | Thu gọn từ bản đồ GPS thời gian thực |

## **2.3. Tác nhân**

| Tác nhân | Mô tả | Nền tảng |
| :---- | :---- | :---- |
| Khách hàng (Customer) | Hồ sơ mở rộng của Users; có GPLX riêng để tự lái, có loyalty\_point, có thể đăng ký Subscription | Flutter App, Next.js Web |
| Nhân viên (Staff) | Hồ sơ mở rộng của Users; thuộc một Department và một Facility; nếu is\_driver \= true thì được gán làm tài xế qua Vehicle\_Assignment | Flutter App, Next.js Web |
| Quản trị viên | Staff có vai trò Admin qua RBAC (user\_roles); cấu hình Rental\_Policy, Subscription\_Plan, quản lý toàn hệ thống | Next.js Web |
| Cổng thanh toán | Tác nhân hệ thống, xử lý Payment và trả kết quả | Tích hợp API |

## **2.4. Ràng buộc thiết kế**

| Mã | Ràng buộc |
| :---- | :---- |
| CON-01 | Backend ASP.NET Core Web API, frontend Next.js, mobile Flutter, cơ sở dữ liệu PostgreSQL — giữ nguyên từ v1.0 |
| CON-02 | Mô hình dữ liệu bám sát DDL v2 (26 bảng); mọi thay đổi cấu trúc phải cập nhật lại DDL và SRS đồng thời |
| CON-03 | Một đơn thuê dài hạn (rental\_type \= longterm) không gắn is\_subscription \= true, vì Subscription tính theo included\_hours — chỉ áp dụng hợp lý cho thuê theo giờ (xem giả định 1.2.1) |
| CON-04 | Mỗi đơn thuê tối đa 1 phiếu kiểm định pre\_rental và 1 phiếu post\_rental (ràng buộc UNIQUE trong DDL) |
| CON-05 | Đơn thuê theo gói (is\_subscription \= true) không được phép có Invoice (chặn bởi trigger); chỉ ghi nhận qua Payment với is\_subscription\_payment \= true |
| CON-06 | Giao diện tiếng Việt, đơn vị tiền VND, múi giờ GMT+7, toàn bộ giao tiếp qua HTTPS |

## **2.5. Môi trường vận hành**

• Máy chủ: Linux/Windows Server, .NET 8 runtime, triển khai Docker.

• PostgreSQL 15 trở lên.

• Trình duyệt: Chrome, Edge, Firefox, Safari — hai phiên bản mới nhất.

• Thiết bị di động: Android 8.0+, iOS 13+.

# **3\. Yêu cầu chức năng**

Mức ưu tiên: Cao (bắt buộc), Trung bình (nên có), Thấp (có thể sau). Mã yêu cầu giữ tiền tố tương ứng phân hệ; các phân hệ mới so với v1.0 được đánh dấu (Mới).

## **3.1. Xác thực và phân quyền (AUTH)**

| Mã | Tên yêu cầu | Mô tả chi tiết | Ưu tiên |
| :---- | :---- | :---- | :---- |
| FR-AUTH-01 | Đăng ký/đăng nhập | Tài khoản trong bảng users (email duy nhất, password\_hash, fullname, gender, phone, avatar); đăng nhập cấp JWT. | Cao |
| FR-AUTH-02 | Phân quyền nhiều vai trò | Bảng roles và user\_roles cho phép một Users có nhiều vai trò cùng lúc (ví dụ vừa Staff vừa Admin); API kiểm tra quyền theo tập vai trò hiệu lực. | Cao |
| FR-AUTH-03 | Khoá/mở khoá tài khoản | Cờ is\_active trên users; tài khoản is\_active \= false không đăng nhập được. | Cao |
| FR-AUTH-04 | Đổi/khôi phục mật khẩu | Đổi khi đã đăng nhập; khôi phục qua email/OTP. | Cao |

## **3.2. Hồ sơ người dùng: Staff và Customer (USR)**

| Mã | Tên yêu cầu | Mô tả chi tiết | Ưu tiên |
| :---- | :---- | :---- | :---- |
| FR-USR-01 | Hồ sơ Staff | Mở rộng 1-1 từ users (staffs.user\_id duy nhất): department\_id, facility\_id, hired\_date, is\_driver, rating, và thông tin GPLX (license\_number, license\_type, ngày cấp/hết hạn, ảnh) dùng khi is\_driver \= true. | Cao |
| FR-USR-02 | Hồ sơ Customer | Mở rộng 1-1 từ users (customers.user\_id duy nhất): GPLX riêng để tự lái, loyalty\_point tích luỹ. | Cao |
| FR-USR-03 | Quản lý Department | Danh mục phòng ban nội bộ, gán Staff vào một Department. | Trung bình |
| FR-USR-04 | Quản lý Facilities | Danh mục chi nhánh (tên, địa chỉ); Staff làm việc tại một Facility, Vehicles được chứa tại một Facility. | Cao |
| FR-USR-05 | Một người dùng tối đa một hồ sơ Staff và một hồ sơ Customer | Ràng buộc unique trên staffs.user\_id và customers.user\_id — một tài khoản có thể vừa là nhân viên vừa là khách hàng nhưng không được có hai hồ sơ Staff hoặc hai hồ sơ Customer. | Cao |

## **3.3. Quản lý phương tiện đa loại (VEH) — mở rộng so với v1.0**

| Mã | Tên yêu cầu | Mô tả chi tiết | Ưu tiên |
| :---- | :---- | :---- | :---- |
| FR-VEH-01 | Danh mục loại phương tiện | Bảng vehicle\_types (tên, fuel\_type) — hỗ trợ tối thiểu 4 loại: Ô tô, Xe máy, Ô tô điện, Xe máy điện; có thể mở rộng thêm loại khác không cần đổi cấu trúc. | Cao |
| FR-VEH-02 | Hồ sơ xe chung | vehicles: facility\_id, vehicle\_type\_id, brand, model, color, year\_of\_manufacture, rental\_price\_hourly, rental\_price\_longterm, description, main\_img\_url, current\_location, status, is\_renting, created\_by (staff tạo hồ sơ). | Cao |
| FR-VEH-03 | Thuộc tính riêng theo loại xe | Khi tạo xe, hệ thống bắt buộc nhập đúng một bảng thuộc tính con tương ứng với vehicle\_type\_id: car\_detail (số chỗ, hộp số, dung tích cốp), motorbike\_detail (loại xe máy, có cốp không), electric\_car\_detail/electric\_motorbike\_detail (dung lượng pin, kiểu sạc, thời gian sạc, quãng đường tối đa, loại pin). | Cao |
| FR-VEH-04 | Thư viện ảnh xe | vehicle\_imgs cho phép nhiều ảnh trên một xe, ngoài main\_img\_url đại diện. | Trung bình |
| FR-VEH-05 | Trạng thái xe | status (available/renting/maintenance/...) đồng bộ với is\_renting; đề xuất bổ sung CHECK constraint giới hạn tập giá trị hợp lệ cho status vì DDL hiện để VARCHAR tự do. | Cao |
| FR-VEH-06 | Vị trí hiện tại | current\_location là mô tả văn bản (ví dụ tên chi nhánh hoặc địa chỉ hiện tại), không phải toạ độ GPS theo thời gian thực — xem giả định 1.2.1. | Trung bình |

## **3.4. Chính sách thuê theo loại xe (POL) — Mới**

| Mã | Tên yêu cầu | Mô tả chi tiết | Ưu tiên |
| :---- | :---- | :---- | :---- |
| FR-POL-01 | Cấu hình chính sách | rental\_policies: gắn theo vehicle\_type\_id, gồm vat\_rate (thuế VAT), overtime\_fee\_rate (phí trễ giờ), deposit\_percentage (tỉ lệ đặt cọc), is\_active, và managed\_by (staff quản lý chính sách). | Cao |
| FR-POL-02 | Áp dụng chính sách cho đơn thuê | Khi tạo Rental, hệ thống chọn policy\_id đang is\_active \= true phù hợp với vehicle\_type\_id của xe được thuê để tính vat\_price, deposit\_price, overtime\_price. | Cao |
| FR-POL-03 | Nhiều chính sách song song | Cho phép nhiều rental\_policies cùng tồn tại cho một loại xe theo thời gian (khuyến mãi, thời điểm), nhưng chỉ một chính sách is\_active áp dụng mặc định tại một thời điểm — cần quy tắc chọn rõ ràng khi có nhiều chính sách active. | Trung bình |

## **3.5. Gói thuê bao (SUB) — Mới**

| Mã | Tên yêu cầu | Mô tả chi tiết | Ưu tiên |
| :---- | :---- | :---- | :---- |
| FR-SUB-01 | Danh mục gói | subscription\_plans: name, description, price, duration\_days, included\_hours (số giờ được dùng trong gói), is\_active. | Cao |
| FR-SUB-02 | Đăng ký gói | customer\_subscriptions: customer\_id, plan\_id, start\_date, end\_date (\>= start\_date), remaining\_hours khởi tạo bằng included\_hours, status. | Cao |
| FR-SUB-03 | Sử dụng gói khi thuê | Khi tạo Rental với is\_subscription \= true, bắt buộc customer\_subscription\_id hợp lệ và còn remaining\_hours; sau khi hoàn thành đơn, trừ số giờ đã dùng vào remaining\_hours. | Cao |
| FR-SUB-04 | Từ chối khi hết giờ hoặc hết hạn gói | Nếu remaining\_hours không đủ hoặc end\_date đã qua, hệ thống từ chối tạo đơn thuê theo gói và gợi ý chuyển sang thuê trực tiếp. | Cao |

## **3.6. Đặt và quản lý đơn thuê (RENT)**

| Mã | Tên yêu cầu | Mô tả chi tiết | Ưu tiên |
| :---- | :---- | :---- | :---- |
| FR-RENT-01 | Tạo đơn thuê | rentals: customer\_id, vehicle\_id, policy\_id, rental\_type (hourly/longterm), is\_subscription và customer\_subscription\_id đi kèm nhất quán với nhau. | Cao |
| FR-RENT-02 | Chi tiết thuê theo giờ | hour\_rental\_detail (1-1 với rental khi hourly): start\_time, end\_time, has\_driver, hourly\_price\_snapshot (giá tại thời điểm đặt), pickup\_location, pick\_up\_method, staff\_pickup\_id (nhân viên giao xe). | Cao |
| FR-RENT-03 | Hợp đồng thuê dài hạn | longterm\_rental\_contract (1-1 với rental khi longterm): start\_time, end\_time, monthly\_price\_snapshot, contract\_link, signed\_at, pick\_up\_location, pick\_up\_method, staff\_pick\_up\_id. | Cao |
| FR-RENT-04 | Vòng đời trạng thái đơn thuê | status đề xuất: pending → pre\_inspection → renting → post\_inspection → completed, hoặc chuyển cancelled từ pending/pre\_inspection. | Cao |
| FR-RENT-05 | Snapshot giá tại thời điểm đặt | hourly\_price\_snapshot/monthly\_price\_snapshot lưu lại giá tại lúc đặt để không bị ảnh hưởng nếu vehicles.rental\_price\_hourly/longterm thay đổi sau đó. | Cao |

## **3.7. Gán xe và tài xế (ASG)**

| Mã | Tên yêu cầu | Mô tả chi tiết | Ưu tiên |
| :---- | :---- | :---- | :---- |
| FR-ASG-01 | Gán xe/tài xế cho đơn thuê | vehicle\_assignments: rental\_id, vehicle\_id, driver\_staff\_id (NULL nếu khách tự lái), status, assigned\_at. | Cao |
| FR-ASG-02 | Đổi xe/tài xế giữa chừng | Một Rental có thể có nhiều Vehicle\_Assignment theo thời gian: khi xe hỏng giữa chuyến, đóng assignment hiện tại và tạo assignment mới với xe và/hoặc tài xế khác, không phải sửa lại đơn thuê gốc. | Cao |
| FR-ASG-03 | Ràng buộc một xe một tài xế tại một thời điểm | driver\_staff\_id chỉ nhận Staff có is\_driver \= true. DDL hiện chưa có ràng buộc UNIQUE có điều kiện để đảm bảo một vehicle\_id chỉ có một assignment đang active cùng lúc — cần bổ sung trước khi triển khai (xem mục 7.3). | Cao |

## **3.8. Kiểm định xe trước/sau thuê (INS) — Mới, đáp ứng yêu cầu "xem xe có an toàn không"**

| Mã | Tên yêu cầu | Mô tả chi tiết | Ưu tiên |
| :---- | :---- | :---- | :---- |
| FR-INS-01 | Kiểm định trước khi giao xe | inspections với inspection\_type \= 'pre\_rental': staff\_id người kiểm tra, odometer\_km, fuel\_battery\_level, is\_ok, damage\_notes, img\_urls, inspected\_at. | Cao |
| FR-INS-02 | Kiểm định sau khi nhận lại xe | inspections với inspection\_type \= 'post\_rental', cùng cấu trúc dữ liệu; đối chiếu với phiếu pre\_rental để phát hiện hư hỏng phát sinh trong lượt thuê. | Cao |
| FR-INS-03 | Giới hạn một phiếu mỗi loại | Ràng buộc UNIQUE(rental\_id, inspection\_type) — mỗi đơn thuê chỉ có tối đa 1 phiếu pre\_rental và 1 phiếu post\_rental. | Cao |
| FR-INS-04 | Phát sinh bảo dưỡng từ kiểm định không đạt | Khi is\_ok \= false, hệ thống đề xuất tạo vehicle\_maintenance liên kết qua inspection\_id. | Cao |

## **3.9. Hoá đơn và thanh toán (PAY)**

| Mã | Tên yêu cầu | Mô tả chi tiết | Ưu tiên |
| :---- | :---- | :---- | :---- |
| FR-PAY-01 | Hoá đơn cho thuê trực tiếp | invoices chỉ được tạo khi rentals.is\_subscription \= false (trigger trg\_invoice\_no\_subscription chặn trường hợp ngược lại); gồm invoice\_number duy nhất, amount, vat\_amount, status, issued\_at, due\_at. | Cao |
| FR-PAY-02 | Thanh toán | payments dùng cho cả hai loại đơn: is\_subscription\_payment phải khớp với rentals.is\_subscription (trigger trg\_payment\_match\_rental kiểm tra); nếu là thanh toán trực tiếp thì bắt buộc có invoice\_id, nếu là thanh toán qua gói thì invoice\_id phải NULL. | Cao |
| FR-PAY-03 | Đặt cọc | deposit\_price trên Rental tính theo rental\_policies.deposit\_percentage; cơ sở nhân là total\_price của đơn thuê (xem giả định 1.2.1 về "giá trị xe"). | Cao |
| FR-PAY-04 | Các loại giao dịch | payments.type phân biệt cọc, tiền thuê, phụ phí trễ, hoàn tiền; method lưu phương thức (tiền mặt, thẻ, ví). | Cao |
| FR-PAY-05 | Hoàn cọc | Sau khi đối chiếu post\_rental inspection, tạo Payment loại hoàn tiền cho phần cọc còn lại sau khi trừ phí phát sinh. | Cao |

## **3.10. Bảo dưỡng xe (MNT)**

| Mã | Tên yêu cầu | Mô tả chi tiết | Ưu tiên |
| :---- | :---- | :---- | :---- |
| FR-MNT-01 | Phiếu bảo dưỡng | vehicle\_maintenance: vehicle\_id, facility\_id, assigned\_staff\_id, maintenance\_type, scheduled\_date, start\_time, end\_time, cost, description. | Cao |
| FR-MNT-02 | Liên kết nguồn gốc | Một phiếu có thể xuất phát từ inspection\_id (kiểm định không đạt) hoặc rental\_id (bảo dưỡng trong lúc đang có hợp đồng dài hạn) — cả hai đều là tuỳ chọn, độc lập với nhau. | Cao |
| FR-MNT-03 | Kết luận an toàn | is\_safe (đạt/không đạt) quyết định xe có được đưa về status \= available hay tiếp tục maintenance/ngừng khai thác. | Cao |
| FR-MNT-04 | Khoá lịch khi đang bảo dưỡng | Xe có phiếu bảo dưỡng đang mở không được xuất hiện trong tìm kiếm và không được tạo Vehicle\_Assignment mới. | Cao |

## **3.11. Báo cáo/khiếu nại từ khách hàng (RPT)**

| Mã | Tên yêu cầu | Mô tả chi tiết | Ưu tiên |
| :---- | :---- | :---- | :---- |
| FR-RPT-01 | Gửi báo cáo | reports: customer\_id, rental\_id và/hoặc maintenance\_id, type, description, status — khách hàng phản ánh sự cố gắn với một đơn thuê cụ thể hoặc một phiếu bảo dưỡng cụ thể. | Trung bình |
| FR-RPT-02 | Xử lý báo cáo | Nhân viên cập nhật status của report (tiếp nhận, đang xử lý, đã giải quyết). | Trung bình |

## **3.12. Báo cáo thống kê quản trị (DASH)**

Nhóm chức năng này tính toán trực tiếp từ dữ liệu giao dịch (rentals, payments, vehicle\_maintenance...), không có bảng lưu trữ riêng trong DDL — thuộc tầng ứng dụng/BI, giữ tinh thần như SRS v1.0.

| Mã | Tên yêu cầu | Mô tả chi tiết | Ưu tiên |
| :---- | :---- | :---- | :---- |
| FR-DASH-01 | Doanh thu | Tổng hợp payments theo khoảng thời gian, theo facility, theo vehicle\_type. | Cao |
| FR-DASH-02 | Tỉ lệ khai thác xe | Tỉ lệ thời gian is\_renting \= true trên tổng thời gian khả dụng của từng xe. | Trung bình |
| FR-DASH-03 | Chi phí bảo dưỡng | Tổng hợp cost trong vehicle\_maintenance theo xe, đối chiếu doanh thu xe đó mang lại. | Cao |
| FR-DASH-04 | Tỉ lệ gói thuê bao được dùng | Số giờ đã dùng trên included\_hours theo từng subscription\_plans để đánh giá gói nào hiệu quả. | Trung bình |

# **4\. Đặc tả use case trọng yếu**

## **4.1. UC-01: Đặt thuê xe theo giờ có tài xế**

| Mục | Nội dung |
| :---- | :---- |
| Tác nhân chính | Khách hàng |
| Điều kiện trước | Xe ở trạng thái available; nếu thuê theo gói thì customer\_subscriptions còn remaining\_hours |
| Điều kiện sau | rentals ở status \= pending; hour\_rental\_detail và vehicle\_assignments (driver\_staff\_id khác NULL) được tạo |
| Luồng chính | 1\. Khách chọn loại xe, khung giờ, bật has\_driver. 2\. Hệ thống lọc xe available theo vehicle\_type\_id, có Staff is\_driver \= true khả dụng trong khung giờ. 3\. Khách chọn xe; hệ thống lấy rental\_policies is\_active tương ứng vehicle\_type\_id để tính vat\_price, deposit\_price. 4\. Khách chọn thanh toán trực tiếp hoặc dùng Subscription (nếu is\_subscription \= true, kiểm tra remaining\_hours). 5\. Tạo rentals \+ hour\_rental\_detail (snapshot giá theo giờ) \+ vehicle\_assignments gán xe và tài xế. 6\. Nếu thanh toán trực tiếp: tạo invoices rồi payments (loại cọc); nếu theo gói: tạo payments trực tiếp, is\_subscription\_payment \= true, invoice\_id NULL. 7\. status chuyển pre\_inspection; nhân viên/tài xế thực hiện Inspection loại pre\_rental trước khi giao xe. |
| Luồng thay thế | 2a. Không có xe \+ tài xế nào khả dụng: gợi ý khung giờ khác hoặc tự lái (has\_driver \= false, driver\_staff\_id NULL). 4a. Subscription không đủ giờ: từ chối, gợi ý chuyển sang thanh toán trực tiếp. |
| Quy tắc nghiệp vụ | driver\_staff\_id trong vehicle\_assignments chỉ nhận Staff có is\_driver \= true; is\_subscription phải khớp với việc có customer\_subscription\_id hay không (CHECK ck\_rentals\_subscription). |

## **4.2. UC-02: Đăng ký và sử dụng gói thuê bao**

| Mục | Nội dung |
| :---- | :---- |
| Tác nhân chính | Khách hàng |
| Điều kiện trước | Khách hàng đã có hồ sơ Customer |
| Điều kiện sau | customer\_subscriptions được tạo với remaining\_hours \= included\_hours của gói |
| Luồng chính | 1\. Khách xem danh sách subscription\_plans đang is\_active. 2\. Khách chọn gói, hệ thống tạo customer\_subscriptions (start\_date \= hôm nay, end\_date \= start\_date \+ duration\_days, remaining\_hours \= included\_hours, status \= active). 3\. Khách thanh toán giá gói qua Payment (is\_subscription\_payment \= true, không có invoice, không gắn với một rental cụ thể — xem ghi chú). 4\. Khi đặt thuê theo giờ sau đó, khách chọn dùng gói này; sau khi hoàn thành đơn, hệ thống trừ số giờ đã dùng vào remaining\_hours. |
| Luồng thay thế | 4a. Hết remaining\_hours trước khi end\_date: hệ thống báo hết giờ, khách có thể mua thêm gói mới hoặc chuyển sang thanh toán trực tiếp cho các lượt sau. |
| Quy tắc nghiệp vụ | end\_date phải lớn hơn hoặc bằng start\_date (CHECK ck\_cs\_dates). Ghi chú: Payment cho việc mua gói không gắn rental\_id cụ thể theo đúng nghĩa — cần làm rõ cách payments.rental\_id được xử lý trong trường hợp này vì cột này đang NOT NULL trong DDL (xem mục 7.3). |

## **4.3. UC-03: Xe hỏng giữa chuyến — đổi xe và tài xế**

| Mục | Nội dung |
| :---- | :---- |
| Tác nhân chính | Nhân viên chi nhánh |
| Điều kiện trước | rentals đang status \= renting, có vehicle\_assignments đang active |
| Điều kiện sau | vehicle\_assignments cũ được đóng (status \= ended/replaced), một bản ghi mới được tạo với xe và/hoặc tài xế khác |
| Luồng chính | 1\. Tài xế hoặc khách báo xe gặp sự cố qua ứng dụng. 2\. Nhân viên xác nhận, tạo vehicle\_maintenance cho xe cũ (maintenance\_type \= sự cố). 3\. Hệ thống tìm xe thay thế available cùng vehicle\_type\_id (hoặc tương đương) và tài xế is\_driver \= true khả dụng. 4\. Đóng vehicle\_assignments hiện tại, tạo bản ghi vehicle\_assignments mới trỏ cùng rental\_id nhưng vehicle\_id/driver\_staff\_id mới. 5\. Thực hiện Inspection nhanh cho xe thay thế trước khi giao tiếp (không tính là pre\_rental thứ hai — xem ghi chú). 6\. rentals.status giữ nguyên renting, hành trình tiếp tục. |
| Luồng thay thế | 3a. Không có xe thay thế cùng loại: đề xuất loại xe khác, tính lại chênh lệch giá và thông báo khách. |
| Quy tắc nghiệp vụ | Đây là kịch bản trực tiếp minh chứng lý do Rental 1–N Vehicle\_Assignment thay vì 1–1: không cần sửa đơn thuê gốc khi đổi phương tiện. Ghi chú: DDL hiện chỉ cho tối đa 1 inspection mỗi loại/rental (FR-INS-03) — cần bổ sung quy tắc cho tình huống kiểm tra xe thay thế giữa chừng, ví dụ thêm cột assignment\_id vào inspections thay vì chỉ rental\_id. |

## **4.4. UC-04: Trả xe, kiểm định sau thuê và quyết toán**

| Mục | Nội dung |
| :---- | :---- |
| Tác nhân chính | Nhân viên chi nhánh |
| Điều kiện trước | rentals đang status \= renting |
| Điều kiện sau | status chuyển completed; inspections post\_rental hoàn tất; payments quyết toán xong |
| Luồng chính | 1\. Khách trả xe; nhân viên chuyển rentals.status sang post\_inspection. 2\. Tạo inspections loại post\_rental: odometer\_km/fuel\_battery\_level hiện tại, is\_ok, damage\_notes, img\_urls. 3\. Hệ thống đối chiếu với phiếu pre\_rental để phát hiện chênh lệch (km đã đi, hư hỏng mới). 4\. Tính overtime\_price nếu trả trễ theo overtime\_fee\_rate trong rental\_policies; cập nhật total\_price. 5a. Nếu is\_subscription \= false: cập nhật invoices sang trạng thái đã thanh toán đủ, tạo payments hoàn cọc phần còn lại. 5b. Nếu is\_subscription \= true: trừ số giờ thực tế đã dùng vào customer\_subscriptions.remaining\_hours, tạo payments cho phần phụ phí phát sinh nếu có (vẫn is\_subscription\_payment \= true). 6\. Nếu is\_ok \= false ở bước 2: tạo vehicle\_maintenance liên kết inspection\_id, xe chuyển status \= maintenance thay vì available. 7\. rentals.status chuyển completed. |
| Quy tắc nghiệp vụ | UNIQUE(rental\_id, inspection\_type) đảm bảo không tạo trùng phiếu post\_rental. Trigger trg\_payment\_match\_rental đảm bảo is\_subscription\_payment luôn khớp rentals.is\_subscription. |

# **5\. Yêu cầu giao diện bên ngoài**

## **5.1. Giao diện người dùng**

• Cổng quản trị Next.js: quản lý Vehicle\_Types và 4 loại thuộc tính riêng qua form động theo loại xe; quản lý Rental\_Policy và Subscription\_Plan; màn hình Inspection trước/sau thuê dạng checklist có upload ảnh.

• Ứng dụng khách hàng (Flutter): luồng chọn loại xe → khung giờ/hình thức → gói hoặc thanh toán trực tiếp; màn hình quản lý gói đang sở hữu (remaining\_hours).

• Ứng dụng nhân viên/tài xế (Flutter, is\_driver \= true): nhận thông báo Vehicle\_Assignment, thực hiện Inspection tại điểm giao/nhận xe.

• Toàn bộ giao diện tiếng Việt, tương phản đạt WCAG AA.

## **5.2. Giao diện phần mềm**

| Hệ thống ngoài | Mục đích | Phương thức tích hợp |
| :---- | :---- | :---- |
| Cổng thanh toán trong nước | Xử lý Payment (cọc, thuê, gói, hoàn tiền) | REST API \+ webhook đối soát theo mã giao dịch |
| Dịch vụ lưu trữ tệp | Lưu vehicle\_imgs, img\_urls của Inspection, license\_img | Lưu trữ tương thích S3, liên kết có thời hạn |
| Firebase Cloud Messaging | Thông báo Vehicle\_Assignment mới, nhắc lịch bảo dưỡng, cảnh báo hết giờ Subscription | Server SDK .NET |
| Dịch vụ email/SMS | Xác nhận đơn, hoá đơn, nhắc hết hạn Subscription | SMTP/API nhà cung cấp |

## **5.3. Giao diện truyền thông**

• API REST, JSON, tài liệu hoá OpenAPI/Swagger, xác thực JWT.

• HTTPS bắt buộc toàn bộ, TLS 1.2 trở lên.

# **6\. Yêu cầu phi chức năng**

Các yêu cầu phi chức năng về hiệu năng, khả dụng và bảo mật giữ nguyên tinh thần SRS v1.0 (xem bản 1.0 để đối chiếu chi tiết từng mã NFR). Điểm bổ sung riêng cho v2.0:

| Mã | Yêu cầu |
| :---- | :---- |
| NFR-SEC-09 | Vì DDL không khai báo FOREIGN KEY, tầng ứng dụng (EF Core) phải tự kiểm tra tồn tại của mọi \*\_id trước khi ghi, và chạy trong transaction để tránh dữ liệu mồ côi khi có lỗi giữa chừng |
| NFR-REL-05 | Hai trigger nghiệp vụ (fn\_block\_invoice\_for\_subscription, fn\_check\_payment\_matches\_rental) là tuyến phòng thủ cuối ở tầng CSDL — tầng ứng dụng vẫn phải tự kiểm tra trước để trả lỗi thân thiện cho người dùng thay vì để lộ lỗi trigger thô |
| NFR-MNT-07 | Các cột status dạng VARCHAR tự do (vehicles, vehicle\_assignments, vehicle\_maintenance, invoices, payments, reports, rentals) nên được validate bằng enum ở tầng ứng dụng hoặc bổ sung CHECK constraint để tránh sai chính tả giá trị trạng thái |
| NFR-PER-06 | Truy vấn tính remaining\_hours và đối chiếu Subscription phải có chỉ mục trên customer\_subscriptions(customer\_id, status) do đây là bước kiểm tra bắt buộc mỗi lần tạo đơn thuê theo gói |

# **7\. Mô hình dữ liệu**

Mô hình dữ liệu bám sát DDL PostgreSQL v2 (26 bảng), là nguồn xác thực chính. Bảng dưới đây tóm tắt vai trò và các cột trọng yếu của từng thực thể; xem file DDL gốc để có định nghĩa cột đầy đủ.

## **7.1. Nhóm Users / Tổ chức**

| Bảng | Vai trò | Cột trọng yếu |
| :---- | :---- | :---- |
| users | Tài khoản gốc, dùng chung cho mọi vai trò | email (unique), password\_hash, fullname, gender, phone, avatar, is\_active |
| roles / user\_roles | RBAC nhiều-nhiều: một Users có thể có nhiều vai trò | roles.name; user\_roles.user\_id, role\_id |
| departments | Danh mục phòng ban nội bộ | name |
| facilities | Chi nhánh — nơi Staff làm việc và Vehicles được chứa | name, address |
| staffs | Hồ sơ nhân viên, mở rộng 1-1 từ users; is\_driver \= true đồng thời là tài xế | user\_id (unique), department\_id, facility\_id, is\_driver, license\_\*, rating |
| customers | Hồ sơ khách hàng, mở rộng 1-1 từ users | user\_id (unique), license\_\*, loyalty\_point |

## **7.2. Nhóm Phương tiện**

| Bảng | Vai trò | Cột trọng yếu |
| :---- | :---- | :---- |
| vehicle\_types | Danh mục loại phương tiện | name, fuel\_type |
| vehicles | Hồ sơ xe — thực thể trung tâm | facility\_id, vehicle\_type\_id, brand, model, status, is\_renting, rental\_price\_hourly, rental\_price\_longterm, current\_location, created\_by |
| vehicle\_imgs | Thư viện ảnh xe (1-N) | vehicle\_id, url |
| car\_detail motorbike\_detail electric\_car\_detail electric\_motorbike\_detail | Thuộc tính riêng theo loại xe (mỗi bảng 1-1 với vehicles, chỉ dùng đúng một bảng tương ứng vehicle\_type\_id) | car\_detail: seat\_count, transmission, trunk\_capacity motorbike\_detail: bike\_type, has\_storage\_box electric\_\*: battery\_capacity, charging\_type, charging\_time\_hours, max\_range\_km, battery\_type |

## **7.3. Nhóm Thuê xe, gán xe, kiểm định**

| Bảng | Vai trò | Cột trọng yếu |
| :---- | :---- | :---- |
| rental\_policies | Chính sách theo loại xe: thuế, phí trễ, % cọc | vehicle\_type\_id, vat\_rate, overtime\_fee\_rate, deposit\_percentage, is\_active, managed\_by |
| subscription\_plans | Danh mục gói thuê bao | price, duration\_days, included\_hours, is\_active |
| customer\_subscriptions | Gói mà một khách hàng cụ thể đã mua | customer\_id, plan\_id, start\_date, end\_date, remaining\_hours, status |
| rentals | Đơn thuê — thực thể trung tâm | customer\_id, vehicle\_id, policy\_id, customer\_subscription\_id, is\_subscription, rental\_type, status, vat\_price, deposit\_price, overtime\_price, total\_price |
| hour\_rental\_detail | Chi tiết thuê theo giờ (1-1 với rentals) | start\_time, end\_time, has\_driver, hourly\_price\_snapshot, pickup\_location, pick\_up\_method, staff\_pickup\_id |
| longterm\_rental\_contract | Chi tiết thuê dài hạn (1-1 với rentals) | start\_time, end\_time, monthly\_price\_snapshot, contract\_link, signed\_at, staff\_pick\_up\_id |
| vehicle\_assignments | Gán xe \+ tài xế cho một đơn thuê; 1 rental có thể có nhiều dòng để hỗ trợ đổi giữa chừng | rental\_id, vehicle\_id, driver\_staff\_id (nullable), status, assigned\_at |
| inspections | Kiểm định trước/sau thuê; tối đa 1 dòng mỗi loại/rental | rental\_id, vehicle\_id, staff\_id, inspection\_type, is\_ok, odometer\_km, fuel\_battery\_level, damage\_notes, img\_urls |

## **7.4. Nhóm Tài chính, Bảo dưỡng, Báo cáo**

| Bảng | Vai trò | Cột trọng yếu |
| :---- | :---- | :---- |
| invoices | Hoá đơn — chỉ cho đơn thuê trực tiếp (is\_subscription \= false) | rental\_id, invoice\_number (unique), amount, vat\_amount, status, due\_at |
| payments | Giao dịch thanh toán — dùng chung cả hai loại đơn | rental\_id, invoice\_id (nullable), customer\_id, is\_subscription\_payment, amount, type, status, method |
| vehicle\_maintenance | Phiếu bảo dưỡng; có thể phát sinh từ inspection\_id hoặc gắn rental\_id dài hạn | vehicle\_id, facility\_id, assigned\_staff\_id, inspection\_id, rental\_id, is\_safe, status, cost |
| reports | Báo cáo/khiếu nại của khách hàng | customer\_id, rental\_id, maintenance\_id, type, description, status |

## **7.5. Quy tắc toàn vẹn dữ liệu (theo DDL)**

Các quy tắc dưới đây đã được thực thi trong DDL bằng CHECK constraint, UNIQUE index hoặc trigger — không chỉ là quy ước tài liệu:

| Mã | Quy tắc | Cơ chế thực thi trong DDL |
| :---- | :---- | :---- |
| BR-01 | rentals.rental\_type chỉ nhận 'hourly' hoặc 'longterm' | CHECK ck\_rentals\_type |
| BR-02 | rentals.is\_subscription phải khớp với việc customer\_subscription\_id có giá trị hay không | CHECK ck\_rentals\_subscription |
| BR-03 | Mỗi rental\_id trong inspections tối đa 1 dòng pre\_rental và 1 dòng post\_rental | UNIQUE ux\_inspection\_rental\_type |
| BR-04 | Không được tạo/sửa invoices cho rental có is\_subscription \= true | Trigger trg\_invoice\_no\_subscription |
| BR-05 | payments.is\_subscription\_payment phải khớp rentals.is\_subscription tương ứng | Trigger trg\_payment\_match\_rental |
| BR-06 | payments: is\_subscription\_payment \= true thì invoice\_id phải NULL; ngược lại invoice\_id bắt buộc | CHECK ck\_payments\_invoice\_rule |
| BR-07 | customer\_subscriptions.end\_date \>= start\_date | CHECK ck\_cs\_dates |
| BR-08 | users.email và invoices.invoice\_number là duy nhất toàn hệ thống | UNIQUE index |
| BR-09 | Một Users tối đa một hồ sơ staffs và một hồ sơ customers | UNIQUE trên staffs.user\_id, customers.user\_id |

## **7.6. Ràng buộc còn thiếu — cần bổ sung trước khi triển khai**

Ba quy tắc sau là yêu cầu nghiệp vụ hợp lý nhưng DDL hiện tại chưa thực thi — SRS ghi nhận là hành động cần làm, không phải mô tả những gì đã có:

| Mã | Quy tắc cần bổ sung | Đề xuất cơ chế |
| :---- | :---- | :---- |
| TODO-01 | Tại một thời điểm, một vehicle\_id chỉ có tối đa một vehicle\_assignments đang active (đáp ứng yêu cầu "1 xe 1 tài") | UNIQUE index có điều kiện: UNIQUE(vehicle\_id) WHERE status \= 'active' |
| TODO-02 | Không có hai đơn thuê (qua hour\_rental\_detail/longterm\_rental\_contract) của cùng một vehicle\_id chồng lấn thời gian | Exclusion constraint theo khoảng thời gian (EXCLUDE USING gist) hoặc kiểm tra ở tầng service trong transaction |
| TODO-03 | Toàn vẹn tham chiếu cho mọi cột \*\_id (hiện DDL không có FOREIGN KEY thật) | Bổ sung FOREIGN KEY khi migrate lên môi trường chính thức, hoặc validate chặt ở tầng repository |

# **8\. Máy trạng thái**

DDL để các cột trạng thái dạng VARCHAR tự do (không CHECK), ngoại trừ rentals.rental\_type và inspections.inspection\_type. Các bảng bên dưới đề xuất tập giá trị hợp lý cho từng cột trạng thái, dựa trên comment trong DDL; cần thống nhất và thêm CHECK constraint tương ứng.

## **8.1. rentals.status (đề xuất theo comment trong DDL)**

| Trạng thái | Ý nghĩa |
| :---- | :---- |
| pending | Đơn vừa tạo, chờ xác nhận/thanh toán cọc |
| pre\_inspection | Đang kiểm định xe trước khi giao |
| renting | Xe đã giao, khách đang sử dụng |
| post\_inspection | Xe đã trả, đang kiểm định sau thuê |
| completed | Hoàn tất, đã quyết toán |
| cancelled | Bị huỷ (chỉ từ pending hoặc pre\_inspection) |

## **8.2. vehicles.status (đề xuất)**

| Trạng thái | Ý nghĩa |
| :---- | :---- |
| available | Sẵn sàng cho thuê |
| renting | Đang trong một đơn thuê (is\_renting \= true) |
| maintenance | Đang bảo dưỡng/sửa chữa, không hiển thị khi tìm kiếm |
| inactive | Ngừng khai thác dài hạn |

## **8.3. vehicle\_assignments.status và vehicle\_maintenance.status (đề xuất)**

| Bảng | Trạng thái đề xuất |
| :---- | :---- |
| vehicle\_assignments | assigned → active → completed, hoặc replaced khi bị thay thế giữa chừng (UC-03) |
| vehicle\_maintenance | scheduled → in\_progress → completed → verified, hoặc cancelled |

# **9\. Phụ lục**

## **9.1. Ma trận truy vết — góp ý mentor**

| Góp ý mentor | Đáp ứng trong v2.0 |
| :---- | :---- |
| 1\. Thêm chi nhánh quản lý driver, xe | facilities liên kết staffs (facility\_id) và vehicles (facility\_id) — FR-USR-04, FR-VEH-02 |
| 2\. Ưu tiên thuê tài xế có sẵn hơn thuê xe | vehicle\_assignments làm trung tâm gán driver\_staff\_id cho mỗi đơn — FR-ASG-01 |
| 3\. Có gói cho người dùng | subscription\_plans, customer\_subscriptions — mục 3.5 |
| 4\. Xe hỏng giữa chừng → đổi cả tài cả xe | rentals 1–N vehicle\_assignments — FR-ASG-02, UC-03 |
| 5\. Một xe một tài | vehicle\_assignments là đường duy nhất nối Staff–Vehicles; cần bổ sung UNIQUE có điều kiện — TODO-01 |
| 6\. Kiểm định trước/sau khi thuê | inspections với inspection\_type — mục 3.8 |
| 7\. Đặt cọc 10% giá trị xe | rental\_policies.deposit\_percentage — FR-POL-01, FR-PAY-03; cơ sở tính cần xác nhận lại — giả định 1.2.1 |

## **9.2. Ma trận truy vết — yêu cầu gốc của giảng viên**

| Yêu cầu gốc | Đáp ứng trong v2.0 |
| :---- | :---- |
| Thuê xe theo giờ, có/không tài xế; nếu có tài xế thì đi cùng xe chỉ định | hour\_rental\_detail.has\_driver \+ vehicle\_assignments.driver\_staff\_id — mục 3.6, 3.7, UC-01 |
| Thuê xe dài hạn, không kèm tài xế | longterm\_rental\_contract không có cột driver — mục 3.6 |
| Bản đồ quản lý xem xe ở đâu | Thu gọn thành vehicles.current\_location dạng văn bản — xem giả định 1.2.1, cần xác nhận lại phạm vi |
| Quản lý bảo hành bảo trì: xem xe an toàn không; đến hạn có người lấy hoặc tự đi | vehicle\_maintenance.is\_safe, liên kết inspections; pick\_up\_method trong hour\_rental\_detail/longterm\_rental\_contract xử lý cách giao/nhận xe — mục 3.8, 3.10 |

## **9.3. Việc cần làm trước khi bàn giao**

• Xác nhận với giảng viên/mentor 3 điểm giả định ở mục 1.2.1 (cơ sở tính cọc, phạm vi bản đồ, đường quan hệ drives thừa trong conceptual).

• Bổ sung 3 ràng buộc còn thiếu ở mục 7.6 (một xe một tài xế active, chống trùng lịch xe, khoá ngoại thật) trước khi triển khai môi trường chính thức.

• Thống nhất tập giá trị cho các cột status còn để VARCHAR tự do (mục 8\) và thêm CHECK constraint tương ứng.

• Làm rõ cách xử lý payments.rental\_id (đang NOT NULL) khi thanh toán mua Subscription không gắn với một đơn thuê cụ thể (xem UC-02).


#:package Npgsql@8.0.5
using Npgsql;

// Sample data cho FE test thẳng vào DB thật (Neon) mà BE production đang dùng.
//
// Chạy:  DB_URL="postgresql://user:pass@host/db?sslmode=require" dotnet run scripts/seed-sample-data.cs
//        (hoặc) dotnet run scripts/seed-sample-data.cs "postgresql://..."
//
// Script XOÁ dữ liệu nghiệp vụ (catalog + rentals/invoices/payments/subscriptions) rồi seed lại,
// nên chạy lại luôn cho ra cùng một trạng thái sạch. KHÔNG đụng tới users / roles / customers —
// chỉ set license_status='approved' cho mọi customer đang có để flow booking chạy được.

var dbUrl = args.Length > 0 ? args[0] : Environment.GetEnvironmentVariable("DB_URL");
if (string.IsNullOrWhiteSpace(dbUrl))
{
    Console.Error.WriteLine("Thiếu DB_URL. Ví dụ: DB_URL=\"postgresql://...\" dotnet run scripts/seed-sample-data.cs");
    return 1;
}

await using var ds = NpgsqlDataSource.Create(ToConnectionString(dbUrl));
await using var cn = await ds.OpenConnectionAsync();
await using var tx = await cn.BeginTransactionAsync();

var today = DateTime.Today;
var now = DateTime.Now;

// ---------- reset ----------
foreach (var table in new[]
{
    "payments", "invoices", "inspections", "vehicle_assignments", "hour_rental_detail",
    "longterm_rental_contract", "vehicle_maintenance", "rentals", "customer_subscriptions", "reports",
    "vehicle_imgs", "car_detail", "motorbike_detail", "electric_car_detail", "electric_motorbike_detail",
    "vehicles", "vehicle_types", "rental_policies", "subscription_plans", "facilities"
})
{
    Exec($"DELETE FROM {table}");
}

// ---------- catalog ----------
var facilities = new (string Name, string Address)[]
{
    ("Chi nhánh Quận 1 — Trung tâm", "12 Trần Hưng Đạo, Phường Phạm Ngũ Lão, Quận 1, TP. Hồ Chí Minh"),
    ("Chi nhánh Sân bay Tân Sơn Nhất", "Cổng ga Quốc nội T1/T2, Phường 2, Quận Tân Bình, TP. Hồ Chí Minh"),
    ("Chi nhánh Tân Bình — Hoàng Hoa Thám", "45 Hoàng Hoa Thám, Phường 13, Quận Tân Bình, TP. Hồ Chí Minh"),
    ("Chi nhánh Hà Nội — Long Biên", "88 Nguyễn Văn Cừ, Phường Bồ Đề, Quận Long Biên, Hà Nội"),
};
var facIds = facilities.Select(f => Id("INSERT INTO facilities(name,address) VALUES($1,$2) RETURNING id", f.Name, f.Address)).ToArray();

// Tên type phải chứa "điện" / "xe máy" vì FE map category từ chuỗi vehicleType.
var types = new (string Name, string Fuel)[]
{
    ("Ô tô 5 chỗ", "Xăng"),
    ("Ô tô điện", "Điện"),
    ("Xe máy tay ga", "Xăng"),
    ("Xe máy điện", "Điện"),
};
var typeIds = types.Select(t => Id("INSERT INTO vehicle_types(name,fuel_type) VALUES($1,$2) RETURNING id", t.Name, t.Fuel)).ToArray();

var vehicleSeeds = new VehicleSeed[]
{
    new("Toyota", "Corolla Cross 1.8V", 0, 0, 120_000m, 18_500_000m, "Trắng ngọc trai", 2024, "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80", "SUV 5 chỗ, kiểm định 12 hạng mục, hỗ trợ gói thuê bao."),
    new("VinFast", "VF 8 Plus", 1, 1, 160_000m, 24_000_000m, "Xanh Neptune", 2024, "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80", "Ô tô điện D-SUV, miễn phí sạc hệ thống, giao nhận sân bay 24/7."),
    new("VinFast", "VF e34", 1, 2, 95_000m, 14_500_000m, "Trắng", 2023, "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80", "Ô tô điện C-SUV đô thị, kiểm định pin 100%."),
    new("Honda", "CR-V L 1.5 Turbo", 0, 3, 150_000m, 22_000_000m, "Đen ánh kim", 2024, "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80", "Crossover 7 chỗ, Honda SENSING, phù hợp gia đình và đường dài."),
    new("Honda", "SH 160i ABS", 2, 0, 35_000m, 3_800_000m, "Đỏ đô", 2024, "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80", "Xe tay ga cao cấp, phanh ABS 2 kênh, kèm 2 mũ bảo hiểm."),
    new("VinFast", "Feliz S", 3, 1, 25_000m, 2_400_000m, "Xanh lam", 2024, "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80", "Xe máy điện thông minh, cốp rộng 25L, miễn phí sạc chi nhánh."),
};
var vehIds = vehicleSeeds.Select(v => Id(
    "INSERT INTO vehicles(facility_id,vehicle_type_id,status,brand,model,color,year_of_manufacture,rental_price_hourly,rental_price_longterm,description,main_img_url,current_location) " +
    "VALUES($1,$2,'available',$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id",
    facIds[v.FacIdx], typeIds[v.TypeIdx], v.Brand, v.Model, v.Color, v.Year, v.Hourly, v.Monthly,
    v.Description, v.Img, facilities[v.FacIdx].Name)).ToArray();

foreach (var (id, url) in vehIds.Zip(vehicleSeeds.Select(v => v.Img)))
{
    Exec("INSERT INTO vehicle_imgs(vehicle_id,url) VALUES($1,$2)", id, url);
}
Exec("INSERT INTO car_detail(vehicle_id,seat_count,transmission,trunk_capacity) VALUES($1,5,'Tự động (CVT)',470)", vehIds[0]);
Exec("INSERT INTO electric_car_detail(vehicle_id,battery_capacity,charging_type,charging_time_hours,max_range_km,battery_type) VALUES($1,'87.7 kWh','AC 11kW / DC 150kW','8',471,'LFP')", vehIds[1]);
Exec("INSERT INTO electric_car_detail(vehicle_id,battery_capacity,charging_type,charging_time_hours,max_range_km,battery_type) VALUES($1,'42 kWh','AC 7.4kW / DC 60kW','6',318,'LFP')", vehIds[2]);
Exec("INSERT INTO car_detail(vehicle_id,seat_count,transmission,trunk_capacity) VALUES($1,7,'Tự động (CVT)',589)", vehIds[3]);
Exec("INSERT INTO motorbike_detail(vehicle_id,bike_type,has_storage_box) VALUES($1,'Tay ga',true)", vehIds[4]);
Exec("INSERT INTO electric_motorbike_detail(vehicle_id,battery_capacity,charging_type,charging_time_hours,max_range_km,battery_type) VALUES($1,'LFP 3.5 kWh','Sạc nhà 220V','4',198,'LFP')", vehIds[5]);

var policyIds = typeIds.Select(id => Id(
    "INSERT INTO rental_policies(vehicle_type_id,name,vat_rate,overtime_fee_rate,deposit_percentage,is_active) VALUES($1,$2,10,20,20,true) RETURNING id",
    id, "Chính sách thuê tiêu chuẩn")).ToArray();

var plans = new (string Name, string Description, decimal Price, int Days, decimal Hours)[]
{
    ("Gói Trải Nghiệm 20 giờ", "20 giờ di chuyển linh hoạt, hạn dùng 30 ngày, áp dụng mọi dòng xe tiêu chuẩn.", 20_000m, 30, 20m),
    ("Gói Đô Thị Tiêu Chuẩn 50 giờ", "50 giờ di chuyển tự do, hạn dùng 60 ngày, ưu tiên giữ xe tại mọi chi nhánh.", 45_000m, 60, 50m),
    ("Gói Doanh Nghiệp & Đường Dài 100 giờ", "100 giờ thuê xe cao cấp gồm xe điện VF 8 và SUV 7 chỗ, hạn dùng 90 ngày.", 90_000m, 90, 100m),
};
var planIds = plans.Select(p => Id(
    "INSERT INTO subscription_plans(name,description,price,duration_days,included_hours,is_active) VALUES($1,$2,$3,$4,$5,true) RETURNING id",
    p.Name, p.Description, p.Price, p.Days, p.Hours)).ToArray();

// xe đang cho thuê (R3) / đang bảo dưỡng
Exec("UPDATE vehicles SET status='renting',is_renting=true WHERE id=$1", vehIds[1]);
Exec("UPDATE vehicles SET status='maintenance' WHERE id=$1", vehIds[2]);
Exec("INSERT INTO vehicle_maintenance(vehicle_id,facility_id,status,maintenance_type,scheduled_date,is_safe,description,cost) VALUES($1,$2,'open','scheduled',$3,true,'Bảo dưỡng định kỳ 10.000 km',2500000)",
    vehIds[2], facIds[2], DateOnly.FromDateTime(today.AddDays(3)));

// ---------- dữ liệu theo từng customer đang có ----------
var customers = new List<(int Id, string Name)>();
using (var cmd = Cmd("SELECT c.id, COALESCE(u.fullname,u.email) FROM customers c JOIN users u ON u.id=c.user_id ORDER BY c.id"))
using (var reader = cmd.ExecuteReader())
{
    while (reader.Read()) customers.Add((reader.GetInt32(0), reader.GetString(1)));
}

foreach (var (customerId, name) in customers)
{
    Exec("UPDATE customers SET license_status='approved',license_number=$2,license_type='B2',license_issue_date=$3,license_expiry_date=$4,loyalty_point=COALESCE(loyalty_point,0)+250 WHERE id=$1",
        customerId, $"0790{customerId:D9}", DateOnly.FromDateTime(today.AddYears(-3)), DateOnly.FromDateTime(today.AddYears(2)));

    // gói thuê bao: 1 đang hiệu lực (đã dùng 6 giờ cho R3) + 1 đã hết hạn
    var subscriptionId = Id(
        "INSERT INTO customer_subscriptions(customer_id,plan_id,status,start_date,end_date,remaining_hours) VALUES($1,$2,'active',$3,$4,$5) RETURNING id",
        customerId, planIds[1], DateOnly.FromDateTime(today.AddDays(-20)), DateOnly.FromDateTime(today.AddDays(40)), plans[1].Hours - 6m);
    Exec("INSERT INTO customer_subscriptions(customer_id,plan_id,status,start_date,end_date,remaining_hours) VALUES($1,$2,'expired',$3,$4,0)",
        customerId, planIds[0], DateOnly.FromDateTime(today.AddDays(-70)), DateOnly.FromDateTime(today.AddDays(-40)));
    Exec("INSERT INTO payments(customer_id,is_subscription_payment,plan_id,amount,status,type,method,paid_at,provider_reference) VALUES($1,true,$2,$3,'paid','subscription','payos',$4,$5)",
        customerId, planIds[1], plans[1].Price, now.AddDays(-20), $"DEMO-SUB-{customerId}-01");

    // R1 — thuê giờ, chờ thanh toán (invoice unpaid) -> test flow invoice/checkout
    var r1 = AddRental(customerId, vehIds[0], policyIds[0], false, null, "hourly", "pending", 5m, 120_000m);
    Exec("INSERT INTO hour_rental_detail(rental_id,start_time,end_time,has_driver,hourly_price_snapshot,pickup_location,pick_up_method) VALUES($1,$2,$3,false,120000,$4,'Tại chi nhánh')",
        r1, today.AddDays(2).AddHours(9), today.AddDays(2).AddHours(14), facilities[0].Name);
    var inv1 = AddInvoice(r1, $"INV-DEMO-{customerId}-01", 5m * 120_000m, "unpaid", now, now.AddDays(1));

    // R2 — thuê giờ, đã hoàn tất + invoice paid + yêu cầu hoàn cọc -> test payment-history
    var r2 = AddRental(customerId, vehIds[4], policyIds[2], false, null, "hourly", "completed", 4m, 35_000m);
    Exec("INSERT INTO hour_rental_detail(rental_id,start_time,end_time,has_driver,hourly_price_snapshot,pickup_location,pick_up_method) VALUES($1,$2,$3,false,35000,$4,'Tại chi nhánh')",
        r2, today.AddDays(-10).AddHours(8), today.AddDays(-10).AddHours(12), facilities[0].Name);
    var inv2 = AddInvoice(r2, $"INV-DEMO-{customerId}-02", 4m * 35_000m, "paid", now.AddDays(-11), now.AddDays(-10));
    Exec("INSERT INTO payments(rental_id,invoice_id,customer_id,is_subscription_payment,amount,status,type,method,paid_at,provider_reference) VALUES($1,$2,$3,false,$4,'paid','rental','payos',$5,$6)",
        r2, inv2, customerId, 4m * 35_000m * 1.3m, now.AddDays(-11), $"DEMO-{customerId}-02");
    Exec("INSERT INTO payments(rental_id,invoice_id,customer_id,is_subscription_payment,amount,status,type,method) VALUES($1,$2,$3,false,$4,'requested','refund','deposit')",
        r2, inv2, customerId, 4m * 35_000m * 0.2m);
    AddInspection(r2, vehIds[4], "pre_rental", today.AddDays(-10).AddHours(7));
    AddInspection(r2, vehIds[4], "post_rental", today.AddDays(-10).AddHours(13));

    // R3 — thuê giờ bằng gói (không invoice), đang chạy -> test trạng thái đang thuê + gán xe
    var r3 = AddRental(customerId, vehIds[1], policyIds[1], true, subscriptionId, "hourly", "renting", 6m, 160_000m);
    Exec("INSERT INTO hour_rental_detail(rental_id,start_time,end_time,has_driver,hourly_price_snapshot,pickup_location,pick_up_method) VALUES($1,$2,$3,false,160000,$4,'Giao tận nơi')",
        r3, today.AddHours(7), today.AddHours(13), facilities[1].Name);
    Exec("INSERT INTO vehicle_assignments(rental_id,vehicle_id,driver_staff_id,status,assigned_by) VALUES($1,$2,NULL,'assigned','demo-seed')", r3, vehIds[1]);
    AddInspection(r3, vehIds[1], "pre_rental", today.AddHours(6));

    // R4 — thuê dài hạn 30 ngày, invoice paid -> test contract longterm
    var r4 = AddRental(customerId, vehIds[3], policyIds[0], false, null, "longterm", "renting", 720m, 22_000_000m);
    Exec("INSERT INTO longterm_rental_contract(rental_id,start_time,end_time,monthly_price_snapshot,contract_link,signed_at,pick_up_location,pick_up_method) VALUES($1,$2,$3,22000000,'https://example.com/hop-dong-demo.pdf',$4,$5,'Tại chi nhánh')",
        r4, today.AddDays(-3), today.AddDays(27), today.AddDays(-4), facilities[0].Name);
    var inv4 = AddInvoice(r4, $"INV-DEMO-{customerId}-04", 22_000_000m, "paid", now.AddDays(-4), now.AddDays(-3));
    Exec("INSERT INTO payments(rental_id,invoice_id,customer_id,is_subscription_payment,amount,status,type,method,paid_at,provider_reference) VALUES($1,$2,$3,false,$4,'paid','rental','payos',$5,$6)",
        r4, inv4, customerId, 22_000_000m * 1.3m, now.AddDays(-4), $"DEMO-{customerId}-04");
    AddInspection(r4, vehIds[3], "pre_rental", today.AddDays(-3).AddHours(-1));

    // R5 — đã huỷ
    var r5 = AddRental(customerId, vehIds[5], policyIds[3], false, null, "hourly", "cancelled", 3m, 25_000m);
    Exec("INSERT INTO hour_rental_detail(rental_id,start_time,end_time,has_driver,hourly_price_snapshot,pickup_location,pick_up_method) VALUES($1,$2,$3,false,25000,$4,'Tại chi nhánh')",
        r5, today.AddDays(-15).AddHours(9), today.AddDays(-15).AddHours(12), facilities[1].Name);
    AddInvoice(r5, $"INV-DEMO-{customerId}-05", 3m * 25_000m, "cancelled", now.AddDays(-16), now.AddDays(-15));

    Console.WriteLine($"  customer #{customerId} ({name}): 5 rentals, 1 subscription active, 4 invoices");
}

await tx.CommitAsync();
Console.WriteLine($"Seed xong: {facilities.Length} chi nhánh, {vehicleSeeds.Length} xe, {planIds.Length} gói thuê bao, {customers.Count} customer.");
return 0;

// ---------- helpers ----------
int AddRental(int customerId, int vehicleId, int policyId, bool isSubscription, int? subscriptionId, string rentalType, string status, decimal hours, decimal unitPrice)
{
    var months = Math.Max(1m, Math.Ceiling(hours / (24m * 30m)));
    var basePrice = rentalType == "hourly" ? unitPrice * hours : unitPrice * months;
    var vat = Math.Round(basePrice * 0.10m, 2);
    var deposit = Math.Round(basePrice * 0.20m, 2);
    return Id(
        "INSERT INTO rentals(customer_id,vehicle_id,policy_id,customer_subscription_id,is_subscription,rental_type,status,vat_price,deposit_price,total_price) " +
        "VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id",
        customerId, vehicleId, policyId, subscriptionId, isSubscription, rentalType, status, vat, deposit, basePrice + vat);
}

int AddInvoice(int rentalId, string number, decimal basePrice, string status, DateTime issuedAt, DateTime dueAt)
{
    var vat = Math.Round(basePrice * 0.10m, 2);
    var deposit = Math.Round(basePrice * 0.20m, 2);
    return Id("INSERT INTO invoices(rental_id,invoice_number,amount,vat_amount,status,issued_at,due_at) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id",
        rentalId, number, basePrice + vat + deposit, vat, status, issuedAt, dueAt);
}

void AddInspection(int rentalId, int vehicleId, string type, DateTime at) =>
    Exec("INSERT INTO inspections(rental_id,vehicle_id,staff_id,inspection_type,is_ok,odometer_km,fuel_battery_level,damage_notes,inspected_at) VALUES($1,$2,NULL,$3,true,$4,90,'Không phát hiện hư hỏng',$5)",
        rentalId, vehicleId, type, type == "pre_rental" ? 12_500m : 12_700m, at);

int Id(string sql, params object?[] values)
{
    using var cmd = Cmd(sql, values);
    return Convert.ToInt32(cmd.ExecuteScalar()!);
}

void Exec(string sql, params object?[] values)
{
    using var cmd = Cmd(sql, values);
    cmd.ExecuteNonQuery();
}

NpgsqlCommand Cmd(string sql, params object?[] values)
{
    var cmd = cn.CreateCommand();
    cmd.Transaction = tx;
    cmd.CommandText = sql;
    foreach (var value in values) cmd.Parameters.AddWithValue(value ?? DBNull.Value);
    return cmd;
}

static string ToConnectionString(string value)
{
    if (!Uri.TryCreate(value, UriKind.Absolute, out var uri) || (uri.Scheme != "postgres" && uri.Scheme != "postgresql")) return value;
    var credentials = uri.UserInfo.Split(':', 2, StringSplitOptions.None);
    var builder = new NpgsqlConnectionStringBuilder
    {
        Host = uri.Host,
        Port = uri.IsDefaultPort ? 5432 : uri.Port,
        Database = Uri.UnescapeDataString(uri.AbsolutePath.TrimStart('/')),
        Username = credentials.Length > 0 ? Uri.UnescapeDataString(credentials[0]) : string.Empty,
        Password = credentials.Length == 2 ? Uri.UnescapeDataString(credentials[1]) : string.Empty,
    };
    var sslMode = uri.Query.TrimStart('?').Split('&', StringSplitOptions.RemoveEmptyEntries)
        .FirstOrDefault(item => item.StartsWith("sslmode=", StringComparison.OrdinalIgnoreCase))?.Split('=', 2)[1];
    if (sslMode is not null && Enum.TryParse<SslMode>(sslMode, true, out var parsed)) builder.SslMode = parsed;
    return builder.ConnectionString;
}

record VehicleSeed(string Brand, string Model, int TypeIdx, int FacIdx, decimal Hourly, decimal Monthly, string Color, int Year, string Img, string Description);

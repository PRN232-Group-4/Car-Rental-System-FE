import { expect, test, type Page } from "@playwright/test";

const envelope = (data: unknown) => ({ code: 200, status: "success", is_success: true, data, message: "OK", error: null });
const vehicle = { id: 8, vehicleType: { id: 6, type: "car" }, facility: { id: 5, name: "Quận 1" }, brand: "Toyota", model: "Corolla Cross", priceHourly: 120000, priceLongterm: 18500000 };

async function mockApis(page: Page, license: unknown, expectedDriver: boolean, rentalType="hourly") {
  let requests=0;
  let failLicense=false;
  await page.route("**/api/**", async route => {
    const path=new URL(route.request().url()).pathname;
    if(path.endsWith("/customer/license") && failLicense) return route.fulfill({status:503,json:{...envelope(null),code:503,status:"error",is_success:false,message:"Không thể tải GPLX"}});
    if(path.endsWith(`/rentals/${rentalType}`)) {
      requests++;
      expect(route.request().postDataJSON().hasDriver).toBe(expectedDriver);
      return route.fulfill({json:envelope({id:111,vehicleId:8,rentalType,status:"pending"})});
    }
    let data:unknown=[];
    if(path.endsWith("/account/profile")) data={fullName:"Khách kiểm thử",email:"customer@test.local",roles:["Customer"]};
    else if(path.endsWith("/customer/license")) data=license;
    else if(path.endsWith("/facilities")) data=[{id:5,name:"Quận 1"}];
    else if(path.endsWith("/vehicles/search")) {
      expect(new URL(route.request().url()).searchParams.get("hasDriver")).toBe(String(expectedDriver));
      data={items:[vehicle],page:1,pageSize:100,totalCount:1};
    }
    return route.fulfill({json:envelope(data)});
  });
  return {requests:()=>requests,setFailLicense:(value:boolean)=>{failLicense=value;}};
}

for(const width of [1440,390]) {
  for(const hasDriver of [true,false]) {
    for(const rentalType of ["hourly","longterm"]) {
      test(`booking preserves ${hasDriver?"driver":"self-drive"} ${rentalType} choice at ${width}px`,async({page})=>{
        await page.setViewportSize({width,height:900});
        const api=await mockApis(page,hasDriver?null:{number:"TEST",status:"approved"},hasDriver,rentalType);
        await page.goto(`/booking?facilityId=5&vehicleId=8&mode=${hasDriver?"driver":"self"}&rentalType=${rentalType}`);
        await expect(page.locator("#hasDriver")).toHaveValue(String(hasDriver));
        await expect(page.locator("#rentalType")).toHaveValue(rentalType);
        await page.getByRole("button",{name:"Xác nhận đặt xe",exact:true}).click();
        await expect(page.getByRole("heading",{name:"Đã gửi yêu cầu đặt xe",exact:true})).toBeVisible();
        expect(api.requests()).toBe(1);
      });
    }
  }
}

for(const license of [null,{number:null,status:"pending"},{number:"TEST",status:"rejected"}]) {
  test(`self-drive blocks missing or unapproved GPLX ${JSON.stringify(license)}`,async({page})=>{
    const api=await mockApis(page,license,false);
    await page.goto("/booking?facilityId=5&vehicleId=8&mode=self");
    await expect(page.getByRole("link",{name:"Cập nhật và xem trạng thái GPLX"})).toBeVisible();
    await page.getByRole("button",{name:"Xác nhận đặt xe",exact:true}).click();
    await expect(page.getByText("Để thuê tự lái, hãy cập nhật GPLX và chờ được phê duyệt, hoặc chọn thuê có tài xế.",{exact:true})).toBeVisible();
    await expect(page.locator("#hasDriver")).toHaveAttribute("aria-invalid","true");
    expect(api.requests()).toBe(0);
  });
}

test("self-drive supports retry after GPLX network failure",async({page})=>{
  const api=await mockApis(page,{number:"TEST",status:"approved"},false);
  api.setFailLicense(true);
  await page.goto("/booking?facilityId=5&vehicleId=8&mode=self");
  await expect(page.getByRole("alert").filter({hasText:"Không thể kiểm tra GPLX"})).toBeVisible();
  api.setFailLicense(false);
  await page.getByRole("button",{name:"Thử lại",exact:true}).click();
  await expect(page.getByRole("alert").filter({hasText:"Không thể kiểm tra GPLX"})).toHaveCount(0);
  await page.getByRole("button",{name:"Xác nhận đặt xe",exact:true}).click();
  await expect(page.getByRole("heading",{name:"Đã gửi yêu cầu đặt xe",exact:true})).toBeVisible();
});

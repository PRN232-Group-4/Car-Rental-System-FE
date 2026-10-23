import { expect, test } from "@playwright/test";

const envelope=(data:unknown)=>({code:200,status:"success",is_success:true,data,message:"OK",error:null});
for(const width of [1440,390]) {
  for(const mode of ["normal","directory-error","shifts-error"] as const) {
    test(`dispatch lists an active driver without any shifts (${mode}, ${width}px)`,async({page})=>{
      await page.setViewportSize({width,height:950});
      let saved=false;
      let error=mode==="directory-error";
      let requests=0;
      const driver={id:99,email:"driver.test@example.com",fullName:"Driver Test",facilityName:"Chi nhánh Quận 1",isActive:true,isDriver:true,roles:["Driver","Staff"]};
      await page.route("**/api/**",async route=>{
        const url=new URL(route.request().url());
        const path=url.pathname;
        let data:unknown={items:[],page:1,pageSize:100,totalCount:0};
        if(path.endsWith("/account/profile")) data={email:"admin@test.local",roles:["Admin"]};
        else if(path.endsWith("/staff/drivers")) {
          requests++;
          if(error) return route.fulfill({status:503,json:{...envelope(null),code:503,status:"error",is_success:false,message:"Không tải được tài xế",error:{detail:"Không tải được tài xế"}}});
          const second=url.searchParams.get("page")==="2";
          data={items:second?[driver]:[{id:1,email:"seed.driver@test.local",fullName:"Seed Driver",isActive:true,isDriver:true}],page:second?2:1,pageSize:100,totalCount:2};
        }
        else if(path.endsWith("/drivers/shifts")) {
          if(route.request().method()==="POST") {
            expect(route.request().postDataJSON()).toMatchObject({driverStaffId:99,cancelled:false});
            saved=true;
            data={id:25};
          } else {
            if(mode==="shifts-error") return route.fulfill({status:503,json:{...envelope(null),code:503,status:"error",is_success:false,message:"Không tải được ca",error:{detail:"Không tải được ca"}}});
            data=saved?[{id:25,driverStaffId:99,startTime:new Date().toISOString(),endTime:new Date(Date.now()+3600000).toISOString(),status:"scheduled"}]:[];
          }
        }
        else if(path.endsWith("/drivers/schedule")) data=[];
        return route.fulfill({json:envelope(data)});
      });
      await page.goto("/admin/dispatch");
      if(mode==="directory-error") {
        await expect(page.getByRole("alert").filter({hasText:"Không tải được tài xế"})).toBeVisible();
        await expect(page.getByRole("button",{name:"Tạo ca làm",exact:true})).toBeDisabled();
        error=false;
        await page.getByRole("button",{name:"Tải lại tài xế",exact:true}).click();
      }
      const directory=page.getByRole("table",{name:"Danh sách tài xế đang hoạt động"});
      const row=directory.getByRole("row").filter({hasText:"driver.test@example.com"});
      await expect(row).toBeVisible();
      await expect(row).toContainText("Driver Test");
      await expect(row).toContainText(mode==="shifts-error"?"Chưa tải được ca làm":"Chưa có ca trong khoảng đang xem");
      await expect(page.getByLabel("Tài xế",{exact:true}).getByRole("option",{name:"driver.test@example.com",exact:true})).toHaveCount(1);
      expect(requests).toBeGreaterThanOrEqual(2);
      await expect(page.getByText(/Chức năng xếp, sửa và hủy ca trực tài xế đang tạm khóa/)).toBeVisible();
      await expect(page.getByRole("button",{name:"Tạo ca làm",exact:true})).toBeDisabled();
      await expect(row.getByRole("button",{name:"Xếp ca cho driver.test@example.com",exact:true})).toBeDisabled();
      await expect(page.getByRole("dialog",{name:"Tạo ca làm mới"})).toHaveCount(0);
      await page.getByRole("link",{name:"Mở phân công tài xế",exact:true}).click();
      await expect(page.getByRole("region",{name:"Phân công tài xế theo đơn thuê"})).toBeVisible();
      expect(saved).toBe(false);
      await page.getByLabel("Tài xế",{exact:true}).selectOption("1");
      await page.getByRole("button",{name:"Xem lịch",exact:true}).click();
      await expect(directory.getByText("seed.driver@test.local",{exact:true})).toBeVisible();
      await expect(row).toHaveCount(0);
      await page.locator("form").filter({has:page.getByLabel("Tài xế",{exact:true})}).getByRole("button",{name:"Đặt lại",exact:true}).click();
      await expect(row).toBeVisible();
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    });
  }
}

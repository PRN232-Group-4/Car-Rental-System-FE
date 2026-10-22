import { expect, test } from "@playwright/test";

const envelope=(data:unknown)=>({code:200,status:"success",is_success:true,data,message:"OK",error:null});
for(const width of [1440,390]) {
  for(const mode of ["driver","manual","failed"] as const) {
    test(`admin pre-inspection ${mode} at ${width}px`,async({page})=>{
      await page.setViewportSize({width,height:950});
      let checked=mode==="driver";
      let writes=0;
      const rental=()=>({id:101,customerId:1,vehicleId:8,rentalType:"hourly",status:"pre_inspection",hasDriver:mode==="driver",hasPassingPreInspection:checked,hasPostInspection:false,totalPrice:100000,depositPrice:20000,startTime:"2027-01-10T08:00:00Z",endTime:"2027-01-10T10:00:00Z"});
      await page.route("**/api/**",async route=>{
        const path=new URL(route.request().url()).pathname;
        let data:unknown={items:[],totalCount:0,page:1,pageSize:100};
        if(path.endsWith("/account/profile")) data={fullName:"Quản trị viên",email:"admin@test.local",roles:["Admin"]};
        else if(path.endsWith("/rentals/101/inspection-assignment/checked")) {
          writes++;
          expect(route.request().method()).toBe("POST");
          expect(route.request().postDataJSON()).toEqual({technicianStaffId:9});
          if(mode==="failed") return route.fulfill({status:409,json:{...envelope(null),code:409,status:"error",is_success:false,message:"Xe đã có biên bản không đạt. Vui lòng tải lại.",error:{code:"INSPECTION_ALREADY_RECORDED",detail:"Xe đã có biên bản không đạt. Vui lòng tải lại."}}});
          checked=true;
          data={rentalId:101,vehicleId:8,technicianStaffId:9,technicianEmail:"tech@test.local",assignedAt:"2026-10-22T03:00:00Z",assignedBy:"admin@test.local"};
        }
        else if(path.endsWith("/rentals/101/inspection-assignment")) data=mode==="driver" ? null : {rentalId:101,vehicleId:8,technicianStaffId:9,technicianEmail:"tech@test.local",assignedAt:"2026-10-22T03:00:00Z",assignedBy:"admin@test.local"};
        else if(path.endsWith("/rentals/101")) data=rental();
        else if(path.endsWith("/rentals")) data={items:[rental()],page:1,pageSize:30,totalCount:1};
        else if(path.endsWith("/staff")) data={items:[{id:9,email:"tech@test.local",isActive:true,staffRole:"Maintenance"}],page:1,pageSize:100,totalCount:1};
        else if(path.endsWith("/vehicles/8")) data={id:8,brand:"Toyota",model:"Vios",detail:null};
        return route.fulfill({json:envelope(data)});
      });
      await page.goto("/admin/rentals?rentalId=101");
      const section=page.getByRole("region",{name:"Phân công kiểm tra trước thuê"});
      const start=page.getByRole("button",{name:"Bàn giao xe & Bắt đầu chuyến",exact:true});
      if(mode==="driver") {
        await expect(section.getByText("Đơn có tài xế: đã đạt kiểm tra trước thuê theo mặc định.",{exact:true})).toBeVisible();
        await expect(section.getByRole("combobox")).toHaveCount(0);
        await expect(start).toBeEnabled();
        expect(writes).toBe(0);
      } else {
        await expect(start).toBeDisabled();
        await section.getByLabel("Kỹ thuật viên phụ trách",{exact:true}).selectOption("9");
        await section.getByRole("button",{name:"Đã inspect",exact:true}).click();
        expect(writes).toBe(0);
        await section.getByRole("button",{name:"Xác nhận kiểm tra đạt",exact:true}).click();
        if(mode==="manual") {
          await expect(section.getByText("Đã đạt kiểm tra trước thuê.",{exact:true})).toBeVisible();
          await expect(start).toBeEnabled();
          await expect(section.getByRole("combobox")).toHaveCount(0);
        } else {
          await expect(section.getByRole("alert")).toContainText("Xe đã có biên bản không đạt");
          await expect(section.getByLabel("Kỹ thuật viên phụ trách",{exact:true})).toHaveValue("9");
          await expect(start).toBeDisabled();
        }
        expect(writes).toBe(1);
      }
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    });
  }
}

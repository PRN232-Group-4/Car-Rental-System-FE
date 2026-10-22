import { expect, test } from "@playwright/test";

const envelope=(data:unknown)=>({code:200,status:"success",is_success:true,data,message:"OK",error:null});
for(const width of [1440,390]) {
  for(const initial of ["pending","pre_inspection","renting","post_inspection","completed","cancelled","failed"] as const) {
    test(`cancel before renting (${initial}, ${width}px)`,async({page})=>{
      await page.setViewportSize({width,height:950});
      let status:string=initial==="failed"?"pre_inspection":initial;
      let writes=0;
      const rental=()=>({id:101,customerId:1,vehicleId:8,rentalType:"hourly",status,hasDriver:false,hasPassingPreInspection:false,hasPostInspection:false,totalPrice:100000,depositPrice:20000,startTime:"2027-01-10T08:00:00Z",endTime:"2027-01-10T10:00:00Z"});
      await page.route("**/api/**",async route=>{
        const path=new URL(route.request().url()).pathname;
        expect(path).not.toContain("/status/cancelled");
        let data:unknown={items:[],totalCount:0,page:1,pageSize:100};
        if(path.endsWith("/account/profile")) data={fullName:"Admin",email:"admin@test.local",roles:["Admin"]};
        else if(path.endsWith("/rentals/101/cancel")) {
          writes++;
          expect(route.request().postDataJSON()).toEqual({reason:"Khách đổi lịch thuê",initiator:null,waiveFee:false});
          if(initial==="failed") return route.fulfill({status:409,json:{...envelope(null),code:409,status:"error",is_success:false,message:"Đơn đã được bàn giao. Vui lòng tải lại.",error:{detail:"Đơn đã được bàn giao. Vui lòng tải lại."}}});
          status="cancelled";
          data={rentalId:101,toStatus:"cancelled"};
        }
        else if(path.endsWith("/rentals/101/inspection-assignment")) data=null;
        else if(path.endsWith("/rentals/101/detail")) data={rental:{...rental(),scheduledStart:rental().startTime,scheduledEnd:rental().endTime,cancelReason:status==="cancelled"?"Khách đổi lịch thuê":null,cancelledAt:status==="cancelled"?"2026-10-22T03:21:00Z":null},history:[],settlement:null};
        else if(path.endsWith("/rentals/101")) data=rental();
        else if(path.endsWith("/rentals")) data={items:[rental()],page:1,pageSize:30,totalCount:1};
        else if(path.endsWith("/vehicles/8")) data={id:8,brand:"Toyota",model:"Vios",detail:null};
        return route.fulfill({json:envelope(data)});
      });
      await page.goto("/admin/rentals?rentalId=101");
      const commands=page.getByRole("complementary",{name:"Bảng lệnh điều phối"});
      await expect(commands.getByText("Lệnh khuyến nghị hợp lệ",{exact:true})).toBeVisible();
      const cancel=commands.getByRole("button",{name:"Hủy đơn thuê",exact:true});
      if(["completed","cancelled"].includes(initial)) {
        await expect(commands.getByRole("button",{name:"Lưu phân công",exact:true})).toHaveCount(0);
        await expect(commands.getByLabel("Tài xế nhận lệnh",{exact:true})).toHaveCount(0);
        await expect(commands.getByText("Ghi đè trạng thái thủ công",{exact:true})).toHaveCount(0);
        if(initial==="cancelled") await expect(page.getByRole("region",{name:"Lý do hủy đơn"})).toContainText("Khách đổi lịch thuê");
      }
      if(!["pending","pre_inspection","failed"].includes(initial)) {
        await expect(cancel).toHaveCount(0);
        expect(writes).toBe(0);
        return;
      }
      await cancel.click();
      const dialog=page.getByRole("dialog",{name:"Xác nhận hủy hợp đồng thuê"});
      expect(writes).toBe(0);
      await dialog.getByRole("button",{name:"Xác nhận hủy đơn",exact:true}).click();
      await expect(dialog.getByRole("alert")).toContainText("Vui lòng nhập");
      expect(writes).toBe(0);
      await dialog.getByLabel("Lý do hủy *",{exact:true}).fill("Khách đổi lịch thuê");
      await dialog.getByRole("button",{name:"Xác nhận hủy đơn",exact:true}).click();
      if(initial==="failed") {
        await expect(dialog.getByRole("alert")).toContainText("Đơn đã được bàn giao");
        await expect(dialog.getByLabel("Lý do hủy *",{exact:true})).toHaveValue("Khách đổi lịch thuê");
        await dialog.getByRole("button",{name:"Đóng",exact:true}).click();
        await expect(cancel).toBeVisible();
      } else {
        await expect(dialog).toHaveCount(0);
        await expect(cancel).toHaveCount(0);
        await expect(commands.getByRole("button",{name:"Lưu phân công",exact:true})).toHaveCount(0);
        await expect(commands.getByText("Ghi đè trạng thái thủ công",{exact:true})).toHaveCount(0);
        await expect(page.getByRole("region",{name:"Lý do hủy đơn"})).toContainText("Khách đổi lịch thuê");
      }
      expect(writes).toBe(1);
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    });
  }
}

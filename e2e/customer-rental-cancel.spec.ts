import { expect, test } from "@playwright/test";

const envelope=(data:unknown)=>({code:200,status:"success",is_success:true,data,message:"OK",error:null});
for(const width of [1440,390]) {
  for(const initial of ["pending","pre_inspection","renting","post_inspection","completed","cancelled","preview-error","cancel-error","disallowed"] as const) {
    test(`customer cancels before renting (${initial}, ${width}px)`,async({page})=>{
      await page.setViewportSize({width,height:950});
      let status:string=initial.includes("error")||initial==="disallowed" ? "pre_inspection" : initial;
      let writes=0;
      const summary=()=>({id:101,status,rentalType:"hourly",vehicleId:8,vehicleBrand:"Toyota",vehicleModel:"Vios",startTime:"2026-10-21T08:00:00Z",endTime:"2026-10-23T08:00:00Z",totalPrice:500000});
      await page.route("**/api/**",async route=>{
        const path=new URL(route.request().url()).pathname;
        let data:unknown=[];
        if(path.endsWith("/account/profile")) data={fullName:"Customer",email:"customer@test.local",roles:["Customer"]};
        else if(path.endsWith("/rentals/101/cancellation-preview")) {
          if(initial==="preview-error") return route.fulfill({status:503,json:{...envelope(null),code:503,status:"error",is_success:false,message:"Không kết nối được",error:{}}});
          data={allowed:initial!=="disallowed",feeAmount:100000,refundAmount:400000,reasons:initial==="disallowed"?["Đơn đã được bàn giao."]:[],freeUntil:null};
        }
        else if(path.endsWith("/rentals/101/cancel")) {
          writes++;
          expect(route.request().postDataJSON()).toEqual({reason:"Khách đổi lịch thuê",initiator:"customer",waiveFee:false});
          if(initial==="cancel-error") return route.fulfill({status:409,json:{...envelope(null),code:409,status:"error",is_success:false,message:"Đơn đã chuyển sang Đang thuê.",error:{detail:"Đơn đã chuyển sang Đang thuê."}}});
          status="cancelled";
          data={rentalId:101,toStatus:"cancelled"};
        }
        else if(path.endsWith("/rentals/mine/101")) data={...summary(),vehicle:{id:8,brand:"Toyota",model:"Vios"},facility:null,start:summary().startTime,end:summary().endTime,hasDriver:false,invoice:null,timeline:status==="cancelled"?[{to:"cancelled",reason:"Khách đổi lịch thuê",at:"2026-10-22T03:21:00Z",actor:"customer"}]:[]};
        else if(path.endsWith("/rentals/mine")) data={items:[summary()],totalCount:1,page:1,pageSize:20};
        return route.fulfill({json:envelope(data)});
      });
      await page.goto("/my-rentals?rentalId=101");
      const detail=page.locator("#rental-progress");
      await expect(detail.getByRole("heading",{name:"Yêu cầu thuê #101",exact:true})).toBeVisible();
      const cancel=detail.getByRole("button",{name:"Hủy đơn thuê",exact:true});
      if(["renting","post_inspection","completed","cancelled"].includes(initial)) {
        await expect(cancel).toHaveCount(0);
        await expect(page.getByRole("button",{name:"Hủy đơn thuê #101",exact:true})).toHaveCount(0);
        return;
      }
      await expect(page.getByRole("button",{name:"Hủy đơn thuê #101",exact:true})).toBeVisible();
      await cancel.click();
      const dialog=page.getByRole("dialog",{name:"Xác nhận hủy hợp đồng thuê"});
      const confirm=dialog.getByRole("button",{name:"Xác nhận hủy đơn",exact:true});
      if(initial==="preview-error"||initial==="disallowed") {
        await expect(dialog.getByRole("alert")).toContainText(initial==="preview-error"?"Không thể tải chính sách hủy":"Đơn đã được bàn giao.");
        await expect(confirm).toBeDisabled();
        expect(writes).toBe(0);
        return;
      }
      await expect(dialog.getByText("Phí hủy: 100.000 đ",{exact:true})).toBeVisible();
      await expect(dialog.getByText("Hoàn tiền dự kiến: 400.000 đ",{exact:true})).toBeVisible();
      await confirm.click();
      await expect(dialog.getByRole("alert")).toContainText("Vui lòng nhập");
      expect(writes).toBe(0);
      await dialog.getByLabel("Lý do hủy *",{exact:true}).fill("Khách đổi lịch thuê");
      await confirm.click();
      if(initial==="cancel-error") {
        await expect(dialog.getByRole("alert")).toContainText("Đơn đã chuyển sang Đang thuê.");
        await expect(dialog.getByLabel("Lý do hủy *",{exact:true})).toHaveValue("Khách đổi lịch thuê");
      } else {
        await expect(dialog).toHaveCount(0);
        await expect(cancel).toHaveCount(0);
        await expect(page.getByRole("region",{name:"Lý do hủy đơn"})).toContainText("Khách đổi lịch thuê");
      }
      expect(writes).toBe(1);
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    });
  }
}

for(const width of [1440,390]) {
  for(const view of ["list","detail"]) {
    test(`account trips ${view} uses the same cancellation policy (${width}px)`,async({page})=>{
      await page.setViewportSize({width,height:950});
      let status="pre_inspection";
      let writes=0;
      const summary=()=>({id:101,status,canCancel:false,rentalType:"hourly",isSubscription:false,vehicleId:8,vehicleBrand:"Toyota",vehicleModel:"Vios",startTime:"2026-10-21T08:00:00Z",endTime:"2026-10-23T08:00:00Z",totalPrice:500000});
      await page.route("**/api/**",async route=>{
        const path=new URL(route.request().url()).pathname;
        let data:unknown=[];
        if(path.endsWith("/account/profile")) data={email:"customer@test.local",roles:["Customer"]};
        else if(path.endsWith("/rentals/mine")) data={items:[summary()],totalCount:1,page:1,pageSize:12};
        else if(path.endsWith("/rentals/mine/101")) data={...summary(),vehicle:{id:8,brand:"Toyota",model:"Vios"},facility:null,start:summary().startTime,end:summary().endTime,hasDriver:false,price:{rent:400000,vat:40000,deposit:60000,total:500000,overtime:0},inspections:[],timeline:status==="cancelled"?[{to:"cancelled",reason:"Khách đổi lịch thuê",at:"2026-10-22T03:21:00Z",actor:"customer"}]:[]};
        else if(path.endsWith("/rentals/101/cancellation-preview")) data={allowed:true,feeAmount:100000,refundAmount:400000,reasons:[],freeUntil:null};
        else if(path.endsWith("/rentals/101/cancel")) {
          expect(route.request().postDataJSON()).toEqual({reason:"Khách đổi lịch thuê",initiator:"customer",waiveFee:false});
          writes++;
          status="cancelled";
          data={rentalId:101,toStatus:status};
        }
        return route.fulfill({json:envelope(data)});
      });
      await page.goto(view==="list"?"/account/trips":"/account/trips/detail?id=101");
      const button=page.getByRole("button",{name:view==="list"?"Hủy đơn thuê #101":"Hủy chuyến",exact:true});
      await button.click();
      const dialog=page.getByRole("dialog",{name:"Xác nhận hủy hợp đồng thuê"});
      await expect(dialog.getByText("Phí hủy: 100.000 đ",{exact:true})).toBeVisible();
      await dialog.getByLabel("Lý do hủy *",{exact:true}).fill("Khách đổi lịch thuê");
      await dialog.getByRole("button",{name:"Xác nhận hủy đơn",exact:true}).click();
      await expect(dialog).toHaveCount(0);
      await expect(button).toHaveCount(0);
      if(view==="detail") await expect(page.getByRole("region",{name:"Lý do hủy đơn"})).toContainText("Khách đổi lịch thuê");
      expect(writes).toBe(1);
    });
  }
}

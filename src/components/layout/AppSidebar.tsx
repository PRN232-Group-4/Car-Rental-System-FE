"use client";

/**
 * AppSidebar đã được hợp nhất hoàn toàn vào AppPortalShell dùng chung cho cả 3 role (Customer, Admin, Driver).
 * File này re-export AppPortalShell để đảm bảo tương thích ngược và ngăn chặn việc render layout cũ.
 */
import AppPortalShell from "./AppPortalShell";
export default AppPortalShell;
export * from "./AppPortalShell";

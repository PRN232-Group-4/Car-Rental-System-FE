import { AuthGate } from "@/features/auth/AuthGate";
import PaymentManagement from "@/features/admin/payments/PaymentManagement";

export default function PaymentsPage() {
  return <AuthGate allowedRoles={["Admin", "Manager"]}><PaymentManagement /></AuthGate>;
}

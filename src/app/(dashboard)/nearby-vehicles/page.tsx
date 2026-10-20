import { AuthGate } from "@/features/auth/AuthGate";
import NearbyVehicles from "@/features/maps/NearbyVehicles";
export default function NearbyVehiclesPage() {
  return <AuthGate><NearbyVehicles /></AuthGate>;
}

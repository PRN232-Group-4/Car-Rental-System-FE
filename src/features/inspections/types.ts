export interface InspectionCheckItem {
  name: string;
  standard: string;
  status: "pass" | "warning" | "fail";
}

export interface InspectionRecord {
  recordNumber: string;
  rentalId: string;
  vehicleName: string;
  licensePlate: string;
  plateNumber: string;
  type: string;
  inspectionType: "pre_rental" | "post_rental";
  inspectedAt: string;
  inspectorName: string;
  inspectorCode: string;
  odometer: string;
  batteryOrFuelLevel: string;
  fuelBatteryLevel: string;
  digitalSealHash: string;
  checkItems: InspectionCheckItem[];
  grade?: string;
  gradingScore?: number;
}

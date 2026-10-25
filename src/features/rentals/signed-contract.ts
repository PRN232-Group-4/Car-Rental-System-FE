import { isSafeContractLink } from "./booking-rules";
import type { RentalContract } from "./types";

export const SIGNED_CONTRACT_MAX_BYTES = 10 * 1024 * 1024;
export const SIGNED_CONTRACT_ACCEPT = "application/pdf,image/jpeg,image/png,image/webp";

export function signedContractFileError(file: File | null): string | undefined {
  if (!file) return "Vui lòng chọn file PDF hoặc ảnh hợp đồng đã ký.";
  if (!SIGNED_CONTRACT_ACCEPT.split(",").includes(file.type)) return "Chỉ nhận file PDF, JPEG, PNG hoặc WebP. Vui lòng chọn lại file.";
  if (!file.size) return "File hợp đồng đang trống. Vui lòng chọn file có nội dung.";
  if (file.size > SIGNED_CONTRACT_MAX_BYTES) return "File hợp đồng không được vượt quá 10 MB. Vui lòng chọn file nhỏ hơn.";
}

export function signedContractDocumentHref(rental: Pick<RentalContract, "id" | "contractLink" | "hasUploadedContract">): string | null {
  if (rental.hasUploadedContract) return `/api/rental/${encodeURIComponent(rental.id)}/contract/document`;
  return rental.contractLink && isSafeContractLink(rental.contractLink) ? rental.contractLink : null;
}

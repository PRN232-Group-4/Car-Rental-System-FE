import { defaultApiClient } from "@/api/default-api-client";
import { ApiClientError } from "@/api/api-client";
import { CustomerLicense, SaveLicensePayload } from "./types";

export async function getCustomerLicense(): Promise<CustomerLicense | null> {
  try {
    const res = await defaultApiClient.get<CustomerLicense>("customer/license");
    return res;
  } catch (error) {
    // No license on record is a legitimate "not set" state; anything else is a real error.
    if (error instanceof ApiClientError && error.status === 404) return null;
    throw error;
  }
}

export async function saveCustomerLicense(payload: SaveLicensePayload): Promise<CustomerLicense> {
  const form = new FormData();
  form.append("Number", payload.number);
  form.append("Type", payload.type);
  if (payload.issueDate) form.append("IssueDate", payload.issueDate);
  form.append("ExpiryDate", payload.expiryDate);
  form.append("File", payload.file);
  // ApiClient leaves Content-Type to the browser, including the multipart boundary.
  const res = await defaultApiClient.put<CustomerLicense>("customer/license", form);
  return res;
}

/**
 * Compresses an image client-side to < 1.5MB before uploading
 */
export async function compressImage(file: File, maxDimension = 1600, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads license photo, falls back to direct base64/mock data URL if Cloudinary is not configured
 */
export async function uploadLicensePhoto(file: File): Promise<string> {
  const compressedDataUrl = await compressImage(file);
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  if (!cloudName) {
    // Return compressed image data directly when no third-party storage is configured
    return compressedDataUrl;
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "car_rental_license");

  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: formData,
    });
    if (res.ok) {
      const data = await res.json();
      return data.secure_url;
    }
  } catch (err) {
    console.warn("[License API] Cloudinary upload failed, using local base64 fallback:", err);
  }

  return compressedDataUrl;
}

import { ApiProblemError } from "./api-client";

/** Do not invent endpoints or successful writes for capabilities absent from the deployed API. */
export function unsupportedApi(capability: string): never {
  throw new ApiProblemError(501, "API chưa hỗ trợ", {
    title: "API chưa hỗ trợ",
    detail: `API hiện chưa hỗ trợ ${capability}. Không có dữ liệu hoặc thay đổi giả lập được tạo.`,
  });
}

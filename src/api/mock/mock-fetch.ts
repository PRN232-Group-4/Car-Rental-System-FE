import { handleMockRoute } from "./mock-handlers";

/**
 * Simulates network latency for realistic asynchronous behavior.
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Custom fetch implementation that intercepts requests and serves mock responses
 * adhering to the standard Web Fetch API specification.
 */
export async function mockFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  // Extract URL string
  let urlStr = "";
  if (typeof input === "string") {
    urlStr = input;
  } else if (input instanceof URL) {
    urlStr = input.toString();
  } else if ("url" in input) {
    urlStr = input.url;
  }

  const method = (init?.method || "GET").toUpperCase();

  // Parse body if present
  let body: unknown = undefined;
  if (init?.body) {
    if (typeof init.body === "string") {
      try {
        body = JSON.parse(init.body);
      } catch {
        body = init.body;
      }
    } else {
      body = init.body;
    }
  }

  // Realistic network jitter between 40ms and 120ms
  const latency = Math.floor(40 + Math.random() * 80);
  await delay(latency);

  // Dispatch to route handler
  const mockResult = handleMockRoute(method, urlStr, body);

  const responseBody = JSON.stringify(mockResult.data);
  const responseInit: ResponseInit = {
    status: mockResult.status,
    statusText: mockResult.status >= 200 && mockResult.status < 300 ? "OK" : "Error",
    headers: {
      "Content-Type": "application/json",
      "X-Mock-Service": "Thong Dong Mock Engine",
      ...mockResult.headers,
    },
  };

  return new Response(responseBody, responseInit);
}

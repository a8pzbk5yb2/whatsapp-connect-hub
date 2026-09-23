import type { ApiEnvelope } from "@/types";
import { FixtureError, fixtureRequest } from "./fixtures";

const BASE_URL = import.meta.env["VITE_API_BASE_URL"] as string | undefined;
const FORCE_FIXTURES = import.meta.env["VITE_USE_FIXTURES"] === "true";

export const usingFixtures = FORCE_FIXTURES || !BASE_URL;

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}

let tokenGetter: () => string | null = () => null;
let unauthorizedHandler: () => void = () => {};

export function configureApi(options: { getToken: () => string | null; onUnauthorized: () => void }) {
  tokenGetter = options.getToken;
  unauthorizedHandler = options.onUnauthorized;
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  skipAuthRedirect?: boolean;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const method = options.method ?? "GET";
  const token = tokenGetter();

  if (usingFixtures) {
    try {
      return await fixtureRequest<T>(method, path, options.body, token);
    } catch (error) {
      if (error instanceof FixtureError) {
        if (error.status === 401 && !options.skipAuthRedirect) unauthorizedHandler();
        throw new ApiError(error.code, error.message, error.status);
      }
      throw error;
    }
  }

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}/api${path}`, {
      method,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(options.body ? { body: JSON.stringify(options.body) } : {}),
    });
  } catch {
    throw new ApiError("NETWORK_ERROR", "We could not reach the server. Check your connection and try again.", 0);
  }

  if (response.status === 401 && !options.skipAuthRedirect) unauthorizedHandler();

  let envelope: ApiEnvelope<T>;
  try {
    envelope = (await response.json()) as ApiEnvelope<T>;
  } catch {
    throw new ApiError("INVALID_RESPONSE", "The server returned an unexpected response.", response.status);
  }

  if (!response.ok || !envelope.success) {
    throw new ApiError(
      envelope.error?.code ?? "REQUEST_FAILED",
      envelope.message || "Something went wrong. Please try again.",
      response.status,
    );
  }

  return envelope.data as T;
}

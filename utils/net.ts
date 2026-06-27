// fetch cu timeout (AbortController) — evită cererile blocate la infinit.
export async function fetchWithTimeout(
  input: string,
  init: RequestInit = {},
  ms = 12000
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

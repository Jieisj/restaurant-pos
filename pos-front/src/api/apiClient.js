const BASE_URL = "http://localhost:8080";

export async function apiRequest(path, options = {}) {
  const token = sessionStorage.getItem("token");

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    let message = errorText;

    try {
      const errorJson = JSON.parse(errorText);
      message = errorJson.message || errorJson.error || errorJson.detail || message;
    } catch {
      // Keep plain-text server errors as-is.
    }

    throw new Error(message || `Request failed (${res.status})`);
  }

  const text = await res.text();

  if (!text) {
    return null;
  }

  return JSON.parse(text);
}

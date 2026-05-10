const BASE_URL = "http://localhost:8080";

export async function login(username, password) {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) throw new Error(await res.text());


  if (res.status === 204) {
    return null;
  }

  return res.json();
}


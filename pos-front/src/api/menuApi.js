import { apiRequest } from "./apiClient";

export function getAllMenuItems() {
  return apiRequest("/api/menuItem");
}

export function updateMenuItem(id, payload) {
  return apiRequest(`/api/menuItem/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

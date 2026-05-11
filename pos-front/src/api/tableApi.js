import { apiRequest } from "./apiClient";

export function getAllTables() {
  return apiRequest("/api/table");
}

export function getTableById(id) {
  return apiRequest(`/api/table/${id}`);
}

export function updateTable(id, payload, userId) {
  return apiRequest(`/api/table/${id}?userId=${userId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

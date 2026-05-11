import { apiRequest } from "./apiClient";

export function getCustomerUsers() {
  return apiRequest("/api/user/customers");
}

export function assignCustomerToTable(tableId, customerId) {
  return apiRequest(`/api/user/table-assignments/${tableId}`, {
    method: "PUT",
    body: JSON.stringify({ customerId: customerId || null }),
  });
}

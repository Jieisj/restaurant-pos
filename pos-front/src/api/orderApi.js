import { apiRequest } from "./apiClient";

export function getOrders(params = "") {
  return apiRequest(`/api/order${params}`);
}

export function getOrderById(id) {
  return apiRequest(`/api/order/${id}`);
}

export function openTableOrder(tableId, userId) {
  return apiRequest(`/api/order/tables/${tableId}/open?userId=${userId}`, {
    method: "POST",
  });
}

export function closeTableOrder(tableId, code) {
  return apiRequest(`/api/order/tables/${tableId}/close`, {
    method: "POST",
    body: JSON.stringify({ code }),
  });
}

export function createOrder(payload) {
  return apiRequest("/api/order", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function checkoutOrder(orderId, payload) {
  return apiRequest(`/api/order/${orderId}/checkout`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function updateOrder(orderId, payload) {
  return apiRequest(`/api/order/${orderId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function updateOrderCustomer(orderId, payload) {
  return apiRequest(`/api/order/${orderId}/customer`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function moveOrderToTable(orderId, tableId) {
  return apiRequest(`/api/order/${orderId}/move-table/${tableId}`, {
    method: "PUT",
  });
}

export function deleteOrder(orderId) {
  return apiRequest(`/api/order/${orderId}`, {
    method: "DELETE",
  });
}

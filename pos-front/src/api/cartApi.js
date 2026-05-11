import { apiRequest } from "./apiClient";

export function getCartItemsByOrder(orderId) {
  return apiRequest(`/api/cart/order/${orderId}`);
}

export async function getAllNotFinishedItems() {
  const items = await apiRequest("/api/cart");

  return items.filter(
    (item) => Number(item.isPending) === 0 && Number(item.isFinished) === 0,
  );
}

export function getNotFinishedItemsByOrder(orderId) {
  return apiRequest(`/api/cart/order/${orderId}/notFinished`);
}

export function addCartItem(payload) {
  return apiRequest("/api/cart", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateCartItem(id, payload) {
  return apiRequest(`/api/cart/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function sendCartItem(id) {
  return apiRequest(`/api/cart/${id}/send`, {
    method: "PUT",
  });
}

export function finishCartItem(id) {
  return apiRequest(`/api/cart/${id}/finish`, {
    method: "PUT",
  });
}

export function revertFinishedCartItem(id) {
  return apiRequest(`/api/cart/${id}/revert-finish`, {
    method: "PUT",
  });
}

export function deleteCartItem(id) {
  return apiRequest(`/api/cart/${id}`, {
    method: "DELETE",
  });
}

export function addCartItemNote(cartItemId, payload) {
  return apiRequest(`/api/cart/${cartItemId}/notes`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateCartItemNote(noteId, payload) {
  return apiRequest(`/api/cart/notes/${noteId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteCartItemNote(noteId) {
  return apiRequest(`/api/cart/notes/${noteId}`, {
    method: "DELETE",
  });
}

import { apiRequest } from "./apiClient";

export function getMenuItemModifiersByMenuItemAndType(menuItemId, modifierType) {
  return apiRequest(`/api/menuItemModifier/menuItem/${menuItemId}/type/${modifierType}`);
}

export function addMenuItemModifier(payload) {
  return apiRequest("/api/menuItemModifier", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function deleteMenuItemModifier(id) {
  return apiRequest(`/api/menuItemModifier/${id}`, {
    method: "DELETE",
  });
}
import { useState } from "react";
import { useEffect } from "react";
import { updateMenuItem } from "../../../api/menuApi";

import {
  getMenuItemModifiersByMenuItemAndType,
  addMenuItemModifier,
  deleteMenuItemModifier,
} from "../../../api/menuItemModifier";

function MenuSection({
  items,
  onAddItem,
  onRefreshMenuItems,
  onNotify,
  isCustomer,
}) {
  const [settingItem, setSettingItem] = useState(null);
  const [customizeItem, setCustomizeItem] = useState(null);
  const [availabilityMode, setAvailabilityMode] = useState(false);
  const [selectedMenuItemIds, setSelectedMenuItemIds] = useState([]);
  const [menuItemModifiers, setMenuItemModifiers] = useState({
    ADD: [],
    NO: [],
    SWITCH_TO: [],
  });

  useEffect(() => {
    if (settingItem || customizeItem) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [settingItem, customizeItem]);

  const [selectedAdd, setSelectedAdd] = useState([]);
  const [selectedNo, setSelectedNo] = useState([]);
  const [selectedSwitch, setSelectedSwitch] = useState("");

  const [newAdd, setNewAdd] = useState("");
  const [newNo, setNewNo] = useState("");
  const [newSwitchFrom, setNewSwitchFrom] = useState("");
  const [newSwitchTo, setNewSwitchTo] = useState("");

  function notify(message, type) {
    onNotify?.(message, type);
  }

  function toggleMenuItemSelection(id) {
    setSelectedMenuItemIds((prev) =>
      prev.includes(id)
        ? prev.filter((itemId) => itemId !== id)
        : [...prev, id],
    );
  }

  async function handleConfirmAvailabilityChange() {
    try {
      for (const id of selectedMenuItemIds) {
        const item = items.find((i) => i.id === id);
        if (!item) continue;

        await updateMenuItem(id, {
          ...item,
          isAvailable: item.isAvailable == 0 ? 1 : 0,
        });
      }

      await onRefreshMenuItems();
      setSelectedMenuItemIds([]);
      setAvailabilityMode(false);
      notify("Menu availability updated");
    } catch (err) {
      console.error("update menu availability failed:", err);
      notify("Failed to update availability", "error");
    }
  }

  async function loadMenuItemModifiers(menuItemId) {
    const add = await getMenuItemModifiersByMenuItemAndType(menuItemId, "ADD");
    const no = await getMenuItemModifiersByMenuItemAndType(menuItemId, "NO");
    const sw = await getMenuItemModifiersByMenuItemAndType(
      menuItemId,
      "SWITCH",
    );

    setMenuItemModifiers({
      ADD: add,
      NO: no,
      SWITCH_TO: sw,
    });
  }

  async function handleOpenSettings(item) {
    try {
      setSettingItem(item);
      await loadMenuItemModifiers(item.id);
    } catch (err) {
      console.error("load modifier settings failed:", err);
      setSettingItem(null);
      notify("Failed to load modifiers", "error");
    }
  }

  async function handleOpenCustomize(item) {
    try {
      setCustomizeItem(item);
      setSelectedAdd([]);
      setSelectedNo([]);
      setSelectedSwitch("");
      await loadMenuItemModifiers(item.id);
    } catch (err) {
      console.error("load customize options failed:", err);
      setCustomizeItem(null);
      notify("Failed to load customize options", "error");
    }
  }

  async function handleAddMenuItemModifier(type, name, switchTo = null) {
    if (!name?.trim()) {
      notify("Enter a modifier name first", "warning");
      return;
    }

    if (type === "SWITCH" && !switchTo?.trim()) {
      notify("Enter the switch target first", "warning");
      return;
    }

    try {
      await addMenuItemModifier({
        menuItemId: settingItem.id,
        modifierType: type,
        name: name.trim(),
        switchTo: switchTo?.trim() || null,
      });

      await loadMenuItemModifiers(settingItem.id);
      notify("Modifier added");
    } catch (err) {
      console.error("add menu item modifier failed:", err);
      notify("Failed to add modifier", "error");
    }
  }

  async function handleDeleteMenuItemModifier(id) {
    try {
      await deleteMenuItemModifier(id);
      await loadMenuItemModifiers(settingItem.id);
      notify("Modifier deleted");
    } catch (err) {
      console.error("delete menu item modifier failed:", err);
      notify("Failed to delete modifier", "error");
    }
  }

  function toggleValue(value, list, setList) {
    setList(
      list.includes(value) ? list.filter((v) => v !== value) : [...list, value],
    );
  }

  async function handleConfirmCustomize() {
    await onAddItem({
      ...customizeItem,
      selectedModifiers: {
        add: selectedAdd,
        no: selectedNo,
        switchTo: selectedSwitch,
      },
    });

    setCustomizeItem(null);
  }

  return (
    <section>
      {!isCustomer && (
        <div style={styles.bulkBar}>
          <button
            style={styles.bulkButton}
            onClick={() => {
              setAvailabilityMode(!availabilityMode);
              setSelectedMenuItemIds([]);
            }}
          >
            {availabilityMode ? "Cancel Selection" : "Select Availability"}
          </button>

          {availabilityMode && (
            <button
              style={styles.confirmButton}
              onClick={handleConfirmAvailabilityChange}
              disabled={selectedMenuItemIds.length === 0}
            >
              Confirm ({selectedMenuItemIds.length})
            </button>
          )}
        </div>
      )}
      <h2>Menu</h2>

      <div style={styles.grid}>
        {items.map((item) => {
          const isUnavailable =
            item.isAvailable === 0 || item.available === false;
          const isSelected = selectedMenuItemIds.includes(item.id);

          return (
            <div
              key={item.id}
              role={availabilityMode ? "button" : undefined}
              tabIndex={availabilityMode ? 0 : undefined}
              onClick={() => {
                if (availabilityMode) {
                  toggleMenuItemSelection(item.id);
                }
              }}
              onKeyDown={(e) => {
                if (!availabilityMode) return;

                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggleMenuItemSelection(item.id);
                }
              }}
              style={{
                ...styles.card,
                ...(availabilityMode ? styles.selectableCard : {}),
                ...(isUnavailable ? styles.unavailableCard : {}),
                ...(isSelected ? styles.selectedCard : {}),
              }}
            >
              {availabilityMode && (
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleMenuItemSelection(item.id)}
                  onClick={(e) => e.stopPropagation()}
                  style={styles.checkbox}
                />
              )}

              <div style={styles.cardTop}>
                <span
                  style={
                    isUnavailable
                      ? styles.unavailableStatus
                      : styles.availableStatus
                  }
                >
                  {isUnavailable ? "Unavailable" : "Available"}
                </span>

                {!availabilityMode && !isCustomer && (
                  <div style={styles.iconGroup}>
                    <button
                      type="button"
                      title="Manage modifiers"
                      style={styles.iconButton}
                      onClick={() => handleOpenSettings(item)}
                    >
                      ⚙
                    </button>

                    <button
                      type="button"
                      title="Customize item"
                      style={styles.iconButton}
                      onClick={() => handleOpenCustomize(item)}
                      disabled={isUnavailable}
                    >
                      ✎
                    </button>
                  </div>
                )}
              </div>

              <div style={styles.cardBody}>
                <h3 style={styles.name}>{item.name}</h3>
                <div style={styles.price}>${Number(item.price).toFixed(2)}</div>
              </div>

              <button
                type="button"
                onClick={() => onAddItem(item)}
                style={{
                  ...styles.addButton,
                  ...(isUnavailable || availabilityMode
                    ? styles.disabledAddButton
                    : {}),
                }}
                disabled={isUnavailable || availabilityMode}
              >
                {availabilityMode
                  ? "Select mode"
                  : isUnavailable
                    ? "Unavailable"
                    : "Add"}
              </button>
            </div>
          );
        })}
      </div>

      {settingItem && (
        <div style={styles.overlay}>
          <div style={styles.customizeModal}>
            <div style={styles.customizeHeader}>
              <div>
                <h2 style={styles.customizeTitle}>Manage Modifiers</h2>
                <p style={styles.customizeSubtitle}>{settingItem.name}</p>
              </div>

              <button
                type="button"
                aria-label="Close manage modifiers"
                onClick={() => setSettingItem(null)}
                style={styles.customizeCloseButton}
              >
                ×
              </button>
            </div>

            <div style={styles.customizeContent}>
              <div style={styles.customizeSection}>
                <div style={styles.customizeSectionHeader}>
                  <h3 style={styles.customizeSectionTitle}>Add</h3>
                  <span style={styles.optionCount}>
                    {menuItemModifiers.ADD.length} options
                  </span>
                </div>

                <div style={styles.optionGrid}>
                  {menuItemModifiers.ADD.length === 0 ? (
                    <p style={styles.emptyOptions}>No add-ons yet.</p>
                  ) : (
                    menuItemModifiers.ADD.map((m) => (
                      <span key={m.id} style={styles.modifierChip}>
                        {m.name}
                        <button
                          type="button"
                          aria-label={`Delete ${m.name}`}
                          onClick={() => handleDeleteMenuItemModifier(m.id)}
                          style={styles.chipDelete}
                        >
                          ×
                        </button>
                      </span>
                    ))
                  )}
                </div>

                <div style={styles.managerInputRow}>
                  <input
                    value={newAdd}
                    onChange={(e) => setNewAdd(e.target.value)}
                    placeholder="Add option"
                    style={styles.managerInput}
                  />
                  <button
                    type="button"
                    style={styles.addInlineButton}
                    onClick={async () => {
                      await handleAddMenuItemModifier("ADD", newAdd);
                      setNewAdd("");
                    }}
                  >
                    Add
                  </button>
                </div>
              </div>

              <div style={styles.customizeSection}>
                <div style={styles.customizeSectionHeader}>
                  <h3 style={styles.customizeSectionTitle}>Remove</h3>
                  <span style={styles.optionCount}>
                    {menuItemModifiers.NO.length} options
                  </span>
                </div>

                <div style={styles.optionGrid}>
                  {menuItemModifiers.NO.length === 0 ? (
                    <p style={styles.emptyOptions}>No removal options yet.</p>
                  ) : (
                    menuItemModifiers.NO.map((m) => (
                      <span key={m.id} style={styles.modifierChip}>
                        No {m.name}
                        <button
                          type="button"
                          aria-label={`Delete no ${m.name}`}
                          onClick={() => handleDeleteMenuItemModifier(m.id)}
                          style={styles.chipDelete}
                        >
                          ×
                        </button>
                      </span>
                    ))
                  )}
                </div>

                <div style={styles.managerInputRow}>
                  <input
                    value={newNo}
                    onChange={(e) => setNewNo(e.target.value)}
                    placeholder="Remove option"
                    style={styles.managerInput}
                  />
                  <button
                    type="button"
                    style={styles.addInlineButton}
                    onClick={async () => {
                      await handleAddMenuItemModifier("NO", newNo);
                      setNewNo("");
                    }}
                  >
                    Add
                  </button>
                </div>
              </div>

              <div style={styles.customizeSection}>
                <div style={styles.customizeSectionHeader}>
                  <h3 style={styles.customizeSectionTitle}>Switch</h3>
                  <span style={styles.optionCount}>
                    {menuItemModifiers.SWITCH_TO.length} options
                  </span>
                </div>

                <div style={styles.optionGrid}>
                  {menuItemModifiers.SWITCH_TO.length === 0 ? (
                    <p style={styles.emptyOptions}>No switch options yet.</p>
                  ) : (
                    menuItemModifiers.SWITCH_TO.map((m) => (
                      <span key={m.id} style={styles.modifierChip}>
                        {m.name} → {m.switchTo}
                        <button
                          type="button"
                          aria-label={`Delete switch ${m.name}`}
                          onClick={() => handleDeleteMenuItemModifier(m.id)}
                          style={styles.chipDelete}
                        >
                          ×
                        </button>
                      </span>
                    ))
                  )}
                </div>

                <div style={styles.managerInputRow}>
                  <input
                    value={newSwitchFrom}
                    onChange={(e) => setNewSwitchFrom(e.target.value)}
                    placeholder="From"
                    style={styles.managerInput}
                  />
                  <input
                    value={newSwitchTo}
                    onChange={(e) => setNewSwitchTo(e.target.value)}
                    placeholder="To"
                    style={styles.managerInput}
                  />
                  <button
                    type="button"
                    style={styles.addInlineButton}
                    onClick={async () => {
                      await handleAddMenuItemModifier(
                        "SWITCH",
                        newSwitchFrom,
                        newSwitchTo,
                      );
                      setNewSwitchFrom("");
                      setNewSwitchTo("");
                    }}
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            <div style={styles.customizeActions}>
              <button
                type="button"
                onClick={() => setSettingItem(null)}
                style={styles.confirmCustomizeButton}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {customizeItem && (
        <div style={styles.overlay}>
          <div style={styles.customizeModal}>
            <div style={styles.customizeHeader}>
              <div>
                <h2 style={styles.customizeTitle}>Customize Dish</h2>
                <p style={styles.customizeSubtitle}>{customizeItem.name}</p>
              </div>

              <button
                type="button"
                aria-label="Close customize dish"
                onClick={() => setCustomizeItem(null)}
                style={styles.customizeCloseButton}
              >
                ×
              </button>
            </div>

            <div style={styles.customizeContent}>
              <div style={styles.customizeSection}>
                <div style={styles.customizeSectionHeader}>
                  <h3 style={styles.customizeSectionTitle}>Add</h3>
                  <span style={styles.optionCount}>
                    {selectedAdd.length} selected
                  </span>
                </div>

                <div style={styles.optionGrid}>
                  {menuItemModifiers.ADD.length === 0 ? (
                    <p style={styles.emptyOptions}>No add-ons available.</p>
                  ) : (
                    menuItemModifiers.ADD.map((modifier) => (
                      <button
                        type="button"
                        key={modifier.id}
                        onClick={() =>
                          toggleValue(
                            modifier.name,
                            selectedAdd,
                            setSelectedAdd,
                          )
                        }
                        style={{
                          ...styles.optionButton,
                          ...(selectedAdd.includes(modifier.name)
                            ? styles.optionButtonActive
                            : {}),
                        }}
                      >
                        {modifier.name}
                      </button>
                    ))
                  )}
                </div>
              </div>

              <div style={styles.customizeSection}>
                <div style={styles.customizeSectionHeader}>
                  <h3 style={styles.customizeSectionTitle}>Remove</h3>
                  <span style={styles.optionCount}>
                    {selectedNo.length} selected
                  </span>
                </div>

                <div style={styles.optionGrid}>
                  {menuItemModifiers.NO.length === 0 ? (
                    <p style={styles.emptyOptions}>No removal options.</p>
                  ) : (
                    menuItemModifiers.NO.map((modifier) => (
                      <button
                        type="button"
                        key={modifier.id}
                        onClick={() =>
                          toggleValue(
                            modifier.name,
                            selectedNo,
                            setSelectedNo,
                          )
                        }
                        style={{
                          ...styles.optionButton,
                          ...(selectedNo.includes(modifier.name)
                            ? styles.optionButtonActive
                            : {}),
                        }}
                      >
                        No {modifier.name}
                      </button>
                    ))
                  )}
                </div>
              </div>

              <div style={styles.customizeSection}>
                <div style={styles.customizeSectionHeader}>
                  <h3 style={styles.customizeSectionTitle}>Switch</h3>
                  <span style={styles.optionCount}>
                    {selectedSwitch ? "1 selected" : "Optional"}
                  </span>
                </div>

                <div style={styles.optionGrid}>
                  {menuItemModifiers.SWITCH_TO.length === 0 ? (
                    <p style={styles.emptyOptions}>No switch options.</p>
                  ) : (
                    menuItemModifiers.SWITCH_TO.map((modifier) => {
                      const label = `${modifier.name} → ${modifier.switchTo}`;

                      return (
                        <button
                          type="button"
                          key={modifier.id}
                          onClick={() => {
                            if (selectedSwitch === label) {
                              setSelectedSwitch("");
                            } else {
                              setSelectedSwitch(label);
                            }
                          }}
                          style={{
                            ...styles.optionButton,
                            ...(selectedSwitch === label
                              ? styles.optionButtonActive
                              : {}),
                          }}
                        >
                          {label}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <div style={styles.customizeActions}>
              <button
                type="button"
                onClick={() => setCustomizeItem(null)}
                style={styles.cancelButton}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmCustomize}
                style={styles.confirmCustomizeButton}
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

const styles = {
  inputRow: {
    display: "flex",
    gap: 10,
    alignItems: "center",
  },

  modalFooter: {
    position: "sticky",
    bottom: 0,
    background: "white",
    paddingTop: 12,
    borderTop: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "auto",
  },

  closeButton: {
    border: "none",
    background: "#111827",
    color: "white",
    padding: "12px 18px",
    borderRadius: 12,
    fontWeight: 800,
    transition: "0.2s",
    cursor: "pointer",
  },

  addInlineButton: {
    border: "none",
    background: "#111827",
    color: "white",
    padding: "12px 16px",
    borderRadius: 12,
    fontWeight: 800,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
    gap: 16,
  },
  card: {
    position: "relative",
    boxSizing: "border-box",
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    padding: 16,
    background: "white",
    boxShadow: "0 8px 18px rgba(15,23,42,0.06)",
    display: "flex",
    flexDirection: "column",
    gap: 16,
    minHeight: 190,
  },
  selectableCard: {
    cursor: "pointer",
  },
  selectedCard: {
    border: "1px solid #2563eb",
    outline: "2px solid #2563eb",
    outlineOffset: -2,
    boxShadow: "0 10px 24px rgba(37,99,235,0.16)",
  },
  unavailableCard: {
    background: "#f9fafb",
    opacity: 0.65,
  },

  bulkBar: {
    display: "flex",
    gap: 10,
    marginBottom: 16,
  },

  bulkButton: {
    border: "1px solid #d1d5db",
    background: "white",
    padding: "10px 14px",
    borderRadius: 12,
    fontWeight: 800,
    cursor: "pointer",
  },

  confirmButton: {
    border: "none",
    background: "#2563eb",
    color: "white",
    padding: "10px 14px",
    borderRadius: 12,
    fontWeight: 800,
    cursor: "pointer",
  },

  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  cardBody: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    gap: 14,
  },
  name: {
    margin: 0,
    color: "#111827",
    fontSize: 20,
    lineHeight: 1.2,
    overflowWrap: "anywhere",
  },
  price: {
    color: "#111827",
    fontSize: 28,
    fontWeight: 900,
    letterSpacing: 0,
  },
  availableStatus: {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: 999,
    padding: "5px 9px",
    background: "#dcfce7",
    color: "#166534",
    fontSize: 12,
    fontWeight: 900,
  },
  unavailableStatus: {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: 999,
    padding: "5px 9px",
    background: "#fee2e2",
    color: "#991b1b",
    fontSize: 12,
    fontWeight: 900,
  },
  iconGroup: { display: "flex", gap: 6 },
  iconButton: {
    border: "1px solid #d1d5db",
    background: "#f9fafb",
    borderRadius: 8,
    cursor: "pointer",
    width: 34,
    height: 34,
    padding: 0,
    display: "inline-grid",
    placeItems: "center",
    fontWeight: 900,
  },
  chip: {
    margin: 4,
    padding: "8px 12px",
    borderRadius: 999,
    border: "1px solid #d1d5db",
    background: "white",
    cursor: "pointer",
  },
  activeChip: { background: "#111827", color: "white" },
  tag: {
    display: "inline-block",
    margin: 4,
    padding: "5px 8px",
    background: "#f3f4f6",
    borderRadius: 999,
  },

  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    display: "grid",
    placeItems: "center",
    zIndex: 9999,
  },

  modal: {
    width: 880,
    maxHeight: "85vh",
    overflowY: "auto",
    background: "white",
    borderRadius: 22,
    padding: 28,
    display: "flex",
    flexDirection: "column",
    gap: 18,
    boxShadow: "0 24px 70px rgba(0,0,0,0.25)",
  },
  customizeModal: {
    width: 960,
    maxWidth: "calc(100vw - 48px)",
    maxHeight: "86vh",
    overflow: "hidden",
    background: "white",
    borderRadius: 10,
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 24px 70px rgba(0,0,0,0.25)",
  },
  customizeHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
    padding: "22px 24px",
    borderBottom: "1px solid #e5e7eb",
    background: "#f9fafb",
  },
  customizeTitle: {
    margin: 0,
    color: "#111827",
    fontSize: 24,
    fontWeight: 900,
  },
  customizeSubtitle: {
    margin: "6px 0 0",
    color: "#4b5563",
    fontSize: 16,
    fontWeight: 800,
  },
  customizeCloseButton: {
    border: "1px solid #d1d5db",
    background: "white",
    color: "#111827",
    borderRadius: 8,
    width: 36,
    height: 36,
    cursor: "pointer",
    fontSize: 22,
    lineHeight: 1,
    fontWeight: 800,
  },
  customizeContent: {
    padding: 20,
    overflowY: "auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    alignItems: "start",
    gap: 14,
  },
  customizeSection: {
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    padding: 16,
    background: "white",
  },
  customizeSectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  customizeSectionTitle: {
    margin: 0,
    color: "#111827",
    fontSize: 16,
    fontWeight: 900,
  },
  optionCount: {
    color: "#6b7280",
    fontSize: 12,
    fontWeight: 800,
  },
  optionGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
  },
  managerInputRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    alignItems: "center",
    marginTop: 14,
  },
  managerInput: {
    flex: "1 1 180px",
    minWidth: 0,
    boxSizing: "border-box",
    padding: "12px 14px",
    border: "1px solid #d1d5db",
    borderRadius: 8,
    outline: "none",
    fontSize: 14,
  },
  optionButton: {
    border: "1px solid #d1d5db",
    background: "#f9fafb",
    color: "#111827",
    borderRadius: 8,
    padding: "10px 12px",
    cursor: "pointer",
    fontWeight: 800,
    fontSize: 14,
  },
  optionButtonActive: {
    border: "1px solid #111827",
    background: "#111827",
    color: "white",
  },
  emptyOptions: {
    margin: 0,
    color: "#6b7280",
    fontStyle: "italic",
  },
  customizeActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    padding: "16px 20px",
    borderTop: "1px solid #e5e7eb",
    background: "#f9fafb",
  },
  cancelButton: {
    border: "1px solid #d1d5db",
    background: "white",
    color: "#111827",
    padding: "12px 16px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 800,
  },
  confirmCustomizeButton: {
    border: "none",
    background: "#111827",
    color: "white",
    padding: "12px 18px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 900,
    minWidth: 150,
  },

  sectionBox: {
    border: "1px solid #e5e7eb",
    borderRadius: 18,
    padding: 16,
    background: "#fafafa",
  },
  checkbox: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 18,
    height: 18,
    cursor: "pointer",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 14px",
    border: "1px solid #d1d5db",
    borderRadius: 12,
    outline: "none",
    marginBottom: 10,
    fontSize: 14,
  },

  chipWrap: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    margin: "12px 0",
  },

  modifierChip: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 12px",
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: 999,
    fontWeight: 800,
    boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
  },

  chipDelete: {
    border: "none",
    background: "#ef4444",
    color: "white",
    borderRadius: "50%",
    width: 20,
    height: 20,
    cursor: "pointer",
    fontSize: 13,
    lineHeight: "20px",
    padding: 0,
  },
  itemTitle: {
    display: "inline-block",
    fontSize: 18,
    fontWeight: 800,
    padding: "8px 14px",
    borderRadius: 999,
    background: "#c7cbcf",
    color: "#15152a",
    border: "1px solid #e2e8f0",
    borderLeft: "4px solid #9f9fa7",
    paddingLeft: 12,
  },
  addButton: {
    border: "none",
    background: "#050a15",
    color: "white",
    padding: "12px 14px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 800,
    width: "100%",
    fontSize: 15,
  },
  disabledAddButton: {
    background: "#9ca3af",
    cursor: "not-allowed",
  },

  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
  },
};

export default MenuSection;

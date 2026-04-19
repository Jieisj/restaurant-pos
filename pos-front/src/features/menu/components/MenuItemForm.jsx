import { useState } from "react";

function ModifierSelectGroup({ title, options, onAddOption, onDeleteOption }) {
  const [inputValue, setInputValue] = useState("");
  const [selectedOption, setSelectedOption] = useState("");

  const handleAdd = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    onAddOption(trimmed);
    setInputValue("");
  };

  const handleDelete = () => {
    if (!selectedOption) return;
    onDeleteOption(selectedOption);
    setSelectedOption("");
  };

  return (
    <div style={styles.modifierBox}>
      <h3 style={styles.modifierTitle}>{title}</h3>

      <div style={styles.inlineRow}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={`Type ${title.toLowerCase()} option`}
          style={styles.input}
        />
        <button type="button" onClick={handleAdd} style={styles.darkButton}>
          Add
        </button>
      </div>

      <div style={styles.inlineRow}>
        <select
          value={selectedOption}
          onChange={(e) => setSelectedOption(e.target.value)}
          style={styles.input}
        >
          <option value="">Select option</option>
          {options.map((option, index) => (
            <option key={`${option}-${index}`} value={option}>
              {option}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={handleDelete}
          style={styles.deleteButton}
          disabled={!selectedOption}
        >
          Delete
        </button>
      </div>

      <div style={styles.previewList}>
        {options.length === 0 ? (
          <p style={styles.emptyText}>No options yet.</p>
        ) : (
          options.map((option, index) => (
            <div key={`${option}-${index}`} style={styles.previewItem}>
              {option}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function SwitchPairGroup({ pairs, onAddPair, onDeletePair }) {
  const [fromValue, setFromValue] = useState("");
  const [toValue, setToValue] = useState("");

  const handleAdd = () => {
    const from = fromValue.trim();
    const to = toValue.trim();

    if (!from || !to) return;

    onAddPair({ from, to });
    setFromValue("");
    setToValue("");
  };

  return (
    <div style={styles.modifierBox}>
      <h3 style={styles.modifierTitle}>Switch</h3>

      <div style={styles.switchAddRow}>
        <input
          value={fromValue}
          onChange={(e) => setFromValue(e.target.value)}
          placeholder="Type switch from option"
          style={styles.input}
        />

        <div style={styles.toText}>To</div>

        <input
          value={toValue}
          onChange={(e) => setToValue(e.target.value)}
          placeholder="Type switch to option"
          style={styles.input}
        />

        <button type="button" onClick={handleAdd} style={styles.darkButton}>
          Add
        </button>
      </div>

      <div style={styles.switchPairsWrap}>
        {pairs.length === 0 ? (
          <p style={styles.emptyText}>No switch options yet.</p>
        ) : (
          pairs.map((pair, index) => (
            <div
              key={`${pair.from}-${pair.to}-${index}`}
              style={styles.switchPairChip}
            >
              <button
                type="button"
                onClick={() => onDeletePair(index)}
                style={styles.switchPairDelete}
              >
                ×
              </button>

              <span style={styles.switchPairText}>{pair.from}</span>
              <span style={styles.switchPairTo}>To</span>
              <span style={styles.switchPairText}>{pair.to}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function MenuItemForm({
  categories,
  formData,
  onChange,
  onSubmit,
  onCancel,
  isEditing,
  onAddModifierOption,
  onDeleteModifierOption,
  onAddSwitchPair,
  onDeleteSwitchPair,
}) {
  const modifiers = formData.modifiers || {
    addOptions: [],
    noOptions: [],
    switchPairs: [],
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <h2 style={styles.title}>
            {isEditing ? "Edit Menu Item" : "Add Menu Item"}
          </h2>

          <button type="button" onClick={onCancel} style={styles.closeButton}>
            ×
          </button>
        </div>

        <form onSubmit={onSubmit} style={styles.form}>
          <div style={styles.fieldGroup}>
            <label htmlFor="name" style={styles.label}>
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={onChange}
              placeholder="Enter item name"
              style={styles.input}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label htmlFor="price" style={styles.label}>
              Price
            </label>
            <input
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={onChange}
              placeholder="Enter price"
              style={styles.input}
            />
          </div>

          <ModifierSelectGroup
            title="Add"
            options={modifiers.addOptions}
            onAddOption={(value) => onAddModifierOption("addOptions", value)}
            onDeleteOption={(value) =>
              onDeleteModifierOption("addOptions", value)
            }
          />

          <ModifierSelectGroup
            title="No"
            options={modifiers.noOptions}
            onAddOption={(value) => onAddModifierOption("noOptions", value)}
            onDeleteOption={(value) =>
              onDeleteModifierOption("noOptions", value)
            }
          />

          <SwitchPairGroup
            pairs={modifiers.switchPairs || []}
            onAddPair={onAddSwitchPair}
            onDeletePair={onDeleteSwitchPair}
          />

          <div style={styles.fieldGroup}>
            <label htmlFor="categoryId" style={styles.label}>
              Category
            </label>
            <select
              id="categoryId"
              name="categoryId"
              value={formData.categoryId}
              onChange={onChange}
              style={styles.input}
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.checkboxRow}>
            <input
              id="isAvailable"
              name="isAvailable"
              type="checkbox"
              checked={formData.isAvailable}
              onChange={onChange}
            />
            <label htmlFor="isAvailable" style={styles.checkboxLabel}>
              Available
            </label>
          </div>

          <div style={styles.actionRow}>
            <button type="button" onClick={onCancel} style={styles.cancelButton}>
              Cancel
            </button>
            <button type="submit" style={styles.submitButton}>
              {isEditing ? "Save Changes" : "Add Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.35)",
    display: "grid",
    placeItems: "center",
    padding: "20px",
    zIndex: 1000,
  },
  modal: {
    width: "100%",
    maxWidth: "760px",
    maxHeight: "90vh",
    overflowY: "auto",
    background: "#fff",
    borderRadius: "18px",
    padding: "24px",
    boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  title: {
    margin: 0,
    fontSize: "24px",
  },
  closeButton: {
    width: "40px",
    height: "40px",
    border: "none",
    borderRadius: "999px",
    background: "#f3f4f6",
    fontSize: "24px",
    lineHeight: 1,
    cursor: "pointer",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontWeight: 600,
    fontSize: "14px",
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    border: "1px solid #d1d5db",
    borderRadius: "10px",
    fontSize: "14px",
    background: "#fff",
  },
  modifierBox: {
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    background: "#fafafa",
  },
  modifierTitle: {
    margin: 0,
    fontSize: "18px",
  },
  inlineRow: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: "10px",
  },
  darkButton: {
    border: "none",
    borderRadius: "10px",
    background: "#0f172a",
    color: "#fff",
    padding: "12px 16px",
    cursor: "pointer",
    fontWeight: 600,
  },
  deleteButton: {
    border: "none",
    borderRadius: "10px",
    background: "#dc2626",
    color: "#fff",
    padding: "12px 16px",
    cursor: "pointer",
    fontWeight: 600,
  },
  previewList: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },
  previewItem: {
    display: "inline-flex",
    alignItems: "center",
    padding: "10px 12px",
    border: "1px solid #e5e7eb",
    borderRadius: "999px",
    background: "#fff",
    width: "fit-content",
    whiteSpace: "nowrap",
  },
  switchAddRow: {
    display: "grid",
    gridTemplateColumns: "1fr auto 1fr auto",
    gap: "12px",
    alignItems: "center",
  },
  switchPairsWrap: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
  },
  switchPairChip: {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "14px 32px 10px 12px",
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    background: "#fff",
    width: "fit-content",
    whiteSpace: "nowrap",
  },
  switchPairDelete: {
    position: "absolute",
    top: "6px",
    right: "6px",
    width: "18px",
    height: "18px",
    border: "none",
    borderRadius: "999px",
    background: "#ef4444",
    color: "#fff",
    fontSize: "12px",
    lineHeight: 1,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
  },
  switchPairText: {
    fontSize: "14px",
    fontWeight: 500,
  },
  switchPairTo: {
    fontSize: "14px",
    fontWeight: 700,
    color: "#374151",
  },
  toText: {
  fontWeight: 700,
  fontSize: "15px",
  color: "#170f11",
  textAlign: "center",
  whiteSpace: "nowrap",
  },
  emptyText: {
    margin: 0,
    color: "#6b7280",
  },
  checkboxRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  checkboxLabel: {
    fontSize: "14px",
    fontWeight: 500,
  },
  actionRow: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "8px",
  },
  cancelButton: {
    padding: "12px 16px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    background: "#fff",
    cursor: "pointer",
    fontWeight: 600,
  },
  submitButton: {
    padding: "12px 16px",
    borderRadius: "10px",
    border: "none",
    background: "#111827",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 600,
  },
};

export default MenuItemForm;
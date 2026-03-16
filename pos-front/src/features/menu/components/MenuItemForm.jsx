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

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div style={styles.modifierBox}>
      <h3 style={styles.modifierTitle}>{title}</h3>

      <div style={styles.fieldGroup}>
        <label style={styles.label}>Add Option</label>
        <div style={styles.inlineRow}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Type ${title.toLowerCase()} option`}
            style={styles.input}
          />
          <button type="button" onClick={handleAdd} style={styles.darkButton}>
            Add
          </button>
        </div>
      </div>

      <div style={styles.fieldGroup}>
        <label style={styles.label}>Delete Option</label>
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

function MenuItemForm({
  categories,
  formData,
  onChange,
  onSubmit,
  onCancel,
  isEditing,
  onAddModifierOption,
  onDeleteModifierOption,
}) {
  const modifiers = formData.modifiers || {
    addOptions: [],
    noOptions: [],
    switchOptions: [],
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

          <ModifierSelectGroup
            title="Switch to"
            options={modifiers.switchOptions}
            onAddOption={(value) => onAddModifierOption("switchOptions", value)}
            onDeleteOption={(value) =>
              onDeleteModifierOption("switchOptions", value)
            }
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
    flexDirection: "column",
    gap: "8px",
  },
  previewItem: {
    padding: "10px 12px",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    background: "#fff",
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
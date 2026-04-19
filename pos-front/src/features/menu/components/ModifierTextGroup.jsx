import { useState } from "react";

function ModifierTextGroup({
  labelName,
  labelValue,
  options,
  onLabelChange,
  onAddOption,
  onDeleteOption,
}) {
  const [inputValue, setInputValue] = useState("");

  const handleAdd = () => {
    if (!inputValue.trim()) return;

    onAddOption(inputValue.trim());
    setInputValue("");
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.group}>
        <label style={styles.label}>Section Label</label>
        <input
          value={labelValue}
          onChange={(e) => onLabelChange(e.target.value)}
          placeholder={labelName}
          style={styles.input}
        />
      </div>

      <div style={styles.group}>
        <label style={styles.label}>Add Option</label>
        <div style={styles.row}>
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type option"
            style={styles.input}
          />
          <button type="button" onClick={handleAdd} style={styles.addButton}>
            Add
          </button>
        </div>
      </div>

      <div style={styles.options}>
        {options.length === 0 ? (
          <p style={styles.empty}>No options yet.</p>
        ) : (
          options.map((option, index) => (
            <div key={`${option}-${index}`} style={styles.optionRow}>
              <span>{option}</span>
              <button
                type="button"
                onClick={() => onDeleteOption(index)}
                style={styles.deleteButton}
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  group: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontWeight: 600,
    fontSize: "14px",
  },
  row: {
    display: "flex",
    gap: "10px",
  },
  input: {
    flex: 1,
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
  },
  addButton: {
    border: "none",
    borderRadius: "10px",
    background: "#111827",
    color: "#fff",
    padding: "12px 14px",
    cursor: "pointer",
  },
  options: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },
  empty: {
    margin: 0,
    color: "#6b7280",
  },
  optionRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 12px",
    border: "1px solid #e5e7eb",
    borderRadius: "999px",
    background: "#fff",
    width: "fit-content",
    whiteSpace: "nowrap",
  },
  deleteButton: {
    border: "none",
    borderRadius: "999px",
    background: "#dc2626",
    color: "#fff",
    padding: "6px 10px",
    cursor: "pointer",
    fontSize: "12px",
  },
};

export default ModifierTextGroup;
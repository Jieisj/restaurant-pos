function TablesSection({
  tables,
  onOpenTable,
  selectedTableId,
  disabledTableIds = [],
  selectionMode = "normal",
  onCancelAssignDining,
}) {
  const disabledSet = new Set(disabledTableIds);

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Tables</h2>
          <p style={styles.subtitle}>
            {selectionMode === "assign-dining"
              ? "Select an available table to assign this order. Occupied tables are locked."
              : "Select a table to open its cart."}
          </p>
        </div>

        {selectionMode === "assign-dining" && (
          <button
            type="button"
            onClick={onCancelAssignDining}
            style={styles.cancelButton}
          >
            Cancel
          </button>
        )}
      </div>

      <div style={styles.floor}>
        {tables.map((table) => {
          const isDisabled = disabledSet.has(table.id);

          return (
            <button
              key={table.id}
              type="button"
              disabled={isDisabled}
              onClick={() => {
                if (isDisabled) return;
                onOpenTable(table.id);
              }}
              style={{
                ...styles.tableCard,
                left: table.x,
                top: table.y,
                ...(selectedTableId === table.id ? styles.selectedTable : {}),
                ...(table.status === "available" ? styles.available : {}),
                ...(table.status === "occupied" ? styles.occupied : {}),
                ...(table.status === "reserved" ? styles.reserved : {}),
                ...(isDisabled ? styles.disabledTable : {}),
              }}
              title={
                isDisabled
                  ? `${table.name} already has an active order`
                  : `Open ${table.name}`
              }
            >
              <strong>{table.name}</strong>
              <span>{table.seats} seats</span>
              <span style={styles.statusText}>{table.status}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "18px",
    padding: "20px",
  },
  header: {
    marginBottom: "20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
  },
  title: {
    margin: 0,
    fontSize: "28px",
  },
  subtitle: {
    margin: "6px 0 0",
    color: "#6b7280",
  },
  cancelButton: {
    border: "1px solid #d1d5db",
    background: "#ffffff",
    color: "#111827",
    padding: "12px 16px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
  floor: {
    position: "relative",
    minHeight: "560px",
    background: "#f9fafb",
    border: "1px dashed #d1d5db",
    borderRadius: "18px",
    overflow: "hidden",
  },
  tableCard: {
    position: "absolute",
    width: "150px",
    borderRadius: "16px",
    padding: "14px",
    border: "2px solid transparent",
    boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    alignItems: "flex-start",
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.18s ease",
  },
  selectedTable: {
    border: "2px solid #111827",
  },
  available: {
    background: "#dcfce7",
  },
  occupied: {
    background: "#fee2e2",
  },
  reserved: {
    background: "#fef3c7",
  },
  disabledTable: {
    background: "#e5e7eb",
    color: "#6b7280",
    cursor: "not-allowed",
    opacity: 0.85,
    boxShadow: "none",
    filter: "grayscale(0.3)",
  },
  statusText: {
    textTransform: "capitalize",
    fontSize: "13px",
    color: "#374151",
  },
};

export default TablesSection;
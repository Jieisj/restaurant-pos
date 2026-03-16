function TablesSection({ tables, onOpenTable, selectedTableId }) {
  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <h2 style={styles.title}>Tables</h2>
        <p style={styles.subtitle}>
          Select a table to open its cart.
        </p>
      </div>

      <div style={styles.floor}>
        {tables.map((table) => (
          <button
            key={table.id}
            type="button"
            onClick={() => onOpenTable(table.id)}
            style={{
              ...styles.tableCard,
              left: table.x,
              top: table.y,
              ...(selectedTableId === table.id ? styles.selectedTable : {}),
              ...(table.status === "available" ? styles.available : {}),
              ...(table.status === "occupied" ? styles.occupied : {}),
              ...(table.status === "reserved" ? styles.reserved : {}),
            }}
          >
            <strong>{table.name}</strong>
            <span>{table.seats} seats</span>
            <span style={styles.statusText}>{table.status}</span>
          </button>
        ))}
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
  },
  title: {
    margin: 0,
    fontSize: "28px",
  },
  subtitle: {
    margin: "6px 0 0",
    color: "#6b7280",
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
  statusText: {
    textTransform: "capitalize",
    fontSize: "13px",
    color: "#374151",
  },
};

export default TablesSection;
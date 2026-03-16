function MenuCard({
  item,
  isAdmin,
  categoryName,
  onEdit,
  onDelete,
  onAddToOrder,
}) {
  return (
    <div style={styles.card}>
      <div style={styles.topRow}>
        <div>
          <h3 style={styles.name}>{item.name}</h3>
          <p style={styles.category}>{categoryName}</p>
        </div>

        {isAdmin ? <button style={styles.iconButton}>⚙</button> : null}
      </div>

      <div style={styles.middle}>
        <p style={styles.price}>${item.price.toFixed(2)}</p>
        <span
          style={{
            ...styles.status,
            background: item.isAvailable ? "#dcfce7" : "#fee2e2",
            color: item.isAvailable ? "#166534" : "#991b1b",
          }}
        >
          {item.isAvailable ? "Available" : "Unavailable"}
        </span>
      </div>

      {isAdmin ? (
        <div style={styles.actions}>
          <button style={styles.editButton} onClick={onEdit}>
            Edit
          </button>
          <button style={styles.deleteButton} onClick={onDelete}>
            Delete
          </button>
        </div>
      ) : (
        <button
          style={styles.orderButton}
          onClick={onAddToOrder}
          disabled={!item.isAvailable}
        >
          Add to Order
        </button>
      )}
    </div>
  );
}

const styles = {
  card: {
    background: "#fff",
    borderRadius: "16px",
    padding: "16px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
  },
  topRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
  },
  name: {
    margin: 0,
    fontSize: "18px",
  },
  category: {
    margin: "6px 0 0",
    color: "#6b7280",
    fontSize: "14px",
  },
  iconButton: {
    border: "1px solid #d1d5db",
    background: "#fff",
    borderRadius: "10px",
    padding: "8px 10px",
    cursor: "pointer",
  },
  middle: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "18px",
    marginBottom: "18px",
    gap: "10px",
  },
  price: {
    margin: 0,
    fontSize: "20px",
    fontWeight: 700,
  },
  status: {
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 700,
  },
  actions: {
    display: "flex",
    gap: "10px",
  },
  editButton: {
    flex: 1,
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    background: "#fff",
    cursor: "pointer",
    fontWeight: 600,
  },
  deleteButton: {
    flex: 1,
    padding: "10px 12px",
    borderRadius: "10px",
    border: "none",
    background: "#dc2626",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 600,
  },
  orderButton: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "10px",
    border: "none",
    background: "#111827",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 600,
  },
};

export default MenuCard;
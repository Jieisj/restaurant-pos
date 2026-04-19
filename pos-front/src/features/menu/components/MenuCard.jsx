function MenuCard({
  item,
  isAdmin,
  categoryName,
  onEdit,
  onDelete,
  onAddToOrder,
  onOpenSettings,
  onOpenWaiterCustomize,
}) {
  return (
    <div style={styles.card}>
      <div style={styles.topRow}>
        <div>
          <h3 style={styles.name}>{item.name}</h3>
          <p style={styles.category}>{categoryName}</p>
        </div>

        <div style={styles.iconGroup}>
          {isAdmin ? (
            <>
              <button
                type="button"
                style={styles.iconButton}
                onClick={onEdit}
                title="Manage modifiers"
              >
                ⚙
              </button>

              <button
                type="button"
                style={styles.customizeIconButton}
                onClick={onOpenWaiterCustomize}
                title="Customize order"
              >
                ✎
              </button>
            </>
          ) : item.isAvailable ? (
            <button
              type="button"
              style={styles.customizeIconButton}
              onClick={onOpenWaiterCustomize || onOpenSettings}
              title="Customize order"
            >
              ✎
            </button>
          ) : null}
        </div>
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
          {item.isAvailable ? (
            <button
              type="button"
              style={styles.orderButton}
              onClick={onAddToOrder}
            >
              Add to Order
            </button>
          ) : null}

          <button type="button" style={styles.deleteButton} onClick={onDelete}>
            Delete
          </button>
        </div>
      ) : item.isAvailable ? (
        <div style={styles.singleActionRow}>
          <button
            type="button"
            style={styles.orderButtonFull}
            onClick={onAddToOrder}
          >
            Add to Order
          </button>
        </div>
      ) : null}
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
  iconGroup: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  name: {
    margin: 0,
    fontSize: "18px",
    color: "#111827",
  },
  category: {
    margin: "6px 0 0",
    color: "#6b7280",
    fontSize: "14px",
  },
  middle: {
    marginTop: "14px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
  },
  price: {
    margin: 0,
    fontSize: "18px",
    fontWeight: 800,
    color: "#111827",
  },
  status: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: 700,
  },
  actions: {
    marginTop: "16px",
    display: "flex",
    gap: "10px",
  },
  singleActionRow: {
    marginTop: "16px",
    display: "flex",
  },
  orderButton: {
    flex: 1,
    border: "none",
    borderRadius: "12px",
    background: "#111827",
    color: "#ffffff",
    padding: "12px 14px",
    cursor: "pointer",
    fontWeight: 700,
  },
  orderButtonFull: {
    width: "100%",
    border: "none",
    borderRadius: "12px",
    background: "#111827",
    color: "#ffffff",
    padding: "12px 14px",
    cursor: "pointer",
    fontWeight: 700,
  },
  deleteButton: {
    border: "none",
    borderRadius: "12px",
    background: "#dc2626",
    color: "#ffffff",
    padding: "12px 14px",
    cursor: "pointer",
    fontWeight: 700,
  },
  iconButton: {
    width: "34px",
    height: "34px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    background: "#ffffff",
    color: "#111827",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
  },
  customizeIconButton: {
    width: "34px",
    height: "34px",
    borderRadius: "10px",
    border: "1px solid #93c5fd",
    background: "#eff6ff",
    color: "#1d4ed8",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
  },
};

export default MenuCard;
const tickets = [
  { id: 1, order: "#1001", item: "Cheese Burger", status: "pending" },
  { id: 2, order: "#1002", item: "Chicken Burger", status: "preparing" },
  { id: 3, order: "#1003", item: "Chocolate Cake", status: "ready" },
];

function KitchenSection() {
  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <h2 style={styles.title}>Kitchen</h2>
        <p style={styles.subtitle}>Admin-only kitchen overview.</p>
      </div>

      <div style={styles.list}>
        {tickets.map((ticket) => (
          <div key={ticket.id} style={styles.ticket}>
            <div>
              <h3 style={styles.orderId}>{ticket.order}</h3>
              <p style={styles.itemName}>{ticket.item}</p>
            </div>

            <span
              style={{
                ...styles.badge,
                ...(ticket.status === "pending" ? styles.pending : {}),
                ...(ticket.status === "preparing" ? styles.preparing : {}),
                ...(ticket.status === "ready" ? styles.ready : {}),
              }}
            >
              {ticket.status}
            </span>
          </div>
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
    fontSize: "26px",
  },
  subtitle: {
    margin: "6px 0 0",
    color: "#6b7280",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  ticket: {
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    padding: "16px",
    background: "#f9fafb",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
  },
  orderId: {
    margin: 0,
    fontSize: "18px",
  },
  itemName: {
    margin: "6px 0 0",
    color: "#6b7280",
  },
  badge: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 700,
    textTransform: "capitalize",
  },
  pending: {
    background: "#fee2e2",
    color: "#991b1b",
  },
  preparing: {
    background: "#dbeafe",
    color: "#1d4ed8",
  },
  ready: {
    background: "#dcfce7",
    color: "#166534",
  },
};

export default KitchenSection;
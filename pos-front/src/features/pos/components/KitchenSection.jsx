function itemName(item) {
  return item.nameSnapshot || item.name || "Menu item";
}

function money(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function formatTime(value) {
  if (!value) return "Just sent";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Just sent";

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function minutesWaiting(value) {
  if (!value) return 0;

  const sentAt = new Date(value).getTime();
  if (Number.isNaN(sentAt)) return 0;

  return Math.max(0, Math.floor((Date.now() - sentAt) / 60000));
}

function KitchenSection({
  items,
  recentlyFinishedItems = [],
  onFinish,
  onRevertFinish,
  onRefresh,
}) {
  const sortedItems = [...items].sort((a, b) => {
    const aTime = new Date(a.sentAt || a.createdAt || 0).getTime();
    const bTime = new Date(b.sentAt || b.createdAt || 0).getTime();
    return aTime - bTime;
  });

  const totalQuantity = sortedItems.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0,
  );
  const finishedQuantity = recentlyFinishedItems.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0,
  );

  return (
    <section style={styles.section}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Kitchen</h2>
          <p style={styles.subtitle}>Preparing items sent from active orders</p>
        </div>

        <div style={styles.headerActions}>
          <div style={styles.counter}>
            <span style={styles.counterLabel}>Items</span>
            <strong style={styles.counterValue}>{totalQuantity}</strong>
          </div>

          <div style={styles.counter}>
            <span style={styles.counterLabel}>Finished</span>
            <strong style={styles.counterValue}>{finishedQuantity}</strong>
          </div>

          <button type="button" onClick={onRefresh} style={styles.refreshButton}>
            Refresh
          </button>
        </div>
      </div>

      {sortedItems.length === 0 ? (
        <div style={styles.emptyState}>
          <h3 style={styles.emptyTitle}>No items preparing</h3>
          <p style={styles.emptyText}>Sent cart items will appear here.</p>
        </div>
      ) : (
        <div style={styles.board}>
          {sortedItems.map((item) => {
            const waitMinutes = minutesWaiting(item.sentAt || item.createdAt);
            const isLate = waitMinutes >= 15;

            return (
              <article
                key={item.id}
                style={{
                  ...styles.ticket,
                  ...(isLate ? styles.lateTicket : {}),
                }}
              >
                <div style={styles.ticketTop}>
                  <span style={styles.orderPill}>Order #{item.orderId}</span>
                  <span style={isLate ? styles.latePill : styles.timePill}>
                    {waitMinutes} min
                  </span>
                </div>

                <div style={styles.ticketBody}>
                  <div>
                    <h3 style={styles.itemTitle}>{itemName(item)}</h3>
                    <p style={styles.itemMeta}>Sent {formatTime(item.sentAt)}</p>
                  </div>

                  <div style={styles.quantityBox}>
                    <span style={styles.quantityLabel}>Qty</span>
                    <strong style={styles.quantityValue}>{item.quantity}</strong>
                  </div>
                </div>

                {(item.notes || []).length > 0 && (
                  <div style={styles.notesList}>
                    {(item.notes || []).map((note) => (
                      <div key={note.id} style={styles.noteLine}>
                        <span>{note.note}</span>
                        {Number(note.price || 0) > 0 && (
                          <strong>{money(note.price)}</strong>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => onFinish(item)}
                  style={styles.finishButton}
                >
                  Mark Finished
                </button>
              </article>
            );
          })}
        </div>
      )}

      <div style={styles.finishedSection}>
        <div style={styles.finishedHeader}>
          <div>
            <h3 style={styles.finishedTitle}>Recently Finished</h3>
            <p style={styles.finishedHint}>Use revert when an item was finished by mistake.</p>
          </div>
          <span style={styles.finishedBadge}>{recentlyFinishedItems.length}</span>
        </div>

        {recentlyFinishedItems.length === 0 ? (
          <p style={styles.emptyRecent}>No finished items in this session.</p>
        ) : (
          <div style={styles.finishedBoard}>
            {recentlyFinishedItems.map((item) => (
              <article key={item.id} style={styles.finishedTicket}>
                <div>
                  <strong style={styles.finishedItemName}>{itemName(item)}</strong>
                  <p style={styles.itemMeta}>
                    Order #{item.orderId} - Qty {item.quantity}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onRevertFinish(item)}
                  style={styles.revertButton}
                >
                  Revert
                </button>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

const styles = {
  section: {
    padding: 24,
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    background: "white",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
    marginBottom: 20,
  },
  title: {
    margin: 0,
    fontSize: 28,
    fontWeight: 900,
    color: "#111827",
  },
  subtitle: {
    margin: "6px 0 0",
    color: "#6b7280",
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  counter: {
    minWidth: 78,
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    padding: "8px 10px",
    textAlign: "right",
    background: "#f9fafb",
  },
  counterLabel: {
    display: "block",
    color: "#6b7280",
    fontSize: 12,
    fontWeight: 800,
    textTransform: "uppercase",
  },
  counterValue: {
    display: "block",
    marginTop: 2,
    fontSize: 22,
    fontWeight: 900,
  },
  refreshButton: {
    border: "1px solid #d1d5db",
    background: "white",
    color: "#111827",
    borderRadius: 8,
    padding: "11px 14px",
    cursor: "pointer",
    fontWeight: 900,
  },
  emptyState: {
    minHeight: 360,
    display: "grid",
    placeItems: "center",
    textAlign: "center",
    border: "1px dashed #d1d5db",
    borderRadius: 8,
    background: "#f9fafb",
  },
  emptyTitle: {
    margin: 0,
    color: "#111827",
    fontSize: 20,
    fontWeight: 900,
  },
  emptyText: {
    margin: "6px 0 0",
    color: "#6b7280",
  },
  board: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: 14,
  },
  ticket: {
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    padding: 16,
    background: "#f9fafb",
    boxShadow: "0 8px 18px rgba(15,23,42,0.06)",
  },
  lateTicket: {
    border: "1px solid #f59e0b",
    background: "#fffbeb",
  },
  ticketTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    alignItems: "center",
    marginBottom: 16,
  },
  orderPill: {
    borderRadius: 999,
    padding: "5px 9px",
    background: "#111827",
    color: "white",
    fontSize: 12,
    fontWeight: 900,
  },
  timePill: {
    borderRadius: 999,
    padding: "5px 9px",
    background: "#dcfce7",
    color: "#166534",
    fontSize: 12,
    fontWeight: 900,
  },
  latePill: {
    borderRadius: 999,
    padding: "5px 9px",
    background: "#fef3c7",
    color: "#92400e",
    fontSize: 12,
    fontWeight: 900,
  },
  ticketBody: {
    display: "flex",
    justifyContent: "space-between",
    gap: 14,
    alignItems: "flex-start",
    marginBottom: 18,
  },
  itemTitle: {
    margin: 0,
    color: "#111827",
    fontSize: 20,
    lineHeight: 1.2,
    fontWeight: 900,
    overflowWrap: "anywhere",
  },
  itemMeta: {
    margin: "6px 0 0",
    color: "#6b7280",
    fontSize: 13,
    fontWeight: 700,
  },
  quantityBox: {
    minWidth: 58,
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    padding: "8px 10px",
    textAlign: "center",
    background: "white",
  },
  quantityLabel: {
    display: "block",
    color: "#6b7280",
    fontSize: 11,
    fontWeight: 900,
    textTransform: "uppercase",
  },
  quantityValue: {
    display: "block",
    marginTop: 2,
    fontSize: 24,
    fontWeight: 900,
  },
  notesList: {
    borderTop: "1px solid #e5e7eb",
    paddingTop: 10,
    marginBottom: 14,
    display: "grid",
    gap: 8,
  },
  noteLine: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    borderRadius: 8,
    background: "white",
    border: "1px solid #e5e7eb",
    padding: "8px 10px",
    color: "#111827",
    fontWeight: 800,
  },
  finishButton: {
    width: "100%",
    border: "none",
    background: "#16a34a",
    color: "white",
    borderRadius: 8,
    padding: "12px 14px",
    cursor: "pointer",
    fontWeight: 900,
  },
  finishedSection: {
    marginTop: 24,
    borderTop: "1px solid #e5e7eb",
    paddingTop: 18,
  },
  finishedHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 12,
  },
  finishedTitle: {
    margin: 0,
    fontSize: 18,
    fontWeight: 900,
    color: "#111827",
  },
  finishedHint: {
    margin: "4px 0 0",
    color: "#6b7280",
    fontSize: 13,
  },
  finishedBadge: {
    borderRadius: 999,
    padding: "4px 10px",
    background: "#111827",
    color: "white",
    fontSize: 12,
    fontWeight: 900,
  },
  emptyRecent: {
    margin: 0,
    color: "#6b7280",
    fontStyle: "italic",
  },
  finishedBoard: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
    gap: 10,
  },
  finishedTicket: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    border: "1px solid #d1fae5",
    borderRadius: 8,
    background: "#f0fdf4",
    padding: 12,
  },
  finishedItemName: {
    color: "#111827",
    overflowWrap: "anywhere",
  },
  revertButton: {
    border: "none",
    background: "#f59e0b",
    color: "#111827",
    borderRadius: 8,
    padding: "9px 12px",
    cursor: "pointer",
    fontWeight: 900,
  },
};

export default KitchenSection;

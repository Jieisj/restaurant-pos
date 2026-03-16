import { useMemo, useState } from "react";
import { ROLES } from "../../../constants/roles";

const initialCurrentOrder = [
  { id: 1, name: "Cheese Burger", price: 9.99, quantity: 2 },
  { id: 2, name: "Coca Cola", price: 2.5, quantity: 1 },
];

const initialPendingOrder = [
  { id: 3, name: "Chocolate Cake", price: 4.75, quantity: 1 },
];

function CartSection({ role, selectedTableId }) {
  const isCustomer = role === ROLES.CUSTOMER;

  const [currentOrder, setCurrentOrder] = useState(initialCurrentOrder);
  const [pendingOrder, setPendingOrder] = useState(initialPendingOrder);

  const addItemToPending = (item) => {
    setPendingOrder((prev) => {
      const existing = prev.find((pendingItem) => pendingItem.id === item.id);

      if (existing) {
        return prev.map((pendingItem) =>
          pendingItem.id === item.id
            ? { ...pendingItem, quantity: pendingItem.quantity + 1 }
            : pendingItem
        );
      }

      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const increasePending = (id) => {
    setPendingOrder((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreasePending = (id) => {
    setPendingOrder((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removePending = (id) => {
    setPendingOrder((prev) => prev.filter((item) => item.id !== id));
  };

  const currentTotal = useMemo(() => {
    return currentOrder.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [currentOrder]);

  const pendingTotal = useMemo(() => {
    return pendingOrder.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [pendingOrder]);

  const currentItemsCount = useMemo(() => {
    return currentOrder.reduce((sum, item) => sum + item.quantity, 0);
  }, [currentOrder]);

  const pendingItemsCount = useMemo(() => {
    return pendingOrder.reduce((sum, item) => sum + item.quantity, 0);
  }, [pendingOrder]);

  const handleSendPending = () => {
    if (pendingOrder.length === 0) return;

    alert("Pending order sent.");

    setCurrentOrder((prevCurrent) => {
      let merged = [...prevCurrent];

      pendingOrder.forEach((pendingItem) => {
        const existing = merged.find((item) => item.id === pendingItem.id);

        if (existing) {
          merged = merged.map((item) =>
            item.id === pendingItem.id
              ? { ...item, quantity: item.quantity + pendingItem.quantity }
              : item
          );
        } else {
          merged.push(pendingItem);
        }
      });

      return merged;
    });

    setPendingOrder([]);
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <h2 style={styles.title}>Cart</h2>
        <p style={styles.subtitle}>
          {selectedTableId
            ? `Managing order for Table ${selectedTableId}`
            : isCustomer
            ? "Review your current and pending order."
            : "No table selected"}
        </p>
      </div>

      <div style={styles.grid}>
        <section style={styles.panel}>
          <div style={styles.panelHeader}>
            <div>
              <h3 style={styles.panelTitle}>Current Order</h3>
              <p style={styles.panelSubtitle}>
                Sent/active items already on the order
              </p>
            </div>
          </div>

          {currentOrder.length === 0 ? (
            <div style={styles.emptyState}>No items in the current order.</div>
          ) : (
            <div style={styles.list}>
              {currentOrder.map((item) => (
                <div key={item.id} style={styles.itemCard}>
                  <div>
                    <h4 style={styles.itemName}>{item.name}</h4>
                    <p style={styles.itemMeta}>
                      ${item.price.toFixed(2)} × {item.quantity}
                    </p>
                  </div>

                  <div style={styles.itemActions}>
                    <button
                      type="button"
                      style={styles.plusButton}
                      onClick={() => addItemToPending(item)}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={styles.summaryBox}>
            <div style={styles.summaryRow}>
              <span>Total Items</span>
              <strong>{currentItemsCount}</strong>
            </div>
            <div style={styles.summaryRow}>
              <span>Total Price</span>
              <strong>${currentTotal.toFixed(2)}</strong>
            </div>
          </div>
        </section>

        <section style={styles.panel}>
          <div style={styles.panelHeader}>
            <div>
              <h3 style={styles.panelTitle}>Pending Order</h3>
              <p style={styles.panelSubtitle}>
                New items/changes waiting to be sent
              </p>
            </div>

            <button
              type="button"
              style={{
                ...styles.sendButton,
                ...(pendingOrder.length === 0 ? styles.sendButtonDisabled : {}),
              }}
              onClick={handleSendPending}
              disabled={pendingOrder.length === 0}
            >
              Send
            </button>
          </div>

          {pendingOrder.length === 0 ? (
            <div style={styles.emptyState}>No items in the pending order.</div>
          ) : (
            <div style={styles.list}>
              {pendingOrder.map((item) => (
                <div key={item.id} style={styles.itemCard}>
                  <div>
                    <h4 style={styles.itemName}>{item.name}</h4>
                    <p style={styles.itemMeta}>
                      ${item.price.toFixed(2)} × {item.quantity}
                    </p>
                  </div>

                  <div style={styles.itemActions}>
                    <button
                      type="button"
                      style={styles.smallButton}
                      onClick={() => decreasePending(item.id)}
                    >
                      -
                    </button>

                    <span style={styles.qtyText}>{item.quantity}</span>

                    <button
                      type="button"
                      style={styles.plusButton}
                      onClick={() => increasePending(item.id)}
                    >
                      +
                    </button>

                    <button
                      type="button"
                      style={styles.removeButton}
                      onClick={() => removePending(item.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={styles.summaryBox}>
            <div style={styles.summaryRow}>
              <span>Total Items</span>
              <strong>{pendingItemsCount}</strong>
            </div>
            <div style={styles.summaryRow}>
              <span>Total Price</span>
              <strong>${pendingTotal.toFixed(2)}</strong>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  header: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "18px",
    padding: "20px",
  },
  title: {
    margin: 0,
    fontSize: "28px",
  },
  subtitle: {
    margin: "6px 0 0",
    color: "#6b7280",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
  },
  panel: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "18px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    minHeight: "500px",
  },
  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
    marginBottom: "20px",
  },
  panelTitle: {
    margin: 0,
    fontSize: "24px",
  },
  panelSubtitle: {
    margin: "6px 0 0",
    color: "#6b7280",
    fontSize: "14px",
  },
  emptyState: {
    border: "1px dashed #d1d5db",
    borderRadius: "14px",
    padding: "20px",
    color: "#6b7280",
    textAlign: "center",
    marginBottom: "20px",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  itemCard: {
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    padding: "14px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "14px",
    flexWrap: "wrap",
    background: "#f9fafb",
  },
  itemName: {
    margin: 0,
    fontSize: "16px",
  },
  itemMeta: {
    margin: "6px 0 0",
    color: "#6b7280",
  },
  itemActions: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
  },
  qtyText: {
    minWidth: "20px",
    textAlign: "center",
    fontWeight: 700,
  },
  smallButton: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    background: "#ffffff",
    cursor: "pointer",
    fontWeight: 700,
  },
  plusButton: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    border: "none",
    background: "#111827",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "18px",
    lineHeight: 1,
  },
  removeButton: {
    border: "none",
    background: "#dc2626",
    color: "#ffffff",
    padding: "8px 12px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: 600,
  },
  summaryBox: {
    marginTop: "auto",
    paddingTop: "20px",
    borderTop: "1px solid #e5e7eb",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "16px",
  },
  sendButton: {
    border: "none",
    borderRadius: "10px",
    background: "#111827",
    color: "#ffffff",
    padding: "10px 16px",
    cursor: "pointer",
    fontWeight: 700,
  },
  sendButtonDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
};

export default CartSection;
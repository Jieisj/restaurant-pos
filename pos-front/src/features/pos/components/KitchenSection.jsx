import { useEffect, useMemo, useState } from "react";

const STATUS_FILTERS = ["preparing", "finished"];

function formatDate(value) {
  if (!value) return "";
  return value;
}

function getKitchenEligibleDishes(order) {
  return (order?.dishes || []).filter((dish) => !dish.isPending);
}

function getOrderKitchenStatus(order) {
  const kitchenDishes = getKitchenEligibleDishes(order);

  if (kitchenDishes.length === 0) return null;

  const allFinished = kitchenDishes.every((dish) => Boolean(dish.kitchenFinished));
  return allFinished ? "finished" : "preparing";
}

function getKitchenOrdersForDate(orders = [], selectedDate) {
  return orders.filter((order) => {
    if (!order?.orderNumber) return false;
    if (selectedDate && order.date !== selectedDate) return false;
    return getKitchenEligibleDishes(order).length > 0;
  });
}

function KitchenSection({ orders = [], onToggleDishFinished }) {
  const today = new Date().toISOString().slice(0, 10);

  const [selectedDate, setSelectedDate] = useState(today);
  const [statusFilter, setStatusFilter] = useState("preparing");
  const [showTimes, setShowTimes] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const kitchenOrders = useMemo(() => {
    return getKitchenOrdersForDate(orders, selectedDate);
  }, [orders, selectedDate]);

  const filteredOrders = useMemo(() => {
    return kitchenOrders.filter(
      (order) => getOrderKitchenStatus(order) === statusFilter
    );
  }, [kitchenOrders, statusFilter]);

  const selectedOrder = useMemo(() => {
    if (!selectedOrderId) return filteredOrders[0] || kitchenOrders[0] || null;

    return (
      kitchenOrders.find((order) => order.id === selectedOrderId) ||
      filteredOrders[0] ||
      kitchenOrders[0] ||
      null
    );
  }, [selectedOrderId, filteredOrders, kitchenOrders]);

  useEffect(() => {
    if (!selectedOrder && selectedOrderId !== null) {
      setSelectedOrderId(null);
      return;
    }

    if (!selectedOrderId && selectedOrder) {
      setSelectedOrderId(selectedOrder.id);
    }
  }, [selectedOrder, selectedOrderId]);

  const selectedOrderDishes = useMemo(() => {
    return getKitchenEligibleDishes(selectedOrder);
  }, [selectedOrder]);

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <h2 style={styles.title}>Kitchen</h2>
        <p style={styles.subtitle}>
          Track preparing and finished dishes by order number.
        </p>
      </div>

      <div style={styles.filterBar}>
        <div style={styles.filterGroup}>
          <span style={styles.label}>Date</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setSelectedOrderId(null);
            }}
            style={styles.input}
          />
        </div>

        <div style={styles.filterGroup}>
          <span style={styles.label}>Status</span>
          <div style={styles.buttonGroup}>
            {STATUS_FILTERS.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => {
                  setStatusFilter(status);
                  setSelectedOrderId(null);
                }}
                style={{
                  ...styles.filterButton,
                  ...(statusFilter === status ? styles.activeButton : {}),
                }}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div style={styles.filterGroup}>
          <span style={styles.label}>Time</span>
          <button
            type="button"
            onClick={() => setShowTimes((prev) => !prev)}
            style={{
              ...styles.filterButton,
              ...(showTimes ? styles.activeButton : {}),
            }}
          >
            {showTimes ? "Hide Time" : "Show Time"}
          </button>
        </div>
      </div>

      <div style={styles.contentGrid}>
        <section style={styles.ordersPanel}>
          <div style={styles.panelHeader}>
            <h3 style={styles.panelTitle}>Orders</h3>
            <span style={styles.panelMeta}>
              {filteredOrders.length} {filteredOrders.length === 1 ? "order" : "orders"}
            </span>
          </div>

          {filteredOrders.length === 0 ? (
            <div style={styles.emptyState}>
              No {statusFilter} orders for {formatDate(selectedDate)}.
            </div>
          ) : (
            <div style={styles.ordersList}>
              {filteredOrders.map((order) => {
                const kitchenStatus = getOrderKitchenStatus(order);
                const orderDishes = getKitchenEligibleDishes(order);
                const finishedCount = orderDishes.filter((dish) => dish.kitchenFinished).length;
                const preparingCount = orderDishes.length - finishedCount;
                const isActive = selectedOrder?.id === order.id;

                return (
                  <button
                    key={order.id}
                    type="button"
                    onClick={() => setSelectedOrderId(order.id)}
                    style={{
                      ...styles.orderCard,
                      ...(isActive ? styles.orderCardActive : {}),
                    }}
                  >
                    <div style={styles.orderCardTop}>
                      <strong style={styles.orderNumber}>{order.orderNumber}</strong>
                      <span
                        style={{
                          ...styles.badge,
                          ...(kitchenStatus === "preparing"
                            ? styles.badgePreparing
                            : styles.badgeFinished),
                        }}
                      >
                        {kitchenStatus}
                      </span>
                    </div>

                    <div style={styles.orderCardMeta}>
                      <span>{order.tableName || order.customerName || order.type}</span>
                      <span>{order.date}</span>
                    </div>

                    <div style={styles.orderCardCounts}>
                      <span>Preparing: {preparingCount}</span>
                      <span>Finished: {finishedCount}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <section style={styles.detailsPanel}>
          <div style={styles.panelHeader}>
            <div>
              <h3 style={styles.panelTitle}>
                {selectedOrder ? `Order ${selectedOrder.orderNumber}` : "Dishes"}
              </h3>
              <p style={styles.panelSubtitle}>
                {selectedOrder
                  ? "Check a dish when it is finished."
                  : "Select an order to see its dishes."}
              </p>
            </div>
          </div>

          {!selectedOrder ? (
            <div style={styles.emptyState}>No order selected.</div>
          ) : selectedOrderDishes.length === 0 ? (
            <div style={styles.emptyState}>This order has no sent dishes yet.</div>
          ) : (
            <div style={styles.dishesSection}>
              <div style={styles.dishesBlock}>
                <h4 style={styles.blockTitle}>Preparing</h4>
                <div style={styles.dishesList}>
                  {selectedOrderDishes.filter((dish) => !dish.kitchenFinished).length === 0 ? (
                    <div style={styles.emptyMini}>No preparing dishes.</div>
                  ) : (
                    selectedOrderDishes
                      .filter((dish) => !dish.kitchenFinished)
                      .map((dish) => (
                        <button
                          key={dish.id}
                          type="button"
                          onClick={() => onToggleDishFinished?.(selectedOrder.id, dish.id)}
                          style={styles.dishRow}
                        >
                          <span style={styles.checkCircle}>✓</span>
                          <div style={styles.dishInfo}>
                            <strong>{dish.name}</strong>
                            <span>
                              Qty {dish.quantity || 0}
                              {dish.comment ? ` • ${dish.comment}` : ""}
                            </span>
                            {showTimes && dish.sentTime ? (
                              <span style={styles.timeText}>Sent to kitchen: {dish.sentTime}</span>
                            ) : null}
                          </div>
                        </button>
                      ))
                  )}
                </div>
              </div>

              <div style={styles.dishesBlock}>
                <h4 style={styles.blockTitle}>Finished</h4>
                <div style={styles.dishesList}>
                  {selectedOrderDishes.filter((dish) => dish.kitchenFinished).length === 0 ? (
                    <div style={styles.emptyMini}>No finished dishes.</div>
                  ) : (
                    selectedOrderDishes
                      .filter((dish) => dish.kitchenFinished)
                      .map((dish) => (
                        <button
                          key={dish.id}
                          type="button"
                          onClick={() => onToggleDishFinished?.(selectedOrder.id, dish.id)}
                          style={{
                            ...styles.dishRow,
                            ...styles.dishRowFinished,
                          }}
                        >
                          <span style={{ ...styles.checkCircle, ...styles.checkCircleFilled }}>
                            ✓
                          </span>
                          <div style={styles.dishInfo}>
                            <strong>{dish.name}</strong>
                            <span>
                              Qty {dish.quantity || 0}
                              {dish.comment ? ` • ${dish.comment}` : ""}
                            </span>
                            {showTimes && dish.sentTime ? (
                              <span style={styles.timeText}>Sent to kitchen: {dish.sentTime}</span>
                            ) : null}
                          </div>
                        </button>
                      ))
                  )}
                </div>
              </div>
            </div>
          )}
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
    background: "#fff",
    padding: "20px",
    borderRadius: "16px",
    border: "1px solid #e5e7eb",
  },
  title: {
    margin: 0,
    fontSize: "28px",
  },
  subtitle: {
    margin: "6px 0 0",
    color: "#6b7280",
  },
  filterBar: {
    background: "#fff",
    padding: "16px",
    borderRadius: "16px",
    border: "1px solid #e5e7eb",
    display: "flex",
    flexWrap: "wrap",
    gap: "16px",
  },
  filterGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "13px",
    fontWeight: 600,
  },
  input: {
    padding: "14px 16px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    background: "#fff",
    minHeight: "48px",
    boxSizing: "border-box",
    fontSize: "15px",
  },
  buttonGroup: {
    display: "flex",
    gap: "6px",
    flexWrap: "wrap",
  },
  filterButton: {
    padding: "9px 15px",
    borderRadius: "999px",
    border: "1px solid #bfdbfe",
    background: "linear-gradient(135deg, #ffffff, #eff6ff)",
    color: "#1f2937",
    cursor: "pointer",
    textTransform: "capitalize",
    fontWeight: 800,
    boxShadow: "0 6px 14px rgba(148, 163, 184, 0.12)",
    transition: "all 0.2s ease",
  },
  activeButton: {
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "#fff",
    border: "1px solid #1d4ed8",
    boxShadow: "0 10px 22px rgba(37, 99, 235, 0.24)",
  },
  contentGrid: {
    display: "grid",
    gridTemplateColumns: "380px minmax(0, 1fr)",
    gap: "20px",
    alignItems: "start",
  },
  ordersPanel: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "16px",
    padding: "18px",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  detailsPanel: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "16px",
    padding: "18px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    minHeight: "520px",
  },
  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
  },
  panelTitle: {
    margin: 0,
    fontSize: "20px",
  },
  panelMeta: {
    color: "#6b7280",
    fontWeight: 600,
    fontSize: "13px",
  },
  panelSubtitle: {
    margin: "6px 0 0",
    color: "#6b7280",
    fontSize: "14px",
  },
  ordersList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    maxHeight: "560px",
    overflowY: "auto",
  },
  orderCard: {
    border: "1px solid #e5e7eb",
    background: "#f9fafb",
    borderRadius: "14px",
    padding: "14px",
    cursor: "pointer",
    textAlign: "left",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  orderCardActive: {
    border: "1px solid #111827",
    background: "#eef2ff",
  },
  orderCardTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "center",
  },
  orderNumber: {
    fontSize: "22px",
    color: "#111827",
  },
  orderCardMeta: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    color: "#6b7280",
    fontSize: "14px",
  },
  orderCardCounts: {
    display: "flex",
    gap: "16px",
    color: "#374151",
    fontSize: "14px",
    fontWeight: 600,
  },
  badge: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 700,
    textTransform: "capitalize",
  },
  badgePreparing: {
    background: "#dbeafe",
    color: "#1d4ed8",
  },
  badgeFinished: {
    background: "#dcfce7",
    color: "#166534",
  },
  emptyState: {
    border: "1px dashed #d1d5db",
    borderRadius: "14px",
    padding: "24px",
    color: "#6b7280",
    background: "#f9fafb",
  },
  dishesSection: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
    minWidth: 0,
  },
  dishesBlock: {
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    padding: "14px",
    background: "#fafafa",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    minHeight: "420px",
  },
  blockTitle: {
    margin: 0,
    fontSize: "18px",
  },
  dishesList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    maxHeight: "420px",
    overflowY: "auto",
    paddingRight: "6px",
  },
  dishRow: {
    width: "100%",
    border: "1px solid #d1d5db",
    background: "#fff",
    borderRadius: "12px",
    padding: "12px 14px",
    cursor: "pointer",
    textAlign: "left",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  dishRowFinished: {
    background: "#f0fdf4",
    borderColor: "#86efac",
  },
  checkCircle: {
    width: "26px",
    height: "26px",
    borderRadius: "999px",
    border: "2px solid #9ca3af",
    color: "#ffffff",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    flexShrink: 0,
    background: "#ffffff",
  },
  checkCircleFilled: {
    borderColor: "#16a34a",
    background: "#16a34a",
  },
  dishInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    color: "#374151",
  },
  timeText: {
    color: "#2563eb",
    fontSize: "12px",
    fontWeight: 700,
  },
  emptyMini: {
    border: "1px dashed #d1d5db",
    borderRadius: "12px",
    padding: "16px",
    color: "#6b7280",
    background: "#fff",
  },
};

export default KitchenSection;

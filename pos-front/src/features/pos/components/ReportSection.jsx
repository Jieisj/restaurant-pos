import { useEffect, useMemo, useState } from "react";
import { getOrders } from "../../../api/orderApi";

function money(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function inputDateValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function today() {
  return inputDateValue(new Date());
}

function addDays(dateString, days) {
  const date = new Date(`${dateString}T00:00:00`);
  date.setDate(date.getDate() + days);
  return inputDateValue(date);
}

function parseDate(value) {
  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function orderDateValue(order) {
  return parseDate(order.createdAt)?.getTime() || 0;
}

function formatDateTime(value) {
  const date = parseDate(value);
  if (!date) return "Not recorded";

  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function itemName(item) {
  return item.nameSnapshot || item.name || "Menu item";
}

function itemPrice(item) {
  return Number(item.priceSnapshot ?? item.price ?? 0);
}

function noteTotal(item) {
  return (item.notes || []).reduce(
    (sum, note) => sum + Number(note.price || 0),
    0,
  );
}

function itemTotal(item) {
  return (itemPrice(item) + noteTotal(item)) * Number(item.quantity || 0);
}

function matchesDateRange(order, startDate, endDate) {
  const createdAt = parseDate(order.createdAt);
  if (!createdAt) return false;

  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${addDays(endDate, 1)}T00:00:00`);

  return createdAt >= start && createdAt < end;
}

function applyFilters(orders, filters) {
  return orders.filter((order) => {
    if (!matchesDateRange(order, filters.startDate, filters.endDate)) {
      return false;
    }

    if (filters.status !== "ALL" && order.orderStatus !== filters.status) {
      return false;
    }

    if (filters.type !== "ALL" && order.orderType !== filters.type) {
      return false;
    }

    return true;
  });
}

function summarizeOrders(orders) {
  const initial = {
    orders: 0,
    items: 0,
    grossSales: 0,
    paidSales: 0,
    unpaidBalance: 0,
    subtotal: 0,
    tax: 0,
    tips: 0,
    completed: 0,
    serving: 0,
    cancelled: 0,
    paid: 0,
    unpaid: 0,
    dining: 0,
    toGo: 0,
    delivery: 0,
    cash: 0,
    card: 0,
    split: 0,
    otherPayment: 0,
    topItems: {},
  };

  const report = orders.reduce((acc, order) => {
    const total = Number(order.total || 0);
    const subtotal = Number(order.subtotal || 0);
    const tax = Number(order.tax || 0);
    const tips = Number(order.tips || 0);
    const orderItems = order.cartItems || [];

    acc.orders += 1;
    acc.grossSales += total;
    acc.subtotal += subtotal;
    acc.tax += tax;
    acc.tips += tips;

    if (order.paymentStatus === "PAID") {
      acc.paid += 1;
      acc.paidSales += total;
    } else {
      acc.unpaid += 1;
      acc.unpaidBalance += total;
    }

    if (order.orderStatus === "COMPLETED") acc.completed += 1;
    if (order.orderStatus === "SERVING") acc.serving += 1;
    if (order.orderStatus === "CANCELLED") acc.cancelled += 1;

    if (order.orderType === "DINING") acc.dining += total;
    if (order.orderType === "TO_GO") acc.toGo += total;
    if (order.orderType === "DELIVERY") acc.delivery += total;

    if (order.transactionMethod === "CASH") acc.cash += total;
    else if (order.transactionMethod === "CARD") acc.card += total;
    else if (order.transactionMethod === "SPLIT") acc.split += total;
    else acc.otherPayment += total;

    orderItems.forEach((item) => {
      const quantity = Number(item.quantity || 0);
      const name = itemName(item);

      acc.items += quantity;

      if (!acc.topItems[name]) {
        acc.topItems[name] = {
          name,
          quantity: 0,
          revenue: 0,
        };
      }

      acc.topItems[name].quantity += quantity;
      acc.topItems[name].revenue += itemTotal(item);
    });

    return acc;
  }, initial);

  return {
    ...report,
    averageOrder: report.orders > 0 ? report.grossSales / report.orders : 0,
    topItems: Object.values(report.topItems)
      .sort((a, b) => b.revenue - a.revenue || b.quantity - a.quantity)
      .slice(0, 8),
  };
}

function ReportSection({ onNotify, refreshKey = 0 }) {
  const currentDate = today();
  const [startDate, setStartDate] = useState(currentDate);
  const [endDate, setEndDate] = useState(currentDate);
  const [status, setStatus] = useState("ALL");
  const [type, setType] = useState("ALL");
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const filters = useMemo(
    () => {
      const safeStartDate = startDate || currentDate;
      const safeEndDate = endDate || safeStartDate;

      return {
        startDate: safeStartDate,
        endDate: safeEndDate < safeStartDate ? safeStartDate : safeEndDate,
        status,
        type,
      };
    },
    [currentDate, endDate, startDate, status, type],
  );

  const filteredOrders = useMemo(
    () => applyFilters(orders, filters),
    [filters, orders],
  );

  const report = useMemo(
    () => summarizeOrders(filteredOrders),
    [filteredOrders],
  );

  const recentOrders = useMemo(
    () =>
      [...filteredOrders]
        .sort((a, b) => orderDateValue(b) - orderDateValue(a))
        .slice(0, 8),
    [filteredOrders],
  );

  const maxOrderTypeSales = Math.max(
    report.dining,
    report.toGo,
    report.delivery,
    1,
  );
  const maxPaymentSales = Math.max(
    report.cash,
    report.card,
    report.split,
    report.otherPayment,
    1,
  );

  async function loadReport() {
    setIsLoading(true);
    setError("");

    try {
      setOrders(await getOrders());
    } catch (err) {
      console.error("load report failed:", err);
      setError("Failed to load report");
      onNotify?.("Failed to load report", "error");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  return (
    <section style={styles.section} data-testid="admin-report-section">
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Report</h2>
          <p style={styles.subtitle}>Sales, payments, order mix, and top items</p>
        </div>

        <button type="button" onClick={loadReport} style={styles.refreshButton}>
          {isLoading ? "Loading..." : "Refresh"}
        </button>
      </div>

      <div style={styles.filters}>
        <label style={styles.field}>
          <span style={styles.label}>Start Date</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            onInput={(e) => setStartDate(e.currentTarget.value)}
            style={styles.input}
          />
        </label>

        <label style={styles.field}>
          <span style={styles.label}>End Date</span>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setEndDate(e.target.value)}
            onInput={(e) => setEndDate(e.currentTarget.value)}
            style={styles.input}
          />
        </label>

        <label style={styles.field}>
          <span style={styles.label}>Status</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={styles.input}
          >
            <option value="ALL">All</option>
            <option value="SERVING">Serving</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </label>

        <label style={styles.field}>
          <span style={styles.label}>Type</span>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            style={styles.input}
          >
            <option value="ALL">All</option>
            <option value="DINING">Dining</option>
            <option value="TO_GO">To Go</option>
            <option value="DELIVERY">Delivery</option>
          </select>
        </label>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.statGrid}>
        <div style={styles.stat}>
          <span style={styles.statLabel}>Gross Sales</span>
          <strong style={styles.statValue}>{money(report.grossSales)}</strong>
        </div>
        <div style={styles.stat}>
          <span style={styles.statLabel}>Paid Sales</span>
          <strong style={styles.statValue}>{money(report.paidSales)}</strong>
        </div>
        <div style={styles.stat}>
          <span style={styles.statLabel}>Open Balance</span>
          <strong style={styles.statValue}>{money(report.unpaidBalance)}</strong>
        </div>
        <div style={styles.stat}>
          <span style={styles.statLabel}>Average Order</span>
          <strong style={styles.statValue}>{money(report.averageOrder)}</strong>
        </div>
      </div>

      <div style={styles.statGrid}>
        <div style={styles.stat}>
          <span style={styles.statLabel}>Orders</span>
          <strong style={styles.statValue}>{report.orders}</strong>
        </div>
        <div style={styles.stat}>
          <span style={styles.statLabel}>Items</span>
          <strong style={styles.statValue}>{report.items}</strong>
        </div>
        <div style={styles.stat}>
          <span style={styles.statLabel}>Tax</span>
          <strong style={styles.statValue}>{money(report.tax)}</strong>
        </div>
        <div style={styles.stat}>
          <span style={styles.statLabel}>Tips</span>
          <strong style={styles.statValue}>{money(report.tips)}</strong>
        </div>
      </div>

      <div style={styles.contentGrid}>
        <section style={styles.panel}>
          <h3 style={styles.panelTitle}>Order Status</h3>
          <div style={styles.line}>
            <span>Serving</span>
            <strong>{report.serving}</strong>
          </div>
          <div style={styles.line}>
            <span>Completed</span>
            <strong>{report.completed}</strong>
          </div>
          <div style={styles.line}>
            <span>Cancelled</span>
            <strong>{report.cancelled}</strong>
          </div>
          <div style={styles.totalLine}>
            <span>Paid / Unpaid</span>
            <strong>
              {report.paid} / {report.unpaid}
            </strong>
          </div>
        </section>

        <section style={styles.panel}>
          <h3 style={styles.panelTitle}>Order Type</h3>
          {[
            ["Dining", report.dining],
            ["To Go", report.toGo],
            ["Delivery", report.delivery],
          ].map(([label, value]) => (
            <div key={label} style={styles.barRow}>
              <div style={styles.barHeader}>
                <span>{label}</span>
                <strong>{money(value)}</strong>
              </div>
              <div style={styles.barTrack}>
                <div
                  style={{
                    ...styles.barFill,
                    width: `${Math.round((value / maxOrderTypeSales) * 100)}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </section>

        <section style={styles.panel}>
          <h3 style={styles.panelTitle}>Payment</h3>
          {[
            ["Cash", report.cash],
            ["Card", report.card],
            ["Split", report.split],
            ["None", report.otherPayment],
          ].map(([label, value]) => (
            <div key={label} style={styles.barRow}>
              <div style={styles.barHeader}>
                <span>{label}</span>
                <strong>{money(value)}</strong>
              </div>
              <div style={styles.barTrack}>
                <div
                  style={{
                    ...styles.barFill,
                    width: `${Math.round((value / maxPaymentSales) * 100)}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </section>
      </div>

      <div style={styles.bottomGrid}>
        <section style={styles.panel}>
          <div style={styles.panelHeader}>
            <h3 style={styles.panelTitle}>Top Items</h3>
            <span style={styles.countPill}>{report.topItems.length}</span>
          </div>

          {report.topItems.length === 0 ? (
            <p style={styles.empty}>No items in this range.</p>
          ) : (
            <div style={styles.list}>
              {report.topItems.map((item) => (
                <div key={item.name} style={styles.listRow}>
                  <div>
                    <strong>{item.name}</strong>
                    <span style={styles.listMeta}>Qty {item.quantity}</span>
                  </div>
                  <strong>{money(item.revenue)}</strong>
                </div>
              ))}
            </div>
          )}
        </section>

        <section style={styles.panel}>
          <div style={styles.panelHeader}>
            <h3 style={styles.panelTitle}>Recent Orders</h3>
            <span style={styles.countPill}>{recentOrders.length}</span>
          </div>

          {recentOrders.length === 0 ? (
            <p style={styles.empty}>No orders in this range.</p>
          ) : (
            <div style={styles.orderList}>
              {recentOrders.map((order) => (
                <div key={order.id} style={styles.orderRow}>
                  <div>
                    <strong>Order #{order.id}</strong>
                    <span style={styles.listMeta}>
                      {order.orderType} - {formatDateTime(order.createdAt)}
                    </span>
                  </div>
                  <div style={styles.orderRight}>
                    <span
                      style={{
                        ...styles.statusPill,
                        ...(order.orderStatus === "COMPLETED"
                          ? styles.completedPill
                          : order.orderStatus === "CANCELLED"
                            ? styles.cancelledPill
                            : styles.servingPill),
                      }}
                    >
                      {order.orderStatus}
                    </span>
                    <strong>{money(order.total)}</strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
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
    marginBottom: 18,
    flexWrap: "wrap",
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
  refreshButton: {
    border: "1px solid #d1d5db",
    background: "white",
    color: "#111827",
    borderRadius: 8,
    padding: "11px 14px",
    cursor: "pointer",
    fontWeight: 900,
  },
  filters: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
    gap: 12,
    marginBottom: 16,
  },
  field: {
    display: "grid",
    gap: 6,
  },
  label: {
    color: "#374151",
    fontSize: 12,
    fontWeight: 900,
    textTransform: "uppercase",
  },
  input: {
    border: "1px solid #d1d5db",
    borderRadius: 8,
    padding: "10px 12px",
    fontWeight: 800,
    background: "white",
    color: "#111827",
  },
  error: {
    marginBottom: 16,
    borderRadius: 8,
    background: "#fee2e2",
    color: "#991b1b",
    padding: "10px 12px",
    fontWeight: 800,
  },
  statGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: 12,
    marginBottom: 12,
  },
  stat: {
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    background: "#f9fafb",
    padding: 14,
  },
  statLabel: {
    display: "block",
    color: "#6b7280",
    fontSize: 12,
    fontWeight: 900,
    textTransform: "uppercase",
  },
  statValue: {
    display: "block",
    marginTop: 6,
    color: "#111827",
    fontSize: 24,
    fontWeight: 900,
  },
  contentGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
    gap: 14,
    marginTop: 16,
  },
  bottomGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 360px), 1fr))",
    gap: 14,
    marginTop: 14,
  },
  panel: {
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    background: "white",
    padding: 16,
  },
  panelHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
  },
  panelTitle: {
    margin: 0,
    color: "#111827",
    fontSize: 18,
    fontWeight: 900,
  },
  countPill: {
    background: "#111827",
    color: "white",
    borderRadius: 999,
    padding: "4px 10px",
    fontSize: 12,
    fontWeight: 800,
  },
  line: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 10,
    color: "#374151",
  },
  totalLine: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    borderTop: "1px solid #e5e7eb",
    paddingTop: 12,
    marginTop: 12,
    color: "#111827",
    fontSize: 18,
    fontWeight: 900,
  },
  barRow: {
    display: "grid",
    gap: 8,
    marginBottom: 14,
  },
  barHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    color: "#374151",
  },
  barTrack: {
    height: 10,
    borderRadius: 999,
    background: "#e5e7eb",
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 999,
    background: "#2563eb",
  },
  empty: {
    color: "#6b7280",
    fontStyle: "italic",
    margin: 0,
  },
  list: {
    display: "grid",
    gap: 10,
  },
  listRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    padding: "10px 12px",
    background: "#f9fafb",
  },
  listMeta: {
    display: "block",
    marginTop: 4,
    color: "#6b7280",
    fontSize: 12,
    fontWeight: 700,
  },
  orderList: {
    display: "grid",
    gap: 10,
    maxHeight: 360,
    overflowY: "auto",
    paddingRight: 4,
  },
  orderRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    padding: "10px 12px",
    background: "#f9fafb",
  },
  orderRight: {
    display: "grid",
    justifyItems: "end",
    gap: 6,
  },
  statusPill: {
    borderRadius: 999,
    padding: "4px 8px",
    fontSize: 11,
    fontWeight: 900,
  },
  servingPill: {
    background: "#fef3c7",
    color: "#92400e",
  },
  completedPill: {
    background: "#dcfce7",
    color: "#166534",
  },
  cancelledPill: {
    background: "#fee2e2",
    color: "#991b1b",
  },
};

export default ReportSection;

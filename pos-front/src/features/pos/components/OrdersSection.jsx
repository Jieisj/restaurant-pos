import { useEffect, useMemo, useState } from "react";
import {
  addCartItemNote,
  deleteCartItem,
  deleteCartItemNote,
  sendCartItem,
  updateCartItem,
  updateCartItemNote,
} from "../../../api/cartApi";
import {
  deleteOrder,
  getOrderById,
  getOrders,
  moveOrderToTable,
  updateOrder,
  updateOrderCustomer,
} from "../../../api/orderApi";
import { getAllTables } from "../../../api/tableApi";

function money(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function isValidMoneyInput(value) {
  return /^\d*(\.\d{0,2})?$/.test(value);
}

function formatDateTime(value) {
  if (!value) return "Not recorded";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not recorded";

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

function itemStatus(item) {
  if (Number(item.isFinished) === 1) return "Finished";
  if (Number(item.isPending) === 1) return "Pending";
  return "Preparing";
}

function buildParams({ date, status, type }) {
  const params = new URLSearchParams();

  if (date) params.set("date", date);
  if (status !== "ALL") params.set("status", status);
  if (type !== "ALL") params.set("type", type);

  const query = params.toString();
  return query ? `?${query}` : "";
}

function buildItemDrafts(order) {
  const drafts = {};

  (order?.cartItems || []).forEach((item) => {
    drafts[item.id] = {
      priceSnapshot: String(itemPrice(item).toFixed(2)),
      newNote: "",
      newNotePrice: "0.00",
      notes: (item.notes || []).map((note) => ({
        id: note.id,
        note: note.note || "",
        price: String(Number(note.price || 0).toFixed(2)),
      })),
    };
  });

  return drafts;
}

function OrdersSection({ onOrderUpdated, onNotify, refreshKey = 0 }) {
  const [orders, setOrders] = useState([]);
  const [tables, setTables] = useState([]);
  const [date, setDate] = useState("");
  const [status, setStatus] = useState("SERVING");
  const [type, setType] = useState("ALL");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingOrder, setEditingOrder] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [deleteOrderConfirmStep, setDeleteOrderConfirmStep] = useState(0);
  const [itemSearch, setItemSearch] = useState("");
  const [selectedItemIds, setSelectedItemIds] = useState([]);
  const [modalMessage, setModalMessage] = useState("");
  const [isModalWide, setIsModalWide] = useState(() =>
    typeof window === "undefined" ? true : window.innerWidth >= 1000,
  );
  const [orderTypeDraft, setOrderTypeDraft] = useState("DINING");
  const [tableIdDraft, setTableIdDraft] = useState("");
  const [customerForm, setCustomerForm] = useState({
    name: "",
    phoneNumber: "",
    address: "",
    note: "",
  });
  const [itemDrafts, setItemDrafts] = useState({});

  function notify(message, type) {
    onNotify?.(message, type);
  }

  const totals = useMemo(() => {
    return orders.reduce(
      (acc, order) => {
        acc.count += 1;
        acc.sales += Number(order.total || 0);
        if (order.orderStatus === "SERVING") acc.open += 1;
        if (order.paymentStatus === "PAID") acc.paid += 1;
        return acc;
      },
      { count: 0, sales: 0, open: 0, paid: 0 },
    );
  }, [orders]);

  const filteredModalItems = useMemo(() => {
    const items = editingOrder?.cartItems || [];
    const query = itemSearch.trim().toLowerCase();

    if (!query) return items;

    return items.filter((item) => {
      const notesText = (item.notes || [])
        .map((note) => `${note.note || ""} ${note.price || ""}`)
        .join(" ");
      const searchable = [
        itemName(item),
        itemStatus(item),
        item.quantity,
        itemPrice(item).toFixed(2),
        notesText,
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(query);
    });
  }, [editingOrder, itemSearch]);

  const visibleItemIds = useMemo(
    () => filteredModalItems.map((item) => item.id),
    [filteredModalItems],
  );
  const selectedVisibleCount = visibleItemIds.filter((id) =>
    selectedItemIds.includes(id),
  ).length;
  const allVisibleItemsSelected =
    visibleItemIds.length > 0 && selectedVisibleCount === visibleItemIds.length;

  const availableTables = useMemo(() => {
    const selectableTables = tables.filter((table) => {
      if (Number(table.id) === Number(editingOrder?.table?.id)) return true;
      return table.tableStatus === "AVAILABLE";
    });

    if (
      editingOrder?.table?.id &&
      !selectableTables.some((table) => Number(table.id) === Number(editingOrder.table.id))
    ) {
      return [editingOrder.table, ...selectableTables];
    }

    return selectableTables;
  }, [editingOrder?.table, tables]);

  async function loadOrders() {
    setIsLoading(true);
    setError("");

    try {
      const [data, tableData] = await Promise.all([
        getOrders(buildParams({ date, status, type })),
        getAllTables(),
      ]);
      setOrders(data);
      setTables(tableData);
    } catch (err) {
      console.error("load orders failed:", err);
      setError("Failed to load orders");
      notify("Failed to load orders", "error");
    } finally {
      setIsLoading(false);
    }
  }

  async function openOrderModal(order) {
    try {
      const freshOrder = await getOrderById(order.id);
      const modalCustomer = freshOrder.customer || {};

      setEditingOrder(freshOrder);
      setOrderTypeDraft(freshOrder.orderType || "DINING");
      setTableIdDraft(freshOrder.table?.id ? String(freshOrder.table.id) : "");
      setItemSearch("");
      setSelectedItemIds([]);
      setModalMessage("");
      setCustomerForm({
        name: modalCustomer.name || "",
        phoneNumber: modalCustomer.phoneNumber || "",
        address: modalCustomer.address || "",
        note: modalCustomer.note || "",
      });
      setItemDrafts(buildItemDrafts(freshOrder));
    } catch (err) {
      console.error("open order modal failed:", err);
      notify("Failed to open order", "error");
    }
  }

  async function reloadEditingOrder(orderId = editingOrder?.id) {
    if (!orderId) return;

    const freshOrder = await getOrderById(orderId);
    setItemDrafts(buildItemDrafts(freshOrder));
    setOrderTypeDraft(freshOrder.orderType || "DINING");
    setTableIdDraft(freshOrder.table?.id ? String(freshOrder.table.id) : "");
    setSelectedItemIds((ids) =>
      ids.filter((id) =>
        (freshOrder.cartItems || []).some((item) => item.id === id),
      ),
    );
    setEditingOrder((current) => (current?.id === orderId ? freshOrder : current));
    await loadOrders();
  }

  function closeOrderModal() {
    setDeletingItem(null);
    setDeleteOrderConfirmStep(0);
    setEditingOrder(null);
    setOrderTypeDraft("DINING");
    setTableIdDraft("");
    setItemSearch("");
    setSelectedItemIds([]);
    setModalMessage("");
  }

  function toggleSelectedItem(itemId) {
    setSelectedItemIds((ids) =>
      ids.includes(itemId)
        ? ids.filter((id) => id !== itemId)
        : [...ids, itemId],
    );
  }

  function selectVisibleItems() {
    setSelectedItemIds((ids) => {
      const nextIds = [...ids];

      filteredModalItems.forEach((item) => {
        if (!nextIds.includes(item.id)) nextIds.push(item.id);
      });

      return nextIds;
    });
  }

  function toggleVisibleItems() {
    if (visibleItemIds.length === 0) return;

    setSelectedItemIds((ids) => {
      if (allVisibleItemsSelected) {
        return ids.filter((id) => !visibleItemIds.includes(id));
      }

      const nextIds = [...ids];
      visibleItemIds.forEach((id) => {
        if (!nextIds.includes(id)) nextIds.push(id);
      });
      return nextIds;
    });
  }

  async function handleSendSelectedItemsToKitchen() {
    if (!editingOrder?.id || selectedItemIds.length === 0) return;

    try {
      await Promise.all(selectedItemIds.map((id) => sendCartItem(id)));
      setSelectedItemIds([]);
      setModalMessage("Selected items sent to kitchen.");
      await reloadEditingOrder(editingOrder.id);
      notify("Selected items sent to kitchen");
    } catch (err) {
      console.error("send selected items failed:", err);
      notify("Failed to send selected items", "error");
    }
  }

  async function handleResendOrderToKitchen() {
    const items = editingOrder?.cartItems || [];
    if (!editingOrder?.id || items.length === 0) return;

    try {
      await Promise.all(items.map((item) => sendCartItem(item.id)));
      setSelectedItemIds([]);
      setModalMessage("Full order sent to kitchen again.");
      await reloadEditingOrder(editingOrder.id);
      notify("Full order sent to kitchen again");
    } catch (err) {
      console.error("resend order failed:", err);
      notify("Failed to resend order", "error");
    }
  }

  async function handleSaveCustomer() {
    if (!editingOrder?.id) return;

    try {
      await updateOrderCustomer(editingOrder.id, customerForm);
      await reloadEditingOrder(editingOrder.id);
      notify("Customer saved");
    } catch (err) {
      console.error("save customer failed:", err);
      notify("Failed to save customer", "error");
    }
  }

  async function handleSaveOrderType() {
    if (!editingOrder?.id) return;

    try {
      await updateOrder(editingOrder.id, { orderType: orderTypeDraft });
      await reloadEditingOrder(editingOrder.id);
      await onOrderUpdated?.(editingOrder.id);
      notify("Order type saved");
    } catch (err) {
      console.error("save order type failed:", err);
      notify("Failed to save order type", "error");
    }
  }

  async function handleSaveOrderTable() {
    if (!editingOrder?.id) return;

    if (!tableIdDraft) {
      notify("Choose an available table first", "warning");
      return;
    }

    try {
      await moveOrderToTable(editingOrder.id, Number(tableIdDraft));
      await reloadEditingOrder(editingOrder.id);
      await onOrderUpdated?.(editingOrder.id);
      notify("Order table saved");
    } catch (err) {
      console.error("save order table failed:", err);
      notify(err.message || "Failed to save order table", "error");
    }
  }

  async function handleSaveItem(item) {
    const draft = itemDrafts[item.id];
    if (!draft) return;

    try {
      await updateCartItem(item.id, {
        price: Number(draft.priceSnapshot) || 0,
      });
      await reloadEditingOrder(editingOrder.id);
      notify("Item price saved");
    } catch (err) {
      console.error("save order item failed:", err);
      notify("Failed to save item", "error");
    }
  }

  async function handleAddItemNote(item) {
    const draft = itemDrafts[item.id];
    if (!draft?.newNote?.trim()) {
      notify("Write a note first", "warning");
      return;
    }

    try {
      await addCartItemNote(item.id, {
        note: draft.newNote.trim(),
        price: Number(draft.newNotePrice) || 0,
      });
      await reloadEditingOrder(editingOrder.id);
      notify("Note added");
    } catch (err) {
      console.error("add order item note failed:", err);
      notify("Failed to add note", "error");
    }
  }

  async function handleSaveItemNote(item, noteDraft) {
    try {
      await updateCartItemNote(noteDraft.id, {
        note: noteDraft.note,
        price: Number(noteDraft.price) || 0,
      });
      await reloadEditingOrder(editingOrder.id);
      notify("Note saved");
    } catch (err) {
      console.error("save order item note failed:", err);
      notify("Failed to save note", "error");
    }
  }

  async function handleDeleteItemNote(item, noteDraft) {
    try {
      await deleteCartItemNote(noteDraft.id);
      await reloadEditingOrder(editingOrder.id);
      notify("Note deleted");
    } catch (err) {
      console.error("delete order item note failed:", err);
      notify("Failed to delete note", "error");
    }
  }

  async function handleDeleteItem(item) {
    try {
      await deleteCartItem(item.id);
      setDeletingItem(null);
      await reloadEditingOrder(editingOrder.id);
      notify("Item deleted");
    } catch (err) {
      console.error("delete order item failed:", err);
      notify("Failed to delete item", "error");
    }
  }

  async function handleDeleteOrder() {
    if (!editingOrder?.id) return;

    try {
      const deletedOrderId = editingOrder.id;
      await deleteOrder(deletedOrderId);
      closeOrderModal();
      await loadOrders();
      await onOrderUpdated?.(deletedOrderId, { deleted: true });
      notify("Order deleted");
    } catch (err) {
      console.error("delete order failed:", err);
      setDeleteOrderConfirmStep(0);
      notify("Failed to delete order", "error");
    }
  }

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, status, type, refreshKey]);

  useEffect(() => {
    function updateModalWidthMode() {
      setIsModalWide(window.innerWidth >= 1000);
    }

    updateModalWidthMode();
    window.addEventListener("resize", updateModalWidthMode);

    return () => window.removeEventListener("resize", updateModalWidthMode);
  }, []);

  useEffect(() => {
    if (editingOrder) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [editingOrder]);

  return (
    <section style={styles.section}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Orders</h2>
          <p style={styles.subtitle}>Review active and completed orders</p>
        </div>

        <button type="button" onClick={loadOrders} style={styles.refreshButton}>
          {isLoading ? "Loading..." : "Refresh"}
        </button>
      </div>

      <div style={styles.filters}>
        <label style={styles.field}>
          <span style={styles.label}>Date</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            onInput={(e) => setDate(e.currentTarget.value)}
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

      <div style={styles.summaryGrid}>
        <div style={styles.summaryCard}>
          <span style={styles.summaryLabel}>Orders</span>
          <strong style={styles.summaryValue}>{totals.count}</strong>
        </div>
        <div style={styles.summaryCard}>
          <span style={styles.summaryLabel}>Open</span>
          <strong style={styles.summaryValue}>{totals.open}</strong>
        </div>
        <div style={styles.summaryCard}>
          <span style={styles.summaryLabel}>Paid</span>
          <strong style={styles.summaryValue}>{totals.paid}</strong>
        </div>
        <div style={styles.summaryCard}>
          <span style={styles.summaryLabel}>Sales</span>
          <strong style={styles.summaryValue}>{money(totals.sales)}</strong>
        </div>
      </div>

      <div style={styles.orderCardHeader}>
        <h3 style={styles.panelTitle}>Order Cards</h3>
        <span style={styles.countPill}>{orders.length}</span>
      </div>

      {orders.length === 0 ? (
        <div style={styles.emptyCards}>No orders found.</div>
      ) : (
        <div style={styles.orderCardGrid}>
          {orders.map((order) => {
            const itemCount = (order.cartItems || []).reduce(
              (sum, item) => sum + Number(item.quantity || 0),
              0,
            );

            return (
              <button
                type="button"
                key={order.id}
                data-testid={`order-card-${order.id}`}
                onClick={() => openOrderModal(order)}
                style={styles.orderCard}
              >
                <div style={styles.orderCardTop}>
                  <div>
                    <div style={styles.orderTitle}>Order #{order.id}</div>
                    <div style={styles.orderMeta}>
                      {order.orderType} - {formatDateTime(order.createdAt)}
                    </div>
                  </div>

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
                </div>

                <div style={styles.orderCardBody}>
                  <div style={styles.cardInfoBox}>
                    <span style={styles.infoLabel}>Payment</span>
                    <strong>{order.paymentStatus}</strong>
                  </div>
                  <div style={styles.cardInfoBox}>
                    <span style={styles.infoLabel}>Table</span>
                    <strong>{order.table?.label || "None"}</strong>
                  </div>
                  <div style={styles.cardInfoBox}>
                    <span style={styles.infoLabel}>Items</span>
                    <strong>{itemCount}</strong>
                  </div>
                </div>

                <div style={styles.orderCardBottom}>
                  <span>{order.handlerName || order.username || "No handler"}</span>
                  <strong>{money(order.total)}</strong>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {editingOrder && (
        <div style={styles.overlay} data-testid="order-edit-modal">
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <div>
                <h2 style={styles.modalTitle}>Edit Order #{editingOrder.id}</h2>
                <p style={styles.modalSubtitle}>
                  Customer, item prices, notes, and order-only additions
                </p>
              </div>

              <div style={styles.modalHeaderActions}>
                <button
                  type="button"
                  onClick={() => setDeleteOrderConfirmStep(1)}
                  style={styles.deleteOrderButton}
                >
                  Delete Order
                </button>
                <button
                  type="button"
                  aria-label="Close edit order"
                  onClick={closeOrderModal}
                  style={styles.closeButton}
                >
                  ×
                </button>
              </div>
            </div>

            <div
              style={{
                ...styles.modalContent,
                ...(isModalWide
                  ? styles.modalContentWide
                  : styles.modalContentStacked),
              }}
            >
              <div
                style={{
                  ...styles.modalLeftColumn,
                  ...(!isModalWide ? styles.modalLeftColumnStacked : {}),
                }}
              >
                <section style={styles.modalSection}>
                  <div style={styles.modalInfoGrid}>
                    <div style={styles.infoBox}>
                      <span style={styles.infoLabel}>Status</span>
                      <strong>{editingOrder.orderStatus}</strong>
                      <span style={styles.infoSub}>
                        {editingOrder.paymentStatus}
                      </span>
                    </div>
                    <div style={styles.infoBox}>
                      <span style={styles.infoLabel}>Type</span>
                      <div style={styles.orderTypeEditRow}>
                        <select
                          aria-label="Order type"
                          value={orderTypeDraft}
                          onChange={(e) => setOrderTypeDraft(e.target.value)}
                          style={styles.orderTypeSelect}
                        >
                          <option value="DINING">Dining</option>
                          <option value="TO_GO">To Go</option>
                          <option value="DELIVERY">Delivery</option>
                        </select>
                        <button
                          type="button"
                          onClick={handleSaveOrderType}
                          disabled={orderTypeDraft === editingOrder.orderType}
                          style={{
                            ...styles.orderTypeSaveButton,
                            ...(orderTypeDraft === editingOrder.orderType
                              ? styles.disabledButton
                              : {}),
                          }}
                        >
                          Save
                        </button>
                      </div>
                      <span style={styles.infoSub}>
                        {formatDateTime(editingOrder.createdAt)}
                      </span>
                    </div>
                    <div style={styles.infoBox}>
                      <span style={styles.infoLabel}>Table</span>
                      <div style={styles.orderTypeEditRow}>
                        <select
                          aria-label="Order table"
                          value={tableIdDraft}
                          onChange={(e) => setTableIdDraft(e.target.value)}
                          style={styles.orderTypeSelect}
                        >
                          <option value="">
                            {availableTables.length
                              ? "Choose available table"
                              : "No available table"}
                          </option>
                          {availableTables.map((table) => (
                            <option key={table.id} value={table.id}>
                              {table.label} ({table.seat} seats)
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={handleSaveOrderTable}
                          disabled={
                            !tableIdDraft ||
                            Number(tableIdDraft) === Number(editingOrder.table?.id)
                          }
                          style={{
                            ...styles.orderTypeSaveButton,
                            ...(!tableIdDraft ||
                            Number(tableIdDraft) === Number(editingOrder.table?.id)
                              ? styles.disabledButton
                              : {}),
                          }}
                        >
                          Save
                        </button>
                      </div>
                      <span style={styles.infoSub}>
                        {editingOrder.table?.seat
                          ? `Current: ${editingOrder.table.label}`
                          : "Moving to a table makes this dining"}
                      </span>
                    </div>
                    <div style={styles.infoBox}>
                      <span style={styles.infoLabel}>Handled By</span>
                      <strong>
                        {editingOrder.handlerName ||
                          editingOrder.username ||
                          "None"}
                      </strong>
                      <span style={styles.infoSub}>
                        Created by {editingOrder.username || "unknown"}
                      </span>
                    </div>
                  </div>

                  <div style={styles.modalTotals}>
                    <div style={styles.totalLine}>
                      <span>Subtotal</span>
                      <strong>{money(editingOrder.subtotal)}</strong>
                    </div>
                    <div style={styles.totalLine}>
                      <span>Tax</span>
                      <strong>{money(editingOrder.tax)}</strong>
                    </div>
                    <div style={styles.totalLine}>
                      <span>Tips</span>
                      <strong>{money(editingOrder.tips)}</strong>
                    </div>
                    <div style={styles.grandTotal}>
                      <span>Total</span>
                      <strong>{money(editingOrder.total)}</strong>
                    </div>
                  </div>
                </section>

                <section style={styles.modalSection}>
                  <div style={styles.panelHeader}>
                    <h3 style={styles.panelTitle}>Customer Info</h3>
                    <button
                      type="button"
                      onClick={handleSaveCustomer}
                      style={styles.smallPrimaryButton}
                    >
                      Save Customer
                    </button>
                  </div>

                  <div style={styles.formGrid}>
                    <label style={styles.field}>
                      <span style={styles.label}>Name</span>
                      <input
                        value={customerForm.name}
                        onChange={(e) =>
                          setCustomerForm({
                            ...customerForm,
                            name: e.target.value,
                          })
                        }
                        style={styles.input}
                      />
                    </label>
                    <label style={styles.field}>
                      <span style={styles.label}>Phone</span>
                      <input
                        value={customerForm.phoneNumber}
                        onChange={(e) =>
                          setCustomerForm({
                            ...customerForm,
                            phoneNumber: e.target.value,
                          })
                        }
                        style={styles.input}
                      />
                    </label>
                    <label style={styles.fieldWide}>
                      <span style={styles.label}>Address</span>
                      <input
                        value={customerForm.address}
                        onChange={(e) =>
                          setCustomerForm({
                            ...customerForm,
                            address: e.target.value,
                          })
                        }
                        style={styles.input}
                      />
                    </label>
                    <label style={styles.fieldWide}>
                      <span style={styles.label}>Customer Note</span>
                      <textarea
                        value={customerForm.note}
                        onChange={(e) =>
                          setCustomerForm({
                            ...customerForm,
                            note: e.target.value,
                          })
                        }
                        style={styles.textarea}
                      />
                    </label>
                  </div>
                </section>
              </div>

              <section
                style={{
                  ...styles.modalSection,
                  ...styles.itemsModalSection,
                  ...(!isModalWide ? styles.itemsModalSectionStacked : {}),
                }}
              >
                <div style={styles.itemsPanelHeader}>
                  <label style={styles.itemsHeaderSelectLabel}>
                    <input
                      type="checkbox"
                      checked={allVisibleItemsSelected}
                      disabled={visibleItemIds.length === 0}
                      onChange={toggleVisibleItems}
                    />
                    <span style={styles.itemsHeaderTitle}>Items</span>
                    <span style={styles.countPill}>
                      {filteredModalItems.length}
                      {filteredModalItems.length !==
                        (editingOrder.cartItems?.length || 0)
                        ? ` of ${editingOrder.cartItems?.length || 0}`
                        : ""}
                    </span>
                  </label>
                  {selectedVisibleCount > 0 && (
                    <span style={styles.selectedCountText}>
                      {selectedVisibleCount} selected
                    </span>
                  )}
                </div>

                <div style={styles.itemSearchToolbar}>
                  <label style={styles.itemSearchField}>
                    <span style={styles.label}>Search Items</span>
                    <input
                      value={itemSearch}
                      onChange={(e) => setItemSearch(e.target.value)}
                      placeholder="Search name, status, price, or note"
                      style={styles.input}
                    />
                  </label>

                  <div style={styles.itemSelectionActions}>
                    <button
                      type="button"
                      onClick={handleResendOrderToKitchen}
                      disabled={(editingOrder.cartItems || []).length === 0}
                      style={{
                        ...styles.resendOrderButton,
                        ...((editingOrder.cartItems || []).length === 0
                          ? styles.disabledButton
                          : {}),
                      }}
                    >
                      Send Full Order Again
                    </button>
                    <button
                      type="button"
                      onClick={selectVisibleItems}
                      disabled={filteredModalItems.length === 0}
                      style={{
                        ...styles.secondarySmallButton,
                        ...(filteredModalItems.length === 0
                          ? styles.disabledButton
                          : {}),
                      }}
                    >
                      Select Visible
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedItemIds([])}
                      disabled={selectedItemIds.length === 0}
                      style={{
                        ...styles.secondarySmallButton,
                        ...(selectedItemIds.length === 0
                          ? styles.disabledButton
                          : {}),
                      }}
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={handleSendSelectedItemsToKitchen}
                      disabled={selectedItemIds.length === 0}
                      style={{
                        ...styles.smallPrimaryButton,
                        ...(selectedItemIds.length === 0
                          ? styles.disabledButton
                          : {}),
                      }}
                    >
                      Send Selected to Kitchen ({selectedItemIds.length})
                    </button>
                  </div>
                </div>

                {modalMessage && (
                  <div style={styles.modalNotice}>{modalMessage}</div>
                )}

                <div
                  style={{
                    ...styles.itemsScrollArea,
                    ...(!isModalWide ? styles.itemsScrollAreaStacked : {}),
                  }}
                >
                  {(editingOrder.cartItems || []).length === 0 ? (
                    <p style={styles.empty}>No items on this order.</p>
                  ) : filteredModalItems.length === 0 ? (
                    <p style={styles.empty}>No items match your search.</p>
                  ) : (
                    filteredModalItems.map((item) => {
                      const draft = itemDrafts[item.id] || {};
                      const selected = selectedItemIds.includes(item.id);
                      const status = itemStatus(item);

                      return (
                        <div
                          key={item.id}
                          style={{
                            ...styles.editItemCard,
                            ...(selected ? styles.editItemCardSelected : {}),
                          }}
                        >
                          <div style={styles.editItemHeader}>
                            <label style={styles.itemSelectLabel}>
                              <input
                                type="checkbox"
                                checked={selected}
                                onChange={() => toggleSelectedItem(item.id)}
                              />
                              <span>
                                <strong>{itemName(item)}</strong>
                                <div style={styles.orderMeta}>
                                  Qty {item.quantity}
                                </div>
                              </span>
                            </label>

                            <div style={styles.itemHeaderActions}>
                              <span
                                style={
                                  status === "Finished"
                                    ? styles.itemFinished
                                    : status === "Pending"
                                      ? styles.itemPending
                                      : styles.itemPreparing
                                }
                              >
                                {status}
                              </span>
                              <button
                                type="button"
                                onClick={() => setDeletingItem(item)}
                                style={styles.deleteButton}
                              >
                                Delete
                              </button>
                            </div>
                          </div>

                          <div style={styles.itemEditActions}>
                            <label style={styles.field}>
                              <span style={styles.label}>Order Price</span>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={draft.priceSnapshot || ""}
                                onChange={(e) =>
                                  isValidMoneyInput(e.target.value) &&
                                  setItemDrafts({
                                    ...itemDrafts,
                                    [item.id]: {
                                      ...draft,
                                      priceSnapshot: e.target.value,
                                    },
                                  })
                                }
                                style={styles.input}
                              />
                            </label>
                            <button
                              type="button"
                              onClick={() => handleSaveItem(item)}
                              style={styles.smallPrimaryButton}
                            >
                              Save Item
                            </button>
                          </div>

                          <div style={styles.noteBlock}>
                            <div style={styles.panelHeader}>
                              <h4 style={styles.noteTitle}>Notes and Additions</h4>
                              <span style={styles.countPill}>
                                {(draft.notes || []).length}
                              </span>
                            </div>

                            {(draft.notes || []).map((noteDraft, index) => (
                              <div key={noteDraft.id} style={styles.noteRow}>
                                <input
                                  value={noteDraft.note}
                                  onChange={(e) => {
                                    const nextNotes = [...(draft.notes || [])];
                                    nextNotes[index] = {
                                      ...noteDraft,
                                      note: e.target.value,
                                    };
                                    setItemDrafts({
                                      ...itemDrafts,
                                      [item.id]: { ...draft, notes: nextNotes },
                                    });
                                  }}
                                  placeholder="Note"
                                  style={styles.input}
                                />
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={noteDraft.price}
                                  onChange={(e) => {
                                    if (!isValidMoneyInput(e.target.value)) return;

                                    const nextNotes = [...(draft.notes || [])];
                                    nextNotes[index] = {
                                      ...noteDraft,
                                      price: e.target.value,
                                    };
                                    setItemDrafts({
                                      ...itemDrafts,
                                      [item.id]: { ...draft, notes: nextNotes },
                                    });
                                  }}
                                  placeholder="0.00"
                                  style={styles.input}
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSaveItemNote(item, noteDraft)}
                                  style={styles.smallPrimaryButton}
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteItemNote(item, noteDraft)}
                                  style={styles.deleteButton}
                                >
                                  Delete
                                </button>
                              </div>
                            ))}

                            <div style={styles.noteRow}>
                              <input
                                value={draft.newNote || ""}
                                onChange={(e) =>
                                  setItemDrafts({
                                    ...itemDrafts,
                                    [item.id]: {
                                      ...draft,
                                      newNote: e.target.value,
                                    },
                                  })
                                }
                                placeholder="New note"
                                style={styles.input}
                              />
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={draft.newNotePrice || ""}
                                onChange={(e) =>
                                  isValidMoneyInput(e.target.value) &&
                                  setItemDrafts({
                                    ...itemDrafts,
                                    [item.id]: {
                                      ...draft,
                                      newNotePrice: e.target.value,
                                    },
                                  })
                                }
                                placeholder="0.00"
                                style={styles.input}
                              />
                              <button
                                type="button"
                                onClick={() => handleAddItemNote(item)}
                                style={styles.smallPrimaryButton}
                              >
                                Add Note
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </section>
            </div>

            {deletingItem && (
              <div style={styles.confirmOverlay}>
                <div style={styles.confirmDialog}>
                  <h3 style={styles.confirmTitle}>Delete Item</h3>
                  <p style={styles.confirmText}>
                    Remove {itemName(deletingItem)} from this order?
                  </p>
                  <div style={styles.confirmActions}>
                    <button
                      type="button"
                      onClick={() => setDeletingItem(null)}
                      style={styles.detailToggleButton}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(deletingItem)}
                      style={styles.deleteButton}
                    >
                      Delete Item
                    </button>
                  </div>
                </div>
              </div>
            )}

            {deleteOrderConfirmStep > 0 && (
              <div style={styles.confirmOverlay}>
                <div style={styles.confirmDialog}>
                  <h3 style={styles.confirmTitle}>
                    {deleteOrderConfirmStep === 1
                      ? "Delete Order"
                      : "Really Delete Order?"}
                  </h3>
                  <p style={styles.confirmText}>
                    {deleteOrderConfirmStep === 1
                      ? `Delete order #${editingOrder.id}? This removes every item and frees its table if this is a dining order.`
                      : `This cannot be undone. Are you sure you want to permanently delete order #${editingOrder.id}?`}
                  </p>
                  <div style={styles.confirmActions}>
                    <button
                      type="button"
                      onClick={() => setDeleteOrderConfirmStep(0)}
                      style={styles.detailToggleButton}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={
                        deleteOrderConfirmStep === 1
                          ? () => setDeleteOrderConfirmStep(2)
                          : handleDeleteOrder
                      }
                      style={styles.deleteButton}
                    >
                      {deleteOrderConfirmStep === 1
                        ? "Continue"
                        : "Yes, Delete Order"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
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
  },
  title: {
    margin: 0,
    fontSize: 28,
    fontWeight: 900,
  },
  subtitle: {
    margin: "6px 0 0",
    color: "#6b7280",
  },
  refreshButton: {
    border: "1px solid #d1d5db",
    background: "white",
    borderRadius: 8,
    padding: "11px 14px",
    cursor: "pointer",
    fontWeight: 900,
  },
  filters: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))",
    gap: 12,
    alignItems: "end",
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
    width: "100%",
    boxSizing: "border-box",
    padding: "11px 12px",
    borderRadius: 8,
    border: "1px solid #d1d5db",
  },
  error: {
    marginBottom: 12,
    padding: "10px 12px",
    borderRadius: 8,
    background: "#fee2e2",
    color: "#991b1b",
    fontWeight: 800,
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 120px), 1fr))",
    gap: 12,
    marginBottom: 18,
  },
  summaryCard: {
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    padding: 14,
    background: "#f9fafb",
  },
  summaryLabel: {
    display: "block",
    color: "#6b7280",
    fontSize: 12,
    fontWeight: 900,
    textTransform: "uppercase",
  },
  summaryValue: {
    display: "block",
    marginTop: 4,
    color: "#111827",
    fontSize: 22,
    fontWeight: 900,
  },
  orderCardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  emptyCards: {
    minHeight: 260,
    display: "grid",
    placeItems: "center",
    border: "1px dashed #d1d5db",
    borderRadius: 8,
    background: "#f9fafb",
    color: "#6b7280",
    fontWeight: 800,
  },
  orderCardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))",
    gap: 14,
  },
  orderCard: {
    width: "100%",
    minHeight: 190,
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    background: "white",
    padding: 16,
    cursor: "pointer",
    textAlign: "left",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    gap: 14,
    boxShadow: "0 8px 22px rgba(15,23,42,0.06)",
  },
  orderCardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  orderCardBody: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 8,
  },
  cardInfoBox: {
    minWidth: 0,
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    background: "#f9fafb",
    padding: 10,
    display: "grid",
    gap: 4,
  },
  orderCardBottom: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
    borderTop: "1px solid #e5e7eb",
    paddingTop: 12,
    color: "#374151",
    fontWeight: 800,
  },
  layout: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
    gap: 16,
    alignItems: "start",
  },
  listPanel: {
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    padding: 16,
    background: "#f9fafb",
  },
  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  panelTitle: {
    margin: 0,
    fontSize: 18,
    fontWeight: 900,
  },
  countPill: {
    borderRadius: 999,
    padding: "4px 10px",
    background: "#111827",
    color: "white",
    fontSize: 12,
    fontWeight: 900,
  },
  orderList: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    height: 560,
    overflowY: "auto",
    paddingRight: 6,
  },
  empty: {
    margin: 0,
    color: "#6b7280",
    fontStyle: "italic",
  },
  orderRow: {
    width: "100%",
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    background: "white",
    padding: 12,
    cursor: "pointer",
    textAlign: "left",
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
  },
  orderRowActive: {
    border: "1px solid #2563eb",
    outline: "2px solid #2563eb",
    outlineOffset: -2,
  },
  orderTitle: {
    color: "#111827",
    fontWeight: 900,
  },
  orderMeta: {
    marginTop: 4,
    color: "#6b7280",
    fontSize: 13,
    fontWeight: 700,
  },
  orderRight: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 8,
  },
  statusPill: {
    borderRadius: 999,
    padding: "4px 9px",
    background: "#dbeafe",
    color: "#1d4ed8",
    fontSize: 11,
    fontWeight: 900,
  },
  servingPill: {
    background: "#dbeafe",
    color: "#1d4ed8",
  },
  completedPill: {
    background: "#dcfce7",
    color: "#166534",
  },
  cancelledPill: {
    background: "#fee2e2",
    color: "#991b1b",
  },
  detailPanel: {
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    padding: 18,
    background: "white",
    boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
  },
  detailEmpty: {
    minHeight: 360,
    display: "grid",
    placeItems: "center",
    color: "#6b7280",
    fontWeight: 800,
  },
  detailHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
    marginBottom: 16,
  },
  detailTitle: {
    margin: 0,
    fontSize: 24,
    fontWeight: 900,
  },
  detailMeta: {
    margin: "5px 0 0",
    color: "#6b7280",
    fontWeight: 700,
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 150px), 1fr))",
    gap: 10,
    marginBottom: 16,
  },
  infoBox: {
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    padding: 12,
    background: "#f9fafb",
    display: "grid",
    gap: 3,
  },
  infoLabel: {
    color: "#6b7280",
    fontSize: 11,
    fontWeight: 900,
    textTransform: "uppercase",
  },
  infoSub: {
    color: "#6b7280",
    fontSize: 12,
    fontWeight: 700,
  },
  orderTypeEditRow: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) auto",
    gap: 8,
    alignItems: "center",
  },
  orderTypeSelect: {
    width: "100%",
    minWidth: 0,
    boxSizing: "border-box",
    border: "1px solid #d1d5db",
    borderRadius: 8,
    background: "white",
    padding: "8px 9px",
    color: "#111827",
    fontWeight: 900,
  },
  orderTypeSaveButton: {
    border: "none",
    background: "#111827",
    color: "white",
    borderRadius: 8,
    padding: "9px 10px",
    cursor: "pointer",
    fontWeight: 900,
  },
  collapsiblePanel: {
    borderTop: "1px solid #e5e7eb",
    marginTop: 14,
    paddingTop: 14,
  },
  detailActions: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 140px), 1fr))",
    gap: 10,
    marginTop: 16,
  },
  primaryDetailButton: {
    border: "none",
    background: "#111827",
    color: "white",
    borderRadius: 8,
    padding: "12px 14px",
    cursor: "pointer",
    fontWeight: 900,
  },
  detailToggleButton: {
    border: "1px solid #d1d5db",
    background: "#f9fafb",
    color: "#111827",
    borderRadius: 8,
    padding: "12px 14px",
    cursor: "pointer",
    fontWeight: 900,
  },
  customerGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 150px), 1fr))",
    gap: 10,
  },
  itemRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
    padding: 12,
    borderRadius: 8,
    border: "1px solid #e5e7eb",
    marginBottom: 10,
  },
  itemRight: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 8,
  },
  itemPending: {
    borderRadius: 999,
    padding: "3px 8px",
    background: "#fef3c7",
    color: "#92400e",
    fontSize: 11,
    fontWeight: 900,
  },
  itemPreparing: {
    borderRadius: 999,
    padding: "3px 8px",
    background: "#dbeafe",
    color: "#1d4ed8",
    fontSize: 11,
    fontWeight: 900,
  },
  itemFinished: {
    borderRadius: 999,
    padding: "3px 8px",
    background: "#dcfce7",
    color: "#166534",
    fontSize: 11,
    fontWeight: 900,
  },
  totalBox: {
    marginTop: 16,
    borderTop: "1px solid #e5e7eb",
    paddingTop: 14,
  },
  totalLine: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 10,
    color: "#374151",
  },
  grandTotal: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    fontSize: 22,
    fontWeight: 900,
    marginTop: 14,
    paddingTop: 14,
    borderTop: "1px solid #e5e7eb",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    display: "grid",
    placeItems: "center",
    zIndex: 9999,
    padding: 24,
  },
  modal: {
    position: "relative",
    width: "min(1220px, calc(100vw - 48px))",
    height: "min(900px, calc(100vh - 48px))",
    maxHeight: "calc(100vh - 48px)",
    overflow: "hidden",
    background: "white",
    borderRadius: 10,
    boxShadow: "0 24px 70px rgba(0,0,0,0.25)",
    display: "flex",
    flexDirection: "column",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
    padding: "22px 24px",
    borderBottom: "1px solid #e5e7eb",
    background: "#f9fafb",
  },
  modalTitle: {
    margin: 0,
    fontSize: 24,
    fontWeight: 900,
  },
  modalSubtitle: {
    margin: "6px 0 0",
    color: "#6b7280",
    fontWeight: 700,
  },
  closeButton: {
    border: "1px solid #d1d5db",
    background: "white",
    color: "#111827",
    borderRadius: 8,
    width: 36,
    height: 36,
    cursor: "pointer",
    fontSize: 22,
    lineHeight: 1,
    fontWeight: 800,
  },
  modalHeaderActions: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  deleteOrderButton: {
    border: "none",
    background: "#fee2e2",
    color: "#991b1b",
    borderRadius: 8,
    padding: "10px 12px",
    cursor: "pointer",
    fontWeight: 900,
  },
  modalContent: {
    padding: 20,
    display: "grid",
    gap: 14,
    flex: 1,
    minHeight: 0,
  },
  modalContentWide: {
    overflow: "hidden",
    gridTemplateColumns: "minmax(0, 1fr) minmax(430px, 1fr)",
  },
  modalContentStacked: {
    overflowY: "auto",
    gridTemplateColumns: "1fr",
    scrollbarGutter: "stable",
  },
  modalLeftColumn: {
    display: "grid",
    gap: 14,
    alignContent: "start",
    minWidth: 0,
    minHeight: 0,
  },
  modalLeftColumnStacked: {
    minHeight: "auto",
    overflow: "visible",
  },
  modalSection: {
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    padding: 16,
    background: "white",
  },
  itemsModalSection: {
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
    overflow: "hidden",
  },
  itemsModalSectionStacked: {
    minHeight: 360,
  },
  itemsScrollArea: {
    flex: 1,
    minHeight: 0,
    overflowY: "auto",
    paddingRight: 6,
    scrollbarGutter: "stable",
  },
  itemsScrollAreaStacked: {
    flex: "0 1 auto",
    maxHeight: "min(520px, 48vh)",
  },
  modalInfoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 170px), 1fr))",
    gap: 10,
  },
  modalTotals: {
    marginTop: 14,
    borderTop: "1px solid #e5e7eb",
    paddingTop: 14,
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
    gap: 12,
  },
  fieldWide: {
    display: "grid",
    gap: 6,
    gridColumn: "1 / -1",
  },
  textarea: {
    width: "100%",
    minHeight: 74,
    boxSizing: "border-box",
    padding: "11px 12px",
    borderRadius: 8,
    border: "1px solid #d1d5db",
    resize: "vertical",
    fontFamily: "inherit",
  },
  smallPrimaryButton: {
    border: "none",
    background: "#111827",
    color: "white",
    borderRadius: 8,
    padding: "10px 13px",
    cursor: "pointer",
    fontWeight: 900,
  },
  secondarySmallButton: {
    border: "1px solid #d1d5db",
    background: "#f9fafb",
    color: "#111827",
    borderRadius: 8,
    padding: "10px 13px",
    cursor: "pointer",
    fontWeight: 900,
  },
  resendOrderButton: {
    border: "none",
    background: "#2563eb",
    color: "white",
    borderRadius: 8,
    padding: "10px 13px",
    cursor: "pointer",
    fontWeight: 900,
  },
  disabledButton: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  itemSearchToolbar: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 10,
    alignItems: "end",
    marginBottom: 12,
  },
  itemSearchField: {
    display: "grid",
    gap: 6,
    minWidth: 0,
  },
  itemSelectionActions: {
    display: "flex",
    justifyContent: "flex-start",
    gap: 8,
    flexWrap: "wrap",
  },
  itemsPanelHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
  },
  itemsHeaderSelectLabel: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    minWidth: 0,
    cursor: "pointer",
  },
  itemsHeaderTitle: {
    margin: 0,
    fontSize: 20,
    lineHeight: 1,
    fontWeight: 900,
  },
  selectedCountText: {
    color: "#4b5563",
    fontSize: 13,
    fontWeight: 800,
    whiteSpace: "nowrap",
  },
  modalNotice: {
    borderRadius: 8,
    background: "#dcfce7",
    color: "#166534",
    padding: "9px 11px",
    fontWeight: 800,
    marginBottom: 10,
  },
  itemEditActions: {
    display: "grid",
    gridTemplateColumns: "minmax(160px, 220px) auto",
    gap: 10,
    alignItems: "end",
  },
  editItemCard: {
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    padding: 14,
    background: "#f9fafb",
    marginBottom: 12,
  },
  editItemCardSelected: {
    border: "1px solid #2563eb",
    background: "#eff6ff",
  },
  editItemHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
    marginBottom: 12,
  },
  itemSelectLabel: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    minWidth: 0,
    cursor: "pointer",
  },
  itemHeaderActions: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 8,
    flexWrap: "wrap",
  },
  deleteButton: {
    border: "none",
    background: "#fee2e2",
    color: "#991b1b",
    borderRadius: 8,
    padding: "9px 11px",
    cursor: "pointer",
    fontWeight: 900,
  },
  noteBlock: {
    marginTop: 14,
    borderTop: "1px solid #e5e7eb",
    paddingTop: 14,
  },
  noteTitle: {
    margin: 0,
    fontSize: 15,
    fontWeight: 900,
  },
  noteRow: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) minmax(90px, 130px) auto auto",
    gap: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  confirmOverlay: {
    position: "absolute",
    inset: 0,
    display: "grid",
    placeItems: "center",
    padding: 24,
    background: "rgba(17,24,39,0.35)",
  },
  confirmDialog: {
    width: 360,
    maxWidth: "100%",
    borderRadius: 8,
    background: "white",
    border: "1px solid #e5e7eb",
    boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
    padding: 18,
  },
  confirmTitle: {
    margin: 0,
    fontSize: 20,
    fontWeight: 900,
  },
  confirmText: {
    margin: "8px 0 0",
    color: "#4b5563",
    fontWeight: 700,
  },
  confirmActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 18,
  },
};

export default OrdersSection;

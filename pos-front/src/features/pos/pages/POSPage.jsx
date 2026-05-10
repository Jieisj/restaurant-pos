import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ROLES } from "../../../constants/roles";
import { getAllMenuItems } from "../../../api/menuApi";
import { getAllTables, getTableById, updateTable } from "../../../api/tableApi";
import {
  getAllNotFinishedItems,
  getNotFinishedItemsByOrder,
  finishCartItem,
  revertFinishedCartItem,
} from "../../../api/cartApi";
import {
  addCartItemNote,
  addCartItem,
  deleteCartItemNote,
  getCartItemsByOrder,
  sendCartItem,
  updateCartItem,
  updateCartItemNote,
  deleteCartItem,
} from "../../../api/cartApi";
import {
  closeTableOrder,
  openTableOrder,
  checkoutOrder,
  getOrderById,
} from "../../../api/orderApi";
import { assignCustomerToTable, getCustomerUsers } from "../../../api/userApi";

import TablesSection from "../components/TablesSection";
import MenuSection from "../components/MenuSection";
import CartSection from "../components/CartSection";
import KitchenSection from "../components/KitchenSection";
import OrdersSection from "../components/OrdersSection";
import ReportSection from "../components/ReportSection";

const TAX_RATE = 0.1;

function defaultTabForRole(role) {
  if (role === ROLES.CUSTOMER) return "tables";
  if (role === ROLES.KITCHEN) return "kitchen";
  return "tables";
}

function itemPrice(item) {
  return Number(item.priceSnapshot ?? item.price ?? 0);
}

function itemName(item) {
  return item.nameSnapshot || item.name || "Menu item";
}

function itemNotesTotal(item) {
  return (item.notes || []).reduce(
    (sum, note) => sum + Number(note.price || 0),
    0,
  );
}

function modifierCartNotes(selectedModifiers = {}) {
  const notes = [];

  (selectedModifiers.add || []).forEach((name) => {
    notes.push({ note: `Add ${name}`, price: 0 });
  });

  (selectedModifiers.no || []).forEach((name) => {
    notes.push({ note: `No ${name}`, price: 0 });
  });

  if (selectedModifiers.switchTo) {
    notes.push({ note: `Switch ${selectedModifiers.switchTo}`, price: 0 });
  }

  return notes;
}

function POSPage({ user, onLogout }) {
  const USER_ID = Number(user?.userId || sessionStorage.getItem("userId"));
  const role = user?.role;
  const isCustomer = role === ROLES.CUSTOMER;
  const isKitchen = role === ROLES.KITCHEN;
  const isAdmin = role === ROLES.ADMIN;
  const customerTableId = Number(user?.tableId || 0) || null;
  const customerTableLabel = user?.tableLabel || null;
  const customerTableSeat = Number(user?.tableSeat || 0) || null;

  const [activeTab, setActiveTab] = useState(defaultTabForRole(role));
  const [tables, setTables] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedTableId, setSelectedTableId] = useState(null);
  const [activeOrder, setActiveOrder] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [tips, setTips] = useState(0);
  const [kitchenItems, setKitchenItems] = useState([]);
  const [recentlyFinishedItems, setRecentlyFinishedItems] = useState([]);
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);
  const [editingTable, setEditingTable] = useState(null);
  const [customerUsers, setCustomerUsers] = useState([]);
  const [ordersRefreshKey, setOrdersRefreshKey] = useState(0);
  const [reportRefreshKey, setReportRefreshKey] = useState(0);

  const tabs = useMemo(() => {
    if (isCustomer) return ["tables", "menu", "cart"];
    if (isKitchen) return ["kitchen"];

    const staffTabs = ["tables", "menu", "cart", "kitchen", "orders"];
    return isAdmin ? [...staffTabs, "report"] : staffTabs;
  }, [isAdmin, isCustomer, isKitchen]);

  const selectedTable = useMemo(
    () => tables.find((table) => table.id === selectedTableId),
    [selectedTableId, tables],
  );

  const pendingItems = cartItems.filter((item) => Number(item.isPending) === 1);
  const currentItems = cartItems.filter((item) => Number(item.isPending) === 0);

  const subtotal = useMemo(() => {
    return cartItems.reduce(
      (sum, item) =>
        sum + (itemPrice(item) + itemNotesTotal(item)) * Number(item.quantity || 0),
      0,
    );
  }, [cartItems]);

  const tax = subtotal * TAX_RATE;
  const tipAmount = Number(tips) || 0;
  const total = subtotal + tax + tipAmount;

  const refreshKitchen = useCallback(async (orderId = activeOrder?.id) => {
    if (orderId) {
      setKitchenItems(await getNotFinishedItemsByOrder(orderId));
      return;
    }

    setKitchenItems(await getAllNotFinishedItems());
  }, [activeOrder?.id]);

  const refreshCart = useCallback(async (orderId = activeOrder?.id) => {
    if (!orderId) return;
    setCartItems(await getCartItemsByOrder(orderId));
  }, [activeOrder?.id]);

  const refreshTables = useCallback(async () => {
    if (isCustomer) {
      if (!customerTableId) {
        setTables([]);
        return;
      }

      setTables([await getTableById(customerTableId)]);
      return;
    }

    setTables(await getAllTables());
  }, [customerTableId, isCustomer]);

  const refreshCustomerUsers = useCallback(async () => {
    setCustomerUsers(await getCustomerUsers());
  }, []);

  const refreshMenuItems = useCallback(async () => {
    setMenuItems(await getAllMenuItems());
  }, []);

  const refreshActiveOrderCart = useCallback(async () => {
    if (!activeOrder?.id) return false;

    await refreshCart(activeOrder.id);

    if (!isCustomer) {
      await refreshKitchen(activeOrder.id);
    }

    return true;
  }, [activeOrder?.id, isCustomer, refreshCart, refreshKitchen]);

  async function handleRefreshCartSection() {
    const refreshed = await refreshActiveOrderCart();

    if (!refreshed) {
      showToast("Open a table first", "warning");
      return;
    }

    await refreshTables();
  }

  const refreshOrdersSection = useCallback(() => {
    setOrdersRefreshKey((key) => key + 1);
  }, []);

  const refreshReportSection = useCallback(() => {
    setReportRefreshKey((key) => key + 1);
  }, []);

  const showToast = useCallback((message, type = "success") => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    setToast({ message, type });

    toastTimerRef.current = setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, 2000);
  }, []);

  useEffect(() => {
    async function loadInitialData() {
      try {
        if (!isKitchen) {
          setMenuItems(await getAllMenuItems());
        }

        if (isCustomer) {
          await refreshTables();
        }

        if (!isCustomer && !isKitchen) {
          const [loadedTables, loadedCustomerUsers] = await Promise.all([
            getAllTables(),
            getCustomerUsers(),
          ]);

          setTables(loadedTables);
          setCustomerUsers(loadedCustomerUsers);
        }

        if (!isCustomer) {
          setKitchenItems(await getAllNotFinishedItems());
        }
      } catch (err) {
        console.error("initial POS data load failed:", err);
        showToast("Failed to load POS data", "error");
      }
    }

    loadInitialData();
  }, [isCustomer, isKitchen, refreshTables, showToast]);

  useEffect(() => {
    if (!tabs.includes(activeTab)) {
      setActiveTab(tabs[0]);
    }
  }, [activeTab, tabs]);

  useEffect(() => {
    async function refreshVisibleTab() {
      if (document.visibilityState !== "visible") return;

      try {
        if (activeTab === "cart") {
          await refreshActiveOrderCart();
          return;
        }

        if (activeTab === "menu" && !isKitchen) {
          await refreshMenuItems();
          return;
        }

        if (activeTab === "kitchen" && !isCustomer) {
          await refreshKitchen(null);
          return;
        }

        if (activeTab === "orders" && !isCustomer && !isKitchen) {
          refreshOrdersSection();
          return;
        }

        if (activeTab === "report" && isAdmin) {
          refreshReportSection();
          return;
        }

        if (activeTab === "tables") {
          if (isCustomer) {
            await refreshTables();
          } else if (!isKitchen) {
            await Promise.all([refreshTables(), refreshCustomerUsers()]);
          }
        }
      } catch (err) {
        console.error("visible tab refresh failed:", err);
      }
    }

    window.addEventListener("focus", refreshVisibleTab);
    document.addEventListener("visibilitychange", refreshVisibleTab);

    return () => {
      window.removeEventListener("focus", refreshVisibleTab);
      document.removeEventListener("visibilitychange", refreshVisibleTab);
    };
  }, [
    activeTab,
    isCustomer,
    isKitchen,
    isAdmin,
    refreshActiveOrderCart,
    refreshCustomerUsers,
    refreshKitchen,
    refreshMenuItems,
    refreshOrdersSection,
    refreshReportSection,
    refreshTables,
  ]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  async function handleOpenTable(tableId) {
    if (isKitchen) return;

    if (isCustomer && Number(tableId) !== Number(customerTableId)) {
      showToast("Customer account is not assigned to this table", "error");
      return;
    }

    try {
      const order = await openTableOrder(tableId, USER_ID);

      setSelectedTableId(tableId);
      setActiveOrder(order);

      await refreshCart(order.id);
      if (!isCustomer) {
        await refreshKitchen(order.id);
      }
      await refreshTables();

      setActiveTab("menu");
    } catch (err) {
      console.error("open table failed:", err);
      showToast("Open table failed", "error");
    }
  }

  async function handleAddItem(item) {
    try {
      let order = activeOrder;

      if (!order?.id && isCustomer) {
        showToast("Open your assigned table first", "warning");
        setActiveTab("tables");
        return;
      }

      if (!order?.id) {
        showToast("Select a table first", "warning");
        return;
      }

      const createdItem = await addCartItem({
        orderId: order.id,
        menuItemId: item.id,
        quantity: 1,
      });

      const modifierNotes = isCustomer
        ? []
        : modifierCartNotes(item.selectedModifiers);
      let createdNotes = [];
      let noteWarning = false;

      if (modifierNotes.length > 0) {
        try {
          createdNotes = await Promise.all(
            modifierNotes.map((note) => addCartItemNote(createdItem.id, note)),
          );
        } catch (noteErr) {
          console.error("add modifier notes failed:", noteErr);
          noteWarning = true;
        }
      }

      setCartItems((items) => [
        ...items,
        { ...createdItem, notes: createdNotes },
      ]);

      if (noteWarning) {
        showToast("Item added, but customization notes failed", "warning");
      } else {
        showToast(`${item.name} added to order successfully`);
      }

      try {
        await refreshCart(order.id);
      } catch (refreshErr) {
        console.error("refresh cart after add failed:", refreshErr);
        showToast("Item added, but cart refresh failed", "warning");
      }
    } catch (err) {
      console.error("add item failed:", err);
      showToast(err.message || "Failed to add item", "error");
    }
  }

  async function handleIncrease(item) {
    if (Number(item.isPending) !== 1) {
      showToast("Sent items cannot be changed", "warning");
      return;
    }

    try {
      await updateCartItem(item.id, {
        quantity: Number(item.quantity || 0) + 1,
      });
      await refreshCart();
    } catch (err) {
      console.error("increase item quantity failed:", err);
      showToast("Failed to update quantity", "error");
    }
  }

  async function handleDecrease(item) {
    if (Number(item.isPending) !== 1) {
      showToast("Sent items cannot be changed", "warning");
      return;
    }

    try {
      if (Number(item.quantity) <= 1) {
        await deleteCartItem(item.id);
      } else {
        await updateCartItem(item.id, {
          quantity: Number(item.quantity) - 1,
        });
      }

      await refreshCart();
    } catch (err) {
      console.error("decrease item quantity failed:", err);
      showToast("Failed to update quantity", "error");
    }
  }

  async function handleUpdateTable(updatedTable) {
    try {
      await updateTable(
        updatedTable.id,
        {
          label: updatedTable.label,
          seat: Number(updatedTable.seat),
          tableStatus: updatedTable.tableStatus,
          posX: updatedTable.posX,
          posY: updatedTable.posY,
        },
        USER_ID,
      );

      setTables(await getAllTables());
      showToast("Table updated successfully");
    } catch (err) {
      console.error(err);
      showToast("Failed to update table", "error");
    }
  }

  async function handleAssignCustomerToTable(tableId, customerId) {
    try {
      const updatedCustomerUsers = await assignCustomerToTable(tableId, customerId);

      setCustomerUsers(updatedCustomerUsers);
      showToast(customerId ? "Customer assigned to table" : "Customer assignment cleared");
    } catch (err) {
      console.error("assign customer to table failed:", err);
      showToast(err.message || "Failed to update customer assignment", "error");
      throw err;
    }
  }

  async function handleCloseTableOrder(table, code) {
    try {
      await closeTableOrder(table.id, code);

      if (
        Number(activeOrder?.table?.id) === Number(table.id) ||
        Number(selectedTableId) === Number(table.id)
      ) {
        setActiveOrder(null);
        setSelectedTableId(null);
        setCartItems([]);
        setTips(0);
        setPaymentMethod("CASH");
      }

      await refreshTables();
      await refreshKitchen(null);
      showToast(`${table.label} order closed`);
    } catch (err) {
      console.error("close table order failed:", err);
      showToast(err.message || "Failed to close order", "error");
      throw err;
    }
  }

  async function handleFinishKitchenItem(item) {
    const previousKitchenItems = kitchenItems;

    setKitchenItems((items) =>
      items.filter((kitchenItem) => kitchenItem.id !== item.id),
    );

    try {
      const finishedItem = await finishCartItem(item.id);
      setRecentlyFinishedItems((items) => [
        { ...item, ...finishedItem, isFinished: 1 },
        ...items.filter((recentItem) => recentItem.id !== item.id),
      ].slice(0, 6));
    } catch (err) {
      console.error("finish kitchen item failed:", err);
      setKitchenItems(previousKitchenItems);
      showToast("Failed to finish item", "error");
      return;
    }

    try {
      await refreshKitchen(null);
      await refreshCart();
      showToast(`${item.name || item.nameSnapshot} finished`);
    } catch (err) {
      console.error("refresh after finish failed:", err);
      showToast("Item finished, but refresh failed", "warning");
    }
  }

  async function handleRevertFinishedKitchenItem(item) {
    const previousFinishedItems = recentlyFinishedItems;

    setRecentlyFinishedItems((items) =>
      items.filter((recentItem) => recentItem.id !== item.id),
    );

    try {
      await revertFinishedCartItem(item.id);
      await refreshKitchen(null);
      await refreshCart();
      showToast(`${itemName(item)} moved back to preparing`);
    } catch (err) {
      console.error("revert finished item failed:", err);
      setRecentlyFinishedItems(previousFinishedItems);
      showToast("Failed to revert item", "error");
    }
  }

  async function handleRemove(item) {
    if (Number(item.isPending) !== 1) {
      showToast("Sent items cannot be removed", "warning");
      return;
    }

    try {
      await deleteCartItem(item.id);
      await refreshCart();
      showToast(`${itemName(item)} removed`);
    } catch (err) {
      console.error("remove cart item failed:", err);
      showToast("Failed to remove item", "error");
    }
  }

  async function handleAddCartItemNote(item, payload) {
    if (isCustomer) {
      showToast("Customer orders cannot add notes", "warning");
      return;
    }

    if (Number(item.isPending) !== 1) {
      showToast("Sent items cannot be changed", "warning");
      return;
    }

    try {
      await addCartItemNote(item.id, payload);
      await refreshCart();
      showToast("Note added");
    } catch (err) {
      console.error("add cart item note failed:", err);
      showToast("Failed to add note", "error");
    }
  }

  async function handleUpdateCartItemNote(item, noteId, payload) {
    if (isCustomer) {
      showToast("Customer orders cannot change notes", "warning");
      return;
    }

    if (Number(item.isPending) !== 1) {
      showToast("Sent items cannot be changed", "warning");
      return;
    }

    try {
      await updateCartItemNote(noteId, payload);
      await refreshCart();
      showToast("Note updated");
    } catch (err) {
      console.error("update cart item note failed:", err);
      showToast("Failed to update note", "error");
    }
  }

  async function handleDeleteCartItemNote(item, noteId) {
    if (isCustomer) {
      showToast("Customer orders cannot delete notes", "warning");
      return;
    }

    if (Number(item.isPending) !== 1) {
      showToast("Sent items cannot be changed", "warning");
      return;
    }

    try {
      await deleteCartItemNote(noteId);
      await refreshCart();
      showToast("Note deleted");
    } catch (err) {
      console.error("delete cart item note failed:", err);
      showToast("Failed to delete note", "error");
    }
  }

  async function handleSend() {
    if (pendingItems.length === 0) {
      showToast("No pending items to send", "warning");
      return;
    }

    try {
      await Promise.all(pendingItems.map((item) => sendCartItem(item.id)));

      await refreshCart();
      if (!isCustomer) {
        await refreshKitchen();
      }
      showToast(isCustomer ? "Order placed" : "Sent to kitchen");
    } catch (err) {
      console.error("send pending items failed:", err);
      showToast(
        isCustomer ? "Failed to place order" : "Failed to send to kitchen",
        "error",
      );
    }
  }

  async function handleCheckout(paymentDetails) {
    if (!activeOrder?.id) return;

    if (cartItems.length === 0) {
      showToast("Cart is empty", "warning");
      return;
    }

    try {
      await checkoutOrder(activeOrder.id, {
        transactionMethod: paymentDetails.transactionMethod,
        cardType: paymentDetails.cardType,
        tips: paymentDetails.tips,
        subtotal,
        tax,
        total: paymentDetails.total,
      });

      setActiveOrder(null);
      setSelectedTableId(null);
      setCartItems([]);
      setTips(0);
      setPaymentMethod("CASH");

      await refreshTables();
      showToast("Checkout complete");
    } catch (err) {
      console.error("checkout failed:", err);
      showToast("Checkout failed", "error");
      throw err;
    }
  }

  async function handleOrderUpdated(orderId, options = {}) {
    try {
      await refreshTables();

      if (options.deleted) {
        await refreshKitchen(null);
      }

      if (options.deleted && Number(activeOrder?.id) === Number(orderId)) {
        setActiveOrder(null);
        setSelectedTableId(null);
        setCartItems([]);
        setTips(0);
        setPaymentMethod("CASH");
      }

      if (!options.deleted && orderId && Number(activeOrder?.id) === Number(orderId)) {
        const updatedOrder = await getOrderById(orderId);
        setActiveOrder(updatedOrder);
        setSelectedTableId(updatedOrder.table?.id || null);
        await refreshCart(orderId);
      }
    } catch (err) {
      console.error("refresh after order update failed:", err);
      showToast("Order changed, but page refresh failed", "warning");
    }
  }

  return (
    <div style={styles.page}>
      {toast && (
        <div
          style={{
            position: "fixed",
            top: 20,
            left: "50%",
            transform: "translateX(-50%)",
            background:
              toast.type === "error"
                ? "rgba(220, 38, 38, 0.73)"
                : toast.type === "warning"
                  ? "rgba(234, 178, 8, 0.69)"
                  : "rgba(22, 163, 74, 0.7)",
            color: "white",
            padding: "12px 20px",
            borderRadius: 10,
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            zIndex: 9999,
            fontWeight: 600,
            animation: "fadeInOut 2s ease",
          }}
        >
          {toast.message}
        </div>
      )}

      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Restaurant POS</h1>
          <p style={styles.subtitle}>
            {isCustomer
              ? "Select your assigned table and place an order"
              : isKitchen
                ? "Kitchen tickets and finished-item recovery"
                : "Tables, orders, kitchen, and checkout"}
          </p>
        </div>

        <div style={styles.userBox}>
          {isCustomer && (
            <div style={styles.contextBox}>
              <span style={styles.contextLabel}>Table</span>
              <strong>
                {activeOrder?.table?.label || customerTableLabel || "No table"}
              </strong>
              {customerTableSeat && (
                <span style={styles.contextSub}>{customerTableSeat} seats</span>
              )}
            </div>
          )}

          {!isCustomer && !isKitchen && selectedTable && (
            <div style={styles.contextBox}>
              <span style={styles.contextLabel}>Table</span>
              <strong>{selectedTable.label}</strong>
            </div>
          )}

          {isKitchen && (
            <div style={styles.contextBox}>
              <span style={styles.contextLabel}>Station</span>
              <strong>Kitchen</strong>
            </div>
          )}

          <div>
            <strong>{user?.username}</strong>
            <div style={styles.role}>{user?.role}</div>
          </div>

          <button onClick={onLogout} style={styles.logoutButton}>
            Logout
          </button>
        </div>
      </header>

      <nav style={styles.tabs}>
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={async () => {
              setActiveTab(tab);

              try {
                if (tab === "kitchen") {
                  await refreshKitchen(null);
                }

                if (tab === "cart") {
                  await refreshActiveOrderCart();
                }

                if (tab === "menu") {
                  await refreshMenuItems();
                }

                if (tab === "orders") {
                  refreshOrdersSection();
                }

                if (tab === "report" && isAdmin) {
                  refreshReportSection();
                }

                if (tab === "tables") {
                  if (isCustomer) {
                    await refreshTables();
                  } else {
                    await Promise.all([refreshTables(), refreshCustomerUsers()]);
                  }
                }
              } catch (err) {
                console.error("tab refresh failed:", err);
                showToast(`Failed to refresh ${tab}`, "error");
              }
            }}
            style={{
              ...styles.tabButton,
              ...(activeTab === tab ? styles.activeTab : {}),
            }}
          >
            {tab[0].toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </nav>

      <main style={styles.content}>
        {activeTab === "tables" && (
          <TablesSection
            tables={tables}
            selectedTableId={selectedTableId}
            customerUsers={customerUsers}
            isCustomer={isCustomer}
            canEditTables={!isCustomer && !isKitchen}
            canManageAssignments={!isCustomer && !isKitchen}
            canCloseOrders={!isCustomer && !isKitchen}
            onOpenTable={handleOpenTable}
            onUpdateTable={handleUpdateTable}
            onEditTable={(table) => setEditingTable({ ...table })}
            onAssignCustomer={handleAssignCustomerToTable}
            onCloseOrder={handleCloseTableOrder}
          />
        )}

        {activeTab === "menu" && (
          <MenuSection
            items={menuItems}
            onAddItem={handleAddItem}
            onRefreshMenuItems={refreshMenuItems}
            onNotify={showToast}
            isCustomer={isCustomer}
          />
        )}

        {activeTab === "cart" && (
          <CartSection
            pendingItems={pendingItems}
            currentItems={currentItems}
            subtotal={subtotal}
            tax={tax}
            total={total}
            taxRate={TAX_RATE}
            activeOrder={activeOrder}
            onIncrease={handleIncrease}
            onDecrease={handleDecrease}
            onRemove={handleRemove}
            onAddNote={handleAddCartItemNote}
            onUpdateNote={handleUpdateCartItemNote}
            onDeleteNote={handleDeleteCartItemNote}
            onSend={handleSend}
            onRefresh={handleRefreshCartSection}
            onCheckout={handleCheckout}
            onNotify={showToast}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            tips={tips}
            setTips={setTips}
            isCustomer={isCustomer}
          />
        )}

        {activeTab === "orders" && (
          <OrdersSection
            onOrderUpdated={handleOrderUpdated}
            onNotify={showToast}
            refreshKey={ordersRefreshKey}
          />
        )}
        {activeTab === "kitchen" && (
          <KitchenSection
            items={kitchenItems}
            recentlyFinishedItems={recentlyFinishedItems}
            onFinish={handleFinishKitchenItem}
            onRevertFinish={handleRevertFinishedKitchenItem}
            onRefresh={async () => {
              try {
                await refreshKitchen(null);
                showToast("Kitchen refreshed");
              } catch (err) {
                console.error("refresh kitchen failed:", err);
                showToast("Failed to refresh kitchen", "error");
              }
            }}
          />
        )}
        {activeTab === "report" && isAdmin && (
          <ReportSection
            onNotify={showToast}
            refreshKey={reportRefreshKey}
          />
        )}
      </main>

      {editingTable && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.modal}>
            <h3>Edit Table</h3>

            <input
              placeholder="Label"
              value={editingTable.label || ""}
              onChange={(e) =>
                setEditingTable({ ...editingTable, label: e.target.value })
              }
            />

            <input
              type="number"
              placeholder="Seat"
              value={editingTable.seat || 1}
              onChange={(e) =>
                setEditingTable({ ...editingTable, seat: e.target.value })
              }
            />

            <select
              value={editingTable.tableStatus}
              onChange={(e) =>
                setEditingTable({
                  ...editingTable,
                  tableStatus: e.target.value,
                })
              }
            >
              <option value="AVAILABLE">Available</option>
              <option value="RESERVED">Reserved</option>
              <option value="OCCUPIED">Occupied</option>
            </select>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={async () => {
                  await handleUpdateTable({
                    ...editingTable,
                    seat: Number(editingTable.seat),
                  });
                  setEditingTable(null);
                }}
              >
                Save
              </button>

              <button onClick={() => setEditingTable(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const modalStyles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  modal: {
    background: "white",
    padding: 24,
    borderRadius: 12,
    width: 300,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
};

const styles = {
  page: {
    padding: 24,
    fontFamily: "Arial, sans-serif",
    background: "#f3f4f6",
    minHeight: "100vh",
  },

  header: {
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: 18,
    padding: 20,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  title: {
    margin: 0,
    fontSize: 32,
    fontWeight: 800,
  },

  subtitle: {
    margin: "6px 0 0",
    color: "#6b7280",
  },

  userBox: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    flexWrap: "wrap",
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: "10px 12px",
  },

  contextBox: {
    borderRight: "1px solid #e5e7eb",
    paddingRight: 14,
    minWidth: 86,
  },

  contextLabel: {
    display: "block",
    color: "#6b7280",
    fontSize: 11,
    fontWeight: 900,
    textTransform: "uppercase",
  },

  contextSub: {
    display: "block",
    marginTop: 2,
    color: "#6b7280",
    fontSize: 12,
    fontWeight: 700,
  },

  role: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: 700,
  },

  logoutButton: {
    border: "none",
    background: "#111827",
    color: "white",
    padding: "9px 12px",
    borderRadius: 10,
    fontWeight: 700,
    cursor: "pointer",
  },

  tabs: {
    display: "flex",
    gap: 10,
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    padding: 10,
    marginBottom: 20,
  },

  tabButton: {
    border: "none",
    background: "transparent",
    padding: "11px 18px",
    borderRadius: 12,
    fontWeight: 800,
    color: "#374151",
    cursor: "pointer",
  },

  activeTab: {
    background: "#111827",
    color: "white",
  },

  content: {
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: 18,
    padding: 20,
  },
};

export default POSPage;

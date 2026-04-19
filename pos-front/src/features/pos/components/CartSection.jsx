import { useMemo, useState } from "react";
import { ROLES } from "../../../constants/roles";

function roundToTwo(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

function formatMoney(value) {
  return roundToTwo(value).toFixed(2);
}

function isValidMoneyInput(value) {
  return /^\d*(\.\d{0,2})?$/.test(value);
}

function sanitizeMoneyInput(value, fallback = "0.00") {
  const normalized = String(value ?? "").trim();
  if (normalized === "" || normalized === ".") return fallback;
  return formatMoney(normalized);
}

function buildCashShortcuts(amountDue) {
  const exact = roundToTwo(amountDue);
  const nextDollar = Math.ceil(exact);
  const nextTen = Math.ceil(exact / 10) * 10;
  const nextHundred = Math.ceil(exact / 100) * 100;

  return [exact, nextDollar, nextTen, nextHundred]
    .map((value) => roundToTwo(value))
    .filter((value, index, array) => array.indexOf(value) === index)
    .sort((a, b) => a - b);
}

function CheckoutModal({
  order,
  itemCount,
  subtotal,
  tax,
  total,
  onClose,
  onConfirm,
  onNotify,
}) {
  const [payment, setPayment] = useState(order?.payment === "card" ? "card" : "cash");
  const [cardType, setCardType] = useState(
    order?.payment === "card" ? order?.cardType || "visa" : "visa"
  );
  const [cashReceived, setCashReceived] = useState("");
  const [tips, setTips] = useState(
    order?.tips !== undefined && order?.tips !== null
      ? formatMoney(order.tips)
      : "0.00"
  );

  const parsedCash = roundToTwo(cashReceived || 0);
  const parsedTips = roundToTwo(tips || 0);
  const amountDue = roundToTwo(total + parsedTips);
  const change = payment === "cash" ? roundToTwo(parsedCash - amountDue) : 0;
  const cashShortcuts = useMemo(() => buildCashShortcuts(amountDue), [amountDue]);

  const handleTipsChange = (value) => {
    if (!isValidMoneyInput(value)) return;
    setTips(value);
  };

  const handleCashChange = (value) => {
    if (!isValidMoneyInput(value)) return;
    setCashReceived(value);
  };

  const handleConfirm = () => {
    if (!order) return;

    const hasInsufficientCash =
      payment === "cash" && (Number.isNaN(parsedCash) || parsedCash < amountDue);
    const hasInvalidCard =
      payment === "card" && (!cardType || cardType === "none");

    if (hasInsufficientCash || hasInvalidCard) {
      const errorMessage = hasInsufficientCash
        ? "Not enough cash to cover this order."
        : "Card payment could not be completed.";

      onClose?.();

      if (typeof window !== "undefined") {
        window.setTimeout(() => {
          onNotify?.(errorMessage, "error");
        }, 0);
      } else {
        onNotify?.(errorMessage, "error");
      }

      return;
    }

    onConfirm?.({
      payment,
      cardType: payment === "card" ? cardType || "visa" : "none",
      tips: parsedTips,
      cashReceived: payment === "cash" ? parsedCash : 0,
      change: payment === "cash" ? change : 0,
    });
    onClose?.();
  };

  const handlePrint = () => {
    if (typeof window !== "undefined" && typeof window.print === "function") {
      window.print();
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.checkoutModal}>
        <div style={styles.modalHeader}>
          <div>
            <h2 style={styles.modalTitle}>Checkout</h2>
            <p style={styles.modalSubtitle}>
              {order?.orderNumber || "Current Order"} • {order?.type || "order"}
            </p>
          </div>

          <button type="button" onClick={onClose} style={styles.closeButton}>
            ×
          </button>
        </div>

        <div style={styles.checkoutSummary}>
          <div style={styles.summaryRow}>
            <span>Items</span>
            <strong>{itemCount}</strong>
          </div>
          <div style={styles.summaryRow}>
            <span>Subtotal</span>
            <strong>${formatMoney(subtotal)}</strong>
          </div>
          <div style={styles.summaryRow}>
            <span>Tax</span>
            <strong>${formatMoney(tax)}</strong>
          </div>
          <div style={styles.summaryRow}>
            <span>Total</span>
            <strong>${formatMoney(total)}</strong>
          </div>
        </div>

        <div style={styles.sectionBlock}>
          <div style={styles.sectionLabel}>Payment</div>
          <div style={styles.choiceRow}>
            <button
              type="button"
              onClick={() => setPayment("cash")}
              style={{
                ...styles.choiceButton,
                ...(payment === "cash" ? styles.choiceButtonActive : {}),
              }}
            >
              Cash
            </button>
            <button
              type="button"
              onClick={() => {
                setPayment("card");
                if (!cardType || cardType === "none") setCardType("visa");
              }}
              style={{
                ...styles.choiceButton,
                ...(payment === "card" ? styles.choiceButtonActive : {}),
              }}
            >
              Card
            </button>
          </div>
        </div>

        {payment === "card" && (
          <div style={styles.sectionBlock}>
            <div style={styles.sectionLabel}>Card Type</div>
            <div style={styles.choiceGridFive}>
              {[
                ["visa", "Visa"],
                ["mastercard", "Mastercard"],
                ["amex", "Amex"],
                ["discover", "Discover"],
                ["others", "Others"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setCardType(value)}
                  style={{
                    ...styles.choiceButton,
                    ...(cardType === value ? styles.choiceButtonActive : {}),
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={styles.formGrid}>
          <label style={styles.fieldGroup}>
            <span style={styles.fieldLabel}>Tips</span>
            <input
              type="text"
              inputMode="decimal"
              value={tips}
              onChange={(e) => handleTipsChange(e.target.value)}
              onBlur={() => setTips((prev) => sanitizeMoneyInput(prev))}
              onFocus={(e) => e.target.select()}
              onClick={(e) => e.target.select()}
              style={styles.input}
            />
          </label>

          {payment === "cash" ? (
            <label style={styles.fieldGroup}>
              <span style={styles.fieldLabel}>Cash Received</span>
              <input
                type="text"
                inputMode="decimal"
                value={cashReceived}
                onChange={(e) => handleCashChange(e.target.value)}
                onBlur={() => setCashReceived((prev) => sanitizeMoneyInput(prev, ""))}
                onFocus={(e) => e.target.select()}
                onClick={(e) => e.target.select()}
                style={styles.input}
                placeholder="0.00"
              />
            </label>
          ) : (
            <div style={styles.fieldGroup}>
              <span style={styles.fieldLabel}>Amount Charged</span>
              <div style={styles.readOnlyValue}>${formatMoney(amountDue)}</div>
            </div>
          )}
        </div>

        {payment === "cash" && (
          <div style={styles.sectionBlock}>
            <div style={styles.sectionLabel}>Quick Cash</div>
            <div style={styles.choiceGrid}>
              {cashShortcuts.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setCashReceived(formatMoney(value))}
                  style={styles.shortcutButton}
                >
                  ${formatMoney(value)}
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={styles.checkoutSummary}>
          <div style={styles.summaryRow}>
            <span>Tips</span>
            <strong>${formatMoney(parsedTips)}</strong>
          </div>
          <div style={styles.summaryRow}>
            <span>{payment === "cash" ? "Change" : "Charge Total"}</span>
            <strong>
              {payment === "cash"
                ? change < 0
                  ? `-$${formatMoney(Math.abs(change))}`
                  : `$${formatMoney(change)}`
                : `$${formatMoney(amountDue)}`}
            </strong>
          </div>
        </div>

        <div style={styles.modalFooter}>
          <button type="button" onClick={onClose} style={styles.secondaryButton}>
            Cancel
          </button>
          <button type="button" onClick={handlePrint} style={styles.printButton}>
            Print
          </button>
          <button type="button" onClick={handleConfirm} style={styles.primaryButton}>
            Confirm Checkout
          </button>
        </div>
      </div>
    </div>
  );
}

function CartSection({
  role,
  selectedTableId,
  selectedTableName,
  currentOrder = [],
  pendingOrder = [],
  onAddItemToPending,
  onIncreasePending,
  onDecreasePending,
  onRemovePending,
  onSendPending,
  activeOrder = null,
  taxRate = 0.1,
  onCheckout,
  onNotify,
}) {
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showTimes, setShowTimes] = useState(true);
  const isCustomer = role === ROLES.CUSTOMER;

  const getItemIdentity = (item) => {
    const modifiers = item.selectedModifiers || {};
    const add = modifiers.add || [];
    const no = modifiers.no || [];
    const switchPair = modifiers.switchPair || null;

    return JSON.stringify({
      id: item.id,
      add,
      no,
      switchPair,
    });
  };

  
  const renderModifierDetails = (item) => {
    const modifiers = item.selectedModifiers;
    if (!modifiers) return null;

    const elements = [];

    if (modifiers.add?.length) {
      modifiers.add.forEach((m, i) => {
        elements.push(
          <span key={`add-${i}`} style={styles.modifierInline}>
            <span style={styles.modAdd}>+</span> {m}
          </span>
        );
      });
    }

    if (modifiers.no?.length) {
      modifiers.no.forEach((m, i) => {
        elements.push(
          <span key={`no-${i}`} style={styles.modifierInline}>
            <span style={styles.modNo}>-</span> {m}
          </span>
        );
      });
    }

    if (modifiers.switchPair) {
      elements.push(
        <span key="switch" style={styles.modifierInline}>
          <span style={styles.modSwitch}>⇄</span>{" "}
          {modifiers.switchPair.from} → {modifiers.switchPair.to}
        </span>
      );
    }

    if (!elements.length) return null;

    return <div style={styles.modifierInlineWrap}>{elements}</div>;
  };


  const currentSubtotal = useMemo(() => {
    return roundToTwo(
      currentOrder.reduce((sum, item) => sum + item.price * item.quantity, 0)
    );
  }, [currentOrder]);

  const pendingSubtotal = useMemo(() => {
    return roundToTwo(
      pendingOrder.reduce((sum, item) => sum + item.price * item.quantity, 0)
    );
  }, [pendingOrder]);

  const checkoutSubtotal = useMemo(() => {
    return roundToTwo(currentSubtotal + pendingSubtotal);
  }, [currentSubtotal, pendingSubtotal]);

  const currentTax = useMemo(() => {
    return roundToTwo(currentSubtotal * taxRate);
  }, [currentSubtotal, taxRate]);

  const checkoutTax = useMemo(() => {
    return roundToTwo(checkoutSubtotal * taxRate);
  }, [checkoutSubtotal, taxRate]);

  const currentTotal = useMemo(() => {
    return roundToTwo(currentSubtotal + currentTax);
  }, [currentSubtotal, currentTax]);

  const checkoutTotal = useMemo(() => {
    return roundToTwo(checkoutSubtotal + checkoutTax);
  }, [checkoutSubtotal, checkoutTax]);

  const pendingTotal = useMemo(() => pendingSubtotal, [pendingSubtotal]);

  const currentItemsCount = useMemo(() => {
    return currentOrder.reduce((sum, item) => sum + item.quantity, 0);
  }, [currentOrder]);

  const pendingItemsCount = useMemo(() => {
    return pendingOrder.reduce((sum, item) => sum + item.quantity, 0);
  }, [pendingOrder]);

  const checkoutItemsCount = useMemo(() => {
    return currentItemsCount + pendingItemsCount;
  }, [currentItemsCount, pendingItemsCount]);

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <div style={styles.headerRow}>
          <div>
            <h2 style={styles.title}>Cart</h2>
            <p style={styles.subtitle}>
              {selectedTableId
                ? `${selectedTableName || `Table ${selectedTableId}`}`
                : activeOrder?.orderNumber && ["to-go", "delivery"].includes(activeOrder?.type)
                ? `${activeOrder.orderNumber} • ${
                    activeOrder.type === "to-go" ? "To-Go" : "Delivery"
                  }`
                : isCustomer
                ? "Review your current and pending order."
                : "No table selected"}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowTimes((prev) => !prev)}
            style={{
              ...styles.timeToggleButton,
              ...(showTimes ? styles.timeToggleButtonActive : {}),
            }}
          >
            {showTimes ? "Hide Time" : "Show Time"}
          </button>
        </div>
      </div>

      <div style={styles.grid}>
        <section style={styles.panel}>
          <div style={styles.panelHeader}>
            <div>
              <h3 style={styles.panelTitle}>Current Order</h3>
            </div>
          </div>

          {currentOrder.length === 0 ? (
            <div style={styles.emptyState}>No items in the current order.</div>
          ) : (
            <div style={styles.list}>
              {currentOrder.map((item, index) => (
                <div
                  key={`${getItemIdentity(item)}-${index}`}
                  style={{
                    ...styles.itemCard,
                    ...(item.kitchenFinished ? styles.itemCardFinished : {}),
                  }}
                >
                  <div style={styles.itemContent}>
                    <div style={styles.itemTitleRow}>
                      <h4 style={styles.itemName}>{item.name}</h4>

                      <span
                        style={{
                          ...styles.kitchenCheck,
                          ...(item.kitchenFinished ? styles.kitchenCheckActive : {}),
                        }}
                        title={
                          item.kitchenFinished
                            ? "Finished by kitchen"
                            : "Still preparing in kitchen"
                        }
                      >
                        ✓
                      </span>
                    </div>

                    <p style={styles.itemMeta}>
                      ${formatMoney(item.price)} × {item.quantity}
                    </p>
                    {showTimes && item.sentTime ? (
                      <p style={styles.timeText}>Sent to kitchen: {item.sentTime}</p>
                    ) : null}
                    {renderModifierDetails(item)}
                  </div>

                  <div style={styles.itemActions}>
                    <button
                      type="button"
                      style={styles.plusButton}
                      onClick={() => onAddItemToPending?.(item)}
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
              <span>Subtotal</span>
              <strong>${formatMoney(currentSubtotal)}</strong>
            </div>
            <div style={styles.summaryRow}>
              <span>Tax</span>
              <strong>${formatMoney(currentTax)}</strong>
            </div>
            <div style={styles.summaryRow}>
              <span>Total</span>
              <strong>${formatMoney(currentTotal)}</strong>
            </div>

            <div style={styles.checkoutButtonWrap}>
              <button
                type="button"
                style={{
                  ...styles.checkoutButton,
                  ...(currentOrder.length === 0 && pendingOrder.length === 0
                    ? styles.sendButtonDisabled
                    : {}),
                }}
                onClick={() => setShowCheckoutModal(true)}
                disabled={
                  (currentOrder.length === 0 && pendingOrder.length === 0) ||
                  !activeOrder
                }
              >
                Checkout
              </button>
            </div>
          </div>
        </section>

        <section style={styles.panel}>
          <div style={styles.panelHeader}>
            <div>
              <h3 style={styles.panelTitle}>Pending Order</h3>
            </div>

            <button
              type="button"
              style={{
                ...styles.sendButton,
                ...(pendingOrder.length === 0 ? styles.sendButtonDisabled : {}),
              }}
              onClick={onSendPending}
              disabled={pendingOrder.length === 0}
            >
              Send
            </button>
          </div>

          {pendingOrder.length === 0 ? (
            <div style={styles.emptyState}>No items in the pending order.</div>
          ) : (
            <div style={styles.list}>
              {pendingOrder.map((item, index) => (
                <div key={`${getItemIdentity(item)}-${index}`} style={styles.itemCard}>
                  <div style={styles.itemContent}>
                    <h4 style={styles.itemName}>{item.name}</h4>
                    <p style={styles.itemMeta}>
                      ${formatMoney(item.price)} × {item.quantity}
                    </p>
                    {showTimes && item.addedTime ? (
                      <p style={styles.timeText}>Added to pending: {item.addedTime}</p>
                    ) : null}
                    {renderModifierDetails(item)}
                  </div>

                  <div style={styles.itemActions}>
                    <button
                      type="button"
                      style={styles.smallButton}
                      onClick={() => onDecreasePending?.(item)}
                    >
                      -
                    </button>

                    <span style={styles.qtyText}>{item.quantity}</span>

                    <button
                      type="button"
                      style={styles.plusButton}
                      onClick={() => onIncreasePending?.(item)}
                    >
                      +
                    </button>

                    <button
                      type="button"
                      style={styles.removeButton}
                      onClick={() => onRemovePending?.(item)}
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
              <strong>${formatMoney(pendingTotal)}</strong>
            </div>
          </div>
        </section>
      </div>

      {showCheckoutModal && activeOrder && (
        <CheckoutModal
          order={activeOrder}
          itemCount={checkoutItemsCount}
          subtotal={checkoutSubtotal}
          tax={checkoutTax}
          total={checkoutTotal}
          onClose={() => setShowCheckoutModal(false)}
          onConfirm={(payload) => onCheckout?.(activeOrder.id, payload)}
          onNotify={onNotify}
        />
      )}
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
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
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
    gridTemplateColumns: "0.8fr 1.2fr",
    gap: "20px",
  },
  panel: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "18px",
    padding: "20px",
    minHeight: "560px",
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
  },
  panelTitle: {
    margin: 0,
    fontSize: "22px",
  },
  emptyState: {
    border: "1px dashed #d1d5db",
    borderRadius: "14px",
    padding: "18px",
    color: "#6b7280",
    background: "#f9fafb",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    overflowY: "auto",
    maxHeight: "420px",
    paddingRight: "6px",
  },
  itemCard: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    padding: "14px",
    borderRadius: "14px",
    border: "1px solid #e5e7eb",
    background: "#f9fafb",
  },
  itemContent: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  itemTitleRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
  },
  kitchenCheck: {
    width: "24px",
    height: "24px",
    minWidth: "24px",
    borderRadius: "999px",
    border: "1px solid #cbd5e1",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: 700,
    color: "transparent",
    background: "#ffffff",
  },
  kitchenCheckActive: {
    background: "#dcfce7",
    borderColor: "#86efac",
    color: "#166534",
  },
  itemCardFinished: {
    borderColor: "#bbf7d0",
    background: "#f0fdf4",
  },
  itemName: {
    margin: 0,
    fontSize: "17px",
  },
  itemMeta: {
    margin: 0,
    color: "#4b5563",
    fontSize: "14px",
  },
  timeText: {
    margin: 0,
    color: "#2563eb",
    fontSize: "12px",
    fontWeight: 700,
  },
  modifierList: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  modifierText: {
    margin: 0,
    fontSize: "13px",
    color: "#4b5563",
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
    gap: "12px",
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
  checkoutButtonWrap: {
    marginTop: "12px",
    display: "flex",
    justifyContent: "flex-end",
  },
  checkoutButton: {
    border: "none",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #1d4ed8, #0f172a)",
    color: "#ffffff",
    padding: "12px 18px",
    cursor: "pointer",
    fontWeight: 700,
    alignSelf: "flex-end",
    boxShadow: "0 10px 20px rgba(29, 78, 216, 0.22)",
  },
  sendButtonDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(17, 24, 39, 0.45)",
    display: "grid",
    placeItems: "center",
    zIndex: 1000,
    padding: "20px",
  },
  timeToggleButton: {
    border: "1px solid #e5e7eb",
    background: "linear-gradient(135deg, #ffffff, #f3f4f6)",
    color: "#374151",
    padding: "10px 16px",
    borderRadius: "999px",
    cursor: "pointer",
    fontWeight: 700,
    whiteSpace: "nowrap",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
    transition: "all 0.2s ease",
  },
  timeToggleButtonActive: {
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "#ffffff",
    border: "1px solid #1d4ed8",
    boxShadow: "0 8px 20px rgba(37, 99, 235, 0.25)",
  },
  checkoutModal: {
    width: "100%",
    maxWidth: "610px",
    background: "#ffffff",
    borderRadius: "20px",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "18px",
    boxShadow: "0 24px 64px rgba(0, 0, 0, 0.16)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
  },
  modalTitle: {
    margin: 0,
    fontSize: "26px",
  },
  modalSubtitle: {
    margin: "6px 0 0",
    color: "#6b7280",
  },
  closeButton: {
    border: "none",
    background: "transparent",
    fontSize: "28px",
    lineHeight: 1,
    cursor: "pointer",
  },
  sectionBlock: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  sectionLabel: {
    fontWeight: 700,
    color: "#374151",
    fontSize: "15px",
  },
  choiceRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
  },
  choiceGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "10px",
  },
  choiceGridFive: {
    display: "grid",
    gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
    gap: "10px",
  },
  choiceButton: {
    border: "1px solid #d1d5db",
    background: "#ffffff",
    borderRadius: "12px",
    padding: "12px 14px",
    cursor: "pointer",
    fontWeight: 700,
    color: "#111827",
  },
  choiceButtonActive: {
    background: "#111827",
    color: "#ffffff",
    borderColor: "#111827",
    boxShadow: "0 8px 20px rgba(17, 24, 39, 0.18)",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "14px",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  fieldLabel: {
    fontWeight: 600,
    color: "#374151",
  },
  input: {
    padding: "12px 14px",
    borderRadius: "12px",
    border: "1px solid #d1d5db",
    fontSize: "15px",
  },
  readOnlyValue: {
    padding: "12px 14px",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    fontSize: "15px",
    background: "#f9fafb",
    color: "#111827",
    minHeight: "48px",
    display: "flex",
    alignItems: "center",
    fontWeight: 700,
  },
  shortcutButton: {
    border: "1px solid #d1d5db",
    background: "#f9fafb",
    borderRadius: "12px",
    padding: "12px 14px",
    cursor: "pointer",
    fontWeight: 700,
    color: "#111827",
  },
  checkoutSummary: {
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    background: "#f9fafb",
  },
  modalFooter: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
  },
  secondaryButton: {
    border: "1px solid #d1d5db",
    background: "#ffffff",
    borderRadius: "10px",
    padding: "10px 14px",
    cursor: "pointer",
    fontWeight: 600,
  },
  printButton: {
    border: "1px solid #cbd5e1",
    background: "#eff6ff",
    color: "#1d4ed8",
    borderRadius: "10px",
    padding: "10px 14px",
    cursor: "pointer",
    fontWeight: 700,
  },
  primaryButton: {
    border: "none",
    background: "#111827",
    color: "#ffffff",
    borderRadius: "10px",
    padding: "10px 14px",
    cursor: "pointer",
    fontWeight: 700,
  },

  modifierInlineWrap: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "4px",
  },
  modifierInline: {
    fontSize: "13px",
    color: "#374151",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  modAdd: {
    color: "#16a34a",
    fontWeight: 900,
  },
  modNo: {
    color: "#dc2626",
    fontWeight: 900,
  },
  modSwitch: {
    color: "#eab308",
    fontWeight: 900,
  },

};

export default CartSection;

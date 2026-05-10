import { useState } from "react";

function money(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function roundMoney(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

function isValidMoneyInput(value) {
  return /^\d*(\.\d{0,2})?$/.test(value);
}

function buildCashShortcuts(amountDue) {
  const roundedDue = roundMoney(amountDue);
  const nextDollar = Math.ceil(roundedDue);
  const nextTen = Math.ceil(roundedDue / 10) * 10;
  const billOptions = [20, 50, 100, 200].filter((value) => value > roundedDue);

  return [nextDollar, nextTen, ...billOptions]
    .filter((value) => value >= roundedDue)
    .filter((value, index, values) => values.indexOf(value) === index)
    .slice(0, 5);
}

function itemName(item) {
  return item.nameSnapshot || item.name || "Menu item";
}

function itemPrice(item) {
  return Number(item.priceSnapshot ?? item.price ?? 0);
}

function itemNotesTotal(item) {
  return (item.notes || []).reduce(
    (sum, note) => sum + Number(note.price || 0),
    0,
  );
}

function itemTotal(item) {
  return (itemPrice(item) + itemNotesTotal(item)) * Number(item.quantity || 0);
}

function CartItemRow({
  item,
  canEdit,
  canManageNotes,
  statusLabel,
  noteDrafts,
  setNoteDrafts,
  onIncrease,
  onDecrease,
  onRemove,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
}) {
  const [showNotes, setShowNotes] = useState(false);
  const newNoteKey = `new-note-${item.id}`;
  const newPriceKey = `new-price-${item.id}`;
  const newNote = noteDrafts[newNoteKey] ?? "";
  const newPrice = noteDrafts[newPriceKey] ?? "0.00";

  function getNoteDraft(note, field) {
    const key = `${field}-${note.id}`;
    return noteDrafts[key] ?? (field === "price" ? String(Number(note.price || 0).toFixed(2)) : note.note || "");
  }

  return (
    <div style={styles.itemRow}>
      <div style={styles.itemRowTop}>
        <div style={styles.itemMain}>
          <div style={styles.itemTopLine}>
            <strong style={styles.itemName}>{itemName(item)}</strong>
            <span
              style={
                canEdit
                  ? styles.pendingPill
                  : statusLabel === "Finished"
                    ? styles.finishedPill
                    : styles.preparingPill
              }
            >
              {statusLabel}
            </span>
          </div>

          <div style={styles.itemMeta}>
            {money(itemPrice(item))} x {item.quantity}
            {itemNotesTotal(item) > 0 ? ` + ${money(itemNotesTotal(item))} notes` : ""}
          </div>
        </div>

        <div style={styles.itemRight}>
          <strong>{money(itemTotal(item))}</strong>

          {canEdit && (
            <div style={styles.qtyControls}>
              <button
                type="button"
                aria-label={`Decrease ${itemName(item)}`}
                style={styles.qtyButton}
                onClick={() => onDecrease(item)}
              >
                -
              </button>
              <span style={styles.qty}>{item.quantity}</span>
              <button
                type="button"
                aria-label={`Increase ${itemName(item)}`}
                style={styles.qtyButton}
                onClick={() => onIncrease(item)}
              >
                +
              </button>
              {canManageNotes && (
                <button
                  type="button"
                  style={styles.noteButton}
                  onClick={() => setShowNotes((value) => !value)}
                >
                  Notes
                </button>
              )}
              <button
                type="button"
                style={styles.removeButton}
                onClick={() => onRemove(item)}
              >
                Remove
              </button>
            </div>
          )}
        </div>
      </div>

      {canEdit && canManageNotes && showNotes && (
        <div style={styles.notesPanel}>
          {(item.notes || []).length === 0 ? (
            <p style={styles.emptyNote}>No notes yet.</p>
          ) : (
            (item.notes || []).map((note) => {
              const noteValue = getNoteDraft(note, "note");
              const priceValue = getNoteDraft(note, "price");

              return (
                <div key={note.id} style={styles.noteRow}>
                  <input
                    value={noteValue}
                    onChange={(e) =>
                      setNoteDrafts({
                        ...noteDrafts,
                        [`note-${note.id}`]: e.target.value,
                      })
                    }
                    style={styles.noteInput}
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={priceValue}
                    onChange={(e) => {
                      if (!isValidMoneyInput(e.target.value)) return;

                      setNoteDrafts({
                        ...noteDrafts,
                        [`price-${note.id}`]: e.target.value,
                      })
                    }}
                    style={styles.notePriceInput}
                  />
                  <button
                    type="button"
                    style={styles.noteSaveButton}
                    onClick={() =>
                      onUpdateNote(item, note.id, {
                        note: noteValue,
                        price: Number(priceValue) || 0,
                      })
                    }
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    style={styles.noteDeleteButton}
                    onClick={() => onDeleteNote(item, note.id)}
                  >
                    Delete
                  </button>
                </div>
              );
            })
          )}

          <div style={styles.noteRow}>
            <input
              value={newNote}
              placeholder="Kitchen note or addition"
              onChange={(e) =>
                setNoteDrafts({ ...noteDrafts, [newNoteKey]: e.target.value })
              }
              style={styles.noteInput}
            />
            <input
              type="number"
              min="0"
              step="0.01"
              value={newPrice}
              onChange={(e) => {
                if (!isValidMoneyInput(e.target.value)) return;

                setNoteDrafts({ ...noteDrafts, [newPriceKey]: e.target.value })
              }}
              style={styles.notePriceInput}
            />
            <button
              type="button"
              style={styles.noteSaveButton}
              onClick={async () => {
                if (!newNote.trim()) return;
                await onAddNote(item, {
                  note: newNote.trim(),
                  price: Number(newPrice) || 0,
                });
                setNoteDrafts({
                  ...noteDrafts,
                  [newNoteKey]: "",
                  [newPriceKey]: "0.00",
                });
              }}
            >
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function CartSection({
  pendingItems,
  currentItems,
  subtotal,
  tax,
  total,
  taxRate,
  activeOrder,
  onIncrease,
  onDecrease,
  onRemove,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
  onSend,
  onRefresh,
  onCheckout,
  onNotify,
  paymentMethod,
  setPaymentMethod,
  tips,
  setTips,
  isCustomer,
}) {
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [cashReceived, setCashReceived] = useState("");
  const [cardType, setCardType] = useState("");
  const [noteDrafts, setNoteDrafts] = useState({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  const hasOrder = Boolean(activeOrder?.id);
  const hasItems = pendingItems.length + currentItems.length > 0;
  const canSend = pendingItems.length > 0;
  const canCheckout = hasOrder && hasItems && !isCustomer;
  const canManageNotes = !isCustomer;
  const tipAmount = Number(tips) || 0;
  const amountDue = roundMoney(subtotal + tax + tipAmount);
  const cashAmount = roundMoney(cashReceived || 0);
  const changeDue = roundMoney(cashAmount - amountDue);
  const cashShortcuts = buildCashShortcuts(amountDue);

  function handleOpenCheckout() {
    setCashReceived("");
    setCardType("");
    setPaymentMethod("CASH");
    setShowCheckoutModal(true);
  }

  async function handleRefreshCart() {
    if (!hasOrder || !onRefresh) {
      onNotify?.("Open a table first", "warning");
      return;
    }

    setIsRefreshing(true);

    try {
      await onRefresh();
      onNotify?.("Cart refreshed");
    } catch (err) {
      console.error("refresh cart failed:", err);
      onNotify?.("Failed to refresh cart", "error");
    } finally {
      setIsRefreshing(false);
    }
  }

  async function handleConfirmCheckout() {
    if (paymentMethod === "CASH" && cashAmount < amountDue) {
      onNotify?.("Cash received must cover the amount due", "warning");
      return;
    }

    if (paymentMethod === "CARD" && !cardType) {
      onNotify?.("Select a card type before checkout", "warning");
      return;
    }

    try {
      await onCheckout({
        transactionMethod: paymentMethod,
        cardType: paymentMethod === "CARD" ? cardType : "NONE",
        tips: tipAmount,
        total: amountDue,
      });
      setShowCheckoutModal(false);
    } catch {
      // Parent shows the toast; keep the modal open so payment can be fixed.
    }
  }

  return (
    <section style={styles.section}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Cart</h2>
          <p style={styles.subtitle}>
            {hasOrder
              ? `Order #${activeOrder.id}`
              : isCustomer
                ? "Add menu items to start your order"
                : "Select a table to start an order"}
          </p>
        </div>

        <div style={styles.headerActions}>
          <button
            type="button"
            onClick={handleRefreshCart}
            disabled={!hasOrder || isRefreshing}
            style={{
              ...styles.refreshButton,
              ...(!hasOrder || isRefreshing ? styles.disabledButton : {}),
            }}
          >
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </button>

          {!isCustomer && (
            <div style={styles.headerTotals}>
              <span style={styles.headerTotalLabel}>Due</span>
              <strong style={styles.headerTotal}>{money(total)}</strong>
            </div>
          )}
        </div>
      </div>

      <div style={styles.grid}>
        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <div>
              <h3 style={styles.panelTitle}>Pending Items</h3>
              <p style={styles.panelHint}>
                {isCustomer ? "Editable before placing" : "Editable before sending"}
              </p>
            </div>
            <span style={styles.badge}>{pendingItems.length}</span>
          </div>

          <div style={styles.itemList}>
            {pendingItems.length === 0 ? (
              <p style={styles.empty}>
                {hasOrder
                  ? "No pending items."
                  : isCustomer
                    ? "Add your first menu item."
                    : "Open a table first."}
              </p>
            ) : (
              pendingItems.map((item) => (
                <CartItemRow
                  key={item.id}
                  item={item}
                  canEdit
                  canManageNotes={canManageNotes}
                  statusLabel="Pending"
                  noteDrafts={noteDrafts}
                  setNoteDrafts={setNoteDrafts}
                  onIncrease={onIncrease}
                  onDecrease={onDecrease}
                  onRemove={onRemove}
                  onAddNote={onAddNote}
                  onUpdateNote={onUpdateNote}
                  onDeleteNote={onDeleteNote}
                />
              ))
            )}
          </div>

          <button
            type="button"
            onClick={onSend}
            style={{
              ...styles.sendButton,
              ...(canSend ? {} : styles.disabledButton),
            }}
            disabled={!canSend}
          >
            {isCustomer ? "Place Order" : "Send to Kitchen"}
          </button>
        </div>

        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <div>
              <h3 style={styles.panelTitle}>Sent Items</h3>
              <p style={styles.panelHint}>
                {isCustomer ? "Locked after placing" : "Locked after kitchen send"}
              </p>
            </div>
            <span style={styles.badge}>{currentItems.length}</span>
          </div>

          <div style={styles.itemList}>
            {currentItems.length === 0 ? (
              <p style={styles.empty}>No sent items.</p>
            ) : (
              currentItems.map((item) => (
                <CartItemRow
                  key={item.id}
                  item={item}
                  canEdit={false}
                  canManageNotes={false}
                  statusLabel={
                    Number(item.isFinished) === 1 ? "Finished" : "Preparing"
                  }
                  noteDrafts={noteDrafts}
                  setNoteDrafts={setNoteDrafts}
                />
              ))
            )}
          </div>
        </div>

        <aside style={styles.summary}>
          <h3 style={styles.summaryTitle}>
            {isCustomer ? "Subtotal" : "Payment"}
          </h3>

          <div style={styles.totalBox}>
            <div style={styles.totalLine}>
              <span>Subtotal</span>
              <strong>{money(subtotal)}</strong>
            </div>
            {!isCustomer && (
              <>
                <div style={styles.totalLine}>
                  <span>Tax {taxRate ? `(${Math.round(taxRate * 100)}%)` : ""}</span>
                  <strong>{money(tax)}</strong>
                </div>
                <div style={styles.totalLine}>
                  <span>Tips</span>
                  <strong>{money(tips)}</strong>
                </div>

                <div style={styles.grandTotal}>
                  <span>Total</span>
                  <strong>{money(total)}</strong>
                </div>
              </>
            )}
          </div>

          {!isCustomer && (
            <button
              type="button"
              onClick={handleOpenCheckout}
              style={{
                ...styles.checkoutButton,
                ...(canCheckout ? {} : styles.disabledButton),
              }}
              disabled={!canCheckout}
            >
              Checkout
            </button>
          )}
        </aside>
      </div>

      {showCheckoutModal && (
        <div style={styles.overlay}>
          <div style={styles.checkoutModal}>
            <div style={styles.modalHeader}>
              <div>
                <h2 style={styles.modalTitle}>Checkout</h2>
                <p style={styles.modalSubtitle}>Order #{activeOrder?.id}</p>
              </div>

              <button
                type="button"
                aria-label="Close checkout"
                onClick={() => setShowCheckoutModal(false)}
                style={styles.modalCloseButton}
              >
                ×
              </button>
            </div>

            <div style={styles.checkoutContent}>
              <div style={styles.checkoutPanel}>
                <h3 style={styles.checkoutPanelTitle}>Payment Method</h3>

                <div style={styles.segmentedControl}>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("CASH")}
                    style={{
                      ...styles.segmentButton,
                      ...(paymentMethod === "CASH"
                        ? styles.segmentButtonActive
                        : {}),
                    }}
                  >
                    Cash
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("CARD")}
                    style={{
                      ...styles.segmentButton,
                      ...(paymentMethod === "CARD"
                        ? styles.segmentButtonActive
                        : {}),
                    }}
                  >
                    Card
                  </button>
                </div>

                {paymentMethod === "CARD" ? (
                  <div style={styles.cardTypeGrid}>
                    {[
                      ["VISA", "Visa"],
                      ["MASTERCARD", "Mastercard"],
                      ["AMEX", "Amex"],
                      ["DISCOVER", "Discover"],
                      ["OTHERS", "Other"],
                    ].map(([value, label]) => (
                      <button
                        type="button"
                        key={value}
                        onClick={() => setCardType(value)}
                        style={{
                          ...styles.cardTypeButton,
                          ...(cardType === value
                            ? styles.cardTypeButtonActive
                            : {}),
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                ) : (
                  <>
                    <label style={styles.label} htmlFor="cash-received">
                      Cash Received
                    </label>
                    <input
                      id="cash-received"
                      type="number"
                      min="0"
                      step="0.01"
                      value={cashReceived}
                      onChange={(e) => {
                        if (isValidMoneyInput(e.target.value)) {
                          setCashReceived(e.target.value);
                        }
                      }}
                      style={styles.input}
                      placeholder="0.00"
                    />

                    <div style={styles.cashShortcutGrid}>
                      {cashShortcuts.map((value) => (
                        <button
                          type="button"
                          key={value}
                          onClick={() => setCashReceived(String(value))}
                          style={styles.cashShortcutButton}
                        >
                          {money(value)}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div style={styles.checkoutPanel}>
                <h3 style={styles.checkoutPanelTitle}>Order Total</h3>

                <label style={styles.label} htmlFor="checkout-tips">
                  Tips
                </label>
                <input
                  id="checkout-tips"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={tips}
                  onChange={(e) => {
                    if (isValidMoneyInput(e.target.value)) {
                      setTips(e.target.value);
                    }
                  }}
                  style={styles.input}
                />

                <div style={styles.totalBox}>
                  <div style={styles.totalLine}>
                    <span>Subtotal</span>
                    <strong>{money(subtotal)}</strong>
                  </div>
                  <div style={styles.totalLine}>
                    <span>Tax</span>
                    <strong>{money(tax)}</strong>
                  </div>
                  <div style={styles.totalLine}>
                    <span>Tips</span>
                    <strong>{money(tipAmount)}</strong>
                  </div>
                  <div style={styles.grandTotal}>
                    <span>Amount Due</span>
                    <strong>{money(amountDue)}</strong>
                  </div>
                  {paymentMethod === "CASH" && (
                    <div style={styles.changeLine}>
                      <span>Change</span>
                      <strong>
                        {cashAmount >= amountDue ? money(changeDue) : "$0.00"}
                      </strong>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {paymentMethod === "CASH" && cashAmount < amountDue && (
              <div style={styles.checkoutWarning}>
                Cash received must cover the amount due.
              </div>
            )}

            {paymentMethod === "CARD" && !cardType && (
              <div style={styles.checkoutWarning}>
                Select a card type before confirming checkout.
              </div>
            )}

            <div style={styles.modalActions}>
              <button
                type="button"
                onClick={() => setShowCheckoutModal(false)}
                style={styles.secondaryButton}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmCheckout}
                disabled={
                  (paymentMethod === "CASH" && cashAmount < amountDue) ||
                  (paymentMethod === "CARD" && !cardType)
                }
                style={{
                  ...styles.primaryButton,
                  ...((paymentMethod === "CASH" && cashAmount < amountDue) ||
                  (paymentMethod === "CARD" && !cardType)
                    ? styles.disabledButton
                    : {}),
                }}
              >
                Confirm Checkout
              </button>
            </div>
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
    marginBottom: 20,
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
  headerTotals: {
    minWidth: 140,
    textAlign: "right",
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 12,
    flexWrap: "wrap",
  },
  refreshButton: {
    border: "1px solid #d1d5db",
    borderRadius: 8,
    padding: "10px 14px",
    background: "white",
    color: "#111827",
    fontWeight: 800,
    cursor: "pointer",
  },
  headerTotalLabel: {
    display: "block",
    color: "#6b7280",
    fontSize: 12,
    fontWeight: 800,
    textTransform: "uppercase",
  },
  headerTotal: {
    display: "block",
    marginTop: 4,
    fontSize: 26,
    fontWeight: 900,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
    gap: 18,
    alignItems: "start",
  },
  panel: {
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    padding: 16,
    background: "#f9fafb",
    minHeight: 320,
  },
  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 14,
  },
  panelTitle: {
    margin: 0,
    fontSize: 18,
  },
  panelHint: {
    margin: "4px 0 0",
    color: "#6b7280",
    fontSize: 13,
  },
  badge: {
    background: "#111827",
    color: "white",
    borderRadius: 999,
    padding: "4px 10px",
    fontSize: 12,
    fontWeight: 800,
  },
  itemList: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    height: 560,
    overflowY: "auto",
    paddingRight: 6,
  },
  empty: {
    color: "#6b7280",
    fontStyle: "italic",
    margin: 0,
  },
  itemRow: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    padding: 12,
    borderRadius: 8,
    background: "white",
    border: "1px solid #e5e7eb",
  },
  itemRowTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
  },
  itemMain: {
    minWidth: 0,
  },
  itemTopLine: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  itemName: {
    overflowWrap: "anywhere",
  },
  pendingPill: {
    background: "#fef3c7",
    color: "#92400e",
    borderRadius: 999,
    padding: "3px 8px",
    fontSize: 11,
    fontWeight: 900,
  },
  preparingPill: {
    background: "#dbeafe",
    color: "#1d4ed8",
    borderRadius: 999,
    padding: "3px 8px",
    fontSize: 11,
    fontWeight: 900,
  },
  finishedPill: {
    background: "#dcfce7",
    color: "#166534",
    borderRadius: 999,
    padding: "3px 8px",
    fontSize: 11,
    fontWeight: 900,
  },
  itemMeta: {
    marginTop: 5,
    color: "#6b7280",
    fontSize: 13,
  },
  itemRight: {
    textAlign: "right",
    flexShrink: 0,
    marginLeft: "auto",
  },
  qtyControls: {
    display: "flex",
    gap: 6,
    alignItems: "center",
    justifyContent: "flex-end",
    flexWrap: "wrap",
    marginTop: 8,
  },
  qtyButton: {
    width: 30,
    height: 30,
    borderRadius: 8,
    border: "1px solid #d1d5db",
    background: "white",
    cursor: "pointer",
    fontWeight: 900,
  },
  qty: {
    minWidth: 22,
    textAlign: "center",
    fontWeight: 800,
  },
  removeButton: {
    border: "none",
    background: "#fee2e2",
    color: "#991b1b",
    borderRadius: 8,
    padding: "7px 9px",
    cursor: "pointer",
    fontWeight: 800,
  },
  noteButton: {
    border: "1px solid #d1d5db",
    background: "#f9fafb",
    color: "#111827",
    borderRadius: 8,
    padding: "7px 9px",
    cursor: "pointer",
    fontWeight: 800,
  },
  notesPanel: {
    borderTop: "1px solid #e5e7eb",
    paddingTop: 10,
    display: "grid",
    gap: 8,
  },
  emptyNote: {
    margin: 0,
    color: "#6b7280",
    fontSize: 13,
    fontStyle: "italic",
  },
  noteRow: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) 90px auto auto",
    gap: 8,
    alignItems: "center",
  },
  noteInput: {
    width: "100%",
    boxSizing: "border-box",
    padding: "9px 10px",
    borderRadius: 8,
    border: "1px solid #d1d5db",
  },
  notePriceInput: {
    width: "100%",
    boxSizing: "border-box",
    padding: "9px 10px",
    borderRadius: 8,
    border: "1px solid #d1d5db",
  },
  noteSaveButton: {
    border: "none",
    background: "#111827",
    color: "white",
    borderRadius: 8,
    padding: "9px 10px",
    cursor: "pointer",
    fontWeight: 800,
  },
  noteDeleteButton: {
    border: "none",
    background: "#fee2e2",
    color: "#991b1b",
    borderRadius: 8,
    padding: "9px 10px",
    cursor: "pointer",
    fontWeight: 800,
  },
  sendButton: {
    marginTop: 14,
    width: "100%",
    padding: "12px 14px",
    border: "none",
    borderRadius: 8,
    background: "#2563eb",
    color: "white",
    fontWeight: 900,
    cursor: "pointer",
  },
  summary: {
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    padding: 18,
    background: "#ffffff",
    boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
  },
  summaryTitle: {
    margin: 0,
    fontSize: 18,
  },
  label: {
    display: "block",
    fontWeight: 800,
    margin: "12px 0 6px",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "11px 12px",
    borderRadius: 8,
    border: "1px solid #d1d5db",
  },
  totalBox: {
    marginTop: 18,
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
  checkoutButton: {
    width: "100%",
    marginTop: 18,
    padding: "14px 18px",
    background: "#111827",
    color: "white",
    border: "none",
    borderRadius: 8,
    fontWeight: 900,
    cursor: "pointer",
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
  checkoutModal: {
    width: 820,
    maxWidth: "calc(100vw - 48px)",
    maxHeight: "88vh",
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
    color: "#111827",
  },
  modalSubtitle: {
    margin: "6px 0 0",
    color: "#6b7280",
    fontWeight: 800,
  },
  modalCloseButton: {
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
  checkoutContent: {
    padding: 20,
    overflowY: "auto",
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
    gap: 14,
  },
  checkoutPanel: {
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    padding: 16,
    background: "white",
  },
  checkoutPanelTitle: {
    margin: "0 0 14px",
    fontSize: 17,
    fontWeight: 900,
  },
  segmentedControl: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 8,
    marginBottom: 16,
  },
  segmentButton: {
    border: "1px solid #d1d5db",
    background: "#f9fafb",
    color: "#111827",
    padding: "12px 14px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 900,
  },
  segmentButtonActive: {
    border: "1px solid #111827",
    background: "#111827",
    color: "white",
  },
  cardTypeGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 10,
  },
  cardTypeButton: {
    border: "1px solid #d1d5db",
    background: "#f9fafb",
    color: "#111827",
    padding: "12px 14px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 800,
  },
  cardTypeButtonActive: {
    border: "1px solid #111827",
    background: "#111827",
    color: "white",
  },
  cashShortcutGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 10,
    marginTop: 12,
  },
  cashShortcutButton: {
    border: "1px solid #d1d5db",
    background: "#f9fafb",
    color: "#111827",
    padding: "12px 14px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 900,
    fontSize: 16,
  },
  changeLine: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 14,
    paddingTop: 14,
    borderTop: "1px solid #e5e7eb",
    color: "#166534",
    fontSize: 18,
    fontWeight: 900,
  },
  checkoutWarning: {
    margin: "0 20px 14px",
    padding: "10px 12px",
    borderRadius: 8,
    background: "#fee2e2",
    color: "#991b1b",
    fontWeight: 800,
  },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    padding: "16px 20px",
    borderTop: "1px solid #e5e7eb",
    background: "#f9fafb",
  },
  secondaryButton: {
    border: "1px solid #d1d5db",
    background: "white",
    color: "#111827",
    padding: "12px 16px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 800,
  },
  primaryButton: {
    border: "none",
    background: "#111827",
    color: "white",
    padding: "12px 18px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 900,
    minWidth: 170,
  },
  disabledButton: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
};

export default CartSection;

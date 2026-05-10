import { useMemo, useRef, useState } from "react";

const LONG_PRESS_MS = 350;

function TablesSection({
  tables,
  selectedTableId,
  customerUsers = [],
  isCustomer = false,
  canEditTables = true,
  canManageAssignments = true,
  canCloseOrders = true,
  onOpenTable,
  onUpdateTable,
  onEditTable,
  onAssignCustomer,
  onCloseOrder,
}) {
  const [assignmentTable, setAssignmentTable] = useState(null);
  const [assignmentDraft, setAssignmentDraft] = useState("");
  const [isSavingAssignment, setIsSavingAssignment] = useState(false);
  const [closingTable, setClosingTable] = useState(null);
  const [closeCode, setCloseCode] = useState("");
  const [isClosingOrder, setIsClosingOrder] = useState(false);
  const [dragState, setDragState] = useState(null);
  const floorRef = useRef(null);
  const pressRef = useRef(null);
  const suppressNextClickRef = useRef(false);

  const assignedCustomerByTableId = useMemo(() => {
    return customerUsers.reduce((map, customer) => {
      if (customer.tableId) {
        map.set(customer.tableId, customer);
      }

      return map;
    }, new Map());
  }, [customerUsers]);

  function clearLongPress() {
    if (pressRef.current?.timer) {
      window.clearTimeout(pressRef.current.timer);
      pressRef.current.timer = null;
    }
  }

  function clampPosition(value, max) {
    return Math.max(0, Math.min(Math.round(value), Math.max(0, max)));
  }

  function positionFromPointer(event, press = pressRef.current) {
    const floorRect = floorRef.current?.getBoundingClientRect();
    if (!floorRect || !press) return null;

    return {
      posX: clampPosition(
        event.clientX - floorRect.left - press.offsetX,
        floorRect.width - press.cardWidth,
      ),
      posY: clampPosition(
        event.clientY - floorRect.top - press.offsetY,
        floorRect.height - press.cardHeight,
      ),
    };
  }

  function isInteractiveTarget(target) {
    return Boolean(
      target.closest("button, input, select, textarea, a, [role='button']"),
    );
  }

  function handleCardPointerDown(event, table) {
    if (!canEditTables || isInteractiveTarget(event.target)) return;
    if (event.button !== undefined && event.button !== 0) return;

    clearLongPress();

    const cardRect = event.currentTarget.getBoundingClientRect();
    const press = {
      table,
      pointerId: event.pointerId,
      cardEl: event.currentTarget,
      startClientX: event.clientX,
      startClientY: event.clientY,
      offsetX: event.clientX - cardRect.left,
      offsetY: event.clientY - cardRect.top,
      cardWidth: cardRect.width,
      cardHeight: cardRect.height,
      isDragging: false,
      didMove: false,
      latestPosition: {
        posX: table.posX ?? 0,
        posY: table.posY ?? 0,
      },
      timer: null,
    };

    press.timer = window.setTimeout(() => {
      press.isDragging = true;
      suppressNextClickRef.current = true;
      press.cardEl.setPointerCapture?.(press.pointerId);
      setDragState({
        tableId: table.id,
        posX: table.posX ?? 0,
        posY: table.posY ?? 0,
      });
    }, LONG_PRESS_MS);

    pressRef.current = press;
  }

  function handleCardPointerMove(event) {
    const press = pressRef.current;
    if (!press || press.pointerId !== event.pointerId) return;

    if (!press.isDragging) {
      return;
    }

    const nextPosition = positionFromPointer(event, press);
    if (!nextPosition) return;

    event.preventDefault();
    press.didMove = true;
    press.latestPosition = nextPosition;
    setDragState({
      tableId: press.table.id,
      ...nextPosition,
    });
  }

  async function handleCardPointerUp(event) {
    const press = pressRef.current;
    if (!press || press.pointerId !== event.pointerId) return;

    clearLongPress();

    if (press.isDragging) {
      event.preventDefault();
      press.cardEl.releasePointerCapture?.(press.pointerId);

      const finalPosition = positionFromPointer(event, press) || press.latestPosition;
      const currentX = press.table.posX ?? 0;
      const currentY = press.table.posY ?? 0;
      const positionChanged =
        finalPosition.posX !== currentX || finalPosition.posY !== currentY;

      pressRef.current = null;

      try {
        if (press.didMove && positionChanged) {
          await onUpdateTable({
            ...press.table,
            ...finalPosition,
          });
        }
      } finally {
        setDragState(null);
      }

      window.setTimeout(() => {
        suppressNextClickRef.current = false;
      }, 0);
      return;
    }

    pressRef.current = null;
  }

  function handleCardPointerCancel(event) {
    const press = pressRef.current;
    if (!press || press.pointerId !== event.pointerId) return;

    clearLongPress();
    setDragState(null);
    pressRef.current = null;
    window.setTimeout(() => {
      suppressNextClickRef.current = false;
    }, 0);
  }

  function handleCardClick(tableId) {
    if (suppressNextClickRef.current) {
      suppressNextClickRef.current = false;
      return;
    }

    onOpenTable(tableId);
  }

  function openAssignmentModal(table) {
    if (!canManageAssignments) return;

    const assignedCustomer = assignedCustomerByTableId.get(table.id);

    setAssignmentTable(table);
    setAssignmentDraft(assignedCustomer?.id ? String(assignedCustomer.id) : "");
  }

  function openCloseModal(table) {
    if (!canCloseOrders) return;

    setClosingTable(table);
    setCloseCode("");
  }

  async function saveAssignment() {
    if (!assignmentTable) return;

    setIsSavingAssignment(true);

    try {
      await onAssignCustomer(
        assignmentTable.id,
        assignmentDraft ? Number(assignmentDraft) : null,
      );
      setAssignmentTable(null);
    } finally {
      setIsSavingAssignment(false);
    }
  }

  async function closeOrder() {
    if (!closingTable) return;

    setIsClosingOrder(true);

    try {
      await onCloseOrder(closingTable, closeCode);
      setClosingTable(null);
      setCloseCode("");
    } finally {
      setIsClosingOrder(false);
    }
  }

  return (
    <section>
      <h2 style={styles.title}>Tables</h2>

      <div
        ref={floorRef}
        style={styles.floor}
      >
        {tables.length === 0 && (
          <div style={styles.emptyState}>
            {isCustomer
              ? "No table is assigned to this customer account."
              : "No tables found."}
          </div>
        )}

        {tables.map((table) => {
          const isSelected = selectedTableId === table.id;
          const isOccupied = table.tableStatus === "OCCUPIED";
          const isReserved = table.tableStatus === "RESERVED";
          const assignedCustomer = assignedCustomerByTableId.get(table.id);

          return (
            <div
              key={table.id}
              onClick={() => handleCardClick(table.id)}
              onPointerDown={(event) => handleCardPointerDown(event, table)}
              onPointerMove={handleCardPointerMove}
              onPointerUp={handleCardPointerUp}
              onPointerCancel={handleCardPointerCancel}
              onContextMenu={(event) => {
                if (canEditTables) {
                  event.preventDefault();
                }
              }}
              style={{
                ...styles.card,
                left:
                  dragState?.tableId === table.id
                    ? dragState.posX
                    : table.posX ?? 0,
                top:
                  dragState?.tableId === table.id
                    ? dragState.posY
                    : table.posY ?? 0,
                cursor:
                  dragState?.tableId === table.id
                    ? "grabbing"
                    : canEditTables
                      ? "grab"
                      : "pointer",
                zIndex: dragState?.tableId === table.id ? 5 : 1,
                transform:
                  dragState?.tableId === table.id ? "scale(1.02)" : "none",
                background: isOccupied
                  ? "#fee2e2"
                  : isReserved
                    ? "#fef3c7"
                    : "#dcfce7",
                border: isSelected ? "3px solid #2563eb" : "1px solid #d1d5db",
              }}
            >
              <div style={styles.cardHeader}>
                <span style={styles.label}>{table.label}</span>

                <span
                  style={{
                    ...styles.status,
                    background: isOccupied
                      ? "#ef4444"
                      : isReserved
                        ? "#f59e0b"
                        : "#22c55e",
                  }}
                >
                  {table.tableStatus}
                </span>
              </div>

              <div style={styles.seats}>{table.seat} seats</div>
              {canManageAssignments ? (
                <div style={styles.assignment}>
                  <span style={styles.assignmentLabel}>Customer</span>
                  <strong>{assignedCustomer?.username || "Unassigned"}</strong>
                </div>
              ) : (
                <div style={styles.assignment}>
                  <span style={styles.assignmentLabel}>Assigned</span>
                  <strong>{isCustomer ? "Your table" : table.label}</strong>
                </div>
              )}

              <div style={styles.actions}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenTable(table.id);
                  }}
                  style={styles.openButton}
                >
                  Open
                </button>

                {canEditTables && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditTable(table);
                    }}
                    style={styles.editButton}
                  >
                    Edit
                  </button>
                )}

                {canManageAssignments && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openAssignmentModal(table);
                    }}
                    style={styles.editButton}
                  >
                    Assign
                  </button>
                )}

                {canCloseOrders && isOccupied && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openCloseModal(table);
                    }}
                    style={styles.closeOrderButton}
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {assignmentTable && (
        <div
          style={styles.modalOverlay}
          onMouseDown={() => setAssignmentTable(null)}
        >
          <div
            style={styles.modal}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div style={styles.modalHeader}>
              <div>
                <h3 style={styles.modalTitle}>Assign Customer</h3>
                <p style={styles.modalSubtitle}>{assignmentTable.label}</p>
              </div>
              <button
                type="button"
                onClick={() => setAssignmentTable(null)}
                style={styles.closeButton}
              >
                x
              </button>
            </div>

            <label style={styles.fieldLabel}>Customer account</label>
            <select
              value={assignmentDraft}
              onChange={(event) => setAssignmentDraft(event.target.value)}
              style={styles.select}
            >
              <option value="">No customer assigned</option>
              {customerUsers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.username}
                  {customer.tableLabel ? ` - ${customer.tableLabel}` : ""}
                </option>
              ))}
            </select>

            <div style={styles.modalActions}>
              <button
                type="button"
                onClick={() => setAssignmentTable(null)}
                style={styles.cancelButton}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveAssignment}
                disabled={isSavingAssignment}
                style={{
                  ...styles.saveButton,
                  opacity: isSavingAssignment ? 0.65 : 1,
                }}
              >
                {isSavingAssignment ? "Saving..." : "Save Assignment"}
              </button>
            </div>
          </div>
        </div>
      )}

      {closingTable && (
        <div
          style={styles.modalOverlay}
          onMouseDown={() => setClosingTable(null)}
        >
          <div
            style={styles.modal}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div style={styles.modalHeader}>
              <div>
                <h3 style={styles.modalTitle}>Close Order</h3>
                <p style={styles.modalSubtitle}>{closingTable.label}</p>
              </div>
              <button
                type="button"
                onClick={() => setClosingTable(null)}
                style={styles.closeButton}
              >
                x
              </button>
            </div>

            <div style={styles.closeWarning}>
              This deletes the active table order and frees the table.
            </div>

            <label style={styles.fieldLabel}>Admin close code</label>
            <input
              type="password"
              value={closeCode}
              onChange={(event) => setCloseCode(event.target.value)}
              placeholder="Enter close code"
              style={styles.input}
            />

            <div style={styles.modalActions}>
              <button
                type="button"
                onClick={() => setClosingTable(null)}
                style={styles.cancelButton}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={closeOrder}
                disabled={isClosingOrder || !closeCode}
                style={{
                  ...styles.dangerButton,
                  opacity: isClosingOrder || !closeCode ? 0.65 : 1,
                }}
              >
                {isClosingOrder ? "Closing..." : "Close Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

const styles = {
  title: {
    marginBottom: 16,
  },
  floor: {
    position: "relative",
    height: 800,
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    background: "#f9fafb",
    overflow: "hidden",
  },
  emptyState: {
    position: "absolute",
    inset: 0,
    display: "grid",
    placeItems: "center",
    color: "#6b7280",
    fontWeight: 800,
  },
  card: {
    position: "absolute",
    width: 188,
    minHeight: 160,
    borderRadius: 16,
    padding: 12,
    boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column",
    gap: 8,
    touchAction: "none",
    userSelect: "none",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 8,
    alignItems: "center",
  },
  label: {
    fontWeight: 800,
    fontSize: 18,
  },
  status: {
    color: "white",
    fontSize: 10,
    fontWeight: 800,
    padding: "4px 6px",
    borderRadius: 999,
  },
  seats: {
    color: "#374151",
    fontWeight: 600,
  },
  assignment: {
    border: "1px solid rgba(17, 24, 39, 0.08)",
    borderRadius: 10,
    padding: "7px 8px",
    background: "rgba(255,255,255,0.62)",
    display: "flex",
    flexDirection: "column",
    gap: 2,
    minWidth: 0,
  },
  assignmentLabel: {
    fontSize: 10,
    fontWeight: 800,
    textTransform: "uppercase",
    color: "#6b7280",
  },
  actions: {
    marginTop: "auto",
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
  },
  openButton: {
    flex: "1 1 72px",
    border: "none",
    borderRadius: 8,
    padding: "8px 10px",
    background: "#111827",
    color: "white",
    fontWeight: 700,
    cursor: "pointer",
  },
  editButton: {
    flex: "1 1 72px",
    border: "1px solid #d1d5db",
    borderRadius: 8,
    padding: "8px 10px",
    background: "white",
    fontWeight: 700,
    cursor: "pointer",
  },
  closeOrderButton: {
    flex: "1 1 72px",
    border: "1px solid #fecaca",
    borderRadius: 8,
    padding: "8px 10px",
    background: "#fee2e2",
    color: "#991b1b",
    fontWeight: 800,
    cursor: "pointer",
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.42)",
    display: "grid",
    placeItems: "center",
    zIndex: 2000,
    padding: 24,
  },
  modal: {
    width: "min(520px, 100%)",
    background: "white",
    borderRadius: 14,
    border: "1px solid #e5e7eb",
    boxShadow: "0 24px 60px rgba(15, 23, 42, 0.24)",
    padding: 20,
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    alignItems: "flex-start",
    marginBottom: 18,
  },
  modalTitle: {
    margin: 0,
    fontSize: 22,
  },
  modalSubtitle: {
    margin: "4px 0 0",
    color: "#6b7280",
    fontWeight: 700,
  },
  closeButton: {
    border: "1px solid #d1d5db",
    borderRadius: 8,
    background: "white",
    width: 36,
    height: 36,
    fontSize: 18,
    fontWeight: 800,
    cursor: "pointer",
  },
  fieldLabel: {
    display: "block",
    marginBottom: 8,
    fontSize: 12,
    textTransform: "uppercase",
    color: "#374151",
    fontWeight: 800,
  },
  select: {
    width: "100%",
    border: "1px solid #cbd5e1",
    borderRadius: 10,
    padding: "12px 14px",
    fontSize: 15,
    fontWeight: 700,
    background: "white",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #cbd5e1",
    borderRadius: 10,
    padding: "12px 14px",
    fontSize: 15,
    fontWeight: 700,
  },
  closeWarning: {
    border: "1px solid #fecaca",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    background: "#fef2f2",
    color: "#991b1b",
    fontWeight: 800,
  },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 20,
  },
  cancelButton: {
    border: "1px solid #d1d5db",
    borderRadius: 10,
    padding: "11px 14px",
    background: "white",
    fontWeight: 800,
    cursor: "pointer",
  },
  saveButton: {
    border: "none",
    borderRadius: 10,
    padding: "11px 16px",
    background: "#111827",
    color: "white",
    fontWeight: 800,
    cursor: "pointer",
  },
  dangerButton: {
    border: "none",
    borderRadius: 10,
    padding: "11px 16px",
    background: "#dc2626",
    color: "white",
    fontWeight: 800,
    cursor: "pointer",
  },
};

export default TablesSection;

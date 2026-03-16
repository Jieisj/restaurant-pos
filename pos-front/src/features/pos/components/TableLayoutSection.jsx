import { useRef, useState } from "react";

function TableLayoutSection({
  tables = [],
  onAddTable,
  onDeleteTable,
  onRenameTable,
  onChangeTableSeats,
  onChangeTableStatus,
  onUpdateTablePosition,
  selectedTableId,
}) {
  const floorRef = useRef(null);

  const [newTableName, setNewTableName] = useState("");
  const [newSeats, setNewSeats] = useState(4);

  const [draggingId, setDraggingId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleAddTable = () => {
    const trimmedName = newTableName.trim();
    if (!trimmedName) return;

    onAddTable({
      id: Date.now(),
      name: trimmedName,
      seats: Number(newSeats) || 1,
      status: "available",
      x: 40,
      y: 40,
    });

    setNewTableName("");
    setNewSeats(4);
  };

  const handleMouseDown = (event, table) => {
    if (!floorRef.current) return;

    const floorRect = floorRef.current.getBoundingClientRect();

    setDraggingId(table.id);
    setDragOffset({
      x: event.clientX - floorRect.left - table.x,
      y: event.clientY - floorRect.top - table.y,
    });
  };

  const handleMouseMove = (event) => {
    if (!floorRef.current || draggingId === null) return;

    const floorRect = floorRef.current.getBoundingClientRect();

    const nextX = event.clientX - floorRect.left - dragOffset.x;
    const nextY = event.clientY - floorRect.top - dragOffset.y;

    const clampedX = Math.max(0, Math.min(nextX, floorRect.width - 120));
    const clampedY = Math.max(0, Math.min(nextY, floorRect.height - 120));

    onUpdateTablePosition(draggingId, clampedX, clampedY);
  };

  const handleMouseUp = () => {
    setDraggingId(null);
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <h2 style={styles.title}>Table Layout</h2>
        <p style={styles.subtitle}>
          Drag tables to match the real restaurant layout.
        </p>
      </div>

      <div style={styles.addBar}>
        <input
          type="text"
          value={newTableName}
          onChange={(e) => setNewTableName(e.target.value)}
          placeholder="New table name"
          style={styles.input}
        />

        <input
          type="number"
          min="1"
          value={newSeats}
          onChange={(e) => setNewSeats(e.target.value)}
          style={styles.smallInput}
        />

        <button type="button" onClick={handleAddTable} style={styles.addButton}>
          Add Table
        </button>
      </div>

      <div
        ref={floorRef}
        style={styles.floor}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {(tables || []).map((table) => (
          <div
            key={table.id}
            style={{
              ...styles.tableCard,
              left: table.x,
              top: table.y,
              ...(selectedTableId === table.id ? styles.selectedTable : {}),
              ...(table.status === "available" ? styles.available : {}),
              ...(table.status === "occupied" ? styles.occupied : {}),
              ...(table.status === "reserved" ? styles.reserved : {}),
              ...(draggingId === table.id ? styles.draggingTable : {}),
            }}
          >
            <div
              style={styles.dragHandle}
              onMouseDown={(e) => handleMouseDown(e, table)}
              title="Drag table"
            >
              ⋮⋮
            </div>

            <input
              value={table.name}
              onChange={(e) => onRenameTable(table.id, e.target.value)}
              style={styles.nameInput}
            />

            <div style={styles.tableMeta}>
              <label style={styles.metaLabel}>
                Seats
                <input
                  type="number"
                  min="1"
                  value={table.seats}
                  onChange={(e) =>
                    onChangeTableSeats(table.id, Number(e.target.value) || 1)
                  }
                  style={styles.metaInput}
                />
              </label>

              <label style={styles.metaLabel}>
                Status
                <select
                  value={table.status}
                  onChange={(e) => onChangeTableStatus(table.id, e.target.value)}
                  style={styles.metaInput}
                >
                  <option value="available">available</option>
                  <option value="occupied">occupied</option>
                  <option value="reserved">reserved</option>
                </select>
              </label>
            </div>

            <button
              type="button"
              onClick={() => onDeleteTable(table.id)}
              style={styles.deleteButton}
            >
              Delete
            </button>
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
    fontSize: "28px",
  },
  subtitle: {
    margin: "6px 0 0",
    color: "#6b7280",
  },
  addBar: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "20px",
  },
  input: {
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    minWidth: "200px",
  },
  smallInput: {
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    width: "90px",
  },
  addButton: {
    border: "none",
    borderRadius: "10px",
    background: "#111827",
    color: "#fff",
    padding: "12px 16px",
    cursor: "pointer",
    fontWeight: 600,
  },
  floor: {
    position: "relative",
    minHeight: "560px",
    background: "#f9fafb",
    border: "1px dashed #d1d5db",
    borderRadius: "18px",
    overflow: "hidden",
  },
  tableCard: {
    position: "absolute",
    width: "120px",
    minHeight: "110px",
    borderRadius: "14px",
    padding: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    border: "2px solid transparent",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    userSelect: "none",
  },
  draggingTable: {
    opacity: 0.85,
    boxShadow: "0 10px 24px rgba(0,0,0,0.16)",
  },
  selectedTable: {
    border: "2px solid #111827",
  },
  available: {
    background: "#dcfce7",
  },
  occupied: {
    background: "#fee2e2",
  },
  reserved: {
    background: "#fef3c7",
  },
  dragHandle: {
    alignSelf: "flex-end",
    cursor: "grab",
    fontSize: "14px",
    lineHeight: 1,
    padding: "2px 4px",
  },
  nameInput: {
    padding: "6px 8px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontWeight: 600,
    fontSize: "13px",
  },
  tableMeta: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  metaLabel: {
    display: "flex",
    flexDirection: "column",
    gap: "3px",
    fontSize: "11px",
    fontWeight: 600,
  },
  metaInput: {
    padding: "6px 8px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "12px",
  },
  deleteButton: {
    marginTop: "auto",
    border: "none",
    background: "#dc2626",
    color: "#fff",
    padding: "7px 10px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "12px",
  },
};

export default TableLayoutSection;
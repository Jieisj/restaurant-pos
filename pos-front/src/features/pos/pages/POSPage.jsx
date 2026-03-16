import { useMemo, useState } from "react";
import { ROLES } from "../../../constants/roles";
import MenuPage from "../../menu/pages/MenuPage";
import CartSection from "../components/CartSection";
import TablesSection from "../components/TablesSection";
import TableLayoutSection from "../components/TableLayoutSection";
import KitchenSection from "../components/KitchenSection";

const mockUser = {
  id: 1,
  name: "Admin",
  role: ROLES.WAITER,
  // try ROLES.WAITER to test waiter view
};

const initialTables = [
  { id: 1, name: "Table 1", seats: 4, status: "available", x: 40, y: 40 },
  { id: 2, name: "Table 2", seats: 2, status: "occupied", x: 220, y: 60 },
  { id: 3, name: "Table 3", seats: 6, status: "reserved", x: 120, y: 180 },
];


function POSPage() {
  const role = mockUser.role;

  const isAdmin = role === ROLES.ADMIN;
  const isWaiter = role === ROLES.WAITER;
  const isCustomer = role === ROLES.CUSTOMER;

  const defaultSection = useMemo(() => {
    if (isAdmin) return "table-layout";
    if (isWaiter) return "tables";
    if (isCustomer) return "menu";
    return "menu";
  }, [isAdmin, isWaiter, isCustomer]);

  const [activeSection, setActiveSection] = useState(defaultSection);
  const [selectedTableId, setSelectedTableId] = useState(null);
  const [tables, setTables] = useState(initialTables);

  const allowedSections = useMemo(() => {
    if (isAdmin) return ["table-layout", "tables", "cart", "menu", "kitchen"];
    if (isWaiter) return ["tables", "cart", "menu"];
    if (isCustomer) return ["menu", "cart"];
    return ["menu", "cart"];
  }, [isAdmin, isWaiter, isCustomer]);

  const currentSection = allowedSections.includes(activeSection)
    ? activeSection
    : defaultSection;

  const handleOpenTable = (tableId) => {
    setSelectedTableId(tableId);
    setActiveSection("cart");
  };

  const handleAddTable = (newTable) => {
    setTables((prev) => [...prev, newTable]);
  };

  const handleUpdateTablePosition = (id, x, y) => {
  setTables((prev) =>
    prev.map((table) =>
      table.id === id
        ? {
            ...table,
            x,
            y,
          }
        : table
     )
   );
  };

  const handleDeleteTable = (id) => {
    setTables((prev) => prev.filter((table) => table.id !== id));

    if (selectedTableId === id) {
      setSelectedTableId(null);
    }
  };

  const handleRenameTable = (id, name) => {
    setTables((prev) =>
      prev.map((table) =>
        table.id === id ? { ...table, name } : table
      )
    );
  };

  const handleChangeTableSeats = (id, seats) => {
    setTables((prev) =>
      prev.map((table) =>
        table.id === id ? { ...table, seats } : table
      )
    );
  };

  const handleChangeTableStatus = (id, status) => {
    setTables((prev) =>
      prev.map((table) =>
        table.id === id ? { ...table, status } : table
      )
    );
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Restaurant POS</h1>
          <p style={styles.subtitle}>
            {mockUser.name} ({mockUser.role})
          </p>
        </div>
      </header>

      <nav style={styles.nav}>
        {isAdmin && (
          <button
            type="button"
            style={{
              ...styles.navButton,
              ...(currentSection === "table-layout" ? styles.navButtonActive : {}),
            }}
            onClick={() => setActiveSection("table-layout")}
          >
            Table Layout
          </button>
        )}

        {(isAdmin || isWaiter) && (
          <button
            type="button"
            style={{
              ...styles.navButton,
              ...(currentSection === "tables" ? styles.navButtonActive : {}),
            }}
            onClick={() => setActiveSection("tables")}
          >
            Tables
          </button>
        )}

        <button
          type="button"
          style={{
            ...styles.navButton,
            ...(currentSection === "menu" ? styles.navButtonActive : {}),
          }}
          onClick={() => setActiveSection("menu")}
        >
          Menu
        </button>

        <button
          type="button"
          style={{
            ...styles.navButton,
            ...(currentSection === "cart" ? styles.navButtonActive : {}),
          }}
          onClick={() => setActiveSection("cart")}
        >
          Cart
        </button>

        {isAdmin && (
          <button
            type="button"
            style={{
              ...styles.navButton,
              ...(currentSection === "kitchen" ? styles.navButtonActive : {}),
            }}
            onClick={() => setActiveSection("kitchen")}
          >
            Kitchen
          </button>
        )}
      </nav>

      <main style={styles.content}>
        {currentSection === "table-layout" && isAdmin && (
          <TableLayoutSection
            tables={tables}
            onAddTable={handleAddTable}
            onDeleteTable={handleDeleteTable}
            onRenameTable={handleRenameTable}
            onChangeTableSeats={handleChangeTableSeats}
            onChangeTableStatus={handleChangeTableStatus}
            onUpdateTablePosition={handleUpdateTablePosition}
            selectedTableId={selectedTableId}
          />
        )}

        {currentSection === "tables" && (isAdmin || isWaiter) && (
          <TablesSection
            tables={tables}
            onOpenTable={handleOpenTable}
            selectedTableId={selectedTableId}
          />
        )}

        {currentSection === "menu" && (
          <MenuPage role={role} selectedTableId={selectedTableId} />
        )}

        {currentSection === "cart" && (
          <CartSection role={role} selectedTableId={selectedTableId} />
        )}

        {currentSection === "kitchen" && isAdmin && <KitchenSection />}
      </main>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f3f4f6",
  },
  header: {
    padding: "24px 28px 14px",
    background: "#ffffff",
    borderBottom: "1px solid #e5e7eb",
  },
  title: {
    margin: 0,
    fontSize: "32px",
    color: "#111827",
  },
  subtitle: {
    margin: "6px 0 0",
    color: "#6b7280",
  },
  nav: {
    display: "flex",
    gap: "12px",
    padding: "16px 28px",
    background: "#ffffff",
    borderBottom: "1px solid #e5e7eb",
    flexWrap: "wrap",
  },
  navButton: {
    border: "1px solid #d1d5db",
    background: "#ffffff",
    color: "#111827",
    padding: "10px 16px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: 600,
  },
  navButtonActive: {
    background: "#111827",
    color: "#ffffff",
    border: "1px solid #111827",
  },
  content: {
    padding: "24px 28px",
  },
};

export default POSPage;
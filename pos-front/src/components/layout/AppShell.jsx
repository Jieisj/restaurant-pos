import { Outlet } from "react-router-dom";

function AppShell() {
  return (
    <div>
      <header style={styles.header}>
        <h2>Restaurant POS</h2>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
}

const styles = {
  header: {
    padding: "20px",
    borderBottom: "1px solid #eee",
  },
};

export default AppShell;
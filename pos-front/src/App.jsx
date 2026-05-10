import { useState } from "react";
import POSPage from "./features/pos/pages/POSPage";
import LoginPage from "./features/auth/pages/LoginPage";

function App() {
  const [user, setUser] = useState(() => {
    const token = sessionStorage.getItem("token");
    const userId = sessionStorage.getItem("userId");
    const username = sessionStorage.getItem("username");
    const role = sessionStorage.getItem("role");
    const tableId = sessionStorage.getItem("tableId");
    const tableLabel = sessionStorage.getItem("tableLabel");
    const tableSeat = sessionStorage.getItem("tableSeat");

    if (!token) return null;

    return {
      token,
      userId: Number(userId),
      username,
      role,
      tableId: tableId ? Number(tableId) : null,
      tableLabel: tableLabel || null,
      tableSeat: tableSeat ? Number(tableSeat) : null,
    };
  });

  function handleLogout() {
    sessionStorage.clear();
    setUser(null);
  }

  if (!user) {
    return <LoginPage onLogin={setUser} />;
  }

  return <POSPage user={user} onLogout={handleLogout} />;
}

export default App;

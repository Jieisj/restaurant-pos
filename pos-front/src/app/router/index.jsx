import { createBrowserRouter, Navigate } from "react-router-dom";

import LoginPage from "../../features/auth/pages/LoginPage";
import POSPage from "../../features/pos/pages/POSPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/pos" replace />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/pos",
    element: <POSPage />,
  },
]);
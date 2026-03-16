import { RouterProvider } from "react-router-dom";
import { router } from "../router";

function AppProviders() {
  return <RouterProvider router={router} />;
}

export default AppProviders;
import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { HomePage } from "./pages/HomePage";
import { ReservationPage } from "./pages/ReservationPage";
import { OrderHistoryPage } from "./pages/OrderHistoryPage";
import { AdminPage } from "./pages/AdminPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: HomePage },
      { path: "reservation", Component: ReservationPage },
      { path: "orders", Component: OrderHistoryPage },
    ],
  },
  {
    path: "/admin",
    Component: AdminPage,
  },
]);
import { createElement } from "react";
import { createBrowserRouter, Navigate } from "react-router";
import { Layout } from "./components/Layout";
import { HomePage } from "./pages/HomePage";
// import { ReservationPage } from "./pages/ReservationPage"; // 임시 비공개
import { OrderHistoryPage } from "./pages/OrderHistoryPage";
import { AdminPage } from "./pages/AdminPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: HomePage },
      // { path: "reservation", Component: ReservationPage }, // 임시 비공개
      { path: "reservation", element: createElement(Navigate, { to: "/", replace: true }) },
      { path: "orders", Component: OrderHistoryPage },
    ],
  },
  {
    path: "/admin",
    Component: AdminPage,
  },
]);
import React from "react";
import ReactDOM from "react-dom";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import HomePage from "./pages/HomePage";
import RegisterPage from "./pages/RegisterPage";
import AuthPage from "./pages/AuthPage";
import RolesPage from "./pages/RolesPage";
import RolesCreate from "./pages/RolesCreate";
import { AuthProvider } from './context/AuthContext'; // Импортируйте AuthProvider
import TestPage from "./pages/TestPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/:id",
    element: <HomePage />,
  },
  {
    path: "/register",
    element: <RegisterPage/>,
  },
  {
    path: "/auth",
    element: <AuthPage/>,
  },
  {
    path: '/roles',
    element: <RolesPage />
  },
  {
    path: '/edit/:id',
    element: <RolesCreate />
  },
  {
    path: '/roles/create',
    element: <RolesCreate />
  },
  {
    path: '/test',
    element: <TestPage />
  }
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <AuthProvider>
    <RouterProvider router={router} />
  </AuthProvider>
);

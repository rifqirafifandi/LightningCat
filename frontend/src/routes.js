import { createBrowserRouter, redirect } from "react-router";
import App from './App';
import Login from './pages/Login';
import Account from './pages/Account/Account';
import Profile from "./pages/Account/Profile/Profile";
import Listings from "./pages/Account/Listings/Listings";
import Bookings from "./pages/Account/Bookings/Bookings";
import ErrorPage from "./pages/404";

const router = createBrowserRouter([
  { path: "/", element: <App /> },
  { path: "/login", element: <Login /> },
  { 
    path: "/account",
    element: <Account />,
    children: [
      {
        index: true,
        loader: () => redirect("/account/profile"),
      },
      {
        path: "profile",
        element: <Profile />,
      },
      {
        path: "listings",
        element: <Listings />,
      },
      {
        path: "bookings",
        element: <Bookings />,
      }
    ]
  },
  { path: "*", element: <ErrorPage /> },
]);

export default router;
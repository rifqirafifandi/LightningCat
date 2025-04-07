import { createBrowserRouter, redirect } from "react-router";
import AppLayout from "./components/AppLayout";
import App from './App';
import Login from './pages/Login';
import Logout from './pages/Logout';
import Account from './pages/Account/Account';
import Profile from "./pages/Account/Profile/Profile";
import Listings from "./pages/Account/Listings/Listings";
import CreateListing from "./pages/Account/Listings/CreateListing/CreateListing";
import Bookings from "./pages/Account/Bookings/Bookings";
import Wallet from "./pages/Account/Wallet/Wallet";
import ErrorPage from "./pages/404";

const router = createBrowserRouter([
  { 
    path: "/", 
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <App />,
      },
      { 
        path: "account",
        element: <Account />,
        children: [
          {
            index: true,
            loader: () => redirect("profile"),
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
            path: "listings/create",
            element: <CreateListing />,
          },
          {
            path: "bookings",
            element: <Bookings />,
          },
          {
            path: "wallet",
            element: <Wallet />,
          }
        ]
      },
    ],
  },
  { path: "/login", element: <Login /> },
  { path: "/logout", element: <Logout /> },
  { path: "*", element: <ErrorPage /> },
]);

export default router;
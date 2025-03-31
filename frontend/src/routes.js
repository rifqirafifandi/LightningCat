import { createBrowserRouter, redirect } from "react-router";
import AppLayout from "./components/AppLayout";
import App from './App';
import Login from './pages/Login';
import Logout from './pages/Logout';
import Account from './pages/Account/Account';
import Profile from "./pages/Account/Profile/Profile";
import Listings from "./pages/Account/Listings/Listings";
import Bookings from "./pages/Account/Bookings/Bookings";
import Payment from "./pages/Account/Payment/Payment";
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
            path: "bookings",
            element: <Bookings />,
          },
          {
            path: "payment",
            element: <Payment />,
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
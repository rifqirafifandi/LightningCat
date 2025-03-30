import { createBrowserRouter } from "react-router";
import App from './App';
import Login from './pages/Login';

const router = createBrowserRouter([
  { path: "/", Component: App },
  { path: "/login", Component: Login }
]);

export default router;
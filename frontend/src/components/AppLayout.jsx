import React from "react";
import { Outlet } from "react-router-dom";
import { Toast, ToastContainer } from "react-bootstrap";
import { useAuth } from "../contexts/auth";
import { useNotification } from "../contexts/notification";
import Navbar from "./Navbar/Navbar";

const AppLayout = () => {
  const { notifications } = useNotification();
  const { isAuthenticated, login } = useAuth();

  React.useEffect(() => {
    if (!isAuthenticated) {
      login();
    }
  })

  return (
    <>
      <Navbar />
      <div className="container-fluid">
        <Outlet />
        <ToastContainer position="top-end" className="p-3">
          {
            notifications.map((notification) => (
              <Toast 
                key={notification.id} 
                show={notification.show} 
                onClose={() => notification.removeNotification(notification.id)}
                bg={notification.type}
                autohide
                delay={5000}
              >
                <Toast.Header>
                  <strong className="me-auto">{notification.title}</strong>
                  <small>{notification.time}</small>
                </Toast.Header>
                <Toast.Body>{notification.message}</Toast.Body>
              </Toast>
            ))
          }
        </ToastContainer>
      </div>
    </>
  );
}

export default AppLayout;
import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { PersonSquare, ListTask, CalendarEvent, CashCoin } from 'react-bootstrap-icons';
import { useAuth } from '../../contexts/auth';
import styles from './Account.module.css';

const Account = () => {
  const { isAuthenticated } = useAuth();


  if (!isAuthenticated) {
    return (
      <div>
        <h1>Please log in to view your profile.</h1>
      </div>
    );
  }

  return (
    <>
      <Container fluid className={styles.container}>
        <Row className="h-100">
          <Col md={2} className={styles.sidebarContainer}>
            <h2 className={styles.sidebarTitle}>My account</h2>
            <ul className={styles.sidebarList}>
              <li className={styles.sidebarListItem}>
                <NavLink to="profile">
                  <PersonSquare /><span>Profile</span>
                </NavLink>
              </li>
              <li className={styles.sidebarListItem}>
                <NavLink to="listings">
                  <ListTask /><span>Listings</span>
                </NavLink>
              </li>
              <li className={styles.sidebarListItem}>
                <NavLink to="bookings">
                  <CalendarEvent /><span>Bookings</span>
                </NavLink>
              </li>
              <li className={styles.sidebarListItem}>
                <NavLink to="payment">
                  <CashCoin /><span>Payment</span>
                </NavLink>
              </li>
            </ul>
          </Col>
          <Col md={10} className="h-100 overflow-scroll">
            <div className={styles.scrollContainer}>
              <Outlet />
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default Account;
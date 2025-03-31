import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
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
        <Row>
          <Col md={2}>
            <h2>My account</h2>
            <ul className={styles.sidebarList}>
              <li className={styles.sidebarListItem}><NavLink to="profile">Profile</NavLink></li>
              <li className={styles.sidebarListItem}><NavLink to="listings">Listings</NavLink></li>
              <li className={styles.sidebarListItem}><NavLink to="bookings">Bookings</NavLink></li>
            </ul>
          </Col>
          <Col md={10}>
            <Outlet />
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default Account;
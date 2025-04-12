import React from 'react';
import { Button, Table } from 'react-bootstrap';
import { useUserData } from '../../../contexts/userData';
import styles from './Bookings.module.css';
import EmptyStateGenericImage from '../../../assets/images/empty-state-generic.svg';

const Bookings = () => {
  const { bookings, fetchUserBookings } = useUserData();

  React.useEffect(() => {
    fetchUserBookings();
  }, [fetchUserBookings]);

  return (
    <>
      <div className={styles.headerContainer}>
      <h1>My Bookings</h1>
      <Button>Make bookings</Button>
      </div>
      {
        bookings.length
        ? <Table striped bordered hover>
            <thead>
              <tr>
                <th>#</th>
                <th>Listing ID</th>
                <th>Booking status</th>
                <th>Amount</th>
                <th>Payment status</th>
              </tr>
            </thead>
            <tbody>
              {
                bookings.map((booking) => (
                  <tr>
                    <td>{ booking.id }</td>
                    <td>{ booking.listing_id }</td>
                    <td>{ booking.booking_status }</td>
                    <td>{ booking.amount }</td>
                    <td>{ booking.payment_status }</td>
                  </tr>
                ))
              }
            </tbody>
          </Table>
        : <div className={styles.emptyStateContainer}>
            <img src={EmptyStateGenericImage} alt="No bookings" className={styles.emptyStateImage} />
            <p>No bookings found.</p>
          </div>
      }
      
    </>
  );
}

export default Bookings;

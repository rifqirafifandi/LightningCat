import React from 'react';
import { Button, Table } from 'react-bootstrap';
import { useAuth } from '../../../contexts/auth';
import styles from './Bookings.module.css';
import EmptyStateGenericImage from '../../../assets/images/empty-state-generic.svg';

const Bookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = React.useState([]);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`https://api.chucklenuts.party/bookings/${user.id}`, {
          method: 'GET',
          credentials: 'include',
        });

        if (response.status > 204) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        setBookings(data);
      } catch (error) {
        console.error('Error fetching listings:', error);
      }
    };

    fetchData();
  });

  return (
    <div>
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
      
    </div>
  );
}

export default Bookings;

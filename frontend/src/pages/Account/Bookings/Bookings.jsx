import React from 'react';
import { Table } from 'react-bootstrap';
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
      </div>
      {
        bookings.length
        ? <Table striped bordered hover>
            <thead>
              <tr>
                <th>#</th>
                <th>Listing ID</th>
                <th>Activity</th>
                <th>Sports Center</th>
                <th>Venue</th>
                <th>Date</th>
                <th>Duration</th>
                <th>Capacity</th>
              </tr>
            </thead>
            <tbody>
              {
                bookings.map((booking) => (
                  <tr>
                    <td>{ booking.id }</td>
                    <td>{ booking.listing.id }</td>
                    <td>{ booking.listing.activity }</td>
                    <td>{ booking.listing.facility_name }</td>
                    <td>{ booking.listing.venue }</td>
                    <td>{ booking.listing.date }</td>
                    <td>{ booking.listing.duration }</td>
                    <td>{ booking.listing.bookings_count } / { booking.listing.capacity }</td>
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

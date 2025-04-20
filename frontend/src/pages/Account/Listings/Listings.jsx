import React from 'react';
import { Button, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useUserData } from '../../../contexts/userData';
import styles from './Listings.module.css';
import EmptyStateGenericImage from '../../../assets/images/empty-state-generic.svg';

const Listings = () => {
  const navigate = useNavigate();
  const { listings, fetchUserListings } = useUserData();

  React.useEffect(() => {
    fetchUserListings();
  }, [fetchUserListings]);

  const renderAction = (listing) => {
    if (listing.status === 'full' || listing.status === 'cancelled' || listing.status === 'completed') {
      return ''
    }
    return <Button variant="priamry">Edit</Button>;
  }

  return (
    <>
      <div className={styles.headerContainer}>
        <h1>My Listings</h1>
        <Button onClick={() => navigate('create')}>Post listing</Button>
      </div>
      {
        listings.length
        ? <Table striped bordered hover>
            <thead>
              <tr>
                <th>Sport</th>
                <th>Sports Center</th>
                <th>Venue</th>
                <th>Date</th>
                <th>Duration (hrs)</th>
                <th>Capacity</th>
                <th>Fee</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {
                listings.map((listing) => (
                  <tr>
                    <td>{ listing.activity }</td>
                    <td>{ listing.facility_name }</td>
                    <td>{ listing.venue }</td>
                    <td>{ listing.date }</td>
                    <td>{ listing.duration }</td>
                    <td>{ listing.capacity }</td>
                    <td>${ listing.fee }</td>
                    <td>{ listing.status }</td>
                    <td>{ renderAction(listing) }</td>
                  </tr>
                ))
              }
            </tbody>
          </Table>
        : <div className={styles.emptyStateContainer}>
            <img src={EmptyStateGenericImage} alt="No listings" className={styles.emptyStateImage} />
            <p>You have no listings.</p>
          </div>
      }
    </>
  );
}

export default Listings;

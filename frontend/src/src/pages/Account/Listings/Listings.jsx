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
                <th>#</th>
                <th>Facility name</th>
                <th>Activity</th>
                <th>Time</th>
                <th>Capacity</th>
                <th>Price</th>
                <th>status</th>
              </tr>
            </thead>
            <tbody>
              {
                listings.map((listing) => (
                  <tr>
                    <td>{ listing.id }</td>
                    <td>{ listing.facility_name }</td>
                    <td>{ listing.activity }</td>
                    <td>{ listing.start_time } - { listing.end_time }</td>
                    <td>{ listing.capacity }</td>
                    <td>{ listing.price }</td>
                    <td>{ listing.status }</td>
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

import React from 'react';
import { Button, Table } from 'react-bootstrap';
import { useAuth } from '../../../contexts/auth';
import styles from './Listings.module.css';
import EmptyStateGenericImage from '../../../assets/images/empty-state-generic.svg';

const Listings = () => {
  const { user } = useAuth();
  const [listings, setListings] = React.useState([]);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`https://api.chucklenuts.party/listings/${user.id}`, {
          method: 'GET',
          credentials: 'include',
        });

        if (response.status > 204) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        setListings(data);
      } catch (error) {
        console.error('Error fetching listings:', error);
      }
    };

    fetchData();
  });

  return (
    <div>
      <div className={styles.headerContainer}>
      <h1>My Listings</h1>
      <Button>Post listing</Button>
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
    </div>
  );
}

export default Listings;

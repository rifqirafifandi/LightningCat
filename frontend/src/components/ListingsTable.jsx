import React from 'react';
import { NavLink } from 'react-router-dom';
import { Button, Modal, Table } from 'react-bootstrap';
import './ListingsTable.module.css';
import { useUserData } from '../contexts/userData';

const ListingsTable = (props) => {
  const { bookings, createBooking } = useUserData();
  const [showConfirmationModal, setShowConfirmationModal] = React.useState(false);
  const [selectedListing, setSelectedListing] = React.useState(null);
  if (!props.listings.length) return <p>No data found.</p>;

  const toggleConfirmationModal = (listing) => {
    setSelectedListing(listing);
    setShowConfirmationModal(n => !n);
  }

  const handleConfirmBooking = async () => {
    if (selectedListing) {
      try {
        await createBooking(selectedListing.id);
        setShowConfirmationModal(false);
      } catch (error) {
        console.error("Error confirming booking:", error);
      }
    }
  }

  return (
    <>
      <Modal
        show={showConfirmationModal}
        onHide={() => setShowConfirmationModal(false)}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm booking</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          You are about to book a listing for {selectedListing?.activity} at {selectedListing?.facility_name} on {selectedListing?.date}. ${ (selectedListing?.fee / 4).toFixed(2) } in credits will be deducted from your wallet. Are you sure you want to proceed?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={toggleConfirmationModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleConfirmBooking}>Confirm</Button>
        </Modal.Footer>
      </Modal>
      <div className="table-responsive" style={{ maxHeight: '400px', overflow: 'auto' }}>
        <Table striped bordered hover>
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
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {
              props.listings.map((listing) => (
                <tr key={ listing.id }>
                  <td>{ listing.activity }</td>
                  <td>{ listing.facility_name }</td>
                  <td>{ listing.venue }</td>
                  <td>{ listing.date }</td>
                  <td>{ listing.duration }</td>
                  <td>{ listing.bookings_count } / { listing.capacity }</td>
                  <td>${ listing.fee }</td>
                  <td>{ listing.status }</td>
                  <td>
                    {
                      listing.id === bookings.find(booking => booking.listing_id === listing.id)?.listing_id
                      ? <NavLink to="account/bookings">View your booking</NavLink>
                      : <Button variant="primary" onClick={() => toggleConfirmationModal(listing)}>Book</Button>
                    }
                  </td>
                </tr>
              ))
            }
          </tbody>
        </Table>
      </div>
    </>
  );
};


export default ListingsTable;

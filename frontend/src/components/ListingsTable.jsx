import React from 'react';
import { NavLink } from 'react-router-dom';
import { Button, Modal, Table } from 'react-bootstrap';
import { useUserData } from '../contexts/userData';
import { useAuth } from '../contexts/auth';
import './ListingsTable.module.css';

const ListingsTable = (props) => {
  const { isAuthenticated } = useAuth();
  const { bookings, fetchUserBookings, createBooking } = useUserData();
  const [showConfirmationModal, setShowConfirmationModal] = React.useState(false);
  const [selectedListing, setSelectedListing] = React.useState(null);
  
  React.useEffect(() => {
    fetchUserBookings();
  }, [fetchUserBookings]);

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

  const getFriendlyDate = (dateString) => (new Date(Date.parse(dateString))).toLocaleDateString("en-SG", { year: "numeric", month: "short", day: "numeric" })

  const renderAction = (listing) => {
    if (!isAuthenticated) return '';
    if (listing.id === bookings.find(booking => booking.listing_id === listing.id)?.listing_id) {
      return <NavLink to="account/bookings">View your booking</NavLink>;
    }
    if (listing.status === 'full' || listing.status === 'cancelled' || listing.status === 'completed') {
      return ''
    }
    return <Button variant="primary" onClick={() => toggleConfirmationModal(listing)}>Book</Button>;
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
          <p>You are about to book a listing for {selectedListing?.activity} at {selectedListing?.facility_name} on {getFriendlyDate(selectedListing?.date)}.</p>
          <p><strong>${ (selectedListing?.fee / selectedListing?.capacity).toFixed(2) }</strong> in credits will be deducted from your wallet. Are you sure you want to proceed?</p>
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
                  <td>{ getFriendlyDate(listing.date) }</td>
                  <td>{ listing.duration }</td>
                  <td>{ listing.bookings_count } / { listing.capacity }</td>
                  <td>${ listing.fee }</td>
                  <td>{ listing.status }</td>
                  <td>{ renderAction(listing) }</td>
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

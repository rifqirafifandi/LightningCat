import React from 'react';
import { Table } from 'react-bootstrap';

const ListingsTable = (props) => {
  if (!props.listings.length) return <p>No data found.</p>;

  return (
    <div className="table-responsive" style={{ maxHeight: '400px', overflow: 'auto' }}>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Sport</th>
            <th>Sports Center</th>
            <th>Venue</th>
            <th>Date</th>
            <th>Time</th>
            <th>Duration (hrs)</th>
            <th>Fee</th>
            <th>status</th>
          </tr>
        </thead>
        <tbody>
          {
            props.listings.map((listing) => (
              <tr>
                <td>{ listing.activity }</td>
                <td>{ listing.facility_name }</td>
                <td>{ listing.venue }</td>
                <td>{ listing.date }</td>
                <td>{ listing.capacity }</td>
                <td>{ listing.fee }</td>
                <td>{ listing.status }</td>
              </tr>
            ))
          }
        </tbody>
      </Table>
    </div>
  );
};


export default ListingsTable;

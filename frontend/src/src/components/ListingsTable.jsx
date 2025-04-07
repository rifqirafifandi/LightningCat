import React from 'react';
import { Table } from 'react-bootstrap';

const ListingsTable = (props) => {
  if (!props.listings.length) return <p>No data found.</p>;

  return (
    <div className="table-responsive" style={{ maxHeight: '400px', overflow: 'auto' }}>
      <Table striped bordered hover>
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
                props.listings.map((listing) => (
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
    </div>
  );
};


export default ListingsTable;

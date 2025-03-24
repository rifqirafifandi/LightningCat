import React from 'react';

const ListingsTable = (props) => {
  // Update to handle the direct array structure instead of expecting getListings property
  const listings = props.listingsData || [];
  
  if (!listings.length) return <p>No data found.</p>;

  return (
    <div className="table-responsive" style={{ maxHeight: '400px', overflow: 'auto' }}>
      <table className="table table-striped table-hover">
        <thead style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>
          <tr>
            <th>Sport</th>
            <th>Sports Center</th>
            <th>Venue</th>
            <th>Date</th>
            <th>Time</th>
            <th>Duration (hrs)</th>
            <th>Fee ($)</th>
            <th>Pax</th>
          </tr>
        </thead>
        <tbody>
          {listings.map((record, index) => (
            <tr key={index}>
              <td>{record.sport}</td>
              <td>{record.SPORTS_CEN}</td>
              <td>{record.venue}</td>
              <td>{record.date}</td>
              <td>{record.time}</td>
              <td>{record.duration}</td>
              <td>{record.fee}</td>
              <td>{record.pax}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ListingsTable;
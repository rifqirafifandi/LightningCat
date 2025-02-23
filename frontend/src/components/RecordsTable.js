import React, { useState, useEffect, useRef } from 'react';

/**
 * Displays a responsive table of record data with dynamic resizing and loading states.
 * The table dynamically adjusts its height based on the window size and includes a sticky header.
 * It displays a list of records and their properties, such as address, resale price, flat type, etc.
 * Additionally, it calculates and displays the average resale price and price per square foot (Psf) for the records.
 *
 * Props:
 * @param {Object} props - Component props.
 * @param {Object} props.recordsData - Data object containing methods to retrieve records.
 *                                     Expected to have a `getRecords` method that returns an array of record objects.
 *
 * State:
 * @state {string} tableHeight - The dynamic height of the table, adjusted based on the viewport size.
 *
 * Behavior:
 * - When the component mounts or the window is resized, the table's height is set to 30% of the viewport height.
 * - If no data is found or `getRecords` is empty, displays a message indicating no data is available.
 * - Otherwise, displays the records in a table format with a calculated average for resale price and Psf.
 *
 * Note:
 * Ensure that all record objects in `getRecords` are properly formatted and contain the necessary properties.
 *
 * @returns {React.Element} A responsive table displaying records data or appropriate loading or empty states.
 */
const RecordsTable = (props) => {
  
  const data = props.recordsData;
  const tableRef = useRef(null); 
  const [tableHeight, setTableHeight] = useState('300px');
  
  const handleResize = () => {
    if (tableRef.current) {
      setTableHeight(`${window.innerHeight * 0.3}px`);
    }
  };
  // Resize when window size changes
  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!data || !data.getRecords.length) return <p>No data found.</p>;

  // Calculate averages with ceiling
  const averagePrice = Math.ceil(data.getRecords.reduce((acc, record) => acc + record.resale_price, 0) / data.getRecords.length);
  const averagePsf = Math.ceil(data.getRecords.reduce((acc, record) => {
    const psfValue = record.Psf
    return psfValue !== "N/A" ? acc + psfValue : acc;
  }, 0) / data.getRecords.length);

  return (
    <div className="table-responsive" ref={tableRef} style={{ maxHeight: tableHeight, overflow: 'auto' }}>
      <table className="table table-striped table-hover">
        <thead style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>
          <tr>
            <th>Address</th>
            <th>Resale Price</th>
            <th>Flat Type</th>
            <th>Sqft</th>
            <th>Psf</th>
            <th>Year</th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ fontWeight: 'bold' }}>
            <td>Averages</td>
            <td>${averagePrice.toLocaleString()}</td>
            <td>—</td>
            <td>—</td>
            <td>{averagePsf}</td>
            <td>—</td>
          </tr>
          {data.getRecords.map((record, index) => (
            <tr key={index}>
              <td>{record.address}</td>
              <td>{record.resale_price.toLocaleString()}</td>
              <td>{record.flat_type}</td>
              <td>{record.Sqft}</td>
              <td>{record.Psf}</td>
              <td>{record.year}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecordsTable;

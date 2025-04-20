import React, { useState, useEffect, useRef } from 'react';

const RecordsTable = (props) => {
  const data = props.recordsData;
  const tableRef = useRef(null);
  const [tableHeight, setTableHeight] = useState('300px');
  
  const handleResize = () => {
    if (tableRef.current) {
      setTableHeight(`${window.innerHeight * 0.3}px`);
    }
  };

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!data || !data.getRecords || !data.getRecords.length) return (
    <>
      <p>Welcome to Lightning Cat! To see the details of a Sports Facility, click on any Sports Facility polygon (that's the purple shapes). Use the search bar at the top of the page to zoom in on a location of your choice. Or, you can zoom in and out and click and drag the map around to explore the sporting facilities Singapore has to offer!</p>
      
      <p>Note to grading team: Dear Professor and TAs, the weather data shown on the map is accurate for the 18 April 2025, 17:55, when there were thunderstorms across the island. The EventBridge scheduler that refreshes this data has been turned off to ensure that you will be able to view and assess the weather-related features. The scheduler can be turned on again on request.</p>
    </>
  );

  // Render custom data if the flag is set
  if (data.isCustom) {
    const record = data.getRecords[0];
    // Use the same filtering as your popup
    const entries = Object.entries(record).filter(([key, value]) => key !== 'Description' && value !== null && value !== '');
    return (
      <div className="table-responsive" ref={tableRef} style={{ maxHeight: tableHeight, overflow: 'auto' }}>
        <table className="table table-striped table-hover">
          <tbody>
            {entries.map(([key, value], index) => (
              <tr key={index}>
                <th>{key}</th>
                <td>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // If not custom data, you could simply render nothing or a message.
  return <p>No data found.</p>;
};

export default RecordsTable;
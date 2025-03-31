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

  if (!data || !data.getRecords || !data.getRecords.length) return <p>No data found.</p>;

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
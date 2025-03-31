/**
 * `ListingsTable` displays a table of HDB listings from edgeprop.
 * The table is made responsive to fit within a specified maximum height, and uses a sticky header for better readability.
 *
 * Props:
 * @param {Object} props - The component's props object.
 * @param {Object} props.listingsData - The data object that contains the listings to be displayed. Each listing should have
 *                                      properties like Address, Price, HDBType, Sqft, Psf, and URL.
 *
 * Behavior:
 * - If `listingsData` is undefined, empty, or its `getListings` array is empty, it displays a message indicating no data.
 * - Otherwise, it renders the table with the data provided.
 *
 * Note:
 * Ensure proper error handling and data validation if `getListings` might contain data with missing required fields.
 *
 * @returns {React.Element} Renders a responsive table with real estate listings or appropriate placeholders based on data availability.
 */
const ListingsTable = (props) => {
  const data = props.listingsData
  if (!data || !data.getListings.length) return <p>No data found.</p>;

  return (
    <div className="table-responsive" style={{ maxHeight: '400px', overflow: 'auto' }}>
      <table className="table table-striped table-hover">
        <thead style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>
          <tr>
            <th>Address</th>
            <th>Listing Price</th>
            <th>Flat Type</th>
            <th>Sqft</th>
            <th>Psf</th>
            <th>URL</th>
          </tr>
        </thead>
        <tbody>
          {data.getListings.map((record, index) => (
            <tr key={index}>
              <td>{record.Address}</td>
              <td>{record.Price.toLocaleString()}</td>
              <td>{record.HDBType}</td>
              <td>{record.Sqft}</td>
              <td>{record.Psf}</td>
              <td>
                <a href={record.URL} target="_blank" rel="noopener noreferrer">Link</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};


export default ListingsTable;

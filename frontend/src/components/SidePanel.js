import React  from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../App.css';
import IndexChart from './IndexChart';
import LoadingSpinner from './LoadingSpinner';
import Separator from './Separator';
import RecordsTable from './RecordsTable';
import ListingsTable from './ListingsTable';

/**
 * Renders a fixed side panel that displays interactive elements and information related to historical prices,
 * transaction records, and available listings. 
 *
 * Props:
 * @param {Object} props - Component props.
 * @param {boolean} props.avgPriceLoading - Indicates whether average price data is currently loading.
 * @param {Object} props.avgPriceData - Data for average price visualization, provided to the IndexChart component.
 * @param {boolean} props.recordsLoading - Indicates whether transaction records are currently loading.
 * @param {Object} props.recordsData - Data for transaction records, provided to the RecordsTable component.
 * @param {boolean} props.listingsLoading - Indicates whether listings data is currently loading.
 * @param {Object} props.listingsData - Data for available listings, provided to the ListingsTable component.
 *
 * Structure:
 * The side panel is a column flex container with a fixed position, including:
 * - A chart section for displaying historical price index data.
 * - A table section for showing historical transaction records.
 * - Another table section for listing available real estate listings.
 * Each section has a loading state which shows a spinner if the data is not yet available.
 *
 *
 * Style:
 * The side panel uses Bootstrap classes for basic styling and is customized with additional styles for shadows,
 * background color, and layout properties. It utilizes the full height of the viewport.
 *
 * @returns {React.Element} A styled side panel that displays various data visualizations and tables.
 */
const SidePanel = (props) => (
  <div className="col-md-6 position-fixed bottom-0 end-0 vh-100" style={{
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'white',
    boxShadow: '-1px 0 5px rgba(0,0,0,0.5)',
    padding: '20px',
    boxSizing: 'border-box',
    zIndex: 1050,
  }}>
    <div className="heading-container" >
      <div className="chart-icon"></div>
      <h5>Historical Price in Area vs Index</h5>
    </div>
    <div className="chart-container">
      {props.avgPriceLoading ? (
        <LoadingSpinner/>
      ) : (
        <IndexChart avgPriceData={props.avgPriceData} />
      )}
    </div>
    <Separator />
    <div className="heading-container">
      <div className="records-map-pins"></div>
      <h5>Historical Transactions</h5>
    </div>
    <div style={{ flex: '1' }}>
      {props.recordsLoading ? (
        <LoadingSpinner/>
      ) : (
        <RecordsTable recordsData={props.recordsData} />
      )}
    </div>
    <Separator />
    <div className="heading-container" >
      <div className="listing-map-pins"></div>
      <h5>Available Listings</h5>
    </div>
    <div style={{ flex: '1' }}>
      {props.listingsLoading ? (
        <LoadingSpinner/>
      ) : (
        <ListingsTable listingsData={props.listingsData} />
      )}
    </div>
  </div>
);

export default SidePanel;

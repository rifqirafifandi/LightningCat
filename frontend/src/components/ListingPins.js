import { useEffect } from 'react';

/**
 * `ListingPins` is a utility component that converts listing data into GeoJSON format for use in mapping interfaces.
 * It processes each listing's geographic (longitude and latitude) and descriptive data into GeoJSON 'Feature' objects,
 *
 * This component does not render any visual content itself; instead, it updates GeoJSON state data for external use in maps.
 *
 * Props:
 * @param {Object} props - The properties passed to the component.
 * @param {Object} props.listingsData - Data object containing an array of listings, each with necessary geographic and descriptive information.
 * @param {Function} props.setListingGeojson - State setter function from `useState` or `useReducer` that updates the GeoJSON state based on processed listing data.
 *
 * Behavior:
 * - The component listens for changes in `listingsData` and triggers a reformatting of this data into GeoJSON whenever it updates.
 * - The formatted GeoJSON is then used to update a state variable via `setListingGeojson`, typically managed by a parent component for use in a mapping context.
 * - Ensures that each property from the listing data is correctly placed into the GeoJSON structure, including a direct URL to the listing for easy access.
 *
 * Note:
 * - Ensure that `listingsData` contains the necessary properties (`lng`, `lat`, `Address`, etc.) for proper GeoJSON formatting.
 * - This component is intended to be used in applications where real-time mapping of data is required.
 *
 * @returns {null} As a utility component, `ListingPins` does not render any visual content.
 */
function ListingPins({ listingsData, setListingGeojson }) {
  useEffect(() => {
    if (listingsData && listingsData.getListings) {
      const newFeatures = listingsData.getListings.map(record => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [record.lng, record.lat]
        },
        properties: {
            title: record.Address,
            description: `Flat Type: ${record.HDBType}, Price: ${record.Price.toLocaleString()} Floor Area Sqft: ${record.Sqft}, Psf: ${record.Psf}`,
            linkUrl: record.URL 
          }
      }));

      setListingGeojson(prevListingGeojson => ({
        ...prevListingGeojson,
        features: newFeatures
      }));
    }
  }, [listingsData, setListingGeojson]);
  
  return null; 
}

export default ListingPins;

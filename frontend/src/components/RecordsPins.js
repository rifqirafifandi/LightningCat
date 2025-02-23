import { useEffect } from 'react';

/**
 * Converts `recordsData` into GeoJSON format and updates the GeoJSON state managed by `setRecordsGeojson`.
 * This component is intended for use in mapping applications where point data (representing locations)
 * needs to be dynamically displayed or updated. Each record's geographic (longitude and latitude) and
 * descriptive data is transformed into GeoJSON format, which can then be used by mapping libraries like Mapbox.
 *
 * Props:
 * @param {Function} setRecordsGeojson - A state setter function from useState for updating the GeoJSON data.
 * @param {Object} recordsData - An object containing methods to retrieve records, specifically `getRecords`,
 *                               which should return an array of record objects each containing location and descriptive data.
 *
 * Usage:
 * This component does not render any visual elements directly but should be included in components
 * where its side-effect (data processing and state updating) is required. Ensure that both `recordsData`
 * and `setRecordsGeojson` are provided.
 *
 * <RecordsPins setRecordsGeojson={setGeoJsonData} recordsData={recordsData} />
 *
 * @returns {null} Nothing is rendered by this component.
 */
function RecordsPins({ setRecordsGeojson, recordsData }) {
  useEffect(() => {
    if (recordsData && recordsData.getRecords) {
      const newFeatures = recordsData.getRecords.map(record => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [record.lng, record.lat]
        },
        properties : {
          title: record.address,
          description: 
            `Flat Type: ${record.flat_type}, 
            Resale Price: ${record.resale_price.toLocaleString()}, 
            Floor Area Sqft: ${Math.ceil(record.floor_area_sqm * 10.764).toLocaleString()}, 
            Year: ${record.year}`
        }
      }));

      setRecordsGeojson(prevRecordsGeojson => ({
        ...prevRecordsGeojson,
        features: newFeatures
      }));
    }
  }, [recordsData, setRecordsGeojson]);

  return null; // Does not render anything by itself
}

export default RecordsPins;

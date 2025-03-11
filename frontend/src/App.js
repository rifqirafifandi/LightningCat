import React, { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Navbar from './components/Navbar';
import FilterPanel from './components/FilterPanel';
import SidePanel from './components/SidePanel';
import SearchInputBox from './components/SearchInputBox';

import Queries from './queries/Queries';
import { useLazyQuery } from '@apollo/client';

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

const App = () => {
  // initialise state and refs
  const mapContainerRef = useRef(null);
  const [map, setMap] = useState(null);
  const [areaState, setAreaState] = useState({
    town: [],
    flatType: [],
    yearRangeGte: 2000,
    minPsf: undefined,
    maxPsf: undefined,
    minSqf: undefined,
    maxSqf: undefined,
  });

  // New state to hold the custom record data from a polygon click
  const [customRecordsData, setCustomRecordsData] = useState(null);
  const [getRecordsData, { 
    error: recordsError,
    loading: recordsLoading,
    data: recordsData 
  }] = useLazyQuery(Queries.GET_RECORDS, { variables: areaState });
  const [getListingsData, { 
    error: listingsError, 
    loading: listingsLoading, 
    data: listingsData 
  }] = useLazyQuery(Queries.GET_LISTINGS, { variables: areaState });
  const [getDistinctTowns, { 
    error: townsError, 
    loading: townsLoading, 
    data: townsData 
  }] = useLazyQuery(Queries.GET_DISTINCT_TOWNS);
  const [getDistinctFlatTypes, { 
    error: flatTypesError, 
    loading: flatTypesLoading, 
    data: flatTypesData 
  }] = useLazyQuery(Queries.GET_DISTINCT_FLAT_TYPES);
  const [getRecordsAvgPrice, { 
    error: avgPriceError, 
    loading: avgPriceLoading, 
    data: avgPriceData 
  }] = useLazyQuery(Queries.GET_RECORDS_AVG_PRICE, { variables: areaState });

  useEffect(() => {
    const mapInstance = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [103.8198, 1.3521],
      zoom: 11,
    });

    mapInstance.on('load', () => {
      updateBounds(mapInstance.getBounds().toArray());
      getRecordsAvgPrice();
      getRecordsData();
      getListingsData();
      getDistinctTowns();
      getDistinctFlatTypes();

      // Load and display polygons from the preprocessed GeoJSON file
      fetch('/SportSGSportFacilitiesGEOJSON.geojson')
        .then(response => response.json())
        .then(data => {
          mapInstance.addSource('sportFacilities', {
            type: 'geojson',
            data: data
          });

          mapInstance.addLayer({
            id: 'sportFacilitiesFill',
            type: 'fill',
            source: 'sportFacilities',
            layout: {},
            paint: {
              'fill-color': '#800080',
              'fill-opacity': 0.5
            }
          });

          mapInstance.addLayer({
            id: 'sportFacilitiesBorder',
            type: 'line',
            source: 'sportFacilities',
            layout: {},
            paint: {
              'line-color': '#000000',
              'line-width': 2
            }
          });

          mapInstance.on('mouseenter', 'sportFacilitiesFill', () => {
            mapInstance.getCanvas().style.cursor = 'pointer';
          });
          mapInstance.on('mouseleave', 'sportFacilitiesFill', () => {
            mapInstance.getCanvas().style.cursor = '';
          });

          // Inside your mapInstance.on('click', 'sportFacilitiesFill', ...) handler:
          mapInstance.on('click', 'sportFacilitiesFill', (e) => {
            const feature = e.features && e.features[0];
            if (feature) {
              let popupContent = '<table>';
              let recordObj = {};
              Object.entries(feature.properties).forEach(([key, value]) => {
                if (key === 'Description' || value === null || value === '') return;
                popupContent += `<tr><th>${key}</th><td>${value}</td></tr>`;
                recordObj[key] = value;
              });
              popupContent += '</table>';
              
              new mapboxgl.Popup({ maxWidth: "600px" })
                .setLngLat(e.lngLat)
                .setHTML(popupContent)
                .addTo(mapInstance);

              // Set custom records data with a flag to indicate custom popup data
              setCustomRecordsData({ isCustom: true, getRecords: [recordObj] });
            }
          });
        })
        .catch(err => {
          console.error('Error loading sport facilities GeoJSON:', err);
        });
    });

    mapInstance.on('moveend', () => {
      updateBounds(mapInstance.getBounds().toArray());
      getRecordsAvgPrice();
      getRecordsData();
      getListingsData();
    });

    setMap(mapInstance);

    return () => {
      mapInstance.remove();
    };
  }, [getRecordsData, getListingsData, getRecordsAvgPrice]);

  const updateBounds = (bounds) => {
    const [lonMin, latMin, lonMax, latMax] = [bounds[0][0], bounds[0][1], bounds[1][0], bounds[1][1]];
    setAreaState(prevState => ({
      ...prevState,
      latRangeGte: latMin,
      latRangeLte: latMax,
      lonRangeGte: lonMin,
      lonRangeLte: lonMax
    }));
  };

  const onFlyTo = ({ lng, lat }) => {
    if (map) {
      map.flyTo({
        center: [lng, lat],
        essential: true,
        zoom: 15,
      });
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-6">
            <div className="row mt-1 mb-1">
              <div className="col-md-6">
                {map && <SearchInputBox onFlyTo={onFlyTo} />}
              </div>
              <div className="col-md-6">
                <FilterPanel areaState={areaState} setAreaState={setAreaState} towns={townsData} flatTypes={flatTypesData} />
              </div>
            </div>
            <div className="map-container" ref={mapContainerRef} style={{ width: '100%', height: 'calc(100vh - 110px)' }}></div>
          </div>
          <div className="col-md-6">
            <SidePanel 
              recordsLoading={recordsLoading}
              listingsLoading={listingsLoading}
              avgPriceLoading={avgPriceLoading}
              recordsData={customRecordsData ? customRecordsData : recordsData}
              listingsData={listingsData}
              avgPriceData={avgPriceData}
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default App;
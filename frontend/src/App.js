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
  
  const [customRecordsData, setCustomRecordsData] = useState(null);
  
  const [getListingsData, { error: listingsError, loading: listingsLoading, data: listingsData }] = useLazyQuery(Queries.GET_LISTINGS, { variables: areaState });
  const [getDistinctTowns, { data: townsData }] = useLazyQuery(Queries.GET_DISTINCT_TOWNS);
  const [getDistinctFlatTypes, { data: flatTypesData }] = useLazyQuery(Queries.GET_DISTINCT_FLAT_TYPES);

  useEffect(() => {
    const mapInstance = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [103.8198, 1.3521],
      zoom: 11,
    });

    mapInstance.on('load', () => {
      updateBounds(mapInstance.getBounds().toArray());
      getListingsData();
      getDistinctTowns();
      getDistinctFlatTypes();

      fetch('/SportSGSportFacilitiesGEOJSON.geojson')
        .then(response => response.json())
        .then(data => {
          mapInstance.addSource('sportFacilities', { type: 'geojson', data });
          
          mapInstance.addLayer({
            id: 'sportFacilitiesFill',
            type: 'fill',
            source: 'sportFacilities',
            paint: { 'fill-color': '#800080', 'fill-opacity': 0.5 }
          });
          
          mapInstance.addLayer({
            id: 'sportFacilitiesBorder',
            type: 'line',
            source: 'sportFacilities',
            paint: { 'line-color': '#000000', 'line-width': 2 }
          });

          mapInstance.on('mouseenter', 'sportFacilitiesFill', () => {
            mapInstance.getCanvas().style.cursor = 'pointer';
          });
          
          mapInstance.on('mouseleave', 'sportFacilitiesFill', () => {
            mapInstance.getCanvas().style.cursor = '';
          });

          mapInstance.on('click', 'sportFacilitiesFill', (e) => {
            const feature = e.features && e.features[0];
            if (feature) {
              let recordObj = {};
              Object.entries(feature.properties).forEach(([key, value]) => {
                if (key !== 'Description' && value) {
                  recordObj[key] = value;
                }
              });
              
              new mapboxgl.Popup({ maxWidth: "600px" })
                .setLngLat(e.lngLat)
                .setHTML(`<table>${Object.entries(recordObj).map(([key, val]) => `<tr><th>${key}</th><td>${val}</td></tr>`).join('')}</table>`)
                .addTo(mapInstance);
              
              setCustomRecordsData({ isCustom: true, getRecords: [recordObj] });
            }
          });
        })
        .catch(err => console.error('Error loading sport facilities GeoJSON:', err));
    });

    mapInstance.on('moveend', () => {
      updateBounds(mapInstance.getBounds().toArray());
      getListingsData();
    });

    setMap(mapInstance);
    return () => mapInstance.remove();
  }, [getListingsData]);

  const updateBounds = (bounds) => {
    const [lonMin, latMin, lonMax, latMax] = [bounds[0][0], bounds[0][1], bounds[1][0], bounds[1][1]];
    setAreaState(prevState => ({ ...prevState, latRangeGte: latMin, latRangeLte: latMax, lonRangeGte: lonMin, lonRangeLte: lonMax }));
  };

  const onFlyTo = ({ lng, lat }) => {
    if (map) {
      map.flyTo({ center: [lng, lat], essential: true, zoom: 15 });
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-6">
            <div className="row mt-1 mb-1">
              <div className="col-md-6">{map && <SearchInputBox onFlyTo={onFlyTo} />}</div>
              <div className="col-md-6">
                <FilterPanel areaState={areaState} setAreaState={setAreaState} towns={townsData} flatTypes={flatTypesData} />
              </div>
            </div>
            <div className="map-container" ref={mapContainerRef} style={{ width: '100%', height: 'calc(100vh - 110px)' }}></div>
          </div>
          <div className="col-md-6">
            <SidePanel 
              listingsLoading={listingsLoading}
              recordsData={customRecordsData}
              listingsData={listingsData}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;

import React, { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Navbar from './components/Navbar';
import FilterPanel from './components/FilterPanel';
import SidePanel from './components/SidePanel';
import SearchInputBox from './components/SearchInputBox';
import RecordsPins from './components/RecordsPins';
import ListingPins from './components/ListingPins';
import Queries from './queries/Queries';
import { useLazyQuery } from '@apollo/client';

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

const App = () => {
  // initialise state and refs
  const mapContainerRef = useRef(null);
  const recordsMarkersRef = useRef([]);
  const listingMarkersRef = useRef([])
  const [map, setMap] = useState(null);
  const [areaState, setAreaState] = useState({
    town: [], 
    flatType:[], 
    yearRangeGte: 2000, 
    minPsf: undefined,
    maxPsf: undefined,
    minSqf: undefined,
    maxSqf: undefined,
  })
  const [recordsGeojson, setRecordsGeojson] = useState({
    type: 'FeatureCollection',
    features: []
  });
  const [listingGeojson, setListingGeojson] = useState({
    type: 'FeatureCollection',
    features: []
  });
  const [getRecordsData, { 
    error: recordsError,
    loading: recordsLoading,
    data: recordsData 
  }] = useLazyQuery(Queries.GET_RECORDS,
    { variables:  areaState
  })
  const [getListingsData, { 
    error: listingsError, 
    loading: listingsLoading, 
    data: listingsData 
  }] = useLazyQuery(Queries.GET_LISTINGS,
    { variables:  areaState
  })
  const [getDistinctTowns, { 
    error: townsError, 
    loading: townsLoading, 
    data: townsData 
  }] = useLazyQuery(Queries.GET_DISTINCT_TOWNS)
  const [getDistinctFlatTypes, { 
    error: flatTypesError, 
    loading: flatTypesLoading, 
    data: flatTypesData 
  }] = useLazyQuery(Queries.GET_DISTINCT_FLAT_TYPES)
  const [getRecordsAvgPrice, { 
    error: avgPriceError, 
    loading: avgPriceLoading, 
    data: avgPriceData 
  }] = useLazyQuery(Queries.GET_RECORDS_AVG_PRICE,
    {variables: areaState})

  // main hook for handling changes in map view
  // on change in map view, query mongoDB for updated datapoints
  useEffect(() => {
    const mapInstance = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [103.8198, 1.3521],
      zoom: 11,
    });

    mapInstance.on('load', () => {
      updateRecordsGeojsonMarkers(mapInstance, recordsGeojson);
      updateListingGeojsonMarkers(mapInstance, listingGeojson);
      updateBounds(mapInstance.getBounds().toArray());
      getRecordsAvgPrice();
      getRecordsData();
      getListingsData();
      getDistinctTowns();
      getDistinctFlatTypes();
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
      recordsMarkersRef.current.forEach(marker => marker.remove());
      listingMarkersRef.current.forEach(marker => marker.remove()); // Cleanup markers
    };
  }, [getRecordsData, getListingsData, getRecordsAvgPrice]);
  
  // update markers when recordsGeojson or listingGeojson changes
  useEffect(() => {
    if (map) {
      updateRecordsGeojsonMarkers(map, recordsGeojson);
      updateListingGeojsonMarkers(map, listingGeojson);
    }
  }, [recordsGeojson, listingGeojson, map]); // Update markers when geojson or map changes

  // Function to update records markers on the map
  const updateRecordsGeojsonMarkers = (map, geojson) => {
    recordsMarkersRef.current.forEach(marker => marker.remove()); 
    recordsMarkersRef.current = []; 
  
    geojson.features.forEach(feature => {
      const el = document.createElement('div');
      el.className = 'records-map-pins';
      
      // Create HTML string for popup content
      const popupHTML = `
      <strong>${feature.properties.title}</strong>

      <p>${feature.properties.description}</p>
      `;
      // Create markers for datapoints 
      const marker = new mapboxgl.Marker(el)
        .setLngLat(feature.geometry.coordinates)
        .setPopup(
          new mapboxgl.Popup({ offset: 20 }) 
            .setHTML(popupHTML)
        )
        .addTo(map);
  
      recordsMarkersRef.current.push(marker);
    });
  };
  
  // Function to update listing markers on the map
  const updateListingGeojsonMarkers = (map, geojson) => {
    listingMarkersRef.current.forEach(marker => marker.remove());
    listingMarkersRef.current = [];
    
    geojson.features.forEach(feature => {
      const el = document.createElement('div');
      el.className = 'listing-map-pins';
      
      // Correctly formatted HTML with dynamic URL in the href attribute
      const popupHTML = `
        <strong>${feature.properties.title}</strong>
        <p>${feature.properties.description}</p>
        <a href="${feature.properties.linkUrl}" target="_blank" rel="noopener noreferrer">Listing</a>
      `;
  
      // Create markers for datapoints 
      const marker = new mapboxgl.Marker(el)
        .setLngLat(feature.geometry.coordinates)
        .setPopup(
          new mapboxgl.Popup({ offset: 20 })
            .setHTML(popupHTML)
        )        
        .addTo(map);
      
      listingMarkersRef.current.push(marker);
    });
  };
  
  // update areaState on map movement
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
  
  // Fucntion to fly to location on map based on coordinates (search function)
  const onFlyTo = ({ lng, lat }) => {
    if (map) {
      map.flyTo({
        center: [lng, lat],
        essential: true, // This is used to indicate that the movement is user-driven
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
                <FilterPanel areaState={areaState} setAreaState={setAreaState} towns={townsData} flatTypes={flatTypesData}/>
              </div>
            </div>
            <div className="map-container" ref={mapContainerRef} style={{ width: '100%', height: 'calc(100vh - 110px)' }}></div> 
          </div>
          <div className="col-md-6">
            <SidePanel 
              recordsLoading={recordsLoading}
              listingsLoading={listingsLoading}
              avgPriceLoading={avgPriceLoading}
              recordsData={recordsData}
              listingsData={listingsData}
              avgPriceData={avgPriceData}
            />
          </div>
        </div>
        <RecordsPins recordsLoading={recordsLoading} recordsData={recordsData} setRecordsGeojson={setRecordsGeojson} />
        <ListingPins listingsLoading={listingsLoading} listingsData={listingsData} setListingGeojson={setListingGeojson} />
      </div>
    </div>
  );
  };

export default App;

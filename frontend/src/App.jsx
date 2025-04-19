import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import { useAuth } from './contexts/auth';
import { useAppData } from './contexts/appData';
import SidePanel from './components/SidePanel';
import SearchInputBox from './components/SearchInputBox';
import { Button, Modal } from 'react-bootstrap';
import { Magic } from 'react-bootstrap-icons';
import * as turf from '@turf/turf';

import 'mapbox-gl/dist/mapbox-gl.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { factorial } from 'simple-statistics';
import { autofill } from '@mapbox/search-js-web';

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

const App = () => {
  const { user, isAuthenticated } = useAuth();
  const { facilities, setFacilities } = useAppData();
  const mapContainerRef = useRef(null);
  const [map, setMap] = useState(null);
  const [showRecommenderModal, setShowRecommenderModal] = useState(false);
  const navigate = useNavigate();  

  const [areaState, setAreaState] = useState({});

  const [customRecordsData, setCustomRecordsData] = useState(null);
  const [recommendedPolygons, setRecommendedPolygons] = useState([]);
  const [layerVisibility, setLayerVisibility] = useState({
    towns: true,
    sportFacilities: true,
    lightning: true,
    recommended: true,
  });

  // States to store data for the various JSON files:
  const [townsGeoJson, setTownsGeoJson] = useState(null);
  const [sportFacilitiesGeoJson, setSportFacilitiesGeoJson] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [lightningData, setLightningData] = useState(null);

  // Function to check if a point is within 8 km of any lightning strike
  const isWithinLightningRadius = (facility, lightningStrikes) => {
  const facilityCoords = [parseFloat(facility.longitude), parseFloat(facility.latitude)];
  return lightningStrikes.some((strike) => {
    const strikeCoords = [parseFloat(strike.location.longitude), parseFloat(strike.location.latitude)];
    const distance = turf.distance(facilityCoords, strikeCoords, { units: 'kilometers' });
    return distance <= 8;
  });
};

  // 1) Fetch all required static files and store each response in its respective state.
  useEffect(() => {
    Promise.all([
      fetch('https://api.chucklenuts.party/facilities'), // HTTP endpoint for facilities capacities proxied through API server
      fetch('/MasterPlan2019PlanningAreaBoundaryNoSea.processed.geojson'),
      fetch('/SportSGSportFacilitiesGEOJSON.geojson'),
      fetch('https://cc5224-bucket1.s3.ap-southeast-1.amazonaws.com/apidata/weather2h.json'), // 2H weather data
      fetch('https://cc5224-bucket1.s3.ap-southeast-1.amazonaws.com/apidata/lightning10min.json'), // Lightning data
    ])
      .then((responses) => Promise.all(responses.map((r) => r.json())))
      .then(
        ([
          facilitiesData,
          townsData,
          sportsData,
          weatherJsonData,
          lightningData
        ]) => {
          setFacilities(facilitiesData);
          setTownsGeoJson(townsData);
          setSportFacilitiesGeoJson(sportsData);
          setWeatherData(weatherJsonData);
          setLightningData(lightningData);
        } 
      )
      .catch((err) => console.error('Error fetching data:', err));
  }, []);

  // 2) Initialize the map once, on component mount.
  useEffect(() => {
    const mapInstance = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [103.8198, 1.3521],
      zoom: 11,
    });

    mapInstance.on('load', () => {
      updateBounds(mapInstance.getBounds().toArray());
    });

    mapInstance.on('moveend', () => {
      updateBounds(mapInstance.getBounds().toArray());
    });

    setMap(mapInstance);

    // Cleanup on unmount
    return () => mapInstance.remove();
  }, []);

  // Add layers (town polygons & sport facilities polygons) once both the map and corresponding GeoJSON data are available.
  useEffect(() => {
    if (!map) return;
    
    map.on('load', () => {
      // Add Towns Layer
      if (townsGeoJson && !map.getSource('towns')) {
        map.addSource('towns', { type: 'geojson', data: townsGeoJson });
        map.addLayer({
          id: 'townsFill',
          type: 'fill',
          source: 'towns',
          paint: {
            'fill-color': 'lightblue',
            'fill-opacity': 0.5,
          },
        });
        map.addLayer({
          id: 'townsBorder',
          type: 'line',
          source: 'towns',
          paint: { 'line-color': '#000000', 'line-width': 2 },
        });
  
        // Town polygon click event to show weather forecast
        map.on('click', 'townsFill', (e) => {

          const sportFeatures = map.queryRenderedFeatures(e.point, { layers: ['sportFacilitiesFill'] });
          if (sportFeatures && sportFeatures.length > 0) return; // A sports facility was clicked, so skip the townsFill handler
         
          const feature = e.features && e.features[0];
          if (!feature) return;
  
          const clickedTown = feature.properties.PLN_AREA_N;
          const clickedTownLower = clickedTown.toLowerCase();
  
          if (weatherData?.data?.items?.[0]?.forecasts) {
            const forecasts = weatherData.data.items[0].forecasts;
            const matchingForecast = forecasts.find(
              (f) => f.area.toLowerCase() === clickedTownLower
            );
  
            let popupContent = `<div><h4>${clickedTown}</h4>`;
            if (matchingForecast) {
              popupContent += `<p><strong>Forecast:</strong> ${matchingForecast.forecast}</p>`;
            } else {
              popupContent += `<p>No forecast available</p>`;
            }
            popupContent += `</div>`;
  
            new mapboxgl.Popup({ maxWidth: '400px' })
              .setLngLat(e.lngLat)
              .setHTML(popupContent)
              .addTo(map);
          }
        });
      }
      // Add Sport Facilities Layer
      if (sportFacilitiesGeoJson && !map.getSource('sportFacilities')) {
        map.addSource('sportFacilities', {
          type: 'geojson',
          data: sportFacilitiesGeoJson,
        });

        map.addLayer({
          id: 'sportFacilitiesFill',
          type: 'fill',
          source: 'sportFacilities',
          paint: { 'fill-color': '#800080', 'fill-opacity': 0.9 },
        });

        map.addLayer({
          id: 'sportFacilitiesBorder',
          type: 'line',
          source: 'sportFacilities',
          paint: { 'line-color': '#000000', 'line-width': 2 },
        });

        map.on('mouseenter', 'sportFacilitiesFill', () => {
          map.getCanvas().style.cursor = 'pointer';
        });

        map.on('mouseleave', 'sportFacilitiesFill', () => {
          map.getCanvas().style.cursor = '';
        });

// Click event for sport facilities polygons
map.on('click', 'sportFacilitiesFill', (e) => {
  const feature = e.features && e.features[0];
  if (!feature) return;

  // Build a record object for the side panel
  let recordObj = {};
  Object.entries(feature.properties).forEach(([key, value]) => {
    if (key !== 'Description' && value) {
      recordObj[key] = value;
    }
  });

  // The property for facility name in the GEOJSON
  const sportsCen = feature.properties.SPORTS_CEN;

  // Find matching facility details from the external JSON (facilitiesCapacities)
  const details = findFacilityByName(sportsCen, facilities);

  // Fetch lightning data if available
  const lightningReadings = lightningData.data.records[0].item.readings;

  // Fallback values from the feature if no matching details are found
  let facilityName = feature.properties.FacilityName || 'Facility Information';
  let facilityAddress = feature.properties.Address || 'Not available';
  const facilityType = feature.properties.Type || 'Not specified';

  // If details exist, override the name/address from the facility data
  if (details) {
    if (details.name) facilityName = details.name;
    if (details.address) facilityAddress = details.address;
  }

  // Build the capacity details section only if details exist
  // and at least one of swimming/gym is available
  let capacityDetailsHtml = '';
  if (details) {
    const swimmingAvailable = details.swimming?.available;
    const gymAvailable = details.gym?.available;

    if (swimmingAvailable || gymAvailable) {
      capacityDetailsHtml = `
        <hr/>
        <h5>Facility Capacity Details</h5>
        <p></p>
          ${
            swimmingAvailable
              ? `
                <div>
                  <h6>Swimming Facility</h6>
                  <strong>Capacity:</strong> ${details.swimming.capacity}
                  <strong>Status:</strong> ${details.swimming.closed ? 'Closed' : 'Open'}
                </div>
              `
              : ''
          }
          <p></p>
          ${
            gymAvailable
              ? `
                <div>
                  <h6>Gym Facility</h6>
                  <strong>Capacity:</strong> ${
                    details.gym.capacity !== null ? details.gym.capacity : 'N/A'
                  }
                  <strong>Status:</strong> ${
                    details.gym.closed === null
                      ? 'Not Available'
                      : (details.gym.closed ? 'Closed' : 'Open')
                  }
                </div>
                <p></p>
              `
              : ''
          }
        
      `;

      // Check if the facility is within 8 km of any lightning strike
      let facilityLoc = {
        latitude: details.location[0],
        longitude: details.location[1],
      }
      if (isWithinLightningRadius(facilityLoc, lightningReadings)) {
        capacityDetailsHtml += `
          <div style="color: red;">
            <h6>Lightning Risk</h6>
            This facility is within 8 km of a recent lightning strike.
          </div>
        `;
      }
    }
  } else {
    capacityDetailsHtml = `<p>No matching facility found for ${sportsCen}.</p>`;
  }

  // Combine everything into the popup HTML
  const popupHtml = `
    <div>
      <h4>${facilityName}</h4>
      <p><strong>Address:</strong> ${facilityAddress}</p>
      ${capacityDetailsHtml}
    </div>
  `;

  // Show the popup
  new mapboxgl.Popup({ maxWidth: '600px' })
    .setLngLat(e.lngLat)
    .setHTML(popupHtml)
    .addTo(map);

  // Update the side panel
  setCustomRecordsData({ isCustom: true, getRecords: [recordObj] });
});
      }

    // --- Add Lightning Layer ---
    // Load the lightning icon image
  map.loadImage('lightning-icon.png', (error, image) => {
    if (error) throw error;

    // Add the image to the map
    if (!map.hasImage('lightning-icon')) {
      map.addImage('lightning-icon', image);
    }

    // --- Add Lightning Strikes Layer ---
    if (lightningData && !map.getSource('lightningStrikes')) {
      const lightningReadings = lightningData.data.records[0].item.readings;
      const lightningGeoJson = {
        type: 'FeatureCollection',
        features: lightningReadings.map((strike) => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [parseFloat(strike.location.longitude), parseFloat(strike.location.latitude)],
          },
          properties: {
            type: strike.type,
            text: strike.text,
            datetime: strike.datetime,
          },
        })),
      };

      map.addSource('lightningStrikes', {
        type: 'geojson',
        data: lightningGeoJson,
      });

      map.addLayer({
        id: 'lightningStrikesLayer',
        type: 'symbol',
        source: 'lightningStrikes',
        layout: {
          'icon-image': 'lightning-icon',
          'icon-size': 0.05, // Adjust the size as needed
        },
      });

      map.on('click', 'lightningStrikesLayer', (e) => {
        const feature = e.features && e.features[0];
        if (!feature) return;

        const { text, datetime } = feature.properties;
        const popupContent = `
          <div>
            <h5>Lightning Strike</h5>
            <p><strong>Type:</strong> ${text}</p>
            <p><strong>Time:</strong> ${new Date(datetime).toLocaleString()}</p>
          </div>
        `;

        new mapboxgl.Popup({ maxWidth: '300px' })
          .setLngLat(feature.geometry.coordinates)
          .setHTML(popupContent)
          .addTo(map);
      });
    }
  });

    })
  }, [
    map,
    townsGeoJson,
    sportFacilitiesGeoJson,
    weatherData,
    facilities,
    lightningData,
  ]);

  // Helper to find a facility by name (SPORTS_CEN) inside facilitiesCapacities
  // Adjust this if `facilitiesCapacities` is a single object or an array of objects.
  const findFacilityByName = (name, facilitiesData) => {
    if (!facilitiesData) return null;

    // If facilitiesData is an array of facility objects:
    // e.g. [ { name: "Clementi Stadium", ... }, { name: "XYZ", ... }, ... ]
    if (Array.isArray(facilitiesData)) {
      return facilitiesData.find((fac) => fac.name === name) || null;
    }

    // If facilitiesData is not an array but just a single object
    // with a "name" property, check directly:
    if (facilitiesData.name === name) {
      return facilitiesData;
    }
    return null;
  };

  useEffect(() => {
    if (!map || recommendedPolygons.length === 0) return;
  
    if (map.getSource('recommended')) {
      map.getSource('recommended').setData({
        type: 'FeatureCollection',
        features: recommendedPolygons.map((rec) => ({
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [[...rec.coordinates.map(coord => [coord[1], coord[0]])]],
          },
          properties: {
            name: rec.name,
            alternatives: rec.alternatives.join(', '),
            gym: JSON.stringify(rec.gym),
            swimming: JSON.stringify(rec.swimming),
          },
        })),
      });
      return;
    }
  
    const geoJson = {
      type: 'FeatureCollection',
      features: recommendedPolygons.map((rec) => ({
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [[...rec.coordinates.map(coord => [coord[1], coord[0]])]],
        },
        properties: {
          name: rec.name,
          alternatives: rec.alternatives.join(', '),
          gym: JSON.stringify(rec.gym),
          swimming: JSON.stringify(rec.swimming),
        },
      })),
    };
  
    map.addSource('recommended', {
      type: 'geojson',
      data: geoJson,
    });
  
    map.addLayer({
      id: 'recommended-fill',
      type: 'fill',
      source: 'recommended',
      paint: {
        'fill-color': '#ffffff',
        'fill-opacity': 0.5,
      },
    });
  
    map.addLayer({
      id: 'recommended-outline',
      type: 'line',
      source: 'recommended',
      paint: {
        'line-color': '#000000',
        'line-width': 2,
      },
    });
  
    map.on('click', 'recommended-fill', (e) => {
      const props = e.features[0].properties;
      const gym = JSON.parse(props.gym);
      const swimming = JSON.parse(props.swimming);
  
      const popupHtml = `
        <div>
          <h4>${props.name}</h4>
          <p><strong>Alternatives:</strong> ${props.alternatives}</p>
          ${gym?.available ? `<p><strong>Gym:</strong> ${gym.closed ? 'Closed' : 'Open'} (${gym.capacity} cap)</p>` : ''}
          ${swimming?.available ? `<p><strong>Swimming:</strong> ${swimming.closed ? 'Closed' : 'Open'} (${swimming.capacity} cap)</p>` : ''}
        </div>
      `;
  
      new mapboxgl.Popup({ maxWidth: '400px' })
        .setLngLat(e.lngLat)
        .setHTML(popupHtml)
        .addTo(map);
    });
  
  }, [map, recommendedPolygons]);

  // Update bounds in areaState so that queries can use the current viewport.
  const updateBounds = (bounds) => {
    const [lonMin, latMin, lonMax, latMax] = [
      bounds[0][0],
      bounds[0][1],
      bounds[1][0],
      bounds[1][1],
    ];
    setAreaState((prevState) => ({
      ...prevState,
      latRangeGte: latMin,
      latRangeLte: latMax,
      lonRangeGte: lonMin,
      lonRangeLte: lonMax,
    }));
  };

  // Fly the map to a specific coordinate (used by SearchInputBox)
  const onFlyTo = ({ lng, lat }) => {
    if (map) {
      map.flyTo({ center: [lng, lat], essential: true, zoom: 15 });
    }
  };

  // init user layer handling 
  const updateLayerVisibility = (layerId, visible) => {
    if (!map) return;
    const visibility = visible ? 'visible' : 'none';
    if (map.getLayer(layerId)) {
      map.setLayoutProperty(layerId, 'visibility', visibility);
    }
  };

  // Handle the recommend button click
  const handleRecommendButtonClick = async () => {
    if (!isAuthenticated || !user) return;
  
    if (!user.preferences || !user.preferences.facilities.length) {
      setShowRecommenderModal(true);
      return;
    }
  
    let payload = {};
    payload.activities = user.preferences.activities.length ? user.preferences.activities : [];
    payload.location = facilities.find(facility => facility.name === user.preferences.facilities[0])?.location;
  
    if (Object.keys(payload).length === 0) {
      console.error('No preferences or location found');
      return;
    }
  
    try {
      const response = await fetch('https://api.chucklenuts.party/recommender', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
    
      if (response.status > 204) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
    
      const data = await response.json(); // This will now work correctly
    
      const filtered = [];
      for (const block of data) {
        if (!Array.isArray(block.activities) || !Array.isArray(block.alternatives)) continue;
    
        block.alternatives = block.alternatives.filter(item => block.activities.includes(item));
        if (block.alternatives.length === 0) continue;
    
        filtered.push(block);
        if (filtered.length === 5) break;
      }
    
      console.log(filtered);
      setRecommendedPolygons(filtered);
    } catch (error) {
      console.error('Error fetching or processing data:', error);
    }
  };
  return (
    <>
      <Modal
        show={showRecommenderModal}
        onHide={() => setShowRecommenderModal(false)}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Unable to recommend</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>We are unable to recommend any facilities until you indicate your preferences in your profile. Proceed to do so?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRecommenderModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => navigate('account/profile')}>Go</Button>
        </Modal.Footer>
      </Modal>
      {/* Floating Controls */}
      <div style={{
        position: 'absolute',
        bottom: 20,
        left: 10,
        backgroundColor: 'white',
        padding: '10px',
        borderRadius: '5px',
        zIndex: 10
      }}>
        <div>
          <input
            type="checkbox"
            checked={layerVisibility.towns}
            onChange={(e) => {
              const visible = e.target.checked;
              setLayerVisibility(prev => ({ ...prev, towns: visible }));
              updateLayerVisibility('townsFill', visible);
              updateLayerVisibility('townsBorder', visible);
            }}
          /> Towns
        </div>
        <div>
          <input
            type="checkbox"
            checked={layerVisibility.sportFacilities}
            onChange={(e) => {
              const visible = e.target.checked;
              setLayerVisibility(prev => ({ ...prev, sportFacilities: visible }));
              updateLayerVisibility('sportFacilitiesFill', visible);
              updateLayerVisibility('sportFacilitiesBorder', visible);
            }}
          /> Sports Facilities
        </div>
        <div>
          <input
            type="checkbox"
            checked={layerVisibility.lightning}
            onChange={(e) => {
              const visible = e.target.checked;
              setLayerVisibility(prev => ({ ...prev, lightning: visible }));
              updateLayerVisibility('lightningStrikesLayer', visible);
            }}
          /> Lightning
        </div>
        <div>
          <input
            type="checkbox"
            checked={layerVisibility.recommended}
            onChange={(e) => {
              const visible = e.target.checked;
              setLayerVisibility(prev => ({ ...prev, recommended: visible }));
              updateLayerVisibility('recommended-fill', visible);
              updateLayerVisibility('recommended-outline', visible);
            }}
          /> Recommended
        </div>
      </div>
      <div className="row">
        <div className="col-md-6 p-0 z-0">
          <div className="row mt-1 mb-1 d-flex flex-row justify-content-between">
            <div className="col-md-6 p-0">{map && <SearchInputBox onFlyTo={onFlyTo} />}</div>
            <div className="col-md-6 py-2 px-0 me-4 w-auto">
              {}
              {
                isAuthenticated
                ? <Button variant="primary" onClick={handleRecommendButtonClick} >Recommend <Magic className="magic-icon"/></Button>
                : ''
              }
            </div>
          </div>

          {/* The Map */}
          <div
            className="map-container"
            ref={mapContainerRef}
            style={{ width: '100%', height: 'calc(100vh - 110px)' }}
          ></div>
        </div>

        {/* The Right Side Panel */}
        <div className="col-md-6 p-0 z-1 shadow">
          <SidePanel
            recordsData={customRecordsData}
          />
        </div>
      </div>
    </>
  );
};

export default App;
import React, { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Navbar from './components/Navbar';
import FilterPanel from './components/FilterPanel';
import SidePanel from './components/SidePanel';
import SearchInputBox from './components/SearchInputBox';
import * as turf from '@turf/turf';

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

  // States to store data for the various JSON files:
  const [facilitiesCapacities, setFacilitiesCapacities] = useState(null);
  const [bookingListingsData, setBookingsListings] = useState(null);
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
      //fetch('http://ec2-47-129-39-107.ap-southeast-1.compute.amazonaws.com:8000/facilities/'),
      fetch('/facilityCapacities_sample.json'),
      fetch('/MasterPlan2019PlanningAreaBoundaryNoSea.processed.geojson'),
      fetch('/SportSGSportFacilitiesGEOJSON.geojson'),
      fetch('/twoHourWeatherData_sample.json'),
      fetch('/bookingsListings_sample.json'),
      fetch('/lightningData_sample.json')
    ])
      .then((responses) => Promise.all(responses.map((r) => r.json())))
      .then(
        ([
          facilityCapacitiesData,
          townsData,
          sportsData,
          weatherJsonData,
          bookingListingsData,
          lightningData,
        ]) => {
          setFacilitiesCapacities(facilityCapacitiesData);
          setTownsGeoJson(townsData);
          setSportFacilitiesGeoJson(sportsData);
          setWeatherData(weatherJsonData);
          setBookingsListings(bookingListingsData);
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
  
    mapInstance.on('style.load', () => {
      updateBounds(mapInstance.getBounds().toArray());
    });
  
    mapInstance.on('moveend', () => {
      updateBounds(mapInstance.getBounds().toArray());
    });
  
    setMap(mapInstance);
  
    // Cleanup on unmount
    return () => mapInstance.remove();
  }, []
);

  // 3) Add layers (town polygons & sport facilities polygons) once both the map and corresponding GeoJSON data are available.
  useEffect(() => {
    if (!map) return;
    
    // --- Add Towns Layer ---
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

    // --- Add Sport Facilities Layer ---
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

        // Example: the property is "SPORTS_CEN" in the GEOJSON
        const sportsCen = feature.properties.SPORTS_CEN;
        // Alternatively if your property is named "SPORT_CEN", adjust accordingly
        // const sportsCen = feature.properties.SPORT_CEN;  

        // Attempt to find facility info based on matching "name"
        let facilityDetailsHtml = '';
        if (facilitiesCapacities) {
          // If facilityCapacities_sample.json is an *array*, we'll search inside that array
          const details = findFacilityByName(sportsCen, facilitiesCapacities);
          const lightningReadings = lightningData.data.records[0].item.readings;
          if (details) {
            facilityDetailsHtml = `
            <h5>${details.name}</h5>
            <div>
              <h6>Swimming Facility</h6>
              <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                <p><strong>Capacity:</strong> ${details.swimming.capacity}</p>
                <p><strong>Status:</strong> ${details.swimming.closed ? 'Closed' : 'Open'}</p>
              </div>
            </div>
          
                <div>
                  <h6>Gym Facility</h6>
                  <p><strong>Capacity:</strong> ${
                    details.gym.capacity !== null ? details.gym.capacity : 'N/A'
                  }</p>
                  <p><strong>Status:</strong> ${
                    details.gym.closed === null
                      ? 'Not Available'
                      : details.gym.closed
                      ? 'Closed'
                      : 'Open'
                  }</p>
                </div>
              </div>
            `;

            // Check if the facility is within 8 km of any lightning strike
            let facilityLoc = {
              latitude: details.location[0],
              longitude: details.location[1],
            }
            if (isWithinLightningRadius(facilityLoc, lightningReadings)) {
              facilityDetailsHtml += `
                <div style="color: red;">
                  <strong>Lightning Risk:</strong> This facility is within 8 km of a recent lightning strike.
                </div>
              `;
            }
          } else {
            facilityDetailsHtml = `<p>No matching facility found for ${sportsCen}.</p>`;
          }
        } else {
          facilityDetailsHtml = `<p>Loading facility details...</p>`;
        }

        // Show popup with details
        new mapboxgl.Popup({ maxWidth: '600px' })
          .setLngLat(e.lngLat)
          .setHTML(`
            <div>
              ${facilityDetailsHtml}
            </div>
          `)
          .addTo(map);

        // Update the side panel if desired
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
          'icon-size': 0.1, // Adjust the size as needed
        },
      });

      // Add a circle layer for the 8-km radius around each lightning strike
      map.addLayer({
        id: 'lightningRadiusLayer',
        type: 'circle',
        source: 'lightningStrikes',
        paint: {
          'circle-radius': {
            stops: [
              [0, 0],
              [20, 8000 / 0.075], // 8 km in meters, adjust for zoom level
            ],
            base: 2,
          },
          'circle-color': '#ff0000',
          'circle-opacity': 0.2,
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
}, [
    map,
    townsGeoJson,
    sportFacilitiesGeoJson,
    weatherData,
    facilitiesCapacities,
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

  // Update bounds in areaState so the GraphQL queries use the current viewport.
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

  return (
    <div>
      <Navbar />
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-6">
            <div className="row mt-1 mb-1">
              <div className="col-md-6">{map && <SearchInputBox onFlyTo={onFlyTo} />}</div>
              <div className="col-md-6">
                <FilterPanel
                  areaState={areaState}
                  setAreaState={setAreaState}
                  //towns={townsData}
                  //flatTypes={flatTypesData}
                />
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
          <div className="col-md-6">
            <SidePanel
              recordsData={customRecordsData}
              listingsData={bookingListingsData}            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
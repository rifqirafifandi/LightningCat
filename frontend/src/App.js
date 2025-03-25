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

  // States to store data for the various JSON files:
  const [facilitiesCapacities, setFacilitiesCapacities] = useState(null);
  const [townsGeoJson, setTownsGeoJson] = useState(null);
  const [sportFacilitiesGeoJson, setSportFacilitiesGeoJson] = useState(null);
  const [weatherData, setWeatherData] = useState(null);

  // GraphQL lazy queries
  const [getListingsData, { error: listingsError, loading: listingsLoading, data: listingsData }] =
    useLazyQuery(Queries.GET_LISTINGS, { variables: areaState });
  const [getDistinctTowns, { data: townsData }] = useLazyQuery(Queries.GET_DISTINCT_TOWNS);
  const [getDistinctFlatTypes, { data: flatTypesData }] = useLazyQuery(
    Queries.GET_DISTINCT_FLAT_TYPES
  );

  // 1) Fetch all required static files and store each response in its respective state.
  useEffect(() => {
    Promise.all([
      //fetch('http://ec2-47-129-39-107.ap-southeast-1.compute.amazonaws.com:8000/facilities/'),
      fetch('/facilityCapacities_sample.json'),
      fetch('/MasterPlan2019PlanningAreaBoundaryNoSea.processed.geojson'),
      fetch('/SportSGSportFacilitiesGEOJSON.geojson'),
      fetch('/twoHourWeatherData_sample.json'),
    ])
      .then((responses) => Promise.all(responses.map((r) => r.json())))
      .then(
        ([
          facilityCapacitiesData,
          townsData,
          sportsData,
          weatherJsonData,
        ]) => {
          setFacilitiesCapacities(facilityCapacitiesData);
          setTownsGeoJson(townsData);
          setSportFacilitiesGeoJson(sportsData);
          setWeatherData(weatherJsonData)
        } //this is line 66
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
      getListingsData();
      getDistinctTowns();
      getDistinctFlatTypes();
    });

    mapInstance.on('moveend', () => {
      updateBounds(mapInstance.getBounds().toArray());
      getListingsData();
    });

    setMap(mapInstance);

    // Cleanup on unmount
    return () => mapInstance.remove();
  }, [getListingsData, getDistinctTowns, getDistinctFlatTypes]);

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
          if (details) {
            facilityDetailsHtml = `
              <div style="border: 1px solid #ccc; padding: 5px; margin-bottom: 5px;">
                <h5>${details.name}</h5>
                <p><strong>Address:</strong> ${details.address}</p>

                <div>
                  <h6>Swimming Facility</h6>
                  <p><strong>Capacity:</strong> ${details.swimming.capacity}</p>
                  <p><strong>Status:</strong> ${
                    details.swimming.closed ? 'Closed' : 'Open'
                  }</p>
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
              <h4>${feature.properties.FacilityName || 'Facility Information'}</h4>
              <p><strong>Address:</strong> ${feature.properties.Address || 'Not available'}</p>
              <p><strong>Type:</strong> ${feature.properties.Type || 'Not specified'}</p>
              <hr/>
              <h5>Facility Capacity Details</h5>
              ${facilityDetailsHtml}
            </div>
          `)
          .addTo(map);

        // Update the side panel if desired
        setCustomRecordsData({ isCustom: true, getRecords: [recordObj] });
      });
    }
  }, [
    map,
    townsGeoJson,
    sportFacilitiesGeoJson,
    weatherData,
    facilitiesCapacities,
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
                  towns={townsData}
                  flatTypes={flatTypesData}
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
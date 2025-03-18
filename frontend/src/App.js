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

  // The following states store data for the various JSON files:
  const [mappedFacilities, setMappedFacilities] = useState(null);
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

  // 1) Fetch *all* required static files in one place.
  //    We'll store each response in its respective state.
  useEffect(() => {
    Promise.all([
      fetch('/mappedFacilities.json'),
      fetch('/facilityCapacities_sample.json'),
      fetch('/MasterPlan2019PlanningAreaBoundaryNoSea.processed.geojson'),
      fetch('/SportSGSportFacilitiesGEOJSON.geojson'),
      fetch('/twoHourWeatherData_sample.json'),
    ])
      .then((responses) => Promise.all(responses.map((r) => r.json())))
      .then(
        ([
          mappedFacilitiesData,
          facilityCapacitiesData,
          townsData,
          sportsData,
          weatherJsonData,
        ]) => {
          setMappedFacilities(mappedFacilitiesData);
          setFacilitiesCapacities(facilityCapacitiesData);
          setTownsGeoJson(townsData);
          setSportFacilitiesGeoJson(sportsData);
          setWeatherData(weatherJsonData);
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
      getListingsData();
      getDistinctTowns();
      getDistinctFlatTypes();
    });

    mapInstance.on('moveend', () => {
      updateBounds(mapInstance.getBounds().toArray());
      getListingsData();
    });

    setMap(mapInstance);

    // Cleanup if component unmounts
    return () => mapInstance.remove();
  }, [getListingsData, getDistinctTowns, getDistinctFlatTypes]);

  // 3) Add layers (town polygons & sport facilities polygons) once *both* the map
  //    and the corresponding GeoJSON data are available. Also attach click events.
  useEffect(() => {
    if (!map) return;

    // Make sure we have both towns and sport facilities data before adding layers
    if (townsGeoJson && !map.getSource('towns')) {
      // Town polygon layers
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

      // Town polygon click
      map.on('click', 'townsFill', (e) => {
        const feature = e.features && e.features[0];
        if (!feature) return;

        const clickedTown = feature.properties.PLN_AREA_N;
        const clickedTownLower = clickedTown.toLowerCase();

        // Use the weatherData from state
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

    if (sportFacilitiesGeoJson && !map.getSource('sportFacilities')) {
      // Sport facilities polygons
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

        const sportsCen = feature.properties.SPORTS_CEN;
        let facilityDetailsHtml = '';

        if (mappedFacilities && facilitiesCapacities) {
          // Our mapping and capacity info are already in state.
          const facilityNames = mappedFacilities[sportsCen] || [];
          if (facilityNames.length > 0) {
            facilityNames.forEach((name) => {
              const details = findFacilityByName(name, facilitiesCapacities);
              if (details) {
                facilityDetailsHtml += `
                  <div style="border: 1px solid #ccc; padding: 5px; margin-bottom: 5px;">
                    <h5>${details.name}</h5>
                    <p><strong>Type:</strong> ${details.type}</p>
                    <p><strong>Capacity Info:</strong> ${details.capacityInfo}</p>
                    <p><strong>Capacity Percentage:</strong> ${details.capacityPercentage}%</p>
                    <p><strong>Status:</strong> ${
                      details.isClosed ? 'Closed' : 'Open'
                    }</p>
                  </div>
                `;
              }
            });
            if (!facilityDetailsHtml) {
              facilityDetailsHtml = `<p>No capacity data available for the mapped facilities.</p>`;
            }
          } else {
            facilityDetailsHtml = `<p>No facility mapping available for ${sportsCen}.</p>`;
          }
        } else {
          facilityDetailsHtml = `<p>Loading facility details...</p>`;
        }

        new mapboxgl.Popup({ maxWidth: '600px' })
          .setLngLat(e.lngLat)
          .setHTML(`
            <div>
              <h4>${
                feature.properties.FacilityName || 'Facility Information'
              }</h4>
              <p><strong>Address:</strong> ${
                feature.properties.Address || 'Not available'
              }</p>
              <p><strong>Type:</strong> ${
                feature.properties.Type || 'Not specified'
              }</p>
              <hr/>
              <h5>Facility Capacity Details</h5>
              ${facilityDetailsHtml}
            </div>
          `)
          .addTo(map);

        // Update SidePanel data
        setCustomRecordsData({ isCustom: true, getRecords: [recordObj] });
      });
    }
  }, [
    map,
    townsGeoJson,
    sportFacilitiesGeoJson,
    weatherData,
    mappedFacilities,
    facilitiesCapacities,
  ]);

  // Helper to find a facility by name inside facilitiesCapacities
  const findFacilityByName = (name, facilitiesData) => {
    if (
      !facilitiesData ||
      !facilitiesData.result ||
      !facilitiesData.result.data ||
      !facilitiesData.result.data.json
    )
      return null;

    const facilitiesJson = facilitiesData.result.data.json;
    // Check in swimFacilities
    const swimFacility =
      facilitiesJson.swimFacilities?.find((facility) => facility.name === name);
    if (swimFacility) return swimFacility;

    // Check in gymFacilities
    const gymFacility =
      facilitiesJson.gymFacilities?.find((facility) => facility.name === name);
    if (gymFacility) return gymFacility;

    return null;
  };

  // Update bounds in areaState so the GraphQL queries use the current viewport
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
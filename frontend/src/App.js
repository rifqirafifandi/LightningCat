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
  const [mappedFacilities, setMappedFacilities] = useState(null);
  const [facilitiesCapacities, setFacilitiesCapacities] = useState(null);

  const [getListingsData, { error: listingsError, loading: listingsLoading, data: listingsData }] = useLazyQuery(Queries.GET_LISTINGS, { variables: areaState });
  const [getDistinctTowns, { data: townsData }] = useLazyQuery(Queries.GET_DISTINCT_TOWNS);
  const [getDistinctFlatTypes, { data: flatTypesData }] = useLazyQuery(Queries.GET_DISTINCT_FLAT_TYPES);

  // Fetch mappedFacilities and facility capacities on component mount.
  useEffect(() => {
    fetch('/mappedFacilities.json')
      .then((response) => response.json())
      .then((data) => setMappedFacilities(data))
      .catch((err) => console.error('Error loading mappedFacilities.json:', err));

    fetch('/facilityCapacities_sample.json')
      .then((response) => response.json())
      .then((data) => setFacilitiesCapacities(data))
      .catch((err) => console.error('Error loading facilityCapacities_sample.json:', err));
  }, []);

  // Helper function to search facilityCapacities for a facility by name.
  const findFacilityByName = (name, facilitiesData) => {
    if (
      !facilitiesData ||
      !facilitiesData.result ||
      !facilitiesData.result.data ||
      !facilitiesData.result.data.json
    )
      return null;
    const facilitiesJson = facilitiesData.result.data.json;
    // Check in swimFacilities array.
    const swimFacility =
      facilitiesJson.swimFacilities &&
      facilitiesJson.swimFacilities.find((facility) => facility.name === name);
    if (swimFacility) return swimFacility;
    // Check in gymFacilities array.
    const gymFacility =
      facilitiesJson.gymFacilities &&
      facilitiesJson.gymFacilities.find((facility) => facility.name === name);
    if (gymFacility) return gymFacility;
    return null;
  };

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

      // Load and add the town polygons layer
      fetch('/MasterPlan2019PlanningAreaBoundaryNoSea.processed.geojson')
        .then((response) => response.json())
        .then((data) => {
          mapInstance.addSource('towns', { type: 'geojson', data });
          mapInstance.addLayer({
            id: 'townsFill',
            type: 'fill',
            source: 'towns',
            paint: {
              'fill-color': 'lightblue',
              'fill-opacity': 0.5
            }

          });
          mapInstance.addLayer({
            id: 'townsBorder',
            type: 'line',
            source: 'towns',
            paint: { 'line-color': '#000000', 'line-width': 2 }
          });

          mapInstance.on('click', 'townsFill', (e) => {
            const feature = e.features && e.features[0];
            if (!feature) return;

            // Extract the town name (assumed to be in the property PLN_AREA_N).
            const clickedTown = feature.properties.PLN_AREA_N;
            const clickedTownLower = clickedTown.toLowerCase();

            // Fetch the weather data.
            fetch('/twoHourWeatherData_sample.json')
              .then((response) => response.json())
              .then((weatherData) => {
                // Assume we use the first item in the items array.
                const forecasts = weatherData.data.items[0].forecasts;

                // Find the forecast matching the clicked town (case insensitive).
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

                // Display the popup at the clicked location.
                new mapboxgl.Popup({ maxWidth: '400px' })
                  .setLngLat(e.lngLat)
                  .setHTML(popupContent)
                  .addTo(mapInstance);
              })
              .catch((err) =>
                console.error('Error loading towns GeoJSON:', err)
              );


            // Load the GeoJSON file for sport facilities.
            fetch('/SportSGSportFacilitiesGEOJSON.geojson')
              .then((response) => response.json())
              .then((data) => {
                mapInstance.addSource('sportFacilities', { type: 'geojson', data });

                mapInstance.addLayer({
                  id: 'sportFacilitiesFill',
                  type: 'fill',
                  source: 'sportFacilities',
                  paint: { 'fill-color': '#800080', 'fill-opacity': 0.9 }
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

                // Handle polygon click events.
                mapInstance.on('click', 'sportFacilitiesFill', (e) => {
                  const feature = e.features && e.features[0];
                  if (feature) {
                    let recordObj = {};
                    Object.entries(feature.properties).forEach(([key, value]) => {
                      if (key !== 'Description' && value) {
                        recordObj[key] = value;
                      }
                    });

                    const sportsCen = feature.properties.SPORTS_CEN;
                    let facilityDetailsHtml = '';

                    if (mappedFacilities && facilitiesCapacities) {
                      // Lookup facility names for this sports centre.
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
                          <p><strong>Status:</strong> ${details.isClosed ? 'Closed' : 'Open'}</p>
                        </div>
                      `;
                          }
                        });
                        // If no matching facility details were found.
                        if (!facilityDetailsHtml) {
                          facilityDetailsHtml = `<p>No capacity data available for the mapped facilities.</p>`;
                        }
                      } else {
                        facilityDetailsHtml = `<p>No facility mapping available for ${sportsCen}.</p>`;
                      }
                    } else {
                      facilityDetailsHtml = `<p>Loading facility details...</p>`;
                    }

                    // Build the popup content.
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
                      .addTo(mapInstance);

                    // Pass the original feature data to the records table.
                    setCustomRecordsData({ isCustom: true, getRecords: [recordObj] });
                  }
                });
              })
              .catch((err) => console.error('Error loading sport facilities GeoJSON:', err));
          });

          mapInstance.on('moveend', () => {
            updateBounds(mapInstance.getBounds().toArray());
            getListingsData();
          });

          setMap(mapInstance);
          return () => mapInstance.remove();
        });
    });
    
    return () => mapInstance.remove();
  }, [getListingsData, mappedFacilities, facilitiesCapacities]);

      const updateBounds = (bounds) => {
        const [lonMin, latMin, lonMax, latMax] = [
          bounds[0][0],
          bounds[0][1],
          bounds[1][0],
          bounds[1][1]
        ];
        setAreaState((prevState) => ({
          ...prevState,
          latRangeGte: latMin,
          latRangeLte: latMax,
          lonRangeGte: lonMin,
          lonRangeLte: lonMax
        }));
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
                    <FilterPanel
                      areaState={areaState}
                      setAreaState={setAreaState}
                      towns={townsData}
                      flatTypes={flatTypesData}
                    />
                  </div>
                </div>
                <div
                  className="map-container"
                  ref={mapContainerRef}
                  style={{ width: '100%', height: 'calc(100vh - 110px)' }}
                ></div>
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
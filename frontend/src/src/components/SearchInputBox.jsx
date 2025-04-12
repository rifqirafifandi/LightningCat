import React, { useState } from 'react';
import { FormControl, Dropdown } from 'react-bootstrap';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

/**
 * Provides a search input that suggests geographic locations using the Mapbox API as the user types.
 * It allows users to select a suggested location and triggers a move action to move to that selection.
 *
 * Props:
 * @param {Function} onFlyTo - Callback function that executes when a suggestion is selected. It expects an object
 *                             with longitude and latitude ({ lng, lat }).
 *
 * State:
 * @state {string} searchQuery - Stores the current value of the search input.
 * @state {Object[]} suggestions - Stores location suggestions returned by the Mapbox API.
 *
 * Behavior:
 * - The component fetches suggestions if the entered search query is 3 or more characters.
 * - It displays these suggestions in a dropdown menu.
 * - Selecting a suggestion will update the input and trigger the `onFlyTo` callback with the selected location's coordinates.
 *
 * Note:
 * Ensure that `mapboxgl.accessToken` is properly set in your environment to authenticate requests to Mapbox services.
 *
 * @returns {React.Element} A component with a text input for search queries and a dropdown list of suggestions.
 */
const SearchInputBox = ({ onFlyTo }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  // Function to handle input change and fetch suggestions
  const handleSearchChange = async (event) => {
    const query = event.target.value;
    setSearchQuery(query);

    if (query.length > 2) { // Only search if the query is 3 or more characters
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapboxgl.accessToken}&limit=5&country=sg`;

      try {
        const response = await axios.get(url);
        
        setSuggestions(response.data.features)
        
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      }
    } else {
      setSuggestions([]);
    }
  };

  // Function to handle suggestion selection
  const handleSelectSuggestion = (suggestion) => {
    setSearchQuery(suggestion.place_name); // Update input box with the selected place name
    console.log('Selected suggestion:', suggestion);
    setSuggestions([]); // Clear suggestions

    if (onFlyTo) {
      // Assuming `onFlyTo` expects an object with { lng, lat } format
      onFlyTo({
        lng: suggestion.center[0],
        lat: suggestion.center[1]
      });
    }
  };

  return (
    <div>
      <FormControl
        type="text"
        value={searchQuery}
        onChange={handleSearchChange}
        placeholder="Search for places..."
        
      />
      <Dropdown id="search-dropdown">
        {suggestions.map(suggestion => (
          <Dropdown.Item as="button" key={suggestion.id} onClick={() => handleSelectSuggestion(suggestion)}>
            {suggestion.place_name}
          </Dropdown.Item>
        ))}
      </Dropdown>
    </div>
  );
};

export default SearchInputBox;

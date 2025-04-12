import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Dropdown, Form, InputGroup } from "react-bootstrap";
import { useAuth } from "../../../../contexts/auth";
import { useNotification } from "../../../../contexts/notification";
import { useUserData } from "../../../../contexts/userData";
import styles from "./CreateListing.module.css";
import facilityNames from "../../../../types/facilityNames.json";
import facilityActivities from "../../../../assets/data/facilityActivities.json";

const CreateListing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addNotification, removeNotification } = useNotification();
  const { setListings } = useUserData();

  const facilityDropdownRef = React.useRef(null);
  const activityDropdownRef = React.useRef(null);
  const [filteredFacilities, setFilteredFacilities] = React.useState(facilityNames);
  const [availableActivities, setAvailableActivities] = React.useState([]);
  const [filteredActivities, setFilteredActivities] = React.useState([]);
  const [showFacilitiesDropdown, setShowFacilitiesDropdown] = React.useState(false);
  const [showActivitiesDropdown, setShowActivitiesDropdown] = React.useState(false);
  const [selectedFacility, setSelectedFacility] = React.useState("");
  const [selectedActivity, setSelectedActivity] = React.useState("");
  const [startDatetime, setStartDatetime] = React.useState("");
  const [endDatetime, setEndDatetime] = React.useState("");
  const [capacity, setCapacity] = React.useState("");
  const [price, setPrice] = React.useState(0);

  const validateCapacity = (value) => {
    const numberValue = parseInt(value);
    if (isNaN(numberValue) || numberValue <= 0) {
      return false;
    }
    if (numberValue < 1) {
      return false;
    }
    return true;
  };

  const handleCapacityChange = (e) => {
    if (validateCapacity(e.target.value)) {
      setCapacity(e.target.value);
    } else {
      setCapacity(1)
    }
  }

  const validatePrice = (value) => {
    const numberValue = parseFloat(value);
    if (isNaN(numberValue) || numberValue <= 0) {
      return false;
    }
    if (numberValue < 1.00) {
      return false;
    }
    return true;
  };

  const handlePriceChange = (e) => {
    if (validatePrice(e.target.value)) {
      setPrice(e.target.value);
    } else {
      setPrice(1.00)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('user_id', user.id);
    formData.append('facility_name', selectedFacility);
    formData.append('activity', selectedActivity);
    formData.append('start_time', startDatetime);
    formData.append('end_time', endDatetime);
    formData.append('capacity', capacity);
    formData.append('price', price);
    try {
      const response = await fetch('https://api.chucklenuts.party/listing', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (response.status > 204) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      if (response.status === 201 && data) {
        addNotification({
          id: Date.now(),
          title: "LightningCat",
          message: "Listing posted successfully.",
          time: new Date().toLocaleTimeString(),
          removeNotification: removeNotification,
          type: "success",
          show: true,
        })
        setListings((prevListings) => [...prevListings, data]);
        navigate("/account/listings");
      } else {
        addNotification({
          id: Date.now(),
          title: "LightningCat",
          message: "Error posting listing.",
          time: new Date().toLocaleTimeString(),
          removeNotification: removeNotification,
          type: "danger",
          show: true,
        })
      }
    } catch (error) {
      console.error("Error posting listing:", error);
      addNotification({
        id: Date.now(),
        title: "LightningCat",
        message: "Error posting listing.",
        time: new Date().toLocaleTimeString(),
        removeNotification: removeNotification,
        type: "danger",
        show: true,
      })
    }
  }

  return (
    <>
      <NavLink className={styles.backNav} to="/account/listings">← Back to my listings</NavLink>
      <h1>Post a listing</h1>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="facilityName">
          <Form.Label>Facility name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Search facilities"
            onChange={(e) => {
              const searchValue = e.target.value.toLowerCase();
              const filteredFacilities = facilityNames.filter((facility) =>
                facility.toLowerCase().includes(searchValue)
              );
              setFilteredFacilities(filteredFacilities);
            }}
            value={selectedFacility}
            onFocus={() => setShowFacilitiesDropdown(true)}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget) && !facilityDropdownRef.current.contains(e.relatedTarget)) {
                setShowFacilitiesDropdown(false);
              }
            }}
          />
          <Dropdown.Menu show={showFacilitiesDropdown} className={`${styles.dropdownMenu} shadow mb-5 bg-white rounded`} ref={facilityDropdownRef}>
            <Dropdown.Header>Facilities</Dropdown.Header>
            {
              filteredFacilities.map((facility) => (
                <Dropdown.Item
                  key={facility}
                  onClick={() => {
                    if (selectedFacility !== facility) {
                      setSelectedActivity("");
                    }
                    setSelectedFacility(facility);
                    const found = facilityActivities.find((item) => item.hasOwnProperty(facility));
                    setAvailableActivities(found ? found[facility] : []);
                    setFilteredActivities(found ? found[facility] : []);
                    setShowFacilitiesDropdown(false);
                  }}
                >
                  {facility}
                </Dropdown.Item>
              ))
            }
          </Dropdown.Menu>
        </Form.Group>

        <Form.Group className="mb-3" controlId="activity">
          <Form.Label>Activity</Form.Label>
          <Form.Control
            type="text"
            placeholder={selectedFacility ? "Search available activities" : "Select a facility first"}
            onChange={(e) => {
              const searchValue = e.target.value.toLowerCase();
              const filteredActivities = availableActivities.filter((activity) =>
                activity.toLowerCase().includes(searchValue)
              );
              setFilteredActivities(filteredActivities);
            }}
            value={selectedActivity}
            onFocus={() => setShowActivitiesDropdown(true)}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget) && !activityDropdownRef.current.contains(e.relatedTarget)) {
                setShowActivitiesDropdown(false);
              }
            }}
            disabled={availableActivities.length === 0}
          />
          <Dropdown.Menu show={showActivitiesDropdown} className={`${styles.dropdownMenu} shadow mb-5 bg-white rounded`} ref={activityDropdownRef}>
            <Dropdown.Header>Activities</Dropdown.Header>
            {filteredActivities.map((activity) => (
              <Dropdown.Item
                key={activity}
                onClick={() => {
                  setSelectedActivity(activity);
                  setShowActivitiesDropdown(false);
                }}
              >
                {activity}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Form.Group>

        <Form.Group className="mb-3" controlId="startTime">
          <Form.Label>Start date & time</Form.Label>
          <Form.Control type="datetime-local" onChange={(e) => setStartDatetime(e.target.value)} />
        </Form.Group>

        <Form.Group className="mb-3" controlId="endTime">
          <Form.Label>End date & time</Form.Label>
          <Form.Control type="datetime-local" min={startDatetime} onChange={(e) => setEndDatetime(e.target.value)} disabled={!startDatetime} />
        </Form.Group>

        <Form.Group className="mb-3" controlId="capacity">
          <Form.Label>Capacity</Form.Label>
          <Form.Control type="number" placeholder="Enter capacity" onChange={handleCapacityChange} value={capacity} />
        </Form.Group>

        <Form.Group className="mb-3" controlId="price">
          <Form.Label>Price</Form.Label>
          <InputGroup>
            <InputGroup.Text>$</InputGroup.Text>
            <Form.Control type="number" step="0.01" placeholder="Enter price" min={1.00} onChange={handlePriceChange} value={price} />
          </InputGroup>
        </Form.Group>

        <button className="btn btn-primary">Post</button>
      </Form>
    </>
  );
}

export default CreateListing;

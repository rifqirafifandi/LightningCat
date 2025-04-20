import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Dropdown, Form, InputGroup } from "react-bootstrap";
import { useUserData } from "../../../../contexts/userData";
import styles from "./CreateListing.module.css";
import facilityNames from "../../../../types/facilityNames.json";
import facilityActivities from "../../../../assets/data/facilityActivities.json";

const CreateListing = () => {
  const navigate = useNavigate();
  const { createListing } = useUserData();

  const facilityDropdownRef = React.useRef(null);
  const activityDropdownRef = React.useRef(null);
  const [filteredFacilities, setFilteredFacilities] = React.useState(facilityNames);
  const [availableActivities, setAvailableActivities] = React.useState([]);
  const [filteredActivities, setFilteredActivities] = React.useState([]);
  const [showFacilitiesDropdown, setShowFacilitiesDropdown] = React.useState(false);
  const [showActivitiesDropdown, setShowActivitiesDropdown] = React.useState(false);
  const [selectedFacility, setSelectedFacility] = React.useState("");
  const [selectedActivity, setSelectedActivity] = React.useState("");
  const [venue, setVenue] = React.useState("");
  const [date, setDate] = React.useState("");
  const [duration, setDuration] = React.useState("");
  const [capacity, setCapacity] = React.useState("");
  const [fee, setFee] = React.useState(0);

  const currentLocaleDate = new Date(new Date().setMinutes(new Date().getMinutes() - new Date().getTimezoneOffset())).toISOString().split("T")[0]

  const validateDate = (value) => {
    const dateValue = new Date(value);
    if (dateValue < new Date().setHours(0, 0, 0, 0)) {
      return false;
    }
    return true;
  };

  const handleDateChange = (e) => {
    if (validateDate(e.target.value)) {
      setDate(e.target.value);
    } else {
      setDate(currentLocaleDate);
    }
  };

  const validateDuration = (value) => {
    const numberValue = parseInt(value);
    if (isNaN(numberValue) || numberValue <= 0) {
      return false;
    }
    return true;
  };

  const handleDurationChange = (e) => {
    if (validateDuration(e.target.value)) {
      setDuration(e.target.value);
    } else {
      setDuration(1)
    }
  };

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

  const validateFee = (value) => {
    const numberValue = parseFloat(value);
    if (isNaN(numberValue) || numberValue <= 0) {
      return false;
    }
    if (numberValue < 1.00) {
      return false;
    }
    return true;
  };

  const handleFeeChange = (e) => {
    if (validateFee(e.target.value)) {
      setFee(e.target.value);
    } else {
      setFee(1)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('facility_name', selectedFacility);
    formData.append('activity', selectedActivity);
    formData.append('venue', venue);
    formData.append('date', date);
    formData.append('duration', duration);
    formData.append('capacity', capacity);
    formData.append('fee', fee);
    await createListing(formData);
    navigate("/account/listings");
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

        <Form.Group className="mb-3" controlId="venue">
          <Form.Label>Venue</Form.Label>
          <Form.Control type="text" maxLength={255} onChange={(e) => setVenue(e.target.value)} />
        </Form.Group>

        <Form.Group className="mb-3" controlId="date">
          <Form.Label>Date</Form.Label>
          <Form.Control
            type="date"
            min={currentLocaleDate}
            onChange={handleDateChange}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="duration">
          <Form.Label>Duration (hours)</Form.Label>
          <Form.Control type="number" step="1" placeholder="Enter duration" min={1} onChange={handleDurationChange} />
        </Form.Group>

        <Form.Group className="mb-3" controlId="capacity">
          <Form.Label>Capacity</Form.Label>
          <Form.Control type="number" placeholder="Enter capacity" onChange={handleCapacityChange} value={capacity} />
        </Form.Group>

        <Form.Group className="mb-3" controlId="fee">
          <Form.Label>Fee</Form.Label>
          <InputGroup>
            <InputGroup.Text>$</InputGroup.Text>
            <Form.Control type="number" step="1" placeholder="Enter fee" min={1} onChange={handleFeeChange} value={fee} />
          </InputGroup>
        </Form.Group>

        <button className="btn btn-primary">Post</button>
      </Form>
    </>
  );
}

export default CreateListing;

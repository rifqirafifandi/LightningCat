import React from 'react';
import Form from 'react-bootstrap/Form';
import { Button } from 'react-bootstrap';
import { PersonCircle, Pencil } from 'react-bootstrap-icons';
import { useAuth } from "../../../contexts/auth";
import { useNotification } from '../../../contexts/notification';
import styles from './Profile.module.css';
import activityTypes from '../../../types/activityTypes.json';
import facilityNames from '../../../types/facilityNames.json';

const Profile = () => {
  const inputFileRef = React.useRef(null);
  const { user, setUser } = useAuth();
  const { addNotification, removeNotification } = useNotification();
  const [name, setName] = React.useState(user.name);
  const [profileImage, setProfileImage] = React.useState(user.profile_image);
  const [preferences, setPreferences] = React.useState(user.preferences || {
    activities: [],
    facilities: [],
  });
  const [dirty, setDirty] = React.useState(false);

  React.useEffect(() => {
    setDirty(
      name !== user.name ||
      profileImage !== user.profile_image ||
      preferences.activities.length > 0 ||
      preferences.facilities.length > 0
    );
  }, [name, profileImage, preferences, user.name, user.profile_image]);

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      }
      reader.readAsDataURL(file);
    }
  }

  const handleNameChange = (e) => {
    if (e.target.value === '') {
      setName(user.name);
    } else {
      setName(e.target.value);
    }
  }

  const handleActivityPreferencesChange = (e) => {
    const { id, checked } = e.target;
    setPreferences((prevPreferences) => {
      const nextPreferences = {
        facilities: prevPreferences.facilities,
        activities: checked
          ? [...prevPreferences.activities, id]
          : prevPreferences.activities.filter((activity) => activity !== id),
      }
      return nextPreferences;
    });
  }

  const handleFacilityPreferencesChange = (e) => {
    setPreferences((prevPreferences) => {
      const nextPreferences = {
        activities: prevPreferences.activities,
        facilities: e.target.value ? [e.target.value] : []
      }
      return nextPreferences;
    });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', name);
    formData.append('profile_image', profileImage);
    formData.append('preferences', JSON.stringify(preferences));
    try {
      const response = await fetch('https://api.chucklenuts.party/profile', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (response.status > 204) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      if (data.ok) {
        addNotification({
          id: Date.now(),
          title: "LightningCat",
          message: "Profile updated successfully.",
          time: new Date().toLocaleTimeString(),
          removeNotification: removeNotification,
          type: "success",
          show: true,
        })
        setUser((prevUser) => ({
          ...prevUser,
          name: data.name,
          profile_image: data.profile_image,
          preferences: data.preferences,
        }));
      } else {
        addNotification({
          id: Date.now(),
          title: "LightningCat",
          message: "Error updating profile.",
          time: new Date().toLocaleTimeString(),
          removeNotification: removeNotification,
          type: "danger",
          show: true,
        })
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      addNotification({
        id: Date.now(),
        title: "LightningCat",
        message: "Error updating profile.",
        time: new Date().toLocaleTimeString(),
        removeNotification: removeNotification,
        type: "danger",
        show: true,
      })
    }
  }

  return (
    <>
      <h1>Profile</h1>
      <div className={styles.profileImageContainer} onClick={() => inputFileRef.current.click()}>
        {
          profileImage 
          ? <img src={profileImage} alt="Profile" className={styles.profileImage}/> 
          : <PersonCircle className={styles.profileImagePlaceholder}/>
        }
        <span className={styles.editProfileImageOverlay}>
          <Pencil />
        </span>
        <input type="file" accept="image/*" ref={inputFileRef} onChangeCapture={handleFileInputChange}/>
      </div>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="formEmail">
          <Form.Label>Email address</Form.Label>
          <Form.Control type="email" placeholder={user.email} disabled readOnly />
          <Form.Text className="text-muted">
            This cannot be changed.
          </Form.Text>
        </Form.Group>
        <Form.Group className="mb-3" controlId="formName">
          <Form.Label>Display name</Form.Label>
          <Form.Control type="text" placeholder={name} onChange={handleNameChange} />
        </Form.Group>
        <div className={styles.preferencesContainer}>
          <fieldset>
            <legend>Preferred activities</legend>
            <div className={styles.fieldsetWrapper}>
              {
                activityTypes.map((activityType) => (
                  <Form.Check
                    type="checkbox"
                    id={activityType}
                    label={activityType}
                    key={activityType}
                    onChange={handleActivityPreferencesChange}
                    checked={preferences.activities.includes(activityType)}
                  />
                ))
              }
            </div>
          </fieldset>
          
          <fieldset>
            <legend>Preferred location</legend>
            <Form.Select 
              aria-label="Select preferred location" 
              onChange={handleFacilityPreferencesChange}
              value={preferences.facilities.length > 0 ? preferences.facilities[0] : ''}
            >
              <option>--- Select your favourite facility ---</option>
              {
                facilityNames.map((facilityName) => (
                  <option value={facilityName} key={facilityName}>
                    {facilityName}
                  </option>
                ))
              }
            </Form.Select>
          </fieldset>
        </div>
        <Button variant="primary" type="submit" disabled={!dirty}>
          Save changes
        </Button>
      </Form>
    </>
  );
}

export default Profile;

import React from 'react';
import Form from 'react-bootstrap/Form';
import { Button } from 'react-bootstrap';
import { PersonCircle, Pencil } from 'react-bootstrap-icons';
import { useAuth } from "../../../contexts/auth";
import { useNotification } from '../../../contexts/notification';
import styles from './Profile.module.css';

const Profile = () => {
  const inputFileRef = React.useRef(null);
  const { user, setUser } = useAuth();
  const { addNotification, removeNotification } = useNotification();
  const [name, setName] = React.useState(user.name);
  const [profileImage, setProfileImage] = React.useState(user.profile_image);
  const [preferences, setPreferences] = React.useState({
    preference1: false,
    preference2: false,
    preference3: false,
  });

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

  const handlePreferencesChange = (e) => {
    const { id, checked } = e.target;
    setPreferences((prevPreferences) => ({
      ...prevPreferences,
      [id]: checked,
    }));
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', name);
    formData.append('profile_image', profileImage);
    formData.append('preferences', JSON.stringify(preferences));
    const response = await fetch('https://api.chucklenuts.party/profile', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });
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
        id: new Date.now(),
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
    <div>
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
        <fieldset>
          <legend>Preferences</legend>
          <Form.Check
            type="checkbox"
            id="preference1"
            label="preference-1"
            onChange={handlePreferencesChange}
          />
          <Form.Check
            type="checkbox"
            id="preference2"
            label="preference-2"
          />
          <Form.Check
            type="checkbox"
            id="preference3"
            label="preference-3"
          />
        </fieldset>
        <Button variant="primary" type="submit" disabled={name === user.name}>
          Submit
        </Button>
      </Form>
    </div>
  );
}

export default Profile;

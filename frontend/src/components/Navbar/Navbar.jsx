import React, { useState } from 'react';
import { Button, Dropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { PersonCircle } from 'react-bootstrap-icons';
import { useAuth } from '../../contexts/auth';
import styles from './Navbar.module.css';

const Navbar = () => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  const handleClick = () => {
    navigate("/login");
  }

  return (
    <nav className="navbar shadow navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        <span className={styles.logotype} onClick={() => navigate('/')}>LightningCat</span>
      </div>
      <div className={`${styles['navbar-right']}`}>
        {
          isAuthenticated
          ? <>
              <Dropdown show={isDropdownOpen} onToggle={toggleDropdown}>
                <div className={styles.dropdownToggle}>
                  <Dropdown.Toggle variant="link" id="dropdown-user">
                      {
                        user.profile_image
                        ? <img src={user.profile_image} alt="Profile" className={styles.profileImage}/> 
                        : <PersonCircle />
                      }
                      <span>{ user.name }</span>
                  </Dropdown.Toggle>
                </div>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={e => {
                    e.preventDefault();
                    navigate('/account');
                  }}>Account</Dropdown.Item>
                  <Dropdown.Item href="https://api.chucklenuts.party/auth/logout">Logout</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </>
          : <Button variant="primary" onClick={handleClick}>Login</Button>
        }
      </div>
    </nav>
  );
};

export default Navbar;

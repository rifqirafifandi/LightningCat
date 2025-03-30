import React, { useState } from 'react';
import { Button, Dropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import styles from './NavBar.module.css';

const Navbar = ({ onSearchClick }) => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  const handleClick = () => {
    navigate("/login");
  }

  return (
    <nav className="navbar shadow navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        <div>LightningCat</div>
        {/* User Greeting and Dropdown aligned to the left */}
        {/* <div className="d-flex align-items-center">
          <Dropdown show={isDropdownOpen} onToggle={toggleDropdown}>
            <Dropdown.Toggle variant="link" id="dropdown-user">
              <i className="bi bi-person-circle" style={{ fontSize: '1.5em' }}></i>
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item href="#/signup">Sign Up</Dropdown.Item>
              <Dropdown.Item href="#/signin">Sign In</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div> */}
      </div>
      <div className={`${styles['navbar-right']}`}>
        <span>Hello, Guest</span>
        <Button variant="primary" onClick={handleClick}>Login</Button>
      </div>
    </nav>
  );
};

export default Navbar;

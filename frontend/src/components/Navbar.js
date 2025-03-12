import React, { useState } from 'react';
import { Dropdown } from 'react-bootstrap';

const Navbar = ({ onSearchClick }) => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        {/* User Greeting and Dropdown aligned to the left */}
        <div className="d-flex align-items-center">
          <span className="mr-2">Hello, Guest</span>
          <Dropdown show={isDropdownOpen} onToggle={toggleDropdown}>
            <Dropdown.Toggle variant="link" id="dropdown-user">
              <i className="bi bi-person-circle" style={{ fontSize: '1.5em' }}></i>
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item href="#/signup">Sign Up</Dropdown.Item>
              <Dropdown.Item href="#/signin">Sign In</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
        
        <button 
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0"></ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

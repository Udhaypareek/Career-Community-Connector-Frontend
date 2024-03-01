import React from 'react'
import { Link } from 'react-router-dom';


export default function Navbar() {
  return ( 
<nav className={`navbar navbar-expand-lg navbar-light`} style={{ backgroundColor: 'rgba(173, 173, 173, 0.5)', height: '30px' }}>
  <div className="container-fluid">
    <div className="collapse navbar-collapse" id="navbarSupportedContent">
      <ul className="navbar-nav me-auto mb-2 mb-lg-0">
        <li className="nav-item position-relative start-100">
          <Link className="nav-link active" aria-current="page" to="/">Home</Link>
        </li>
        <li className="nav-item position-relative start-100">
          <Link className="nav-link" to="/about">About Us</Link>
        </li>
      </ul>
    </div>
  </div>
</nav>

  )
};

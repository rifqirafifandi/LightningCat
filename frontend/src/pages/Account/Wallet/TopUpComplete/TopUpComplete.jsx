import React from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom"
import styles from "./TopUpComplete.module.css"

const TopUpComplete = () => {
  const navigate = useNavigate();
  const location = useLocation();
  console.log(location);

  React.useEffect(() => {
    if (!location.state) {
      navigate('/404');
    }
  }
  , [location, navigate]);

  return (
    <>
      <NavLink className={styles.backNav} to="/account/wallet">← Back to my wallet</NavLink>
      <h1>Success!</h1>
      <p>Your payment of SGD {location.state.amount} is complete.</p>
    </>
  )
}

export default TopUpComplete
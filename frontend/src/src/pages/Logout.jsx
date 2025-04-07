import { NavLink } from 'react-router-dom';
import sharedStyles from './Shared.module.css';

const Logout = () => {
  return (
    <div className={sharedStyles.pageContainer}>
      <div className={sharedStyles.contentContainer}>
        <div className={sharedStyles.textContainer}>
          <h2>Goodbye</h2>
          <p>You have been logged out successfully.</p>
          <NavLink to="/"><span>Return to home page</span></NavLink>
        </div>
      </div>
    </div>
  );
}

export default Logout;

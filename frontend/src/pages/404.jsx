import { NavLink } from 'react-router-dom';
import sharedStyles from './Shared.module.css';
import EmptyStateImage from '../assets/images/empty-state-search.svg'

const ErrorPage = () => {
  return (
    <div className={sharedStyles.pageContainer}>
      <div className={sharedStyles.contentContainer}>
        <img src={EmptyStateImage} alt="Error" className={sharedStyles.errorImage} />
        <div className={sharedStyles.textContainer}>
          <h2>404</h2>
          <p>Sorry, the page you're looking for does not exist.</p>
          <NavLink to="/"><span>Return to home page</span></NavLink>
        </div>
      </div>
    </div>
  );
}

export default ErrorPage;

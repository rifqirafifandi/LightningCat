/**
 * Displays a loading spinner using Bootstrap's spinner classes. This component is typically used to
 * indicate that some data is being loaded or some asynchronous operation is in progress.
 *
 * Usage:
 * Simply render the <LoadingSpinner /> component in any part of your component tree where a loading
 * indicator is needed. Ensure that Bootstrap's CSS is included in your project to display properly.
 *
 * Example:
 * return (
 *   <div>
 *     <h1>Loading Data</h1>
 *     <LoadingSpinner />
 *   </div>
 * );
 *
 * @returns {React.Element} A div element containing the styled loading spinner.
 */
const LoadingSpinner = () => {
  return (
    <div className="loading-spinner">
    <div className="spinner-border text-primary" role="status">
      <span className="sr-only"/>
    </div>
    </div>
  );
}

export default LoadingSpinner;

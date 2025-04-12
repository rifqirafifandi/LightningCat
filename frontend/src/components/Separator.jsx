
/**
 * Renders a horizontal rule (`<hr>`) as a visual separator in the UI, applying a predefined CSS class.
 * This component is commonly used to divide sections of content visually.
 *
 * Usage:
 * Render the <Separator /> wherever a visual division is needed in your UI. Make sure the
 * associated CSS for the class "seperator" is defined in your stylesheets to apply the desired visual style.
 *
 * Note:
 * - The CSS class "seperator" should be defined in your CSS files. If it's not, the `<hr>` will render with default styling.
 *
 * @returns {React.Element} An `<hr>` element with the class "seperator" applied.
 */
function Seperator() {
  return <hr className="seperator"/>
}

export default Seperator;

import React, { useState } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

/**
 * `CustomToggle` is a button component for toggling the visibility of a dropdown menu. It uses React's `forwardRef` to
 * ensure that the ref is forwarded to the underlying button element. This component is customized to prevent the default
 * link behavior and trigger the dropdown's toggle function when clicked.
 *
 * This toggle component is styled with Bootstrap's button styles and can be used in any place where a dropdown toggle is needed.
 * The component adds a downward arrow character to indicate the dropdown functionality visually.
 *
 * Props:
 * @param {Object} props - The props passed to the component.
 * @param {React.Node} children - Content to be displayed inside the toggle button, typically text.
 * @param {Function} onClick - A handler function that toggles the dropdown menu's visibility. This function is called
 *                             when the button is clicked.
 * @param {React.Ref} ref - Forwarded ref that attaches to the button element.
 *
 * This example creates a dropdown with a custom toggle button that, when clicked, shows or hides the dropdown menu.
 * The toggle button will display the text "Choose an Option" and a downward arrow.
 *
 * @returns {React.Element} A button that acts as a toggle for a dropdown menu.
 */
const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
  <Button
    href=""
    ref={ref}
    onClick={(e) => {
      e.preventDefault();
      onClick(e);
    }}
  >
    {children}
    &#x25bc;
  </Button>
));

/**
 * `CustomMenu` is a custom dropdown menu component for React-Bootstrap that includes a filterable input to search through
 * the menu items. This component uses `React.forwardRef` to pass refs to the underlying dropdown component.
 *
 * This component filters its children based on the user's input, displaying only those items that match the entered text.
 *
 * Props:
 * @param {Object} props - The props passed to the component.
 * @param {React.Node} children - The dropdown items that are passed as children to this custom menu.
 * @param {Object} style - CSS styles to apply to the dropdown menu container.
 * @param {string} className - Additional class names to style the dropdown menu.
 * @param {string} labeledBy - The ID of the element that labels the dropdown, used for accessibility purposes.
 * @param {React.Ref} ref - Forwarded ref that attaches to the root dropdown menu element.
 *
 * This example sets up a Bootstrap dropdown with custom filtering functionality embedded within the dropdown menu.
 *
 * @returns {React.Element} A React component that renders a filterable dropdown menu.
 */
const CustomMenu = React.forwardRef(
  ({ children, style, className, 'aria-labelledby': labeledBy }, ref) => {
    const [value, setValue] = useState('');

    return (
      <div
        ref={ref}
        style={style}
        className={className}
        aria-labelledby={labeledBy}
      >
        <Form.Control
          autoFocus
          className="mx-3 my-2 w-auto"
          placeholder="Type to filter..."
          onChange={(e) => setValue(e.target.value)}
          value={value}
        />
        <ul className="list-unstyled">
          {React.Children.toArray(children).filter(
            (child) =>
              !value || child.props.children.toLowerCase().startsWith(value.toLowerCase()),
          )}
        </ul>
      </div>
    );
  },
);

/**
 * Renders a dropdown menu allowing the user to select from a list of options. The component dynamically populates
 * the dropdown based on the provided data and handles user selections with a callback function.
 *
 * Props:
 * @param {Object} props - The component's props.
 * @param {Object[]} props.data - The data used to populate the dropdown list. This should be an object where
 *                                the key represents a category, and the associated value is an array of options.
 * @param {string} props.dataType - A descriptive string that indicates the type of data being displayed in the dropdown.
 * @param {Array} props.currentState - The current selection(s) from the dropdown, used to set the active state.
 * @param {Function} props.handleListChange - The function to call when an option is selected. It should take the
 *                                            selected option and a key value as arguments.
 * @param {string} props.keyValue - The key corresponding to the selected data type, used by the `handleListChange`
 *                                  function to identify what is being updated.
 *
 *
 * Note:
 * - Ensure `data` is not undefined before rendering this component; otherwise, it will display a loading state.
 * - This component uses Bootstrap's Dropdown components; ensure Bootstrap's CSS and JavaScript are correctly
 *   integrated into your project.
 *
 * @returns {React.Element} A dropdown component that lets users select from a list of options.
 */
const ListFilter = ({data, dataType, currentState, handleListChange, keyValue}) => {
  if (data === undefined) {
    var listData = ["loading.."]
  } else {
    var listData = data[Object.keys(data)[0]]
  }
 
  return (
    <>
      <Dropdown>
        <Dropdown.Toggle as={CustomToggle} id="dropdown-custom-components">
          Select {dataType}
        </Dropdown.Toggle>

        <Dropdown.Menu as={CustomMenu}>
          {listData.map((d, index) => (
            <Dropdown.Item 
              key={index} 
              eventKey={index}
              onClick={() => handleListChange(d, keyValue)}
              active={currentState.includes(d)}
              >
              {d}
             </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
    </>
  );
};

export default ListFilter;

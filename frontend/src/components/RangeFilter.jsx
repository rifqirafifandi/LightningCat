import React  from 'react';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';

/**
 * `RangeFilter` provides a UI for entering numerical range values, typically used for filtering data.
 * It includes two numeric input fields that are constrained by minimum and maximum values.
 *
 * Props:
 * @param {Object} props - Component props.
 * @param {string[]} rangeDesc - Descriptions for each input to serve as placeholders.
 * @param {string[]} keys - Identifiers for the inputs to distinguish their purpose when handling changes.
 * @param {Function} handleRangeChange - Function to call when the input values change.
 * @param {number[]} currentValues - Current values of the inputs.
 * @param {number[]} minMaxVal - Array containing the minimum and maximum allowed values for the inputs.
 *
 * Note:
 * This component uses Bootstrap's `Form.Control`, and it expects Bootstrap CSS to be included in the project.
 *
 * @returns {React.Element} A component with two number inputs for specifying a range.
 */
const RangeFilter = ({ rangeDesc, keys, handleRangeChange, currentValues, minMaxVal }) => {
  return (
    <>
      <InputGroup>
        <Form.Control 
          type="number" 
          min={minMaxVal[0]}
          max={minMaxVal[1]}
          placeholder={rangeDesc[0]}
          value={currentValues[0]}
          isInvalid={
              (currentValues[0] < minMaxVal[0] || currentValues[0] > minMaxVal[1]) 
              && currentValues[0] !== undefined
          }
          onChange={(e) => {handleRangeChange(e.target.value, keys[0])}}
        />
        <Form.Control 
          type="number" 
          min={minMaxVal[0]}
          max={minMaxVal[1]}
          placeholder={rangeDesc[1]}
          value={currentValues[1]}
          isInvalid={(currentValues[1] < minMaxVal[0] || currentValues[1] > minMaxVal[1]) && currentValues[1] !== undefined}
          onChange={(e) => {handleRangeChange(e.target.value, keys[1])}}
        />
        <Form.Control.Feedback type="invalid">
          Please provide a valid number above 0.
        </Form.Control.Feedback>

      </InputGroup>
    </>
  );
};

export default RangeFilter;

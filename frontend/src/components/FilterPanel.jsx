import React, { useState, useRef } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Modal from 'react-bootstrap/Modal';
import ListFilter from './ListFilter';
import RangeFilter from './RangeFilter';
import Separator from './Separator';

/**
 * `FilterPanel` manages and displays a set of dynamic filters for data such as towns, flat types, price, and floor area.
 * It provides a modal interface for the user to specify filter criteria, with options to reset to default states or apply the filters.
 *
 * Props:
 * @param {Object} areaState - The current state of the filters, including selections for town, flat type, and numerical ranges for price and floor area.
 * @param {Function} setAreaState - Function to update the areaState based on user interactions with filter controls.
 * @param {Array} towns - Array containing town names to be used in the town filter dropdown.
 * @param {Array} flatTypes - Array containing flat type descriptions to be used in the flat type filter dropdown.
 *
 * The component utilizes several child components to render the filters:
 * - `ListFilter`: For selecting towns and flat types.
 * - `RangeFilter`: For specifying numerical ranges (e.g., price per square foot and floor area).
 * - `Separator`: Visually separates different sections within the filter modal.
 *
 * Behavior:
 * - The component uses a modal to contain the filter forms. This modal can be shown or hidden based on user interactions.
 * - Provides a reset function that restores the filters to their initial state and clears any user input.
 * - Updates to the filters are made via callback functions passed down to child components, which modify the `areaState`.
 *
 * @returns {React.Element} A component that renders a button to show the filter modal and the modal itself with filter options.
 */
const FilterPanel = ({ areaState, setAreaState, towns, flatTypes }) => {
  const [show, setShow] = useState(false);
  const formRef = useRef(null);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const listFilters = ["Town", "Flat Type"]
  const currentFilters = [areaState.town, areaState.flatType]
  const lists = [towns, flatTypes]
  const listKeyValues = ["town", "flatType"]

  const handleListChange = (value, key) => {
    if (areaState[key].includes(value)) {
      setAreaState((prevState) => ({
        ...prevState,
        [key]: prevState[key].filter((existingValue) => existingValue !== value),
      }))
    } else {
      setAreaState((prevState) => ({
        ...prevState,
        [key]: [...prevState[key], value],
      }))
    }};

  const handleRangeChange = (value, key) => {

    const parsedValue = parseInt(value);
    if (!isNaN(parsedValue)) {
      setAreaState({
        ...areaState,
        [key]: parsedValue,
      })
    } else {
      setAreaState((prevState) => ({
        ...prevState,
        [key]: parsedValue,
      }));
    }
  };
  
  const handleReset = () => {
    setAreaState({
      ...areaState,
      town: [],
      flatType: [],
      minPsf: undefined,
      maxPsf: undefined,
      minSqf: undefined,
      maxSqf: undefined,
    }); 
    formRef.current.reset()
  }

  return (
    <>
      <Button variant="primary" onClick={handleShow}>
      Filter
      </Button>
      <Modal 
        show={show} 
        onHide={handleClose}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          Add Custom Filters
        </Modal.Header>
        <Modal.Body>
          <Form ref={formRef}>
            {listFilters.map((f, index) => (
              <div key={index}>
                <Row>
                  <h5>{f} filter</h5>
                    <ListFilter 
                       data={lists[index]}
                       dataType={f}
                       currentState={currentFilters[index]}
                       handleListChange={handleListChange}
                       keyValue={listKeyValues[index]}
                    />
                </Row>
                <Separator/>
              </div>
            ))
            }
            <Row>
              <h5>Price</h5>
              <RangeFilter 
                rangeDesc={["Min. $/sf", "Max. $/sf"]} 
                keys={["minPsf", "maxPsf"]} 
                minMaxVal={[0, 100000]}
                handleRangeChange={handleRangeChange}
                currentValues={[areaState.minPsf, areaState.maxPsf]}
              />
            </Row>
            <Separator />
            <Row>
              <h5>Floor area</h5>
              <RangeFilter
                rangeDesc={["Min. Floor Area (sqf)", "Max. Floor Area (sqf)"]} 
                keys={["minSqf", "maxSqf"]} 
                minMaxVal={[0, 100000]}
                handleRangeChange={handleRangeChange}
                currentValues={[areaState.minSqf, areaState.maxSqf]}
              />
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleReset}>Reset</Button>
          <Button variant="secondary" onClick={handleClose}>Close</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default FilterPanel;

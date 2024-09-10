import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, eachDayOfInterval } from "date-fns";
import { Typeahead } from "react-bootstrap-typeahead";
import "react-bootstrap-typeahead/css/Typeahead.css";
import "./Manager.css";
import API from "../API";

const PersonDatePicker = (props) => {
  const persons = props.users;

  const [selectedPerson, setSelectedPerson] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedDates, setSelectedDates] = useState([]);

  const handlePersonSelect = (selected) => {
    const person = selected[0];
    setSelectedPerson(person);
    setSelectedDates([]); // Resetta le date selezionate quando si cambia utente
  };

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
  };

  const addDateRange = () => {
    if (startDate && endDate) {
      // do not insert date if already present
      const daysInRange = eachDayOfInterval({ start: startDate, end: endDate });
      const formattedDates = daysInRange.map((date) =>
        format(date, "dd/MM/yyyy")
      );
      const uniqueDates = formattedDates.filter(
        (date) => !selectedDates.includes(date)
      );
      setSelectedDates([...selectedDates, ...uniqueDates]);
    }
    console.log("Date result ", selectedDates);
    console.log(selectedPerson);
  };

  const submitDates = () => {
    // API call to insert absences
    console.log("Submit dates ", selectedDates, "id", selectedPerson.id);
    API.insertAbsences(selectedPerson.id, selectedDates)
      .then(() => {
        console.log("Absences inserted");
      })
      .catch((err) => console.error(err));
  };

  return (
    <div className="container mt-3">
      <h3>Shifts manager</h3>
      <Form>
        <Form.Group controlId="personSelect">
          <Form.Label>Select user</Form.Label>
          <Typeahead
            id="person-typeahead"
            labelKey="name"
            options={persons || []}
            placeholder="Seleziona un utente..."
            onChange={handlePersonSelect}
            selected={selectedPerson ? [selectedPerson] : []}
            highlightOnlyResult
          />
        </Form.Group>

        <Form.Group controlId="dateSelect" className="mt-3">
          <Form.Label>Select day(s)</Form.Label>
          <div className="d-flex">
            <DatePicker
              selected={startDate}
              onChange={handleDateChange}
              startDate={startDate}
              endDate={endDate}
              selectsRange
              inline
              className="form-control"
              dateFormat="dd/MM/yyyy"
            />
          </div>
        </Form.Group>
        <p></p>
        <Button variant="primary" className="ml-2" onClick={addDateRange}>
          Aggiungi intervallo di date
        </Button>

        {selectedDates.length > 0 && (
          <div className="mt-3">
            <h5>Selected day(s) for {selectedPerson?.name}</h5>
            <ul>
              {selectedDates.map((date, index) => (
                <li key={index}>{date}</li>
              ))}
            </ul>
          </div>
        )}
      </Form>
      <Button variant="primary" className="mt-3" onClick={submitDates}>
        Submit
      </Button>
    </div>
  );
};

export default PersonDatePicker;

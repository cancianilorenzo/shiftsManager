import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, eachDayOfInterval } from "date-fns";
import { Typeahead } from "react-bootstrap-typeahead";
import "react-bootstrap-typeahead/css/Typeahead.css";
import "./Manager.css";
import API from "../API";
import { Container, Row } from "react-bootstrap";
import { Link } from "react-router-dom";

const PersonDatePicker = (props) => {
  const persons = props.users;

  const [selectedPerson, setSelectedPerson] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedDates, setSelectedDates] = useState([]);

  const user = props.user;

  const handlePersonSelect = (selected) => {
    const person = selected[0];
    setSelectedPerson(person);
    setSelectedDates([]);
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
    console.log("Submit dates ", selectedDates, "id", selectedPerson.id);
    API.insertAbsences(selectedPerson.id, selectedDates)
      .then(() => {
        console.log("Absences inserted");
        setSelectedDates([]);
      })
      .catch((err) => console.error(err));
  };

  return (
    <div className="container mt-3">
      <Container>
        <Form>
          <Row>
            <Form.Group controlId="personSelect">
              <Form.Label>Select user</Form.Label>
              <Typeahead
                id="person-typeahead"
                labelKey="name"
                options={persons || []}
                placeholder="Select user..."
                onChange={handlePersonSelect}
                selected={selectedPerson ? [selectedPerson] : []}
                highlightOnlyResult
              />
            </Form.Group>
          </Row>

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
            Add date range
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
      </Container>
      {/* <Row> */}
        <Button variant="primary" className="mt-3" onClick={submitDates}>
          Submit
        </Button>
      {/* </Row> */}
      <Row>
        <p></p>
        <p></p>
        {user && user.role === 'admin' && (
          <Button variant="danger" className="px-4 py-2">
            <Link
              to="/manage"
              style={{ color: "white", textDecoration: "none" }}
            >
              Management
            </Link>
          </Button>
        )}
      </Row>
    </div>
  );
};

export default PersonDatePicker;

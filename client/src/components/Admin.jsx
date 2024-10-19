import API from "../API";
import React, { useState } from "react";
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import { Typeahead } from "react-bootstrap-typeahead";

function AdminRoute(props) {
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [password, setPassword] = useState("");
  const [score, setScore] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [newScore, setNewScore] = useState("");

  const users = props.users;
  const setDirty = props.setDirty;

  const handleDownload = () => {
    if (!month || !year) {
      alert("Please, insert year and month");
      return;
    }
    const downloadUrl = `${API.SERVER_URL}shifts?month=${month}&year=${year}`;
    window.location.href = downloadUrl;
  };

  const handleAddUser = () => {
    API.addUser(name, role, password, score)
    .then(() => {setDirty(true); setName(''); setRole(''); setScore(''); setPassword('');})
    .catch((err) => console.error(err));
  };

  const handleEditScore = () => {
    if (!selectedUser || !newScore) {
      alert("Please select a user and enter a new score.");
      return;
    }
    API.patchScore(selectedUser.id, newScore)
      .then(() => {setDirty(true); setSelectedUser(''); setNewScore('')})
      .catch((err) => console.error(err));
  };

  const handlePersonSelect = (selected) => {
    const person = selected[0];
    setSelectedUser(person);
    setNewScore(""); // Reset new score when a new user is selected
  };

  return (
    <Container className="mt-5">
      {/* Generate Shifts Section */}
      <h2 className="text-center mt-5 mb-4">Generate and Download Shifts</h2>

      <Form
        className="mb-5 p-4"
        style={{ backgroundColor: "#f8f9fa", borderRadius: "10px" }}
      >
        <Row className="justify-content-center">
          <Col xs={12} md={6} lg={4}>
            <Form.Group className="mb-3">
              <Form.Label>Month</Form.Label>
              <Form.Control
                type="text"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                placeholder="Insert month (e.g., 09)"
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="justify-content-center">
          <Col xs={12} md={6} lg={4}>
            <Form.Group className="mb-3">
              <Form.Label>Year</Form.Label>
              <Form.Control
                type="text"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="Insert year (e.g., 2024)"
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="justify-content-center">
          <Col xs={12} md={6} lg={4} className="text-center">
            <Button
              variant="primary"
              className="w-100"
              onClick={handleDownload}
            >
              Download Markdown File
            </Button>
          </Col>
        </Row>
      </Form>

      {/* Add User Section */}
      <h2 className="text-center mt-5 mb-4">Add New User</h2>

      <Form
        className="mb-5 p-4"
        style={{ backgroundColor: "#f1f3f5", borderRadius: "10px" }}
      >
        <Row className="justify-content-center">
          <Col xs={12} md={6} lg={4}>
            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter full name"
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="justify-content-center">
          <Col xs={12} md={6} lg={4}>
            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Control
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Enter role (e.g., admin)"
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="justify-content-center">
          <Col xs={12} md={6} lg={4}>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="justify-content-center">
          <Col xs={12} md={6} lg={4}>
            <Form.Group className="mb-3">
              <Form.Label>Score</Form.Label>
              <Form.Control
                value={score}
                onChange={(e) => setScore(e.target.value)}
                placeholder="Enter user score"
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="justify-content-center">
          <Col xs={12} md={6} lg={4} className="text-center">
            <Button variant="success" className="w-100" onClick={handleAddUser}>
              Add User
            </Button>
          </Col>
        </Row>
      </Form>

      {/* Edit User Score Section */}
      <h2 className="text-center mt-5 mb-4">Edit User Score</h2>

      <Form
        className="mb-5 p-4"
        style={{ backgroundColor: "#e9ecef", borderRadius: "10px" }}
      >
        <Row className="justify-content-center">
          <Col xs={12} md={6} lg={4}>
            <Form.Group controlId="personSelect">
              <Form.Label>Select User</Form.Label>
              <Typeahead
                id="person-typeahead"
                labelKey="name"
                options={users || []}
                placeholder="Select a user..."
                onChange={handlePersonSelect}
                selected={selectedUser ? [selectedUser] : []}
                highlightOnlyResult
              />
            </Form.Group>
          </Col>
        </Row>

        {/* Show current score if user is selected */}
        {selectedUser && (
          <Row className="justify-content-center mb-3">
            <Col xs={12} md={6} lg={4}>
              <Form.Group className="mb-3">
                <Form.Label>Current Score</Form.Label>
                <Form.Control
                  readOnly
                  value={selectedUser?.score}
                />
              </Form.Group>
            </Col>
          </Row>
        )}

        <Row className="justify-content-center">
          <Col xs={12} md={6} lg={4}>
            <Form.Group className="mb-3">
              <Form.Label>New Score</Form.Label>
              <Form.Control
                value={newScore}
                onChange={(e) => setNewScore(e.target.value)}
                placeholder="Enter new score"
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="justify-content-center">
          <Col xs={12} md={6} lg={4} className="text-center">
            <Button
              variant="warning"
              className="w-100"
              onClick={handleEditScore}
              disabled={!newScore || !selectedUser}
            >
              Update Score
            </Button>
          </Col>
        </Row>
      </Form>
    </Container>
  );
}

export default AdminRoute;


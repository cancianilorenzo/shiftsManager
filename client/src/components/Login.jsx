import React, { useState, useContext } from "react";
import API from "../API";
import { useNavigate } from "react-router-dom";
import { Form, Button } from "react-bootstrap";
import LoginContext from "../context/loginContext";

function LoginForm(props) {
  const [username, setusername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const {loginSuccessful, logout } = props;

  const { user } = useContext(LoginContext);

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if(user){
      //Logout logged user to avoid double session...
      logout();
    }
    if(username === "" || password === ""){
      setError("Please fill all fields!");
      return;
    }
    

    API.login(username, password)
      .then((user) => {
        if (user) {
          setError("");
          loginSuccessful(user);
          console.log(user)
          navigate("/");
        } else {
          setError("Wrong username or password!");
        }
      })
      .catch((err) => {
        setError(err.error);
      });
  };

  return (
    <div>
      <center>
        <h1 className="text-danger">{error}</h1>
        <h2>Login</h2>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formBasicUsername">
            <Form.Label>Username:</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => {
                setusername(e.target.value);
                setError("");
              }}
            />
          </Form.Group>
          <p></p>
          <Form.Group controlId="formBasicPassword">
            <Form.Label>Password:</Form.Label>
            <Form.Control
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
            />
          </Form.Group>
          <p></p>
          <Button variant="primary" type="submit">
            Login
          </Button>
        </Form>
      </center>
    </div>
  );
}

export default LoginForm;

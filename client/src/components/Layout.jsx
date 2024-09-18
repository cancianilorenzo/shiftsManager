
import React, { useContext } from "react";
import { Navbar, Nav, Button, Container, Row } from "react-bootstrap";
import { Link, Outlet, redirect } from "react-router-dom";
import LoginContext from "../context/loginContext.js";
import API from "../API";

function MyNavbar(props) {
  const { user } = useContext(LoginContext);
  const setUser = props.setUser;

  return (
    <Navbar
      className="bg-body-tertiary w-100 px-4"
      expand="lg"
      style={{ position: "fixed", top: 0, left: 0, width: "100%", zIndex: 1000 }}
    >
      <Container fluid>
        <Navbar.Brand>
          <Link to="/" style={{ color: "black", textDecoration: "none", fontWeight: "bold" }}>
            CucinOne Cleaning Shifts
          </Link>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav" className="justify-content-end">
          <Nav>
            {user ? (
              <Nav.Item className="d-flex align-items-center">
                <Navbar.Text className="me-3">
                  Signed in as: <strong>{user.name}</strong>
                </Navbar.Text>
                <Button
                  variant="outline-primary"
                  onClick={() => {
                    API.logout().then(() => {
                      setUser(null);
                      <redirect to='/'  />
                    });
                  }}
                  style={{ marginLeft: "10px" }}
                >
                  Logout
                </Button>
              </Nav.Item>
            ) : (
              <Button variant="primary">
                <Link to="/login" style={{ color: "white", textDecoration: "none" }}>
                  Login
                </Link>
              </Button>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}



function Layout(props) {
  return (
    <>
      <Container>
        <Row>
          <MyNavbar setUser={props.setUser}></MyNavbar>
        </Row>
        <Row>
          <Outlet />
        </Row>
      </Container>
    </>
  );
}

export default Layout;

import React from 'react';
import { Link } from "react-router-dom";

function DefaultRoute() {
    return (
      <>
        <h1>404</h1>
        <p>Page not found</p>
        <Link to="/">Go back to the main page</Link>
      </>
    )
  }

  export default DefaultRoute;
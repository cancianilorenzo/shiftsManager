import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import PersonDatePicker from "./components/Manager";
import API from "./API";
import LoginContext from "./context/loginContext.js";
import DefaultRoute from "./components/Default.jsx";
import AdminRoute from "./components/Admin.jsx";

import Layout from "./components/Layout.jsx";
import LoginForm from "./components/Login.jsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  const [users, setUsers] = useState(null);
  const [user, setUser] = useState(null);
  const [dirty, setDirty] = useState(false);

  const loginSuccesful = (user) => {
    setUser(user);
    console.log("User ==> ", user);
    console.log("User set correctly");
  };

  const logout = () => {
    API.logout().catch((err) => setError(err));
    setUser(null);
  };

  useEffect(() => {
    API.getUsers()
      .then((users) => setUsers(users))
      .catch((err) => console.error(err));
  }, [dirty]);

  //UseEffect for checking authN
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await API.getInfo();
        setUser(user);
      } catch (err) {
        null;
      }
    };
    checkAuth();
  }, []);

  return (
    <>
      <LoginContext.Provider value={{ user, setUser }}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout setUser={setUser}/>}>
              <Route index element={<PersonDatePicker users={users} user={user} />} />
              <Route
                path="/login"
                element={
                  <LoginForm loginSuccessful={loginSuccesful} logout={logout} />
                }
              />
              {user && user.role === "admin" && (
                <Route path="/manage" element={<AdminRoute users={users} setDirty={setDirty} />} />
              )}
              <Route path="/*" element={<DefaultRoute />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </LoginContext.Provider>
    </>
  );
}

export default App;

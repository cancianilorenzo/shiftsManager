import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import PersonDatePicker from './components/Manager';
import API from './API';

function App() {
  const [users, setUsers] = useState(null);

  useEffect(() => {
    API.getUsers()
      .then((users) => setUsers(users))
      .catch((err) => console.error(err));
  }, []);

  return (
    <>
  <PersonDatePicker users={users} />
    </>
  )
}

export default App

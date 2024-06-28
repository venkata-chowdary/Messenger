import React from "react";
import { Routes, Route } from 'react-router-dom';
import Home from "./pages/Home";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Profile from "./components/Profile";
import ProtectedRoute from "./pages/ProtectedRoute";
import { UserProvider } from './context/UserContext';

function App() {
  return (
    <UserProvider>
      <div className="app">
        <Routes>
          <Route path="/" element={<ProtectedRoute />}>
            <Route path="/" element={<Home />} exact />
            <Route path="/profile" element={<Profile/>}/>
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </div>
    </UserProvider>
  );
}

export default App;

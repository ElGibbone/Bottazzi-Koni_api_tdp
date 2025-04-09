import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Auth from './pages/Auth';
import User from './pages/User';
import Password from './pages/Password';
import Email from './pages/Email';

const App: React.FC = () => {
  return (
    <div className="container">
      <Navbar />
      <div className="row mt-4">
        <div className="col-12">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/user" element={<User />} />
            <Route path="/password" element={<Password />} />
            <Route path="/password/:token" element={<Password />} />
            <Route path="/email" element={<Email />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default App; 
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import Explorar from './pages/Explorar';
import Contacto from './pages/Contacto';
import Eventos from './pages/Eventos';
import Scholarships from './pages/Scholarships'; 
import MainLayout from './components/MainLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/explorar" element={<Explorar />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/eventos" element={<Eventos />} />
          <Route path="/becas" element={<Scholarships />} /> 
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/perfil" element={<Profile />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
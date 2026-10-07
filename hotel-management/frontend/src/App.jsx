import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HotelList from './pages/HotelList';
import AddHotel from './pages/AddHotel';
import EditHotel from './pages/EditHotel';
import HotelDetails from './pages/HotelDetails';

const App = () => {
  return (
    <div className="app-container">
      <Header />
      
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HotelList />} />
          <Route path="/add" element={<AddHotel />} />
          <Route path="/edit/:id" element={<EditHotel />} />
          <Route path="/hotels/:id" element={<HotelDetails />} />
        </Routes>
      </main>

      <footer className="site-footer">
        <div className="footer-inner">
          <p>© {new Date().getFullYear()} Hotel Management Website • College Project Demo</p>
        </div>
      </footer>
    </div>
  );
};

export default App;

// components/Dashboard.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
// import { VL, Language } from '../resource/language';

function Dashboard() {
  const navigate = useNavigate();

  function handleNhaHangNext() {
    navigate('/resource/foodservice/category');
  }

  return (
    <div className="container">
      <div className="card">
        <h2>Marketing</h2>
        <button className="next-button">Next</button>
      </div>
      <div className="card">
        <h2>Nhà Hàng</h2>
        <button className="next-button" onClick={handleNhaHangNext}>Next</button>
      </div>
    </div>
  );
}

export default Dashboard;

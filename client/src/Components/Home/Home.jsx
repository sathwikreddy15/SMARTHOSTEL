import React, { useEffect, useState } from 'react';
import './home.css';

const Home = () => {
  const [username, setUsername] = useState('');

  useEffect(() => {
    const storedName = localStorage.getItem('user');
    if (storedName) {
      setUsername(storedName);
    }
  }, []);

  return (
    <div className="home-container">
      <h1 className="home-greeting">👋 Hey {username || 'User'}!</h1>
      <p className="home-subtext">Here are your daily schedules:</p>

      <div className="home-table">
        <div className="home-row">
          <div className="home-card">
            <h3>🍽️ Mess Timings</h3>
            <p><strong>Breakfast:</strong> 7:30 AM - 9:30 AM</p>
            <p><strong>Lunch:</strong> 12:00 PM - 2:00 PM</p>
            <p><strong>Dinner:</strong> 7:30 PM - 10:00 PM</p>
          </div>

          <div className="home-card">
            <h3>🚌 Bus Timings</h3>
            <p><strong>Morning:</strong> 8:00 AM - 9:30 AM</p>
            <p><strong>Evening:</strong> 3:40 PM - 5:30 PM</p>
          </div>

          <div className="home-card">
            <h3>🏏 Ground Timings</h3>
            <p><strong>Evening:</strong> 5:30 PM - 10:00 PM</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

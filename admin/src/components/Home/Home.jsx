import React, { useEffect, useState } from 'react';
import './Home.css';

const Home = () => {
  const [leaveCount, setLeaveCount] = useState(0);
  const [complaintCount, setComplaintCount] = useState(0);
  const [inHostelCount, setInHostelCount] = useState(0);
  const [bunkedCount, setBunkedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Leave Requests
        const leaveRes = await fetch('https://smarthostel.onrender.com/leave-request');
        const leaveData = await leaveRes.json();
        if (leaveData.success) {
          const pendingLeaves = leaveData.leaveRequests.filter(
            req => req.status !== 'approved' && req.status !== 'rejected'
          );
          setLeaveCount(pendingLeaves.length);
        }

        // Complaints
        const complaintsRes = await fetch('https://smarthostel.onrender.com/get-complaints');
        const complaintData = await complaintsRes.json();
        if (complaintData.success) {
          setComplaintCount(complaintData.data.length);
        }

        // Attendance + Deattendance
        const attRes = await fetch('https://smarthostel.onrender.com/attendance-logs');
        const deattRes = await fetch('https://smarthostel.onrender.com/deattendance-logs');
        const attData = await attRes.json();
        const deattData = await deattRes.json();

        if (attData.success && deattData.success) {
          const currentTime = new Date();

          const inHostel = attData.logs.filter((entry) => {
            const exitLog = deattData.logs.find(d => d.name === entry.name);
            if (!exitLog) return true;
            return new Date(exitLog.time) > currentTime;
          });

          setInHostelCount(3);

          // Calculate bunked
          const bunked = attData.logs.filter((entry) => {
            const exitLog = deattData.logs.find(d => d.name === entry.name);
            const entryTime = new Date(entry.time);
            const exitTime = exitLog ? new Date(exitLog.time) : null;

            const nightStart = new Date(entryTime);
            nightStart.setHours(22, 0, 0);

            const nightEnd = new Date(entryTime);
            nightEnd.setHours(8, 0, 0);
            nightEnd.setDate(nightEnd.getDate() + 1);

            return exitTime && exitTime >= nightStart && exitTime <= nightEnd;
          });

          setBunkedCount(bunked.length);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="admin-home-container">
      <h1 className="admin-home-header">🏠 Admin Dashboard</h1>
      {loading ? (
        <p>Loading summary...</p>
      ) : (
        <div className="dashboard-grid-reverse-triangle">
          <div className="dashboard-card pending full-width">
            <h2>{leaveCount}</h2>
            <p>Pending Leave Requests</p>
          </div>
          <div className="dashboard-card complaints">
            <h2>{complaintCount}</h2>
            <p>Unresolved Complaints</p>
          </div>
          <div className="dashboard-card hostel">
            <h2>{inHostelCount}</h2>
            <p>Students In Hostel</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;

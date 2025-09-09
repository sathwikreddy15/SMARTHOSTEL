import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './leaveRequest.css';

const LeaveRequest = () => {
  const [formData, setFormData] = useState({
    studentName: '',
    fromDate: '',
    toDate: '',
    parentNumber: '',
    reason: ''
  });

  const [loading, setLoading] = useState(false);
  const [leaveHistory, setLeaveHistory] = useState([]); // State to store previous leave requests

  // Fetch student name from local storage and previous leave requests for the student on component mount
  useEffect(() => {
    const storedStudentName = localStorage.getItem('user'); // Assuming the name is stored under the key 'user'
    if (storedStudentName) {
      setFormData((prev) => ({ ...prev, studentName: storedStudentName }));
    }

    // Fetch previous leave requests for the current student
    const fetchLeaveHistory = async () => {
      try {
        if (storedStudentName) {
          const response = await axios.get('https://smarthostel.onrender.com/leave-requests', {
            params: { studentName: storedStudentName } // Send student name to the backend to fetch history for that student
          });
          if (response.data.success) {
            setLeaveHistory(response.data.leaveRequests); // Update state with leave history for the student
          } else {
            console.error('Failed to fetch leave requests');
          }
        }
      } catch (error) {
        console.error('Error fetching leave requests:', error);
      }
    };

    fetchLeaveHistory();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post('https://smarthostel.onrender.com/leave-request', formData);
      
      if (res.data.success) {
        alert('✅ Leave request submitted successfully!');
        setFormData({
          studentName: '',
          fromDate: '',
          toDate: '',
          parentNumber: '',
          reason: ''
        });
        // After submission, refresh the leave history
        const response = await axios.get('https://smarthostel.onrender.com/leave-requests', {
          params: { studentName: formData.studentName } // Fetch updated leave requests for the same student
        });
        if (response.data.success) {
          setLeaveHistory(response.data.leaveRequests);
        }
      } else {
        alert('❌ ' + res.data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('⚠ An error occurred while submitting your request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="leave-container">
      <div className="leave-form-box">
        <h2>📨 Student Leave Request</h2>
        <form onSubmit={handleSubmit}>
          <p><strong>Student Name: </strong>{formData.studentName}</p> {/* Display student name */}

          <label>From Date</label>
          <input
            name="fromDate"
            type="date"
            value={formData.fromDate}
            onChange={handleChange}
            required
          />

          <label>To Date</label>
          <input
            name="toDate"
            type="date"
            value={formData.toDate}
            onChange={handleChange}
            required
          />

          <input
            name="parentNumber"
            placeholder="Parent Phone (+91...)"
            value={formData.parentNumber}
            onChange={handleChange}
            pattern="^\+91\d{10}$"
            title="Enter valid Indian number (+91XXXXXXXXXX)"
            required
          />

          <textarea
            name="reason"
            placeholder="Reason for leave"
            value={formData.reason}
            onChange={handleChange}
            rows={4}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      </div>

      {/* Display leave request history for the same student */}
      <div className="leave-history">
        <h3>Previous Leave Requests</h3>
        {leaveHistory.length === 0 ? (
          <p>No previous leave requests found.</p>
        ) : (
          <table className="history-table">
            <thead>
              <tr>
                <th>From Date</th>
                <th>To Date</th>
                <th>Parent Number</th>
                <th>Reason</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {leaveHistory.map((request) => (
                <tr key={request._id}>
                  <td>{new Date(request.fromDate).toLocaleDateString()}</td>
                  <td>{new Date(request.toDate).toLocaleDateString()}</td>
                  <td>{request.parentNumber}</td>
                  <td>{request.reason}</td>
                  <td>{request.status || 'Pending'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default LeaveRequest;

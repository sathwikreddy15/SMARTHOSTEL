import React, { useState, useEffect } from 'react';
import './LeaveApproval.css';

const LeaveApproval = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        const response = await fetch('https://smarthostel.onrender.com/leave-request');
        const data = await response.json();
        if (data.success) {
          setLeaveRequests(data.leaveRequests);
        } else {
          alert('Failed to fetch leave requests');
        }
      } catch (error) {
        console.error('Error fetching leave requests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveRequests();
  }, []);

  const handleLeaveRequestStatus = async (id, status) => {
    try {
      const response = await fetch(`https://smarthostel.onrender.com/leave-request/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      const data = await response.json();

      if (data.success) {
        setLeaveRequests(prev =>
          prev.map(req => req._id === id ? { ...req, status: data.leaveRequest.status } : req)
        );
      } else {
        alert('Failed to update leave request');
      }
    } catch (error) {
      console.error('Error updating leave request:', error);
    }
  };

  const pendingRequests = leaveRequests.filter(
    req => req.status !== 'approved' && req.status !== 'rejected'
  );

  return (
    <div className="leave-approval-container">
      <h2 className="leave-approval-header">Leave Requests</h2>

      {loading ? (
        <p className="leave-approval-loading">Loading...</p>
      ) : pendingRequests.length === 0 ? (
        <p className="leave-approval-no-requests">No leave requests.</p>
      ) : (
        <div className="leave-approval-grid">
          {pendingRequests.map((request) => (
            <div key={request._id} className="leave-approval-card">
              <h3 className="leave-approval-student-name">{request.studentName}</h3>
              <p className="leave-approval-details"><span>From:</span> {new Date(request.fromDate).toLocaleDateString()}</p>
              <p className="leave-approval-details"><span>To:</span> {new Date(request.toDate).toLocaleDateString()}</p>
              <p className="leave-approval-details"><span>Parent No:</span> {request.parentNumber}</p>
              <p className="leave-approval-details"><span>Reason:</span> {request.reason}</p>
              <p className="leave-approval-status"><span>Status:</span> {request.status || 'Pending'}</p>
              <div className="leave-approval-buttons">
                <button
                  onClick={() => handleLeaveRequestStatus(request._id, 'approved')}
                  className="leave-approval-button-approve"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleLeaveRequestStatus(request._id, 'rejected')}
                  className="leave-approval-button-reject"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LeaveApproval;

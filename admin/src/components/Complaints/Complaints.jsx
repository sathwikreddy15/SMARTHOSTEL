import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
  Cell,
} from 'recharts';
import './Complaints.css';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f50', '#a4de6c'];

const Complaints = () => {
  const [feedbackData, setFeedbackData] = useState([]);
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    axios.get('https://smarthostel.onrender.com/food-feedbacks')
      .then(res => setFeedbackData(res.data.data || []))
      .catch(err => console.error('Error fetching feedback:', err));

    axios.get('https://smarthostel.onrender.com/get-complaints')
      .then(res => setComplaints(res.data.data || []))
      .catch(err => console.error('Error fetching complaints:', err));
  }, []);

  const aggregateRatings = () => {
    const itemMap = {};
    feedbackData.forEach(entry => {
      entry.items.forEach(({ item, rating }) => {
        if (!itemMap[item]) itemMap[item] = { item, total: 0, count: 0 };
        itemMap[item].total += rating;
        itemMap[item].count += 1;
      });
    });
    return Object.values(itemMap).map(i => ({
      item: i.item,
      avgRating: Number((i.total / i.count).toFixed(2)),
    }));
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`https://smarthostel.onrender.com/delete-complaint/${id}`);
      setComplaints(prev => prev.filter(c => c._id !== id));
    } catch (err) {
      console.error('Failed to delete complaint:', err);
    }
  };

  return (
    <div className="complaints-container">
      <h1>📊 Food Feedback Overview</h1>

      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={aggregateRatings()} barSize={50}>
            <XAxis dataKey="item" />
            <YAxis domain={[0, 5]} />
            <Tooltip />
            <Legend />
            <Bar dataKey="avgRating" name="Avg Rating">
              <LabelList dataKey="avgRating" position="top" />
              {aggregateRatings().map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <h2>📋 Complaints</h2>
      <div className="complaints-grid">
        {complaints.length === 0 ? (
          <p>No complaints submitted.</p>
        ) : (
          complaints.map((c) => (
            <div className="complaint-card" key={c._id}>
              <h3>{c.title}</h3>
              <p>{c.complaintText}</p>
              <p className="date">{new Date(c.submittedAt).toLocaleString()}</p>
              <button className="delete-btn" onClick={() => handleDelete(c._id)}>Resolved</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Complaints;

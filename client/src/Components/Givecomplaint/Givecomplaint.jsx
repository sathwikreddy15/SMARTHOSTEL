import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Givecomplaint.css';

const foodItems = ['Rice', 'Dal', 'Roti', 'Sabzi', 'Salad'];

const GiveComplaint = () => {
  const [ratings, setRatings] = useState(Array(foodItems.length).fill(0));
  const [hover, setHover] = useState(Array(foodItems.length).fill(0));
  const [overallFeedback, setOverallFeedback] = useState('');
  const [complaintTitle, setComplaintTitle] = useState('');
  const [complaintText, setComplaintText] = useState('');
  const [username, setUsername] = useState('john123'); // Replace with actual user
  const [showFoodForm, setShowFoodForm] = useState(true);

  useEffect(() => {
    axios
      .get(`https://smarthostel.onrender.com/check-feedback/${username}`)
      .then((res) => {
        if (res.data.feedbackGiven) setShowFoodForm(false);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [username]);

  const handleRating = (index, value) => {
    const newRatings = [...ratings];
    newRatings[index] = value;
    setRatings(newRatings);
  };

  const handleFoodSubmit = async (e) => {
    e.preventDefault();
    const items = foodItems.map((item, i) => ({
      item,
      rating: ratings[i],
    }));

    try {
      const res = await axios.post('https://smarthostel.onrender.com/submit-food-feedback', {
        username,
        items,
        feedbackText: overallFeedback,
      });

      alert(res.data.message || 'Feedback submitted!');
      setShowFoodForm(false);
    } catch (err) {
      console.error(err);
      alert('Failed to submit feedback.');
    }
  };

  const handleComplaintSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post('https://smarthostel.onrender.com/submit-complaint', {
        username,
        title: complaintTitle,
        complaintText,
      });

      alert(res.data.message || 'Complaint submitted!');
      setComplaintTitle('');
      setComplaintText('');
    } catch (err) {
      console.error(err);
      alert('Failed to submit complaint.');
    }
  };

  return (
    <div className="container">
      <h1>Feedback & Complaints</h1>

      {showFoodForm && (
        <div className="card">
          <h2>Today's Food Menu</h2>
          <form onSubmit={handleFoodSubmit}>
            {foodItems.map((item, i) => (
              <div key={i} className="food-block">
                <h3>{item}</h3>
                <div className="stars">
                  {[...Array(5)].map((_, j) => {
                    const starValue = j + 1;
                    return (
                      <label key={j}>
                        <input
                          type="radio"
                          name={`rating-${i}`}
                          value={starValue}
                          onClick={() => handleRating(i, starValue)}
                        />
                        <span
                          className="star"
                          style={{
                            color: starValue <= (hover[i] || ratings[i]) ? '#ffc107' : '#ccc',
                          }}
                          onMouseEnter={() => {
                            const newHover = [...hover];
                            newHover[i] = starValue;
                            setHover(newHover);
                          }}
                          onMouseLeave={() => {
                            const newHover = [...hover];
                            newHover[i] = 0;
                            setHover(newHover);
                          }}
                        >
                          ★
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}

            <textarea
              placeholder="Overall feedback for the food menu..."
              value={overallFeedback}
              onChange={(e) => setOverallFeedback(e.target.value)}
              required
            />

            <button type="submit" className="submit-food-btn">
              🍽️ Submit Food Feedback
            </button>
          </form>
        </div>
      )}

      <div className="card">
        <h2>Complaint Form</h2>
        <form onSubmit={handleComplaintSubmit}>
          <input
            type="text"
            placeholder="Complaint Title"
            value={complaintTitle}
            onChange={(e) => setComplaintTitle(e.target.value)}
            required
          />
          <textarea
            placeholder="Describe your complaint..."
            value={complaintText}
            onChange={(e) => setComplaintText(e.target.value)}
            required
          />
          <button type="submit" className="complaint-btn">
            📝 Submit Complaint
          </button>
        </form>
      </div>
    </div>
  );
};

export default GiveComplaint;

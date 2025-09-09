// === BlueprintRoomBooking.js ===
import React, { useEffect, useState } from "react";
import axios from "axios";
import './SelectRoom.css';

const roomSize = { width: 50, height: 30 };
const clusterSize = { rows: 2, cols: 5 };
const clusterCenters = [
  { x: 50, y: 100 },
  { x: 470, y: 100 },
  { x: 50, y: 240 },
  { x: 470, y: 240 },
];

const washroomPositions = [
  { x: 0, y: 0 },
  { x: 760, y: 0 },
  { x: 0, y: 360 },
  { x: 760, y: 360 },
];

const stairPositions = [
  { x: 0, y: 150 },
  { x: 760, y: 150 },
];

const Lift = ({ x }) => (
  <>
    <rect x={x} y={170} width={50} height={60} fill="#74b9ff" />
    <text x={x + 15} y={200} className="label">Lift</text>
  </>
);

const Washroom = ({ x, y }) => (
  <>
    <rect x={x} y={y} width={40} height={40} fill="#fdcb6e" />
    <text x={x + 5} y={y + 25} className="label">WR</text>
  </>
);

const Stairs = ({ x, y }) => (
  <>
    <rect x={x} y={y} width={40} height={80} fill="#a29bfe" />
    <text x={x + 5} y={y + 50} className="label">Stairs</text>
  </>
);

export default function BlueprintRoomBooking() {
  const floorCount = 10;
  const [floors, setFloors] = useState({});
  const [selectedFloor, setSelectedFloor] = useState("floor0");
  const [pendingRoom, setPendingRoom] = useState(null);
  const [confirmedRoom, setConfirmedRoom] = useState(null);

  useEffect(() => {
    const username = localStorage.getItem("user");
    if (!username) return;
  
    // Fetch room from DB instead of only localStorage
    axios.get(`https://smarthostel.onrender.com/user-room/${username}`)
      .then((res) => {
        if (res.data.success && res.data.roomId) {
          setConfirmedRoom(res.data.roomId);
          localStorage.setItem("confirmedRoom", res.data.roomId); // Optional: keep for faster reload
        }
      })
      .catch((err) => console.error("Failed to get user room:", err));
  }, []);
  

  // Fetch current floor's room data
  const fetchFloorRooms = async (floorId) => {
    try {
      const res = await axios.get(`https://smarthostel.onrender.com/rooms/${floorId}`);
      const roomArray = res.data.rooms;
      setFloors(prev => ({
        ...prev,
        [floorId]: roomArray.reduce((acc, room) => {
          acc[room.roomId] = room;
          return acc;
        }, {})
      }));
    } catch (err) {
      console.error("Failed to fetch rooms", err);
    }
  };

  // Fetch when selectedFloor changes
  useEffect(() => {
    fetchFloorRooms(selectedFloor);
  }, [selectedFloor]);

  const updateRoomState = (r) => {
    if (r.occupied >= r.type) return "full";
    if (r.occupied > 0) return "partial";
    return "vacant";
  };

  const handleRoomClick = (floorId, roomId) => {
    if (confirmedRoom) return; // Don't allow further selection
    const room = floors[floorId][roomId];

    if (room.occupied >= room.type) {
      alert("Room is full!");
      return;
    }
    console.log(roomId)
    setPendingRoom({ floorId, roomId});
  };

  const confirmBooking = async () => {
    if (!pendingRoom) return;
    const username = localStorage.getItem("user");
    if (!username) {
     alert("User not logged in");
     return;
    }
    try {
      const res = await axios.post('https://smarthostel.onrender.com/book-room', {...pendingRoom,username});
      console.log("Booking response:", res.data);
      if (res.data.success) {
        alert(res.data.message);
        setConfirmedRoom(res.data.roomId);
        localStorage.setItem("confirmedRoom", res.data.roomId); // Persist

        // Re-fetch updated floor data
        await fetchFloorRooms(selectedFloor);
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      console.error("Booking error", err);
      alert("Something went wrong.");
    }
    setPendingRoom(null);
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen font-sans">
      <h2 className="text-xl mb-4">Hostel Blueprint Room Booking</h2>

      {confirmedRoom && (
        <div className="p-4 text-green-700 text-lg bg-white rounded shadow">
          ✅ You have successfully booked Room: <strong>{confirmedRoom}</strong>
        </div>
      )}

      {!confirmedRoom && (
        <>
          <select
            value={selectedFloor}
            onChange={(e) => setSelectedFloor(e.target.value)}
            className="mb-4 p-2"
          >
            {Array.from({ length: floorCount }, (_, f) => (
              <option key={f} value={`floor${f}`}>
                {f === 0 ? "Ground" : `${f}F`} Floor
              </option>
            ))}
          </select>

          {Object.entries(floors).map(([floorId, rooms]) => (
            <svg
              key={floorId}
              className="floor-map"
              width="800"
              height="400"
              style={{ display: floorId === selectedFloor ? "block" : "none" }}
            >
              {Object.entries(rooms).map(([roomId, r]) => (
                <g key={roomId}>
                  <rect
                    x={r.x}
                    y={r.y}
                    width={roomSize.width}
                    height={roomSize.height}
                    className={`room ${updateRoomState(r)}`}
                    onClick={() => handleRoomClick(floorId, roomId)}
                  />
                  <text x={r.x + 5} y={r.y + 20} className="label">
                    {roomId}
                  </text>
                </g>
              ))}

              {[0, 1].map((l) => (
                <Lift key={l} x={340 + l * 60} />
              ))}

              {washroomPositions.map((p, i) => (
                <Washroom key={i} x={p.x} y={p.y} />
              ))}

              {stairPositions.map((p, i) => (
                <Stairs key={i} x={p.x} y={p.y} />
              ))}
            </svg>
          ))}

          {pendingRoom && (
            <div className="mt-4 p-2 bg-white border rounded w-fit">
              <p>
                Do you want to book room {pendingRoom.roomId}? (
                {floors[pendingRoom.floorId][pendingRoom.roomId].occupied}/
                {floors[pendingRoom.floorId][pendingRoom.roomId].type} occupied)
              </p>
              <button onClick={confirmBooking} className="mt-2 p-2 bg-blue-500 text-white rounded">
                Confirm Booking
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const port=4000;
const exp=require('express')
const app=exp();
//extract body of req 
app.use(exp.json())
require('dotenv').config()
const jwt=require('jsonwebtoken');
const multer=require('multer');
const path=require('path');
const fs = require('fs');
const cors=require('cors');
const bcryptjs=require('bcryptjs')
app.use(cors());
const mongoose=require('mongoose');

mongoose.connect(process.env.DB_URL).then(()=>console.log("DB connected"))
//sample route
app.get('/',(req,res)=>{
  res.send('express app is running')
})

//schema for admin
const Admin=mongoose.model('admin',{
  username:{
    type:String,
    required:true,
  },
  email:{
    type:String,
    required:true,
  },
  password:{
    type:String,
    required:true,
  }
})
//registration for admin

app.post('/register',async(req,res)=>{
  let admin=req.body;
  let check=await Admin.findOne({username:admin.username});
  if(!check){
    admin.password=await bcryptjs.hash(admin.password,6);
    let result=await Admin.insertMany([{...admin}])
    res.json({
      success:true,
      name:admin.username,
    })
  }else{
    res.json({
      success:false,
      error:'Admin already exist'
    })
  }
})
app.post('/login',async(req,res)=>{
  let admin=req.body;
  let dbadmin=await Admin.findOne({username:admin.username})
  if(dbadmin){
    let result=await bcryptjs.compare(admin.password,dbadmin.password);
    if(result){
      res.json({
        success:true,
        message:"login success",
        name:admin.username
      })
    }else{
      res.json({
        success:false,
        message:"invalid password"
      })
    }
  }else{
    res.json({
      success:false,
      message:"Admin not found"
    })
  }
})
const User=mongoose.model('user',{
  username:{
    type:String,
    required:true,
  },
  email:{
    type:String,
    required:true,
  },
  password:{
    type:String,
    required:true,
  },
  roomId:{type:String,default:null},
  feedBack:{type:String,default:false}
})
//registration for user

app.post('/register-user',async(req,res)=>{
  let admin=req.body;
  let check=await User.findOne({username:admin.username});
  if(!check){
    admin.password=await bcryptjs.hash(admin.password,6);
    let result=await User.insertMany([{...admin}])
    res.json({
      success:true,
      name:admin.username,
    })
  }else{
    res.json({
      success:false,
      error:'User already exist'
    })
  }
})
app.post('/login-user',async(req,res)=>{
  let admin=req.body;
  let dbadmin=await User.findOne({username:admin.username})
  if(dbadmin){
    let result=await bcryptjs.compare(admin.password,dbadmin.password);
    if(result){
      res.json({
        success:true,
        message:"login success",
        name:admin.username
      })
    }else{
      res.json({
        success:false,
        message:"invalid password"
      })
    }
  }else{
    res.json({
      success:false,
      message:"User not found"
    })
  }
})

// Room schema
const Room = mongoose.model("room", {
  floorId: { type: String, required: true },
  roomId: { type: String, required: true },
  type: { type: Number, required: true },
  occupied: { type: Number, required: true },
  x: { type: Number, required: true },
  y: { type: Number, required: true },
});

// Get all rooms on a floor
app.get('/rooms/:floorId', async (req, res) => {
  try {
    const { floorId } = req.params;
    const rooms = await Room.find({ floorId });
    res.json({ success: true, rooms });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Book a room
app.post('/book-room', async (req, res) => {
  try {
    const { floorId, roomId, username } = req.body;

    if (!username) return res.status(400).json({ success: false, message: 'Username required' });

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (user.roomId) {
      return res.status(400).json({ success: false, message: 'You have already booked a room' });
    }

    const room = await Room.findOne({ floorId, roomId });
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });

    if (room.occupied >= room.type) {
      return res.status(400).json({ success: false, message: 'Room already full' });
    }

    room.occupied += 1;
    await room.save();

    user.roomId = room.roomId;
    await user.save();

    res.json({ success: true, message: 'Room booked successfully', roomId: room.roomId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
app.get('/init-rooms', async (req, res) => {
  const roomSize = { width: 50, height: 30 };
  const clusterSize = { rows: 2, cols: 5 };
  const clusterCenters = [
    { x: 50, y: 100 },
    { x: 470, y: 100 },
    { x: 50, y: 240 },
    { x: 470, y: 240 },
  ];

  const allRooms = [];

  for (let f = 0; f < 10; f++) {
    const floorId = `floor${f}`;
    let roomIndex = 0;

    clusterCenters.forEach((center) => {
      for (let r = 0; r < clusterSize.rows; r++) {
        for (let c = 0; c < clusterSize.cols; c++) {
          const type = (roomIndex % 3) + 1;
          const occupied = Math.floor(Math.random() * (type + 1)); // 0 to type
          const roomId = `${f === 0 ? 'G' : `F${f}`}R${(roomIndex + 1).toString().padStart(2, '0')}`;

          allRooms.push({
            floorId,
            roomId,
            type,
            occupied,
            x: center.x + c * (roomSize.width + 5),
            y: center.y + r * (roomSize.height + 5),
          });

          roomIndex++;
        }
      }
    });
  }

  try {
    await Room.deleteMany({});
    await Room.insertMany(allRooms);
    res.send("✅ Rooms initialized with random occupancy.");
  } catch (err) {
    res.status(500).send("❌ Failed to initialize rooms: " + err.message);
  }
});

app.get('/user-room/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.json({ success: true, roomId: user.roomId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

const FoodFeedback = mongoose.model("foodfeedback", {
  username: { type: String, required: true },
  items: [
    {
      item: { type: String, required: true },
      rating: { type: Number, required: true }
    }
  ],
  feedbackText: { type: String, default: "" },
  submittedAt: { type: Date, default: Date.now }
});

app.post('/submit-food-feedback', async (req, res) => {
  try {
    const { username, items, feedbackText } = req.body;
    if (!username || !Array.isArray(items)) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }
    await FoodFeedback.create({ username, items, feedbackText });
    res.json({ success: true, message: "Feedback submitted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 🚀 NEW: Complaint Schema & Route
const Complaint = mongoose.model("complaint", {
  username: { type: String, required: true },
  title: { type: String, required: true },
  complaintText: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now }
});

app.post('/submit-complaint', async (req, res) => {
  try {
    const { username, title, complaintText } = req.body;
    if (!username || !title || !complaintText) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }
    await Complaint.create({ username, title, complaintText });
    res.json({ success: true, message: "Complaint submitted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


const Attendance = mongoose.model('attendance', {
  name: { type: String, required: true },
  time: { type: String, required: true },
  date: { type: String, required: true },
});

app.get('/attendance-logs', async (req, res) => {
  try {
    const logs = await Attendance.find({});
    console.log(logs)
    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

const Deattendance = mongoose.model('deattendance', {
  name: { type: String, required: true },
  time: { type: String, required: true },
  date: { type: String, required: true },
});

app.get('/deattendance-logs', async (req, res) => {
  try {
    const logs = await Deattendance.find({});
    console.log(logs);
    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
  
// Fetch all food feedback
app.get('/food-feedbacks', async (req, res) => {
  try {
    const data = await FoodFeedback.find({});
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Fetch all complaints
app.get('/get-complaints', async (req, res) => {
  try {
    const data = await Complaint.find({});
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/delete-complaint/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Complaint.findByIdAndDelete(id);
    res.status(200).json({ message: 'Complaint deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete', error: err.message });
  }
});


const LeaveRequest = mongoose.model("leaveRequest", {
  studentName: { type: String, required: true },
  fromDate: { type: Date, required: true },
  toDate: { type: Date, required: true },
  parentNumber: { type: String, required: true },
  reason: { type: String, required: true }, // Added reason field
  status: { type: String, enum: ["approved", "rejected"], default: null },
  submittedAt: { type: Date, default: Date.now }
});

app.post('/leave-request', async (req, res) => {
  try {
    const { studentName, fromDate, toDate, parentNumber, reason } = req.body;

    if (!studentName || !fromDate || !toDate || !parentNumber || !reason) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    await LeaveRequest.create({ studentName, fromDate, toDate, parentNumber, reason, status: null });

    res.json({ success: true, message: "Leave request submitted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// To fetch all leave requests
app.get('/leave-request', async (req, res) => {
  try {
    const leaveRequests = await LeaveRequest.find();
    res.json({ success: true, leaveRequests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/leave-requests', async (req, res) => {
  const { studentName } = req.query;
  console.log(studentName)
  try {
    const leaveRequests = await LeaveRequest.find({ studentName });
    res.json({ success: true, leaveRequests });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// To update the status of a leave request
app.put('/leave-request/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const leaveRequest = await LeaveRequest.findByIdAndUpdate(id, { status }, { new: true });
    res.json({ success: true, leaveRequest });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

//error handling
app.use((err,req,res,next)=>{
  res.send({message:'error',payload:err.message})
})
//assigning port number
app.listen(port,()=>console.log('server on port '+port))
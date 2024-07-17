const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { authMiddleware } = require('./middleware/authMiddleware');

const app = express();
const cors = require('cors');
const { sign } = require('jsonwebtoken');
app.use(express.json());
app.use(cors());

app.locals.OTP = null;
app.locals.resetSession = false;

app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/message', messageRoutes);

const connectDB = async () => {
    try {
        await mongoose.connect(`mongodb+srv://chowdaryimmanni:s1aMQcASwCHVkwn8@cluster0.mh3yco8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`, {
        
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection failed:', error);
        process.exit(1);
    }
};

connectDB();

app.get('/', (req, res) => {
    console.log(req);
});

app.get('/api/chat/:id', (req, res) => {
    console.log("sjfns");
});


app.use(notFound);
app.use(errorHandler);

const server = app.listen(4000, () => {
    console.log(`Server running on 4000`);
});

const io = require('socket.io')(server, {
    pingTimeout: 60000,
    cors: {
        origin: 'http://localhost:3000'
    }
});

io.on("connection", (socket) => {
    console.log("connected to socket");

    socket.on('setupSocket', (userData) => {
        // console.log(userData.name, userData._id)
        socket.join(userData._id);
        socket.emit('connected')
    })

    socket.on('join room', (roomId) => {
        socket.join(roomId)
        console.log("user joined room:", roomId)
    })

    socket.on("typing", (roomId) => {
        console.log(roomId)
        socket.to(roomId).emit('typing')
    })

    socket.on("stop typing",(roomId)=>{
        socket.to(roomId).emit("stop typing")
    })

    socket.on('newMessage', (newMessageRecieved) => {
        var chat = newMessageRecieved.chat
        if (!chat.users) return console.log('no users found in the chat')

        chat.users.forEach(user => {
            if (user._id.toString() == newMessageRecieved.sender._id) return
            socket.to(user._id).emit('messageReceived', newMessageRecieved)
            // console.log("message sent")
        })
    })


    socket.off('setup',()=>{
        console.log("disconnected from socket")
    })

});

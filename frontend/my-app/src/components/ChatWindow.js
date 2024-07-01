import React, { useContext, useEffect, useState,useRef,useMemo } from 'react';
import '../styles/ChatWindow.css';
import axios from 'axios';
import logo from '../assets/logo.png';
import { UserContext } from '../context/UserContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faL, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import io from 'socket.io-client'


const ENDPOINT = 'http://localhost:4000'
let socket;

function ChatWindow({ UserIdToselectedChat, setSelectedChat }) {
    const { userDetails } = useContext(UserContext);
    const [otherUserDetails, setOtherUserDetails] = useState({});
    const [chatDetails, setChatDetails] = useState({});
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [socketConnected,setSocketConnected]=useState(false)
    const selectedChatCompare = useRef(null);


    const config = useMemo(() => ({
        headers: {
            "Content-type": "application/json",
            'Authorization': 'Bearer ' + userDetails.token,
        }
    }), [userDetails.token]);

    // get chat details GET - api/message/:id
    useEffect(() => {
        if (chatDetails._id) {
            axios.get(`http://localhost:4000/api/message/${chatDetails._id}`, config)
                .then((response) => {
                    setMessages(response.data);
                    socket.emit("join room", chatDetails._id)
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    }, [chatDetails,config]);


    function handleDelete() {
        axios.delete(`http://localhost:4000/api/chat/${chatDetails._id}`, config)
            .then((response) => {
                if (response.status === 200) {
                    setSelectedChat(null);
                }
            })
            .catch((err) => {
                console.log(err);
            });
    }

    useEffect(() => {
        if (UserIdToselectedChat) {
            axios.post('http://localhost:4000/api/chat', { userId: UserIdToselectedChat }, config)
                .then((response) => {
                    const chatData = response.data;
                    const otherUser = chatData.users.find((user) => user._id !== userDetails._id);
                    setOtherUserDetails(otherUser);
                    // console.log(chatData)
                    selectedChatCompare.current=chatData._id
                    setChatDetails(chatData);
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    }, [UserIdToselectedChat]);



    function handleSendMessage() {
        if (newMessage.trim() === '') return;
        axios.post('http://localhost:4000/api/message', { content: newMessage, chatId: chatDetails._id }, config)
            .then((response) => {
                setMessages([...messages, response.data]);
                setNewMessage('');
                socket.emit('newMessage', response.data)
            })
            .catch((err) => {
                console.log(err);
            });
    }

    useEffect(() => {
        socket = io(ENDPOINT)
        socket.emit('setupSocket', userDetails)

        socket.on('messageReceived', (newMessageReceived) => {
            var newMessageId= newMessageReceived.chat._id
            console.log(selectedChatCompare.current==newMessageId)
            if (selectedChatCompare && selectedChatCompare.current === newMessageId) {
                console.log("message received")
                setMessages((prevMessages) => [...prevMessages, newMessageReceived]);
            }
        });
        return () => {
            socket.disconnect();
        };
    }, [userDetails])

    return (
        <div className="chat-window">
            {UserIdToselectedChat ? (
                <>
                    <div className="chat-header">
                        <div className="chat-header-info">
                            <img src={otherUserDetails.profilePhoto} alt="Profile" className="chat-header-image" />
                            <div className="chat-header-name">{otherUserDetails.name}</div>
                        </div>
                        <p>{chatDetails._id}</p>
                        <div className='header-menu'>
                            <button className="delete-button" onClick={handleDelete} title="Delete">
                                <FontAwesomeIcon icon={faTrashAlt} />
                            </button>
                        </div>
                    </div>
                    <div className="chat-messages">
                        {messages.map((message) => (
                            <div key={message._id} className={`message ${message.sender._id === userDetails._id ? 'current-user-message' : 'other-user-message'}`}>
                                <p>{message.content}</p>
                                <span className='timestamp'>{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>))}
                    </div>
                    <div className="chat-input">
                        <input
                            type="text"
                            placeholder="Type your message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.code === "Enter") {
                                    handleSendMessage()
                                }
                            }}
                        />
                        <button onClick={handleSendMessage}>Send</button>
                    </div>
                </>
            ) : (
                <div className="select-chat-message">
                    <div className="logo-container">
                        <img src={logo} alt="logo" className='logo' />
                        <h1>Messenger Web</h1>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ChatWindow;

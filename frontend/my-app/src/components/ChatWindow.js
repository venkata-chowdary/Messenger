import React, { useContext, useEffect, useState, useRef, useMemo } from 'react';
import '../styles/ChatWindow.css';
import axios from 'axios';
import logo from '../assets/logo.png';
import { UserContext } from '../context/UserContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faL, faTicket, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import io from 'socket.io-client'


const ENDPOINT = 'http://localhost:4000'
let socket;

function ChatWindow({ UserIdToselectedChat, setSelectedChat, }) {
    const { userDetails } = useContext(UserContext);
    const [otherUserDetails, setOtherUserDetails] = useState({});
    const [chatDetails, setChatDetails] = useState({});
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [socketConnection, setSocketConnection] = useState(false)
    const selectedChatCompare = useRef(null);
    const messagesEndRef = useRef(null)
    const [loading, setLoading] = useState(false)
    const [typing, setTyping] = useState(false)
    const [isTyping, setIsTyping] = useState(false)

    const config = useMemo(() => ({
        headers: {
            "Content-type": "application/json",
            'Authorization': 'Bearer ' + userDetails.token,
        }
    }), [userDetails.token]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages]);

    // get chat details GET - api/message/:id
    useEffect(() => {
        setLoading(true)
        if (chatDetails._id) {
            axios.get(`http://localhost:4000/api/message/${chatDetails._id}`, config)
                .then((response) => {
                    setMessages(response.data);
                    console.log(response.data)
                    socket.emit("join room", chatDetails._id)
                    setLoading(false)
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    }, [chatDetails, config]);

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
                    selectedChatCompare.current = chatData._id
                    setChatDetails(chatData);
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    }, [UserIdToselectedChat]);

    function handleSendMessage() {
        if (newMessage.trim() === '') return;
        socket.emit('stop typing', chatDetails._id)
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
        socket.on('connected', () => {
            console.log("socket connected")
            setSocketConnection(true)
        })

        socket.on("typing", () => { setIsTyping(true) })
        socket.on("stop typing", () => { setIsTyping(false) });

        socket.on('messageReceived', (newMessageReceived) => {
            var newMessageId = newMessageReceived.chat._id
            console.log(selectedChatCompare.current === newMessageId)
            if (selectedChatCompare && selectedChatCompare.current === newMessageId) {
                console.log("message received")
                setMessages((prevMessages) => [...prevMessages, newMessageReceived]);
            }
            else {

            }
        });
        return () => {
            socket.disconnect();
        };
    }, [userDetails])

    function handleInputChange(e) {
        setNewMessage(e.target.value)

        if (!socketConnection) return

        if (!typing) {
            setTyping(true)
            socket.emit('typing', chatDetails._id)
        }

        let lastTypingTime = new Date().getTime();
        setTimeout(() => {
            var currentTime = new Date().getTime()
            if (currentTime - lastTypingTime >= 2000 && typing) {
                socket.emit('stop typing', chatDetails._id)
                setTyping(false)
            }
        }, 2000)
    }
    return (
        <div className="chat-window">
            {UserIdToselectedChat && !loading ? (
                <>
                    <div className="chat-header">
                        <div className="chat-header-info">
                            <img src={otherUserDetails.profilePhoto} alt="Profile" className="chat-header-image" />
                            <div className="chat-header-name">
                                <h4>{otherUserDetails.name}</h4>
                                <span>
                                    {isTyping ? <div className="typing-indicator">
                                        <span>Typing</span>
                                        <div className="dot"></div>
                                        <div className="dot"></div>
                                        <div className="dot"></div>
                                    </div> : null}
                                </span>
                            </div>

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
                                <div>
                                    <span className='timestamp'>{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    <div className={`read-by-ticks ${message.readBy.includes(userDetails._id) ? `blue-ticks` : null}`}>
                                        <span className='tick-1'><FontAwesomeIcon icon={faCheck} /></span>
                                        <span className='tick-2'><FontAwesomeIcon icon={faCheck} /></span>
                                    </div>
                                </div>
                            </div>))}
                        <div ref={messagesEndRef}></div>
                    </div>

                    <div className="chat-input">
                        <input
                            type="text"
                            placeholder="Type your message..."
                            value={newMessage}
                            onChange={handleInputChange}
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

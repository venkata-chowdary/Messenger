import React, { useContext, useEffect, useState, useRef, useMemo } from 'react';
import '../styles/ChatWindow.css';
import axios from 'axios';
import logo from '../assets/logo.png';
import { UserContext } from '../context/UserContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import io from 'socket.io-client';

const ENDPOINT = 'http://localhost:4000';
let socket;

function ChatWindow({ selectedChat, setSelectedChat, setUsersListUpdate }) {
    const groupIconUrl = 'https://static.vecteezy.com/system/resources/previews/026/019/617/non_2x/group-profile-avatar-icon-default-social-media-forum-profile-photo-vector.jpg';

    const { userDetails } = useContext(UserContext);
    const [otherUserDetails, setOtherUserDetails] = useState({});
    const [chatDetails, setChatDetails] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [socketConnection, setSocketConnection] = useState(false);
    const selectedChatCompare = useRef(null);
    const messagesEndRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [typing, setTyping] = useState(false);
    const [isTyping, setIsTyping] = useState(false);

    const config = useMemo(() => ({
        headers: {
            "Content-type": "application/json",
            'Authorization': 'Bearer ' + userDetails.token,
        }
    }), [userDetails.token]);

    useEffect(() => {
        if (selectedChat) {
            fetchChat();
        }
    }, [selectedChat]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        socket = io(ENDPOINT);
        socket.emit('setupSocket', userDetails);
        socket.on('connected', () => {
            console.log("socket connected");
            setSocketConnection(true);
        });

        socket.on("typing", () => { setIsTyping(true); });
        socket.on("stop typing", () => { setIsTyping(false); });

        socket.on('messageReceived', (newMessageReceived) => {
            var newMessageId = newMessageReceived.chat._id;
            if (selectedChatCompare.current === newMessageId) {
                console.log("message received");
                setMessages((prevMessages) => [...prevMessages, newMessageReceived]);
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [userDetails]);

    function handleDelete() {
        if (!chatDetails || !chatDetails._id) return;
        axios.delete(`http://localhost:4000/api/chat/${chatDetails._id}`, config)
            .then((response) => {
                if (response.status === 200) {
                    setSelectedChat(null);
                    setUsersListUpdate(prev => !prev);
                }
            })
            .catch((err) => {
                console.log(err);
            });
    }

    function handleSendMessage() {
        if (newMessage.trim() === '' || !chatDetails || !chatDetails._id) return;
        socket.emit('stop typing', chatDetails._id);
        axios.post('http://localhost:4000/api/message', { content: newMessage, chatId: chatDetails._id }, config)
            .then((response) => {
                setMessages([...messages, response.data]);
                setNewMessage('');
                socket.emit('newMessage', response.data);
            })
            .catch((err) => {
                console.log(err);
            });
    }

    function handleInputChange(e) {
        setNewMessage(e.target.value);

        if (!socketConnection || !chatDetails || !chatDetails._id) return;

        if (!typing) {
            setTyping(true);
            socket.emit('typing', chatDetails._id);
        }

        let lastTypingTime = new Date().getTime();
        setTimeout(() => {
            var currentTime = new Date().getTime();
            if (currentTime - lastTypingTime >= 2000 && typing) {
                socket.emit('stop typing', chatDetails._id);
                setTyping(false);
            }
        }, 2000);
    }

    function fetchChat() {
        axios.get(`http://localhost:4000/api/chat/${selectedChat}`, config)
            .then((response) => {
                const chatData = response.data;
                console.log(response.data)
                setChatDetails(chatData);

                if (chatData.isGroupChat) {
                    const otherGroupUsers = chatData.users.filter((user) => user._id !== userDetails._id);
                    setOtherUserDetails([otherGroupUsers]);
                } else {
                    const otherUser = chatData.users.find((user) => user._id !== userDetails._id);
                    setOtherUserDetails(otherUser);
                }

                selectedChatCompare.current = chatData._id;
            })
            .catch((err) => {
                console.log(err);
            });
    }

    useEffect(() => {
        setLoading(true);
        if (chatDetails && chatDetails._id) {
            axios.get(`http://localhost:4000/api/message/${chatDetails._id}`, config)
                .then((response) => {
                    setMessages(response.data);
                    socket.emit("join room", chatDetails._id);
                    setLoading(false);
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    }, [chatDetails, config]);

    console.log(messages)
    return (
        <div className="chat-window">
            {selectedChat && chatDetails ? (
                <>
                    <div className="chat-header">
                        <div className="chat-header-info">
                            <img src={chatDetails.isGroupChat ? groupIconUrl : otherUserDetails.profilePhoto} alt="Profile" className="chat-header-image" />
                            <div className="chat-header-name">
                                <h4>{chatDetails.isGroupChat ? chatDetails.chatName : otherUserDetails.name}</h4>
                                <span>
                                    {isTyping ? (
                                        <div className="typing-indicator">
                                            <span>Typing</span>
                                            <div className="dot"></div>
                                            <div className="dot"></div>
                                            <div className="dot"></div>
                                        </div>
                                    ) : null}
                                </span>
                            </div>
                        </div>
                        {/* {chatDetails.isGroupChat ?
                            <div style={{ display: 'flex', gap: 6 }}>
                                {chatDetails.users.map((user) => <p>{user.name},</p>)}
                            </div> : null} */}
                        <div className='header-menu'>
                            <button className="delete-button" onClick={handleDelete} title="Delete">
                                <FontAwesomeIcon icon={faTrashAlt} />
                            </button>
                        </div>
                    </div>
                    <div className="chat-messages">
                        {(Array.isArray(messages) ? messages : []).map((message, i) => (
                            <div key={message._id} className={`message ${message.sender._id === userDetails._id ? 'current-user' : 'other-user'}`}>
                                <img
                                    src={message.sender.profilePhoto}
                                    className={`sender-profile-photo-message ${message.sender._id === userDetails._id ? 'current-user-photo' : 'other-user-photo'} ${(i === messages.length - 1 || message.sender._id !== messages[i + 1]?.sender._id) ? 'profile': 'no-profile'}`} />
                                <div className={`message-container ${message.sender._id === userDetails._id ? 'current-user-message' : 'other-user-message'}`}>
                                    <p>{message.content}</p>
                                    <div>
                                        <span className='timestamp'>{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </div>
                            </div>
                        ))}

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
                                    handleSendMessage();
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

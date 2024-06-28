import React, { useContext, useEffect, useState } from 'react';
import '../styles/ChatWindow.css';
import axios from 'axios';
import logo from '../assets/logo.png';
import { UserContext } from '../context/UserContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import io from 'socket.io-client'
const ENDPOINT='http://localhost:4000'
var socket,selectedChatCompare;

function ChatWindow({ selectedChat, setSelectedChat }) {


    const { userDetails } = useContext(UserContext);
    const [otherUserDetails, setOtherUserDetails] = useState({});
    const [chatDetails, setChatDetails] = useState({});
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');

    const config = {
        headers: {
            "Content-type": "application/json",
            'Authorization': 'Bearer ' + userDetails.token,
        }
    };

    // get chat details GET - api/message/:id
    useEffect(() => {
        if (chatDetails._id) {
            axios.get(`http://localhost:4000/api/message/${chatDetails._id}`, config)
                .then((response) => {
                    setMessages(response.data);
                    console.log(response.data)
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    }, [chatDetails]);

    
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
        if (selectedChat) {
            axios.post('http://localhost:4000/api/chat', { userId: selectedChat }, config)
                .then((response) => {
                    const chatData = response.data;
                    const otherUser = chatData.users.find((user) => user._id !== userDetails._id);
                    setOtherUserDetails(otherUser);
                    setChatDetails(chatData);
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    }, [selectedChat]);



    function handleSendMessage() {
        if (newMessage.trim() === '') return;

        axios.post('http://localhost:4000/api/message', { content: newMessage, chatId: chatDetails._id }, config)
            .then((response) => {
                setMessages([...messages, response.data]);
                setNewMessage('');
            })
            .catch((err) => {
                console.log(err);
            });
    }

    useEffect(()=>{
        socket=io(ENDPOINT)
    },[])
    return (
        <div className="chat-window">
            {selectedChat ? (
                <>
                    <div className="chat-header">
                        <div className="chat-header-info">
                            <img src={otherUserDetails.profilePhoto} alt="Profile" className="chat-header-image" />
                            <div className="chat-header-name">{otherUserDetails.name}</div>
                        </div>
                        {/* <p>{chatDetails._id}</p> */}
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
                                <span className='timestamp'>{new Date(message.createdAt).toLocaleTimeString([],{ hour: '2-digit', minute: '2-digit' })}</span>
                            </div>))}
                    </div>
                    <div className="chat-input">
                        <input
                            type="text"
                            placeholder="Type your message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e)=>{
                                if(e.code==="Enter"){
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

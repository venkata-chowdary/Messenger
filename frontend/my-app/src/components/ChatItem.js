import React, { useContext, useEffect, useState } from 'react';
import '../styles/ContactList.css';
import axios from 'axios';
import { UserContext } from '../context/UserContext';

function ChatItem({_id,profilePhoto,name,handleChatClick}) {

    
    const otherUserId = _id
    const [chatDetails, setChatDetails] = useState({})
    const { userDetails } = useContext(UserContext)
    const [unreadCount, setUnreadCount] = useState(0)

    const config = {
        headers: {
            "Content-type": "application/json",
            'Authorization': 'Bearer ' + userDetails.token,
        }
    };

    useEffect(() => {
        axios.post('http://localhost:4000/api/chat', { userId: otherUserId }, config)
            .then((response) => {
                if (response.status === 200) {
                    setChatDetails(response.data)
                }
            })
            .catch((err) => {
                console.log(err)
            })
    }, [])

    useEffect(() => {
        if (chatDetails._id) {
            axios.get(`http://localhost:4000/api/chat/${chatDetails._id}/unread`, config)
                .then((response) => {
                    setUnreadCount(response.data.unreadCount)
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    }, [chatDetails]);


    function handleChatItemClick(e) {
        axios.post(`http://localhost:4000/api/chat/${chatDetails._id}/mark-as-read`, {}, config)
            .then((response) => {
                console.log(response)
                setUnreadCount(0)
            })
            .catch((err) => {
                console.log(err)
            })
        handleChatClick(chatDetails._id)

    }

    return (
        <div key={_id} className="chat-item" onClick={handleChatItemClick}>
            <img src={profilePhoto} alt={name} className="chat-profile-photo" />
            <div className="chat-details">
                <div className="chat-name">{name}</div>
                <div className="chat-latest-message">
                    {chatDetails.latestMessage ?
                        chatDetails.latestMessage.content.length > 28 ?
                            chatDetails.latestMessage.content.substring(0, 28) + '...' :
                            chatDetails.latestMessage.content
                        : ""}
                </div>
            </div>
            <div className="chat-meta">
                <div className="chat-time">{new Date(chatDetails.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                {unreadCount > 0 ? 
                <div className="chat-unread-count">
                    {unreadCount}
                </div>:null}
            </div>
        </div>
    );

}

export default ChatItem;

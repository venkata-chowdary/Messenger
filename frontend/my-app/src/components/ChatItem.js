import React, { useContext, useEffect, useState } from 'react';
import '../styles/ContactList.css';
import axios from 'axios';
import { UserContext } from '../context/UserContext';

function ChatItem(props) {

    const otherUserId = props._id
    const [chatDetails, setChatDetails] = useState({})
    const { userDetails } = useContext(UserContext)

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

    return (
        <div key={props._id} className="chat-item" onClick={() => props.onChatClick(props._id)}>
            <img src={props.profilePhoto} alt={props.name} className="chat-profile-photo" />
            <div className="chat-details">
                <div className="chat-name">{props.name}</div>
                <div className="chat-latest-message">
                    {chatDetails.latestMessage ?
                        chatDetails.latestMessage.content.length > 28 ?
                            chatDetails.latestMessage.content.substring(0, 28) + '...' :
                            chatDetails.latestMessage.content
                        : ""}
                </div>
            </div>
            <div className="chat-meta">
                <div className="chat-time">{new Date(chatDetails.updatedAt).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</div>
                <div className="chat-unread-count">1</div>
            </div>
        </div>
    );

}

export default ChatItem;

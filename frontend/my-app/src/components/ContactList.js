import React, { useContext, useEffect, useState } from "react";
import axios from 'axios';
import { UserContext } from "../context/UserContext";
import '../styles/ContactList.css';
import ChatItem from './ChatItem'
import AddUser from "./AddUser";
import CreateGroup from "./CreateGroup";

function ContactList({ handleChatClick, usersListUpdated, setUsersListUpdate }) {
    const [contactList, setContactList] = useState([]);
    const { userDetails } = useContext(UserContext);
    const [searchQuery, setSearchQuery] = useState('')
    const [loading, setLoading] = useState(true)

    const config = {
        headers: {
            'Authorization': 'Bearer ' + userDetails.token,
        }
    };

    const groupIconUrl = 'https://static.vecteezy.com/system/resources/previews/026/019/617/non_2x/group-profile-avatar-icon-default-social-media-forum-profile-photo-vector.jpg';


    //Chat List GET - /api/chat
    useEffect(() => {
        setLoading(true)
        axios.get('http://localhost:4000/api/chat', config)
            .then((response) => {
                const chatData = response.data
                console.log(chatData)
                const users = chatData.reduce((allUsers, chat) => {
                    if (chat.isGroupChat) {
                        allUsers.push({
                            _id: chat._id,
                            name: chat.chatName,
                            profilePhoto: groupIconUrl, // Use the default group icon
                            isGroupChat: true,
                            updatedAt: chat.updatedAt,
                            latestMessage: chat.latestMessage
                        });
                    } else {
                        chat.users.forEach(user => {
                            if (user._id !== userDetails._id) {
                                allUsers.push({
                                    _id: chat._id,
                                    name: user.name,
                                    profilePhoto: user.profilePhoto,
                                    isGroupChat: false,
                                    updatedAt: chat.updatedAt,
                                    latestMessage: chat.latestMessage
                                });
                            }
                        });
                    }
                    return allUsers;
                }, []);
                setContactList(users);
                setLoading(false)
                console.log(contactList)
            })
            .catch((err) => {
                console.log('Error fetching chats:', err);
            });
    }, [userDetails.token, usersListUpdated]);


    // const searchedChats = contactList.filter(user =>
    //     user.name.toLowerCase().includes(searchQuery.toLowerCase())
    // )

    return (
        <div className="contact-list">
            <div className="chats-heading">
                <h2>Chats</h2>
                <div className="create-btns">
                    <AddUser setUsersListUpdate={setUsersListUpdate} handleChatClick={handleChatClick} />
                    <CreateGroup setUsersListUpdate={setUsersListUpdate} />
                </div>

            </div>
            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Search Chat"
                    onChange={(e) => setSearchQuery(e.target.value)}
                    value={searchQuery}
                />
            </div>
            <div className="chats-list">
                {loading ?
                    <span className="contact-list-loader"></span>
                    :
                    <div className="chats">
                        {contactList.map(chat => (
                            <ChatItem
                                key={chat._id}
                                _id={chat._id}
                                profilePhoto={chat.profilePhoto}
                                name={chat.name}
                                handleChatClick={handleChatClick}
                                isGroupChat={chat.isGroupChat}
                            />
                        ))}
                    </div>
                }
            </div>
        </div>
    );
}

export default ContactList;

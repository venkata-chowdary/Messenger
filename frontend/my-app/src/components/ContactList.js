import React, { useContext, useEffect, useState } from "react";
import axios from 'axios';
import { UserContext } from "../context/UserContext";
import '../styles/ContactList.css';
import ChatItem from './ChatItem'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import AddUser from "./AddUser";

function ContactList(props) {
    const [contactList, setContactList] = useState([]);
    const { userDetails } = useContext(UserContext);
    const [searchQuery, setSearchQuery] = useState('')
    const [usersListUpdated,setUsersListUpdate]=useState(false)


    const config = {
        headers: {
            'Authorization': 'Bearer ' + userDetails.token,
        }
    };


    //Chat List GET - /api/chat
    useEffect(() => {
        axios.get('http://localhost:4000/api/chat', config)
            .then((response) => {
                const chatData = response.data
                const users = chatData.reduce((allUsers, chat) => {
                    chat.users.forEach(user => {
                        if (user._id !== userDetails._id) {
                            allUsers.push(user);
                        }
                    });
                    return allUsers;
                }, []);
                setContactList(users);
                console.log(contactList)
            })
            .catch((err) => {
                console.log('Error fetching chats:', err);
            });
    }, [userDetails.token, userDetails._id,usersListUpdated]);


    const searchedChats = contactList.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="contact-list">
            <div className="chats-heading">
                <h2>Chats</h2>
                <AddUser setUsersListUpdate={setUsersListUpdate} onChatClick={props.onChatClick}/>
            </div>
            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Search Chat"
                    onChange={(e) => setSearchQuery(e.target.value)}
                    value={searchQuery}
                />
            </div>
            <div className="chats">
                {searchedChats.map(user => (
                    <ChatItem
                        key={user._id}
                        _id={user._id}
                        profilePhoto={user.profilePhoto}
                        name={user.name}
                        onChatClick={props.onChatClick}
                    />
                ))}
            </div>
        </div>
    );
}

export default ContactList;

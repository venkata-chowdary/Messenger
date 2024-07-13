import React, { useCallback, useContext, useEffect } from "react"
import '../styles/Profile.css'
import img from '../assets/profile.jpeg'
import '../styles/ChatWindowEditMode.css'
import { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faCheck, faArrowLeft, faUserMinus, faUserCheck, faUserEdit, faUserShield, faUserTie, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios'
import { UserContext } from "../context/UserContext";

function ChatWindowEditMode({ chatDetails, config, setChatDetails,setIsEditMode,isEditMode }) {
    const { userDetails } = useContext(UserContext)
    const groupName = chatDetails.chatName
    const groupMembers = chatDetails.users
    const [editMode, setEditMode] = useState(false);
    const [editedName, setEditedName] = useState(groupName);
    const [searchResults, setSearchResults] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    const handleNameEdit = () => {
        setEditMode(true);
    };

    const handleCancelEdit = () => {
        setEditedName(groupName);
        setEditMode(false);
    };

    //Change Group Name
    const handleNameSave = () => {
        axios.put(`http://localhost:4000/api/chat/group/rename`, { chatId: chatDetails._id, newGroupName: editedName }, config)
            .then((response) => {
                console.log(response)
                if (response.status === 200) {
                    const updatedGroupName = response.data.updatedGroup.chatName
                    console.log(updatedGroupName)
                    setChatDetails((prevData) => ({ ...prevData, chatName: updatedGroupName }))
                    setEditMode(false)
                }
            })
            .catch((err) => {
                console.log(err)
            })
    };

    //Remove User from Group
    function handleRemoveUser(userId) {
        axios.put(`http://localhost:4000/api/chat/group/remove-user`, { chatId: chatDetails._id, userId }, config)
            .then((response) => {
                if (response.status === 200) {
                    const { message, updatedGroup } = response.data;
                    setChatDetails(prevData => ({
                        ...prevData,
                        users: updatedGroup.users
                    }));
                }
            })
            .catch((err) => {
                console.log(err)
            })
    }

    //Make User admin
    function handleMakeUserAdmin(userId) {
    }

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (query.length >= 2) {
            axios.get(`http://localhost:4000/api/user/search?searchName=${query}`, config)
                .then(response => {
                    const queryUsers = response.data
                    if (response.data.length > 0) {
                        const filteredUsers = queryUsers.filter((user) => {
                            return !groupMembers.some(u => u._id === user._id)
                        })
                        setSearchResults(filteredUsers)
                    }
                })
                .catch(error => {
                    console.error('Error fetching user search results:', error);
                });
        } else {
            setSearchResults([]);
        }
    };

    function handleUserSelectToAdd(user) {
        console.log(user)
        axios.put(`http://localhost:4000/api/chat/group/add-user`, { chatId: chatDetails._id, newUserIds: user._id }, config)
            .then((response) => {
                console.log(response)
                if (response.status === 200) {
                    const updatedGroup = response.data.updatedGroup
                    console.log(updatedGroup.users)
                    setChatDetails(prevData => ({ ...prevData, users: updatedGroup.users }))
                    setSearchQuery('')
                    setSearchResults([])
                }
            })
            .catch((err) => {
                console.log(err)
            })
    }
    return (
        <div className="chat-window-edit">
            <button className="back-btn" onClick={()=>setIsEditMode(false)}>
                <FontAwesomeIcon icon={faArrowLeft} />
            </button>
            <div className="edit-chat-form">

                <h3>Edit Group Details</h3>
                {editMode ? (
                    <div className="group-name-edit-mode edit-mode">
                        <input
                            type="text"
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                            placeholder="Group Name"
                        />
                        <button onClick={handleNameSave}><FontAwesomeIcon icon={faCheck} /></button>
                        <button onClick={handleCancelEdit}>
                            Cancel
                        </button>
                    </div>
                ) : (
                    <div className="group-name-view-mode view-mode">
                        <p>{groupName}</p>
                        <button onClick={handleNameEdit}><FontAwesomeIcon icon={faPen} /></button>
                    </div>
                )}
            </div>
            <div className="add-user-group-section">
                <h3>Add members</h3>
                <div>
                    <input type="text" placeholder="Search for users" onChange={handleSearchChange} value={searchQuery} />
                </div>
                <div className="recommendations">
                    <ul>
                        {searchResults.map(user => (
                            <li key={user._id} onClick={() => handleUserSelectToAdd(user)}>
                                <div className="user-add-user">
                                    <img src={user.profilePhoto} alt={user.name} className="recommendation-profile-photo" />
                                    <h4>{user.name}</h4>
                                    <button className="add-user-group">
                                        <FontAwesomeIcon icon={faUserPlus} />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            <div className="group-mem-section">
                <div className="group-mem-section-header">
                    <h3>Group Members</h3>
                </div>
                {chatDetails.users && chatDetails.users.length > 0 ? (
                    <div className="group-mem-list">
                        {chatDetails.users.map((user) => (
                            <div key={user._id} className="group-mem">
                                <div className="group-mem-profile">
                                    <img src={user.profilePhoto} alt={`${user.name}'s profile`} />
                                </div>
                                <div className="group-mem-details">
                                    <h4>{user.name}</h4>
                                    <p>{user.about}</p>
                                </div>
                                {chatDetails.groupAdmins.includes(user._id) ? (
                                    <span className="admin">Admin</span>
                                ) : (
                                    <div className="user-control-btns">
                                        <button className="remove-user-btn" onClick={() => handleRemoveUser(user._id)}>
                                            <FontAwesomeIcon icon={faUserMinus} />
                                        </button>
                                        <button className="make-admin-btn" onClick={() => handleMakeUserAdmin(user._id)}>
                                            <FontAwesomeIcon icon={faUserTie} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No members found.</p>
                )}
            </div>
        </div>
    )
}


export default ChatWindowEditMode


import React, { useState, useRef, useContext, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserGroup } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import '../styles/CreateGroup.css';
import { Tooltip } from "react-tooltip";
import '../styles/Home.css'


function CreateGroup({ setUsersListUpdate }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [isVisible, setIsVisible] = useState(false);
    const [step, setStep] = useState(1);
    const [allUsers, setAllUsers] = useState([]);
    const [initialUsers, setInitialUsers] = useState([]);
    const { userDetails } = useContext(UserContext);
    const createGroupRef = useRef(null);
    const [groupName, setGroupName] = useState('');

    const config = {
        headers: {
            'Authorization': 'Bearer ' + userDetails.token,
        }
    };

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (query.length >= 2) {
            axios.get(`http://localhost:4000/api/user/search?searchName=${query}`, config)
                .then(response => {
                    setSearchResults(response.data);
                })
                .catch(error => {
                    console.error('Error fetching user search results:', error);
                });
        } else {
            setSearchResults([]);
        }
    };

    useEffect(() => {
        axios.get('http://localhost:4000/api/user/get-users', config)
            .then((users) => {
                if (users.status === 200) {
                    setAllUsers(users.data.otherUsers);
                    setInitialUsers(users.data.otherUsers.slice(0, 3));
                }
            })
            .catch((err) => {
                console.log(err);
            });
    }, [config]);

    const handleCreateGroupClick = () => {
        setIsVisible(!isVisible);
    };

    const handleUserSelect = (user) => {
        const alreadySelected = selectedUsers.find(u => u._id === user._id);
        if (alreadySelected) {
            setSelectedUsers(prevUsers => prevUsers.filter(u => u._id !== user._id));
        } else {
            setSelectedUsers(prev => [...prev, user]);
        }
    };

    const handleCreateGroup = () => {
        const selectedUsersId = selectedUsers.map(user => user._id);
        const adminIds = [userDetails._id];
        axios.post(`http://localhost:4000/api/chat/group`, { groupName, users: selectedUsersId, adminIds }, config)
            .then((response) => {
                if (response.status === 200) {
                    setUsersListUpdate(prev => !prev);
                    setSelectedUsers([]);
                    setSearchQuery('');
                    setSearchResults([]);
                    setIsVisible(false);
                }
            })
            .catch((err) => {
                console.error('Error creating group:', err);
            });
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (createGroupRef.current && !createGroupRef.current.contains(event.target)) {
                setIsVisible(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [createGroupRef]);

    const handleNextStep = () => {
        if (step === 1) {
            setStep(2);
        }
    };

    const handleCancel = () => {
        if (step === 2) {
            setStep(1);
        } else {
            setSelectedUsers([])
            setIsVisible(false);
        }
    };

    
    return (
        <div className="new-group" ref={createGroupRef}>

            <div className="create-group-btn" onClick={handleCreateGroupClick}
                data-tooltip-content='Create Group' data-tooltip-id="create-group-tooltip">
                <p>New Group</p>
            </div>
            <Tooltip id="create-group-tooltip" />
            <div className={`search-container ${isVisible ? 'visible' : ''}`}>
                {step === 1 && isVisible && (
                    <>
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="search-input"
                        />
                        <div className="recommendations">
                            <ul>
                                {(searchQuery.length >= 2 ? searchResults : initialUsers).map(user => (
                                    <li key={user._id} onClick={() => handleUserSelect(user)}>
                                        <div className="checkbox-container">
                                            <input
                                                type="checkbox"
                                                checked={selectedUsers.some(u => u._id === user._id)}
                                                readOnly
                                            />
                                            <img src={user.profilePhoto} alt={user.name} className="recommendation-profile-photo" />
                                            <p>{user.name}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        {selectedUsers.length >= 2 && (
                            <div className="button-container">
                                <button className="next-button" onClick={handleNextStep}>Next</button>
                                <button className="cancel-button" onClick={handleCancel}>Cancel</button>
                            </div>
                        )}
                    </>
                )}
                {step === 2 && isVisible && (
                    <>
                        <input
                            type="text"
                            placeholder="Enter group name"
                            value={groupName}
                            onChange={e => setGroupName(e.target.value)}
                            className="group-name"
                        />
                        <div className="button-container">
                            <button className="create-group-button" onClick={handleCreateGroup}>Create Group</button>
                            <button className="cancel-button" onClick={handleCancel}>Cancel</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default CreateGroup;

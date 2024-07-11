import React, { useState, useRef, useContext, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserGroup, prefix } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import '../styles/CreateGroup.css';

function CreateGroup({ setUsersListUpdate }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [isVisible, setIsVisible] = useState(false);
    const [step, setStep] = useState(1); // 1: Select users, 2: Enter group name

    const [allUsers, setAllUsers] = useState([])
    const { userDetails } = useContext(UserContext);
    const createGroupRef = useRef(null);

    const [groupName, setGroupName] = useState('')

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
                    const allOtherUsers = users.data.otherUsers
                    setAllUsers(allOtherUsers)
                }
            })
            .catch((err) => {
                console.log(err)
            })
    }, [])

    const handleCreateGroupClick = () => {
        setIsVisible(!isVisible);
    };

    const handleAddUser = (user) => {
        setSelectedUsers(prevUsers => [...prevUsers, user]);
    };

    const handleRemoveUser = (userToRemove) => {
        setSelectedUsers(prevUsers => prevUsers.filter(user => user._id !== userToRemove._id));
    };

    const handleCreateGroup = () => {

        console.log(selectedUsers, groupName)

        const selectedUsersId = selectedUsers.map(user => user._id)
        console.log(selectedUsersId)
        const adminIds = [userDetails._id]
        axios.post(`http://localhost:4000/api/chat/group`, { groupName, users: selectedUsersId, adminIds }, config)
            .then((response) => {
                console.log(response)
                if (response.status === 200) {
                    setUsersListUpdate(prev => !prev)


                    setSelectedUsers([]);
                    setSearchQuery('');
                    setSearchResults([]);
                    setIsVisible(false);
                }
            })


        // Example: alert(`Creating group with ${selectedUsers.length} users: ${selectedUsers.map(user => user.name).join(', ')}`);


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


    function handleUserSelect(user) {

        const alreadySelected = selectedUsers.find(u => u._id === user._id);

        if (alreadySelected) {
            setSelectedUsers(prevUsers => prevUsers.filter(ex => ex._id !== user._id))
        }
        else {
            setSelectedUsers(prev => [...prev, user])
        }
    }

    function handleNextStep() {
        if (step === 1) {
            setStep(2)
            console.log(selectedUsers)
        }
    }

    function handleCancel() {
        if (step === 2) {
            setStep(1)
        }
    }
    return (
        <div className="new-group" ref={createGroupRef}>
            <div className="create-group-btn" onClick={handleCreateGroupClick}>
                <p>New Group <FontAwesomeIcon icon={faUserGroup} /></p>
            </div>
            {isVisible && (
                <div className="search-container visible">
                    {step === 1 && (
                        <>
                            <input
                                type='text'
                                placeholder='Search users...'
                                value={searchQuery}
                                onChange={handleSearchChange}
                                className="search-input"
                            />
                            <div className="recommendations">
                                <ul>
                                    {allUsers.map(user => (
                                        <li key={user._id} onClick={() => handleUserSelect(user)}>
                                            <input
                                                type="checkbox"
                                                checked={selectedUsers.some(u => u._id === user._id)}
                                                readOnly
                                            />
                                            <img src={user.profilePhoto} alt={user.name} className="recommendation-profile-photo" />
                                            <p>{user.name}</p>
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

                    {step == 2 && (
                        <>
                            <input className="group-name" onChange={e => setGroupName(e.target.value)} />
                            <div className="button-container">
                                <button className="create-group-button" onClick={handleCreateGroup}>Create Group</button>
                                <button className="cancel-button" onClick={handleCancel}>Cancel</button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

export default CreateGroup;

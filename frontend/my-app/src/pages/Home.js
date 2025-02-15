import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import logo from '../assets/logo.png';
import profile from '../assets/profile.jpeg';

import '../styles/Home.css'; // Import your CSS file for styling
import ContactList from '../components/ContactList';
import ChatWindow from '../components/ChatWindow';
import { VideoChatProvider } from '../context/VideoChatContext';

function Home() {
    const { userDetails, logout } = useContext(UserContext);
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedChat, setSelectedChat] = useState(null)
    const [usersListUpdated, setUsersListUpdate] = useState(false)

    const [chatWindowEditMode, setChatWindowEditMode] = useState(false)

    console.log(userDetails)
    const dropdownRef = useRef(null);

    const handleLogout = () => {
        logout();
    };

    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
    };

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    function handleChatClick(_id) {
        console.log(_id)
        setSelectedChat(_id)
        setChatWindowEditMode(false)
    }
    return (
        <div className="container">
            <div className="header">
                <div className='logo'>
                    <img src={logo} alt="logo" className='logo' />
                    <h1 className="title">Messenger</h1>
                </div>
                {userDetails && (
                    <div className="profile-section">
                        <div className="profile-info" onClick={toggleDropdown}>
                            <img src={userDetails.profilePhoto} alt="Profile" className="profile-image" />
                        </div>
                        {showDropdown && (
                            <div className="dropdown-menu active" ref={dropdownRef}>
                                <Link to="/profile" className="dropdown-item">Profile</Link>
                                <button className="logout-btn" onClick={handleLogout}>Logout</button>
                            </div>
                        )}
                    </div>

                )}
            </div>
            <div className="content">
                <div className='sidebar'>
                    <ContactList
                        handleChatClick={handleChatClick}
                        usersListUpdated={usersListUpdated}
                        setUsersListUpdate={setUsersListUpdate}
                        setChatWindowEditMode={setChatWindowEditMode}
                        chatWindowEditMode={chatWindowEditMode}
                    />
                </div>
                <VideoChatProvider>
                    <div className='chat-window'>
                        <ChatWindow selectedChat={selectedChat}
                            setSelectedChat={setSelectedChat}
                            setUsersListUpdate={setUsersListUpdate}
                            chatWindowEditMode={chatWindowEditMode}
                            setChatWindowEditMode={setChatWindowEditMode}
                        />
                    </div>
                </VideoChatProvider>

            </div>
        </div>
    );
}

export default Home;

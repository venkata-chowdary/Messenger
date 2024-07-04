import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useContext, useRef, useState, useEffect } from 'react';
import { UserContext } from '../context/UserContext';

function AddUser({ setUsersListUpdate, onChatClick }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isVisible, setIsVisible] = useState(false);
    const { userDetails } = useContext(UserContext);
    const addUserRef = useRef(null);

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
                    console.log(response);
                    setSearchResults(response.data);
                })
                .catch(error => {
                    console.error('Error fetching user search results:', error);
                });
        } else {
            setSearchResults([]);
        }
    };



    const handleUserSelect = (userId) => {
        axios.post('http://localhost:4000/api/chat', { userId }, config)
            .then(data => {
                console.log(data);
                setUsersListUpdate(value => !value);
                setSearchQuery('');
                onChatClick(userId);
                setSearchResults([]);
                setIsVisible(false);
            })
            .catch(err => {
                console.error('Error creating chat:', err);
            });
    };

    const handleAddUserClick = () => {
        setIsVisible(!isVisible);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (addUserRef.current && !addUserRef.current.contains(event.target)) {
                setIsVisible(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [addUserRef]);

    return (
        <div className="new-chat" ref={addUserRef}>
            <button className="newchat-button" onClick={handleAddUserClick}>
                <p>New Chat <FontAwesomeIcon icon={faPlus} /></p>
            </button>
            <div className={`search-container ${isVisible ? 'visible' : ''}`}>
                {isVisible && (
                    <>
                        <input
                            type='text'
                            placeholder='Search name or number'
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="search-input"
                        />
                        {searchResults.length > 0 && (
                            <div className="recommendations">
                                <ul>
                                    {searchResults.map(user => (
                                        <li key={user._id} onClick={() => handleUserSelect(user._id)}>
                                            <img src={user.profilePhoto} alt={user.name} className="recommendation-profile-photo" />
                                            <p>{user.name}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default AddUser;

import React, { useContext, useEffect, useState, useRef, useMemo } from 'react';
import '../styles/ChatWindow.css';
import axios from 'axios';
import logo from '../assets/logo.png';
import { UserContext } from '../context/UserContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTrashAlt, faEllipsisVertical, faL, faArrowRight, faSmile, faSmileBeam, faVideoCamera, faPhone, faPhoneSlash } from '@fortawesome/free-solid-svg-icons';
import io from 'socket.io-client';
import ChatWindowEditMode from './ChatWindowEditMode';
import EmojiPicker from 'emoji-picker-react';
import VideoChat from './VideoChat';
import { VideoChatContext } from '../context/VideoChatContext';

const ENDPOINT = 'http://localhost:4000';
let socket;

function ChatWindow({ selectedChat, setSelectedChat, setUsersListUpdate, setChatWindowEditMode, chatWindowEditMode }) {
    const groupIconUrl = 'https://static.vecteezy.com/system/resources/previews/026/019/617/non_2x/group-profile-avatar-icon-default-social-media-forum-profile-photo-vector.jpg';

    const { userDetails } = useContext(UserContext);
    const [otherUserDetails, setOtherUserDetails] = useState({});
    const [chatDetails, setChatDetails] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [socketConnection, setSocketConnection] = useState(false);
    const selectedChatCompare = useRef(null);
    const messagesEndRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [typing, setTyping] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [isChatButtonsVisible, setIsChatButtonsVisible] = useState(false)
    const [isAdmin, setIsAdmin] = useState(false)
    const dropdownRef = useRef(null);

    const { isVideoChat,
        setIsVideoChat,
        call,
        setCallRinging,
        receivingCall,
        acceptIncomingCall,
        declineCall
    } = useContext(VideoChatContext)

    const [emojiContainer, setEmojiContainer] = useState(false)
    const emojiRef = useRef(null)
    const config = useMemo(() => ({
        headers: {
            "Content-type": "application/json",
            'Authorization': 'Bearer ' + userDetails.token,
        }
    }), [userDetails.token]);

    useEffect(() => {
        if (selectedChat) {
            fetchChat();
        }
    }, [selectedChat]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        socket = io(ENDPOINT);
        socket.emit('setupSocket', userDetails);
        socket.on('connected', () => {
            console.log("socket connected");
            setSocketConnection(true);
        });

        socket.on("typing", () => { setIsTyping(true); });
        socket.on("stop typing", () => { setIsTyping(false); });

        socket.on('messageReceived', (newMessageReceived) => {
            var newMessageId = newMessageReceived.chat._id;
            if (selectedChatCompare.current === newMessageId) {
                console.log("message received");
                setMessages((prevMessages) => [...prevMessages, newMessageReceived]);
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [userDetails]);

    function handleDelete() {
        if (!chatDetails || !chatDetails._id) return;
        axios.delete(`http://localhost:4000/api/chat/${chatDetails._id}`, config)
            .then((response) => {
                if (response.status === 200) {
                    setSelectedChat(null);
                    setUsersListUpdate(prev => !prev);
                }
            })
            .catch((err) => {
                console.log(err);
            });
    }

    function handleSendMessage() {
        if (newMessage.trim() === '' || !chatDetails || !chatDetails._id) return;
        socket.emit('stop typing', chatDetails._id);
        axios.post('http://localhost:4000/api/message', { content: newMessage, chatId: chatDetails._id }, config)
            .then((response) => {
                setMessages([...messages, response.data]);
                setNewMessage('');
                socket.emit('newMessage', response.data);
            })
            .catch((err) => {
                console.log(err);
            });
    }

    function handleInputChange(e) {
        setNewMessage(e.target.value);

        if (!socketConnection || !chatDetails || !chatDetails._id) return;

        if (!typing) {
            setTyping(true);
            socket.emit('typing', chatDetails._id);
        }

        let lastTypingTime = new Date().getTime();
        setTimeout(() => {
            var currentTime = new Date().getTime();
            if (currentTime - lastTypingTime >= 2000 && typing) {
                socket.emit('stop typing', chatDetails._id);
                setTyping(false);
            }
        }, 2000);
    }

    function fetchChat() {
        axios.get(`http://localhost:4000/api/chat/${selectedChat}`, config)
            .then((response) => {
                const chatData = response.data;
                // console.log(response.data)
                setChatDetails(chatData);
                if (chatData.isGroupChat) {
                    const otherGroupUsers = chatData.users.filter((user) => user._id !== userDetails._id);
                    // setIsAdmin(chatDetails.groupAdmins.include(userDetails._id))
                    // console.log(isAmdin)
                    setIsAdmin(chatData.groupAdmins.includes(userDetails._id))
                    setOtherUserDetails([otherGroupUsers]);
                } else {
                    const otherUser = chatData.users.find((user) => user._id !== userDetails._id);
                    setOtherUserDetails(otherUser);
                }
                // console.log(chatDetails.groupAdmins)

                selectedChatCompare.current = chatData._id;
            })
            .catch((err) => {
                console.log(err);
            });
    }

    useEffect(() => {
        setLoading(true);
        if (chatDetails && chatDetails._id) {
            axios.get(`http://localhost:4000/api/message/${chatDetails._id}`, config)
                .then((response) => {
                    setMessages(response.data);
                    socket.emit("join room", chatDetails._id);
                    setLoading(false);
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    }, [chatDetails, config]);

    function handleChatButtons() {
        console.log('cliced')
        setIsChatButtonsVisible(!isChatButtonsVisible)
    }

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsChatButtonsVisible(false);
            }
            if (emojiRef.current && !emojiRef.current.contains(event.target)) {
                setEmojiContainer(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };

    }, []);



    function handleEditDetails() {
        setChatWindowEditMode(!chatWindowEditMode)
    }

    function handleCancelEdit() {

    }
    function handleSaveEdit() {

    }

    function handleEmojiBtnClick() {
        setEmojiContainer(!emojiContainer)
    }

    function onEmojiClick(emojiData, event) {
        console.log(emojiData)
        const { emoji } = emojiData
        setNewMessage(prevMessages => prevMessages + emoji)
    }

    function handleVideoCallBtn() {
        setIsVideoChat(!isVideoChat)
        setCallRinging(true)
        call(otherUserDetails._id)
    }

    function handleAcceptCall() {
        setIsVideoChat(!isVideoChat)
        acceptIncomingCall()
    }

    return (
        <div className="chat-window">
            {selectedChat && chatDetails ? (
                chatWindowEditMode && chatDetails.isGroupChat ? (
                    <ChatWindowEditMode
                        handleCancelEdit={handleCancelEdit}
                        handleSaveEdit={handleSaveEdit}
                        chatDetails={chatDetails}
                        config={config}
                        setChatDetails={setChatDetails}
                        setIsEditMode={setChatWindowEditMode}
                        isEditMode={chatWindowEditMode}
                        isAdmin={isAdmin} />
                ) : isVideoChat ? (
                    <VideoChat
                        chatId={chatDetails._id}
                        otherUserDetails={otherUserDetails}
                        setIsVideoChat={setIsVideoChat}
                    />
                ) : (
                    <>
                        <div className="chat-header">
                            <div className="chat-header-info">
                                <img src={chatDetails.isGroupChat ? groupIconUrl : otherUserDetails.profilePhoto} alt="Profile" className="chat-header-image" />
                                <div className="chat-header-name">
                                    <h4>{chatDetails.isGroupChat ? chatDetails.chatName : otherUserDetails.name}</h4>
                                </div>
                            </div>
                            {chatDetails.isGroupChat ? (
                                <div className='header-menu'>
                                    <button className='chat-menu-btn' onClick={handleChatButtons}>
                                        <FontAwesomeIcon icon={faEllipsisVertical} />
                                    </button>
                                    {isChatButtonsVisible &&
                                        <div className={`chat-menu-btns-list`} ref={dropdownRef}>
                                            <button className='edit-group-details' onClick={handleEditDetails}>
                                                Edit Details
                                            </button>
                                            {/* <button className="delete-button" onClick={handleDelete} title="Delete">
                                                Delete Chat
                                            </button> */}
                                            <button className="leave-button" title="Leave">
                                                Leave Group
                                            </button>
                                        </div>
                                    }
                                </div>
                            ) : (
                                <div className='header-menu'>
                                    <button className='video-call-btn' onClick={handleVideoCallBtn}>
                                        <FontAwesomeIcon icon={faVideoCamera} />
                                    </button>
                                    <button className="delete-button" title="Delete" onClick={handleDelete}>
                                        <FontAwesomeIcon icon={faTrashAlt} />
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="chat-messages">
                            {(Array.isArray(messages) ? messages : []).map((message, i) => (
                                <div key={message._id} className={`message ${message.sender._id === userDetails._id ? 'current-user' : 'other-user'}`}>
                                    <img
                                        src={message.sender.profilePhoto}
                                        className={`sender-profile-photo-message ${message.sender._id === userDetails._id ? 'current-user-photo' : 'other-user-photo'} ${(i === messages.length - 1 || message.sender._id !== messages[i + 1]?.sender._id) ? 'profile' : 'no-profile'}`} />
                                    <div className={`message-container ${message.sender._id === userDetails._id ? 'current-user-message' : 'other-user-message'}`}>
                                        <p>{message.content}</p>
                                        <div>
                                            <span className='timestamp'>{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef}></div>
                        </div>
                        <div className="chat-input">
                            <div className='input-container'>
                                <div className='emoji-container'>
                                    <FontAwesomeIcon icon={faSmileBeam} className='emoji-btn' onClick={handleEmojiBtnClick} />
                                </div>
                                {emojiContainer && (
                                    <div className="emoji-picker" ref={emojiRef}>
                                        <EmojiPicker
                                            theme='dark'
                                            skinTonesDisabled={true}
                                            className='emojis'
                                            emojiStyle='google'
                                            height={320}
                                            width={'100%'}
                                            onEmojiClick={onEmojiClick}
                                        />
                                    </div>
                                )}
                                <input
                                    className='msg-input'
                                    type="text"
                                    placeholder="Type your message..."
                                    value={newMessage}
                                    onChange={handleInputChange}
                                    onKeyDown={(e) => {
                                        if (e.code === "Enter") {
                                            handleSendMessage();
                                        }
                                    }}
                                />
                            </div>
                            <button onClick={handleSendMessage} className='send-button'>
                                <FontAwesomeIcon icon={faArrowRight} />
                            </button>
                        </div>
                        {receivingCall && <div className='incoming-call-info'>
                            <p className='caller-name'>Chowdary Immanni</p>
                            <div className='incoming-call-buttons'>
                                <button className='answer-call-btn' onClick={handleAcceptCall}>
                                    <FontAwesomeIcon icon={faPhone} />
                                </button>
                                <button className='decline-call-btn' onClick={declineCall}>
                                    <FontAwesomeIcon icon={faPhoneSlash} />
                                </button>
                            </div>
                        </div>}
                    </>
                )
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

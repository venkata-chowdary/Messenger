    // get chat details GET - api/message/:id
    // useEffect(() => {
    //     setLoading(true)
    //     if (chatDetails._id) {
    //         axios.get(`http://localhost:4000/api/message/${chatDetails._id}`, config)
    //             .then((response) => {
    //                 setMessages(response.data);
    //                 socket.emit("join room", chatDetails._id)
    //                 setLoading(false)
    //             })
    //             .catch((err) => {
    //                 console.log(err);
    //             });
    //     }
    // }, [chatDetails, config]);

// function fetchMessages() {
    //     setLoading(true)
    //     if (chatDetails._id) {
    //         console.log(chatDetails)
    //         axios.get(`http://localhost:4000/api/message/${chatDetails._id}`, config)
    //             .then((response) => {
    //                 setMessages(response.data);
    //                 socket.emit("join room", chatDetails._id)
    //                 setLoading(false)
    //                 console.log(response.data)
    //             })
    //             .catch((err) => {
    //                 console.log(err);
    //             });
    //     }
    // }

    useEffect(() => {
        if (UserIdToselectedChat) {
            axios.post('http://localhost:4000/api/chat', { userId: UserIdToselectedChat }, config)
                .then((response) => {
                    const chatData = response.data;
                    const otherUser = chatData.users.find((user) => user._id !== userDetails._id);
                    setOtherUserDetails(otherUser);
                    // console.log(chatData)
                    selectedChatCompare.current = chatData._id
                    setChatDetails(chatData);
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    }, [UserIdToselectedChat]);



    {/* <div className="group-mem-list">
                    {chatDetails.users && chatDetails.users.map((user) => (
                        <div className="group-mem">
                            <div className="group-mem-profile">
                                <img src={user.profilePhoto} />
                            </div>
                            <div className="group-mem-details">
                                <h4>{user.name}</h4>
                                <p>{user.about}</p>
                            </div>

                            {chatDetails.groupAdmins.includes(user._id) ? <span className="admin">Admin</span> :
                                <div className="user-control-btns">
                                    <button className="remove-user-btn" onClick={() => handleRemoveUser(user._id)}>
                                        <FontAwesomeIcon icon={faUserMinus} />
                                    </button>
                                    <button className="make-admin-btn" onClick={() => handleMakeUserAdmin(user._id)}>
                                        <FontAwesomeIcon icon={faUserTie} />
                                    </button>
                                </div>
                            }
                        </div>
                    ))}
                </div> */}



                import '../styles/VideoChat.css';

                            {/* <h1>Your ID: {peerId}</h1> */}
            {/* <div>
                <input
                    type="text"
                    value={remotePeerIdValue}
                    onChange={(e) => setRemotePeerIdValue(e.target.value)}
                    placeholder="Enter remote peer ID"
                />
                <button onClick={() => call(remotePeerIdValue)}>Call</button>
            </div> */}
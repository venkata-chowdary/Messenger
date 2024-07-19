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

                            

                .current-user-container {
                    width: 80%;
                    height: 80%;
                    max-width: 700px;
                    max-height: 400px;
                    background-color: #444;
                    object-fit: cover;
                    overflow: hidden;
                    border-radius: 10px;
                }
                
                .current-user-container {
                    position: absolute;
                    bottom: 30px;
                    right: 30px;
                    max-width: 250px;
                    max-height: 150px;
                    border: 2px solid #007bff;
                    background-color: #000;
                }
                
                .remote-user-video{
                    max-width: 700px;
                    max-height: 400px;
                }
                /* 
                .current-user-video{
                    max-width: 250px;
                    max-height: 150px;
                } */
                
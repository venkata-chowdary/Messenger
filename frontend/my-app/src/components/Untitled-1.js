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
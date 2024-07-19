import React, { createContext, useState, useRef, useEffect, useContext } from 'react';
import Peer from 'peerjs';
import { UserContext } from './UserContext';

export const VideoChatContext = createContext();

export const VideoChatProvider = ({ children }) => {
    const [peerId, setPeerId] = useState('');
    const [remotePeerIdValue, setRemotePeerIdValue] = useState('');
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false)
    const [isVideoChat, setIsVideoChat] = useState(false);
    const { userDetails } = useContext(UserContext)
    const [acceptCall, setAccepetCall] = useState(false)
    const remoteVideoRef = useRef(null);
    const currentUserVideoRef = useRef(null);
    const peerInstance = useRef(null);
    const currentCall = useRef(null);


    const [callRinging, setCallRinging] = useState(false)
    const [receivingCall, setReceivingCall] = useState(false)

    useEffect(() => {
        const peer = new Peer(userDetails._id);

        peer.on('open', (id) => {
            setPeerId(id);
            console.log(peerId)
        });

        peer.on('call',(call)=>{
            setReceivingCall(true)

            currentCall.current = call;
        })

        peerInstance.current = peer;

        return () => {
            peer.disconnect();
            peer.destroy();
        };
    }, [userDetails._id]);

    function call(remotePeerId) {
        console.log(remotePeerId)
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then((mediaStream) => {
                currentUserVideoRef.current.srcObject = mediaStream;
                currentUserVideoRef.current.play().catch((error) => {
                    console.error('Error playing current user video:', error);
                });

                const call = peerInstance.current.call(remotePeerId, mediaStream);

                call.on('stream', (remoteStream) => {
                    remoteVideoRef.current.srcObject = remoteStream;
                    remoteVideoRef.current.play().catch((error) => {
                        console.error('Error playing remote video:', error);
                    });
                });

                currentCall.current = call;
            })
            .catch((error) => {
                console.error('Error calling remote peer:', error);
            });
    };

    function acceptIncomingCall() {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then((mediaStream) => {
                currentUserVideoRef.current.srcObject = mediaStream;
                currentUserVideoRef.current.play().catch((error) => {
                    console.error('Error playing current user video:', error);
                });
                currentCall.current.answer(mediaStream);
                currentCall.current.on('stream', (remoteStream) => {
                    remoteVideoRef.current.srcObject = remoteStream;
                    remoteVideoRef.current.play().catch((error) => {
                        console.error('Error playing remote video:', error);
                    });
                });
                setIsVideoChat(true);
                setReceivingCall(false);
            })
            .catch((error) => {
                console.error('Error getting user media:', error);
            });
    }

    function toggleMute() {
        // const mediaStream = currentUserVideoRef.current.srcObject;
        // mediaStream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
        // setIsMuted(!isMuted);
    };

    function leaveCall() {
        // currentCall.current.close();
        // currentUserVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
        // remoteVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
        // setRemotePeerIdValue('');
        setIsVideoChat(false)
    };

    function turnOffVideo() {
        //turnoff video logic
    }

    return (
        <VideoChatContext.Provider value={{
            isVideoChat,
            setIsVideoChat,
            call,
            leaveCall,
            toggleMute,
            turnOffVideo,
            leaveCall,
            peerId,
            setRemotePeerIdValue,
            remotePeerIdValue,
            currentUserVideoRef,
            remoteVideoRef,
            setCallRinging,
            setAccepetCall,
            receivingCall,
            acceptIncomingCall
        }}>
            {children}
        </VideoChatContext.Provider>
    );
};

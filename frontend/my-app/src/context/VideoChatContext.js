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
    const [acceptCall, setAcceptCall] = useState(false)
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

        peer.on('call', (call) => {
            setReceivingCall(true)
            currentCall.current = call;
            addCallEndListener(call);

        })

        peerInstance.current = peer;

        return () => {
            peer.disconnect();
            peer.destroy();
        };
    }, [userDetails._id]);

    function addCallEndListener(call) {
        call.on('close', leaveCall);
    }

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
                addCallEndListener(call);

            })
            .catch((error) => {
                console.error('Error calling remote peer:', error);
            });
    };

    function acceptIncomingCall() {
        setAcceptCall(true)
        setCallRinging(false)
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
                addCallEndListener(call);

            })
            .catch((error) => {
                console.error('Error getting user media:', error);
            });
    }

    function toggleMute() {
        const remoteStreamAudio = currentUserVideoRef.current.srcObject
        remoteStreamAudio.getAudioTracks().forEach((track) => {
            track.enabled = !track.enabled
        })
        setIsMuted(!isMuted)
    };

    function turnOffVideo() {
        const remoteStreamVideo = currentUserVideoRef.current.srcObject
        remoteStreamVideo.getVideoTracks().forEach((track) => {
            track.enabled = !track.enabled
        })
        setIsVideoOff(!isVideoOff)
    }

    function leaveCall() {
        if (currentCall.current) {
            currentCall.current.close();
        }
        if (currentUserVideoRef.current && currentUserVideoRef.current.srcObject) {
            currentUserVideoRef.current.srcObject.getTracks().forEach((track) => track.stop());
        }
        if (remoteVideoRef.current && remoteVideoRef.current.srcObject) {
            remoteVideoRef.current.srcObject.getTracks().forEach((track) => track.stop());
        }
        setRemotePeerIdValue('');
        setIsVideoChat(false);
        setCallRinging(false);
        setAcceptCall(false);
        setReceivingCall(false);

    };

    function declineCall() {
        if (currentCall.current) {
            currentCall.current.close();
        }

        setCallRinging(false);
        setReceivingCall(false);
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
        setAcceptCall,
        receivingCall,
        acceptIncomingCall,
        isMuted,
        turnOffVideo,
        isVideoOff,
        declineCall,
        callRinging
    }}>
        {children}
    </VideoChatContext.Provider>
);

}
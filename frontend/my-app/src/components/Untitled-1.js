import React, { createContext, useState, useRef, useEffect, useContext, useMemo } from 'react';
import Peer from 'peerjs';
import { UserContext } from './UserContext';

export const VideoChatContext = createContext();

export const VideoChatProvider = ({ children }) => {
    const [peerId, setPeerId] = useState('');
    const [remotePeerIdValue, setRemotePeerIdValue] = useState('');
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isVideoChat, setIsVideoChat] = useState(false);
    const { userDetails } = useContext(UserContext);
    const [acceptCall, setAcceptCall] = useState(false);
    const remoteVideoRef = useRef(null);
    const currentUserVideoRef = useRef(null);
    const peerInstance = useRef(null);
    const currentCall = useRef(null);

    const [callerId, setCallerId] = useState('');
    const [callerData, setCallerData] = useState({});
    
    const [callRinging, setCallRinging] = useState(false);
    const [receivingCall, setReceivingCall] = useState(false);
    const [incomingCall, setIncomingCall] = useState(false)

    const ringingSound = useRef(new Audio('/path-to-ringing-sound.mp3'));

    const config = useMemo(() => ({
        headers: {
            "Content-type": "application/json",
            'Authorization': 'Bearer ' + userDetails.token,
        }
    }), [userDetails.token]);

    useEffect(() => {
        const peer = new Peer(userDetails._id);
        peer.on('open', (id) => {
            setPeerId(id);
            setCallerId(id);
        });

        peer.on('call', (call) => {
            setReceivingCall(true);
            setCallerData(call.metadata);
            currentCall.current = call;
            addCallEndListener(call);
        });

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
        const callerDetails = {
            name: userDetails.name,
            id: userDetails._id,
            profilePhoto: userDetails.profilePhoto
        };
        setIsRinging(true);
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then((mediaStream) => {
                if (currentUserVideoRef.current) {
                    currentUserVideoRef.current.srcObject = mediaStream;
                    currentUserVideoRef.current.play().catch((error) => {
                        console.error('Error playing current user video:', error);
                    });
                }
                const call = peerInstance.current.call(remotePeerId, mediaStream, { metadata: callerDetails });
                call.on('stream', (remoteStream) => {
                    if (remoteVideoRef.current) {
                        remoteVideoRef.current.srcObject = remoteStream;
                        remoteVideoRef.current.play().catch((error) => {
                            console.error('Error playing remote video:', error);
                        });
                    }
                });
                currentCall.current = call;
                addCallEndListener(call);
            })
            .catch((error) => {
                console.error('Error calling remote peer:', error);
            });
    };

    function acceptIncomingCall() {
        setAcceptCall(true);
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then((mediaStream) => {
                if (currentUserVideoRef.current) {
                    currentUserVideoRef.current.srcObject = mediaStream;
                    currentUserVideoRef.current.play().catch((error) => {
                        console.error('Error playing current user video:', error);
                    });
                }
                currentCall.current.answer(mediaStream);
                currentCall.current.on('stream', (remoteStream) => {
                    if (remoteVideoRef.current) {
                        remoteVideoRef.current.srcObject = remoteStream;
                        remoteVideoRef.current.play().catch((error) => {
                            console.error('Error playing remote video:', error);
                        });
                    }
                });
                setIsVideoChat(true);
                setReceivingCall(false);
                addCallEndListener(currentCall.current);
            })
            .catch((error) => {
                console.error('Error getting user media:', error);
            });
    }

    function toggleMute() {
        const remoteStreamAudio = currentUserVideoRef.current?.srcObject;
        if (remoteStreamAudio) {
            remoteStreamAudio.getAudioTracks().forEach((track) => {
                track.enabled = !track.enabled;
            });
            setIsMuted(!isMuted);
        }
    };

    function turnOffVideo() {
        const remoteStreamVideo = currentUserVideoRef.current?.srcObject;
        if (remoteStreamVideo) {
            remoteStreamVideo.getVideoTracks().forEach((track) => {
                track.enabled = !track.enabled;
            });
            setIsVideoOff(!isVideoOff);
        }
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

        setIsVideoChat(false);
        setRemotePeerIdValue('');
        setIncomingCall(false)
        setCallRinging(false);
        setAcceptCall(false);
        setReceivingCall(false);
    };


    function declineCall() {
        if (currentCall.current) {
            currentCall.current.close();
        }
        ringingSound.current.pause();
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
            isVideoOff,
            declineCall,
            callRinging,
            callerId,
            callerData,
            incomingCall,
            setIncomingCall,
            acceptCall,
        }}>
            {children}
        </VideoChatContext.Provider>
    );
};

{isRinging ? (
    <div className='ringing-details'>
        <div className='ringing-details-container'>
            <div className='ringing-profile-outer'>
                <div className='ringing-profile'>
                    <img src={otherUserDetails.profilePhoto} className='ringing-profile-photo' alt="Profile" />
                </div>
            </div>
        </div>
        <p>Ringing....</p>
    </div>
) : (
}
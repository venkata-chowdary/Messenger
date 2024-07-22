import React, { createContext, useState, useRef, useEffect, useContext } from 'react';
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
    const [callEnded, setCallEnded] = useState(false);

    const [callerId, setCallerId] = useState('');
    const [callerData, setCallerData] = useState({});
    const [receivingCall, setReceivingCall] = useState(false);
    const [isRinging, setIsRinging] = useState(false);

    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);
    const [callDuration, setCallDuration] = useState({
        minutes: null,
        seconds: null
    });

    const dataConnection = useRef(null);

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

        peer.on('connection', (conn) => {
            dataConnection.current = conn;

            conn.on('data', (data) => {
                if (data.type === 'call-ended') {
                    const callDuration = data.duration;
                    const minutes = Math.floor(callDuration / 60);
                    const seconds =Math.floor(callDuration%60);
                    setCallDuration({ minutes, seconds });
                }
            });
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

        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then((mediaStream) => {
                if (currentUserVideoRef.current) {
                    currentUserVideoRef.current.srcObject = mediaStream;
                    currentUserVideoRef.current.play().catch((error) => {
                        console.error('Error playing current user video:', error);
                    });
                }
                const call = peerInstance.current.call(remotePeerId, mediaStream, { metadata: callerDetails });

                setIsRinging(true);

                call.on('stream', (remoteStream) => {
                    if (remoteVideoRef.current) {
                        remoteVideoRef.current.srcObject = remoteStream;
                        setIsRinging(false); // Stop ringing animation
                        remoteVideoRef.current.play().catch((error) => {
                            console.error('Error playing remote video:', error);
                        });
                    }
                });

                call.on('close', () => {
                    leaveCall();
                });

                const conn = peerInstance.current.connect(remotePeerId);
                conn.on('open', () => {
                    dataConnection.current = conn;
                });

                currentCall.current = call;
                addCallEndListener(call);
            })
            .catch((error) => {
                console.error('Error calling remote peer:', error);
            });
    }

    function acceptIncomingCall() {
        setAcceptCall(true);
        setStartTime(new Date());

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
    }

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

        setIsRinging(false);
        setIsVideoChat(false);
        setReceivingCall(false);

        if (startTime) {
            const endTime = new Date();
            calculateCallDuration(startTime, endTime);

            // Send call duration to remote user using PeerJS DataConnection
            const callDuration = (endTime - startTime) / 1000;
            if (dataConnection.current) {
                dataConnection.current.send({ type: 'call-ended', duration: callDuration });
            }
        }
        setCallEnded(true);
    }

    function calculateCallDuration(startTime, endTime) {
        const duration = (endTime - startTime) / 1000;
        const minutes = Math.floor(duration / 60);
        const seconds = Math.floor(duration % 60);
        setCallDuration({ minutes, seconds });
    }

    function closeCallEndedModal() {
        setCallEnded(false);
        setCallDuration({ minutes: null, seconds: null });
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
            setAcceptCall,
            receivingCall,
            acceptIncomingCall,
            isMuted,
            isVideoOff,
            callerId,
            callerData,
            acceptCall,
            isRinging,
            callEnded,
            closeCallEndedModal,
            callDuration
        }}>
            {children}
        </VideoChatContext.Provider>
    );
};

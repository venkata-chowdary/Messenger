import { useEffect, useRef, useState } from 'react';
import Peer from 'peerjs';
import '../styles/VideoChat.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVolumeXmark, faVolumeHigh, faPhoneFlip, faPhoneSlash, faCalendarXmark, faCameraAlt, faCamera, faCameraRetro, faVideoCamera } from '@fortawesome/free-solid-svg-icons';
function VideoChat() {
    const [peerId, setPeerId] = useState('');
    const [remotePeerIdValue, setRemotePeerIdValue] = useState('');
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff,setIsVideoOff]=useState(false)

    const remoteVideoRef = useRef(null);
    const currentUserVideoRef = useRef(null);
    const peerInstance = useRef(null);
    const currentCall = useRef(null);

    useEffect(() => {
        const peer = new Peer();

        peer.on('open', (id) => {
            setPeerId(id);
        });

        peer.on('call', (call) => {
            navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                .then((mediaStream) => {
                    currentUserVideoRef.current.srcObject = mediaStream;
                    currentUserVideoRef.current.play().catch((error) => {
                        console.error('Error playing current user video:', error);
                    });
                    call.answer(mediaStream);
                    call.on('stream', (remoteStream) => {
                        remoteVideoRef.current.srcObject = remoteStream;
                        remoteVideoRef.current.play().catch((error) => {
                            console.error('Error playing remote video:', error);
                        });
                    });
                    currentCall.current = call;
                })
                .catch((error) => {
                    console.error('Error getting user media:', error);
                });
        });

        peerInstance.current = peer;

        return () => {
            peer.disconnect();
            peer.destroy();
        };
    }, []);

    function call(remotePeerId) {
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
    };

    function turnOffVideo() {
        //turnoff video logic
    }

    return (
        <div className="video-chat-container">
            <div className="video-container">
                <video ref={currentUserVideoRef} className="current-user-video" autoPlay muted />
                <video ref={remoteVideoRef} className="remote-user-video" autoPlay />
            </div>
            <div className="bottom-bar">
                <div className="controls">
                    <button onClick={toggleMute} className={`control-button ${isMuted ? 'muted' : ''}`}>
                        {/* {isMuted ? 'Unmute' : 'Mute'} */}
                        {isMuted ?
                            <FontAwesomeIcon icon={faVolumeXmark} />
                            :
                            <FontAwesomeIcon icon={faVolumeHigh} />
                        }
                    </button>
                    <button className={`control-button ${true? `camera-slash`:null}`}>
                        <FontAwesomeIcon icon={faVideoCamera}/>
                    </button>
                    <button onClick={leaveCall} className="control-button leave">
                        <FontAwesomeIcon icon={faPhoneSlash}/>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default VideoChat;

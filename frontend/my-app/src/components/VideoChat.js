import { useContext, useEffect, useRef, useState } from 'react';
import Peer from 'peerjs';
import '../styles/VideoChat.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVolumeXmark, faVolumeHigh, faPhoneFlip, faPhoneSlash, faCalendarXmark, faCameraAlt, faCamera, faCameraRetro, faVideoCamera } from '@fortawesome/free-solid-svg-icons';
import { VideoChatContext } from '../context/VideoChatContext';


function VideoChat({ setIsVideoChat }) {

    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false)


    const { isVideoChat,
        remoteVideoRef,
        currentUserVideoRef,
        currentCall,
        call,
        remotePeerIdValue,
        setRemotePeerIdValue,
        leaveCall,
        peerId,
        acceptIncomingCall
    } = useContext(VideoChatContext)


    return (
        <div className="video-chat-container">
            {/* <div>
                <h1>{peerId}</h1>
                <input
                    type="text"
                    value={remotePeerIdValue}
                    onChange={(e) => setRemotePeerIdValue(e.target.value)}
                    placeholder="Enter remote peer ID"
                />
                <p>{remotePeerIdValue}</p>
                <button onClick={() => call(remotePeerIdValue)}>Call</button>
            </div> */}
            <div className="video-container">
                <div className='current-user-container'>
                    <video ref={currentUserVideoRef} className="current-user-video" autoPlay muted />
                </div>
                <div className='remote-user-container'>
                    <video ref={remoteVideoRef} className="remote-user-video" autoPlay />
                </div>
            </div>
            <div className="bottom-bar">
                <div className="controls">
                    <button className={`control-button ${isMuted ? 'muted' : ''}`}>
                        {isMuted ?
                            <FontAwesomeIcon icon={faVolumeXmark} />
                            :
                            <FontAwesomeIcon icon={faVolumeHigh} />
                        }
                    </button>
                    <button className={`control-button`}>
                        <FontAwesomeIcon icon={faVideoCamera} />
                    </button>
                    <button onClick={leaveCall} className="control-button leave">
                        <FontAwesomeIcon icon={faPhoneSlash} />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default VideoChat;

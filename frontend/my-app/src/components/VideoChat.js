import { useContext, useEffect, useRef, useState } from 'react';
import Peer from 'peerjs';
import '../styles/VideoChat.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVolumeXmark, faVolumeHigh, faPhoneFlip, faPhoneSlash, faCalendarXmark, faCameraAlt, faCamera, faCameraRetro, faVideoCamera, faVideoSlash } from '@fortawesome/free-solid-svg-icons';
import { VideoChatContext } from '../context/VideoChatContext';


function VideoChat({ otherUserDetails }) {

    // const [isMuted, setIsMuted] = useState(false);
    // const [isVideoOff, setIsVideoOff] = useState(false)


    const { isVideoChat,
        remoteVideoRef,
        currentUserVideoRef,
        currentCall,
        call,
        remotePeerIdValue,
        setRemotePeerIdValue,
        leaveCall,
        peerId,
        acceptIncomingCall,
        toggleMute,
        isMuted,
        turnOffVideo,
        isVideoOff,
        callRinging
    } = useContext(VideoChatContext)


    return (
        <div className="video-chat-container">

            <div className="video-container">
                <div className='current-user-container'>
                    <video ref={currentUserVideoRef} className="current-user-video" autoPlay muted />
                </div>
                <div className='remote-user-container'>
                    {true ?
                        <div className='ringing-details'>
                            <div className='ringing-details-container'>
                                <div className='ringing-profile-outer'>
                                    <div className='ringing-profile'>
                                        <img src={otherUserDetails.profilePhoto} className='ringing-profile-photo' />
                                    </div>
                                </div>
                            </div>
                            <p>Ringing....</p>
                        </div>
                        : <video ref={remoteVideoRef} className="remote-user-video" autoPlay />
                    }
                </div>
            </div>
            <div className="bottom-bar">
                <div className="controls">
                    <button className={`control-button ${isMuted ? 'muted' : ''}`} onClick={toggleMute}>
                        {isMuted ?
                            <FontAwesomeIcon icon={faVolumeXmark} />
                            :
                            <FontAwesomeIcon icon={faVolumeHigh} />
                        }
                    </button>
                    <button className={`control-button`} onClick={turnOffVideo}>
                        {isVideoOff ? <FontAwesomeIcon icon={faVideoSlash} />
                            :
                            <FontAwesomeIcon icon={faVideoCamera} />
                        }
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

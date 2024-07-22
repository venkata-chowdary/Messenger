import React, { useContext } from 'react';
import '../styles/VideoChat.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVolumeXmark, faVolumeHigh, faPhoneSlash, faVideoCamera, faVideoSlash } from '@fortawesome/free-solid-svg-icons';
import { VideoChatContext } from '../context/VideoChatContext';

function VideoChat({ otherUserDetails }) {
    const {
        remoteVideoRef,
        currentUserVideoRef,
        leaveCall,
        toggleMute,
        isMuted,
        turnOffVideo,
        isVideoOff,
        isRinging,
        isVideoChat
    } = useContext(VideoChatContext);


    return (
        <div className="video-chat-container">
            <div className="video-container">
                <div className='current-user-container'>
                    <video ref={currentUserVideoRef} className="current-user-video" autoPlay muted />
                </div>

                <div className='remote-user-container'>
                    <video ref={remoteVideoRef} className="remote-user-video" autoPlay />
                    {isRinging && 
                    <div className='ringing-details'>
                        <div className='ringing-details-container'>
                            <div className='ringing-profile-outer'>
                                <div className='ringing-profile'>
                                    <img src={otherUserDetails.profilePhoto} className='ringing-profile-photo' alt="Profile" />
                                </div>
                            </div>
                        </div>
                        <p>Ringing....</p>
                    </div>}
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
                        {isVideoOff ?
                            <FontAwesomeIcon icon={faVideoSlash} />
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


export default VideoChat
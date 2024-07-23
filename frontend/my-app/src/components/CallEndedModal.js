// CallEndedModal.js
import React from 'react';
import '../styles/CallEndedModel.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';


function CallEndedModal({ closeCallEndedModal, currentUserDetails, otherUserDetails, callDuration }) {

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="close-btn" onClick={closeCallEndedModal}>
                    <FontAwesomeIcon icon={faXmark} />
                </button>
                <h2>Call Ended</h2>
                <div className='call-ended-info'>
                    <div>
                        <img src={currentUserDetails.profilePhoto} />
                    </div>
                    <div>
                        <img src={otherUserDetails.profilePhoto} />
                    </div>
                </div>
                <p className='call-duration'>
                    {callDuration.minutes<10 ? '0' : ''}{callDuration.minutes} : {callDuration.seconds} sec{callDuration.seconds !== 1 ? 's' : ''}
                </p>
            </div>
        </div>
    );
};

export default CallEndedModal;

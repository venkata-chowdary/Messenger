import React from "react";
import img from '../assets/logo.png'
import { Link } from 'react-router-dom'
import '../styles/ConfirmMail.css'
function ConfirmMail() {

    return (
        <div className="email-confirmation">
            <div className="confirm-container">
                <img src={img} />
                <h1>Verify your email address</h1>
                <hr></hr>
                <div className="confirm-container-details">
                    <p>Thanks for singing up to <span>Messenger</span></p>
                    <p>We're happy to have you.</p>
                </div>
                <p>Confirmed? 
                <Link>
                    Sign in here
                </Link></p>
            </div>

        </div>
    )
}

export default ConfirmMail
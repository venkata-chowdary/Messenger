import React from 'react';
import '../styles/dummy.css';

const Dummy = () => {
    return (
        <div className="email-confirmation">
            <div className="confirm-container">
                <h1>Welcome to Our App!</h1>
                <hr />
                <p className='main-name'>Hello <span>Chowdary Immanni</span>,</p>
                <p>Thank you for registering with us.</p>
                <p> To complete your registration and activate your account, please confirm your email address by clicking the button below:</p>
                <a href='qwertyuio' className="confirm-button">Confirm Account</a>

                <div className="footer">
                    <p>Need assistance? <a href="mailto:support@yourapp.com">Contact Support</a></p>
                    <p>&copy; {new Date().getFullYear()} Our App. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
};

export default Dummy;

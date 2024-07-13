import React from 'react';
import '../styles/Auth.css'

const AuthPage = ({ children }) => {
    return (
        <div className="auth-page">
            <div className="auth-content">
                {children}
            </div>
        </div>
    );
}


export default AuthPage;

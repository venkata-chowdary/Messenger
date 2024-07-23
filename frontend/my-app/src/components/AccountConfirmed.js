// src/components/AccountConfirmed.js

import React from 'react';
import { Link } from 'react-router-dom';

const AccountConfirmed = () => {
    const styles = {
        container: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            backgroundColor: '#1a1a1a',
            color: '#fff',
            fontFamily: "'Lato', Arial, sans-serif",
        },
        innerContainer: {
            textAlign: 'center',
            padding: '40px 20px',
            maxWidth: '500px',
            backgroundColor: '#333',
            borderRadius: '8px',
            boxShadow: '0 0 20px rgba(0, 0, 0, 0.5)',
        },
        heading: {
            fontSize: '26px',
            margin: '20px 0',
        },
        paragraph: {
            margin: '10px 0',
            fontSize: '16px',
        },
        link: {
            color: '#007bff',
            transition: 'background-color 0.3s ease',
        },
    };

    return (
        <div style={styles.container}>
            <div style={styles.innerContainer}>
                <h1 style={styles.heading}>Account Confirmed!</h1>
                <p style={styles.paragraph}>Your account has been successfully confirmed.</p>
                <p style={styles.paragraph}>You can now <Link to="/login" style={styles.link} className="login-link">log in</Link> to your account.</p>
            </div>
        </div>
    );
};

export default AccountConfirmed;

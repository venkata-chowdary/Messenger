import React, { useContext, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import AuthPage from '../pages/AuthPage';
import '../styles/Auth.css';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { notification } from 'antd'; // Import notification from Ant Design

function Signup() {
    const [name, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [profilePic, setProfilePic] = useState();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { setUserDetails } = useContext(UserContext);
    const [passwordError, setPasswordError] = useState('');

    const postPhoto = (photo) => {
        setLoading(true);
        if (photo === undefined) {
            notification.error({
                message: 'Error',
                description: 'Please select an image',
            });
            setLoading(false);
            return;
        }

        if (photo.type === 'image/jpeg' || photo.type === 'image/png') {
            const data = new FormData();
            data.append('file', photo);
            data.append('upload_preset', 'chat_app');
            data.append('cloud_name', 'dxdfhiwlt');
            axios.post('https://api.cloudinary.com/v1_1/dxdfhiwlt/image/upload', data)
                .then((res) => res.data)
                .then((data) => {
                    setProfilePic(data.url.toString());
                    setLoading(false);
                })
                .catch((err) => {
                    notification.error({
                        message: 'Upload Failed',
                        description: 'Failed to upload profile picture. Please try again.',
                    });
                    setLoading(false);
                });
        } else {
            notification.error({
                message: 'Invalid File',
                description: 'Please select a valid image (JPEG or PNG).',
            });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!name || !email || !password || !confirmPassword) {
            notification.error({
                message: 'Error',
                description: 'Please fill in all fields',
            });
            return;
        } else if (password !== confirmPassword) {
            notification.error({
                message: 'Error',
                description: 'Passwords do not match',
            });
            return;
        }

        if (password.length < 6) {
            setPasswordError('Password must be at least 6 characters long.');
            return;
        }

        axios.post('http://localhost:4000/api/user', { name, password, email, profilePic }, { headers: { 'Content-Type': 'application/json' } })
            .then((response) => {
                const data = response.data.data;
                setUserDetails(data);
                localStorage.setItem('userInfo', JSON.stringify(data));
                notification.success({
                    message: 'Signup Successful',
                    description: 'You have successfully signed up! Redirecting to the homepage...',
                });
                navigate('/');
            })
            .catch((err) => {
                notification.error({
                    message: 'Signup Failed',
                    description: 'Failed to sign up. Please try again.',
                });
            });
    };

    return (
        <AuthPage>
            <div className="auth-form-container">
                <h2>Signup</h2>
                <form onSubmit={handleSubmit} className="auth-form">
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Username"
                        required
                    />
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        required
                    />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        required
                    />
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm Password"
                        required
                    />
                    <label htmlFor="file-upload" className="custom-file-upload">
                        Upload Profile Picture
                    </label>
                    <input
                        id="file-upload"
                        type="file"
                        onChange={(e) => postPhoto(e.target.files[0])}
                        accept="image/*"
                    />
                    {passwordError && (
                        <div className="error-message">
                            <FontAwesomeIcon icon={faCircleXmark} className="error-icon" />
                            <p>{passwordError}</p>
                        </div>
                    )}
                    {error && <p className="error">{error}</p>}
                    <button type="submit">
                        {loading ? 
                            <span className='profile-loader'></span> 
                            : <p>Signup</p>
                        }
                    </button>
                </form>
                <p>Already have an account? <Link to='/login'>Login</Link></p>
            </div>
        </AuthPage>
    );
}

export default Signup;

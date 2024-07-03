import React, { useContext, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom'
import AuthPage from '../pages/AuthPage';
import '../styles/Auth.css'
import axios from 'axios'
import { UserContext } from '../context/UserContext';

function Signup() {
    const [name, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [profilePic, setProfilePic] = useState()
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const { setUserDetails } = useContext(UserContext)

    const postPhoto = (photo) => {
        setLoading(true)
        if (photo === undefined) {
            console.log('please select an image')
            return
        }

        if (photo.type === 'image/jpeg' || photo.type === 'image/png') {
            const data = new FormData()
            data.append('file', photo)
            data.append('upload_preset', 'chat_app')
            data.append('cloud_name', 'dxdfhiwlt')
            axios.post('https://api.cloudinary.com/v1_1/dxdfhiwlt/image/upload', data)
                .then((res) => {return res.data})
                .then((data) => {
                    console.log(data)
                    setProfilePic(data.url.toString())
                    setLoading(false)
                })
                .catch((err) => {
                    console.log(err)
                })
        }
        else {
            console.log("Please select an image")
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!name || !email || !password || !confirmPassword) {
            setError('Please fill in all fields');
            console.log(error)
            return
        }
        else if (password !== confirmPassword) {
            setError('Passwords do not match');
            console.log(error)
            return;
        }

        console.log(profilePic)

        axios.post('http://localhost:4000/api/user',
            { name, password, email,profilePic },
            { headers: { 'Content-Type': 'application/json' } })
            .then((response) => {
                const data = response.data.data
                console.log(data)
                setUserDetails(data.data);
                localStorage.setItem('userInfo', JSON.stringify(data))
                navigate('/')
            })
            .catch((err) => {
                console.log(err)
            })

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
                    <input
                        type='file'
                        onChange={(e) => postPhoto(e.target.files[0])}
                        accept='image/*'
                    />
                    {error && <p className="error">{error}</p>}
                    {loading ? <p>Wait Photo iss uplaoding</p> : <button type="submit">Signup</button>}
                </form>
            </div>
        </AuthPage>
    );
}

export default Signup;

import React, { useContext, useState } from 'react';
import {Navigate, useNavigate} from 'react-router-dom'
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

    const navigate=useNavigate()
    const {setUserDetails}=useContext(UserContext)
    


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


        axios.post('http://localhost:4000/api/user',
            { name, password, email },
            {headers: {'Content-Type': 'application/json'}})
        .then((response)=>{
            const data=response.data.data
            console.log(data)
            setUserDetails(data.data);
            localStorage.setItem('userInfo',JSON.stringify(data))
            navigate('/')
        })
        .catch((err)=>{
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
                    {error && <p className="error">{error}</p>}
                    <button type="submit">Signup</button>
                </form>
            </div>
        </AuthPage>
    );
}

export default Signup;

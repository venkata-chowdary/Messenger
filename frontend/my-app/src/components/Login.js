import React, { useContext, useState } from 'react';
import AuthPage from '../pages/AuthPage';
import '../styles/Auth.css'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {UserContext} from '../context/UserContext'


function Login() {

    const {userDetails,setUserDetails}=useContext(UserContext)

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading,setLoading]=useState(false)

    const navigate=useNavigate()

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true)

        if (!email || !password) {
            setError('Please fill in all fields');
            setLoading(false)
            return
        }

        axios.post('http://localhost:4000/api/user/login',
            { password, email },
            { headers: { 'Content-Type': 'application/json' } })
        .then((response)=>{
            const data=response.data.data
            if(data){
                setUserDetails(data);
                localStorage.setItem('userInfo',JSON.stringify(data))
                setLoading(false)
                navigate('/')
            }
        })
        .catch((err)=>{
            // setError(err.response.data.message)
            setLoading(false)
        })
    };

    return (
        <AuthPage>
            <div className="auth-form-container">
                <h2>Login</h2>
                <form onSubmit={handleSubmit} className="auth-form">
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
                    <button type="submit">Login</button>
                </form>
            </div>
        </AuthPage>
    );
}

export default Login;

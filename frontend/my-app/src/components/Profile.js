import React, { useContext, useState } from 'react';
import { UserContext } from '../context/UserContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faPen, faCheck, faCamera, faCircleXmark, faCircleCheck, faXmarkCircle } from '@fortawesome/free-solid-svg-icons';
import axios from "axios";
import { Link } from 'react-router-dom';
import '../styles/Profile.css';

function Profile() {
    const { userDetails, setUserDetails } = useContext(UserContext);
    const [isEditingName, setIsEditingName] = useState(false);
    const [isEditingAbout, setIsEditingAbout] = useState(false);
    const [name, setName] = useState(userDetails.name);
    const [about, setAbout] = useState(userDetails.about ? userDetails.about : 'Available');
    const [loading, setLoading] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);
    const [profilePic, setProfilePic] = useState(userDetails.profilePhoto);
    const [passwordSectionActive, setPasswordSectionActive] = useState(false);
    const [passwordsMatch, setNewPasswordsMatch] = useState(false);
    const [passwordUpdated, setPasswordUpdated] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [otpVerified, setOtpVerified] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [otpInputs, setOtpInputs] = useState(['', '', '', '']);
    const [passwordError, setPasswordError] = useState('');

    const config = {
        headers: {
            "Content-type": "application/json",
            'Authorization': 'Bearer ' + userDetails.token,
        }
    };

    const handleNameEdit = () => {
        setIsEditingName(!isEditingName);
    };

    const handleAboutEdit = () => {
        setIsEditingAbout(!isEditingAbout);
    };

    const handleNameSave = () => {
        setIsEditingName(false);
        axios.put(`http://localhost:4000/api/user/update-username`, { newName: name }, config)
            .then((response) => {
                if (response.status === 200) {
                    setUserDetails((prevDetails) => ({ ...prevDetails, name: response.data.name }));
                }
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const handleAboutSave = () => {
        setIsEditingAbout(false);
        axios.put(`http://localhost:4000/api/user/update-about`, { newAbout: about }, config)
            .then((response) => {
                if (response.status === 200) {
                    setUserDetails((prevDetails) => ({ ...prevDetails, about: response.data.about }));
                }
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const postPhoto = (photo) => {
        if (photo === undefined) {
            console.log("please select an image");
            return;
        }

        if (photo.type === 'image/jpeg' || photo.type === 'image/png') {
            setLoading(true);
            const data = new FormData();
            data.append("file", photo);
            data.append("upload_preset", "chat_app");
            data.append("cloud_name", "dxdfhiwlt");
            axios.post('https://api.cloudinary.com/v1_1/dxdfhiwlt/image/upload', data)
                .then((res) => res.data)
                .then((data) => {
                    console.log(data.url);
                    setProfilePic(data.url.toString());
                    axios.put(`http://localhost:4000/api/user/update-profile-picture`, { newProfilePic: data.url.toString() }, config)
                        .then((response) => {
                            if (response.status === 200) {
                                console.log(response.data.profilePhoto);
                                setUserDetails((prevDetails) => ({ ...prevDetails, profilePhoto: response.data.profilePhoto }));
                            }
                        });
                    setLoading(false);
                });
        } else {
            console.log("please select an image");
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            postPhoto(file);
        }
    };

    const handleChangePassword = () => {
        setPasswordSectionActive(prev => !prev);
    };

    const handlePasswordCancel = () => {
        setPasswordSectionActive(prev => !prev);
        resetPasswordFields();
    };

    const resetPasswordFields = () => {
        setOldPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        setOtpVerified(false);
        setOtpSent(false);
        setOtpInputs(['', '', '', '']);
        setNewPasswordsMatch(false);
        setPasswordError('');
    };

    const handlePasswordSave = () => {

        if(newPassword=='' || confirmNewPassword=='' || oldPassword==''){
            setPasswordError('Enter Password')
            setSaveLoading(false)
            return
        }


        if (newPassword.length < 6) {
            setPasswordError('Password must be at least 6 characters long.');
            setSaveLoading(false);
            return;
        }

        if (newPassword !== confirmNewPassword) {
            setPasswordError('Passwords do not match.');
            setSaveLoading(false);
            return;
        }

        if (!otpVerified) {
            setPasswordError('Please verify the OTP before saving.');
            setSaveLoading(false);
            return;
        }



        setSaveLoading(true);
        axios.put(`http://localhost:4000/api/user/update-password`, { newPassword, oldPassword }, config)
            .then((res) => {
                console.log(res);
                if (res.status === 200) {
                    resetPasswordFields();
                    setPasswordUpdated(true);
                    setSaveLoading(false);
                    setTimeout(() => {
                        setPasswordUpdated(false);
                        setTimeout(() => setPasswordSectionActive(false), 1000)
                    }, 3000);


                }
            })
            .catch((err) => {
                console.log(err);
                setPasswordError('An error occurred while updating the password. Please try again.');
                setSaveLoading(false);
            });
    };

    const handleNewPassword = (e) => {
        setNewPassword(e.target.value);
        if ((e.target.value) === confirmNewPassword) {
            setNewPasswordsMatch(true);
            setPasswordError('');
        } else {
            setNewPasswordsMatch(false);
        }
    };

    const handleConfirmPassword = (e) => {
        setConfirmNewPassword(e.target.value);
        if (newPassword === e.target.value) {
            setNewPasswordsMatch(true);
            setPasswordError('');
        } else {
            setNewPasswordsMatch(false);
        }
    };

    const requestOtp = () => {
        axios.get(`http://localhost:4000/api/user/generate-otp`, config)
            .then((response) => {
                if (response.status === 201) {
                    setOtpSent(true);
                }
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const handleOtpInputChange = (index, value) => {
        const newOtpInputs = [...otpInputs];
        newOtpInputs[index] = value;
        setOtpInputs(newOtpInputs);
    };

    const verifyOtp = () => {
        const otpNumber = parseInt(otpInputs.join(''), 10);
        console.log(otpNumber);
        axios.post(`http://localhost:4000/api/user/verify-otp`, { otp: otpNumber }, config)
            .then((response) => {
                console.log(response);
                if (response.status === 200) {
                    setOtpVerified(true);
                    setPasswordError('');
                }
            })
            .catch((err) => {
                console.log(err);
                setPasswordError('Invalid OTP. Please try again.');
            });
    };

    return (
        <div className="profile-container">
            <div className="profile-header">
                {passwordSectionActive ? <h2>Change password</h2> :
                    <>
                        <Link to="/" className="back-button">
                            <FontAwesomeIcon icon={faArrowLeft} />
                        </Link>
                        <h2>Profile</h2>
                    </>
                }
            </div>
            {
                !passwordSectionActive ?
                    <div className='profile-details'>
                        <div className="profile-picture">
                            <img src={profilePic} alt="Profile" />
                            <div className="edit-icon">
                                <label htmlFor="profilePhoto">
                                    <FontAwesomeIcon icon={faCamera} style={{ fontSize: 14 }} />
                                </label>
                                <input type="file" name="profilePhoto" id="profilePhoto" accept="image/*" onChange={handleImageChange} />
                            </div>
                        </div>
                        <div className='profile-info'>
                            <div className='user-info'>
                                <span>Name</span>
                                {isEditingName ?
                                    <div className='edit-mode'>
                                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
                                        <button onClick={handleNameSave}><FontAwesomeIcon icon={faCheck} /></button>
                                    </div> :
                                    <div className='view-mode'>
                                        <p className='user-name'>{name}</p>
                                        <button onClick={handleNameEdit}><FontAwesomeIcon icon={faPen} /></button>
                                    </div>
                                }
                            </div>
                            <div className='user-info'>
                                <span>About</span>
                                {isEditingAbout ?
                                    <div className='edit-mode'>
                                        <input type="text" value={about} onChange={(e) => setAbout(e.target.value)} />
                                        <button onClick={handleAboutSave}><FontAwesomeIcon icon={faCheck} /></button>
                                    </div> :
                                    <div className='view-mode'>
                                        <p>{about}</p>
                                        <button onClick={handleAboutEdit}><FontAwesomeIcon icon={faPen} /></button>
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                    :
                    <div className='password-section'>
                        <div className='password-inputs'>
                            <input type="password" placeholder="old password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
                            <input type="password" placeholder="new password" value={newPassword} onChange={handleNewPassword} />
                            <input type="password" placeholder="confirm new password" value={confirmNewPassword} onChange={handleConfirmPassword} />
                            {otpSent ? (
                                !otpVerified ? (
                                    <div className='otp-container'>
                                        <div className="otp-input-container">
                                            {otpInputs.map((value, index) => (
                                                <input key={index} type="text" maxLength="1" className="otp-input" value={value} onChange={(e) => handleOtpInputChange(index, e.target.value)} />
                                            ))}
                                        </div>
                                        <button onClick={verifyOtp} className='verify-otp-btn'>Verify OTP</button>
                                    </div>
                                ) : (
                                    <span style={{ color: "#28a745" }}>
                                        <FontAwesomeIcon icon={faCircleCheck} />
                                        <p>OTP Verified.</p>
                                    </span>
                                )
                            ) : (
                                <button onClick={requestOtp} className='request-otp-btn'>Request OTP</button>
                            )}
                            {passwordError && (
                                <div className="error-message">
                                    <FontAwesomeIcon icon={faCircleXmark} className="error-icon" />
                                    <p>{passwordError}</p>
                                </div>
                            )}
                        </div>
                        {
                            (newPassword === confirmNewPassword && confirmNewPassword !== '') ? (
                                <span style={{ color: "#28a745" }}>
                                    <FontAwesomeIcon icon={faCircleCheck} />
                                    <p>Passwords match</p>
                                </span>
                            ) : (
                                confirmNewPassword && !passwordsMatch ? (
                                    <span>
                                        <FontAwesomeIcon icon={faXmarkCircle} />
                                        <p>Passwords do not match</p>
                                    </span>
                                ) : null
                            )
                        }
                    </div>
            }

            <div>
                {passwordSectionActive ?
                    <div className='password-handling-btns'>
                        <button onClick={handlePasswordSave}>
                            {saveLoading ? (
                                <span className='profile-loader'></span>
                            ) : passwordUpdated ? (
                                <FontAwesomeIcon icon={faCheck} />
                            ) : (
                                <p>Save</p>
                            )}
                        </button>
                        <button onClick={handlePasswordCancel}>Cancel</button>
                    </div>
                    :
                    <div className='password-handling-btns'>
                        <button className='change-password' onClick={handleChangePassword}>Reset Password</button>
                    </div>
                }
            </div>
        </div>
    );
}

export default Profile;

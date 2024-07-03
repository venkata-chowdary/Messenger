import React, { useContext, useState } from 'react';
import { UserContext } from '../context/UserContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faPen, faCheck, faCamera } from '@fortawesome/free-solid-svg-icons';
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
    const [profilePic, setProfilePic] = useState(userDetails.profilePhoto);

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
            .catch((err)=>{
                console.log(err);
            })
    };

    const handleAboutSave = () => {
        setIsEditingAbout(false);
        axios.put(`http://localhost:4000/api/user/update-about`, { newAbout: about }, config)
        .then((response)=>{
            if(response.status===200){
                setUserDetails((prevDetails)=>({ ...prevDetails, about: response.data.about }));
            }
        })
        .catch((err)=>{
            console.log(err)
        })
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
                    console.log(data.url)
                    setProfilePic(data.url.toString());
                    axios.put(`http://localhost:4000/api/user/update-profile-picture`, { newProfilePic:data.url.toString() }, config)
                        .then((response) => {
                            if (response.status === 200) {
                                console.log(response.data.profilePhoto)
                                setUserDetails((prevDetails) => ({ ...prevDetails, profilePhoto: response.data.profilePhoto }))
                            }
                        })
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

    return (
        <div className="profile-container">
            <div className="profile-header">
                <Link to="/" className="back-button">
                    <FontAwesomeIcon icon={faArrowLeft} />
                </Link>
                <h2>Profile</h2>
            </div>
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
        </div>
    );
}

export default Profile;

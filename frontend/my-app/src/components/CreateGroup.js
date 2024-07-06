import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserGroup } from '@fortawesome/free-solid-svg-icons';
import '../styles/CreateGroup.css'

function CreateGroup(){

    return (
        <div className="new-group">
            <button className="create-group-btn">
                <p>New Group</p>
                <FontAwesomeIcon icon={faUserGroup}/>
            </button>
        </div>
    )
}


export default CreateGroup
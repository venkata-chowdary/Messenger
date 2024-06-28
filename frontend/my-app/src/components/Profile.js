import { useContext } from "react"
import { UserContext } from "../context/UserContext"



function Profile(){

    const {userDetails}=useContext(UserContext)

    return <p>{userDetails.name}</p>
}


export default Profile
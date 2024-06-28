const { useContext } = require("react")
const { UserContext } = require("../context/UserContext")
const { Outlet, Navigate } = require("react-router-dom")

function ProtectedRoute(){
    const {userDetails}=useContext(UserContext)
    return userDetails ? <Outlet/> : <Navigate to='/login'/>
}

export default ProtectedRoute
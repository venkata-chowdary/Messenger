const jwt=require('jsonwebtoken')


function generateToken(id){
    return jwt.sign({id},'iamthesecret',{expiresIn:'30d'})
}


module.exports=generateToken
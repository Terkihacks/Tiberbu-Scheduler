const jwt = require('jsonwebtoken');
const blacklist = new Set();
const verifyToken = (req,res,next) =>{
    const authHeaders = req.headers['authorization'];
    const token = authHeaders && authHeaders.split(' ')[1] //Extract the token

    if(!token) return res.status(403).json({message:'Token required'});
    if (blacklist.has(token)) {
        return res.status(403).json({ message: 'Token has been invalidated' });
    }

    
    jwt.verify(token,process.env.SECRET_KEY,(err,user) =>{
        if(err) return res.status(403).json({message:'Invalid Token'});
        req.user = user
        next();
    });

};
module.exports = verifyToken;
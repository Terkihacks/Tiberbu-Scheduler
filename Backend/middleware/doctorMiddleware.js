const jwt = require('jsonwebtoken');

const verifyDoc = (req,res,next) =>{
    const authHeaders = req.headers['authorization'];
    const token = authHeaders && authHeaders.split(' ')[1];
    if(!token) return res.status(403).json({message: 'Token required'});
    jwt.verify(token,process.env.SECRET_KEY,(err,user) =>{
        if(err) return res.status(403).json({message:'Invalid Token'});
        req.user = user
        next();
    });

}

module.exports = verifyDoc;
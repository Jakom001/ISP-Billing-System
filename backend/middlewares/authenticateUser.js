const jwt = require('jsonwebtoken');
const Auth = require('../models/authModel');

const isAuthenticated = (req, res, next) => {
    try{
        const token = req.cookies.token;
       if (token){
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
       }else{
        console.log("Unauthorized access");
       return res.status(401).json({ success:false, message:  "Unauthorized acces"});
       }
       

        }catch (err){
            console.error("Error in authentication", err);
            res.clearCookie('token');
            res.status(500).json({ message: "Invalid or Expired Token", error: err.message });
        }
}

const checkUser = (req, res, next) => {
    const token = req.cookies.token;

    if (token){
        jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
            if (err) {
                res.locals.user = null;
                next();
            } else {
                let user = await Auth.findById(decodedToken.userId).select("-password");
                
                res.locals.user = user;
                next();
            }
        });
    }else{
        res.locals.user = null;
        next();
    }

}

module.exports = {isAuthenticated, checkUser};
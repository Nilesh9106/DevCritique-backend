const jwt = require("jsonwebtoken");
require("dotenv").config();
module.exports = async (request, response, next) => {
    try {
        //   get the token from the Authorization header
        // console.log(request.headers['authorization']);
        if (request.headers && request.headers['authorization']) {
            const decodedToken = await jwt.verify(request.headers['authorization'], process.env.JWT_SECRET);
            request.user = decodedToken._id;
            next();
        } else {
            response.status(401).json({
                message: "you are not authorized"
            })
        }
    } catch (error) {
        response.status(401).json({
            message: "you are not authorized!",
        });
    }
};
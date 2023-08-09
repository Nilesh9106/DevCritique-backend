const jwt = require("jsonwebtoken");

module.exports = async (request, response, next) => {
    try {
        //   get the token from the Authorization header
        // console.log(request.headers['authorization']);
        if (request.headers && request.headers['authorization']) {
            const decodedToken = await jwt.verify(request.headers['authorization'], "RANDOM-TOKEN");
            request.user = decodedToken.id;
            next();
        } else {
            response.status(401).json({
                err: "you are not authorized"
            })
        }
    } catch (error) {
        response.status(401).json({
            error: "you are not authorized!",
        });
    }
};
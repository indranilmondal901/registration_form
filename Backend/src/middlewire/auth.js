const jwt = require("jsonwebtoken");
const Register = require("../models/registerSchema");

const auth = async (req, res, next) => {
    try {
        const token = req.cookies.loginJwt;
        const verifyUser = jwt.verify(token, process.env.SECRET_KEY);
        console.log(verifyUser);

        const user = await Register.findOne({_id: verifyUser._id})
        console.log(`login by ${user.firstName} ${user.lastName}`);

        req.token = token;
        req.user = user;

        next();

    } catch (err) {
        res.status(401).send(err);
    }
}
module.exports = auth;
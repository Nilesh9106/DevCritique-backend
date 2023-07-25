const express = require("express");
const { User } = require("../models/model");
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const router = express.Router();

//api for which check token and return user token is provided in body

router.post("/checkToken", async (req, res) => {
    try {
        const token = req.body.token;
        let decoded = await jwt.verify(token, "RANDOM-TOKEN");
        const user = await User.findOne({ username: decoded.username })
        res.status(200).json({ status: true, message: "User Logged in Successfully", user, token });
    } catch (err) {
        return res.status(401).send({ status: false, message: err.message });
    }
});

router.post("/sign-up", async (req, res) => {
    try {
        // Extract email and password from the req.body object
        const { username, email, password } = req.body;

        // Check if the email is already in use
        let userExists = await User.findOne({ email: email });
        if (userExists) {
            res.status(401).json({ status: false, message: "Email is already in use." });
            return;
        }

        userExists = await User.findOne({ username: username });
        if (userExists) {
            res.status(401).json({ status: false, message: "Username is already in use." });
            return;
        }

        // Define salt rounds
        const saltRounds = 5;

        // Hash password
        bcrypt.hash(password, saltRounds, (err, hash) => {
            if (err) throw new Error("Internal Server Error");

            // Create a new user
            let user = new User({
                username: username,
                email: email,
                password: hash,
                uniqueString: randString() + username
            });

            // let emailStatus = sendMail(email, user.uniqueString);
            // Save user to database
            user.save().then(() => {
                res.json({ status: true, message: "User created successfully", user/*, emailStatus*/ });
            });
        });
    } catch (err) {
        return res.status(401).send({ status: false, message: err.message });
    }
});

router.post("/sign-in", async (req, res) => {
    try {
        // Extract email and password from the req.body object
        const { email, password } = req.body;

        // Check if user exists in database
        let user = await User.findOne({ $or: [{ email: email }, { username: email }] });
        if (!user) {
            return res.status(401).json({ status: false, message: "Account not Found!!" });
        }
        bcrypt.compare(password, user.password, (err, result) => {
            if (result) {
                const token = jwt.sign(
                    {
                        id: user._id,
                        username: user.username,
                        email: user.email,
                    },
                    "RANDOM-TOKEN",
                    { expiresIn: "30d" }
                );
                return res.status(200).json({ status: true, message: "User Logged in Successfully", user, token });
            }

            return res.status(401).json({ status: false, message: "Invalid Credentials" });
        });
    } catch (error) {
        return res.status(401).send({ status: false, message: err.message });
    }
});

const sendMail = (email, uniqueString) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_ID,
            pass: process.env.EMAIL_PASSWORD,
        },
    });
    var mailOptions = {
        from: "Dev Critique Verify Mail",
        to: email,
        subject: "Verify your email",
        html: `Please click on below link to verify your email
        <br><br>
        <a href=${process.env.API_LINK}/api/verify/${uniqueString}>Click here to verify</a>
        <br> Thanks for using our app`,
    };
    transporter.sendMail(mailOptions, function (error, responce) {
        if (error) {
            return error;
        } else {
            return "Email sent: " + responce.response;
        }
    });
};

const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function randString() {
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < 30; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

router.get("/verify/:uniqueString", async (req, res) => {
    try {
        const uniqueString = req.params.uniqueString;
        let user = await User.findOne({ uniqueString: uniqueString });
        if (!user) {
            res.status(401);
            res.write("<h1>Link Expired</h1>");
            res.end();
        }
        if (user.validated) {
            res.status(401);
            res.end("<h1>Email Already Verified</h1>");
        }
        else {
            user.validated = true;
            user.save();
            res.status(200);
            res.end("<h1>Email Verified</h1>");
        }
    } catch (error) {
        res.status(401);
        res.end("<h1>Link Unvalid</h1>");
    }
});

module.exports = router;
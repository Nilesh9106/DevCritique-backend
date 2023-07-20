const express = require("express");
const { User } = require("../models/model");
const bcrypt = require("bcrypt");

const router = express.Router();

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
            });

            // Save user to database
            user.save().then(() => {
                res.json({ status: true, message: "User created successfully", user });
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
                return res.status(200).json({ status: true, message: "User Logged in Successfully", user });
            }

            console.log(err);
            return res.status(401).json({ status: false, message: "Invalid Credentials" });
        });
    } catch (error) {
        return res.status(401).send({ status: false, message: err.message });
    }
});

module.exports = router;
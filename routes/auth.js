const express = require("express");
const { User } = require("../models/model");
const bcrypt = require("bcrypt");

const router = express.Router();

router.post("/sign-up", async (req, res) => {
    try {
        // Extract email and password from the req.body object
        const { email, password } = req.body;

        // Check if the email is already in use
        let userExists = await User.findOne({ email });

        if (userExists) {
            res.status(401).json({ message: "Email is already in use." });
            return;
        }

        // Define salt rounds
        const saltRounds = 5;

        // Hash password
        bcrypt.hash(password, saltRounds, (err, hash) => {
            if (err) throw new Error("Internal Server Error");

            // Create a new user
            let user = new User({
                email,
                password: hash,
            });

            // Save user to database
            user.save().then(() => {
                res.json({ message: "User created successfully", user });
            });
        });
    } catch (err) {
        return res.status(401).send(err.message);
    }
});

router.post("/sign-in", async (req, res) => {
    try {
        // Extract email and password from the req.body object
        const { email, password } = req.body;

        // Check if user exists in database
        let user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: "Invalid Credentials" });
        }

        // Compare passwords
        bcrypt.compare(password, user.password, (err, result) => {
            if (result) {
                return res.status(200).json({ message: "User Logged in Successfully" });
            }

            console.log(err);
            return res.status(401).json({ message: "Invalid Credentials" });
        });
    } catch (error) {
        res.status(401).send(err.message);
    }
});

module.exports = router;
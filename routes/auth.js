const express = require("express");
const { User } = require("../models/model");
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const router = express.Router();
var dotenv = require("dotenv")
dotenv.config()
//api for which check token and return user token is provided in body

router.post("/checkToken", async (req, res) => {
	try {
		const token = req.body.token;
		let decoded = await jwt.verify(token, process.env.JWT_SECRET);
		const user = await User.findOne({ _id: decoded._id }).select("-password -uniqueString -validated");
		res.status(200).json({ status: true, message: "User Logged in Successfully", user: user, token });
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
		bcrypt.hash(password, saltRounds, async (err, hash) => {
			if (err) throw new Error("Internal Server Error");

			// Create a new user
			let user = new User({
				username: username,
				email: email,
				password: hash,
				uniqueString: randString() + username
			});

			await sendMail(email, user.uniqueString);

			// Save user to database
			user.save().then(() => {
				res.json({ status: true, message: "User created successfully! please verify your email address", user });
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
		if (user.validated === false) {
			return res.status(401).json({ status: false, message: "Email not verified!!" });
		}
		bcrypt.compare(password, user.password, (err, result) => {
			if (result) {
				const token = jwt.sign({
					_id: user._id,
					username: user.username,
				},
					process.env.JWT_SECRET,
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

const sendMail = async (email, uniqueString) => {
	const transporter = nodemailer.createTransport({
		service: "gmail",
		auth: {
			user: process.env.EMAIL_ID,
			pass: process.env.EMAIL_PASSWORD,
		},
	});
	var mailOptions = {
		from: process.env.EMAIL_ID,
		to: email,
		subject: "Please Verify your email",
		text: 'Hello, this is email for your email verification',
		html: `
        <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f0f0f0;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    padding: 20px;
                }
                .content {
                    font-size: 16px;
                    line-height: 1.5;
                    color: #333333;
                }
                .button {
                    display: inline-block;
                    background-color: violet;
                    color: white;
                    border-radius:10px;
                    padding: 10px 20px;
                    text-decoration: none;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="content">
                    <h1>Welcome to Dev Critique!</h1>
                    <p>Thank you for signing up with us. To complete your registration, please verify your email address by clicking the button below.</p>
                    <p><a href=${process.env.API_LINK}api/verify/${uniqueString} class="button">Verify Email</a></p>
                    <p>If you did not sign up with us, please ignore this email.</p><br>
                    <p>If you found any trouble in verfication, try copy and paste below link in browser.</p>
                    <p>${process.env.API_LINK}api/verify/${uniqueString}</p>
                    <br>
                    <p>Feel free to contact us on our <a href="mailto:${process.env.EMAIL_ID}?subject=Feedback">email</a>
                     if you have any questions.</p>
                    <p>Best regards,</p>
                    <p>Dev Critique Team</p>
                </div>
            </div>
        </body>
        </html>
        `,
	};
	await new Promise((resolve, reject) => {
		transporter.sendMail(mailOptions, function (error, responce) {
			if (error) {
				console.log(error);
				reject(error);
			} else {
				resolve("Email sent: " + responce.response);
			}
		});
	});
};

router.get("/forgot-password/:email", async (req, res) => {
	try {
		const email = req.params.email;
		const uniqueString = randString() + Date.now();
		let user = await User.findOne({ email: email });
		if (!user) {
			return res.status(401).json({ message: "Account not Found!!" });
		}
		user.uniqueString = uniqueString;
		await user.save();
		await sendResetMail(email, uniqueString);
		return res.status(200).json({ message: "Email sent successfully!!" });
	} catch (error) {
		res.status(401).json({ message: error.message });
	}
});

router.get("/is-valid-link/:uniqueString", async (req, res) => {
	try {
		const uniqueString = req.params.uniqueString;
		if(30 > uniqueString.length){
			return res.status(401).json({ message: "Invalid Link!!" });
		}
		const date = uniqueString.slice(30);
		if (Date.now() - date > 3600000) {
			return res.status(401).json({ message: "Link Expired!!" });
		}
		let user = await User.findOne({ uniqueString: uniqueString });
		if (!user) {
			return res.status(401).json({ message: "Invalid Link!!" });
		}
		return res.status(200).json({ message: "Valid Link!!" });
	} catch (error) {
		res.status(401).json({ message: error.message });
	}
});

router.post("/reset-password", async (req, res) => {
	try {
		const { uniqueString, password } = req.body;
		if(30 > uniqueString.length){
			return res.status(401).json({ message: "Invalid Link!!" });
		}
		const date = uniqueString.slice(30);
		if (Date.now() - date > 3600000) {
			return res.status(401).json({ message: "Link Expired!!" });
		}
		let user = await User.findOne({ uniqueString: uniqueString });
		if (!user) {
			return res.status(401).json({ message: "Invalid Link!!" });
		}
		const saltRounds = 5;
		bcrypt.hash(password, saltRounds, async (err, hash) => {
			if (err) throw new Error("Internal Server Error");
			user.password = hash;
			user.validated = true;
			await user.save();
			return res.status(200).json({ message: "Password reset successfully!!" });
		});
	} catch (error) {
		res.status(401).json({ message: error.message });
	}
});

const sendResetMail = async (email, uniqueString) => {
	const transporter = nodemailer.createTransport({
		service: "gmail",
		auth: {
			user: process.env.EMAIL_ID,
			pass: process.env.EMAIL_PASSWORD,
		},
	});
	var mailOptions = {
		from: process.env.EMAIL_ID,
		to: email,
		subject: "Please Verify your email",
		text: 'Hello, this is email for your password reset',
		html: `
        <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f0f0f0;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    padding: 20px;
                }
                .content {
                    font-size: 16px;
                    line-height: 1.5;
                    color: #333333;
                }
                .button {
                    display: inline-block;
                    background-color: violet;
                    color: white;
                    border-radius:10px;
                    padding: 10px 20px;
                    text-decoration: none;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="content">
                    <h1>Hello Dev Critique User!</h1>
                    <p>Thank you for being with us. To complete your password reset, please follow by clicking the button below.</p>
                    <p><a href='https://devcritique.vercel.app/reset-password/${uniqueString}' class="button">Reset Password</a></p>
                    <p>If you did not made this request, please ignore this email.</p><br>
                    <p>If you found any trouble in reset, try copy and paste below link in browser.</p>
                    <p>https://devcritique.vercel.app/reset-password/${uniqueString}</p>
                    <br>
                    <p>Feel free to contact us on our <a href="mailto:${process.env.EMAIL_ID}?subject=Feedback">email</a>
                     if you have any questions.</p>
                    <p>Best regards,</p>
                    <p>Dev Critique Team</p>
                </div>
            </div>
        </body>
        </html>
        `,
	};
	await new Promise((resolve, reject) => {
		transporter.sendMail(mailOptions, function (error, responce) {
			if (error) {
				console.log(error);
				reject(error);
			} else {
				resolve("Email sent: " + responce.response);
			}
		});
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
			res.send("<h1>Invalid Link</h1>");
			return;
		}
		if (user.validated) {
			res.send("<h1>Email Already Verified</h1><br><a href='https://devcritique.vercel.app/login'>Login</a>");
		}
		else {
			user.validated = true;
			await user.save();
			res.send("<h1>Email Verified</h1><br><a href='https://devcritique.vercel.app/login'>Login</a>");
		}
	} catch (error) {
		res.send("<h1>Link invalid</h1>");
	}
});

module.exports = router;
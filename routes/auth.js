const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fetchUser = require("../middleware/fetchUser");

process.loadEnvFile("./.env.local");
const JWT_SECRET = process.env.JWT_SECRET;

// Route :1
// create a user: POST '/api/auth/signup'. Auth not required
router.post(
	"/signup",
	[
		body("email", "Invalid email").isEmail(),
		body(
			"username",
			"Username must be atleast 3 characters long."
		).isLength({ min: 3 }),
		body("password", "Password must be 5 characters long.").isLength({
			min: 5,
		}),
	],
	async (req, res) => {
		// Catch validation errors
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res
				.status(400)
				.json({ status: false, errors: errors.array() });
		}
		try {
			// check whether a existing user exists with same credentials.
			const userName = await User.findOne({
				username: req.body.username,
			});
			if (userName) {
				return res.status(400).json({
					status: false,
					error: "User already exists with this Username.",
				});
			}

			const userEmail = await User.findOne({ email: req.body.email });
			if (userEmail) {
				return res.status(400).json({
					status: false,
					error: "User already exists with this email.",
				});
			}

			// create a new user
			const salt = await bcrypt.genSalt(10);
			const securePass = await bcrypt.hash(req.body.password, salt);

			const user = await User.create({
				email: req.body.email,
				username: req.body.username,
				password: securePass,
			}).catch((err) => {
				res.status(400).json({ status: false, error: err.keyValue });
			});

			const data = {
				user: {
					id: user.id,
				},
			};

			const authToken = jwt.sign(data, JWT_SECRET);

			res.json({ status: true, authToken });
		} catch (error) {
			res.status(500).json({
				status: false,
				error: "Internal server error.",
			});
		}
	}
);

// Route :2
// authenticate a user: POST '/api/auth/signin'. Auth not required
router.post(
	"/signin",
	[
		body("email", "Invalid email").isEmail(),
		body("password", "Password cannot be blank.").exists(),
	],
	async (req, res) => {
		// Catch validation errors
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res
				.status(400)
				.json({ status: false, errors: errors.array() });
		}

		const { email, password } = req.body;

		try {
			const user = await User.findOne({ email });
			if (!user) {
				return res.status(400).json({
					status: false,
					error: "Try to sign-in with correct credentials.",
				});
			}

			const passCompare = await bcrypt.compare(password, user.password);

			if (!passCompare) {
				return res.status(400).json({
					status: false,
					error: "Try to sign-in with correct credentials.",
				});
			}

			const data = {
				user: {
					id: user.id,
				},
			};

			const authToken = jwt.sign(data, JWT_SECRET);

			res.json({ status: true, authToken });
		} catch (error) {
			res.status(500).json({
				status: false,
				error: "Internal server error.",
			});
		}
	}
);

// Route :3
// get a user: POST '/api/auth/getuser'. Auth required
router.post("/getuser", fetchUser, async (req, res) => {
	try {
		let userId = req.user.id;
		const user = await User.findById(userId).select("-password");
		if (user) {
			res.json({ status: true, user });
		} else {
			res.status(404).send({ status: false, error: "User not found" });
		}
	} catch (error) {
		res.status(500).json({
			status: false,
			error: "Internal server error.",
		});
	}
});
module.exports = router;

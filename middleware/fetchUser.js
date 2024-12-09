const jwt = require("jsonwebtoken");

process.loadEnvFile("./.env.local");
const JWT_SECRET = process.env.JWT_SECRET;

// get authToken and return id
const fetchUser = (req, res, next) => {
	const token = req.header("auth-token");
	if (!token) {
		res.status(401).send({ error: "Invalid authentication token." });
	}
	try {
		const data = jwt.verify(token, JWT_SECRET);
		req.user = data.user;

		next();
	} catch (error) {
		res.status(401).send({ error: "Invalid authentication token." });
	}
};

module.exports = fetchUser;

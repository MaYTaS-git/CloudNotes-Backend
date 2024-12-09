const ConnectToMongo = require("./database");
const express = require("express");
const cors = require("cors");
const app = express();
const port = 1111;

// connection to MongoDB
ConnectToMongo();

app.use(cors());
app.use(express.json());

// Available routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/storage", require("./routes/storage"));

app.listen(port, () => {
	console.log(`Access API @ http://localhost:${port}`);
});

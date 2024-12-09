const mongoose = require("mongoose");

const MongoURI = "mongodb://localhost:27017/cloudDB";

const ConnectToMongo = async () => {
	try {
		mongoose
			.connect(MongoURI)
			.then(console.info("Connection to MongoDB successful."))
			.catch((error) => {
				console.error(`Error in Connection: ${error.message}`);
			});
	} catch (error) {
		console.error(`Failed to connect: ${error.message}`);
	}
};

module.exports = ConnectToMongo;

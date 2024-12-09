const mongoose = require("mongoose");

const StorageSchema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "user",
	},
	title: {
		type: String,
		required: true,
	},

	description: {
		type: String,
		default: "Empty",
	},

	tag: {
		type: String,
		default: "Gen",
	},

	timestamp: {
		type: Date,
		default: Date.now,
	},
});

module.exports = mongoose.model("storage", StorageSchema);

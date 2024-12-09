const express = require("express");
const fetchUser = require("../middleware/fetchUser");
const router = express.Router();
const Storage = require("../models/Storage");
const { body, validationResult } = require("express-validator");

// Route :1
// get all storage vars: GET '/api/storage/fetchall'. Auth required
router.get("/fetchall", fetchUser, async (req, res) => {
	try {
		const storage = await Storage.find({ user: req.user.id });
		if (storage.length > 0) {
			res.json({ status: true, storageVar: storage });
		} else {
			res.json({ status: true, storageVar: [] });
		}
	} catch (error) {
		res.status(500).json({
			status: false,
			error: "Internal server error.",
		});
	}
});

// Route :2
// add storage var: POST '/api/storage/add'. Auth required
router.post(
	"/add",
	fetchUser,
	[
		body("title", "Enter a valid title.").isLength({ min: 3 }),
		body("description", "Enter a valid description.").isLength({
			min: 5,
		}),
	],
	async (req, res) => {
		try {
			// error check
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return res
					.status(400)
					.json({ status: false, errors: errors.array() });
			}

			const { title, description, tag } = req.body;

			const storageVar = await new Storage({
				user: req.user.id,
				title,
				description,
				tag,
			}).save();

			res.json({ status: true, storageVar });
		} catch (error) {
			res.status(500).json({
				status: false,
				error: "Internal server error.",
			});
		}
	}
);

// Route :3
// update storage var: PUT '/api/storage/update'. Auth required
router.put("/update/:id", fetchUser, async (req, res) => {
	try {
		let storage = await Storage.findById(req.params.id);
		if (!storage) {
			return res
				.status(404)
				.json({ status: false, error: "Storage not found." });
		}

		if (storage.user.toString() !== req.user.id) {
			return res.status(401).json({
				status: false,
				error: "Unauthorized access! Request denied.",
			});
		}

		const { title, description, tag } = req.body;
		let newStorage = {};

		if (title) {
			newStorage.title = title;
		}
		if (description) {
			newStorage.description = description;
		}
		if (tag) {
			newStorage.tag = tag;
		}

		storage = await Storage.findByIdAndUpdate(
			req.params.id,
			{ $set: newStorage },
			{ new: true }
		);

		res.json({ status: true, storage });
	} catch (error) {
		res.status(500).json({
			status: false,
			error: "Internal server error.",
		});
	}
});

// Route :4
// delete storage var: PUT '/api/storage/delete'. Auth required
router.delete("/delete/:id", fetchUser, async (req, res) => {
	try {
		let storage = await Storage.findById(req.params.id);
		if (!storage) {
			return res
				.status(404)
				.json({ status: false, error: "Storage not found." });
		}

		if (storage.user.toString() !== req.user.id) {
			return res.status(401).json({
				status: false,
				error: "Unauthorized access! Request denied.",
			});
		}

		storage = await Storage.findByIdAndDelete(req.params.id);

		res.json({ status: true, storage });
	} catch (error) {
		res.status(500).json({
			status: false,
			error: "Internal server error.",
		});
	}
});

module.exports = router;

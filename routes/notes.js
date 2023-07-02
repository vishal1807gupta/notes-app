const express = require("express");
const router = express.Router();
const Notes = require("../models/Notes").notes;
const deletednotes = require("../models/Notes").deletedNotes;
const fetchuser = require("../middleware/fetchuser");
const { body, validationResult } = require("express-validator");
const { deletedNotes } = require("../models/Notes");

// Get notes of user using GET - '/api/auth/getallnotes'

router.get("/fetchallnotes", fetchuser, async (req, res) => {
  const notes = await Notes.find({ user: req.user.id });
  res.json(notes);
});

router.get("/fetchalldeletednotes", fetchuser, async (req, res) => {
  const delnotes = await deletednotes.find({ user: req.user.id });
  res.json(delnotes);
});

// End point for add notes POST - 'auth/notes/addnotes'

router.post(
  "/addnote",
  fetchuser,
  [
    body("title", "Enter a valid title").isLength({ min: 5 }),
    body(
      "description",
      "Description must be at least of 5 characters"
    ).isLength({ min: 5 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, tag } = req.body;

    const note = new Notes({
      title,
      description,
      tag,
      user: req.user.id,
    });

    const savedNote = await note.save();

    res.json(savedNote);
  }
);


router.post(
  "/adddeletednote",
  fetchuser,
  [
    body("title", "Enter a valid title").isLength({ min: 5 }),
    body(
      "description",
      "Description must be at least of 5 characters"
    ).isLength({ min: 5 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, tag } = req.body;

    const delnote = new deletednotes({
      title,
      description,
      tag,
      user: req.user.id,
    });

    const savedNote = await delnote.save();

    res.json(savedNote);
  }
);

// Update an existing note using PUT - '/api/notes/updatenote/:id'

router.put("/updatenote/:id", fetchuser, async (req, res) => {
  const newNote = {};
  const { title, description, tag } = req.body;

  if (title) {
    newNote.title = title;
  }
  if (description) {
    newNote.description = description;
  }
  if (tag) {
    newNote.tag = tag;
  }

  try {
    let note = await Notes.findById(req.params.id);
    if (!note) {
      return res.status(404).send("Not Found");
    }
    if (note.user.toString() !== req.user.id) {
      res.status(401).send("Not Allowed");
    }

    note = await Notes.findByIdAndUpdate(
      req.params.id,
      { $set: newNote },
      { new: true }
    );
    res.json({ note });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error");
  }
});

// Delete an existing note using DELETE - 'api/notes/deletenote/id'
router.delete("/deletenote/:id", fetchuser, async (req, res) => {
  try {
    let note = await Notes.findById(req.params.id);
    if (!note) {
      return res.status(404).send("Not Found");
    }
    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not Allowed");
    }

    note = await Notes.findByIdAndDelete(req.params.id);
    res.json({ Success: "Note Deleted successfully", note: note });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error");
  }
});

router.delete("/delnote/:id", fetchuser, async (req, res) => {
  try {
    let note = await deletednotes.findById(req.params.id);
    if (!note) {
      return res.status(404).send("Not Found");
    }
    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not Allowed");
    }

    note = await deletednotes.findByIdAndDelete(req.params.id);
    res.json({ Success: "Note Deleted successfully", note: note });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error");
  }
});

module.exports = router;

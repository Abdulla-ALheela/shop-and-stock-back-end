const express = require('express');
const router = express.Router();
const List = require('../models/List');
const verifyToken = require('../middleware/verify-token');

// Create list (POST)
router.post("/", verifyToken, async (req, res) => {
  try {
    req.body.owner = req.user._id;
    const list = await List.create(req.body);
    list._doc.owner = req.user;
    res.status(201).json(list);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

// Get all lists (GET)
router.get("/", verifyToken, async (req, res) => {
  try {
    const lists = await List.find({}).populate("owner").sort({ createdAt: "ascending" });
    res.status(200).json(lists);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

//SHOW LIST
router.get('/:listId', verifyToken, async (req, res) => {
  try {
    const list = await List.findById(req.params.listId).populate("owner");
    res.status(200).json(list);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

//DELETE LIST
router.delete("/:listId", verifyToken, async (req, res) => {
  try {
    const list = await List.findById(req.params.listId);

    if (!list) {
      return res.status(403).send("List not found!");
    }

    const deletedList = await List.findByIdAndDelete(req.params.listId);
    res.status(200).json(deletedList);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

//update list
router.put('/:listId', verifyToken, async (req, res) => {
  try {
    // Find the list:
    const list = await List.findById(req.params.listId);

   
    if (!list.owner.equals(req.user._id)) {
      return res.status(403).send("You're not allowed to do that!");
    }

  
    const updatedList = await List.findByIdAndUpdate(
      req.params.listId,
      req.body,
      { new: true }
    );

    // Append req.user to the owner property:
    updatedList._doc.owner = req.user;

    // Issue JSON response:
    res.status(200).json(updatedList);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

// Add item to a list (POST)
router.post('/:listId/items',verifyToken,  async (req, res) => {
  try {
    req.body.owner = req.user._id;
    const list = await List.findById(req.params.listId);
    if (!list) {
      return res.status(404).json({ msg: 'List not found' });
    }
    if (!list.items) list.items = [];

    list.items.push(req.body);
    await list.save();

    // Find the newly added item:
    const newItem = list.items[list.items.length - 1];
    newItem._doc.owner = req.user;

    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});


// Edit item in a list (PUT)
router.put("/:listId/items/:itemId", verifyToken, async (req, res) => {
  try {
    // Find the list
    const list = await List.findById(req.params.listId);
    if (!list) {
      return res.status(404).json({ msg: "List not found" });
    }

    // Check if user is owner of the list?
    if (list.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ msg: "You're not allowed to edit items in this list!" });
    }

    // Find the item index to update
    const itemIndex = list.items.findIndex((item) => item._id.toString() === req.params.itemId);
    if (itemIndex === -1) {
      return res.status(404).json({ msg: "Item not found in the list" });
    }

    // Update the item using findOneAndUpdate
    const updatedList = await List.findOneAndUpdate(
      { _id: req.params.listId, "items._id": req.params.itemId },
      { $set: { "items.$": { ...list.items[itemIndex], ...req.body } } },
      { new: true }
    );

    // Retrieve the updated item and add user info to the item
    const updatedItem = updatedList.items.find((item) => item._id.toString() === req.params.itemId);
    updatedItem._doc.owner = req.user;

    res.status(200).json(updatedItem);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

// Delete item from a list (DELETE)
router.delete("/:listId/items/:itemId", verifyToken, async (req, res) => {
  try {
    const list = await List.findById(req.params.listId);
    if (!list) {
      return res.status(404).json({ msg: "List not found" });
    }

    // Check if the user is the owner of the list
    if (list.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ msg: "You are not authorized to delete items from this list" });
    }

    // Find and remove the item from the list
    const itemIndex = list.items.findIndex((item) => item._id.toString() === req.params.itemId);
    if (itemIndex === -1) {
      return res.status(404).json({ msg: "Item not found in the list" });
    }

    // Remove the item from the list
    list.items.splice(itemIndex, 1);
    await list.save();

    res.status(200).json({ msg: "Item deleted successfully" });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});




module.exports = router;

const express = require('express')
const router = express.Router()
const List = require('../models/List')
const verifyToken = require('../middleware/verify-token')


//Create list 
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


//get all lists
router.get("/", verifyToken, async (req, res) => {
    try {
      const lists = await List.find({}).populate("owner")
      res.status(200).json(lists);
    } catch (err) {
      res.status(500).json({ err: err.message });
    }
  });
  
// Add item to a list (POST)
router.post("/:listId/items", verifyToken, async (req, res) => {
  try {
    const list = await List.findById(req.params.listId);
    if (!list) {
      return res.status(404).json({ msg: "List not found" });
    }

    // Check if the user is the owner of the list
    if (list.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ msg: "You are not authorized to add items to this list" });
    }

    // Create new item and add it to the list
    const newItem = {
      name: req.body.name,
      quantity: req.body.quantity,
      unit: req.body.unit,
      isPurchased: req.body.isPurchased || false,
    };

    list.items.push(newItem);
    await list.save();

    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});


module.exports = router
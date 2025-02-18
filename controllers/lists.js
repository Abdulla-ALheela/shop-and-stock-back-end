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
router.get("/", verifyToken,async (req, res) => {
    try {
      const lists = await List.find({}).populate("owner")
      res.status(200).json(lists);
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
    newItem._doc.addedBy = req.user;

    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});


// GET list by ID (GET)
router.get("/:listId", verifyToken, async (req, res) => {
  try {
    const list = await List.findById(req.params.listId).populate('owner');
    if (!list) {
      return res.status(404).json({ msg: "List not found" });
    }
    res.status(200).json(list);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

 //Get an item from a list (GET)
router.get("/:listId/items/:itemId", verifyToken, async (req, res) => {
  try {
    const list = await List.findById(req.params.listId).populate('owner');
    if (!list) {
      return res.status(404).json({ msg: "List not found" });
    }

    const item = list.items.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({ msg: "Item not found" });
    }
    
    res.status(200).json(item);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

//lists.js

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

    
module.exports = router;

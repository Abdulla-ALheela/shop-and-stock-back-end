const express = require('express')
const router = express.Router()
const List = require('../models/List')
const verifyToken = require('../middleware/verify-token')

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
 
module.exports = router;
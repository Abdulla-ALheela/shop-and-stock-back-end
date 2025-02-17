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
  

module.exports = router
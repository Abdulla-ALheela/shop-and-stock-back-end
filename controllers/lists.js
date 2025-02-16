const express = require('express')
const router = express.Router()

const List = require('../models/List')
const verifyToken = require('../middleware/verify-token')


module.exports = router
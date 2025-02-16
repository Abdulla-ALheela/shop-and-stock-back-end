const mongoose = require('mongoose')

const itemSchema = new mongoose.Schema({
    name: {type: String, required: true},
    quantity: {type: Number, required: true},
    unit: {type: String, required: true},
    isPurchased: {type: Boolean},
})

const listSchema = new mongoose.Schema({
    title: {type: String},
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    items: [itemSchema],
    listType: {type: String, enum:["Inventory","Purchase list"],required: true},
});


const List = mongoose.model('List', listSchema)

module.exports = List
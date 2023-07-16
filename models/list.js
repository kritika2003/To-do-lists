const mongoose = require("mongoose");

const listSchema = new mongoose.Schema({
    dateOfList:{
        type: Date,
        default: Date.now
    },
    isCompleted: Boolean,
    name: String,
    items: [{
        id: Number,
        name: String
    }]
});

const List = mongoose.model("List", listSchema);

module.exports = List;
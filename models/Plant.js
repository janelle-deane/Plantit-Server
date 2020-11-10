const mongoose = require("mongoose")

const Schema = mongoose.Schema;

const PlantSchema = new Schema({
    name: {
        type: String,
        trim: true,
        unique: true,
        required: "What is the name of your plant?"
    },

    comments: [
        {
            type: Schema.Types.ObjectId,
            ref: "Comment"
        }
    ]
})
const Plant = mongoose.model("Plant", PlantSchema);

module.exports = Plant;
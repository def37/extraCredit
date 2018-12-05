// MongoDB model for a user
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: String,
    password: String,
    role: String,
    position: {
        lat: Number,
        lng: Number
    },
    destination: {
        lat: Number,
        lng: Number
    },
    vehicleType: String,
    vehiclePlate: String,
    isAvailable: Boolean,
    driver: { type: mongoose.Schema.ObjectId, ref: 'User' },
    rider: { type: mongoose.Schema.ObjectId, ref: 'User' },
    ratings: [Number],
    avgRating: Number,
})

var User = mongoose.model('User', userSchema);

module.exports = User;
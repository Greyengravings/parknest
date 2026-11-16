const mongoose = require('mongoose');

const parkingAreaSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  totalSlots: { type: Number, default: 0 },
  description: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('ParkingArea', parkingAreaSchema);

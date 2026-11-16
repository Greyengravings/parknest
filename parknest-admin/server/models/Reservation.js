const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  reservationId: { type: String, required: true, unique: true },
  slotId: { type: String, ref: 'ParkingSlot', required: true },
  userId: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  status: {
    type: String,
    enum: ['PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED'],
    default: 'PENDING'
  }
}, { timestamps: true });

module.exports = mongoose.model('Reservation', reservationSchema);

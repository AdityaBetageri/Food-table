const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema(
  {
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: true,
    },
    tableNumber: {
      type: Number,
      required: [true, 'Table number is required'],
    },
    capacity: {
      type: Number,
      default: 4,
    },
    qrCodeUrl: {
      type: String,
      default: '',
    },
    qrCodeData: {
      type: String, // Base64 QR image data
      default: '',
    },
    status: {
      type: String,
      enum: ['empty', 'active', 'awaiting_payment'],
      default: 'empty',
    },
  },
  { timestamps: true }
);

// Compound index: unique table number per hotel
tableSchema.index({ hotelId: 1, tableNumber: 1 }, { unique: true });

module.exports = mongoose.model('Table', tableSchema);

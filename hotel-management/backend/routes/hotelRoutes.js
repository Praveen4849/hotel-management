const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const hotelController = require('../controllers/hotelController');

// Routes for Hotel API
router.post('/', upload.single('image'), hotelController.createHotel);
router.get('/', hotelController.getHotels);
router.get('/:id', hotelController.getHotelById);
router.put('/:id', upload.single('image'), hotelController.updateHotel);
router.delete('/:id', hotelController.deleteHotel);

module.exports = router;

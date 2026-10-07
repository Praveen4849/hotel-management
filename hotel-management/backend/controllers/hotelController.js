const path = require('path');
const fs = require('fs');
const db = require('../db');

// Helper to remove a file from uploads folder safely
const deleteFileSafe = (relativePath) => {
  if (!relativePath) return;
  try {
    const fullPath = path.join(__dirname, '..', relativePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch (err) {
    console.warn(`[File Cleanup] Could not delete file ${relativePath}:`, err.message);
  }
};

// 1. Create a new Hotel (POST /api/hotels)
const createHotel = async (req, res) => {
  const { title, description, latitude, longitude, price } = req.body;
  const imageFile = req.file;

  // Validation
  if (!title || !title.trim()) {
    if (imageFile) deleteFileSafe(`uploads/${imageFile.filename}`);
    return res.status(400).json({ message: 'Hotel title is required.' });
  }

  if (!description || !description.trim()) {
    if (imageFile) deleteFileSafe(`uploads/${imageFile.filename}`);
    return res.status(400).json({ message: 'Hotel description is required.' });
  }

  const parsedPrice = parseFloat(price);
  if (isNaN(parsedPrice) || parsedPrice <= 0) {
    if (imageFile) deleteFileSafe(`uploads/${imageFile.filename}`);
    return res.status(400).json({ message: 'Price must be a valid positive number.' });
  }

  const parsedLat = parseFloat(latitude);
  if (isNaN(parsedLat) || parsedLat < -90 || parsedLat > 90) {
    if (imageFile) deleteFileSafe(`uploads/${imageFile.filename}`);
    return res.status(400).json({ message: 'Latitude must be a valid coordinate between -90 and 90.' });
  }

  const parsedLng = parseFloat(longitude);
  if (isNaN(parsedLng) || parsedLng < -180 || parsedLng > 180) {
    if (imageFile) deleteFileSafe(`uploads/${imageFile.filename}`);
    return res.status(400).json({ message: 'Longitude must be a valid coordinate between -180 and 180.' });
  }

  if (!imageFile) {
    return res.status(400).json({ message: 'Hotel image is required.' });
  }

  const imagePath = `uploads/${imageFile.filename}`;

  try {
    const queryText = `
      INSERT INTO hotels (image, title, description, latitude, longitude, price)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const values = [imagePath, title.trim(), description.trim(), parsedLat, parsedLng, parsedPrice];
    const result = await db.query(queryText, values);

    return res.status(201).json({
      message: 'Hotel created successfully',
      hotel: result.rows[0],
    });
  } catch (error) {
    console.error('Error creating hotel:', error);
    if (imageFile) deleteFileSafe(imagePath);
    return res.status(500).json({ message: 'Failed to create hotel due to a server error.' });
  }
};

// 2. Get Hotels with search, filter, and pagination (GET /api/hotels)
const getHotels = async (req, res) => {
  try {
    const { title, minPrice, maxPrice, offset = 0, limit = 6 } = req.query;

    const conditions = [];
    const params = [];

    // Search by title (case-insensitive)
    if (title && title.trim()) {
      params.push(`%${title.trim()}%`);
      conditions.push(`title ILIKE $${params.length}`);
    }

    // Min price filter
    if (minPrice !== undefined && minPrice !== '') {
      const min = parseFloat(minPrice);
      if (!isNaN(min)) {
        params.push(min);
        conditions.push(`price >= $${params.length}`);
      }
    }

    // Max price filter
    if (maxPrice !== undefined && maxPrice !== '') {
      const max = parseFloat(maxPrice);
      if (!isNaN(max)) {
        params.push(max);
        conditions.push(`price <= $${params.length}`);
      }
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Total count query
    const countQuery = `SELECT COUNT(*) AS total FROM hotels ${whereClause};`;
    const countResult = await db.query(countQuery, params);
    const totalCount = parseInt(countResult.rows[0]?.total || 0, 10);

    // Hotels query with pagination
    const parsedLimit = Math.max(1, parseInt(limit, 10) || 6);
    const parsedOffset = Math.max(0, parseInt(offset, 10) || 0);

    const queryParams = [...params, parsedLimit, parsedOffset];
    const limitIndex = params.length + 1;
    const offsetIndex = params.length + 2;

    const dataQuery = `
      SELECT * FROM hotels
      ${whereClause}
      ORDER BY id DESC
      LIMIT $${limitIndex} OFFSET $${offsetIndex};
    `;

    const dataResult = await db.query(dataQuery, queryParams);

    return res.status(200).json({
      hotels: dataResult.rows,
      total: totalCount,
      offset: parsedOffset,
      limit: parsedLimit,
    });
  } catch (error) {
    console.error('Error fetching hotels:', error);
    return res.status(500).json({ message: 'Failed to retrieve hotels due to a server error.' });
  }
};

// 3. Get Single Hotel by ID (GET /api/hotels/:id)
const getHotelById = async (req, res) => {
  const { id } = req.params;
  const hotelId = parseInt(id, 10);

  if (isNaN(hotelId)) {
    return res.status(400).json({ message: 'Invalid hotel ID.' });
  }

  try {
    const queryText = `SELECT * FROM hotels WHERE id = $1;`;
    const result = await db.query(queryText, [hotelId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Hotel not found.' });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching hotel details:', error);
    return res.status(500).json({ message: 'Failed to retrieve hotel details.' });
  }
};

// 4. Update Hotel (PUT /api/hotels/:id)
const updateHotel = async (req, res) => {
  const { id } = req.params;
  const hotelId = parseInt(id, 10);

  if (isNaN(hotelId)) {
    if (req.file) deleteFileSafe(`uploads/${req.file.filename}`);
    return res.status(400).json({ message: 'Invalid hotel ID.' });
  }

  const { title, description, latitude, longitude, price } = req.body;
  const imageFile = req.file;

  // Validation
  if (!title || !title.trim()) {
    if (imageFile) deleteFileSafe(`uploads/${imageFile.filename}`);
    return res.status(400).json({ message: 'Hotel title is required.' });
  }

  if (!description || !description.trim()) {
    if (imageFile) deleteFileSafe(`uploads/${imageFile.filename}`);
    return res.status(400).json({ message: 'Hotel description is required.' });
  }

  const parsedPrice = parseFloat(price);
  if (isNaN(parsedPrice) || parsedPrice <= 0) {
    if (imageFile) deleteFileSafe(`uploads/${imageFile.filename}`);
    return res.status(400).json({ message: 'Price must be a valid positive number.' });
  }

  const parsedLat = parseFloat(latitude);
  if (isNaN(parsedLat) || parsedLat < -90 || parsedLat > 90) {
    if (imageFile) deleteFileSafe(`uploads/${imageFile.filename}`);
    return res.status(400).json({ message: 'Latitude must be a valid coordinate between -90 and 90.' });
  }

  const parsedLng = parseFloat(longitude);
  if (isNaN(parsedLng) || parsedLng < -180 || parsedLng > 180) {
    if (imageFile) deleteFileSafe(`uploads/${imageFile.filename}`);
    return res.status(400).json({ message: 'Longitude must be a valid coordinate between -180 and 180.' });
  }

  try {
    // Check if hotel exists
    const checkQuery = `SELECT * FROM hotels WHERE id = $1;`;
    const checkResult = await db.query(checkQuery, [hotelId]);

    if (checkResult.rows.length === 0) {
      if (imageFile) deleteFileSafe(`uploads/${imageFile.filename}`);
      return res.status(404).json({ message: 'Hotel not found.' });
    }

    const existingHotel = checkResult.rows[0];
    let finalImagePath = existingHotel.image;

    // If new image was uploaded
    if (imageFile) {
      finalImagePath = `uploads/${imageFile.filename}`;
      // Remove old image file from server
      deleteFileSafe(existingHotel.image);
    }

    const updateQuery = `
      UPDATE hotels
      SET title = $1,
          description = $2,
          latitude = $3,
          longitude = $4,
          price = $5,
          image = $6,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *;
    `;

    const values = [
      title.trim(),
      description.trim(),
      parsedLat,
      parsedLng,
      parsedPrice,
      finalImagePath,
      hotelId,
    ];

    const result = await db.query(updateQuery, values);

    return res.status(200).json({
      message: 'Hotel updated successfully',
      hotel: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating hotel:', error);
    if (imageFile) deleteFileSafe(`uploads/${imageFile.filename}`);
    return res.status(500).json({ message: 'Failed to update hotel.' });
  }
};

// 5. Delete Hotel (DELETE /api/hotels/:id)
const deleteHotel = async (req, res) => {
  const { id } = req.params;
  const hotelId = parseInt(id, 10);

  if (isNaN(hotelId)) {
    return res.status(400).json({ message: 'Invalid hotel ID.' });
  }

  try {
    // Fetch hotel to get image path
    const selectQuery = `SELECT * FROM hotels WHERE id = $1;`;
    const selectResult = await db.query(selectQuery, [hotelId]);

    if (selectResult.rows.length === 0) {
      return res.status(404).json({ message: 'Hotel not found.' });
    }

    const hotel = selectResult.rows[0];

    // Delete from database
    const deleteQuery = `DELETE FROM hotels WHERE id = $1;`;
    await db.query(deleteQuery, [hotelId]);

    // Delete image from uploads folder
    deleteFileSafe(hotel.image);

    return res.status(200).json({
      message: 'Hotel deleted successfully',
      deletedId: hotelId,
    });
  } catch (error) {
    console.error('Error deleting hotel:', error);
    return res.status(500).json({ message: 'Failed to delete hotel.' });
  }
};

module.exports = {
  createHotel,
  getHotels,
  getHotelById,
  updateHotel,
  deleteHotel,
};

import React, { useState, useEffect } from 'react';
import { getImageUrl } from '../services/hotelApi';

const HotelForm = ({ initialData, onSubmit, isEdit = false, isSubmitting = false, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    latitude: '',
    longitude: '',
    price: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [errors, setErrors] = useState({});
  const [geoStatus, setGeoStatus] = useState('');

  // Populate data when editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        latitude: initialData.latitude !== undefined ? initialData.latitude.toString() : '',
        longitude: initialData.longitude !== undefined ? initialData.longitude.toString() : '',
        price: initialData.price !== undefined ? initialData.price.toString() : '',
      });

      if (initialData.image) {
        setImagePreview(getImageUrl(initialData.image));
      }
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for the field being changed
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        image: 'Image file size must be less than 5MB.',
      }));
      return;
    }

    // Validate type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        image: 'Only JPG, JPEG, PNG, WEBP, and GIF images are allowed.',
      }));
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setErrors((prev) => ({ ...prev, image: null }));
  };

  // Browser Geolocation Helper
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus('Geolocation is not supported by your browser.');
      return;
    }

    setGeoStatus('Fetching current coordinates...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6),
        }));
        setGeoStatus('Location coordinates captured!');
        setErrors((prev) => ({ ...prev, latitude: null, longitude: null }));
        setTimeout(() => setGeoStatus(''), 3000);
      },
      (error) => {
        setGeoStatus(`Could not get location: ${error.message}`);
      },
      { timeout: 10000 }
    );
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Hotel title is required.';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Hotel description is required.';
    }

    const priceNum = parseFloat(formData.price);
    if (!formData.price || isNaN(priceNum) || priceNum <= 0) {
      newErrors.price = 'Please enter a valid price greater than 0.';
    }

    const latNum = parseFloat(formData.latitude);
    if (formData.latitude === '' || isNaN(latNum) || latNum < -90 || latNum > 90) {
      newErrors.latitude = 'Please enter a valid latitude between -90 and 90.';
    }

    const lngNum = parseFloat(formData.longitude);
    if (formData.longitude === '' || isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
      newErrors.longitude = 'Please enter a valid longitude between -180 and 180.';
    }

    // Image required for new hotel
    if (!isEdit && !imageFile) {
      newErrors.image = 'Hotel image is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const data = new FormData();
    data.append('title', formData.title.trim());
    data.append('description', formData.description.trim());
    data.append('latitude', formData.latitude);
    data.append('longitude', formData.longitude);
    data.append('price', formData.price);

    if (imageFile) {
      data.append('image', imageFile);
    }

    onSubmit(data);
  };

  return (
    <form className="form-card" onSubmit={handleSubmit} noValidate>
      {/* Hotel Image Upload */}
      <div className="form-group">
        <label htmlFor="hotel-image-input">
          Hotel Image {!isEdit && <span className="required">*</span>}
        </label>
        
        <div className="image-upload-wrapper">
          <input
            type="file"
            id="hotel-image-input"
            className="form-control"
            accept="image/*"
            onChange={handleImageChange}
          />
          <div className="form-help-text">Max file size: 5MB. Formats: JPG, PNG, WEBP, GIF.</div>

          {/* Image Preview Box */}
          <div className="image-preview-box">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Selected preview of hotel"
                className="image-preview-img"
              />
            ) : (
              <div className="image-preview-placeholder">
                📷 No image selected.<br />Upload a photo to see preview.
              </div>
            )}
          </div>
          {errors.image && <span className="field-error">{errors.image}</span>}
        </div>
      </div>

      {/* Hotel Title */}
      <div className="form-group">
        <label htmlFor="hotel-title-input">
          Hotel Title <span className="required">*</span>
        </label>
        <input
          type="text"
          id="hotel-title-input"
          name="title"
          className="form-control"
          placeholder="e.g. Grand Palace Hotel"
          value={formData.title}
          onChange={handleChange}
        />
        {errors.title && <span className="field-error">{errors.title}</span>}
      </div>

      {/* Hotel Description */}
      <div className="form-group">
        <label htmlFor="hotel-desc-input">
          Description <span className="required">*</span>
        </label>
        <textarea
          id="hotel-desc-input"
          name="description"
          className="form-control"
          rows="4"
          placeholder="Provide a detailed description of the hotel amenities, rooms, and surroundings..."
          value={formData.description}
          onChange={handleChange}
        />
        {errors.description && <span className="field-error">{errors.description}</span>}
      </div>

      {/* Price per night */}
      <div className="form-group">
        <label htmlFor="hotel-price-input">
          Price per Night (₹) <span className="required">*</span>
        </label>
        <input
          type="number"
          id="hotel-price-input"
          name="price"
          className="form-control"
          placeholder="e.g. 3500"
          min="0"
          step="0.01"
          value={formData.price}
          onChange={handleChange}
        />
        {errors.price && <span className="field-error">{errors.price}</span>}
      </div>

      {/* Coordinates Row */}
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="hotel-lat-input">
            Latitude <span className="required">*</span>
          </label>
          <input
            type="number"
            id="hotel-lat-input"
            name="latitude"
            className="form-control"
            placeholder="e.g. 19.0760"
            step="any"
            value={formData.latitude}
            onChange={handleChange}
          />
          {errors.latitude && <span className="field-error">{errors.latitude}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="hotel-lng-input">
            Longitude <span className="required">*</span>
          </label>
          <input
            type="number"
            id="hotel-lng-input"
            name="longitude"
            className="form-control"
            placeholder="e.g. 72.8777"
            step="any"
            value={formData.longitude}
            onChange={handleChange}
          />
          {errors.longitude && <span className="field-error">{errors.longitude}</span>}
        </div>
      </div>

      {/* Geolocation Button */}
      <div className="form-group">
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={handleGetCurrentLocation}
          id="get-location-btn"
        >
          📍 Autofill with My Current Location
        </button>
        {geoStatus && <div className="form-help-text" style={{ color: '#2563eb' }}>{geoStatus}</div>}
      </div>

      {/* Form Action Buttons */}
      <div className="form-actions">
        {onCancel && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={isSubmitting}
            id="cancel-btn"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
          id="submit-hotel-btn"
        >
          {isSubmitting ? 'Saving...' : isEdit ? 'Update Hotel' : 'Add Hotel'}
        </button>
      </div>
    </form>
  );
};

export default HotelForm;

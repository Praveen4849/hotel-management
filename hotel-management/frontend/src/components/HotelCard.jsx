import React from 'react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../services/hotelApi';

const HotelCard = ({ hotel, onDeleteClick }) => {
  const imageUrl = getImageUrl(hotel.image);
  const formattedPrice = Number(hotel.price).toLocaleString('en-IN');

  return (
    <div className="hotel-card" id={`hotel-card-${hotel.id}`}>
      <div className="hotel-card-image-wrapper">
        <img
          src={imageUrl}
          alt={`Exterior view of ${hotel.title}`}
          className="hotel-card-image"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';
          }}
        />
      </div>

      <div className="hotel-card-body">
        <div className="hotel-card-header">
          <h3 className="hotel-card-title">{hotel.title}</h3>
          <div className="hotel-card-price">
            ₹{formattedPrice}
            <span className="price-unit"> /night</span>
          </div>
        </div>

        <p className="hotel-card-desc">{hotel.description}</p>

        <div className="hotel-card-location">
          <span>📍</span>
          <span>
            {hotel.latitude ? `${parseFloat(hotel.latitude).toFixed(4)}°, ${parseFloat(hotel.longitude).toFixed(4)}°` : 'Location available'}
          </span>
        </div>

        <div className="hotel-card-actions">
          <Link
            to={`/hotels/${hotel.id}`}
            className="btn btn-secondary btn-sm"
            id={`view-hotel-${hotel.id}`}
            title="View hotel details"
          >
            👁️ View
          </Link>
          <Link
            to={`/edit/${hotel.id}`}
            className="btn btn-secondary btn-sm"
            id={`edit-hotel-${hotel.id}`}
            title="Edit hotel details"
          >
            ✏️ Edit
          </Link>
          <button
            type="button"
            className="btn btn-danger btn-sm"
            id={`delete-hotel-${hotel.id}`}
            onClick={() => onDeleteClick(hotel)}
            title="Delete hotel"
          >
            🗑️ Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default HotelCard;

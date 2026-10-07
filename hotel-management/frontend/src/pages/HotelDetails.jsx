import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { fetchHotelById, clearSelectedHotel, clearMessages } from '../redux/hotelSlice';
import { getImageUrl } from '../services/hotelApi';
import Loading from '../components/Loading';

// Fix Leaflet's default icon path in bundler environments
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const HotelDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  const { selectedHotel: hotel, loading, error } = useSelector((state) => state.hotels);

  useEffect(() => {
    dispatch(clearMessages());
    dispatch(fetchHotelById(id));

    return () => {
      dispatch(clearSelectedHotel());
    };
  }, [dispatch, id]);

  const lat = hotel ? parseFloat(hotel.latitude) : 0;
  const lng = hotel ? parseFloat(hotel.longitude) : 0;
  const isValidLocation = !isNaN(lat) && !isNaN(lng) && (lat !== 0 || lng !== 0);

  return (
    <div className="hotel-details-page">
      <Helmet>
        <title>{hotel ? `${hotel.title} - Hotel Details` : 'Hotel Details - Hotel Management'}</title>
        <meta
          name="description"
          content={hotel ? `${hotel.description.slice(0, 150)}...` : 'View hotel amenities, location, and rates.'}
        />
      </Helmet>

      {/* Back button and page nav */}
      <div className="page-header">
        <Link to="/" className="btn btn-secondary">
          ← Back to Hotel List
        </Link>

        {hotel && (
          <Link to={`/edit/${hotel.id}`} className="btn btn-primary" id="details-edit-btn">
            ✏️ Edit Hotel
          </Link>
        )}
      </div>

      {loading && !hotel ? (
        <Loading message="Loading hotel details..." />
      ) : error ? (
        <div className="empty-state">
          <div className="empty-state-icon">❌</div>
          <h3>Error Loading Hotel</h3>
          <p>{error}</p>
          <Link to="/" className="btn btn-primary">
            Back to Directory
          </Link>
        </div>
      ) : hotel ? (
        <div className="details-container">
          {/* Full Hotel Image */}
          <div className="details-hero-image-wrapper">
            <img
              src={getImageUrl(hotel.image)}
              alt={`Full presentation image of ${hotel.title}`}
              className="details-hero-image"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80';
              }}
            />
          </div>

          <div className="details-content">
            {/* Header / Title and Price */}
            <div className="details-header">
              <div>
                <h1 className="details-title">{hotel.title}</h1>
                <p className="page-subtitle">
                  Added on {new Date(hotel.created_at || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>

              <div className="details-price-badge">
                ₹{Number(hotel.price).toLocaleString('en-IN')}
                <span style={{ fontSize: '0.9rem', fontWeight: 400, color: 'var(--text-muted)' }}> / night</span>
              </div>
            </div>

            {/* Description */}
            <h3 className="details-section-title">About this Hotel</h3>
            <p className="details-description">{hotel.description}</p>

            {/* Metadata Grid */}
            <div className="details-meta-grid">
              <div className="meta-item">
                <div className="meta-item-label">Latitude</div>
                <div className="meta-item-value">{lat ? lat.toFixed(6) : 'N/A'}°</div>
              </div>
              <div className="meta-item">
                <div className="meta-item-label">Longitude</div>
                <div className="meta-item-value">{lng ? lng.toFixed(6) : 'N/A'}°</div>
              </div>
              <div className="meta-item">
                <div className="meta-item-label">Price per Night</div>
                <div className="meta-item-value">₹{Number(hotel.price).toLocaleString('en-IN')}</div>
              </div>
              <div className="meta-item">
                <div className="meta-item-label">Last Updated</div>
                <div className="meta-item-value">
                  {new Date(hotel.updated_at || hotel.created_at || Date.now()).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Location Map */}
            <h3 className="details-section-title">📍 Location Map</h3>
            {isValidLocation ? (
              <div className="map-container">
                <MapContainer
                  center={[lat, lng]}
                  zoom={13}
                  scrollWheelZoom={false}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[lat, lng]}>
                    <Popup>
                      <strong>{hotel.title}</strong><br />
                      ₹{Number(hotel.price).toLocaleString('en-IN')}/night
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
            ) : (
              <div className="empty-state" style={{ padding: '24px' }}>
                <p>Location coordinates are not specified for this hotel.</p>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default HotelDetails;

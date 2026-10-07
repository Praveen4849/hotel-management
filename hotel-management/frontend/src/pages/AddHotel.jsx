import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { createNewHotel, clearMessages } from '../redux/hotelSlice';
import HotelForm from '../components/HotelForm';

const AddHotel = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.hotels);

  useEffect(() => {
    dispatch(clearMessages());
  }, [dispatch]);

  const handleFormSubmit = async (formData) => {
    const result = await dispatch(createNewHotel(formData));
    if (!result.error) {
      navigate('/');
    }
  };

  return (
    <div className="add-hotel-page">
      <Helmet>
        <title>Add Hotel - Hotel Management</title>
        <meta
          name="description"
          content="Create and register a new hotel listing with image, location coordinates, and pricing."
        />
      </Helmet>

      <div className="page-header">
        <div>
          <h1 className="page-title">Add New Hotel</h1>
          <p className="page-subtitle">
            Fill out the details below to add a new hotel listing to the PostgreSQL database.
          </p>
        </div>
        <Link to="/" className="btn btn-secondary">
          ← Back to List
        </Link>
      </div>

      {error && (
        <div className="alert-box alert-error" role="alert">
          <span>❌ {error}</span>
          <button
            type="button"
            className="alert-close"
            onClick={() => dispatch(clearMessages())}
            aria-label="Close error"
          >
            ×
          </button>
        </div>
      )}

      <HotelForm
        onSubmit={handleFormSubmit}
        isEdit={false}
        isSubmitting={loading}
        onCancel={() => navigate('/')}
      />
    </div>
  );
};

export default AddHotel;

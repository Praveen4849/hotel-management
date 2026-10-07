import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import {
  fetchHotelById,
  updateExistingHotel,
  clearMessages,
  clearSelectedHotel,
} from '../redux/hotelSlice';
import HotelForm from '../components/HotelForm';
import Loading from '../components/Loading';

const EditHotel = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { selectedHotel, loading, error } = useSelector((state) => state.hotels);

  useEffect(() => {
    dispatch(clearMessages());
    dispatch(fetchHotelById(id));

    return () => {
      dispatch(clearSelectedHotel());
    };
  }, [dispatch, id]);

  const handleFormSubmit = async (formData) => {
    const result = await dispatch(updateExistingHotel({ id, formData }));
    if (!result.error) {
      navigate('/');
    }
  };

  return (
    <div className="edit-hotel-page">
      <Helmet>
        <title>
          {selectedHotel ? `Edit ${selectedHotel.title} - Hotel Management` : 'Edit Hotel - Hotel Management'}
        </title>
        <meta name="description" content="Update hotel pricing, image, details, or location coordinates." />
      </Helmet>

      <div className="page-header">
        <div>
          <h1 className="page-title">Edit Hotel</h1>
          <p className="page-subtitle">
            Update information for {selectedHotel ? `"${selectedHotel.title}"` : 'the selected hotel'}.
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

      {loading && !selectedHotel ? (
        <Loading message="Loading hotel details for editing..." />
      ) : selectedHotel ? (
        <HotelForm
          initialData={selectedHotel}
          onSubmit={handleFormSubmit}
          isEdit={true}
          isSubmitting={loading}
          onCancel={() => navigate('/')}
        />
      ) : (
        <div className="empty-state">
          <h3>Hotel Not Found</h3>
          <p>The hotel you are trying to edit could not be found or has been removed.</p>
          <Link to="/" className="btn btn-primary">
            Return to Hotel List
          </Link>
        </div>
      )}
    </div>
  );
};

export default EditHotel;

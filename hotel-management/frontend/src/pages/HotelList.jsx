import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  fetchHotels,
  removeHotel,
  setOffset,
  clearMessages,
} from '../redux/hotelSlice';
import SearchBar from '../components/SearchBar';
import PriceFilter from '../components/PriceFilter';
import HotelCard from '../components/HotelCard';
import Pagination from '../components/Pagination';
import DeletePopup from '../components/DeletePopup';
import Loading from '../components/Loading';

const HotelList = () => {
  const dispatch = useDispatch();
  const {
    hotels,
    loading,
    error,
    successMessage,
    pagination,
  } = useSelector((state) => state.hotels);

  const [hotelToDelete, setHotelToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch hotels on initial mount or when offset changes
  useEffect(() => {
    dispatch(fetchHotels());
  }, [dispatch, pagination.offset]);

  // Handle page change
  const handlePageChange = (newOffset) => {
    dispatch(setOffset(newOffset));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open delete popup
  const handleDeleteClick = (hotel) => {
    setHotelToDelete(hotel);
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!hotelToDelete) return;
    setIsDeleting(true);
    const result = await dispatch(removeHotel(hotelToDelete.id));
    setIsDeleting(false);
    setHotelToDelete(null);

    if (!result.error) {
      // Refresh hotel list from backend
      dispatch(fetchHotels());
    }
  };

  return (
    <div className="hotel-list-page">
      <Helmet>
        <title>Hotel List - Hotel Management</title>
        <meta
          name="description"
          content="Browse, search, and manage hotels with real-time pricing and coordinates."
        />
      </Helmet>

      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Hotel Directory</h1>
          <p className="page-subtitle">
            Explore available accommodations, filter by price, and manage hotel records.
          </p>
        </div>
        <Link to="/add" className="btn btn-primary" id="page-add-hotel-btn">
          + Add Hotel
        </Link>
      </div>

      {/* Feedback Alerts */}
      {successMessage && (
        <div className="alert-box alert-success" role="alert">
          <span>✅ {successMessage}</span>
          <button
            type="button"
            className="alert-close"
            onClick={() => dispatch(clearMessages())}
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
      )}

      {error && (
        <div className="alert-box alert-error" role="alert">
          <span>❌ {error}</span>
          <button
            type="button"
            className="alert-close"
            onClick={() => dispatch(clearMessages())}
            aria-label="Close error message"
          >
            ×
          </button>
        </div>
      )}

      {/* Search and Price Filter Controls */}
      <div className="filter-bar-container">
        <SearchBar />
        <PriceFilter />
      </div>

      {/* Content Section */}
      {loading ? (
        <Loading message="Fetching hotels from database..." />
      ) : hotels.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🏨</div>
          <h3>No Hotels Found</h3>
          <p>
            No hotels match your current search and filter criteria. Try adjusting your
            price range, changing your search terms, or adding a new hotel.
          </p>
          <Link to="/add" className="btn btn-primary">
            + Add New Hotel
          </Link>
        </div>
      ) : (
        <>
          <div className="hotel-grid">
            {hotels.map((hotel) => (
              <HotelCard
                key={hotel.id}
                hotel={hotel}
                onDeleteClick={handleDeleteClick}
              />
            ))}
          </div>

          <Pagination
            total={pagination.total}
            limit={pagination.limit}
            offset={pagination.offset}
            onPageChange={handlePageChange}
          />
        </>
      )}

      {/* Delete Confirmation Popup */}
      <DeletePopup
        isOpen={Boolean(hotelToDelete)}
        hotelTitle={hotelToDelete?.title}
        onConfirm={handleConfirmDelete}
        onCancel={() => setHotelToDelete(null)}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default HotelList;

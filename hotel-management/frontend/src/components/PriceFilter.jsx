import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setMinPrice, setMaxPrice, setOffset, fetchHotels, resetFilters } from '../redux/hotelSlice';

const PriceFilter = () => {
  const dispatch = useDispatch();
  const { minPrice: storedMin, maxPrice: storedMax } = useSelector((state) => state.hotels);

  const [minVal, setMinVal] = useState(storedMin || '');
  const [maxVal, setMaxVal] = useState(storedMax || '');

  useEffect(() => {
    setMinVal(storedMin || '');
    setMaxVal(storedMax || '');
  }, [storedMin, storedMax]);

  const handleApplyFilter = (e) => {
    e.preventDefault();
    dispatch(setMinPrice(minVal));
    dispatch(setMaxPrice(maxVal));
    dispatch(setOffset(0));
    dispatch(
      fetchHotels({
        minPrice: minVal !== '' ? minVal : undefined,
        maxPrice: maxVal !== '' ? maxVal : undefined,
        offset: 0,
      })
    );
  };

  const handleReset = () => {
    setMinVal('');
    setMaxVal('');
    dispatch(resetFilters());
    dispatch(fetchHotels({ title: '', minPrice: undefined, maxPrice: undefined, offset: 0 }));
  };

  return (
    <form className="price-filter-section" onSubmit={handleApplyFilter}>
      <span className="filter-label">Filter by Price (₹):</span>
      
      <div className="price-input-group">
        <input
          type="number"
          id="min-price-input"
          className="form-control"
          placeholder="Min Price"
          min="0"
          value={minVal}
          onChange={(e) => setMinVal(e.target.value)}
        />
        <span>–</span>
        <input
          type="number"
          id="max-price-input"
          className="form-control"
          placeholder="Max Price"
          min="0"
          value={maxVal}
          onChange={(e) => setMaxVal(e.target.value)}
        />
      </div>

      <button type="submit" className="btn btn-secondary btn-sm" id="price-filter-btn">
        Filter
      </button>

      {(minVal || maxVal) && (
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={handleReset}
          id="reset-filter-btn"
        >
          Reset All
        </button>
      )}
    </form>
  );
};

export default PriceFilter;

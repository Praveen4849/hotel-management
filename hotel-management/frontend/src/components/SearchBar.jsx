import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSearchTitle, fetchHotels } from '../redux/hotelSlice';

const SearchBar = () => {
  const dispatch = useDispatch();
  const currentSearch = useSelector((state) => state.hotels.searchTitle);
  const [searchInput, setSearchInput] = useState(currentSearch || '');

  useEffect(() => {
    setSearchInput(currentSearch || '');
  }, [currentSearch]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    dispatch(setSearchTitle(searchInput));
    dispatch(fetchHotels({ title: searchInput, offset: 0 }));
  };

  const handleClear = () => {
    setSearchInput('');
    dispatch(setSearchTitle(''));
    dispatch(fetchHotels({ title: '', offset: 0 }));
  };

  return (
    <form className="search-section" onSubmit={handleSearchSubmit}>
      <div className="search-input-wrapper">
        <input
          type="text"
          id="search-hotel-input"
          className="form-control"
          placeholder="Search by hotel name..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </div>
      <button type="submit" className="btn btn-primary" id="search-btn">
        🔍 Search
      </button>
      {searchInput && (
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleClear}
          title="Clear search"
        >
          Clear
        </button>
      )}
    </form>
  );
};

export default SearchBar;

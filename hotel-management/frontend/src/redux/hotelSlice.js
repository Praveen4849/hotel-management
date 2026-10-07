import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getHotels,
  getHotelById,
  createHotel,
  updateHotel,
  deleteHotel,
} from '../services/hotelApi';

// Async Thunks
export const fetchHotels = createAsyncThunk(
  'hotels/fetchHotels',
  async (customParams, { getState, rejectWithValue }) => {
    try {
      const state = getState().hotels;
      const params = {
        title: state.searchTitle || undefined,
        minPrice: state.minPrice || undefined,
        maxPrice: state.maxPrice || undefined,
        offset: state.pagination.offset,
        limit: state.pagination.limit,
        ...customParams,
      };

      const data = await getHotels(params);
      return data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch hotels';
      return rejectWithValue(message);
    }
  }
);

export const fetchHotelById = createAsyncThunk(
  'hotels/fetchHotelById',
  async (id, { rejectWithValue }) => {
    try {
      const data = await getHotelById(id);
      return data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch hotel details';
      return rejectWithValue(message);
    }
  }
);

export const createNewHotel = createAsyncThunk(
  'hotels/createNewHotel',
  async (formData, { rejectWithValue }) => {
    try {
      const data = await createHotel(formData);
      return data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to create hotel';
      return rejectWithValue(message);
    }
  }
);

export const updateExistingHotel = createAsyncThunk(
  'hotels/updateExistingHotel',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const data = await updateHotel(id, formData);
      return data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to update hotel';
      return rejectWithValue(message);
    }
  }
);

export const removeHotel = createAsyncThunk(
  'hotels/removeHotel',
  async (id, { rejectWithValue }) => {
    try {
      const data = await deleteHotel(id);
      return { id, message: data.message };
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to delete hotel';
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  hotels: [],
  selectedHotel: null,
  loading: false,
  error: null,
  successMessage: null,
  searchTitle: '',
  minPrice: '',
  maxPrice: '',
  pagination: {
    offset: 0,
    limit: 6,
    total: 0,
  },
};

const hotelSlice = createSlice({
  name: 'hotels',
  initialState,
  reducers: {
    setSearchTitle: (state, action) => {
      state.searchTitle = action.payload;
      state.pagination.offset = 0; // Reset to first page on search
    },
    setMinPrice: (state, action) => {
      state.minPrice = action.payload;
    },
    setMaxPrice: (state, action) => {
      state.maxPrice = action.payload;
    },
    setOffset: (state, action) => {
      state.pagination.offset = action.payload;
    },
    resetFilters: (state) => {
      state.searchTitle = '';
      state.minPrice = '';
      state.maxPrice = '';
      state.pagination.offset = 0;
    },
    clearMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    setSuccessMessage: (state, action) => {
      state.successMessage = action.payload;
    },
    clearSelectedHotel: (state) => {
      state.selectedHotel = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch hotels
      .addCase(fetchHotels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHotels.fulfilled, (state, action) => {
        state.loading = false;
        state.hotels = action.payload.hotels || [];
        state.pagination.total = action.payload.total || 0;
        state.pagination.offset = action.payload.offset || 0;
        state.pagination.limit = action.payload.limit || 6;
      })
      .addCase(fetchHotels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch single hotel
      .addCase(fetchHotelById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.selectedHotel = null;
      })
      .addCase(fetchHotelById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedHotel = action.payload;
      })
      .addCase(fetchHotelById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create hotel
      .addCase(createNewHotel.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createNewHotel.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message || 'Hotel created successfully';
      })
      .addCase(createNewHotel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update hotel
      .addCase(updateExistingHotel.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateExistingHotel.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message || 'Hotel updated successfully';
        state.selectedHotel = action.payload.hotel;
      })
      .addCase(updateExistingHotel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete hotel
      .addCase(removeHotel.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeHotel.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = 'Hotel deleted successfully';
      })
      .addCase(removeHotel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setSearchTitle,
  setMinPrice,
  setMaxPrice,
  setOffset,
  resetFilters,
  clearMessages,
  setSuccessMessage,
  clearSelectedHotel,
} = hotelSlice.actions;

export default hotelSlice.reducer;

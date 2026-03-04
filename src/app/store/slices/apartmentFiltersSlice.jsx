import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  activeFilters: null,
};

const apartmentFiltersSlice = createSlice({
  name: "apartmentFilters",
  initialState,
  reducers: {
    setApartmentFilters: (state, action) => {
      state.activeFilters = action.payload ?? null;
    },
    clearApartmentFilters: (state) => {
      state.activeFilters = null;
    },
  },
});

export const { setApartmentFilters, clearApartmentFilters } =
  apartmentFiltersSlice.actions;

export default apartmentFiltersSlice.reducer;

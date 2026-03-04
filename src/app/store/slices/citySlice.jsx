import { createSlice } from "@reduxjs/toolkit";

// Stato iniziale con selectedCity null per evitare errori di accesso
const initialState = {
  selectedCity: null,
};

const citySlice = createSlice({
  name: "city",
  initialState,
  reducers: {
    setSelectedCity: (state, action) => {
      state.selectedCity = action.payload;
    },
    clearSelectedCity: (state) => {
      state.selectedCity = null;
    },
  },
});

// Export delle actions
export const { setSelectedCity, clearSelectedCity } = citySlice.actions;

// Export del reducer
export default citySlice.reducer;

import { configureStore } from "@reduxjs/toolkit";
import appartamentiReducer from "./slices/appartamentiSlice";
import apartmentFiltersReducer from "./slices/apartmentFiltersSlice";
import cityReducer from "./slices/citySlice";

const store = configureStore({
  reducer: {
    appartamenti: appartamentiReducer,
    apartmentFilters: apartmentFiltersReducer,
    city: cityReducer,
  },
});

export default store;

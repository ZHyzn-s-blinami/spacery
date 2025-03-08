import { configureStore } from "@reduxjs/toolkit";
import userReducer from './user/slice';
import bookingReducer from './booking/slice'

export const store = configureStore({
  reducer: {
    user: userReducer,
    booking: bookingReducer
  }
})
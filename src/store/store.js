import { configureStore } from "@reduxjs/toolkit";
import userReducer from './user/slice';

export const store = configureStore({
  reducer: {
    users: userReducer
  }
})
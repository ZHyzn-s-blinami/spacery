import { createAsyncThunk } from "@reduxjs/toolkit";
import { bookingService } from "../../services/bookingService";

export const cancelBooking = createAsyncThunk(
  'booking/cancel',
  async (id, { rejectWithValue }) => {
    try {
      const response = await bookingService.cancelBooking(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

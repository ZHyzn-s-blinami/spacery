import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchUserMeetings, cancelUserMeeting } from "./../user/thunks";

const initialState = {
  meetings: [],
  loading: false,
  error: null
};

const bookingSlice = createSlice({
  name: "booking",
  initialState,
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserMeetings.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserMeetings.fulfilled, (state, action) => {
        state.loading = false;
        state.meetings = action.payload;
      })
      .addCase(fetchUserMeetings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    builder
      .addCase(cancelUserMeeting.pending, (state) => {
        state.loading = true;
      })
      .addCase(cancelUserMeeting.fulfilled, (state, action) => {
        state.loading = false;
        state.meetings = action.payload;
      })
      .addCase(cancelUserMeeting.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
  
});

export default bookingSlice.reducer;

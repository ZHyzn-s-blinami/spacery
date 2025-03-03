import { createAsyncThunk } from "@reduxjs/toolkit";
import { bookingService } from "../../services/bookingService";

export const updateMeeting = createAsyncThunk(
    'booking/updateMeeting',
    async ({ uuid, startAt, endAt }, { rejectWithValue }) => {
        try {
            const response = await bookingService.updateMeeting({ uuid, startAt, endAt });
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: error.message });
        }
    }
);




import { createAsyncThunk } from "@reduxjs/toolkit";
import { authService } from "../../services/authService";
import { addUser } from "./slice";
import { bookingService } from "../../services/bookingService";

export const registerUser = createAsyncThunk(
  'users/register',
  async (userData, { dispatch, rejectWithValue }) => {
    try {
      const response = await authService.register(userData);

      dispatch(addUser(userData));
      debugger;
      localStorage.setItem('userToken', response.token);
      return response.user;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
)

export const loginUser = createAsyncThunk(
  'users/login',
  async (credentials, { rejectWithValue }) => {
    try {
      await authService.login(credentials);
      return await authService.getUser();
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
)


export const logoutUser = createAsyncThunk(
  'users/logout',
  async (_, { rejectWithValue }) => {
    try {
      authService.logout();
      return null;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
)

export const fetchUserData = createAsyncThunk(
  'users/fetchUserData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getUser();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchUserMeetings = createAsyncThunk(
  "booking/fetchUserMeetings",
  async (_, { rejectWithValue }) => {
    try {
      const response = await bookingService.getMeetings();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const cancelUserMeeting = createAsyncThunk(
  "booking/cancelUserMeeting",
  async (uuid, { rejectWithValue }) => {
    try {
      await bookingService.cancelUserMeeting(uuid);
      const response = await bookingService.getMeetings();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


export const fetchQrCode = createAsyncThunk(
  'users/fetchQrCode',
  async (uuid, { rejectWithValue }) => {
    try {
      const response = await bookingService.getQrCode(uuid);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

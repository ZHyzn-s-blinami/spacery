import { createAsyncThunk } from "@reduxjs/toolkit";
import { authService } from "../../services/authService";
import { addUser } from "./slice";

export const registerUser = createAsyncThunk(
  'users/register',
  async (userData, { dispatch, rejectWithValue }) => {
    try {
      const response = await authService.register(userData);

      dispatch(addUser(userData));
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
      const response = await authService.login(credentials);
      localStorage.setItem('userToken', response.token);
      return response.user;
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
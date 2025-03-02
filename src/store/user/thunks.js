import { createAsyncThunk } from "@reduxjs/toolkit";
import { authService } from "../../services/authService";
import { addUser } from "./slice";
import toast from "react-hot-toast";

export const registerUser = createAsyncThunk(
  'users/register',
  async (userData, { dispatch, rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      localStorage.setItem('userToken', response.token);
      dispatch(addUser(userData));
      toast.success('Регистрация прошла успешно!')
      return response.user;
    } catch (error) {
      toast.error('Ошибка регистрации')
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
)

export const loginUser = createAsyncThunk(
  'users/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      toast.success('Вход прошёл успешно!');
      return response;
    } catch (error) {
      toast.error('Ошибка при входе');
      console.log(error);
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
      console.log(response);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchUserMeetings = createAsyncThunk(
  'users/fetchUserMeetings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getMeetings();
      console.log(response);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchQrCode = createAsyncThunk(
  'users/fetchQrCode',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getQrCode();
      console.log(response);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

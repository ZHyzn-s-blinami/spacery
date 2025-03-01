import { createSlice } from "@reduxjs/toolkit"
import { loginUser, logoutUser, registerUser } from "./thunks";

export const UserRole = {
  ROLE_ANONYMOUS: "ROLE_ANONYMOUS",
  ROLE_USER: "ROLE_USER",
  ROLE_ADMIN: "ROLE_ADMIN"
}

const initialState = {
  users: [],
  currentUser: null,
  isAuthenticated: false,
  loading: false,
  error: null
}

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    addUser: (state, action) => {
      state.users.push(action.payload);
    },
    updateVerification: (state, action) => {
      const index = state.users.findIndex(user => user.id === action.payload.id);
      if (index !== -1) {
        state.verificationStatus = true;
      }
    },
    updateRole: (state, action) => {
      const index = state.users.findIndex(user => user.id === action.payload.id);
      if (index !== -1) {
        state.users[index].role = action.payload.role;
      }
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Ошибка регистрации' };
      });
    
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Ошибка регистрации' };
      })
    
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.currentUser = null;
        state.isAuthenticated = false;
      })
  }
});

export const { addUser, updateVerification, updateRole, clearError } = userSlice.actions;

export default userSlice.reducer;
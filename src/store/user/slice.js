import { createSlice } from "@reduxjs/toolkit"

export const UserRole = {
  ROLE_ANONYMOUS: "ROLE_ANONYMOUS",
  ROLE_USER: "ROLE_USER",
  ROLE_ADMIN: "ROLE_ADMIN"
}

const initialState = {
  users: []
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
        state.role = action.payload;
      }
    }
  }
});

export const { addUser, updateVerification, updateRole } = userSlice.actions;

export default userSlice.reducer;
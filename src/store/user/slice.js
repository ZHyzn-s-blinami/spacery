import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  name: '',
  verificationStatus: false,
  email: '',
  password: '',
  role: ''
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
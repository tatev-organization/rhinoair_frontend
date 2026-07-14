import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  token: string | null;
  role: string | null;
  companyId: string | null;
  user: any | null; // Adjust this type based on the getProfile response
  isAuthenticated: boolean;
}

const getInitialToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('accessToken') || null;
  }
  return null;
};

const getInitialRole = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('role') || null;
  }
  return null;
};

const initialState: AuthState = {
  token: getInitialToken(),
  role: getInitialRole(),
  companyId: null,
  user: null,
  isAuthenticated: !!getInitialToken(),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ accessToken: string; refreshToken?: string; role?: string; companyId?: string | null; user?: any }>
    ) => {
      state.token = action.payload.accessToken;
      state.isAuthenticated = true;
      if (action.payload.role) state.role = action.payload.role;
      if (action.payload.companyId) state.companyId = action.payload.companyId;
      if (action.payload.user) state.user = action.payload.user;
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', action.payload.accessToken);
        if (action.payload.refreshToken) {
          localStorage.setItem('refreshToken', action.payload.refreshToken);
        }
        if (action.payload.role) {
          localStorage.setItem('role', action.payload.role);
        }
      }
    },
    setUser: (state, action: PayloadAction<any>) => {
      state.user = action.payload;
    },
    logout: (state) => {
      state.token = null;
      state.role = null;
      state.companyId = null;
      state.user = null;
      state.isAuthenticated = false;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('role');
      }
    },
  },
});

export const { setCredentials, setUser, logout } = authSlice.actions;
export default authSlice.reducer;

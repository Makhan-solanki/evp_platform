import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, Student, Organization, AuthState, LoginCredentials, RegisterCredentials } from '@/types';
import { apiService } from '@/services/api';
import toast from 'react-hot-toast';

// Initial state
const initialState: AuthState = {
  user: null,
  student: null,
  organization: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ credentials, rememberMe }: { credentials: LoginCredentials; rememberMe?: boolean }, { rejectWithValue }) => {
    try {
      // Login with backend
      const response = await apiService.post('/auth/login', credentials);
      
      if (!response.success) {
        throw new Error(response.message || 'Login failed');
      }

      const { user, student, organization, tokens } = response.data;
      const token = tokens.accessToken;

      // Store token in localStorage
      if (rememberMe) {
        localStorage.setItem('authToken', token);
      } else {
        sessionStorage.setItem('authToken', token);
      }

      // Set token in API service
      apiService.setAuthToken(token);

      return {
        user,
        student,
        organization,
        token,
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (credentials: RegisterCredentials, { rejectWithValue }) => {
    try {
      // Register with backend
      const response = await apiService.post('/auth/register', credentials);
      
      if (!response.success) {
        throw new Error(response.message || 'Registration failed');
      }

      const { user, student, organization } = response.data;

      return {
        user,
        student,
        organization,
        token: null, // No token on registration, user needs to login
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Registration failed');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async () => {
    try {
      // Logout from backend
      await apiService.post('/auth/logout');
      
      // Clear local storage
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('authToken');
      
      // Clear API service token
      apiService.clearAuthToken();
      
      return null;
    } catch (error: any) {
      // Even if backend logout fails, clear local data
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('authToken');
      apiService.clearAuthToken();
      return null;
    }
  }
);

export const refreshUserProfile = createAsyncThunk(
  'auth/refreshUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.get('/auth/profile');
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to refresh profile');
      }

      const { user, student, organization } = response.data;

      return {
        user,
        student,
        organization,
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to refresh profile');
    }
  }
);

export const sendPasswordReset = createAsyncThunk(
  'auth/sendPasswordReset',
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await apiService.post('/auth/forgot-password', { email });
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to send password reset email');
      }

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to send password reset email');
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{
      user: User | null;
      student: Student | null;
      organization: Organization | null;
      token: string | null;
    }>) => {
      const { user, student, organization, token } = action.payload;
      state.user = user;
      state.student = student;
      state.organization = organization;
      state.token = token;
      state.isAuthenticated = !!user && !!token;
      state.error = null;
    },
    clearCredentials: (state) => {
      state.user = null;
      state.student = null;
      state.organization = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.student = action.payload.student;
        state.organization = action.payload.organization;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
        toast.success('Login successful!');
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        toast.error(action.payload as string);
      });

    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.student = action.payload.student;
        state.organization = action.payload.organization;
        state.token = action.payload.token;
        state.isAuthenticated = !!action.payload.token;
        state.error = null;
        if (action.payload.token) {
          toast.success('Registration successful!');
        } else {
          toast.success('Registration successful! Please login to continue.');
        }
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        toast.error(action.payload as string);
      });

    // Logout
    builder
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.student = null;
        state.organization = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
        toast.success('Logged out successfully');
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        toast.error(action.payload as string);
      });

    // Refresh profile
    builder
      .addCase(refreshUserProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(refreshUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.student = action.payload.student;
        state.organization = action.payload.organization;
        state.error = null;
      })
      .addCase(refreshUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Send password reset
    builder
      .addCase(sendPasswordReset.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendPasswordReset.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
        toast.success('Password reset email sent successfully!');
      })
      .addCase(sendPasswordReset.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        toast.error(action.payload as string);
      });
  },
});

export const { setCredentials, clearCredentials, setError, clearError } = authSlice.actions;
export default authSlice.reducer;

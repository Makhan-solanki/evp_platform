import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface PortfolioSection {
  id: string;
  title: string;
  content: string;
  order: number;
}

export interface PortfolioData {
  id?: string;
  userId: string;
  title: string;
  subtitle: string;
  bio: string;
  theme: string;
  sections: PortfolioSection[];
  isPublished: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface PortfolioState {
  portfolio: PortfolioData | null;
  isLoading: boolean;
  error: string | null;
  isEditing: boolean;
}

const initialState: PortfolioState = {
  portfolio: null,
  isLoading: false,
  error: null,
  isEditing: false,
};

// Async thunks
export const fetchPortfolio = createAsyncThunk(
  'portfolio/fetchPortfolio',
  async (userId: string) => {
    // TODO: Replace with actual API call
    // const response = await api.get(`/portfolio/${userId}`);
    // return response.data;
    
    // Mock data for now
    return {
      id: '1',
      userId,
      title: 'My Portfolio',
      subtitle: 'Student Portfolio',
      bio: 'A passionate student with diverse experiences...',
      theme: 'modern',
      sections: [
        { id: 'about', title: 'About Me', content: 'Tell your story...', order: 1 },
        { id: 'experience', title: 'Experience', content: 'Share your work experience...', order: 2 },
        { id: 'skills', title: 'Skills', content: 'Your technical and soft skills...', order: 3 },
      ],
      isPublished: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
);

export const savePortfolio = createAsyncThunk(
  'portfolio/savePortfolio',
  async (portfolioData: PortfolioData) => {
    // TODO: Replace with actual API call
    // const response = await api.post('/portfolio', portfolioData);
    // return response.data;
    
    // Mock save for now
    console.log('Saving portfolio:', portfolioData);
    return {
      ...portfolioData,
      id: portfolioData.id || '1',
      createdAt: portfolioData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
);

export const publishPortfolio = createAsyncThunk(
  'portfolio/publishPortfolio',
  async (portfolioId: string) => {
    // TODO: Replace with actual API call
    // const response = await api.put(`/portfolio/${portfolioId}/publish`);
    // return response.data;
    
    // Mock publish for now
    console.log('Publishing portfolio:', portfolioId);
    return { id: portfolioId, isPublished: true };
  }
);

const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState,
  reducers: {
    setPortfolio: (state, action: PayloadAction<PortfolioData>) => {
      state.portfolio = action.payload;
    },
    updatePortfolio: (state, action: PayloadAction<Partial<PortfolioData>>) => {
      if (state.portfolio) {
        state.portfolio = { ...state.portfolio, ...action.payload };
      }
    },
    addSection: (state, action: PayloadAction<PortfolioSection>) => {
      if (state.portfolio) {
        state.portfolio.sections.push(action.payload);
      }
    },
    updateSection: (state, action: PayloadAction<{ id: string; updates: Partial<PortfolioSection> }>) => {
      if (state.portfolio) {
        const sectionIndex = state.portfolio.sections.findIndex(s => s.id === action.payload.id);
        if (sectionIndex !== -1) {
          state.portfolio.sections[sectionIndex] = {
            ...state.portfolio.sections[sectionIndex],
            ...action.payload.updates,
          };
        }
      }
    },
    removeSection: (state, action: PayloadAction<string>) => {
      if (state.portfolio) {
        state.portfolio.sections = state.portfolio.sections.filter(s => s.id !== action.payload);
      }
    },
    reorderSections: (state, action: PayloadAction<PortfolioSection[]>) => {
      if (state.portfolio) {
        state.portfolio.sections = action.payload;
      }
    },
    setIsEditing: (state, action: PayloadAction<boolean>) => {
      state.isEditing = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch portfolio
      .addCase(fetchPortfolio.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPortfolio.fulfilled, (state, action) => {
        state.isLoading = false;
        state.portfolio = action.payload;
      })
      .addCase(fetchPortfolio.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch portfolio';
      })
      // Save portfolio
      .addCase(savePortfolio.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(savePortfolio.fulfilled, (state, action) => {
        state.isLoading = false;
        state.portfolio = action.payload;
        state.isEditing = false;
      })
      .addCase(savePortfolio.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to save portfolio';
      })
      // Publish portfolio
      .addCase(publishPortfolio.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(publishPortfolio.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.portfolio) {
          state.portfolio.isPublished = true;
        }
      })
      .addCase(publishPortfolio.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to publish portfolio';
      });
  },
});

export const {
  setPortfolio,
  updatePortfolio,
  addSection,
  updateSection,
  removeSection,
  reorderSections,
  setIsEditing,
  clearError,
} = portfolioSlice.actions;

export default portfolioSlice.reducer;

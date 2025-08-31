import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface NotificationState {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  actions?: Array<{
    label: string;
    action: string;
  }>;
}

interface ModalState {
  id: string;
  type: string;
  props?: Record<string, any>;
  onClose?: () => void;
}

interface UIState {
  // Loading states
  loading: {
    global: boolean;
    auth: boolean;
    profile: boolean;
    experiences: boolean;
    portfolio: boolean;
    [key: string]: boolean;
  };
  
  // Sidebar and navigation
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  
  // Notifications
  notifications: NotificationState[];
  unreadNotificationsCount: number;
  
  // Modals and overlays
  modals: ModalState[];
  
  // Theme and preferences
  theme: 'light' | 'dark' | 'system';
  colorScheme: string;
  
  // Layout preferences
  layout: {
    compactMode: boolean;
    showSidebar: boolean;
    sidebarCollapsed: boolean;
  };
  
  // Search and filters
  searchQuery: string;
  filters: Record<string, any>;
  
  // Page states
  currentPage: string;
  breadcrumbs: Array<{
    label: string;
    href?: string;
  }>;
  
  // Error states
  errors: Record<string, string>;
  
  // Upload progress
  uploads: Record<string, {
    progress: number;
    status: 'uploading' | 'completed' | 'error';
    filename: string;
  }>;
}

const initialState: UIState = {
  loading: {
    global: false,
    auth: false,
    profile: false,
    experiences: false,
    portfolio: false,
  },
  
  sidebarOpen: false,
  mobileMenuOpen: false,
  
  notifications: [],
  unreadNotificationsCount: 0,
  
  modals: [],
  
  theme: 'system',
  colorScheme: 'blue',
  
  layout: {
    compactMode: false,
    showSidebar: true,
    sidebarCollapsed: false,
  },
  
  searchQuery: '',
  filters: {},
  
  currentPage: '',
  breadcrumbs: [],
  
  errors: {},
  
  uploads: {},
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Loading states
    setLoading: (state, action: PayloadAction<{ key: string; loading: boolean }>) => {
      const { key, loading } = action.payload;
      state.loading[key] = loading;
    },
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.global = action.payload;
    },
    
    // Sidebar and navigation
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    toggleMobileMenu: (state) => {
      state.mobileMenuOpen = !state.mobileMenuOpen;
    },
    setMobileMenuOpen: (state, action: PayloadAction<boolean>) => {
      state.mobileMenuOpen = action.payload;
    },
    
    // Notifications
    addNotification: (state, action: PayloadAction<Omit<NotificationState, 'id'>>) => {
      const notification: NotificationState = {
        id: Date.now().toString(),
        ...action.payload,
      };
      state.notifications.push(notification);
      
      if (notification.type !== 'success') {
        state.unreadNotificationsCount += 1;
      }
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadNotificationsCount = 0;
    },
    markNotificationsAsRead: (state) => {
      state.unreadNotificationsCount = 0;
    },
    setUnreadNotificationsCount: (state, action: PayloadAction<number>) => {
      state.unreadNotificationsCount = action.payload;
    },
    
    // Modals
    openModal: (state, action: PayloadAction<Omit<ModalState, 'id'>>) => {
      const modal: ModalState = {
        id: Date.now().toString(),
        ...action.payload,
      };
      state.modals.push(modal);
    },
    closeModal: (state, action: PayloadAction<string>) => {
      state.modals = state.modals.filter(m => m.id !== action.payload);
    },
    closeAllModals: (state) => {
      state.modals = [];
    },
    
    // Theme and preferences
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.theme = action.payload;
    },
    setColorScheme: (state, action: PayloadAction<string>) => {
      state.colorScheme = action.payload;
    },
    
    // Layout preferences
    setLayoutPreference: (state, action: PayloadAction<Partial<UIState['layout']>>) => {
      state.layout = { ...state.layout, ...action.payload };
    },
    toggleCompactMode: (state) => {
      state.layout.compactMode = !state.layout.compactMode;
    },
    toggleSidebarCollapsed: (state) => {
      state.layout.sidebarCollapsed = !state.layout.sidebarCollapsed;
    },
    
    // Search and filters
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setFilters: (state, action: PayloadAction<Record<string, any>>) => {
      state.filters = action.payload;
    },
    updateFilter: (state, action: PayloadAction<{ key: string; value: any }>) => {
      const { key, value } = action.payload;
      state.filters[key] = value;
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    
    // Page states
    setCurrentPage: (state, action: PayloadAction<string>) => {
      state.currentPage = action.payload;
    },
    setBreadcrumbs: (state, action: PayloadAction<Array<{ label: string; href?: string }>>) => {
      state.breadcrumbs = action.payload;
    },
    
    // Error states
    setError: (state, action: PayloadAction<{ key: string; error: string }>) => {
      const { key, error } = action.payload;
      state.errors[key] = error;
    },
    clearError: (state, action: PayloadAction<string>) => {
      delete state.errors[action.payload];
    },
    clearAllErrors: (state) => {
      state.errors = {};
    },
    
    // Upload progress
    setUploadProgress: (state, action: PayloadAction<{
      id: string;
      progress: number;
      status: 'uploading' | 'completed' | 'error';
      filename: string;
    }>) => {
      const { id, ...uploadData } = action.payload;
      state.uploads[id] = uploadData;
    },
    removeUpload: (state, action: PayloadAction<string>) => {
      delete state.uploads[action.payload];
    },
    clearUploads: (state) => {
      state.uploads = {};
    },
    
    // Utility actions
    resetUI: (state) => {
      // Reset to initial state except for theme preferences
      const { theme, colorScheme, layout } = state;
      return {
        ...initialState,
        theme,
        colorScheme,
        layout,
      };
    },
  },
});

export const {
  // Loading
  setLoading,
  setGlobalLoading,
  
  // Sidebar and navigation
  toggleSidebar,
  setSidebarOpen,
  toggleMobileMenu,
  setMobileMenuOpen,
  
  // Notifications
  addNotification,
  removeNotification,
  clearNotifications,
  markNotificationsAsRead,
  setUnreadNotificationsCount,
  
  // Modals
  openModal,
  closeModal,
  closeAllModals,
  
  // Theme
  setTheme,
  setColorScheme,
  
  // Layout
  setLayoutPreference,
  toggleCompactMode,
  toggleSidebarCollapsed,
  
  // Search and filters
  setSearchQuery,
  setFilters,
  updateFilter,
  clearFilters,
  
  // Page states
  setCurrentPage,
  setBreadcrumbs,
  
  // Errors
  setError,
  clearError,
  clearAllErrors,
  
  // Uploads
  setUploadProgress,
  removeUpload,
  clearUploads,
  
  // Utility
  resetUI,
} = uiSlice.actions;

export default uiSlice.reducer;

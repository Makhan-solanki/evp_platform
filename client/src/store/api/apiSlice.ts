import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { firebaseService } from '@/services/firebase';
import type { ApiResponse } from '@/types';

// Base query with authentication
const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
  prepareHeaders: async (headers) => {
    // Get the token from Firebase
    const token = await firebaseService.getCurrentUserToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

// Base query with error handling and token refresh
const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  let result = await baseQuery(args, api, extraOptions);
  
  // Handle 401 errors by refreshing token
  if (result.error && result.error.status === 401) {
    try {
      // Try to refresh the token
      const newToken = await firebaseService.refreshUserToken();
      
      if (newToken) {
        // Retry the original request with new token
        result = await baseQuery(args, api, extraOptions);
      } else {
        // Refresh failed, redirect to login
        window.location.href = '/login';
      }
    } catch (error) {
      // Refresh failed, redirect to login
      window.location.href = '/login';
    }
  }
  
  return result;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'User',
    'Student', 
    'Organization',
    'Experience',
    'Portfolio',
    'Notification',
    'Skill',
    'SocialLink',
    'Document',
    'Analytics',
  ],
  endpoints: (builder) => ({
    // User endpoints
    getUserProfile: builder.query<ApiResponse<{
      user: any;
      student?: any;
      organization?: any;
    }>, void>({
      query: () => '/users/profile',
      providesTags: ['User'],
    }),
    
    updateUserProfile: builder.mutation<ApiResponse<any>, any>({
      query: (data) => ({
        url: '/users/profile',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    
    getUserNotifications: builder.query<ApiResponse<{
      notifications: any[];
      pagination: any;
    }>, { page?: number; limit?: number; type?: string; isRead?: boolean }>({
      query: (params) => ({
        url: '/users/notifications',
        params,
      }),
      providesTags: ['Notification'],
    }),
    
    markNotificationAsRead: builder.mutation<ApiResponse<any>, string>({
      query: (notificationId) => ({
        url: `/users/notifications/${notificationId}`,
        method: 'PUT',
      }),
      invalidatesTags: ['Notification'],
    }),
    
    getUserStatistics: builder.query<ApiResponse<any>, void>({
      query: () => '/users/statistics',
      providesTags: ['User'],
    }),
    
    // Student endpoints
    getStudentProfile: builder.query<ApiResponse<any>, void>({
      query: () => '/students/profile',
      providesTags: ['Student'],
    }),
    
    updateStudentProfile: builder.mutation<ApiResponse<any>, any>({
      query: (data) => ({
        url: '/students/profile',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Student'],
    }),
    
    getStudentExperiences: builder.query<ApiResponse<{
      experiences: any[];
      pagination: any;
    }>, any>({
      query: (params) => ({
        url: '/students/experiences',
        params,
      }),
      providesTags: ['Experience'],
    }),
    
    getStudentOrganizations: builder.query<ApiResponse<{
      organizations: any[];
      pagination: any;
    }>, any>({
      query: (params) => ({
        url: '/students/organizations',
        params,
      }),
      providesTags: ['Organization'],
    }),
    
    addStudentSkill: builder.mutation<ApiResponse<any>, any>({
      query: (data) => ({
        url: '/students/skills',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Skill', 'Student'],
    }),
    
    updateStudentSkill: builder.mutation<ApiResponse<any>, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/students/skills/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Skill', 'Student'],
    }),
    
    deleteStudentSkill: builder.mutation<ApiResponse<any>, string>({
      query: (id) => ({
        url: `/students/skills/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Skill', 'Student'],
    }),
    
    addSocialLink: builder.mutation<ApiResponse<any>, any>({
      query: (data) => ({
        url: '/students/social-links',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['SocialLink', 'Student'],
    }),
    
    deleteSocialLink: builder.mutation<ApiResponse<any>, string>({
      query: (id) => ({
        url: `/students/social-links/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SocialLink', 'Student'],
    }),
    
    acceptExperience: builder.mutation<ApiResponse<any>, { id: string; message?: string }>({
      query: ({ id, message }) => ({
        url: `/students/experiences/${id}/accept`,
        method: 'PUT',
        body: { message },
      }),
      invalidatesTags: ['Experience'],
    }),
    
    declineExperience: builder.mutation<ApiResponse<any>, { 
      id: string; 
      message?: string;
      requestChanges?: boolean;
      suggestedChanges?: string[];
    }>({
      query: ({ id, ...data }) => ({
        url: `/students/experiences/${id}/decline`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Experience'],
    }),
    
    searchStudents: builder.query<ApiResponse<{
      students: any[];
      pagination: any;
    }>, any>({
      query: (params) => ({
        url: '/students/search',
        params,
      }),
    }),
    
    // Organization endpoints
    getOrganizationProfile: builder.query<ApiResponse<any>, void>({
      query: () => '/organizations/profile',
      providesTags: ['Organization'],
    }),
    
    updateOrganizationProfile: builder.mutation<ApiResponse<any>, any>({
      query: (data) => ({
        url: '/organizations/profile',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Organization'],
    }),
    
    getOrganizationStudents: builder.query<ApiResponse<{
      students: any[];
      pagination: any;
    }>, any>({
      query: (params) => ({
        url: '/organizations/students',
        params,
      }),
      providesTags: ['Student'],
    }),
    
    inviteStudent: builder.mutation<ApiResponse<any>, any>({
      query: (data) => ({
        url: '/organizations/students/invite',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Student'],
    }),
    
    bulkInviteStudents: builder.mutation<ApiResponse<any>, any>({
      query: (data) => ({
        url: '/organizations/students/bulk-invite',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Student'],
    }),
    
    removeStudent: builder.mutation<ApiResponse<any>, { id: string; reason?: string; notifyStudent?: boolean }>({
      query: ({ id, ...data }) => ({
        url: `/organizations/students/${id}`,
        method: 'DELETE',
        body: data,
      }),
      invalidatesTags: ['Student'],
    }),
    
    getOrganizationExperiences: builder.query<ApiResponse<{
      experiences: any[];
      pagination: any;
    }>, any>({
      query: (params) => ({
        url: '/organizations/experiences',
        params,
      }),
      providesTags: ['Experience'],
    }),
    
    getOrganizationAnalytics: builder.query<ApiResponse<any>, any>({
      query: (params) => ({
        url: '/organizations/analytics',
        params,
      }),
      providesTags: ['Analytics'],
    }),
    
    getVerificationQueue: builder.query<ApiResponse<{
      requests: any[];
      pagination: any;
    }>, any>({
      query: (params) => ({
        url: '/organizations/verification-queue',
        params,
      }),
      providesTags: ['Experience'],
    }),
    
    // Experience endpoints
    getExperiences: builder.query<ApiResponse<{
      experiences: any[];
      pagination: any;
    }>, any>({
      query: (params) => ({
        url: '/experiences',
        params,
      }),
      providesTags: ['Experience'],
    }),
    
    getExperience: builder.query<ApiResponse<any>, string>({
      query: (id) => `/experiences/${id}`,
      providesTags: ['Experience'],
    }),
    
    createExperience: builder.mutation<ApiResponse<any>, any>({
      query: (data) => ({
        url: '/experiences',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Experience'],
    }),
    
    updateExperience: builder.mutation<ApiResponse<any>, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/experiences/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Experience'],
    }),
    
    deleteExperience: builder.mutation<ApiResponse<any>, string>({
      query: (id) => ({
        url: `/experiences/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Experience'],
    }),
    
    verifyExperience: builder.mutation<ApiResponse<any>, { 
      id: string; 
      status: string;
      verificationNote?: string;
      rejectionReason?: string;
    }>({
      query: ({ id, ...data }) => ({
        url: `/experiences/${id}/verify`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Experience'],
    }),
    
    getPublicExperiences: builder.query<ApiResponse<{
      experiences: any[];
      pagination: any;
    }>, any>({
      query: (params) => ({
        url: '/experiences/public',
        params,
      }),
    }),
    
    getTrendingExperiences: builder.query<ApiResponse<{
      experiences: any[];
    }>, void>({
      query: () => '/experiences/trending',
    }),
    
    getFeaturedExperiences: builder.query<ApiResponse<{
      experiences: any[];
    }>, void>({
      query: () => '/experiences/featured',
    }),
    
    uploadExperienceDocuments: builder.mutation<ApiResponse<any>, { 
      id: string; 
      documents: Array<{ url: string; type: string; title?: string }> 
    }>({
      query: ({ id, documents }) => ({
        url: `/experiences/${id}/documents`,
        method: 'POST',
        body: { documents },
      }),
      invalidatesTags: ['Experience', 'Document'],
    }),
    
    // Portfolio endpoints
    getStudentPortfolio: builder.query<ApiResponse<any>, void>({
      query: () => '/students/portfolio',
      providesTags: ['Portfolio'],
    }),
    
    updateStudentPortfolio: builder.mutation<ApiResponse<any>, any>({
      query: (data) => ({
        url: '/students/portfolio',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Portfolio'],
    }),
    
    getPublicPortfolio: builder.query<ApiResponse<any>, { slug: string; trackView?: boolean }>({
      query: ({ slug, trackView = true }) => ({
        url: `/portfolio/${slug}`,
        params: { trackView },
      }),
    }),
    
    searchPortfolios: builder.query<ApiResponse<{
      portfolios: any[];
      pagination: any;
    }>, any>({
      query: (params) => ({
        url: '/portfolio/search',
        params,
      }),
    }),
    
    generatePortfolioPDF: builder.mutation<ApiResponse<{ pdfUrl: string }>, any>({
      query: (options) => ({
        url: '/portfolio/pdf',
        method: 'POST',
        body: options,
      }),
    }),
    
    // Analytics endpoints
    getDashboardAnalytics: builder.query<ApiResponse<any>, any>({
      query: (params) => ({
        url: '/analytics/dashboard',
        params,
      }),
      providesTags: ['Analytics'],
    }),
    
    getExperienceAnalytics: builder.query<ApiResponse<any>, any>({
      query: (params) => ({
        url: '/analytics/experiences',
        params,
      }),
      providesTags: ['Analytics'],
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  // User hooks
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
  useGetUserNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useGetUserStatisticsQuery,
  
  // Student hooks
  useGetStudentProfileQuery,
  useUpdateStudentProfileMutation,
  useGetStudentExperiencesQuery,
  useGetStudentOrganizationsQuery,
  useAddStudentSkillMutation,
  useUpdateStudentSkillMutation,
  useDeleteStudentSkillMutation,
  useAddSocialLinkMutation,
  useDeleteSocialLinkMutation,
  useAcceptExperienceMutation,
  useDeclineExperienceMutation,
  useSearchStudentsQuery,
  
  // Organization hooks
  useGetOrganizationProfileQuery,
  useUpdateOrganizationProfileMutation,
  useGetOrganizationStudentsQuery,
  useInviteStudentMutation,
  useBulkInviteStudentsMutation,
  useRemoveStudentMutation,
  useGetOrganizationExperiencesQuery,
  useGetOrganizationAnalyticsQuery,
  useGetVerificationQueueQuery,
  
  // Experience hooks
  useGetExperiencesQuery,
  useGetExperienceQuery,
  useCreateExperienceMutation,
  useUpdateExperienceMutation,
  useDeleteExperienceMutation,
  useVerifyExperienceMutation,
  useGetPublicExperiencesQuery,
  useGetTrendingExperiencesQuery,
  useGetFeaturedExperiencesQuery,
  useUploadExperienceDocumentsMutation,
  
  // Portfolio hooks
  useGetStudentPortfolioQuery,
  useUpdateStudentPortfolioMutation,
  useGetPublicPortfolioQuery,
  useSearchPortfoliosQuery,
  useGeneratePortfolioPDFMutation,
  
  // Analytics hooks
  useGetDashboardAnalyticsQuery,
  useGetExperienceAnalyticsQuery,
} = apiSlice;

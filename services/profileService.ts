import api from './api';

export interface ProfileData {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  department?: string;
  position?: string;
  avatar?: string;
  is_active: boolean;
  created_at: string;
  
  // Extended employee info
  mobile?: string;
  date_of_birth?: string;
  gender?: string;
  country?: string;
  address?: string;
  about?: string;
  skills?: string[];
  start_date?: string;
  employment_type?: string;
  marital_status?: string;
  hourly_rate?: number;
}

export interface ProfileUpdateData {
  first_name?: string;
  last_name?: string;
  mobile?: string;
  date_of_birth?: string;
  gender?: string;
  country?: string;
  address?: string;
  about?: string;
  skills?: string[];
  marital_status?: string;
}

export interface PasswordChangeData {
  current_password: string;
  new_password: string;
}

export interface AvatarUploadResponse {
  message: string;
  avatar_url: string;
}

/**
 * Get the current user's profile
 */
export const getProfile = async (): Promise<ProfileData> => {
  const response = await api.get('/profile/me');
  return response.data;
};

/**
 * Update the current user's profile
 */
export const updateProfile = async (data: ProfileUpdateData): Promise<ProfileData> => {
  const response = await api.put('/profile/me', data);
  return response.data;
};

/**
 * Upload a new avatar image
 */
export const uploadAvatar = async (file: File): Promise<AvatarUploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/profile/me/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Delete the current user's avatar
 */
export const deleteAvatar = async (): Promise<{ message: string }> => {
  const response = await api.delete('/profile/me/avatar');
  return response.data;
};

/**
 * Change the current user's password
 */
export const changePassword = async (data: PasswordChangeData): Promise<{ message: string }> => {
  const response = await api.post('/profile/me/change-password', data);
  return response.data;
};

export const profileService = {
  getProfile,
  updateProfile,
  uploadAvatar,
  deleteAvatar,
  changePassword,
};

export default profileService;

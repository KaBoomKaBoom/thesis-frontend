// User Profile DTO matching backend
export interface UserProfileDTO {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  location?: string;
  dateOfBirth?: string;
  role: string;
  gradeLevel?: string;
  school?: string;
  bio?: string;
}

// User Update DTO for profile updates
export interface UserToUpdateDTO {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  location: string;
  gradeLevel: string;
  school: string;
  biography: string;
}

// API response for profile update
export interface UpdateProfileResponse {
  message: string;
  profile: UserProfileDTO;
}

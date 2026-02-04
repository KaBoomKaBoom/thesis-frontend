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

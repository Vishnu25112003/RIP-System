// pages/Internships/types.ts
export interface Internship {
  _id: string
  coursename: string
  field: string
  description: string
  duration: string
  status: "Active" | "Inactive"
  image?: string
  createdAt: string
}

export interface UserApplication {
  _id: string
  status: "Pending" | "Approved" | "Rejected"
  courseSelection: string
  learningPreference: string
  technicalSkills: string[]
  hasApplication: boolean
  appliedAt?: string
  approvedAt?: string
  adminFeedback?: string
}

export interface Education {
  course: string
  university: string
  percentage: number
}

export interface Address {
  address: string
  city: string
  state: string
  pincode: number
}

export interface UserProfile {
  _id: string
  name: string
  fathername: string
  mailid: string
  phone: string
  dob: string
  gender: "Male" | "Female" | "Other"
  education: Education[]
  address: Address[]
}

export interface EnrollFormData {
  courseSelection: string;
  learningPreference: string;
  technicalSkills: string[];
}

// pages/daily-tasks/types.ts

export interface Task {
  _id: string
  day: number
  title: string
  description: string
  exercise?: string
  test?: string
  status: "completed" | "current" | "locked"
  canAccess: boolean
  isSubmitted: boolean
  submissionId?: string
  unlockDate?: string
  unlockedBy?: string
}

export interface Course {
  _id: string
  coursename: string
  field: string
  description: string
}

export interface TasksData {
  course: Course
  tasks: Task[]
  currentDay: number
  actualCurrentDay: number
  registrationDate: string
  totalSubmissions: number
  totalUnlocks: number
}

export interface TodayTask {
  task: Task
  courseId: string
  currentDay: number
  taskDay: number
  canSubmit: boolean
}

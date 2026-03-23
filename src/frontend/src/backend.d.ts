import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Application {
    status: Status;
    applicationId: string;
    date: string;
    name: string;
    email: string;
    address: string;
    phone: string;
    course: string;
}
export interface Inquiry {
    name: string;
    email: string;
    message: string;
    phone: string;
}
export interface UserProfile {
    name: string;
}
export interface Course {
    title: string;
    duration: string;
    icon: string;
    description: string;
    category: string;
}
export enum Status {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    approveApplication(applicationId: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getAllApplications(): Promise<Array<Application>>;
    getAllApplicationsByStatus(status: Status): Promise<Array<Application>>;
    getAllCourses(): Promise<Array<Course>>;
    getAllInquiries(): Promise<Array<Inquiry>>;
    getApplicationStatus(applicationId: string): Promise<Status>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCourse(title: string): Promise<Course>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    rejectApplication(applicationId: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitApplication(applicationId: string, name: string, email: string, phone: string, course: string, address: string, date: string): Promise<void>;
    submitInquiry(name: string, email: string, phone: string, message: string): Promise<void>;
}

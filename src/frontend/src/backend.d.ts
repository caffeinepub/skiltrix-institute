import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type ApplicationId = string;
export interface ApplicationStatusInfo {
    status: Status;
    applicationId: ApplicationId;
    date: string;
    name: string;
    course: string;
}
export interface ApplicationStageInfo {
    applicationId: ApplicationId;
    stage: string;
}
export interface Application {
    status: Status;
    paymentStatus: PaymentStatus;
    applicationId: ApplicationId;
    date: string;
    name: string;
    email: string;
    address: string;
    stripePaymentId?: string;
    phone: string;
    certificateIssued: boolean;
    course: string;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface Course {
    title: string;
    duration: string;
    fees: string;
    icon: string;
    description: string;
    category: string;
    skills: Array<string>;
    careerOpportunities: Array<string>;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface Analytics {
    formSubmissions: bigint;
    visitors: bigint;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface Inquiry {
    name: string;
    email: string;
    message: string;
    phone: string;
}
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface UserProfile {
    name: string;
}
export interface SubAdminInfo {
    email: string;
    name: string;
}
export enum PaymentStatus {
    paid = "paid",
    unpaid = "unpaid"
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
    addCourse(course: Course): Promise<void>;
    approveApplication(applicationId: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    createDefaultCheckoutSession(successUrl: string, cancelUrl: string): Promise<string>;
    createSubAdmin(email: string, name: string, password: string, mpin: string): Promise<void>;
    deleteCourse(title: string): Promise<void>;
    deleteSubAdmin(email: string): Promise<void>;
    getAllApplications(): Promise<Array<Application>>;
    getAllInquiries(): Promise<Array<Inquiry>>;
    getAnalytics(): Promise<Analytics>;
    getApplicationByEmail(email: string): Promise<Application | null>;
    getApplicationStages(): Promise<Array<ApplicationStageInfo>>;
    getApplicationStatus(applicationId: ApplicationId): Promise<ApplicationStatusInfo | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCourses(): Promise<Array<Course>>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getSubAdmins(): Promise<Array<SubAdminInfo>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isCertificateIssued(applicationId: string): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    issueCertificate(applicationId: string): Promise<void>;
    recordVisit(): Promise<void>;
    rejectApplication(applicationId: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setAdminCredentials(oldPassword: string, oldMpin: string, newEmail: string, newPassword: string, newMpin: string): Promise<boolean>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    submitApplication(application: Application): Promise<ApplicationId>;
    submitInquiry(name: string, email: string, phone: string, message: string): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateApplicationStage(applicationId: string, stage: string): Promise<void>;
    updateCourse(course: Course): Promise<void>;
    updatePaymentStatus(applicationId: string, sessionId: string, isPaid: boolean): Promise<void>;
    verifyAdminCredentials(email: string, password: string, mpin: string): Promise<boolean>;
}

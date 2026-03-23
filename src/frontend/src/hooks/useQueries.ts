import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Analytics,
  Application,
  ApplicationStageInfo,
  Course,
  Review,
  ReviewInput,
  SubAdminInfo,
} from "../backend.d";
import type { ContactInfo } from "../backend.d";
export type { ContactInfo };
import { useActor } from "./useActor";

// ─── Courses ────────────────────────────────────────────────────────────────────
export function useGetCourses() {
  const { actor, isFetching } = useActor();
  return useQuery<Course[]>({
    queryKey: ["courses"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCourses();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddCourse() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (course: Course) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addCourse(course);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
}

export function useUpdateCourse() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (course: Course) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateCourse(course);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
}

export function useDeleteCourse() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (title: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteCourse(title);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
}

// ─── Applications ───────────────────────────────────────────────────────────
export function useSubmitApplication() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (data: Application) => {
      if (!actor) throw new Error("Actor not available");
      return actor.submitApplication(data);
    },
  });
}

export function useGetAllApplications() {
  const { actor, isFetching } = useActor();
  return useQuery<Application[]>({
    queryKey: ["allApplications"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllApplications();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useApproveApplication() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (applicationId: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.approveApplication(applicationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allApplications"] });
    },
  });
}

export function useRejectApplication() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (applicationId: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.rejectApplication(applicationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allApplications"] });
    },
  });
}

export function useGetApplicationByEmail() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (email: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.getApplicationByEmail(email);
    },
  });
}

export function useIssueCertificate() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (applicationId: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.issueCertificate(applicationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allApplications"] });
    },
  });
}

// ─── Application Stages (backend-backed) ──────────────────────────────────
export function useGetApplicationStages() {
  const { actor, isFetching } = useActor();
  return useQuery<ApplicationStageInfo[]>({
    queryKey: ["applicationStages"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getApplicationStages();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateApplicationStage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { applicationId: string; stage: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateApplicationStage(data.applicationId, data.stage);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applicationStages"] });
    },
  });
}

// ─── Sub-admins (backend-backed) ─────────────────────────────────────────
export function useGetSubAdmins() {
  const { actor, isFetching } = useActor();
  return useQuery<SubAdminInfo[]>({
    queryKey: ["subAdmins"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSubAdmins();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateSubAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      email: string;
      name: string;
      password: string;
      mpin: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createSubAdmin(
        data.email,
        data.name,
        data.password,
        data.mpin,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subAdmins"] });
    },
  });
}

export function useDeleteSubAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (email: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteSubAdmin(email);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subAdmins"] });
    },
  });
}

// ─── Admin Auth ────────────────────────────────────────────────────────────────────
export function useVerifyAdminCredentials() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (data: {
      email: string;
      password: string;
      mpin: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.verifyAdminCredentials(data.email, data.password, data.mpin);
    },
  });
}

export function useSetAdminCredentials() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (data: {
      oldPassword: string;
      oldMpin: string;
      newEmail: string;
      newPassword: string;
      newMpin: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      const currentEmail = sessionStorage.getItem("adminEmail") ?? "";
      const valid = await actor.verifyAdminCredentials(
        currentEmail,
        data.oldPassword,
        data.oldMpin,
      );
      if (!valid) return false;
      await actor.setAdminCredentials(
        data.oldPassword,
        data.oldMpin,
        data.newEmail,
        data.newPassword,
        data.newMpin,
      );
      return true;
    },
  });
}

// ─── Analytics ────────────────────────────────────────────────────────────────────
export function useGetAnalytics() {
  const { actor, isFetching } = useActor();
  return useQuery<Analytics>({
    queryKey: ["analytics"],
    queryFn: async () => {
      if (!actor) return { visitors: BigInt(0), formSubmissions: BigInt(0) };
      return actor.getAnalytics();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRecordVisit() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.recordVisit();
    },
  });
}

// ─── Stripe ─────────────────────────────────────────────────────────────────────
export function useUpdatePaymentStatus() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (data: {
      applicationId: string;
      sessionId: string;
      isPaid: boolean;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updatePaymentStatus(
        data.applicationId,
        data.sessionId,
        data.isPaid,
      );
    },
  });
}

export function useCreateCheckoutSession() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (data: { successUrl: string; cancelUrl: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createDefaultCheckoutSession(
        data.successUrl,
        data.cancelUrl,
      );
    },
  });
}

export function useIsStripeConfigured() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isStripeConfigured"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isStripeConfigured();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetStripeSessionStatus() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (sessionId: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.getStripeSessionStatus(sessionId);
    },
  });
}

// ─── User / misc ─────────────────────────────────────────────────────────────────
export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isCallerAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSubmitInquiry() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      email: string;
      phone: string;
      message: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.submitInquiry(
        data.name,
        data.email,
        data.phone,
        data.message,
      );
    },
  });
}

// ─── ID Card ─────────────────────────────────────────────────────────────────
export function useIssueIdCard() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (applicationId: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.issueIdCard(applicationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allApplications"] });
    },
  });
}

export function useGetIdCardByEmail() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (email: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.getIdCardByEmail(email);
    },
  });
}

// ─── Reviews ─────────────────────────────────────────────────────────────────
export function useGetReviews() {
  const { actor, isFetching } = useActor();
  return useQuery<Review[]>({
    queryKey: ["reviews"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getReviews();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSubmitReview() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: ReviewInput) => {
      if (!actor) throw new Error("Actor not available");
      return actor.submitReview(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
  });
}

export function useAddReviewByAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: ReviewInput) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addReviewByAdmin(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
  });
}

export function useUpdateReview() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: ReviewInput }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateReview(id, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
  });
}

export function useDeleteReview() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteReview(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
  });
}

// ─── Contact Info (backend-backed) ────────────────────────────────────────────
export function useGetContactInfo() {
  const { actor, isFetching } = useActor();
  return useQuery<ContactInfo>({
    queryKey: ["contactInfo"],
    queryFn: async () => {
      if (!actor)
        return {
          phone: "+91 7023628763",
          email: "skiltrixsupport@gmail.com",
          address: "Sector 10, Malviya Nagar, Jaipur, Rajasthan",
          facebook: "",
          instagram: "",
          twitter: "",
          youtube: "",
        };
      return actor.getContactInfo();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetContactInfo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (info: ContactInfo) => {
      if (!actor) throw new Error("Actor not available");
      await actor.setContactInfo(info);
      return info;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contactInfo"] });
    },
  });
}

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
import { useActor } from "./useActor";

// ─── localStorage helpers for features not yet in backend ───────────────────────────────
const STAGES_KEY = "skiltrix_app_stages";
const SUB_ADMINS_KEY = "skiltrix_sub_admins";

function getStoredStages(): ApplicationStageInfo[] {
  try {
    return JSON.parse(localStorage.getItem(STAGES_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveStages(stages: ApplicationStageInfo[]) {
  localStorage.setItem(STAGES_KEY, JSON.stringify(stages));
}

function getStoredSubAdmins(): SubAdminInfo[] {
  try {
    return JSON.parse(localStorage.getItem(SUB_ADMINS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveSubAdmins(admins: SubAdminInfo[]) {
  localStorage.setItem(SUB_ADMINS_KEY, JSON.stringify(admins));
}

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

// ─── Application Stages (localStorage-backed) ──────────────────────────────────
export function useGetApplicationStages() {
  return useQuery<ApplicationStageInfo[]>({
    queryKey: ["applicationStages"],
    queryFn: async () => getStoredStages(),
    staleTime: 0,
  });
}

export function useUpdateApplicationStage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { applicationId: string; stage: string }) => {
      const stages = getStoredStages();
      const idx = stages.findIndex(
        (s) => s.applicationId === data.applicationId,
      );
      if (idx >= 0) {
        stages[idx].stage = data.stage;
      } else {
        stages.push({ applicationId: data.applicationId, stage: data.stage });
      }
      saveStages(stages);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applicationStages"] });
    },
  });
}

// ─── Sub-admins (localStorage-backed) ─────────────────────────────────────────
export function useGetSubAdmins() {
  return useQuery<SubAdminInfo[]>({
    queryKey: ["subAdmins"],
    queryFn: async () => getStoredSubAdmins(),
    staleTime: 0,
  });
}

export function useCreateSubAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      email: string;
      name: string;
      password: string;
      mpin: string;
    }) => {
      const admins = getStoredSubAdmins();
      if (admins.find((a) => a.email === data.email)) {
        throw new Error("Sub-admin with this email already exists");
      }
      admins.push({ email: data.email, name: data.name });
      saveSubAdmins(admins);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subAdmins"] });
    },
  });
}

export function useDeleteSubAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (email: string) => {
      const admins = getStoredSubAdmins().filter((a) => a.email !== email);
      saveSubAdmins(admins);
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

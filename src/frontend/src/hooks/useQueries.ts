import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Application, Course } from "../backend.d";
import { useActor } from "./useActor";

export function useGetCourses() {
  const { actor, isFetching } = useActor();
  return useQuery<Course[]>({
    queryKey: ["courses"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCourses();
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

export function useSubmitApplication() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (data: {
      applicationId: string;
      name: string;
      email: string;
      phone: string;
      course: string;
      address: string;
      date: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.submitApplication(
        data.applicationId,
        data.name,
        data.email,
        data.phone,
        data.course,
        data.address,
        data.date,
      );
    },
  });
}

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

import { addDays, format, parseISO } from "date-fns";
import type {
  JourneyActionProgress,
  JourneyAppointment,
  JourneyPlanV2,
} from "./types";

export function actionProgressFor(
  progress: JourneyActionProgress[],
  actionType: "task" | "exam",
  actionId: string,
): JourneyActionProgress | undefined {
  return progress.find(
    (item) => item.actionType === actionType && item.actionId === actionId,
  );
}

export function actionIsCompleted(
  progress: JourneyActionProgress[],
  actionType: "task" | "exam",
  actionId: string,
): boolean {
  return actionProgressFor(progress, actionType, actionId)?.status === "completed";
}

export function openCareActionCount(
  plan: JourneyPlanV2,
  progress: JourneyActionProgress[],
  audience: "patient" | "doctor" = "patient",
): number {
  const tasks = plan.tasks.filter(
    (task) =>
      (audience === "doctor" ||
        (task.visibleToPatient && task.responsible === "patient")) &&
      !actionIsCompleted(progress, "task", task.id),
  ).length;
  const exams = plan.exams.filter(
    (exam) =>
      (audience === "doctor" || exam.visibleToPatient) &&
      !actionIsCompleted(progress, "exam", exam.id),
  ).length;
  return tasks + exams;
}

export function resolvedAppointmentDate(
  plan: JourneyPlanV2,
  appointment: JourneyAppointment,
): string {
  if (appointment.date) return appointment.date;
  if (plan.startDate && appointment.offsetDays != null) {
    return format(
      addDays(parseISO(plan.startDate), appointment.offsetDays),
      "yyyy-MM-dd",
    );
  }
  return "";
}

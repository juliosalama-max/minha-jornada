import type { PatientSummary } from "./types";

export type PatientDashboardFilter =
  | "all"
  | "active"
  | "draft"
  | "attention"
  | "pending"
  | "closed";

export type PatientPopulationStats = {
  total: number;
  active: number;
  withUnreadAlerts: number;
  awaitingEntry: number;
};

export function filterPatientSummaries(
  patients: PatientSummary[],
  query: string,
  filter: PatientDashboardFilter,
): PatientSummary[] {
  const normalized = query.trim().toLocaleLowerCase("pt-BR");

  return patients
    .filter((patient) => {
      if (
        normalized &&
        !patient.name.toLocaleLowerCase("pt-BR").includes(normalized)
      ) {
        return false;
      }

      if (filter === "all") return true;
      if (filter === "active") {
        return (
          patient.journeyStatus === "published" ||
          patient.journeyStatus === "in_review"
        );
      }
      if (filter === "draft") return patient.journeyStatus === "draft";
      if (filter === "attention") {
        return patient.unreadAlerts > 0 || patient.openActions > 0;
      }
      if (filter === "pending") return patient.pending;
      return (
        patient.journeyStatus === "completed" ||
        patient.journeyStatus === "archived"
      );
    })
    .sort((a, b) => {
      const aAttention = a.unreadAlerts > 0 || a.openActions > 0;
      const bAttention = b.unreadAlerts > 0 || b.openActions > 0;
      if (aAttention !== bAttention) return aAttention ? -1 : 1;
      return a.name.localeCompare(b.name, "pt-BR");
    });
}

export function patientPopulationStats(
  patients: PatientSummary[],
): PatientPopulationStats {
  return {
    total: patients.length,
    active: patients.filter(
      (patient) =>
        patient.journeyStatus === "published" ||
        patient.journeyStatus === "in_review",
    ).length,
    withUnreadAlerts: patients.filter((patient) => patient.unreadAlerts > 0)
      .length,
    awaitingEntry: patients.filter((patient) => patient.pending).length,
  };
}

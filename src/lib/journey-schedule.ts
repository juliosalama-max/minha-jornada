import {
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import type {
  JourneyModule,
  JourneyModuleResponse,
} from "./types";

function withinModuleDates(module: JourneyModule, date: Date): boolean {
  if (module.startDate && isBefore(date, parseISO(module.startDate))) return false;
  if (module.endDate && isAfter(date, parseISO(module.endDate))) return false;
  return true;
}

export function responseMatchesPeriod(
  module: JourneyModule,
  response: JourneyModuleResponse,
  date: Date,
): boolean {
  const occurred = parseISO(response.occurredOn);
  if (module.frequency.kind === "daily" || module.frequency.kind === "selected_days") {
    return response.occurredOn === format(date, "yyyy-MM-dd");
  }
  if (module.frequency.kind === "weekly") {
    const start = startOfWeek(date, { weekStartsOn: 1 });
    const end = endOfWeek(date, { weekStartsOn: 1 });
    return !isBefore(occurred, start) && !isAfter(occurred, end);
  }
  if (module.frequency.kind === "monthly") {
    return !isBefore(occurred, startOfMonth(date)) && !isAfter(occurred, endOfMonth(date));
  }
  if (module.frequency.kind === "one_time") return true;
  return response.occurredOn === format(date, "yyyy-MM-dd");
}

export function moduleIsDue(
  module: JourneyModule,
  date: Date,
  responses: JourneyModuleResponse[],
): boolean {
  if (!module.enabled || !withinModuleDates(module, date)) return false;

  if (module.frequency.kind === "event_based") return false;

  if (module.frequency.kind === "selected_days") {
    const days = module.frequency.daysOfWeek ?? [];
    if (!days.includes(date.getDay())) return false;
  }

  const moduleResponses = responses.filter((response) => response.moduleId === module.id);
  return !moduleResponses.some((response) => responseMatchesPeriod(module, response, date));
}

export function dueModulesForDate(
  modules: JourneyModule[],
  date: Date,
  responses: JourneyModuleResponse[],
): JourneyModule[] {
  return modules.filter((module) => moduleIsDue(module, date, responses));
}

export function completedModulesForDate(
  modules: JourneyModule[],
  date: Date,
  responses: JourneyModuleResponse[],
): JourneyModule[] {
  return modules.filter((module) => {
    if (!module.enabled || module.frequency.kind === "event_based") return false;
    const matching = responses
      .filter((response) => response.moduleId === module.id)
      .filter((response) => responseMatchesPeriod(module, response, date));
    if (module.frequency.kind === "one_time") {
      return matching.some((response) => response.occurredOn === format(date, "yyyy-MM-dd"));
    }
    return matching.length > 0;
  });
}

export function eventModules(modules: JourneyModule[], date: Date): JourneyModule[] {
  return modules.filter(
    (module) =>
      module.enabled &&
      module.frequency.kind === "event_based" &&
      withinModuleDates(module, date),
  );
}

export function isLegacyGeneratedJourney(modules: JourneyModule[]): boolean {
  return modules.length > 0 && modules.every((module) => module.id.startsWith("legacy-"));
}

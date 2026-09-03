import type { MedicalConsult, NutritionConsult, SymptomCode, Task } from "./types";

export const APP_NAME = "Minha Jornada";
export const CLINIC_NAME = "Método AGIR";
export const CLINIC_TAGLINE = "A mudança começa com a decisão de agir";
export const CLINIC_WHATSAPP = "5579998733031";
export const CLINIC_WHATSAPP_LABEL = "(79) 99873-3031";
export const CLINIC_INSTAGRAM = "alinelucena.endo";
export const CLINIC_EMAIL = "alinelucena25@gmail.com";

export const WEEKDAYS_MON = ["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"] as const;

export const MONTHS_PT = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
] as const;

export const AEROBIC_OPTIONS: { id: "walk" | "swim" | "run" | "bike" | "dance"; label: string }[] = [
  { id: "walk", label: "Caminhada" },
  { id: "swim", label: "Natação" },
  { id: "run", label: "Corrida" },
  { id: "bike", label: "Bicicleta" },
  { id: "dance", label: "Dança" },
];

export const STRENGTH_OPTIONS: { id: "gym" | "pilates"; label: string }[] = [
  { id: "gym", label: "Musculação" },
  { id: "pilates", label: "Pilates" },
];

export const WEEKDAY_LABELS = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
] as const;

export const SYMPTOMS: { code: SymptomCode; label: string }[] = [
  { code: "S", label: "Sem sintomas" },
  { code: "N", label: "Náusea" },
  { code: "V", label: "Vômito" },
  { code: "C", label: "Constipação" },
  { code: "D", label: "Diarreia" },
  { code: "DA", label: "Dor abdominal" },
  { code: "O", label: "Outro" },
];

export const DEFAULT_CONSULTS: MedicalConsult[] = [];

export const DEFAULT_NUTRITION: NutritionConsult[] = [];

export const DEFAULT_TASKS: Task[] = [];

export const TASK_CATEGORY_LABEL: Record<string, string> = {
  agenda: "Agendamentos do acompanhamento",
  exames: "Avaliações de saúde e exames",
  docs: "Documentos e informações",
  meds: "Medicação e sintomas",
  move: "Movimento e força",
  sleep: "Sono e estresse",
  food: "Alimentação e álcool",
  other: "Outras ações",
};

export const BIOIMPEDANCE_PREP =
  "Mantenha a hidratação habitual, aguarde pelo menos 3 horas após a última refeição, não faça exercício imediatamente antes, urine antes do exame e não use creme nas mãos ou nos pés.";

export const EMERGENCY_COPY =
  "Não espere a próxima consulta se tiver dor no peito, desmaio, falta de ar intensa ou progressiva, vômitos persistentes, dificuldade para se hidratar ou dor abdominal forte. Procure avaliação médica.";

export const INCLUDED: string[] = [];

export const CARE_FOCUS =
  "Acompanhar, de forma individualizada, os pontos definidos na sua Jornada.";

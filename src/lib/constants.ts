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

export const DEFAULT_CONSULTS: MedicalConsult[] = [
  {
    stage: 1,
    period: "Agosto",
    focus: "Avaliação inicial e início do plano",
    date: "",
  },
  {
    stage: 2,
    period: "Setembro",
    focus: "Adaptação e resposta inicial",
    date: "",
  },
  {
    stage: 3,
    period: "Outubro",
    focus: "Rotina alimentar, sono e movimento",
    date: "",
  },
  {
    stage: 4,
    period: "Novembro",
    focus: "Composição corporal e capacidade funcional",
    date: "",
  },
  {
    stage: 5,
    period: "Dezembro",
    focus: "Balanço, festas e continuidade até fevereiro",
    date: "",
  },
];

export const DEFAULT_NUTRITION: NutritionConsult[] = [
  { index: 1, date: "" },
  { index: 2, date: "" },
  { index: 3, date: "" },
];

export const DEFAULT_TASKS: Task[] = [
  {
    id: "shay",
    category: "agenda",
    title: "Marcar com Shay as consultas de setembro, outubro, novembro e dezembro.",
    done: false,
  },
  {
    id: "nutri",
    category: "agenda",
    title: "Marcar a primeira consulta com a nutricionista e combinar as duas seguintes.",
    done: false,
  },
  {
    id: "polissonografia",
    category: "exames",
    title: "Realizar a polissonografia solicitada.",
    done: false,
    meta: { date: "", local: "" },
  },
  {
    id: "laudo-sono",
    category: "exames",
    title: "Levar o laudo da polissonografia à consulta médica.",
    done: false,
  },
  {
    id: "cardio",
    category: "exames",
    title: "Realizar a avaliação e os exames cardiológicos solicitados.",
    done: false,
    meta: { exams: "", dates: "", delivered: "false" },
  },
  {
    id: "laudo-cardio",
    category: "exames",
    title: "Levar os laudos cardiológicos à consulta antes de aumentar a intensidade dos exercícios.",
    done: false,
  },
  {
    id: "figado",
    category: "docs",
    title: "Levar o laudo completo da elastografia hepática e do ultrassom abdominal.",
    done: false,
  },
  {
    id: "meds",
    category: "docs",
    title: "Confirmar a lista e os horários de todas as medicações em uso.",
    done: false,
  },
  {
    id: "aplicacao",
    category: "docs",
    title: "Anotar o dia fixo, a dose aplicada e possíveis efeitos colaterais.",
    done: false,
  },
];

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

export const INCLUDED = [
  "5 consultas médicas, incluindo a inicial, todas com bioimpedância.",
  "4 retornos mensais: setembro, outubro, novembro e dezembro.",
  "3 consultas com a nutricionista, com datas combinadas.",
  "Revisão progressiva da medicação, dos sintomas, do sono, da alimentação e da atividade física.",
];

export const CARE_FOCUS =
  "Reduzir riscos à saúde, proteger o fígado, melhorar o sono e a disposição, preservar a massa muscular e tornar a rotina mais consistente.";

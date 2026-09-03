import { emptyJourneyPlan } from "./journey-plan";
import type { JourneyPlanV2 } from "./types";

function id(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

export function sweetsThirtyDayTemplate(): JourneyPlanV2 {
  const plan = emptyJourneyPlan();
  return {
    ...plan,
    title: "Registro de doces e contexto alimentar — 30 dias",
    durationDays: 30,
    objective:
      "Observar frequência, contexto e relação entre emoções e consumo de doces, sem julgamento.",
    priorities: [
      {
        id: id("priority"),
        title: "Aumentar consciência sobre os episódios",
        description:
          "Registrar o padrão ao longo do ciclo para identificar situações, emoções e necessidades associadas.",
        tracking: "Registro breve de frequência e contexto.",
        reviewDate: "",
      },
    ],
    modules: [
      {
        id: id("module"),
        type: "eating_behavior",
        title: "Doces e contexto",
        enabled: true,
        instructions:
          "Registre no final do dia quantas vezes consumiu doce. Se houve consumo, responda também sobre o contexto antes e depois.",
        frequency: { kind: "daily" },
        startDate: "",
        endDate: "",
        reviewDate: "",
        required: false,
        questions: [
          {
            id: id("question"),
            label: "Quantas vezes você consumiu doce hoje?",
            type: "single_choice",
            required: true,
            options: [
              { id: "none", label: "Nenhuma" },
              { id: "one-three", label: "1–3 vezes" },
              { id: "more-three", label: "Mais de 3 vezes" },
            ],
          },
          {
            id: id("question"),
            label: "Como você estava antes?",
            type: "emotion",
            required: false,
            options: [
              { id: "calm", label: "Tranquila(o)" },
              { id: "anxious", label: "Ansiosa(o)" },
              { id: "sad", label: "Triste" },
              { id: "tired", label: "Cansada(o)" },
              { id: "bored", label: "Entediada(o)" },
              { id: "hungry", label: "Com fome" },
              { id: "urge", label: "Com vontade de comer" },
              { id: "other", label: "Outro" },
            ],
            condition: {
              questionId: "sweets-frequency",
              operator: "not_equals",
              value: "none",
            },
          },
          {
            id: id("question"),
            label: "O que estava acontecendo naquele momento?",
            type: "short_text",
            required: false,
          },
          {
            id: id("question"),
            label: "Como você ficou depois?",
            type: "emotion",
            required: false,
            options: [
              { id: "satisfied", label: "Satisfeita(o)" },
              { id: "indifferent", label: "Igual" },
              { id: "guilty", label: "Com culpa" },
              { id: "uncomfortable", label: "Desconfortável" },
              { id: "other", label: "Outro" },
            ],
          },
          {
            id: id("question"),
            label: "Houve sensação de perda de controle?",
            type: "boolean",
            required: false,
          },
        ],
      },
    ],
  };
}

export function agirInitialTemplate(): JourneyPlanV2 {
  const plan = emptyJourneyPlan();
  return {
    ...plan,
    title: "Método AGIR — ciclo inicial",
    durationDays: 180,
    objective:
      "Acompanhar de forma progressiva os pontos definidos em consulta, com poucos registros úteis entre os encontros.",
    modules: [
      {
        id: id("module"),
        type: "medication",
        title: "Medicação",
        enabled: true,
        instructions: "Registre apenas o que foi combinado em consulta.",
        frequency: { kind: "event_based" },
        startDate: "",
        endDate: "",
        reviewDate: "",
        required: false,
        questions: [],
      },
      {
        id: id("module"),
        type: "food",
        title: "Alimentação",
        enabled: true,
        instructions: "Registre os aspectos alimentares definidos para este ciclo.",
        frequency: { kind: "daily" },
        startDate: "",
        endDate: "",
        reviewDate: "",
        required: false,
        questions: [],
      },
      {
        id: id("module"),
        type: "movement",
        title: "Movimento",
        enabled: true,
        instructions: "Registre os movimentos e exercícios que fizerem parte do seu plano.",
        frequency: { kind: "event_based" },
        startDate: "",
        endDate: "",
        reviewDate: "",
        required: false,
        questions: [],
      },
      {
        id: id("module"),
        type: "sleep",
        title: "Sono",
        enabled: true,
        instructions: "Observe e registre os pontos do sono combinados na consulta.",
        frequency: { kind: "selected_days", daysOfWeek: [1, 3, 5] },
        startDate: "",
        endDate: "",
        reviewDate: "",
        required: false,
        questions: [],
      },
      {
        id: id("module"),
        type: "social",
        title: "Conexões sociais",
        enabled: true,
        instructions: "Faça um check-in breve sobre sua percepção de conexão e apoio.",
        frequency: { kind: "weekly" },
        startDate: "",
        endDate: "",
        reviewDate: "",
        required: false,
        questions: [],
      },
      {
        id: id("module"),
        type: "spirituality",
        title: "Espiritualidade, valores e propósito",
        enabled: true,
        instructions:
          "Registre apenas as práticas ou ações que façam sentido para você e tenham sido combinadas na Jornada.",
        frequency: { kind: "weekly" },
        startDate: "",
        endDate: "",
        reviewDate: "",
        required: false,
        questions: [],
      },
    ],
  };
}

import { flag } from "flags/next";

export const copilotAssistantFlag = flag({
  key: "copilot-assistant",
  description: "Habilita o Copilot Global com IA e sugestões inteligentes de zeladoria",
  defaultValue: true,
  options: [
    { label: "Ativado", value: true },
    { label: "Desativado", value: false },
  ],
  decide() {
    return true;
  },
});

export const preventiveMaintenanceFlag = flag({
  key: "preventive-maintenance",
  description: "Habilita o módulo de agendamentos e vistorias preventivas recorrentes",
  defaultValue: true,
  options: [
    { label: "Ativado", value: true },
    { label: "Desativado", value: false },
  ],
  decide() {
    return true;
  },
});

export const geoDispatchingFlag = flag({
  key: "geo-dispatching",
  description: "Despacho inteligente e ordenação de chamados por proximidade PostGIS",
  defaultValue: true,
  options: [
    { label: "Ativado", value: true },
    { label: "Desativado", value: false },
  ],
  decide() {
    return true;
  },
});

export const devDrawerFlag = flag({
  key: "dev-drawer",
  description: "Exibe a gaveta de testes rápidos e alternância de perfis (Admin, Síndico, Técnico)",
  defaultValue: process.env.NODE_ENV !== "production",
  options: [
    { label: "Visível", value: true },
    { label: "Oculto", value: false },
  ],
  decide() {
    return process.env.NODE_ENV !== "production";
  },
});

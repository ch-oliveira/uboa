/**
 * Design Tokens alinhados ao Refactoring UI e à paleta institucional do Predial Web.
 * Cores, tipografia, elevação e espaçamentos consistentes.
 */

export const Palette = {
  // Fundos & Superfícies
  background: '#F8FAFC',        // Slate 50 limpo e luminoso (idêntico ao web)
  surface: '#FFFFFF',           // Card branco puro elevado
  surfaceSecondary: '#F1F5F9',  // Slate 100 para chips e containers secundários
  surfaceHover: '#E2E8F0',

  // Identidade Institucional (Predial)
  primary: '#0A2540',           // Azul-marinho corporativo profundo
  primaryForeground: '#FFFFFF',
  accent: '#2563EB',            // Azul elétrico refinado (botões de ação primária)
  accentHover: '#1D4ED8',
  accentSubtle: '#EFF6FF',      // Fundo azul leve para tags e destaques

  // Tipografia (Hierarquia de 3 tons, todos com contraste >= 4.5:1)
  textPrimary: '#0F172A',       // Slate 900 (conteúdo principal, títulos)
  textSecondary: '#475569',     // Slate 600 (legível para textos de apoio)
  textMuted: '#64748B',         // Slate 500 (metadados e rótulos secundários)
  textDisabled: '#94A3B8',

  // Linhas e Divisórias
  border: '#E2E8F0',            // Linha suave de 1px
  borderSubtle: '#F1F5F9',

  // Semântica de Atendimento (Fundos pastéis + textos escuros saturados)
  urgente: {
    bg: '#FEF2F2',
    border: '#FECACA',
    text: '#B91C1C',
    badge: '#991B1B',
  },
  alta: {
    bg: '#FFF7ED',
    border: '#FFD8B2',
    text: '#C2410C',
    badge: '#9A3412',
  },
  media: {
    bg: '#FEFCE8',
    border: '#FEF08A',
    text: '#A16207',
    badge: '#854D0E',
  },
  sucesso: {
    bg: '#ECFDF5',
    border: '#A7F3D0',
    text: '#047857',
    badge: '#065F46',
  },
  info: {
    bg: '#EFF6FF',
    border: '#BFDBFE',
    text: '#1D4ED8',
    badge: '#1E40AF',
  },
};

export const Shadows = {
  card: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  floating: {
    shadowColor: '#0A2540',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
  },
};

export const Radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  full: 9999,
};

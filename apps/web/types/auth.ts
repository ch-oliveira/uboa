export type UserRole = 'ADMIN' | 'GESTOR' | 'TECNICO' | 'SOLICITANTE';

export interface UserAccount {
  id: string;
  nome: string;
  email: string;
  senhaHash: string; // Senha padrão de testes "123"
  role: UserRole;
  cargo?: string;
  especialidade?: string;
  predio?: string;
  avatar?: string;
  telefone?: string;
}

// Perfis e contas iniciais para demonstração das personas
export const SEED_USERS: UserAccount[] = [
  {
    id: 'user-gestor',
    nome: 'Mariana Alves',
    email: 'gestor@zelo.gov.br',
    senhaHash: '123',
    role: 'GESTOR',
    cargo: 'Gestora Municipal de Zeladoria',
    avatar: 'https://i.pravatar.cc/150?u=mariana',
    telefone: '(11) 3241-8900',
  },
  {
    id: 'user-tecnico-1',
    nome: 'Carlos Silva',
    email: 'carlos.tecnico@zelo.gov.br',
    senhaHash: '123',
    role: 'TECNICO',
    cargo: 'Técnico Especialista em Elétrica & Hidráulica',
    especialidade: 'Elétrica & Hidráulica',
    avatar: 'https://i.pravatar.cc/150?u=carlos',
    telefone: '(11) 98765-4321',
  },
  {
    id: 'user-tecnico-2',
    nome: 'Marcos Oliveira',
    email: 'marcos.tecnico@zelo.gov.br',
    senhaHash: '123',
    role: 'TECNICO',
    cargo: 'Técnico em Alvenaria & Estruturas',
    especialidade: 'Alvenaria & Pintura',
    avatar: 'https://i.pravatar.cc/150?u=marcos',
    telefone: '(11) 98765-4322',
  },
  {
    id: 'user-solicitante-escola',
    nome: 'Profª Maria Clara',
    email: 'maria.escola@zelo.gov.br',
    senhaHash: '123',
    role: 'SOLICITANTE',
    cargo: 'Diretora Escolar',
    predio: 'EMEF Paulo Freire',
    avatar: 'https://i.pravatar.cc/150?u=maria',
    telefone: '(11) 4589-1020',
  },
  {
    id: 'user-solicitante-ubs',
    nome: 'Dr. Marcelo Ramos',
    email: 'marcelo.ubs@zelo.gov.br',
    senhaHash: '123',
    role: 'SOLICITANTE',
    cargo: 'Coordenador Médico de UBS',
    predio: 'UBS Vila Nova',
    avatar: 'https://i.pravatar.cc/150?u=marcelo',
    telefone: '(11) 4589-2040',
  },
];

export type CategoriaServico = 'escola' | 'saude' | 'praca' | 'acessibilidade';

export interface ServicoPublico {
  id: string;
  protocolo: string;
  titulo: string;
  bairro: string;
  local: string;
  categoria: CategoriaServico;
  descricao: string;
  status: 'CONCLUIDO' | 'EM_EXECUCAO' | 'AGENDADO';
  tempoAtendimento: string;
  concluidoEm: string;
  custoTotal: number;
  validadoPor: string;
  /** Diptych image: left half is "antes", right half is "depois". */
  foto: string;
  aplausos: number;
}

export interface MetricasTransparencia {
  totalResolvidos: number;
  taxaSla: number;
  tempoMedioHoras: number;
  litrosAguaPoupados: number;
  lampadasAcesas: number;
  escolasAtendidas: number;
  economiaContratualReais: number;
  satisfacaoMedia: number;
  atualizadoEm: string;
}

export const METRICAS_TRANSPARENCIA: MetricasTransparencia = {
  totalResolvidos: 3482,
  taxaSla: 98.7,
  tempoMedioHoras: 3.8,
  litrosAguaPoupados: 1840000,
  lampadasAcesas: 2140,
  escolasAtendidas: 68,
  economiaContratualReais: 584200,
  satisfacaoMedia: 4.9,
  atualizadoEm: 'hoje, 10:45',
};

export const BAIRROS_LISTA = [
  'Todos os bairros',
  'Centro Histórico',
  'Jardim das Flores',
  'Vila Nova',
  'Bela Vista',
  'Distrito Norte',
  'Vila Esperança',
] as const;

export const CATEGORIAS_LISTA: ReadonlyArray<{ id: CategoriaServico | 'todos'; label: string }> = [
  { id: 'todos', label: 'Tudo' },
  { id: 'escola', label: 'Escolas' },
  { id: 'saude', label: 'Saúde' },
  { id: 'praca', label: 'Praças' },
  { id: 'acessibilidade', label: 'Acessibilidade' },
];

export const CATEGORIA_LABEL: Record<CategoriaServico, string> = {
  escola: 'Escola',
  saude: 'Saúde',
  praca: 'Praça',
  acessibilidade: 'Acessibilidade',
};

export const SERVICOS_PUBLICOS: ServicoPublico[] = [
  {
    id: 'sp-1',
    protocolo: 'OS-104922',
    titulo: 'Quadro de luz novinho na escola',
    bairro: 'Jardim das Flores',
    local: 'EMEF Paulo Freire',
    categoria: 'escola',
    descricao: 'Disjuntores velhos que desarmavam os computadores da turma da tarde foram trocados, com proteção contra raios.',
    status: 'CONCLUIDO',
    tempoAtendimento: '2h45',
    concluidoEm: 'ontem',
    custoTotal: 840.5,
    validadoPor: 'Profª Maria Clara, diretora',
    foto: '/images/transparencia/quadro-eletrico.jpg',
    aplausos: 142,
  },
  {
    id: 'sp-2',
    protocolo: 'OS-104930',
    titulo: 'Fim do pinga-pinga no posto',
    bairro: 'Vila Nova',
    local: 'UBS Central',
    categoria: 'saude',
    descricao: 'Torneiras automáticas no lugar das antigas. Eram cerca de 800 litros de água jogados fora por dia.',
    status: 'CONCLUIDO',
    tempoAtendimento: '3h10',
    concluidoEm: 'hoje',
    custoTotal: 1250,
    validadoPor: 'Dr. Marcelo Ramos, chefe da UBS',
    foto: '/images/transparencia/torneiras-ubs.jpg',
    aplausos: 98,
  },
  {
    id: 'sp-3',
    protocolo: 'OS-104918',
    titulo: 'Pracinha iluminada de novo',
    bairro: 'Centro Histórico',
    local: 'Praça da Matriz',
    categoria: 'praca',
    descricao: 'Pedido de moradores pelo 156: postes de LED novos e balanços consertados. Dá pra brincar depois das 18h.',
    status: 'CONCLUIDO',
    tempoAtendimento: '4h',
    concluidoEm: 'há 2 dias',
    custoTotal: 2190,
    validadoPor: 'Associação de Moradores do Centro',
    foto: '/images/transparencia/praca-led.jpg',
    aplausos: 230,
  },
  {
    id: 'sp-4',
    protocolo: 'OS-104895',
    titulo: 'Rampa nova na creche',
    bairro: 'Bela Vista',
    local: 'CEI Cantinho do Saber',
    categoria: 'acessibilidade',
    descricao: 'Adeus degrau quebrado. Rampa antiderrapante, piso tátil e corrimão duplo para carrinhos e cadeirantes.',
    status: 'CONCLUIDO',
    tempoAtendimento: '1 dia',
    concluidoEm: 'há 3 dias',
    custoTotal: 1820,
    validadoPor: 'Carla Nogueira, coordenadora',
    foto: '/images/transparencia/rampa-creche.jpg',
    aplausos: 310,
  },
  {
    id: 'sp-5',
    protocolo: 'OS-104880',
    titulo: 'Biblioteca sem goteira',
    bairro: 'Distrito Norte',
    local: 'Biblioteca Castro Alves',
    categoria: 'escola',
    descricao: 'Telhas trocadas e calhas desentupidas. Os livros saíram do plástico e voltaram pras prateleiras.',
    status: 'CONCLUIDO',
    tempoAtendimento: '5h30',
    concluidoEm: 'há 4 dias',
    custoTotal: 960,
    validadoPor: 'Helena Bastos, bibliotecária',
    foto: '/images/transparencia/biblioteca-telhado.jpg',
    aplausos: 184,
  },
  {
    id: 'sp-6',
    protocolo: 'OS-104860',
    titulo: 'Dentista voltou a atender',
    bairro: 'Vila Esperança',
    local: 'UBS Vila Esperança',
    categoria: 'saude',
    descricao: 'O compressor da cadeira odontológica foi consertado no mesmo turno. Consultas remarcadas pra semana.',
    status: 'CONCLUIDO',
    tempoAtendimento: '2h15',
    concluidoEm: 'há 5 dias',
    custoTotal: 430,
    validadoPor: 'Dra. Vanessa Lins, dentista',
    foto: '/images/transparencia/odonto-ubs.jpg',
    aplausos: 167,
  },
];

export const DEPOIMENTOS_CIDADAOS = [
  {
    nome: 'Luciana Prado',
    cargo: 'Diretora de escola',
    texto: 'Antes eu mandava ofício e esperava três semanas no calor. Ontem apertei um botão no celular e o técnico chegou em 40 minutos.',
    avatar: 'LP',
  },
  {
    nome: 'Seu Agenor',
    cargo: 'Pai de aluno, Vila Nova',
    texto: 'Vi no celular que a torneira da creche do meu filho foi arrumada no mesmo dia. Com foto e com a conta do que gastaram.',
    avatar: 'AS',
  },
  {
    nome: 'Camila Duarte',
    cargo: 'Gerente de UBS',
    texto: 'Na saúde não dá pra esperar. Agora tem relógio correndo e todo mundo sabe com quem está o chamado.',
    avatar: 'CD',
  },
];

import { Prioridade, OrdemServico } from '@/app/kanban/data';

export interface CriterioMatriz {
  id: string;
  nome: string;
  descricao: string;
  peso: 'ALTO' | 'MEDIO' | 'CRITICO';
  perguntasGuia: string[];
}

export const MATRIZ_CRITERIOS_URBOA: CriterioMatriz[] = [
  {
    id: 'seguranca',
    nome: '1. Risco à Segurança e Integridade Física',
    descricao: 'Ameaça direta a munícipes, pacientes, alunos ou servidores (choque elétrico, risco de desabamento, incêndio, contaminação biológica ou vazamento de gás).',
    peso: 'CRITICO',
    perguntasGuia: [
      'Há risco imediato de acidentes ou contato com eletricidade/água?',
      'O ambiente oferece risco sanitário ou contaminação biológica?',
      'Há pessoas circulando na área de perigo?'
    ]
  },
  {
    id: 'servico_essencial',
    nome: '2. Interrupção de Serviço Essencial',
    descricao: 'Impacto direto no fornecimento de serviços públicos contínuos (saúde básica, pronto-atendimento, aulas na rede municipal, fornecimento de merenda ou água potável).',
    peso: 'CRITICO',
    perguntasGuia: [
      'Procedimentos médicos ou cirúrgicos foram paralisados?',
      'Aulas ou atividades pedagógicas precisaram ser suspensas?',
      'Há falta de água ou energia que impeça o funcionamento da unidade?'
    ]
  },
  {
    id: 'alcance',
    nome: '3. Alcance e Abrangência do Problema',
    descricao: 'Extensão territorial e populacional atingida pela ocorrência no prédio público.',
    peso: 'MEDIO',
    perguntasGuia: [
      'O problema é restrito a uma sala/posto ou atinge o prédio inteiro?',
      'Quantos munícipes ou servidores são afetados diretamente?',
      'Afeta área de circulação principal ou área secundária de depósito?'
    ]
  },
  {
    id: 'tempo_agravamento',
    nome: '4. Tempo até Agravamento do Dano',
    descricao: 'Velocidade com que a anomalia pode deteriorar a infraestrutura predial ou multiplicar os custos de reparo se não contida rapidamente.',
    peso: 'ALTO',
    perguntasGuia: [
      'A água ou esgoto continua vazando de forma ativa na estrutura?',
      'O atraso na intervenção pode causar colapso de lajes, forros ou circuitos?',
      'O tempo meteorológico (chuva/vento) pode acelerar o dano nas próximas 24h?'
    ]
  },
  {
    id: 'alternativa',
    nome: '5. Existência de Alternativa ou Contingência',
    descricao: 'Capacidade da unidade de contornar temporariamente a falha sem paralisar o atendimento público.',
    peso: 'ALTO',
    perguntasGuia: [
      'Existe outro equipamento em funcionamento na unidade (ex: autoclave reserva)?',
      'É possível remanejar o atendimento para outra sala sem perda de qualidade?',
      'A unidade vizinha pode prestar apoio imediato para o serviço afetado?'
    ]
  }
];

export interface UrbiTriageResult {
  suggestedPriority: Prioridade;
  requerConfirmacao: boolean;
  dadosInformados: string;
  possivelImpacto: string;
  perguntasEmAberto: [string, string, string];
  criteriosMatriz: {
    criterio: string;
    status: 'ATENDIDO' | 'PARCIAL' | 'NAO_APLICAVEL' | 'A_CONFIRMAR';
    observacao: string;
  }[];
  fundamentacaoTecnica: string;
}

/**
 * Motor de Apoio à Triagem Urbi
 * Avalia o texto do chamado, a tipologia do prédio e identifica indícios
 * separando: Dado Informado vs. Possível Impacto vs. Perguntas em Aberto.
 */
export function analyzeTriageUrbi(order: Partial<OrdemServico>): UrbiTriageResult {
  const text = `${order.titulo || ''} ${order.descricao || ''}`.toLowerCase();
  const predio = (order.predio || '').toLowerCase();
  const isUbs = predio.includes('ubs') || predio.includes('saúde') || predio.includes('posto');
  const isEscola = predio.includes('emef') || predio.includes('emei') || predio.includes('creche') || predio.includes('escola');

  // Caso 1: Esterilização / Bomba de água em UBS (Exemplo canônico de alto impacto)
  if (isUbs && (text.includes('esteriliza') || text.includes('bomba') || text.includes('autoclave') || text.includes('pressão'))) {
    return {
      suggestedPriority: 'ALTA',
      requerConfirmacao: true,
      dadosInformados: 'Falta de pressão de água para esterilização de equipamentos; Unidade: UBS.',
      possivelImpacto: 'A atividade de esterilização pode estar comprometida, com risco de desabastecimento de instrumental para curativos e consultas.',
      perguntasEmAberto: [
        'O processo de esterilização está totalmente parado na unidade?',
        'Existe autoclave reserva ou alternativa funcional disponível?',
        'Algum atendimento a pacientes já foi afetado ou suspenso?'
      ],
      criteriosMatriz: [
        { criterio: 'Risco à Segurança e Sanitário', status: 'ATENDIDO', observacao: 'Risco biológico caso material sem esterilização adequada seja manipulado.' },
        { criterio: 'Interrupção de Serviço Essencial', status: 'A_CONFIRMAR', observacao: 'Serviço de saúde básico pode ser interrompido se os instrumentais esgotarem.' },
        { criterio: 'Alcance do Problema', status: 'PARCIAL', observacao: 'Localizado no consultório/central de material, mas impacta a unidade toda.' },
        { criterio: 'Tempo até Agravamento', status: 'ATENDIDO', observacao: 'O estoque de instrumental estéril tem autonomia limitada (poucas horas).' },
        { criterio: 'Existência de Alternativa', status: 'A_CONFIRMAR', observacao: 'Verificar se outra UBS da rede municipal pode receber a demanda de esterilização.' }
      ],
      fundamentacaoTecnica: 'Chamados em Unidades Básicas de Saúde envolvendo água e esterilização possuem alta probabilidade de paralisar a linha de cuidado. Recomenda-se prioridade Alta, condicionada à verificação de contingência pela operadora.'
    };
  }

  // Caso 2: Elétrica crítica / Aquecimento / Curto
  if (text.includes('elétric') || text.includes('superaquec') || text.includes('disjuntor') || text.includes('fogo') || text.includes('curto') || text.includes('fumaça')) {
    return {
      suggestedPriority: 'URGENTE',
      requerConfirmacao: true,
      dadosInformados: `Instalação elétrica com indício de sobrecarga/aquecimento; Unidade: ${order.predio || 'Prédio Público'}.`,
      possivelImpacto: 'Risco iminente de curto-circuito, princípio de incêndio e corte desordenado de energia elétrica.',
      perguntasEmAberto: [
        'Há faíscas, fumaça ou cheiro de queimado no local?',
        'O disjuntor principal foi desarmado preventivamente?',
        'Há munícipes ou estudantes próximos ao quadro de comando elétrico?'
      ],
      criteriosMatriz: [
        { criterio: 'Risco à Segurança e Integridade Física', status: 'ATENDIDO', observacao: 'Risco direto à vida por eletrocussão ou combustão.' },
        { criterio: 'Interrupção de Serviço Essencial', status: 'ATENDIDO', observacao: 'Queda de disjuntor interrompe equipamentos e iluminação.' },
        { criterio: 'Alcance do Problema', status: 'ATENDIDO', observacao: 'Quadro principal alimenta múltiplas salas da unidade.' },
        { criterio: 'Tempo até Agravamento', status: 'ATENDIDO', observacao: 'Superaquecimento progride para derretimento e curto em curto prazo.' },
        { criterio: 'Existência de Alternativa', status: 'NAO_APLICAVEL', observacao: 'Sem alternativa viável sem intervenção de eletricista qualificado.' }
      ],
      fundamentacaoTecnica: 'Anomalias térmicas em sistemas de energia demandam isolamento do perigo e despacho de equipe de emergência (SLA 4h).'
    };
  }

  // Caso 3: Infiltração / Goteira / Alagamento
  if (text.includes('infiltra') || text.includes('goteira') || text.includes('telhado') || text.includes('vazamento') || text.includes('alagamento')) {
    const isHigh = isEscola || isUbs || text.includes('intensa') || text.includes('forte') || text.includes('forro');
    return {
      suggestedPriority: isHigh ? 'ALTA' : 'MEDIA',
      requerConfirmacao: true,
      dadosInformados: `Infiltração de água relatada; Unidade: ${order.predio || 'Prédio Público'}.`,
      possivelImpacto: isHigh
        ? 'Risco de desabamento de forro e contato de água com fiações embutidas, ameaçando o espaço.'
        : 'Desgaste gradual de alvenaria e pintura, com formação de poças superficiais.',
      perguntasEmAberto: [
        'O espaço afetado foi isolado para evitar acidentes com servidores ou público?',
        'A água está em contato com luminárias, tomadas ou aparelhos eletrônicos?',
        'O vazamento é decorrente de chuva ou de tubulação pressurizada rompida?'
      ],
      criteriosMatriz: [
        { criterio: 'Risco à Segurança e Integridade Física', status: isHigh ? 'PARCIAL' : 'NAO_APLICAVEL', observacao: 'Risco de queda de placas de gesso ou choque se atingir lâmpadas.' },
        { criterio: 'Interrupção de Serviço Essencial', status: isHigh ? 'ATENDIDO' : 'NAO_APLICAVEL', observacao: 'Sala interditada impede atividades normais.' },
        { criterio: 'Alcance do Problema', status: 'PARCIAL', observacao: 'Restrito ao cômodo, mas com potencial de expansão para cômodos contíguos.' },
        { criterio: 'Tempo até Agravamento', status: 'ATENDIDO', observacao: 'Acelera com previsão de chuvas contínuas.' },
        { criterio: 'Existência de Alternativa', status: 'A_CONFIRMAR', observacao: 'Verificar disponibilidade de outra sala para acomodar a equipe.' }
      ],
      fundamentacaoTecnica: 'Infiltrações em áreas de permanência prolongada devem ser contidas antes que afetem forros minerais e instalações elétricas.'
    };
  }

  // Caso 4: Acessibilidade e Vias
  if (text.includes('rampa') || text.includes('acessibilidade') || text.includes('cadeirante') || text.includes('corrimão') || text.includes('piso tátil')) {
    return {
      suggestedPriority: 'MEDIA',
      requerConfirmacao: true,
      dadosInformados: `Dano estrutural em rampa ou via acessível; Unidade: ${order.predio || 'Prédio Público'}.`,
      possivelImpacto: 'Dificuldade de locomoção ou risco de queda de munícipes com mobilidade reduzida.',
      perguntasEmAberto: [
        'Existe via alternativa acessível para entrada de ambulâncias ou cadeirantes?',
        'Houve algum incidente ou queda registrado no local?',
        'Foi afixada sinalização provisória de piso irregular?'
      ],
      criteriosMatriz: [
        { criterio: 'Risco à Segurança e Integridade Física', status: 'PARCIAL', observacao: 'Risco moderado de tropeço e queda.' },
        { criterio: 'Interrupção de Serviço Essencial', status: 'PARCIAL', observacao: 'Prejudica o direito de acesso, mas não fecha a unidade.' },
        { criterio: 'Alcance do Problema', status: 'PARCIAL', observacao: 'Impacta munícipes com deficiência e idosos.' },
        { criterio: 'Tempo até Agravamento', status: 'NAO_APLICAVEL', observacao: 'Dano mecânico estável, agravamento lento.' },
        { criterio: 'Existência de Alternativa', status: 'A_CONFIRMAR', observacao: 'Verificar se outros acessos cumprem a NBR 9050.' }
      ],
      fundamentacaoTecnica: 'Manutenção de acessibilidade prioritária para garantia de inclusão e mitigação de responsabilidade civil municipal.'
    };
  }

  // Fallback Genérico
  const currentPri = order.prioridade || 'MEDIA';
  return {
    suggestedPriority: currentPri,
    requerConfirmacao: true,
    dadosInformados: `${order.descricao || order.titulo || 'Ocorrência registrada'}; Unidade: ${order.predio || 'Prédio Municipal'}.`,
    possivelImpacto: currentPri === 'ALTA' || currentPri === 'URGENTE' 
      ? 'Possível comprometimento operacional que demanda despacho rápido da zeladoria.'
      : 'Falha funcional contida passível de programação regular de manutenção.',
    perguntasEmAberto: [
      'A falha interrompe a rotina de trabalho ou atendimento do setor?',
      'Há risco imediato para os ocupantes do prédio público?',
      'Existe alternativa técnica ou remanejamento provisório até a visita?'
    ],
    criteriosMatriz: [
      { criterio: 'Risco à Segurança', status: currentPri === 'URGENTE' ? 'ATENDIDO' : 'NAO_APLICAVEL', observacao: 'Avaliado conforme descrição inicial.' },
      { criterio: 'Interrupção de Serviço', status: currentPri === 'ALTA' ? 'ATENDIDO' : 'PARCIAL', observacao: 'Depende da frequência de uso do setor.' },
      { criterio: 'Alcance do Problema', status: 'PARCIAL', observacao: 'Circunscrito ao setor informado.' },
      { criterio: 'Tempo até Agravamento', status: 'PARCIAL', observacao: 'Requer avaliação in loco pelo técnico.' },
      { criterio: 'Existência de Alternativa', status: 'A_CONFIRMAR', observacao: 'Checar com o solicitante.' }
    ],
    fundamentacaoTecnica: 'Sugestão preliminar com base nas palavras-chave da ocorrência. O julgamento do operador municipal prevalece sobre a recomendação do Urbi.'
  };
}

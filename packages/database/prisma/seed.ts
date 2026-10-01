import { PrismaClient, Role, TipoPredio, Prioridade, StatusOS, AuditAction } from '../src/generated/index.js';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('[seed] A execucao de seed destrutivo esta bloqueada em ambiente de producao.');
  }

  // Limpar tabelas dependentes para garantir integridade e consistência limpa
  await prisma.auditoriaLog.deleteMany();
  await prisma.ordemServico.deleteMany();
  await prisma.agendaVistoria.deleteMany();
  await prisma.predio.deleteMany();
  await prisma.usuario.deleteMany();

  // Senha configurável via variável de ambiente (SEED_DEFAULT_PASSWORD) com fallback para dev local
  const seedPassword = process.env.SEED_DEFAULT_PASSWORD || 'Urboa@2026!';
  const defaultPasswordHash = await bcrypt.hash(seedPassword, 10);

  // 1. Criar Usuários do Sistema
  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@urboa.gov.br' },
    update: { senha_hash: defaultPasswordHash },
    create: {
      id: 'user-admin',
      nome: 'Desenvolvedor / Admin',
      email: 'admin@urboa.gov.br',
      senha_hash: defaultPasswordHash,
      role: Role.ADMIN,
      telefone: '(11) 99999-0000',
    },
  });

  const gestor = await prisma.usuario.upsert({
    where: { email: 'gestor@urboa.gov.br' },
    update: { senha_hash: defaultPasswordHash },
    create: {
      id: 'user-gestor',
      nome: 'Mariana Alves',
      email: 'gestor@urboa.gov.br',
      senha_hash: defaultPasswordHash,
      role: Role.GESTOR,
      telefone: '(11) 3241-8900',
    },
  });

  const tecCarlos = await prisma.usuario.upsert({
    where: { email: 'carlos.tecnico@urboa.gov.br' },
    update: { senha_hash: defaultPasswordHash },
    create: {
      id: 'user-tecnico-1',
      nome: 'Carlos Silva',
      email: 'carlos.tecnico@urboa.gov.br',
      senha_hash: defaultPasswordHash,
      role: Role.TECNICO,
      telefone: '(11) 98765-4321',
    },
  });

  const tecRoberto = await prisma.usuario.upsert({
    where: { email: 'roberto.tecnico@urboa.gov.br' },
    update: { senha_hash: defaultPasswordHash },
    create: {
      id: 'user-tecnico-3',
      nome: 'Roberto Santos',
      email: 'roberto.tecnico@urboa.gov.br',
      senha_hash: defaultPasswordHash,
      role: Role.TECNICO,
      telefone: '(11) 98765-4323',
    },
  });

  const tecMarcos = await prisma.usuario.upsert({
    where: { email: 'marcos.tecnico@urboa.gov.br' },
    update: { senha_hash: defaultPasswordHash },
    create: {
      id: 'user-tecnico-2',
      nome: 'Marcos Oliveira',
      email: 'marcos.tecnico@urboa.gov.br',
      senha_hash: defaultPasswordHash,
      role: Role.TECNICO,
      telefone: '(11) 98765-4322',
    },
  });

  const tecLucas = await prisma.usuario.upsert({
    where: { email: 'lucas.tecnico@urboa.gov.br' },
    update: { senha_hash: defaultPasswordHash },
    create: {
      id: 'user-tecnico-4',
      nome: 'Lucas Pereira',
      email: 'lucas.tecnico@urboa.gov.br',
      senha_hash: defaultPasswordHash,
      role: Role.TECNICO,
      telefone: '(11) 98765-4324',
    },
  });

  const solEscola = await prisma.usuario.upsert({
    where: { email: 'maria.escola@urboa.gov.br' },
    update: { senha_hash: defaultPasswordHash },
    create: {
      id: 'user-solicitante-escola',
      nome: 'Profª Maria Clara',
      email: 'maria.escola@urboa.gov.br',
      senha_hash: defaultPasswordHash,
      role: Role.SOLICITANTE,
      telefone: '(11) 4589-1020',
    },
  });

  const solUbs = await prisma.usuario.upsert({
    where: { email: 'marcelo.ubs@urboa.gov.br' },
    update: { senha_hash: defaultPasswordHash },
    create: {
      id: 'user-solicitante-ubs',
      nome: 'Dr. Marcelo Ramos',
      email: 'marcelo.ubs@urboa.gov.br',
      senha_hash: defaultPasswordHash,
      role: Role.SOLICITANTE,
      telefone: '(11) 4589-2040',
    },
  });

  const solPrefeitura = await prisma.usuario.upsert({
    where: { email: 'fernanda.prefeitura@urboa.gov.br' },
    update: { senha_hash: defaultPasswordHash },
    create: {
      id: 'user-solicitante-pref',
      nome: 'Fernanda Lima',
      email: 'fernanda.prefeitura@urboa.gov.br',
      senha_hash: defaultPasswordHash,
      role: Role.SOLICITANTE,
      telefone: '(11) 3241-8910',
    },
  });

  // 2. Prédios Públicos Municipais (10 Unidades)
  const prediosData = [
    { id: 'u-1', nome: 'EMEF Paulo Freire', tipo: TipoPredio.ESCOLA, endereco: 'Av. dos Estudantes, 450 - Centro', gestor_id: solEscola.id },
    { id: 'u-2', nome: 'EMEI Sementinha', tipo: TipoPredio.ESCOLA, endereco: 'Rua das Flores, 112 - Jardim das Palmeiras', gestor_id: gestor.id },
    { id: 'u-10', nome: 'EMEF Santos Dumont', tipo: TipoPredio.ESCOLA, endereco: 'Rua Santos Dumont, 80 - Aeroporto', gestor_id: gestor.id },
    { id: 'u-3', nome: 'UBS Vila Nova', tipo: TipoPredio.UBS, endereco: 'Rua São Jorge, 780 - Vila Nova', gestor_id: solUbs.id },
    { id: 'u-4', nome: 'UBS Central', tipo: TipoPredio.UBS, endereco: 'Praça da Saúde, 35 - Centro', gestor_id: gestor.id },
    { id: 'u-5', nome: 'UBS Vila Esperança', tipo: TipoPredio.UBS, endereco: 'Av. da Paz, 99 - Vila Esperança', gestor_id: gestor.id },
    { id: 'u-6', nome: 'Prefeitura – Ala Sul', tipo: TipoPredio.ADMINISTRATIVO, endereco: 'Praça dos Três Poderes, 1 - Centro', gestor_id: solPrefeitura.id },
    { id: 'u-7', nome: 'Praça da Matriz', tipo: TipoPredio.PRACA, endereco: 'Rua Central, s/n - Centro Histórico', gestor_id: gestor.id },
    { id: 'u-8', nome: 'Biblioteca Municipal', tipo: TipoPredio.ADMINISTRATIVO, endereco: 'Rua Rui Barbosa, 210 - Centro', gestor_id: gestor.id },
    { id: 'u-9', nome: 'Secretaria de Obras', tipo: TipoPredio.ADMINISTRATIVO, endereco: 'Av. Industrial, 1500 - Distrito Industrial', gestor_id: gestor.id },
  ];

  for (const p of prediosData) {
    await prisma.predio.upsert({
      where: { id: p.id },
      update: { nome: p.nome, tipo: p.tipo, endereco: p.endereco, gestor_id: p.gestor_id },
      create: p,
    });
  }

  // 3. Ordens de Serviço (26 Chamados cobrindo todos os fluxos e especialidades)
  const ordens = [
    // ─── TRIAGEM (4 ordens) ──────────────────────────────────────────
    {
      id: 'os-triagem-1',
      codigo: 'OS-104930',
      titulo: 'Vazamento com refluxo na cozinha e refeitório',
      descricao: 'Local: Cozinha Principal • Categoria: Hidráulica\n\nRefluxo de água na pia do refeitório de alunos durante o preparo da merenda.',
      prioridade: Prioridade.URGENTE,
      status: StatusOS.EM_TRIAGEM,
      predio_id: 'u-1', // EMEF Paulo Freire
      solicitante_id: solEscola.id,
      tecnico_atribuido_id: null,
      fotos: [],
    },
    {
      id: 'os-triagem-2',
      codigo: 'OS-104931',
      titulo: 'Disjuntor geral desarmando na sala de vacinas',
      descricao: 'Local: Sala de Imunização 02 • Categoria: Elétrica\n\nQueda de energia intermitente na câmara fria de armazenamento de vacinas.',
      prioridade: Prioridade.ALTA,
      status: StatusOS.EM_TRIAGEM,
      predio_id: 'u-4', // UBS Central
      solicitante_id: gestor.id,
      tecnico_atribuido_id: null,
      fotos: [],
    },
    {
      id: 'os-triagem-3',
      codigo: 'OS-104932',
      titulo: 'Portão basculante da garagem travado',
      descricao: 'Local: Portão Principal de Veículos • Categoria: Acessibilidade & Serralheria\n\nCabo de aço desgastado impedindo saída dos caminhões de limpeza urbana.',
      prioridade: Prioridade.MEDIA,
      status: StatusOS.EM_TRIAGEM,
      predio_id: 'u-9', // Secretaria de Obras
      solicitante_id: gestor.id,
      tecnico_atribuido_id: null,
      fotos: [],
    },
    {
      id: 'os-triagem-4',
      codigo: 'OS-104933',
      titulo: 'Lâmpadas tubulares queimadas na recepção',
      descricao: 'Local: Hall de Entrada • Categoria: Elétrica\n\nTrês luminárias piscando na área de atendimento ao cidadão.',
      prioridade: Prioridade.BAIXA,
      status: StatusOS.EM_TRIAGEM,
      predio_id: 'u-6', // Prefeitura Ala Sul
      solicitante_id: solPrefeitura.id,
      tecnico_atribuido_id: null,
      fotos: [],
    },

    // ─── AGENDADO (4 ordens) ──────────────────────────────────────────
    {
      id: 'os-agendado-1',
      codigo: 'OS-104934',
      titulo: 'Revisão preventiva e limpeza de reservatório d água',
      descricao: 'Local: Torre Elevada de Água • Categoria: Hidráulica\n\nAgendada desinfecção semestral dos reservatórios para garantia de potabilidade.',
      prioridade: Prioridade.ALTA,
      status: StatusOS.AGENDADO,
      predio_id: 'u-3', // UBS Vila Nova
      solicitante_id: solUbs.id,
      tecnico_atribuido_id: tecRoberto.id,
      fotos: [],
    },
    {
      id: 'os-agendado-2',
      codigo: 'OS-104935',
      titulo: 'Substituição de caixilhos e vidros de segurança',
      descricao: 'Local: Sala de Leitura Infantojuvenil • Categoria: Alvenaria & Vidraçaria\n\nTroca de janela com trinco danificado e vidro trincado.',
      prioridade: Prioridade.MEDIA,
      status: StatusOS.AGENDADO,
      predio_id: 'u-8', // Biblioteca Municipal
      solicitante_id: gestor.id,
      tecnico_atribuido_id: tecMarcos.id,
      fotos: [],
    },
    {
      id: 'os-agendado-3',
      codigo: 'OS-104936',
      titulo: 'Instalação de barras de apoio nos sanitários acessíveis',
      descricao: 'Local: Sanitário Público da Praça • Categoria: Acessibilidade\n\nAdequação à norma NBR 9050 para atendimento a pessoas com deficiência.',
      prioridade: Prioridade.MEDIA,
      status: StatusOS.AGENDADO,
      predio_id: 'u-7', // Praça da Matriz
      solicitante_id: gestor.id,
      tecnico_atribuido_id: tecLucas.id,
      fotos: [],
    },
    {
      id: 'os-agendado-4',
      codigo: 'OS-104937',
      titulo: 'Pintura de faixas de pedestre e gradil escolar',
      descricao: 'Local: Portão 1 de Entrada de Alunos • Categoria: Pintura & Alvenaria\n\nDemarcação viária de segurança escolar programada para o fim de semana.',
      prioridade: Prioridade.BAIXA,
      status: StatusOS.AGENDADO,
      predio_id: 'u-2', // EMEI Sementinha
      solicitante_id: gestor.id,
      tecnico_atribuido_id: tecMarcos.id,
      fotos: [],
    },

    // ─── EM EXECUÇÃO (4 ordens com técnicos em campo) ─────────────────
    {
      id: 'os-exec-1',
      codigo: 'OS-104923',
      titulo: 'Bomba de água do consultório 3 inoperante',
      descricao: 'Local: Consultório Odontológico 3 • Categoria: Hidráulica\n\nFalta de pressão de água impedindo atendimento odontológico. Técnico em campo.',
      prioridade: Prioridade.URGENTE,
      status: StatusOS.EM_EXECUCAO,
      predio_id: 'u-3', // UBS Vila Nova
      solicitante_id: solUbs.id,
      tecnico_atribuido_id: tecRoberto.id,
      fotos: [],
    },
    {
      id: 'os-exec-2',
      codigo: 'OS-104922',
      titulo: 'Superaquecimento no quadro elétrico do 2º piso',
      descricao: 'Local: Corredor de Salas de Aula • Categoria: Elétrica\n\nDisjuntores aquecidos desarmando salas 201 e 202. Equipe em intervenção preventiva.',
      prioridade: Prioridade.ALTA,
      status: StatusOS.EM_EXECUCAO,
      predio_id: 'u-1', // EMEF Paulo Freire
      solicitante_id: solEscola.id,
      tecnico_atribuido_id: tecCarlos.id,
      fotos: [],
    },
    {
      id: 'os-exec-3',
      codigo: 'OS-104928',
      titulo: 'Rampa de acesso com piso solto e degrau quebrado',
      descricao: 'Local: Acesso Sul da Praça • Categoria: Acessibilidade & Serralheria\n\nRisco de queda de pedestres. Reparo em execução na calçada de concreto.',
      prioridade: Prioridade.ALTA,
      status: StatusOS.EM_EXECUCAO,
      predio_id: 'u-7', // Praça da Matriz
      solicitante_id: gestor.id,
      tecnico_atribuido_id: tecLucas.id,
      fotos: [],
    },
    {
      id: 'os-exec-4',
      codigo: 'OS-104938',
      titulo: 'Vazamento em registros de torneiras infantis',
      descricao: 'Local: Sanitário Infantil Ala B • Categoria: Hidráulica\n\nimpedimento: Aguardando entrega de registro de esfera 50mm pelo almoxarifado central.',
      prioridade: Prioridade.MEDIA,
      status: StatusOS.EM_EXECUCAO,
      predio_id: 'u-2', // EMEI Sementinha
      solicitante_id: gestor.id,
      tecnico_atribuido_id: tecRoberto.id,
      fotos: [],
    },

    // ─── AGUARDANDO VALIDAÇÃO (2 ordens) ──────────────────────────────
    {
      id: 'os-aguardando-1',
      codigo: 'OS-104939',
      titulo: 'Troca de luminárias e reatores no pátio coberto',
      descricao: 'Local: Pátio de Recreação • Categoria: Elétrica\n\nInstalação de 8 refletores de LED concluída pela equipe técnica. Aguardando conferência da direção.',
      prioridade: Prioridade.MEDIA,
      status: StatusOS.AGUARDANDO,
      predio_id: 'u-1', // EMEF Paulo Freire
      solicitante_id: solEscola.id,
      tecnico_atribuido_id: tecCarlos.id,
      fotos: [],
    },
    {
      id: 'os-aguardando-2',
      codigo: 'OS-104940',
      titulo: 'Substituição de fechaduras de segurança no arquivo geral',
      descricao: 'Local: Sala de Arquivo Morto • Categoria: Acessibilidade & Serralheria\n\nTroca de cilindro e chaves mestras executada. Aguardando aceite da chefia de gabinete.',
      prioridade: Prioridade.BAIXA,
      status: StatusOS.AGUARDANDO,
      predio_id: 'u-6', // Prefeitura Ala Sul
      solicitante_id: solPrefeitura.id,
      tecnico_atribuido_id: tecLucas.id,
      fotos: [],
    },

    // ─── CONCLUÍDAS (12 ordens históricas para alimentar métricas reais) ───
    {
      id: 'os-concl-1',
      codigo: 'OS-104921',
      titulo: 'Infiltração de água pluvial no telhado dos professores',
      descricao: 'Local: Bloco Administrativo • Categoria: Alvenaria & Telhado\n\nSubstituição de 12 telhas de fibrocimento e impermeabilização da laje.',
      prioridade: Prioridade.URGENTE,
      status: StatusOS.CONCLUIDO,
      predio_id: 'u-1', // EMEF Paulo Freire
      solicitante_id: solEscola.id,
      tecnico_atribuido_id: tecMarcos.id,
      fotos: [],
    },
    {
      id: 'os-concl-2',
      codigo: 'OS-104925',
      titulo: 'Troca de lâmpadas de LED no pátio externo',
      descricao: 'Local: Estacionamento de Vans • Categoria: Elétrica\n\nInstalação de refletores solares automáticos.',
      prioridade: Prioridade.BAIXA,
      status: StatusOS.CONCLUIDO,
      predio_id: 'u-2', // EMEI Sementinha
      solicitante_id: gestor.id,
      tecnico_atribuido_id: tecCarlos.id,
      fotos: [],
    },
    {
      id: 'os-concl-3',
      codigo: 'OS-104924',
      titulo: 'Rampa de acesso à triagem de emergência regularizada',
      descricao: 'Local: Entrada de Ambulâncias • Categoria: Acessibilidade\n\nAplicação de fita fotoluminescente antiderrapante.',
      prioridade: Prioridade.MEDIA,
      status: StatusOS.CONCLUIDO,
      predio_id: 'u-3', // UBS Vila Nova
      solicitante_id: solUbs.id,
      tecnico_atribuido_id: tecLucas.id,
      fotos: [],
    },
    {
      id: 'os-concl-4',
      codigo: 'OS-104926',
      titulo: 'Conserto de vazamento de esgoto sanitário',
      descricao: 'Local: Banheiro Masculino de Pacientes • Categoria: Hidráulica\n\nDesobstrução de encanamento de 100mm e troca de sifão.',
      prioridade: Prioridade.ALTA,
      status: StatusOS.CONCLUIDO,
      predio_id: 'u-3', // UBS Vila Nova
      solicitante_id: solUbs.id,
      tecnico_atribuido_id: tecRoberto.id,
      fotos: [],
    },
    {
      id: 'os-concl-5',
      codigo: 'OS-104927',
      titulo: 'Reparo em fiação elétrica aparente no forro',
      descricao: 'Local: Consultório 1 • Categoria: Elétrica\n\nPassagem de conduite antichamas e novo cabeamento estruturado.',
      prioridade: Prioridade.MEDIA,
      status: StatusOS.CONCLUIDO,
      predio_id: 'u-4', // UBS Central
      solicitante_id: gestor.id,
      tecnico_atribuido_id: tecCarlos.id,
      fotos: [],
    },
    {
      id: 'os-concl-6',
      codigo: 'OS-104942',
      titulo: 'Restauração de iluminação nos postes da praça',
      descricao: 'Local: Canteiro Central • Categoria: Elétrica\n\nTroca de relé fotoelétrico e 4 luminárias de vapor metálico por LED.',
      prioridade: Prioridade.ALTA,
      status: StatusOS.CONCLUIDO,
      predio_id: 'u-7', // Praça da Matriz
      solicitante_id: gestor.id,
      tecnico_atribuido_id: tecCarlos.id,
      fotos: [],
    },
    {
      id: 'os-concl-7',
      codigo: 'OS-104943',
      titulo: 'Desentupimento de canaleta de águas pluviais',
      descricao: 'Local: Pátio de Recreio • Categoria: Hidráulica\n\nRemoção de folhas e sedimentos da tubulação de saída para a galeria.',
      prioridade: Prioridade.MEDIA,
      status: StatusOS.CONCLUIDO,
      predio_id: 'u-1', // EMEF Paulo Freire
      solicitante_id: solEscola.id,
      tecnico_atribuido_id: tecRoberto.id,
      fotos: [],
    },
    {
      id: 'os-concl-8',
      codigo: 'OS-104944',
      titulo: 'Revisão do sistema de ar-condicionado da farmácia',
      descricao: 'Local: Farmácia Municipal • Categoria: Elétrica\n\nLimpeza de filtros e reposição de gás R410A para climatização de medicamentos.',
      prioridade: Prioridade.ALTA,
      status: StatusOS.CONCLUIDO,
      predio_id: 'u-5', // UBS Vila Esperança
      solicitante_id: gestor.id,
      tecnico_atribuido_id: tecCarlos.id,
      fotos: [],
    },
    {
      id: 'os-concl-9',
      codigo: 'OS-104945',
      titulo: 'Conserto de torneiras com vazamento contínuo',
      descricao: 'Local: Sanitários dos Professores • Categoria: Hidráulica\n\nTroca de 4 carrapetas e vedações de registros.',
      prioridade: Prioridade.BAIXA,
      status: StatusOS.CONCLUIDO,
      predio_id: 'u-1', // EMEF Paulo Freire
      solicitante_id: solEscola.id,
      tecnico_atribuido_id: tecRoberto.id,
      fotos: [],
    },
    {
      id: 'os-concl-10',
      codigo: 'OS-104946',
      titulo: 'Recomposição de reboco e pintura antimofo',
      descricao: 'Local: Sala de Vacinas • Categoria: Alvenaria & Pintura\n\nTratamento de umidade ascendente e pintura lavável epóxi hospitalar.',
      prioridade: Prioridade.MEDIA,
      status: StatusOS.CONCLUIDO,
      predio_id: 'u-3', // UBS Vila Nova
      solicitante_id: solUbs.id,
      tecnico_atribuido_id: tecMarcos.id,
      fotos: [],
    },
    {
      id: 'os-concl-11',
      codigo: 'OS-104947',
      titulo: 'Troca de fechaduras e molas aéreas nas portas de saída',
      descricao: 'Local: Portas Corta-Fogo • Categoria: Acessibilidade & Serralheria\n\nLubrificação e troca de braços mecânicos em conformidade com o Corpo de Bombeiros.',
      prioridade: Prioridade.MEDIA,
      status: StatusOS.CONCLUIDO,
      predio_id: 'u-6', // Prefeitura Ala Sul
      solicitante_id: solPrefeitura.id,
      tecnico_atribuido_id: tecLucas.id,
      fotos: [],
    },
    {
      id: 'os-concl-12',
      codigo: 'OS-104948',
      titulo: 'Pintura de proteção e desobstrução de calhas metálicas',
      descricao: 'Local: Galpão de Máquinas • Categoria: Alvenaria, Pintura e Telhados\n\nAplicação de manta líquida e primer anticorrosivo.',
      prioridade: Prioridade.BAIXA,
      status: StatusOS.CONCLUIDO,
      predio_id: 'u-9', // Secretaria de Obras
      solicitante_id: gestor.id,
      tecnico_atribuido_id: tecMarcos.id,
      fotos: [],
    },
  ];

  for (const o of ordens) {
    await prisma.ordemServico.create({
      data: o,
    });
  }

  // 4. Agenda de Vistorias e Preventivas (6 Atividades Reais)
  const vistorias = [
    { id: 'ag-1', horario: 'Hoje, 14:30', titulo: 'Vistoria elétrica semestral nos quadros de distribuição', subtitulo: 'EMEF Paulo Freire', concluido: false, tipo: 'eletrica', tecnico: 'Carlos Silva' },
    { id: 'ag-2', horario: 'Amanhã, 09:00', titulo: 'Manutenção preventiva e teste de estanqueidade de bombas', subtitulo: 'UBS Vila Nova', concluido: false, tipo: 'hidraulica', tecnico: 'Roberto Santos' },
    { id: 'ag-3', horario: 'Quinta, 10:00', titulo: 'Inspeção de rampas e rotas táteis acessíveis', subtitulo: 'UBS Central', concluido: false, tipo: 'acessibilidade', tecnico: 'Lucas Pereira' },
    { id: 'ag-4', horario: 'Quinta, 14:00', titulo: 'Avaliação preventiva de calhas e coberturas pré-chuvas', subtitulo: 'EMEI Sementinha', concluido: false, tipo: 'geral', tecnico: 'Marcos Oliveira' },
    { id: 'ag-5', horario: 'Sexta, 11:00', titulo: 'Teste de carga do grupo gerador e no-break municipal', subtitulo: 'Prefeitura – Ala Sul', concluido: false, tipo: 'eletrica', tecnico: 'Carlos Silva' },
    { id: 'ag-6', horario: 'Sexta, 15:30', titulo: 'Vistoria hidráulica e aferição de pressão de rede', subtitulo: 'Secretaria de Obras', concluido: false, tipo: 'hidraulica', tecnico: 'Roberto Santos' },
  ];

  for (const v of vistorias) {
    await prisma.agendaVistoria.create({
      data: v,
    });
  }

  // 5. Configurações do Sistema com Técnicos Sincronizados
  await prisma.configuracaoSistema.upsert({
    where: { id: 'default' },
    update: {
      prefeitura_nome: 'Prefeitura Municipal de Gestão Urbana',
      secretaria_nome: 'Secretaria de Infraestrutura e Zeladoria Predial',
      gestor_nome: 'Mariana Alves',
      gestor_cargo: 'Gestora Municipal de Zeladoria',
      gestor_email: 'gestor@urboa.gov.br',
      gestor_telefone: '(11) 3241-8900',
      sla_urgente_h: 4,
      sla_alta_h: 24,
      sla_media_h: 72,
      sla_baixa_h: 168,
      mttr_alert_h: 8,
      preventiva_goal: 90,
      sound_alerts: true,
      push_notif: true,
      whatsapp_alerts: false,
      auto_dispatch: false,
    },
    create: {
      id: 'default',
      prefeitura_nome: 'Prefeitura Municipal de Gestão Urbana',
      secretaria_nome: 'Secretaria de Infraestrutura e Zeladoria Predial',
      gestor_nome: 'Mariana Alves',
      gestor_cargo: 'Gestora Municipal de Zeladoria',
      gestor_email: 'gestor@urboa.gov.br',
      gestor_telefone: '(11) 3241-8900',
      sla_urgente_h: 4,
      sla_alta_h: 24,
      sla_media_h: 72,
      sla_baixa_h: 168,
      mttr_alert_h: 8,
      preventiva_goal: 90,
      sound_alerts: true,
      push_notif: true,
      whatsapp_alerts: false,
      auto_dispatch: false,
    },
  });

  // 6. Auditoria Inicial
  await prisma.auditoriaLog.create({
    data: {
      entidade_afetada: 'Sistema',
      entidade_id: 'seed-inicial',
      acao: AuditAction.CREATE,
      usuario_id: admin.id,
      dados_novos: { status: 'Base municipal sincronizada e populada com 26 ordens de serviço ativas' },
    },
  });
}

main()
  .catch((e) => {
    process.stderr.write(`Erro na execução do seed: ${e instanceof Error ? e.message : String(e)}\n`);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

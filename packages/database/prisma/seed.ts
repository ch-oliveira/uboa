import { PrismaClient, Role, TipoPredio, Prioridade, StatusOS, AuditAction } from '../src/generated/index.js';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('[seed] A execucao de seed destrutivo esta bloqueada em ambiente de producao.');
  }

  // Limpar tabelas dependentes para garantir integridade e consistência limpa
  await prisma.auditoriaLog.deleteMany();
  await prisma.itemConsumoOS.deleteMany();
  await prisma.ordemServico.deleteMany();
  await prisma.material.deleteMany();
  await prisma.agendaVistoria.deleteMany();
  await prisma.predio.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.manifestacao.deleteMany();
  await prisma.configuracaoSistema.deleteMany();
  await prisma.prefeitura.deleteMany();

  // 0. Criar/Garantir Prefeitura Padrão (Tenant Zero / Cliente Piloto de 200k)
  const prefeituraPadrao = await prisma.prefeitura.upsert({
    where: { slug: 'default' },
    update: {
      nome: 'Prefeitura Municipal de Gestão Urbana',
      ativo: true,
      modulos_ativos: [
        'ZELADORIA_PREDIAL',
        'OUVIDORIA_CIDADA',
        'AGENDA_PREVENTIVA',
        'GESTAO_MATERIAIS',
        'COPILOT_IA',
      ],
    },
    create: {
      id: 'prefeitura-default',
      slug: 'default',
      nome: 'Prefeitura Municipal de Gestão Urbana',
      cnpj: '46.123.456/0001-78',
      ativo: true,
      modulos_ativos: [
        'ZELADORIA_PREDIAL',
        'OUVIDORIA_CIDADA',
        'AGENDA_PREVENTIVA',
        'GESTAO_MATERIAIS',
        'COPILOT_IA',
      ],
    },
  });

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
    await prisma.ordemServico.upsert({
      where: { id: o.id },
      update: o,
      create: o,
    });
  }

  // 3.1. Catálogo Municipal de Materiais e Insumos (Tabela de Referência / SINAPI)
  const materiaisData = [
    { id: 'mat-1', codigo: 'MAT-ELE-001', nome: 'Disjuntor Bipolar 32A DIN Curva C', categoria: 'ELETRICA', unidade_medida: 'UN', preco_unitario: 38.50, estoque_atual: 45, estoque_minimo: 10 },
    { id: 'mat-2', codigo: 'MAT-ELE-002', nome: 'Cabo Flexível 2.5mm² 750V (Cobre)', categoria: 'ELETRICA', unidade_medida: 'METRO', preco_unitario: 3.20, estoque_atual: 500, estoque_minimo: 100 },
    { id: 'mat-3', codigo: 'MAT-ELE-003', nome: 'Lâmpada LED Tubular T8 18W 6500K', categoria: 'ELETRICA', unidade_medida: 'UN', preco_unitario: 18.90, estoque_atual: 120, estoque_minimo: 25 },
    { id: 'mat-4', codigo: 'MAT-ELE-004', nome: 'Reator / Driver Eletrônico Bivolt', categoria: 'ELETRICA', unidade_medida: 'UN', preco_unitario: 45.00, estoque_atual: 22, estoque_minimo: 5 },
    { id: 'mat-5', codigo: 'MAT-HID-001', nome: 'Torneira de Pressão Lavatório Antivandalismo', categoria: 'HIDRAULICA', unidade_medida: 'UN', preco_unitario: 145.00, estoque_atual: 18, estoque_minimo: 5 },
    { id: 'mat-6', codigo: 'MAT-HID-002', nome: 'Tubo PVC Soldável 25mm Barra 3m', categoria: 'HIDRAULICA', unidade_medida: 'BARRA', preco_unitario: 22.00, estoque_atual: 60, estoque_minimo: 15 },
    { id: 'mat-7', codigo: 'MAT-HID-003', nome: 'Registro de Gaveta 3/4" com Acabamento', categoria: 'HIDRAULICA', unidade_medida: 'UN', preco_unitario: 68.00, estoque_atual: 14, estoque_minimo: 4 },
    { id: 'mat-8', codigo: 'MAT-HID-004', nome: 'Válvula de Descarga 1 1/2" Hydra Max', categoria: 'HIDRAULICA', unidade_medida: 'UN', preco_unitario: 185.00, estoque_atual: 12, estoque_minimo: 3 },
    { id: 'mat-9', codigo: 'MAT-ALV-001', nome: 'Cimento Portland CP-II-E-32 Saco 50kg', categoria: 'ALVENARIA', unidade_medida: 'SACO', preco_unitario: 34.90, estoque_atual: 80, estoque_minimo: 20 },
    { id: 'mat-10', codigo: 'MAT-ALV-002', nome: 'Argamassa Colante AC-II 20kg', categoria: 'ALVENARIA', unidade_medida: 'SACO', preco_unitario: 19.50, estoque_atual: 95, estoque_minimo: 25 },
    { id: 'mat-11', codigo: 'MAT-PIN-001', nome: 'Tinta Acrílica Fosca Lavável Branca Lata 18L', categoria: 'PINTURA', unidade_medida: 'LATA', preco_unitario: 289.00, estoque_atual: 16, estoque_minimo: 4 },
    { id: 'mat-12', codigo: 'MAT-CLI-001', nome: 'Gás Refrigerante R410A (Cilindro/Kg)', categoria: 'CLIMATIZACAO', unidade_medida: 'KG', preco_unitario: 95.00, estoque_atual: 30, estoque_minimo: 8 },
  ];

  for (const m of materiaisData) {
    await prisma.material.upsert({
      where: { id: m.id },
      update: {
        ...m,
        prefeitura_id: prefeituraPadrao.id,
      },
      create: {
        ...m,
        prefeitura_id: prefeituraPadrao.id,
      },
    });
  }

  // 3.2. Contratos Públicos Municipais e Notas de Empenho
  const contratosData = [
    {
      id: 'contrato-1',
      numero_contrato: 'Contrato 014/2026',
      numero_empenho: '2026NE00412',
      empresa_contratada: 'Alvorada Engenharia & Manutenção Urbana Ltda',
      cnpj_contratada: '14.288.902/0001-44',
      objeto: 'Manutenção Elétrica Preventiva e Corretiva com Fornecimento de Insumos e Materiais',
      categoria_padrao: 'ELETRICA',
      valor_total_empenhado: 180000.00,
      vigencia_inicio: new Date('2026-01-01'),
      vigencia_fim: new Date('2026-12-31'),
      ativo: true,
      prefeitura_id: prefeituraPadrao.id,
    },
    {
      id: 'contrato-2',
      numero_contrato: 'Contrato 018/2026',
      numero_empenho: '2026NE00495',
      empresa_contratada: 'HidroSane Engenharia e Instalações Prediais Ltda',
      cnpj_contratada: '08.192.341/0001-12',
      objeto: 'Manutenção Hidrossanitária, Limpeza de Reservatórios e Desobstrução de Redes',
      categoria_padrao: 'HIDRAULICA',
      valor_total_empenhado: 120000.00,
      vigencia_inicio: new Date('2026-01-01'),
      vigencia_fim: new Date('2026-12-31'),
      ativo: true,
      prefeitura_id: prefeituraPadrao.id,
    },
    {
      id: 'contrato-3',
      numero_contrato: 'Contrato 022/2026',
      numero_empenho: '2026NE00511',
      empresa_contratada: 'Construtora & Reformas Aliança Ltda',
      cnpj_contratada: '22.841.770/0001-98',
      objeto: 'Manutenção de Alvenaria, Pintura, Reparos de Coberturas e Serralheria Predial',
      categoria_padrao: 'ALVENARIA',
      valor_total_empenhado: 250000.00,
      vigencia_inicio: new Date('2026-01-01'),
      vigencia_fim: new Date('2026-12-31'),
      ativo: true,
      prefeitura_id: prefeituraPadrao.id,
    },
  ];

  for (const c of contratosData) {
    await prisma.contratoManutencao.upsert({
      where: { id: c.id },
      update: c,
      create: c,
    });
  }

  // 3.3. Medição Financeira e Itens Consumidos em Ordens de Serviço
  const consumosExemplo = [
    {
      ordemId: 'os-concl-1', // EMEF Paulo Freire
      contratoId: 'contrato-1',
      empresa: 'Alvorada Engenharia & Manutenção Urbana Ltda',
      empenho: '2026NE00412',
      maoDeObra: 350.00,
      itens: [
        { material_id: 'mat-1', descricao: 'Disjuntor Bipolar 32A DIN Curva C', quantidade: 2, unidade_medida: 'UN', preco_unitario: 38.50, preco_total: 77.00 },
        { material_id: 'mat-2', descricao: 'Cabo Flexível 2.5mm² 750V (Cobre)', quantidade: 25, unidade_medida: 'METRO', preco_unitario: 3.20, preco_total: 80.00 },
      ],
    },
    {
      ordemId: 'os-concl-2', // UBS Vila Nova
      contratoId: 'contrato-2',
      empresa: 'HidroSane Engenharia e Instalações Prediais Ltda',
      empenho: '2026NE00495',
      maoDeObra: 420.00,
      itens: [
        { material_id: 'mat-5', descricao: 'Torneira de Pressão Lavatório Antivandalismo', quantidade: 2, unidade_medida: 'UN', preco_unitario: 145.00, preco_total: 290.00 },
        { material_id: 'mat-7', descricao: 'Registro de Gaveta 3/4" com Acabamento', quantidade: 1, unidade_medida: 'UN', preco_unitario: 68.00, preco_total: 68.00 },
      ],
    },
    {
      ordemId: 'os-concl-12', // Secretaria de Obras
      contratoId: 'contrato-3',
      empresa: 'Construtora & Reformas Aliança Ltda',
      empenho: '2026NE00511',
      maoDeObra: 850.00,
      itens: [
        { material_id: 'mat-11', descricao: 'Tinta Acrílica Fosca Lavável Branca Lata 18L', quantidade: 3, unidade_medida: 'LATA', preco_unitario: 289.00, preco_total: 867.00 },
      ],
    },
    {
      ordemId: 'os-concl-3', // EMEI Sementinha
      contratoId: 'contrato-1',
      empresa: 'Alvorada Engenharia & Manutenção Urbana Ltda',
      empenho: '2026NE00412',
      maoDeObra: 280.00,
      itens: [
        { material_id: 'mat-3', descricao: 'Lâmpada LED Tubular T8 18W Bivolt 6500K', quantidade: 10, unidade_medida: 'UN', preco_unitario: 18.90, preco_total: 189.00 },
        { material_id: 'mat-4', descricao: 'Reator Eletrônico para Lâmpada Fluorescente', quantidade: 2, unidade_medida: 'UN', preco_unitario: 42.00, preco_total: 84.00 },
      ],
    },
    {
      ordemId: 'os-concl-4', // Praça da Matriz
      contratoId: 'contrato-2',
      empresa: 'HidroSane Engenharia e Instalações Prediais Ltda',
      empenho: '2026NE00495',
      maoDeObra: 520.00,
      itens: [
        { material_id: 'mat-6', descricao: 'Válvula de Descarga 1 1/2" Hydra Completa', quantidade: 2, unidade_medida: 'UN', preco_unitario: 189.00, preco_total: 378.00 },
      ],
    },
  ];

  for (const c of consumosExemplo) {
    let custoMateriais = 0;
    for (const it of c.itens) {
      custoMateriais += it.preco_total;
      await prisma.itemConsumoOS.create({
        data: {
          ordem_servico_id: c.ordemId,
          material_id: it.material_id,
          descricao: it.descricao,
          quantidade: it.quantidade,
          unidade_medida: it.unidade_medida,
          preco_unitario: it.preco_unitario,
          preco_total: it.preco_total,
        },
      });
    }

    const custoTotal = custoMateriais + c.maoDeObra;
    await prisma.ordemServico.update({
      where: { id: c.ordemId },
      data: {
        contrato_id: c.contratoId,
        empresa_terceirizada: c.empresa,
        numero_empenho: c.empenho,
        custo_materiais: custoMateriais,
        custo_mao_de_obra: c.maoDeObra,
        custo_total: custoTotal,
      },
    });
  }

  // 4. Agenda de Vistorias e Preventivas (Atividades Reais)
  const vistorias = [
    { id: 'ag-1', horario: 'Hoje, 14:30', titulo: 'Vistoria elétrica semestral nos quadros de distribuição', subtitulo: 'EMEF Paulo Freire', concluido: false, tipo: 'eletrica', tecnico: 'Carlos Silva', tecnico_id: tecCarlos.id, predio_id: 'u-1', prefeitura_id: prefeituraPadrao.id },
    { id: 'ag-2', horario: 'Amanhã, 09:00', titulo: 'Manutenção preventiva e teste de estanqueidade de bombas', subtitulo: 'UBS Vila Nova', concluido: false, tipo: 'hidraulica', tecnico: 'Roberto Santos', tecnico_id: tecRoberto.id, predio_id: 'u-3', prefeitura_id: prefeituraPadrao.id },
    { id: 'ag-3', horario: 'Quinta, 10:00', titulo: 'Inspeção de rampas e rotas táteis acessíveis', subtitulo: 'UBS Central', concluido: false, tipo: 'acessibilidade', tecnico: 'Lucas Pereira', tecnico_id: tecLucas.id, predio_id: 'u-4', prefeitura_id: prefeituraPadrao.id },
    { id: 'ag-4', horario: 'Quinta, 14:00', titulo: 'Avaliação preventiva de calhas e coberturas pré-chuvas', subtitulo: 'EMEI Sementinha', concluido: false, tipo: 'geral', tecnico: 'Marcos Oliveira', tecnico_id: tecMarcos.id, predio_id: 'u-2', prefeitura_id: prefeituraPadrao.id },
    { id: 'ag-5', horario: 'Sexta, 11:00', titulo: 'Teste de carga do grupo gerador e no-break municipal', subtitulo: 'Prefeitura – Ala Sul', concluido: false, tipo: 'eletrica', tecnico: 'Carlos Silva', tecnico_id: tecCarlos.id, predio_id: 'u-6', prefeitura_id: prefeituraPadrao.id },
    { id: 'ag-6', horario: 'Sexta, 15:30', titulo: 'Vistoria hidráulica e aferição de pressão de rede', subtitulo: 'Secretaria de Obras', concluido: false, tipo: 'hidraulica', tecnico: 'Roberto Santos', tecnico_id: tecRoberto.id, predio_id: 'u-9', prefeitura_id: prefeituraPadrao.id },
    { id: 'ag-7', horario: 'Amanhã, 10:00', titulo: 'Inspeção termográfica e balanceamento de cargas', subtitulo: 'UBS Vila Nova', concluido: false, tipo: 'eletrica', tecnico: 'Carlos Silva', tecnico_id: tecCarlos.id, predio_id: 'u-3', prefeitura_id: prefeituraPadrao.id },
  ];

  for (const v of vistorias) {
    await prisma.agendaVistoria.upsert({
      where: { id: v.id },
      update: v,
      create: v,
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
      dados_novos: { status: 'Base municipal sincronizada e populada com 26 ordens de serviço ativas no Tenant Padrão' },
    },
  });

  // 7. Vincular todos os registros criados ao Tenant Padrão (Multi-Tenant Ready)
  await prisma.usuario.updateMany({ data: { prefeitura_id: prefeituraPadrao.id } });
  await prisma.predio.updateMany({ data: { prefeitura_id: prefeituraPadrao.id } });
  await prisma.ordemServico.updateMany({ data: { prefeitura_id: prefeituraPadrao.id } });
  await prisma.agendaVistoria.updateMany({ data: { prefeitura_id: prefeituraPadrao.id } });
  await prisma.configuracaoSistema.updateMany({ data: { prefeitura_id: prefeituraPadrao.id } });
  await prisma.auditoriaLog.updateMany({ data: { prefeitura_id: prefeituraPadrao.id } });
}

main()
  .catch((e) => {
    process.stderr.write(`Erro na execução do seed: ${e instanceof Error ? e.message : String(e)}\n`);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

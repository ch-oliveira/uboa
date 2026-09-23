import { PrismaClient, Role, TipoPredio, Prioridade, StatusOS } from '../src/generated/index.js';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed no PostgreSQL...');

  // 1. Criar Usuários
  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@zelo.gov.br' },
    update: {},
    create: {
      id: 'user-admin',
      nome: 'Desenvolvedor / Admin',
      email: 'admin@zelo.gov.br',
      senha_hash: '123',
      role: Role.ADMIN,
      telefone: '(11) 99999-0000',
    },
  });

  const gestor = await prisma.usuario.upsert({
    where: { email: 'gestor@zelo.gov.br' },
    update: {},
    create: {
      id: 'user-gestor',
      nome: 'Mariana Alves',
      email: 'gestor@zelo.gov.br',
      senha_hash: '123',
      role: Role.GESTOR,
      telefone: '(11) 3241-8900',
    },
  });

  const tecnico1 = await prisma.usuario.upsert({
    where: { email: 'carlos.tecnico@zelo.gov.br' },
    update: {},
    create: {
      id: 'user-tecnico-1',
      nome: 'Carlos Silva',
      email: 'carlos.tecnico@zelo.gov.br',
      senha_hash: '123',
      role: Role.TECNICO,
      telefone: '(11) 98765-4321',
    },
  });

  const tecnico2 = await prisma.usuario.upsert({
    where: { email: 'marcos.tecnico@zelo.gov.br' },
    update: {},
    create: {
      id: 'user-tecnico-2',
      nome: 'Marcos Oliveira',
      email: 'marcos.tecnico@zelo.gov.br',
      senha_hash: '123',
      role: Role.TECNICO,
      telefone: '(11) 98765-4322',
    },
  });

  const solicitanteEscola = await prisma.usuario.upsert({
    where: { email: 'maria.escola@zelo.gov.br' },
    update: {},
    create: {
      id: 'user-solicitante-escola',
      nome: 'Profª Maria Clara',
      email: 'maria.escola@zelo.gov.br',
      senha_hash: '123',
      role: Role.SOLICITANTE,
      telefone: '(11) 4589-1020',
    },
  });

  const solicitanteUbs = await prisma.usuario.upsert({
    where: { email: 'marcelo.ubs@zelo.gov.br' },
    update: {},
    create: {
      id: 'user-solicitante-ubs',
      nome: 'Dr. Marcelo Ramos',
      email: 'marcelo.ubs@zelo.gov.br',
      senha_hash: '123',
      role: Role.SOLICITANTE,
      telefone: '(11) 4589-2040',
    },
  });

  console.log('Usuários criados com sucesso.');

  // 2. Criar Prédios Municipais
  const prediosData = [
    { id: 'u-1', nome: 'EMEF Paulo Freire', tipo: TipoPredio.ESCOLA, endereco: 'Av. dos Estudantes, 450 - Centro', gestor_id: solicitanteEscola.id },
    { id: 'u-2', nome: 'EMEI Sementinha', tipo: TipoPredio.ESCOLA, endereco: 'Rua das Flores, 112 - Jardim das Palmeiras', gestor_id: gestor.id },
    { id: 'u-3', nome: 'UBS Vila Nova', tipo: TipoPredio.UBS, endereco: 'Rua São Jorge, 780 - Vila Nova', gestor_id: solicitanteUbs.id },
    { id: 'u-4', nome: 'UBS Central', tipo: TipoPredio.UBS, endereco: 'Praça da Saúde, 35 - Centro', gestor_id: gestor.id },
    { id: 'u-5', nome: 'UBS Vila Esperança', tipo: TipoPredio.UBS, endereco: 'Av. da Paz, 99 - Vila Esperança', gestor_id: gestor.id },
    { id: 'u-6', nome: 'Prefeitura – Ala Sul', tipo: TipoPredio.ADMINISTRATIVO, endereco: 'Praça dos Três Poderes, 1 - Centro', gestor_id: gestor.id },
    { id: 'u-7', nome: 'Praça da Matriz', tipo: TipoPredio.PRACA, endereco: 'Rua Central, s/n - Centro Histórico', gestor_id: gestor.id },
    { id: 'u-8', nome: 'Biblioteca Municipal', tipo: TipoPredio.ADMINISTRATIVO, endereco: 'Rua Rui Barbosa, 210 - Centro', gestor_id: gestor.id },
    { id: 'u-9', nome: 'Secretaria de Obras', tipo: TipoPredio.ADMINISTRATIVO, endereco: 'Av. Industrial, 1500 - Distrito Industrial', gestor_id: gestor.id },
  ];

  for (const p of prediosData) {
    await prisma.predio.upsert({
      where: { id: p.id },
      update: { nome: p.nome, tipo: p.tipo, endereco: p.endereco, gestor_id: p.gestor_id },
      create: {
        id: p.id,
        nome: p.nome,
        tipo: p.tipo,
        endereco: p.endereco,
        gestor_id: p.gestor_id,
      },
    });
  }

  console.log('Prédios criados com sucesso.');

  // 3. Criar Ordens de Serviço Iniciais
  const ordens = [
    {
      id: 'os-1',
      codigo: 'OS-104921',
      titulo: 'Infiltração na sala dos professores',
      descricao: 'Goteiras intensas durante chuvas fortes danificando o forro e mesas de professores.',
      prioridade: Prioridade.URGENTE,
      status: StatusOS.EM_TRIAGEM,
      predio_id: 'u-1', // EMEF Paulo Freire
      solicitante_id: solicitanteEscola.id,
      tecnico_atribuido_id: tecnico1.id,
      fotos: [],
    },
    {
      id: 'os-2',
      codigo: 'OS-104922',
      titulo: 'Quadro elétrico principal com superaquecimento',
      descricao: 'Disjuntor desarmando com frequência nas salas de aula do piso superior.',
      prioridade: Prioridade.ALTA,
      status: StatusOS.EM_EXECUCAO,
      predio_id: 'u-1', // EMEF Paulo Freire
      solicitante_id: solicitanteEscola.id,
      tecnico_atribuido_id: tecnico1.id,
      fotos: [],
    },
    {
      id: 'os-3',
      codigo: 'OS-104923',
      titulo: 'Bomba de água do consultório 3 inoperante',
      descricao: 'Falta de pressão de água para esterilização de equipamentos.',
      prioridade: Prioridade.URGENTE,
      status: StatusOS.EM_EXECUCAO,
      predio_id: 'u-3', // UBS Vila Nova
      solicitante_id: solicitanteUbs.id,
      tecnico_atribuido_id: tecnico2.id,
      fotos: [],
    },
    {
      id: 'os-4',
      codigo: 'OS-104924',
      titulo: 'Rampa de acessibilidade danificada',
      descricao: 'Piso antiderrapante solto na entrada de ambulâncias e cadeirantes.',
      prioridade: Prioridade.MEDIA,
      status: StatusOS.RECEBIDO,
      predio_id: 'u-3', // UBS Vila Nova
      solicitante_id: solicitanteUbs.id,
      tecnico_atribuido_id: null,
      fotos: [],
    },
    {
      id: 'os-5',
      codigo: 'OS-104925',
      titulo: 'Troca de lâmpadas de LED no pátio',
      descricao: 'Três luminárias apagadas na área de recreação infantil.',
      prioridade: Prioridade.BAIXA,
      status: StatusOS.CONCLUIDO,
      predio_id: 'u-2', // EMEI Sementinha
      solicitante_id: gestor.id,
      tecnico_atribuido_id: tecnico1.id,
      fotos: [],
    },
  ];

  for (const o of ordens) {
    await prisma.ordemServico.upsert({
      where: { id: o.id },
      update: {
        codigo: o.codigo,
        titulo: o.titulo,
        descricao: o.descricao,
        prioridade: o.prioridade,
        status: o.status,
        tecnico_atribuido_id: o.tecnico_atribuido_id,
      },
      create: o,
    });
  }

  // 4. Criar Agenda / Vistorias
  const vistorias = [
    { id: 'ag-1', horario: '09:00', titulo: 'Vistoria elétrica', subtitulo: 'EMEI Sementinha', concluido: false, tipo: 'eletrica', tecnico: 'Carlos Silva' },
    { id: 'ag-2', horario: '11:00', titulo: 'Reparo hidráulico', subtitulo: 'EMEF Paulo Freire', concluido: false, tipo: 'hidraulica', tecnico: 'Roberto Santos' },
    { id: 'ag-3', horario: '14:30', titulo: 'Inspeção de acessibilidade', subtitulo: 'UBS Vila Esperança', concluido: false, tipo: 'acessibilidade', tecnico: 'Lucas Pereira' },
    { id: 'ag-4', horario: '16:00', titulo: 'Avaliação de alvenaria', subtitulo: 'UBS Vila Nova', concluido: false, tipo: 'geral', tecnico: 'Marcos Oliveira' },
  ];

  for (const v of vistorias) {
    await prisma.agendaVistoria.upsert({
      where: { id: v.id },
      update: v,
      create: v,
    });
  }

  // 5. Criar Configurações do Sistema
  await prisma.configuracaoSistema.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      prefeitura_nome: 'Prefeitura Municipal de Gestão Urbana',
      secretaria_nome: 'Secretaria de Infraestrutura e Zeladoria Predial',
      gestor_nome: 'Mariana Alves',
      gestor_cargo: 'Gestora Municipal de Zeladoria',
      gestor_email: 'mariana.alves@gestaourbana.gov.br',
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

  console.log('Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

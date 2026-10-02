import { PrismaClient, Role } from '../src/generated/index.js';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * Seed Não-Destrutivo de Produção (Init / Bootstrap de Produção)
 * 
 * Este script é seguro para ser executado em ambiente de Produção:
 * 1. NUNCA apaga dados (sem deleteMany).
 * 2. É idempotente (só cria se não existir).
 * 3. Cria apenas o Administrador inicial do sistema e as configurações padrão.
 * 4. Não polui o banco com dados falsos de teste (OSs fictícias, técnicos fake, etc.).
 */
async function main() {
  console.log('[prod-seed] Verificando estado inicial do banco de produção...');

  // 1. Verificar se já existe algum administrador no sistema
  const existingAdminCount = await prisma.usuario.count({
    where: { role: Role.ADMIN },
  });

  if (existingAdminCount === 0) {
    const adminEmail = process.env.ADMIN_INITIAL_EMAIL || 'admin@urboa.gov.br';
    const adminPassword = process.env.ADMIN_INITIAL_PASSWORD;

    if (!adminPassword || adminPassword.length < 8) {
      throw new Error(
        '[prod-seed ERROR] Em produção, defina a variável ADMIN_INITIAL_PASSWORD com no mínimo 8 caracteres para criar o administrador inicial.',
      );
    }

    const passwordHash = await bcrypt.hash(adminPassword, 10);

    const admin = await prisma.usuario.create({
      data: {
        nome: 'Administrador do Sistema',
        email: adminEmail.toLowerCase().trim(),
        senha_hash: passwordHash,
        role: Role.ADMIN,
        telefone: '(11) 99999-9999',
      },
    });

    console.log(`[prod-seed] Administrador inicial criado com sucesso: ${admin.email}`);
  } else {
    console.log(`[prod-seed] Administrador(es) já existente(s) (${existingAdminCount}). Nenhuma alteração feita em usuários.`);
  }

  // 2. Garantir configuração padrão do sistema
  const config = await prisma.configuracaoSistema.findUnique({
    where: { id: 'default' },
  });

  if (!config) {
    await prisma.configuracaoSistema.create({
      data: {
        id: 'default',
        prefeitura_nome: 'Prefeitura Municipal',
        secretaria_nome: 'Secretaria de Infraestrutura e Zeladoria Predial',
        gestor_nome: 'Administrador Geral',
        gestor_cargo: 'Gestor Municipal',
        gestor_email: process.env.ADMIN_INITIAL_EMAIL || 'admin@urboa.gov.br',
        gestor_telefone: '(11) 3241-8000',
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
    console.log('[prod-seed] Configuração padrão do sistema criada.');
  } else {
    console.log('[prod-seed] Configuração do sistema já configurada.');
  }

  console.log('[prod-seed] Bootstrap de produção finalizado com sucesso.');
}

main()
  .catch((e) => {
    console.error('[prod-seed ERROR]', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

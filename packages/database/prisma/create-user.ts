import { PrismaClient, Role } from '../src/generated/index.js';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const nome = process.env.USER_NOME || process.argv[2];
  const email = process.env.USER_EMAIL || process.argv[3];
  const senha = process.env.USER_PASSWORD || process.argv[4];
  const roleInput = (process.env.USER_ROLE || process.argv[5] || 'GESTOR').toUpperCase();
  const telefone = process.env.USER_PHONE || process.argv[6] || '(11) 99999-9999';

  if (!nome || !email || !senha) {
    console.log(`
Uso:
  pnpm --filter @repo/database user:create "<Nome>" "<email@urboa.gov.br>" "<senha>" [ROLE] [telefone]

Exemplo:
  pnpm --filter @repo/database user:create "Mariana Alves" "mariana.gestor@urboa.gov.br" "SenhaForte123!" GESTOR "(11) 98765-4321"

Roles permitidos:
  - ADMIN
  - GESTOR
  - TECNICO
  - SOLICITANTE
`);
    process.exit(1);
  }

  const role = Role[roleInput as keyof typeof Role];
  if (!role) {
    console.error(`[ERRO] Role inválida: "${roleInput}". Use ADMIN, GESTOR, TECNICO ou SOLICITANTE.`);
    process.exit(1);
  }

  if (senha.length < 6) {
    console.error('[ERRO] A senha deve conter no mínimo 6 caracteres.');
    process.exit(1);
  }

  const cleanEmail = email.toLowerCase().trim();

  // Verifica se o usuário já existe
  const existing = await prisma.usuario.findUnique({
    where: { email: cleanEmail },
  });

  if (existing) {
    console.error(`[ERRO] Já existe um usuário cadastrado com o e-mail: ${cleanEmail}`);
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(senha, 10);

  const newUser = await prisma.usuario.create({
    data: {
      nome: nome.trim(),
      email: cleanEmail,
      senha_hash: passwordHash,
      role,
      telefone: telefone.trim(),
    },
    select: {
      id: true,
      nome: true,
      email: true,
      role: true,
      telefone: true,
      criado_em: true,
    },
  });

  console.log('✅ Usuário criado com sucesso no banco de dados!');
  console.log('--------------------------------------------------');
  console.log(`ID:       ${newUser.id}`);
  console.log(`Nome:     ${newUser.nome}`);
  console.log(`E-mail:   ${newUser.email}`);
  console.log(`Perfil:   ${newUser.role}`);
  console.log(`Telefone: ${newUser.telefone}`);
  console.log('--------------------------------------------------');
}

main()
  .catch((err) => {
    console.error('[ERRO FATAL]', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

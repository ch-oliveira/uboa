# Separação Definitiva dos Ambientes de Banco de Dados

Este documento estabelece as diretrizes arquiteturais, conexões, fluxo de migrações e rotinas de dados para segregar permanentemente os três bancos de dados do sistema **Urboa / Predial**: **Desenvolvimento Local**, **Staging (Homologação)** e **Produção**.

---

## 1. Visão Geral da Arquitetura de Dados

```mermaid
flowchart TD
    subgraph LOCAL["1. Desenvolvimento (Localhost)"]
        DockerDB[("PostgreSQL 16 + PostGIS\n(Docker Local 5432)")]
        DevApp["Apps: API :3001 / Web :3002"]
        DevSeed["pnpm db:seed (Destrutivo)"]
        DevMigrate["pnpm db:migrate:dev\n(Gera novos arquivos de migração)"]
        DevApp --> DockerDB
        DevSeed --> DockerDB
        DevMigrate --> DockerDB
    end

    subgraph STAGING["2. Homologação (Staging Cloud)"]
        StageDB[("PostgreSQL + PostGIS\n(Supabase Staging / Instância Isolada)")]
        StageApp["API Render Staging / Vercel Preview"]
        StageSeed["pnpm db:seed:staging\n(Dados Sintéticos Sanitizados)"]
        StageMigrate["pnpm db:migrate:deploy\n(Apenas aplica migrações pendentes)"]
        StageApp --> StageDB
        StageSeed --> StageDB
        StageMigrate --> StageDB
    end

    subgraph PROD["3. Produção (Produção Real)"]
        ProdDB[("PostgreSQL + PostGIS Alta Disp.\n(Supabase Prod / AWS RDS / Neon Prod)")]
        ProdApp["API Render Prod / Vercel Prod"]
        ProdSeed["pnpm db:seed:prod\n(Bootstrap Idempotente do Admin)"]
        ProdMigrate["pnpm db:migrate:deploy\n(Execução Controlada no Pipeline)"]
        ProdApp --> ProdDB
        ProdSeed --> ProdDB
        ProdMigrate --> ProdDB
    end

    DevMigrate -.->|Commit no Git| StageMigrate
    StageMigrate -.->|Aprovado em QA| ProdMigrate
```

---

## 2. Matriz Comparativa de Ambientes

| Dimensão | 1. Desenvolvimento (Dev) | 2. Homologação (Staging) | 3. Produção (Prod) |
|---|---|---|---|
| **Tipo de Instância** | Contêiner Docker local (`docker-compose.yml`) | Projeto Cloud gerenciado dedicado (`urboa-staging`) | Projeto Cloud gerenciado de produção (`urboa-prod`) |
| **Acesso a Conexão** | Aberto localmente via porta 5432 | Restrito por IP/Firewall da VPC e API Keys | Restrito a IPs da esteira e VPC da infraestrutura |
| **Comando de Migração** | `pnpm db:migrate:dev` *(Cria novas migrações)* | `pnpm db:migrate:deploy` *(Apenas aplica)* | `pnpm db:migrate:deploy` *(Apenas aplica)* |
| **Comando de Seed** | `pnpm db:seed` *(Limpeza completa + dados fake)* | `pnpm db:seed:staging` *(Cria/atualiza personas QA)* | `pnpm db:seed:prod` *(Idempotente, somente admin inicial)* |
| **Permissão de Destruição** | **SIM** (`deleteMany`, reset liberado) | **CONTROLADA** (apenas via reset script formal de QA) | **TERMINANTEMENTE PROIBIDA** (bloqueada via software) |
| **Backups** | Não aplicável (recriado via seed) | Snapshots semanais | PITR (Point-In-Time-Recovery) + Backups diários (30 dias) |

---

## 3. Gestão de Variáveis de Ambiente e Conexões

O Prisma exige duas conexões para PostgreSQL com Connection Pooler (ex: Supabase, PgBouncer, Neon):
- `DATABASE_URL`: Conexão transacional através do Pooler (porta 6543) para atender as requisições HTTP da API.
- `DIRECT_URL`: Conexão direta e persistente (porta 5432) usada pelo Prisma para executar `migrate deploy` e operações de DDL estruturais.

### 3.1. Arquivo Local (`.env` na raiz)
```ini
NODE_ENV=development
DATABASE_URL="postgresql://root:rootpassword@localhost:5432/predial_db?schema=public"
DIRECT_URL="postgresql://root:rootpassword@localhost:5432/predial_db?schema=public"
JWT_SECRET="dev_secret_local_test_key_2026"
SEED_DEFAULT_PASSWORD="Urboa@2026!"
```

### 3.2. Painel de Staging (Render Staging & Vercel Staging)
```ini
NODE_ENV=staging
DATABASE_URL="postgresql://postgres.[staging-ref]:[senha-staging]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?sslmode=require"
DIRECT_URL="postgresql://postgres.[staging-ref]:[senha-staging]@aws-0-sa-east-1.supabase.com:5432/postgres?sslmode=require"
JWT_SECRET="staging_secret_key_com_mais_de_32_caracteres_aleatorios_aqui"
FRONTEND_URL="https://staging.uboa.gov.br"
```

### 3.3. Painel de Produção (Render Prod & Vercel Prod)
```ini
NODE_ENV=production
DATABASE_URL="postgresql://postgres.[prod-ref]:[senha-prod-alta-seguranca]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?sslmode=require"
DIRECT_URL="postgresql://postgres.[prod-ref]:[senha-prod-alta-seguranca]@aws-0-sa-east-1.supabase.com:5432/postgres?sslmode=require"
JWT_SECRET="prod_secret_super_forte_gerado_com_openssl_rand_base64_36"
FRONTEND_URL="https://predial.uboa.gov.br"
ADMIN_INITIAL_EMAIL="admin@urboa.gov.br"
ADMIN_INITIAL_PASSWORD="[SenhaForteDefinidaNoDeploy]"
```

---

## 4. O Ciclo de Migrações: Regras de Ouro

### 1. Como Criar uma Nova Migração (Apenas em Dev):
Sempre que você alterar o arquivo `packages/database/prisma/schema.prisma`:
```bash
# Executado apenas na máquina local com o banco local rodando
pnpm db:migrate:dev --name adicao_campo_x
```
Isso gera um novo arquivo SQL dentro de `packages/database/prisma/migrations/YYYYMMDDHHMMSS_adicao_campo_x/migration.sql`.

### 2. O que NUNCA fazer em Staging e Produção:
- ❌ **NUNCA** execute `pnpm db:migrate:dev` em Staging ou Produção. O comando `migrate dev` pode tentar resetar o banco se detectar conflitos.
- ❌ **NUNCA** execute `prisma db push` em Staging ou Produção. O `db push` ignora o histórico de migrações e pode aplicar alterações destrutivas sem rastreio.
- ❌ **NUNCA** faça commits de arquivos `.env` com credenciais no Git.

### 3. Como Aplicar Migrações em Staging e Produção:
A esteira automatizada ou o comando manual no servidor deve rodar exclusivamente:
```bash
pnpm db:migrate:deploy
```
Este comando lê a tabela interna `_prisma_migrations`, identifica quais arquivos SQL ainda não foram executados e aplica cada um sequencialmente dentro de transações seguras.

---

## 5. Proteções em Nível de Código (Guardrails)

Para garantir que ninguém nunca execute comandos destrutivos no banco errado por acidente, as seguintes proteções estão ativas no código:

1. **Trava de Seed Destrutivo**:
   No arquivo `packages/database/prisma/seed.ts`:
   ```typescript
   if (process.env.NODE_ENV === 'production') {
     throw new Error('[FATAL] A execução de seed destrutivo está TERMINANTEMENTE BLOQUEADA em ambiente de produção.');
   }
   ```

2. **Validação de Força de Segredos**:
   Na inicialização da API NestJS (`apps/api/src/main.ts`):
   ```typescript
   if (process.env.NODE_ENV === 'production') {
     const secret = process.env.JWT_SECRET;
     if (!secret || secret.length < 32 || secret.includes('dev_fallback_insecure') || secret.includes('urboa_zelo_jwt')) {
       throw new Error('[SECURITY FATAL] JWT_SECRET de produção inválido ou fraco.');
     }
   }
   ```

---

## 6. Procedimento de Disaster Recovery (Restauração)

1. **Restauração em Staging**:
   - Staging pode ser resetado a qualquer momento utilizando o snapshot mais recente ou aplicando `pnpm db:migrate:deploy` seguido de `pnpm db:seed:staging`.
2. **Restauração em Produção**:
   - Em caso de perda de dados acidental ou corrupção lógica:
     1. Coloque a API em modo de manutenção (`Maintenance Mode` no Render).
     2. No painel do Supabase / RDS, acesse `Backups` ➔ `Point in Time Recovery (PITR)`.
     3. Selecione o timestamp exato anterior ao incidente (ex: 5 minutos antes).
     4. Conclua a restauração na nova branch/instância de banco de dados e aponte a `DATABASE_URL` no Render.
     5. Reative o tráfego da API.

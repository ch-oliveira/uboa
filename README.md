# Urboa / Predial — Sistema Integrado de Gestão e Zeladoria Predial Municipal

Plataforma SaaS moderna para gestão integrada de prédios públicos (escolas, hospitais, UBSs, praças e prédios administrativos), ordens de serviço, manutenção predial com controle fiscal para o Tribunal de Contas (TCE), ouvidoria 156 e medição financeira com fornecimento de materiais.

---

## 🏛️ Visão da Arquitetura do Monorepo

O repositório é gerenciado com **Turborepo** e **pnpm Workspaces**:

```
predial-monorepo/
├── apps/
│   ├── api/             # Backend NestJS 12 (REST, Prisma 6, JWT RBAC, Gemini IA)
│   ├── web/             # Frontend Next.js 16 (App Router, Tailwind CSS v4, Base UI)
│   └── mobile/          # App Mobile React Native / Expo (Técnicos de Campo)
├── packages/
│   ├── database/        # Prisma Schema, Migrações PostGIS e Seeds Idempotentes
│   ├── ui/              # Componentes de Design System compartilhados
│   ├── eslint-config/   # Regras compartilhadas de linting (Oxlint / ESLint)
│   └── typescript-config/ # Configurações de tsconfig compartilhadas
├── docs/                # Documentação Oficial de Engenharia, Deploys e Regras de Negócio
└── .github/workflows/   # Pipelines de CI/CD automatizadas (Quality Gates)
```

---

## 🚀 Guia de Inicialização Rápida (Localhost)

### 1. Pré-Requisitos
- **Node.js**: v20 ou superior
- **pnpm**: v11.25.0+ (`corepack enable && corepack prepare pnpm@11.25.0 --activate`)
- **Docker**: Para execução do PostgreSQL com extensão PostGIS

### 2. Configurar o Banco de Dados Local
Suba a instância Docker do PostGIS:
```bash
docker compose up -d
```

Copie as variáveis de ambiente:
```bash
cp .env.example .env
```

### 3. Instalar Dependências e Inicializar Dados
```bash
# Instalar todos os pacotes do monorepo
pnpm install

# Gerar o cliente Prisma e aplicar migrações locais
pnpm db:generate
pnpm db:migrate:dev

# Povoar banco local com tenant e dados realistas de teste
pnpm db:seed
```

### 4. Rodar o Ambiente de Desenvolvimento
```bash
pnpm dev
```
- **Web App**: [http://localhost:3002](http://localhost:3002) (ou :3000)
- **API NestJS**: [http://localhost:3001/api](http://localhost:3001/api)

---

## 📚 Documentação Oficial de Engenharia

Consulte a suíte de documentação oficial dentro da pasta [`docs/`](file:///Users/ch4rle2/.gemini/antigravity-ide/scratch/predial-monorepo/docs):

1. 🚀 **[Fluxo de Deploy & Git Strategy](file:///Users/ch4rle2/.gemini/antigravity-ide/scratch/predial-monorepo/docs/DEPLOYMENT_PIPELINE.md)**
   - Esteira completa: Localhost ➔ Staging ➔ Produção.
   - Nomenclatura de branches, regras de Pull Request e critérios de aprovação.
   - Proteção de branch no GitHub e rollback de emergência em 5 segundos.

2. 🗄️ **[Separação Definitiva de Bancos de Dados](file:///Users/ch4rle2/.gemini/antigravity-ide/scratch/predial-monorepo/docs/DATABASE_ENVIRONMENTS.md)**
   - Isolamento total entre Localhost (Docker), Staging (Cloud QA) e Produção (Supabase/RDS).
   - Política rigorosa de migrações (`migrate dev` vs `migrate deploy`).
   - Bloqueio via software contra scripts destrutivos em produção.

3. 👥 **[Matriz de Perfis e Usuários por Cenário](file:///Users/ch4rle2/.gemini/antigravity-ide/scratch/predial-monorepo/docs/USER_PROFILES_MATRIX.md)**
   - RBAC completo: `ADMIN`, `GESTOR`, `TECNICO`, `SOLICITANTE`.
   - Credenciais padronizadas para Dev e Staging.
   - Procedimento de bootstrap seguro (`seed:prod`) para produção.

4. ⚖️ **[Regras de Negócio e Fiscalização TCE](file:///Users/ch4rle2/.gemini/antigravity-ide/scratch/predial-monorepo/docs/BUSINESS_RULES_AND_FLOWS.md)**
   - Máquina de estados das Ordens de Serviço (OS) com fotos obrigatórias de conclusão.
   - Prazos fatais de SLA (Urgente: 4h, Alta: 24h, Média: 72h, Baixa: 168h) e suspensão por pausa justificada.
   - Travas duras (hard block) de saldo orçamentário de contratos e controle de vigência.
   - Ouvidoria 156 e trilha de auditoria imutável.

5. 📝 **[Padrão de Documentação TSDoc](file:///Users/ch4rle2/.gemini/antigravity-ide/scratch/predial-monorepo/docs/TSDOC_STANDARDS.md)**
   - Diretrizes de anotação de classes, métodos, DTOs e funções (`@param`, `@returns`, `@throws`, `@remarks`).
   - Integração com IntelliSense e geração Swagger em `/api/docs`.

---

## 🛠️ Comandos Essenciais

| Comando | Finalidade |
|---|---|
| `pnpm dev` | Inicia todos os serviços em modo watch com hot-reload |
| `pnpm validate` | Executa todos os testes de qualidade (lint + typecheck + test) |
| `pnpm check-types` | Valida tipagem TypeScript estática em todo o monorepo |
| `pnpm lint` | Analisa qualidade de código com Oxlint e ESLint |
| `pnpm test` | Executa a suíte de testes unitários e de integração com Vitest |
| `pnpm db:migrate:dev` | Cria e aplica nova migração em desenvolvimento local |
| `pnpm db:migrate:deploy` | Aplica migrações pendentes em Staging ou Produção |
| `pnpm db:seed` | Popula o banco local com prefeitura piloto e dados de teste |
| `pnpm db:seed:prod` | Inicializa o administrador de produção de forma não destrutiva |
| `pnpm db:studio` | Abre o Prisma Studio web para inspeção visual das tabelas |

# Padrão Oficial de Documentação de Código com TSDoc

Este documento define o padrão obrigatório de documentação de código (**TSDoc**) adotado em todo o monorepo **Urboa / Predial** (Backend NestJS, Frontend Next.js e Pacote de Banco de Dados).

---

## 1. Diretrizes Gerais

1. **Objetivo**: O TSDoc deve explicar o **porquê** e as **regras de negócio**, e não apenas repetir o nome da variável ou função.
2. **Obrigatoriedade**:
   - Todo método público de Service, Controller e Guard no NestJS.
   - Todas as Server Actions e funções do cliente de API no Next.js (`api-client.ts`).
   - Todos os DTOs e entidades com validações ou restrições de negócio.
3. **Linguagem**: Documentação escrita em **Português (Brasil)** para alinhamento com a legislação pública e termos municipais (TCE, SINAPI, empenho, OS, SLA).

---

## 2. Tags Padrão TSDoc

| Tag | Finalidade | Exemplo de Uso |
|---|---|---|
| `@param` | Explica um parâmetro de entrada, formato ou restrição | `@param id - Identificador UUID da Ordem de Serviço.` |
| `@returns` | Explica o retorno da função e o tipo resolvido na Promise | `@returns Objeto detalhado da OS com histórico de pausas e medição.` |
| `@throws` | Documenta as exceções HTTP que o método pode lançar | `@throws {NotFoundException} Se a OS não for localizada.` |
| `@remarks` | Contexto arquitetural, regras de negócio ou auditoria | `@remarks Atende às exigências de fiscalização do Tribunal de Contas (TCE).` |
| `@example` | Exemplo prático de chamada do método | Demonstração clara de consumo do método. |

---

## 3. Exemplos Práticos por Camada da Aplicação

### 3.1. NestJS: Service de Negócio (ex: `ContractsService`)

```typescript
/**
 * Serviço responsável pela gestão de contratos públicos de manutenção predial e empenhos municipais.
 * 
 * @remarks
 * Este serviço implementa as travas orçamentárias duras (hard blocks) exigidas pelo
 * Tribunal de Contas do Estado (TCE) para impedir pagamentos ou medições sem cobertura de empenho.
 */
@Injectable()
export class ContractsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Valida a vigência e a disponibilidade de saldo orçamentário para vinculação de uma nova medição.
   *
   * @param contratoId - Identificador UUID do contrato de manutenção cadastrado.
   * @param valorMedicao - Custo total calculado da medição (materiais + mão de obra).
   * 
   * @returns Retorna o saldo orçamentário remanescente após a aplicação da medição.
   * 
   * @throws {NotFoundException} Caso o contrato não exista ou não pertença ao tenant do município.
   * @throws {BadRequestException} Se o contrato estiver fora do período de vigência.
   * @throws {BadRequestException} Se o valor da medição ultrapassar o saldo disponível de empenho.
   * 
   * @example
   * ```typescript
   * const saldoRestante = await contractsService.validarSaldoEEmpenho('contrato-123', 1540.50);
   * console.log(`Saldo restante: R$ ${saldoRestante}`);
   * ```
   */
  async validarSaldoEEmpenho(contratoId: string, valorMedicao: number): Promise<number> {
    // Implementação com checagem de vigência e saldo...
  }
}
```

---

### 3.2. NestJS: DTO (Data Transfer Object) com Validação

```typescript
/**
 * DTO para apontamento de conclusão de Ordem de Serviço com evidências de campo.
 */
export class ConcluirOrdemServicoDto {
  /**
   * URLs das fotografias tiradas pelo técnico comprovando o reparo executado.
   * 
   * @remarks
   * O Tribunal de Contas exige no mínimo uma fotografia comprobatória para liquidação da despesa pública.
   */
  @IsArray()
  @ArrayMinSize(1, { message: 'É obrigatório anexar pelo menos uma fotografia da conclusão do serviço.' })
  @IsString({ each: true })
  fotos_conclusao: string[];

  /**
   * Justificativa obrigatória caso o atendimento tenha superado a data limite de SLA.
   */
  @IsOptional()
  @IsString()
  motivo_violacao_sla?: string;
}
```

---

### 3.3. Next.js: Cliente de API / Hook (ex: `api-client.ts`)

```typescript
/**
 * Transiciona o estado operacional de uma Ordem de Serviço para AGUARDANDO (Pausa).
 *
 * @param osId - Identificador único da Ordem de Serviço.
 * @param motivo - Justificativa detalhada do motivo da paralisação (ex: falta de peça, chuva).
 * 
 * @returns Promessa com a Ordem de Serviço atualizada e cronômetro de MTTR suspenso.
 * 
 * @remarks
 * O período em pausa não é contabilizado no tempo de atendimento do técnico para fins de SLA.
 * 
 * @example
 * ```typescript
 * await pausarOrdemServico('os-48192', 'Aguardando chegada do disjuntor bipolar de reposição');
 * ```
 */
export async function pausarOrdemServico(osId: string, motivo: string): Promise<OrdemServicoResponse> {
  return request(`/work-orders/${osId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'AGUARDANDO', motivo_pausa: motivo }),
  });
}
```

---

## 4. Como Validar a Documentação

1. **Verificação de Tipos**:
   ```bash
   pnpm check-types
   ```
2. **Integração com IDE**:
   Ao posicionar o cursor sobre qualquer método no VSCode / Antigravity IDE, o popover do IntelliSense exibirá imediatamente as regras de negócio, exceções lançadas e parâmetros esperados.
3. **Geração Automática de Documentação Swagger / OpenAPI**:
   A API NestJS utiliza os metadados dos DTOs e métodos para compilar a documentação Swagger em tempo de execução na rota `/api/docs`.

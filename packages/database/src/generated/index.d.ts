
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Usuario
 * 
 */
export type Usuario = $Result.DefaultSelection<Prisma.$UsuarioPayload>
/**
 * Model Predio
 * 
 */
export type Predio = $Result.DefaultSelection<Prisma.$PredioPayload>
/**
 * Model OrdemServico
 * 
 */
export type OrdemServico = $Result.DefaultSelection<Prisma.$OrdemServicoPayload>
/**
 * Model AuditoriaLog
 * 
 */
export type AuditoriaLog = $Result.DefaultSelection<Prisma.$AuditoriaLogPayload>
/**
 * Model AgendaVistoria
 * 
 */
export type AgendaVistoria = $Result.DefaultSelection<Prisma.$AgendaVistoriaPayload>
/**
 * Model ConfiguracaoSistema
 * 
 */
export type ConfiguracaoSistema = $Result.DefaultSelection<Prisma.$ConfiguracaoSistemaPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const Role: {
  ADMIN: 'ADMIN',
  GESTOR: 'GESTOR',
  TECNICO: 'TECNICO',
  SOLICITANTE: 'SOLICITANTE'
};

export type Role = (typeof Role)[keyof typeof Role]


export const TipoPredio: {
  ESCOLA: 'ESCOLA',
  HOSPITAL: 'HOSPITAL',
  PRACA: 'PRACA',
  ADMINISTRATIVO: 'ADMINISTRATIVO',
  UBS: 'UBS'
};

export type TipoPredio = (typeof TipoPredio)[keyof typeof TipoPredio]


export const Prioridade: {
  BAIXA: 'BAIXA',
  MEDIA: 'MEDIA',
  ALTA: 'ALTA',
  URGENTE: 'URGENTE'
};

export type Prioridade = (typeof Prioridade)[keyof typeof Prioridade]


export const StatusOS: {
  RECEBIDO: 'RECEBIDO',
  EM_TRIAGEM: 'EM_TRIAGEM',
  AGENDADO: 'AGENDADO',
  AGUARDANDO: 'AGUARDANDO',
  EM_EXECUCAO: 'EM_EXECUCAO',
  CONCLUIDO: 'CONCLUIDO',
  CANCELADO: 'CANCELADO'
};

export type StatusOS = (typeof StatusOS)[keyof typeof StatusOS]


export const AuditAction: {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE'
};

export type AuditAction = (typeof AuditAction)[keyof typeof AuditAction]

}

export type Role = $Enums.Role

export const Role: typeof $Enums.Role

export type TipoPredio = $Enums.TipoPredio

export const TipoPredio: typeof $Enums.TipoPredio

export type Prioridade = $Enums.Prioridade

export const Prioridade: typeof $Enums.Prioridade

export type StatusOS = $Enums.StatusOS

export const StatusOS: typeof $Enums.StatusOS

export type AuditAction = $Enums.AuditAction

export const AuditAction: typeof $Enums.AuditAction

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Usuarios
 * const usuarios = await prisma.usuario.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Usuarios
   * const usuarios = await prisma.usuario.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.usuario`: Exposes CRUD operations for the **Usuario** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Usuarios
    * const usuarios = await prisma.usuario.findMany()
    * ```
    */
  get usuario(): Prisma.UsuarioDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.predio`: Exposes CRUD operations for the **Predio** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Predios
    * const predios = await prisma.predio.findMany()
    * ```
    */
  get predio(): Prisma.PredioDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.ordemServico`: Exposes CRUD operations for the **OrdemServico** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more OrdemServicos
    * const ordemServicos = await prisma.ordemServico.findMany()
    * ```
    */
  get ordemServico(): Prisma.OrdemServicoDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.auditoriaLog`: Exposes CRUD operations for the **AuditoriaLog** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AuditoriaLogs
    * const auditoriaLogs = await prisma.auditoriaLog.findMany()
    * ```
    */
  get auditoriaLog(): Prisma.AuditoriaLogDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.agendaVistoria`: Exposes CRUD operations for the **AgendaVistoria** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AgendaVistorias
    * const agendaVistorias = await prisma.agendaVistoria.findMany()
    * ```
    */
  get agendaVistoria(): Prisma.AgendaVistoriaDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.configuracaoSistema`: Exposes CRUD operations for the **ConfiguracaoSistema** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ConfiguracaoSistemas
    * const configuracaoSistemas = await prisma.configuracaoSistema.findMany()
    * ```
    */
  get configuracaoSistema(): Prisma.ConfiguracaoSistemaDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.19.3
   * Query Engine version: c2990dca591cba766e3b7ef5d9e8a84796e47ab7
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Usuario: 'Usuario',
    Predio: 'Predio',
    OrdemServico: 'OrdemServico',
    AuditoriaLog: 'AuditoriaLog',
    AgendaVistoria: 'AgendaVistoria',
    ConfiguracaoSistema: 'ConfiguracaoSistema'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "usuario" | "predio" | "ordemServico" | "auditoriaLog" | "agendaVistoria" | "configuracaoSistema"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Usuario: {
        payload: Prisma.$UsuarioPayload<ExtArgs>
        fields: Prisma.UsuarioFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UsuarioFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsuarioPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UsuarioFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsuarioPayload>
          }
          findFirst: {
            args: Prisma.UsuarioFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsuarioPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UsuarioFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsuarioPayload>
          }
          findMany: {
            args: Prisma.UsuarioFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsuarioPayload>[]
          }
          create: {
            args: Prisma.UsuarioCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsuarioPayload>
          }
          createMany: {
            args: Prisma.UsuarioCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UsuarioCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsuarioPayload>[]
          }
          delete: {
            args: Prisma.UsuarioDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsuarioPayload>
          }
          update: {
            args: Prisma.UsuarioUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsuarioPayload>
          }
          deleteMany: {
            args: Prisma.UsuarioDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UsuarioUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UsuarioUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsuarioPayload>[]
          }
          upsert: {
            args: Prisma.UsuarioUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsuarioPayload>
          }
          aggregate: {
            args: Prisma.UsuarioAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUsuario>
          }
          groupBy: {
            args: Prisma.UsuarioGroupByArgs<ExtArgs>
            result: $Utils.Optional<UsuarioGroupByOutputType>[]
          }
          count: {
            args: Prisma.UsuarioCountArgs<ExtArgs>
            result: $Utils.Optional<UsuarioCountAggregateOutputType> | number
          }
        }
      }
      Predio: {
        payload: Prisma.$PredioPayload<ExtArgs>
        fields: Prisma.PredioFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PredioFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PredioPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PredioFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PredioPayload>
          }
          findFirst: {
            args: Prisma.PredioFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PredioPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PredioFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PredioPayload>
          }
          findMany: {
            args: Prisma.PredioFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PredioPayload>[]
          }
          create: {
            args: Prisma.PredioCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PredioPayload>
          }
          createMany: {
            args: Prisma.PredioCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PredioCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PredioPayload>[]
          }
          delete: {
            args: Prisma.PredioDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PredioPayload>
          }
          update: {
            args: Prisma.PredioUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PredioPayload>
          }
          deleteMany: {
            args: Prisma.PredioDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PredioUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.PredioUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PredioPayload>[]
          }
          upsert: {
            args: Prisma.PredioUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PredioPayload>
          }
          aggregate: {
            args: Prisma.PredioAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePredio>
          }
          groupBy: {
            args: Prisma.PredioGroupByArgs<ExtArgs>
            result: $Utils.Optional<PredioGroupByOutputType>[]
          }
          count: {
            args: Prisma.PredioCountArgs<ExtArgs>
            result: $Utils.Optional<PredioCountAggregateOutputType> | number
          }
        }
      }
      OrdemServico: {
        payload: Prisma.$OrdemServicoPayload<ExtArgs>
        fields: Prisma.OrdemServicoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.OrdemServicoFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrdemServicoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.OrdemServicoFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrdemServicoPayload>
          }
          findFirst: {
            args: Prisma.OrdemServicoFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrdemServicoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.OrdemServicoFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrdemServicoPayload>
          }
          findMany: {
            args: Prisma.OrdemServicoFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrdemServicoPayload>[]
          }
          create: {
            args: Prisma.OrdemServicoCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrdemServicoPayload>
          }
          createMany: {
            args: Prisma.OrdemServicoCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.OrdemServicoCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrdemServicoPayload>[]
          }
          delete: {
            args: Prisma.OrdemServicoDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrdemServicoPayload>
          }
          update: {
            args: Prisma.OrdemServicoUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrdemServicoPayload>
          }
          deleteMany: {
            args: Prisma.OrdemServicoDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.OrdemServicoUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.OrdemServicoUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrdemServicoPayload>[]
          }
          upsert: {
            args: Prisma.OrdemServicoUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrdemServicoPayload>
          }
          aggregate: {
            args: Prisma.OrdemServicoAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOrdemServico>
          }
          groupBy: {
            args: Prisma.OrdemServicoGroupByArgs<ExtArgs>
            result: $Utils.Optional<OrdemServicoGroupByOutputType>[]
          }
          count: {
            args: Prisma.OrdemServicoCountArgs<ExtArgs>
            result: $Utils.Optional<OrdemServicoCountAggregateOutputType> | number
          }
        }
      }
      AuditoriaLog: {
        payload: Prisma.$AuditoriaLogPayload<ExtArgs>
        fields: Prisma.AuditoriaLogFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AuditoriaLogFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditoriaLogPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AuditoriaLogFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditoriaLogPayload>
          }
          findFirst: {
            args: Prisma.AuditoriaLogFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditoriaLogPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AuditoriaLogFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditoriaLogPayload>
          }
          findMany: {
            args: Prisma.AuditoriaLogFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditoriaLogPayload>[]
          }
          create: {
            args: Prisma.AuditoriaLogCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditoriaLogPayload>
          }
          createMany: {
            args: Prisma.AuditoriaLogCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AuditoriaLogCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditoriaLogPayload>[]
          }
          delete: {
            args: Prisma.AuditoriaLogDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditoriaLogPayload>
          }
          update: {
            args: Prisma.AuditoriaLogUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditoriaLogPayload>
          }
          deleteMany: {
            args: Prisma.AuditoriaLogDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AuditoriaLogUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AuditoriaLogUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditoriaLogPayload>[]
          }
          upsert: {
            args: Prisma.AuditoriaLogUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditoriaLogPayload>
          }
          aggregate: {
            args: Prisma.AuditoriaLogAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAuditoriaLog>
          }
          groupBy: {
            args: Prisma.AuditoriaLogGroupByArgs<ExtArgs>
            result: $Utils.Optional<AuditoriaLogGroupByOutputType>[]
          }
          count: {
            args: Prisma.AuditoriaLogCountArgs<ExtArgs>
            result: $Utils.Optional<AuditoriaLogCountAggregateOutputType> | number
          }
        }
      }
      AgendaVistoria: {
        payload: Prisma.$AgendaVistoriaPayload<ExtArgs>
        fields: Prisma.AgendaVistoriaFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AgendaVistoriaFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgendaVistoriaPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AgendaVistoriaFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgendaVistoriaPayload>
          }
          findFirst: {
            args: Prisma.AgendaVistoriaFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgendaVistoriaPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AgendaVistoriaFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgendaVistoriaPayload>
          }
          findMany: {
            args: Prisma.AgendaVistoriaFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgendaVistoriaPayload>[]
          }
          create: {
            args: Prisma.AgendaVistoriaCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgendaVistoriaPayload>
          }
          createMany: {
            args: Prisma.AgendaVistoriaCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AgendaVistoriaCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgendaVistoriaPayload>[]
          }
          delete: {
            args: Prisma.AgendaVistoriaDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgendaVistoriaPayload>
          }
          update: {
            args: Prisma.AgendaVistoriaUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgendaVistoriaPayload>
          }
          deleteMany: {
            args: Prisma.AgendaVistoriaDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AgendaVistoriaUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AgendaVistoriaUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgendaVistoriaPayload>[]
          }
          upsert: {
            args: Prisma.AgendaVistoriaUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgendaVistoriaPayload>
          }
          aggregate: {
            args: Prisma.AgendaVistoriaAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAgendaVistoria>
          }
          groupBy: {
            args: Prisma.AgendaVistoriaGroupByArgs<ExtArgs>
            result: $Utils.Optional<AgendaVistoriaGroupByOutputType>[]
          }
          count: {
            args: Prisma.AgendaVistoriaCountArgs<ExtArgs>
            result: $Utils.Optional<AgendaVistoriaCountAggregateOutputType> | number
          }
        }
      }
      ConfiguracaoSistema: {
        payload: Prisma.$ConfiguracaoSistemaPayload<ExtArgs>
        fields: Prisma.ConfiguracaoSistemaFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ConfiguracaoSistemaFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConfiguracaoSistemaPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ConfiguracaoSistemaFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConfiguracaoSistemaPayload>
          }
          findFirst: {
            args: Prisma.ConfiguracaoSistemaFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConfiguracaoSistemaPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ConfiguracaoSistemaFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConfiguracaoSistemaPayload>
          }
          findMany: {
            args: Prisma.ConfiguracaoSistemaFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConfiguracaoSistemaPayload>[]
          }
          create: {
            args: Prisma.ConfiguracaoSistemaCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConfiguracaoSistemaPayload>
          }
          createMany: {
            args: Prisma.ConfiguracaoSistemaCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ConfiguracaoSistemaCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConfiguracaoSistemaPayload>[]
          }
          delete: {
            args: Prisma.ConfiguracaoSistemaDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConfiguracaoSistemaPayload>
          }
          update: {
            args: Prisma.ConfiguracaoSistemaUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConfiguracaoSistemaPayload>
          }
          deleteMany: {
            args: Prisma.ConfiguracaoSistemaDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ConfiguracaoSistemaUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ConfiguracaoSistemaUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConfiguracaoSistemaPayload>[]
          }
          upsert: {
            args: Prisma.ConfiguracaoSistemaUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConfiguracaoSistemaPayload>
          }
          aggregate: {
            args: Prisma.ConfiguracaoSistemaAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateConfiguracaoSistema>
          }
          groupBy: {
            args: Prisma.ConfiguracaoSistemaGroupByArgs<ExtArgs>
            result: $Utils.Optional<ConfiguracaoSistemaGroupByOutputType>[]
          }
          count: {
            args: Prisma.ConfiguracaoSistemaCountArgs<ExtArgs>
            result: $Utils.Optional<ConfiguracaoSistemaCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory | null
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    usuario?: UsuarioOmit
    predio?: PredioOmit
    ordemServico?: OrdemServicoOmit
    auditoriaLog?: AuditoriaLogOmit
    agendaVistoria?: AgendaVistoriaOmit
    configuracaoSistema?: ConfiguracaoSistemaOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type UsuarioCountOutputType
   */

  export type UsuarioCountOutputType = {
    predios_geridos: number
    chamados_solicitados: number
    chamados_atribuidos: number
    auditorias: number
  }

  export type UsuarioCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    predios_geridos?: boolean | UsuarioCountOutputTypeCountPredios_geridosArgs
    chamados_solicitados?: boolean | UsuarioCountOutputTypeCountChamados_solicitadosArgs
    chamados_atribuidos?: boolean | UsuarioCountOutputTypeCountChamados_atribuidosArgs
    auditorias?: boolean | UsuarioCountOutputTypeCountAuditoriasArgs
  }

  // Custom InputTypes
  /**
   * UsuarioCountOutputType without action
   */
  export type UsuarioCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UsuarioCountOutputType
     */
    select?: UsuarioCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UsuarioCountOutputType without action
   */
  export type UsuarioCountOutputTypeCountPredios_geridosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PredioWhereInput
  }

  /**
   * UsuarioCountOutputType without action
   */
  export type UsuarioCountOutputTypeCountChamados_solicitadosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrdemServicoWhereInput
  }

  /**
   * UsuarioCountOutputType without action
   */
  export type UsuarioCountOutputTypeCountChamados_atribuidosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrdemServicoWhereInput
  }

  /**
   * UsuarioCountOutputType without action
   */
  export type UsuarioCountOutputTypeCountAuditoriasArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AuditoriaLogWhereInput
  }


  /**
   * Count Type PredioCountOutputType
   */

  export type PredioCountOutputType = {
    ordens_servico: number
  }

  export type PredioCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    ordens_servico?: boolean | PredioCountOutputTypeCountOrdens_servicoArgs
  }

  // Custom InputTypes
  /**
   * PredioCountOutputType without action
   */
  export type PredioCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PredioCountOutputType
     */
    select?: PredioCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * PredioCountOutputType without action
   */
  export type PredioCountOutputTypeCountOrdens_servicoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrdemServicoWhereInput
  }


  /**
   * Count Type OrdemServicoCountOutputType
   */

  export type OrdemServicoCountOutputType = {
    ordens_derivadas: number
  }

  export type OrdemServicoCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    ordens_derivadas?: boolean | OrdemServicoCountOutputTypeCountOrdens_derivadasArgs
  }

  // Custom InputTypes
  /**
   * OrdemServicoCountOutputType without action
   */
  export type OrdemServicoCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrdemServicoCountOutputType
     */
    select?: OrdemServicoCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * OrdemServicoCountOutputType without action
   */
  export type OrdemServicoCountOutputTypeCountOrdens_derivadasArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrdemServicoWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Usuario
   */

  export type AggregateUsuario = {
    _count: UsuarioCountAggregateOutputType | null
    _avg: UsuarioAvgAggregateOutputType | null
    _sum: UsuarioSumAggregateOutputType | null
    _min: UsuarioMinAggregateOutputType | null
    _max: UsuarioMaxAggregateOutputType | null
  }

  export type UsuarioAvgAggregateOutputType = {
    token_version: number | null
  }

  export type UsuarioSumAggregateOutputType = {
    token_version: number | null
  }

  export type UsuarioMinAggregateOutputType = {
    id: string | null
    nome: string | null
    email: string | null
    senha_hash: string | null
    role: $Enums.Role | null
    telefone: string | null
    token_version: number | null
    criado_em: Date | null
    atualizado: Date | null
  }

  export type UsuarioMaxAggregateOutputType = {
    id: string | null
    nome: string | null
    email: string | null
    senha_hash: string | null
    role: $Enums.Role | null
    telefone: string | null
    token_version: number | null
    criado_em: Date | null
    atualizado: Date | null
  }

  export type UsuarioCountAggregateOutputType = {
    id: number
    nome: number
    email: number
    senha_hash: number
    role: number
    telefone: number
    token_version: number
    criado_em: number
    atualizado: number
    _all: number
  }


  export type UsuarioAvgAggregateInputType = {
    token_version?: true
  }

  export type UsuarioSumAggregateInputType = {
    token_version?: true
  }

  export type UsuarioMinAggregateInputType = {
    id?: true
    nome?: true
    email?: true
    senha_hash?: true
    role?: true
    telefone?: true
    token_version?: true
    criado_em?: true
    atualizado?: true
  }

  export type UsuarioMaxAggregateInputType = {
    id?: true
    nome?: true
    email?: true
    senha_hash?: true
    role?: true
    telefone?: true
    token_version?: true
    criado_em?: true
    atualizado?: true
  }

  export type UsuarioCountAggregateInputType = {
    id?: true
    nome?: true
    email?: true
    senha_hash?: true
    role?: true
    telefone?: true
    token_version?: true
    criado_em?: true
    atualizado?: true
    _all?: true
  }

  export type UsuarioAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Usuario to aggregate.
     */
    where?: UsuarioWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Usuarios to fetch.
     */
    orderBy?: UsuarioOrderByWithRelationInput | UsuarioOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UsuarioWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Usuarios from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Usuarios.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Usuarios
    **/
    _count?: true | UsuarioCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: UsuarioAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: UsuarioSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UsuarioMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UsuarioMaxAggregateInputType
  }

  export type GetUsuarioAggregateType<T extends UsuarioAggregateArgs> = {
        [P in keyof T & keyof AggregateUsuario]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUsuario[P]>
      : GetScalarType<T[P], AggregateUsuario[P]>
  }




  export type UsuarioGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UsuarioWhereInput
    orderBy?: UsuarioOrderByWithAggregationInput | UsuarioOrderByWithAggregationInput[]
    by: UsuarioScalarFieldEnum[] | UsuarioScalarFieldEnum
    having?: UsuarioScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UsuarioCountAggregateInputType | true
    _avg?: UsuarioAvgAggregateInputType
    _sum?: UsuarioSumAggregateInputType
    _min?: UsuarioMinAggregateInputType
    _max?: UsuarioMaxAggregateInputType
  }

  export type UsuarioGroupByOutputType = {
    id: string
    nome: string
    email: string
    senha_hash: string
    role: $Enums.Role
    telefone: string | null
    token_version: number
    criado_em: Date
    atualizado: Date
    _count: UsuarioCountAggregateOutputType | null
    _avg: UsuarioAvgAggregateOutputType | null
    _sum: UsuarioSumAggregateOutputType | null
    _min: UsuarioMinAggregateOutputType | null
    _max: UsuarioMaxAggregateOutputType | null
  }

  type GetUsuarioGroupByPayload<T extends UsuarioGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UsuarioGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UsuarioGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UsuarioGroupByOutputType[P]>
            : GetScalarType<T[P], UsuarioGroupByOutputType[P]>
        }
      >
    >


  export type UsuarioSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    nome?: boolean
    email?: boolean
    senha_hash?: boolean
    role?: boolean
    telefone?: boolean
    token_version?: boolean
    criado_em?: boolean
    atualizado?: boolean
    predios_geridos?: boolean | Usuario$predios_geridosArgs<ExtArgs>
    chamados_solicitados?: boolean | Usuario$chamados_solicitadosArgs<ExtArgs>
    chamados_atribuidos?: boolean | Usuario$chamados_atribuidosArgs<ExtArgs>
    auditorias?: boolean | Usuario$auditoriasArgs<ExtArgs>
    _count?: boolean | UsuarioCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["usuario"]>

  export type UsuarioSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    nome?: boolean
    email?: boolean
    senha_hash?: boolean
    role?: boolean
    telefone?: boolean
    token_version?: boolean
    criado_em?: boolean
    atualizado?: boolean
  }, ExtArgs["result"]["usuario"]>

  export type UsuarioSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    nome?: boolean
    email?: boolean
    senha_hash?: boolean
    role?: boolean
    telefone?: boolean
    token_version?: boolean
    criado_em?: boolean
    atualizado?: boolean
  }, ExtArgs["result"]["usuario"]>

  export type UsuarioSelectScalar = {
    id?: boolean
    nome?: boolean
    email?: boolean
    senha_hash?: boolean
    role?: boolean
    telefone?: boolean
    token_version?: boolean
    criado_em?: boolean
    atualizado?: boolean
  }

  export type UsuarioOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "nome" | "email" | "senha_hash" | "role" | "telefone" | "token_version" | "criado_em" | "atualizado", ExtArgs["result"]["usuario"]>
  export type UsuarioInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    predios_geridos?: boolean | Usuario$predios_geridosArgs<ExtArgs>
    chamados_solicitados?: boolean | Usuario$chamados_solicitadosArgs<ExtArgs>
    chamados_atribuidos?: boolean | Usuario$chamados_atribuidosArgs<ExtArgs>
    auditorias?: boolean | Usuario$auditoriasArgs<ExtArgs>
    _count?: boolean | UsuarioCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UsuarioIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type UsuarioIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $UsuarioPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Usuario"
    objects: {
      predios_geridos: Prisma.$PredioPayload<ExtArgs>[]
      chamados_solicitados: Prisma.$OrdemServicoPayload<ExtArgs>[]
      chamados_atribuidos: Prisma.$OrdemServicoPayload<ExtArgs>[]
      auditorias: Prisma.$AuditoriaLogPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      nome: string
      email: string
      senha_hash: string
      role: $Enums.Role
      telefone: string | null
      token_version: number
      criado_em: Date
      atualizado: Date
    }, ExtArgs["result"]["usuario"]>
    composites: {}
  }

  type UsuarioGetPayload<S extends boolean | null | undefined | UsuarioDefaultArgs> = $Result.GetResult<Prisma.$UsuarioPayload, S>

  type UsuarioCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UsuarioFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UsuarioCountAggregateInputType | true
    }

  export interface UsuarioDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Usuario'], meta: { name: 'Usuario' } }
    /**
     * Find zero or one Usuario that matches the filter.
     * @param {UsuarioFindUniqueArgs} args - Arguments to find a Usuario
     * @example
     * // Get one Usuario
     * const usuario = await prisma.usuario.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UsuarioFindUniqueArgs>(args: SelectSubset<T, UsuarioFindUniqueArgs<ExtArgs>>): Prisma__UsuarioClient<$Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Usuario that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UsuarioFindUniqueOrThrowArgs} args - Arguments to find a Usuario
     * @example
     * // Get one Usuario
     * const usuario = await prisma.usuario.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UsuarioFindUniqueOrThrowArgs>(args: SelectSubset<T, UsuarioFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UsuarioClient<$Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Usuario that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsuarioFindFirstArgs} args - Arguments to find a Usuario
     * @example
     * // Get one Usuario
     * const usuario = await prisma.usuario.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UsuarioFindFirstArgs>(args?: SelectSubset<T, UsuarioFindFirstArgs<ExtArgs>>): Prisma__UsuarioClient<$Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Usuario that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsuarioFindFirstOrThrowArgs} args - Arguments to find a Usuario
     * @example
     * // Get one Usuario
     * const usuario = await prisma.usuario.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UsuarioFindFirstOrThrowArgs>(args?: SelectSubset<T, UsuarioFindFirstOrThrowArgs<ExtArgs>>): Prisma__UsuarioClient<$Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Usuarios that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsuarioFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Usuarios
     * const usuarios = await prisma.usuario.findMany()
     * 
     * // Get first 10 Usuarios
     * const usuarios = await prisma.usuario.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const usuarioWithIdOnly = await prisma.usuario.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UsuarioFindManyArgs>(args?: SelectSubset<T, UsuarioFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Usuario.
     * @param {UsuarioCreateArgs} args - Arguments to create a Usuario.
     * @example
     * // Create one Usuario
     * const Usuario = await prisma.usuario.create({
     *   data: {
     *     // ... data to create a Usuario
     *   }
     * })
     * 
     */
    create<T extends UsuarioCreateArgs>(args: SelectSubset<T, UsuarioCreateArgs<ExtArgs>>): Prisma__UsuarioClient<$Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Usuarios.
     * @param {UsuarioCreateManyArgs} args - Arguments to create many Usuarios.
     * @example
     * // Create many Usuarios
     * const usuario = await prisma.usuario.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UsuarioCreateManyArgs>(args?: SelectSubset<T, UsuarioCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Usuarios and returns the data saved in the database.
     * @param {UsuarioCreateManyAndReturnArgs} args - Arguments to create many Usuarios.
     * @example
     * // Create many Usuarios
     * const usuario = await prisma.usuario.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Usuarios and only return the `id`
     * const usuarioWithIdOnly = await prisma.usuario.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UsuarioCreateManyAndReturnArgs>(args?: SelectSubset<T, UsuarioCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Usuario.
     * @param {UsuarioDeleteArgs} args - Arguments to delete one Usuario.
     * @example
     * // Delete one Usuario
     * const Usuario = await prisma.usuario.delete({
     *   where: {
     *     // ... filter to delete one Usuario
     *   }
     * })
     * 
     */
    delete<T extends UsuarioDeleteArgs>(args: SelectSubset<T, UsuarioDeleteArgs<ExtArgs>>): Prisma__UsuarioClient<$Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Usuario.
     * @param {UsuarioUpdateArgs} args - Arguments to update one Usuario.
     * @example
     * // Update one Usuario
     * const usuario = await prisma.usuario.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UsuarioUpdateArgs>(args: SelectSubset<T, UsuarioUpdateArgs<ExtArgs>>): Prisma__UsuarioClient<$Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Usuarios.
     * @param {UsuarioDeleteManyArgs} args - Arguments to filter Usuarios to delete.
     * @example
     * // Delete a few Usuarios
     * const { count } = await prisma.usuario.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UsuarioDeleteManyArgs>(args?: SelectSubset<T, UsuarioDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Usuarios.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsuarioUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Usuarios
     * const usuario = await prisma.usuario.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UsuarioUpdateManyArgs>(args: SelectSubset<T, UsuarioUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Usuarios and returns the data updated in the database.
     * @param {UsuarioUpdateManyAndReturnArgs} args - Arguments to update many Usuarios.
     * @example
     * // Update many Usuarios
     * const usuario = await prisma.usuario.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Usuarios and only return the `id`
     * const usuarioWithIdOnly = await prisma.usuario.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UsuarioUpdateManyAndReturnArgs>(args: SelectSubset<T, UsuarioUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Usuario.
     * @param {UsuarioUpsertArgs} args - Arguments to update or create a Usuario.
     * @example
     * // Update or create a Usuario
     * const usuario = await prisma.usuario.upsert({
     *   create: {
     *     // ... data to create a Usuario
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Usuario we want to update
     *   }
     * })
     */
    upsert<T extends UsuarioUpsertArgs>(args: SelectSubset<T, UsuarioUpsertArgs<ExtArgs>>): Prisma__UsuarioClient<$Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Usuarios.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsuarioCountArgs} args - Arguments to filter Usuarios to count.
     * @example
     * // Count the number of Usuarios
     * const count = await prisma.usuario.count({
     *   where: {
     *     // ... the filter for the Usuarios we want to count
     *   }
     * })
    **/
    count<T extends UsuarioCountArgs>(
      args?: Subset<T, UsuarioCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UsuarioCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Usuario.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsuarioAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UsuarioAggregateArgs>(args: Subset<T, UsuarioAggregateArgs>): Prisma.PrismaPromise<GetUsuarioAggregateType<T>>

    /**
     * Group by Usuario.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsuarioGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UsuarioGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UsuarioGroupByArgs['orderBy'] }
        : { orderBy?: UsuarioGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UsuarioGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUsuarioGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Usuario model
   */
  readonly fields: UsuarioFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Usuario.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UsuarioClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    predios_geridos<T extends Usuario$predios_geridosArgs<ExtArgs> = {}>(args?: Subset<T, Usuario$predios_geridosArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PredioPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    chamados_solicitados<T extends Usuario$chamados_solicitadosArgs<ExtArgs> = {}>(args?: Subset<T, Usuario$chamados_solicitadosArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrdemServicoPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    chamados_atribuidos<T extends Usuario$chamados_atribuidosArgs<ExtArgs> = {}>(args?: Subset<T, Usuario$chamados_atribuidosArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrdemServicoPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    auditorias<T extends Usuario$auditoriasArgs<ExtArgs> = {}>(args?: Subset<T, Usuario$auditoriasArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AuditoriaLogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Usuario model
   */
  interface UsuarioFieldRefs {
    readonly id: FieldRef<"Usuario", 'String'>
    readonly nome: FieldRef<"Usuario", 'String'>
    readonly email: FieldRef<"Usuario", 'String'>
    readonly senha_hash: FieldRef<"Usuario", 'String'>
    readonly role: FieldRef<"Usuario", 'Role'>
    readonly telefone: FieldRef<"Usuario", 'String'>
    readonly token_version: FieldRef<"Usuario", 'Int'>
    readonly criado_em: FieldRef<"Usuario", 'DateTime'>
    readonly atualizado: FieldRef<"Usuario", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Usuario findUnique
   */
  export type UsuarioFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Usuario
     */
    select?: UsuarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Usuario
     */
    omit?: UsuarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsuarioInclude<ExtArgs> | null
    /**
     * Filter, which Usuario to fetch.
     */
    where: UsuarioWhereUniqueInput
  }

  /**
   * Usuario findUniqueOrThrow
   */
  export type UsuarioFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Usuario
     */
    select?: UsuarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Usuario
     */
    omit?: UsuarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsuarioInclude<ExtArgs> | null
    /**
     * Filter, which Usuario to fetch.
     */
    where: UsuarioWhereUniqueInput
  }

  /**
   * Usuario findFirst
   */
  export type UsuarioFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Usuario
     */
    select?: UsuarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Usuario
     */
    omit?: UsuarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsuarioInclude<ExtArgs> | null
    /**
     * Filter, which Usuario to fetch.
     */
    where?: UsuarioWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Usuarios to fetch.
     */
    orderBy?: UsuarioOrderByWithRelationInput | UsuarioOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Usuarios.
     */
    cursor?: UsuarioWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Usuarios from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Usuarios.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Usuarios.
     */
    distinct?: UsuarioScalarFieldEnum | UsuarioScalarFieldEnum[]
  }

  /**
   * Usuario findFirstOrThrow
   */
  export type UsuarioFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Usuario
     */
    select?: UsuarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Usuario
     */
    omit?: UsuarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsuarioInclude<ExtArgs> | null
    /**
     * Filter, which Usuario to fetch.
     */
    where?: UsuarioWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Usuarios to fetch.
     */
    orderBy?: UsuarioOrderByWithRelationInput | UsuarioOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Usuarios.
     */
    cursor?: UsuarioWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Usuarios from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Usuarios.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Usuarios.
     */
    distinct?: UsuarioScalarFieldEnum | UsuarioScalarFieldEnum[]
  }

  /**
   * Usuario findMany
   */
  export type UsuarioFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Usuario
     */
    select?: UsuarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Usuario
     */
    omit?: UsuarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsuarioInclude<ExtArgs> | null
    /**
     * Filter, which Usuarios to fetch.
     */
    where?: UsuarioWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Usuarios to fetch.
     */
    orderBy?: UsuarioOrderByWithRelationInput | UsuarioOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Usuarios.
     */
    cursor?: UsuarioWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Usuarios from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Usuarios.
     */
    skip?: number
    distinct?: UsuarioScalarFieldEnum | UsuarioScalarFieldEnum[]
  }

  /**
   * Usuario create
   */
  export type UsuarioCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Usuario
     */
    select?: UsuarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Usuario
     */
    omit?: UsuarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsuarioInclude<ExtArgs> | null
    /**
     * The data needed to create a Usuario.
     */
    data: XOR<UsuarioCreateInput, UsuarioUncheckedCreateInput>
  }

  /**
   * Usuario createMany
   */
  export type UsuarioCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Usuarios.
     */
    data: UsuarioCreateManyInput | UsuarioCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Usuario createManyAndReturn
   */
  export type UsuarioCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Usuario
     */
    select?: UsuarioSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Usuario
     */
    omit?: UsuarioOmit<ExtArgs> | null
    /**
     * The data used to create many Usuarios.
     */
    data: UsuarioCreateManyInput | UsuarioCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Usuario update
   */
  export type UsuarioUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Usuario
     */
    select?: UsuarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Usuario
     */
    omit?: UsuarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsuarioInclude<ExtArgs> | null
    /**
     * The data needed to update a Usuario.
     */
    data: XOR<UsuarioUpdateInput, UsuarioUncheckedUpdateInput>
    /**
     * Choose, which Usuario to update.
     */
    where: UsuarioWhereUniqueInput
  }

  /**
   * Usuario updateMany
   */
  export type UsuarioUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Usuarios.
     */
    data: XOR<UsuarioUpdateManyMutationInput, UsuarioUncheckedUpdateManyInput>
    /**
     * Filter which Usuarios to update
     */
    where?: UsuarioWhereInput
    /**
     * Limit how many Usuarios to update.
     */
    limit?: number
  }

  /**
   * Usuario updateManyAndReturn
   */
  export type UsuarioUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Usuario
     */
    select?: UsuarioSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Usuario
     */
    omit?: UsuarioOmit<ExtArgs> | null
    /**
     * The data used to update Usuarios.
     */
    data: XOR<UsuarioUpdateManyMutationInput, UsuarioUncheckedUpdateManyInput>
    /**
     * Filter which Usuarios to update
     */
    where?: UsuarioWhereInput
    /**
     * Limit how many Usuarios to update.
     */
    limit?: number
  }

  /**
   * Usuario upsert
   */
  export type UsuarioUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Usuario
     */
    select?: UsuarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Usuario
     */
    omit?: UsuarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsuarioInclude<ExtArgs> | null
    /**
     * The filter to search for the Usuario to update in case it exists.
     */
    where: UsuarioWhereUniqueInput
    /**
     * In case the Usuario found by the `where` argument doesn't exist, create a new Usuario with this data.
     */
    create: XOR<UsuarioCreateInput, UsuarioUncheckedCreateInput>
    /**
     * In case the Usuario was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UsuarioUpdateInput, UsuarioUncheckedUpdateInput>
  }

  /**
   * Usuario delete
   */
  export type UsuarioDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Usuario
     */
    select?: UsuarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Usuario
     */
    omit?: UsuarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsuarioInclude<ExtArgs> | null
    /**
     * Filter which Usuario to delete.
     */
    where: UsuarioWhereUniqueInput
  }

  /**
   * Usuario deleteMany
   */
  export type UsuarioDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Usuarios to delete
     */
    where?: UsuarioWhereInput
    /**
     * Limit how many Usuarios to delete.
     */
    limit?: number
  }

  /**
   * Usuario.predios_geridos
   */
  export type Usuario$predios_geridosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Predio
     */
    select?: PredioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Predio
     */
    omit?: PredioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PredioInclude<ExtArgs> | null
    where?: PredioWhereInput
    orderBy?: PredioOrderByWithRelationInput | PredioOrderByWithRelationInput[]
    cursor?: PredioWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PredioScalarFieldEnum | PredioScalarFieldEnum[]
  }

  /**
   * Usuario.chamados_solicitados
   */
  export type Usuario$chamados_solicitadosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrdemServico
     */
    select?: OrdemServicoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrdemServico
     */
    omit?: OrdemServicoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrdemServicoInclude<ExtArgs> | null
    where?: OrdemServicoWhereInput
    orderBy?: OrdemServicoOrderByWithRelationInput | OrdemServicoOrderByWithRelationInput[]
    cursor?: OrdemServicoWhereUniqueInput
    take?: number
    skip?: number
    distinct?: OrdemServicoScalarFieldEnum | OrdemServicoScalarFieldEnum[]
  }

  /**
   * Usuario.chamados_atribuidos
   */
  export type Usuario$chamados_atribuidosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrdemServico
     */
    select?: OrdemServicoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrdemServico
     */
    omit?: OrdemServicoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrdemServicoInclude<ExtArgs> | null
    where?: OrdemServicoWhereInput
    orderBy?: OrdemServicoOrderByWithRelationInput | OrdemServicoOrderByWithRelationInput[]
    cursor?: OrdemServicoWhereUniqueInput
    take?: number
    skip?: number
    distinct?: OrdemServicoScalarFieldEnum | OrdemServicoScalarFieldEnum[]
  }

  /**
   * Usuario.auditorias
   */
  export type Usuario$auditoriasArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditoriaLog
     */
    select?: AuditoriaLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditoriaLog
     */
    omit?: AuditoriaLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditoriaLogInclude<ExtArgs> | null
    where?: AuditoriaLogWhereInput
    orderBy?: AuditoriaLogOrderByWithRelationInput | AuditoriaLogOrderByWithRelationInput[]
    cursor?: AuditoriaLogWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AuditoriaLogScalarFieldEnum | AuditoriaLogScalarFieldEnum[]
  }

  /**
   * Usuario without action
   */
  export type UsuarioDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Usuario
     */
    select?: UsuarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Usuario
     */
    omit?: UsuarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsuarioInclude<ExtArgs> | null
  }


  /**
   * Model Predio
   */

  export type AggregatePredio = {
    _count: PredioCountAggregateOutputType | null
    _min: PredioMinAggregateOutputType | null
    _max: PredioMaxAggregateOutputType | null
  }

  export type PredioMinAggregateOutputType = {
    id: string | null
    nome: string | null
    tipo: $Enums.TipoPredio | null
    endereco: string | null
    gestor_id: string | null
    criado_em: Date | null
    atualizado: Date | null
  }

  export type PredioMaxAggregateOutputType = {
    id: string | null
    nome: string | null
    tipo: $Enums.TipoPredio | null
    endereco: string | null
    gestor_id: string | null
    criado_em: Date | null
    atualizado: Date | null
  }

  export type PredioCountAggregateOutputType = {
    id: number
    nome: number
    tipo: number
    endereco: number
    gestor_id: number
    criado_em: number
    atualizado: number
    _all: number
  }


  export type PredioMinAggregateInputType = {
    id?: true
    nome?: true
    tipo?: true
    endereco?: true
    gestor_id?: true
    criado_em?: true
    atualizado?: true
  }

  export type PredioMaxAggregateInputType = {
    id?: true
    nome?: true
    tipo?: true
    endereco?: true
    gestor_id?: true
    criado_em?: true
    atualizado?: true
  }

  export type PredioCountAggregateInputType = {
    id?: true
    nome?: true
    tipo?: true
    endereco?: true
    gestor_id?: true
    criado_em?: true
    atualizado?: true
    _all?: true
  }

  export type PredioAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Predio to aggregate.
     */
    where?: PredioWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Predios to fetch.
     */
    orderBy?: PredioOrderByWithRelationInput | PredioOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PredioWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Predios from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Predios.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Predios
    **/
    _count?: true | PredioCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PredioMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PredioMaxAggregateInputType
  }

  export type GetPredioAggregateType<T extends PredioAggregateArgs> = {
        [P in keyof T & keyof AggregatePredio]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePredio[P]>
      : GetScalarType<T[P], AggregatePredio[P]>
  }




  export type PredioGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PredioWhereInput
    orderBy?: PredioOrderByWithAggregationInput | PredioOrderByWithAggregationInput[]
    by: PredioScalarFieldEnum[] | PredioScalarFieldEnum
    having?: PredioScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PredioCountAggregateInputType | true
    _min?: PredioMinAggregateInputType
    _max?: PredioMaxAggregateInputType
  }

  export type PredioGroupByOutputType = {
    id: string
    nome: string
    tipo: $Enums.TipoPredio
    endereco: string
    gestor_id: string | null
    criado_em: Date
    atualizado: Date
    _count: PredioCountAggregateOutputType | null
    _min: PredioMinAggregateOutputType | null
    _max: PredioMaxAggregateOutputType | null
  }

  type GetPredioGroupByPayload<T extends PredioGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PredioGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PredioGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PredioGroupByOutputType[P]>
            : GetScalarType<T[P], PredioGroupByOutputType[P]>
        }
      >
    >


  export type PredioSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    nome?: boolean
    tipo?: boolean
    endereco?: boolean
    gestor_id?: boolean
    criado_em?: boolean
    atualizado?: boolean
    gestor?: boolean | Predio$gestorArgs<ExtArgs>
    ordens_servico?: boolean | Predio$ordens_servicoArgs<ExtArgs>
    _count?: boolean | PredioCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["predio"]>

  export type PredioSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    nome?: boolean
    tipo?: boolean
    endereco?: boolean
    gestor_id?: boolean
    criado_em?: boolean
    atualizado?: boolean
    gestor?: boolean | Predio$gestorArgs<ExtArgs>
  }, ExtArgs["result"]["predio"]>

  export type PredioSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    nome?: boolean
    tipo?: boolean
    endereco?: boolean
    gestor_id?: boolean
    criado_em?: boolean
    atualizado?: boolean
    gestor?: boolean | Predio$gestorArgs<ExtArgs>
  }, ExtArgs["result"]["predio"]>

  export type PredioSelectScalar = {
    id?: boolean
    nome?: boolean
    tipo?: boolean
    endereco?: boolean
    gestor_id?: boolean
    criado_em?: boolean
    atualizado?: boolean
  }

  export type PredioOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "nome" | "tipo" | "endereco" | "gestor_id" | "criado_em" | "atualizado", ExtArgs["result"]["predio"]>
  export type PredioInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    gestor?: boolean | Predio$gestorArgs<ExtArgs>
    ordens_servico?: boolean | Predio$ordens_servicoArgs<ExtArgs>
    _count?: boolean | PredioCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type PredioIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    gestor?: boolean | Predio$gestorArgs<ExtArgs>
  }
  export type PredioIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    gestor?: boolean | Predio$gestorArgs<ExtArgs>
  }

  export type $PredioPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Predio"
    objects: {
      gestor: Prisma.$UsuarioPayload<ExtArgs> | null
      ordens_servico: Prisma.$OrdemServicoPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      nome: string
      tipo: $Enums.TipoPredio
      endereco: string
      gestor_id: string | null
      criado_em: Date
      atualizado: Date
    }, ExtArgs["result"]["predio"]>
    composites: {}
  }

  type PredioGetPayload<S extends boolean | null | undefined | PredioDefaultArgs> = $Result.GetResult<Prisma.$PredioPayload, S>

  type PredioCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<PredioFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: PredioCountAggregateInputType | true
    }

  export interface PredioDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Predio'], meta: { name: 'Predio' } }
    /**
     * Find zero or one Predio that matches the filter.
     * @param {PredioFindUniqueArgs} args - Arguments to find a Predio
     * @example
     * // Get one Predio
     * const predio = await prisma.predio.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PredioFindUniqueArgs>(args: SelectSubset<T, PredioFindUniqueArgs<ExtArgs>>): Prisma__PredioClient<$Result.GetResult<Prisma.$PredioPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Predio that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PredioFindUniqueOrThrowArgs} args - Arguments to find a Predio
     * @example
     * // Get one Predio
     * const predio = await prisma.predio.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PredioFindUniqueOrThrowArgs>(args: SelectSubset<T, PredioFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PredioClient<$Result.GetResult<Prisma.$PredioPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Predio that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PredioFindFirstArgs} args - Arguments to find a Predio
     * @example
     * // Get one Predio
     * const predio = await prisma.predio.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PredioFindFirstArgs>(args?: SelectSubset<T, PredioFindFirstArgs<ExtArgs>>): Prisma__PredioClient<$Result.GetResult<Prisma.$PredioPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Predio that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PredioFindFirstOrThrowArgs} args - Arguments to find a Predio
     * @example
     * // Get one Predio
     * const predio = await prisma.predio.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PredioFindFirstOrThrowArgs>(args?: SelectSubset<T, PredioFindFirstOrThrowArgs<ExtArgs>>): Prisma__PredioClient<$Result.GetResult<Prisma.$PredioPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Predios that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PredioFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Predios
     * const predios = await prisma.predio.findMany()
     * 
     * // Get first 10 Predios
     * const predios = await prisma.predio.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const predioWithIdOnly = await prisma.predio.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PredioFindManyArgs>(args?: SelectSubset<T, PredioFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PredioPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Predio.
     * @param {PredioCreateArgs} args - Arguments to create a Predio.
     * @example
     * // Create one Predio
     * const Predio = await prisma.predio.create({
     *   data: {
     *     // ... data to create a Predio
     *   }
     * })
     * 
     */
    create<T extends PredioCreateArgs>(args: SelectSubset<T, PredioCreateArgs<ExtArgs>>): Prisma__PredioClient<$Result.GetResult<Prisma.$PredioPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Predios.
     * @param {PredioCreateManyArgs} args - Arguments to create many Predios.
     * @example
     * // Create many Predios
     * const predio = await prisma.predio.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PredioCreateManyArgs>(args?: SelectSubset<T, PredioCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Predios and returns the data saved in the database.
     * @param {PredioCreateManyAndReturnArgs} args - Arguments to create many Predios.
     * @example
     * // Create many Predios
     * const predio = await prisma.predio.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Predios and only return the `id`
     * const predioWithIdOnly = await prisma.predio.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PredioCreateManyAndReturnArgs>(args?: SelectSubset<T, PredioCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PredioPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Predio.
     * @param {PredioDeleteArgs} args - Arguments to delete one Predio.
     * @example
     * // Delete one Predio
     * const Predio = await prisma.predio.delete({
     *   where: {
     *     // ... filter to delete one Predio
     *   }
     * })
     * 
     */
    delete<T extends PredioDeleteArgs>(args: SelectSubset<T, PredioDeleteArgs<ExtArgs>>): Prisma__PredioClient<$Result.GetResult<Prisma.$PredioPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Predio.
     * @param {PredioUpdateArgs} args - Arguments to update one Predio.
     * @example
     * // Update one Predio
     * const predio = await prisma.predio.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PredioUpdateArgs>(args: SelectSubset<T, PredioUpdateArgs<ExtArgs>>): Prisma__PredioClient<$Result.GetResult<Prisma.$PredioPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Predios.
     * @param {PredioDeleteManyArgs} args - Arguments to filter Predios to delete.
     * @example
     * // Delete a few Predios
     * const { count } = await prisma.predio.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PredioDeleteManyArgs>(args?: SelectSubset<T, PredioDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Predios.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PredioUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Predios
     * const predio = await prisma.predio.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PredioUpdateManyArgs>(args: SelectSubset<T, PredioUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Predios and returns the data updated in the database.
     * @param {PredioUpdateManyAndReturnArgs} args - Arguments to update many Predios.
     * @example
     * // Update many Predios
     * const predio = await prisma.predio.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Predios and only return the `id`
     * const predioWithIdOnly = await prisma.predio.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends PredioUpdateManyAndReturnArgs>(args: SelectSubset<T, PredioUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PredioPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Predio.
     * @param {PredioUpsertArgs} args - Arguments to update or create a Predio.
     * @example
     * // Update or create a Predio
     * const predio = await prisma.predio.upsert({
     *   create: {
     *     // ... data to create a Predio
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Predio we want to update
     *   }
     * })
     */
    upsert<T extends PredioUpsertArgs>(args: SelectSubset<T, PredioUpsertArgs<ExtArgs>>): Prisma__PredioClient<$Result.GetResult<Prisma.$PredioPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Predios.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PredioCountArgs} args - Arguments to filter Predios to count.
     * @example
     * // Count the number of Predios
     * const count = await prisma.predio.count({
     *   where: {
     *     // ... the filter for the Predios we want to count
     *   }
     * })
    **/
    count<T extends PredioCountArgs>(
      args?: Subset<T, PredioCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PredioCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Predio.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PredioAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PredioAggregateArgs>(args: Subset<T, PredioAggregateArgs>): Prisma.PrismaPromise<GetPredioAggregateType<T>>

    /**
     * Group by Predio.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PredioGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PredioGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PredioGroupByArgs['orderBy'] }
        : { orderBy?: PredioGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PredioGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPredioGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Predio model
   */
  readonly fields: PredioFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Predio.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PredioClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    gestor<T extends Predio$gestorArgs<ExtArgs> = {}>(args?: Subset<T, Predio$gestorArgs<ExtArgs>>): Prisma__UsuarioClient<$Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    ordens_servico<T extends Predio$ordens_servicoArgs<ExtArgs> = {}>(args?: Subset<T, Predio$ordens_servicoArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrdemServicoPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Predio model
   */
  interface PredioFieldRefs {
    readonly id: FieldRef<"Predio", 'String'>
    readonly nome: FieldRef<"Predio", 'String'>
    readonly tipo: FieldRef<"Predio", 'TipoPredio'>
    readonly endereco: FieldRef<"Predio", 'String'>
    readonly gestor_id: FieldRef<"Predio", 'String'>
    readonly criado_em: FieldRef<"Predio", 'DateTime'>
    readonly atualizado: FieldRef<"Predio", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Predio findUnique
   */
  export type PredioFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Predio
     */
    select?: PredioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Predio
     */
    omit?: PredioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PredioInclude<ExtArgs> | null
    /**
     * Filter, which Predio to fetch.
     */
    where: PredioWhereUniqueInput
  }

  /**
   * Predio findUniqueOrThrow
   */
  export type PredioFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Predio
     */
    select?: PredioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Predio
     */
    omit?: PredioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PredioInclude<ExtArgs> | null
    /**
     * Filter, which Predio to fetch.
     */
    where: PredioWhereUniqueInput
  }

  /**
   * Predio findFirst
   */
  export type PredioFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Predio
     */
    select?: PredioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Predio
     */
    omit?: PredioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PredioInclude<ExtArgs> | null
    /**
     * Filter, which Predio to fetch.
     */
    where?: PredioWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Predios to fetch.
     */
    orderBy?: PredioOrderByWithRelationInput | PredioOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Predios.
     */
    cursor?: PredioWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Predios from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Predios.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Predios.
     */
    distinct?: PredioScalarFieldEnum | PredioScalarFieldEnum[]
  }

  /**
   * Predio findFirstOrThrow
   */
  export type PredioFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Predio
     */
    select?: PredioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Predio
     */
    omit?: PredioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PredioInclude<ExtArgs> | null
    /**
     * Filter, which Predio to fetch.
     */
    where?: PredioWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Predios to fetch.
     */
    orderBy?: PredioOrderByWithRelationInput | PredioOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Predios.
     */
    cursor?: PredioWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Predios from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Predios.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Predios.
     */
    distinct?: PredioScalarFieldEnum | PredioScalarFieldEnum[]
  }

  /**
   * Predio findMany
   */
  export type PredioFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Predio
     */
    select?: PredioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Predio
     */
    omit?: PredioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PredioInclude<ExtArgs> | null
    /**
     * Filter, which Predios to fetch.
     */
    where?: PredioWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Predios to fetch.
     */
    orderBy?: PredioOrderByWithRelationInput | PredioOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Predios.
     */
    cursor?: PredioWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Predios from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Predios.
     */
    skip?: number
    distinct?: PredioScalarFieldEnum | PredioScalarFieldEnum[]
  }

  /**
   * Predio create
   */
  export type PredioCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Predio
     */
    select?: PredioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Predio
     */
    omit?: PredioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PredioInclude<ExtArgs> | null
    /**
     * The data needed to create a Predio.
     */
    data: XOR<PredioCreateInput, PredioUncheckedCreateInput>
  }

  /**
   * Predio createMany
   */
  export type PredioCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Predios.
     */
    data: PredioCreateManyInput | PredioCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Predio createManyAndReturn
   */
  export type PredioCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Predio
     */
    select?: PredioSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Predio
     */
    omit?: PredioOmit<ExtArgs> | null
    /**
     * The data used to create many Predios.
     */
    data: PredioCreateManyInput | PredioCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PredioIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Predio update
   */
  export type PredioUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Predio
     */
    select?: PredioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Predio
     */
    omit?: PredioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PredioInclude<ExtArgs> | null
    /**
     * The data needed to update a Predio.
     */
    data: XOR<PredioUpdateInput, PredioUncheckedUpdateInput>
    /**
     * Choose, which Predio to update.
     */
    where: PredioWhereUniqueInput
  }

  /**
   * Predio updateMany
   */
  export type PredioUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Predios.
     */
    data: XOR<PredioUpdateManyMutationInput, PredioUncheckedUpdateManyInput>
    /**
     * Filter which Predios to update
     */
    where?: PredioWhereInput
    /**
     * Limit how many Predios to update.
     */
    limit?: number
  }

  /**
   * Predio updateManyAndReturn
   */
  export type PredioUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Predio
     */
    select?: PredioSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Predio
     */
    omit?: PredioOmit<ExtArgs> | null
    /**
     * The data used to update Predios.
     */
    data: XOR<PredioUpdateManyMutationInput, PredioUncheckedUpdateManyInput>
    /**
     * Filter which Predios to update
     */
    where?: PredioWhereInput
    /**
     * Limit how many Predios to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PredioIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Predio upsert
   */
  export type PredioUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Predio
     */
    select?: PredioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Predio
     */
    omit?: PredioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PredioInclude<ExtArgs> | null
    /**
     * The filter to search for the Predio to update in case it exists.
     */
    where: PredioWhereUniqueInput
    /**
     * In case the Predio found by the `where` argument doesn't exist, create a new Predio with this data.
     */
    create: XOR<PredioCreateInput, PredioUncheckedCreateInput>
    /**
     * In case the Predio was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PredioUpdateInput, PredioUncheckedUpdateInput>
  }

  /**
   * Predio delete
   */
  export type PredioDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Predio
     */
    select?: PredioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Predio
     */
    omit?: PredioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PredioInclude<ExtArgs> | null
    /**
     * Filter which Predio to delete.
     */
    where: PredioWhereUniqueInput
  }

  /**
   * Predio deleteMany
   */
  export type PredioDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Predios to delete
     */
    where?: PredioWhereInput
    /**
     * Limit how many Predios to delete.
     */
    limit?: number
  }

  /**
   * Predio.gestor
   */
  export type Predio$gestorArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Usuario
     */
    select?: UsuarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Usuario
     */
    omit?: UsuarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsuarioInclude<ExtArgs> | null
    where?: UsuarioWhereInput
  }

  /**
   * Predio.ordens_servico
   */
  export type Predio$ordens_servicoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrdemServico
     */
    select?: OrdemServicoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrdemServico
     */
    omit?: OrdemServicoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrdemServicoInclude<ExtArgs> | null
    where?: OrdemServicoWhereInput
    orderBy?: OrdemServicoOrderByWithRelationInput | OrdemServicoOrderByWithRelationInput[]
    cursor?: OrdemServicoWhereUniqueInput
    take?: number
    skip?: number
    distinct?: OrdemServicoScalarFieldEnum | OrdemServicoScalarFieldEnum[]
  }

  /**
   * Predio without action
   */
  export type PredioDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Predio
     */
    select?: PredioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Predio
     */
    omit?: PredioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PredioInclude<ExtArgs> | null
  }


  /**
   * Model OrdemServico
   */

  export type AggregateOrdemServico = {
    _count: OrdemServicoCountAggregateOutputType | null
    _min: OrdemServicoMinAggregateOutputType | null
    _max: OrdemServicoMaxAggregateOutputType | null
  }

  export type OrdemServicoMinAggregateOutputType = {
    id: string | null
    codigo: string | null
    titulo: string | null
    descricao: string | null
    prioridade: $Enums.Prioridade | null
    status: $Enums.StatusOS | null
    predio_id: string | null
    solicitante_id: string | null
    tecnico_atribuido_id: string | null
    motivo_pausa: string | null
    motivo_cancelamento: string | null
    data_limite_sla: Date | null
    iniciado_em: Date | null
    concluido_em: Date | null
    ordem_vinculada_id: string | null
    criado_em: Date | null
    atualizado: Date | null
  }

  export type OrdemServicoMaxAggregateOutputType = {
    id: string | null
    codigo: string | null
    titulo: string | null
    descricao: string | null
    prioridade: $Enums.Prioridade | null
    status: $Enums.StatusOS | null
    predio_id: string | null
    solicitante_id: string | null
    tecnico_atribuido_id: string | null
    motivo_pausa: string | null
    motivo_cancelamento: string | null
    data_limite_sla: Date | null
    iniciado_em: Date | null
    concluido_em: Date | null
    ordem_vinculada_id: string | null
    criado_em: Date | null
    atualizado: Date | null
  }

  export type OrdemServicoCountAggregateOutputType = {
    id: number
    codigo: number
    titulo: number
    descricao: number
    prioridade: number
    status: number
    predio_id: number
    solicitante_id: number
    tecnico_atribuido_id: number
    fotos: number
    fotos_conclusao: number
    motivo_pausa: number
    motivo_cancelamento: number
    data_limite_sla: number
    iniciado_em: number
    concluido_em: number
    ordem_vinculada_id: number
    criado_em: number
    atualizado: number
    _all: number
  }


  export type OrdemServicoMinAggregateInputType = {
    id?: true
    codigo?: true
    titulo?: true
    descricao?: true
    prioridade?: true
    status?: true
    predio_id?: true
    solicitante_id?: true
    tecnico_atribuido_id?: true
    motivo_pausa?: true
    motivo_cancelamento?: true
    data_limite_sla?: true
    iniciado_em?: true
    concluido_em?: true
    ordem_vinculada_id?: true
    criado_em?: true
    atualizado?: true
  }

  export type OrdemServicoMaxAggregateInputType = {
    id?: true
    codigo?: true
    titulo?: true
    descricao?: true
    prioridade?: true
    status?: true
    predio_id?: true
    solicitante_id?: true
    tecnico_atribuido_id?: true
    motivo_pausa?: true
    motivo_cancelamento?: true
    data_limite_sla?: true
    iniciado_em?: true
    concluido_em?: true
    ordem_vinculada_id?: true
    criado_em?: true
    atualizado?: true
  }

  export type OrdemServicoCountAggregateInputType = {
    id?: true
    codigo?: true
    titulo?: true
    descricao?: true
    prioridade?: true
    status?: true
    predio_id?: true
    solicitante_id?: true
    tecnico_atribuido_id?: true
    fotos?: true
    fotos_conclusao?: true
    motivo_pausa?: true
    motivo_cancelamento?: true
    data_limite_sla?: true
    iniciado_em?: true
    concluido_em?: true
    ordem_vinculada_id?: true
    criado_em?: true
    atualizado?: true
    _all?: true
  }

  export type OrdemServicoAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OrdemServico to aggregate.
     */
    where?: OrdemServicoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrdemServicos to fetch.
     */
    orderBy?: OrdemServicoOrderByWithRelationInput | OrdemServicoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: OrdemServicoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrdemServicos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrdemServicos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned OrdemServicos
    **/
    _count?: true | OrdemServicoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OrdemServicoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OrdemServicoMaxAggregateInputType
  }

  export type GetOrdemServicoAggregateType<T extends OrdemServicoAggregateArgs> = {
        [P in keyof T & keyof AggregateOrdemServico]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOrdemServico[P]>
      : GetScalarType<T[P], AggregateOrdemServico[P]>
  }




  export type OrdemServicoGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrdemServicoWhereInput
    orderBy?: OrdemServicoOrderByWithAggregationInput | OrdemServicoOrderByWithAggregationInput[]
    by: OrdemServicoScalarFieldEnum[] | OrdemServicoScalarFieldEnum
    having?: OrdemServicoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OrdemServicoCountAggregateInputType | true
    _min?: OrdemServicoMinAggregateInputType
    _max?: OrdemServicoMaxAggregateInputType
  }

  export type OrdemServicoGroupByOutputType = {
    id: string
    codigo: string
    titulo: string
    descricao: string
    prioridade: $Enums.Prioridade
    status: $Enums.StatusOS
    predio_id: string
    solicitante_id: string
    tecnico_atribuido_id: string | null
    fotos: string[]
    fotos_conclusao: string[]
    motivo_pausa: string | null
    motivo_cancelamento: string | null
    data_limite_sla: Date | null
    iniciado_em: Date | null
    concluido_em: Date | null
    ordem_vinculada_id: string | null
    criado_em: Date
    atualizado: Date
    _count: OrdemServicoCountAggregateOutputType | null
    _min: OrdemServicoMinAggregateOutputType | null
    _max: OrdemServicoMaxAggregateOutputType | null
  }

  type GetOrdemServicoGroupByPayload<T extends OrdemServicoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OrdemServicoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OrdemServicoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OrdemServicoGroupByOutputType[P]>
            : GetScalarType<T[P], OrdemServicoGroupByOutputType[P]>
        }
      >
    >


  export type OrdemServicoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    codigo?: boolean
    titulo?: boolean
    descricao?: boolean
    prioridade?: boolean
    status?: boolean
    predio_id?: boolean
    solicitante_id?: boolean
    tecnico_atribuido_id?: boolean
    fotos?: boolean
    fotos_conclusao?: boolean
    motivo_pausa?: boolean
    motivo_cancelamento?: boolean
    data_limite_sla?: boolean
    iniciado_em?: boolean
    concluido_em?: boolean
    ordem_vinculada_id?: boolean
    criado_em?: boolean
    atualizado?: boolean
    predio?: boolean | PredioDefaultArgs<ExtArgs>
    solicitante?: boolean | UsuarioDefaultArgs<ExtArgs>
    tecnico?: boolean | OrdemServico$tecnicoArgs<ExtArgs>
    ordem_vinculada?: boolean | OrdemServico$ordem_vinculadaArgs<ExtArgs>
    ordens_derivadas?: boolean | OrdemServico$ordens_derivadasArgs<ExtArgs>
    _count?: boolean | OrdemServicoCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["ordemServico"]>

  export type OrdemServicoSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    codigo?: boolean
    titulo?: boolean
    descricao?: boolean
    prioridade?: boolean
    status?: boolean
    predio_id?: boolean
    solicitante_id?: boolean
    tecnico_atribuido_id?: boolean
    fotos?: boolean
    fotos_conclusao?: boolean
    motivo_pausa?: boolean
    motivo_cancelamento?: boolean
    data_limite_sla?: boolean
    iniciado_em?: boolean
    concluido_em?: boolean
    ordem_vinculada_id?: boolean
    criado_em?: boolean
    atualizado?: boolean
    predio?: boolean | PredioDefaultArgs<ExtArgs>
    solicitante?: boolean | UsuarioDefaultArgs<ExtArgs>
    tecnico?: boolean | OrdemServico$tecnicoArgs<ExtArgs>
    ordem_vinculada?: boolean | OrdemServico$ordem_vinculadaArgs<ExtArgs>
  }, ExtArgs["result"]["ordemServico"]>

  export type OrdemServicoSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    codigo?: boolean
    titulo?: boolean
    descricao?: boolean
    prioridade?: boolean
    status?: boolean
    predio_id?: boolean
    solicitante_id?: boolean
    tecnico_atribuido_id?: boolean
    fotos?: boolean
    fotos_conclusao?: boolean
    motivo_pausa?: boolean
    motivo_cancelamento?: boolean
    data_limite_sla?: boolean
    iniciado_em?: boolean
    concluido_em?: boolean
    ordem_vinculada_id?: boolean
    criado_em?: boolean
    atualizado?: boolean
    predio?: boolean | PredioDefaultArgs<ExtArgs>
    solicitante?: boolean | UsuarioDefaultArgs<ExtArgs>
    tecnico?: boolean | OrdemServico$tecnicoArgs<ExtArgs>
    ordem_vinculada?: boolean | OrdemServico$ordem_vinculadaArgs<ExtArgs>
  }, ExtArgs["result"]["ordemServico"]>

  export type OrdemServicoSelectScalar = {
    id?: boolean
    codigo?: boolean
    titulo?: boolean
    descricao?: boolean
    prioridade?: boolean
    status?: boolean
    predio_id?: boolean
    solicitante_id?: boolean
    tecnico_atribuido_id?: boolean
    fotos?: boolean
    fotos_conclusao?: boolean
    motivo_pausa?: boolean
    motivo_cancelamento?: boolean
    data_limite_sla?: boolean
    iniciado_em?: boolean
    concluido_em?: boolean
    ordem_vinculada_id?: boolean
    criado_em?: boolean
    atualizado?: boolean
  }

  export type OrdemServicoOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "codigo" | "titulo" | "descricao" | "prioridade" | "status" | "predio_id" | "solicitante_id" | "tecnico_atribuido_id" | "fotos" | "fotos_conclusao" | "motivo_pausa" | "motivo_cancelamento" | "data_limite_sla" | "iniciado_em" | "concluido_em" | "ordem_vinculada_id" | "criado_em" | "atualizado", ExtArgs["result"]["ordemServico"]>
  export type OrdemServicoInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    predio?: boolean | PredioDefaultArgs<ExtArgs>
    solicitante?: boolean | UsuarioDefaultArgs<ExtArgs>
    tecnico?: boolean | OrdemServico$tecnicoArgs<ExtArgs>
    ordem_vinculada?: boolean | OrdemServico$ordem_vinculadaArgs<ExtArgs>
    ordens_derivadas?: boolean | OrdemServico$ordens_derivadasArgs<ExtArgs>
    _count?: boolean | OrdemServicoCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type OrdemServicoIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    predio?: boolean | PredioDefaultArgs<ExtArgs>
    solicitante?: boolean | UsuarioDefaultArgs<ExtArgs>
    tecnico?: boolean | OrdemServico$tecnicoArgs<ExtArgs>
    ordem_vinculada?: boolean | OrdemServico$ordem_vinculadaArgs<ExtArgs>
  }
  export type OrdemServicoIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    predio?: boolean | PredioDefaultArgs<ExtArgs>
    solicitante?: boolean | UsuarioDefaultArgs<ExtArgs>
    tecnico?: boolean | OrdemServico$tecnicoArgs<ExtArgs>
    ordem_vinculada?: boolean | OrdemServico$ordem_vinculadaArgs<ExtArgs>
  }

  export type $OrdemServicoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "OrdemServico"
    objects: {
      predio: Prisma.$PredioPayload<ExtArgs>
      solicitante: Prisma.$UsuarioPayload<ExtArgs>
      tecnico: Prisma.$UsuarioPayload<ExtArgs> | null
      ordem_vinculada: Prisma.$OrdemServicoPayload<ExtArgs> | null
      ordens_derivadas: Prisma.$OrdemServicoPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      codigo: string
      titulo: string
      descricao: string
      prioridade: $Enums.Prioridade
      status: $Enums.StatusOS
      predio_id: string
      solicitante_id: string
      tecnico_atribuido_id: string | null
      fotos: string[]
      fotos_conclusao: string[]
      motivo_pausa: string | null
      motivo_cancelamento: string | null
      data_limite_sla: Date | null
      iniciado_em: Date | null
      concluido_em: Date | null
      ordem_vinculada_id: string | null
      criado_em: Date
      atualizado: Date
    }, ExtArgs["result"]["ordemServico"]>
    composites: {}
  }

  type OrdemServicoGetPayload<S extends boolean | null | undefined | OrdemServicoDefaultArgs> = $Result.GetResult<Prisma.$OrdemServicoPayload, S>

  type OrdemServicoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<OrdemServicoFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: OrdemServicoCountAggregateInputType | true
    }

  export interface OrdemServicoDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['OrdemServico'], meta: { name: 'OrdemServico' } }
    /**
     * Find zero or one OrdemServico that matches the filter.
     * @param {OrdemServicoFindUniqueArgs} args - Arguments to find a OrdemServico
     * @example
     * // Get one OrdemServico
     * const ordemServico = await prisma.ordemServico.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends OrdemServicoFindUniqueArgs>(args: SelectSubset<T, OrdemServicoFindUniqueArgs<ExtArgs>>): Prisma__OrdemServicoClient<$Result.GetResult<Prisma.$OrdemServicoPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one OrdemServico that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {OrdemServicoFindUniqueOrThrowArgs} args - Arguments to find a OrdemServico
     * @example
     * // Get one OrdemServico
     * const ordemServico = await prisma.ordemServico.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends OrdemServicoFindUniqueOrThrowArgs>(args: SelectSubset<T, OrdemServicoFindUniqueOrThrowArgs<ExtArgs>>): Prisma__OrdemServicoClient<$Result.GetResult<Prisma.$OrdemServicoPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first OrdemServico that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrdemServicoFindFirstArgs} args - Arguments to find a OrdemServico
     * @example
     * // Get one OrdemServico
     * const ordemServico = await prisma.ordemServico.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends OrdemServicoFindFirstArgs>(args?: SelectSubset<T, OrdemServicoFindFirstArgs<ExtArgs>>): Prisma__OrdemServicoClient<$Result.GetResult<Prisma.$OrdemServicoPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first OrdemServico that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrdemServicoFindFirstOrThrowArgs} args - Arguments to find a OrdemServico
     * @example
     * // Get one OrdemServico
     * const ordemServico = await prisma.ordemServico.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends OrdemServicoFindFirstOrThrowArgs>(args?: SelectSubset<T, OrdemServicoFindFirstOrThrowArgs<ExtArgs>>): Prisma__OrdemServicoClient<$Result.GetResult<Prisma.$OrdemServicoPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more OrdemServicos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrdemServicoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all OrdemServicos
     * const ordemServicos = await prisma.ordemServico.findMany()
     * 
     * // Get first 10 OrdemServicos
     * const ordemServicos = await prisma.ordemServico.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const ordemServicoWithIdOnly = await prisma.ordemServico.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends OrdemServicoFindManyArgs>(args?: SelectSubset<T, OrdemServicoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrdemServicoPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a OrdemServico.
     * @param {OrdemServicoCreateArgs} args - Arguments to create a OrdemServico.
     * @example
     * // Create one OrdemServico
     * const OrdemServico = await prisma.ordemServico.create({
     *   data: {
     *     // ... data to create a OrdemServico
     *   }
     * })
     * 
     */
    create<T extends OrdemServicoCreateArgs>(args: SelectSubset<T, OrdemServicoCreateArgs<ExtArgs>>): Prisma__OrdemServicoClient<$Result.GetResult<Prisma.$OrdemServicoPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many OrdemServicos.
     * @param {OrdemServicoCreateManyArgs} args - Arguments to create many OrdemServicos.
     * @example
     * // Create many OrdemServicos
     * const ordemServico = await prisma.ordemServico.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends OrdemServicoCreateManyArgs>(args?: SelectSubset<T, OrdemServicoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many OrdemServicos and returns the data saved in the database.
     * @param {OrdemServicoCreateManyAndReturnArgs} args - Arguments to create many OrdemServicos.
     * @example
     * // Create many OrdemServicos
     * const ordemServico = await prisma.ordemServico.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many OrdemServicos and only return the `id`
     * const ordemServicoWithIdOnly = await prisma.ordemServico.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends OrdemServicoCreateManyAndReturnArgs>(args?: SelectSubset<T, OrdemServicoCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrdemServicoPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a OrdemServico.
     * @param {OrdemServicoDeleteArgs} args - Arguments to delete one OrdemServico.
     * @example
     * // Delete one OrdemServico
     * const OrdemServico = await prisma.ordemServico.delete({
     *   where: {
     *     // ... filter to delete one OrdemServico
     *   }
     * })
     * 
     */
    delete<T extends OrdemServicoDeleteArgs>(args: SelectSubset<T, OrdemServicoDeleteArgs<ExtArgs>>): Prisma__OrdemServicoClient<$Result.GetResult<Prisma.$OrdemServicoPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one OrdemServico.
     * @param {OrdemServicoUpdateArgs} args - Arguments to update one OrdemServico.
     * @example
     * // Update one OrdemServico
     * const ordemServico = await prisma.ordemServico.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends OrdemServicoUpdateArgs>(args: SelectSubset<T, OrdemServicoUpdateArgs<ExtArgs>>): Prisma__OrdemServicoClient<$Result.GetResult<Prisma.$OrdemServicoPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more OrdemServicos.
     * @param {OrdemServicoDeleteManyArgs} args - Arguments to filter OrdemServicos to delete.
     * @example
     * // Delete a few OrdemServicos
     * const { count } = await prisma.ordemServico.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends OrdemServicoDeleteManyArgs>(args?: SelectSubset<T, OrdemServicoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more OrdemServicos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrdemServicoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many OrdemServicos
     * const ordemServico = await prisma.ordemServico.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends OrdemServicoUpdateManyArgs>(args: SelectSubset<T, OrdemServicoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more OrdemServicos and returns the data updated in the database.
     * @param {OrdemServicoUpdateManyAndReturnArgs} args - Arguments to update many OrdemServicos.
     * @example
     * // Update many OrdemServicos
     * const ordemServico = await prisma.ordemServico.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more OrdemServicos and only return the `id`
     * const ordemServicoWithIdOnly = await prisma.ordemServico.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends OrdemServicoUpdateManyAndReturnArgs>(args: SelectSubset<T, OrdemServicoUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrdemServicoPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one OrdemServico.
     * @param {OrdemServicoUpsertArgs} args - Arguments to update or create a OrdemServico.
     * @example
     * // Update or create a OrdemServico
     * const ordemServico = await prisma.ordemServico.upsert({
     *   create: {
     *     // ... data to create a OrdemServico
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the OrdemServico we want to update
     *   }
     * })
     */
    upsert<T extends OrdemServicoUpsertArgs>(args: SelectSubset<T, OrdemServicoUpsertArgs<ExtArgs>>): Prisma__OrdemServicoClient<$Result.GetResult<Prisma.$OrdemServicoPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of OrdemServicos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrdemServicoCountArgs} args - Arguments to filter OrdemServicos to count.
     * @example
     * // Count the number of OrdemServicos
     * const count = await prisma.ordemServico.count({
     *   where: {
     *     // ... the filter for the OrdemServicos we want to count
     *   }
     * })
    **/
    count<T extends OrdemServicoCountArgs>(
      args?: Subset<T, OrdemServicoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OrdemServicoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a OrdemServico.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrdemServicoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends OrdemServicoAggregateArgs>(args: Subset<T, OrdemServicoAggregateArgs>): Prisma.PrismaPromise<GetOrdemServicoAggregateType<T>>

    /**
     * Group by OrdemServico.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrdemServicoGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends OrdemServicoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: OrdemServicoGroupByArgs['orderBy'] }
        : { orderBy?: OrdemServicoGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, OrdemServicoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOrdemServicoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the OrdemServico model
   */
  readonly fields: OrdemServicoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for OrdemServico.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__OrdemServicoClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    predio<T extends PredioDefaultArgs<ExtArgs> = {}>(args?: Subset<T, PredioDefaultArgs<ExtArgs>>): Prisma__PredioClient<$Result.GetResult<Prisma.$PredioPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    solicitante<T extends UsuarioDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UsuarioDefaultArgs<ExtArgs>>): Prisma__UsuarioClient<$Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    tecnico<T extends OrdemServico$tecnicoArgs<ExtArgs> = {}>(args?: Subset<T, OrdemServico$tecnicoArgs<ExtArgs>>): Prisma__UsuarioClient<$Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    ordem_vinculada<T extends OrdemServico$ordem_vinculadaArgs<ExtArgs> = {}>(args?: Subset<T, OrdemServico$ordem_vinculadaArgs<ExtArgs>>): Prisma__OrdemServicoClient<$Result.GetResult<Prisma.$OrdemServicoPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    ordens_derivadas<T extends OrdemServico$ordens_derivadasArgs<ExtArgs> = {}>(args?: Subset<T, OrdemServico$ordens_derivadasArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrdemServicoPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the OrdemServico model
   */
  interface OrdemServicoFieldRefs {
    readonly id: FieldRef<"OrdemServico", 'String'>
    readonly codigo: FieldRef<"OrdemServico", 'String'>
    readonly titulo: FieldRef<"OrdemServico", 'String'>
    readonly descricao: FieldRef<"OrdemServico", 'String'>
    readonly prioridade: FieldRef<"OrdemServico", 'Prioridade'>
    readonly status: FieldRef<"OrdemServico", 'StatusOS'>
    readonly predio_id: FieldRef<"OrdemServico", 'String'>
    readonly solicitante_id: FieldRef<"OrdemServico", 'String'>
    readonly tecnico_atribuido_id: FieldRef<"OrdemServico", 'String'>
    readonly fotos: FieldRef<"OrdemServico", 'String[]'>
    readonly fotos_conclusao: FieldRef<"OrdemServico", 'String[]'>
    readonly motivo_pausa: FieldRef<"OrdemServico", 'String'>
    readonly motivo_cancelamento: FieldRef<"OrdemServico", 'String'>
    readonly data_limite_sla: FieldRef<"OrdemServico", 'DateTime'>
    readonly iniciado_em: FieldRef<"OrdemServico", 'DateTime'>
    readonly concluido_em: FieldRef<"OrdemServico", 'DateTime'>
    readonly ordem_vinculada_id: FieldRef<"OrdemServico", 'String'>
    readonly criado_em: FieldRef<"OrdemServico", 'DateTime'>
    readonly atualizado: FieldRef<"OrdemServico", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * OrdemServico findUnique
   */
  export type OrdemServicoFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrdemServico
     */
    select?: OrdemServicoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrdemServico
     */
    omit?: OrdemServicoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrdemServicoInclude<ExtArgs> | null
    /**
     * Filter, which OrdemServico to fetch.
     */
    where: OrdemServicoWhereUniqueInput
  }

  /**
   * OrdemServico findUniqueOrThrow
   */
  export type OrdemServicoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrdemServico
     */
    select?: OrdemServicoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrdemServico
     */
    omit?: OrdemServicoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrdemServicoInclude<ExtArgs> | null
    /**
     * Filter, which OrdemServico to fetch.
     */
    where: OrdemServicoWhereUniqueInput
  }

  /**
   * OrdemServico findFirst
   */
  export type OrdemServicoFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrdemServico
     */
    select?: OrdemServicoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrdemServico
     */
    omit?: OrdemServicoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrdemServicoInclude<ExtArgs> | null
    /**
     * Filter, which OrdemServico to fetch.
     */
    where?: OrdemServicoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrdemServicos to fetch.
     */
    orderBy?: OrdemServicoOrderByWithRelationInput | OrdemServicoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OrdemServicos.
     */
    cursor?: OrdemServicoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrdemServicos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrdemServicos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OrdemServicos.
     */
    distinct?: OrdemServicoScalarFieldEnum | OrdemServicoScalarFieldEnum[]
  }

  /**
   * OrdemServico findFirstOrThrow
   */
  export type OrdemServicoFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrdemServico
     */
    select?: OrdemServicoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrdemServico
     */
    omit?: OrdemServicoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrdemServicoInclude<ExtArgs> | null
    /**
     * Filter, which OrdemServico to fetch.
     */
    where?: OrdemServicoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrdemServicos to fetch.
     */
    orderBy?: OrdemServicoOrderByWithRelationInput | OrdemServicoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OrdemServicos.
     */
    cursor?: OrdemServicoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrdemServicos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrdemServicos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OrdemServicos.
     */
    distinct?: OrdemServicoScalarFieldEnum | OrdemServicoScalarFieldEnum[]
  }

  /**
   * OrdemServico findMany
   */
  export type OrdemServicoFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrdemServico
     */
    select?: OrdemServicoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrdemServico
     */
    omit?: OrdemServicoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrdemServicoInclude<ExtArgs> | null
    /**
     * Filter, which OrdemServicos to fetch.
     */
    where?: OrdemServicoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrdemServicos to fetch.
     */
    orderBy?: OrdemServicoOrderByWithRelationInput | OrdemServicoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing OrdemServicos.
     */
    cursor?: OrdemServicoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrdemServicos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrdemServicos.
     */
    skip?: number
    distinct?: OrdemServicoScalarFieldEnum | OrdemServicoScalarFieldEnum[]
  }

  /**
   * OrdemServico create
   */
  export type OrdemServicoCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrdemServico
     */
    select?: OrdemServicoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrdemServico
     */
    omit?: OrdemServicoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrdemServicoInclude<ExtArgs> | null
    /**
     * The data needed to create a OrdemServico.
     */
    data: XOR<OrdemServicoCreateInput, OrdemServicoUncheckedCreateInput>
  }

  /**
   * OrdemServico createMany
   */
  export type OrdemServicoCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many OrdemServicos.
     */
    data: OrdemServicoCreateManyInput | OrdemServicoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * OrdemServico createManyAndReturn
   */
  export type OrdemServicoCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrdemServico
     */
    select?: OrdemServicoSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the OrdemServico
     */
    omit?: OrdemServicoOmit<ExtArgs> | null
    /**
     * The data used to create many OrdemServicos.
     */
    data: OrdemServicoCreateManyInput | OrdemServicoCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrdemServicoIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * OrdemServico update
   */
  export type OrdemServicoUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrdemServico
     */
    select?: OrdemServicoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrdemServico
     */
    omit?: OrdemServicoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrdemServicoInclude<ExtArgs> | null
    /**
     * The data needed to update a OrdemServico.
     */
    data: XOR<OrdemServicoUpdateInput, OrdemServicoUncheckedUpdateInput>
    /**
     * Choose, which OrdemServico to update.
     */
    where: OrdemServicoWhereUniqueInput
  }

  /**
   * OrdemServico updateMany
   */
  export type OrdemServicoUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update OrdemServicos.
     */
    data: XOR<OrdemServicoUpdateManyMutationInput, OrdemServicoUncheckedUpdateManyInput>
    /**
     * Filter which OrdemServicos to update
     */
    where?: OrdemServicoWhereInput
    /**
     * Limit how many OrdemServicos to update.
     */
    limit?: number
  }

  /**
   * OrdemServico updateManyAndReturn
   */
  export type OrdemServicoUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrdemServico
     */
    select?: OrdemServicoSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the OrdemServico
     */
    omit?: OrdemServicoOmit<ExtArgs> | null
    /**
     * The data used to update OrdemServicos.
     */
    data: XOR<OrdemServicoUpdateManyMutationInput, OrdemServicoUncheckedUpdateManyInput>
    /**
     * Filter which OrdemServicos to update
     */
    where?: OrdemServicoWhereInput
    /**
     * Limit how many OrdemServicos to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrdemServicoIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * OrdemServico upsert
   */
  export type OrdemServicoUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrdemServico
     */
    select?: OrdemServicoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrdemServico
     */
    omit?: OrdemServicoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrdemServicoInclude<ExtArgs> | null
    /**
     * The filter to search for the OrdemServico to update in case it exists.
     */
    where: OrdemServicoWhereUniqueInput
    /**
     * In case the OrdemServico found by the `where` argument doesn't exist, create a new OrdemServico with this data.
     */
    create: XOR<OrdemServicoCreateInput, OrdemServicoUncheckedCreateInput>
    /**
     * In case the OrdemServico was found with the provided `where` argument, update it with this data.
     */
    update: XOR<OrdemServicoUpdateInput, OrdemServicoUncheckedUpdateInput>
  }

  /**
   * OrdemServico delete
   */
  export type OrdemServicoDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrdemServico
     */
    select?: OrdemServicoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrdemServico
     */
    omit?: OrdemServicoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrdemServicoInclude<ExtArgs> | null
    /**
     * Filter which OrdemServico to delete.
     */
    where: OrdemServicoWhereUniqueInput
  }

  /**
   * OrdemServico deleteMany
   */
  export type OrdemServicoDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OrdemServicos to delete
     */
    where?: OrdemServicoWhereInput
    /**
     * Limit how many OrdemServicos to delete.
     */
    limit?: number
  }

  /**
   * OrdemServico.tecnico
   */
  export type OrdemServico$tecnicoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Usuario
     */
    select?: UsuarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Usuario
     */
    omit?: UsuarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsuarioInclude<ExtArgs> | null
    where?: UsuarioWhereInput
  }

  /**
   * OrdemServico.ordem_vinculada
   */
  export type OrdemServico$ordem_vinculadaArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrdemServico
     */
    select?: OrdemServicoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrdemServico
     */
    omit?: OrdemServicoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrdemServicoInclude<ExtArgs> | null
    where?: OrdemServicoWhereInput
  }

  /**
   * OrdemServico.ordens_derivadas
   */
  export type OrdemServico$ordens_derivadasArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrdemServico
     */
    select?: OrdemServicoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrdemServico
     */
    omit?: OrdemServicoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrdemServicoInclude<ExtArgs> | null
    where?: OrdemServicoWhereInput
    orderBy?: OrdemServicoOrderByWithRelationInput | OrdemServicoOrderByWithRelationInput[]
    cursor?: OrdemServicoWhereUniqueInput
    take?: number
    skip?: number
    distinct?: OrdemServicoScalarFieldEnum | OrdemServicoScalarFieldEnum[]
  }

  /**
   * OrdemServico without action
   */
  export type OrdemServicoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrdemServico
     */
    select?: OrdemServicoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrdemServico
     */
    omit?: OrdemServicoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrdemServicoInclude<ExtArgs> | null
  }


  /**
   * Model AuditoriaLog
   */

  export type AggregateAuditoriaLog = {
    _count: AuditoriaLogCountAggregateOutputType | null
    _min: AuditoriaLogMinAggregateOutputType | null
    _max: AuditoriaLogMaxAggregateOutputType | null
  }

  export type AuditoriaLogMinAggregateOutputType = {
    id: string | null
    entidade_afetada: string | null
    entidade_id: string | null
    acao: $Enums.AuditAction | null
    usuario_id: string | null
    criado_em: Date | null
  }

  export type AuditoriaLogMaxAggregateOutputType = {
    id: string | null
    entidade_afetada: string | null
    entidade_id: string | null
    acao: $Enums.AuditAction | null
    usuario_id: string | null
    criado_em: Date | null
  }

  export type AuditoriaLogCountAggregateOutputType = {
    id: number
    entidade_afetada: number
    entidade_id: number
    acao: number
    usuario_id: number
    dados_antigos: number
    dados_novos: number
    criado_em: number
    _all: number
  }


  export type AuditoriaLogMinAggregateInputType = {
    id?: true
    entidade_afetada?: true
    entidade_id?: true
    acao?: true
    usuario_id?: true
    criado_em?: true
  }

  export type AuditoriaLogMaxAggregateInputType = {
    id?: true
    entidade_afetada?: true
    entidade_id?: true
    acao?: true
    usuario_id?: true
    criado_em?: true
  }

  export type AuditoriaLogCountAggregateInputType = {
    id?: true
    entidade_afetada?: true
    entidade_id?: true
    acao?: true
    usuario_id?: true
    dados_antigos?: true
    dados_novos?: true
    criado_em?: true
    _all?: true
  }

  export type AuditoriaLogAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AuditoriaLog to aggregate.
     */
    where?: AuditoriaLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuditoriaLogs to fetch.
     */
    orderBy?: AuditoriaLogOrderByWithRelationInput | AuditoriaLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AuditoriaLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuditoriaLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuditoriaLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AuditoriaLogs
    **/
    _count?: true | AuditoriaLogCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AuditoriaLogMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AuditoriaLogMaxAggregateInputType
  }

  export type GetAuditoriaLogAggregateType<T extends AuditoriaLogAggregateArgs> = {
        [P in keyof T & keyof AggregateAuditoriaLog]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAuditoriaLog[P]>
      : GetScalarType<T[P], AggregateAuditoriaLog[P]>
  }




  export type AuditoriaLogGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AuditoriaLogWhereInput
    orderBy?: AuditoriaLogOrderByWithAggregationInput | AuditoriaLogOrderByWithAggregationInput[]
    by: AuditoriaLogScalarFieldEnum[] | AuditoriaLogScalarFieldEnum
    having?: AuditoriaLogScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AuditoriaLogCountAggregateInputType | true
    _min?: AuditoriaLogMinAggregateInputType
    _max?: AuditoriaLogMaxAggregateInputType
  }

  export type AuditoriaLogGroupByOutputType = {
    id: string
    entidade_afetada: string
    entidade_id: string
    acao: $Enums.AuditAction
    usuario_id: string
    dados_antigos: JsonValue | null
    dados_novos: JsonValue | null
    criado_em: Date
    _count: AuditoriaLogCountAggregateOutputType | null
    _min: AuditoriaLogMinAggregateOutputType | null
    _max: AuditoriaLogMaxAggregateOutputType | null
  }

  type GetAuditoriaLogGroupByPayload<T extends AuditoriaLogGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AuditoriaLogGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AuditoriaLogGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AuditoriaLogGroupByOutputType[P]>
            : GetScalarType<T[P], AuditoriaLogGroupByOutputType[P]>
        }
      >
    >


  export type AuditoriaLogSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    entidade_afetada?: boolean
    entidade_id?: boolean
    acao?: boolean
    usuario_id?: boolean
    dados_antigos?: boolean
    dados_novos?: boolean
    criado_em?: boolean
    usuario?: boolean | UsuarioDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["auditoriaLog"]>

  export type AuditoriaLogSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    entidade_afetada?: boolean
    entidade_id?: boolean
    acao?: boolean
    usuario_id?: boolean
    dados_antigos?: boolean
    dados_novos?: boolean
    criado_em?: boolean
    usuario?: boolean | UsuarioDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["auditoriaLog"]>

  export type AuditoriaLogSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    entidade_afetada?: boolean
    entidade_id?: boolean
    acao?: boolean
    usuario_id?: boolean
    dados_antigos?: boolean
    dados_novos?: boolean
    criado_em?: boolean
    usuario?: boolean | UsuarioDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["auditoriaLog"]>

  export type AuditoriaLogSelectScalar = {
    id?: boolean
    entidade_afetada?: boolean
    entidade_id?: boolean
    acao?: boolean
    usuario_id?: boolean
    dados_antigos?: boolean
    dados_novos?: boolean
    criado_em?: boolean
  }

  export type AuditoriaLogOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "entidade_afetada" | "entidade_id" | "acao" | "usuario_id" | "dados_antigos" | "dados_novos" | "criado_em", ExtArgs["result"]["auditoriaLog"]>
  export type AuditoriaLogInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    usuario?: boolean | UsuarioDefaultArgs<ExtArgs>
  }
  export type AuditoriaLogIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    usuario?: boolean | UsuarioDefaultArgs<ExtArgs>
  }
  export type AuditoriaLogIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    usuario?: boolean | UsuarioDefaultArgs<ExtArgs>
  }

  export type $AuditoriaLogPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AuditoriaLog"
    objects: {
      usuario: Prisma.$UsuarioPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      entidade_afetada: string
      entidade_id: string
      acao: $Enums.AuditAction
      usuario_id: string
      dados_antigos: Prisma.JsonValue | null
      dados_novos: Prisma.JsonValue | null
      criado_em: Date
    }, ExtArgs["result"]["auditoriaLog"]>
    composites: {}
  }

  type AuditoriaLogGetPayload<S extends boolean | null | undefined | AuditoriaLogDefaultArgs> = $Result.GetResult<Prisma.$AuditoriaLogPayload, S>

  type AuditoriaLogCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AuditoriaLogFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AuditoriaLogCountAggregateInputType | true
    }

  export interface AuditoriaLogDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AuditoriaLog'], meta: { name: 'AuditoriaLog' } }
    /**
     * Find zero or one AuditoriaLog that matches the filter.
     * @param {AuditoriaLogFindUniqueArgs} args - Arguments to find a AuditoriaLog
     * @example
     * // Get one AuditoriaLog
     * const auditoriaLog = await prisma.auditoriaLog.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AuditoriaLogFindUniqueArgs>(args: SelectSubset<T, AuditoriaLogFindUniqueArgs<ExtArgs>>): Prisma__AuditoriaLogClient<$Result.GetResult<Prisma.$AuditoriaLogPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one AuditoriaLog that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AuditoriaLogFindUniqueOrThrowArgs} args - Arguments to find a AuditoriaLog
     * @example
     * // Get one AuditoriaLog
     * const auditoriaLog = await prisma.auditoriaLog.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AuditoriaLogFindUniqueOrThrowArgs>(args: SelectSubset<T, AuditoriaLogFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AuditoriaLogClient<$Result.GetResult<Prisma.$AuditoriaLogPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AuditoriaLog that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditoriaLogFindFirstArgs} args - Arguments to find a AuditoriaLog
     * @example
     * // Get one AuditoriaLog
     * const auditoriaLog = await prisma.auditoriaLog.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AuditoriaLogFindFirstArgs>(args?: SelectSubset<T, AuditoriaLogFindFirstArgs<ExtArgs>>): Prisma__AuditoriaLogClient<$Result.GetResult<Prisma.$AuditoriaLogPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AuditoriaLog that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditoriaLogFindFirstOrThrowArgs} args - Arguments to find a AuditoriaLog
     * @example
     * // Get one AuditoriaLog
     * const auditoriaLog = await prisma.auditoriaLog.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AuditoriaLogFindFirstOrThrowArgs>(args?: SelectSubset<T, AuditoriaLogFindFirstOrThrowArgs<ExtArgs>>): Prisma__AuditoriaLogClient<$Result.GetResult<Prisma.$AuditoriaLogPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more AuditoriaLogs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditoriaLogFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AuditoriaLogs
     * const auditoriaLogs = await prisma.auditoriaLog.findMany()
     * 
     * // Get first 10 AuditoriaLogs
     * const auditoriaLogs = await prisma.auditoriaLog.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const auditoriaLogWithIdOnly = await prisma.auditoriaLog.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AuditoriaLogFindManyArgs>(args?: SelectSubset<T, AuditoriaLogFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AuditoriaLogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a AuditoriaLog.
     * @param {AuditoriaLogCreateArgs} args - Arguments to create a AuditoriaLog.
     * @example
     * // Create one AuditoriaLog
     * const AuditoriaLog = await prisma.auditoriaLog.create({
     *   data: {
     *     // ... data to create a AuditoriaLog
     *   }
     * })
     * 
     */
    create<T extends AuditoriaLogCreateArgs>(args: SelectSubset<T, AuditoriaLogCreateArgs<ExtArgs>>): Prisma__AuditoriaLogClient<$Result.GetResult<Prisma.$AuditoriaLogPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many AuditoriaLogs.
     * @param {AuditoriaLogCreateManyArgs} args - Arguments to create many AuditoriaLogs.
     * @example
     * // Create many AuditoriaLogs
     * const auditoriaLog = await prisma.auditoriaLog.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AuditoriaLogCreateManyArgs>(args?: SelectSubset<T, AuditoriaLogCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many AuditoriaLogs and returns the data saved in the database.
     * @param {AuditoriaLogCreateManyAndReturnArgs} args - Arguments to create many AuditoriaLogs.
     * @example
     * // Create many AuditoriaLogs
     * const auditoriaLog = await prisma.auditoriaLog.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many AuditoriaLogs and only return the `id`
     * const auditoriaLogWithIdOnly = await prisma.auditoriaLog.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AuditoriaLogCreateManyAndReturnArgs>(args?: SelectSubset<T, AuditoriaLogCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AuditoriaLogPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a AuditoriaLog.
     * @param {AuditoriaLogDeleteArgs} args - Arguments to delete one AuditoriaLog.
     * @example
     * // Delete one AuditoriaLog
     * const AuditoriaLog = await prisma.auditoriaLog.delete({
     *   where: {
     *     // ... filter to delete one AuditoriaLog
     *   }
     * })
     * 
     */
    delete<T extends AuditoriaLogDeleteArgs>(args: SelectSubset<T, AuditoriaLogDeleteArgs<ExtArgs>>): Prisma__AuditoriaLogClient<$Result.GetResult<Prisma.$AuditoriaLogPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one AuditoriaLog.
     * @param {AuditoriaLogUpdateArgs} args - Arguments to update one AuditoriaLog.
     * @example
     * // Update one AuditoriaLog
     * const auditoriaLog = await prisma.auditoriaLog.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AuditoriaLogUpdateArgs>(args: SelectSubset<T, AuditoriaLogUpdateArgs<ExtArgs>>): Prisma__AuditoriaLogClient<$Result.GetResult<Prisma.$AuditoriaLogPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more AuditoriaLogs.
     * @param {AuditoriaLogDeleteManyArgs} args - Arguments to filter AuditoriaLogs to delete.
     * @example
     * // Delete a few AuditoriaLogs
     * const { count } = await prisma.auditoriaLog.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AuditoriaLogDeleteManyArgs>(args?: SelectSubset<T, AuditoriaLogDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AuditoriaLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditoriaLogUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AuditoriaLogs
     * const auditoriaLog = await prisma.auditoriaLog.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AuditoriaLogUpdateManyArgs>(args: SelectSubset<T, AuditoriaLogUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AuditoriaLogs and returns the data updated in the database.
     * @param {AuditoriaLogUpdateManyAndReturnArgs} args - Arguments to update many AuditoriaLogs.
     * @example
     * // Update many AuditoriaLogs
     * const auditoriaLog = await prisma.auditoriaLog.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more AuditoriaLogs and only return the `id`
     * const auditoriaLogWithIdOnly = await prisma.auditoriaLog.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends AuditoriaLogUpdateManyAndReturnArgs>(args: SelectSubset<T, AuditoriaLogUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AuditoriaLogPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one AuditoriaLog.
     * @param {AuditoriaLogUpsertArgs} args - Arguments to update or create a AuditoriaLog.
     * @example
     * // Update or create a AuditoriaLog
     * const auditoriaLog = await prisma.auditoriaLog.upsert({
     *   create: {
     *     // ... data to create a AuditoriaLog
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AuditoriaLog we want to update
     *   }
     * })
     */
    upsert<T extends AuditoriaLogUpsertArgs>(args: SelectSubset<T, AuditoriaLogUpsertArgs<ExtArgs>>): Prisma__AuditoriaLogClient<$Result.GetResult<Prisma.$AuditoriaLogPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of AuditoriaLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditoriaLogCountArgs} args - Arguments to filter AuditoriaLogs to count.
     * @example
     * // Count the number of AuditoriaLogs
     * const count = await prisma.auditoriaLog.count({
     *   where: {
     *     // ... the filter for the AuditoriaLogs we want to count
     *   }
     * })
    **/
    count<T extends AuditoriaLogCountArgs>(
      args?: Subset<T, AuditoriaLogCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AuditoriaLogCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AuditoriaLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditoriaLogAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AuditoriaLogAggregateArgs>(args: Subset<T, AuditoriaLogAggregateArgs>): Prisma.PrismaPromise<GetAuditoriaLogAggregateType<T>>

    /**
     * Group by AuditoriaLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditoriaLogGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AuditoriaLogGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AuditoriaLogGroupByArgs['orderBy'] }
        : { orderBy?: AuditoriaLogGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AuditoriaLogGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAuditoriaLogGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AuditoriaLog model
   */
  readonly fields: AuditoriaLogFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AuditoriaLog.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AuditoriaLogClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    usuario<T extends UsuarioDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UsuarioDefaultArgs<ExtArgs>>): Prisma__UsuarioClient<$Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the AuditoriaLog model
   */
  interface AuditoriaLogFieldRefs {
    readonly id: FieldRef<"AuditoriaLog", 'String'>
    readonly entidade_afetada: FieldRef<"AuditoriaLog", 'String'>
    readonly entidade_id: FieldRef<"AuditoriaLog", 'String'>
    readonly acao: FieldRef<"AuditoriaLog", 'AuditAction'>
    readonly usuario_id: FieldRef<"AuditoriaLog", 'String'>
    readonly dados_antigos: FieldRef<"AuditoriaLog", 'Json'>
    readonly dados_novos: FieldRef<"AuditoriaLog", 'Json'>
    readonly criado_em: FieldRef<"AuditoriaLog", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * AuditoriaLog findUnique
   */
  export type AuditoriaLogFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditoriaLog
     */
    select?: AuditoriaLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditoriaLog
     */
    omit?: AuditoriaLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditoriaLogInclude<ExtArgs> | null
    /**
     * Filter, which AuditoriaLog to fetch.
     */
    where: AuditoriaLogWhereUniqueInput
  }

  /**
   * AuditoriaLog findUniqueOrThrow
   */
  export type AuditoriaLogFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditoriaLog
     */
    select?: AuditoriaLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditoriaLog
     */
    omit?: AuditoriaLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditoriaLogInclude<ExtArgs> | null
    /**
     * Filter, which AuditoriaLog to fetch.
     */
    where: AuditoriaLogWhereUniqueInput
  }

  /**
   * AuditoriaLog findFirst
   */
  export type AuditoriaLogFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditoriaLog
     */
    select?: AuditoriaLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditoriaLog
     */
    omit?: AuditoriaLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditoriaLogInclude<ExtArgs> | null
    /**
     * Filter, which AuditoriaLog to fetch.
     */
    where?: AuditoriaLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuditoriaLogs to fetch.
     */
    orderBy?: AuditoriaLogOrderByWithRelationInput | AuditoriaLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AuditoriaLogs.
     */
    cursor?: AuditoriaLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuditoriaLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuditoriaLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AuditoriaLogs.
     */
    distinct?: AuditoriaLogScalarFieldEnum | AuditoriaLogScalarFieldEnum[]
  }

  /**
   * AuditoriaLog findFirstOrThrow
   */
  export type AuditoriaLogFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditoriaLog
     */
    select?: AuditoriaLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditoriaLog
     */
    omit?: AuditoriaLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditoriaLogInclude<ExtArgs> | null
    /**
     * Filter, which AuditoriaLog to fetch.
     */
    where?: AuditoriaLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuditoriaLogs to fetch.
     */
    orderBy?: AuditoriaLogOrderByWithRelationInput | AuditoriaLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AuditoriaLogs.
     */
    cursor?: AuditoriaLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuditoriaLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuditoriaLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AuditoriaLogs.
     */
    distinct?: AuditoriaLogScalarFieldEnum | AuditoriaLogScalarFieldEnum[]
  }

  /**
   * AuditoriaLog findMany
   */
  export type AuditoriaLogFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditoriaLog
     */
    select?: AuditoriaLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditoriaLog
     */
    omit?: AuditoriaLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditoriaLogInclude<ExtArgs> | null
    /**
     * Filter, which AuditoriaLogs to fetch.
     */
    where?: AuditoriaLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuditoriaLogs to fetch.
     */
    orderBy?: AuditoriaLogOrderByWithRelationInput | AuditoriaLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AuditoriaLogs.
     */
    cursor?: AuditoriaLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuditoriaLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuditoriaLogs.
     */
    skip?: number
    distinct?: AuditoriaLogScalarFieldEnum | AuditoriaLogScalarFieldEnum[]
  }

  /**
   * AuditoriaLog create
   */
  export type AuditoriaLogCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditoriaLog
     */
    select?: AuditoriaLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditoriaLog
     */
    omit?: AuditoriaLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditoriaLogInclude<ExtArgs> | null
    /**
     * The data needed to create a AuditoriaLog.
     */
    data: XOR<AuditoriaLogCreateInput, AuditoriaLogUncheckedCreateInput>
  }

  /**
   * AuditoriaLog createMany
   */
  export type AuditoriaLogCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AuditoriaLogs.
     */
    data: AuditoriaLogCreateManyInput | AuditoriaLogCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AuditoriaLog createManyAndReturn
   */
  export type AuditoriaLogCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditoriaLog
     */
    select?: AuditoriaLogSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AuditoriaLog
     */
    omit?: AuditoriaLogOmit<ExtArgs> | null
    /**
     * The data used to create many AuditoriaLogs.
     */
    data: AuditoriaLogCreateManyInput | AuditoriaLogCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditoriaLogIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * AuditoriaLog update
   */
  export type AuditoriaLogUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditoriaLog
     */
    select?: AuditoriaLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditoriaLog
     */
    omit?: AuditoriaLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditoriaLogInclude<ExtArgs> | null
    /**
     * The data needed to update a AuditoriaLog.
     */
    data: XOR<AuditoriaLogUpdateInput, AuditoriaLogUncheckedUpdateInput>
    /**
     * Choose, which AuditoriaLog to update.
     */
    where: AuditoriaLogWhereUniqueInput
  }

  /**
   * AuditoriaLog updateMany
   */
  export type AuditoriaLogUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AuditoriaLogs.
     */
    data: XOR<AuditoriaLogUpdateManyMutationInput, AuditoriaLogUncheckedUpdateManyInput>
    /**
     * Filter which AuditoriaLogs to update
     */
    where?: AuditoriaLogWhereInput
    /**
     * Limit how many AuditoriaLogs to update.
     */
    limit?: number
  }

  /**
   * AuditoriaLog updateManyAndReturn
   */
  export type AuditoriaLogUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditoriaLog
     */
    select?: AuditoriaLogSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AuditoriaLog
     */
    omit?: AuditoriaLogOmit<ExtArgs> | null
    /**
     * The data used to update AuditoriaLogs.
     */
    data: XOR<AuditoriaLogUpdateManyMutationInput, AuditoriaLogUncheckedUpdateManyInput>
    /**
     * Filter which AuditoriaLogs to update
     */
    where?: AuditoriaLogWhereInput
    /**
     * Limit how many AuditoriaLogs to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditoriaLogIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * AuditoriaLog upsert
   */
  export type AuditoriaLogUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditoriaLog
     */
    select?: AuditoriaLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditoriaLog
     */
    omit?: AuditoriaLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditoriaLogInclude<ExtArgs> | null
    /**
     * The filter to search for the AuditoriaLog to update in case it exists.
     */
    where: AuditoriaLogWhereUniqueInput
    /**
     * In case the AuditoriaLog found by the `where` argument doesn't exist, create a new AuditoriaLog with this data.
     */
    create: XOR<AuditoriaLogCreateInput, AuditoriaLogUncheckedCreateInput>
    /**
     * In case the AuditoriaLog was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AuditoriaLogUpdateInput, AuditoriaLogUncheckedUpdateInput>
  }

  /**
   * AuditoriaLog delete
   */
  export type AuditoriaLogDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditoriaLog
     */
    select?: AuditoriaLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditoriaLog
     */
    omit?: AuditoriaLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditoriaLogInclude<ExtArgs> | null
    /**
     * Filter which AuditoriaLog to delete.
     */
    where: AuditoriaLogWhereUniqueInput
  }

  /**
   * AuditoriaLog deleteMany
   */
  export type AuditoriaLogDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AuditoriaLogs to delete
     */
    where?: AuditoriaLogWhereInput
    /**
     * Limit how many AuditoriaLogs to delete.
     */
    limit?: number
  }

  /**
   * AuditoriaLog without action
   */
  export type AuditoriaLogDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditoriaLog
     */
    select?: AuditoriaLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditoriaLog
     */
    omit?: AuditoriaLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditoriaLogInclude<ExtArgs> | null
  }


  /**
   * Model AgendaVistoria
   */

  export type AggregateAgendaVistoria = {
    _count: AgendaVistoriaCountAggregateOutputType | null
    _min: AgendaVistoriaMinAggregateOutputType | null
    _max: AgendaVistoriaMaxAggregateOutputType | null
  }

  export type AgendaVistoriaMinAggregateOutputType = {
    id: string | null
    titulo: string | null
    subtitulo: string | null
    horario: string | null
    tipo: string | null
    concluido: boolean | null
    tecnico: string | null
    criado_em: Date | null
  }

  export type AgendaVistoriaMaxAggregateOutputType = {
    id: string | null
    titulo: string | null
    subtitulo: string | null
    horario: string | null
    tipo: string | null
    concluido: boolean | null
    tecnico: string | null
    criado_em: Date | null
  }

  export type AgendaVistoriaCountAggregateOutputType = {
    id: number
    titulo: number
    subtitulo: number
    horario: number
    tipo: number
    concluido: number
    tecnico: number
    criado_em: number
    _all: number
  }


  export type AgendaVistoriaMinAggregateInputType = {
    id?: true
    titulo?: true
    subtitulo?: true
    horario?: true
    tipo?: true
    concluido?: true
    tecnico?: true
    criado_em?: true
  }

  export type AgendaVistoriaMaxAggregateInputType = {
    id?: true
    titulo?: true
    subtitulo?: true
    horario?: true
    tipo?: true
    concluido?: true
    tecnico?: true
    criado_em?: true
  }

  export type AgendaVistoriaCountAggregateInputType = {
    id?: true
    titulo?: true
    subtitulo?: true
    horario?: true
    tipo?: true
    concluido?: true
    tecnico?: true
    criado_em?: true
    _all?: true
  }

  export type AgendaVistoriaAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AgendaVistoria to aggregate.
     */
    where?: AgendaVistoriaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AgendaVistorias to fetch.
     */
    orderBy?: AgendaVistoriaOrderByWithRelationInput | AgendaVistoriaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AgendaVistoriaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AgendaVistorias from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AgendaVistorias.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AgendaVistorias
    **/
    _count?: true | AgendaVistoriaCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AgendaVistoriaMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AgendaVistoriaMaxAggregateInputType
  }

  export type GetAgendaVistoriaAggregateType<T extends AgendaVistoriaAggregateArgs> = {
        [P in keyof T & keyof AggregateAgendaVistoria]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAgendaVistoria[P]>
      : GetScalarType<T[P], AggregateAgendaVistoria[P]>
  }




  export type AgendaVistoriaGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AgendaVistoriaWhereInput
    orderBy?: AgendaVistoriaOrderByWithAggregationInput | AgendaVistoriaOrderByWithAggregationInput[]
    by: AgendaVistoriaScalarFieldEnum[] | AgendaVistoriaScalarFieldEnum
    having?: AgendaVistoriaScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AgendaVistoriaCountAggregateInputType | true
    _min?: AgendaVistoriaMinAggregateInputType
    _max?: AgendaVistoriaMaxAggregateInputType
  }

  export type AgendaVistoriaGroupByOutputType = {
    id: string
    titulo: string
    subtitulo: string
    horario: string
    tipo: string
    concluido: boolean
    tecnico: string | null
    criado_em: Date
    _count: AgendaVistoriaCountAggregateOutputType | null
    _min: AgendaVistoriaMinAggregateOutputType | null
    _max: AgendaVistoriaMaxAggregateOutputType | null
  }

  type GetAgendaVistoriaGroupByPayload<T extends AgendaVistoriaGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AgendaVistoriaGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AgendaVistoriaGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AgendaVistoriaGroupByOutputType[P]>
            : GetScalarType<T[P], AgendaVistoriaGroupByOutputType[P]>
        }
      >
    >


  export type AgendaVistoriaSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    titulo?: boolean
    subtitulo?: boolean
    horario?: boolean
    tipo?: boolean
    concluido?: boolean
    tecnico?: boolean
    criado_em?: boolean
  }, ExtArgs["result"]["agendaVistoria"]>

  export type AgendaVistoriaSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    titulo?: boolean
    subtitulo?: boolean
    horario?: boolean
    tipo?: boolean
    concluido?: boolean
    tecnico?: boolean
    criado_em?: boolean
  }, ExtArgs["result"]["agendaVistoria"]>

  export type AgendaVistoriaSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    titulo?: boolean
    subtitulo?: boolean
    horario?: boolean
    tipo?: boolean
    concluido?: boolean
    tecnico?: boolean
    criado_em?: boolean
  }, ExtArgs["result"]["agendaVistoria"]>

  export type AgendaVistoriaSelectScalar = {
    id?: boolean
    titulo?: boolean
    subtitulo?: boolean
    horario?: boolean
    tipo?: boolean
    concluido?: boolean
    tecnico?: boolean
    criado_em?: boolean
  }

  export type AgendaVistoriaOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "titulo" | "subtitulo" | "horario" | "tipo" | "concluido" | "tecnico" | "criado_em", ExtArgs["result"]["agendaVistoria"]>

  export type $AgendaVistoriaPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AgendaVistoria"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      titulo: string
      subtitulo: string
      horario: string
      tipo: string
      concluido: boolean
      tecnico: string | null
      criado_em: Date
    }, ExtArgs["result"]["agendaVistoria"]>
    composites: {}
  }

  type AgendaVistoriaGetPayload<S extends boolean | null | undefined | AgendaVistoriaDefaultArgs> = $Result.GetResult<Prisma.$AgendaVistoriaPayload, S>

  type AgendaVistoriaCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AgendaVistoriaFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AgendaVistoriaCountAggregateInputType | true
    }

  export interface AgendaVistoriaDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AgendaVistoria'], meta: { name: 'AgendaVistoria' } }
    /**
     * Find zero or one AgendaVistoria that matches the filter.
     * @param {AgendaVistoriaFindUniqueArgs} args - Arguments to find a AgendaVistoria
     * @example
     * // Get one AgendaVistoria
     * const agendaVistoria = await prisma.agendaVistoria.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AgendaVistoriaFindUniqueArgs>(args: SelectSubset<T, AgendaVistoriaFindUniqueArgs<ExtArgs>>): Prisma__AgendaVistoriaClient<$Result.GetResult<Prisma.$AgendaVistoriaPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one AgendaVistoria that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AgendaVistoriaFindUniqueOrThrowArgs} args - Arguments to find a AgendaVistoria
     * @example
     * // Get one AgendaVistoria
     * const agendaVistoria = await prisma.agendaVistoria.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AgendaVistoriaFindUniqueOrThrowArgs>(args: SelectSubset<T, AgendaVistoriaFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AgendaVistoriaClient<$Result.GetResult<Prisma.$AgendaVistoriaPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AgendaVistoria that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgendaVistoriaFindFirstArgs} args - Arguments to find a AgendaVistoria
     * @example
     * // Get one AgendaVistoria
     * const agendaVistoria = await prisma.agendaVistoria.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AgendaVistoriaFindFirstArgs>(args?: SelectSubset<T, AgendaVistoriaFindFirstArgs<ExtArgs>>): Prisma__AgendaVistoriaClient<$Result.GetResult<Prisma.$AgendaVistoriaPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AgendaVistoria that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgendaVistoriaFindFirstOrThrowArgs} args - Arguments to find a AgendaVistoria
     * @example
     * // Get one AgendaVistoria
     * const agendaVistoria = await prisma.agendaVistoria.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AgendaVistoriaFindFirstOrThrowArgs>(args?: SelectSubset<T, AgendaVistoriaFindFirstOrThrowArgs<ExtArgs>>): Prisma__AgendaVistoriaClient<$Result.GetResult<Prisma.$AgendaVistoriaPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more AgendaVistorias that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgendaVistoriaFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AgendaVistorias
     * const agendaVistorias = await prisma.agendaVistoria.findMany()
     * 
     * // Get first 10 AgendaVistorias
     * const agendaVistorias = await prisma.agendaVistoria.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const agendaVistoriaWithIdOnly = await prisma.agendaVistoria.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AgendaVistoriaFindManyArgs>(args?: SelectSubset<T, AgendaVistoriaFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AgendaVistoriaPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a AgendaVistoria.
     * @param {AgendaVistoriaCreateArgs} args - Arguments to create a AgendaVistoria.
     * @example
     * // Create one AgendaVistoria
     * const AgendaVistoria = await prisma.agendaVistoria.create({
     *   data: {
     *     // ... data to create a AgendaVistoria
     *   }
     * })
     * 
     */
    create<T extends AgendaVistoriaCreateArgs>(args: SelectSubset<T, AgendaVistoriaCreateArgs<ExtArgs>>): Prisma__AgendaVistoriaClient<$Result.GetResult<Prisma.$AgendaVistoriaPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many AgendaVistorias.
     * @param {AgendaVistoriaCreateManyArgs} args - Arguments to create many AgendaVistorias.
     * @example
     * // Create many AgendaVistorias
     * const agendaVistoria = await prisma.agendaVistoria.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AgendaVistoriaCreateManyArgs>(args?: SelectSubset<T, AgendaVistoriaCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many AgendaVistorias and returns the data saved in the database.
     * @param {AgendaVistoriaCreateManyAndReturnArgs} args - Arguments to create many AgendaVistorias.
     * @example
     * // Create many AgendaVistorias
     * const agendaVistoria = await prisma.agendaVistoria.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many AgendaVistorias and only return the `id`
     * const agendaVistoriaWithIdOnly = await prisma.agendaVistoria.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AgendaVistoriaCreateManyAndReturnArgs>(args?: SelectSubset<T, AgendaVistoriaCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AgendaVistoriaPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a AgendaVistoria.
     * @param {AgendaVistoriaDeleteArgs} args - Arguments to delete one AgendaVistoria.
     * @example
     * // Delete one AgendaVistoria
     * const AgendaVistoria = await prisma.agendaVistoria.delete({
     *   where: {
     *     // ... filter to delete one AgendaVistoria
     *   }
     * })
     * 
     */
    delete<T extends AgendaVistoriaDeleteArgs>(args: SelectSubset<T, AgendaVistoriaDeleteArgs<ExtArgs>>): Prisma__AgendaVistoriaClient<$Result.GetResult<Prisma.$AgendaVistoriaPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one AgendaVistoria.
     * @param {AgendaVistoriaUpdateArgs} args - Arguments to update one AgendaVistoria.
     * @example
     * // Update one AgendaVistoria
     * const agendaVistoria = await prisma.agendaVistoria.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AgendaVistoriaUpdateArgs>(args: SelectSubset<T, AgendaVistoriaUpdateArgs<ExtArgs>>): Prisma__AgendaVistoriaClient<$Result.GetResult<Prisma.$AgendaVistoriaPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more AgendaVistorias.
     * @param {AgendaVistoriaDeleteManyArgs} args - Arguments to filter AgendaVistorias to delete.
     * @example
     * // Delete a few AgendaVistorias
     * const { count } = await prisma.agendaVistoria.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AgendaVistoriaDeleteManyArgs>(args?: SelectSubset<T, AgendaVistoriaDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AgendaVistorias.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgendaVistoriaUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AgendaVistorias
     * const agendaVistoria = await prisma.agendaVistoria.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AgendaVistoriaUpdateManyArgs>(args: SelectSubset<T, AgendaVistoriaUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AgendaVistorias and returns the data updated in the database.
     * @param {AgendaVistoriaUpdateManyAndReturnArgs} args - Arguments to update many AgendaVistorias.
     * @example
     * // Update many AgendaVistorias
     * const agendaVistoria = await prisma.agendaVistoria.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more AgendaVistorias and only return the `id`
     * const agendaVistoriaWithIdOnly = await prisma.agendaVistoria.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends AgendaVistoriaUpdateManyAndReturnArgs>(args: SelectSubset<T, AgendaVistoriaUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AgendaVistoriaPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one AgendaVistoria.
     * @param {AgendaVistoriaUpsertArgs} args - Arguments to update or create a AgendaVistoria.
     * @example
     * // Update or create a AgendaVistoria
     * const agendaVistoria = await prisma.agendaVistoria.upsert({
     *   create: {
     *     // ... data to create a AgendaVistoria
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AgendaVistoria we want to update
     *   }
     * })
     */
    upsert<T extends AgendaVistoriaUpsertArgs>(args: SelectSubset<T, AgendaVistoriaUpsertArgs<ExtArgs>>): Prisma__AgendaVistoriaClient<$Result.GetResult<Prisma.$AgendaVistoriaPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of AgendaVistorias.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgendaVistoriaCountArgs} args - Arguments to filter AgendaVistorias to count.
     * @example
     * // Count the number of AgendaVistorias
     * const count = await prisma.agendaVistoria.count({
     *   where: {
     *     // ... the filter for the AgendaVistorias we want to count
     *   }
     * })
    **/
    count<T extends AgendaVistoriaCountArgs>(
      args?: Subset<T, AgendaVistoriaCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AgendaVistoriaCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AgendaVistoria.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgendaVistoriaAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AgendaVistoriaAggregateArgs>(args: Subset<T, AgendaVistoriaAggregateArgs>): Prisma.PrismaPromise<GetAgendaVistoriaAggregateType<T>>

    /**
     * Group by AgendaVistoria.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgendaVistoriaGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AgendaVistoriaGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AgendaVistoriaGroupByArgs['orderBy'] }
        : { orderBy?: AgendaVistoriaGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AgendaVistoriaGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAgendaVistoriaGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AgendaVistoria model
   */
  readonly fields: AgendaVistoriaFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AgendaVistoria.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AgendaVistoriaClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the AgendaVistoria model
   */
  interface AgendaVistoriaFieldRefs {
    readonly id: FieldRef<"AgendaVistoria", 'String'>
    readonly titulo: FieldRef<"AgendaVistoria", 'String'>
    readonly subtitulo: FieldRef<"AgendaVistoria", 'String'>
    readonly horario: FieldRef<"AgendaVistoria", 'String'>
    readonly tipo: FieldRef<"AgendaVistoria", 'String'>
    readonly concluido: FieldRef<"AgendaVistoria", 'Boolean'>
    readonly tecnico: FieldRef<"AgendaVistoria", 'String'>
    readonly criado_em: FieldRef<"AgendaVistoria", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * AgendaVistoria findUnique
   */
  export type AgendaVistoriaFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgendaVistoria
     */
    select?: AgendaVistoriaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AgendaVistoria
     */
    omit?: AgendaVistoriaOmit<ExtArgs> | null
    /**
     * Filter, which AgendaVistoria to fetch.
     */
    where: AgendaVistoriaWhereUniqueInput
  }

  /**
   * AgendaVistoria findUniqueOrThrow
   */
  export type AgendaVistoriaFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgendaVistoria
     */
    select?: AgendaVistoriaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AgendaVistoria
     */
    omit?: AgendaVistoriaOmit<ExtArgs> | null
    /**
     * Filter, which AgendaVistoria to fetch.
     */
    where: AgendaVistoriaWhereUniqueInput
  }

  /**
   * AgendaVistoria findFirst
   */
  export type AgendaVistoriaFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgendaVistoria
     */
    select?: AgendaVistoriaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AgendaVistoria
     */
    omit?: AgendaVistoriaOmit<ExtArgs> | null
    /**
     * Filter, which AgendaVistoria to fetch.
     */
    where?: AgendaVistoriaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AgendaVistorias to fetch.
     */
    orderBy?: AgendaVistoriaOrderByWithRelationInput | AgendaVistoriaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AgendaVistorias.
     */
    cursor?: AgendaVistoriaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AgendaVistorias from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AgendaVistorias.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AgendaVistorias.
     */
    distinct?: AgendaVistoriaScalarFieldEnum | AgendaVistoriaScalarFieldEnum[]
  }

  /**
   * AgendaVistoria findFirstOrThrow
   */
  export type AgendaVistoriaFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgendaVistoria
     */
    select?: AgendaVistoriaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AgendaVistoria
     */
    omit?: AgendaVistoriaOmit<ExtArgs> | null
    /**
     * Filter, which AgendaVistoria to fetch.
     */
    where?: AgendaVistoriaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AgendaVistorias to fetch.
     */
    orderBy?: AgendaVistoriaOrderByWithRelationInput | AgendaVistoriaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AgendaVistorias.
     */
    cursor?: AgendaVistoriaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AgendaVistorias from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AgendaVistorias.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AgendaVistorias.
     */
    distinct?: AgendaVistoriaScalarFieldEnum | AgendaVistoriaScalarFieldEnum[]
  }

  /**
   * AgendaVistoria findMany
   */
  export type AgendaVistoriaFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgendaVistoria
     */
    select?: AgendaVistoriaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AgendaVistoria
     */
    omit?: AgendaVistoriaOmit<ExtArgs> | null
    /**
     * Filter, which AgendaVistorias to fetch.
     */
    where?: AgendaVistoriaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AgendaVistorias to fetch.
     */
    orderBy?: AgendaVistoriaOrderByWithRelationInput | AgendaVistoriaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AgendaVistorias.
     */
    cursor?: AgendaVistoriaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AgendaVistorias from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AgendaVistorias.
     */
    skip?: number
    distinct?: AgendaVistoriaScalarFieldEnum | AgendaVistoriaScalarFieldEnum[]
  }

  /**
   * AgendaVistoria create
   */
  export type AgendaVistoriaCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgendaVistoria
     */
    select?: AgendaVistoriaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AgendaVistoria
     */
    omit?: AgendaVistoriaOmit<ExtArgs> | null
    /**
     * The data needed to create a AgendaVistoria.
     */
    data: XOR<AgendaVistoriaCreateInput, AgendaVistoriaUncheckedCreateInput>
  }

  /**
   * AgendaVistoria createMany
   */
  export type AgendaVistoriaCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AgendaVistorias.
     */
    data: AgendaVistoriaCreateManyInput | AgendaVistoriaCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AgendaVistoria createManyAndReturn
   */
  export type AgendaVistoriaCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgendaVistoria
     */
    select?: AgendaVistoriaSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AgendaVistoria
     */
    omit?: AgendaVistoriaOmit<ExtArgs> | null
    /**
     * The data used to create many AgendaVistorias.
     */
    data: AgendaVistoriaCreateManyInput | AgendaVistoriaCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AgendaVistoria update
   */
  export type AgendaVistoriaUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgendaVistoria
     */
    select?: AgendaVistoriaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AgendaVistoria
     */
    omit?: AgendaVistoriaOmit<ExtArgs> | null
    /**
     * The data needed to update a AgendaVistoria.
     */
    data: XOR<AgendaVistoriaUpdateInput, AgendaVistoriaUncheckedUpdateInput>
    /**
     * Choose, which AgendaVistoria to update.
     */
    where: AgendaVistoriaWhereUniqueInput
  }

  /**
   * AgendaVistoria updateMany
   */
  export type AgendaVistoriaUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AgendaVistorias.
     */
    data: XOR<AgendaVistoriaUpdateManyMutationInput, AgendaVistoriaUncheckedUpdateManyInput>
    /**
     * Filter which AgendaVistorias to update
     */
    where?: AgendaVistoriaWhereInput
    /**
     * Limit how many AgendaVistorias to update.
     */
    limit?: number
  }

  /**
   * AgendaVistoria updateManyAndReturn
   */
  export type AgendaVistoriaUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgendaVistoria
     */
    select?: AgendaVistoriaSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AgendaVistoria
     */
    omit?: AgendaVistoriaOmit<ExtArgs> | null
    /**
     * The data used to update AgendaVistorias.
     */
    data: XOR<AgendaVistoriaUpdateManyMutationInput, AgendaVistoriaUncheckedUpdateManyInput>
    /**
     * Filter which AgendaVistorias to update
     */
    where?: AgendaVistoriaWhereInput
    /**
     * Limit how many AgendaVistorias to update.
     */
    limit?: number
  }

  /**
   * AgendaVistoria upsert
   */
  export type AgendaVistoriaUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgendaVistoria
     */
    select?: AgendaVistoriaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AgendaVistoria
     */
    omit?: AgendaVistoriaOmit<ExtArgs> | null
    /**
     * The filter to search for the AgendaVistoria to update in case it exists.
     */
    where: AgendaVistoriaWhereUniqueInput
    /**
     * In case the AgendaVistoria found by the `where` argument doesn't exist, create a new AgendaVistoria with this data.
     */
    create: XOR<AgendaVistoriaCreateInput, AgendaVistoriaUncheckedCreateInput>
    /**
     * In case the AgendaVistoria was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AgendaVistoriaUpdateInput, AgendaVistoriaUncheckedUpdateInput>
  }

  /**
   * AgendaVistoria delete
   */
  export type AgendaVistoriaDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgendaVistoria
     */
    select?: AgendaVistoriaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AgendaVistoria
     */
    omit?: AgendaVistoriaOmit<ExtArgs> | null
    /**
     * Filter which AgendaVistoria to delete.
     */
    where: AgendaVistoriaWhereUniqueInput
  }

  /**
   * AgendaVistoria deleteMany
   */
  export type AgendaVistoriaDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AgendaVistorias to delete
     */
    where?: AgendaVistoriaWhereInput
    /**
     * Limit how many AgendaVistorias to delete.
     */
    limit?: number
  }

  /**
   * AgendaVistoria without action
   */
  export type AgendaVistoriaDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgendaVistoria
     */
    select?: AgendaVistoriaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AgendaVistoria
     */
    omit?: AgendaVistoriaOmit<ExtArgs> | null
  }


  /**
   * Model ConfiguracaoSistema
   */

  export type AggregateConfiguracaoSistema = {
    _count: ConfiguracaoSistemaCountAggregateOutputType | null
    _avg: ConfiguracaoSistemaAvgAggregateOutputType | null
    _sum: ConfiguracaoSistemaSumAggregateOutputType | null
    _min: ConfiguracaoSistemaMinAggregateOutputType | null
    _max: ConfiguracaoSistemaMaxAggregateOutputType | null
  }

  export type ConfiguracaoSistemaAvgAggregateOutputType = {
    sla_urgente_h: number | null
    sla_alta_h: number | null
    sla_media_h: number | null
    sla_baixa_h: number | null
    mttr_alert_h: number | null
    preventiva_goal: number | null
  }

  export type ConfiguracaoSistemaSumAggregateOutputType = {
    sla_urgente_h: number | null
    sla_alta_h: number | null
    sla_media_h: number | null
    sla_baixa_h: number | null
    mttr_alert_h: number | null
    preventiva_goal: number | null
  }

  export type ConfiguracaoSistemaMinAggregateOutputType = {
    id: string | null
    prefeitura_nome: string | null
    secretaria_nome: string | null
    gestor_nome: string | null
    gestor_cargo: string | null
    gestor_email: string | null
    gestor_telefone: string | null
    sla_urgente_h: number | null
    sla_alta_h: number | null
    sla_media_h: number | null
    sla_baixa_h: number | null
    mttr_alert_h: number | null
    preventiva_goal: number | null
    sound_alerts: boolean | null
    push_notif: boolean | null
    whatsapp_alerts: boolean | null
    auto_dispatch: boolean | null
    criado_em: Date | null
    atualizado: Date | null
  }

  export type ConfiguracaoSistemaMaxAggregateOutputType = {
    id: string | null
    prefeitura_nome: string | null
    secretaria_nome: string | null
    gestor_nome: string | null
    gestor_cargo: string | null
    gestor_email: string | null
    gestor_telefone: string | null
    sla_urgente_h: number | null
    sla_alta_h: number | null
    sla_media_h: number | null
    sla_baixa_h: number | null
    mttr_alert_h: number | null
    preventiva_goal: number | null
    sound_alerts: boolean | null
    push_notif: boolean | null
    whatsapp_alerts: boolean | null
    auto_dispatch: boolean | null
    criado_em: Date | null
    atualizado: Date | null
  }

  export type ConfiguracaoSistemaCountAggregateOutputType = {
    id: number
    prefeitura_nome: number
    secretaria_nome: number
    gestor_nome: number
    gestor_cargo: number
    gestor_email: number
    gestor_telefone: number
    sla_urgente_h: number
    sla_alta_h: number
    sla_media_h: number
    sla_baixa_h: number
    mttr_alert_h: number
    preventiva_goal: number
    sound_alerts: number
    push_notif: number
    whatsapp_alerts: number
    auto_dispatch: number
    criado_em: number
    atualizado: number
    _all: number
  }


  export type ConfiguracaoSistemaAvgAggregateInputType = {
    sla_urgente_h?: true
    sla_alta_h?: true
    sla_media_h?: true
    sla_baixa_h?: true
    mttr_alert_h?: true
    preventiva_goal?: true
  }

  export type ConfiguracaoSistemaSumAggregateInputType = {
    sla_urgente_h?: true
    sla_alta_h?: true
    sla_media_h?: true
    sla_baixa_h?: true
    mttr_alert_h?: true
    preventiva_goal?: true
  }

  export type ConfiguracaoSistemaMinAggregateInputType = {
    id?: true
    prefeitura_nome?: true
    secretaria_nome?: true
    gestor_nome?: true
    gestor_cargo?: true
    gestor_email?: true
    gestor_telefone?: true
    sla_urgente_h?: true
    sla_alta_h?: true
    sla_media_h?: true
    sla_baixa_h?: true
    mttr_alert_h?: true
    preventiva_goal?: true
    sound_alerts?: true
    push_notif?: true
    whatsapp_alerts?: true
    auto_dispatch?: true
    criado_em?: true
    atualizado?: true
  }

  export type ConfiguracaoSistemaMaxAggregateInputType = {
    id?: true
    prefeitura_nome?: true
    secretaria_nome?: true
    gestor_nome?: true
    gestor_cargo?: true
    gestor_email?: true
    gestor_telefone?: true
    sla_urgente_h?: true
    sla_alta_h?: true
    sla_media_h?: true
    sla_baixa_h?: true
    mttr_alert_h?: true
    preventiva_goal?: true
    sound_alerts?: true
    push_notif?: true
    whatsapp_alerts?: true
    auto_dispatch?: true
    criado_em?: true
    atualizado?: true
  }

  export type ConfiguracaoSistemaCountAggregateInputType = {
    id?: true
    prefeitura_nome?: true
    secretaria_nome?: true
    gestor_nome?: true
    gestor_cargo?: true
    gestor_email?: true
    gestor_telefone?: true
    sla_urgente_h?: true
    sla_alta_h?: true
    sla_media_h?: true
    sla_baixa_h?: true
    mttr_alert_h?: true
    preventiva_goal?: true
    sound_alerts?: true
    push_notif?: true
    whatsapp_alerts?: true
    auto_dispatch?: true
    criado_em?: true
    atualizado?: true
    _all?: true
  }

  export type ConfiguracaoSistemaAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ConfiguracaoSistema to aggregate.
     */
    where?: ConfiguracaoSistemaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ConfiguracaoSistemas to fetch.
     */
    orderBy?: ConfiguracaoSistemaOrderByWithRelationInput | ConfiguracaoSistemaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ConfiguracaoSistemaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ConfiguracaoSistemas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ConfiguracaoSistemas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ConfiguracaoSistemas
    **/
    _count?: true | ConfiguracaoSistemaCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ConfiguracaoSistemaAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ConfiguracaoSistemaSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ConfiguracaoSistemaMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ConfiguracaoSistemaMaxAggregateInputType
  }

  export type GetConfiguracaoSistemaAggregateType<T extends ConfiguracaoSistemaAggregateArgs> = {
        [P in keyof T & keyof AggregateConfiguracaoSistema]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateConfiguracaoSistema[P]>
      : GetScalarType<T[P], AggregateConfiguracaoSistema[P]>
  }




  export type ConfiguracaoSistemaGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ConfiguracaoSistemaWhereInput
    orderBy?: ConfiguracaoSistemaOrderByWithAggregationInput | ConfiguracaoSistemaOrderByWithAggregationInput[]
    by: ConfiguracaoSistemaScalarFieldEnum[] | ConfiguracaoSistemaScalarFieldEnum
    having?: ConfiguracaoSistemaScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ConfiguracaoSistemaCountAggregateInputType | true
    _avg?: ConfiguracaoSistemaAvgAggregateInputType
    _sum?: ConfiguracaoSistemaSumAggregateInputType
    _min?: ConfiguracaoSistemaMinAggregateInputType
    _max?: ConfiguracaoSistemaMaxAggregateInputType
  }

  export type ConfiguracaoSistemaGroupByOutputType = {
    id: string
    prefeitura_nome: string
    secretaria_nome: string
    gestor_nome: string
    gestor_cargo: string
    gestor_email: string
    gestor_telefone: string
    sla_urgente_h: number
    sla_alta_h: number
    sla_media_h: number
    sla_baixa_h: number
    mttr_alert_h: number
    preventiva_goal: number
    sound_alerts: boolean
    push_notif: boolean
    whatsapp_alerts: boolean
    auto_dispatch: boolean
    criado_em: Date
    atualizado: Date
    _count: ConfiguracaoSistemaCountAggregateOutputType | null
    _avg: ConfiguracaoSistemaAvgAggregateOutputType | null
    _sum: ConfiguracaoSistemaSumAggregateOutputType | null
    _min: ConfiguracaoSistemaMinAggregateOutputType | null
    _max: ConfiguracaoSistemaMaxAggregateOutputType | null
  }

  type GetConfiguracaoSistemaGroupByPayload<T extends ConfiguracaoSistemaGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ConfiguracaoSistemaGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ConfiguracaoSistemaGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ConfiguracaoSistemaGroupByOutputType[P]>
            : GetScalarType<T[P], ConfiguracaoSistemaGroupByOutputType[P]>
        }
      >
    >


  export type ConfiguracaoSistemaSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    prefeitura_nome?: boolean
    secretaria_nome?: boolean
    gestor_nome?: boolean
    gestor_cargo?: boolean
    gestor_email?: boolean
    gestor_telefone?: boolean
    sla_urgente_h?: boolean
    sla_alta_h?: boolean
    sla_media_h?: boolean
    sla_baixa_h?: boolean
    mttr_alert_h?: boolean
    preventiva_goal?: boolean
    sound_alerts?: boolean
    push_notif?: boolean
    whatsapp_alerts?: boolean
    auto_dispatch?: boolean
    criado_em?: boolean
    atualizado?: boolean
  }, ExtArgs["result"]["configuracaoSistema"]>

  export type ConfiguracaoSistemaSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    prefeitura_nome?: boolean
    secretaria_nome?: boolean
    gestor_nome?: boolean
    gestor_cargo?: boolean
    gestor_email?: boolean
    gestor_telefone?: boolean
    sla_urgente_h?: boolean
    sla_alta_h?: boolean
    sla_media_h?: boolean
    sla_baixa_h?: boolean
    mttr_alert_h?: boolean
    preventiva_goal?: boolean
    sound_alerts?: boolean
    push_notif?: boolean
    whatsapp_alerts?: boolean
    auto_dispatch?: boolean
    criado_em?: boolean
    atualizado?: boolean
  }, ExtArgs["result"]["configuracaoSistema"]>

  export type ConfiguracaoSistemaSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    prefeitura_nome?: boolean
    secretaria_nome?: boolean
    gestor_nome?: boolean
    gestor_cargo?: boolean
    gestor_email?: boolean
    gestor_telefone?: boolean
    sla_urgente_h?: boolean
    sla_alta_h?: boolean
    sla_media_h?: boolean
    sla_baixa_h?: boolean
    mttr_alert_h?: boolean
    preventiva_goal?: boolean
    sound_alerts?: boolean
    push_notif?: boolean
    whatsapp_alerts?: boolean
    auto_dispatch?: boolean
    criado_em?: boolean
    atualizado?: boolean
  }, ExtArgs["result"]["configuracaoSistema"]>

  export type ConfiguracaoSistemaSelectScalar = {
    id?: boolean
    prefeitura_nome?: boolean
    secretaria_nome?: boolean
    gestor_nome?: boolean
    gestor_cargo?: boolean
    gestor_email?: boolean
    gestor_telefone?: boolean
    sla_urgente_h?: boolean
    sla_alta_h?: boolean
    sla_media_h?: boolean
    sla_baixa_h?: boolean
    mttr_alert_h?: boolean
    preventiva_goal?: boolean
    sound_alerts?: boolean
    push_notif?: boolean
    whatsapp_alerts?: boolean
    auto_dispatch?: boolean
    criado_em?: boolean
    atualizado?: boolean
  }

  export type ConfiguracaoSistemaOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "prefeitura_nome" | "secretaria_nome" | "gestor_nome" | "gestor_cargo" | "gestor_email" | "gestor_telefone" | "sla_urgente_h" | "sla_alta_h" | "sla_media_h" | "sla_baixa_h" | "mttr_alert_h" | "preventiva_goal" | "sound_alerts" | "push_notif" | "whatsapp_alerts" | "auto_dispatch" | "criado_em" | "atualizado", ExtArgs["result"]["configuracaoSistema"]>

  export type $ConfiguracaoSistemaPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ConfiguracaoSistema"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      prefeitura_nome: string
      secretaria_nome: string
      gestor_nome: string
      gestor_cargo: string
      gestor_email: string
      gestor_telefone: string
      sla_urgente_h: number
      sla_alta_h: number
      sla_media_h: number
      sla_baixa_h: number
      mttr_alert_h: number
      preventiva_goal: number
      sound_alerts: boolean
      push_notif: boolean
      whatsapp_alerts: boolean
      auto_dispatch: boolean
      criado_em: Date
      atualizado: Date
    }, ExtArgs["result"]["configuracaoSistema"]>
    composites: {}
  }

  type ConfiguracaoSistemaGetPayload<S extends boolean | null | undefined | ConfiguracaoSistemaDefaultArgs> = $Result.GetResult<Prisma.$ConfiguracaoSistemaPayload, S>

  type ConfiguracaoSistemaCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ConfiguracaoSistemaFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ConfiguracaoSistemaCountAggregateInputType | true
    }

  export interface ConfiguracaoSistemaDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ConfiguracaoSistema'], meta: { name: 'ConfiguracaoSistema' } }
    /**
     * Find zero or one ConfiguracaoSistema that matches the filter.
     * @param {ConfiguracaoSistemaFindUniqueArgs} args - Arguments to find a ConfiguracaoSistema
     * @example
     * // Get one ConfiguracaoSistema
     * const configuracaoSistema = await prisma.configuracaoSistema.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ConfiguracaoSistemaFindUniqueArgs>(args: SelectSubset<T, ConfiguracaoSistemaFindUniqueArgs<ExtArgs>>): Prisma__ConfiguracaoSistemaClient<$Result.GetResult<Prisma.$ConfiguracaoSistemaPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ConfiguracaoSistema that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ConfiguracaoSistemaFindUniqueOrThrowArgs} args - Arguments to find a ConfiguracaoSistema
     * @example
     * // Get one ConfiguracaoSistema
     * const configuracaoSistema = await prisma.configuracaoSistema.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ConfiguracaoSistemaFindUniqueOrThrowArgs>(args: SelectSubset<T, ConfiguracaoSistemaFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ConfiguracaoSistemaClient<$Result.GetResult<Prisma.$ConfiguracaoSistemaPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ConfiguracaoSistema that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConfiguracaoSistemaFindFirstArgs} args - Arguments to find a ConfiguracaoSistema
     * @example
     * // Get one ConfiguracaoSistema
     * const configuracaoSistema = await prisma.configuracaoSistema.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ConfiguracaoSistemaFindFirstArgs>(args?: SelectSubset<T, ConfiguracaoSistemaFindFirstArgs<ExtArgs>>): Prisma__ConfiguracaoSistemaClient<$Result.GetResult<Prisma.$ConfiguracaoSistemaPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ConfiguracaoSistema that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConfiguracaoSistemaFindFirstOrThrowArgs} args - Arguments to find a ConfiguracaoSistema
     * @example
     * // Get one ConfiguracaoSistema
     * const configuracaoSistema = await prisma.configuracaoSistema.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ConfiguracaoSistemaFindFirstOrThrowArgs>(args?: SelectSubset<T, ConfiguracaoSistemaFindFirstOrThrowArgs<ExtArgs>>): Prisma__ConfiguracaoSistemaClient<$Result.GetResult<Prisma.$ConfiguracaoSistemaPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ConfiguracaoSistemas that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConfiguracaoSistemaFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ConfiguracaoSistemas
     * const configuracaoSistemas = await prisma.configuracaoSistema.findMany()
     * 
     * // Get first 10 ConfiguracaoSistemas
     * const configuracaoSistemas = await prisma.configuracaoSistema.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const configuracaoSistemaWithIdOnly = await prisma.configuracaoSistema.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ConfiguracaoSistemaFindManyArgs>(args?: SelectSubset<T, ConfiguracaoSistemaFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ConfiguracaoSistemaPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ConfiguracaoSistema.
     * @param {ConfiguracaoSistemaCreateArgs} args - Arguments to create a ConfiguracaoSistema.
     * @example
     * // Create one ConfiguracaoSistema
     * const ConfiguracaoSistema = await prisma.configuracaoSistema.create({
     *   data: {
     *     // ... data to create a ConfiguracaoSistema
     *   }
     * })
     * 
     */
    create<T extends ConfiguracaoSistemaCreateArgs>(args: SelectSubset<T, ConfiguracaoSistemaCreateArgs<ExtArgs>>): Prisma__ConfiguracaoSistemaClient<$Result.GetResult<Prisma.$ConfiguracaoSistemaPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ConfiguracaoSistemas.
     * @param {ConfiguracaoSistemaCreateManyArgs} args - Arguments to create many ConfiguracaoSistemas.
     * @example
     * // Create many ConfiguracaoSistemas
     * const configuracaoSistema = await prisma.configuracaoSistema.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ConfiguracaoSistemaCreateManyArgs>(args?: SelectSubset<T, ConfiguracaoSistemaCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ConfiguracaoSistemas and returns the data saved in the database.
     * @param {ConfiguracaoSistemaCreateManyAndReturnArgs} args - Arguments to create many ConfiguracaoSistemas.
     * @example
     * // Create many ConfiguracaoSistemas
     * const configuracaoSistema = await prisma.configuracaoSistema.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ConfiguracaoSistemas and only return the `id`
     * const configuracaoSistemaWithIdOnly = await prisma.configuracaoSistema.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ConfiguracaoSistemaCreateManyAndReturnArgs>(args?: SelectSubset<T, ConfiguracaoSistemaCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ConfiguracaoSistemaPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a ConfiguracaoSistema.
     * @param {ConfiguracaoSistemaDeleteArgs} args - Arguments to delete one ConfiguracaoSistema.
     * @example
     * // Delete one ConfiguracaoSistema
     * const ConfiguracaoSistema = await prisma.configuracaoSistema.delete({
     *   where: {
     *     // ... filter to delete one ConfiguracaoSistema
     *   }
     * })
     * 
     */
    delete<T extends ConfiguracaoSistemaDeleteArgs>(args: SelectSubset<T, ConfiguracaoSistemaDeleteArgs<ExtArgs>>): Prisma__ConfiguracaoSistemaClient<$Result.GetResult<Prisma.$ConfiguracaoSistemaPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ConfiguracaoSistema.
     * @param {ConfiguracaoSistemaUpdateArgs} args - Arguments to update one ConfiguracaoSistema.
     * @example
     * // Update one ConfiguracaoSistema
     * const configuracaoSistema = await prisma.configuracaoSistema.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ConfiguracaoSistemaUpdateArgs>(args: SelectSubset<T, ConfiguracaoSistemaUpdateArgs<ExtArgs>>): Prisma__ConfiguracaoSistemaClient<$Result.GetResult<Prisma.$ConfiguracaoSistemaPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ConfiguracaoSistemas.
     * @param {ConfiguracaoSistemaDeleteManyArgs} args - Arguments to filter ConfiguracaoSistemas to delete.
     * @example
     * // Delete a few ConfiguracaoSistemas
     * const { count } = await prisma.configuracaoSistema.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ConfiguracaoSistemaDeleteManyArgs>(args?: SelectSubset<T, ConfiguracaoSistemaDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ConfiguracaoSistemas.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConfiguracaoSistemaUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ConfiguracaoSistemas
     * const configuracaoSistema = await prisma.configuracaoSistema.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ConfiguracaoSistemaUpdateManyArgs>(args: SelectSubset<T, ConfiguracaoSistemaUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ConfiguracaoSistemas and returns the data updated in the database.
     * @param {ConfiguracaoSistemaUpdateManyAndReturnArgs} args - Arguments to update many ConfiguracaoSistemas.
     * @example
     * // Update many ConfiguracaoSistemas
     * const configuracaoSistema = await prisma.configuracaoSistema.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more ConfiguracaoSistemas and only return the `id`
     * const configuracaoSistemaWithIdOnly = await prisma.configuracaoSistema.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ConfiguracaoSistemaUpdateManyAndReturnArgs>(args: SelectSubset<T, ConfiguracaoSistemaUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ConfiguracaoSistemaPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one ConfiguracaoSistema.
     * @param {ConfiguracaoSistemaUpsertArgs} args - Arguments to update or create a ConfiguracaoSistema.
     * @example
     * // Update or create a ConfiguracaoSistema
     * const configuracaoSistema = await prisma.configuracaoSistema.upsert({
     *   create: {
     *     // ... data to create a ConfiguracaoSistema
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ConfiguracaoSistema we want to update
     *   }
     * })
     */
    upsert<T extends ConfiguracaoSistemaUpsertArgs>(args: SelectSubset<T, ConfiguracaoSistemaUpsertArgs<ExtArgs>>): Prisma__ConfiguracaoSistemaClient<$Result.GetResult<Prisma.$ConfiguracaoSistemaPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ConfiguracaoSistemas.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConfiguracaoSistemaCountArgs} args - Arguments to filter ConfiguracaoSistemas to count.
     * @example
     * // Count the number of ConfiguracaoSistemas
     * const count = await prisma.configuracaoSistema.count({
     *   where: {
     *     // ... the filter for the ConfiguracaoSistemas we want to count
     *   }
     * })
    **/
    count<T extends ConfiguracaoSistemaCountArgs>(
      args?: Subset<T, ConfiguracaoSistemaCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ConfiguracaoSistemaCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ConfiguracaoSistema.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConfiguracaoSistemaAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ConfiguracaoSistemaAggregateArgs>(args: Subset<T, ConfiguracaoSistemaAggregateArgs>): Prisma.PrismaPromise<GetConfiguracaoSistemaAggregateType<T>>

    /**
     * Group by ConfiguracaoSistema.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConfiguracaoSistemaGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ConfiguracaoSistemaGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ConfiguracaoSistemaGroupByArgs['orderBy'] }
        : { orderBy?: ConfiguracaoSistemaGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ConfiguracaoSistemaGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetConfiguracaoSistemaGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ConfiguracaoSistema model
   */
  readonly fields: ConfiguracaoSistemaFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ConfiguracaoSistema.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ConfiguracaoSistemaClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ConfiguracaoSistema model
   */
  interface ConfiguracaoSistemaFieldRefs {
    readonly id: FieldRef<"ConfiguracaoSistema", 'String'>
    readonly prefeitura_nome: FieldRef<"ConfiguracaoSistema", 'String'>
    readonly secretaria_nome: FieldRef<"ConfiguracaoSistema", 'String'>
    readonly gestor_nome: FieldRef<"ConfiguracaoSistema", 'String'>
    readonly gestor_cargo: FieldRef<"ConfiguracaoSistema", 'String'>
    readonly gestor_email: FieldRef<"ConfiguracaoSistema", 'String'>
    readonly gestor_telefone: FieldRef<"ConfiguracaoSistema", 'String'>
    readonly sla_urgente_h: FieldRef<"ConfiguracaoSistema", 'Int'>
    readonly sla_alta_h: FieldRef<"ConfiguracaoSistema", 'Int'>
    readonly sla_media_h: FieldRef<"ConfiguracaoSistema", 'Int'>
    readonly sla_baixa_h: FieldRef<"ConfiguracaoSistema", 'Int'>
    readonly mttr_alert_h: FieldRef<"ConfiguracaoSistema", 'Int'>
    readonly preventiva_goal: FieldRef<"ConfiguracaoSistema", 'Int'>
    readonly sound_alerts: FieldRef<"ConfiguracaoSistema", 'Boolean'>
    readonly push_notif: FieldRef<"ConfiguracaoSistema", 'Boolean'>
    readonly whatsapp_alerts: FieldRef<"ConfiguracaoSistema", 'Boolean'>
    readonly auto_dispatch: FieldRef<"ConfiguracaoSistema", 'Boolean'>
    readonly criado_em: FieldRef<"ConfiguracaoSistema", 'DateTime'>
    readonly atualizado: FieldRef<"ConfiguracaoSistema", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ConfiguracaoSistema findUnique
   */
  export type ConfiguracaoSistemaFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConfiguracaoSistema
     */
    select?: ConfiguracaoSistemaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConfiguracaoSistema
     */
    omit?: ConfiguracaoSistemaOmit<ExtArgs> | null
    /**
     * Filter, which ConfiguracaoSistema to fetch.
     */
    where: ConfiguracaoSistemaWhereUniqueInput
  }

  /**
   * ConfiguracaoSistema findUniqueOrThrow
   */
  export type ConfiguracaoSistemaFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConfiguracaoSistema
     */
    select?: ConfiguracaoSistemaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConfiguracaoSistema
     */
    omit?: ConfiguracaoSistemaOmit<ExtArgs> | null
    /**
     * Filter, which ConfiguracaoSistema to fetch.
     */
    where: ConfiguracaoSistemaWhereUniqueInput
  }

  /**
   * ConfiguracaoSistema findFirst
   */
  export type ConfiguracaoSistemaFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConfiguracaoSistema
     */
    select?: ConfiguracaoSistemaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConfiguracaoSistema
     */
    omit?: ConfiguracaoSistemaOmit<ExtArgs> | null
    /**
     * Filter, which ConfiguracaoSistema to fetch.
     */
    where?: ConfiguracaoSistemaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ConfiguracaoSistemas to fetch.
     */
    orderBy?: ConfiguracaoSistemaOrderByWithRelationInput | ConfiguracaoSistemaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ConfiguracaoSistemas.
     */
    cursor?: ConfiguracaoSistemaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ConfiguracaoSistemas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ConfiguracaoSistemas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ConfiguracaoSistemas.
     */
    distinct?: ConfiguracaoSistemaScalarFieldEnum | ConfiguracaoSistemaScalarFieldEnum[]
  }

  /**
   * ConfiguracaoSistema findFirstOrThrow
   */
  export type ConfiguracaoSistemaFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConfiguracaoSistema
     */
    select?: ConfiguracaoSistemaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConfiguracaoSistema
     */
    omit?: ConfiguracaoSistemaOmit<ExtArgs> | null
    /**
     * Filter, which ConfiguracaoSistema to fetch.
     */
    where?: ConfiguracaoSistemaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ConfiguracaoSistemas to fetch.
     */
    orderBy?: ConfiguracaoSistemaOrderByWithRelationInput | ConfiguracaoSistemaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ConfiguracaoSistemas.
     */
    cursor?: ConfiguracaoSistemaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ConfiguracaoSistemas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ConfiguracaoSistemas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ConfiguracaoSistemas.
     */
    distinct?: ConfiguracaoSistemaScalarFieldEnum | ConfiguracaoSistemaScalarFieldEnum[]
  }

  /**
   * ConfiguracaoSistema findMany
   */
  export type ConfiguracaoSistemaFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConfiguracaoSistema
     */
    select?: ConfiguracaoSistemaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConfiguracaoSistema
     */
    omit?: ConfiguracaoSistemaOmit<ExtArgs> | null
    /**
     * Filter, which ConfiguracaoSistemas to fetch.
     */
    where?: ConfiguracaoSistemaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ConfiguracaoSistemas to fetch.
     */
    orderBy?: ConfiguracaoSistemaOrderByWithRelationInput | ConfiguracaoSistemaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ConfiguracaoSistemas.
     */
    cursor?: ConfiguracaoSistemaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ConfiguracaoSistemas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ConfiguracaoSistemas.
     */
    skip?: number
    distinct?: ConfiguracaoSistemaScalarFieldEnum | ConfiguracaoSistemaScalarFieldEnum[]
  }

  /**
   * ConfiguracaoSistema create
   */
  export type ConfiguracaoSistemaCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConfiguracaoSistema
     */
    select?: ConfiguracaoSistemaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConfiguracaoSistema
     */
    omit?: ConfiguracaoSistemaOmit<ExtArgs> | null
    /**
     * The data needed to create a ConfiguracaoSistema.
     */
    data: XOR<ConfiguracaoSistemaCreateInput, ConfiguracaoSistemaUncheckedCreateInput>
  }

  /**
   * ConfiguracaoSistema createMany
   */
  export type ConfiguracaoSistemaCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ConfiguracaoSistemas.
     */
    data: ConfiguracaoSistemaCreateManyInput | ConfiguracaoSistemaCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ConfiguracaoSistema createManyAndReturn
   */
  export type ConfiguracaoSistemaCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConfiguracaoSistema
     */
    select?: ConfiguracaoSistemaSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ConfiguracaoSistema
     */
    omit?: ConfiguracaoSistemaOmit<ExtArgs> | null
    /**
     * The data used to create many ConfiguracaoSistemas.
     */
    data: ConfiguracaoSistemaCreateManyInput | ConfiguracaoSistemaCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ConfiguracaoSistema update
   */
  export type ConfiguracaoSistemaUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConfiguracaoSistema
     */
    select?: ConfiguracaoSistemaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConfiguracaoSistema
     */
    omit?: ConfiguracaoSistemaOmit<ExtArgs> | null
    /**
     * The data needed to update a ConfiguracaoSistema.
     */
    data: XOR<ConfiguracaoSistemaUpdateInput, ConfiguracaoSistemaUncheckedUpdateInput>
    /**
     * Choose, which ConfiguracaoSistema to update.
     */
    where: ConfiguracaoSistemaWhereUniqueInput
  }

  /**
   * ConfiguracaoSistema updateMany
   */
  export type ConfiguracaoSistemaUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ConfiguracaoSistemas.
     */
    data: XOR<ConfiguracaoSistemaUpdateManyMutationInput, ConfiguracaoSistemaUncheckedUpdateManyInput>
    /**
     * Filter which ConfiguracaoSistemas to update
     */
    where?: ConfiguracaoSistemaWhereInput
    /**
     * Limit how many ConfiguracaoSistemas to update.
     */
    limit?: number
  }

  /**
   * ConfiguracaoSistema updateManyAndReturn
   */
  export type ConfiguracaoSistemaUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConfiguracaoSistema
     */
    select?: ConfiguracaoSistemaSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ConfiguracaoSistema
     */
    omit?: ConfiguracaoSistemaOmit<ExtArgs> | null
    /**
     * The data used to update ConfiguracaoSistemas.
     */
    data: XOR<ConfiguracaoSistemaUpdateManyMutationInput, ConfiguracaoSistemaUncheckedUpdateManyInput>
    /**
     * Filter which ConfiguracaoSistemas to update
     */
    where?: ConfiguracaoSistemaWhereInput
    /**
     * Limit how many ConfiguracaoSistemas to update.
     */
    limit?: number
  }

  /**
   * ConfiguracaoSistema upsert
   */
  export type ConfiguracaoSistemaUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConfiguracaoSistema
     */
    select?: ConfiguracaoSistemaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConfiguracaoSistema
     */
    omit?: ConfiguracaoSistemaOmit<ExtArgs> | null
    /**
     * The filter to search for the ConfiguracaoSistema to update in case it exists.
     */
    where: ConfiguracaoSistemaWhereUniqueInput
    /**
     * In case the ConfiguracaoSistema found by the `where` argument doesn't exist, create a new ConfiguracaoSistema with this data.
     */
    create: XOR<ConfiguracaoSistemaCreateInput, ConfiguracaoSistemaUncheckedCreateInput>
    /**
     * In case the ConfiguracaoSistema was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ConfiguracaoSistemaUpdateInput, ConfiguracaoSistemaUncheckedUpdateInput>
  }

  /**
   * ConfiguracaoSistema delete
   */
  export type ConfiguracaoSistemaDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConfiguracaoSistema
     */
    select?: ConfiguracaoSistemaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConfiguracaoSistema
     */
    omit?: ConfiguracaoSistemaOmit<ExtArgs> | null
    /**
     * Filter which ConfiguracaoSistema to delete.
     */
    where: ConfiguracaoSistemaWhereUniqueInput
  }

  /**
   * ConfiguracaoSistema deleteMany
   */
  export type ConfiguracaoSistemaDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ConfiguracaoSistemas to delete
     */
    where?: ConfiguracaoSistemaWhereInput
    /**
     * Limit how many ConfiguracaoSistemas to delete.
     */
    limit?: number
  }

  /**
   * ConfiguracaoSistema without action
   */
  export type ConfiguracaoSistemaDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConfiguracaoSistema
     */
    select?: ConfiguracaoSistemaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ConfiguracaoSistema
     */
    omit?: ConfiguracaoSistemaOmit<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const UsuarioScalarFieldEnum: {
    id: 'id',
    nome: 'nome',
    email: 'email',
    senha_hash: 'senha_hash',
    role: 'role',
    telefone: 'telefone',
    token_version: 'token_version',
    criado_em: 'criado_em',
    atualizado: 'atualizado'
  };

  export type UsuarioScalarFieldEnum = (typeof UsuarioScalarFieldEnum)[keyof typeof UsuarioScalarFieldEnum]


  export const PredioScalarFieldEnum: {
    id: 'id',
    nome: 'nome',
    tipo: 'tipo',
    endereco: 'endereco',
    gestor_id: 'gestor_id',
    criado_em: 'criado_em',
    atualizado: 'atualizado'
  };

  export type PredioScalarFieldEnum = (typeof PredioScalarFieldEnum)[keyof typeof PredioScalarFieldEnum]


  export const OrdemServicoScalarFieldEnum: {
    id: 'id',
    codigo: 'codigo',
    titulo: 'titulo',
    descricao: 'descricao',
    prioridade: 'prioridade',
    status: 'status',
    predio_id: 'predio_id',
    solicitante_id: 'solicitante_id',
    tecnico_atribuido_id: 'tecnico_atribuido_id',
    fotos: 'fotos',
    fotos_conclusao: 'fotos_conclusao',
    motivo_pausa: 'motivo_pausa',
    motivo_cancelamento: 'motivo_cancelamento',
    data_limite_sla: 'data_limite_sla',
    iniciado_em: 'iniciado_em',
    concluido_em: 'concluido_em',
    ordem_vinculada_id: 'ordem_vinculada_id',
    criado_em: 'criado_em',
    atualizado: 'atualizado'
  };

  export type OrdemServicoScalarFieldEnum = (typeof OrdemServicoScalarFieldEnum)[keyof typeof OrdemServicoScalarFieldEnum]


  export const AuditoriaLogScalarFieldEnum: {
    id: 'id',
    entidade_afetada: 'entidade_afetada',
    entidade_id: 'entidade_id',
    acao: 'acao',
    usuario_id: 'usuario_id',
    dados_antigos: 'dados_antigos',
    dados_novos: 'dados_novos',
    criado_em: 'criado_em'
  };

  export type AuditoriaLogScalarFieldEnum = (typeof AuditoriaLogScalarFieldEnum)[keyof typeof AuditoriaLogScalarFieldEnum]


  export const AgendaVistoriaScalarFieldEnum: {
    id: 'id',
    titulo: 'titulo',
    subtitulo: 'subtitulo',
    horario: 'horario',
    tipo: 'tipo',
    concluido: 'concluido',
    tecnico: 'tecnico',
    criado_em: 'criado_em'
  };

  export type AgendaVistoriaScalarFieldEnum = (typeof AgendaVistoriaScalarFieldEnum)[keyof typeof AgendaVistoriaScalarFieldEnum]


  export const ConfiguracaoSistemaScalarFieldEnum: {
    id: 'id',
    prefeitura_nome: 'prefeitura_nome',
    secretaria_nome: 'secretaria_nome',
    gestor_nome: 'gestor_nome',
    gestor_cargo: 'gestor_cargo',
    gestor_email: 'gestor_email',
    gestor_telefone: 'gestor_telefone',
    sla_urgente_h: 'sla_urgente_h',
    sla_alta_h: 'sla_alta_h',
    sla_media_h: 'sla_media_h',
    sla_baixa_h: 'sla_baixa_h',
    mttr_alert_h: 'mttr_alert_h',
    preventiva_goal: 'preventiva_goal',
    sound_alerts: 'sound_alerts',
    push_notif: 'push_notif',
    whatsapp_alerts: 'whatsapp_alerts',
    auto_dispatch: 'auto_dispatch',
    criado_em: 'criado_em',
    atualizado: 'atualizado'
  };

  export type ConfiguracaoSistemaScalarFieldEnum = (typeof ConfiguracaoSistemaScalarFieldEnum)[keyof typeof ConfiguracaoSistemaScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullableJsonNullValueInput: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull
  };

  export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Role'
   */
  export type EnumRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Role'>
    


  /**
   * Reference to a field of type 'Role[]'
   */
  export type ListEnumRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Role[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'TipoPredio'
   */
  export type EnumTipoPredioFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TipoPredio'>
    


  /**
   * Reference to a field of type 'TipoPredio[]'
   */
  export type ListEnumTipoPredioFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TipoPredio[]'>
    


  /**
   * Reference to a field of type 'Prioridade'
   */
  export type EnumPrioridadeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Prioridade'>
    


  /**
   * Reference to a field of type 'Prioridade[]'
   */
  export type ListEnumPrioridadeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Prioridade[]'>
    


  /**
   * Reference to a field of type 'StatusOS'
   */
  export type EnumStatusOSFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'StatusOS'>
    


  /**
   * Reference to a field of type 'StatusOS[]'
   */
  export type ListEnumStatusOSFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'StatusOS[]'>
    


  /**
   * Reference to a field of type 'AuditAction'
   */
  export type EnumAuditActionFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AuditAction'>
    


  /**
   * Reference to a field of type 'AuditAction[]'
   */
  export type ListEnumAuditActionFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AuditAction[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type UsuarioWhereInput = {
    AND?: UsuarioWhereInput | UsuarioWhereInput[]
    OR?: UsuarioWhereInput[]
    NOT?: UsuarioWhereInput | UsuarioWhereInput[]
    id?: StringFilter<"Usuario"> | string
    nome?: StringFilter<"Usuario"> | string
    email?: StringFilter<"Usuario"> | string
    senha_hash?: StringFilter<"Usuario"> | string
    role?: EnumRoleFilter<"Usuario"> | $Enums.Role
    telefone?: StringNullableFilter<"Usuario"> | string | null
    token_version?: IntFilter<"Usuario"> | number
    criado_em?: DateTimeFilter<"Usuario"> | Date | string
    atualizado?: DateTimeFilter<"Usuario"> | Date | string
    predios_geridos?: PredioListRelationFilter
    chamados_solicitados?: OrdemServicoListRelationFilter
    chamados_atribuidos?: OrdemServicoListRelationFilter
    auditorias?: AuditoriaLogListRelationFilter
  }

  export type UsuarioOrderByWithRelationInput = {
    id?: SortOrder
    nome?: SortOrder
    email?: SortOrder
    senha_hash?: SortOrder
    role?: SortOrder
    telefone?: SortOrderInput | SortOrder
    token_version?: SortOrder
    criado_em?: SortOrder
    atualizado?: SortOrder
    predios_geridos?: PredioOrderByRelationAggregateInput
    chamados_solicitados?: OrdemServicoOrderByRelationAggregateInput
    chamados_atribuidos?: OrdemServicoOrderByRelationAggregateInput
    auditorias?: AuditoriaLogOrderByRelationAggregateInput
  }

  export type UsuarioWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    AND?: UsuarioWhereInput | UsuarioWhereInput[]
    OR?: UsuarioWhereInput[]
    NOT?: UsuarioWhereInput | UsuarioWhereInput[]
    nome?: StringFilter<"Usuario"> | string
    senha_hash?: StringFilter<"Usuario"> | string
    role?: EnumRoleFilter<"Usuario"> | $Enums.Role
    telefone?: StringNullableFilter<"Usuario"> | string | null
    token_version?: IntFilter<"Usuario"> | number
    criado_em?: DateTimeFilter<"Usuario"> | Date | string
    atualizado?: DateTimeFilter<"Usuario"> | Date | string
    predios_geridos?: PredioListRelationFilter
    chamados_solicitados?: OrdemServicoListRelationFilter
    chamados_atribuidos?: OrdemServicoListRelationFilter
    auditorias?: AuditoriaLogListRelationFilter
  }, "id" | "email">

  export type UsuarioOrderByWithAggregationInput = {
    id?: SortOrder
    nome?: SortOrder
    email?: SortOrder
    senha_hash?: SortOrder
    role?: SortOrder
    telefone?: SortOrderInput | SortOrder
    token_version?: SortOrder
    criado_em?: SortOrder
    atualizado?: SortOrder
    _count?: UsuarioCountOrderByAggregateInput
    _avg?: UsuarioAvgOrderByAggregateInput
    _max?: UsuarioMaxOrderByAggregateInput
    _min?: UsuarioMinOrderByAggregateInput
    _sum?: UsuarioSumOrderByAggregateInput
  }

  export type UsuarioScalarWhereWithAggregatesInput = {
    AND?: UsuarioScalarWhereWithAggregatesInput | UsuarioScalarWhereWithAggregatesInput[]
    OR?: UsuarioScalarWhereWithAggregatesInput[]
    NOT?: UsuarioScalarWhereWithAggregatesInput | UsuarioScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Usuario"> | string
    nome?: StringWithAggregatesFilter<"Usuario"> | string
    email?: StringWithAggregatesFilter<"Usuario"> | string
    senha_hash?: StringWithAggregatesFilter<"Usuario"> | string
    role?: EnumRoleWithAggregatesFilter<"Usuario"> | $Enums.Role
    telefone?: StringNullableWithAggregatesFilter<"Usuario"> | string | null
    token_version?: IntWithAggregatesFilter<"Usuario"> | number
    criado_em?: DateTimeWithAggregatesFilter<"Usuario"> | Date | string
    atualizado?: DateTimeWithAggregatesFilter<"Usuario"> | Date | string
  }

  export type PredioWhereInput = {
    AND?: PredioWhereInput | PredioWhereInput[]
    OR?: PredioWhereInput[]
    NOT?: PredioWhereInput | PredioWhereInput[]
    id?: StringFilter<"Predio"> | string
    nome?: StringFilter<"Predio"> | string
    tipo?: EnumTipoPredioFilter<"Predio"> | $Enums.TipoPredio
    endereco?: StringFilter<"Predio"> | string
    gestor_id?: StringNullableFilter<"Predio"> | string | null
    criado_em?: DateTimeFilter<"Predio"> | Date | string
    atualizado?: DateTimeFilter<"Predio"> | Date | string
    gestor?: XOR<UsuarioNullableScalarRelationFilter, UsuarioWhereInput> | null
    ordens_servico?: OrdemServicoListRelationFilter
  }

  export type PredioOrderByWithRelationInput = {
    id?: SortOrder
    nome?: SortOrder
    tipo?: SortOrder
    endereco?: SortOrder
    gestor_id?: SortOrderInput | SortOrder
    criado_em?: SortOrder
    atualizado?: SortOrder
    gestor?: UsuarioOrderByWithRelationInput
    ordens_servico?: OrdemServicoOrderByRelationAggregateInput
  }

  export type PredioWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: PredioWhereInput | PredioWhereInput[]
    OR?: PredioWhereInput[]
    NOT?: PredioWhereInput | PredioWhereInput[]
    nome?: StringFilter<"Predio"> | string
    tipo?: EnumTipoPredioFilter<"Predio"> | $Enums.TipoPredio
    endereco?: StringFilter<"Predio"> | string
    gestor_id?: StringNullableFilter<"Predio"> | string | null
    criado_em?: DateTimeFilter<"Predio"> | Date | string
    atualizado?: DateTimeFilter<"Predio"> | Date | string
    gestor?: XOR<UsuarioNullableScalarRelationFilter, UsuarioWhereInput> | null
    ordens_servico?: OrdemServicoListRelationFilter
  }, "id">

  export type PredioOrderByWithAggregationInput = {
    id?: SortOrder
    nome?: SortOrder
    tipo?: SortOrder
    endereco?: SortOrder
    gestor_id?: SortOrderInput | SortOrder
    criado_em?: SortOrder
    atualizado?: SortOrder
    _count?: PredioCountOrderByAggregateInput
    _max?: PredioMaxOrderByAggregateInput
    _min?: PredioMinOrderByAggregateInput
  }

  export type PredioScalarWhereWithAggregatesInput = {
    AND?: PredioScalarWhereWithAggregatesInput | PredioScalarWhereWithAggregatesInput[]
    OR?: PredioScalarWhereWithAggregatesInput[]
    NOT?: PredioScalarWhereWithAggregatesInput | PredioScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Predio"> | string
    nome?: StringWithAggregatesFilter<"Predio"> | string
    tipo?: EnumTipoPredioWithAggregatesFilter<"Predio"> | $Enums.TipoPredio
    endereco?: StringWithAggregatesFilter<"Predio"> | string
    gestor_id?: StringNullableWithAggregatesFilter<"Predio"> | string | null
    criado_em?: DateTimeWithAggregatesFilter<"Predio"> | Date | string
    atualizado?: DateTimeWithAggregatesFilter<"Predio"> | Date | string
  }

  export type OrdemServicoWhereInput = {
    AND?: OrdemServicoWhereInput | OrdemServicoWhereInput[]
    OR?: OrdemServicoWhereInput[]
    NOT?: OrdemServicoWhereInput | OrdemServicoWhereInput[]
    id?: StringFilter<"OrdemServico"> | string
    codigo?: StringFilter<"OrdemServico"> | string
    titulo?: StringFilter<"OrdemServico"> | string
    descricao?: StringFilter<"OrdemServico"> | string
    prioridade?: EnumPrioridadeFilter<"OrdemServico"> | $Enums.Prioridade
    status?: EnumStatusOSFilter<"OrdemServico"> | $Enums.StatusOS
    predio_id?: StringFilter<"OrdemServico"> | string
    solicitante_id?: StringFilter<"OrdemServico"> | string
    tecnico_atribuido_id?: StringNullableFilter<"OrdemServico"> | string | null
    fotos?: StringNullableListFilter<"OrdemServico">
    fotos_conclusao?: StringNullableListFilter<"OrdemServico">
    motivo_pausa?: StringNullableFilter<"OrdemServico"> | string | null
    motivo_cancelamento?: StringNullableFilter<"OrdemServico"> | string | null
    data_limite_sla?: DateTimeNullableFilter<"OrdemServico"> | Date | string | null
    iniciado_em?: DateTimeNullableFilter<"OrdemServico"> | Date | string | null
    concluido_em?: DateTimeNullableFilter<"OrdemServico"> | Date | string | null
    ordem_vinculada_id?: StringNullableFilter<"OrdemServico"> | string | null
    criado_em?: DateTimeFilter<"OrdemServico"> | Date | string
    atualizado?: DateTimeFilter<"OrdemServico"> | Date | string
    predio?: XOR<PredioScalarRelationFilter, PredioWhereInput>
    solicitante?: XOR<UsuarioScalarRelationFilter, UsuarioWhereInput>
    tecnico?: XOR<UsuarioNullableScalarRelationFilter, UsuarioWhereInput> | null
    ordem_vinculada?: XOR<OrdemServicoNullableScalarRelationFilter, OrdemServicoWhereInput> | null
    ordens_derivadas?: OrdemServicoListRelationFilter
  }

  export type OrdemServicoOrderByWithRelationInput = {
    id?: SortOrder
    codigo?: SortOrder
    titulo?: SortOrder
    descricao?: SortOrder
    prioridade?: SortOrder
    status?: SortOrder
    predio_id?: SortOrder
    solicitante_id?: SortOrder
    tecnico_atribuido_id?: SortOrderInput | SortOrder
    fotos?: SortOrder
    fotos_conclusao?: SortOrder
    motivo_pausa?: SortOrderInput | SortOrder
    motivo_cancelamento?: SortOrderInput | SortOrder
    data_limite_sla?: SortOrderInput | SortOrder
    iniciado_em?: SortOrderInput | SortOrder
    concluido_em?: SortOrderInput | SortOrder
    ordem_vinculada_id?: SortOrderInput | SortOrder
    criado_em?: SortOrder
    atualizado?: SortOrder
    predio?: PredioOrderByWithRelationInput
    solicitante?: UsuarioOrderByWithRelationInput
    tecnico?: UsuarioOrderByWithRelationInput
    ordem_vinculada?: OrdemServicoOrderByWithRelationInput
    ordens_derivadas?: OrdemServicoOrderByRelationAggregateInput
  }

  export type OrdemServicoWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    codigo?: string
    AND?: OrdemServicoWhereInput | OrdemServicoWhereInput[]
    OR?: OrdemServicoWhereInput[]
    NOT?: OrdemServicoWhereInput | OrdemServicoWhereInput[]
    titulo?: StringFilter<"OrdemServico"> | string
    descricao?: StringFilter<"OrdemServico"> | string
    prioridade?: EnumPrioridadeFilter<"OrdemServico"> | $Enums.Prioridade
    status?: EnumStatusOSFilter<"OrdemServico"> | $Enums.StatusOS
    predio_id?: StringFilter<"OrdemServico"> | string
    solicitante_id?: StringFilter<"OrdemServico"> | string
    tecnico_atribuido_id?: StringNullableFilter<"OrdemServico"> | string | null
    fotos?: StringNullableListFilter<"OrdemServico">
    fotos_conclusao?: StringNullableListFilter<"OrdemServico">
    motivo_pausa?: StringNullableFilter<"OrdemServico"> | string | null
    motivo_cancelamento?: StringNullableFilter<"OrdemServico"> | string | null
    data_limite_sla?: DateTimeNullableFilter<"OrdemServico"> | Date | string | null
    iniciado_em?: DateTimeNullableFilter<"OrdemServico"> | Date | string | null
    concluido_em?: DateTimeNullableFilter<"OrdemServico"> | Date | string | null
    ordem_vinculada_id?: StringNullableFilter<"OrdemServico"> | string | null
    criado_em?: DateTimeFilter<"OrdemServico"> | Date | string
    atualizado?: DateTimeFilter<"OrdemServico"> | Date | string
    predio?: XOR<PredioScalarRelationFilter, PredioWhereInput>
    solicitante?: XOR<UsuarioScalarRelationFilter, UsuarioWhereInput>
    tecnico?: XOR<UsuarioNullableScalarRelationFilter, UsuarioWhereInput> | null
    ordem_vinculada?: XOR<OrdemServicoNullableScalarRelationFilter, OrdemServicoWhereInput> | null
    ordens_derivadas?: OrdemServicoListRelationFilter
  }, "id" | "codigo">

  export type OrdemServicoOrderByWithAggregationInput = {
    id?: SortOrder
    codigo?: SortOrder
    titulo?: SortOrder
    descricao?: SortOrder
    prioridade?: SortOrder
    status?: SortOrder
    predio_id?: SortOrder
    solicitante_id?: SortOrder
    tecnico_atribuido_id?: SortOrderInput | SortOrder
    fotos?: SortOrder
    fotos_conclusao?: SortOrder
    motivo_pausa?: SortOrderInput | SortOrder
    motivo_cancelamento?: SortOrderInput | SortOrder
    data_limite_sla?: SortOrderInput | SortOrder
    iniciado_em?: SortOrderInput | SortOrder
    concluido_em?: SortOrderInput | SortOrder
    ordem_vinculada_id?: SortOrderInput | SortOrder
    criado_em?: SortOrder
    atualizado?: SortOrder
    _count?: OrdemServicoCountOrderByAggregateInput
    _max?: OrdemServicoMaxOrderByAggregateInput
    _min?: OrdemServicoMinOrderByAggregateInput
  }

  export type OrdemServicoScalarWhereWithAggregatesInput = {
    AND?: OrdemServicoScalarWhereWithAggregatesInput | OrdemServicoScalarWhereWithAggregatesInput[]
    OR?: OrdemServicoScalarWhereWithAggregatesInput[]
    NOT?: OrdemServicoScalarWhereWithAggregatesInput | OrdemServicoScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"OrdemServico"> | string
    codigo?: StringWithAggregatesFilter<"OrdemServico"> | string
    titulo?: StringWithAggregatesFilter<"OrdemServico"> | string
    descricao?: StringWithAggregatesFilter<"OrdemServico"> | string
    prioridade?: EnumPrioridadeWithAggregatesFilter<"OrdemServico"> | $Enums.Prioridade
    status?: EnumStatusOSWithAggregatesFilter<"OrdemServico"> | $Enums.StatusOS
    predio_id?: StringWithAggregatesFilter<"OrdemServico"> | string
    solicitante_id?: StringWithAggregatesFilter<"OrdemServico"> | string
    tecnico_atribuido_id?: StringNullableWithAggregatesFilter<"OrdemServico"> | string | null
    fotos?: StringNullableListFilter<"OrdemServico">
    fotos_conclusao?: StringNullableListFilter<"OrdemServico">
    motivo_pausa?: StringNullableWithAggregatesFilter<"OrdemServico"> | string | null
    motivo_cancelamento?: StringNullableWithAggregatesFilter<"OrdemServico"> | string | null
    data_limite_sla?: DateTimeNullableWithAggregatesFilter<"OrdemServico"> | Date | string | null
    iniciado_em?: DateTimeNullableWithAggregatesFilter<"OrdemServico"> | Date | string | null
    concluido_em?: DateTimeNullableWithAggregatesFilter<"OrdemServico"> | Date | string | null
    ordem_vinculada_id?: StringNullableWithAggregatesFilter<"OrdemServico"> | string | null
    criado_em?: DateTimeWithAggregatesFilter<"OrdemServico"> | Date | string
    atualizado?: DateTimeWithAggregatesFilter<"OrdemServico"> | Date | string
  }

  export type AuditoriaLogWhereInput = {
    AND?: AuditoriaLogWhereInput | AuditoriaLogWhereInput[]
    OR?: AuditoriaLogWhereInput[]
    NOT?: AuditoriaLogWhereInput | AuditoriaLogWhereInput[]
    id?: StringFilter<"AuditoriaLog"> | string
    entidade_afetada?: StringFilter<"AuditoriaLog"> | string
    entidade_id?: StringFilter<"AuditoriaLog"> | string
    acao?: EnumAuditActionFilter<"AuditoriaLog"> | $Enums.AuditAction
    usuario_id?: StringFilter<"AuditoriaLog"> | string
    dados_antigos?: JsonNullableFilter<"AuditoriaLog">
    dados_novos?: JsonNullableFilter<"AuditoriaLog">
    criado_em?: DateTimeFilter<"AuditoriaLog"> | Date | string
    usuario?: XOR<UsuarioScalarRelationFilter, UsuarioWhereInput>
  }

  export type AuditoriaLogOrderByWithRelationInput = {
    id?: SortOrder
    entidade_afetada?: SortOrder
    entidade_id?: SortOrder
    acao?: SortOrder
    usuario_id?: SortOrder
    dados_antigos?: SortOrderInput | SortOrder
    dados_novos?: SortOrderInput | SortOrder
    criado_em?: SortOrder
    usuario?: UsuarioOrderByWithRelationInput
  }

  export type AuditoriaLogWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: AuditoriaLogWhereInput | AuditoriaLogWhereInput[]
    OR?: AuditoriaLogWhereInput[]
    NOT?: AuditoriaLogWhereInput | AuditoriaLogWhereInput[]
    entidade_afetada?: StringFilter<"AuditoriaLog"> | string
    entidade_id?: StringFilter<"AuditoriaLog"> | string
    acao?: EnumAuditActionFilter<"AuditoriaLog"> | $Enums.AuditAction
    usuario_id?: StringFilter<"AuditoriaLog"> | string
    dados_antigos?: JsonNullableFilter<"AuditoriaLog">
    dados_novos?: JsonNullableFilter<"AuditoriaLog">
    criado_em?: DateTimeFilter<"AuditoriaLog"> | Date | string
    usuario?: XOR<UsuarioScalarRelationFilter, UsuarioWhereInput>
  }, "id">

  export type AuditoriaLogOrderByWithAggregationInput = {
    id?: SortOrder
    entidade_afetada?: SortOrder
    entidade_id?: SortOrder
    acao?: SortOrder
    usuario_id?: SortOrder
    dados_antigos?: SortOrderInput | SortOrder
    dados_novos?: SortOrderInput | SortOrder
    criado_em?: SortOrder
    _count?: AuditoriaLogCountOrderByAggregateInput
    _max?: AuditoriaLogMaxOrderByAggregateInput
    _min?: AuditoriaLogMinOrderByAggregateInput
  }

  export type AuditoriaLogScalarWhereWithAggregatesInput = {
    AND?: AuditoriaLogScalarWhereWithAggregatesInput | AuditoriaLogScalarWhereWithAggregatesInput[]
    OR?: AuditoriaLogScalarWhereWithAggregatesInput[]
    NOT?: AuditoriaLogScalarWhereWithAggregatesInput | AuditoriaLogScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"AuditoriaLog"> | string
    entidade_afetada?: StringWithAggregatesFilter<"AuditoriaLog"> | string
    entidade_id?: StringWithAggregatesFilter<"AuditoriaLog"> | string
    acao?: EnumAuditActionWithAggregatesFilter<"AuditoriaLog"> | $Enums.AuditAction
    usuario_id?: StringWithAggregatesFilter<"AuditoriaLog"> | string
    dados_antigos?: JsonNullableWithAggregatesFilter<"AuditoriaLog">
    dados_novos?: JsonNullableWithAggregatesFilter<"AuditoriaLog">
    criado_em?: DateTimeWithAggregatesFilter<"AuditoriaLog"> | Date | string
  }

  export type AgendaVistoriaWhereInput = {
    AND?: AgendaVistoriaWhereInput | AgendaVistoriaWhereInput[]
    OR?: AgendaVistoriaWhereInput[]
    NOT?: AgendaVistoriaWhereInput | AgendaVistoriaWhereInput[]
    id?: StringFilter<"AgendaVistoria"> | string
    titulo?: StringFilter<"AgendaVistoria"> | string
    subtitulo?: StringFilter<"AgendaVistoria"> | string
    horario?: StringFilter<"AgendaVistoria"> | string
    tipo?: StringFilter<"AgendaVistoria"> | string
    concluido?: BoolFilter<"AgendaVistoria"> | boolean
    tecnico?: StringNullableFilter<"AgendaVistoria"> | string | null
    criado_em?: DateTimeFilter<"AgendaVistoria"> | Date | string
  }

  export type AgendaVistoriaOrderByWithRelationInput = {
    id?: SortOrder
    titulo?: SortOrder
    subtitulo?: SortOrder
    horario?: SortOrder
    tipo?: SortOrder
    concluido?: SortOrder
    tecnico?: SortOrderInput | SortOrder
    criado_em?: SortOrder
  }

  export type AgendaVistoriaWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: AgendaVistoriaWhereInput | AgendaVistoriaWhereInput[]
    OR?: AgendaVistoriaWhereInput[]
    NOT?: AgendaVistoriaWhereInput | AgendaVistoriaWhereInput[]
    titulo?: StringFilter<"AgendaVistoria"> | string
    subtitulo?: StringFilter<"AgendaVistoria"> | string
    horario?: StringFilter<"AgendaVistoria"> | string
    tipo?: StringFilter<"AgendaVistoria"> | string
    concluido?: BoolFilter<"AgendaVistoria"> | boolean
    tecnico?: StringNullableFilter<"AgendaVistoria"> | string | null
    criado_em?: DateTimeFilter<"AgendaVistoria"> | Date | string
  }, "id">

  export type AgendaVistoriaOrderByWithAggregationInput = {
    id?: SortOrder
    titulo?: SortOrder
    subtitulo?: SortOrder
    horario?: SortOrder
    tipo?: SortOrder
    concluido?: SortOrder
    tecnico?: SortOrderInput | SortOrder
    criado_em?: SortOrder
    _count?: AgendaVistoriaCountOrderByAggregateInput
    _max?: AgendaVistoriaMaxOrderByAggregateInput
    _min?: AgendaVistoriaMinOrderByAggregateInput
  }

  export type AgendaVistoriaScalarWhereWithAggregatesInput = {
    AND?: AgendaVistoriaScalarWhereWithAggregatesInput | AgendaVistoriaScalarWhereWithAggregatesInput[]
    OR?: AgendaVistoriaScalarWhereWithAggregatesInput[]
    NOT?: AgendaVistoriaScalarWhereWithAggregatesInput | AgendaVistoriaScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"AgendaVistoria"> | string
    titulo?: StringWithAggregatesFilter<"AgendaVistoria"> | string
    subtitulo?: StringWithAggregatesFilter<"AgendaVistoria"> | string
    horario?: StringWithAggregatesFilter<"AgendaVistoria"> | string
    tipo?: StringWithAggregatesFilter<"AgendaVistoria"> | string
    concluido?: BoolWithAggregatesFilter<"AgendaVistoria"> | boolean
    tecnico?: StringNullableWithAggregatesFilter<"AgendaVistoria"> | string | null
    criado_em?: DateTimeWithAggregatesFilter<"AgendaVistoria"> | Date | string
  }

  export type ConfiguracaoSistemaWhereInput = {
    AND?: ConfiguracaoSistemaWhereInput | ConfiguracaoSistemaWhereInput[]
    OR?: ConfiguracaoSistemaWhereInput[]
    NOT?: ConfiguracaoSistemaWhereInput | ConfiguracaoSistemaWhereInput[]
    id?: StringFilter<"ConfiguracaoSistema"> | string
    prefeitura_nome?: StringFilter<"ConfiguracaoSistema"> | string
    secretaria_nome?: StringFilter<"ConfiguracaoSistema"> | string
    gestor_nome?: StringFilter<"ConfiguracaoSistema"> | string
    gestor_cargo?: StringFilter<"ConfiguracaoSistema"> | string
    gestor_email?: StringFilter<"ConfiguracaoSistema"> | string
    gestor_telefone?: StringFilter<"ConfiguracaoSistema"> | string
    sla_urgente_h?: IntFilter<"ConfiguracaoSistema"> | number
    sla_alta_h?: IntFilter<"ConfiguracaoSistema"> | number
    sla_media_h?: IntFilter<"ConfiguracaoSistema"> | number
    sla_baixa_h?: IntFilter<"ConfiguracaoSistema"> | number
    mttr_alert_h?: IntFilter<"ConfiguracaoSistema"> | number
    preventiva_goal?: IntFilter<"ConfiguracaoSistema"> | number
    sound_alerts?: BoolFilter<"ConfiguracaoSistema"> | boolean
    push_notif?: BoolFilter<"ConfiguracaoSistema"> | boolean
    whatsapp_alerts?: BoolFilter<"ConfiguracaoSistema"> | boolean
    auto_dispatch?: BoolFilter<"ConfiguracaoSistema"> | boolean
    criado_em?: DateTimeFilter<"ConfiguracaoSistema"> | Date | string
    atualizado?: DateTimeFilter<"ConfiguracaoSistema"> | Date | string
  }

  export type ConfiguracaoSistemaOrderByWithRelationInput = {
    id?: SortOrder
    prefeitura_nome?: SortOrder
    secretaria_nome?: SortOrder
    gestor_nome?: SortOrder
    gestor_cargo?: SortOrder
    gestor_email?: SortOrder
    gestor_telefone?: SortOrder
    sla_urgente_h?: SortOrder
    sla_alta_h?: SortOrder
    sla_media_h?: SortOrder
    sla_baixa_h?: SortOrder
    mttr_alert_h?: SortOrder
    preventiva_goal?: SortOrder
    sound_alerts?: SortOrder
    push_notif?: SortOrder
    whatsapp_alerts?: SortOrder
    auto_dispatch?: SortOrder
    criado_em?: SortOrder
    atualizado?: SortOrder
  }

  export type ConfiguracaoSistemaWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ConfiguracaoSistemaWhereInput | ConfiguracaoSistemaWhereInput[]
    OR?: ConfiguracaoSistemaWhereInput[]
    NOT?: ConfiguracaoSistemaWhereInput | ConfiguracaoSistemaWhereInput[]
    prefeitura_nome?: StringFilter<"ConfiguracaoSistema"> | string
    secretaria_nome?: StringFilter<"ConfiguracaoSistema"> | string
    gestor_nome?: StringFilter<"ConfiguracaoSistema"> | string
    gestor_cargo?: StringFilter<"ConfiguracaoSistema"> | string
    gestor_email?: StringFilter<"ConfiguracaoSistema"> | string
    gestor_telefone?: StringFilter<"ConfiguracaoSistema"> | string
    sla_urgente_h?: IntFilter<"ConfiguracaoSistema"> | number
    sla_alta_h?: IntFilter<"ConfiguracaoSistema"> | number
    sla_media_h?: IntFilter<"ConfiguracaoSistema"> | number
    sla_baixa_h?: IntFilter<"ConfiguracaoSistema"> | number
    mttr_alert_h?: IntFilter<"ConfiguracaoSistema"> | number
    preventiva_goal?: IntFilter<"ConfiguracaoSistema"> | number
    sound_alerts?: BoolFilter<"ConfiguracaoSistema"> | boolean
    push_notif?: BoolFilter<"ConfiguracaoSistema"> | boolean
    whatsapp_alerts?: BoolFilter<"ConfiguracaoSistema"> | boolean
    auto_dispatch?: BoolFilter<"ConfiguracaoSistema"> | boolean
    criado_em?: DateTimeFilter<"ConfiguracaoSistema"> | Date | string
    atualizado?: DateTimeFilter<"ConfiguracaoSistema"> | Date | string
  }, "id">

  export type ConfiguracaoSistemaOrderByWithAggregationInput = {
    id?: SortOrder
    prefeitura_nome?: SortOrder
    secretaria_nome?: SortOrder
    gestor_nome?: SortOrder
    gestor_cargo?: SortOrder
    gestor_email?: SortOrder
    gestor_telefone?: SortOrder
    sla_urgente_h?: SortOrder
    sla_alta_h?: SortOrder
    sla_media_h?: SortOrder
    sla_baixa_h?: SortOrder
    mttr_alert_h?: SortOrder
    preventiva_goal?: SortOrder
    sound_alerts?: SortOrder
    push_notif?: SortOrder
    whatsapp_alerts?: SortOrder
    auto_dispatch?: SortOrder
    criado_em?: SortOrder
    atualizado?: SortOrder
    _count?: ConfiguracaoSistemaCountOrderByAggregateInput
    _avg?: ConfiguracaoSistemaAvgOrderByAggregateInput
    _max?: ConfiguracaoSistemaMaxOrderByAggregateInput
    _min?: ConfiguracaoSistemaMinOrderByAggregateInput
    _sum?: ConfiguracaoSistemaSumOrderByAggregateInput
  }

  export type ConfiguracaoSistemaScalarWhereWithAggregatesInput = {
    AND?: ConfiguracaoSistemaScalarWhereWithAggregatesInput | ConfiguracaoSistemaScalarWhereWithAggregatesInput[]
    OR?: ConfiguracaoSistemaScalarWhereWithAggregatesInput[]
    NOT?: ConfiguracaoSistemaScalarWhereWithAggregatesInput | ConfiguracaoSistemaScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ConfiguracaoSistema"> | string
    prefeitura_nome?: StringWithAggregatesFilter<"ConfiguracaoSistema"> | string
    secretaria_nome?: StringWithAggregatesFilter<"ConfiguracaoSistema"> | string
    gestor_nome?: StringWithAggregatesFilter<"ConfiguracaoSistema"> | string
    gestor_cargo?: StringWithAggregatesFilter<"ConfiguracaoSistema"> | string
    gestor_email?: StringWithAggregatesFilter<"ConfiguracaoSistema"> | string
    gestor_telefone?: StringWithAggregatesFilter<"ConfiguracaoSistema"> | string
    sla_urgente_h?: IntWithAggregatesFilter<"ConfiguracaoSistema"> | number
    sla_alta_h?: IntWithAggregatesFilter<"ConfiguracaoSistema"> | number
    sla_media_h?: IntWithAggregatesFilter<"ConfiguracaoSistema"> | number
    sla_baixa_h?: IntWithAggregatesFilter<"ConfiguracaoSistema"> | number
    mttr_alert_h?: IntWithAggregatesFilter<"ConfiguracaoSistema"> | number
    preventiva_goal?: IntWithAggregatesFilter<"ConfiguracaoSistema"> | number
    sound_alerts?: BoolWithAggregatesFilter<"ConfiguracaoSistema"> | boolean
    push_notif?: BoolWithAggregatesFilter<"ConfiguracaoSistema"> | boolean
    whatsapp_alerts?: BoolWithAggregatesFilter<"ConfiguracaoSistema"> | boolean
    auto_dispatch?: BoolWithAggregatesFilter<"ConfiguracaoSistema"> | boolean
    criado_em?: DateTimeWithAggregatesFilter<"ConfiguracaoSistema"> | Date | string
    atualizado?: DateTimeWithAggregatesFilter<"ConfiguracaoSistema"> | Date | string
  }

  export type UsuarioCreateInput = {
    id?: string
    nome: string
    email: string
    senha_hash: string
    role?: $Enums.Role
    telefone?: string | null
    token_version?: number
    criado_em?: Date | string
    atualizado?: Date | string
    predios_geridos?: PredioCreateNestedManyWithoutGestorInput
    chamados_solicitados?: OrdemServicoCreateNestedManyWithoutSolicitanteInput
    chamados_atribuidos?: OrdemServicoCreateNestedManyWithoutTecnicoInput
    auditorias?: AuditoriaLogCreateNestedManyWithoutUsuarioInput
  }

  export type UsuarioUncheckedCreateInput = {
    id?: string
    nome: string
    email: string
    senha_hash: string
    role?: $Enums.Role
    telefone?: string | null
    token_version?: number
    criado_em?: Date | string
    atualizado?: Date | string
    predios_geridos?: PredioUncheckedCreateNestedManyWithoutGestorInput
    chamados_solicitados?: OrdemServicoUncheckedCreateNestedManyWithoutSolicitanteInput
    chamados_atribuidos?: OrdemServicoUncheckedCreateNestedManyWithoutTecnicoInput
    auditorias?: AuditoriaLogUncheckedCreateNestedManyWithoutUsuarioInput
  }

  export type UsuarioUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    senha_hash?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    telefone?: NullableStringFieldUpdateOperationsInput | string | null
    token_version?: IntFieldUpdateOperationsInput | number
    criado_em?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizado?: DateTimeFieldUpdateOperationsInput | Date | string
    predios_geridos?: PredioUpdateManyWithoutGestorNestedInput
    chamados_solicitados?: OrdemServicoUpdateManyWithoutSolicitanteNestedInput
    chamados_atribuidos?: OrdemServicoUpdateManyWithoutTecnicoNestedInput
    auditorias?: AuditoriaLogUpdateManyWithoutUsuarioNestedInput
  }

  export type UsuarioUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    senha_hash?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    telefone?: NullableStringFieldUpdateOperationsInput | string | null
    token_version?: IntFieldUpdateOperationsInput | number
    criado_em?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizado?: DateTimeFieldUpdateOperationsInput | Date | string
    predios_geridos?: PredioUncheckedUpdateManyWithoutGestorNestedInput
    chamados_solicitados?: OrdemServicoUncheckedUpdateManyWithoutSolicitanteNestedInput
    chamados_atribuidos?: OrdemServicoUncheckedUpdateManyWithoutTecnicoNestedInput
    auditorias?: AuditoriaLogUncheckedUpdateManyWithoutUsuarioNestedInput
  }

  export type UsuarioCreateManyInput = {
    id?: string
    nome: string
    email: string
    senha_hash: string
    role?: $Enums.Role
    telefone?: string | null
    token_version?: number
    criado_em?: Date | string
    atualizado?: Date | string
  }

  export type UsuarioUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    senha_hash?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    telefone?: NullableStringFieldUpdateOperationsInput | string | null
    token_version?: IntFieldUpdateOperationsInput | number
    criado_em?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizado?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UsuarioUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    senha_hash?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    telefone?: NullableStringFieldUpdateOperationsInput | string | null
    token_version?: IntFieldUpdateOperationsInput | number
    criado_em?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizado?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PredioCreateInput = {
    id?: string
    nome: string
    tipo: $Enums.TipoPredio
    endereco: string
    criado_em?: Date | string
    atualizado?: Date | string
    gestor?: UsuarioCreateNestedOneWithoutPredios_geridosInput
    ordens_servico?: OrdemServicoCreateNestedManyWithoutPredioInput
  }

  export type PredioUncheckedCreateInput = {
    id?: string
    nome: string
    tipo: $Enums.TipoPredio
    endereco: string
    gestor_id?: string | null
    criado_em?: Date | string
    atualizado?: Date | string
    ordens_servico?: OrdemServicoUncheckedCreateNestedManyWithoutPredioInput
  }

  export type PredioUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    tipo?: EnumTipoPredioFieldUpdateOperationsInput | $Enums.TipoPredio
    endereco?: StringFieldUpdateOperationsInput | string
    criado_em?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizado?: DateTimeFieldUpdateOperationsInput | Date | string
    gestor?: UsuarioUpdateOneWithoutPredios_geridosNestedInput
    ordens_servico?: OrdemServicoUpdateManyWithoutPredioNestedInput
  }

  export type PredioUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    tipo?: EnumTipoPredioFieldUpdateOperationsInput | $Enums.TipoPredio
    endereco?: StringFieldUpdateOperationsInput | string
    gestor_id?: NullableStringFieldUpdateOperationsInput | string | null
    criado_em?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizado?: DateTimeFieldUpdateOperationsInput | Date | string
    ordens_servico?: OrdemServicoUncheckedUpdateManyWithoutPredioNestedInput
  }

  export type PredioCreateManyInput = {
    id?: string
    nome: string
    tipo: $Enums.TipoPredio
    endereco: string
    gestor_id?: string | null
    criado_em?: Date | string
    atualizado?: Date | string
  }

  export type PredioUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    tipo?: EnumTipoPredioFieldUpdateOperationsInput | $Enums.TipoPredio
    endereco?: StringFieldUpdateOperationsInput | string
    criado_em?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizado?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PredioUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    tipo?: EnumTipoPredioFieldUpdateOperationsInput | $Enums.TipoPredio
    endereco?: StringFieldUpdateOperationsInput | string
    gestor_id?: NullableStringFieldUpdateOperationsInput | string | null
    criado_em?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizado?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrdemServicoCreateInput = {
    id?: string
    codigo?: string
    titulo: string
    descricao: string
    prioridade?: $Enums.Prioridade
    status?: $Enums.StatusOS
    fotos?: OrdemServicoCreatefotosInput | string[]
    fotos_conclusao?: OrdemServicoCreatefotos_conclusaoInput | string[]
    motivo_pausa?: string | null
    motivo_cancelamento?: string | null
    data_limite_sla?: Date | string | null
    iniciado_em?: Date | string | null
    concluido_em?: Date | string | null
    criado_em?: Date | string
    atualizado?: Date | string
    predio: PredioCreateNestedOneWithoutOrdens_servicoInput
    solicitante: UsuarioCreateNestedOneWithoutChamados_solicitadosInput
    tecnico?: UsuarioCreateNestedOneWithoutChamados_atribuidosInput
    ordem_vinculada?: OrdemServicoCreateNestedOneWithoutOrdens_derivadasInput
    ordens_derivadas?: OrdemServicoCreateNestedManyWithoutOrdem_vinculadaInput
  }

  export type OrdemServicoUncheckedCreateInput = {
    id?: string
    codigo?: string
    titulo: string
    descricao: string
    prioridade?: $Enums.Prioridade
    status?: $Enums.StatusOS
    predio_id: string
    solicitante_id: string
    tecnico_atribuido_id?: string | null
    fotos?: OrdemServicoCreatefotosInput | string[]
    fotos_conclusao?: OrdemServicoCreatefotos_conclusaoInput | string[]
    motivo_pausa?: string | null
    motivo_cancelamento?: string | null
    data_limite_sla?: Date | string | null
    iniciado_em?: Date | string | null
    concluido_em?: Date | string | null
    ordem_vinculada_id?: string | null
    criado_em?: Date | string
    atualizado?: Date | string
    ordens_derivadas?: OrdemServicoUncheckedCreateNestedManyWithoutOrdem_vinculadaInput
  }

  export type OrdemServicoUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    titulo?: StringFieldUpdateOperationsInput | string
    descricao?: StringFieldUpdateOperationsInput | string
    prioridade?: EnumPrioridadeFieldUpdateOperationsInput | $Enums.Prioridade
    status?: EnumStatusOSFieldUpdateOperationsInput | $Enums.StatusOS
    fotos?: OrdemServicoUpdatefotosInput | string[]
    fotos_conclusao?: OrdemServicoUpdatefotos_conclusaoInput | string[]
    motivo_pausa?: NullableStringFieldUpdateOperationsInput | string | null
    motivo_cancelamento?: NullableStringFieldUpdateOperationsInput | string | null
    data_limite_sla?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    iniciado_em?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    concluido_em?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    criado_em?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizado?: DateTimeFieldUpdateOperationsInput | Date | string
    predio?: PredioUpdateOneRequiredWithoutOrdens_servicoNestedInput
    solicitante?: UsuarioUpdateOneRequiredWithoutChamados_solicitadosNestedInput
    tecnico?: UsuarioUpdateOneWithoutChamados_atribuidosNestedInput
    ordem_vinculada?: OrdemServicoUpdateOneWithoutOrdens_derivadasNestedInput
    ordens_derivadas?: OrdemServicoUpdateManyWithoutOrdem_vinculadaNestedInput
  }

  export type OrdemServicoUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    titulo?: StringFieldUpdateOperationsInput | string
    descricao?: StringFieldUpdateOperationsInput | string
    prioridade?: EnumPrioridadeFieldUpdateOperationsInput | $Enums.Prioridade
    status?: EnumStatusOSFieldUpdateOperationsInput | $Enums.StatusOS
    predio_id?: StringFieldUpdateOperationsInput | string
    solicitante_id?: StringFieldUpdateOperationsInput | string
    tecnico_atribuido_id?: NullableStringFieldUpdateOperationsInput | string | null
    fotos?: OrdemServicoUpdatefotosInput | string[]
    fotos_conclusao?: OrdemServicoUpdatefotos_conclusaoInput | string[]
    motivo_pausa?: NullableStringFieldUpdateOperationsInput | string | null
    motivo_cancelamento?: NullableStringFieldUpdateOperationsInput | string | null
    data_limite_sla?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    iniciado_em?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    concluido_em?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    ordem_vinculada_id?: NullableStringFieldUpdateOperationsInput | string | null
    criado_em?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizado?: DateTimeFieldUpdateOperationsInput | Date | string
    ordens_derivadas?: OrdemServicoUncheckedUpdateManyWithoutOrdem_vinculadaNestedInput
  }

  export type OrdemServicoCreateManyInput = {
    id?: string
    codigo?: string
    titulo: string
    descricao: string
    prioridade?: $Enums.Prioridade
    status?: $Enums.StatusOS
    predio_id: string
    solicitante_id: string
    tecnico_atribuido_id?: string | null
    fotos?: OrdemServicoCreatefotosInput | string[]
    fotos_conclusao?: OrdemServicoCreatefotos_conclusaoInput | string[]
    motivo_pausa?: string | null
    motivo_cancelamento?: string | null
    data_limite_sla?: Date | string | null
    iniciado_em?: Date | string | null
    concluido_em?: Date | string | null
    ordem_vinculada_id?: string | null
    criado_em?: Date | string
    atualizado?: Date | string
  }

  export type OrdemServicoUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    titulo?: StringFieldUpdateOperationsInput | string
    descricao?: StringFieldUpdateOperationsInput | string
    prioridade?: EnumPrioridadeFieldUpdateOperationsInput | $Enums.Prioridade
    status?: EnumStatusOSFieldUpdateOperationsInput | $Enums.StatusOS
    fotos?: OrdemServicoUpdatefotosInput | string[]
    fotos_conclusao?: OrdemServicoUpdatefotos_conclusaoInput | string[]
    motivo_pausa?: NullableStringFieldUpdateOperationsInput | string | null
    motivo_cancelamento?: NullableStringFieldUpdateOperationsInput | string | null
    data_limite_sla?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    iniciado_em?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    concluido_em?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    criado_em?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizado?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrdemServicoUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    titulo?: StringFieldUpdateOperationsInput | string
    descricao?: StringFieldUpdateOperationsInput | string
    prioridade?: EnumPrioridadeFieldUpdateOperationsInput | $Enums.Prioridade
    status?: EnumStatusOSFieldUpdateOperationsInput | $Enums.StatusOS
    predio_id?: StringFieldUpdateOperationsInput | string
    solicitante_id?: StringFieldUpdateOperationsInput | string
    tecnico_atribuido_id?: NullableStringFieldUpdateOperationsInput | string | null
    fotos?: OrdemServicoUpdatefotosInput | string[]
    fotos_conclusao?: OrdemServicoUpdatefotos_conclusaoInput | string[]
    motivo_pausa?: NullableStringFieldUpdateOperationsInput | string | null
    motivo_cancelamento?: NullableStringFieldUpdateOperationsInput | string | null
    data_limite_sla?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    iniciado_em?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    concluido_em?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    ordem_vinculada_id?: NullableStringFieldUpdateOperationsInput | string | null
    criado_em?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizado?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuditoriaLogCreateInput = {
    id?: string
    entidade_afetada: string
    entidade_id: string
    acao: $Enums.AuditAction
    dados_antigos?: NullableJsonNullValueInput | InputJsonValue
    dados_novos?: NullableJsonNullValueInput | InputJsonValue
    criado_em?: Date | string
    usuario: UsuarioCreateNestedOneWithoutAuditoriasInput
  }

  export type AuditoriaLogUncheckedCreateInput = {
    id?: string
    entidade_afetada: string
    entidade_id: string
    acao: $Enums.AuditAction
    usuario_id: string
    dados_antigos?: NullableJsonNullValueInput | InputJsonValue
    dados_novos?: NullableJsonNullValueInput | InputJsonValue
    criado_em?: Date | string
  }

  export type AuditoriaLogUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    entidade_afetada?: StringFieldUpdateOperationsInput | string
    entidade_id?: StringFieldUpdateOperationsInput | string
    acao?: EnumAuditActionFieldUpdateOperationsInput | $Enums.AuditAction
    dados_antigos?: NullableJsonNullValueInput | InputJsonValue
    dados_novos?: NullableJsonNullValueInput | InputJsonValue
    criado_em?: DateTimeFieldUpdateOperationsInput | Date | string
    usuario?: UsuarioUpdateOneRequiredWithoutAuditoriasNestedInput
  }

  export type AuditoriaLogUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    entidade_afetada?: StringFieldUpdateOperationsInput | string
    entidade_id?: StringFieldUpdateOperationsInput | string
    acao?: EnumAuditActionFieldUpdateOperationsInput | $Enums.AuditAction
    usuario_id?: StringFieldUpdateOperationsInput | string
    dados_antigos?: NullableJsonNullValueInput | InputJsonValue
    dados_novos?: NullableJsonNullValueInput | InputJsonValue
    criado_em?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuditoriaLogCreateManyInput = {
    id?: string
    entidade_afetada: string
    entidade_id: string
    acao: $Enums.AuditAction
    usuario_id: string
    dados_antigos?: NullableJsonNullValueInput | InputJsonValue
    dados_novos?: NullableJsonNullValueInput | InputJsonValue
    criado_em?: Date | string
  }

  export type AuditoriaLogUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    entidade_afetada?: StringFieldUpdateOperationsInput | string
    entidade_id?: StringFieldUpdateOperationsInput | string
    acao?: EnumAuditActionFieldUpdateOperationsInput | $Enums.AuditAction
    dados_antigos?: NullableJsonNullValueInput | InputJsonValue
    dados_novos?: NullableJsonNullValueInput | InputJsonValue
    criado_em?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuditoriaLogUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    entidade_afetada?: StringFieldUpdateOperationsInput | string
    entidade_id?: StringFieldUpdateOperationsInput | string
    acao?: EnumAuditActionFieldUpdateOperationsInput | $Enums.AuditAction
    usuario_id?: StringFieldUpdateOperationsInput | string
    dados_antigos?: NullableJsonNullValueInput | InputJsonValue
    dados_novos?: NullableJsonNullValueInput | InputJsonValue
    criado_em?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AgendaVistoriaCreateInput = {
    id?: string
    titulo: string
    subtitulo: string
    horario: string
    tipo?: string
    concluido?: boolean
    tecnico?: string | null
    criado_em?: Date | string
  }

  export type AgendaVistoriaUncheckedCreateInput = {
    id?: string
    titulo: string
    subtitulo: string
    horario: string
    tipo?: string
    concluido?: boolean
    tecnico?: string | null
    criado_em?: Date | string
  }

  export type AgendaVistoriaUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    titulo?: StringFieldUpdateOperationsInput | string
    subtitulo?: StringFieldUpdateOperationsInput | string
    horario?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    concluido?: BoolFieldUpdateOperationsInput | boolean
    tecnico?: NullableStringFieldUpdateOperationsInput | string | null
    criado_em?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AgendaVistoriaUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    titulo?: StringFieldUpdateOperationsInput | string
    subtitulo?: StringFieldUpdateOperationsInput | string
    horario?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    concluido?: BoolFieldUpdateOperationsInput | boolean
    tecnico?: NullableStringFieldUpdateOperationsInput | string | null
    criado_em?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AgendaVistoriaCreateManyInput = {
    id?: string
    titulo: string
    subtitulo: string
    horario: string
    tipo?: string
    concluido?: boolean
    tecnico?: string | null
    criado_em?: Date | string
  }

  export type AgendaVistoriaUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    titulo?: StringFieldUpdateOperationsInput | string
    subtitulo?: StringFieldUpdateOperationsInput | string
    horario?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    concluido?: BoolFieldUpdateOperationsInput | boolean
    tecnico?: NullableStringFieldUpdateOperationsInput | string | null
    criado_em?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AgendaVistoriaUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    titulo?: StringFieldUpdateOperationsInput | string
    subtitulo?: StringFieldUpdateOperationsInput | string
    horario?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    concluido?: BoolFieldUpdateOperationsInput | boolean
    tecnico?: NullableStringFieldUpdateOperationsInput | string | null
    criado_em?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ConfiguracaoSistemaCreateInput = {
    id?: string
    prefeitura_nome?: string
    secretaria_nome?: string
    gestor_nome?: string
    gestor_cargo?: string
    gestor_email?: string
    gestor_telefone?: string
    sla_urgente_h?: number
    sla_alta_h?: number
    sla_media_h?: number
    sla_baixa_h?: number
    mttr_alert_h?: number
    preventiva_goal?: number
    sound_alerts?: boolean
    push_notif?: boolean
    whatsapp_alerts?: boolean
    auto_dispatch?: boolean
    criado_em?: Date | string
    atualizado?: Date | string
  }

  export type ConfiguracaoSistemaUncheckedCreateInput = {
    id?: string
    prefeitura_nome?: string
    secretaria_nome?: string
    gestor_nome?: string
    gestor_cargo?: string
    gestor_email?: string
    gestor_telefone?: string
    sla_urgente_h?: number
    sla_alta_h?: number
    sla_media_h?: number
    sla_baixa_h?: number
    mttr_alert_h?: number
    preventiva_goal?: number
    sound_alerts?: boolean
    push_notif?: boolean
    whatsapp_alerts?: boolean
    auto_dispatch?: boolean
    criado_em?: Date | string
    atualizado?: Date | string
  }

  export type ConfiguracaoSistemaUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    prefeitura_nome?: StringFieldUpdateOperationsInput | string
    secretaria_nome?: StringFieldUpdateOperationsInput | string
    gestor_nome?: StringFieldUpdateOperationsInput | string
    gestor_cargo?: StringFieldUpdateOperationsInput | string
    gestor_email?: StringFieldUpdateOperationsInput | string
    gestor_telefone?: StringFieldUpdateOperationsInput | string
    sla_urgente_h?: IntFieldUpdateOperationsInput | number
    sla_alta_h?: IntFieldUpdateOperationsInput | number
    sla_media_h?: IntFieldUpdateOperationsInput | number
    sla_baixa_h?: IntFieldUpdateOperationsInput | number
    mttr_alert_h?: IntFieldUpdateOperationsInput | number
    preventiva_goal?: IntFieldUpdateOperationsInput | number
    sound_alerts?: BoolFieldUpdateOperationsInput | boolean
    push_notif?: BoolFieldUpdateOperationsInput | boolean
    whatsapp_alerts?: BoolFieldUpdateOperationsInput | boolean
    auto_dispatch?: BoolFieldUpdateOperationsInput | boolean
    criado_em?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizado?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ConfiguracaoSistemaUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    prefeitura_nome?: StringFieldUpdateOperationsInput | string
    secretaria_nome?: StringFieldUpdateOperationsInput | string
    gestor_nome?: StringFieldUpdateOperationsInput | string
    gestor_cargo?: StringFieldUpdateOperationsInput | string
    gestor_email?: StringFieldUpdateOperationsInput | string
    gestor_telefone?: StringFieldUpdateOperationsInput | string
    sla_urgente_h?: IntFieldUpdateOperationsInput | number
    sla_alta_h?: IntFieldUpdateOperationsInput | number
    sla_media_h?: IntFieldUpdateOperationsInput | number
    sla_baixa_h?: IntFieldUpdateOperationsInput | number
    mttr_alert_h?: IntFieldUpdateOperationsInput | number
    preventiva_goal?: IntFieldUpdateOperationsInput | number
    sound_alerts?: BoolFieldUpdateOperationsInput | boolean
    push_notif?: BoolFieldUpdateOperationsInput | boolean
    whatsapp_alerts?: BoolFieldUpdateOperationsInput | boolean
    auto_dispatch?: BoolFieldUpdateOperationsInput | boolean
    criado_em?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizado?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ConfiguracaoSistemaCreateManyInput = {
    id?: string
    prefeitura_nome?: string
    secretaria_nome?: string
    gestor_nome?: string
    gestor_cargo?: string
    gestor_email?: string
    gestor_telefone?: string
    sla_urgente_h?: number
    sla_alta_h?: number
    sla_media_h?: number
    sla_baixa_h?: number
    mttr_alert_h?: number
    preventiva_goal?: number
    sound_alerts?: boolean
    push_notif?: boolean
    whatsapp_alerts?: boolean
    auto_dispatch?: boolean
    criado_em?: Date | string
    atualizado?: Date | string
  }

  export type ConfiguracaoSistemaUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    prefeitura_nome?: StringFieldUpdateOperationsInput | string
    secretaria_nome?: StringFieldUpdateOperationsInput | string
    gestor_nome?: StringFieldUpdateOperationsInput | string
    gestor_cargo?: StringFieldUpdateOperationsInput | string
    gestor_email?: StringFieldUpdateOperationsInput | string
    gestor_telefone?: StringFieldUpdateOperationsInput | string
    sla_urgente_h?: IntFieldUpdateOperationsInput | number
    sla_alta_h?: IntFieldUpdateOperationsInput | number
    sla_media_h?: IntFieldUpdateOperationsInput | number
    sla_baixa_h?: IntFieldUpdateOperationsInput | number
    mttr_alert_h?: IntFieldUpdateOperationsInput | number
    preventiva_goal?: IntFieldUpdateOperationsInput | number
    sound_alerts?: BoolFieldUpdateOperationsInput | boolean
    push_notif?: BoolFieldUpdateOperationsInput | boolean
    whatsapp_alerts?: BoolFieldUpdateOperationsInput | boolean
    auto_dispatch?: BoolFieldUpdateOperationsInput | boolean
    criado_em?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizado?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ConfiguracaoSistemaUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    prefeitura_nome?: StringFieldUpdateOperationsInput | string
    secretaria_nome?: StringFieldUpdateOperationsInput | string
    gestor_nome?: StringFieldUpdateOperationsInput | string
    gestor_cargo?: StringFieldUpdateOperationsInput | string
    gestor_email?: StringFieldUpdateOperationsInput | string
    gestor_telefone?: StringFieldUpdateOperationsInput | string
    sla_urgente_h?: IntFieldUpdateOperationsInput | number
    sla_alta_h?: IntFieldUpdateOperationsInput | number
    sla_media_h?: IntFieldUpdateOperationsInput | number
    sla_baixa_h?: IntFieldUpdateOperationsInput | number
    mttr_alert_h?: IntFieldUpdateOperationsInput | number
    preventiva_goal?: IntFieldUpdateOperationsInput | number
    sound_alerts?: BoolFieldUpdateOperationsInput | boolean
    push_notif?: BoolFieldUpdateOperationsInput | boolean
    whatsapp_alerts?: BoolFieldUpdateOperationsInput | boolean
    auto_dispatch?: BoolFieldUpdateOperationsInput | boolean
    criado_em?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizado?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type EnumRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel>
    in?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumRoleFilter<$PrismaModel> | $Enums.Role
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type PredioListRelationFilter = {
    every?: PredioWhereInput
    some?: PredioWhereInput
    none?: PredioWhereInput
  }

  export type OrdemServicoListRelationFilter = {
    every?: OrdemServicoWhereInput
    some?: OrdemServicoWhereInput
    none?: OrdemServicoWhereInput
  }

  export type AuditoriaLogListRelationFilter = {
    every?: AuditoriaLogWhereInput
    some?: AuditoriaLogWhereInput
    none?: AuditoriaLogWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type PredioOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type OrdemServicoOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type AuditoriaLogOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UsuarioCountOrderByAggregateInput = {
    id?: SortOrder
    nome?: SortOrder
    email?: SortOrder
    senha_hash?: SortOrder
    role?: SortOrder
    telefone?: SortOrder
    token_version?: SortOrder
    criado_em?: SortOrder
    atualizado?: SortOrder
  }

  export type UsuarioAvgOrderByAggregateInput = {
    token_version?: SortOrder
  }

  export type UsuarioMaxOrderByAggregateInput = {
    id?: SortOrder
    nome?: SortOrder
    email?: SortOrder
    senha_hash?: SortOrder
    role?: SortOrder
    telefone?: SortOrder
    token_version?: SortOrder
    criado_em?: SortOrder
    atualizado?: SortOrder
  }

  export type UsuarioMinOrderByAggregateInput = {
    id?: SortOrder
    nome?: SortOrder
    email?: SortOrder
    senha_hash?: SortOrder
    role?: SortOrder
    telefone?: SortOrder
    token_version?: SortOrder
    criado_em?: SortOrder
    atualizado?: SortOrder
  }

  export type UsuarioSumOrderByAggregateInput = {
    token_version?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type EnumRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel>
    in?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumRoleWithAggregatesFilter<$PrismaModel> | $Enums.Role
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRoleFilter<$PrismaModel>
    _max?: NestedEnumRoleFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type EnumTipoPredioFilter<$PrismaModel = never> = {
    equals?: $Enums.TipoPredio | EnumTipoPredioFieldRefInput<$PrismaModel>
    in?: $Enums.TipoPredio[] | ListEnumTipoPredioFieldRefInput<$PrismaModel>
    notIn?: $Enums.TipoPredio[] | ListEnumTipoPredioFieldRefInput<$PrismaModel>
    not?: NestedEnumTipoPredioFilter<$PrismaModel> | $Enums.TipoPredio
  }

  export type UsuarioNullableScalarRelationFilter = {
    is?: UsuarioWhereInput | null
    isNot?: UsuarioWhereInput | null
  }

  export type PredioCountOrderByAggregateInput = {
    id?: SortOrder
    nome?: SortOrder
    tipo?: SortOrder
    endereco?: SortOrder
    gestor_id?: SortOrder
    criado_em?: SortOrder
    atualizado?: SortOrder
  }

  export type PredioMaxOrderByAggregateInput = {
    id?: SortOrder
    nome?: SortOrder
    tipo?: SortOrder
    endereco?: SortOrder
    gestor_id?: SortOrder
    criado_em?: SortOrder
    atualizado?: SortOrder
  }

  export type PredioMinOrderByAggregateInput = {
    id?: SortOrder
    nome?: SortOrder
    tipo?: SortOrder
    endereco?: SortOrder
    gestor_id?: SortOrder
    criado_em?: SortOrder
    atualizado?: SortOrder
  }

  export type EnumTipoPredioWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TipoPredio | EnumTipoPredioFieldRefInput<$PrismaModel>
    in?: $Enums.TipoPredio[] | ListEnumTipoPredioFieldRefInput<$PrismaModel>
    notIn?: $Enums.TipoPredio[] | ListEnumTipoPredioFieldRefInput<$PrismaModel>
    not?: NestedEnumTipoPredioWithAggregatesFilter<$PrismaModel> | $Enums.TipoPredio
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTipoPredioFilter<$PrismaModel>
    _max?: NestedEnumTipoPredioFilter<$PrismaModel>
  }

  export type EnumPrioridadeFilter<$PrismaModel = never> = {
    equals?: $Enums.Prioridade | EnumPrioridadeFieldRefInput<$PrismaModel>
    in?: $Enums.Prioridade[] | ListEnumPrioridadeFieldRefInput<$PrismaModel>
    notIn?: $Enums.Prioridade[] | ListEnumPrioridadeFieldRefInput<$PrismaModel>
    not?: NestedEnumPrioridadeFilter<$PrismaModel> | $Enums.Prioridade
  }

  export type EnumStatusOSFilter<$PrismaModel = never> = {
    equals?: $Enums.StatusOS | EnumStatusOSFieldRefInput<$PrismaModel>
    in?: $Enums.StatusOS[] | ListEnumStatusOSFieldRefInput<$PrismaModel>
    notIn?: $Enums.StatusOS[] | ListEnumStatusOSFieldRefInput<$PrismaModel>
    not?: NestedEnumStatusOSFilter<$PrismaModel> | $Enums.StatusOS
  }

  export type StringNullableListFilter<$PrismaModel = never> = {
    equals?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    has?: string | StringFieldRefInput<$PrismaModel> | null
    hasEvery?: string[] | ListStringFieldRefInput<$PrismaModel>
    hasSome?: string[] | ListStringFieldRefInput<$PrismaModel>
    isEmpty?: boolean
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type PredioScalarRelationFilter = {
    is?: PredioWhereInput
    isNot?: PredioWhereInput
  }

  export type UsuarioScalarRelationFilter = {
    is?: UsuarioWhereInput
    isNot?: UsuarioWhereInput
  }

  export type OrdemServicoNullableScalarRelationFilter = {
    is?: OrdemServicoWhereInput | null
    isNot?: OrdemServicoWhereInput | null
  }

  export type OrdemServicoCountOrderByAggregateInput = {
    id?: SortOrder
    codigo?: SortOrder
    titulo?: SortOrder
    descricao?: SortOrder
    prioridade?: SortOrder
    status?: SortOrder
    predio_id?: SortOrder
    solicitante_id?: SortOrder
    tecnico_atribuido_id?: SortOrder
    fotos?: SortOrder
    fotos_conclusao?: SortOrder
    motivo_pausa?: SortOrder
    motivo_cancelamento?: SortOrder
    data_limite_sla?: SortOrder
    iniciado_em?: SortOrder
    concluido_em?: SortOrder
    ordem_vinculada_id?: SortOrder
    criado_em?: SortOrder
    atualizado?: SortOrder
  }

  export type OrdemServicoMaxOrderByAggregateInput = {
    id?: SortOrder
    codigo?: SortOrder
    titulo?: SortOrder
    descricao?: SortOrder
    prioridade?: SortOrder
    status?: SortOrder
    predio_id?: SortOrder
    solicitante_id?: SortOrder
    tecnico_atribuido_id?: SortOrder
    motivo_pausa?: SortOrder
    motivo_cancelamento?: SortOrder
    data_limite_sla?: SortOrder
    iniciado_em?: SortOrder
    concluido_em?: SortOrder
    ordem_vinculada_id?: SortOrder
    criado_em?: SortOrder
    atualizado?: SortOrder
  }

  export type OrdemServicoMinOrderByAggregateInput = {
    id?: SortOrder
    codigo?: SortOrder
    titulo?: SortOrder
    descricao?: SortOrder
    prioridade?: SortOrder
    status?: SortOrder
    predio_id?: SortOrder
    solicitante_id?: SortOrder
    tecnico_atribuido_id?: SortOrder
    motivo_pausa?: SortOrder
    motivo_cancelamento?: SortOrder
    data_limite_sla?: SortOrder
    iniciado_em?: SortOrder
    concluido_em?: SortOrder
    ordem_vinculada_id?: SortOrder
    criado_em?: SortOrder
    atualizado?: SortOrder
  }

  export type EnumPrioridadeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Prioridade | EnumPrioridadeFieldRefInput<$PrismaModel>
    in?: $Enums.Prioridade[] | ListEnumPrioridadeFieldRefInput<$PrismaModel>
    notIn?: $Enums.Prioridade[] | ListEnumPrioridadeFieldRefInput<$PrismaModel>
    not?: NestedEnumPrioridadeWithAggregatesFilter<$PrismaModel> | $Enums.Prioridade
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumPrioridadeFilter<$PrismaModel>
    _max?: NestedEnumPrioridadeFilter<$PrismaModel>
  }

  export type EnumStatusOSWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.StatusOS | EnumStatusOSFieldRefInput<$PrismaModel>
    in?: $Enums.StatusOS[] | ListEnumStatusOSFieldRefInput<$PrismaModel>
    notIn?: $Enums.StatusOS[] | ListEnumStatusOSFieldRefInput<$PrismaModel>
    not?: NestedEnumStatusOSWithAggregatesFilter<$PrismaModel> | $Enums.StatusOS
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumStatusOSFilter<$PrismaModel>
    _max?: NestedEnumStatusOSFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type EnumAuditActionFilter<$PrismaModel = never> = {
    equals?: $Enums.AuditAction | EnumAuditActionFieldRefInput<$PrismaModel>
    in?: $Enums.AuditAction[] | ListEnumAuditActionFieldRefInput<$PrismaModel>
    notIn?: $Enums.AuditAction[] | ListEnumAuditActionFieldRefInput<$PrismaModel>
    not?: NestedEnumAuditActionFilter<$PrismaModel> | $Enums.AuditAction
  }
  export type JsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type AuditoriaLogCountOrderByAggregateInput = {
    id?: SortOrder
    entidade_afetada?: SortOrder
    entidade_id?: SortOrder
    acao?: SortOrder
    usuario_id?: SortOrder
    dados_antigos?: SortOrder
    dados_novos?: SortOrder
    criado_em?: SortOrder
  }

  export type AuditoriaLogMaxOrderByAggregateInput = {
    id?: SortOrder
    entidade_afetada?: SortOrder
    entidade_id?: SortOrder
    acao?: SortOrder
    usuario_id?: SortOrder
    criado_em?: SortOrder
  }

  export type AuditoriaLogMinOrderByAggregateInput = {
    id?: SortOrder
    entidade_afetada?: SortOrder
    entidade_id?: SortOrder
    acao?: SortOrder
    usuario_id?: SortOrder
    criado_em?: SortOrder
  }

  export type EnumAuditActionWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AuditAction | EnumAuditActionFieldRefInput<$PrismaModel>
    in?: $Enums.AuditAction[] | ListEnumAuditActionFieldRefInput<$PrismaModel>
    notIn?: $Enums.AuditAction[] | ListEnumAuditActionFieldRefInput<$PrismaModel>
    not?: NestedEnumAuditActionWithAggregatesFilter<$PrismaModel> | $Enums.AuditAction
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumAuditActionFilter<$PrismaModel>
    _max?: NestedEnumAuditActionFilter<$PrismaModel>
  }
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedJsonNullableFilter<$PrismaModel>
    _max?: NestedJsonNullableFilter<$PrismaModel>
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type AgendaVistoriaCountOrderByAggregateInput = {
    id?: SortOrder
    titulo?: SortOrder
    subtitulo?: SortOrder
    horario?: SortOrder
    tipo?: SortOrder
    concluido?: SortOrder
    tecnico?: SortOrder
    criado_em?: SortOrder
  }

  export type AgendaVistoriaMaxOrderByAggregateInput = {
    id?: SortOrder
    titulo?: SortOrder
    subtitulo?: SortOrder
    horario?: SortOrder
    tipo?: SortOrder
    concluido?: SortOrder
    tecnico?: SortOrder
    criado_em?: SortOrder
  }

  export type AgendaVistoriaMinOrderByAggregateInput = {
    id?: SortOrder
    titulo?: SortOrder
    subtitulo?: SortOrder
    horario?: SortOrder
    tipo?: SortOrder
    concluido?: SortOrder
    tecnico?: SortOrder
    criado_em?: SortOrder
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type ConfiguracaoSistemaCountOrderByAggregateInput = {
    id?: SortOrder
    prefeitura_nome?: SortOrder
    secretaria_nome?: SortOrder
    gestor_nome?: SortOrder
    gestor_cargo?: SortOrder
    gestor_email?: SortOrder
    gestor_telefone?: SortOrder
    sla_urgente_h?: SortOrder
    sla_alta_h?: SortOrder
    sla_media_h?: SortOrder
    sla_baixa_h?: SortOrder
    mttr_alert_h?: SortOrder
    preventiva_goal?: SortOrder
    sound_alerts?: SortOrder
    push_notif?: SortOrder
    whatsapp_alerts?: SortOrder
    auto_dispatch?: SortOrder
    criado_em?: SortOrder
    atualizado?: SortOrder
  }

  export type ConfiguracaoSistemaAvgOrderByAggregateInput = {
    sla_urgente_h?: SortOrder
    sla_alta_h?: SortOrder
    sla_media_h?: SortOrder
    sla_baixa_h?: SortOrder
    mttr_alert_h?: SortOrder
    preventiva_goal?: SortOrder
  }

  export type ConfiguracaoSistemaMaxOrderByAggregateInput = {
    id?: SortOrder
    prefeitura_nome?: SortOrder
    secretaria_nome?: SortOrder
    gestor_nome?: SortOrder
    gestor_cargo?: SortOrder
    gestor_email?: SortOrder
    gestor_telefone?: SortOrder
    sla_urgente_h?: SortOrder
    sla_alta_h?: SortOrder
    sla_media_h?: SortOrder
    sla_baixa_h?: SortOrder
    mttr_alert_h?: SortOrder
    preventiva_goal?: SortOrder
    sound_alerts?: SortOrder
    push_notif?: SortOrder
    whatsapp_alerts?: SortOrder
    auto_dispatch?: SortOrder
    criado_em?: SortOrder
    atualizado?: SortOrder
  }

  export type ConfiguracaoSistemaMinOrderByAggregateInput = {
    id?: SortOrder
    prefeitura_nome?: SortOrder
    secretaria_nome?: SortOrder
    gestor_nome?: SortOrder
    gestor_cargo?: SortOrder
    gestor_email?: SortOrder
    gestor_telefone?: SortOrder
    sla_urgente_h?: SortOrder
    sla_alta_h?: SortOrder
    sla_media_h?: SortOrder
    sla_baixa_h?: SortOrder
    mttr_alert_h?: SortOrder
    preventiva_goal?: SortOrder
    sound_alerts?: SortOrder
    push_notif?: SortOrder
    whatsapp_alerts?: SortOrder
    auto_dispatch?: SortOrder
    criado_em?: SortOrder
    atualizado?: SortOrder
  }

  export type ConfiguracaoSistemaSumOrderByAggregateInput = {
    sla_urgente_h?: SortOrder
    sla_alta_h?: SortOrder
    sla_media_h?: SortOrder
    sla_baixa_h?: SortOrder
    mttr_alert_h?: SortOrder
    preventiva_goal?: SortOrder
  }

  export type PredioCreateNestedManyWithoutGestorInput = {
    create?: XOR<PredioCreateWithoutGestorInput, PredioUncheckedCreateWithoutGestorInput> | PredioCreateWithoutGestorInput[] | PredioUncheckedCreateWithoutGestorInput[]
    connectOrCreate?: PredioCreateOrConnectWithoutGestorInput | PredioCreateOrConnectWithoutGestorInput[]
    createMany?: PredioCreateManyGestorInputEnvelope
    connect?: PredioWhereUniqueInput | PredioWhereUniqueInput[]
  }

  export type OrdemServicoCreateNestedManyWithoutSolicitanteInput = {
    create?: XOR<OrdemServicoCreateWithoutSolicitanteInput, OrdemServicoUncheckedCreateWithoutSolicitanteInput> | OrdemServicoCreateWithoutSolicitanteInput[] | OrdemServicoUncheckedCreateWithoutSolicitanteInput[]
    connectOrCreate?: OrdemServicoCreateOrConnectWithoutSolicitanteInput | OrdemServicoCreateOrConnectWithoutSolicitanteInput[]
    createMany?: OrdemServicoCreateManySolicitanteInputEnvelope
    connect?: OrdemServicoWhereUniqueInput | OrdemServicoWhereUniqueInput[]
  }

  export type OrdemServicoCreateNestedManyWithoutTecnicoInput = {
    create?: XOR<OrdemServicoCreateWithoutTecnicoInput, OrdemServicoUncheckedCreateWithoutTecnicoInput> | OrdemServicoCreateWithoutTecnicoInput[] | OrdemServicoUncheckedCreateWithoutTecnicoInput[]
    connectOrCreate?: OrdemServicoCreateOrConnectWithoutTecnicoInput | OrdemServicoCreateOrConnectWithoutTecnicoInput[]
    createMany?: OrdemServicoCreateManyTecnicoInputEnvelope
    connect?: OrdemServicoWhereUniqueInput | OrdemServicoWhereUniqueInput[]
  }

  export type AuditoriaLogCreateNestedManyWithoutUsuarioInput = {
    create?: XOR<AuditoriaLogCreateWithoutUsuarioInput, AuditoriaLogUncheckedCreateWithoutUsuarioInput> | AuditoriaLogCreateWithoutUsuarioInput[] | AuditoriaLogUncheckedCreateWithoutUsuarioInput[]
    connectOrCreate?: AuditoriaLogCreateOrConnectWithoutUsuarioInput | AuditoriaLogCreateOrConnectWithoutUsuarioInput[]
    createMany?: AuditoriaLogCreateManyUsuarioInputEnvelope
    connect?: AuditoriaLogWhereUniqueInput | AuditoriaLogWhereUniqueInput[]
  }

  export type PredioUncheckedCreateNestedManyWithoutGestorInput = {
    create?: XOR<PredioCreateWithoutGestorInput, PredioUncheckedCreateWithoutGestorInput> | PredioCreateWithoutGestorInput[] | PredioUncheckedCreateWithoutGestorInput[]
    connectOrCreate?: PredioCreateOrConnectWithoutGestorInput | PredioCreateOrConnectWithoutGestorInput[]
    createMany?: PredioCreateManyGestorInputEnvelope
    connect?: PredioWhereUniqueInput | PredioWhereUniqueInput[]
  }

  export type OrdemServicoUncheckedCreateNestedManyWithoutSolicitanteInput = {
    create?: XOR<OrdemServicoCreateWithoutSolicitanteInput, OrdemServicoUncheckedCreateWithoutSolicitanteInput> | OrdemServicoCreateWithoutSolicitanteInput[] | OrdemServicoUncheckedCreateWithoutSolicitanteInput[]
    connectOrCreate?: OrdemServicoCreateOrConnectWithoutSolicitanteInput | OrdemServicoCreateOrConnectWithoutSolicitanteInput[]
    createMany?: OrdemServicoCreateManySolicitanteInputEnvelope
    connect?: OrdemServicoWhereUniqueInput | OrdemServicoWhereUniqueInput[]
  }

  export type OrdemServicoUncheckedCreateNestedManyWithoutTecnicoInput = {
    create?: XOR<OrdemServicoCreateWithoutTecnicoInput, OrdemServicoUncheckedCreateWithoutTecnicoInput> | OrdemServicoCreateWithoutTecnicoInput[] | OrdemServicoUncheckedCreateWithoutTecnicoInput[]
    connectOrCreate?: OrdemServicoCreateOrConnectWithoutTecnicoInput | OrdemServicoCreateOrConnectWithoutTecnicoInput[]
    createMany?: OrdemServicoCreateManyTecnicoInputEnvelope
    connect?: OrdemServicoWhereUniqueInput | OrdemServicoWhereUniqueInput[]
  }

  export type AuditoriaLogUncheckedCreateNestedManyWithoutUsuarioInput = {
    create?: XOR<AuditoriaLogCreateWithoutUsuarioInput, AuditoriaLogUncheckedCreateWithoutUsuarioInput> | AuditoriaLogCreateWithoutUsuarioInput[] | AuditoriaLogUncheckedCreateWithoutUsuarioInput[]
    connectOrCreate?: AuditoriaLogCreateOrConnectWithoutUsuarioInput | AuditoriaLogCreateOrConnectWithoutUsuarioInput[]
    createMany?: AuditoriaLogCreateManyUsuarioInputEnvelope
    connect?: AuditoriaLogWhereUniqueInput | AuditoriaLogWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type EnumRoleFieldUpdateOperationsInput = {
    set?: $Enums.Role
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type PredioUpdateManyWithoutGestorNestedInput = {
    create?: XOR<PredioCreateWithoutGestorInput, PredioUncheckedCreateWithoutGestorInput> | PredioCreateWithoutGestorInput[] | PredioUncheckedCreateWithoutGestorInput[]
    connectOrCreate?: PredioCreateOrConnectWithoutGestorInput | PredioCreateOrConnectWithoutGestorInput[]
    upsert?: PredioUpsertWithWhereUniqueWithoutGestorInput | PredioUpsertWithWhereUniqueWithoutGestorInput[]
    createMany?: PredioCreateManyGestorInputEnvelope
    set?: PredioWhereUniqueInput | PredioWhereUniqueInput[]
    disconnect?: PredioWhereUniqueInput | PredioWhereUniqueInput[]
    delete?: PredioWhereUniqueInput | PredioWhereUniqueInput[]
    connect?: PredioWhereUniqueInput | PredioWhereUniqueInput[]
    update?: PredioUpdateWithWhereUniqueWithoutGestorInput | PredioUpdateWithWhereUniqueWithoutGestorInput[]
    updateMany?: PredioUpdateManyWithWhereWithoutGestorInput | PredioUpdateManyWithWhereWithoutGestorInput[]
    deleteMany?: PredioScalarWhereInput | PredioScalarWhereInput[]
  }

  export type OrdemServicoUpdateManyWithoutSolicitanteNestedInput = {
    create?: XOR<OrdemServicoCreateWithoutSolicitanteInput, OrdemServicoUncheckedCreateWithoutSolicitanteInput> | OrdemServicoCreateWithoutSolicitanteInput[] | OrdemServicoUncheckedCreateWithoutSolicitanteInput[]
    connectOrCreate?: OrdemServicoCreateOrConnectWithoutSolicitanteInput | OrdemServicoCreateOrConnectWithoutSolicitanteInput[]
    upsert?: OrdemServicoUpsertWithWhereUniqueWithoutSolicitanteInput | OrdemServicoUpsertWithWhereUniqueWithoutSolicitanteInput[]
    createMany?: OrdemServicoCreateManySolicitanteInputEnvelope
    set?: OrdemServicoWhereUniqueInput | OrdemServicoWhereUniqueInput[]
    disconnect?: OrdemServicoWhereUniqueInput | OrdemServicoWhereUniqueInput[]
    delete?: OrdemServicoWhereUniqueInput | OrdemServicoWhereUniqueInput[]
    connect?: OrdemServicoWhereUniqueInput | OrdemServicoWhereUniqueInput[]
    update?: OrdemServicoUpdateWithWhereUniqueWithoutSolicitanteInput | OrdemServicoUpdateWithWhereUniqueWithoutSolicitanteInput[]
    updateMany?: OrdemServicoUpdateManyWithWhereWithoutSolicitanteInput | OrdemServicoUpdateManyWithWhereWithoutSolicitanteInput[]
    deleteMany?: OrdemServicoScalarWhereInput | OrdemServicoScalarWhereInput[]
  }

  export type OrdemServicoUpdateManyWithoutTecnicoNestedInput = {
    create?: XOR<OrdemServicoCreateWithoutTecnicoInput, OrdemServicoUncheckedCreateWithoutTecnicoInput> | OrdemServicoCreateWithoutTecnicoInput[] | OrdemServicoUncheckedCreateWithoutTecnicoInput[]
    connectOrCreate?: OrdemServicoCreateOrConnectWithoutTecnicoInput | OrdemServicoCreateOrConnectWithoutTecnicoInput[]
    upsert?: OrdemServicoUpsertWithWhereUniqueWithoutTecnicoInput | OrdemServicoUpsertWithWhereUniqueWithoutTecnicoInput[]
    createMany?: OrdemServicoCreateManyTecnicoInputEnvelope
    set?: OrdemServicoWhereUniqueInput | OrdemServicoWhereUniqueInput[]
    disconnect?: OrdemServicoWhereUniqueInput | OrdemServicoWhereUniqueInput[]
    delete?: OrdemServicoWhereUniqueInput | OrdemServicoWhereUniqueInput[]
    connect?: OrdemServicoWhereUniqueInput | OrdemServicoWhereUniqueInput[]
    update?: OrdemServicoUpdateWithWhereUniqueWithoutTecnicoInput | OrdemServicoUpdateWithWhereUniqueWithoutTecnicoInput[]
    updateMany?: OrdemServicoUpdateManyWithWhereWithoutTecnicoInput | OrdemServicoUpdateManyWithWhereWithoutTecnicoInput[]
    deleteMany?: OrdemServicoScalarWhereInput | OrdemServicoScalarWhereInput[]
  }

  export type AuditoriaLogUpdateManyWithoutUsuarioNestedInput = {
    create?: XOR<AuditoriaLogCreateWithoutUsuarioInput, AuditoriaLogUncheckedCreateWithoutUsuarioInput> | AuditoriaLogCreateWithoutUsuarioInput[] | AuditoriaLogUncheckedCreateWithoutUsuarioInput[]
    connectOrCreate?: AuditoriaLogCreateOrConnectWithoutUsuarioInput | AuditoriaLogCreateOrConnectWithoutUsuarioInput[]
    upsert?: AuditoriaLogUpsertWithWhereUniqueWithoutUsuarioInput | AuditoriaLogUpsertWithWhereUniqueWithoutUsuarioInput[]
    createMany?: AuditoriaLogCreateManyUsuarioInputEnvelope
    set?: AuditoriaLogWhereUniqueInput | AuditoriaLogWhereUniqueInput[]
    disconnect?: AuditoriaLogWhereUniqueInput | AuditoriaLogWhereUniqueInput[]
    delete?: AuditoriaLogWhereUniqueInput | AuditoriaLogWhereUniqueInput[]
    connect?: AuditoriaLogWhereUniqueInput | AuditoriaLogWhereUniqueInput[]
    update?: AuditoriaLogUpdateWithWhereUniqueWithoutUsuarioInput | AuditoriaLogUpdateWithWhereUniqueWithoutUsuarioInput[]
    updateMany?: AuditoriaLogUpdateManyWithWhereWithoutUsuarioInput | AuditoriaLogUpdateManyWithWhereWithoutUsuarioInput[]
    deleteMany?: AuditoriaLogScalarWhereInput | AuditoriaLogScalarWhereInput[]
  }

  export type PredioUncheckedUpdateManyWithoutGestorNestedInput = {
    create?: XOR<PredioCreateWithoutGestorInput, PredioUncheckedCreateWithoutGestorInput> | PredioCreateWithoutGestorInput[] | PredioUncheckedCreateWithoutGestorInput[]
    connectOrCreate?: PredioCreateOrConnectWithoutGestorInput | PredioCreateOrConnectWithoutGestorInput[]
    upsert?: PredioUpsertWithWhereUniqueWithoutGestorInput | PredioUpsertWithWhereUniqueWithoutGestorInput[]
    createMany?: PredioCreateManyGestorInputEnvelope
    set?: PredioWhereUniqueInput | PredioWhereUniqueInput[]
    disconnect?: PredioWhereUniqueInput | PredioWhereUniqueInput[]
    delete?: PredioWhereUniqueInput | PredioWhereUniqueInput[]
    connect?: PredioWhereUniqueInput | PredioWhereUniqueInput[]
    update?: PredioUpdateWithWhereUniqueWithoutGestorInput | PredioUpdateWithWhereUniqueWithoutGestorInput[]
    updateMany?: PredioUpdateManyWithWhereWithoutGestorInput | PredioUpdateManyWithWhereWithoutGestorInput[]
    deleteMany?: PredioScalarWhereInput | PredioScalarWhereInput[]
  }

  export type OrdemServicoUncheckedUpdateManyWithoutSolicitanteNestedInput = {
    create?: XOR<OrdemServicoCreateWithoutSolicitanteInput, OrdemServicoUncheckedCreateWithoutSolicitanteInput> | OrdemServicoCreateWithoutSolicitanteInput[] | OrdemServicoUncheckedCreateWithoutSolicitanteInput[]
    connectOrCreate?: OrdemServicoCreateOrConnectWithoutSolicitanteInput | OrdemServicoCreateOrConnectWithoutSolicitanteInput[]
    upsert?: OrdemServicoUpsertWithWhereUniqueWithoutSolicitanteInput | OrdemServicoUpsertWithWhereUniqueWithoutSolicitanteInput[]
    createMany?: OrdemServicoCreateManySolicitanteInputEnvelope
    set?: OrdemServicoWhereUniqueInput | OrdemServicoWhereUniqueInput[]
    disconnect?: OrdemServicoWhereUniqueInput | OrdemServicoWhereUniqueInput[]
    delete?: OrdemServicoWhereUniqueInput | OrdemServicoWhereUniqueInput[]
    connect?: OrdemServicoWhereUniqueInput | OrdemServicoWhereUniqueInput[]
    update?: OrdemServicoUpdateWithWhereUniqueWithoutSolicitanteInput | OrdemServicoUpdateWithWhereUniqueWithoutSolicitanteInput[]
    updateMany?: OrdemServicoUpdateManyWithWhereWithoutSolicitanteInput | OrdemServicoUpdateManyWithWhereWithoutSolicitanteInput[]
    deleteMany?: OrdemServicoScalarWhereInput | OrdemServicoScalarWhereInput[]
  }

  export type OrdemServicoUncheckedUpdateManyWithoutTecnicoNestedInput = {
    create?: XOR<OrdemServicoCreateWithoutTecnicoInput, OrdemServicoUncheckedCreateWithoutTecnicoInput> | OrdemServicoCreateWithoutTecnicoInput[] | OrdemServicoUncheckedCreateWithoutTecnicoInput[]
    connectOrCreate?: OrdemServicoCreateOrConnectWithoutTecnicoInput | OrdemServicoCreateOrConnectWithoutTecnicoInput[]
    upsert?: OrdemServicoUpsertWithWhereUniqueWithoutTecnicoInput | OrdemServicoUpsertWithWhereUniqueWithoutTecnicoInput[]
    createMany?: OrdemServicoCreateManyTecnicoInputEnvelope
    set?: OrdemServicoWhereUniqueInput | OrdemServicoWhereUniqueInput[]
    disconnect?: OrdemServicoWhereUniqueInput | OrdemServicoWhereUniqueInput[]
    delete?: OrdemServicoWhereUniqueInput | OrdemServicoWhereUniqueInput[]
    connect?: OrdemServicoWhereUniqueInput | OrdemServicoWhereUniqueInput[]
    update?: OrdemServicoUpdateWithWhereUniqueWithoutTecnicoInput | OrdemServicoUpdateWithWhereUniqueWithoutTecnicoInput[]
    updateMany?: OrdemServicoUpdateManyWithWhereWithoutTecnicoInput | OrdemServicoUpdateManyWithWhereWithoutTecnicoInput[]
    deleteMany?: OrdemServicoScalarWhereInput | OrdemServicoScalarWhereInput[]
  }

  export type AuditoriaLogUncheckedUpdateManyWithoutUsuarioNestedInput = {
    create?: XOR<AuditoriaLogCreateWithoutUsuarioInput, AuditoriaLogUncheckedCreateWithoutUsuarioInput> | AuditoriaLogCreateWithoutUsuarioInput[] | AuditoriaLogUncheckedCreateWithoutUsuarioInput[]
    connectOrCreate?: AuditoriaLogCreateOrConnectWithoutUsuarioInput | AuditoriaLogCreateOrConnectWithoutUsuarioInput[]
    upsert?: AuditoriaLogUpsertWithWhereUniqueWithoutUsuarioInput | AuditoriaLogUpsertWithWhereUniqueWithoutUsuarioInput[]
    createMany?: AuditoriaLogCreateManyUsuarioInputEnvelope
    set?: AuditoriaLogWhereUniqueInput | AuditoriaLogWhereUniqueInput[]
    disconnect?: AuditoriaLogWhereUniqueInput | AuditoriaLogWhereUniqueInput[]
    delete?: AuditoriaLogWhereUniqueInput | AuditoriaLogWhereUniqueInput[]
    connect?: AuditoriaLogWhereUniqueInput | AuditoriaLogWhereUniqueInput[]
    update?: AuditoriaLogUpdateWithWhereUniqueWithoutUsuarioInput | AuditoriaLogUpdateWithWhereUniqueWithoutUsuarioInput[]
    updateMany?: AuditoriaLogUpdateManyWithWhereWithoutUsuarioInput | AuditoriaLogUpdateManyWithWhereWithoutUsuarioInput[]
    deleteMany?: AuditoriaLogScalarWhereInput | AuditoriaLogScalarWhereInput[]
  }

  export type UsuarioCreateNestedOneWithoutPredios_geridosInput = {
    create?: XOR<UsuarioCreateWithoutPredios_geridosInput, UsuarioUncheckedCreateWithoutPredios_geridosInput>
    connectOrCreate?: UsuarioCreateOrConnectWithoutPredios_geridosInput
    connect?: UsuarioWhereUniqueInput
  }

  export type OrdemServicoCreateNestedManyWithoutPredioInput = {
    create?: XOR<OrdemServicoCreateWithoutPredioInput, OrdemServicoUncheckedCreateWithoutPredioInput> | OrdemServicoCreateWithoutPredioInput[] | OrdemServicoUncheckedCreateWithoutPredioInput[]
    connectOrCreate?: OrdemServicoCreateOrConnectWithoutPredioInput | OrdemServicoCreateOrConnectWithoutPredioInput[]
    createMany?: OrdemServicoCreateManyPredioInputEnvelope
    connect?: OrdemServicoWhereUniqueInput | OrdemServicoWhereUniqueInput[]
  }

  export type OrdemServicoUncheckedCreateNestedManyWithoutPredioInput = {
    create?: XOR<OrdemServicoCreateWithoutPredioInput, OrdemServicoUncheckedCreateWithoutPredioInput> | OrdemServicoCreateWithoutPredioInput[] | OrdemServicoUncheckedCreateWithoutPredioInput[]
    connectOrCreate?: OrdemServicoCreateOrConnectWithoutPredioInput | OrdemServicoCreateOrConnectWithoutPredioInput[]
    createMany?: OrdemServicoCreateManyPredioInputEnvelope
    connect?: OrdemServicoWhereUniqueInput | OrdemServicoWhereUniqueInput[]
  }

  export type EnumTipoPredioFieldUpdateOperationsInput = {
    set?: $Enums.TipoPredio
  }

  export type UsuarioUpdateOneWithoutPredios_geridosNestedInput = {
    create?: XOR<UsuarioCreateWithoutPredios_geridosInput, UsuarioUncheckedCreateWithoutPredios_geridosInput>
    connectOrCreate?: UsuarioCreateOrConnectWithoutPredios_geridosInput
    upsert?: UsuarioUpsertWithoutPredios_geridosInput
    disconnect?: UsuarioWhereInput | boolean
    delete?: UsuarioWhereInput | boolean
    connect?: UsuarioWhereUniqueInput
    update?: XOR<XOR<UsuarioUpdateToOneWithWhereWithoutPredios_geridosInput, UsuarioUpdateWithoutPredios_geridosInput>, UsuarioUncheckedUpdateWithoutPredios_geridosInput>
  }

  export type OrdemServicoUpdateManyWithoutPredioNestedInput = {
    create?: XOR<OrdemServicoCreateWithoutPredioInput, OrdemServicoUncheckedCreateWithoutPredioInput> | OrdemServicoCreateWithoutPredioInput[] | OrdemServicoUncheckedCreateWithoutPredioInput[]
    connectOrCreate?: OrdemServicoCreateOrConnectWithoutPredioInput | OrdemServicoCreateOrConnectWithoutPredioInput[]
    upsert?: OrdemServicoUpsertWithWhereUniqueWithoutPredioInput | OrdemServicoUpsertWithWhereUniqueWithoutPredioInput[]
    createMany?: OrdemServicoCreateManyPredioInputEnvelope
    set?: OrdemServicoWhereUniqueInput | OrdemServicoWhereUniqueInput[]
    disconnect?: OrdemServicoWhereUniqueInput | OrdemServicoWhereUniqueInput[]
    delete?: OrdemServicoWhereUniqueInput | OrdemServicoWhereUniqueInput[]
    connect?: OrdemServicoWhereUniqueInput | OrdemServicoWhereUniqueInput[]
    update?: OrdemServicoUpdateWithWhereUniqueWithoutPredioInput | OrdemServicoUpdateWithWhereUniqueWithoutPredioInput[]
    updateMany?: OrdemServicoUpdateManyWithWhereWithoutPredioInput | OrdemServicoUpdateManyWithWhereWithoutPredioInput[]
    deleteMany?: OrdemServicoScalarWhereInput | OrdemServicoScalarWhereInput[]
  }

  export type OrdemServicoUncheckedUpdateManyWithoutPredioNestedInput = {
    create?: XOR<OrdemServicoCreateWithoutPredioInput, OrdemServicoUncheckedCreateWithoutPredioInput> | OrdemServicoCreateWithoutPredioInput[] | OrdemServicoUncheckedCreateWithoutPredioInput[]
    connectOrCreate?: OrdemServicoCreateOrConnectWithoutPredioInput | OrdemServicoCreateOrConnectWithoutPredioInput[]
    upsert?: OrdemServicoUpsertWithWhereUniqueWithoutPredioInput | OrdemServicoUpsertWithWhereUniqueWithoutPredioInput[]
    createMany?: OrdemServicoCreateManyPredioInputEnvelope
    set?: OrdemServicoWhereUniqueInput | OrdemServicoWhereUniqueInput[]
    disconnect?: OrdemServicoWhereUniqueInput | OrdemServicoWhereUniqueInput[]
    delete?: OrdemServicoWhereUniqueInput | OrdemServicoWhereUniqueInput[]
    connect?: OrdemServicoWhereUniqueInput | OrdemServicoWhereUniqueInput[]
    update?: OrdemServicoUpdateWithWhereUniqueWithoutPredioInput | OrdemServicoUpdateWithWhereUniqueWithoutPredioInput[]
    updateMany?: OrdemServicoUpdateManyWithWhereWithoutPredioInput | OrdemServicoUpdateManyWithWhereWithoutPredioInput[]
    deleteMany?: OrdemServicoScalarWhereInput | OrdemServicoScalarWhereInput[]
  }

  export type OrdemServicoCreatefotosInput = {
    set: string[]
  }

  export type OrdemServicoCreatefotos_conclusaoInput = {
    set: string[]
  }

  export type PredioCreateNestedOneWithoutOrdens_servicoInput = {
    create?: XOR<PredioCreateWithoutOrdens_servicoInput, PredioUncheckedCreateWithoutOrdens_servicoInput>
    connectOrCreate?: PredioCreateOrConnectWithoutOrdens_servicoInput
    connect?: PredioWhereUniqueInput
  }

  export type UsuarioCreateNestedOneWithoutChamados_solicitadosInput = {
    create?: XOR<UsuarioCreateWithoutChamados_solicitadosInput, UsuarioUncheckedCreateWithoutChamados_solicitadosInput>
    connectOrCreate?: UsuarioCreateOrConnectWithoutChamados_solicitadosInput
    connect?: UsuarioWhereUniqueInput
  }

  export type UsuarioCreateNestedOneWithoutChamados_atribuidosInput = {
    create?: XOR<UsuarioCreateWithoutChamados_atribuidosInput, UsuarioUncheckedCreateWithoutChamados_atribuidosInput>
    connectOrCreate?: UsuarioCreateOrConnectWithoutChamados_atribuidosInput
    connect?: UsuarioWhereUniqueInput
  }

  export type OrdemServicoCreateNestedOneWithoutOrdens_derivadasInput = {
    create?: XOR<OrdemServicoCreateWithoutOrdens_derivadasInput, OrdemServicoUncheckedCreateWithoutOrdens_derivadasInput>
    connectOrCreate?: OrdemServicoCreateOrConnectWithoutOrdens_derivadasInput
    connect?: OrdemServicoWhereUniqueInput
  }

  export type OrdemServicoCreateNestedManyWithoutOrdem_vinculadaInput = {
    create?: XOR<OrdemServicoCreateWithoutOrdem_vinculadaInput, OrdemServicoUncheckedCreateWithoutOrdem_vinculadaInput> | OrdemServicoCreateWithoutOrdem_vinculadaInput[] | OrdemServicoUncheckedCreateWithoutOrdem_vinculadaInput[]
    connectOrCreate?: OrdemServicoCreateOrConnectWithoutOrdem_vinculadaInput | OrdemServicoCreateOrConnectWithoutOrdem_vinculadaInput[]
    createMany?: OrdemServicoCreateManyOrdem_vinculadaInputEnvelope
    connect?: OrdemServicoWhereUniqueInput | OrdemServicoWhereUniqueInput[]
  }

  export type OrdemServicoUncheckedCreateNestedManyWithoutOrdem_vinculadaInput = {
    create?: XOR<OrdemServicoCreateWithoutOrdem_vinculadaInput, OrdemServicoUncheckedCreateWithoutOrdem_vinculadaInput> | OrdemServicoCreateWithoutOrdem_vinculadaInput[] | OrdemServicoUncheckedCreateWithoutOrdem_vinculadaInput[]
    connectOrCreate?: OrdemServicoCreateOrConnectWithoutOrdem_vinculadaInput | OrdemServicoCreateOrConnectWithoutOrdem_vinculadaInput[]
    createMany?: OrdemServicoCreateManyOrdem_vinculadaInputEnvelope
    connect?: OrdemServicoWhereUniqueInput | OrdemServicoWhereUniqueInput[]
  }

  export type EnumPrioridadeFieldUpdateOperationsInput = {
    set?: $Enums.Prioridade
  }

  export type EnumStatusOSFieldUpdateOperationsInput = {
    set?: $Enums.StatusOS
  }

  export type OrdemServicoUpdatefotosInput = {
    set?: string[]
    push?: string | string[]
  }

  export type OrdemServicoUpdatefotos_conclusaoInput = {
    set?: string[]
    push?: string | string[]
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type PredioUpdateOneRequiredWithoutOrdens_servicoNestedInput = {
    create?: XOR<PredioCreateWithoutOrdens_servicoInput, PredioUncheckedCreateWithoutOrdens_servicoInput>
    connectOrCreate?: PredioCreateOrConnectWithoutOrdens_servicoInput
    upsert?: PredioUpsertWithoutOrdens_servicoInput
    connect?: PredioWhereUniqueInput
    update?: XOR<XOR<PredioUpdateToOneWithWhereWithoutOrdens_servicoInput, PredioUpdateWithoutOrdens_servicoInput>, PredioUncheckedUpdateWithoutOrdens_servicoInput>
  }

  export type UsuarioUpdateOneRequiredWithoutChamados_solicitadosNestedInput = {
    create?: XOR<UsuarioCreateWithoutChamados_solicitadosInput, UsuarioUncheckedCreateWithoutChamados_solicitadosInput>
    connectOrCreate?: UsuarioCreateOrConnectWithoutChamados_solicitadosInput
    upsert?: UsuarioUpsertWithoutChamados_solicitadosInput
    connect?: UsuarioWhereUniqueInput
    update?: XOR<XOR<UsuarioUpdateToOneWithWhereWithoutChamados_solicitadosInput, UsuarioUpdateWithoutChamados_solicitadosInput>, UsuarioUncheckedUpdateWithoutChamados_solicitadosInput>
  }

  export type UsuarioUpdateOneWithoutChamados_atribuidosNestedInput = {
    create?: XOR<UsuarioCreateWithoutChamados_atribuidosInput, UsuarioUncheckedCreateWithoutChamados_atribuidosInput>
    connectOrCreate?: UsuarioCreateOrConnectWithoutChamados_atribuidosInput
    upsert?: UsuarioUpsertWithoutChamados_atribuidosInput
    disconnect?: UsuarioWhereInput | boolean
    delete?: UsuarioWhereInput | boolean
    connect?: UsuarioWhereUniqueInput
    update?: XOR<XOR<UsuarioUpdateToOneWithWhereWithoutChamados_atribuidosInput, UsuarioUpdateWithoutChamados_atribuidosInput>, UsuarioUncheckedUpdateWithoutChamados_atribuidosInput>
  }

  export type OrdemServicoUpdateOneWithoutOrdens_derivadasNestedInput = {
    create?: XOR<OrdemServicoCreateWithoutOrdens_derivadasInput, OrdemServicoUncheckedCreateWithoutOrdens_derivadasInput>
    connectOrCreate?: OrdemServicoCreateOrConnectWithoutOrdens_derivadasInput
    upsert?: OrdemServicoUpsertWithoutOrdens_derivadasInput
    disconnect?: OrdemServicoWhereInput | boolean
    delete?: OrdemServicoWhereInput | boolean
    connect?: OrdemServicoWhereUniqueInput
    update?: XOR<XOR<OrdemServicoUpdateToOneWithWhereWithoutOrdens_derivadasInput, OrdemServicoUpdateWithoutOrdens_derivadasInput>, OrdemServicoUncheckedUpdateWithoutOrdens_derivadasInput>
  }

  export type OrdemServicoUpdateManyWithoutOrdem_vinculadaNestedInput = {
    create?: XOR<OrdemServicoCreateWithoutOrdem_vinculadaInput, OrdemServicoUncheckedCreateWithoutOrdem_vinculadaInput> | OrdemServicoCreateWithoutOrdem_vinculadaInput[] | OrdemServicoUncheckedCreateWithoutOrdem_vinculadaInput[]
    connectOrCreate?: OrdemServicoCreateOrConnectWithoutOrdem_vinculadaInput | OrdemServicoCreateOrConnectWithoutOrdem_vinculadaInput[]
    upsert?: OrdemServicoUpsertWithWhereUniqueWithoutOrdem_vinculadaInput | OrdemServicoUpsertWithWhereUniqueWithoutOrdem_vinculadaInput[]
    createMany?: OrdemServicoCreateManyOrdem_vinculadaInputEnvelope
    set?: OrdemServicoWhereUniqueInput | OrdemServicoWhereUniqueInput[]
    disconnect?: OrdemServicoWhereUniqueInput | OrdemServicoWhereUniqueInput[]
    delete?: OrdemServicoWhereUniqueInput | OrdemServicoWhereUniqueInput[]
    connect?: OrdemServicoWhereUniqueInput | OrdemServicoWhereUniqueInput[]
    update?: OrdemServicoUpdateWithWhereUniqueWithoutOrdem_vinculadaInput | OrdemServicoUpdateWithWhereUniqueWithoutOrdem_vinculadaInput[]
    updateMany?: OrdemServicoUpdateManyWithWhereWithoutOrdem_vinculadaInput | OrdemServicoUpdateManyWithWhereWithoutOrdem_vinculadaInput[]
    deleteMany?: OrdemServicoScalarWhereInput | OrdemServicoScalarWhereInput[]
  }

  export type OrdemServicoUncheckedUpdateManyWithoutOrdem_vinculadaNestedInput = {
    create?: XOR<OrdemServicoCreateWithoutOrdem_vinculadaInput, OrdemServicoUncheckedCreateWithoutOrdem_vinculadaInput> | OrdemServicoCreateWithoutOrdem_vinculadaInput[] | OrdemServicoUncheckedCreateWithoutOrdem_vinculadaInput[]
    connectOrCreate?: OrdemServicoCreateOrConnectWithoutOrdem_vinculadaInput | OrdemServicoCreateOrConnectWithoutOrdem_vinculadaInput[]
    upsert?: OrdemServicoUpsertWithWhereUniqueWithoutOrdem_vinculadaInput | OrdemServicoUpsertWithWhereUniqueWithoutOrdem_vinculadaInput[]
    createMany?: OrdemServicoCreateManyOrdem_vinculadaInputEnvelope
    set?: OrdemServicoWhereUniqueInput | OrdemServicoWhereUniqueInput[]
    disconnect?: OrdemServicoWhereUniqueInput | OrdemServicoWhereUniqueInput[]
    delete?: OrdemServicoWhereUniqueInput | OrdemServicoWhereUniqueInput[]
    connect?: OrdemServicoWhereUniqueInput | OrdemServicoWhereUniqueInput[]
    update?: OrdemServicoUpdateWithWhereUniqueWithoutOrdem_vinculadaInput | OrdemServicoUpdateWithWhereUniqueWithoutOrdem_vinculadaInput[]
    updateMany?: OrdemServicoUpdateManyWithWhereWithoutOrdem_vinculadaInput | OrdemServicoUpdateManyWithWhereWithoutOrdem_vinculadaInput[]
    deleteMany?: OrdemServicoScalarWhereInput | OrdemServicoScalarWhereInput[]
  }

  export type UsuarioCreateNestedOneWithoutAuditoriasInput = {
    create?: XOR<UsuarioCreateWithoutAuditoriasInput, UsuarioUncheckedCreateWithoutAuditoriasInput>
    connectOrCreate?: UsuarioCreateOrConnectWithoutAuditoriasInput
    connect?: UsuarioWhereUniqueInput
  }

  export type EnumAuditActionFieldUpdateOperationsInput = {
    set?: $Enums.AuditAction
  }

  export type UsuarioUpdateOneRequiredWithoutAuditoriasNestedInput = {
    create?: XOR<UsuarioCreateWithoutAuditoriasInput, UsuarioUncheckedCreateWithoutAuditoriasInput>
    connectOrCreate?: UsuarioCreateOrConnectWithoutAuditoriasInput
    upsert?: UsuarioUpsertWithoutAuditoriasInput
    connect?: UsuarioWhereUniqueInput
    update?: XOR<XOR<UsuarioUpdateToOneWithWhereWithoutAuditoriasInput, UsuarioUpdateWithoutAuditoriasInput>, UsuarioUncheckedUpdateWithoutAuditoriasInput>
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedEnumRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel>
    in?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumRoleFilter<$PrismaModel> | $Enums.Role
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedEnumRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel>
    in?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumRoleWithAggregatesFilter<$PrismaModel> | $Enums.Role
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRoleFilter<$PrismaModel>
    _max?: NestedEnumRoleFilter<$PrismaModel>
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedEnumTipoPredioFilter<$PrismaModel = never> = {
    equals?: $Enums.TipoPredio | EnumTipoPredioFieldRefInput<$PrismaModel>
    in?: $Enums.TipoPredio[] | ListEnumTipoPredioFieldRefInput<$PrismaModel>
    notIn?: $Enums.TipoPredio[] | ListEnumTipoPredioFieldRefInput<$PrismaModel>
    not?: NestedEnumTipoPredioFilter<$PrismaModel> | $Enums.TipoPredio
  }

  export type NestedEnumTipoPredioWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TipoPredio | EnumTipoPredioFieldRefInput<$PrismaModel>
    in?: $Enums.TipoPredio[] | ListEnumTipoPredioFieldRefInput<$PrismaModel>
    notIn?: $Enums.TipoPredio[] | ListEnumTipoPredioFieldRefInput<$PrismaModel>
    not?: NestedEnumTipoPredioWithAggregatesFilter<$PrismaModel> | $Enums.TipoPredio
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTipoPredioFilter<$PrismaModel>
    _max?: NestedEnumTipoPredioFilter<$PrismaModel>
  }

  export type NestedEnumPrioridadeFilter<$PrismaModel = never> = {
    equals?: $Enums.Prioridade | EnumPrioridadeFieldRefInput<$PrismaModel>
    in?: $Enums.Prioridade[] | ListEnumPrioridadeFieldRefInput<$PrismaModel>
    notIn?: $Enums.Prioridade[] | ListEnumPrioridadeFieldRefInput<$PrismaModel>
    not?: NestedEnumPrioridadeFilter<$PrismaModel> | $Enums.Prioridade
  }

  export type NestedEnumStatusOSFilter<$PrismaModel = never> = {
    equals?: $Enums.StatusOS | EnumStatusOSFieldRefInput<$PrismaModel>
    in?: $Enums.StatusOS[] | ListEnumStatusOSFieldRefInput<$PrismaModel>
    notIn?: $Enums.StatusOS[] | ListEnumStatusOSFieldRefInput<$PrismaModel>
    not?: NestedEnumStatusOSFilter<$PrismaModel> | $Enums.StatusOS
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedEnumPrioridadeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Prioridade | EnumPrioridadeFieldRefInput<$PrismaModel>
    in?: $Enums.Prioridade[] | ListEnumPrioridadeFieldRefInput<$PrismaModel>
    notIn?: $Enums.Prioridade[] | ListEnumPrioridadeFieldRefInput<$PrismaModel>
    not?: NestedEnumPrioridadeWithAggregatesFilter<$PrismaModel> | $Enums.Prioridade
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumPrioridadeFilter<$PrismaModel>
    _max?: NestedEnumPrioridadeFilter<$PrismaModel>
  }

  export type NestedEnumStatusOSWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.StatusOS | EnumStatusOSFieldRefInput<$PrismaModel>
    in?: $Enums.StatusOS[] | ListEnumStatusOSFieldRefInput<$PrismaModel>
    notIn?: $Enums.StatusOS[] | ListEnumStatusOSFieldRefInput<$PrismaModel>
    not?: NestedEnumStatusOSWithAggregatesFilter<$PrismaModel> | $Enums.StatusOS
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumStatusOSFilter<$PrismaModel>
    _max?: NestedEnumStatusOSFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedEnumAuditActionFilter<$PrismaModel = never> = {
    equals?: $Enums.AuditAction | EnumAuditActionFieldRefInput<$PrismaModel>
    in?: $Enums.AuditAction[] | ListEnumAuditActionFieldRefInput<$PrismaModel>
    notIn?: $Enums.AuditAction[] | ListEnumAuditActionFieldRefInput<$PrismaModel>
    not?: NestedEnumAuditActionFilter<$PrismaModel> | $Enums.AuditAction
  }

  export type NestedEnumAuditActionWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AuditAction | EnumAuditActionFieldRefInput<$PrismaModel>
    in?: $Enums.AuditAction[] | ListEnumAuditActionFieldRefInput<$PrismaModel>
    notIn?: $Enums.AuditAction[] | ListEnumAuditActionFieldRefInput<$PrismaModel>
    not?: NestedEnumAuditActionWithAggregatesFilter<$PrismaModel> | $Enums.AuditAction
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumAuditActionFilter<$PrismaModel>
    _max?: NestedEnumAuditActionFilter<$PrismaModel>
  }
  export type NestedJsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type PredioCreateWithoutGestorInput = {
    id?: string
    nome: string
    tipo: $Enums.TipoPredio
    endereco: string
    criado_em?: Date | string
    atualizado?: Date | string
    ordens_servico?: OrdemServicoCreateNestedManyWithoutPredioInput
  }

  export type PredioUncheckedCreateWithoutGestorInput = {
    id?: string
    nome: string
    tipo: $Enums.TipoPredio
    endereco: string
    criado_em?: Date | string
    atualizado?: Date | string
    ordens_servico?: OrdemServicoUncheckedCreateNestedManyWithoutPredioInput
  }

  export type PredioCreateOrConnectWithoutGestorInput = {
    where: PredioWhereUniqueInput
    create: XOR<PredioCreateWithoutGestorInput, PredioUncheckedCreateWithoutGestorInput>
  }

  export type PredioCreateManyGestorInputEnvelope = {
    data: PredioCreateManyGestorInput | PredioCreateManyGestorInput[]
    skipDuplicates?: boolean
  }

  export type OrdemServicoCreateWithoutSolicitanteInput = {
    id?: string
    codigo?: string
    titulo: string
    descricao: string
    prioridade?: $Enums.Prioridade
    status?: $Enums.StatusOS
    fotos?: OrdemServicoCreatefotosInput | string[]
    fotos_conclusao?: OrdemServicoCreatefotos_conclusaoInput | string[]
    motivo_pausa?: string | null
    motivo_cancelamento?: string | null
    data_limite_sla?: Date | string | null
    iniciado_em?: Date | string | null
    concluido_em?: Date | string | null
    criado_em?: Date | string
    atualizado?: Date | string
    predio: PredioCreateNestedOneWithoutOrdens_servicoInput
    tecnico?: UsuarioCreateNestedOneWithoutChamados_atribuidosInput
    ordem_vinculada?: OrdemServicoCreateNestedOneWithoutOrdens_derivadasInput
    ordens_derivadas?: OrdemServicoCreateNestedManyWithoutOrdem_vinculadaInput
  }

  export type OrdemServicoUncheckedCreateWithoutSolicitanteInput = {
    id?: string
    codigo?: string
    titulo: string
    descricao: string
    prioridade?: $Enums.Prioridade
    status?: $Enums.StatusOS
    predio_id: string
    tecnico_atribuido_id?: string | null
    fotos?: OrdemServicoCreatefotosInput | string[]
    fotos_conclusao?: OrdemServicoCreatefotos_conclusaoInput | string[]
    motivo_pausa?: string | null
    motivo_cancelamento?: string | null
    data_limite_sla?: Date | string | null
    iniciado_em?: Date | string | null
    concluido_em?: Date | string | null
    ordem_vinculada_id?: string | null
    criado_em?: Date | string
    atualizado?: Date | string
    ordens_derivadas?: OrdemServicoUncheckedCreateNestedManyWithoutOrdem_vinculadaInput
  }

  export type OrdemServicoCreateOrConnectWithoutSolicitanteInput = {
    where: OrdemServicoWhereUniqueInput
    create: XOR<OrdemServicoCreateWithoutSolicitanteInput, OrdemServicoUncheckedCreateWithoutSolicitanteInput>
  }

  export type OrdemServicoCreateManySolicitanteInputEnvelope = {
    data: OrdemServicoCreateManySolicitanteInput | OrdemServicoCreateManySolicitanteInput[]
    skipDuplicates?: boolean
  }

  export type OrdemServicoCreateWithoutTecnicoInput = {
    id?: string
    codigo?: string
    titulo: string
    descricao: string
    prioridade?: $Enums.Prioridade
    status?: $Enums.StatusOS
    fotos?: OrdemServicoCreatefotosInput | string[]
    fotos_conclusao?: OrdemServicoCreatefotos_conclusaoInput | string[]
    motivo_pausa?: string | null
    motivo_cancelamento?: string | null
    data_limite_sla?: Date | string | null
    iniciado_em?: Date | string | null
    concluido_em?: Date | string | null
    criado_em?: Date | string
    atualizado?: Date | string
    predio: PredioCreateNestedOneWithoutOrdens_servicoInput
    solicitante: UsuarioCreateNestedOneWithoutChamados_solicitadosInput
    ordem_vinculada?: OrdemServicoCreateNestedOneWithoutOrdens_derivadasInput
    ordens_derivadas?: OrdemServicoCreateNestedManyWithoutOrdem_vinculadaInput
  }

  export type OrdemServicoUncheckedCreateWithoutTecnicoInput = {
    id?: string
    codigo?: string
    titulo: string
    descricao: string
    prioridade?: $Enums.Prioridade
    status?: $Enums.StatusOS
    predio_id: string
    solicitante_id: string
    fotos?: OrdemServicoCreatefotosInput | string[]
    fotos_conclusao?: OrdemServicoCreatefotos_conclusaoInput | string[]
    motivo_pausa?: string | null
    motivo_cancelamento?: string | null
    data_limite_sla?: Date | string | null
    iniciado_em?: Date | string | null
    concluido_em?: Date | string | null
    ordem_vinculada_id?: string | null
    criado_em?: Date | string
    atualizado?: Date | string
    ordens_derivadas?: OrdemServicoUncheckedCreateNestedManyWithoutOrdem_vinculadaInput
  }

  export type OrdemServicoCreateOrConnectWithoutTecnicoInput = {
    where: OrdemServicoWhereUniqueInput
    create: XOR<OrdemServicoCreateWithoutTecnicoInput, OrdemServicoUncheckedCreateWithoutTecnicoInput>
  }

  export type OrdemServicoCreateManyTecnicoInputEnvelope = {
    data: OrdemServicoCreateManyTecnicoInput | OrdemServicoCreateManyTecnicoInput[]
    skipDuplicates?: boolean
  }

  export type AuditoriaLogCreateWithoutUsuarioInput = {
    id?: string
    entidade_afetada: string
    entidade_id: string
    acao: $Enums.AuditAction
    dados_antigos?: NullableJsonNullValueInput | InputJsonValue
    dados_novos?: NullableJsonNullValueInput | InputJsonValue
    criado_em?: Date | string
  }

  export type AuditoriaLogUncheckedCreateWithoutUsuarioInput = {
    id?: string
    entidade_afetada: string
    entidade_id: string
    acao: $Enums.AuditAction
    dados_antigos?: NullableJsonNullValueInput | InputJsonValue
    dados_novos?: NullableJsonNullValueInput | InputJsonValue
    criado_em?: Date | string
  }

  export type AuditoriaLogCreateOrConnectWithoutUsuarioInput = {
    where: AuditoriaLogWhereUniqueInput
    create: XOR<AuditoriaLogCreateWithoutUsuarioInput, AuditoriaLogUncheckedCreateWithoutUsuarioInput>
  }

  export type AuditoriaLogCreateManyUsuarioInputEnvelope = {
    data: AuditoriaLogCreateManyUsuarioInput | AuditoriaLogCreateManyUsuarioInput[]
    skipDuplicates?: boolean
  }

  export type PredioUpsertWithWhereUniqueWithoutGestorInput = {
    where: PredioWhereUniqueInput
    update: XOR<PredioUpdateWithoutGestorInput, PredioUncheckedUpdateWithoutGestorInput>
    create: XOR<PredioCreateWithoutGestorInput, PredioUncheckedCreateWithoutGestorInput>
  }

  export type PredioUpdateWithWhereUniqueWithoutGestorInput = {
    where: PredioWhereUniqueInput
    data: XOR<PredioUpdateWithoutGestorInput, PredioUncheckedUpdateWithoutGestorInput>
  }

  export type PredioUpdateManyWithWhereWithoutGestorInput = {
    where: PredioScalarWhereInput
    data: XOR<PredioUpdateManyMutationInput, PredioUncheckedUpdateManyWithoutGestorInput>
  }

  export type PredioScalarWhereInput = {
    AND?: PredioScalarWhereInput | PredioScalarWhereInput[]
    OR?: PredioScalarWhereInput[]
    NOT?: PredioScalarWhereInput | PredioScalarWhereInput[]
    id?: StringFilter<"Predio"> | string
    nome?: StringFilter<"Predio"> | string
    tipo?: EnumTipoPredioFilter<"Predio"> | $Enums.TipoPredio
    endereco?: StringFilter<"Predio"> | string
    gestor_id?: StringNullableFilter<"Predio"> | string | null
    criado_em?: DateTimeFilter<"Predio"> | Date | string
    atualizado?: DateTimeFilter<"Predio"> | Date | string
  }

  export type OrdemServicoUpsertWithWhereUniqueWithoutSolicitanteInput = {
    where: OrdemServicoWhereUniqueInput
    update: XOR<OrdemServicoUpdateWithoutSolicitanteInput, OrdemServicoUncheckedUpdateWithoutSolicitanteInput>
    create: XOR<OrdemServicoCreateWithoutSolicitanteInput, OrdemServicoUncheckedCreateWithoutSolicitanteInput>
  }

  export type OrdemServicoUpdateWithWhereUniqueWithoutSolicitanteInput = {
    where: OrdemServicoWhereUniqueInput
    data: XOR<OrdemServicoUpdateWithoutSolicitanteInput, OrdemServicoUncheckedUpdateWithoutSolicitanteInput>
  }

  export type OrdemServicoUpdateManyWithWhereWithoutSolicitanteInput = {
    where: OrdemServicoScalarWhereInput
    data: XOR<OrdemServicoUpdateManyMutationInput, OrdemServicoUncheckedUpdateManyWithoutSolicitanteInput>
  }

  export type OrdemServicoScalarWhereInput = {
    AND?: OrdemServicoScalarWhereInput | OrdemServicoScalarWhereInput[]
    OR?: OrdemServicoScalarWhereInput[]
    NOT?: OrdemServicoScalarWhereInput | OrdemServicoScalarWhereInput[]
    id?: StringFilter<"OrdemServico"> | string
    codigo?: StringFilter<"OrdemServico"> | string
    titulo?: StringFilter<"OrdemServico"> | string
    descricao?: StringFilter<"OrdemServico"> | string
    prioridade?: EnumPrioridadeFilter<"OrdemServico"> | $Enums.Prioridade
    status?: EnumStatusOSFilter<"OrdemServico"> | $Enums.StatusOS
    predio_id?: StringFilter<"OrdemServico"> | string
    solicitante_id?: StringFilter<"OrdemServico"> | string
    tecnico_atribuido_id?: StringNullableFilter<"OrdemServico"> | string | null
    fotos?: StringNullableListFilter<"OrdemServico">
    fotos_conclusao?: StringNullableListFilter<"OrdemServico">
    motivo_pausa?: StringNullableFilter<"OrdemServico"> | string | null
    motivo_cancelamento?: StringNullableFilter<"OrdemServico"> | string | null
    data_limite_sla?: DateTimeNullableFilter<"OrdemServico"> | Date | string | null
    iniciado_em?: DateTimeNullableFilter<"OrdemServico"> | Date | string | null
    concluido_em?: DateTimeNullableFilter<"OrdemServico"> | Date | string | null
    ordem_vinculada_id?: StringNullableFilter<"OrdemServico"> | string | null
    criado_em?: DateTimeFilter<"OrdemServico"> | Date | string
    atualizado?: DateTimeFilter<"OrdemServico"> | Date | string
  }

  export type OrdemServicoUpsertWithWhereUniqueWithoutTecnicoInput = {
    where: OrdemServicoWhereUniqueInput
    update: XOR<OrdemServicoUpdateWithoutTecnicoInput, OrdemServicoUncheckedUpdateWithoutTecnicoInput>
    create: XOR<OrdemServicoCreateWithoutTecnicoInput, OrdemServicoUncheckedCreateWithoutTecnicoInput>
  }

  export type OrdemServicoUpdateWithWhereUniqueWithoutTecnicoInput = {
    where: OrdemServicoWhereUniqueInput
    data: XOR<OrdemServicoUpdateWithoutTecnicoInput, OrdemServicoUncheckedUpdateWithoutTecnicoInput>
  }

  export type OrdemServicoUpdateManyWithWhereWithoutTecnicoInput = {
    where: OrdemServicoScalarWhereInput
    data: XOR<OrdemServicoUpdateManyMutationInput, OrdemServicoUncheckedUpdateManyWithoutTecnicoInput>
  }

  export type AuditoriaLogUpsertWithWhereUniqueWithoutUsuarioInput = {
    where: AuditoriaLogWhereUniqueInput
    update: XOR<AuditoriaLogUpdateWithoutUsuarioInput, AuditoriaLogUncheckedUpdateWithoutUsuarioInput>
    create: XOR<AuditoriaLogCreateWithoutUsuarioInput, AuditoriaLogUncheckedCreateWithoutUsuarioInput>
  }

  export type AuditoriaLogUpdateWithWhereUniqueWithoutUsuarioInput = {
    where: AuditoriaLogWhereUniqueInput
    data: XOR<AuditoriaLogUpdateWithoutUsuarioInput, AuditoriaLogUncheckedUpdateWithoutUsuarioInput>
  }

  export type AuditoriaLogUpdateManyWithWhereWithoutUsuarioInput = {
    where: AuditoriaLogScalarWhereInput
    data: XOR<AuditoriaLogUpdateManyMutationInput, AuditoriaLogUncheckedUpdateManyWithoutUsuarioInput>
  }

  export type AuditoriaLogScalarWhereInput = {
    AND?: AuditoriaLogScalarWhereInput | AuditoriaLogScalarWhereInput[]
    OR?: AuditoriaLogScalarWhereInput[]
    NOT?: AuditoriaLogScalarWhereInput | AuditoriaLogScalarWhereInput[]
    id?: StringFilter<"AuditoriaLog"> | string
    entidade_afetada?: StringFilter<"AuditoriaLog"> | string
    entidade_id?: StringFilter<"AuditoriaLog"> | string
    acao?: EnumAuditActionFilter<"AuditoriaLog"> | $Enums.AuditAction
    usuario_id?: StringFilter<"AuditoriaLog"> | string
    dados_antigos?: JsonNullableFilter<"AuditoriaLog">
    dados_novos?: JsonNullableFilter<"AuditoriaLog">
    criado_em?: DateTimeFilter<"AuditoriaLog"> | Date | string
  }

  export type UsuarioCreateWithoutPredios_geridosInput = {
    id?: string
    nome: string
    email: string
    senha_hash: string
    role?: $Enums.Role
    telefone?: string | null
    token_version?: number
    criado_em?: Date | string
    atualizado?: Date | string
    chamados_solicitados?: OrdemServicoCreateNestedManyWithoutSolicitanteInput
    chamados_atribuidos?: OrdemServicoCreateNestedManyWithoutTecnicoInput
    auditorias?: AuditoriaLogCreateNestedManyWithoutUsuarioInput
  }

  export type UsuarioUncheckedCreateWithoutPredios_geridosInput = {
    id?: string
    nome: string
    email: string
    senha_hash: string
    role?: $Enums.Role
    telefone?: string | null
    token_version?: number
    criado_em?: Date | string
    atualizado?: Date | string
    chamados_solicitados?: OrdemServicoUncheckedCreateNestedManyWithoutSolicitanteInput
    chamados_atribuidos?: OrdemServicoUncheckedCreateNestedManyWithoutTecnicoInput
    auditorias?: AuditoriaLogUncheckedCreateNestedManyWithoutUsuarioInput
  }

  export type UsuarioCreateOrConnectWithoutPredios_geridosInput = {
    where: UsuarioWhereUniqueInput
    create: XOR<UsuarioCreateWithoutPredios_geridosInput, UsuarioUncheckedCreateWithoutPredios_geridosInput>
  }

  export type OrdemServicoCreateWithoutPredioInput = {
    id?: string
    codigo?: string
    titulo: string
    descricao: string
    prioridade?: $Enums.Prioridade
    status?: $Enums.StatusOS
    fotos?: OrdemServicoCreatefotosInput | string[]
    fotos_conclusao?: OrdemServicoCreatefotos_conclusaoInput | string[]
    motivo_pausa?: string | null
    motivo_cancelamento?: string | null
    data_limite_sla?: Date | string | null
    iniciado_em?: Date | string | null
    concluido_em?: Date | string | null
    criado_em?: Date | string
    atualizado?: Date | string
    solicitante: UsuarioCreateNestedOneWithoutChamados_solicitadosInput
    tecnico?: UsuarioCreateNestedOneWithoutChamados_atribuidosInput
    ordem_vinculada?: OrdemServicoCreateNestedOneWithoutOrdens_derivadasInput
    ordens_derivadas?: OrdemServicoCreateNestedManyWithoutOrdem_vinculadaInput
  }

  export type OrdemServicoUncheckedCreateWithoutPredioInput = {
    id?: string
    codigo?: string
    titulo: string
    descricao: string
    prioridade?: $Enums.Prioridade
    status?: $Enums.StatusOS
    solicitante_id: string
    tecnico_atribuido_id?: string | null
    fotos?: OrdemServicoCreatefotosInput | string[]
    fotos_conclusao?: OrdemServicoCreatefotos_conclusaoInput | string[]
    motivo_pausa?: string | null
    motivo_cancelamento?: string | null
    data_limite_sla?: Date | string | null
    iniciado_em?: Date | string | null
    concluido_em?: Date | string | null
    ordem_vinculada_id?: string | null
    criado_em?: Date | string
    atualizado?: Date | string
    ordens_derivadas?: OrdemServicoUncheckedCreateNestedManyWithoutOrdem_vinculadaInput
  }

  export type OrdemServicoCreateOrConnectWithoutPredioInput = {
    where: OrdemServicoWhereUniqueInput
    create: XOR<OrdemServicoCreateWithoutPredioInput, OrdemServicoUncheckedCreateWithoutPredioInput>
  }

  export type OrdemServicoCreateManyPredioInputEnvelope = {
    data: OrdemServicoCreateManyPredioInput | OrdemServicoCreateManyPredioInput[]
    skipDuplicates?: boolean
  }

  export type UsuarioUpsertWithoutPredios_geridosInput = {
    update: XOR<UsuarioUpdateWithoutPredios_geridosInput, UsuarioUncheckedUpdateWithoutPredios_geridosInput>
    create: XOR<UsuarioCreateWithoutPredios_geridosInput, UsuarioUncheckedCreateWithoutPredios_geridosInput>
    where?: UsuarioWhereInput
  }

  export type UsuarioUpdateToOneWithWhereWithoutPredios_geridosInput = {
    where?: UsuarioWhereInput
    data: XOR<UsuarioUpdateWithoutPredios_geridosInput, UsuarioUncheckedUpdateWithoutPredios_geridosInput>
  }

  export type UsuarioUpdateWithoutPredios_geridosInput = {
    id?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    senha_hash?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    telefone?: NullableStringFieldUpdateOperationsInput | string | null
    token_version?: IntFieldUpdateOperationsInput | number
    criado_em?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizado?: DateTimeFieldUpdateOperationsInput | Date | string
    chamados_solicitados?: OrdemServicoUpdateManyWithoutSolicitanteNestedInput
    chamados_atribuidos?: OrdemServicoUpdateManyWithoutTecnicoNestedInput
    auditorias?: AuditoriaLogUpdateManyWithoutUsuarioNestedInput
  }

  export type UsuarioUncheckedUpdateWithoutPredios_geridosInput = {
    id?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    senha_hash?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    telefone?: NullableStringFieldUpdateOperationsInput | string | null
    token_version?: IntFieldUpdateOperationsInput | number
    criado_em?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizado?: DateTimeFieldUpdateOperationsInput | Date | string
    chamados_solicitados?: OrdemServicoUncheckedUpdateManyWithoutSolicitanteNestedInput
    chamados_atribuidos?: OrdemServicoUncheckedUpdateManyWithoutTecnicoNestedInput
    auditorias?: AuditoriaLogUncheckedUpdateManyWithoutUsuarioNestedInput
  }

  export type OrdemServicoUpsertWithWhereUniqueWithoutPredioInput = {
    where: OrdemServicoWhereUniqueInput
    update: XOR<OrdemServicoUpdateWithoutPredioInput, OrdemServicoUncheckedUpdateWithoutPredioInput>
    create: XOR<OrdemServicoCreateWithoutPredioInput, OrdemServicoUncheckedCreateWithoutPredioInput>
  }

  export type OrdemServicoUpdateWithWhereUniqueWithoutPredioInput = {
    where: OrdemServicoWhereUniqueInput
    data: XOR<OrdemServicoUpdateWithoutPredioInput, OrdemServicoUncheckedUpdateWithoutPredioInput>
  }

  export type OrdemServicoUpdateManyWithWhereWithoutPredioInput = {
    where: OrdemServicoScalarWhereInput
    data: XOR<OrdemServicoUpdateManyMutationInput, OrdemServicoUncheckedUpdateManyWithoutPredioInput>
  }

  export type PredioCreateWithoutOrdens_servicoInput = {
    id?: string
    nome: string
    tipo: $Enums.TipoPredio
    endereco: string
    criado_em?: Date | string
    atualizado?: Date | string
    gestor?: UsuarioCreateNestedOneWithoutPredios_geridosInput
  }

  export type PredioUncheckedCreateWithoutOrdens_servicoInput = {
    id?: string
    nome: string
    tipo: $Enums.TipoPredio
    endereco: string
    gestor_id?: string | null
    criado_em?: Date | string
    atualizado?: Date | string
  }

  export type PredioCreateOrConnectWithoutOrdens_servicoInput = {
    where: PredioWhereUniqueInput
    create: XOR<PredioCreateWithoutOrdens_servicoInput, PredioUncheckedCreateWithoutOrdens_servicoInput>
  }

  export type UsuarioCreateWithoutChamados_solicitadosInput = {
    id?: string
    nome: string
    email: string
    senha_hash: string
    role?: $Enums.Role
    telefone?: string | null
    token_version?: number
    criado_em?: Date | string
    atualizado?: Date | string
    predios_geridos?: PredioCreateNestedManyWithoutGestorInput
    chamados_atribuidos?: OrdemServicoCreateNestedManyWithoutTecnicoInput
    auditorias?: AuditoriaLogCreateNestedManyWithoutUsuarioInput
  }

  export type UsuarioUncheckedCreateWithoutChamados_solicitadosInput = {
    id?: string
    nome: string
    email: string
    senha_hash: string
    role?: $Enums.Role
    telefone?: string | null
    token_version?: number
    criado_em?: Date | string
    atualizado?: Date | string
    predios_geridos?: PredioUncheckedCreateNestedManyWithoutGestorInput
    chamados_atribuidos?: OrdemServicoUncheckedCreateNestedManyWithoutTecnicoInput
    auditorias?: AuditoriaLogUncheckedCreateNestedManyWithoutUsuarioInput
  }

  export type UsuarioCreateOrConnectWithoutChamados_solicitadosInput = {
    where: UsuarioWhereUniqueInput
    create: XOR<UsuarioCreateWithoutChamados_solicitadosInput, UsuarioUncheckedCreateWithoutChamados_solicitadosInput>
  }

  export type UsuarioCreateWithoutChamados_atribuidosInput = {
    id?: string
    nome: string
    email: string
    senha_hash: string
    role?: $Enums.Role
    telefone?: string | null
    token_version?: number
    criado_em?: Date | string
    atualizado?: Date | string
    predios_geridos?: PredioCreateNestedManyWithoutGestorInput
    chamados_solicitados?: OrdemServicoCreateNestedManyWithoutSolicitanteInput
    auditorias?: AuditoriaLogCreateNestedManyWithoutUsuarioInput
  }

  export type UsuarioUncheckedCreateWithoutChamados_atribuidosInput = {
    id?: string
    nome: string
    email: string
    senha_hash: string
    role?: $Enums.Role
    telefone?: string | null
    token_version?: number
    criado_em?: Date | string
    atualizado?: Date | string
    predios_geridos?: PredioUncheckedCreateNestedManyWithoutGestorInput
    chamados_solicitados?: OrdemServicoUncheckedCreateNestedManyWithoutSolicitanteInput
    auditorias?: AuditoriaLogUncheckedCreateNestedManyWithoutUsuarioInput
  }

  export type UsuarioCreateOrConnectWithoutChamados_atribuidosInput = {
    where: UsuarioWhereUniqueInput
    create: XOR<UsuarioCreateWithoutChamados_atribuidosInput, UsuarioUncheckedCreateWithoutChamados_atribuidosInput>
  }

  export type OrdemServicoCreateWithoutOrdens_derivadasInput = {
    id?: string
    codigo?: string
    titulo: string
    descricao: string
    prioridade?: $Enums.Prioridade
    status?: $Enums.StatusOS
    fotos?: OrdemServicoCreatefotosInput | string[]
    fotos_conclusao?: OrdemServicoCreatefotos_conclusaoInput | string[]
    motivo_pausa?: string | null
    motivo_cancelamento?: string | null
    data_limite_sla?: Date | string | null
    iniciado_em?: Date | string | null
    concluido_em?: Date | string | null
    criado_em?: Date | string
    atualizado?: Date | string
    predio: PredioCreateNestedOneWithoutOrdens_servicoInput
    solicitante: UsuarioCreateNestedOneWithoutChamados_solicitadosInput
    tecnico?: UsuarioCreateNestedOneWithoutChamados_atribuidosInput
    ordem_vinculada?: OrdemServicoCreateNestedOneWithoutOrdens_derivadasInput
  }

  export type OrdemServicoUncheckedCreateWithoutOrdens_derivadasInput = {
    id?: string
    codigo?: string
    titulo: string
    descricao: string
    prioridade?: $Enums.Prioridade
    status?: $Enums.StatusOS
    predio_id: string
    solicitante_id: string
    tecnico_atribuido_id?: string | null
    fotos?: OrdemServicoCreatefotosInput | string[]
    fotos_conclusao?: OrdemServicoCreatefotos_conclusaoInput | string[]
    motivo_pausa?: string | null
    motivo_cancelamento?: string | null
    data_limite_sla?: Date | string | null
    iniciado_em?: Date | string | null
    concluido_em?: Date | string | null
    ordem_vinculada_id?: string | null
    criado_em?: Date | string
    atualizado?: Date | string
  }

  export type OrdemServicoCreateOrConnectWithoutOrdens_derivadasInput = {
    where: OrdemServicoWhereUniqueInput
    create: XOR<OrdemServicoCreateWithoutOrdens_derivadasInput, OrdemServicoUncheckedCreateWithoutOrdens_derivadasInput>
  }

  export type OrdemServicoCreateWithoutOrdem_vinculadaInput = {
    id?: string
    codigo?: string
    titulo: string
    descricao: string
    prioridade?: $Enums.Prioridade
    status?: $Enums.StatusOS
    fotos?: OrdemServicoCreatefotosInput | string[]
    fotos_conclusao?: OrdemServicoCreatefotos_conclusaoInput | string[]
    motivo_pausa?: string | null
    motivo_cancelamento?: string | null
    data_limite_sla?: Date | string | null
    iniciado_em?: Date | string | null
    concluido_em?: Date | string | null
    criado_em?: Date | string
    atualizado?: Date | string
    predio: PredioCreateNestedOneWithoutOrdens_servicoInput
    solicitante: UsuarioCreateNestedOneWithoutChamados_solicitadosInput
    tecnico?: UsuarioCreateNestedOneWithoutChamados_atribuidosInput
    ordens_derivadas?: OrdemServicoCreateNestedManyWithoutOrdem_vinculadaInput
  }

  export type OrdemServicoUncheckedCreateWithoutOrdem_vinculadaInput = {
    id?: string
    codigo?: string
    titulo: string
    descricao: string
    prioridade?: $Enums.Prioridade
    status?: $Enums.StatusOS
    predio_id: string
    solicitante_id: string
    tecnico_atribuido_id?: string | null
    fotos?: OrdemServicoCreatefotosInput | string[]
    fotos_conclusao?: OrdemServicoCreatefotos_conclusaoInput | string[]
    motivo_pausa?: string | null
    motivo_cancelamento?: string | null
    data_limite_sla?: Date | string | null
    iniciado_em?: Date | string | null
    concluido_em?: Date | string | null
    criado_em?: Date | string
    atualizado?: Date | string
    ordens_derivadas?: OrdemServicoUncheckedCreateNestedManyWithoutOrdem_vinculadaInput
  }

  export type OrdemServicoCreateOrConnectWithoutOrdem_vinculadaInput = {
    where: OrdemServicoWhereUniqueInput
    create: XOR<OrdemServicoCreateWithoutOrdem_vinculadaInput, OrdemServicoUncheckedCreateWithoutOrdem_vinculadaInput>
  }

  export type OrdemServicoCreateManyOrdem_vinculadaInputEnvelope = {
    data: OrdemServicoCreateManyOrdem_vinculadaInput | OrdemServicoCreateManyOrdem_vinculadaInput[]
    skipDuplicates?: boolean
  }

  export type PredioUpsertWithoutOrdens_servicoInput = {
    update: XOR<PredioUpdateWithoutOrdens_servicoInput, PredioUncheckedUpdateWithoutOrdens_servicoInput>
    create: XOR<PredioCreateWithoutOrdens_servicoInput, PredioUncheckedCreateWithoutOrdens_servicoInput>
    where?: PredioWhereInput
  }

  export type PredioUpdateToOneWithWhereWithoutOrdens_servicoInput = {
    where?: PredioWhereInput
    data: XOR<PredioUpdateWithoutOrdens_servicoInput, PredioUncheckedUpdateWithoutOrdens_servicoInput>
  }

  export type PredioUpdateWithoutOrdens_servicoInput = {
    id?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    tipo?: EnumTipoPredioFieldUpdateOperationsInput | $Enums.TipoPredio
    endereco?: StringFieldUpdateOperationsInput | string
    criado_em?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizado?: DateTimeFieldUpdateOperationsInput | Date | string
    gestor?: UsuarioUpdateOneWithoutPredios_geridosNestedInput
  }

  export type PredioUncheckedUpdateWithoutOrdens_servicoInput = {
    id?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    tipo?: EnumTipoPredioFieldUpdateOperationsInput | $Enums.TipoPredio
    endereco?: StringFieldUpdateOperationsInput | string
    gestor_id?: NullableStringFieldUpdateOperationsInput | string | null
    criado_em?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizado?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UsuarioUpsertWithoutChamados_solicitadosInput = {
    update: XOR<UsuarioUpdateWithoutChamados_solicitadosInput, UsuarioUncheckedUpdateWithoutChamados_solicitadosInput>
    create: XOR<UsuarioCreateWithoutChamados_solicitadosInput, UsuarioUncheckedCreateWithoutChamados_solicitadosInput>
    where?: UsuarioWhereInput
  }

  export type UsuarioUpdateToOneWithWhereWithoutChamados_solicitadosInput = {
    where?: UsuarioWhereInput
    data: XOR<UsuarioUpdateWithoutChamados_solicitadosInput, UsuarioUncheckedUpdateWithoutChamados_solicitadosInput>
  }

  export type UsuarioUpdateWithoutChamados_solicitadosInput = {
    id?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    senha_hash?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    telefone?: NullableStringFieldUpdateOperationsInput | string | null
    token_version?: IntFieldUpdateOperationsInput | number
    criado_em?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizado?: DateTimeFieldUpdateOperationsInput | Date | string
    predios_geridos?: PredioUpdateManyWithoutGestorNestedInput
    chamados_atribuidos?: OrdemServicoUpdateManyWithoutTecnicoNestedInput
    auditorias?: AuditoriaLogUpdateManyWithoutUsuarioNestedInput
  }

  export type UsuarioUncheckedUpdateWithoutChamados_solicitadosInput = {
    id?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    senha_hash?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    telefone?: NullableStringFieldUpdateOperationsInput | string | null
    token_version?: IntFieldUpdateOperationsInput | number
    criado_em?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizado?: DateTimeFieldUpdateOperationsInput | Date | string
    predios_geridos?: PredioUncheckedUpdateManyWithoutGestorNestedInput
    chamados_atribuidos?: OrdemServicoUncheckedUpdateManyWithoutTecnicoNestedInput
    auditorias?: AuditoriaLogUncheckedUpdateManyWithoutUsuarioNestedInput
  }

  export type UsuarioUpsertWithoutChamados_atribuidosInput = {
    update: XOR<UsuarioUpdateWithoutChamados_atribuidosInput, UsuarioUncheckedUpdateWithoutChamados_atribuidosInput>
    create: XOR<UsuarioCreateWithoutChamados_atribuidosInput, UsuarioUncheckedCreateWithoutChamados_atribuidosInput>
    where?: UsuarioWhereInput
  }

  export type UsuarioUpdateToOneWithWhereWithoutChamados_atribuidosInput = {
    where?: UsuarioWhereInput
    data: XOR<UsuarioUpdateWithoutChamados_atribuidosInput, UsuarioUncheckedUpdateWithoutChamados_atribuidosInput>
  }

  export type UsuarioUpdateWithoutChamados_atribuidosInput = {
    id?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    senha_hash?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    telefone?: NullableStringFieldUpdateOperationsInput | string | null
    token_version?: IntFieldUpdateOperationsInput | number
    criado_em?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizado?: DateTimeFieldUpdateOperationsInput | Date | string
    predios_geridos?: PredioUpdateManyWithoutGestorNestedInput
    chamados_solicitados?: OrdemServicoUpdateManyWithoutSolicitanteNestedInput
    auditorias?: AuditoriaLogUpdateManyWithoutUsuarioNestedInput
  }

  export type UsuarioUncheckedUpdateWithoutChamados_atribuidosInput = {
    id?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    senha_hash?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    telefone?: NullableStringFieldUpdateOperationsInput | string | null
    token_version?: IntFieldUpdateOperationsInput | number
    criado_em?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizado?: DateTimeFieldUpdateOperationsInput | Date | string
    predios_geridos?: PredioUncheckedUpdateManyWithoutGestorNestedInput
    chamados_solicitados?: OrdemServicoUncheckedUpdateManyWithoutSolicitanteNestedInput
    auditorias?: AuditoriaLogUncheckedUpdateManyWithoutUsuarioNestedInput
  }

  export type OrdemServicoUpsertWithoutOrdens_derivadasInput = {
    update: XOR<OrdemServicoUpdateWithoutOrdens_derivadasInput, OrdemServicoUncheckedUpdateWithoutOrdens_derivadasInput>
    create: XOR<OrdemServicoCreateWithoutOrdens_derivadasInput, OrdemServicoUncheckedCreateWithoutOrdens_derivadasInput>
    where?: OrdemServicoWhereInput
  }

  export type OrdemServicoUpdateToOneWithWhereWithoutOrdens_derivadasInput = {
    where?: OrdemServicoWhereInput
    data: XOR<OrdemServicoUpdateWithoutOrdens_derivadasInput, OrdemServicoUncheckedUpdateWithoutOrdens_derivadasInput>
  }

  export type OrdemServicoUpdateWithoutOrdens_derivadasInput = {
    id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    titulo?: StringFieldUpdateOperationsInput | string
    descricao?: StringFieldUpdateOperationsInput | string
    prioridade?: EnumPrioridadeFieldUpdateOperationsInput | $Enums.Prioridade
    status?: EnumStatusOSFieldUpdateOperationsInput | $Enums.StatusOS
    fotos?: OrdemServicoUpdatefotosInput | string[]
    fotos_conclusao?: OrdemServicoUpdatefotos_conclusaoInput | string[]
    motivo_pausa?: NullableStringFieldUpdateOperationsInput | string | null
    motivo_cancelamento?: NullableStringFieldUpdateOperationsInput | string | null
    data_limite_sla?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    iniciado_em?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    concluido_em?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    criado_em?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizado?: DateTimeFieldUpdateOperationsInput | Date | string
    predio?: PredioUpdateOneRequiredWithoutOrdens_servicoNestedInput
    solicitante?: UsuarioUpdateOneRequiredWithoutChamados_solicitadosNestedInput
    tecnico?: UsuarioUpdateOneWithoutChamados_atribuidosNestedInput
    ordem_vinculada?: OrdemServicoUpdateOneWithoutOrdens_derivadasNestedInput
  }

  export type OrdemServicoUncheckedUpdateWithoutOrdens_derivadasInput = {
    id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    titulo?: StringFieldUpdateOperationsInput | string
    descricao?: StringFieldUpdateOperationsInput | string
    prioridade?: EnumPrioridadeFieldUpdateOperationsInput | $Enums.Prioridade
    status?: EnumStatusOSFieldUpdateOperationsInput | $Enums.StatusOS
    predio_id?: StringFieldUpdateOperationsInput | string
    solicitante_id?: StringFieldUpdateOperationsInput | string
    tecnico_atribuido_id?: NullableStringFieldUpdateOperationsInput | string | null
    fotos?: OrdemServicoUpdatefotosInput | string[]
    fotos_conclusao?: OrdemServicoUpdatefotos_conclusaoInput | string[]
    motivo_pausa?: NullableStringFieldUpdateOperationsInput | string | null
    motivo_cancelamento?: NullableStringFieldUpdateOperationsInput | string | null
    data_limite_sla?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    iniciado_em?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    concluido_em?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    ordem_vinculada_id?: NullableStringFieldUpdateOperationsInput | string | null
    criado_em?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizado?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrdemServicoUpsertWithWhereUniqueWithoutOrdem_vinculadaInput = {
    where: OrdemServicoWhereUniqueInput
    update: XOR<OrdemServicoUpdateWithoutOrdem_vinculadaInput, OrdemServicoUncheckedUpdateWithoutOrdem_vinculadaInput>
    create: XOR<OrdemServicoCreateWithoutOrdem_vinculadaInput, OrdemServicoUncheckedCreateWithoutOrdem_vinculadaInput>
  }

  export type OrdemServicoUpdateWithWhereUniqueWithoutOrdem_vinculadaInput = {
    where: OrdemServicoWhereUniqueInput
    data: XOR<OrdemServicoUpdateWithoutOrdem_vinculadaInput, OrdemServicoUncheckedUpdateWithoutOrdem_vinculadaInput>
  }

  export type OrdemServicoUpdateManyWithWhereWithoutOrdem_vinculadaInput = {
    where: OrdemServicoScalarWhereInput
    data: XOR<OrdemServicoUpdateManyMutationInput, OrdemServicoUncheckedUpdateManyWithoutOrdem_vinculadaInput>
  }

  export type UsuarioCreateWithoutAuditoriasInput = {
    id?: string
    nome: string
    email: string
    senha_hash: string
    role?: $Enums.Role
    telefone?: string | null
    token_version?: number
    criado_em?: Date | string
    atualizado?: Date | string
    predios_geridos?: PredioCreateNestedManyWithoutGestorInput
    chamados_solicitados?: OrdemServicoCreateNestedManyWithoutSolicitanteInput
    chamados_atribuidos?: OrdemServicoCreateNestedManyWithoutTecnicoInput
  }

  export type UsuarioUncheckedCreateWithoutAuditoriasInput = {
    id?: string
    nome: string
    email: string
    senha_hash: string
    role?: $Enums.Role
    telefone?: string | null
    token_version?: number
    criado_em?: Date | string
    atualizado?: Date | string
    predios_geridos?: PredioUncheckedCreateNestedManyWithoutGestorInput
    chamados_solicitados?: OrdemServicoUncheckedCreateNestedManyWithoutSolicitanteInput
    chamados_atribuidos?: OrdemServicoUncheckedCreateNestedManyWithoutTecnicoInput
  }

  export type UsuarioCreateOrConnectWithoutAuditoriasInput = {
    where: UsuarioWhereUniqueInput
    create: XOR<UsuarioCreateWithoutAuditoriasInput, UsuarioUncheckedCreateWithoutAuditoriasInput>
  }

  export type UsuarioUpsertWithoutAuditoriasInput = {
    update: XOR<UsuarioUpdateWithoutAuditoriasInput, UsuarioUncheckedUpdateWithoutAuditoriasInput>
    create: XOR<UsuarioCreateWithoutAuditoriasInput, UsuarioUncheckedCreateWithoutAuditoriasInput>
    where?: UsuarioWhereInput
  }

  export type UsuarioUpdateToOneWithWhereWithoutAuditoriasInput = {
    where?: UsuarioWhereInput
    data: XOR<UsuarioUpdateWithoutAuditoriasInput, UsuarioUncheckedUpdateWithoutAuditoriasInput>
  }

  export type UsuarioUpdateWithoutAuditoriasInput = {
    id?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    senha_hash?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    telefone?: NullableStringFieldUpdateOperationsInput | string | null
    token_version?: IntFieldUpdateOperationsInput | number
    criado_em?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizado?: DateTimeFieldUpdateOperationsInput | Date | string
    predios_geridos?: PredioUpdateManyWithoutGestorNestedInput
    chamados_solicitados?: OrdemServicoUpdateManyWithoutSolicitanteNestedInput
    chamados_atribuidos?: OrdemServicoUpdateManyWithoutTecnicoNestedInput
  }

  export type UsuarioUncheckedUpdateWithoutAuditoriasInput = {
    id?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    senha_hash?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    telefone?: NullableStringFieldUpdateOperationsInput | string | null
    token_version?: IntFieldUpdateOperationsInput | number
    criado_em?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizado?: DateTimeFieldUpdateOperationsInput | Date | string
    predios_geridos?: PredioUncheckedUpdateManyWithoutGestorNestedInput
    chamados_solicitados?: OrdemServicoUncheckedUpdateManyWithoutSolicitanteNestedInput
    chamados_atribuidos?: OrdemServicoUncheckedUpdateManyWithoutTecnicoNestedInput
  }

  export type PredioCreateManyGestorInput = {
    id?: string
    nome: string
    tipo: $Enums.TipoPredio
    endereco: string
    criado_em?: Date | string
    atualizado?: Date | string
  }

  export type OrdemServicoCreateManySolicitanteInput = {
    id?: string
    codigo?: string
    titulo: string
    descricao: string
    prioridade?: $Enums.Prioridade
    status?: $Enums.StatusOS
    predio_id: string
    tecnico_atribuido_id?: string | null
    fotos?: OrdemServicoCreatefotosInput | string[]
    fotos_conclusao?: OrdemServicoCreatefotos_conclusaoInput | string[]
    motivo_pausa?: string | null
    motivo_cancelamento?: string | null
    data_limite_sla?: Date | string | null
    iniciado_em?: Date | string | null
    concluido_em?: Date | string | null
    ordem_vinculada_id?: string | null
    criado_em?: Date | string
    atualizado?: Date | string
  }

  export type OrdemServicoCreateManyTecnicoInput = {
    id?: string
    codigo?: string
    titulo: string
    descricao: string
    prioridade?: $Enums.Prioridade
    status?: $Enums.StatusOS
    predio_id: string
    solicitante_id: string
    fotos?: OrdemServicoCreatefotosInput | string[]
    fotos_conclusao?: OrdemServicoCreatefotos_conclusaoInput | string[]
    motivo_pausa?: string | null
    motivo_cancelamento?: string | null
    data_limite_sla?: Date | string | null
    iniciado_em?: Date | string | null
    concluido_em?: Date | string | null
    ordem_vinculada_id?: string | null
    criado_em?: Date | string
    atualizado?: Date | string
  }

  export type AuditoriaLogCreateManyUsuarioInput = {
    id?: string
    entidade_afetada: string
    entidade_id: string
    acao: $Enums.AuditAction
    dados_antigos?: NullableJsonNullValueInput | InputJsonValue
    dados_novos?: NullableJsonNullValueInput | InputJsonValue
    criado_em?: Date | string
  }

  export type PredioUpdateWithoutGestorInput = {
    id?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    tipo?: EnumTipoPredioFieldUpdateOperationsInput | $Enums.TipoPredio
    endereco?: StringFieldUpdateOperationsInput | string
    criado_em?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizado?: DateTimeFieldUpdateOperationsInput | Date | string
    ordens_servico?: OrdemServicoUpdateManyWithoutPredioNestedInput
  }

  export type PredioUncheckedUpdateWithoutGestorInput = {
    id?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    tipo?: EnumTipoPredioFieldUpdateOperationsInput | $Enums.TipoPredio
    endereco?: StringFieldUpdateOperationsInput | string
    criado_em?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizado?: DateTimeFieldUpdateOperationsInput | Date | string
    ordens_servico?: OrdemServicoUncheckedUpdateManyWithoutPredioNestedInput
  }

  export type PredioUncheckedUpdateManyWithoutGestorInput = {
    id?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    tipo?: EnumTipoPredioFieldUpdateOperationsInput | $Enums.TipoPredio
    endereco?: StringFieldUpdateOperationsInput | string
    criado_em?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizado?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrdemServicoUpdateWithoutSolicitanteInput = {
    id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    titulo?: StringFieldUpdateOperationsInput | string
    descricao?: StringFieldUpdateOperationsInput | string
    prioridade?: EnumPrioridadeFieldUpdateOperationsInput | $Enums.Prioridade
    status?: EnumStatusOSFieldUpdateOperationsInput | $Enums.StatusOS
    fotos?: OrdemServicoUpdatefotosInput | string[]
    fotos_conclusao?: OrdemServicoUpdatefotos_conclusaoInput | string[]
    motivo_pausa?: NullableStringFieldUpdateOperationsInput | string | null
    motivo_cancelamento?: NullableStringFieldUpdateOperationsInput | string | null
    data_limite_sla?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    iniciado_em?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    concluido_em?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    criado_em?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizado?: DateTimeFieldUpdateOperationsInput | Date | string
    predio?: PredioUpdateOneRequiredWithoutOrdens_servicoNestedInput
    tecnico?: UsuarioUpdateOneWithoutChamados_atribuidosNestedInput
    ordem_vinculada?: OrdemServicoUpdateOneWithoutOrdens_derivadasNestedInput
    ordens_derivadas?: OrdemServicoUpdateManyWithoutOrdem_vinculadaNestedInput
  }

  export type OrdemServicoUncheckedUpdateWithoutSolicitanteInput = {
    id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    titulo?: StringFieldUpdateOperationsInput | string
    descricao?: StringFieldUpdateOperationsInput | string
    prioridade?: EnumPrioridadeFieldUpdateOperationsInput | $Enums.Prioridade
    status?: EnumStatusOSFieldUpdateOperationsInput | $Enums.StatusOS
    predio_id?: StringFieldUpdateOperationsInput | string
    tecnico_atribuido_id?: NullableStringFieldUpdateOperationsInput | string | null
    fotos?: OrdemServicoUpdatefotosInput | string[]
    fotos_conclusao?: OrdemServicoUpdatefotos_conclusaoInput | string[]
    motivo_pausa?: NullableStringFieldUpdateOperationsInput | string | null
    motivo_cancelamento?: NullableStringFieldUpdateOperationsInput | string | null
    data_limite_sla?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    iniciado_em?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    concluido_em?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    ordem_vinculada_id?: NullableStringFieldUpdateOperationsInput | string | null
    criado_em?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizado?: DateTimeFieldUpdateOperationsInput | Date | string
    ordens_derivadas?: OrdemServicoUncheckedUpdateManyWithoutOrdem_vinculadaNestedInput
  }

  export type OrdemServicoUncheckedUpdateManyWithoutSolicitanteInput = {
    id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    titulo?: StringFieldUpdateOperationsInput | string
    descricao?: StringFieldUpdateOperationsInput | string
    prioridade?: EnumPrioridadeFieldUpdateOperationsInput | $Enums.Prioridade
    status?: EnumStatusOSFieldUpdateOperationsInput | $Enums.StatusOS
    predio_id?: StringFieldUpdateOperationsInput | string
    tecnico_atribuido_id?: NullableStringFieldUpdateOperationsInput | string | null
    fotos?: OrdemServicoUpdatefotosInput | string[]
    fotos_conclusao?: OrdemServicoUpdatefotos_conclusaoInput | string[]
    motivo_pausa?: NullableStringFieldUpdateOperationsInput | string | null
    motivo_cancelamento?: NullableStringFieldUpdateOperationsInput | string | null
    data_limite_sla?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    iniciado_em?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    concluido_em?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    ordem_vinculada_id?: NullableStringFieldUpdateOperationsInput | string | null
    criado_em?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizado?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrdemServicoUpdateWithoutTecnicoInput = {
    id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    titulo?: StringFieldUpdateOperationsInput | string
    descricao?: StringFieldUpdateOperationsInput | string
    prioridade?: EnumPrioridadeFieldUpdateOperationsInput | $Enums.Prioridade
    status?: EnumStatusOSFieldUpdateOperationsInput | $Enums.StatusOS
    fotos?: OrdemServicoUpdatefotosInput | string[]
    fotos_conclusao?: OrdemServicoUpdatefotos_conclusaoInput | string[]
    motivo_pausa?: NullableStringFieldUpdateOperationsInput | string | null
    motivo_cancelamento?: NullableStringFieldUpdateOperationsInput | string | null
    data_limite_sla?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    iniciado_em?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    concluido_em?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    criado_em?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizado?: DateTimeFieldUpdateOperationsInput | Date | string
    predio?: PredioUpdateOneRequiredWithoutOrdens_servicoNestedInput
    solicitante?: UsuarioUpdateOneRequiredWithoutChamados_solicitadosNestedInput
    ordem_vinculada?: OrdemServicoUpdateOneWithoutOrdens_derivadasNestedInput
    ordens_derivadas?: OrdemServicoUpdateManyWithoutOrdem_vinculadaNestedInput
  }

  export type OrdemServicoUncheckedUpdateWithoutTecnicoInput = {
    id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    titulo?: StringFieldUpdateOperationsInput | string
    descricao?: StringFieldUpdateOperationsInput | string
    prioridade?: EnumPrioridadeFieldUpdateOperationsInput | $Enums.Prioridade
    status?: EnumStatusOSFieldUpdateOperationsInput | $Enums.StatusOS
    predio_id?: StringFieldUpdateOperationsInput | string
    solicitante_id?: StringFieldUpdateOperationsInput | string
    fotos?: OrdemServicoUpdatefotosInput | string[]
    fotos_conclusao?: OrdemServicoUpdatefotos_conclusaoInput | string[]
    motivo_pausa?: NullableStringFieldUpdateOperationsInput | string | null
    motivo_cancelamento?: NullableStringFieldUpdateOperationsInput | string | null
    data_limite_sla?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    iniciado_em?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    concluido_em?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    ordem_vinculada_id?: NullableStringFieldUpdateOperationsInput | string | null
    criado_em?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizado?: DateTimeFieldUpdateOperationsInput | Date | string
    ordens_derivadas?: OrdemServicoUncheckedUpdateManyWithoutOrdem_vinculadaNestedInput
  }

  export type OrdemServicoUncheckedUpdateManyWithoutTecnicoInput = {
    id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    titulo?: StringFieldUpdateOperationsInput | string
    descricao?: StringFieldUpdateOperationsInput | string
    prioridade?: EnumPrioridadeFieldUpdateOperationsInput | $Enums.Prioridade
    status?: EnumStatusOSFieldUpdateOperationsInput | $Enums.StatusOS
    predio_id?: StringFieldUpdateOperationsInput | string
    solicitante_id?: StringFieldUpdateOperationsInput | string
    fotos?: OrdemServicoUpdatefotosInput | string[]
    fotos_conclusao?: OrdemServicoUpdatefotos_conclusaoInput | string[]
    motivo_pausa?: NullableStringFieldUpdateOperationsInput | string | null
    motivo_cancelamento?: NullableStringFieldUpdateOperationsInput | string | null
    data_limite_sla?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    iniciado_em?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    concluido_em?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    ordem_vinculada_id?: NullableStringFieldUpdateOperationsInput | string | null
    criado_em?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizado?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuditoriaLogUpdateWithoutUsuarioInput = {
    id?: StringFieldUpdateOperationsInput | string
    entidade_afetada?: StringFieldUpdateOperationsInput | string
    entidade_id?: StringFieldUpdateOperationsInput | string
    acao?: EnumAuditActionFieldUpdateOperationsInput | $Enums.AuditAction
    dados_antigos?: NullableJsonNullValueInput | InputJsonValue
    dados_novos?: NullableJsonNullValueInput | InputJsonValue
    criado_em?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuditoriaLogUncheckedUpdateWithoutUsuarioInput = {
    id?: StringFieldUpdateOperationsInput | string
    entidade_afetada?: StringFieldUpdateOperationsInput | string
    entidade_id?: StringFieldUpdateOperationsInput | string
    acao?: EnumAuditActionFieldUpdateOperationsInput | $Enums.AuditAction
    dados_antigos?: NullableJsonNullValueInput | InputJsonValue
    dados_novos?: NullableJsonNullValueInput | InputJsonValue
    criado_em?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuditoriaLogUncheckedUpdateManyWithoutUsuarioInput = {
    id?: StringFieldUpdateOperationsInput | string
    entidade_afetada?: StringFieldUpdateOperationsInput | string
    entidade_id?: StringFieldUpdateOperationsInput | string
    acao?: EnumAuditActionFieldUpdateOperationsInput | $Enums.AuditAction
    dados_antigos?: NullableJsonNullValueInput | InputJsonValue
    dados_novos?: NullableJsonNullValueInput | InputJsonValue
    criado_em?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrdemServicoCreateManyPredioInput = {
    id?: string
    codigo?: string
    titulo: string
    descricao: string
    prioridade?: $Enums.Prioridade
    status?: $Enums.StatusOS
    solicitante_id: string
    tecnico_atribuido_id?: string | null
    fotos?: OrdemServicoCreatefotosInput | string[]
    fotos_conclusao?: OrdemServicoCreatefotos_conclusaoInput | string[]
    motivo_pausa?: string | null
    motivo_cancelamento?: string | null
    data_limite_sla?: Date | string | null
    iniciado_em?: Date | string | null
    concluido_em?: Date | string | null
    ordem_vinculada_id?: string | null
    criado_em?: Date | string
    atualizado?: Date | string
  }

  export type OrdemServicoUpdateWithoutPredioInput = {
    id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    titulo?: StringFieldUpdateOperationsInput | string
    descricao?: StringFieldUpdateOperationsInput | string
    prioridade?: EnumPrioridadeFieldUpdateOperationsInput | $Enums.Prioridade
    status?: EnumStatusOSFieldUpdateOperationsInput | $Enums.StatusOS
    fotos?: OrdemServicoUpdatefotosInput | string[]
    fotos_conclusao?: OrdemServicoUpdatefotos_conclusaoInput | string[]
    motivo_pausa?: NullableStringFieldUpdateOperationsInput | string | null
    motivo_cancelamento?: NullableStringFieldUpdateOperationsInput | string | null
    data_limite_sla?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    iniciado_em?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    concluido_em?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    criado_em?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizado?: DateTimeFieldUpdateOperationsInput | Date | string
    solicitante?: UsuarioUpdateOneRequiredWithoutChamados_solicitadosNestedInput
    tecnico?: UsuarioUpdateOneWithoutChamados_atribuidosNestedInput
    ordem_vinculada?: OrdemServicoUpdateOneWithoutOrdens_derivadasNestedInput
    ordens_derivadas?: OrdemServicoUpdateManyWithoutOrdem_vinculadaNestedInput
  }

  export type OrdemServicoUncheckedUpdateWithoutPredioInput = {
    id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    titulo?: StringFieldUpdateOperationsInput | string
    descricao?: StringFieldUpdateOperationsInput | string
    prioridade?: EnumPrioridadeFieldUpdateOperationsInput | $Enums.Prioridade
    status?: EnumStatusOSFieldUpdateOperationsInput | $Enums.StatusOS
    solicitante_id?: StringFieldUpdateOperationsInput | string
    tecnico_atribuido_id?: NullableStringFieldUpdateOperationsInput | string | null
    fotos?: OrdemServicoUpdatefotosInput | string[]
    fotos_conclusao?: OrdemServicoUpdatefotos_conclusaoInput | string[]
    motivo_pausa?: NullableStringFieldUpdateOperationsInput | string | null
    motivo_cancelamento?: NullableStringFieldUpdateOperationsInput | string | null
    data_limite_sla?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    iniciado_em?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    concluido_em?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    ordem_vinculada_id?: NullableStringFieldUpdateOperationsInput | string | null
    criado_em?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizado?: DateTimeFieldUpdateOperationsInput | Date | string
    ordens_derivadas?: OrdemServicoUncheckedUpdateManyWithoutOrdem_vinculadaNestedInput
  }

  export type OrdemServicoUncheckedUpdateManyWithoutPredioInput = {
    id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    titulo?: StringFieldUpdateOperationsInput | string
    descricao?: StringFieldUpdateOperationsInput | string
    prioridade?: EnumPrioridadeFieldUpdateOperationsInput | $Enums.Prioridade
    status?: EnumStatusOSFieldUpdateOperationsInput | $Enums.StatusOS
    solicitante_id?: StringFieldUpdateOperationsInput | string
    tecnico_atribuido_id?: NullableStringFieldUpdateOperationsInput | string | null
    fotos?: OrdemServicoUpdatefotosInput | string[]
    fotos_conclusao?: OrdemServicoUpdatefotos_conclusaoInput | string[]
    motivo_pausa?: NullableStringFieldUpdateOperationsInput | string | null
    motivo_cancelamento?: NullableStringFieldUpdateOperationsInput | string | null
    data_limite_sla?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    iniciado_em?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    concluido_em?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    ordem_vinculada_id?: NullableStringFieldUpdateOperationsInput | string | null
    criado_em?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizado?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrdemServicoCreateManyOrdem_vinculadaInput = {
    id?: string
    codigo?: string
    titulo: string
    descricao: string
    prioridade?: $Enums.Prioridade
    status?: $Enums.StatusOS
    predio_id: string
    solicitante_id: string
    tecnico_atribuido_id?: string | null
    fotos?: OrdemServicoCreatefotosInput | string[]
    fotos_conclusao?: OrdemServicoCreatefotos_conclusaoInput | string[]
    motivo_pausa?: string | null
    motivo_cancelamento?: string | null
    data_limite_sla?: Date | string | null
    iniciado_em?: Date | string | null
    concluido_em?: Date | string | null
    criado_em?: Date | string
    atualizado?: Date | string
  }

  export type OrdemServicoUpdateWithoutOrdem_vinculadaInput = {
    id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    titulo?: StringFieldUpdateOperationsInput | string
    descricao?: StringFieldUpdateOperationsInput | string
    prioridade?: EnumPrioridadeFieldUpdateOperationsInput | $Enums.Prioridade
    status?: EnumStatusOSFieldUpdateOperationsInput | $Enums.StatusOS
    fotos?: OrdemServicoUpdatefotosInput | string[]
    fotos_conclusao?: OrdemServicoUpdatefotos_conclusaoInput | string[]
    motivo_pausa?: NullableStringFieldUpdateOperationsInput | string | null
    motivo_cancelamento?: NullableStringFieldUpdateOperationsInput | string | null
    data_limite_sla?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    iniciado_em?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    concluido_em?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    criado_em?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizado?: DateTimeFieldUpdateOperationsInput | Date | string
    predio?: PredioUpdateOneRequiredWithoutOrdens_servicoNestedInput
    solicitante?: UsuarioUpdateOneRequiredWithoutChamados_solicitadosNestedInput
    tecnico?: UsuarioUpdateOneWithoutChamados_atribuidosNestedInput
    ordens_derivadas?: OrdemServicoUpdateManyWithoutOrdem_vinculadaNestedInput
  }

  export type OrdemServicoUncheckedUpdateWithoutOrdem_vinculadaInput = {
    id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    titulo?: StringFieldUpdateOperationsInput | string
    descricao?: StringFieldUpdateOperationsInput | string
    prioridade?: EnumPrioridadeFieldUpdateOperationsInput | $Enums.Prioridade
    status?: EnumStatusOSFieldUpdateOperationsInput | $Enums.StatusOS
    predio_id?: StringFieldUpdateOperationsInput | string
    solicitante_id?: StringFieldUpdateOperationsInput | string
    tecnico_atribuido_id?: NullableStringFieldUpdateOperationsInput | string | null
    fotos?: OrdemServicoUpdatefotosInput | string[]
    fotos_conclusao?: OrdemServicoUpdatefotos_conclusaoInput | string[]
    motivo_pausa?: NullableStringFieldUpdateOperationsInput | string | null
    motivo_cancelamento?: NullableStringFieldUpdateOperationsInput | string | null
    data_limite_sla?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    iniciado_em?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    concluido_em?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    criado_em?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizado?: DateTimeFieldUpdateOperationsInput | Date | string
    ordens_derivadas?: OrdemServicoUncheckedUpdateManyWithoutOrdem_vinculadaNestedInput
  }

  export type OrdemServicoUncheckedUpdateManyWithoutOrdem_vinculadaInput = {
    id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    titulo?: StringFieldUpdateOperationsInput | string
    descricao?: StringFieldUpdateOperationsInput | string
    prioridade?: EnumPrioridadeFieldUpdateOperationsInput | $Enums.Prioridade
    status?: EnumStatusOSFieldUpdateOperationsInput | $Enums.StatusOS
    predio_id?: StringFieldUpdateOperationsInput | string
    solicitante_id?: StringFieldUpdateOperationsInput | string
    tecnico_atribuido_id?: NullableStringFieldUpdateOperationsInput | string | null
    fotos?: OrdemServicoUpdatefotosInput | string[]
    fotos_conclusao?: OrdemServicoUpdatefotos_conclusaoInput | string[]
    motivo_pausa?: NullableStringFieldUpdateOperationsInput | string | null
    motivo_cancelamento?: NullableStringFieldUpdateOperationsInput | string | null
    data_limite_sla?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    iniciado_em?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    concluido_em?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    criado_em?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizado?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}
import * as SQLite from 'expo-sqlite';
import { OrdemServicoItem, SyncMutation } from '../types/domain';

let dbInstance: SQLite.SQLiteDatabase | null = null;

export function getDatabase(): SQLite.SQLiteDatabase {
  if (!dbInstance) {
    dbInstance = SQLite.openDatabaseSync('predial_offline.db');
    initDatabaseSchema(dbInstance);
  }
  return dbInstance;
}

function initDatabaseSchema(db: SQLite.SQLiteDatabase) {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS cached_ordens_servico (
      id TEXT PRIMARY KEY,
      codigo TEXT NOT NULL,
      titulo TEXT NOT NULL,
      descricao TEXT NOT NULL,
      status TEXT NOT NULL,
      prioridade TEXT NOT NULL,
      categoria TEXT,
      predio_id TEXT,
      predio_nome TEXT,
      predio_endereco TEXT,
      predio_lat REAL,
      predio_lng REAL,
      iniciado_em TEXT,
      motivo_pausa TEXT,
      tempo_pausa_minutos INTEGER DEFAULT 0,
      fotos_conclusao TEXT,
      data_limite_sla TEXT,
      atualizado_em TEXT
    );

    CREATE TABLE IF NOT EXISTS sync_queue (
      id TEXT PRIMARY KEY,
      tipo TEXT NOT NULL,
      os_id TEXT NOT NULL,
      payload TEXT NOT NULL,
      status TEXT DEFAULT 'PENDENTE',
      tentativas INTEGER DEFAULT 0,
      criado_em TEXT NOT NULL
    );
  `);
}

export const sqliteService = {
  // Salvar/Atualizar lote de OSs baixadas do servidor
  salvarOrdensCache(ordens: OrdemServicoItem[]) {
    const db = getDatabase();
    for (const os of ordens) {
      db.runSync(
        `INSERT OR REPLACE INTO cached_ordens_servico (
          id, codigo, titulo, descricao, status, prioridade, categoria,
          predio_id, predio_nome, predio_endereco, predio_lat, predio_lng,
          iniciado_em, motivo_pausa, tempo_pausa_minutos, fotos_conclusao,
          data_limite_sla, atualizado_em
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          os.id,
          os.codigo,
          os.titulo,
          os.descricao,
          os.status,
          os.prioridade,
          os.categoria || 'GERAL',
          os.predio_id,
          os.predio?.nome || 'Unidade',
          os.predio?.endereco || '',
          os.predio?.latitude ?? null,
          os.predio?.longitude ?? null,
          os.iniciado_em || null,
          os.motivo_pausa || null,
          os.tempo_pausa_minutos || 0,
          JSON.stringify(os.fotos_conclusao || []),
          os.data_limite_sla || null,
          new Date().toISOString(),
        ],
      );
    }
  },

  // Obter todas as OSs do cache local
  obterOrdensCache(): OrdemServicoItem[] {
    const db = getDatabase();
    const rows = db.getAllSync<any>(
      `SELECT * FROM cached_ordens_servico ORDER BY 
        CASE prioridade 
          WHEN 'URGENTE' THEN 1 
          WHEN 'ALTA' THEN 2 
          WHEN 'MEDIA' THEN 3 
          ELSE 4 
        END, data_limite_sla ASC`,
    );

    return rows.map((r) => ({
      id: r.id,
      codigo: r.codigo,
      titulo: r.titulo,
      descricao: r.descricao,
      status: r.status,
      prioridade: r.prioridade,
      categoria: r.categoria,
      predio_id: r.predio_id,
      predio: {
        id: r.predio_id,
        nome: r.predio_nome,
        tipo: 'ADMINISTRATIVO',
        endereco: r.predio_endereco,
        latitude: r.predio_lat,
        longitude: r.predio_lng,
      },
      fotos: [],
      fotos_conclusao: r.fotos_conclusao ? JSON.parse(r.fotos_conclusao) : [],
      motivo_pausa: r.motivo_pausa,
      iniciado_em: r.iniciado_em,
      tempo_pausa_minutos: r.tempo_pausa_minutos,
      sla_violado: false,
      data_limite_sla: r.data_limite_sla,
      criado_em: r.atualizado_em,
      atualizado: r.atualizado_em,
    }));
  },

  // Atualizar status de uma OS localmente de forma imediata (Otimista)
  atualizarStatusLocal(osId: string, status: string, camposExtras?: Record<string, any>) {
    const db = getDatabase();
    db.runSync(
      `UPDATE cached_ordens_servico SET status = ?, motivo_pausa = coalesce(?, motivo_pausa) WHERE id = ?`,
      [status, camposExtras?.motivo_pausa ?? null, osId],
    );
  },

  // Enfileirar ação na Outbox Queue para despacho
  enfileirarMutacao(tipo: SyncMutation['tipo'], osId: string, payload: Record<string, any>) {
    const db = getDatabase();
    const id = `mut_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    db.runSync(
      `INSERT INTO sync_queue (id, tipo, os_id, payload, status, tentativas, criado_em)
       VALUES (?, ?, ?, ?, 'PENDENTE', 0, ?)`,
      [id, tipo, osId, JSON.stringify(payload), new Date().toISOString()],
    );
  },

  // Obter mutações pendentes para envio
  obterMutacoesPendentes(): SyncMutation[] {
    const db = getDatabase();
    const rows = db.getAllSync<any>(
      `SELECT * FROM sync_queue WHERE status = 'PENDENTE' ORDER BY criado_em ASC`,
    );
    return rows.map((r) => ({
      id: r.id,
      tipo: r.tipo,
      osId: r.os_id,
      payload: r.payload,
      status: r.status,
      tentativas: r.tentativas,
      criadoEm: r.criado_em,
    }));
  },

  // Remover da fila após sucesso
  removerMutacao(id: string) {
    const db = getDatabase();
    db.runSync(`DELETE FROM sync_queue WHERE id = ?`, [id]);
  },

  // Quantidade de itens na fila
  obterContagemPendentes(): number {
    const db = getDatabase();
    const res = db.getFirstSync<{ count: number }>(
      `SELECT COUNT(*) as count FROM sync_queue WHERE status = 'PENDENTE'`,
    );
    return res?.count ?? 0;
  },
};

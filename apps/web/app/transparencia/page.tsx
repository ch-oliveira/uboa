'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, ChevronsLeftRight, Download, Search, X } from 'lucide-react';

import { Sticker } from '@/stickers/Sticker';
import {
  bulb,
  chat,
  cloud,
  coins,
  folder,
  heart,
  padlock,
  phone,
  pin,
  search as searchSticker,
  streak,
  trophy,
} from '@/stickers/icons';
import { PALETTES, brand, type Palette } from '@/stickers/fun';
import {
  BAIRROS_LISTA,
  CATEGORIAS_LISTA,
  CATEGORIA_LABEL,
  DEPOIMENTOS_CIDADAOS,
  METRICAS_TRANSPARENCIA as M,
  SERVICOS_PUBLICOS,
  type ServicoPublico,
} from '@/lib/transparencia-data';

/* ─── Motion ─────────────────────────────────────────────────────────────── */

const ease = [0.16, 1, 0.3, 1] as const;
const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.7, ease },
};

/* ─── Sticker palettes ───────────────────────────────────────────────────── */

const PALETTE_OPTIONS: ReadonlyArray<{ id: string; label: string; palette: Palette }> = [
  { id: 'riso', label: 'Riso', palette: PALETTES.riso },
  { id: 'candy', label: 'Candy', palette: PALETTES.candy },
  { id: 'sunset', label: 'Sunset', palette: PALETTES.sunset },
  { id: 'aqua', label: 'Aqua', palette: PALETTES.aqua },
  { id: 'matcha', label: 'Matcha', palette: PALETTES.matcha },
  { id: 'urboa', label: 'Urboa', palette: { ...PALETTES.riso, ...brand('#2563EB', '#0A2540') } },
];

const brl = (v: number, digits = 2) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: digits, maximumFractionDigits: digits });

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default function TransparenciaPage() {
  const [paletteId, setPaletteId] = useState('riso');
  const palette = PALETTE_OPTIONS.find((p) => p.id === paletteId)?.palette ?? PALETTES.riso;

  const [categoria, setCategoria] = useState<string>('todos');
  const [bairro, setBairro] = useState<string>(BAIRROS_LISTA[0]);
  const [busca, setBusca] = useState('');
  const [aplaudidos, setAplaudidos] = useState<Record<string, boolean>>({});
  const [protocolo, setProtocolo] = useState('');

  const servicos = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return SERVICOS_PUBLICOS.filter(
      (s) =>
        (categoria === 'todos' || s.categoria === categoria) &&
        (bairro === BAIRROS_LISTA[0] || s.bairro === bairro) &&
        (!q || `${s.titulo} ${s.local} ${s.bairro} ${s.protocolo}`.toLowerCase().includes(q)),
    );
  }, [categoria, bairro, busca]);

  const resultadoProtocolo = useMemo(() => {
    const q = protocolo.trim().toLowerCase();
    if (q.length < 3) return undefined;
    return (
      SERVICOS_PUBLICOS.find(
        (s) => s.protocolo.toLowerCase().includes(q) || s.local.toLowerCase().includes(q),
      ) ?? null
    );
  }, [protocolo]);

  const limparFiltros = () => {
    setCategoria('todos');
    setBairro(BAIRROS_LISTA[0]);
    setBusca('');
  };

  // Lei de Acesso à Informação: open data as CSV, generated in the browser
  const baixarCSV = () => {
    const header = ['protocolo', 'servico', 'local', 'bairro', 'categoria', 'tempo_atendimento', 'custo_reais', 'validado_por'];
    const rows = SERVICOS_PUBLICOS.map((s) =>
      [s.protocolo, s.titulo, s.local, s.bairro, CATEGORIA_LABEL[s.categoria], s.tempoAtendimento, s.custoTotal.toFixed(2), s.validadoPor]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(';'),
    );
    const blob = new Blob(['\uFEFF' + [header.join(';'), ...rows].join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prestacao-de-contas-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* ─── Header ─── */}
      <header className="sticky top-0 z-40 border-b border-[var(--tp-line)] bg-[var(--tp-bg)]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-4 sm:px-6">
          <Link href="/landing" className="flex items-center gap-2.5 whitespace-nowrap" aria-label="Urboa, início">
            <span className="tp-display flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--tp-ink)] text-lg font-bold text-white">
              u.
            </span>
            <span className="tp-display text-lg font-bold">Urboa</span>
            <span className="hidden text-sm text-[var(--tp-text-3)] sm:inline">/ prestação de contas</span>
          </Link>

          <nav aria-label="Seções" className="hidden items-center gap-1 text-sm font-medium text-[var(--tp-text-2)] lg:flex">
            {[
              ['#numeros', 'Números'],
              ['#obras', 'Antes e depois'],
              ['#como-funciona', 'Como funciona'],
              ['#rastrear', 'Rastrear'],
            ].map(([href, label]) => (
              <a key={href} href={href} className="whitespace-nowrap rounded-full px-3.5 py-2 transition-colors hover:bg-[var(--tp-ink)]/5 hover:text-[var(--tp-ink)]">
                {label}
              </a>
            ))}
          </nav>

          <Link
            id="header-avisar"
            href="/abrir-chamado"
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-[var(--tp-ink)] px-4 py-2 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 active:translate-y-0"
          >
            Avisar um problema
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </header>

      <main>
        {/* ─── Hero ─── */}
        <section className="relative overflow-hidden" aria-labelledby="hero-title">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:pb-28 lg:pt-20">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease }}>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm font-medium text-[var(--tp-text-2)] shadow-[var(--tp-shadow-1)]">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                Atualizado {M.atualizadoEm}
              </span>

              <h1 id="hero-title" className="tp-display mt-6 text-[40px] font-extrabold leading-[1.02] sm:text-6xl lg:text-[72px]">
                Cada conserto da cidade, com <span className="tp-marker">foto e preço</span>.
              </h1>

              <p className="mt-6 max-w-[34rem] text-lg leading-relaxed text-[var(--tp-text-2)]">
                Lâmpada trocada, torneira arrumada, rampa nova. Tudo que a prefeitura resolveu nas escolas, postos e praças aparece aqui, com antes e depois e quanto custou.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  id="hero-ver-obras"
                  href="#obras"
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--tp-ink)] px-6 py-3.5 text-base font-semibold text-white transition-transform hover:-translate-y-0.5"
                >
                  Ver o que foi feito
                  <ArrowRight size={18} />
                </a>
                <button
                  id="hero-baixar-csv"
                  onClick={baixarCSV}
                  className="inline-flex items-center gap-2 rounded-full px-5 py-3.5 text-base font-semibold text-[var(--tp-ink)] transition-colors hover:bg-[var(--tp-ink)]/5"
                >
                  <Download size={18} />
                  Baixar os dados
                </button>
              </div>

              <dl className="mt-12 flex flex-wrap gap-x-10 gap-y-4">
                {[
                  [M.totalResolvidos.toLocaleString('pt-BR'), 'consertos no ano'],
                  [`${M.taxaSla.toLocaleString('pt-BR')}%`, 'dentro do prazo'],
                  [String(M.escolasAtendidas), 'escolas atendidas'],
                ].map(([valor, label]) => (
                  <div key={label}>
                    <dt className="sr-only">{label}</dt>
                    <dd className="tp-display text-3xl font-bold">{valor}</dd>
                    <dd className="text-sm text-[var(--tp-text-3)]">{label}</dd>
                  </div>
                ))}
              </dl>
            </motion.div>

            {/* Sticker composition */}
            <div className="relative mx-auto w-full max-w-[460px]">
              <div className="relative aspect-square">
                <div className="absolute inset-[8%] rounded-full bg-[var(--tp-butter)]" aria-hidden="true" />
                <div className="absolute inset-[18%]">
                  <Sticker icon={trophy} palette={palette} enter={0.15} replayOnHover label="Troféu" />
                </div>
                <FloatingSticker className="left-[-2%] top-[4%]" icon={bulb} palette={palette} enter={0.35} tag={`${M.lampadasAcesas.toLocaleString('pt-BR')} lâmpadas`} />
                <FloatingSticker className="right-[-4%] top-[22%]" icon={coins} palette={palette} enter={0.5} tag="R$ 584 mil poupados" />
                <FloatingSticker className="bottom-[2%] left-[6%]" icon={heart} palette={palette} enter={0.65} tag={`nota ${M.satisfacaoMedia.toLocaleString('pt-BR')}`} />
              </div>

              <PaletteDots value={paletteId} onChange={setPaletteId} />
            </div>
          </div>
        </section>

        {/* ─── Números (bento) ─── */}
        <section id="numeros" className="scroll-mt-20 px-4 pb-24 sm:px-6" aria-labelledby="numeros-title">
          <div className="mx-auto max-w-6xl">
            <SectionTitle id="numeros-title" kicker="O placar" title="Os números que saíram do papel" />

            <div className="mt-10 grid auto-rows-[minmax(220px,auto)] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <motion.div {...reveal} className="relative flex flex-col justify-end overflow-hidden rounded-[28px] bg-[var(--tp-butter)] p-8 sm:col-span-2 lg:row-span-2">
                <div className="absolute right-4 top-4 w-44 sm:w-56">
                  <Sticker icon={folder} palette={palette} replayOnHover label="Pasta de chamados" />
                </div>
                <p className="tp-display text-6xl font-extrabold sm:text-7xl">{M.totalResolvidos.toLocaleString('pt-BR')}</p>
                <p className="mt-2 text-xl font-semibold">chamados resolvidos este ano</p>
                <p className="mt-2 max-w-sm text-base text-[hsl(40,35%,25%)]">
                  Todos com foto e com o “ok” de quem pediu. Sem isso, o chamado não fecha.
                </p>
              </motion.div>

              <StatTile tone="var(--tp-sky)" textTone="hsl(214,45%,28%)" icon={bulb} palette={palette} value={M.lampadasAcesas.toLocaleString('pt-BR')} label="lâmpadas trocadas" note="Salas, quadras e praças claras de novo." />
              <StatTile tone="var(--tp-mint)" textTone="hsl(150,35%,24%)" icon={cloud} palette={palette} value="1,8 mi" label="litros de água poupados" note="Vazamento arrumado é conta menor." />
              <StatTile tone="var(--tp-lilac)" textTone="hsl(260,30%,32%)" icon={streak} palette={palette} value={`${M.tempoMedioHoras.toLocaleString('pt-BR')}h`} label="pra resolver urgência" note="Antes eram semanas no protocolo." />
              <StatTile tone="var(--tp-peach)" textTone="hsl(20,45%,30%)" icon={coins} palette={palette} value="R$ 584 mil" label="economizados" note="Contrato travado no limite do empenho." />
            </div>
          </div>
        </section>

        {/* ─── Antes e depois ─── */}
        <section id="obras" className="scroll-mt-20 px-4 pb-24 sm:px-6" aria-labelledby="obras-title">
          <div className="mx-auto max-w-6xl">
            <SectionTitle id="obras-title" kicker="Mão na massa" title="Olha o antes e depois" subtitle="Arrasta a barrinha da foto pra comparar. Aqui não tem maquiagem de relatório." />

            {/* Filters */}
            <div className="mt-10 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="tp-scroll-x -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:px-0" role="group" aria-label="Filtrar por tipo">
                {CATEGORIAS_LISTA.map((c) => (
                  <button
                    key={c.id}
                    id={`filtro-${c.id}`}
                    onClick={() => setCategoria(c.id)}
                    aria-pressed={categoria === c.id}
                    className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                      categoria === c.id ? 'bg-[var(--tp-ink)] text-white' : 'bg-white text-[var(--tp-text-2)] shadow-[var(--tp-shadow-1)] hover:text-[var(--tp-ink)]'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <label className="sr-only" htmlFor="filtro-bairro">Bairro</label>
                <select
                  id="filtro-bairro"
                  value={bairro}
                  onChange={(e) => setBairro(e.target.value)}
                  className="h-10 rounded-full bg-white px-4 text-sm font-medium text-[var(--tp-ink)] shadow-[var(--tp-shadow-1)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--tp-ink)]"
                >
                  {BAIRROS_LISTA.map((b) => (
                    <option key={b}>{b}</option>
                  ))}
                </select>
                <div className="relative flex-1 lg:w-64 lg:flex-none">
                  <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--tp-text-3)]" />
                  <label className="sr-only" htmlFor="filtro-busca">Buscar</label>
                  <input
                    id="filtro-busca"
                    type="search"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    placeholder="Escola, praça, bairro…"
                    className="h-10 w-full rounded-full bg-white pl-10 pr-4 text-sm shadow-[var(--tp-shadow-1)] outline-none placeholder:text-[var(--tp-text-3)] focus-visible:ring-2 focus-visible:ring-[var(--tp-ink)]"
                  />
                </div>
              </div>
            </div>

            {servicos.length === 0 ? (
              <div className="mt-10 flex flex-col items-center rounded-[28px] bg-white px-6 py-14 text-center shadow-[var(--tp-shadow-1)]">
                <div className="w-28">
                  <Sticker icon={searchSticker} palette={palette} label="Lupa" />
                </div>
                <p className="tp-display mt-4 text-2xl font-bold">Nada por aqui… ainda</p>
                <p className="mt-1 text-[var(--tp-text-2)]">Tenta outro bairro ou limpa a busca.</p>
                <button id="limpar-filtros" onClick={limparFiltros} className="mt-6 rounded-full bg-[var(--tp-ink)] px-5 py-2.5 text-sm font-semibold text-white">
                  Limpar filtros
                </button>
              </div>
            ) : (
              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {servicos.map((s, i) => (
                  <ServiceCard
                    key={s.id}
                    servico={s}
                    index={i}
                    aplaudido={!!aplaudidos[s.id]}
                    onAplaudir={() => setAplaudidos((p) => ({ ...p, [s.id]: !p[s.id] }))}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ─── Como funciona ─── */}
        <section id="como-funciona" className="scroll-mt-20 px-4 pb-24 sm:px-6" aria-labelledby="como-title">
          <div className="mx-auto max-w-6xl rounded-[40px] bg-white px-6 py-16 shadow-[var(--tp-shadow-1)] sm:px-12">
            <SectionTitle id="como-title" kicker="Sem gaveta" title="Do aviso ao conserto, em 5 passos" center />

            <div className="relative mt-14">
            <div className="tp-track absolute left-[10%] right-[10%] top-[60px] hidden h-[2px] lg:block" aria-hidden="true" />
            <ol className="relative grid gap-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-6">
              {[
                { icon: phone, t: 'Alguém avisa', d: 'A escola ou você, pelo celular, em menos de um minuto.' },
                { icon: folder, t: 'Ganha um prazo', d: 'Urgente tem 4 horas. O relógio começa a correr.' },
                { icon: pin, t: 'Técnico vai lá', d: 'Já sabe o problema e leva a peça certa.' },
                { icon: padlock, t: 'Quem pediu confere', d: 'Só fecha com foto e com o “ok” da unidade.' },
                { icon: trophy, t: 'Aparece aqui', d: 'Com o custo, pra qualquer um conferir.' },
              ].map((step, i) => (
                <motion.li key={step.t} {...reveal} transition={{ ...reveal.transition, delay: i * 0.06 }} className="relative flex flex-col items-center text-center">
                  <div className="relative w-[120px] rounded-full bg-white">
                    <Sticker icon={step.icon} palette={palette} replayOnHover label={step.t} />
                  </div>
                  <span className="tp-display mt-3 text-sm font-bold text-[var(--tp-text-3)]">Passo {i + 1}</span>
                  <h3 className="tp-display mt-1 text-xl font-bold">{step.t}</h3>
                  <p className="mt-2 max-w-[15rem] text-[15px] leading-relaxed text-[var(--tp-text-2)]">{step.d}</p>
                </motion.li>
              ))}
            </ol>
            </div>
          </div>
        </section>

        {/* ─── Rastrear ─── */}
        <section id="rastrear" className="scroll-mt-20 px-4 pb-24 sm:px-6" aria-labelledby="rastrear-title">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto w-28">
              <Sticker icon={searchSticker} palette={palette} replayOnHover label="Lupa" />
            </div>
            <h2 id="rastrear-title" className="tp-display mt-4 text-4xl font-extrabold sm:text-5xl">Tô de olho no meu chamado</h2>
            <p className="mx-auto mt-3 max-w-[30rem] text-lg text-[var(--tp-text-2)]">Digita o protocolo ou o nome do lugar e vê em que pé está.</p>

            <form
              className="mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-full bg-white p-2 shadow-[var(--tp-shadow-3)]"
              onSubmit={(e) => e.preventDefault()}
              role="search"
            >
              <Search size={20} className="ml-3 shrink-0 text-[var(--tp-text-3)]" />
              <label className="sr-only" htmlFor="rastrear-input">Protocolo ou local</label>
              <input
                id="rastrear-input"
                value={protocolo}
                onChange={(e) => setProtocolo(e.target.value)}
                placeholder="OS-104922 ou Praça da Matriz"
                className="h-11 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-[var(--tp-text-3)]"
              />
              {protocolo && (
                <button type="button" onClick={() => setProtocolo('')} aria-label="Limpar" className="rounded-full p-2 text-[var(--tp-text-3)] hover:bg-[var(--tp-ink)]/5">
                  <X size={16} />
                </button>
              )}
              <button id="rastrear-buscar" type="submit" className="h-11 shrink-0 rounded-full bg-[var(--tp-ink)] px-5 text-sm font-semibold text-white">
                Buscar
              </button>
            </form>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm text-[var(--tp-text-3)]">
              <span>Experimenta:</span>
              {['OS-104922', 'UBS Central', 'Praça da Matriz'].map((ex) => (
                <button key={ex} onClick={() => setProtocolo(ex)} className="rounded-full px-3 py-1 font-medium text-[var(--tp-ink)] underline decoration-[var(--tp-marker)] decoration-2 underline-offset-4 hover:bg-[var(--tp-ink)]/5">
                  {ex}
                </button>
              ))}
            </div>

            {resultadoProtocolo !== undefined && (
              <motion.div
                key={resultadoProtocolo?.id ?? 'vazio'}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease }}
                className="mx-auto mt-8 max-w-xl rounded-[28px] bg-white p-6 text-left shadow-[var(--tp-shadow-1)]"
                aria-live="polite"
              >
                {resultadoProtocolo ? (
                  <>
                    <div className="flex items-center justify-between gap-4">
                      <span className="inline-flex items-center gap-2 rounded-full bg-[var(--tp-mint)] px-3 py-1 text-sm font-semibold text-[hsl(150,45%,22%)]">
                        <span className="h-2 w-2 rounded-full bg-emerald-600" />
                        Resolvido {resultadoProtocolo.concluidoEm}
                      </span>
                      <span className="font-mono text-sm text-[var(--tp-text-3)]">{resultadoProtocolo.protocolo}</span>
                    </div>
                    <p className="tp-display mt-4 text-2xl font-bold">{resultadoProtocolo.titulo}</p>
                    <p className="mt-1 text-[var(--tp-text-2)]">
                      {resultadoProtocolo.local} · {resultadoProtocolo.bairro}
                    </p>
                    <ol className="mt-6 grid grid-cols-5 gap-1.5" aria-label="Etapas concluídas">
                      {['Aviso', 'Prazo', 'Técnico', 'Conferido', 'Público'].map((etapa) => (
                        <li key={etapa}>
                          <span className="block h-1.5 rounded-full bg-emerald-500" />
                          <span className="mt-2 block text-xs font-medium text-[var(--tp-text-2)]">{etapa}</span>
                        </li>
                      ))}
                    </ol>
                    <p className="mt-6 text-sm text-[var(--tp-text-2)]">
                      Resolvido em <strong className="text-[var(--tp-ink)]">{resultadoProtocolo.tempoAtendimento}</strong>, custou{' '}
                      <strong className="text-[var(--tp-ink)]">{brl(resultadoProtocolo.custoTotal)}</strong> e foi conferido por {resultadoProtocolo.validadoPor}.
                    </p>
                  </>
                ) : (
                  <p className="text-center text-[var(--tp-text-2)]">
                    Não achamos esse protocolo. Confere o número ou{' '}
                    <Link href="/abrir-chamado" className="font-semibold text-[var(--tp-ink)] underline decoration-[var(--tp-marker)] decoration-2 underline-offset-4">
                      abre um chamado novo
                    </Link>
                    .
                  </p>
                )}
              </motion.div>
            )}
          </div>
        </section>

        {/* ─── Depoimentos ─── */}
        <section className="px-4 pb-24 sm:px-6" aria-labelledby="voz-title">
          <div className="mx-auto max-w-6xl">
            <SectionTitle id="voz-title" kicker="Quem usa, conta" title="A voz de quem tá na ponta" />
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {DEPOIMENTOS_CIDADAOS.map((d, i) => (
                <motion.figure
                  key={d.nome}
                  {...reveal}
                  transition={{ ...reveal.transition, delay: i * 0.08 }}
                  className="flex flex-col justify-between rounded-[28px] p-8"
                  style={{ background: ['var(--tp-pink)', 'var(--tp-sky)', 'var(--tp-mint)'][i] }}
                >
                  <blockquote className="tp-display text-xl font-semibold leading-snug">“{d.texto}”</blockquote>
                  <figcaption className="mt-8 flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--tp-ink)] text-sm font-bold text-white">{d.avatar}</span>
                    <span>
                      <span className="block font-semibold">{d.nome}</span>
                      <span className="block text-sm text-[hsla(30,12%,10%,0.72)]">{d.cargo}</span>
                    </span>
                  </figcaption>
                </motion.figure>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CTA ─── */}
        <section className="px-4 pb-16 sm:px-6">
          <motion.div
            {...reveal}
            className="mx-auto grid max-w-6xl items-center gap-8 overflow-hidden rounded-[40px] bg-[var(--tp-butter)] px-8 py-12 sm:px-14 md:grid-cols-[auto_1fr]"
          >
            <div className="mx-auto w-40 md:w-48">
              <Sticker icon={chat} palette={palette} replayOnHover label="Balão de conversa" />
            </div>
            <div className="text-center md:text-left">
              <h2 className="tp-display text-4xl font-extrabold leading-tight sm:text-5xl">Viu algo quebrado? Avisa a gente.</h2>
              <p className="mt-3 max-w-[32rem] text-lg text-[hsl(40,35%,25%)]">
                Leva menos de um minuto. Você recebe um protocolo e acompanha tudo por aqui.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3 md:justify-start">
                <Link
                  id="cta-abrir-chamado"
                  href="/abrir-chamado"
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--tp-ink)] px-6 py-3.5 font-semibold text-white transition-transform hover:-translate-y-0.5"
                >
                  Abrir um chamado
                  <ArrowRight size={18} />
                </Link>
                <Link
                  id="cta-ouvidoria"
                  href="/ouvidoria"
                  className="inline-flex items-center gap-2 rounded-full px-5 py-3.5 font-semibold text-[var(--tp-ink)] transition-colors hover:bg-[var(--tp-ink)]/5"
                >
                  Ou liga 156
                </Link>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      {/* ─── Footer ─── */}
      <footer className="px-4 pb-10 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 border-t border-[var(--tp-line)] pt-8 text-sm text-[var(--tp-text-3)] md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <span className="tp-display font-bold text-[var(--tp-ink)]">Urboa</span>
            <Link href="/landing" className="hover:text-[var(--tp-ink)]">Sobre a plataforma</Link>
            <button onClick={baixarCSV} className="hover:text-[var(--tp-ink)]">Dados abertos (LAI)</button>
            <Link href="/login" className="hover:text-[var(--tp-ink)]">Acesso da prefeitura</Link>
          </div>
          <p className="max-w-md md:text-right">
            Made with fun-isometric by Kelvin Adithya (
            <a href="https://x.com/KelvinAdithya" target="_blank" rel="noopener noreferrer" className="underline hover:text-[var(--tp-ink)]">x.com/KelvinAdithya</a>
            ), heavily inspired by Slush (
            <a href="https://slush.app" target="_blank" rel="noopener noreferrer" className="underline hover:text-[var(--tp-ink)]">slush.app</a>
            ), more at{' '}
            <a href="https://skills.klvn.dev/fun-isometric" target="_blank" rel="noopener noreferrer" className="underline hover:text-[var(--tp-ink)]">skills.klvn.dev/fun-isometric</a>
          </p>
        </div>
      </footer>
    </>
  );
}

/* ─── Pieces ─────────────────────────────────────────────────────────────── */

function SectionTitle({ id, kicker, title, subtitle, center }: { id: string; kicker: string; title: string; subtitle?: string; center?: boolean }) {
  return (
    <motion.div {...reveal} className={center ? 'text-center' : ''}>
      <p className="tp-display text-base font-bold text-[var(--tp-text-3)]">{kicker}</p>
      <h2 id={id} className="tp-display mt-1 text-4xl font-extrabold leading-[1.05] sm:text-5xl">{title}</h2>
      {subtitle && <p className={`mt-3 max-w-[34rem] text-lg text-[var(--tp-text-2)] ${center ? 'mx-auto' : ''}`}>{subtitle}</p>}
    </motion.div>
  );
}

type StickerIcon = React.ComponentProps<typeof Sticker>['icon'];

function FloatingSticker({ className, icon, palette, enter, tag }: { className: string; icon: StickerIcon; palette: Palette; enter: number; tag: string }) {
  return (
    <div className={`absolute flex w-[34%] flex-col items-center ${className}`}>
      <Sticker icon={icon} palette={palette} enter={enter} replayOnHover label={tag} />
      <motion.span
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: enter + 0.3, duration: 0.5, ease }}
        className="-mt-2 whitespace-nowrap rounded-full bg-white px-3 py-1 text-[13px] font-semibold shadow-[var(--tp-shadow-3)]"
      >
        {tag}
      </motion.span>
    </div>
  );
}

function PaletteDots({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  return (
    <div className="mt-6 flex items-center justify-center gap-3" role="radiogroup" aria-label="Cor dos bonequinhos">
      <span className="text-sm font-medium text-[var(--tp-text-3)]">Pinta os bonequinhos:</span>
      <div className="flex gap-1.5">
        {PALETTE_OPTIONS.map((p) => (
          <button
            key={p.id}
            id={`paleta-${p.id}`}
            role="radio"
            aria-checked={value === p.id}
            aria-label={p.label}
            title={p.label}
            onClick={() => onChange(p.id)}
            className={`h-7 w-7 rounded-full transition-transform hover:scale-110 ${value === p.id ? 'ring-2 ring-[var(--tp-ink)] ring-offset-2 ring-offset-[var(--tp-bg)]' : ''}`}
            style={{ background: `conic-gradient(${p.palette.main} 0 33%, ${p.palette.gold} 0 66%, ${p.palette.ok} 0)` }}
          />
        ))}
      </div>
    </div>
  );
}

function StatTile({
  tone,
  textTone,
  icon,
  palette,
  value,
  label,
  note,
}: {
  tone: string;
  textTone: string;
  icon: StickerIcon;
  palette: Palette;
  value: string;
  label: string;
  note: string;
}) {
  return (
    <motion.div {...reveal} className="relative flex flex-col justify-end overflow-hidden rounded-[28px] p-6" style={{ background: tone }}>
      <div className="absolute right-2 top-2 w-24">
        <Sticker icon={icon} palette={palette} replayOnHover label={label} />
      </div>
      <p className="tp-display text-4xl font-extrabold">{value}</p>
      <p className="mt-1 font-semibold">{label}</p>
      <p className="mt-1 text-sm" style={{ color: textTone }}>{note}</p>
    </motion.div>
  );
}

function BeforeAfter({ src, alt, id }: { src: string; alt: string; id: string }) {
  const [pos, setPos] = useState(50);
  return (
    <div className="tp-ba relative aspect-[4/3] overflow-hidden rounded-[20px] bg-[var(--tp-line)]">
      <img src={src} alt={`Depois: ${alt}`} className="tp-ba-after" loading="lazy" decoding="async" />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <img src={src} alt={`Antes: ${alt}`} className="tp-ba-before" loading="lazy" decoding="async" />
      </div>

      <span className="absolute left-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">Antes</span>
      <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-[var(--tp-ink)] backdrop-blur-sm">Depois</span>

      <div className="pointer-events-none absolute inset-y-0 w-[3px] -translate-x-1/2 bg-white" style={{ left: `${pos}%` }}>
        <span className="tp-ba-knob absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[var(--tp-ink)] shadow-[var(--tp-shadow-3)]">
          <ChevronsLeftRight size={18} />
        </span>
      </div>

      <input
        id={id}
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-label={`Comparar antes e depois: ${alt}`}
      />
    </div>
  );
}

const CATEGORY_TONE: Record<ServicoPublico['categoria'], string> = {
  escola: 'var(--tp-butter)',
  saude: 'var(--tp-mint)',
  praca: 'var(--tp-sky)',
  acessibilidade: 'var(--tp-lilac)',
};

function ServiceCard({ servico: s, index, aplaudido, onAplaudir }: { servico: ServicoPublico; index: number; aplaudido: boolean; onAplaudir: () => void }) {
  return (
    <motion.article
      {...reveal}
      transition={{ ...reveal.transition, delay: (index % 3) * 0.06 }}
      className="flex flex-col rounded-[28px] bg-white p-2 shadow-[var(--tp-shadow-1)] transition-shadow hover:shadow-[var(--tp-shadow-3)]"
    >
      <BeforeAfter src={s.foto} alt={s.titulo} id={`comparar-${s.id}`} />

      <div className="flex flex-1 flex-col px-4 pb-4 pt-5">
        <div className="flex items-center gap-2 text-sm">
          <span className="rounded-full px-2.5 py-0.5 font-semibold" style={{ background: CATEGORY_TONE[s.categoria] }}>
            {CATEGORIA_LABEL[s.categoria]}
          </span>
          <span className="text-[var(--tp-text-3)]">resolvido em {s.tempoAtendimento}</span>
        </div>

        <h3 className="tp-display mt-3 text-[22px] font-bold leading-tight">{s.titulo}</h3>
        <p className="mt-1 text-sm text-[var(--tp-text-3)]">
          {s.local} · {s.bairro}
        </p>
        <p className="mt-3 text-[15px] leading-relaxed text-[var(--tp-text-2)]">{s.descricao}</p>

        <div className="mt-auto flex items-end justify-between gap-4 pt-6">
          <div>
            <p className="tp-display text-xl font-bold">{brl(s.custoTotal)}</p>
            <p className="text-xs text-[var(--tp-text-3)]">conferido por {s.validadoPor}</p>
          </div>
          <button
            id={`aplaudir-${s.id}`}
            onClick={onAplaudir}
            aria-pressed={aplaudido}
            aria-label={`Aplaudir: ${s.titulo}`}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition-all active:scale-95 ${
              aplaudido ? 'bg-[var(--tp-marker)] text-[var(--tp-ink)]' : 'bg-[var(--tp-bg)] text-[var(--tp-text-2)] hover:text-[var(--tp-ink)]'
            }`}
          >
            <span aria-hidden="true">👏</span>
            {(s.aplausos + (aplaudido ? 1 : 0)).toLocaleString('pt-BR')}
          </button>
        </div>
      </div>
    </motion.article>
  );
}

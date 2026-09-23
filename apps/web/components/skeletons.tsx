import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-28 rounded-lg" />
        <Skeleton className="h-9 w-9 rounded-xl" />
      </div>
      <div className="space-y-2 mt-2">
        <Skeleton className="h-8 w-16 rounded-lg" />
        <Skeleton className="h-3 w-36 rounded-md" />
      </div>
    </div>
  );
}

export function OrderRowSkeleton() {
  return (
    <div className="grid grid-cols-12 px-6 py-4 items-center gap-3 border-b border-slate-100">
      <div className="col-span-4 space-y-1.5">
        <Skeleton className="h-4 w-3/4 rounded-md" />
        <Skeleton className="h-3 w-1/3 rounded-md" />
      </div>
      <div className="col-span-3">
        <Skeleton className="h-4 w-2/3 rounded-md" />
      </div>
      <div className="col-span-2">
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <div className="col-span-3 flex items-center justify-between">
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-4 w-4 rounded-md" />
      </div>
    </div>
  );
}

export function OrderCardStepperSkeleton() {
  return (
    <div className="p-6 border-b border-slate-100 space-y-4">
      <div className="flex items-start justify-between">
        <div className="space-y-2 w-2/3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-16 rounded-md" />
            <Skeleton className="h-4 w-14 rounded-full" />
          </div>
          <Skeleton className="h-5 w-4/5 rounded-md" />
          <Skeleton className="h-3 w-1/2 rounded-md" />
        </div>
        <Skeleton className="h-8 w-20 rounded-xl" />
      </div>

      <div className="pt-3">
        <div className="flex items-center justify-between px-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-3 w-12 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function UnitAttentionSkeleton() {
  return (
    <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-xl" />
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-32 rounded-md" />
          <Skeleton className="h-3 w-20 rounded-md" />
        </div>
      </div>
      <Skeleton className="h-4 w-4 rounded-md" />
    </div>
  );
}

export function AgendaItemSkeleton() {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-36 rounded-md" />
          <Skeleton className="h-3 w-24 rounded-md" />
        </div>
      </div>
      <Skeleton className="h-5 w-5 rounded-full" />
    </div>
  );
}

export function GestorDashboardSkeleton() {
  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-8 animate-in fade-in duration-200">
      {/* Title skeleton */}
      <div className="flex items-end justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-80 rounded-xl" />
          <Skeleton className="h-4 w-96 rounded-md" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-11 w-36 rounded-xl" />
          <Skeleton className="h-11 w-32 rounded-xl" />
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          {/* Prioridades de hoje */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <Skeleton className="h-6 w-44 rounded-lg" />
              <Skeleton className="h-8 w-36 rounded-lg" />
            </div>
            <div className="divide-y divide-slate-100">
              {[0, 1, 2, 3].map((i) => (
                <OrderRowSkeleton key={i} />
              ))}
            </div>
          </div>

          {/* Unidades em atenção */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <Skeleton className="h-5 w-44 rounded-lg" />
                <Skeleton className="h-3 w-56 rounded-md" />
              </div>
              <Skeleton className="h-4 w-20 rounded-md" />
            </div>
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <UnitAttentionSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <Skeleton className="h-5 w-32 rounded-lg" />
              <Skeleton className="h-5 w-12 rounded-full" />
            </div>
            <div className="space-y-3">
              {[0, 1, 2, 3].map((i) => (
                <AgendaItemSkeleton key={i} />
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <Skeleton className="h-5 w-36 rounded-lg" />
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <div className="space-y-1 flex-1">
                    <Skeleton className="h-3.5 w-full rounded-md" />
                    <Skeleton className="h-2.5 w-16 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SolicitanteDashboardSkeleton() {
  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8 bg-[#F8FAFC] animate-in fade-in duration-200">
      {/* Top Banner Skeleton */}
      <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-5 w-48 rounded-full" />
            <Skeleton className="h-8 w-64 rounded-xl" />
            <Skeleton className="h-4 w-96 rounded-md" />
          </div>
          <Skeleton className="h-11 w-40 rounded-xl" />
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="space-y-1">
                <Skeleton className="h-5 w-52 rounded-lg" />
                <Skeleton className="h-3 w-40 rounded-md" />
              </div>
              <Skeleton className="h-8 w-48 rounded-xl" />
            </div>
            <div className="divide-y divide-slate-100">
              {[0, 1, 2, 3].map((i) => (
                <OrderCardStepperSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 space-y-4">
            <Skeleton className="h-5 w-36 rounded-lg" />
            <div className="space-y-3">
              {[0, 1].map((i) => (
                <div key={i} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-16 rounded-md" />
                    <Skeleton className="h-4 w-14 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-3/4 rounded-md" />
                  <Skeleton className="h-3 w-1/2 rounded-md" />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 space-y-3">
            <Skeleton className="h-5 w-40 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function KanbanCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3.5 w-16 rounded-md" />
        <Skeleton className="h-4 w-14 rounded-full" />
      </div>
      <Skeleton className="h-4 w-4/5 rounded-md" />
      <Skeleton className="h-3 w-3/5 rounded-md" />
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
        <Skeleton className="h-3 w-20 rounded-md" />
        <Skeleton className="h-5 w-16 rounded-md" />
      </div>
    </div>
  );
}

export function KanbanBoardSkeleton() {
  return (
    <div className="flex gap-5 h-full min-w-max pb-2 animate-in fade-in duration-200">
      {[
        { title: 'Triagem', count: 2 },
        { title: 'Agendado', count: 1 },
        { title: 'Em Execução', count: 3 },
        { title: 'Aguardando', count: 1 },
        { title: 'Concluído', count: 2 },
      ].map((col, idx) => (
        <div key={idx} className="w-[320px] flex flex-col h-full rounded-2xl bg-slate-100/60 border border-slate-200/60 p-3 space-y-3">
          <div className="flex items-center justify-between px-2 py-1">
            <div className="flex items-center gap-2">
              <Skeleton className="w-2.5 h-2.5 rounded-full" />
              <Skeleton className="h-4 w-24 rounded-md" />
            </div>
            <Skeleton className="h-5 w-6 rounded-full" />
          </div>
          <div className="space-y-3 overflow-hidden">
            {Array.from({ length: col.count }).map((_, i) => (
              <KanbanCardSkeleton key={i} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ChamadosTableSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-200">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <tr>
              <th className="py-3.5 px-4"><Skeleton className="h-4 w-14 rounded" /></th>
              <th className="py-3.5 px-4"><Skeleton className="h-4 w-32 rounded" /></th>
              <th className="py-3.5 px-4"><Skeleton className="h-4 w-20 rounded" /></th>
              <th className="py-3.5 px-4"><Skeleton className="h-4 w-16 rounded" /></th>
              <th className="py-3.5 px-4"><Skeleton className="h-4 w-16 rounded" /></th>
              <th className="py-3.5 px-4"><Skeleton className="h-4 w-20 rounded" /></th>
              <th className="py-3.5 px-4 text-right"><Skeleton className="h-4 w-12 ml-auto rounded" /></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <tr key={i} className="hover:bg-slate-50/40">
                <td className="py-4 px-4"><Skeleton className="h-4 w-16 rounded font-mono" /></td>
                <td className="py-4 px-4 space-y-1.5 max-w-xs">
                  <Skeleton className="h-4 w-4/5 rounded" />
                  <Skeleton className="h-3 w-1/2 rounded" />
                </td>
                <td className="py-4 px-4"><Skeleton className="h-4 w-32 rounded" /></td>
                <td className="py-4 px-4"><Skeleton className="h-5 w-16 rounded-md" /></td>
                <td className="py-4 px-4"><Skeleton className="h-5 w-20 rounded-md" /></td>
                <td className="py-4 px-4"><Skeleton className="h-4 w-24 rounded" /></td>
                <td className="py-4 px-4 text-right"><Skeleton className="h-4 w-16 ml-auto rounded" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ChamadosGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in duration-200">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-16 rounded font-mono" />
            <div className="flex items-center gap-1.5">
              <Skeleton className="h-4 w-14 rounded-md" />
              <Skeleton className="h-4 w-16 rounded-md" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-4/5 rounded-md" />
            <Skeleton className="h-3 w-full rounded-md" />
            <Skeleton className="h-3 w-2/3 rounded-md" />
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <Skeleton className="h-3 w-20 rounded" />
            <Skeleton className="h-3 w-16 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function UnitCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <Skeleton className="h-4 w-20 rounded-md" />
        </div>
        <Skeleton className="h-4 w-16 rounded-full" />
      </div>
      <Skeleton className="h-5 w-3/4 rounded-md" />
      <div className="space-y-2">
        <Skeleton className="h-3.5 w-full rounded-md" />
        <Skeleton className="h-3.5 w-4/5 rounded-md" />
        <Skeleton className="h-3.5 w-1/2 rounded-md" />
      </div>
      <div className="pt-3 border-t border-slate-100 space-y-2">
        <div className="flex justify-between">
          <Skeleton className="h-3 w-24 rounded" />
          <Skeleton className="h-3 w-10 rounded" />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
      </div>
      <div className="pt-3 border-t border-slate-100 flex gap-2">
        <Skeleton className="h-9 flex-1 rounded-lg" />
        <Skeleton className="h-9 w-9 rounded-lg" />
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { X, Building2, MapPin, User, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type UnidadeItem, type TipoUnidade } from '@/context/orders-context';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (unit: UnidadeItem) => void;
}

export function NewUnitModal({ isOpen, onClose, onCreate }: Props) {
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState<TipoUnidade>('ESCOLA');
  const [endereco, setEndereco] = useState('');
  const [gestor, setGestor] = useState('');
  const [telefone, setTelefone] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim()) {
      setError('Por favor, informe o nome da unidade.');
      return;
    }
    if (!endereco.trim()) {
      setError('Por favor, informe o endereço da unidade.');
      return;
    }

    const newUnit: UnidadeItem = {
      id: `u-${Date.now()}`,
      nome: nome.trim(),
      tipo,
      endereco: endereco.trim(),
      gestor: gestor.trim() || 'Gestão da Unidade',
      telefone: telefone.trim() || '(11) 4589-0000',
    };

    onCreate(newUnit);
    setNome('');
    setEndereco('');
    setGestor('');
    setTelefone('');
    setError('');
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-900/10 text-blue-900 flex items-center justify-center">
              <Building2 size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Cadastrar Nova Unidade</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Adicione uma escola, posto de saúde ou prédio público à rede municipal.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-xl">
              {error}
            </div>
          )}

          {/* Nome */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Nome da Unidade *
            </label>
            <input 
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: EMEF Monteiro Lobato, UBS Jardim das Flores"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/15 focus:border-blue-900 transition-all font-medium text-slate-800"
            />
          </div>

          {/* Tipo de Prédio */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Tipo de Prédio Público *
            </label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as TipoUnidade)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/15 focus:border-blue-900 transition-all font-medium text-slate-800"
            >
              <option value="ESCOLA">Educação (EMEF, EMEI, Creche)</option>
              <option value="UBS">Saúde (UBS, Posto de Saúde)</option>
              <option value="HOSPITAL">Hospital / UPA / Pronto-Atendimento</option>
              <option value="ADMINISTRATIVO">Administrativo (Prefeitura, Secretarias, Biblioteca)</option>
              <option value="PRACA">Praças e Parques Públicos</option>
            </select>
          </div>

          {/* Endereço */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Endereço Completo *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                placeholder="Rua, número, bairro..."
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/15 focus:border-blue-900 transition-all font-medium text-slate-800"
              />
            </div>
          </div>

          {/* Grid: Gestor & Telefone */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Gestor / Responsável
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input 
                  type="text"
                  value={gestor}
                  onChange={(e) => setGestor(e.target.value)}
                  placeholder="Nome do diretor ou coordenador"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/15 focus:border-blue-900 transition-all font-medium text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Telefone de Contato
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input 
                  type="text"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="(11) 4589-XXXX"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/15 focus:border-blue-900 transition-all font-medium text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Footer buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-lg">
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-900 hover:bg-blue-950 text-white rounded-lg font-semibold">
              Cadastrar Unidade
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

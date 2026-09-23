'use client';

import React, { useState, useRef } from 'react';
import { 
  Building2, 
  Clock, 
  Bell, 
  Users, 
  Database, 
  Save, 
  RotateCcw, 
  Download, 
  Upload, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  CheckCircle2, 
  Volume2, 
  Smartphone, 
  Mail, 
  Phone, 
  Server, 
  Wrench, 
  X
} from 'lucide-react';
import { Sidebar } from '@/components/sidebar';
import { Button } from '@/components/ui/button';
import { Toast } from '@/components/ui/toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useOrders, type TecnicoSettings, type SystemSettings } from '@/context/orders-context';

type SettingsTab = 'geral' | 'slas' | 'notificacoes' | 'equipe' | 'dados';

export default function ConfiguracoesPage() {
  const { 
    settings, 
    updateSettings, 
    resetSettings, 
    orders, 
    units, 
    agenda, 
    activities,
    exportBackupData, 
    importBackupData, 
    resetAllData 
  } = useOrders();

  const [activeTab, setActiveTab] = useState<SettingsTab>('geral');
  const [formData, setFormData] = useState<SystemSettings>({ ...settings });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isNewTechModalOpen, setIsNewTechModalOpen] = useState(false);
  const [apiTesting, setApiTesting] = useState(false);
  const [apiTestResult, setApiTestResult] = useState<string | null>(null);

  // New Tech Modal form
  const [newTechName, setNewTechName] = useState('');
  const [newTechSpec, setNewTechSpec] = useState('');
  const [newTechPhone, setNewTechPhone] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Trigger toast
  function triggerToast(msg: string, type: 'success' | 'error' = 'success') {
    setToastMessage(msg);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  }

  // Handle Save
  function handleSave() {
    updateSettings(formData);
    triggerToast('Configurações salvas e aplicadas com sucesso!');
  }

  // Handle Restore default settings
  function handleRestoreDefaults() {
    resetSettings();
    setFormData({ ...settings });
    triggerToast('Parâmetros restaurados para o padrão de fábrica.');
  }

  // Export JSON backup
  function handleExportBackup() {
    const jsonStr = exportBackupData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    a.href = url;
    a.download = `zelo-backup-${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    triggerToast('Backup do sistema baixado com sucesso!');
  }

  // Import JSON backup
  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;
      const res = importBackupData(content);
      if (res.success) {
        triggerToast(res.message, 'success');
      } else {
        triggerToast(res.message, 'error');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  // Add technician
  function handleAddTechnician() {
    if (!newTechName.trim()) return;
    const newTech: TecnicoSettings = {
      id: `tec-${Date.now()}`,
      nome: newTechName.trim(),
      especialidade: newTechSpec.trim() || 'Manutenção Geral',
      telefone: newTechPhone.trim() || '(11) 99999-0000',
      status: 'ATIVO',
    };
    const updatedList = [...formData.tecnicosList, newTech];
    setFormData({ ...formData, tecnicosList: updatedList });
    updateSettings({ tecnicosList: updatedList });
    setNewTechName('');
    setNewTechSpec('');
    setNewTechPhone('');
    setIsNewTechModalOpen(false);
    triggerToast(`Técnico ${newTech.nome} adicionado com sucesso!`);
  }

  // Toggle technician status
  function handleToggleTechStatus(id: string) {
    const updated = formData.tecnicosList.map((t) => {
      if (t.id === id) {
        const nextStatus = t.status === 'ATIVO' ? 'FERIAS' : t.status === 'FERIAS' ? 'INDISPONIVEL' : 'ATIVO';
        return { ...t, status: nextStatus as TecnicoSettings['status'] };
      }
      return t;
    });
    setFormData({ ...formData, tecnicosList: updated });
    updateSettings({ tecnicosList: updated });
  }

  // Remove technician
  function handleRemoveTech(id: string) {
    if (formData.tecnicosList.length <= 1) {
      triggerToast('É necessário manter pelo menos 1 técnico registrado no sistema.', 'error');
      return;
    }
    const updated = formData.tecnicosList.filter((t) => t.id !== id);
    setFormData({ ...formData, tecnicosList: updated });
    updateSettings({ tecnicosList: updated });
    triggerToast('Técnico removido da escala operacional.');
  }

  // Test API endpoint
  function handleTestApi() {
    setApiTesting(true);
    setApiTestResult(null);
    setTimeout(() => {
      setApiTesting(false);
      setApiTestResult('Conexão simulada bem-sucedida! Servidor local respondendo com latência de 24ms.');
    }, 900);
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
      {/* Universal Collapsible Sidebar */}
      <Sidebar currentRoute="/configuracoes" />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto">
        {/* Header Bar */}
        <header className="px-8 py-6 bg-white border-b border-slate-200/80 shrink-0 sticky top-0 z-20 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Configurações do Sistema</h1>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
                  zelo v2.4
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Gerencie os parâmetros municipais, metas de SLA, alertas, equipe técnica e integrações
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRestoreDefaults}
                className="text-xs font-semibold text-slate-700 border-slate-300 hover:bg-slate-50 gap-2 rounded-xl"
              >
                <RotateCcw size={15} />
                Padrões
              </Button>

              <Button
                size="sm"
                onClick={handleSave}
                className="text-xs font-bold bg-[#1D6FEB] hover:bg-[#1557BA] text-white gap-2 rounded-xl shadow-xs"
              >
                <Save size={15} />
                Salvar Alterações
              </Button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-6 border-b border-slate-100 overflow-x-auto">
            <TabButton 
              active={activeTab === 'geral'} 
              onClick={() => setActiveTab('geral')} 
              icon={<Building2 size={16} />} 
              label="Geral & Município" 
            />
            <TabButton 
              active={activeTab === 'slas'} 
              onClick={() => setActiveTab('slas')} 
              icon={<Clock size={16} />} 
              label="SLAs & Prazos" 
            />
            <TabButton 
              active={activeTab === 'notificacoes'} 
              onClick={() => setActiveTab('notificacoes')} 
              icon={<Bell size={16} />} 
              label="Notificações & Alertas" 
            />
            <TabButton 
              active={activeTab === 'equipe'} 
              onClick={() => setActiveTab('equipe')} 
              icon={<Users size={16} />} 
              label="Equipe Técnica" 
              badge={String(formData.tecnicosList.length)}
            />
            <TabButton 
              active={activeTab === 'dados'} 
              onClick={() => setActiveTab('dados')} 
              icon={<Database size={16} />} 
              label="Dados, Backup & API" 
            />
          </div>
        </header>

        {/* Content Body */}
        <div className="p-8 max-w-6xl w-full mx-auto space-y-6">

          {/* TAB 1: GERAL & MUNICÍPIO */}
          {activeTab === 'geral' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Institutional Card */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1D6FEB] flex items-center justify-center shrink-0">
                    <Building2 size={18} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Identificação Municipal & Órgão Público</h2>
                    <p className="text-xs text-slate-500">Dados oficiais que encabeçam ordens de serviço e relatórios formais</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Nome da Prefeitura / Município
                    </label>
                    <input
                      type="text"
                      value={formData.prefeituraNome}
                      onChange={(e) => setFormData({ ...formData, prefeituraNome: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-[#1D6FEB]"
                      placeholder="Ex: Prefeitura Municipal de Gestão Urbana"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Secretaria Responsável
                    </label>
                    <input
                      type="text"
                      value={formData.secretariaNome}
                      onChange={(e) => setFormData({ ...formData, secretariaNome: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-[#1D6FEB]"
                      placeholder="Ex: Secretaria de Infraestrutura e Zeladoria Predial"
                    />
                  </div>
                </div>
              </div>

              {/* Responsible Manager Card */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Gestor Responsável pela Zeladoria</h2>
                    <p className="text-xs text-slate-500">Assinatura digital padrão para despachos e encerramentos técnicos</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 py-2">
                  <Avatar className="h-16 w-16 border-2 border-slate-200 shadow-xs">
                    <AvatarImage src="https://i.pravatar.cc/150?u=mariana" />
                    <AvatarFallback>MA</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{formData.gestorNome}</h3>
                    <p className="text-xs text-slate-500">{formData.gestorCargo}</p>
                    <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Sessão Ativa
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Nome do Gestor
                    </label>
                    <input
                      type="text"
                      value={formData.gestorNome}
                      onChange={(e) => setFormData({ ...formData, gestorNome: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-[#1D6FEB]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Cargo Oficial
                    </label>
                    <input
                      type="text"
                      value={formData.gestorCargo}
                      onChange={(e) => setFormData({ ...formData, gestorCargo: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-[#1D6FEB]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                      <Mail size={13} className="text-slate-400" />
                      E-mail Institucional
                    </label>
                    <input
                      type="email"
                      value={formData.gestorEmail}
                      onChange={(e) => setFormData({ ...formData, gestorEmail: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-[#1D6FEB]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                      <Phone size={13} className="text-slate-400" />
                      Telefone / Ramal
                    </label>
                    <input
                      type="text"
                      value={formData.gestorTelefone}
                      onChange={(e) => setFormData({ ...formData, gestorTelefone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-[#1D6FEB]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SLAS & PRAZOS */}
          {activeTab === 'slas' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl flex items-start gap-3">
                <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-900 leading-relaxed">
                  Os prazos de <strong>Acordo de Nível de Serviço (SLA)</strong> definem o tempo máximo de atendimento antes de o sistema emitir alertas de criticidade e penalidades contratuais nos relatórios oficiais.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* URGENTE */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                        Criticidade Urgente
                      </span>
                      <span className="text-xs text-slate-400 font-semibold">Risco Imediato</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900">Prazo Máximo de Conclusão</h3>
                    <p className="text-xs text-slate-500 mt-1">Exige intervenção emergencial de equipe de prontidão.</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="48"
                        value={formData.slaUrgenteHours}
                        onChange={(e) => setFormData({ ...formData, slaUrgenteHours: Number(e.target.value) })}
                        className="w-20 px-3 py-1.5 rounded-lg border border-slate-200 font-extrabold text-rose-600 text-center text-lg focus:outline-hidden focus:ring-2 focus:ring-rose-500/20"
                      />
                      <span className="text-xs font-bold text-slate-600">horas</span>
                    </div>
                    <span className="text-[11px] text-slate-400">Padrão: 4 horas</span>
                  </div>
                </div>

                {/* ALTA */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        Alta Prioridade
                      </span>
                      <span className="text-xs text-slate-400 font-semibold">Compromete Operação</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900">Prazo Máximo de Conclusão</h3>
                    <p className="text-xs text-slate-500 mt-1">Atendimento no mesmo turno ou dia seguinte.</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="96"
                        value={formData.slaAltaHours}
                        onChange={(e) => setFormData({ ...formData, slaAltaHours: Number(e.target.value) })}
                        className="w-20 px-3 py-1.5 rounded-lg border border-slate-200 font-extrabold text-amber-600 text-center text-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
                      />
                      <span className="text-xs font-bold text-slate-600">horas</span>
                    </div>
                    <span className="text-[11px] text-slate-400">Padrão: 24 horas</span>
                  </div>
                </div>

                {/* MEDIA */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        Média Prioridade
                      </span>
                      <span className="text-xs text-slate-400 font-semibold">Manutenção Regular</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900">Prazo Máximo de Conclusão</h3>
                    <p className="text-xs text-slate-500 mt-1">Intervenções programadas em dias úteis.</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="240"
                        value={formData.slaMediaHours}
                        onChange={(e) => setFormData({ ...formData, slaMediaHours: Number(e.target.value) })}
                        className="w-20 px-3 py-1.5 rounded-lg border border-slate-200 font-extrabold text-blue-600 text-center text-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                      />
                      <span className="text-xs font-bold text-slate-600">horas</span>
                    </div>
                    <span className="text-[11px] text-slate-400">Padrão: 72 horas (3 dias)</span>
                  </div>
                </div>

                {/* BAIXA */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        Baixa Prioridade
                      </span>
                      <span className="text-xs text-slate-400 font-semibold">Melhoria Estética</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900">Prazo Máximo de Conclusão</h3>
                    <p className="text-xs text-slate-500 mt-1">Pinturas, pequenos ajustes e revisões periódicas.</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="720"
                        value={formData.slaBaixaHours}
                        onChange={(e) => setFormData({ ...formData, slaBaixaHours: Number(e.target.value) })}
                        className="w-20 px-3 py-1.5 rounded-lg border border-slate-200 font-extrabold text-slate-600 text-center text-lg focus:outline-hidden focus:ring-2 focus:ring-slate-500/20"
                      />
                      <span className="text-xs font-bold text-slate-600">horas</span>
                    </div>
                    <span className="text-[11px] text-slate-400">Padrão: 168 horas (7 dias)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: NOTIFICAÇÕES & ALERTAS */}
          {activeTab === 'notificacoes' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-5">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                  <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                    <Bell size={18} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Alertas de Urgência & Canais de Despacho</h2>
                    <p className="text-xs text-slate-500">Configure como a central notifica a equipe técnica e a gestão</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <ToggleOption
                    icon={<Volume2 size={18} className="text-blue-600" />}
                    title="Alerta Sonoro no Navegador"
                    description="Emite bipe sonoro de atenção quando um chamado com prioridade Urgente for registrado no sistema."
                    checked={formData.soundAlerts}
                    onChange={(checked) => setFormData({ ...formData, soundAlerts: checked })}
                  />

                  <ToggleOption
                    icon={<Bell size={18} className="text-amber-600" />}
                    title="Notificações Push do Sistema Operacional"
                    description="Exibe notificações na área de trabalho mesmo quando o navegador estiver em segundo plano."
                    checked={formData.pushNotifications}
                    onChange={(checked) => setFormData({ ...formData, pushNotifications: checked })}
                  />

                  <ToggleOption
                    icon={<Smartphone size={18} className="text-emerald-600" />}
                    title="Disparo Automático via WhatsApp / SMS"
                    description="Envia alerta instantâneo no celular do técnico atribuído assim que o chamado for triado."
                    checked={formData.whatsappAlerts}
                    onChange={(checked) => setFormData({ ...formData, whatsappAlerts: checked })}
                  />

                  <ToggleOption
                    icon={<Wrench size={18} className="text-purple-600" />}
                    title="Despacho Automatizado por Especialidade"
                    description="Atribui automaticamente o chamado ao técnico disponível correspondente à categoria (Elétrica/Hidráulica)."
                    checked={formData.autoDispatch}
                    onChange={(checked) => setFormData({ ...formData, autoDispatch: checked })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: EQUIPE TÉCNICA */}
          {activeTab === 'equipe' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <Users size={18} />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900">Escala Técnica Municipal</h2>
                      <p className="text-xs text-slate-500">Técnicos habilitados para atendimento e ordens de serviço</p>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => setIsNewTechModalOpen(true)}
                    className="text-xs font-bold bg-[#1D6FEB] hover:bg-[#1557BA] text-white gap-2 rounded-xl"
                  >
                    <Plus size={15} />
                    Adicionar Técnico
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formData.tecnicosList.map((tech) => (
                    <div 
                      key={tech.id} 
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="h-10 w-10 border border-slate-300">
                          <AvatarFallback className="font-bold text-xs bg-slate-200 text-slate-700">
                            {tech.nome.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900 truncate">{tech.nome}</h4>
                            <span 
                              onClick={() => handleToggleTechStatus(tech.id)}
                              className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full cursor-pointer hover:opacity-80 transition-opacity ${
                                tech.status === 'ATIVO' 
                                  ? 'bg-emerald-100 text-emerald-800' 
                                  : tech.status === 'FERIAS'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                              title="Clique para alternar status (Ativo / Férias / Indisponível)"
                            >
                              {tech.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 truncate mt-0.5">{tech.especialidade}</p>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Phone size={11} /> {tech.telefone}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveTech(tech.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remover técnico"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: DADOS, BACKUP & API */}
          {activeTab === 'dados' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Storage Stats */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1D6FEB] flex items-center justify-center shrink-0">
                    <Database size={18} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Armazenamento Local & Auditoria</h2>
                    <p className="text-xs text-slate-500">Métricas em tempo real dos dados persistidos no navegador</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                    <span className="text-2xl font-black text-slate-900">{orders.length}</span>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Chamados Salvos</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                    <span className="text-2xl font-black text-slate-900">{units.length}</span>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Unidades Ativas</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                    <span className="text-2xl font-black text-slate-900">{agenda.length}</span>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Vistorias na Agenda</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                    <span className="text-2xl font-black text-slate-900">{activities.length}</span>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Logs de Auditoria</p>
                  </div>
                </div>
              </div>

              {/* Backup & Import */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Download size={18} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Backup & Restauração JSON</h2>
                    <p className="text-xs text-slate-500">Exporte ou importe a base de dados completa em arquivo JSON estruturado</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                  <Button
                    onClick={handleExportBackup}
                    className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 rounded-xl text-xs"
                  >
                    <Download size={15} />
                    Exportar Backup JSON
                  </Button>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept=".json"
                    className="hidden"
                  />

                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full sm:w-auto border-slate-300 font-bold text-slate-700 hover:bg-slate-50 gap-2 rounded-xl text-xs"
                  >
                    <Upload size={15} />
                    Importar Backup JSON
                  </Button>
                </div>
              </div>

              {/* Data Source: Mock vs API */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <Server size={18} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Origem de Dados (Mock vs. API REST)</h2>
                    <p className="text-xs text-slate-500">Alterne entre o modo de demonstração local e conexão com backend real</p>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="datasource"
                        checked={formData.useMockData}
                        onChange={() => setFormData({ ...formData, useMockData: true })}
                        className="text-[#1D6FEB] focus:ring-blue-500"
                      />
                      <span className="text-xs font-bold text-slate-800">Modo Offline Local (Demonstração com Mock)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="datasource"
                        checked={!formData.useMockData}
                        onChange={() => setFormData({ ...formData, useMockData: false })}
                        className="text-[#1D6FEB] focus:ring-blue-500"
                      />
                      <span className="text-xs font-bold text-slate-800">Modo API Backend REST</span>
                    </label>
                  </div>

                  {!formData.useMockData && (
                    <div className="space-y-2 pt-2 animate-in fade-in duration-150">
                      <label className="block text-xs font-bold text-slate-700">
                        URL Base da API Backend (Node.js / FastAPI / Go)
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          value={formData.apiEndpoint}
                          onChange={(e) => setFormData({ ...formData, apiEndpoint: e.target.value })}
                          className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                          placeholder="http://localhost:3001/api"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleTestApi}
                          disabled={apiTesting}
                          className="text-xs font-semibold rounded-xl shrink-0"
                        >
                          {apiTesting ? 'Testando...' : 'Testar Conexão'}
                        </Button>
                      </div>
                      {apiTestResult && (
                        <p className="text-xs font-medium text-emerald-600 flex items-center gap-1.5 mt-1">
                          <CheckCircle2 size={13} /> {apiTestResult}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Danger Zone: Factory Reset */}
              <div className="p-6 rounded-2xl bg-red-50/50 border border-red-200/80 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertTriangle size={18} className="shrink-0" />
                  <h3 className="text-sm font-bold">Zona de Perigo: Redefinição Geral de Fábrica</h3>
                </div>
                <p className="text-xs text-red-700 leading-relaxed">
                  Esta ação limpará todas as ordens de serviço, vistorias e alterações personalizadas armazenadas no navegador, restaurando o banco para os dados originais de demonstração.
                </p>
                <div className="pt-2">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setIsResetConfirmOpen(true)}
                    className="text-xs font-bold rounded-xl gap-2 bg-red-600 hover:bg-red-700 text-white"
                  >
                    <RotateCcw size={14} />
                    Zerar Banco de Dados Local
                  </Button>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* MODAL: RESET CONFIRMATION */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle size={24} />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-900">Restaurar Banco de Fábrica?</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Tem certeza de que deseja apagar todas as modificações locais? Os chamados, unidades e parâmetros voltarão ao estado padrão inicial.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setIsResetConfirmOpen(false)}
                className="flex-1 rounded-xl text-xs font-bold"
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  resetAllData();
                  setFormData(settings);
                  setIsResetConfirmOpen(false);
                  triggerToast('Banco de dados zerado e restaurado com sucesso!');
                }}
                className="flex-1 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white"
              >
                Confirmar Reset
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NEW TECHNICIAN */}
      {isNewTechModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Cadastrar Novo Técnico</h3>
              <button 
                onClick={() => setIsNewTechModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nome Completo</label>
                <input
                  type="text"
                  value={newTechName}
                  onChange={(e) => setNewTechName(e.target.value)}
                  placeholder="Ex: Fernando Almeida"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Especialidade Técnica</label>
                <input
                  type="text"
                  value={newTechSpec}
                  onChange={(e) => setNewTechSpec(e.target.value)}
                  placeholder="Ex: Elétrica & Automação Predial"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Telefone / Contato</label>
                <input
                  type="text"
                  value={newTechPhone}
                  onChange={(e) => setNewTechPhone(e.target.value)}
                  placeholder="(11) 98765-4321"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3">
              <Button
                variant="outline"
                onClick={() => setIsNewTechModalOpen(false)}
                className="flex-1 rounded-xl text-xs font-bold"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAddTechnician}
                className="flex-1 rounded-xl text-xs font-bold bg-[#1D6FEB] hover:bg-[#1557BA] text-white"
              >
                Salvar Técnico
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING TOAST NOTIFICATION */}
      {showToast && <Toast message={toastMessage} type={toastType} />}
    </div>
  );
}

function TabButton({ 
  active, 
  onClick, 
  icon, 
  label, 
  badge 
}: { 
  active: boolean; 
  onClick: () => void; 
  icon: React.ReactNode; 
  label: string; 
  badge?: string; 
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 font-bold text-xs border-b-2 transition-all whitespace-nowrap ${
        active 
          ? 'border-[#1D6FEB] text-[#1D6FEB]' 
          : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
      }`}
    >
      {icon}
      <span>{label}</span>
      {badge && (
        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
          active ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'
        }`}>
          {badge}
        </span>
      )}
    </button>
  );
}

function ToggleOption({
  icon,
  title,
  description,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 flex items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 mt-0.5">
          {icon}
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-900">{title}</h4>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{description}</p>
        </div>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`w-11 h-6 rounded-full transition-colors relative shrink-0 p-0.5 mt-1 focus:outline-hidden ${
          checked ? 'bg-[#1D6FEB]' : 'bg-slate-300'
        }`}
      >
        <span
          className={`block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

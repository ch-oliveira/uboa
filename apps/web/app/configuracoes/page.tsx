'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  X,
  Menu,
  Package,
  Search,
  Coins
} from 'lucide-react';
import { Sidebar } from '@/components/sidebar';
import { Button } from '@/components/ui/button';
import { Toast } from '@/components/ui/toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useOrders, type TecnicoSettings, type SystemSettings } from '@/context/orders-context';
import { useAuth } from '@/context/auth-context';
import { apiClient } from '@/lib/api-client';
import { type MaterialItem } from '@/app/kanban/data';

type SettingsTab = 'geral' | 'slas' | 'notificacoes' | 'equipe' | 'materiais' | 'dados';

export default function ConfiguracoesPage() {
  const { role } = useAuth();
  const isAdmin = role === 'ADMIN';

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
    resetAllData,
    toggleMobileNav
  } = useOrders();

  const [activeTab, setActiveTab] = useState<SettingsTab>('geral');

  // Garante que usuário não-ADMIN nunca permaneça na aba técnica
  useEffect(() => {
    if (activeTab === 'dados' && !isAdmin) {
      setActiveTab('geral');
    }
  }, [activeTab, isAdmin]);
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

  // Estados do Almoxarifado / Catálogo de Peças
  const [materialsList, setMaterialsList] = useState<MaterialItem[]>([]);
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(false);
  const [isNewMaterialModalOpen, setIsNewMaterialModalOpen] = useState(false);
  const [materialSearch, setMaterialSearch] = useState('');

  // Form Novo Material
  const [newMatCodigo, setNewMatCodigo] = useState('');
  const [newMatNome, setNewMatNome] = useState('');
  const [newMatCategoria, setNewMatCategoria] = useState('ELETRICA');
  const [newMatUnidade, setNewMatUnidade] = useState('UN');
  const [newMatPreco, setNewMatPreco] = useState<number>(0);
  const [newMatEstoque, setNewMatEstoque] = useState<number>(10);
  const [newMatEstoqueMin, setNewMatEstoqueMin] = useState<number>(5);
  const [isSavingMaterial, setIsSavingMaterial] = useState(false);

  // Carrega catálogo de materiais
  const loadMaterials = React.useCallback(async () => {
    setIsLoadingMaterials(true);
    try {
      const res = await apiClient.getMaterials();
      if (res.success && Array.isArray(res.materials)) {
        setMaterialsList(res.materials);
      }
    } catch {
      // Ignora erro
    } finally {
      setIsLoadingMaterials(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'materiais') {
      loadMaterials();
    }
  }, [activeTab, loadMaterials]);

  async function handleCreateMaterialSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newMatNome.trim() || newMatPreco < 0) {
      triggerToast('Informe ao menos o nome do material e um preço válido.', 'error');
      return;
    }

    setIsSavingMaterial(true);
    try {
      const res = await apiClient.createMaterial({
        codigo: newMatCodigo.trim() || undefined,
        nome: newMatNome.trim(),
        categoria: newMatCategoria.trim() || 'GERAL',
        unidadeMedida: newMatUnidade.trim() || 'UN',
        precoUnitario: Number(newMatPreco || 0),
        estoqueAtual: Number(newMatEstoque || 0),
        estoqueMinimo: Number(newMatEstoqueMin || 0),
      });

      if (res.success) {
        triggerToast('Material cadastrado no almoxarifado com sucesso!');
        setIsNewMaterialModalOpen(false);
        // Reset form
        setNewMatCodigo('');
        setNewMatNome('');
        setNewMatPreco(0);
        setNewMatEstoque(10);
        setNewMatEstoqueMin(5);
        loadMaterials();
      } else {
        triggerToast(res.message || 'Erro ao cadastrar material.', 'error');
      }
    } catch {
      triggerToast('Falha na comunicação com o servidor.', 'error');
    } finally {
      setIsSavingMaterial(false);
    }
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
    a.download = `urboa-backup-${dateStr}.json`;
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
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Universal Collapsible Sidebar */}
      <Sidebar currentRoute="/configuracoes" />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto">
        {/* Header Bar */}
        <header className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 bg-background border-b border-border shrink-0 sticky top-0 z-20 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={toggleMobileNav}
                  className="md:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors cursor-pointer"
                  aria-label="Abrir menu de navegação"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">Configurações do Sistema</h1>
              </div>
              <p className="text-xs text-muted-foreground font-medium mt-1">
                Gerencie os parâmetros municipais, metas de SLA, alertas e equipe técnica
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.dispatchEvent(new CustomEvent('zelo:toggle-dev-drawer'))}
                  className="text-xs font-semibold text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100 gap-1.5 rounded-xl"
                  title="Abrir gaveta de desenvolvimento (Ctrl+Shift+D)"
                >
                  DevTools
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={handleRestoreDefaults}
                className="text-xs font-semibold text-foreground border-border hover:bg-muted gap-2 rounded-xl"
              >
                <RotateCcw size={15} />
                Padrões
              </Button>

              <Button
                size="sm"
                onClick={handleSave}
                className="text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground gap-2 rounded-xl shadow-xs"
              >
                <Save size={15} />
                Salvar Alterações
              </Button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-4 sm:mt-6 border-b border-border overflow-x-auto pb-1.5 no-scrollbar">
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
              active={activeTab === 'materiais'} 
              onClick={() => setActiveTab('materiais')} 
              icon={<Package size={16} />} 
              label="Almoxarifado & Peças" 
              badge={materialsList.length > 0 ? String(materialsList.length) : undefined}
            />
            {isAdmin && (
              <TabButton 
              active={activeTab === 'dados'} 
              onClick={() => setActiveTab('dados')} 
              icon={<Database size={16} />} 
              label="DevTools & Dados" 
              badge="ADMIN"
            />
          )}
        </div>
      </header>

      {/* Content Body */}
      <div className="p-4 sm:p-6 md:p-8 max-w-6xl w-full mx-auto space-y-6">

          {/* TAB 1: GERAL & MUNICÍPIO */}
          {activeTab === 'geral' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Institutional Card */}
              <div className="p-6 ds-card space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-border">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Building2 size={18} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-foreground">Identificação Municipal & Órgão Público</h2>
                    <p className="text-xs text-muted-foreground">Dados oficiais que encabeçam ordens de serviço e relatórios formais</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5">
                      Nome da Prefeitura / Município
                    </label>
                    <input
                      type="text"
                      value={formData.prefeituraNome}
                      onChange={(e) => setFormData({ ...formData, prefeituraNome: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring focus:border-ring"
                      placeholder="Ex: Prefeitura Municipal de Gestão Urbana"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5">
                      Secretaria Responsável
                    </label>
                    <input
                      type="text"
                      value={formData.secretariaNome}
                      onChange={(e) => setFormData({ ...formData, secretariaNome: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring focus:border-ring"
                      placeholder="Ex: Secretaria de Infraestrutura e Zeladoria Predial"
                    />
                  </div>
                </div>
              </div>

              {/* Responsible Manager Card */}
              <div className="p-6 ds-card space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-border">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-foreground">Gestor Responsável pela Zeladoria</h2>
                    <p className="text-xs text-muted-foreground">Assinatura digital padrão para despachos e encerramentos técnicos</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 py-2">
                  <Avatar className="h-16 w-16 border-2 border-border shadow-xs">
                    <AvatarImage src="https://i.pravatar.cc/150?u=mariana" />
                    <AvatarFallback>MA</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">{formData.gestorNome}</h3>
                    <p className="text-xs text-muted-foreground">{formData.gestorCargo}</p>
                    <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Sessão Ativa
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5">
                      Nome do Gestor
                    </label>
                    <input
                      type="text"
                      value={formData.gestorNome}
                      onChange={(e) => setFormData({ ...formData, gestorNome: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring focus:border-ring"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5">
                      Cargo Oficial
                    </label>
                    <input
                      type="text"
                      value={formData.gestorCargo}
                      onChange={(e) => setFormData({ ...formData, gestorCargo: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring focus:border-ring"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5 flex items-center gap-1.5">
                      <Mail size={13} className="text-muted-foreground" />
                      E-mail Institucional
                    </label>
                    <input
                      type="email"
                      value={formData.gestorEmail}
                      onChange={(e) => setFormData({ ...formData, gestorEmail: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring focus:border-ring"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5 flex items-center gap-1.5">
                      <Phone size={13} className="text-muted-foreground" />
                      Telefone / Ramal
                    </label>
                    <input
                      type="text"
                      value={formData.gestorTelefone}
                      onChange={(e) => setFormData({ ...formData, gestorTelefone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring focus:border-ring"
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
                <div className="p-5 ds-card flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                        Criticidade Urgente
                      </span>
                      <span className="text-xs text-muted-foreground font-semibold">Risco Imediato</span>
                    </div>
                    <h3 className="text-base font-bold text-foreground">Prazo Máximo de Conclusão</h3>
                    <p className="text-xs text-muted-foreground mt-1">Exige intervenção emergencial de equipe de prontidão.</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="48"
                        value={formData.slaUrgenteHours}
                        onChange={(e) => setFormData({ ...formData, slaUrgenteHours: Number(e.target.value) })}
                        className="w-20 px-3 py-1.5 rounded-lg border border-border font-extrabold text-rose-600 text-center text-lg focus:outline-hidden focus:ring-2 focus:ring-rose-500/20"
                      />
                      <span className="text-xs font-bold text-muted-foreground">horas</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground/80">Padrão: 4 horas</span>
                  </div>
                </div>

                {/* ALTA */}
                <div className="p-5 ds-card flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        Alta Prioridade
                      </span>
                      <span className="text-xs text-muted-foreground font-semibold">Compromete Operação</span>
                    </div>
                    <h3 className="text-base font-bold text-foreground">Prazo Máximo de Conclusão</h3>
                    <p className="text-xs text-muted-foreground mt-1">Atendimento no mesmo turno ou dia seguinte.</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="96"
                        value={formData.slaAltaHours}
                        onChange={(e) => setFormData({ ...formData, slaAltaHours: Number(e.target.value) })}
                        className="w-20 px-3 py-1.5 rounded-lg border border-border font-extrabold text-amber-600 text-center text-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
                      />
                      <span className="text-xs font-bold text-muted-foreground">horas</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground/80">Padrão: 24 horas</span>
                  </div>
                </div>

                {/* MEDIA */}
                <div className="p-5 ds-card flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        Média Prioridade
                      </span>
                      <span className="text-xs text-muted-foreground font-semibold">Manutenção Regular</span>
                    </div>
                    <h3 className="text-base font-bold text-foreground">Prazo Máximo de Conclusão</h3>
                    <p className="text-xs text-muted-foreground mt-1">Intervenções programadas em dias úteis.</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="240"
                        value={formData.slaMediaHours}
                        onChange={(e) => setFormData({ ...formData, slaMediaHours: Number(e.target.value) })}
                        className="w-20 px-3 py-1.5 rounded-lg border border-border font-extrabold text-blue-600 text-center text-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                      />
                      <span className="text-xs font-bold text-muted-foreground">horas</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground/80">Padrão: 72 horas (3 dias)</span>
                  </div>
                </div>

                {/* BAIXA */}
                <div className="p-5 ds-card flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        Baixa Prioridade
                      </span>
                      <span className="text-xs text-muted-foreground font-semibold">Melhoria Estética</span>
                    </div>
                    <h3 className="text-base font-bold text-foreground">Prazo Máximo de Conclusão</h3>
                    <p className="text-xs text-muted-foreground mt-1">Pinturas, pequenos ajustes e revisões periódicas.</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="720"
                        value={formData.slaBaixaHours}
                        onChange={(e) => setFormData({ ...formData, slaBaixaHours: Number(e.target.value) })}
                        className="w-20 px-3 py-1.5 rounded-lg border border-border font-extrabold text-foreground text-center text-lg focus:outline-hidden focus:ring-2 focus:ring-ring"
                      />
                      <span className="text-xs font-bold text-muted-foreground">horas</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground/80">Padrão: 168 horas (7 dias)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: NOTIFICAÇÕES & ALERTAS */}
          {activeTab === 'notificacoes' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="p-6 ds-card space-y-5">
                <div className="flex items-center gap-3 pb-3 border-b border-border">
                  <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                    <Bell size={18} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-foreground">Alertas de Urgência & Canais de Despacho</h2>
                    <p className="text-xs text-muted-foreground">Configure como a central notifica a equipe técnica e a gestão</p>
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
              <div className="p-6 ds-card space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <Users size={18} />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-foreground">Escala Técnica Municipal</h2>
                      <p className="text-xs text-muted-foreground">Técnicos habilitados para atendimento e ordens de serviço</p>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => setIsNewTechModalOpen(true)}
                    className="text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground gap-2 rounded-xl"
                  >
                    <Plus size={15} />
                    Adicionar Técnico
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formData.tecnicosList.map((tech) => (
                    <div 
                      key={tech.id} 
                      className="p-4 rounded-xl border border-border bg-input hover:bg-muted transition-colors flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="h-10 w-10 border border-border">
                          <AvatarFallback className="font-bold text-xs bg-muted text-foreground">
                            {tech.nome.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-foreground truncate">{tech.nome}</h4>
                            <span 
                              onClick={() => handleToggleTechStatus(tech.id)}
                              className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full cursor-pointer hover:opacity-80 transition-opacity ${
                                tech.status === 'ATIVO' 
                                  ? 'bg-emerald-100 text-emerald-800' 
                                  : tech.status === 'FERIAS'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-muted text-muted-foreground'
                              }`}
                              title="Clique para alternar status (Ativo / Férias / Indisponível)"
                            >
                              {tech.status}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">{tech.especialidade}</p>
                          <p className="text-[11px] text-muted-foreground/80 flex items-center gap-1 mt-0.5">
                            <Phone size={11} /> {tech.telefone}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveTech(tech.id)}
                        className="p-1.5 text-muted-foreground/80 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
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

          {/* TAB: ALMOXARIFADO & CATÁLOGO DE MATERIAIS */}
          {activeTab === 'materiais' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Resumo do Almoxarifado */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 ds-card space-y-1">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="text-[11px] font-semibold uppercase tracking-wider">Itens no Catálogo</span>
                    <Package size={16} className="text-primary" />
                  </div>
                  <p className="text-2xl font-bold font-mono text-foreground">
                    {materialsList.length}
                  </p>
                  <p className="text-[11px] text-muted-foreground">Peças e insumos registrados</p>
                </div>

                <div className="p-4 ds-card space-y-1">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="text-[11px] font-semibold uppercase tracking-wider">Estoque Crítico / Baixo</span>
                    <AlertTriangle size={16} className="text-amber-600" />
                  </div>
                  <p className="text-2xl font-bold font-mono text-amber-700">
                    {materialsList.filter(m => m.estoqueAtual <= m.estoqueMinimo).length}
                  </p>
                  <p className="text-[11px] text-muted-foreground">Itens abaixo do estoque de segurança</p>
                </div>

                <div className="p-4 ds-card space-y-1">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="text-[11px] font-semibold uppercase tracking-wider">Patrimônio em Almoxarifado</span>
                    <Coins size={16} className="text-emerald-600" />
                  </div>
                  <p className="text-2xl font-bold font-mono text-foreground">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                      materialsList.reduce((acc, m) => acc + ((m.estoqueAtual || 0) * (m.precoUnitario || 0)), 0)
                    )}
                  </p>
                  <p className="text-[11px] text-muted-foreground">Saldo monetário imobilizado</p>
                </div>
              </div>

              {/* Tabela do Catálogo */}
              <div className="p-6 ds-card space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border">
                  <div>
                    <h2 className="text-sm font-bold text-foreground">Catálogo de Peças e Insumos Prediais</h2>
                    <p className="text-xs text-muted-foreground">
                      Base oficial de preços unitários e saldos físicos debitados nas ordens de serviço
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search size={13} className="absolute left-2.5 top-2.5 text-muted-foreground" />
                      <input
                        type="text"
                        value={materialSearch}
                        onChange={(e) => setMaterialSearch(e.target.value)}
                        placeholder="Buscar peça, código..."
                        className="text-xs bg-muted/40 border border-border rounded-xl pl-8 pr-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-48 sm:w-60"
                      />
                    </div>

                    <Button
                      size="sm"
                      onClick={() => setIsNewMaterialModalOpen(true)}
                      className="text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 rounded-xl h-8 px-3 cursor-pointer shadow-xs"
                    >
                      <Plus size={14} />
                      <span>Cadastrar Peça</span>
                    </Button>
                  </div>
                </div>

                {isLoadingMaterials ? (
                  <div className="py-12 flex flex-col items-center justify-center text-muted-foreground gap-2">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs">Carregando itens do almoxarifado...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-border/70">
                    <table className="w-full text-left text-xs text-muted-foreground">
                      <thead className="bg-muted/50 border-b border-border text-foreground font-semibold uppercase text-[10px]">
                        <tr>
                          <th className="py-2.5 px-3">Código</th>
                          <th className="py-2.5 px-3">Nome / Especificação</th>
                          <th className="py-2.5 px-3">Categoria</th>
                          <th className="py-2.5 px-3 text-center">Unidade</th>
                          <th className="py-2.5 px-3 text-right">Preço Unit.</th>
                          <th className="py-2.5 px-3 text-right">Saldo Atual</th>
                          <th className="py-2.5 px-3 text-right">Estoque Mín.</th>
                          <th className="py-2.5 px-3 text-center">Situação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {materialsList
                          .filter(m => {
                            const q = materialSearch.toLowerCase().trim();
                            return !q || 
                              m.nome.toLowerCase().includes(q) || 
                              (m.codigo && m.codigo.toLowerCase().includes(q)) || 
                              (m.categoria && m.categoria.toLowerCase().includes(q));
                          })
                          .map((m) => {
                            const isLow = m.estoqueAtual <= m.estoqueMinimo;
                            return (
                              <tr key={m.id} className="hover:bg-muted/30 transition-colors">
                                <td className="py-2.5 px-3 font-mono font-semibold text-primary text-[11px]">
                                  {m.codigo || '—'}
                                </td>
                                <td className="py-2.5 px-3 font-medium text-foreground">
                                  {m.nome}
                                </td>
                                <td className="py-2.5 px-3 text-muted-foreground text-[11px] capitalize">
                                  {m.categoria ? m.categoria.toLowerCase() : 'Geral'}
                                </td>
                                <td className="py-2.5 px-3 text-center font-mono text-muted-foreground">
                                  {m.unidadeMedida || 'UN'}
                                </td>
                                <td className="py-2.5 px-3 text-right font-mono text-foreground font-medium">
                                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(m.precoUnitario || 0)}
                                </td>
                                <td className="py-2.5 px-3 text-right font-mono font-bold text-foreground">
                                  {m.estoqueAtual}
                                </td>
                                <td className="py-2.5 px-3 text-right font-mono text-muted-foreground text-[11px]">
                                  {m.estoqueMinimo}
                                </td>
                                <td className="py-2.5 px-3 text-center">
                                  {isLow ? (
                                    <span className="text-[10px] font-bold text-amber-800 bg-amber-100/70 border border-amber-300/50 px-2 py-0.5 rounded-full">
                                      Estoque Baixo
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/70 border border-emerald-300/50 px-2 py-0.5 rounded-full">
                                      Regular
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Modal de Cadastro de Novo Material */}
              {isNewMaterialModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-card rounded-2xl border border-border shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                          <Package size={15} />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-foreground">Cadastrar Material / Peça</h3>
                          <p className="text-[11px] text-muted-foreground">Adicionar ao catálogo do almoxarifado</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsNewMaterialModalOpen(false)}
                        className="w-7 h-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <X size={15} />
                      </button>
                    </div>

                    <form onSubmit={handleCreateMaterialSubmit} className="p-5 space-y-4">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-1 space-y-1.5">
                          <label className="text-xs font-semibold text-foreground">Código:</label>
                          <input
                            type="text"
                            value={newMatCodigo}
                            onChange={(e) => setNewMatCodigo(e.target.value)}
                            placeholder="DISJ-20A"
                            className="w-full text-xs text-foreground bg-muted/40 border border-border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary uppercase font-mono"
                          />
                        </div>

                        <div className="col-span-2 space-y-1.5">
                          <label className="text-xs font-semibold text-foreground">Nome da Peça / Insumo:</label>
                          <input
                            type="text"
                            value={newMatNome}
                            onChange={(e) => setNewMatNome(e.target.value)}
                            placeholder="Ex: Disjuntor Bipolar 20A DIN"
                            className="w-full text-xs text-foreground bg-muted/40 border border-border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-foreground">Categoria:</label>
                          <select
                            value={newMatCategoria}
                            onChange={(e) => setNewMatCategoria(e.target.value)}
                            className="w-full text-xs text-foreground bg-muted/40 border border-border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
                          >
                            <option value="ELETRICA">Elétrica</option>
                            <option value="HIDRAULICA">Hidráulica</option>
                            <option value="ALVENARIA">Alvenaria</option>
                            <option value="CLIMATIZACAO">Climatização</option>
                            <option value="PINTURA">Pintura</option>
                            <option value="GERAL">Geral</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-foreground">Unidade de Medida:</label>
                          <input
                            type="text"
                            value={newMatUnidade}
                            onChange={(e) => setNewMatUnidade(e.target.value)}
                            placeholder="UN, M, KG, L, CX"
                            className="w-full text-xs text-foreground bg-muted/40 border border-border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary uppercase"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-foreground">Preço Unit. (R$):</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={newMatPreco}
                            onChange={(e) => setNewMatPreco(parseFloat(e.target.value) || 0)}
                            className="w-full text-xs text-foreground bg-muted/40 border border-border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono"
                            required
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-foreground">Estoque Inicial:</label>
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={newMatEstoque}
                            onChange={(e) => setNewMatEstoque(parseFloat(e.target.value) || 0)}
                            className="w-full text-xs text-foreground bg-muted/40 border border-border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono"
                            required
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-foreground">Estoque Mín.:</label>
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={newMatEstoqueMin}
                            onChange={(e) => setNewMatEstoqueMin(parseFloat(e.target.value) || 0)}
                            className="w-full text-xs text-foreground bg-muted/40 border border-border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono"
                            required
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsNewMaterialModalOpen(false)}
                          className="text-xs rounded-xl h-9 px-4 cursor-pointer"
                        >
                          Cancelar
                        </Button>
                        <Button
                          type="submit"
                          disabled={isSavingMaterial}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold rounded-xl h-9 px-4 flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          {isSavingMaterial ? (
                            <div className="w-3.5 h-3.5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <>
                              <CheckCircle2 size={14} />
                              <span>Salvar Material</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 5: DADOS, BACKUP & API (Exclusivo Admin / Engenharia) */}
          {activeTab === 'dados' && isAdmin && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Storage Stats */}
              <div className="p-6 ds-card space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-border">
                  <div className="w-9 h-9 rounded-xl bg-blue-50/70 text-blue-900 flex items-center justify-center shrink-0">
                    <Database size={18} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-foreground">Armazenamento Local & Auditoria</h2>
                    <p className="text-xs text-muted-foreground">Métricas em tempo real dos dados persistidos no navegador</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                  <div className="p-3.5 rounded-xl bg-muted border border-border text-center">
                    <span className="text-2xl font-black text-foreground">{orders.length}</span>
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">Chamados Salvos</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-muted border border-border text-center">
                    <span className="text-2xl font-black text-foreground">{units.length}</span>
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">Unidades Ativas</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-muted border border-border text-center">
                    <span className="text-2xl font-black text-foreground">{agenda.length}</span>
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">Vistorias na Agenda</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-muted border border-border text-center">
                    <span className="text-2xl font-black text-foreground">{activities.length}</span>
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">Logs de Auditoria</p>
                  </div>
                </div>
              </div>

              {/* Backup & Import */}
              <div className="p-6 ds-card space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-border">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Download size={18} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-foreground">Backup & Restauração JSON</h2>
                    <p className="text-xs text-muted-foreground">Exporte ou importe a base de dados completa em arquivo JSON estruturado</p>
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
                    className="w-full sm:w-auto border-border font-bold text-foreground hover:bg-muted gap-2 rounded-xl text-xs"
                  >
                    <Upload size={15} />
                    Importar Backup JSON
                  </Button>
                </div>
              </div>

              {/* Data Source: Mock vs API */}
              <div className="p-6 ds-card space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-border">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <Server size={18} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-foreground">Origem de Dados (Mock vs. API REST)</h2>
                    <p className="text-xs text-muted-foreground">Alterne entre o modo de demonstração local e conexão com backend real</p>
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
                        className="text-primary focus:ring-ring"
                      />
                      <span className="text-xs font-bold text-foreground">Modo Offline Local (Demonstração com Mock)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="datasource"
                        checked={!formData.useMockData}
                        onChange={() => setFormData({ ...formData, useMockData: false })}
                        className="text-primary focus:ring-ring"
                      />
                      <span className="text-xs font-bold text-foreground">Modo API Backend REST</span>
                    </label>
                  </div>

                  {!formData.useMockData && (
                    <div className="space-y-2 pt-2 animate-in fade-in duration-150">
                      <label className="block text-xs font-bold text-foreground">
                        URL Base da API Backend (Node.js / FastAPI / Go)
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          value={formData.apiEndpoint}
                          onChange={(e) => setFormData({ ...formData, apiEndpoint: e.target.value })}
                          className="flex-1 px-3.5 py-2 rounded-xl border border-border text-xs font-mono text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
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
              <div className="p-6 ds-card border-destructive/20 bg-destructive/5 space-y-3">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertTriangle size={18} className="shrink-0" />
                  <h3 className="text-sm font-bold">Zona de Perigo: Redefinição Geral de Fábrica</h3>
                </div>
                <p className="text-xs text-destructive/80 leading-relaxed">
                  Esta ação limpará todas as ordens de serviço, vistorias e alterações personalizadas armazenadas no navegador, restaurando o banco para os dados originais de demonstração.
                </p>
                <div className="pt-2">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setIsResetConfirmOpen(true)}
                    className="text-xs font-bold rounded-xl gap-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
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
          <div className="bg-background rounded-2xl max-w-md w-full p-6 shadow-2xl border border-border space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
              <AlertTriangle size={24} />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-foreground">Restaurar Banco de Fábrica?</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
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
          <div className="bg-background rounded-2xl max-w-md w-full p-6 shadow-2xl border border-border space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="text-base font-bold text-foreground">Cadastrar Novo Técnico</h3>
              <button 
                onClick={() => setIsNewTechModalOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Nome Completo</label>
                <input
                  type="text"
                  value={newTechName}
                  onChange={(e) => setNewTechName(e.target.value)}
                  placeholder="Ex: Fernando Almeida"
                  className="w-full px-3 py-2 rounded-xl border border-border text-sm focus:outline-hidden focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Especialidade Técnica</label>
                <input
                  type="text"
                  value={newTechSpec}
                  onChange={(e) => setNewTechSpec(e.target.value)}
                  placeholder="Ex: Elétrica & Automação Predial"
                  className="w-full px-3 py-2 rounded-xl border border-border text-sm focus:outline-hidden focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Telefone / Contato</label>
                <input
                  type="text"
                  value={newTechPhone}
                  onChange={(e) => setNewTechPhone(e.target.value)}
                  placeholder="(11) 98765-4321"
                  className="w-full px-3 py-2 rounded-xl border border-border text-sm focus:outline-hidden focus:ring-2 focus:ring-ring"
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
                className="flex-1 rounded-xl text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground"
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
          ? 'border-primary text-primary' 
          : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
      }`}
    >
      {icon}
      <span>{label}</span>
      {badge && (
        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
          active ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-muted text-muted-foreground'
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
    <div className="p-4 rounded-xl border border-border bg-input flex items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center shrink-0 mt-0.5">
          {icon}
        </div>
        <div>
          <h4 className="text-sm font-bold text-foreground">{title}</h4>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{description}</p>
        </div>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`w-11 h-6 rounded-full transition-colors relative shrink-0 p-0.5 mt-1 focus:outline-hidden ${
          checked ? 'bg-primary' : 'bg-muted'
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

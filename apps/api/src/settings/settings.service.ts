import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { ApiResponse } from '../common/interfaces/api-response.interface.js';

export interface SystemSettingsResponse {
  municipalityName: string;
  departmentName: string;
  managerName: string;
  managerRole: string;
  managerEmail: string;
  managerPhone: string;
  slaUrgentHours: number;
  slaHighHours: number;
  slaMediumHours: number;
  slaLowHours: number;
  mttrAlertHours: number;
  preventiveGoal: number;
  soundAlertsEnabled: boolean;
  pushNotificationsEnabled: boolean;
  whatsappAlertsEnabled: boolean;
  autoDispatchEnabled: boolean;
}

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  private mapSettings(s: any): SystemSettingsResponse {
    return {
      municipalityName: s.prefeitura_nome,
      departmentName: s.secretaria_nome,
      managerName: s.gestor_nome,
      managerRole: s.gestor_cargo,
      managerEmail: s.gestor_email,
      managerPhone: s.gestor_telefone,
      slaUrgentHours: s.sla_urgente_h,
      slaHighHours: s.sla_alta_h,
      slaMediumHours: s.sla_media_h,
      slaLowHours: s.sla_baixa_h,
      mttrAlertHours: s.mttr_alert_h,
      preventiveGoal: s.preventiva_goal,
      soundAlertsEnabled: s.sound_alerts,
      pushNotificationsEnabled: s.push_notif,
      whatsappAlertsEnabled: s.whatsapp_alerts,
      autoDispatchEnabled: s.auto_dispatch,
    };
  }

  async getSettings(): Promise<ApiResponse<SystemSettingsResponse>> {
    let settings = await this.prisma.configuracaoSistema.findUnique({
      where: { id: 'default' },
    });

    if (!settings) {
      settings = await this.prisma.configuracaoSistema.create({
        data: {
          id: 'default',
          prefeitura_nome: 'Prefeitura Municipal de Gestão Urbana',
          secretaria_nome: 'Secretaria de Infraestrutura e Zeladoria Predial',
          gestor_nome: 'Mariana Alves',
          gestor_cargo: 'Gestora Municipal de Zeladoria',
          gestor_email: 'mariana.alves@gestaourbana.gov.br',
          gestor_telefone: '(11) 3241-8900',
        },
      });
    }

    return {
      success: true,
      data: this.mapSettings(settings),
    };
  }

  async updateSettings(updates: any): Promise<ApiResponse<SystemSettingsResponse>> {
    const data: any = {};
    
    // Municipality & Department
    if (updates.municipalityName !== undefined) data.prefeitura_nome = updates.municipalityName;
    else if (updates.prefeituraNome !== undefined) data.prefeitura_nome = updates.prefeituraNome;

    if (updates.departmentName !== undefined) data.secretaria_nome = updates.departmentName;
    else if (updates.secretariaNome !== undefined) data.secretaria_nome = updates.secretariaNome;

    // Manager
    if (updates.managerName !== undefined) data.gestor_nome = updates.managerName;
    else if (updates.gestorNome !== undefined) data.gestor_nome = updates.gestorNome;

    if (updates.managerRole !== undefined) data.gestor_cargo = updates.managerRole;
    else if (updates.gestorCargo !== undefined) data.gestor_cargo = updates.gestorCargo;

    if (updates.managerEmail !== undefined) data.gestor_email = updates.managerEmail;
    else if (updates.gestorEmail !== undefined) data.gestor_email = updates.gestorEmail;

    if (updates.managerPhone !== undefined) data.gestor_telefone = updates.managerPhone;
    else if (updates.gestorTelefone !== undefined) data.gestor_telefone = updates.gestorTelefone;

    // SLAs
    if (updates.slaUrgentHours !== undefined) data.sla_urgente_h = Number(updates.slaUrgentHours);
    else if (updates.slaUrgenteHours !== undefined) data.sla_urgente_h = Number(updates.slaUrgenteHours);

    if (updates.slaHighHours !== undefined) data.sla_alta_h = Number(updates.slaHighHours);
    else if (updates.slaAltaHours !== undefined) data.sla_alta_h = Number(updates.slaAltaHours);

    if (updates.slaMediumHours !== undefined) data.sla_media_h = Number(updates.slaMediumHours);
    else if (updates.slaMediaHours !== undefined) data.sla_media_h = Number(updates.slaMediaHours);

    if (updates.slaLowHours !== undefined) data.sla_baixa_h = Number(updates.slaLowHours);
    else if (updates.slaBaixaHours !== undefined) data.sla_baixa_h = Number(updates.slaBaixaHours);

    if (updates.mttrAlertHours !== undefined) data.mttr_alert_h = Number(updates.mttrAlertHours);
    if (updates.preventiveGoal !== undefined) data.preventiva_goal = Number(updates.preventiveGoal);
    else if (updates.preventivaGoal !== undefined) data.preventiva_goal = Number(updates.preventivaGoal);

    // Toggles
    if (updates.soundAlertsEnabled !== undefined) data.sound_alerts = Boolean(updates.soundAlertsEnabled);
    else if (updates.soundAlerts !== undefined) data.sound_alerts = Boolean(updates.soundAlerts);

    if (updates.pushNotificationsEnabled !== undefined) data.push_notif = Boolean(updates.pushNotificationsEnabled);
    else if (updates.pushNotifications !== undefined) data.push_notif = Boolean(updates.pushNotifications);

    if (updates.whatsappAlertsEnabled !== undefined) data.whatsapp_alerts = Boolean(updates.whatsappAlertsEnabled);
    else if (updates.whatsappAlerts !== undefined) data.whatsapp_alerts = Boolean(updates.whatsappAlerts);

    if (updates.autoDispatchEnabled !== undefined) data.auto_dispatch = Boolean(updates.autoDispatchEnabled);
    else if (updates.autoDispatch !== undefined) data.auto_dispatch = Boolean(updates.autoDispatch);

    const updated = await this.prisma.configuracaoSistema.upsert({
      where: { id: 'default' },
      update: data,
      create: { id: 'default', ...data },
    });

    return {
      success: true,
      data: this.mapSettings(updated),
      message: 'Settings updated successfully.',
    };
  }
}

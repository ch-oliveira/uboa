import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { ApiResponse } from '../common/interfaces/api-response.interface.js';

export interface InspectionResponse {
  id: string;
  title: string;
  location: string;
  scheduledTime: string;
  type: string;
  isCompleted: boolean;
  technicianName?: string;
  createdAt: string;
}

@Injectable()
export class AgendaService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<ApiResponse<InspectionResponse[]>> {
    const items = await this.prisma.agendaVistoria.findMany({
      orderBy: { horario: 'asc' },
    });

    const data: InspectionResponse[] = items.map((a: any) => ({
      id: a.id,
      title: a.titulo,
      location: a.subtitulo,
      scheduledTime: a.horario,
      type: a.tipo,
      isCompleted: a.concluido,
      technicianName: a.tecnico || undefined,
      createdAt: a.criado_em.toISOString(),
    }));

    return {
      success: true,
      data,
      meta: {
        total: data.length,
      },
    };
  }

  async create(payload: any): Promise<ApiResponse<InspectionResponse>> {
    const title = payload.title || payload.titulo;
    const location = payload.location || payload.subtitle || payload.subtitulo || 'Unidade Municipal';
    const scheduledTime = payload.scheduledTime || payload.time || payload.horario || '09:00';
    const type = payload.type || payload.tipo || 'general';
    const technicianName = payload.technicianName || payload.tecnico;

    const created = await this.prisma.agendaVistoria.create({
      data: {
        titulo: title,
        subtitulo: location,
        horario: scheduledTime,
        tipo: type,
        tecnico: technicianName,
        concluido: false,
      },
    });

    return {
      success: true,
      data: {
        id: created.id,
        title: created.titulo,
        location: created.subtitulo,
        scheduledTime: created.horario,
        type: created.tipo,
        isCompleted: created.concluido,
        technicianName: created.tecnico || undefined,
        createdAt: created.criado_em.toISOString(),
      },
      message: 'Inspection scheduled successfully.',
    };
  }

  async toggle(id: string): Promise<ApiResponse<InspectionResponse>> {
    const item = await this.prisma.agendaVistoria.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException('Inspection not found.');
    }

    const updated = await this.prisma.agendaVistoria.update({
      where: { id },
      data: { concluido: !item.concluido },
    });

    return {
      success: true,
      data: {
        id: updated.id,
        title: updated.titulo,
        location: updated.subtitulo,
        scheduledTime: updated.horario,
        type: updated.tipo,
        isCompleted: updated.concluido,
        technicianName: updated.tecnico || undefined,
        createdAt: updated.criado_em.toISOString(),
      },
      message: 'Inspection status updated successfully.',
    };
  }
}

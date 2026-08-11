// ============================================================
// SOUNDWAVE — SUPPORT API (apps.support)
// ============================================================

import type { Ticket, TicketMessage } from '@/types';
import { apiClient } from './client';
import { type ApiTicket, type ApiTicketMessage, mapTicket, mapTicketMessage } from './mappers';

interface Paginated<T> {
  results: T[];
}

export async function getTickets(): Promise<Ticket[]> {
  const { data } = await apiClient.get<Paginated<ApiTicket> | ApiTicket[]>('/support/tickets/', {
    params: { page_size: 100 },
  });
  const list = Array.isArray(data) ? data : data.results;
  return list.map((t) => mapTicket(t));
}

export async function getTicketById(id: string): Promise<Ticket | null> {
  try {
    const [{ data: ticket }, { data: messages }] = await Promise.all([
      apiClient.get<ApiTicket>(`/support/tickets/${id}/`),
      apiClient.get<ApiTicketMessage[]>(`/support/tickets/${id}/messages/`),
    ]);
    return mapTicket(ticket, messages.map(mapTicketMessage));
  } catch {
    return null;
  }
}

export async function createTicket(subject: string): Promise<Ticket> {
  const { data } = await apiClient.post<ApiTicket>('/support/tickets/', { subject });
  return mapTicket(data);
}

export async function addTicketMessage(ticketId: string, body: string): Promise<TicketMessage> {
  const { data } = await apiClient.post<ApiTicketMessage>(`/support/tickets/${ticketId}/messages/`, { body });
  return mapTicketMessage(data);
}

// ── ARTIST VERIFICATION QUEUE ────────────────────────────────
// A distinct (smaller) shape from the public Artist type — the review
// queue exposes the applicant's email, which a public artist profile must not.

export interface PendingArtistVerification {
  id: string;
  stageName: string;
  email: string;
  portfolioUrl: string;
  createdAt: string;
}

interface ApiArtistVerificationRequest {
  id: number;
  stage_name: string;
  email: string;
  portfolio_url: string;
  verification_status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

function mapPendingArtist(a: ApiArtistVerificationRequest): PendingArtistVerification {
  return {
    id: String(a.id),
    stageName: a.stage_name,
    email: a.email,
    portfolioUrl: a.portfolio_url,
    createdAt: a.created_at,
  };
}

export async function getPendingArtistVerifications(): Promise<PendingArtistVerification[]> {
  const { data } = await apiClient.get<Paginated<ApiArtistVerificationRequest> | ApiArtistVerificationRequest[]>(
    '/support/artist-verifications/',
    { params: { page_size: 100 } }
  );
  const list = Array.isArray(data) ? data : data.results;
  return list.map(mapPendingArtist);
}

export async function approveArtistVerification(id: string): Promise<void> {
  await apiClient.post(`/support/artist-verifications/${id}/approve/`);
}

export async function rejectArtistVerification(id: string, reason: string): Promise<void> {
  await apiClient.post(`/support/artist-verifications/${id}/reject/`, { reason });
}

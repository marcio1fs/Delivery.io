import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function formatDistance(km: number): string {
  return `${km.toFixed(1)} km`;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'Pendente': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    'Aceito': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'Em Andamento': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    'No Local de Coleta': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    'Coletado': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    'No Destino': 'bg-teal-500/20 text-teal-400 border-teal-500/30',
    'Entregue': 'bg-green-500/20 text-green-400 border-green-500/30',
    'Cancelado': 'bg-red-500/20 text-red-400 border-red-500/30',
    'Online': 'bg-green-500/20 text-green-400 border-green-500/30',
    'Offline': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    'Em Entrega': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'Aberto': 'bg-green-500/20 text-green-400 border-green-500/30',
    'Fechado': 'bg-red-500/20 text-red-400 border-red-500/30',
    'Conectado': 'bg-green-500/20 text-green-400 border-green-500/30',
    'Não Conectado': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    'Pendente': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  };
  return colors[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
}

export function truncateString(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s-]{10,}$/;
  return phoneRegex.test(phone);
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function calculateDeliveryTime(distance: number): number {
  // Average speed of 30 km/h in urban areas
  const averageSpeed = 30;
  const timeInHours = distance / averageSpeed;
  return Math.round(timeInHours * 60); // Convert to minutes
}

export function getTimeAgo(date: string): string {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return 'agora mesmo';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min atrás`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} horas atrás`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} dias atrás`;
  
  return formatDate(date);
}

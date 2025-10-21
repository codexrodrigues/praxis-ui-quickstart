export interface Perfil {
  id: string;
  nome: string;
  codinome?: string;
  reputacao?: string;
}

export interface Habilidade {
  id: string;
  nome: string;
  nivel: number; // 1..5
}

export interface Reputacao {
  id: string;
  titulo: string;
  score: number; // -100..100
}

export interface Missao {
  id: string;
  titulo: string;
  status: 'planejada' | 'em_andamento' | 'concluida' | 'cancelada';
}

export interface Ameaca {
  id: string;
  tipo: string;
  risco: 'baixo' | 'medio' | 'alto' | 'critico';
}

export interface ResumoOperacional {
  missoesAtivas: number;
  ameacasAtivas: number;
  reputacaoMedia: number;
}

export interface Incidente {
  id: string;
  descricao: string;
  severidade: 'baixa' | 'media' | 'alta' | 'critica';
}

export interface Indenizacao {
  id: string;
  valor: number;
  motivo: string;
}

export interface Indicador {
  id: string;
  label: string;
  valor: number;
  meta?: number;
}


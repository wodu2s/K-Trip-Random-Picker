import { DataSource } from '../types/destination';

export function getDataSourceLabel(source: DataSource): string {
  return source === 'KTO_OPEN_API' ? '한국관광공사 OpenAPI' : '예시 데이터';
}

export function getCardDataSourceLabel(source: DataSource): string {
  return source === 'KTO_OPEN_API' ? 'KTO 공식 관광정보' : '예시 데이터';
}

export function getDataSourceStyle(source: DataSource): string {
  return source === 'KTO_OPEN_API'
    ? 'bg-blue-50 text-blue-600 border-blue-100'
    : 'bg-slate-100 text-slate-500 border-slate-200';
}

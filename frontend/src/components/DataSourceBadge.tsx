import { DataSource } from '../types/destination';
import { getDataSourceLabel, getDataSourceStyle } from '../utils/dataSource';

interface DataSourceBadgeProps {
  source: DataSource;
  variant?: 'default' | 'hero';
}

export default function DataSourceBadge({ source, variant = 'default' }: DataSourceBadgeProps) {
  const baseStyle = getDataSourceStyle(source);
  const variantClass =
    variant === 'hero'
      ? 'bg-white/15 text-white/80 border-white/20 backdrop-blur-sm'
      : baseStyle;

  return (
    <span
      className={`badge-source ${variantClass}`}
    >
      {getDataSourceLabel(source)}
    </span>
  );
}

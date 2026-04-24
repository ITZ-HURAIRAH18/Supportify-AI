import Badge from './Badge';

export default function StatCard({ title, value, trend, trendType, Icon, iconColor }) {
  const getTrendVariant = () => {
    if (trendType === 'up') return 'success';
    if (trendType === 'down') return 'danger';
    if (trendType === 'warning') return 'warning';
    return 'gray';
  };

  return (
    <div className="bg-bg-card border border-border rounded-lg p-5 hover:border-border-hover transition-colors shadow-ambient">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-[13px] text-text-muted font-medium font-display tracking-[0.04px]">{title}</h3>
        {Icon && (
          <div className="p-2 rounded-md bg-bg-surface border border-border">
            <Icon className="w-5 h-5 text-accent-muted-text" color={iconColor} />
          </div>
        )}
      </div>
      <div className="flex items-end gap-3">
        <span className="text-[32px] leading-none font-normal tracking-[-0.03em] text-text-primary font-display">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        {trend && (
          <div className="mb-1">
            <Badge label={trend} variant={getTrendVariant()} />
          </div>
        )}
      </div>
    </div>
  );
}

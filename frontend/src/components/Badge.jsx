export default function Badge({ label, variant = 'gray' }) {
  const styles = {
    success: 'bg-status-success-bg text-status-success-text',
    warning: 'bg-status-warning-bg text-status-warning-text',
    danger: 'bg-status-danger-bg text-status-danger-text',
    info: 'bg-status-info-bg text-status-info-text',
    orange: 'bg-accent-muted-bg text-accent-muted-text',
    gray: 'bg-bg-hover text-text-secondary',
  };

  const currentStyle = styles[variant] || styles.gray;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-pill text-xs font-medium font-display ${currentStyle}`}>
      {label}
    </span>
  );
}

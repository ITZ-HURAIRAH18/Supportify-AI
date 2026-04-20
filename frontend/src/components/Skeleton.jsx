export default function Skeleton({ rows = 3 }) {
  return (
    <div className="animate-pulse space-y-4 py-4 w-full">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex space-x-4">
          <div className="h-4 bg-bg-hover rounded-sm w-full"></div>
        </div>
      ))}
    </div>
  );
}

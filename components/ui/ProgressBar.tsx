interface ProgressBarProps {
  value: number       // 0–100
  color?: string
  className?: string
  showLabel?: boolean
}

export function ProgressBar({ value, color = '#22c55e', className, showLabel }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value))
  const isOver = value > 100

  return (
    <div className={`space-y-1 ${className ?? ''}`}>
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{
            width: `${Math.min(clamped, 100)}%`,
            backgroundColor: isOver ? '#f87171' : color,
          }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-text-muted">{Math.round(clamped)}%</span>
      )}
    </div>
  )
}

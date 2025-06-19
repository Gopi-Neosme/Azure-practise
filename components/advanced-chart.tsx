"use client"
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Activity,
  Target,
  Grid3X3,
  TreePine,
  Filter,
  Gauge,
  BarChart4,
  CandlestickChart,
  Radar,
  Circle,
} from "lucide-react"

interface ChartConfig {
  chartType: string
  data: Array<{ name: string; value: number; [key: string]: any }>
  xAxis: string
  yAxis: string
  colors: string[]
  [key: string]: any
}

interface AdvancedChartProps {
  config: ChartConfig
  onConfigChange?: (config: ChartConfig) => void
}

export function AdvancedChart({ config, onConfigChange }: AdvancedChartProps) {
  const chartData = config.data || []
  const maxValue = Math.max(...chartData.map((item) => item.value))
  const minValue = Math.min(...chartData.map((item) => item.value))

  const renderBarChart = () => (
    <div className="space-y-3">
      {chartData.map((item, index) => (
        <div key={index} className="flex items-center space-x-3">
          <div className="w-16 text-white/80 text-sm truncate">{item.name}</div>
          <div className="flex-1 bg-white/10 rounded-full h-6 relative overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
              style={{
                width: `${(item.value / maxValue) * 100}%`,
                background: `linear-gradient(90deg, ${config.colors[index % config.colors.length]}, ${config.colors[index % config.colors.length]}dd)`,
              }}
            >
              <span className="text-white text-xs font-medium">{item.value}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  const renderLineChart = () => (
    <div className="relative h-48">
      <svg className="w-full h-full" viewBox="0 0 400 200">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={config.colors[0]} />
            <stop offset="100%" stopColor={config.colors[1] || config.colors[0]} />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        <defs>
          <pattern id="grid" width="40" height="20" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Line */}
        <path
          d={`M ${chartData
            .map((item, index) => {
              const x = (index / (chartData.length - 1)) * 380 + 10
              const y = 190 - ((item.value - minValue) / (maxValue - minValue)) * 170
              return `${index === 0 ? "M" : "L"} ${x} ${y}`
            })
            .join(" ")}`}
          stroke="url(#lineGradient)"
          strokeWidth="3"
          fill="none"
          className="drop-shadow-sm"
        />

        {/* Points */}
        {chartData.map((item, index) => {
          const x = (index / (chartData.length - 1)) * 380 + 10
          const y = 190 - ((item.value - minValue) / (maxValue - minValue)) * 170
          return (
            <g key={index}>
              <circle cx={x} cy={y} r="6" fill={config.colors[0]} className="drop-shadow-sm" />
              <circle cx={x} cy={y} r="3" fill="white" />
            </g>
          )
        })}

        {/* Labels */}
        {chartData.map((item, index) => {
          const x = (index / (chartData.length - 1)) * 380 + 10
          return (
            <text key={index} x={x} y="195" textAnchor="middle" className="fill-white/60 text-xs">
              {item.name}
            </text>
          )
        })}
      </svg>
    </div>
  )

  const renderAreaChart = () => (
    <div className="relative h-48">
      <svg className="w-full h-full" viewBox="0 0 400 200">
        <defs>
          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={config.colors[0]} stopOpacity="0.8" />
            <stop offset="100%" stopColor={config.colors[0]} stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Area */}
        <path
          d={`M 10 190 ${chartData
            .map((item, index) => {
              const x = (index / (chartData.length - 1)) * 380 + 10
              const y = 190 - ((item.value - minValue) / (maxValue - minValue)) * 170
              return `L ${x} ${y}`
            })
            .join(" ")} L 390 190 Z`}
          fill="url(#areaGradient)"
        />

        {/* Line */}
        <path
          d={`M ${chartData
            .map((item, index) => {
              const x = (index / (chartData.length - 1)) * 380 + 10
              const y = 190 - ((item.value - minValue) / (maxValue - minValue)) * 170
              return `${index === 0 ? "M" : "L"} ${x} ${y}`
            })
            .join(" ")}`}
          stroke={config.colors[0]}
          strokeWidth="2"
          fill="none"
        />

        {/* Points */}
        {chartData.map((item, index) => {
          const x = (index / (chartData.length - 1)) * 380 + 10
          const y = 190 - ((item.value - minValue) / (maxValue - minValue)) * 170
          return <circle key={index} cx={x} cy={y} r="4" fill={config.colors[0]} />
        })}
      </svg>
    </div>
  )

  const renderPieChart = () => {
    const total = chartData.reduce((sum, item) => sum + item.value, 0)
    let currentAngle = 0

    return (
      <div className="flex items-center justify-center h-48">
        <div className="relative w-40 h-40">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {chartData.map((item, index) => {
              const percentage = (item.value / total) * 100
              const angle = (percentage / 100) * 360
              const startAngle = currentAngle
              currentAngle += angle

              const x1 = 50 + 45 * Math.cos((startAngle * Math.PI) / 180)
              const y1 = 50 + 45 * Math.sin((startAngle * Math.PI) / 180)
              const x2 = 50 + 45 * Math.cos(((startAngle + angle) * Math.PI) / 180)
              const y2 = 50 + 45 * Math.sin(((startAngle + angle) * Math.PI) / 180)

              const largeArcFlag = angle > 180 ? 1 : 0

              return (
                <path
                  key={index}
                  d={`M 50 50 L ${x1} ${y1} A 45 45 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                  fill={config.colors[index % config.colors.length]}
                  className="hover:opacity-80 transition-opacity drop-shadow-sm"
                />
              )
            })}
          </svg>
        </div>
        <div className="ml-6 space-y-2">
          {chartData.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: config.colors[index % config.colors.length] }}
              />
              <span className="text-white/80 text-sm">{item.name}</span>
              <span className="text-white/60 text-sm">({item.value})</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderDonutChart = () => {
    const total = chartData.reduce((sum, item) => sum + item.value, 0)
    let currentAngle = 0

    return (
      <div className="flex items-center justify-center h-48">
        <div className="relative w-40 h-40">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {chartData.map((item, index) => {
              const percentage = (item.value / total) * 100
              const angle = (percentage / 100) * 360
              const startAngle = currentAngle
              currentAngle += angle

              const outerRadius = 45
              const innerRadius = 25

              const x1 = 50 + outerRadius * Math.cos((startAngle * Math.PI) / 180)
              const y1 = 50 + outerRadius * Math.sin((startAngle * Math.PI) / 180)
              const x2 = 50 + outerRadius * Math.cos(((startAngle + angle) * Math.PI) / 180)
              const y2 = 50 + outerRadius * Math.sin(((startAngle + angle) * Math.PI) / 180)

              const x3 = 50 + innerRadius * Math.cos(((startAngle + angle) * Math.PI) / 180)
              const y3 = 50 + innerRadius * Math.sin(((startAngle + angle) * Math.PI) / 180)
              const x4 = 50 + innerRadius * Math.cos((startAngle * Math.PI) / 180)
              const y4 = 50 + innerRadius * Math.sin((startAngle * Math.PI) / 180)

              const largeArcFlag = angle > 180 ? 1 : 0

              return (
                <path
                  key={index}
                  d={`M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4} Z`}
                  fill={config.colors[index % config.colors.length]}
                  className="hover:opacity-80 transition-opacity drop-shadow-sm"
                />
              )
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-white text-lg font-bold">{total}</div>
              <div className="text-white/60 text-xs">Total</div>
            </div>
          </div>
        </div>
        <div className="ml-6 space-y-2">
          {chartData.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: config.colors[index % config.colors.length] }}
              />
              <span className="text-white/80 text-sm">{item.name}</span>
              <span className="text-white/60 text-sm">({item.value})</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderScatterPlot = () => (
    <div className="relative h-48">
      <svg className="w-full h-full" viewBox="0 0 400 200">
        {/* Grid */}
        <defs>
          <pattern id="scatterGrid" width="40" height="20" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#scatterGrid)" />

        {/* Scatter points */}
        {chartData.map((item, index) => {
          const x = (index / (chartData.length - 1)) * 380 + 10
          const y = 190 - ((item.value - minValue) / (maxValue - minValue)) * 170
          const size = Math.max(4, Math.min(12, item.value / 10))

          return (
            <g key={index}>
              <circle
                cx={x}
                cy={y}
                r={size}
                fill={config.colors[index % config.colors.length]}
                className="opacity-80 hover:opacity-100 transition-opacity"
              />
              <circle cx={x} cy={y} r={size / 2} fill="white" className="opacity-60" />
            </g>
          )
        })}

        {/* Labels */}
        {chartData.map((item, index) => {
          const x = (index / (chartData.length - 1)) * 380 + 10
          return (
            <text key={index} x={x} y="195" textAnchor="middle" className="fill-white/60 text-xs">
              {item.name}
            </text>
          )
        })}
      </svg>
    </div>
  )

  const renderBubbleChart = () => (
    <div className="relative h-48">
      <svg className="w-full h-full" viewBox="0 0 400 200">
        {/* Grid */}
        <defs>
          <pattern id="bubbleGrid" width="40" height="20" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#bubbleGrid)" />

        {/* Bubbles */}
        {chartData.map((item, index) => {
          const x = 50 + ((index * 60) % 300)
          const y = 50 + (item.value / maxValue) * 100
          const radius = Math.max(8, Math.min(25, (item.value / maxValue) * 30))

          return (
            <g key={index}>
              <circle
                cx={x}
                cy={y}
                r={radius}
                fill={config.colors[index % config.colors.length]}
                className="opacity-70 hover:opacity-90 transition-all"
                style={{
                  filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
                }}
              />
              <text x={x} y={y + 4} textAnchor="middle" className="fill-white text-xs font-medium">
                {item.value}
              </text>
              <text x={x} y={y + radius + 15} textAnchor="middle" className="fill-white/60 text-xs">
                {item.name}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )

  const renderHeatmap = () => {
    const gridSize = Math.ceil(Math.sqrt(chartData.length))
    const cellSize = 180 / gridSize

    return (
      <div className="flex justify-center items-center h-48">
        <svg width="200" height="180" viewBox="0 0 200 180">
          {chartData.map((item, index) => {
            const row = Math.floor(index / gridSize)
            const col = index % gridSize
            const x = col * cellSize + 10
            const y = row * cellSize + 10
            const intensity = (item.value - minValue) / (maxValue - minValue)
            const color = config.colors[0]

            return (
              <g key={index}>
                <rect
                  x={x}
                  y={y}
                  width={cellSize - 2}
                  height={cellSize - 2}
                  fill={color}
                  opacity={0.3 + intensity * 0.7}
                  className="hover:opacity-100 transition-opacity"
                />
                <text
                  x={x + cellSize / 2}
                  y={y + cellSize / 2 + 4}
                  textAnchor="middle"
                  className="fill-white text-xs font-medium"
                >
                  {item.value}
                </text>
                <text x={x + cellSize / 2} y={y + cellSize - 5} textAnchor="middle" className="fill-white/60 text-xs">
                  {item.name.slice(0, 3)}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    )
  }

  const renderTreemap = () => {
    const total = chartData.reduce((sum, item) => sum + item.value, 0)
    let currentArea = 0
    const width = 300
    const height = 180

    return (
      <div className="flex justify-center items-center h-48">
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          {chartData.map((item, index) => {
            const area = (item.value / total) * (width * height)
            const rectWidth = Math.sqrt(area * (width / height))
            const rectHeight = area / rectWidth

            const x = currentArea % width
            const y = Math.floor(currentArea / width) * 40
            currentArea += rectWidth

            return (
              <g key={index}>
                <rect
                  x={x}
                  y={y}
                  width={rectWidth}
                  height={Math.min(rectHeight, 40)}
                  fill={config.colors[index % config.colors.length]}
                  className="opacity-80 hover:opacity-100 transition-opacity"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="1"
                />
                <text x={x + rectWidth / 2} y={y + 15} textAnchor="middle" className="fill-white text-xs font-medium">
                  {item.name}
                </text>
                <text x={x + rectWidth / 2} y={y + 28} textAnchor="middle" className="fill-white/80 text-xs">
                  {item.value}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    )
  }

  const renderFunnelChart = () => {
    const maxWidth = 250
    const stepHeight = 160 / chartData.length

    return (
      <div className="flex justify-center items-center h-48">
        <svg width="300" height="180" viewBox="0 0 300 180">
          {chartData.map((item, index) => {
            const width = (item.value / maxValue) * maxWidth
            const x = (300 - width) / 2
            const y = index * stepHeight + 10

            return (
              <g key={index}>
                <path
                  d={`M ${x} ${y} L ${x + width} ${y} L ${x + width - 10} ${y + stepHeight - 2} L ${x + 10} ${y + stepHeight - 2} Z`}
                  fill={config.colors[index % config.colors.length]}
                  className="opacity-80 hover:opacity-100 transition-opacity"
                />
                <text x={150} y={y + stepHeight / 2 + 4} textAnchor="middle" className="fill-white text-sm font-medium">
                  {item.name}: {item.value}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    )
  }

  const renderGaugeChart = () => {
    const value = chartData[0]?.value || 0
    const maxGaugeValue = Math.max(100, maxValue)
    const percentage = Math.min((value / maxGaugeValue) * 100, 100)
    const angle = (percentage / 100) * 180

    return (
      <div className="flex flex-col items-center justify-center h-48">
        <div className="relative w-48 h-24">
          <svg className="w-full h-full" viewBox="0 0 200 100">
            {/* Background arc */}
            <path d="M 20 80 A 80 80 0 0 1 180 80" stroke="rgba(255,255,255,0.2)" strokeWidth="12" fill="none" />

            {/* Progress arc */}
            <path
              d="M 20 80 A 80 80 0 0 1 180 80"
              stroke={config.colors[0]}
              strokeWidth="12"
              fill="none"
              strokeDasharray={`${(angle / 180) * 251.2} 251.2`}
              className="transition-all duration-1000"
              strokeLinecap="round"
            />

            {/* Center circle */}
            <circle cx="100" cy="80" r="8" fill={config.colors[0]} />

            {/* Needle */}
            <line
              x1="100"
              y1="80"
              x2={100 + 60 * Math.cos((angle - 90) * (Math.PI / 180))}
              y2={80 + 60 * Math.sin((angle - 90) * (Math.PI / 180))}
              stroke="white"
              strokeWidth="3"
              className="transition-all duration-1000"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div className="text-center mt-4">
          <div className="text-3xl font-bold text-white">{value}</div>
          <div className="text-white/60 text-sm">{chartData[0]?.name || "Value"}</div>
          <div className="text-white/40 text-xs">Max: {maxGaugeValue}</div>
        </div>
      </div>
    )
  }

  const renderWaterfallChart = () => {
    let runningTotal = 0
    const barWidth = 300 / chartData.length

    return (
      <div className="relative h-48">
        <svg className="w-full h-full" viewBox="0 0 400 200">
          {/* Grid */}
          <defs>
            <pattern id="waterfallGrid" width="40" height="20" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#waterfallGrid)" />

          {chartData.map((item, index) => {
            const x = index * barWidth + 50
            const isPositive = item.value >= 0
            const barHeight = Math.abs(item.value / maxValue) * 150
            const y = isPositive
              ? 170 - barHeight - (runningTotal / maxValue) * 150
              : 170 - (runningTotal / maxValue) * 150

            // Connecting line to next bar
            if (index < chartData.length - 1) {
              const nextX = (index + 1) * barWidth + 50
              const lineY = isPositive ? y : y + barHeight

              return (
                <g key={index}>
                  <rect
                    x={x}
                    y={y}
                    width={barWidth - 10}
                    height={barHeight}
                    fill={isPositive ? config.colors[0] : config.colors[1] || "#ef4444"}
                    className="opacity-80 hover:opacity-100 transition-opacity"
                  />
                  <line
                    x1={x + barWidth - 10}
                    y1={lineY}
                    x2={nextX}
                    y2={lineY}
                    stroke="rgba(255,255,255,0.4)"
                    strokeWidth="1"
                    strokeDasharray="3,3"
                  />
                  <text x={x + (barWidth - 10) / 2} y={y - 5} textAnchor="middle" className="fill-white text-xs">
                    {item.value > 0 ? "+" : ""}
                    {item.value}
                  </text>
                  <text x={x + (barWidth - 10) / 2} y={185} textAnchor="middle" className="fill-white/60 text-xs">
                    {item.name}
                  </text>
                </g>
              )
            }

            const result = (
              <g key={index}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth - 10}
                  height={barHeight}
                  fill={isPositive ? config.colors[0] : config.colors[1] || "#ef4444"}
                  className="opacity-80 hover:opacity-100 transition-opacity"
                />
                <text x={x + (barWidth - 10) / 2} y={y - 5} textAnchor="middle" className="fill-white text-xs">
                  {item.value > 0 ? "+" : ""}
                  {item.value}
                </text>
                <text x={x + (barWidth - 10) / 2} y={185} textAnchor="middle" className="fill-white/60 text-xs">
                  {item.name}
                </text>
              </g>
            )

            runningTotal += item.value
            return result
          })}
        </svg>
      </div>
    )
  }

  const renderCandlestickChart = () => (
    <div className="relative h-48">
      <svg className="w-full h-full" viewBox="0 0 400 200">
        {/* Grid */}
        <defs>
          <pattern id="candleGrid" width="40" height="20" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#candleGrid)" />

        {chartData.map((item, index) => {
          const x = (index / (chartData.length - 1)) * 350 + 25
          const high = item.high || item.value + Math.random() * 20
          const low = item.low || item.value - Math.random() * 20
          const open = item.open || item.value - Math.random() * 10
          const close = item.close || item.value + Math.random() * 10

          const highY = 20 + ((maxValue - high) / maxValue) * 150
          const lowY = 20 + ((maxValue - low) / maxValue) * 150
          const openY = 20 + ((maxValue - open) / maxValue) * 150
          const closeY = 20 + ((maxValue - close) / maxValue) * 150

          const isGreen = close > open
          const bodyTop = Math.min(openY, closeY)
          const bodyHeight = Math.abs(closeY - openY)

          return (
            <g key={index}>
              {/* Wick */}
              <line x1={x} y1={highY} x2={x} y2={lowY} stroke="white" strokeWidth="1" />

              {/* Body */}
              <rect
                x={x - 8}
                y={bodyTop}
                width={16}
                height={Math.max(bodyHeight, 2)}
                fill={isGreen ? config.colors[0] : config.colors[1] || "#ef4444"}
                className="opacity-80"
              />

              {/* Labels */}
              <text x={x} y={190} textAnchor="middle" className="fill-white/60 text-xs">
                {item.name}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )

  const renderRadarChart = () => {
    const centerX = 100
    const centerY = 100
    const radius = 80
    const angleStep = (2 * Math.PI) / chartData.length

    return (
      <div className="flex justify-center items-center h-48">
        <svg width="200" height="200" viewBox="0 0 200 200">
          {/* Grid circles */}
          {[0.2, 0.4, 0.6, 0.8, 1].map((scale, index) => (
            <circle
              key={index}
              cx={centerX}
              cy={centerY}
              r={radius * scale}
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="1"
            />
          ))}

          {/* Grid lines */}
          {chartData.map((_, index) => {
            const angle = index * angleStep - Math.PI / 2
            const x = centerX + radius * Math.cos(angle)
            const y = centerY + radius * Math.sin(angle)

            return (
              <line
                key={index}
                x1={centerX}
                y1={centerY}
                x2={x}
                y2={y}
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="1"
              />
            )
          })}

          {/* Data polygon */}
          <path
            d={`M ${chartData
              .map((item, index) => {
                const angle = index * angleStep - Math.PI / 2
                const value = (item.value / maxValue) * radius
                const x = centerX + value * Math.cos(angle)
                const y = centerY + value * Math.sin(angle)
                return `${index === 0 ? "M" : "L"} ${x} ${y}`
              })
              .join(" ")} Z`}
            fill={config.colors[0]}
            fillOpacity="0.3"
            stroke={config.colors[0]}
            strokeWidth="2"
          />

          {/* Data points */}
          {chartData.map((item, index) => {
            const angle = index * angleStep - Math.PI / 2
            const value = (item.value / maxValue) * radius
            const x = centerX + value * Math.cos(angle)
            const y = centerY + value * Math.sin(angle)

            return <circle key={index} cx={x} cy={y} r="4" fill={config.colors[0]} />
          })}

          {/* Labels */}
          {chartData.map((item, index) => {
            const angle = index * angleStep - Math.PI / 2
            const labelRadius = radius + 15
            const x = centerX + labelRadius * Math.cos(angle)
            const y = centerY + labelRadius * Math.sin(angle)

            return (
              <text key={index} x={x} y={y + 4} textAnchor="middle" className="fill-white/80 text-xs">
                {item.name}
              </text>
            )
          })}
        </svg>
      </div>
    )
  }

  const renderPolarChart = () => {
    const centerX = 100
    const centerY = 100
    const maxRadius = 80

    return (
      <div className="flex justify-center items-center h-48">
        <svg width="200" height="200" viewBox="0 0 200 200">
          {/* Grid circles */}
          {[0.25, 0.5, 0.75, 1].map((scale, index) => (
            <circle
              key={index}
              cx={centerX}
              cy={centerY}
              r={maxRadius * scale}
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="1"
            />
          ))}

          {/* Polar bars */}
          {chartData.map((item, index) => {
            const angle = (index / chartData.length) * 2 * Math.PI - Math.PI / 2
            const radius = (item.value / maxValue) * maxRadius
            const barWidth = ((2 * Math.PI) / chartData.length) * 0.8

            const startAngle = angle - barWidth / 2
            const endAngle = angle + barWidth / 2

            const x1 = centerX + 10 * Math.cos(startAngle)
            const y1 = centerY + 10 * Math.sin(startAngle)
            const x2 = centerX + radius * Math.cos(startAngle)
            const y2 = centerY + radius * Math.sin(startAngle)
            const x3 = centerX + radius * Math.cos(endAngle)
            const y3 = centerY + radius * Math.sin(endAngle)
            const x4 = centerX + 10 * Math.cos(endAngle)
            const y4 = centerY + 10 * Math.sin(endAngle)

            return (
              <g key={index}>
                <path
                  d={`M ${x1} ${y1} L ${x2} ${y2} A ${radius} ${radius} 0 0 1 ${x3} ${y3} L ${x4} ${y4} A 10 10 0 0 0 ${x1} ${y1} Z`}
                  fill={config.colors[index % config.colors.length]}
                  className="opacity-80 hover:opacity-100 transition-opacity"
                />

                {/* Labels */}
                <text
                  x={centerX + (maxRadius + 15) * Math.cos(angle)}
                  y={centerY + (maxRadius + 15) * Math.sin(angle) + 4}
                  textAnchor="middle"
                  className="fill-white/80 text-xs"
                >
                  {item.name}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    )
  }

  const renderChart = () => {
    switch (config.chartType) {
      case "bar":
        return renderBarChart()
      case "line":
        return renderLineChart()
      case "pie":
        return renderPieChart()
      case "donut":
        return renderDonutChart()
      case "area":
        return renderAreaChart()
      case "scatter":
        return renderScatterPlot()
      case "bubble":
        return renderBubbleChart()
      case "heatmap":
        return renderHeatmap()
      case "treemap":
        return renderTreemap()
      case "funnel":
        return renderFunnelChart()
      case "gauge":
        return renderGaugeChart()
      case "waterfall":
        return renderWaterfallChart()
      case "candlestick":
        return renderCandlestickChart()
      case "radar":
        return renderRadarChart()
      case "polar":
        return renderPolarChart()
      default:
        return renderBarChart()
    }
  }

  const getChartIcon = () => {
    switch (config.chartType) {
      case "pie":
        return PieChart
      case "donut":
        return PieChart
      case "line":
        return TrendingUp
      case "area":
        return TrendingUp
      case "scatter":
        return Target
      case "bubble":
        return Circle
      case "heatmap":
        return Grid3X3
      case "treemap":
        return TreePine
      case "funnel":
        return Filter
      case "gauge":
        return Gauge
      case "waterfall":
        return BarChart4
      case "candlestick":
        return CandlestickChart
      case "radar":
        return Radar
      case "polar":
        return Activity
      default:
        return BarChart3
    }
  }

  const ChartIcon = getChartIcon()

  if (!chartData.length) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <ChartIcon className="w-12 h-12 text-white/40 mx-auto mb-2" />
          <p className="text-white/60">No data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ChartIcon className="w-5 h-5 text-white/80" />
          <span className="text-white/80 font-medium capitalize">{config.chartType} Chart</span>
        </div>
        <div className="text-white/60 text-sm">{chartData.length} data points</div>
      </div>

      <div className="h-full">{renderChart()}</div>
    </div>
  )
}

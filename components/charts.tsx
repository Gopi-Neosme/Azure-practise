"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { TrendingUp, TrendingDown, BarChart3, PieChartIcon, Activity, Zap } from "lucide-react"

// Chart data interfaces
interface ChartDataPoint {
  label: string
  value: number
  color?: string
}

interface LineChartDataPoint {
  x: string | number
  y: number
}

interface ChartProps {
  data: ChartDataPoint[] | LineChartDataPoint[]
  title?: string
  height?: number
  color?: string
  showLegend?: boolean
  animated?: boolean
}

// Bar Chart Component
export function BarChart({
  data,
  title,
  height = 300,
  color = "#3B82F6",
  showLegend = true,
  animated = true,
}: ChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [animationProgress, setAnimationProgress] = useState(0)

  useEffect(() => {
    if (!canvasRef.current || !Array.isArray(data)) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    const chartData = data as ChartDataPoint[]
    const maxValue = Math.max(...chartData.map((d) => d.value))
    const padding = 60
    const chartWidth = rect.width - padding * 2
    const chartHeight = rect.height - padding * 2
    const barWidth = (chartWidth / chartData.length) * 0.8
    const barSpacing = (chartWidth / chartData.length) * 0.2

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height)

    // Draw bars
    chartData.forEach((item, index) => {
      const barHeight = (item.value / maxValue) * chartHeight * animationProgress
      const x = padding + index * (barWidth + barSpacing) + barSpacing / 2
      const y = rect.height - padding - barHeight

      // Bar
      ctx.fillStyle = item.color || color
      ctx.fillRect(x, y, barWidth, barHeight)

      // Value label
      ctx.fillStyle = "#ffffff"
      ctx.font = "12px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(item.value.toString(), x + barWidth / 2, y - 5)

      // X-axis label
      ctx.fillText(item.label, x + barWidth / 2, rect.height - padding + 20)
    })

    // Y-axis
    ctx.strokeStyle = "#ffffff40"
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, rect.height - padding)
    ctx.stroke()

    // X-axis
    ctx.beginPath()
    ctx.moveTo(padding, rect.height - padding)
    ctx.lineTo(rect.width - padding, rect.height - padding)
    ctx.stroke()

    // Animation
    if (animated && animationProgress < 1) {
      const timer = setTimeout(() => {
        setAnimationProgress((prev) => Math.min(1, prev + 0.02))
      }, 16)
      return () => clearTimeout(timer)
    }
  }, [data, color, animationProgress, animated])

  useEffect(() => {
    if (animated) {
      setAnimationProgress(0)
    } else {
      setAnimationProgress(1)
    }
  }, [data, animated])

  return (
    <div className="h-full flex flex-col">
      {title && (
        <div className="p-4 border-b border-white/10">
          <h3 className="text-white font-semibold flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            {title}
          </h3>
        </div>
      )}
      <div className="flex-1 p-4">
        <canvas ref={canvasRef} className="w-full h-full" style={{ height: `${height}px` }} />
      </div>
    </div>
  )
}

// Line Chart Component
export function LineChart({ data, title, height = 300, color = "#10B981", animated = true }: ChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [animationProgress, setAnimationProgress] = useState(0)

  useEffect(() => {
    if (!canvasRef.current || !Array.isArray(data)) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    const chartData = data as LineChartDataPoint[]
    const maxValue = Math.max(...chartData.map((d) => d.y))
    const minValue = Math.min(...chartData.map((d) => d.y))
    const padding = 60
    const chartWidth = rect.width - padding * 2
    const chartHeight = rect.height - padding * 2

    ctx.clearRect(0, 0, rect.width, rect.height)

    // Draw grid
    ctx.strokeStyle = "#ffffff20"
    ctx.lineWidth = 1
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(rect.width - padding, y)
      ctx.stroke()
    }

    // Draw line
    if (chartData.length > 1) {
      ctx.strokeStyle = color
      ctx.lineWidth = 3
      ctx.beginPath()

      const animatedLength = Math.floor(chartData.length * animationProgress)

      chartData.slice(0, animatedLength).forEach((point, index) => {
        const x = padding + (index / (chartData.length - 1)) * chartWidth
        const y = rect.height - padding - ((point.y - minValue) / (maxValue - minValue)) * chartHeight

        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })

      ctx.stroke()

      // Draw points
      ctx.fillStyle = color
      chartData.slice(0, animatedLength).forEach((point, index) => {
        const x = padding + (index / (chartData.length - 1)) * chartWidth
        const y = rect.height - padding - ((point.y - minValue) / (maxValue - minValue)) * chartHeight

        ctx.beginPath()
        ctx.arc(x, y, 4, 0, Math.PI * 2)
        ctx.fill()
      })
    }

    // Axes
    ctx.strokeStyle = "#ffffff40"
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, rect.height - padding)
    ctx.lineTo(rect.width - padding, rect.height - padding)
    ctx.stroke()

    if (animated && animationProgress < 1) {
      const timer = setTimeout(() => {
        setAnimationProgress((prev) => Math.min(1, prev + 0.02))
      }, 16)
      return () => clearTimeout(timer)
    }
  }, [data, color, animationProgress, animated])

  useEffect(() => {
    if (animated) {
      setAnimationProgress(0)
    } else {
      setAnimationProgress(1)
    }
  }, [data, animated])

  return (
    <div className="h-full flex flex-col">
      {title && (
        <div className="p-4 border-b border-white/10">
          <h3 className="text-white font-semibold flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            {title}
          </h3>
        </div>
      )}
      <div className="flex-1 p-4">
        <canvas ref={canvasRef} className="w-full h-full" style={{ height: `${height}px` }} />
      </div>
    </div>
  )
}

// Pie Chart Component
export function PieChart({ data, title, height = 300, showLegend = true, animated = true }: ChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [animationProgress, setAnimationProgress] = useState(0)

  useEffect(() => {
    if (!canvasRef.current || !Array.isArray(data)) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    const chartData = data as ChartDataPoint[]
    const total = chartData.reduce((sum, item) => sum + item.value, 0)
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const radius = Math.min(centerX, centerY) - 40

    ctx.clearRect(0, 0, rect.width, rect.height)

    let currentAngle = -Math.PI / 2
    const colors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4"]

    chartData.forEach((item, index) => {
      const sliceAngle = (item.value / total) * Math.PI * 2 * animationProgress
      const color = item.color || colors[index % colors.length]

      ctx.fillStyle = color
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle)
      ctx.closePath()
      ctx.fill()

      // Label
      const labelAngle = currentAngle + sliceAngle / 2
      const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7)
      const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7)

      ctx.fillStyle = "#ffffff"
      ctx.font = "12px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(`${Math.round((item.value / total) * 100)}%`, labelX, labelY)

      currentAngle += sliceAngle
    })

    if (animated && animationProgress < 1) {
      const timer = setTimeout(() => {
        setAnimationProgress((prev) => Math.min(1, prev + 0.02))
      }, 16)
      return () => clearTimeout(timer)
    }
  }, [data, animationProgress, animated])

  useEffect(() => {
    if (animated) {
      setAnimationProgress(0)
    } else {
      setAnimationProgress(1)
    }
  }, [data, animated])

  const chartData = data as ChartDataPoint[]
  const colors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4"]

  return (
    <div className="h-full flex flex-col">
      {title && (
        <div className="p-4 border-b border-white/10">
          <h3 className="text-white font-semibold flex items-center">
            <PieChartIcon className="w-5 h-5 mr-2" />
            {title}
          </h3>
        </div>
      )}
      <div className="flex-1 flex">
        <div className="flex-1 p-4">
          <canvas ref={canvasRef} className="w-full h-full" style={{ height: `${height}px` }} />
        </div>
        {showLegend && (
          <div className="w-32 p-4 space-y-2">
            {chartData.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color || colors[index % colors.length] }}
                />
                <span className="text-white/80 text-xs">{item.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Area Chart Component
export function AreaChart({ data, title, height = 300, color = "#8B5CF6", animated = true }: ChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [animationProgress, setAnimationProgress] = useState(0)

  useEffect(() => {
    if (!canvasRef.current || !Array.isArray(data)) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    const chartData = data as LineChartDataPoint[]
    const maxValue = Math.max(...chartData.map((d) => d.y))
    const minValue = Math.min(...chartData.map((d) => d.y))
    const padding = 60
    const chartWidth = rect.width - padding * 2
    const chartHeight = rect.height - padding * 2

    ctx.clearRect(0, 0, rect.width, rect.height)

    if (chartData.length > 1) {
      const animatedLength = Math.floor(chartData.length * animationProgress)

      // Create gradient
      const gradient = ctx.createLinearGradient(0, padding, 0, rect.height - padding)
      gradient.addColorStop(0, color + "80")
      gradient.addColorStop(1, color + "20")

      // Draw area
      ctx.fillStyle = gradient
      ctx.beginPath()

      // Start from bottom left
      const firstX = padding
      const firstY = rect.height - padding - ((chartData[0].y - minValue) / (maxValue - minValue)) * chartHeight
      ctx.moveTo(firstX, rect.height - padding)
      ctx.lineTo(firstX, firstY)

      // Draw the curve
      chartData.slice(0, animatedLength).forEach((point, index) => {
        const x = padding + (index / (chartData.length - 1)) * chartWidth
        const y = rect.height - padding - ((point.y - minValue) / (maxValue - minValue)) * chartHeight
        ctx.lineTo(x, y)
      })

      // Close the area
      if (animatedLength > 0) {
        const lastX = padding + ((animatedLength - 1) / (chartData.length - 1)) * chartWidth
        ctx.lineTo(lastX, rect.height - padding)
      }
      ctx.closePath()
      ctx.fill()

      // Draw line on top
      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.beginPath()
      chartData.slice(0, animatedLength).forEach((point, index) => {
        const x = padding + (index / (chartData.length - 1)) * chartWidth
        const y = rect.height - padding - ((point.y - minValue) / (maxValue - minValue)) * chartHeight

        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })
      ctx.stroke()
    }

    if (animated && animationProgress < 1) {
      const timer = setTimeout(() => {
        setAnimationProgress((prev) => Math.min(1, prev + 0.02))
      }, 16)
      return () => clearTimeout(timer)
    }
  }, [data, color, animationProgress, animated])

  useEffect(() => {
    if (animated) {
      setAnimationProgress(0)
    } else {
      setAnimationProgress(1)
    }
  }, [data, animated])

  return (
    <div className="h-full flex flex-col">
      {title && (
        <div className="p-4 border-b border-white/10">
          <h3 className="text-white font-semibold flex items-center">
            <Zap className="w-5 h-5 mr-2" />
            {title}
          </h3>
        </div>
      )}
      <div className="flex-1 p-4">
        <canvas ref={canvasRef} className="w-full h-full" style={{ height: `${height}px` }} />
      </div>
    </div>
  )
}

// KPI Card Component
interface KPICardProps {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon?: React.ReactNode
  color?: string
}

export function KPICard({
  title,
  value,
  change,
  changeLabel,
  icon,
  color = "from-blue-500 to-blue-700",
}: KPICardProps) {
  const isPositive = change && change > 0
  const isNegative = change && change < 0

  return (
    <div className="h-full bg-white/5 rounded-lg p-6 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-r ${color} rounded-lg flex items-center justify-center`}>
          {icon || <BarChart3 className="w-6 h-6 text-white" />}
        </div>
        {change !== undefined && (
          <div
            className={`flex items-center space-x-1 ${
              isPositive ? "text-green-400" : isNegative ? "text-red-400" : "text-white/60"
            }`}
          >
            {isPositive && <TrendingUp className="w-4 h-4" />}
            {isNegative && <TrendingDown className="w-4 h-4" />}
            <span className="text-sm font-medium">
              {change > 0 ? "+" : ""}
              {change}%
            </span>
          </div>
        )}
      </div>

      <div>
        <div className="text-3xl font-bold text-white mb-1">{value}</div>
        <div className="text-white/60 text-sm">{title}</div>
        {changeLabel && <div className="text-white/40 text-xs mt-1">{changeLabel}</div>}
      </div>
    </div>
  )
}

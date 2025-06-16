"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import type { Layout } from "react-grid-layout"
import { Plus, Settings, Trash2, BarChart3, Calendar, FileText, Activity, Users, DollarSign } from "lucide-react"

// Dynamically import ReactGridLayout to avoid SSR issues
const ReactGridLayout = dynamic(() => import("react-grid-layout"), { ssr: false })

// Import CSS for react-grid-layout
import "react-grid-layout/css/styles.css"
import "react-resizable/css/styles.css"

interface Widget {
  id: string
  type: string
  x: number
  y: number
  w: number
  h: number
  minW?: number
  minH?: number
  maxW?: number
  maxH?: number
  isResizable?: boolean
  isDraggable?: boolean
  title?: string
  config?: Record<string, unknown>
}

interface DashboardLayout {
  name: string
  isDefault?: boolean
  widgets: Widget[]
  gridCols: number
  gridRowHeight: number
  margin?: [number, number]
  containerPadding?: [number, number]
}

const WIDGET_TYPES = [
  { type: "chart", title: "Chart Widget", icon: BarChart3, defaultSize: { w: 6, h: 4 } },
  { type: "calendar", title: "Calendar Widget", icon: Calendar, defaultSize: { w: 4, h: 4 } },
  { type: "card", title: "Info Card", icon: FileText, defaultSize: { w: 3, h: 2 } },
  { type: "metric", title: "Metric Widget", icon: Activity, defaultSize: { w: 3, h: 2 } },
  { type: "table", title: "Data Table", icon: Users, defaultSize: { w: 8, h: 4 } },
  { type: "graph", title: "Graph Widget", icon: DollarSign, defaultSize: { w: 6, h: 3 } },
]

export default function DashboardPage() {
  const router = useRouter()
  const [userEmail, setUserEmail] = useState("")
  const [userId, setUserId] = useState("")
  const [currentLayout, setCurrentLayout] = useState<DashboardLayout | null>(null)
  const [widgets, setWidgets] = useState<Widget[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddWidget, setShowAddWidget] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [debugInfo, setDebugInfo] = useState<any>(null)

  useEffect(() => {
    const isLoggedIn = localStorage?.getItem("isLoggedIn")
    const email = localStorage?.getItem("userEmail")
    const storedUserId = localStorage?.getItem("userId")

    console.log("Dashboard useEffect - Login check:", {
      isLoggedIn,
      email,
      storedUserId,
    })

    if (!isLoggedIn) {
      router.push("/")
    } else {
      setUserEmail(email || "")
      // Use email as userId for consistency
      const effectiveUserId = storedUserId || email || ""
      setUserId(effectiveUserId)
      console.log("Dashboard useEffect - Using userId:", effectiveUserId)
      loadDashboard(effectiveUserId)
    }
  }, [router])

  const loadDashboard = async (userIdToLoad: string) => {
    console.log("loadDashboard called with userId:", userIdToLoad)
    setIsLoading(true)

    try {
      const url = `/api/dashboard?userId=${encodeURIComponent(userIdToLoad)}`
      console.log("loadDashboard - Fetching from URL:", url)

      const response = await fetch(url)
      const data = await response.json()

      console.log("loadDashboard - Response:", data)
      setDebugInfo(data.debug)

      if (response.ok && data.success) {
        if (data.preferences && data.preferences.layouts && data.preferences.layouts.length > 0) {
          const activeLayout =
            data.preferences.layouts.find(
              (layout: DashboardLayout) => layout.name === data.preferences.activeLayoutName,
            ) || data.preferences.layouts[0]

          console.log("loadDashboard - Setting active layout:", activeLayout)
          setCurrentLayout(activeLayout)
          setWidgets(activeLayout.widgets || [])
        } else {
          console.log("loadDashboard - No preferences found, creating default")
          await createDefaultLayout(userIdToLoad)
        }
      } else {
        console.error("loadDashboard - API error:", data)
        await createDefaultLayout(userIdToLoad)
      }
    } catch (error) {
      console.error("Error loading dashboard:", error)
      await createDefaultLayout(userIdToLoad)
    } finally {
      setIsLoading(false)
    }
  }

  const createDefaultLayout = async (userIdToCreate: string) => {
    console.log("createDefaultLayout called with userId:", userIdToCreate)

    const defaultWidgets: Widget[] = [
      {
        id: "welcome-widget",
        type: "card",
        x: 0,
        y: 0,
        w: 6,
        h: 2,
        title: "Welcome",
        config: { message: "Welcome to your dashboard!" },
      },
      {
        id: "stats-widget",
        type: "metric",
        x: 6,
        y: 0,
        w: 6,
        h: 2,
        title: "Quick Stats",
        config: {},
      },
    ]

    const defaultLayout: DashboardLayout = {
      name: "Default",
      isDefault: true,
      widgets: defaultWidgets,
      gridCols: 12,
      gridRowHeight: 150,
      margin: [10, 10],
      containerPadding: [10, 10],
    }

    setCurrentLayout(defaultLayout)
    setWidgets(defaultWidgets)
    await saveDashboard(userIdToCreate, defaultLayout)
  }

  const saveDashboard = async (userIdToSave: string, layout: DashboardLayout) => {
    console.log("saveDashboard called with:", { userIdToSave, layoutName: layout.name })
    setIsSaving(true)

    try {
      const response = await fetch("/api/dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userIdToSave,
          layout: layout,
        }),
      })

      const data = await response.json()
      console.log("saveDashboard - Response:", data)

      if (!response.ok) {
        throw new Error(data.error || "Failed to save dashboard")
      }
    } catch (error) {
      console.error("Error saving dashboard:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleLayoutChange = (layout: Layout[]) => {
    if (!currentLayout) return

    console.log("handleLayoutChange called with layout:", layout)

    const updatedWidgets = widgets.map((widget) => {
      const layoutItem = layout.find((item) => item.i === widget.id)
      if (layoutItem) {
        return {
          ...widget,
          x: layoutItem.x,
          y: layoutItem.y,
          w: layoutItem.w,
          h: layoutItem.h,
        }
      }
      return widget
    })

    setWidgets(updatedWidgets)

    const updatedLayout = {
      ...currentLayout,
      widgets: updatedWidgets,
    }

    setCurrentLayout(updatedLayout)
    saveDashboard(userId, updatedLayout)
  }

  const addWidget = (widgetType: string) => {
    const widgetConfig = WIDGET_TYPES.find((w) => w.type === widgetType)
    if (!widgetConfig || !currentLayout) return

    const newWidget: Widget = {
      id: `widget-${Date.now()}`,
      type: widgetType,
      x: 0,
      y: 0,
      w: widgetConfig.defaultSize.w,
      h: widgetConfig.defaultSize.h,
      title: widgetConfig.title,
      isResizable: true,
      isDraggable: true,
      config: {},
    }

    const updatedWidgets = [...widgets, newWidget]
    setWidgets(updatedWidgets)

    const updatedLayout = {
      ...currentLayout,
      widgets: updatedWidgets,
    }

    setCurrentLayout(updatedLayout)
    saveDashboard(userId, updatedLayout)
    setShowAddWidget(false)
  }

  const removeWidget = (widgetId: string) => {
    if (!currentLayout) return

    const updatedWidgets = widgets.filter((widget) => widget.id !== widgetId)
    setWidgets(updatedWidgets)

    const updatedLayout = {
      ...currentLayout,
      widgets: updatedWidgets,
    }

    setCurrentLayout(updatedLayout)
    saveDashboard(userId, updatedLayout)
  }

  const handleLogout = () => {
    localStorage?.removeItem("isLoggedIn")
    localStorage?.removeItem("userEmail")
    localStorage?.removeItem("userId")
    router.push("/")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading your dashboard...</p>
          {debugInfo && (
            <div className="mt-4 p-4 bg-black/20 rounded-lg text-left text-sm text-white/70">
              <p>Debug Info:</p>
              <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-xl border-b border-white/20 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <div>
              <h1 className="text-white font-semibold text-lg">Dashboard</h1>
              <p className="text-white/60 text-sm">{userEmail}</p>
              <p className="text-white/40 text-xs">ID: {userId}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {isSaving && (
              <div className="flex items-center space-x-2 text-white/60">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span className="text-sm">Saving...</span>
              </div>
            )}

            <button
              onClick={() => setShowAddWidget(true)}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Widget</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-all"
            >
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Debug Info */}
      {/* {debugInfo && (
        <div className="p-4 bg-black/20 text-white/70 text-sm">
          <details>
            <summary className="cursor-pointer">Debug Information</summary>
            <pre className="mt-2 overflow-auto">{JSON.stringify(debugInfo, null, 2)}</pre>
          </details>
        </div>
      )} */}

      {/* Dashboard Content */}
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          {widgets.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <BarChart3 className="w-12 h-12 text-white/60" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Your Dashboard is Empty</h2>
              <p className="text-white/60 mb-8">Add your first widget to get started</p>
              <button
                onClick={() => setShowAddWidget(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
              >
                Add Your First Widget
              </button>
            </div>
          ) : (
            <ReactGridLayout
              className="layout"
              layout={widgets.map((widget) => ({
                i: widget.id,
                x: widget.x,
                y: widget.y,
                w: widget.w,
                h: widget.h,
                minW: widget.minW || 1,
                minH: widget.minH || 1,
                maxW: widget.maxW || 12,
                maxH: widget.maxH || 12,
                isResizable: widget.isResizable !== false,
                isDraggable: widget.isDraggable !== false,
              }))}
              onLayoutChange={handleLayoutChange}
              cols={currentLayout?.gridCols || 12}
              rowHeight={currentLayout?.gridRowHeight || 150}
              width={1200}
              margin={currentLayout?.margin || [10, 10]}
              containerPadding={currentLayout?.containerPadding || [10, 10]}
              isDraggable={true}
              isResizable={true}
              resizeHandles={["se"]}
            >
              {widgets.map((widget) => (
                <div key={widget.id} className="widget-container">
                  <WidgetComponent widget={widget} onRemove={() => removeWidget(widget.id)} />
                </div>
              ))}
            </ReactGridLayout>
          )}
        </div>
      </main>

      {/* Add Widget Modal */}
      {showAddWidget && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Add Widget</h2>
              <button
                onClick={() => setShowAddWidget(false)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {WIDGET_TYPES.map((widgetType) => {
                const IconComponent = widgetType.icon
                return (
                  <button
                    key={widgetType.type}
                    onClick={() => addWidget(widgetType.type)}
                    className="flex items-center space-x-4 p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl transition-all text-left"
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium">{widgetType.title}</h3>
                      <p className="text-white/60 text-sm">
                        {widgetType.defaultSize.w}x{widgetType.defaultSize.h} grid units
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Custom Styles */}
      <style jsx global>{`
        .react-grid-layout {
          position: relative;
        }
        
        .react-grid-item {
          transition: all 200ms ease;
          transition-property: left, top;
        }
        
        .react-grid-item.cssTransforms {
          transition-property: transform;
        }
        
        .react-grid-item > .react-resizable-handle {
          position: absolute;
          width: 20px;
          height: 20px;
          bottom: 0;
          right: 0;
          background: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNiIgaGVpZ2h0PSI2IiB2aWV3Qm94PSIwIDAgNiA2IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8ZG90cyBmaWxsPSIjOTk5IiBkPSJtMTUgMTJjMCAuNTUyLS40NDggMS0xIDFzLTEtLjQ0OC0xLTEgLjQ0OC0xIDEtMSAxIC40NDggMSAxem0wIDRjMCAuNTUyLS40NDggMS0xIDFzLTEtLjQ0OC0xLTEgLjQ0OC0xIDEtMSAxIC40NDggMSAxem0wIDRjMCAuNTUyLS40NDggMS0xIDFzLTEtLjQ0OC0xLTEgLjQ0OC0xIDEtMSAxIC40NDggMSAxem0tNS00YzAtLjU1Mi40NDgtMSAxLTFzMSAuNDQ4IDEgMS0uNDQ4IDEtMSAxLTEtLjQ0OC0xLTF6bTAtNGMwLS41NTIuNDQ4LTEgMS0xczEgLjQ0OCAxIDEtLjQ0OCAxLTEgMS0xLS40NDgtMS0xem0wIDhjMC0uNTUyLjQ0OC0xIDEtMXMxIC40NDggMSAxLS40NDggMS0xIDEtMS0uNDQ4LTEtMXptNS00YzAtLjU1Mi40NDgtMSAxLTFzMSAuNDQ4IDEgMS0uNDQ4IDEtMSAxLTEtLjQ0OC0xLTF6bTAtNGMwLS41NTIuNDQ4LTEgMS0xczEgLjQ0OCAxIDEtLjQ0OCAxLTEgMS0xLS40NDgtMS0xem0wIDhjMC0uNTUyLjQ0OC0xIDEtMXMxIC40NDggMSAxLS40NDggMS0xIDEtMS0uNDQ4LTEtMXoiLz4KPHN2Zz4K');
          background-position: bottom right;
          padding: 0 3px 3px 0;
          background-repeat: no-repeat;
          background-origin: content-box;
          box-sizing: border-box;
          cursor: se-resize;
        }
        
        .widget-container {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          overflow: hidden;
          height: 100%;
        }
        
        .react-grid-item.react-grid-placeholder {
          background: rgba(59, 130, 246, 0.3);
          opacity: 0.2;
          transition-duration: 100ms;
          z-index: 2;
          user-select: none;
          border-radius: 12px;
        }
      `}</style>
    </div>
  )
}

// Widget Component
interface WidgetComponentProps {
  widget: Widget
  onRemove: () => void
}

function WidgetComponent({ widget, onRemove }: WidgetComponentProps) {
  const getWidgetIcon = (type: string) => {
    const widgetType = WIDGET_TYPES.find((w) => w.type === type)
    return widgetType?.icon || FileText
  }

  const IconComponent = getWidgetIcon(widget.type)

  return (
    <div className="h-full flex flex-col">
      {/* Widget Header */}
      <div className="flex items-center justify-between p-3 border-b border-white/10">
        <div className="flex items-center space-x-2">
          <IconComponent className="w-4 h-4 text-white/80" />
          <h3 className="text-white font-medium text-sm">{widget.title}</h3>
        </div>
        <div className="flex items-center space-x-1">
          <button className="p-1 text-white/60 hover:text-white transition-colors">
            <Settings className="w-3 h-3" />
          </button>
          <button onClick={onRemove} className="p-1 text-white/60 hover:text-red-400 transition-colors">
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Widget Content */}
      <div className="flex-1 p-4">
        <WidgetContent widget={widget} />
      </div>
    </div>
  )
}

// Widget Content Component
function WidgetContent({ widget }: { widget: Widget }) {
  switch (widget.type) {
    case "card":
      return (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <h4 className="text-white text-lg font-semibold mb-2">Welcome Card</h4>
            <p className="text-white/60 text-sm">
              {(widget.config?.message as string) || "This is a sample card widget"}
            </p>
          </div>
        </div>
      )

    case "metric":
      return (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-1">1,234</div>
            <div className="text-white/60 text-sm">Total Users</div>
            <div className="text-green-400 text-xs mt-1">+12% from last month</div>
          </div>
        </div>
      )

    case "chart":
      return (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="w-16 h-16 text-white/40 mx-auto mb-4" />
            <p className="text-white/60 text-sm">Chart visualization would go here</p>
          </div>
        </div>
      )

    case "calendar":
      return (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <Calendar className="w-16 h-16 text-white/40 mx-auto mb-4" />
            <p className="text-white/60 text-sm">Calendar widget content</p>
          </div>
        </div>
      )

    case "table":
      return (
        <div className="h-full">
          <div className="space-y-2">
            <div className="flex justify-between items-center p-2 bg-white/5 rounded">
              <span className="text-white text-sm">John Doe</span>
              <span className="text-white/60 text-xs">Admin</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-white/5 rounded">
              <span className="text-white text-sm">Jane Smith</span>
              <span className="text-white/60 text-xs">User</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-white/5 rounded">
              <span className="text-white text-sm">Bob Johnson</span>
              <span className="text-white/60 text-xs">Editor</span>
            </div>
          </div>
        </div>
      )

    case "graph":
      return (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <DollarSign className="w-16 h-16 text-white/40 mx-auto mb-4" />
            <p className="text-white/60 text-sm">Revenue graph would display here</p>
          </div>
        </div>
      )

    default:
      return (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <FileText className="w-16 h-16 text-white/40 mx-auto mb-4" />
            <p className="text-white/60 text-sm">Widget content</p>
          </div>
        </div>
      )
  }
}

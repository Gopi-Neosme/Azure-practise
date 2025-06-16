// "use client"

// import { useEffect, useState } from "react"
// import { useRouter } from "next/navigation"
// import dynamic from "next/dynamic"
// import type { Layout } from "react-grid-layout"
// import { Plus, Settings, Trash2, BarChart3, Calendar, FileText, Activity, Users, DollarSign } from "lucide-react"

// // Dynamically import ReactGridLayout to avoid SSR issues
// const ReactGridLayout = dynamic(() => import("react-grid-layout"), { ssr: false })

// // Import CSS for react-grid-layout
// import "react-grid-layout/css/styles.css"
// import "react-resizable/css/styles.css"

// interface Widget {
//   id: string
//   type: string
//   x: number
//   y: number
//   w: number
//   h: number
//   minW?: number
//   minH?: number
//   maxW?: number
//   maxH?: number
//   isResizable?: boolean
//   isDraggable?: boolean
//   title?: string
//   config?: Record<string, unknown>
// }

// interface DashboardLayout {
//   name: string
//   isDefault?: boolean
//   widgets: Widget[]
//   gridCols: number
//   gridRowHeight: number
//   margin?: [number, number]
//   containerPadding?: [number, number]
// }

// const WIDGET_TYPES = [
//   { type: "chart", title: "Chart Widget", icon: BarChart3, defaultSize: { w: 6, h: 4 } },
//   { type: "calendar", title: "Calendar Widget", icon: Calendar, defaultSize: { w: 4, h: 4 } },
//   { type: "card", title: "Info Card", icon: FileText, defaultSize: { w: 3, h: 2 } },
//   { type: "metric", title: "Metric Widget", icon: Activity, defaultSize: { w: 3, h: 2 } },
//   { type: "table", title: "Data Table", icon: Users, defaultSize: { w: 8, h: 4 } },
//   { type: "graph", title: "Graph Widget", icon: DollarSign, defaultSize: { w: 6, h: 3 } },
// ]

// export default function DashboardPage() {
//   const router = useRouter()
//   const [userEmail, setUserEmail] = useState("")
//   const [userId, setUserId] = useState("")
//   const [currentLayout, setCurrentLayout] = useState<DashboardLayout | null>(null)
//   const [widgets, setWidgets] = useState<Widget[]>([])
//   const [isLoading, setIsLoading] = useState(true)
//   const [showAddWidget, setShowAddWidget] = useState(false)
//   const [isSaving, setIsSaving] = useState(false)
//   const [debugInfo, setDebugInfo] = useState<any>(null)

//   useEffect(() => {
//     const isLoggedIn = localStorage?.getItem("isLoggedIn")
//     const email = localStorage?.getItem("userEmail")
//     const storedUserId = localStorage?.getItem("userId")

//     console.log("Dashboard useEffect - Login check:", {
//       isLoggedIn,
//       email,
//       storedUserId,
//     })

//     if (!isLoggedIn) {
//       router.push("/")
//     } else {
//       setUserEmail(email || "")
//       // Use email as userId for consistency
//       const effectiveUserId = storedUserId || email || ""
//       setUserId(effectiveUserId)
//       console.log("Dashboard useEffect - Using userId:", effectiveUserId)
//       loadDashboard(effectiveUserId)
//     }
//   }, [router])

//   const loadDashboard = async (userIdToLoad: string) => {
//     console.log("loadDashboard called with userId:", userIdToLoad)
//     setIsLoading(true)

//     try {
//       const url = `/api/dashboard?userId=${encodeURIComponent(userIdToLoad)}`
//       console.log("loadDashboard - Fetching from URL:", url)

//       const response = await fetch(url)
//       const data = await response.json()

//       console.log("loadDashboard - Response:", data)
//       setDebugInfo(data.debug)

//       if (response.ok && data.success) {
//         if (data.preferences && data.preferences.layouts && data.preferences.layouts.length > 0) {
//           const activeLayout =
//             data.preferences.layouts.find(
//               (layout: DashboardLayout) => layout.name === data.preferences.activeLayoutName,
//             ) || data.preferences.layouts[0]

//           console.log("loadDashboard - Setting active layout:", activeLayout)
//           setCurrentLayout(activeLayout)
//           setWidgets(activeLayout.widgets || [])
//         } else {
//           console.log("loadDashboard - No preferences found, creating default")
//           await createDefaultLayout(userIdToLoad)
//         }
//       } else {
//         console.error("loadDashboard - API error:", data)
//         await createDefaultLayout(userIdToLoad)
//       }
//     } catch (error) {
//       console.error("Error loading dashboard:", error)
//       await createDefaultLayout(userIdToLoad)
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const createDefaultLayout = async (userIdToCreate: string) => {
//     console.log("createDefaultLayout called with userId:", userIdToCreate)

//     const defaultWidgets: Widget[] = [
//       {
//         id: "welcome-widget",
//         type: "card",
//         x: 0,
//         y: 0,
//         w: 6,
//         h: 2,
//         title: "Welcome",
//         config: { message: "Welcome to your dashboard!" },
//       },
//       {
//         id: "stats-widget",
//         type: "metric",
//         x: 6,
//         y: 0,
//         w: 6,
//         h: 2,
//         title: "Quick Stats",
//         config: {},
//       },
//     ]

//     const defaultLayout: DashboardLayout = {
//       name: "Default",
//       isDefault: true,
//       widgets: defaultWidgets,
//       gridCols: 12,
//       gridRowHeight: 150,
//       margin: [10, 10],
//       containerPadding: [10, 10],
//     }

//     setCurrentLayout(defaultLayout)
//     setWidgets(defaultWidgets)
//     await saveDashboard(userIdToCreate, defaultLayout)
//   }

//   const saveDashboard = async (userIdToSave: string, layout: DashboardLayout) => {
//     console.log("saveDashboard called with:", { userIdToSave, layoutName: layout.name })
//     setIsSaving(true)

//     try {
//       const response = await fetch("/api/dashboard", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           userId: userIdToSave,
//           layout: layout,
//         }),
//       })

//       const data = await response.json()
//       console.log("saveDashboard - Response:", data)

//       if (!response.ok) {
//         throw new Error(data.error || "Failed to save dashboard")
//       }
//     } catch (error) {
//       console.error("Error saving dashboard:", error)
//     } finally {
//       setIsSaving(false)
//     }
//   }

//   const handleLayoutChange = (layout: Layout[]) => {
//     if (!currentLayout) return

//     console.log("handleLayoutChange called with layout:", layout)

//     const updatedWidgets = widgets.map((widget) => {
//       const layoutItem = layout.find((item) => item.i === widget.id)
//       if (layoutItem) {
//         return {
//           ...widget,
//           x: layoutItem.x,
//           y: layoutItem.y,
//           w: layoutItem.w,
//           h: layoutItem.h,
//         }
//       }
//       return widget
//     })

//     setWidgets(updatedWidgets)

//     const updatedLayout = {
//       ...currentLayout,
//       widgets: updatedWidgets,
//     }

//     setCurrentLayout(updatedLayout)
//     saveDashboard(userId, updatedLayout)
//   }

//   const addWidget = (widgetType: string) => {
//     const widgetConfig = WIDGET_TYPES.find((w) => w.type === widgetType)
//     if (!widgetConfig || !currentLayout) return

//     const newWidget: Widget = {
//       id: `widget-${Date.now()}`,
//       type: widgetType,
//       x: 0,
//       y: 0,
//       w: widgetConfig.defaultSize.w,
//       h: widgetConfig.defaultSize.h,
//       title: widgetConfig.title,
//       isResizable: true,
//       isDraggable: true,
//       config: {},
//     }

//     const updatedWidgets = [...widgets, newWidget]
//     setWidgets(updatedWidgets)

//     const updatedLayout = {
//       ...currentLayout,
//       widgets: updatedWidgets,
//     }

//     setCurrentLayout(updatedLayout)
//     saveDashboard(userId, updatedLayout)
//     setShowAddWidget(false)
//   }

//   const removeWidget = (widgetId: string) => {
//     if (!currentLayout) return

//     const updatedWidgets = widgets.filter((widget) => widget.id !== widgetId)
//     setWidgets(updatedWidgets)

//     const updatedLayout = {
//       ...currentLayout,
//       widgets: updatedWidgets,
//     }

//     setCurrentLayout(updatedLayout)
//     saveDashboard(userId, updatedLayout)
//   }

//   const handleLogout = () => {
//     localStorage?.removeItem("isLoggedIn")
//     localStorage?.removeItem("userEmail")
//     localStorage?.removeItem("userId")
//     router.push("/")
//   }

//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
//         <div className="text-center">
//           <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
//           <p className="text-white text-lg">Loading your dashboard...</p>
//           {debugInfo && (
//             <div className="mt-4 p-4 bg-black/20 rounded-lg text-left text-sm text-white/70">
//               <p>Debug Info:</p>
//               <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
//             </div>
//           )}
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
//       {/* Header */}
//       <header className="bg-white/10 backdrop-blur-xl border-b border-white/20 p-4">
//         <div className="max-w-7xl mx-auto flex justify-between items-center">
//           <div className="flex items-center space-x-4">
//             <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
//               <span className="text-white font-bold text-sm">D</span>
//             </div>
//             <div>
//               <h1 className="text-white font-semibold text-lg">Dashboard</h1>
//               <p className="text-white/60 text-sm">{userEmail}</p>
//               <p className="text-white/40 text-xs">ID: {userId}</p>
//             </div>
//           </div>

//           <div className="flex items-center space-x-4">
//             {isSaving && (
//               <div className="flex items-center space-x-2 text-white/60">
//                 <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
//                 <span className="text-sm">Saving...</span>
//               </div>
//             )}

//             <button
//               onClick={() => setShowAddWidget(true)}
//               className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
//             >
//               <Plus className="w-4 h-4" />
//               <span>Add Widget</span>
//             </button>

//             <button
//               onClick={handleLogout}
//               className="flex items-center space-x-2 bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-all"
//             >
//               <span>Logout</span>
//             </button>
//           </div>
//         </div>
//       </header>

//       {/* Debug Info */}
//       {/* {debugInfo && (
//         <div className="p-4 bg-black/20 text-white/70 text-sm">
//           <details>
//             <summary className="cursor-pointer">Debug Information</summary>
//             <pre className="mt-2 overflow-auto">{JSON.stringify(debugInfo, null, 2)}</pre>
//           </details>
//         </div>
//       )} */}

//       {/* Dashboard Content */}
//       <main className="p-6">
//         <div className="max-w-7xl mx-auto">
//           {widgets.length === 0 ? (
//             <div className="text-center py-20">
//               <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
//                 <BarChart3 className="w-12 h-12 text-white/60" />
//               </div>
//               <h2 className="text-2xl font-bold text-white mb-4">Your Dashboard is Empty</h2>
//               <p className="text-white/60 mb-8">Add your first widget to get started</p>
//               <button
//                 onClick={() => setShowAddWidget(true)}
//                 className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
//               >
//                 Add Your First Widget
//               </button>
//             </div>
//           ) : (
//             <ReactGridLayout
//               className="layout"
//               layout={widgets.map((widget) => ({
//                 i: widget.id,
//                 x: widget.x,
//                 y: widget.y,
//                 w: widget.w,
//                 h: widget.h,
//                 minW: widget.minW || 1,
//                 minH: widget.minH || 1,
//                 maxW: widget.maxW || 12,
//                 maxH: widget.maxH || 12,
//                 isResizable: widget.isResizable !== false,
//                 isDraggable: widget.isDraggable !== false,
//               }))}
//               onLayoutChange={handleLayoutChange}
//               cols={currentLayout?.gridCols || 12}
//               rowHeight={currentLayout?.gridRowHeight || 150}
//               width={1200}
//               margin={currentLayout?.margin || [10, 10]}
//               containerPadding={currentLayout?.containerPadding || [10, 10]}
//               isDraggable={true}
//               isResizable={true}
//               resizeHandles={["se"]}
//             >
//               {widgets.map((widget) => (
//                 <div key={widget.id} className="widget-container">
//                   <WidgetComponent widget={widget} onRemove={() => removeWidget(widget.id)} />
//                 </div>
//               ))}
//             </ReactGridLayout>
//           )}
//         </div>
//       </main>

//       {/* Add Widget Modal */}
//       {showAddWidget && (
//         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//           <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-auto">
//             <div className="flex justify-between items-center mb-6">
//               <h2 className="text-2xl font-bold text-white">Add Widget</h2>
//               <button
//                 onClick={() => setShowAddWidget(false)}
//                 className="text-white/60 hover:text-white transition-colors"
//               >
//                 <Plus className="w-6 h-6 rotate-45" />
//               </button>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               {WIDGET_TYPES.map((widgetType) => {
//                 const IconComponent = widgetType.icon
//                 return (
//                   <button
//                     key={widgetType.type}
//                     onClick={() => addWidget(widgetType.type)}
//                     className="flex items-center space-x-4 p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl transition-all text-left"
//                   >
//                     <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
//                       <IconComponent className="w-6 h-6 text-white" />
//                     </div>
//                     <div>
//                       <h3 className="text-white font-medium">{widgetType.title}</h3>
//                       <p className="text-white/60 text-sm">
//                         {widgetType.defaultSize.w}x{widgetType.defaultSize.h} grid units
//                       </p>
//                     </div>
//                   </button>
//                 )
//               })}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Custom Styles */}
//       <style jsx global>{`
//         .react-grid-layout {
//           position: relative;
//         }
        
//         .react-grid-item {
//           transition: all 200ms ease;
//           transition-property: left, top;
//         }
        
//         .react-grid-item.cssTransforms {
//           transition-property: transform;
//         }
        
//         .react-grid-item > .react-resizable-handle {
//           position: absolute;
//           width: 20px;
//           height: 20px;
//           bottom: 0;
//           right: 0;
//           background: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNiIgaGVpZ2h0PSI2IiB2aWV3Qm94PSIwIDAgNiA2IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8ZG90cyBmaWxsPSIjOTk5IiBkPSJtMTUgMTJjMCAuNTUyLS40NDggMS0xIDFzLTEtLjQ0OC0xLTEgLjQ0OC0xIDEtMSAxIC40NDggMSAxem0wIDRjMCAuNTUyLS40NDggMS0xIDFzLTEtLjQ0OC0xLTEgLjQ0OC0xIDEtMSAxIC40NDggMSAxem0wIDRjMCAuNTUyLS40NDggMS0xIDFzLTEtLjQ0OC0xLTEgLjQ0OC0xIDEtMSAxIC40NDggMSAxem0tNS00YzAtLjU1Mi40NDgtMSAxLTFzMSAuNDQ4IDEgMS0uNDQ4IDEtMSAxLTEtLjQ0OC0xLTF6bTAtNGMwLS41NTIuNDQ4LTEgMS0xczEgLjQ0OCAxIDEtLjQ0OCAxLTEgMS0xLS40NDgtMS0xem0wIDhjMC0uNTUyLjQ0OC0xIDEtMXMxIC40NDggMSAxLS40NDggMS0xIDEtMS0uNDQ4LTEtMXptNS00YzAtLjU1Mi40NDgtMSAxLTFzMSAuNDQ4IDEgMS0uNDQ4IDEtMSAxLTEtLjQ0OC0xLTF6bTAtNGMwLS41NTIuNDQ4LTEgMS0xczEgLjQ0OCAxIDEtLjQ0OCAxLTEgMS0xLS40NDgtMS0xem0wIDhjMC0uNTUyLjQ0OC0xIDEtMXMxIC40NDggMSAxLS40NDggMS0xIDEtMS0uNDQ4LTEtMXoiLz4KPHN2Zz4K');
//           background-position: bottom right;
//           padding: 0 3px 3px 0;
//           background-repeat: no-repeat;
//           background-origin: content-box;
//           box-sizing: border-box;
//           cursor: se-resize;
//         }
        
//         .widget-container {
//           background: rgba(255, 255, 255, 0.1);
//           backdrop-filter: blur(10px);
//           border: 1px solid rgba(255, 255, 255, 0.2);
//           border-radius: 12px;
//           overflow: hidden;
//           height: 100%;
//         }
        
//         .react-grid-item.react-grid-placeholder {
//           background: rgba(59, 130, 246, 0.3);
//           opacity: 0.2;
//           transition-duration: 100ms;
//           z-index: 2;
//           user-select: none;
//           border-radius: 12px;
//         }
//       `}</style>
//     </div>
//   )
// }

// // Widget Component
// interface WidgetComponentProps {
//   widget: Widget
//   onRemove: () => void
// }

// function WidgetComponent({ widget, onRemove }: WidgetComponentProps) {
//   const getWidgetIcon = (type: string) => {
//     const widgetType = WIDGET_TYPES.find((w) => w.type === type)
//     return widgetType?.icon || FileText
//   }

//   const IconComponent = getWidgetIcon(widget.type)

//   return (
//     <div className="h-full flex flex-col">
//       {/* Widget Header */}
//       <div className="flex items-center justify-between p-3 border-b border-white/10">
//         <div className="flex items-center space-x-2">
//           <IconComponent className="w-4 h-4 text-white/80" />
//           <h3 className="text-white font-medium text-sm">{widget.title}</h3>
//         </div>
//         <div className="flex items-center space-x-1">
//           <button className="p-1 text-white/60 hover:text-white transition-colors">
//             <Settings className="w-3 h-3" />
//           </button>
//           <button onClick={onRemove} className="p-1 text-white/60 hover:text-red-400 transition-colors">
//             <Trash2 className="w-3 h-3" />
//           </button>
//         </div>
//       </div>

//       {/* Widget Content */}
//       <div className="flex-1 p-4">
//         <WidgetContent widget={widget} />
//       </div>
//     </div>
//   )
// }

// // Widget Content Component
// function WidgetContent({ widget }: { widget: Widget }) {
//   switch (widget.type) {
//     case "card":
//       return (
//         <div className="h-full flex items-center justify-center">
//           <div className="text-center">
//             <h4 className="text-white text-lg font-semibold mb-2">Welcome Card</h4>
//             <p className="text-white/60 text-sm">
//               {(widget.config?.message as string) || "This is a sample card widget"}
//             </p>
//           </div>
//         </div>
//       )

//     case "metric":
//       return (
//         <div className="h-full flex items-center justify-center">
//           <div className="text-center">
//             <div className="text-3xl font-bold text-white mb-1">1,234</div>
//             <div className="text-white/60 text-sm">Total Users</div>
//             <div className="text-green-400 text-xs mt-1">+12% from last month</div>
//           </div>
//         </div>
//       )

//     case "chart":
//       return (
//         <div className="h-full flex items-center justify-center">
//           <div className="text-center">
//             <BarChart3 className="w-16 h-16 text-white/40 mx-auto mb-4" />
//             <p className="text-white/60 text-sm">Chart visualization would go here</p>
//           </div>
//         </div>
//       )

//     case "calendar":
//       return (
//         <div className="h-full flex items-center justify-center">
//           <div className="text-center">
//             <Calendar className="w-16 h-16 text-white/40 mx-auto mb-4" />
//             <p className="text-white/60 text-sm">Calendar widget content</p>
//           </div>
//         </div>
//       )

//     case "table":
//       return (
//         <div className="h-full">
//           <div className="space-y-2">
//             <div className="flex justify-between items-center p-2 bg-white/5 rounded">
//               <span className="text-white text-sm">John Doe</span>
//               <span className="text-white/60 text-xs">Admin</span>
//             </div>
//             <div className="flex justify-between items-center p-2 bg-white/5 rounded">
//               <span className="text-white text-sm">Jane Smith</span>
//               <span className="text-white/60 text-xs">User</span>
//             </div>
//             <div className="flex justify-between items-center p-2 bg-white/5 rounded">
//               <span className="text-white text-sm">Bob Johnson</span>
//               <span className="text-white/60 text-xs">Editor</span>
//             </div>
//           </div>
//         </div>
//       )

//     case "graph":
//       return (
//         <div className="h-full flex items-center justify-center">
//           <div className="text-center">
//             <DollarSign className="w-16 h-16 text-white/40 mx-auto mb-4" />
//             <p className="text-white/60 text-sm">Revenue graph would display here</p>
//           </div>
//         </div>
//       )

//     default:
//       return (
//         <div className="h-full flex items-center justify-center">
//           <div className="text-center">
//             <FileText className="w-16 h-16 text-white/40 mx-auto mb-4" />
//             <p className="text-white/60 text-sm">Widget content</p>
//           </div>
//         </div>
//       )
//   }
// }

"use client"

import type React from "react"

import { useEffect, useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import type { Layout } from "react-grid-layout"
import {
  Plus,
  Settings,
  Trash2,
  BarChart3,
  Calendar,
  FileText,
  Activity,
  Users,
  DollarSign,
  X,
  Save,
  Palette,
  Type,
} from "lucide-react"

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

const WIDGET_COLORS = [
  { name: "Blue", value: "from-blue-500 to-blue-700", bg: "bg-blue-500/20" },
  { name: "Purple", value: "from-purple-500 to-purple-700", bg: "bg-purple-500/20" },
  { name: "Green", value: "from-green-500 to-green-700", bg: "bg-green-500/20" },
  { name: "Red", value: "from-red-500 to-red-700", bg: "bg-red-500/20" },
  { name: "Orange", value: "from-orange-500 to-orange-700", bg: "bg-orange-500/20" },
  { name: "Pink", value: "from-pink-500 to-pink-700", bg: "bg-pink-500/20" },
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
  const [editingWidget, setEditingWidget] = useState<Widget | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  // Refs to track state and prevent infinite loops
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isUserActionRef = useRef(false)
  const lastSavedLayoutRef = useRef<string>("")

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

          // Store the initial layout hash
          const layoutHash = JSON.stringify(
            activeLayout.widgets.map((w:any) => ({ id: w.id, x: w.x, y: w.y, w: w.w, h: w.h })),
          )
          lastSavedLayoutRef.current = layoutHash
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

  //testing
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
        config: {
          message: "Welcome to your dashboard!",
          color: "from-blue-500 to-blue-700",
          backgroundColor: "bg-blue-500/20",
        },
      },
      {
        id: "stats-widget",
        type: "metric",
        x: 6,
        y: 0,
        w: 6,
        h: 2,
        title: "Quick Stats",
        config: {
          value: "1,234",
          label: "Total Users",
          change: "+12%",
          color: "from-green-500 to-green-700",
          backgroundColor: "bg-green-500/20",
        },
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

    // Store the initial layout hash
    const layoutHash = JSON.stringify(defaultWidgets.map((w) => ({ id: w.id, x: w.x, y: w.y, w: w.w, h: w.h })))
    lastSavedLayoutRef.current = layoutHash

    await saveDashboard(userIdToCreate, defaultLayout)
  }

  const saveDashboard = useCallback(async (userIdToSave: string, layout: DashboardLayout) => {
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

      // Update the saved layout hash
      const layoutHash = JSON.stringify(layout.widgets.map((w) => ({ id: w.id, x: w.x, y: w.y, w: w.w, h: w.h })))
      lastSavedLayoutRef.current = layoutHash
    } catch (error) {
      console.error("Error saving dashboard:", error)
    } finally {
      setIsSaving(false)
    }
  }, [])

  // Debounced save function
  const debouncedSave = useCallback(
    (layout: DashboardLayout) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }

      saveTimeoutRef.current = setTimeout(() => {
        saveDashboard(userId, layout)
      }, 1000) // 1 second debounce
    },
    [userId, saveDashboard],
  )

  // Handle layout changes from react-grid-layout
  const handleLayoutChange = useCallback(
    (layout: Layout[]) => {
      // Skip if this is a user action (add/remove widget)
      if (isUserActionRef.current) {
        console.log("Skipping layout change - user action in progress")
        return
      }

      if (!currentLayout || !widgets.length) {
        return
      }

      console.log("handleLayoutChange called with", layout.length, "items")

      // Create updated widgets with new positions
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

      // Check if layout actually changed
      const newLayoutHash = JSON.stringify(updatedWidgets.map((w) => ({ id: w.id, x: w.x, y: w.y, w: w.w, h: w.h })))
      if (newLayoutHash === lastSavedLayoutRef.current) {
        console.log("Layout unchanged, skipping update")
        return
      }

      console.log("Layout changed, updating widgets")

      // Update state
      setWidgets(updatedWidgets)

      const updatedLayout = {
        ...currentLayout,
        widgets: updatedWidgets,
      }

      setCurrentLayout(updatedLayout)

      // Debounced save
      debouncedSave(updatedLayout)
    },
    [widgets, currentLayout, debouncedSave],
  )

  const addWidget = useCallback(
    (widgetType: string) => {
      console.log("Adding widget:", widgetType)

      const widgetConfig = WIDGET_TYPES.find((w) => w.type === widgetType)
      if (!widgetConfig || !currentLayout) return

      // Set user action flag
      isUserActionRef.current = true

      const newWidget: Widget = {
        id: `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: widgetType,
        x: 0,
        y: 0,
        w: widgetConfig.defaultSize.w,
        h: widgetConfig.defaultSize.h,
        title: widgetConfig.title,
        isResizable: true,
        isDraggable: true,
        config: {
          color: "from-blue-500 to-blue-700",
          backgroundColor: "bg-blue-500/20",
        },
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

      // Reset user action flag after a delay
      setTimeout(() => {
        isUserActionRef.current = false
      }, 500)
    },
    [currentLayout, widgets, userId, saveDashboard],
  )

  const removeWidget = useCallback(
    (widgetId: string) => {
      console.log("Removing widget:", widgetId)

      if (!currentLayout) {
        console.log("removeWidget - No current layout")
        return
      }

      // Set user action flag
      isUserActionRef.current = true

      const updatedWidgets = widgets.filter((widget) => widget.id !== widgetId)
      console.log("removeWidget - Updated widgets:", updatedWidgets.length)

      setWidgets(updatedWidgets)

      const updatedLayout = {
        ...currentLayout,
        widgets: updatedWidgets,
      }

      setCurrentLayout(updatedLayout)
      saveDashboard(userId, updatedLayout)
      setShowDeleteConfirm(null)

      // Reset user action flag after a delay
      setTimeout(() => {
        isUserActionRef.current = false
      }, 500)
    },
    [currentLayout, widgets, userId, saveDashboard],
  )

  const updateWidget = useCallback(
    (widgetId: string, updates: Partial<Widget>) => {
      console.log("updateWidget called with:", { widgetId, updates })

      if (!currentLayout) return

      // Set user action flag
      isUserActionRef.current = true

      const updatedWidgets = widgets.map((widget) => (widget.id === widgetId ? { ...widget, ...updates } : widget))

      setWidgets(updatedWidgets)

      const updatedLayout = {
        ...currentLayout,
        widgets: updatedWidgets,
      }

      setCurrentLayout(updatedLayout)
      saveDashboard(userId, updatedLayout)

      // Reset user action flag after a delay
      setTimeout(() => {
        isUserActionRef.current = false
      }, 500)
    },
    [currentLayout, widgets, userId, saveDashboard],
  )

  const handleWidgetEdit = useCallback((widget: Widget) => {
    console.log("handleWidgetEdit called for widget:", widget.id)
    setEditingWidget(widget)
  }, [])

  const handleWidgetDelete = useCallback((widgetId: string) => {
    console.log("handleWidgetDelete called for widget:", widgetId)
    setShowDeleteConfirm(widgetId)
  }, [])

  const handleLogout = () => {
    localStorage?.removeItem("isLoggedIn")
    localStorage?.removeItem("userEmail")
    localStorage?.removeItem("userId")
    router.push("/")
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading your dashboard...</p>
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
              useCSSTransforms={true}
              preventCollision={false}
              compactType="vertical"
            >
              {widgets.map((widget) => (
                <div key={widget.id} className="widget-container">
                  <WidgetComponent
                    widget={widget}
                    onRemove={() => handleWidgetDelete(widget.id)}
                    onEdit={() => handleWidgetEdit(widget)}
                    onUpdate={(updates) => updateWidget(widget.id, updates)}
                  />
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
                <X className="w-6 h-6" />
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 max-w-md w-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Delete Widget</h2>
              <p className="text-white/60 mb-6">
                Are you sure you want to delete this widget? This action cannot be undone.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => removeWidget(showDeleteConfirm)}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Widget Edit Modal */}
      {editingWidget && (
        <WidgetEditModal
          widget={editingWidget}
          onSave={(updates) => {
            updateWidget(editingWidget.id, updates)
            setEditingWidget(null)
          }}
          onClose={() => setEditingWidget(null)}
        />
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
          background: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNiIgaGVpZ2h0PSI2IiB2aWV3Qm94PSIwIDAgNiA2IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8ZG90cyBmaWxsPSIjOTk5IiBkPSJtMTUgMTJjMCAuNTUyLS40NDggMS0xIDFzLTEtLjQ0OC0xLTEgLjQ0OC0xIDEtMSAxIC40NDggMSAxem0wIDRjMCAuNTUyLS40NDggMS0xIDFzLTEtLjQ0OC0xLTEgLjQ0OC0xIDEtMSAxIC40NDggMSAxem0wIDRjMCAuNTUyLS40NDgtMS0xIDFzMSAuNDQ4IDEgMS0uNDQ4IDEtMSAxLTEtLjQ0OC0xLTF6bTUtNGMwLS41NTIuNDQ4LTEgMS0xczEgLjQ0OCAxIDEtLjQ0OCAxLTEgMS0xLS40NDgtMS0xem0wIDhjMC0uNTUyLjQ0OC0xIDEtMXMxIC40NDggMSAxLS40NDggMS0xIDEtMS0uNDQ4LTEtMXptNS00YzAtLjU1Mi40NDgtMSAxLTFzMSAuNDQ4IDEgMS0uNDQ4IDEtMSAxLTEtLjQ0OC0xLTF6bTAtNGMwLS41NTIuNDQ4LTEgMS0xczEgLjQ0OCAxIDEtLjQ0OCAxLTEgMS0xLS40NDgtMS0xem0wIDhjMC0uNTUyLjQ0OC0xIDEtMXMxIC40NDggMSAxLS40NDggMS0xIDEtMS0uNDQ4LTEtMXoiLz4KPHN2Zz4K');
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

        .widget-header-button {
          pointer-events: auto !important;
          z-index: 50 !important;
          position: relative !important;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }

        .widget-header-button:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .widget-container .react-grid-item {
          pointer-events: auto;
        }

        .widget-container .widget-header-button * {
          pointer-events: none;
        }
      `}</style>
    </div>
  )
}

// Widget Component
interface WidgetComponentProps {
  widget: Widget
  onRemove: () => void
  onEdit: () => void
  onUpdate: (updates: Partial<Widget>) => void
}

function WidgetComponent({ widget, onRemove, onEdit, onUpdate }: WidgetComponentProps) {
  const getWidgetIcon = (type: string) => {
    const widgetType = WIDGET_TYPES.find((w) => w.type === type)
    return widgetType?.icon || FileText
  }

  const IconComponent = getWidgetIcon(widget.type)
  const backgroundColor = (widget.config?.backgroundColor as string) || "bg-white/5"

  const handleEditClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      e.nativeEvent.stopImmediatePropagation()
      console.log("Edit button clicked for widget:", widget.id)
      onEdit()
    },
    [onEdit, widget.id],
  )

  const handleDeleteClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      e.nativeEvent.stopImmediatePropagation()
      console.log("Delete button clicked for widget:", widget.id)
      onRemove()
    },
    [onRemove, widget.id],
  )

  return (
    <div className={`h-full flex flex-col ${backgroundColor}`}>
      {/* Widget Header */}
      <div
        className="flex items-center justify-between p-3 border-b border-white/10"
        onMouseDown={(e) => {
          // Only prevent drag if clicking on buttons
          const target = e.target as HTMLElement
          if (target.closest(".widget-header-button")) {
            e.stopPropagation()
          }
        }}
      >
        <div className="flex items-center space-x-2">
          <IconComponent className="w-4 h-4 text-white/80" />
          <h3 className="text-white font-medium text-sm">{widget.title}</h3>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={handleEditClick}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            className="widget-header-button p-1 text-white/60 hover:text-white transition-colors relative z-50"
            title="Edit widget"
            type="button"
          >
            <Settings className="w-3 h-3 pointer-events-none" />
          </button>
          <button
            onClick={handleDeleteClick}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            className="widget-header-button p-1 text-white/60 hover:text-red-400 transition-colors relative z-50"
            title="Delete widget"
            type="button"
          >
            <Trash2 className="w-3 h-3 pointer-events-none" />
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

// Widget Edit Modal Component
interface WidgetEditModalProps {
  widget: Widget
  onSave: (updates: Partial<Widget>) => void
  onClose: () => void
}

function WidgetEditModal({ widget, onSave, onClose }: WidgetEditModalProps) {
  const [title, setTitle] = useState(widget.title || "")
  const [selectedColor, setSelectedColor] = useState((widget.config?.color as string) || "from-blue-500 to-blue-700")
  const [selectedBg, setSelectedBg] = useState((widget.config?.backgroundColor as string) || "bg-blue-500/20")
  const [config, setConfig] = useState(widget.config || {})

  const handleSave = () => {
    const updates: Partial<Widget> = {
      title,
      config: {
        ...config,
        color: selectedColor,
        backgroundColor: selectedBg,
      },
    }
    onSave(updates)
  }

  const updateConfig = (key: string, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Edit Widget</h2>
          <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              <Type className="w-4 h-4 inline mr-2" />
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Widget title"
            />
          </div>

          {/* Color Theme */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              <Palette className="w-4 h-4 inline mr-2" />
              Color Theme
            </label>
            <div className="grid grid-cols-3 gap-2">
              {WIDGET_COLORS.map((color) => (
                <button
                  key={color.name}
                  onClick={() => {
                    setSelectedColor(color.value)
                    setSelectedBg(color.bg)
                  }}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedColor === color.value ? "border-white" : "border-white/20 hover:border-white/40"
                  }`}
                >
                  <div className={`w-full h-6 bg-gradient-to-r ${color.value} rounded`} />
                  <p className="text-white/80 text-xs mt-1">{color.name}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Widget-specific configurations */}
          {widget.type === "card" && (
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Message</label>
              <textarea
                value={(config.message as string) || ""}
                onChange={(e) => updateConfig("message", e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Card message"
                rows={3}
              />
            </div>
          )}

          {widget.type === "metric" && (
            <>
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Value</label>
                <input
                  type="text"
                  value={(config.value as string) || ""}
                  onChange={(e) => updateConfig("value", e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1,234"
                />
              </div>
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Label</label>
                <input
                  type="text"
                  value={(config.label as string) || ""}
                  onChange={(e) => updateConfig("label", e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Total Users"
                />
              </div>
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Change</label>
                <input
                  type="text"
                  value={(config.change as string) || ""}
                  onChange={(e) => updateConfig("change", e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+12%"
                />
              </div>
            </>
          )}
        </div>

        <div className="flex space-x-4 mt-6">
          <button
            onClick={onClose}
            className="flex-1 bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Save</span>
          </button>
        </div>
      </div>
    </div>
  )
}

// Widget Content Component
function WidgetContent({ widget }: { widget: Widget }) {
  const color = (widget.config?.color as string) || "from-blue-500 to-blue-700"

  switch (widget.type) {
    case "card":
      return (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div
              className={`w-16 h-16 bg-gradient-to-r ${color} rounded-full flex items-center justify-center mx-auto mb-4`}
            >
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h4 className="text-white text-lg font-semibold mb-2">{widget.title}</h4>
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
            <div className="text-3xl font-bold text-white mb-1">{(widget.config?.value as string) || "1,234"}</div>
            <div className="text-white/60 text-sm">{(widget.config?.label as string) || "Total Users"}</div>
            <div className="text-green-400 text-xs mt-1">
              {(widget.config?.change as string) || "+12% from last month"}
            </div>
          </div>
        </div>
      )

    case "chart":
      return (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div
              className={`w-16 h-16 bg-gradient-to-r ${color} rounded-full flex items-center justify-center mx-auto mb-4`}
            >
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <p className="text-white/60 text-sm">Chart visualization would go here</p>
          </div>
        </div>
      )

    case "calendar":
      return (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div
              className={`w-16 h-16 bg-gradient-to-r ${color} rounded-full flex items-center justify-center mx-auto mb-4`}
            >
              <Calendar className="w-8 h-8 text-white" />
            </div>
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
            <div
              className={`w-16 h-16 bg-gradient-to-r ${color} rounded-full flex items-center justify-center mx-auto mb-4`}
            >
              <DollarSign className="w-8 h-8 text-white" />
            </div>
            <p className="text-white/60 text-sm">Revenue graph would display here</p>
          </div>
        </div>
      )

    default:
      return (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div
              className={`w-16 h-16 bg-gradient-to-r ${color} rounded-full flex items-center justify-center mx-auto mb-4`}
            >
              <FileText className="w-8 h-8 text-white" />
            </div>
            <p className="text-white/60 text-sm">Widget content</p>
          </div>
        </div>
      )
  }
}

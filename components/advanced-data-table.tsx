"use client"

import type React from "react"
import { useState, useEffect, useMemo, useCallback } from "react"
import { Search, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react"

interface Column {
  id: string
  label: string
  type: "text" | "number" | "date" | "badge" | "currency" | "percentage"
  sortable?: boolean
  filterable?: boolean
  width?: number
}

interface TableConfig {
  columns: Column[]
  data: any[]
  pagination: {
    enabled: boolean
    pageSize: number
    currentPage: number
    showSizeSelector: boolean
    pageSizeOptions: number[]
  }
  filters: {
    enabled: boolean
    globalSearch: boolean
    columnFilters: boolean
    dateRange: boolean
  }
  sorting: {
    enabled: boolean
    multiSort: boolean
    defaultSort: { column: string; direction: "asc" | "desc" }
  }
  infiniteScroll: boolean
  virtualScrolling: boolean
  exportOptions: string[]
  selectable: boolean
  expandable: boolean
}

interface AdvancedDataTableProps {
  config: TableConfig
  onConfigChange?: (config: TableConfig) => void
  height?: number
}

export function AdvancedDataTable({ config, onConfigChange, height = 400 }: AdvancedDataTableProps) {
  const [globalSearch, setGlobalSearch] = useState("")
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({})
  const [sortConfig, setSortConfig] = useState<Array<{ column: string; direction: "asc" | "desc" }>>([
    config.sorting.defaultSort,
  ])
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())
  const [currentPage, setCurrentPage] = useState(config.pagination.currentPage)
  const [pageSize, setPageSize] = useState(config.pagination.pageSize)
  const [displayedData, setDisplayedData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Filter and sort data
  const processedData = useMemo(() => {
    let filtered = [...config.data]

    // Global search
    if (globalSearch && config.filters.globalSearch) {
      filtered = filtered.filter((row) =>
        Object.values(row).some((value) => String(value).toLowerCase().includes(globalSearch.toLowerCase())),
      )
    }

    // Column filters
    if (config.filters.columnFilters) {
      Object.entries(columnFilters).forEach(([columnId, filterValue]) => {
        if (filterValue) {
          filtered = filtered.filter((row) => String(row[columnId]).toLowerCase().includes(filterValue.toLowerCase()))
        }
      })
    }

    // Sorting
    if (config.sorting.enabled && sortConfig.length > 0) {
      filtered.sort((a, b) => {
        for (const sort of sortConfig) {
          const aVal = a[sort.column]
          const bVal = b[sort.column]

          let comparison = 0
          if (aVal < bVal) comparison = -1
          if (aVal > bVal) comparison = 1

          if (comparison !== 0) {
            return sort.direction === "asc" ? comparison : -comparison
          }
        }
        return 0
      })
    }

    return filtered
  }, [config.data, globalSearch, columnFilters, sortConfig, config.filters, config.sorting])

  // Handle infinite scroll
  useEffect(() => {
    if (config.infiniteScroll) {
      const initialLoad = Math.min(50, processedData.length)
      setDisplayedData(processedData.slice(0, initialLoad))
    } else {
      // Regular pagination
      const startIndex = (currentPage - 1) * pageSize
      const endIndex = startIndex + pageSize
      setDisplayedData(processedData.slice(startIndex, endIndex))
    }
  }, [processedData, currentPage, pageSize, config.infiniteScroll])

  // Load more data for infinite scroll
  const loadMoreData = useCallback(() => {
    if (config.infiniteScroll && !isLoading) {
      setIsLoading(true)

      setTimeout(() => {
        const currentLength = displayedData.length
        const nextBatch = processedData.slice(currentLength, currentLength + 25)
        setDisplayedData((prev) => [...prev, ...nextBatch])
        setIsLoading(false)
      }, 500) // Simulate loading delay
    }
  }, [config.infiniteScroll, displayedData.length, processedData, isLoading])

  // Handle scroll for infinite loading
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      if (!config.infiniteScroll) return

      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
      const scrollPercentage = (scrollTop + clientHeight) / scrollHeight

      if (scrollPercentage > 0.8 && displayedData.length < processedData.length && !isLoading) {
        loadMoreData()
      }
    },
    [config.infiniteScroll, displayedData.length, processedData.length, isLoading, loadMoreData],
  )

  const handleSort = (columnId: string) => {
    if (!config.sorting.enabled) return

    setSortConfig((prev) => {
      const existing = prev.find((s) => s.column === columnId)
      if (existing) {
        if (existing.direction === "asc") {
          return prev.map((s) => (s.column === columnId ? { ...s, direction: "desc" as const } : s))
        } else {
          return prev.filter((s) => s.column !== columnId)
        }
      } else {
        if (config.sorting.multiSort) {
          return [...prev, { column: columnId, direction: "asc" as const }]
        } else {
          return [{ column: columnId, direction: "asc" as const }]
        }
      }
    })
  }

  const formatCellValue = (value: any, column: Column) => {
    switch (column.type) {
      case "currency":
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(Number(value) || 0)
      case "percentage":
        return `${Number(value) || 0}%`
      case "date":
        return new Date(value).toLocaleDateString()
      case "number":
        return Number(value).toLocaleString()
      default:
        return String(value)
    }
  }

  const renderCell = (value: any, column: Column, rowIndex: number) => {
    const formattedValue = formatCellValue(value, column)

    if (column.type === "badge") {
      const badgeColors: Record<string, string> = {
        Active: "bg-green-500/20 text-green-400 border-green-500/40",
        Inactive: "bg-gray-500/20 text-gray-400 border-gray-500/40",
        Pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40",
        Suspended: "bg-red-500/20 text-red-400 border-red-500/40",
        Admin: "bg-purple-500/20 text-purple-400 border-purple-500/40",
        User: "bg-blue-500/20 text-blue-400 border-blue-500/40",
        Editor: "bg-orange-500/20 text-orange-400 border-orange-500/40",
        Manager: "bg-indigo-500/20 text-indigo-400 border-indigo-500/40",
      }

      return (
        <span
          className={`px-2 py-1 rounded-full text-xs border ${
            badgeColors[String(value)] || "bg-gray-500/20 text-gray-400 border-gray-500/40"
          }`}
        >
          {formattedValue}
        </span>
      )
    }

    return <span className="text-white/80">{formattedValue}</span>
  }

  const getSortIcon = (columnId: string) => {
    const sort = sortConfig.find((s) => s.column === columnId)
    if (!sort) return <ChevronsUpDown className="w-4 h-4 text-white/40" />
    return sort.direction === "asc" ? (
      <ChevronUp className="w-4 h-4 text-blue-400" />
    ) : (
      <ChevronDown className="w-4 h-4 text-blue-400" />
    )
  }

  const totalPages = Math.ceil(processedData.length / pageSize)

  return (
    <div className="h-full flex flex-col bg-white/5 rounded-lg overflow-hidden">
      {/* Header Controls */}
      {config.filters.enabled && (
        <div className="p-4 border-b border-white/10 space-y-3">
          {config.filters.globalSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Search all columns..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {config.filters.columnFilters && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {config.columns
                .filter((col) => col.filterable)
                .slice(0, 4)
                .map((column) => (
                  <input
                    key={column.id}
                    type="text"
                    placeholder={`Filter ${column.label}...`}
                    value={columnFilters[column.id] || ""}
                    onChange={(e) => setColumnFilters((prev) => ({ ...prev, [column.id]: e.target.value }))}
                    className="px-3 py-1 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                ))}
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div
        className="flex-1 overflow-auto"
        onScroll={handleScroll}
        style={{
          height: height - (config.filters.enabled ? 120 : 60),
          maxHeight: height - (config.filters.enabled ? 120 : 60),
          overflowY: "auto",
          overflowX: "auto",
        }}
      >
        <table className="w-full text-sm min-w-max">
          <thead className="sticky top-0 bg-gray-900/95 backdrop-blur-md border-b border-white/20 z-10">
            <tr>
              {config.selectable && (
                <th className="w-12 p-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === displayedData.length && displayedData.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRows(new Set(displayedData.map((_, i) => i)))
                      } else {
                        setSelectedRows(new Set())
                      }
                    }}
                    className="rounded border-white/20 bg-white/10 text-blue-500 focus:ring-blue-500"
                  />
                </th>
              )}
              {config.columns.map((column) => (
                <th
                  key={column.id}
                  className={`p-3 text-left font-medium text-white/80 ${
                    config.sorting.enabled && column.sortable ? "cursor-pointer hover:bg-white/5" : ""
                  }`}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(column.id)}
                >
                  <div className="flex items-center space-x-2">
                    <span>{column.label}</span>
                    {config.sorting.enabled && column.sortable && getSortIcon(column.id)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayedData.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={`border-b border-white/5 hover:bg-white/5 ${
                  selectedRows.has(rowIndex) ? "bg-blue-500/10" : ""
                }`}
              >
                {config.selectable && (
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selectedRows.has(rowIndex)}
                      onChange={(e) => {
                        const newSelected = new Set(selectedRows)
                        if (e.target.checked) {
                          newSelected.add(rowIndex)
                        } else {
                          newSelected.delete(rowIndex)
                        }
                        setSelectedRows(newSelected)
                      }}
                      className="rounded border-white/20 bg-white/10 text-blue-500 focus:ring-blue-500"
                    />
                  </td>
                )}
                {config.columns.map((column) => (
                  <td key={column.id} className="p-3">
                    {renderCell(row[column.id], column, rowIndex)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Loading indicator for infinite scroll */}
        {config.infiniteScroll && isLoading && (
          <div className="flex justify-center items-center py-4">
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span className="ml-2 text-white/60">Loading more data...</span>
          </div>
        )}
      </div>

      {/* Footer with pagination */}
      {!config.infiniteScroll && config.pagination.enabled && (
        <div className="p-4 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-white/60 text-sm">
              Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, processedData.length)} of{" "}
              {processedData.length} entries
            </span>
            {config.pagination.showSizeSelector && (
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value))
                  setCurrentPage(1)
                }}
                className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm"
              >
                {config.pagination.pageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size} per page
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-white/10 border border-white/20 rounded text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20"
            >
              Previous
            </button>
            <span className="text-white/60 text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-white/10 border border-white/20 rounded text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Status for infinite scroll */}
      {config.infiniteScroll && (
        <div className="p-2 border-t border-white/10 text-center">
          <span className="text-white/60 text-sm">
            Showing {displayedData.length} of {processedData.length} entries
            {displayedData.length < processedData.length && " • Scroll down to load more"}
          </span>
        </div>
      )}
    </div>
  )
}

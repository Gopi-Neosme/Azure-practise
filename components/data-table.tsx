"use client"

import type React from "react"
import { useState, useEffect, useMemo, useRef, useCallback } from "react"
import { Search, Filter, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Download, RefreshCw } from "lucide-react"

interface TableColumn {
  key: string
  label: string
  sortable?: boolean
  filterable?: boolean
  width?: string
  render?: (value: any, row: any) => React.ReactNode
}

interface DataTableProps {
  columns: TableColumn[]
  data: any[]
  pageSize?: number
  searchable?: boolean
  filterable?: boolean
  exportable?: boolean
  infiniteScroll?: boolean
  onRowClick?: (row: any) => void
  loading?: boolean
  onRefresh?: () => void
}

export function DataTable({
  columns,
  data,
  pageSize = 10,
  searchable = true,
  filterable = true,
  exportable = true,
  infiniteScroll = false,
  onRowClick,
  loading = false,
  onRefresh,
}: DataTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null)
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [displayedData, setDisplayedData] = useState<any[]>([])
  const [hasMore, setHasMore] = useState(true)
  const observerRef = useRef<HTMLDivElement>(null)

  // Filter and search data
  const filteredData = useMemo(() => {
    let result = [...data]

    // Apply search
    if (searchTerm) {
      result = result.filter((row) =>
        columns.some((col) => String(row[col.key]).toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        result = result.filter((row) => String(row[key]).toLowerCase().includes(value.toLowerCase()))
      }
    })

    // Apply sorting
    if (sortConfig) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.key]
        const bVal = b[sortConfig.key]

        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1
        return 0
      })
    }

    return result
  }, [data, searchTerm, filters, sortConfig, columns])

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / pageSize)
  const paginatedData = useMemo(() => {
    if (infiniteScroll) return displayedData
    const start = (currentPage - 1) * pageSize
    return filteredData.slice(start, start + pageSize)
  }, [filteredData, currentPage, pageSize, infiniteScroll, displayedData])

  // Infinite scroll logic
  const loadMore = useCallback(() => {
    if (infiniteScroll && hasMore) {
      const currentLength = displayedData.length
      const nextBatch = filteredData.slice(currentLength, currentLength + pageSize)

      if (nextBatch.length > 0) {
        setDisplayedData((prev) => [...prev, ...nextBatch])
      }

      if (currentLength + nextBatch.length >= filteredData.length) {
        setHasMore(false)
      }
    }
  }, [infiniteScroll, hasMore, displayedData.length, filteredData, pageSize])

  // Intersection observer for infinite scroll
  useEffect(() => {
    if (!infiniteScroll) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore()
        }
      },
      { threshold: 1.0 },
    )

    if (observerRef.current) {
      observer.observe(observerRef.current)
    }

    return () => observer.disconnect()
  }, [infiniteScroll, hasMore, loading, loadMore])

  // Initialize displayed data for infinite scroll
  useEffect(() => {
    if (infiniteScroll) {
      setDisplayedData(filteredData.slice(0, pageSize))
      setHasMore(filteredData.length > pageSize)
    }
  }, [infiniteScroll, filteredData, pageSize])

  const handleSort = (key: string) => {
    setSortConfig((current) => {
      if (current?.key === key) {
        return current.direction === "asc" ? { key, direction: "desc" } : null
      }
      return { key, direction: "asc" }
    })
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  const exportToCSV = () => {
    const headers = columns.map((col) => col.label).join(",")
    const rows = filteredData.map((row) => columns.map((col) => `"${row[col.key]}"`).join(",")).join("\n")

    const csv = `${headers}\n${rows}`
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "table-data.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="h-full flex flex-col bg-white/5 rounded-lg overflow-hidden">
      {/* Header Controls */}
      <div className="p-4 border-b border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold">Data Table</h3>
          <div className="flex items-center space-x-2">
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={loading}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 text-white ${loading ? "animate-spin" : ""}`} />
              </button>
            )}
            {exportable && (
              <button onClick={exportToCSV} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                <Download className="w-4 h-4 text-white" />
              </button>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        {(searchable || filterable) && (
          <div className="space-y-3">
            {searchable && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {filterable && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {columns
                  .filter((col) => col.filterable)
                  .map((col) => (
                    <div key={col.key} className="relative">
                      <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
                      <input
                        type="text"
                        placeholder={`Filter ${col.label}...`}
                        value={filters[col.key] || ""}
                        onChange={(e) => handleFilterChange(col.key, e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="bg-white/5 sticky top-0">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left text-white/80 font-medium ${
                    col.sortable ? "cursor-pointer hover:bg-white/10" : ""
                  }`}
                  style={{ width: col.width }}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center space-x-2">
                    <span>{col.label}</span>
                    {col.sortable && (
                      <div className="flex flex-col">
                        <ChevronUp
                          className={`w-3 h-3 ${
                            sortConfig?.key === col.key && sortConfig.direction === "asc"
                              ? "text-blue-400"
                              : "text-white/40"
                          }`}
                        />
                        <ChevronDown
                          className={`w-3 h-3 -mt-1 ${
                            sortConfig?.key === col.key && sortConfig.direction === "desc"
                              ? "text-blue-400"
                              : "text-white/40"
                          }`}
                        />
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, index) => (
              <tr
                key={index}
                className={`border-b border-white/10 hover:bg-white/5 transition-colors ${
                  onRowClick ? "cursor-pointer" : ""
                }`}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-white/90">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          </div>
        )}

        {infiniteScroll && hasMore && <div ref={observerRef} className="h-4" />}
      </div>

      {/* Pagination */}
      {!infiniteScroll && (
        <div className="p-4 border-t border-white/10 flex items-center justify-between">
          <div className="text-white/60 text-sm">
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredData.length)} of{" "}
            {filteredData.length} entries
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4 text-white" />
            </button>

            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded-lg transition-colors ${
                      currentPage === page ? "bg-blue-600 text-white" : "bg-white/10 text-white/80 hover:bg-white/20"
                    }`}
                  >
                    {page}
                  </button>
                )
              })}
            </div>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

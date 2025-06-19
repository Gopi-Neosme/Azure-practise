import { Types } from "mongoose"
import DashboardPreferences, { type IDashboardPreferences, type IDashboardLayout } from "@/models/dashboard-preferences"
import connectToDatabase from "@/lib/mongoose"

export class DashboardService {
  static async getUserPreferences(userId: string): Promise<IDashboardPreferences | null> {
    await connectToDatabase()

    let userObjectId: Types.ObjectId

    if (Types.ObjectId.isValid(userId)) {
      userObjectId = new Types.ObjectId(userId)
    } else {
      // Create consistent ObjectId from email/string
      const hash = userId.split("").reduce((a, b) => {
        a = (a << 5) - a + b.charCodeAt(0)
        return a & a
      }, 0)
      const hexString = Math.abs(hash).toString(16).padStart(24, "0").substring(0, 24)
      userObjectId = new Types.ObjectId(hexString)
    }

    return await DashboardPreferences.findOne({ userId: userObjectId })
  }

static async createOrUpdatePreferences(userId: string, layout: IDashboardLayout): Promise<IDashboardPreferences> {
  await connectToDatabase();

  let userObjectId: Types.ObjectId;

  if (Types.ObjectId.isValid(userId)) {
    userObjectId = new Types.ObjectId(userId);
  } else {
    const hash = userId.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);
    const hexString = Math.abs(hash).toString(16).padStart(24, "0").substring(0, 24);
    userObjectId = new Types.ObjectId(hexString);
  }

  console.log("Incoming layout:", JSON.stringify(layout, null, 2)); // Log for debugging

  // Validate layout before processing
  const validWidgetTypes = ["chart", "calendar", "card", "metric", "table", "data-table"];
  const validColumnTypes = ["text", "number", "date", "badge", "currency", "percentage"];
  layout.widgets.forEach((widget, index) => {
    if (!validWidgetTypes.includes(widget.type)) {
      throw new Error(`Invalid widget type "${widget.type}" at index ${index}`);
    }
    if (widget.config?.columns) {
      widget.config.columns.forEach((column, colIndex) => {
        if (!validColumnTypes.includes(column.type)) {
          throw new Error(`Invalid column type "${column.type}" at widget ${index}, column ${colIndex}`);
        }
      });
    }
  });

  let preferences = await DashboardPreferences.findOne({ userId: userObjectId });

  if (!preferences) {
    preferences = await DashboardPreferences.create({
      userId: userObjectId,
      layouts: [this.validateAndEnhanceLayout(layout)],
      activeLayoutName: layout.name,
      globalSettings: {
        theme: "dark",
        autoSave: true,
        refreshInterval: 300,
        compactMode: false,
      },
    });
  } else {
    const existingLayoutIndex = preferences.layouts.findIndex((l: any) => l.name === layout.name);
    const enhancedLayout = this.validateAndEnhanceLayout(layout);

    if (existingLayoutIndex >= 0) {
      preferences.layouts[existingLayoutIndex] = enhancedLayout;
    } else {
      preferences.layouts.push(enhancedLayout);
    }

    preferences.activeLayoutName = layout.name;
    await preferences.validate(); // Explicitly validate
    await preferences.save();
  }

  return preferences;
}

  static async deleteLayout(userId: string, layoutName: string): Promise<IDashboardPreferences> {
    await connectToDatabase()

    let userObjectId: Types.ObjectId

    if (Types.ObjectId.isValid(userId)) {
      userObjectId = new Types.ObjectId(userId)
    } else {
      const hash = userId.split("").reduce((a, b) => {
        a = (a << 5) - a + b.charCodeAt(0)
        return a & a
      }, 0)
      const hexString = Math.abs(hash).toString(16).padStart(24, "0").substring(0, 24)
      userObjectId = new Types.ObjectId(hexString)
    }

    const preferences = await DashboardPreferences.findOne({ userId: userObjectId })

    if (!preferences) {
      throw new Error("User preferences not found")
    }

    return await preferences.deleteLayout(layoutName)
  }

  // Validate and enhance layout with proper widget configurations
  private static validateAndEnhanceLayout(layout: IDashboardLayout): IDashboardLayout {
    const enhancedWidgets = layout.widgets.map((widget) => {
      // Ensure all widgets have proper configuration structure
      const baseConfig = {
        color: widget.config?.color || "from-blue-500 to-blue-700",
        backgroundColor: widget.config?.backgroundColor || "bg-blue-500/20",
        ...widget.config,
      }

      // Add type-specific default configurations
      switch (widget.type) {
        case "chart":
          return {
            ...widget,
            config: {
              ...baseConfig,
              chartType: widget.config?.chartType || "bar",
              data: widget.config?.data || [
                { name: "Jan", value: 400 },
                { name: "Feb", value: 300 },
                { name: "Mar", value: 600 },
                { name: "Apr", value: 800 },
                { name: "May", value: 500 },
              ],
              xAxis: widget.config?.xAxis || "name",
              yAxis: widget.config?.yAxis || "value",
              colors: widget.config?.colors || ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444"],
            },
          }

        case "table":
          return {
            ...widget,
            config: {
              ...baseConfig,
              columns: widget.config?.columns || [
                { id: "name", label: "Name", type: "text", color: "#ffffff" },
                { id: "email", label: "Email", type: "text", color: "#ffffff" },
                { id: "role", label: "Role", type: "badge", color: "#3b82f6" },
              ],
              data: widget.config?.data || [
                { name: "John Doe", email: "john@example.com", role: "Admin", value: 1 },
                { name: "Jane Smith", email: "jane@example.com", role: "User", value: 2 },
                { name: "Bob Johnson", email: "bob@example.com", role: "Editor", value: 3 },
              ],
              showHeaders: widget.config?.showHeaders !== false,
              alternateRows: widget.config?.alternateRows !== false,
              borderColor: widget.config?.borderColor || "#374151",
            },
          }

        case "metric":
          return {
            ...widget,
            config: {
              ...baseConfig,
              value: widget.config?.value || "1,234",
              label: widget.config?.label || "Total Users",
              change: widget.config?.change || "+12%",
              changeColor: widget.config?.changeColor || "#10b981",
              showTrend: widget.config?.showTrend !== false,
              prefix: widget.config?.prefix || "",
              suffix: widget.config?.suffix || "",
            },
          }

        case "card":
          return {
            ...widget,
            config: {
              ...baseConfig,
              message: widget.config?.message || "Welcome to your dashboard!",
              showIcon: widget.config?.showIcon !== false,
              iconType: widget.config?.iconType || "info",
              textAlign: widget.config?.textAlign || "center",
            },
          }

        case "calendar":
          return {
            ...widget,
            config: {
              ...baseConfig,
              showWeekends: widget.config?.showWeekends !== false,
              highlightToday: widget.config?.highlightToday !== false,
              events: widget.config?.events || [],
              theme: widget.config?.theme || "default",
            },
          }
        case "data-table":
          return {
            ...widget,
            config: {
              ...baseConfig,
              columns: widget.config?.columns || [
                { id: "id", label: "ID", type: "number", sortable: true, filterable: true, width: 80 },
                { id: "name", label: "Name", type: "text", sortable: true, filterable: true, width: 150 },
                { id: "email", label: "Email", type: "text", sortable: true, filterable: true, width: 200 },
                { id: "role", label: "Role", type: "badge", sortable: true, filterable: true, width: 120 },
                { id: "status", label: "Status", type: "badge", sortable: true, filterable: true, width: 100 },
              ],
              data: widget.config?.data || [],
              pagination: widget.config?.pagination || {
                enabled: true,
                pageSize: 10,
                currentPage: 1,
                showSizeSelector: true,
                pageSizeOptions: [5, 10, 25, 50, 100],
              },
              filters: widget.config?.filters || {
                enabled: true,
                globalSearch: true,
                columnFilters: true,
                dateRange: true,
              },
              sorting: widget.config?.sorting || {
                enabled: true,
                multiSort: true,
                defaultSort: { column: "id", direction: "asc" },
              },
              infiniteScroll: widget.config?.infiniteScroll || false,
              virtualScrolling: widget.config?.virtualScrolling || true,
              exportOptions: widget.config?.exportOptions || ["csv", "excel", "pdf"],
              selectable: widget.config?.selectable || true,
              expandable: widget.config?.expandable || false,
            },
          }

        default:
          return widget
      }
    })

    return {
      ...layout,
      widgets: enhancedWidgets,
    }
  }

  // Get widget configuration template for a specific type
  static getWidgetTemplate(type: string, chartType?: string) {
    const baseTemplate = {
      color: "from-blue-500 to-blue-700",
      backgroundColor: "bg-blue-500/20",
    }

    switch (type) {
      case "chart":
        return {
          ...baseTemplate,
          chartType: chartType || "bar",
          data: [
            { name: "Jan", value: 400 },
            { name: "Feb", value: 300 },
            { name: "Mar", value: 600 },
            { name: "Apr", value: 800 },
            { name: "May", value: 500 },
          ],
          xAxis: "name",
          yAxis: "value",
          colors: ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444"],
        }

      case "table":
        return {
          ...baseTemplate,
          columns: [
            { id: "name", label: "Name", type: "text", color: "#ffffff" },
            { id: "email", label: "Email", type: "text", color: "#ffffff" },
            { id: "role", label: "Role", type: "badge", color: "#3b82f6" },
          ],
          data: [
            { name: "John Doe", email: "john@example.com", role: "Admin" },
            { name: "Jane Smith", email: "jane@example.com", role: "User" },
            { name: "Bob Johnson", email: "bob@example.com", role: "Editor" },
          ],
          showHeaders: true,
          alternateRows: true,
          borderColor: "#374151",
        }

      case "metric":
        return {
          ...baseTemplate,
          value: "1,234",
          label: "Total Users",
          change: "+12%",
          changeColor: "#10b981",
          showTrend: true,
          prefix: "",
          suffix: "",
        }

      case "card":
        return {
          ...baseTemplate,
          message: "Welcome to your dashboard!",
          showIcon: true,
          iconType: "info",
          textAlign: "center",
        }

      case "calendar":
        return {
          ...baseTemplate,
          showWeekends: true,
          highlightToday: true,
          events: [],
          theme: "default",
        }
      case "data-table":
        return {
          ...baseTemplate,
          columns: [
            { id: "id", label: "ID", type: "number", sortable: true, filterable: true, width: 80 },
            { id: "name", label: "Name", type: "text", sortable: true, filterable: true, width: 150 },
            { id: "email", label: "Email", type: "text", sortable: true, filterable: true, width: 200 },
            { id: "role", label: "Role", type: "badge", sortable: true, filterable: true, width: 120 },
            { id: "status", label: "Status", type: "badge", sortable: true, filterable: true, width: 100 },
          ],
          data: [],
          pagination: {
            enabled: true,
            pageSize: 10,
            currentPage: 1,
            showSizeSelector: true,
            pageSizeOptions: [5, 10, 25, 50, 100],
          },
          filters: {
            enabled: true,
            globalSearch: true,
            columnFilters: true,
            dateRange: true,
          },
          sorting: {
            enabled: true,
            multiSort: true,
            defaultSort: { column: "id", direction: "asc" },
          },
          infiniteScroll: false,
          virtualScrolling: true,
          exportOptions: ["csv", "excel", "pdf"],
          selectable: true,
          expandable: false,
        }

      default:
        return baseTemplate
    }
  }
}

// Sample data generators for charts and tables

export interface User {
  id: number
  name: string
  email: string
  role: string
  status: "Active" | "Inactive" | "Pending"
  lastLogin: string
  joinDate: string
  department: string
  salary: number
}

export interface SalesData {
  month: string
  sales: number
  profit: number
  customers: number
}

export interface ProductData {
  name: string
  category: string
  sales: number
  revenue: number
  stock: number
}

// Generate sample users
export function generateSampleUsers(count = 100): User[] {
  const names = [
    "John Doe",
    "Jane Smith",
    "Bob Johnson",
    "Alice Brown",
    "Charlie Wilson",
    "Diana Davis",
    "Edward Miller",
    "Fiona Garcia",
    "George Martinez",
    "Helen Rodriguez",
    "Ian Lopez",
    "Julia Hernandez",
    "Kevin Gonzalez",
    "Linda Perez",
    "Michael Torres",
    "Nancy Flores",
    "Oscar Rivera",
    "Patricia Cook",
    "Quinn Bailey",
    "Rachel Cooper",
  ]

  const roles = ["Admin", "Manager", "Developer", "Designer", "Analyst", "Support"]
  const departments = ["Engineering", "Marketing", "Sales", "HR", "Finance", "Operations"]
  const statuses: ("Active" | "Inactive" | "Pending")[] = ["Active", "Inactive", "Pending"]

  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: names[i % names.length] + ` ${Math.floor(i / names.length) + 1}`,
    email: `user${i + 1}@company.com`,
    role: roles[Math.floor(Math.random() * roles.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    lastLogin: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    joinDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    department: departments[Math.floor(Math.random() * departments.length)],
    salary: Math.floor(Math.random() * 100000) + 40000,
  }))
}

// Generate sample sales data
export function generateSampleSalesData(): SalesData[] {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  return months.map((month) => ({
    month,
    sales: Math.floor(Math.random() * 50000) + 20000,
    profit: Math.floor(Math.random() * 15000) + 5000,
    customers: Math.floor(Math.random() * 1000) + 500,
  }))
}

// Generate sample product data
export function generateSampleProducts(): ProductData[] {
  const products = [
    "Laptop Pro",
    "Smartphone X",
    "Tablet Air",
    "Headphones Max",
    "Watch Series",
    "Camera Pro",
    "Speaker Mini",
    "Monitor Ultra",
    "Keyboard Mech",
    "Mouse Wireless",
  ]

  const categories = ["Electronics", "Accessories", "Computers", "Mobile", "Audio"]

  return products.map((name) => ({
    name,
    category: categories[Math.floor(Math.random() * categories.length)],
    sales: Math.floor(Math.random() * 1000) + 100,
    revenue: Math.floor(Math.random() * 100000) + 10000,
    stock: Math.floor(Math.random() * 500) + 50,
  }))
}

// Chart data generators
export function generateBarChartData() {
  return [
    { label: "Q1", value: 45000, color: "#3B82F6" },
    { label: "Q2", value: 52000, color: "#10B981" },
    { label: "Q3", value: 48000, color: "#F59E0B" },
    { label: "Q4", value: 61000, color: "#EF4444" },
  ]
}

export function generateLineChartData() {
  return Array.from({ length: 12 }, (_, i) => ({
    x: i + 1,
    y: Math.floor(Math.random() * 1000) + 500 + i * 50,
  }))
}

export function generatePieChartData() {
  return [
    { label: "Desktop", value: 45, color: "#3B82F6" },
    { label: "Mobile", value: 35, color: "#10B981" },
    { label: "Tablet", value: 15, color: "#F59E0B" },
    { label: "Other", value: 5, color: "#EF4444" },
  ]
}

export function generateAreaChartData() {
  return Array.from({ length: 30 }, (_, i) => ({
    x: i + 1,
    y: Math.floor(Math.random() * 200) + 300 + Math.sin(i * 0.2) * 100,
  }))
}

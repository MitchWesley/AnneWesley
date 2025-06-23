import { neon } from "@neondatabase/serverless"

// Create a fresh connection each time to avoid stale connection pools
export function getNeonClient() {
  // Force a completely fresh connection by adding a timestamp
  const connectionString = process.env.DATABASE_URL!
  return neon(connectionString)
}

// Alternative: Force connection refresh for critical operations
export function getFreshNeonClient() {
  // Add a random parameter to force connection pool refresh
  const baseUrl = process.env.DATABASE_URL!
  const freshUrl = baseUrl.includes("?") ? `${baseUrl}&_refresh=${Date.now()}` : `${baseUrl}?_refresh=${Date.now()}`

  return neon(freshUrl)
}
import { neon } from "@neondatabase/serverless"

export function getNeonClient() {
  return neon(process.env.DATABASE_URL!)
}

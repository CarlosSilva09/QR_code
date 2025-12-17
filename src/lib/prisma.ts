import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export function getDatabaseUrl(): string | null {
  const candidates = [
    process.env.DATABASE_URL,
    process.env.POSTGRES_PRISMA_URL,
    process.env.POSTGRES_URL,
    process.env.POSTGRES_URL_NON_POOLING,
    process.env.POSTGRESQL_URL,
    process.env.POSTGRESQL_URL_NON_POOLING,
  ].filter(Boolean) as string[]

  for (const url of candidates) {
    const normalized = url
      .trim()
      .replace(/^[\"']|[\"']$/g, '')
      .replace(/[\r\n]+/g, '')

    if (normalized.startsWith('postgresql://') || normalized.startsWith('postgres://')) {
      return normalized
    }
  }

  return null
}

const databaseUrl = getDatabaseUrl()

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient(
    databaseUrl
      ? {
          datasources: {
            db: { url: databaseUrl },
          },
        }
      : undefined
  )

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

import { Module, Global } from "@nestjs/common";
import { CacheModule as NestCacheModule } from "@nestjs/cache-manager";
import { CacheService } from "./cache.service";

// Cache TTL constants (in milliseconds)
export const CACHE_TTL = {
  SHORT: 5 * 60 * 1000, // 5 minutes - for dashboard stats
  MEDIUM: 30 * 60 * 1000, // 30 minutes - for semi-static data
  LONG: 60 * 60 * 1000, // 1 hour - for categories and definitions
};

// Cache key prefixes
export const CACHE_KEYS = {
  TASK_CATEGORIES: "task_categories",
  INCIDENT_TYPES: "incident_types",
  SKILL_DEFINITIONS: "skill_definitions",
  COST_CATEGORIES: "cost_categories",
  DOCUMENT_CATEGORIES: "document_categories",
  DASHBOARD_SUMMARY: "dashboard_summary",
  DASHBOARD_STATS: "dashboard_stats",
};

@Global()
@Module({
  imports: [
    NestCacheModule.register({
      ttl: CACHE_TTL.MEDIUM, // Default: 30 minutes
      max: 100, // Maximum number of items in cache
    }),
  ],
  providers: [CacheService],
  exports: [NestCacheModule, CacheService],
})
export class CacheModule {}

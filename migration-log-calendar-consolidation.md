# CALENDAR SCHEMA CONSOLIDATION LOG

**Date:** November 16, 2025
**Branch:** feature/ui-overhaul-unified-persons
**Issue:** Duplicate calendar_events schema causing "no such column: correspondence_id" crash

## CURRENT STATE BEFORE MIGRATION

### Problem:
- Module B defines calendar_events (lines 116-161 in module-b.sql) 
- Module C defines calendar_events (lines 8-43 in module-c.sql)
- SQLite creates Module B's version first (missing correspondence_id)
- Module C tries to create index on non-existent correspondence_id column
- App crashes during startup before database is written to disk

### Files Affected:
1. electron/database/schemas/module-b.sql - Contains duplicate calendar_events
2. electron/database/schemas/module-c.sql - Contains master calendar_events 
3. src/components/moduleB/CalendarEventModal.tsx - Uses Module B types
4. src/types/ModuleB.ts - Defines incompatible CalendarEvent interface
5. electron/database/DatabaseService.ts - Uses Module C schema in methods

## CONSOLIDATION PLAN APPROVED

### Strategy:
- Remove duplicate table from Module B
- Make Module C the single authoritative schema  
- Add Module B compatibility fields to Module C permanently
- Migrate CalendarEventModal to unified types
- Manual testing validation

### Rollback Procedure:
```bash
git checkout feature/ui-overhaul-unified-persons
git reset --hard HEAD~[number of commits]
```

## EXECUTION LOG

### Phase 1: Safety Prep ✅
- Documentation created
- Current state captured
- Ready to proceed with schema changes

### Phase 2: Schema Consolidation [NEXT]
- Remove duplicate from module-b.sql
- Add compatibility fields to module-c.sql
- Test schema creation

### Phase 3: Frontend Migration [PENDING]
- Create unified types
- Migrate CalendarEventModal
- Test all interfaces

### Phase 4: Validation [PENDING]
- Manual testing all workflows
- Verify no regressions
- Document final state

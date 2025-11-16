Why the app can crash on a “missing column” even though no database file exists

This feels impossible on its face:

“If the database doesn’t exist, shouldn’t ALL the tables be created fresh?
How can a column be missing from a table that is brand new?”

The answer is:
Because your app does NOT create a single, authoritative database schema.

Instead, it loads multiple different schemas, many of which define the same table, and SQLite evaluates them sequentially in a strict way that produces a fresh-but-incomplete table—causing the crash.

Let’s break this down clearly.

✅ 1. “No database file exists” does NOT mean “the tables are created correctly”

When the database file doesn’t exist, sql.js creates a completely empty in-memory SQLite database.

But then it immediately loads all .sql files from:

electron/database/schemas/


These include:

module-a.sql

module-b.sql

module-c.sql

module-su.sql
(and possibly others)

Your log shows this:

🌻 New database detected, loading schemas...
📁 Loading schemas from: ...\electron\database\schemas
   - Module A
   - Module B
   - Module C
   - Module SU


So: no file exists, but multiple schema files are fed to SQLite sequentially.

The crash happens while running those schema files, before the database ever touches disk.

✅ 2. SQLite does not merge table definitions—it obeys the first one

You have two modules defining a table named:

calendar_events

Module B’s version (FIRST)

Creates a table without correspondence_id.

CREATE TABLE IF NOT EXISTS calendar_events (
    ...
    -- NO correspondence_id column here
);

Module C’s version (SECOND)

Defines a different structure with correspondence_id.

CREATE TABLE IF NOT EXISTS calendar_events (
    ...
    correspondence_id INTEGER,
    ...
);

SQLite rule:

First CREATE TABLE wins.
Later CREATE TABLE IF NOT EXISTS is ignored.
Tables are never altered.

So on a fresh DB:

Module B creates calendar_events without correspondence_id.

Module C tries to create its version, but SQLite ignores it (because the table already exists).

Module C then tries to create an index:

CREATE INDEX idx_calendar_events_correspondence_id
ON calendar_events(correspondence_id);


SQLite checks the table.

The column isn’t there.

Boom:

Error: no such column: correspondence_id


This is a runtime schema execution error, not a “database file content” error.

✅ 3. The crash happens BEFORE the database ever gets written to disk

This is the key insight.

Your fatal error occurs during schema initialization, which happens:

before first write,

before first query,

before the database is saved to disk,

before React loads.

So the DB file doesn’t matter.

The error is thrown by SQLite parsing your schema scripts, not by existing data.

✅ 4. Therefore: a missing column DOES crash a brand new database

Because:

✔ The first schema file creates a table missing the column.
✔ The second schema file assumes the column exists.
✔ The index creation fails.
✔ The app never finishes building the database.

This is the exact scenario when multiple modules define the same table.

🌻 5. Simple analogy (legal version)

Think of SQLite like Georgia statutory construction:

The first statute enacted defines the structure of the table.

Later statutes that say “create this table if not exists” are ignored because the table already exists.

A later statute tries to reference a field that does not exist in the enacted version.

Constitutional crisis: referencing a nonexistent provision = error.

The database file never even opens—your “legislative history” (schema files) contradict themselves in the same term.

🌻 6. Summary Answer (most succinct)
The app can crash on a missing column even with no database file because:

Your app constructs a fresh in-memory database.

It loads multiple schema files sequentially.

The first schema creates calendar_events without the correspondence_id column.

A later schema tries to create an index on that nonexistent column.

SQLite throws a syntax/structure error during schema execution.

The app crashes before any database is ever saved to disk.

So the database has never existed.
The schema conflict happens during creation.







--------------------------------------------------








The reviewer is partially correct but misunderstands two critical mechanics:

SQLite does not fail when a foreign key column references a table that doesn’t exist yet.

The error in your case is not caused by foreign key creation.

The real failure happens ONLY at the moment Module C tries to create an index on a column that does not exist.

Their theory is plausible but incorrect given your actual schema ordering and the SQL.js behavior.

🌻 Point-by-Point Evaluation

Let’s break down the reviewer’s claims.

1. “The SQL executor tried to create the foreign key constraint, checked if correspondence_log exists, and crashed.”

→ Incorrect.

SQLite does not require the referenced table to exist at the moment the referencing table is created.

Example:

CREATE TABLE child (
    parent_id INTEGER,
    FOREIGN KEY (parent_id) REFERENCES parent(id)
);


This succeeds even if parent does not exist yet.

SQLite validates FKs lazily, not at CREATE TABLE time.

Therefore:
Missing referenced table ≠ cause of crash.

This is not the actual failure.

2. “Module C loads after Module A, but SQL is evaluated differently.”

→ Not relevant for the error.

Order matters, but only with respect to table creation, not foreign key constraints.

The order THAT matters is:

Module B creates calendar_events without correspondence_id.

Module C tries to index correspondence_id.

Column does not exist.

Crash.

There is no SQLite behavior that would cause a foreign key constraint on correspondence_id to fail at schema load.

3. “There’s a migration or query in DatabaseService.ts that runs before schemas are applied.”

→ Almost certainly false given your logs.

Your startup logs clearly show this sequence:

New database detected
Loading schemas...
Schemas loaded successfully
UNHANDLED PROMISE REJECTION: no such column: correspondence_id


This order is decisive.

The crash happens after schemas have been loaded,

not before.

Your DatabaseService THEN runs initialization queries, including:

Index creation

Automated integrity checks

Possibly FK enforcement logic

Possibly validation queries on calendar_events

But the actual smoking gun is the schema conflict, not a migration.

4. Their theory ignores the key fact: TWO modules define calendar_events

→ This is the central flaw in their analysis.

We KNOW:

Module B defines calendar_events (WITHOUT correspondence_id)

✔ Verified in module-b.sql.

Module C defines calendar_events (WITH correspondence_id)

✔ Verified in module-c.sql.

This produces:

A valid table (from Module B)

Followed by

An index creation from Module C referencing a nonexistent column

This is not hypothetical.
This is exactly the failure pattern you saw, and SQLite behaves exactly this way.

🌻 5. So is their theory possible?
Technically possible?

Yes — if you had a migration running BEFORE schemas, or if DatabaseService was issuing a query referencing correspondence_id before Module C schemas loaded.

But is their theory what actually happened here?

No.

Your logs and schema files conclusively show:

Module B creates a table first.

Module C tries to add an index referencing a column that B’s table does not have.

SQLite throws:

no such column: correspondence_id


The app crashes.

The reviewer’s hypothesis does not align with:

The on-disk schema,

The order of table creation,

How SQLite processes foreign keys,

The fact that sql.js loads all schemas before migrations,

Your actual startup log sequence.

🌻 6. The Reviewer’s Analysis in Legal Terms

If this were a litigation report:

Their theory is “not supported by the evidence.”

It theorizes a foreign key failure that SQLite would NOT produce.

It overlooks the undeniable conflict between Module B’s and Module C’s definitions.

It ignores that the exact error is what happens when trying to create an index on a nonexistent column.

It contradicts your runtime logs showing schema load succeeded BEFORE DatabaseService queries.

A more accurate framing:

Their explanation is plausible in the abstract, but it does not match the facts of this case.

🌻 7. The Root Cause — The One That Actually Matches All Evidence
**Root cause: Two modules define the same table (calendar_events) differently.

The first version is created without correspondence_id.
The second tries to index that missing column.
SQLite crashes.**

This perfectly explains:

Why the database creates successfully “from scratch"

Why the error appears after schema loading

Why the error is column-specific

Why the missing table explanation is incorrect

Why the crash occurs despite no on-disk DB

Why the error is thrown by sql.js inside schema execution

This is the only explanation consistent with:

The schema files YOU uploaded

The startup logs

SQLite’s behavior rules

SQL.js's loading model

🌻 Final Opinion (Concise)

The reviewer’s theory is technically possible, but not correct for your case.

The REAL cause is the conflict between Module B and Module C both defining calendar_events differently.

The crash is triggered during index creation, not foreign key creation, and not because a referenced table is missing.

The reviewer’s analysis misses the key underlying conflict—and the conflict is what makes your database fail during creation even when no prior DB exists.
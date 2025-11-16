// DATABASE DIAGNOSTIC SCRIPT
// Run this with: node diagnose-database.js

const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

async function diagnoseDatabase() {
  console.log('🔍 DATABASE DIAGNOSTIC STARTING...\n');
  
  // Find database file
  const possiblePaths = [
    './database/suite.db',
    './electron/database/suite.db',
    './suite.db'
  ];
  
  let dbPath = null;
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      dbPath = p;
      break;
    }
  }
  
  if (!dbPath) {
    console.log('❌ No database file found at:');
    possiblePaths.forEach(p => console.log(`   - ${p}`));
    console.log('\n💡 This might be okay if the database is created on first run.');
    return;
  }
  
  console.log(`✅ Found database: ${dbPath}\n`);
  
  // Load sql.js
  const SQL = await initSqlJs();
  const fileBuffer = fs.readFileSync(dbPath);
  const db = new SQL.Database(fileBuffer);
  
  // Check if calendar_events table exists
  console.log('📋 CHECKING CALENDAR_EVENTS TABLE...');
  try {
    const tables = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name='calendar_events'");
    
    if (tables.length === 0 || tables[0].values.length === 0) {
      console.log('❌ calendar_events table does NOT exist');
      console.log('   This is expected if you haven\'t run the app since Phase 3 changes.\n');
    } else {
      console.log('✅ calendar_events table exists');
      
      // Get column info
      const columns = db.exec("PRAGMA table_info(calendar_events)");
      console.log('\n📊 COLUMNS IN calendar_events:');
      if (columns.length > 0) {
        columns[0].values.forEach(row => {
          const [cid, name, type, notnull, dflt_value, pk] = row;
          console.log(`   - ${name} (${type})${pk ? ' [PRIMARY KEY]' : ''}`);
        });
      }
      
      // Check for correspondence_id specifically
      const hasCorrespondenceId = columns[0]?.values.some(row => row[1] === 'correspondence_id');
      if (hasCorrespondenceId) {
        console.log('\n✅ correspondence_id column EXISTS');
      } else {
        console.log('\n❌ correspondence_id column MISSING');
        console.log('   This is likely the cause of your startup error!');
      }
    }
  } catch (error) {
    console.log('❌ Error checking calendar_events:', error.message);
  }
  
  // Check tasks table for calendar_event_id
  console.log('\n📋 CHECKING TASKS TABLE...');
  try {
    const columns = db.exec("PRAGMA table_info(tasks)");
    if (columns.length > 0) {
      console.log('✅ tasks table exists');
      const hasCalendarEventId = columns[0]?.values.some(row => row[1] === 'calendar_event_id');
      if (hasCalendarEventId) {
        console.log('   ✅ calendar_event_id column exists');
      } else {
        console.log('   ❌ calendar_event_id column MISSING (added in Phase 3)');
      }
    }
  } catch (error) {
    console.log('❌ Error checking tasks:', error.message);
  }
  
  // Check correspondence_log table for calendar_event_id
  console.log('\n📋 CHECKING CORRESPONDENCE_LOG TABLE...');
  try {
    const columns = db.exec("PRAGMA table_info(correspondence_log)");
    if (columns.length > 0) {
      console.log('✅ correspondence_log table exists');
      const hasCalendarEventId = columns[0]?.values.some(row => row[1] === 'calendar_event_id');
      const hasFollowUp = columns[0]?.values.some(row => row[1] === 'follow_up');
      if (hasCalendarEventId) {
        console.log('   ✅ calendar_event_id column exists');
      } else {
        console.log('   ❌ calendar_event_id column MISSING (added in Phase 3)');
      }
      if (hasFollowUp) {
        console.log('   ✅ follow_up column exists');
      } else {
        console.log('   ⚠️  follow_up column MISSING (but this might be okay)');
      }
    }
  } catch (error) {
    console.log('❌ Error checking correspondence_log:', error.message);
  }
  
  // List all tables
  console.log('\n📚 ALL TABLES IN DATABASE:');
  try {
    const tables = db.exec("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
    if (tables.length > 0) {
      tables[0].values.forEach(row => {
        console.log(`   - ${row[0]}`);
      });
    }
  } catch (error) {
    console.log('❌ Error listing tables:', error.message);
  }
  
  console.log('\n✅ DIAGNOSTIC COMPLETE');
  
  db.close();
}

diagnoseDatabase().catch(error => {
  console.error('💥 Diagnostic failed:', error);
  process.exit(1);
});


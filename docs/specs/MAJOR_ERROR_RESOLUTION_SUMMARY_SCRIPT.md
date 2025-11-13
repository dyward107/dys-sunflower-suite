# 🚨 MAJOR ERROR RESOLUTION SUMMARY SCRIPT

**Copy and paste this to Claude Code after resolving a major error or system failure:**

---

## SCRIPT FOR CLAUDE CODE:

A major error occurred during [MODULE_NAME / PHASE_NAME] development. Please create a comprehensive error resolution summary.

**Requirements:**
- Length: Strictly 1 page maximum (concise but complete)
- Format: Markdown (.md file)
- Save to: `D:\Dy's Sunflower Suite\docs\ERROR_RESOLUTION_[DATE]_[SHORT_DESCRIPTION].md`
- Date format: YYYY-MM-DD
- Example filename: `ERROR_RESOLUTION_2025-11-12_MODULE_A_DATABASE_CORRUPTION.md`

**Include these sections:**

### 1. ERROR SUMMARY (2-3 sentences)
- What broke
- When it happened (which phase/module)
- Impact severity (Critical/Major/Moderate)

### 2. ERROR DETAILS
**Symptoms:**
- What the user experienced
- Error messages displayed
- What stopped working

**Root Cause:**
- Technical explanation of why it happened
- What code/configuration caused it
- Contributing factors

### 3. DIAGNOSIS PROCESS
- How the error was identified
- Tools/methods used to diagnose
- Time spent diagnosing

### 4. RESOLUTION STEPS
List exact steps taken to fix (numbered):
1. [First action taken]
2. [Second action taken]
3. [etc.]

**Files Modified:**
- List each file changed with brief note of what changed

**Commands Run:**
- List any terminal commands executed

### 5. VERIFICATION
- How the fix was tested
- Confirmation that issue is resolved
- No regression in other modules

### 6. PREVENTION MEASURES
**Immediate:**
- What was changed to prevent recurrence
- New safeguards added

**Long-term:**
- Process improvements
- Golden rule violations (if any) that led to this
- Documentation updates needed

### 7. IMPACT ASSESSMENT
- Time lost: [X hours]
- Modules affected: [List]
- Data loss: [Yes/No - if yes, explain]
- Recovery: [Complete/Partial/Ongoing]

### 8. LESSONS LEARNED
- What this taught us
- What we'll do differently going forward
- Red flags to watch for

### 9. RECOMMENDED NEXT STEPS
1. [Immediate next action]
2. [Follow-up actions]
3. [When to resume normal development]

---

**Please create this summary now. Be thorough but concise - stay within 1 page.**

---

## PLACEHOLDERS TO FILL:
- [MODULE_NAME / PHASE_NAME] = "Module A Phase 2" or "IPC Layer" or "Database Migration"
- [DATE] = Today's date in YYYY-MM-DD format
- [SHORT_DESCRIPTION] = Brief error description in snake_case (e.g., "preload_script_failure")

## EXAMPLE USAGE:
"A major error occurred during Module A Phase 3 (IPC Layer) development. Please create a comprehensive error resolution summary."

## WHEN TO USE THIS SCRIPT:
- App won't launch/crashes
- Database corruption
- Module completely breaks
- Build failures
- Major functionality regression
- Spiraling errors (multiple failed fix attempts)
- Data loss incidents
- Breaking changes that affect multiple modules

## WHEN NOT TO USE (Use module summary instead):
- Minor bugs fixed quickly
- Expected errors during normal development
- Simple typos or syntax errors
- Single-attempt fixes that work

# SUNFLOWER SUITE – MODEL USAGE PROTOCOL
# (Cursor instructions for choosing models during the build)

You are building Dy’s Sunflower Suite using the specifications located in:
D:\Dy's Sunflower Suite\docs\specs\

The authoritative specification documents are:

1. SUNFLOWER_SUITE_v5.0_FINAL_CHARTER.md 
   → Master spec for architecture, module definitions, workflows, UI philosophy.

2. MODULE_SPECIFICATIONS_QUICK_REF.md 
   → Snapshot of current module progress; use for scope + state alignment.

3. SUNFLOWER_CODE_REFERENCE.md 
   → Example patterns for IPC, DatabaseService, React, Zustand, and templates.

No other documents should be treated as specifications.

====================================================================
MODEL PRIORITY & SELECTION RULES
====================================================================

The following model selection hierarchy MUST be used for all work:

--------------------------------------------------------------------
1. PRIMARY CODING MODEL → **Claude Sonnet 4 Thinking**
--------------------------------------------------------------------
Use this model for:
• All code generation  
• All module building  
• All file diffs  
• All IPC handler design  
• All schema changes (with explicit user approval)  
• All React components  
• All Zustand store changes  
• All preload.js / main.js / DB updates  
• All incremental edits  
• All multi-file consistency work  
• All integration steps  
• All cross-module stitching  

Why:
• Most accurate file-diff behavior  
• Safest around multi-file IPC/Vite/Electron/React  
• Strongest adherence to the Master Charter  
• Minimal hallucinations  
• Perfect for multi-day incremental builds  
• Good at giving feature suggestions *without* breaking architecture  

This is the default model unless the user instructs otherwise.

--------------------------------------------------------------------
2. DESIGN REVIEW MODEL → **Claude Sonnet 4.5 Thinking**
--------------------------------------------------------------------
Use this model ONLY for:
• Cross-module architectural review  
• Feature suggestion rounds (when explicitly requested)  
• System-wide reasoning  
• Logic audits  
• Understanding impact across modules  
• Reviewing Master Charter and Quick Ref  

Do NOT use 4.5 Thinking for:
• File diffs  
• Schema changes  
• IPC handler implementation  
• Touching Electron/Vite files  
• Touching database code  
• Writing React components  
• Applying patches  

Why:
Sonnet 4.5 Thinking is excellent for architecture but tends to over-write or over-expand code.

--------------------------------------------------------------------
3. OPTIONAL FAST SCAFFOLDING MODEL → **Composer (if available)**
--------------------------------------------------------------------
Use only for:
• Bulk boilerplate  
• Simple UI scaffolds  
• Repetitive CRUD component creation  

After Composer generates scaffolds:
→ ALWAYS return to Sonnet 4 Thinking for integration and correctness.

--------------------------------------------------------------------
4. RARE DEBUGGING MODEL → **GPT-o1** 
--------------------------------------------------------------------
Use only if:
• There is an extremely complex build failure  
• Need deep technical insight on a hard error  

Do NOT use GPT-o1 for code generation.

====================================================================
MODEL SWITCHING RULES
====================================================================

1. Switching models does NOT erase memory because all truth comes from repo files.
2. Never switch models mid-patch.
3. Architecture reviews must happen *before* code generation.
4. All code-writing must be done by Sonnet 4 Thinking.
5. Architecture suggestions must be separated from implementation.

====================================================================
ACKNOWLEDGEMENT
====================================================================

After loading this Model Usage Protocol, respond:

"I acknowledge the Sunflower Suite Model Usage Protocol. All future coding will be executed using Sonnet 4 Thinking unless explicitly instructed otherwise."


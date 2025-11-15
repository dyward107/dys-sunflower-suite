TASK: Redesign Sunflower Suite UI for Higher Information Density
Overall Goal

Reduce the visual scale of the entire UI so significantly more content fits on a single screen. This includes shrinking paddings, margins, font sizes, card spacing, field heights, modal sizes, and overall layout. The new style should match high-volume defense practice needs where visibility of many items is more important than big UI aesthetics.

GLOBAL CHANGES YOU MUST APPLY

Apply these changes across all Module A & B components and any reused shared components:

1. Reduce Global Scaling

Set base Tailwind font size from text-base → text-sm.

Headings go from:

text-4xl → text-2xl

text-3xl → text-xl

text-2xl → text-lg

Body text should default to text-sm.

2. Reduce Vertical Padding Everywhere

Replace any of the following:

py-6 → py-3

py-4 → py-2

py-3 → py-1

py-2 → py-1

For horizontal padding:

px-6 → px-3

px-4 → px-2

3. Reduce Card Sizes & Spacing

For all cards:

Replace p-6 or p-5 → p-3

Replace rounded-xl → rounded-md

Replace shadow-lg → shadow-sm

Reduce internal spacing:

space-y-6 → space-y-3

gap-6 → gap-3

4. Shrink Form Fields

All <Input>, <Select>, <Textarea>, <Button> components should follow:

Height reduced from h-12 → h-9

Text size text-base → text-sm

Label spacing reduced:

Replace mb-2 → mb-1

Vertical spacing between inputs:

space-y-4 → space-y-2

5. Modal Layout Fixes

Your “Create Task” modal now needs to be:

Width: max-w-3xl instead of max-w-2xl

Reduced padding: p-6 → p-3

Form grid density doubled:

Replace grid-cols-2 gap-6 → grid-cols-3 gap-3

For smaller screens use grid-cols-1 gap-2

6. Task Cards

Reduce height by removing excessive padding.

Make lines tighter:

leading-relaxed → leading-tight

Compact the pills:

Replace px-3 py-1 rounded-full text-sm
→ px-2 py-0.5 rounded text-xs

7. Table Rows (Task List)

Reduce row height:

Replace py-4 → py-1.5

Compress columns:

Reduce max-widths

Reduce icon sizes by 25%

Shrink fonts to text-xs for all data columns

MODULE B — SPECIFIC REQUIRED FIXES
1. "Create New Task" Modal

You must modify this modal to be high-density:

Before (current):

Large padding

Huge form fields

Too much vertical spacing

Modal doesn’t stretch vertically

After (required):

Reduce padding (p-6 → p-3)

Expand width (max-w-3xl)

Allow 3-column layout:

<div className="grid grid-cols-3 gap-3">


Smaller inputs (h-9 text-sm)

Labels text-xs font-medium

Remove empty white space by tightening all paddings and gaps

2. Task Manager Page

Fix these elements:

Header Panel

Reduce all sizes by ~40%:

Replace large metrics cards with slim counters:

className="p-3 rounded-md text-sm"

Task List

Table rows py-1.5

Fonts text-xs

Icons scaled down using class:

className="w-3 h-3"

Card Layout

Decrease padding and spacing:

p-4 → p-2

gap-6 → gap-3

3. Timer Bar (Bottom Panel)

Shrink to avoid taking 1/5 of the viewport:

Height from h-20 → h-10

Font from text-xl → text-sm

Buttons from w-10 h-10 → w-7 h-7

4. Reduce Navigation Bar Height

Header bar: h-20 → h-14

Navigation button font: text-base → text-sm

Shrink icons by 30%
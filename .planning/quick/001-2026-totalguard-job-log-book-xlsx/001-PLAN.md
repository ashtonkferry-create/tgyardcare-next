---
phase: quick-001
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - scripts/build_job_log_book.py
  - TotalGuard_2026_Job_Log_Book.xlsx
autonomous: true

must_haves:
  truths:
    - "Opening the .xlsx shows a professional, branded job log with clear column headers"
    - "Every month (Jan-Dec 2026) has its own worksheet tab"
    - "Dropdowns work for crew, service type, payment method, and service area"
    - "Paid? column has a checkbox-style dropdown (YES/NO) with conditional formatting"
    - "Pay column is currency-formatted and each sheet has an auto-sum total row"
  artifacts:
    - path: "scripts/build_job_log_book.py"
      provides: "Python script to generate the xlsx"
    - path: "TotalGuard_2026_Job_Log_Book.xlsx"
      provides: "The finished spreadsheet"
  key_links: []
---

<objective>
Create a professional 2026 TotalGuard Job Log Book as an .xlsx file with 12 monthly tabs, data validation dropdowns, conditional formatting, and a clean premium layout.

Purpose: Give TotalGuard a polished manual job tracking system that works until Jobber API integration is built.
Output: A ready-to-use .xlsx file and the Python script that generates it.
</objective>

<execution_context>
@C:\Users\vance\.claude/get-shit-done/workflows/execute-plan.md
@C:\Users\vance\.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md

Current Google Sheets columns (to upgrade from):
A: Job # | B: Date | C: Who Did It | D: First and Last Name | E: Job | F: Address
G: Best Way To Contact | H: Things To Know (Payment Method) | I: Pay

Business services for dropdown:
Lawn Mowing, Fertilization, Aeration, Herbicide, Weeding, Mulching, Garden Bed Care,
Bush Trimming, Hardscaping, Spring Cleanup, Fall Cleanup, Leaf Removal,
Gutter Cleaning, Gutter Guard Installation, Snow Removal

Service areas for dropdown:
Madison, Middleton, Waunakee, Monona, Sun Prairie, Fitchburg, Verona,
McFarland, Cottage Grove, DeForest, Oregon, Stoughton

Crew members dropdown: Vance, Partner, Both
Payment methods: Cash, Check, Venmo, Zelle, Credit Card, Invoice
</context>

<tasks>

<task type="auto">
  <name>Task 1: Build the Python script to generate the 2026 Job Log Book</name>
  <files>scripts/build_job_log_book.py</files>
  <action>
Create a Python script using openpyxl that generates TotalGuard_2026_Job_Log_Book.xlsx.

STRUCTURE — 12 monthly tabs (January 2026 through December 2026) plus a "Summary" tab:

Each monthly sheet has these columns (A through L):
  A: Job #        — auto-incrementing per month (1, 2, 3...), center-aligned, narrow (8)
  B: Date         — date format MM/DD/YYYY, width 14
  C: Crew         — data validation dropdown: Vance, Partner, Both — width 12
  D: Customer     — free text (first and last name) — width 24
  E: Service      — data validation dropdown with all 15 services listed above — width 22
  F: Address      — free text — width 32
  G: City         — data validation dropdown with all 12 service areas — width 16
  H: Contact      — free text (phone or email) — width 22
  I: Payment Method — data validation dropdown: Cash, Check, Venmo, Zelle, Credit Card, Invoice — width 18
  J: Amount       — currency format $#,##0.00, right-aligned — width 14
  K: Paid?        — data validation dropdown: YES, NO — width 10
  L: Notes        — free text for special instructions — width 30

STYLING — premium but practical:
  - Header row (row 2): Dark forest green fill (#1B4332), white bold text, centered
  - Title row (row 1): Merge A1:L1, text "TOTALGUARD YARD CARE — [MONTH] 2026", font size 16, bold, dark green (#1B4332) text on light green (#D8F3DC) fill
  - Alternating row colors: white (#FFFFFF) and very light gray (#F8F9FA) for rows 3-102
  - Thin borders on all data cells (A2:L102)
  - Freeze panes at row 3 (so headers stay visible while scrolling)
  - Row 103: "TOTAL" label in column I (bold), SUM formula in column J for the month total
  - Column J total row: bold, currency format, medium green fill (#95D5B2)

CONDITIONAL FORMATTING:
  - Column K (Paid?): When cell = "YES" → green fill (#D4EDDA), when cell = "NO" → red fill (#F8D7DA)
  - Column J (Amount): When value > 0 → no special format (keep currency)

DATA VALIDATION — use openpyxl DataValidation with type="list":
  - Column C (Crew): "Vance,Partner,Both"
  - Column E (Service): all 15 services comma-separated
  - Column G (City): all 12 cities comma-separated
  - Column I (Payment Method): "Cash,Check,Venmo,Zelle,Credit Card,Invoice"
  - Column K (Paid?): "YES,NO"
  - Apply each validation to rows 3 through 102 on every monthly sheet

SUMMARY TAB:
  - Title row: "TOTALGUARD YARD CARE — 2026 ANNUAL SUMMARY"
  - Table with columns: Month | Total Jobs | Total Revenue | Paid | Unpaid
  - For each month row, use formulas referencing the monthly sheets:
    - Total Jobs: =COUNTA('January 2026'!A3:A102) (count non-empty job numbers)
    - Total Revenue: ='January 2026'!J103 (reference the monthly total)
    - Paid: =COUNTIF('January 2026'!K3:K102,"YES")
    - Unpaid: =COUNTIF('January 2026'!K3:K102,"NO")
  - Grand total row at bottom summing all months
  - Same premium styling: dark green header, alternating rows

PRINT SETUP on each sheet:
  - Landscape orientation
  - Fit to 1 page wide
  - Repeat header rows 1-2 on each printed page

The script should save to the workspace root as TotalGuard_2026_Job_Log_Book.xlsx.
  </action>
  <verify>Run `python scripts/build_job_log_book.py` — script exits 0 and creates TotalGuard_2026_Job_Log_Book.xlsx in the workspace root. File size should be > 20KB (not empty/corrupt).</verify>
  <done>TotalGuard_2026_Job_Log_Book.xlsx exists, opens without errors, has 13 tabs (12 months + Summary), all dropdowns and formatting are functional.</done>
</task>

<task type="auto">
  <name>Task 2: Run the script and verify the output</name>
  <files>TotalGuard_2026_Job_Log_Book.xlsx</files>
  <action>
Execute the Python script to generate the spreadsheet. Then verify the output by:
1. Running the script: `python scripts/build_job_log_book.py`
2. Checking the file exists and has reasonable size
3. Using a quick Python verification script to confirm:
   - 13 sheets exist (12 months + Summary)
   - Each monthly sheet has correct headers in row 2
   - Data validations are attached to the correct columns
   - The SUM formula exists in J103 on each monthly sheet
   - Summary tab has formulas referencing each monthly sheet
   - Conditional formatting rules exist on column K

Print a verification report to stdout confirming all checks pass.
If any check fails, fix the build script and re-run.
  </action>
  <verify>Verification script prints all checks passed. File size > 20KB. No Python errors.</verify>
  <done>TotalGuard_2026_Job_Log_Book.xlsx is generated, verified, and ready for use.</done>
</task>

</tasks>

<verification>
- [ ] Script runs without errors
- [ ] .xlsx file has 13 tabs with correct names
- [ ] All 5 dropdown validations work on every monthly sheet
- [ ] Conditional formatting on Paid? column (green YES, red NO)
- [ ] Currency formatting on Amount column
- [ ] Monthly totals via SUM formula
- [ ] Summary tab aggregates all months
- [ ] Professional styling: dark green headers, alternating rows, frozen panes
</verification>

<success_criteria>
TotalGuard_2026_Job_Log_Book.xlsx is a polished, professional spreadsheet that Vance can immediately start using to log jobs. All dropdowns, formatting, and formulas work in Excel/Google Sheets. The Summary tab provides at-a-glance annual metrics.
</success_criteria>

<output>
After completion, create `.planning/quick/001-2026-totalguard-job-log-book-xlsx/001-SUMMARY.md`
</output>

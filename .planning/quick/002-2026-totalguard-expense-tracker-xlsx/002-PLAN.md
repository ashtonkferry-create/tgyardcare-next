---
phase: quick-002
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - scripts/build_expense_tracker.py
  - TotalGuard_2026_Expense_Tracker.xlsx
autonomous: true

must_haves:
  truths:
    - "Opening the .xlsx shows 5 organized tabs — not everything crammed on one sheet"
    - "Entering an expense with category dropdown auto-tracks tax-deductible status"
    - "Mileage entries auto-calculate reimbursement at IRS $0.70/mile rate"
    - "Monthly Summary tab shows spending by category with YTD running totals"
    - "All existing expense data from the current Sheet1 is pre-populated"
  artifacts:
    - path: "scripts/build_expense_tracker.py"
      provides: "Python script to generate the xlsx"
    - path: "TotalGuard_2026_Expense_Tracker.xlsx"
      provides: "The finished expense tracker spreadsheet"
  key_links: []
---

<objective>
Create a professional 2026 TotalGuard Expense Tracker as an .xlsx file that replaces the current single-sheet mess with organized tabs, proper categorization, IRS mileage calculations, tax deduction tracking, and monthly/annual summaries.

Purpose: Give TotalGuard a clean expense tracking system for daily use and tax prep (Schedule C).
Output: A ready-to-use .xlsx file with existing data pre-populated, plus the Python generator script.
</objective>

<execution_context>
@C:\Users\vance\.claude/get-shit-done/workflows/execute-plan.md
@C:\Users\vance\.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@.planning/quick/001-2026-totalguard-job-log-book-xlsx/001-SUMMARY.md

Branding from Job Log Book (must match):
- Header fill: Dark forest green (#1B4332), white bold text
- Title fill: Light green (#D8F3DC) with dark green text
- Alternating rows: white (#FFFFFF) and light gray (#F8F9FA)
- Total/summary fills: Medium green (#95D5B2)
- Thin borders on all data cells
- Frozen panes below headers

EXISTING DATA TO PRE-POPULATE (from current Sheet1):

Equipment/Software purchases:
| Item | Cost | Date |
| Quo phone app | $19.59 | 1/10/26 |
| Quo phone app | $19.50 | 2/10/26 |
| Quo phone app | $22.01 | 3/11/26 |
| Lovable Website Builder | $15.00 | 1/10/26 |
| Lovable Website Builder | $12.50 | 1/20/26 |
| Lovable Website Builder | $30.00 | 2/1/26 |
| Lovable Website Builder | $13.00 | 2/15/26 |
| Claude Code | $100.00 | 2/1/26 |
| Chat subscription | $20.00 | 2/1/26 |
| Brevo marketing | $9.00 | 2/1/26 |
| n8n | $24.00 | 2/1/26 |
| Jobber Subscription | $49.00 | 3/1/26 |
| Pearson VUE exam | $45.00 | 1/15/26 |
| License application fee | $45.00 | 1/15/26 |
| Reviews $5/per | $45.00 | 2/1/26 |
| Pekin Liability Insurance | $86.00 | 1/20/26 |
| Porkbun Domains | $22.00 | 1/10/26 |
| Twilio | $20.00 | 2/1/26 |
| Monitor | $105.00 | 1/25/26 |
| Trailer 5x10 | $1,582.00 | 2/20/26 |
| Trailer Hooks | $40.00 | 2/25/26 |
| Yard Signs | $398.00 | 3/1/26 |

Gas purchases:
| Cost | Date | For |
| $35.00 | 1/1/26 | Car |
| $22.00 | 1/15/26 | Car |
| $30.00 | 1/28/26 | Car |
| $44.00 | 2/1/26 | Car |
| $28.00 | 2/10/26 | Car |
| $35.00 | 2/20/26 | Car |
| $33.00 | 3/1/26 | Car |
| $40.00 | 3/5/26 | Car |
| $25.00 | 3/11/26 | Car |

IRS 2026 standard mileage rate: $0.70/mile
</context>

<tasks>

<task type="auto">
  <name>Task 1: Build the Python script to generate the 2026 Expense Tracker</name>
  <files>scripts/build_expense_tracker.py</files>
  <action>
Create a Python script using openpyxl that generates TotalGuard_2026_Expense_Tracker.xlsx.

STRUCTURE — 5 tabs:

===== TAB 1: "Expenses" (main expense log) =====
Title row (row 1): Merge A1:K1, "TOTALGUARD YARD CARE — 2026 EXPENSE TRACKER", font 16 bold, dark green text on light green fill.
Header row (row 2): Dark green fill (#1B4332), white bold text, centered.

Columns (A through K):
  A: # — auto-incrementing (1, 2, 3...), center, width 6
  B: Date — MM/DD/YYYY format, width 14
  C: Category — data validation dropdown (see list below), width 20
  D: Vendor/Description — free text, width 30
  E: Amount — currency $#,##0.00, right-aligned, width 14
  F: Payment Method — dropdown: Cash, Check, Venmo, Zelle, Credit Card, Debit Card, ACH/Bank, width 16
  G: Recurring? — dropdown: One-Time, Monthly, Annual, width 14
  H: Tax Deductible? — dropdown: Yes, No, width 16
  I: Schedule C Category — dropdown (see IRS list below), width 24
  J: Receipt? — dropdown: Yes, No, N/A, width 10
  K: Notes — free text, width 28

Category dropdown values:
  Software/SaaS, Equipment, Vehicle/Gas, Vehicle/Maintenance, Insurance, Licensing/Permits, Marketing/Advertising, Office Supplies, Phone/Communications, Professional Services, Subcontractors, Training/Education, Travel, Meals (50%), Repairs/Maintenance, Uniforms/Safety, Other

Schedule C Category dropdown values (IRS line items):
  Line 8 - Advertising, Line 10 - Car/Truck Expenses, Line 15 - Insurance, Line 17 - Legal/Professional, Line 18 - Office Expense, Line 20a - Rent (Vehicles/Equipment), Line 22 - Supplies, Line 24a - Travel, Line 24b - Meals, Line 25 - Utilities, Line 27a - Other Expenses

Conditional formatting on column H (Tax Deductible?):
  - "Yes" = light green fill (#D4EDDA)
  - "No" = light red fill (#F8D7DA)

Data rows: 3 through 502 (500 expense capacity)
Alternating row colors (white / #F8F9FA)
Thin borders on A2:K502
Freeze panes at row 3

Row 503: "TOTAL" label in column D (bold), SUM formula in column E, bold currency, medium green fill (#95D5B2)

PRE-POPULATE existing equipment/software data into rows 3+ with correct categories:
  - Quo phone app entries -> Category: "Phone/Communications", Schedule C: "Line 25 - Utilities", Recurring: Monthly, Tax Deductible: Yes
  - Lovable Website Builder -> Category: "Software/SaaS", Schedule C: "Line 27a - Other Expenses", Recurring: Monthly, Tax Deductible: Yes
  - Claude Code -> Category: "Software/SaaS", Schedule C: "Line 27a - Other Expenses", Recurring: Monthly, Tax Deductible: Yes
  - Chat subscription -> Category: "Software/SaaS", Schedule C: "Line 27a - Other Expenses", Recurring: Monthly, Tax Deductible: Yes
  - Brevo marketing -> Category: "Software/SaaS", Schedule C: "Line 8 - Advertising", Recurring: Monthly, Tax Deductible: Yes
  - n8n -> Category: "Software/SaaS", Schedule C: "Line 27a - Other Expenses", Recurring: Monthly, Tax Deductible: Yes
  - Jobber Subscription -> Category: "Software/SaaS", Schedule C: "Line 27a - Other Expenses", Recurring: Monthly, Tax Deductible: Yes
  - Pearson VUE exam -> Category: "Training/Education", Schedule C: "Line 27a - Other Expenses", Recurring: One-Time, Tax Deductible: Yes
  - License application fee -> Category: "Licensing/Permits", Schedule C: "Line 27a - Other Expenses", Recurring: One-Time, Tax Deductible: Yes
  - Reviews -> Category: "Marketing/Advertising", Schedule C: "Line 8 - Advertising", Recurring: One-Time, Tax Deductible: Yes
  - Pekin Liability Insurance -> Category: "Insurance", Schedule C: "Line 15 - Insurance", Recurring: Annual, Tax Deductible: Yes
  - Porkbun Domains -> Category: "Software/SaaS", Schedule C: "Line 27a - Other Expenses", Recurring: Annual, Tax Deductible: Yes
  - Twilio -> Category: "Phone/Communications", Schedule C: "Line 25 - Utilities", Recurring: Monthly, Tax Deductible: Yes
  - Monitor -> Category: "Equipment", Schedule C: "Line 22 - Supplies", Recurring: One-Time, Tax Deductible: Yes
  - Trailer 5x10 -> Category: "Equipment", Schedule C: "Line 22 - Supplies", Recurring: One-Time, Tax Deductible: Yes
  - Trailer Hooks -> Category: "Equipment", Schedule C: "Line 22 - Supplies", Recurring: One-Time, Tax Deductible: Yes
  - Yard Signs -> Category: "Marketing/Advertising", Schedule C: "Line 8 - Advertising", Recurring: One-Time, Tax Deductible: Yes

  Set Receipt? to "No" for all pre-populated rows (user can update).
  Sort pre-populated entries by date ascending.

===== TAB 2: "Gas & Fuel" (dedicated vehicle fuel tracker) =====
Title row (row 1): "TOTALGUARD YARD CARE — 2026 GAS & FUEL LOG"
Header row (row 2): Same dark green styling.

Columns (A through H):
  A: # — auto-increment, center, width 6
  B: Date — MM/DD/YYYY, width 14
  C: Vehicle — dropdown: Car, Truck, Trailer, width 12
  D: Gallons — number format #0.000, width 10
  E: Price/Gal — currency $#0.000, width 12
  F: Total Cost — currency $#,##0.00, width 14
  G: Odometer — number format #,##0, width 12
  H: Notes — free text, width 24

Data rows: 3-202 (200 fuel entries)
Row 203: TOTAL label in E, SUM in F
Alternating rows, borders, freeze panes — same styling.

PRE-POPULATE existing gas data (leave Gallons, Price/Gal, Odometer blank since not tracked):
  All 9 gas entries with Vehicle: "Car", Total Cost filled in.

===== TAB 3: "Mileage" (IRS mileage tracking) =====
Title row (row 1): "TOTALGUARD YARD CARE — 2026 MILEAGE LOG"
Header row (row 2): Same styling.

Columns (A through H):
  A: # — auto-increment, width 6
  B: Date — MM/DD/YYYY, width 14
  C: Purpose — dropdown: Client Visit, Estimate, Supply Run, Job Site, Equipment Pickup, Bank/Admin, Other, width 18
  D: From — free text, width 22
  E: To — free text, width 22
  F: Start Miles — number #,##0.0, width 12
  G: End Miles — number #,##0.0, width 12
  H: Miles Driven — formula =G{row}-F{row}, number #,##0.1, width 14
  I: Deduction — formula =H{row}*0.70, currency $#,##0.00, width 14

Data rows: 3-302 (300 trip entries)
Row 303: TOTAL label in G, SUM in H (total miles), SUM in I (total deduction)
Note below totals row (row 305): "IRS Standard Mileage Rate 2026: $0.70/mile" — italic, dark green text

Alternating rows, borders, freeze panes.

===== TAB 4: "Monthly Summary" =====
Title row (row 1): "TOTALGUARD YARD CARE — 2026 MONTHLY EXPENSE SUMMARY"
Header row (row 2): Same styling.

Columns (A through G):
  A: Month — pre-filled January through December, width 14
  B: General Expenses — formula pulling monthly subtotals from Expenses tab using SUMPRODUCT matching month of date column, width 18
  C: Gas & Fuel — formula pulling monthly subtotals from Gas & Fuel tab, width 14
  D: Mileage Deduction — formula pulling monthly subtotals from Mileage tab, width 18
  E: Total Spent — formula =B+C for each row, width 14
  F: Total Deductions — formula =B+C+D (all tax deductible expenses + mileage), width 18
  G: YTD Total — running cumulative SUM of column E, width 14

Data rows: 3-14 (one per month)
Row 15: "ANNUAL TOTAL" — bold, SUM of each column
Row 16: blank
Row 17: "Estimated Tax Savings (25%)" label in E, =F15*0.25 in F — shows estimated tax savings

Use SUMPRODUCT formulas with MONTH() function to pull data:
  For column B: =SUMPRODUCT((MONTH(Expenses!B$3:B$502)=ROW()-2)*(Expenses!E$3:E$502))
  Adjust the month number (1 for Jan in row 3, 2 for Feb in row 4, etc.)
  Similar pattern for Gas & Fuel and Mileage tabs.

Alternating rows, medium green fill on annual total row.

===== TAB 5: "Tax Summary" =====
Title row (row 1): "TOTALGUARD YARD CARE — 2026 SCHEDULE C TAX SUMMARY"
Header row (row 2): Same styling.

Columns (A through C):
  A: Schedule C Line — pre-filled with all Schedule C categories from the dropdown, width 30
  B: Total Amount — SUMPRODUCT formula matching Schedule C Category from Expenses tab, width 16
  C: % of Total — formula =B{row}/B{total_row}, percentage format, width 12

Pre-fill rows 3-13 with the 11 Schedule C line items.
Row 14: Add "Vehicle Mileage Deduction" — pulls total from Mileage tab column I
Row 15: blank
Row 16: "TOTAL DEDUCTIONS" — SUM of column B, bold, medium green fill
Row 17: blank
Row 18: "Note: Consult a tax professional. This is for tracking only." — italic, small font

PRINT SETUP on each sheet:
  - Landscape orientation
  - Fit to 1 page wide
  - Repeat header rows 1-2

Save to workspace root as TotalGuard_2026_Expense_Tracker.xlsx.
  </action>
  <verify>Run `python scripts/build_expense_tracker.py` — exits 0 and creates TotalGuard_2026_Expense_Tracker.xlsx. File size > 30KB.</verify>
  <done>Script generates the .xlsx with all 5 tabs, all dropdowns, all formulas, pre-populated data, and matching branding.</done>
</task>

<task type="auto">
  <name>Task 2: Run the script and verify all tabs, formulas, and data</name>
  <files>TotalGuard_2026_Expense_Tracker.xlsx</files>
  <action>
Execute the build script, then write and run a verification script that confirms:

1. File exists and size > 30KB
2. Exactly 5 sheets: "Expenses", "Gas & Fuel", "Mileage", "Monthly Summary", "Tax Summary"
3. Expenses tab:
   - Headers in row 2 match expected columns (A through K)
   - Data validations attached to columns C, F, G, H, I, J (6 dropdowns)
   - Pre-populated data: count rows with data >= 22 (all existing expenses)
   - SUM formula in E503
   - Conditional formatting rules on column H (2 rules)
   - First data entry date is 1/10/26 (sorted by date)
4. Gas & Fuel tab:
   - Headers correct
   - Pre-populated: 9 gas entries
   - SUM formula in F203
   - Vehicle dropdown on column C
5. Mileage tab:
   - Miles Driven formula (=G-F) in column H
   - Deduction formula (=H*0.70) in column I
   - Purpose dropdown on column C
   - SUM formulas in H303 and I303
6. Monthly Summary tab:
   - 12 month rows pre-filled
   - SUMPRODUCT formulas in columns B, C, D
   - Annual total row with SUMs
   - Tax savings estimate in row 17
7. Tax Summary tab:
   - 11 Schedule C line items + Vehicle Mileage Deduction
   - SUMPRODUCT formulas in column B
   - Total deductions row

Print verification report. If any check fails, fix the build script and re-run.
  </action>
  <verify>All verification checks pass. File opens without errors. Pre-populated data totals match expected sum (~$2,781.60 for expenses + ~$292.00 for gas).</verify>
  <done>TotalGuard_2026_Expense_Tracker.xlsx is verified, all formulas work, all data pre-populated, ready for daily use.</done>
</task>

</tasks>

<verification>
- [ ] Script runs without errors
- [ ] .xlsx has exactly 5 tabs with correct names
- [ ] All dropdowns work (Category, Payment Method, Recurring, Tax Deductible, Schedule C, Receipt, Vehicle, Purpose)
- [ ] Conditional formatting on Tax Deductible column (green Yes, red No)
- [ ] All 22 existing expense entries pre-populated with correct categories
- [ ] All 9 gas entries pre-populated
- [ ] Mileage tab calculates deduction at $0.70/mile
- [ ] Monthly Summary aggregates from all tabs via SUMPRODUCT
- [ ] Tax Summary groups expenses by Schedule C line items
- [ ] Branding matches Job Log Book (dark green headers, alternating rows, frozen panes)
- [ ] Print setup configured on all tabs
</verification>

<success_criteria>
TotalGuard_2026_Expense_Tracker.xlsx is a polished, professional expense tracking system that replaces the current single-sheet setup. All existing data is pre-populated with proper categorization. The Monthly Summary and Tax Summary tabs provide instant visibility into spending and tax deductions. Dropdowns enforce consistent data entry. The spreadsheet is ready for daily use and year-end tax prep.
</success_criteria>

<output>
After completion, create `.planning/quick/002-2026-totalguard-expense-tracker-xlsx/002-SUMMARY.md`
</output>

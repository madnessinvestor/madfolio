# Investment Dashboard Design Guidelines

## Design Approach

**Design System**: Material Design 3 with adaptations for financial data visualization, drawing inspiration from modern fintech platforms like Robinhood and Coinbase for their clean, data-focused interfaces.

**Core Principle**: Information clarity and data hierarchy are paramount. Every element serves the purpose of helping users quickly understand their investment performance and make informed decisions.

---

## Typography System

**Font Family**: Inter (via Google Fonts CDN) - excellent for data-heavy interfaces with strong numeric legibility

**Type Scale**:
- Page Titles: text-3xl font-bold (36px)
- Section Headers: text-xl font-semibold (20px)
- Card Titles: text-lg font-medium (18px)
- Body Text: text-base font-normal (16px)
- Data Labels: text-sm font-medium (14px)
- Metric Values: text-2xl font-bold for primary metrics, text-lg font-semibold for secondary
- Small Text/Captions: text-xs (12px)

**Numbers**: Use tabular-nums utility class for all numeric data to ensure proper alignment in tables and lists.

---

## Layout System

**Spacing Primitives**: Tailwind units of 2, 4, 6, 8, 12, 16 (p-2, m-4, gap-6, h-8, py-12, mb-16)

**Grid Structure**:
- Dashboard container: max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
- Main content grid: 12-column responsive grid
- Card spacing: gap-6 between cards
- Section padding: py-8 lg:py-12

**Layout Patterns**:
- Top navigation/header: Fixed, full-width
- Main dashboard: 3-column grid on desktop (lg:grid-cols-3), 1 column on mobile
- Metrics overview: 4 cards in row on desktop (lg:grid-cols-4), stack on mobile
- Charts section: 2-column on desktop (lg:grid-cols-2), single column on mobile
- Tables: Full-width within container

---

## Component Library

### Navigation
- Top bar with logo/title, navigation items, user profile
- Height: h-16
- Sticky positioning: sticky top-0 z-50
- Icons: Heroicons (outline style via CDN)

### Metric Cards
- Rounded corners: rounded-lg
- Padding: p-6
- Shadow: shadow-sm with hover:shadow-md transition
- Structure: Label (top), Large value (center), Change indicator with icon (bottom)
- Change indicators: Use up/down arrows from Heroicons

### Data Tables
- Striped rows for readability
- Header row: font-semibold text-sm
- Cell padding: px-6 py-4
- Hover state on rows: transition effect
- Right-align numeric columns
- Action buttons: Icon buttons (edit/delete) right-aligned

### Charts
- Use Chart.js library (via CDN)
- Container padding: p-6
- Chart types: Pie/Doughnut for allocation, Line for performance over time, Bar for comparisons
- Minimum height: h-80 for chart containers
- Responsive: Maintain aspect ratio across screen sizes

### Input Forms
- Form containers: Rounded cards with p-6
- Input groups: space-y-4
- Labels: text-sm font-medium mb-2
- Input fields: rounded-md border px-4 py-2 w-full
- Buttons: Primary (solid), Secondary (outline), full px-6 py-2.5
- Button spacing: gap-3 for button groups

### Portfolio Overview Cards
- Large cards: p-8 rounded-xl shadow-md
- Split layout: Left side for primary metric, right side for mini chart or breakdown
- Metric display: Value stacked above label

### Transaction History
- Card-based list on mobile: space-y-3
- Table view on desktop
- Each transaction: Date, Asset, Type, Amount, Price, Total
- Filter/sort controls at top: flex justify-between items-center mb-6

---

## Page Structure

### Dashboard Home
**Layout**: 
1. Header (sticky top bar)
2. Portfolio Summary (4 metric cards in row)
3. Allocation Charts (2 columns: Crypto pie chart, Traditional market pie chart)
4. Performance Overview (Line chart, full width)
5. Recent Transactions (Table/list, full width)

### Portfolio Detail Views
**Crypto Portfolio**:
- Holdings table with: Asset, Amount, Current Price, Total Value, 24h Change, 7d Change
- Individual asset cards on mobile
- Add Position button (top right)

**Traditional Market Portfolio**:
- Holdings table with: Symbol, Company, Shares, Price, Total Value, Day Change, Total Return
- Sector breakdown chart
- Add Position button (top right)

### Add/Edit Forms
- Modal overlay or dedicated page
- Form width: max-w-md mx-auto
- Fields: Asset selection (dropdown), Amount, Purchase Price, Purchase Date, Notes (optional)
- Action buttons at bottom: Cancel (secondary), Save (primary)

---

## Icons

**Library**: Heroicons (outline style via CDN)

**Key Icons**:
- TrendingUp/TrendingDown: Performance indicators
- ChartPie: Portfolio allocation
- Plus: Add position
- PencilSquare: Edit
- Trash: Delete
- ArrowPath: Refresh/sync
- Cog: Settings

---

## Responsive Breakpoints

- Mobile: base (< 640px) - Single column, stacked cards
- Tablet: sm/md (640px - 1024px) - 2-column grids where appropriate
- Desktop: lg+ (1024px+) - Full multi-column layouts

**Mobile Optimizations**:
- Convert tables to card-based lists
- Stack metric cards vertically
- Reduce padding: p-4 instead of p-6
- Simplify charts: Show key data only

---

## Animations

**Minimal Motion**:
- Card hover: subtle shadow transition (transition-shadow duration-200)
- Number changes: CountUp.js for metric animations (subtle)
- Page transitions: None
- Chart animations: Default Chart.js animations (fast duration)

---

## Accessibility

- All interactive elements keyboard accessible
- Proper semantic HTML (table, nav, main, section)
- ARIA labels for icon-only buttons
- Focus states: ring-2 ring-offset-2 on focus
- Sufficient contrast ratios for all text
- Screen reader text for icons and charts
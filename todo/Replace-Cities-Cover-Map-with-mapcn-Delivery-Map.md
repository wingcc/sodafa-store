# Replace the Existing Cities Coverage map with mapcn

I have an existing **Shopping Page inside the Dashboard**.

Inside the Shopping Page, there is a **Settings section**, and inside Settings there is a **Cities page**.

The Cities page already contains a **Cover Map / Map area**.

I want to **replace and upgrade that existing Cover Map** using **mapcn + MapLibre**, while keeping the existing Cities page, layout, navigation, and overall Dashboard architecture.

This is an integration task, **not a request to create a new page**.

---

## Official mapcn Documentation

Use the official documentation as the primary technical reference:

- Installation:\
  [https://www.mapcn.dev/docs/installation](https://www.mapcn.dev/docs/installation)

- API Reference:\
  [https://www.mapcn.dev/docs/api-reference](https://www.mapcn.dev/docs/api-reference)

- Markers:\
  [https://www.mapcn.dev/docs/markers](https://www.mapcn.dev/docs/markers)

- Popups:\
  [https://www.mapcn.dev/docs/popups](https://www.mapcn.dev/docs/popups)

- GeoJSON:\
  [https://www.mapcn.dev/docs/geojson](https://www.mapcn.dev/docs/geojson)

- Controls:\
  [https://www.mapcn.dev/docs/controls](https://www.mapcn.dev/docs/controls)

- Advanced Usage:\
  [https://www.mapcn.dev/docs/advanced-usage](https://www.mapcn.dev/docs/advanced-usage)

---

# 1. First Inspect the Existing Project

Before modifying anything, inspect the existing project and locate:

- Dashboard
- Shopping Page
- Settings section
- Cities page
- Existing Cities Cover Map
- Existing city data
- Existing city CRUD functionality
- Existing Supabase integration
- Existing database types
- Existing UI components
- Existing Tailwind/shadcn configuration

Understand how the current Cities page works before changing the map.

**Do not create a second Cities page.**

**Do not create a second Settings page.**

**Do not create a second Shopping page.**

The existing Cities page remains the source of truth.

---

# 2. Replace Only the Existing Cover Map

The main objective is:

```text
Shopping
  └── Settings
       └── Cities
            └── Existing Cover Map
                 ↓
            Replace with mapcn
```

Keep everything else on the Cities page unchanged unless integration requires a small adjustment.

The existing:

- Header
- Navigation
- Page structure
- City management
- Add City functionality
- Edit City functionality
- Delete City functionality
- Tables
- Forms
- Filters
- Buttons
- Permissions

must continue to work.

---

# 3. Install mapcn Using npm

The project uses npm.

First check whether Tailwind CSS and shadcn/ui are already installed.

If they already exist, do not reinstall them.

Install mapcn using the official installation method:

```bash
npx shadcn@latest add @mapcn/map
```

According to the official documentation, this adds the map component and installs `maplibre-gl`.

Reference:

[https://www.mapcn.dev/docs/installation](https://www.mapcn.dev/docs/installation)

Do not introduce another mapping library.

Do not use Google Maps, Leaflet, Mapbox, or another map framework.

Use:

**mapcn + MapLibre GL**

---

# 4. Preserve the Existing Map Container

The existing Cover Map has an established position and design.

Keep its:

- Location on the page
- Dimensions
- Border radius
- Card/container structure
- Spacing
- Responsive behavior
- Existing visual style

Only replace the underlying map implementation.

The result should look like an upgraded version of the existing Cities Cover Map, not like a completely unrelated component.

---

# 5. Cities on the Map

Every city already managed by the Cities page should be represented on the map.

Use the existing city data.

Each city should have at minimum:

```text
id
name
latitude
longitude
zoneId
```

If the existing database uses different field names, adapt to the existing schema instead of creating duplicate fields unnecessarily.

Do not create fake city data.

---

# 6. City Markers

Use mapcn's:

```text
MapMarker
MarkerContent
MarkerTooltip
MarkerPopup
```

for city visualization.

Official reference:

[https://www.mapcn.dev/docs/markers](https://www.mapcn.dev/docs/markers)

Each city should have an interactive marker.

Hover:

```text
Casablanca
```

Click:

Display a detailed popup.

The marker design should match the existing Dashboard design system.

---

# 7. City Popup

When clicking a city, show useful information.

Example:

```text
Casablanca

Orders
1,284

Delivered
982

Processing
126

Pending
94

Cancelled
82

Delivery

Express
742

Standard
542

Zone
Ground Casablanca
```

However, **do not use hard-coded values**.

All statistics must come from the actual application/database data.

If the current database does not yet contain order statistics for cities, use the existing city data and clearly identify what additional data is required.

---

# 8. Zones

The delivery system uses geographic zones.

For example:

```text
Ground Casablanca
 ├── Casablanca
 ├── Mohammedia
 └── Berrechid
```

A Zone should be represented visually as a geographic area on the map.

Do not represent the zone only as text.

Use **GeoJSON** and mapcn's GeoJSON functionality to render zone boundaries.

Reference:

[https://www.mapcn.dev/docs/geojson](https://www.mapcn.dev/docs/geojson)

Each zone should visually surround the cities belonging to it.

---

# 9. Zone Interaction

When the user clicks a zone, show a zone popup or information panel.

Example:

```text
Ground Casablanca

Cities
3

Total Orders
2,841

Express
1,632

Standard
1,209

Delivered
2,104

Pending
421

Cancelled
316
```

Again, all values must come from real application data.

---

# 10. Zone Colors

Zones should support data-driven colors.

For example:

```text
Low activity
Medium activity
High activity
Critical activity
```

The exact colors should follow the existing Dashboard design system.

Do not introduce random colors.

The color should communicate useful information such as:

- Order volume
- Delivery activity
- Operational status

Prefer a clear visual hierarchy.

---

# 11. City Order Visualization

City markers should also communicate order activity.

For example:

```text
Low orders
Medium orders
High orders
Very high orders
```

The marker can change:

- Size
- Intensity
- Badge
- Label

based on real order volume.

Do not make the visualization unnecessarily complicated.

The user should be able to understand the map immediately.

---

# 12. Delivery Type

Support the existing delivery types:

```text
Standard Delivery
Express Delivery
```

The Cities map should be able to filter the displayed information.

Example:

```text
[ All ]
[ Standard ]
[ Express ]
```

When Express is selected:

- City statistics update.
- Zone statistics update.
- Marker visualization updates.
- Relevant map information updates.

When Standard is selected, the same behavior applies.

---

# 13. Order Status

If the existing order system contains statuses, support:

```text
All
Pending
Processing
Delivered
Cancelled
```

Filtering should update the map consistently.

Do not duplicate filtering logic across multiple components.

Create a reusable filtering/data transformation layer.

---

# 14. Zone and City Filters

Where appropriate, provide:

```text
Zone
City
Delivery Type
Order Status
```

filters.

Example:

```text
[ All Zones ▼ ]
[ All Cities ▼ ]
[ All Delivery Types ▼ ]
[ All Statuses ▼ ]
```

Do not overcrowd the existing Cities page.

The controls should fit naturally into the existing UI.

---

# 15. Use Existing Database Data

The existing Cities page already has a database structure.

Use the existing Supabase client and existing data access layer.

Do not create another Supabase client.

Do not duplicate the database.

Do not create fake production data.

Inspect how cities are currently stored and how they relate to:

- Orders
- Zones
- Delivery types
- Order statuses

Reuse existing relationships whenever possible.

---

# 16. Geographic Coordinates

Inspect the existing City schema.

If cities already contain:

```text
latitude
longitude
```

use them directly.

If coordinates are stored differently, adapt the map data transformation layer.

If some cities do not have coordinates:

- Do not invent inaccurate coordinates.
- Clearly identify those records.
- Prevent invalid coordinates from breaking the map.

The map must gracefully handle missing geographic data.

---

# 17. Morocco Map

This is a Morocco-based delivery system.

The Cities Cover Map should initially show the relevant Moroccan delivery cities.

The viewport should automatically adapt to the available cities/zones.

Do not permanently hard-code Casablanca as the center.

If cities exist across Morocco, fit the map to the available geographic data.

---

# 18. Existing Cities CRUD

The map must remain synchronized with the Cities management functionality.

For example:

### Add City

When a new city is created and has valid coordinates:

```text
Database
   ↓
Cities list
   ↓
Map
   ↓
New marker
```

### Edit City

If the city coordinates change:

```text
Database
   ↓
City updated
   ↓
Marker moves
```

### Delete City

When a city is deleted:

```text
Database
   ↓
City removed
   ↓
Marker removed
```

Do not create a separate map-only city state that becomes inconsistent with the database.

---

# 19. Performance

Use `MapMarker` for the current city dataset if the number of cities is relatively small.

mapcn documentation notes that DOM-based markers are appropriate for smaller datasets, while larger datasets should use GeoJSON/layer-based rendering.

Reference:

[https://www.mapcn.dev/docs/markers](https://www.mapcn.dev/docs/markers)

If the number of cities grows significantly, use GeoJSON/layers rather than hundreds or thousands of DOM markers.

---

# 20. Map Controls

Use mapcn controls where appropriate:

- Zoom
- Navigation
- Reset/Fit Bounds
- Other useful map controls

Do not overload the map with unnecessary controls.

Reference:

[https://www.mapcn.dev/docs/controls](https://www.mapcn.dev/docs/controls)

---

# 21. Theme

The map must respect the existing Dashboard theme.

mapcn's default CARTO basemap supports light/dark themes.

Do not create a separate theme system.

The map should visually integrate with the existing Dashboard's:

- Light mode
- Dark mode
- Cards
- Borders
- Typography
- Colors

Reference:

[https://www.mapcn.dev/docs/installation](https://www.mapcn.dev/docs/installation)

---

# 22. Loading and Error States

The map must have proper states:

### Loading

Show a clean loading state while city/zone data is loading.

### Empty

If no cities exist:

```text
No cities available
```

### Missing Coordinates

If cities exist but geographic coordinates are missing:

```text
Some cities cannot be displayed because their coordinates are missing.
```

Do not crash the entire page.

### Error

Handle map/data errors gracefully.

---

# 23. Architecture

Keep the map modular.

Adapt the following architecture to the existing project rather than blindly creating duplicate files:

```text
Cities
├── CitiesPage
├── CitiesTable
├── CityForm
└── CitiesMap
      ├── CityMarkers
      ├── CityPopup
      ├── ZoneLayers
      ├── ZonePopup
      └── MapControls
```

The map should consume prepared data rather than contain complex database/business logic.

Recommended flow:

```text
Supabase
    ↓
Cities / Orders / Zones
    ↓
Data Transformation
    ↓
Map Data
    ↓
mapcn
    ↓
MapLibre
```

---

# 24. Important Integration Rule

Do **not** redesign the entire Cities page.

Do **not** create a new Dashboard page.

Do **not** create a new Settings page.

Do **not** duplicate the Cities data model.

Do **not** duplicate Supabase.

Do **not** introduce another map library.

Do **not** replace the existing UI design.

Only replace and enhance the existing **Cities Cover Map** using mapcn.

---

# 25. Final Result

The final Cities page should feel like this:

```text
Settings
   ↓
Cities

┌──────────────────────────────────────────────┐
│ Cities                                       │
│ Manage your delivery cities                  │
│                                              │
│ ┌──────────────────────────────────────────┐ │
│ │              DELIVERY MAP                │ │
│ │                                          │ │
│ │       ● Casablanca                       │ │
│ │          1,284                           │ │
│ │                                          │ │
│ │                    ● Mohammedia          │ │
│ │                                          │ │
│ │              ┌─────────────────┐         │ │
│ │              │ Ground          │         │ │
│ │              │ Casablanca      │         │ │
│ │              │                 │         │ │
│ │              │ Casablanca      │         │ │
│ │              │ Mohammedia      │         │ │
│ │              │ Berrechid       │         │ │
│ │              └─────────────────┘         │ │
│ │                                          │ │
│ └──────────────────────────────────────────┘ │
│                                              │
│ Cities Table                                 │
│ ...                                          │
└──────────────────────────────────────────────┘
```

The map is an **enhancement of the existing Cities Cover Map**, not a new feature/page architecture.

---

# 26. Final Validation

Before finishing, verify:

- mapcn installed correctly using npm/shadcn.
- MapLibre works correctly.
- Existing Cities page still works.
- Existing Cities CRUD still works.
- Existing Settings navigation still works.
- Existing Shopping page still works.
- City markers display correctly.
- City popups work.
- Zone boundaries render correctly.
- Zone interactions work.
- Real Supabase data is used.
- Delivery filters work.
- Status filters work.
- Map updates when city data changes.
- Missing coordinates are handled safely.
- Light/dark theme works.
- Responsive layout works.
- No duplicate Supabase client was created.
- No second map library was introduced.
- No unrelated Dashboard functionality was modified.
- No TypeScript errors.
- No console errors.
- Production build succeeds.

The final implementation must be clean, production-ready, and fully integrated into the **existing Settings → Cities → Cover Map** inside the Shopping page.

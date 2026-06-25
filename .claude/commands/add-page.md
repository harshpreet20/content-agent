# Add Page

Add a new page to the agent dashboard with consistent styling, nav integration, and auth protection.

**Usage:** `/add-page [page-name]: [what this page shows]`

Parse the arguments: `$ARGUMENTS`

If no arguments provided, ask for:
1. Page name (kebab-case, e.g., `settings`, `calendar`, `insights`)
2. What the page displays
3. Whether it needs data from an API endpoint

---

## Implementation Steps

### 1. Create the Page

Create `src/app/[page-name]/page.tsx`:

```tsx
"use client";

import { useState, useEffect } from "react";
import Nav from "@/components/Nav";

export default function PageName() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const res = await fetch("/api/[endpoint]");
      const json = await res.json();
      setData(json);
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Nav />
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-gray-900">Page Title</h1>
          <p className="text-sm text-gray-500 mt-1">Description of what this page shows</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-3 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Page content here */}
          </div>
        )}
      </main>
    </div>
  );
}
```

### 2. Add to Navigation

In `src/components/Nav.tsx`, add a link:

```tsx
{ href: "/[page-name]", label: "Page Name", icon: "EMOJI" }
```

### 3. Create API Endpoint (if needed)

Create `src/app/api/[endpoint]/route.ts` following the standard pattern.

### 4. Design Tokens Reference

Use these consistent styles across all pages:

**Layout:**
- Page bg: `bg-[#FAFAFA]`
- Content max width: `max-w-6xl mx-auto px-4`
- Section spacing: `space-y-6`

**Cards:**
```
bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6
```

**Section headers:**
```
text-lg font-bold text-gray-900 mb-4
```

**Stat callouts:**
```
<div className="bg-gradient-to-br from-violet-50 to-pink-50 rounded-xl p-4">
  <span className="text-2xl font-extrabold text-gray-900">42</span>
  <span className="text-xs text-gray-500 block">Label</span>
</div>
```

**Empty states:**
```
<div className="text-center py-16">
  <span className="text-4xl mb-3 block">EMOJI</span>
  <p className="text-sm text-gray-400">No data yet</p>
</div>
```

**Buttons:**
```
// Primary
className="px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition"

// Secondary
className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition"

// Danger
className="px-3 py-1.5 text-red-500 hover:bg-red-50 rounded-lg text-xs font-semibold transition"
```

**Tables:**
```
<table className="w-full">
  <thead>
    <tr className="border-b border-gray-100">
      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide py-3 px-4">Column</th>
    </tr>
  </thead>
  <tbody>
    <tr className="border-b border-gray-50 hover:bg-gray-50/50">
      <td className="py-3 px-4 text-sm text-gray-700">Value</td>
    </tr>
  </tbody>
</table>
```

**Charts (Recharts):**
```tsx
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

<div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
  <h3 className="text-sm font-bold text-gray-900 mb-4">Chart Title</h3>
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={chartData}>
      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
      <YAxis tick={{ fontSize: 11 }} />
      <Tooltip />
      <Bar dataKey="value" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
    </BarChart>
  </ResponsiveContainer>
</div>
```

### 5. Auth Protection

The page automatically inherits auth protection from `AuthProvider` in the root layout. If this page needs admin-only access:

```tsx
const { user, role } = useAuth();
if (role !== "admin") return <div>Access denied</div>;
```

### 6. Test

1. Navigate to the page in the browser
2. Verify it loads with the correct layout
3. Check mobile responsiveness
4. Verify nav link highlights correctly
5. Test loading and empty states

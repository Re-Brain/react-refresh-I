# React Learning Roadmap

## Current Project
Japan Race Horses card listing app built with React + Vite + Tailwind v4

---

## Stage 1 — Core React (Do these first)

### 1. useState
- Counter with increment, decrement, reset
- Toggle (show/hide, light/dark)
- **Project idea:** Add a favorite button on each horse card that turns yellow when clicked

### 2. useEffect
- Fetch data from an API on mount
- Show a loading spinner while waiting
- **Project idea:** Replace the static `horse.tsx` data file with a real API fetch

### 3. Conditional Rendering
- Show/hide elements based on state
- **Project idea:** Show "No results found" when search returns nothing

### 4. Lifting State Up
- Move state to a parent component and pass it down via props
- Pass functions as props (e.g. `onFavorite`)
- **Project idea:** Manage favorite state in `App.tsx` and pass handler down to `Card.tsx`

### 5. useContext
- Create a context to share state without prop drilling
- **Project idea:** Add a light/dark mode toggle that every component reads from context

---

## Stage 2 — Real Project Concepts

### 6. useReducer
- Like `useState` but for complex state logic
- Use when you have multiple related state updates

### 7. useMemo & useCallback
- `useMemo` — cache expensive calculations
- `useCallback` — prevent unnecessary re-renders
- Use with `React.memo` to skip re-rendering components when props haven't changed

### 8. React Router
- Navigate between pages without a full page reload
- **Must learn before Next.js** so you understand what problem it solves
- Key concepts: `<BrowserRouter>`, `<Routes>`, `<Route>`, `useNavigate`, `useParams`
- **Project idea:** Make each horse card link to its own detail page `/horses/deep-impact`

---

## Stage 3 — Production Skills (Learn in Next.js)

### 9. TanStack Query (React Query)
- The standard way to fetch, cache, and sync server data
- Replaces messy `useEffect` fetching
- Learn this when you start Next.js

### 10. React Hook Form
- Handling inputs, validation, and submission properly
- Every real app has forms

### 11. Zustand
- Simpler alternative to Redux for global state
- Pick up when you need it in a real project

---

## After React → Move to Next.js

| React | Next.js equivalent |
|---|---|
| React Router | File-based routing (`app/` folder) |
| `useEffect` fetch | Server Components + `fetch()` |
| Separate backend | API Routes (built-in) |
| Manual optimization | Automatic image, font, code optimization |

**Minimum before jumping to Next.js:**
- Finish Stages 1 and 2
- Understand React Router at least conceptually
- TanStack Query, Zustand — learn on the job in Next.js

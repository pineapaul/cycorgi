# useBackNavigation Hook

A custom React hook that provides intelligent back navigation functionality using the browser's history API with fallback options.

## Features

- **Smart Navigation**: Uses `window.history.back()` when browser history is available
- **Fallback Support**: Navigates to a specified fallback route when no history exists
- **Flexible Configuration**: Supports both `defaultRoute` and `fallbackRoute` options
- **TypeScript Support**: Fully typed with TypeScript interfaces

## Usage

### Basic Usage

```typescript
import { useBackNavigation } from '@/app/hooks/useBackNavigation'

function MyComponent() {
  const { goBack } = useBackNavigation()
  
  return (
    <button onClick={goBack}>
      Go Back
    </button>
  )
}
```

### With Fallback Route

```typescript
import { useBackNavigation } from '@/app/hooks/useBackNavigation'

function TreatmentPage() {
  const { goBack } = useBackNavigation({
    fallbackRoute: '/risk-management/register/RISK-001'
  })
  
  return (
    <button onClick={goBack}>
      Go Back
    </button>
  )
}
```

### With Default Route

```typescript
import { useBackNavigation } from '@/app/hooks/useBackNavigation'

function AssetPage() {
  const { goBack } = useBackNavigation({
    defaultRoute: '/inventory/information-assets'
  })
  
  return (
    <button onClick={goBack}>
      Go Back
    </button>
  )
}
```

## API

### Options

- `fallbackRoute?: string` - Route to navigate to when no browser history exists
- `defaultRoute?: string` - Alternative fallback route (used if `fallbackRoute` is not provided)

### Return Value

- `goBack: () => void` - Function to trigger back navigation

## Behavior

1. **With History**: If `window.history.length > 1`, uses `window.history.back()`
2. **Without History**: Navigates to `fallbackRoute` if provided
3. **No Fallback**: Navigates to `defaultRoute` if provided
4. **Last Resort**: Navigates to `/` (home) if no routes are specified

## Examples

### Risk Management Pages

```typescript
// Treatment details page
const { goBack } = useBackNavigation({
  fallbackRoute: `/risk-management/register/${riskId}`
})

// Risk details page
const { goBack } = useBackNavigation({
  fallbackRoute: '/risk-management/register'
})
```

### Inventory Pages

```typescript
// Asset details page
const { goBack } = useBackNavigation({
  fallbackRoute: '/inventory/information-assets'
})
```

## Benefits

- **User Experience**: Users return to where they actually came from
- **Consistency**: Works the same way across all pages
- **Reliability**: Always has a fallback option
- **Maintainability**: Centralized navigation logic 
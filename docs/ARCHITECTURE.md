# Architecture

## Folder structure (src/)

- `app/`: bootstrap, routing, app providers, app-level config
- `core/`: pure business logic (entities, value objects, policies, services, ports)
- `application/`: use cases and orchestration
- `infrastructure/`: concrete implementations (Firestore repositories/adapters, HTTP clients)
- `ui/`: React UI (pages, components, hooks, helpers)
- `shared/`: truly shared constants and types

## Rules (short)

- `core/` is pure: no React, no Firebase, no toast, no browser APIs.
- `application/` orchestrates and depends on `core/` ports.
- `infrastructure/` implements the `core/ports` contracts.
- `ui/` is thin: compose sections + call use cases/repositories, no Firestore SDK.
- Prefer `@/` alias for imports; avoid deep relative paths.

## Examples

- Policy: `src/core/policies/canUpdateApartment.js`
- Use case: `src/application/useCases/submitApartmentReport.js`
- Firestore repo: `src/infrastructure/firebase/repositories/FirestoreApartmentRepository.js`
- UI page: `src/ui/pages/Apartments.jsx`
- UI section: `src/ui/components/sections/apartmentsSection/filters/Filters.jsx`
- UI helper: `src/ui/helpers/apartmentUpdateToast.js`

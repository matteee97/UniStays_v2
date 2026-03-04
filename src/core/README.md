# Core Layer Conventions

`src/core` contains framework-agnostic business logic.

## Folder responsibilities
- `services/`: domain services and calculators (validation, aggregates, score logic).
- `valueObjects/`: immutable builders/normalizers for domain draft objects.
- `ports/`: interfaces/contracts for repositories and external dependencies.
- `policies/`: authorization/decision policies.
- `geo/`: pure geospatial domain utilities.
- `entities/`: entity definitions (when present).

## Namespace rules
- Canonical paths:
  - `@/core/services/*`
  - `@/core/valueObjects/*`
- Do not reintroduce `src/core/apartments`.
- Keep one implementation per business concept (no mirrored folders).

## Dependency direction
- `core/*` must not depend on UI/framework modules.
- Outer layers may depend on `core`, never the opposite.

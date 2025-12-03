
## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- pnpm 10+
- .NET Backend running on `https://localhost:7209`

### Installation

```bash
# Navigate to the frontend folder
cd cms-frontend

# Install dependencies
pnpm install

# Start the admin app (development)
pnpm start:admin

# Start the public app (development)
pnpm start:public

# Start both apps
pnpm start:all
```

### Development Commands

```bash
# Serve applications
pnpm nx serve admin          # Start admin on port 4200
pnpm nx serve public         # Start public on port 4201

# Build for production
pnpm build:admin             # Build admin app
pnpm build:public            # Build public app
pnpm build:all               # Build all apps

# Testing
pnpm nx test ui              # Test shared UI library
pnpm nx test admin           # Test admin app
pnpm test:all                # Run all tests

# Linting
pnpm lint:all                # Lint all projects
pnpm lint:fix                # Lint and fix issues

# Code formatting
pnpm format                  # Format all files
pnpm format:check            # Check formatting

# Dependency graph
pnpm graph                   # View dependency graph
```

## 🎨 UI Components

The `@cms/shared/ui` library provides reusable components:

- `ButtonComponent` - Multiple variants (primary, secondary, outline, ghost, danger, success)
- `InputComponent` - Form input with validation, icons, password toggle
- `IconComponent` - FontAwesome icons with style variants
- `CardComponent` - Content container with variants
- `AlertComponent` - Feedback messages (info, success, warning, error)
- `SpinnerComponent` - Loading indicator
- `ModalComponent` - Dialog/overlay component
- `FormFieldComponent` - Form field wrapper with labels and errors
- `CheckboxComponent` - Form checkbox
- `DividerComponent` - Visual separator

### Usage Example

```typescript
import { ButtonComponent, InputComponent, IconComponent } from '@cms/shared/ui';

@Component({
  imports: [ButtonComponent, InputComponent, IconComponent],
  template: `
    <cms-button variant="primary" (click)="save()">
      <cms-icon name="save" />
      Save
    </cms-button>
    
    <cms-input
      type="email"
      label="Email"
      [formControl]="emailControl"
      placeholder="Enter your email"
    />
  `
})
export class MyComponent { }
```

## 🎭 Visual Settings (No Themes)

The configurator allows admins/devs to change visual settings directly:

- **Colors**: Primary, secondary, success, warning, error
- **Typography**: Font family, sizes, weights
- **Spacing**: Margins, paddings
- **Header/Footer**: Background colors, text colors
- **Borders**: Colors, radius

These settings are saved to the database and applied via CSS variables.

## 🔐 Authentication

- JWT-based authentication with refresh tokens
- Role-based access control (Admin, Developer, EndUser)
- Protected routes via guards
- HTTP interceptor for automatic token refresh

## 🏷️ Import Paths

```typescript
// API Interfaces
import { UserDto, LoginRequest } from '@cms/shared/api-interfaces';

// Auth
import { AuthService, authGuard } from '@cms/shared/auth/data-access';
import { LoginComponent, RegisterComponent } from '@cms/shared/auth/feature';

// UI Components
import { ButtonComponent, InputComponent } from '@cms/shared/ui';

// Visual Settings
import { VisualSettingsService } from '@cms/shared/visual-settings';

// Components Registry
import { ComponentRegistry } from '@cms/shared/components-registry';

// Utilities
import { validators, formatDate } from '@cms/shared/utils';
```

## 📦 Technologies

- **Angular 20** - Latest Angular version
- **Nx 22** - Monorepo management
- **Tailwind CSS 4** - Utility-first CSS
- **SCSS** - Styling
- **FontAwesome 7** - Icons
- **RxJS 7** - Reactive programming
- **pnpm** - Package manager

## 🔧 Configuration

### API Proxy (Development)

Both apps proxy `/api` requests to the backend:

```json
{
  "/api": {
    "target": "https://localhost:7209",
    "secure": false,
    "changeOrigin": true
  }
}
```

### Tailwind CSS

All apps use a shared Tailwind preset (`tailwind.preset.js`) that defines:

- Custom color palette with CSS variables for dynamic theming
- Typography scale
- Spacing and sizing
- Animations and transitions

## 📝 License

MIT

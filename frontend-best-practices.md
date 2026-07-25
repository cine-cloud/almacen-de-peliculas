# Frontend Best Practices — React + Vite + DaisyUI + Tailwind

> Guía de ingeniería para proyectos frontend con React, Vite, DaisyUI y la configuración de Tailwind estándar del equipo.

---

## 1. Estructura de Carpetas

```
src/
├── assets/                    # Imágenes, fuentes, íconos estáticos
├── components/
│   ├── ui/                    # Componentes base reutilizables (Button, Input, Modal…)
│   └── [feature]/             # Componentes agrupados por dominio/feature
├── config/
│   └── keycloak.js            # Instancia y configuración del cliente Keycloak
├── data/                      # Datos estáticos, mocks, seeds
├── hooks/
│   ├── KeycloakProvider.jsx   # Context Provider que inicializa Keycloak
│   ├── useKeycloak.js         # Hook para consumir el contexto de auth
│   └── useCart.jsx            # (ejemplo) Hook de dominio
├── lib/                       # Wrappers de librerías externas
├── services/
│   ├── api.js                 # Instancia base de axios/fetch con interceptors de token
│   ├── catalogoService.js     # Servicios de dominio: catálogo
│   └── peliculaService.js     # Servicios de dominio: películas
├── layouts/                   # Layouts de página (MainLayout, ProtectedLayout…)
├── pages/                     # Vistas/rutas (una carpeta por ruta)
├── types/                     # Tipos TypeScript compartidos
├── utils/                     # Helpers y funciones puras
├── App.jsx
└── main.jsx
```

**Reglas:**
- Un componente por archivo. El archivo se llama igual que el componente (`Button.tsx`, no `button.tsx`).
- Barrel exports (`index.ts`) solo dentro de carpetas que lo justifiquen; evitar en `components/ui/` para no romper tree-shaking.
- Nunca importar desde `src/pages` dentro de otro componente; las páginas solo se usan en el router.
- `config/keycloak.js` exporta **solo** la instancia; nunca lógica de negocio ni efectos secundarios.

---

## 2. Convenciones de Nombrado

| Artefacto | Convención | Ejemplo |
|---|---|---|
| Componente React | PascalCase | `UserCard.tsx` |
| Hook personalizado | camelCase con prefijo `use` | `useAuthUser.ts` |
| Utilidad / helper | camelCase | `formatDate.ts` |
| Constante global | SCREAMING_SNAKE_CASE | `MAX_RETRIES` |
| Tipo / Interface TS | PascalCase | `UserProfile` |
| Evento de prop | prefijo `on` | `onSubmit`, `onClose` |
| Handler interno | prefijo `handle` | `handleSubmit`, `handleClose` |

---

## 3. Estilos: Tailwind + DaisyUI

### 3.1 Orden de prioridad

1. **DaisyUI component classes** — siempre primero (`btn`, `card`, `modal`, `input`, etc.)
2. **DaisyUI modifiers** — variantes semánticas (`btn-primary`, `btn-outline`, `alert-error`, etc.)
3. **Tailwind utilities** — solo para ajustes que DaisyUI no cubre (`mt-4`, `gap-2`, `truncate`, etc.)
4. **CSS custom** — último recurso; usar variables CSS del tema.

```tsx
// ✅ Correcto
<button className="btn btn-primary mt-4 w-full">Guardar</button>

// ❌ Evitar: reinventar lo que DaisyUI ya provee
<button className="bg-primary text-primary-content rounded-lg px-4 py-2 font-semibold">
  Guardar
</button>
```

### 3.2 Colores — usar siempre los tokens del tema

La configuración de Tailwind mapea los colores semánticos de DaisyUI a custom properties CSS. Usar **solo** esos tokens para garantizar soporte automático de temas (incluyendo dark mode).

```tsx
// ✅ Tokens del tema
<div className="bg-background text-foreground border border-border" />
<span className="text-primary" />
<div className="bg-error text-error-content" />

// ❌ Valores hardcodeados — rompen el theming
<div className="bg-[#FBFCF7] text-[#202124]" />
<div className="bg-red-500" />   // solo si no hay alternativa semántica
```

**Tokens disponibles** (definidos en `tailwind.config`):

| Token | Uso |
|---|---|
| `background` / `foreground` | Fondo y texto principal de la app |
| `primary` / `primary-content` | Acciones principales, CTAs |
| `primary-focus` | Estado hover/focus de elementos primarios |
| `secondary` | Acciones secundarias |
| `accent` | Highlights y detalles decorativos |
| `neutral` | Superficies neutras |
| `info` / `success` / `warning` / `error` | Estados de feedback |
| `border` | Bordes de separación |

### 3.3 Dark Mode

El modo oscuro está configurado con `darkMode: ["class"]`. Se activa agregando la clase `dark` al `<html>`. Los tokens semánticos cambian automáticamente.

```tsx
// En el toggle de tema
document.documentElement.classList.toggle("dark");
```

No usar `dark:bg-*` con valores hardcodeados; si el token semántico no alcanza, definir una nueva variable CSS en el tema DaisyUI.

### 3.4 Border Radius

Usar las clases del tema extendido, no valores arbitrarios:

```tsx
<div className="rounded-lg" />  // var(--radius)
<div className="rounded-md" />  // calc(var(--radius) - 2px)
<div className="rounded-sm" />  // calc(var(--radius) - 4px)
```

### 3.5 Animaciones

El plugin `tailwindcss-animate` está disponible. Usarlo para transiciones de entrada/salida de modals, toasts y drawers antes de recurrir a librerías externas.

```tsx
<div className="animate-in fade-in slide-in-from-bottom-4 duration-200" />
```

---

## 4. Componentes

### 4.1 Componentes UI base (`src/components/ui/`)

Wrappear los componentes de DaisyUI en componentes propios cuando:
- Se necesita lógica adicional (loading state, disabled handling).
- Se quiere estandarizar props y reducir acoplamiento con DaisyUI.
- Se agrega accesibilidad (aria-label, roles).

```tsx
// src/components/ui/Button.tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "error";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  children,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "btn",
        variant && `btn-${variant}`,
        size !== "md" && `btn-${size}`,
        loading && "loading",
        className
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {children}
    </button>
  );
}
```

### 4.2 Composición sobre configuración

Preferir componentes pequeños y componibles sobre mega-componentes con muchas props.

```tsx
// ✅ Componible
<Card>
  <Card.Header>Título</Card.Header>
  <Card.Body>Contenido</Card.Body>
  <Card.Actions>
    <Button>Aceptar</Button>
  </Card.Actions>
</Card>

// ❌ Monolítico
<Card title="Título" content="Contenido" actionLabel="Aceptar" onAction={...} />
```

### 4.3 Props y tipos

- Todas las props de componentes deben tener tipos explícitos (TypeScript).
- Extender tipos HTML nativos cuando corresponda (`React.ButtonHTMLAttributes`, etc.).
- Siempre tipar el retorno de hooks (`const useX = (): ReturnType => ...`).

---

## 5. Gestión de Clases CSS

Usar la utilidad `cn()` (combinación de `clsx` + `tailwind-merge`) para concatenar clases condicionalmente y resolver conflictos de Tailwind.

```ts
// src/utils/cn.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

```tsx
// Uso
<div className={cn("btn btn-primary", isDisabled && "btn-disabled", className)} />
```

**Nunca** concatenar clases con template literals o condiciones directas:
```tsx
// ❌
<div className={`btn ${isActive ? "btn-primary" : "btn-ghost"}`} />
```

---

## 6. Performance

### 6.1 Code Splitting

Usar `React.lazy` + `Suspense` para todas las páginas:

```tsx
// App.tsx / router
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const Settings = React.lazy(() => import("./pages/Settings"));

<Suspense fallback={<PageLoader />}>
  <Routes>
    <Route path="/dashboard" element={<Dashboard />} />
  </Routes>
</Suspense>
```

### 6.2 Imágenes y Assets

- Importar SVGs como componentes React cuando se necesita manipulación (`?react` en Vite con plugin).
- Para imágenes de contenido, preferir formatos `webp` y definir `width`/`height` explícitos.
- Assets de íconos: usar una librería como `lucide-react` antes de importar SVGs individuales.

### 6.3 Re-renders

- `useMemo` y `useCallback` solo cuando el profiler lo justifique; no de forma preventiva.
- Evitar objetos/funciones inline en JSX para componentes memoizados.
- Listas largas (>100 ítems): usar virtualización (`@tanstack/react-virtual`).

---

## 7. Accesibilidad

- Todo elemento interactivo debe ser alcanzable por teclado.
- Usar roles semánticos HTML antes que `role="..."` custom.
- Los modals de DaisyUI requieren manejo explícito de focus trap y `aria-modal`.
- Color contrast mínimo WCAG AA. Verificar los tokens del tema `mytheme` con herramientas como [Contrast Checker](https://webaim.org/resources/contrastchecker/).
- Proveer `aria-label` a botones que solo contengan íconos.

```tsx
// ✅
<button aria-label="Cerrar modal" className="btn btn-ghost btn-sm btn-circle">
  <XIcon className="h-4 w-4" />
</button>
```

---

## 8. Keycloak SSO

### 8.1 Arquitectura de archivos

La integración SSO se divide en tres responsabilidades:

```
config/keycloak.js          → instancia del cliente (qué servidor, realm, clientId)
hooks/KeycloakProvider.jsx  → inicialización, estado reactivo, Context
hooks/useKeycloak.js        → hook de consumo para componentes
services/api.js             → interceptor que adjunta el token a cada request
```

### 8.2 `config/keycloak.js` — Solo configuración

Este archivo debe exportar **únicamente** la instancia de Keycloak. Cero efectos secundarios, cero lógica de negocio.

```js
// config/keycloak.js
import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url:      import.meta.env.VITE_KEYCLOAK_URL,
  realm:    import.meta.env.VITE_KEYCLOAK_REALM,
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
});

export default keycloak;
```

> ❌ No llamar a `keycloak.init()` aquí. Eso es responsabilidad del Provider.

### 8.3 `hooks/KeycloakProvider.jsx` — Inicialización y estado

El Provider es el único lugar donde se llama a `keycloak.init()`. Gestiona el ciclo de vida completo: inicialización, refresco de token y logout por expiración.

```jsx
// hooks/KeycloakProvider.jsx
import { createContext, useEffect, useState } from "react";
import keycloak from "@/config/keycloak";

export const KeycloakContext = createContext(null);

export function KeycloakProvider({ children }) {
  const [auth, setAuth] = useState({
    initialized: false,
    authenticated: false,
    user: null,
    token: null,
  });

  useEffect(() => {
    keycloak
      .init({ onLoad: "login-required", checkLoginIframe: false })
      .then((authenticated) => {
        setAuth({
          initialized: true,
          authenticated,
          user: keycloak.tokenParsed,
          token: keycloak.token,
        });
      })
      .catch(() => {
        setAuth((prev) => ({ ...prev, initialized: true }));
      });

    // Refrescar token 60 segundos antes de que expire
    const interval = setInterval(() => {
      keycloak.updateToken(60).catch(() => keycloak.logout());
    }, 30_000);

    return () => clearInterval(interval);
  }, []);

  return (
    <KeycloakContext.Provider value={{ ...auth, keycloak }}>
      {auth.initialized ? children : <FullPageLoader />}
    </KeycloakContext.Provider>
  );
}
```

**Reglas:**
- `onLoad: "login-required"` redirige automáticamente al login de Keycloak si no hay sesión. Usar `"check-sso"` solo en rutas públicas.
- `checkLoginIframe: false` evita problemas de CORS en algunos entornos.
- El refresco periódico (`updateToken`) es obligatorio; sin él el token expira silenciosamente y las APIs empiezan a retornar 401.

### 8.4 `hooks/useKeycloak.js` — Consumo en componentes

```js
// hooks/useKeycloak.js
import { useContext } from "react";
import { KeycloakContext } from "./KeycloakProvider";

export function useKeycloak() {
  const ctx = useContext(KeycloakContext);
  if (!ctx) throw new Error("useKeycloak debe usarse dentro de <KeycloakProvider>");
  return ctx;
}
```

```jsx
// Uso en cualquier componente
const { user, authenticated, keycloak } = useKeycloak();

// Logout
<button onClick={() => keycloak.logout({ redirectUri: window.location.origin })}>
  Cerrar sesión
</button>

// Mostrar nombre del usuario
<span>{user?.name ?? user?.preferred_username}</span>
```

**Nunca** importar `keycloak` desde `config/keycloak.js` directamente en un componente. Siempre pasar por `useKeycloak()`.

### 8.5 `services/api.js` — Interceptor de token

El cliente HTTP debe adjuntar el Bearer token en cada request y manejar el refresco si el token está próximo a expirar.

```js
// services/api.js
import axios from "axios";
import keycloak from "@/config/keycloak";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use(async (config) => {
  // Refrescar si expira en menos de 30 segundos
  if (keycloak.isTokenExpired(30)) {
    await keycloak.updateToken(30);
  }
  config.headers.Authorization = `Bearer ${keycloak.token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      keycloak.logout();
    }
    return Promise.reject(error);
  }
);

export default api;
```

Los servicios de dominio (`catalogoService.js`, `peliculaService.js`) deben importar esta instancia, **nunca** crear sus propias instancias de axios.

```js
// services/catalogoService.js
import api from "./api";

export const getCatalogo = () => api.get("/catalogo");
export const getCatalogoById = (id) => api.get(`/catalogo/${id}`);
```

### 8.6 Variables de entorno requeridas

Agregar al `.env` del proyecto y documentar en `.env.example`:

```bash
# .env.example
VITE_KEYCLOAK_URL=https://auth.midominio.com
VITE_KEYCLOAK_REALM=mi-realm
VITE_KEYCLOAK_CLIENT_ID=mi-frontend-client
VITE_API_URL=https://api.midominio.com
```

Tipar en `src/vite-env.d.ts`:

```ts
interface ImportMetaEnv {
  readonly VITE_KEYCLOAK_URL: string;
  readonly VITE_KEYCLOAK_REALM: string;
  readonly VITE_KEYCLOAK_CLIENT_ID: string;
  readonly VITE_API_URL: string;
}
```

### 8.7 Rutas protegidas

Crear un componente `ProtectedRoute` que verifique el estado de autenticación antes de renderizar la página:

```jsx
// components/ui/ProtectedRoute.jsx
import { useKeycloak } from "@/hooks/useKeycloak";
import { Navigate } from "react-router-dom";

export function ProtectedRoute({ children, roles = [] }) {
  const { authenticated, user } = useKeycloak();

  if (!authenticated) return <Navigate to="/" replace />;

  if (roles.length > 0) {
    const userRoles = user?.realm_access?.roles ?? [];
    const hasRole = roles.some((r) => userRoles.includes(r));
    if (!hasRole) return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
```

```jsx
// Uso en el router
<Route
  path="/admin"
  element={
    <ProtectedRoute roles={["admin"]}>
      <AdminPage />
    </ProtectedRoute>
  }
/>
```

### 8.8 Antipatrones frecuentes

| ❌ Antipatrón | ✅ Corrección |
|---|---|
| Llamar `keycloak.init()` en `config/keycloak.js` | Solo en `KeycloakProvider` |
| Leer `keycloak.token` directamente en componentes | Usar `useKeycloak().token` |
| Crear instancias de axios en cada servicio | Importar siempre `services/api.js` |
| No refrescar el token periódicamente | Intervalo en el Provider + interceptor en api.js |
| Guardar el token en `localStorage` | Keycloak lo gestiona en memoria; no persistir manualmente |
| `checkLoginIframe: true` en producción con CORS | Setear siempre `checkLoginIframe: false` |

---

## 9. Vite — Configuración y Buenas Prácticas

### 9.1 Path Aliases

Definir alias para evitar imports relativos profundos:

```ts
// vite.config.ts
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

```tsx
// ✅ Con alias
import { Button } from "@/components/ui/Button";

// ❌ Sin alias
import { Button } from "../../../components/ui/Button";
```

### 9.2 Variables de Entorno

- Prefijo `VITE_` para exponer variables al cliente.
- Nunca incluir secrets del backend en variables `VITE_*`.
- Mantener un `.env.example` actualizado con todas las variables requeridas (sin valores reales).
- Tipar las env vars en `src/vite-env.d.ts` (ver sección 8.6 para el ejemplo completo de Keycloak).

---

## 10. Testing

| Tipo | Herramienta | Alcance |
|---|---|---|
| Unitario | Vitest | Hooks, utils, lógica pura |
| Componente | Vitest + Testing Library | Componentes UI aislados |
| E2E | Playwright | Flujos críticos de usuario |

- No testear detalles de implementación; testear comportamiento observable.
- Nombrar tests en español o inglés, de forma descriptiva: `it("muestra error cuando el campo está vacío")`.
- Colocar tests junto al archivo que prueban: `Button.test.tsx` al lado de `Button.tsx`.
- Para tests que involucren `useKeycloak`, mockear el contexto completo:

```jsx
vi.mock("@/hooks/useKeycloak", () => ({
  useKeycloak: () => ({
    authenticated: true,
    user: { name: "Test User", realm_access: { roles: ["user"] } },
    token: "mock-token",
    keycloak: { logout: vi.fn() },
  }),
}));
```

---

## 11. Checklist Pre-PR

Antes de abrir un Pull Request, verificar:

- [ ] No hay valores de color hardcodeados (usar tokens del tema).
- [ ] Clases CSS concatenadas con `cn()`, sin template literals.
- [ ] Componentes nuevos tipados con TypeScript.
- [ ] Páginas nuevas con `React.lazy`.
- [ ] Variables de entorno nuevas añadidas a `.env.example` y tipadas en `vite-env.d.ts`.
- [ ] Sin `console.log` en código de producción.
- [ ] Tests unitarios para lógica nueva en hooks/utils; mocks de Keycloak donde corresponda.
- [ ] Elementos interactivos accesibles por teclado.
- [ ] `keycloak.init()` solo en `KeycloakProvider`, no en `config/keycloak.js`.
- [ ] Todos los servicios HTTP usan la instancia de `services/api.js`.
- [ ] Build de producción sin errores: `pnpm build`.

---

*Última actualización: mayo 2026 — Harness Engineering*

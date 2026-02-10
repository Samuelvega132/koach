# 🎤 Koach Frontend - Sistema de Autenticación

## Implementación Completada

Sistema de autenticación **no intrusivo** que permite a los usuarios usar la aplicación como invitados o registrarse para guardar su progreso.

---

## 📁 Estructura de Archivos Creados

```
Frontend/
├── src/
│   ├── contexts/
│   │   └── AuthContext.tsx           # ✅ Context y Provider de autenticación
│   ├── components/
│   │   ├── auth/
│   │   │   ├── AuthModal.tsx         # ✅ Modal de login/register
│   │   │   └── ProtectedRoute.tsx    # ✅ HOC para rutas protegidas
│   │   └── shared/
│   │       └── Navbar.tsx            # ✅ Actualizado con auth
│   ├── app/
│   │   ├── layout.tsx                # ✅ Actualizado con AuthProvider
│   │   ├── profile/
│   │   │   └── page.tsx              # ✅ Página de perfil protegida
│   │   └── (public)/
│   │       └── results/
│   │           └── [sessionId]/
│   │               └── page.tsx      # ✅ Actualizado con lógica de invitado
│   └── config/
│       └── api.config.ts             # ✅ Actualizado con endpoints de auth
```

---

## 🎯 Características Implementadas

### 1. **AuthContext (Global State)**

**Ubicación:** `src/contexts/AuthContext.tsx`

Proporciona estado global de autenticación en toda la app:

```tsx
import { useAuth } from '@/contexts/AuthContext';

const { user, isAuthenticated, isLoading, login, register, logout } = useAuth();
```

**API:**
- `user`: Objeto del usuario actual o `null`
- `isAuthenticated`: Boolean indicando si está logueado
- `isLoading`: Boolean durante la verificación inicial
- `login(data)`: Función para iniciar sesión
- `register(data)`: Función para registrarse
- `logout()`: Función para cerrar sesión
- `refreshUser()`: Refrescar datos del usuario

### 2. **AuthModal (Login/Register)**

**Ubicación:** `src/components/auth/AuthModal.tsx`

Modal elegante con:
- ✅ Validación con Zod (igual que backend)
- ✅ Toggle entre Login y Register
- ✅ Mensajes de error descriptivos
- ✅ Loading states
- ✅ Diseño glassmorphism

**Uso:**
```tsx
import { AuthModal } from '@/components/auth/AuthModal';

<AuthModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  defaultMode="register" // o "login"
/>
```

### 3. **Navbar Dinámico**

**Ubicación:** `src/components/shared/Navbar.tsx`

Se adapta automáticamente según el estado de autenticación:

**Modo Invitado:**
- Botón "Iniciar Sesión"

**Modo Autenticado:**
- Avatar del usuario (iniciales)
- Dropdown con:
  - Nombre y email
  - Link a "Mi Perfil"
  - Botón "Cerrar Sesión"

### 4. **ResultsPage Mejorado**

**Ubicación:** `src/app/(public)/results/[sessionId]/page.tsx`

Lógica diferencial según el estado de autenticación:

**Usuario Autenticado:**
- Badge verde "Guardado en tu historial"
- Botón "Ver Historial" (futuro)

**Usuario Invitado:**
- Badge amarillo "Modo invitado - No guardado"
- **Banner CTA atractivo:**
  - Título llamativo
  - Lista de beneficios (historial, gráficos, objetivos)
  - Botones para registrarse o iniciar sesión
  - Abre el `AuthModal` con modo "register"

### 5. **ProtectedRoute Component**

**Ubicación:** `src/components/auth/ProtectedRoute.tsx`

HOC para proteger rutas que requieren autenticación:

```tsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <YourProtectedContent />
    </ProtectedRoute>
  );
}
```

**Comportamiento:**
- Muestra loading mientras verifica auth
- Redirige al home si no está autenticado
- Renderiza el contenido si está autenticado

### 6. **Página de Perfil**

**Ubicación:** `src/app/profile/page.tsx`

Página protegida que muestra:
- Avatar del usuario
- Información (nombre, email, fecha de registro)
- Stats cards (sesiones, mejor puntaje, promedio)
- Historial de sesiones (próximamente)

---

## 🔧 Instalación y Configuración

### 1. Instalar Dependencias

```bash
cd Frontend
npm install zod
```

(React Hook Form y lucide-react ya están instalados)

### 2. Configurar Variables de Entorno

Asegúrate de que `NEXT_PUBLIC_API_URL` apunte al backend:

```env
# Frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### 3. Iniciar el Frontend

```bash
npm run dev
```

---

## 🎨 Flujos de Usuario

### Flujo 1: Usuario Invitado

1. Usuario abre la app
2. Ve el Navbar con botón "Iniciar Sesión"
3. Puede navegar a Studio, Songs, etc.
4. Canta una canción
5. Ve sus resultados en `/results/[sessionId]`
6. Ve un **banner CTA** para registrarse
7. Si hace clic, se abre el modal de registro

### Flujo 2: Registro

1. Usuario hace clic en "Crear Cuenta Gratis"
2. Se abre `AuthModal` en modo "register"
3. Completa el formulario
4. Se valida con Zod
5. Se envía al backend `/auth/register`
6. Si es exitoso:
   - Se guarda el `accessToken` en localStorage
   - Se establece la cookie `refreshToken` (HttpOnly)
   - El modal se cierra
   - El Navbar se actualiza mostrando el avatar

### Flujo 3: Login

1. Usuario hace clic en "Iniciar Sesión" o "Ya tengo cuenta"
2. Se abre `AuthModal` en modo "login"
3. Ingresa email y contraseña
4. Se valida con Zod
5. Se envía al backend `/auth/login`
6. Si es exitoso:
   - Se guarda el token
   - El usuario se autentica
   - El Navbar se actualiza

### Flujo 4: Usuario Autenticado

1. Usuario autenticado ve su avatar en Navbar
2. Puede hacer clic para abrir dropdown
3. Puede ir a "Mi Perfil" (`/profile`)
4. La página está protegida con `ProtectedRoute`
5. Ve su historial y estadísticas
6. Cuando canta, la sesión se guarda automáticamente (TODO)
7. Puede cerrar sesión desde el dropdown

---

## 🔐 Seguridad

### Frontend

1. **Validación Dual:**
   - Frontend valida con Zod (mismas reglas que backend)
   - Backend valida nuevamente (nunca confiar solo en el cliente)

2. **Token Storage:**
   - `accessToken`: Guardado en `localStorage` (vida corta: 15 min)
   - `refreshToken`: Guardado en `HttpOnly Cookie` (vida larga: 7 días)

3. **Credentials:**
   - Todas las requests a `/auth/*` incluyen `credentials: 'include'`
   - Esto envía las cookies automáticamente

4. **Protección de Rutas:**
   - `ProtectedRoute` verifica autenticación antes de renderizar
   - Redirige automáticamente si no está autenticado

### Backend (Ya implementado)

1. **Passwords:**
   - Hasheadas con bcrypt (12 rounds)
   - Nunca se devuelven al cliente

2. **JWT:**
   - Firmados con secretos fuertes
   - Expiración corta para access tokens

3. **Cookies:**
   - HttpOnly (no accesible desde JS)
   - Secure en producción (solo HTTPS)
   - SameSite=strict (protección CSRF)

---

## 🧪 Testing Manual

### 1. Verificar Modo Invitado

1. Abre la app sin estar logueado
2. Verifica que el Navbar muestre "Iniciar Sesión"
3. Navega a Studio y canta una canción
4. Ve los resultados
5. Verifica que aparezca el banner CTA

### 2. Verificar Registro

1. Haz clic en "Crear Cuenta Gratis"
2. Completa el formulario con:
   - Email: `test@example.com`
   - Password: `SecurePass123!`
   - Nombre: `Test`
   - Apellido: `User`
3. Envía el formulario
4. Verifica que el modal se cierre
5. Verifica que el Navbar muestre tu avatar

### 3. Verificar Logout

1. Estando logueado, haz clic en tu avatar
2. Haz clic en "Cerrar Sesión"
3. Verifica que el Navbar vuelva a "Iniciar Sesión"

### 4. Verificar Ruta Protegida

1. Sin estar logueado, intenta acceder a `/profile`
2. Verifica que te redirija al home
3. Loguéate
4. Accede a `/profile`
5. Verifica que veas tu información

---

## 📱 Responsive Design

Todos los componentes están optimizados para móvil:

- **Navbar:** Se adapta en pantallas pequeñas
- **AuthModal:** Ocupa el ancho completo en móvil
- **Banner CTA:** Stack vertical en móvil
- **Profile:** Grid adaptable

---

## 🔜 Próximos Pasos (Opcionales)

### 1. Asociar Sesiones a Usuarios

Modificar `StudioClient.tsx` para enviar el `userId`:

```tsx
const { user, isAuthenticated } = useAuth();

const savePerformance = async () => {
  await fetch(`${API_CONFIG.baseURL}/performances`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(isAuthenticated && {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      })
    },
    credentials: 'include',
    body: JSON.stringify({
      songId,
      userName: user ? `${user.firstName} ${user.lastName}` : 'Guest',
      performanceData,
      userId: user?.id, // ← Enviar userId si está logueado
    }),
  });
};
```

### 2. Historial de Sesiones

Crear endpoint en el backend:

```typescript
// Backend: GET /api/performances/user/:userId
router.get('/user/:userId', authenticateToken, PerformanceController.getByUser);
```

Consumirlo en el perfil:

```tsx
// Frontend: ProfilePage
const [sessions, setSessions] = useState([]);

useEffect(() => {
  const fetchSessions = async () => {
    const response = await fetch(
      `${API_CONFIG.baseURL}/performances/user/${user.id}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        credentials: 'include',
      }
    );
    const data = await response.json();
    setSessions(data);
  };
  fetchSessions();
}, [user]);
```

### 3. Gráficos de Progreso

Instalar una librería de charts:

```bash
npm install recharts
```

Crear componente `ProgressChart.tsx`:

```tsx
import { LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

const data = sessions.map(s => ({
  date: new Date(s.createdAt).toLocaleDateString(),
  score: s.score,
}));

<LineChart data={data}>
  <Line type="monotone" dataKey="score" stroke="#8b5cf6" />
  <XAxis dataKey="date" />
  <YAxis />
  <Tooltip />
</LineChart>
```

### 4. Token Refresh

Crear un interceptor para refrescar el `accessToken`:

```tsx
// utils/refreshToken.ts
export async function refreshAccessToken() {
  const response = await fetch(`${API_CONFIG.baseURL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include', // Envía refreshToken cookie
  });
  
  if (response.ok) {
    const { accessToken } = await response.json();
    localStorage.setItem('accessToken', accessToken);
    return accessToken;
  }
  
  throw new Error('Failed to refresh token');
}
```

---

## ✅ Checklist de Implementación

- [x] AuthContext y Provider
- [x] Hook useAuth
- [x] AuthModal con validación Zod
- [x] Navbar dinámico con dropdown
- [x] ResultsPage con banner CTA
- [x] ProtectedRoute component
- [x] Página de perfil protegida
- [x] Layout con AuthProvider
- [x] Configuración de API endpoints
- [ ] Asociar sesiones a usuarios (TO-DO)
- [ ] Historial de sesiones (TO-DO)
- [ ] Gráficos de progreso (TO-DO)
- [ ] Token refresh endpoint (TO-DO)

---

## 🎉 Resultado

Un sistema de autenticación **moderno, seguro y no intrusivo** que:

✅ Permite usar la app sin registro  
✅ Incentiva el registro con CTAs atractivos  
✅ Protege rutas sensibles automáticamente  
✅ Mantiene la sesión con cookies seguras  
✅ Valida datos en frontend y backend  
✅ Se adapta a cualquier tamaño de pantalla  

**¡Tu app ahora tiene autenticación de nivel profesional! 🚀**

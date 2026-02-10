# 🔐 Sistema de Autenticación - Koach Backend

## Arquitectura Implementada

Sistema de autenticación JWT moderno, seguro y escalable siguiendo principios de **Clean Code** y **Clean Architecture**.

---

## 📋 Componentes Principales

### 1. **Modelo de Datos** (`schema.prisma`)

```prisma
model User {
  id           String   @id @default(uuid())
  email        String   @unique
  passwordHash String
  firstName    String
  lastName     String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  performanceLogs PerformanceLog[]
  
  @@index([email])
  @@map("users")
}
```

**Características:**
- ✅ Contraseñas hasheadas con bcrypt (12 salt rounds)
- ✅ Índice en email para búsquedas optimizadas
- ✅ Relación 1:N con PerformanceLogs
- ✅ userId opcional en PerformanceLogs (compatibilidad con datos legacy)

---

### 2. **Utilidades de Autenticación** (`auth.utils.ts`)

#### Funciones de Hashing
```typescript
hashPassword(password: string): Promise<string>
comparePassword(password: string, hash: string): Promise<boolean>
```

#### Generación de Tokens JWT
```typescript
generateTokenPair(payload: JWTPayload): TokenPair
// Retorna:
// - accessToken: 15 minutos
// - refreshToken: 7 días (HttpOnly cookie)
```

#### Verificación de Tokens
```typescript
verifyAccessToken(token: string): JWTPayload | null
verifyRefreshToken(token: string): JWTPayload | null
```

---

### 3. **Validación con Zod** (`auth.validation.ts`)

#### RegisterSchema
- ✅ Email válido (formato + lowercase + trim)
- ✅ Contraseña fuerte (min 8 chars, 1 mayúscula, 1 minúscula, 1 número, 1 especial)
- ✅ Nombres: 2-50 caracteres

#### LoginSchema
- ✅ Email válido
- ✅ Contraseña requerida (sin restricciones para login)

---

### 4. **DTOs (Data Transfer Objects)** (`user.dto.ts`)

```typescript
toUserDto(user: User): UserDTO
```

**🔒 REGLA DE ORO:** Nunca devolver el objeto User completo al cliente.

**Campos excluidos:**
- ❌ `passwordHash` (información sensible)

**Campos expuestos:**
- ✅ id, email, firstName, lastName, createdAt, updatedAt

---

### 5. **Middleware de Autenticación** (`authenticateToken.ts`)

#### `authenticateToken`
Middleware que protege rutas que requieren autenticación.

```typescript
// Header esperado
Authorization: Bearer <accessToken>

// Adjunta al request
req.user = { userId, email }
```

**Respuestas:**
- `401 Unauthorized`: Token no proporcionado
- `403 Forbidden`: Token inválido o expirado

#### `optionalAuthentication`
Middleware que permite rutas híbridas (con/sin auth).

---

### 6. **Controladores** (`auth.controller.ts`)

#### POST `/api/auth/register`
Registra un nuevo usuario.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "createdAt": "2026-02-09T...",
    "updatedAt": "2026-02-09T..."
  },
  "accessToken": "eyJhbGc..."
}
```

**Cookie:**
```
refreshToken (HttpOnly, Secure in production, SameSite=strict)
```

---

#### POST `/api/auth/login`
Autentica un usuario existente.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "user": { ... },
  "accessToken": "eyJhbGc..."
}
```

---

#### POST `/api/auth/logout`
Cierra la sesión del usuario.

**Response (200):**
```json
{
  "message": "Sesión cerrada exitosamente"
}
```

**Acción:** Limpia la cookie `refreshToken`.

---

#### GET `/api/auth/me`
Obtiene el perfil del usuario autenticado.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "createdAt": "2026-02-09T...",
    "updatedAt": "2026-02-09T..."
  }
}
```

---

## 🔒 Características de Seguridad

### 1. **Contraseñas**
- ✅ Hasheadas con bcrypt (12 salt rounds)
- ✅ Nunca almacenadas en texto plano
- ✅ Validación de fuerza en registro

### 2. **Tokens JWT**
- ✅ Access Token: 15 minutos (corta duración)
- ✅ Refresh Token: 7 días (larga duración)
- ✅ Firmados con secretos diferentes

### 3. **Cookies HttpOnly**
- ✅ HttpOnly: No accesible desde JavaScript (protección XSS)
- ✅ Secure: Solo HTTPS en producción
- ✅ SameSite=strict: Protección CSRF

### 4. **Validación de Entrada**
- ✅ Zod schemas para todos los inputs
- ✅ Sanitización automática (trim, lowercase)
- ✅ Mensajes de error descriptivos

### 5. **Respuestas Sanitizadas**
- ✅ DTOs para excluir información sensible
- ✅ Nunca devolver passwordHash
- ✅ Mensajes de error genéricos para seguridad

---

## 🔐 Variables de Entorno

```env
# JWT Secrets (CRÍTICO)
JWT_SECRET=your-super-secret-jwt-key-here
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here

# Generación de secretos fuertes:
# node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**⚠️ IMPORTANTE:**
- Cambiar en producción
- No compartir en repositorios públicos
- Usar secretos de al menos 32 caracteres

---

## 📊 Flujo de Autenticación

```
1. REGISTRO
   Usuario → POST /auth/register
   ↓
   Validación Zod
   ↓
   Hash contraseña (bcrypt)
   ↓
   Crear usuario en DB
   ↓
   Generar tokens JWT
   ↓
   Establecer cookie (refreshToken)
   ↓
   Devolver { user, accessToken }

2. LOGIN
   Usuario → POST /auth/login
   ↓
   Validación Zod
   ↓
   Buscar usuario por email
   ↓
   Comparar contraseñas (bcrypt)
   ↓
   Generar tokens JWT
   ↓
   Establecer cookie (refreshToken)
   ↓
   Devolver { user, accessToken }

3. ACCESO A RUTA PROTEGIDA
   Cliente → GET /auth/me (Header: Authorization: Bearer <token>)
   ↓
   Middleware authenticateToken
   ↓
   Verificar token JWT
   ↓
   Adjuntar req.user
   ↓
   Controlador procesa request
   ↓
   Devolver datos del usuario

4. LOGOUT
   Cliente → POST /auth/logout
   ↓
   Limpiar cookie refreshToken
   ↓
   Devolver { message }
```

---

## 🧪 Testing Manual

### 1. Registro
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

### 3. Obtener Perfil
```bash
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer <accessToken>"
```

### 4. Logout
```bash
curl -X POST http://localhost:3001/api/auth/logout
```

---

## 📚 Próximos Pasos (Opcionales)

1. **Refresh Token Endpoint**
   - Endpoint para refrescar accessToken usando refreshToken
   - `POST /auth/refresh`

2. **Recuperación de Contraseña**
   - Email de recuperación
   - Token temporal
   - `POST /auth/forgot-password`
   - `POST /auth/reset-password`

3. **Verificación de Email**
   - Email de confirmación
   - Token de verificación
   - `GET /auth/verify/:token`

4. **Rate Limiting**
   - Limitar intentos de login
   - Protección contra brute force

5. **Asociar Sesiones a Usuarios**
   - Actualizar `performance.controller.ts`
   - Usar `req.user.userId` en lugar de `userName`
   - Agregar middleware `authenticateToken` a rutas de performance

---

## ✅ Checklist de Implementación

- [x] Modelo User en Prisma
- [x] Relación User ↔ PerformanceLog
- [x] Utilidades de hashing (bcrypt)
- [x] Generación de JWT
- [x] Validación con Zod
- [x] DTOs para sanitización
- [x] Middleware de autenticación
- [x] Controladores de auth
- [x] Rutas de autenticación
- [x] Integración en server.ts
- [x] Variables de entorno
- [x] Migración de base de datos
- [x] Documentación

---

## 🎯 Principios de Clean Code Aplicados

1. **Single Responsibility Principle (SRP)**
   - Cada módulo tiene una responsabilidad única
   - auth.utils → Utilidades de autenticación
   - auth.validation → Validación de entrada
   - user.dto → Sanitización de respuestas

2. **DRY (Don't Repeat Yourself)**
   - Funciones reutilizables (hashPassword, generateTokenPair)
   - DTOs centralizados

3. **Separation of Concerns**
   - Controladores → Lógica de request/response
   - Services → Lógica de negocio
   - Utils → Utilidades transversales
   - Middlewares → Interceptores de request

4. **Type Safety**
   - TypeScript en todo el código
   - Interfaces y tipos explícitos
   - Validación en runtime con Zod

5. **Security First**
   - Nunca exponer información sensible
   - Validación estricta de entrada
   - Tokens con expiración corta
   - Cookies HttpOnly

---

## 📞 Soporte

Para dudas o mejoras, revisar la documentación oficial:
- [Prisma Docs](https://www.prisma.io/docs/)
- [JWT Docs](https://jwt.io/)
- [Zod Docs](https://zod.dev/)
- [bcrypt Docs](https://github.com/kelektiv/node.bcrypt.js)

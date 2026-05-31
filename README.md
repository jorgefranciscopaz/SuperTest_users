# SuperTest + NestJS — User Management API

Proyecto de demostración técnica que implementa una API REST para gestión de usuarios usando **NestJS**, con pruebas End-to-End automatizadas mediante **Jest** y **Supertest**.

---

## ¿Qué es Supertest y cómo se integra?

**Supertest** es una librería de Node.js que permite realizar peticiones HTTP reales contra una aplicación web directamente desde los tests, sin necesidad de que el servidor esté corriendo en un puerto.

### Integración con NestJS y Jest

```
Jest (test runner)
  └── describe / it / expect       ← estructura y aserciones
        └── Supertest               ← ejecuta las peticiones HTTP
              └── NestJS TestingModule  ← levanta la app en memoria
                    └── AppModule → UsersModule → UsersController
```

Supertest recibe la instancia del servidor HTTP que NestJS expone mediante `app.getHttpServer()` y ejecuta peticiones reales contra ella — sin abrir ningún puerto de red:

```typescript
// Así se conectan las tres tecnologías en cada test
request(app.getHttpServer())   // Supertest toma el servidor de NestJS
  .get('/users')               // ejecuta una petición HTTP real
  .expect(200)                 // Jest valida el resultado
  .expect((res) => {
    expect(Array.isArray(res.body)).toBe(true);
  });
```

### ¿Dónde se aplica en este proyecto?

Los tests E2E viven en la carpeta `server/test/`:

| Archivo | Qué prueba |
|---|---|
| `users.e2e-spec.ts` | Todos los endpoints de `/users` (GET, GET/:id, POST) |
| `app.e2e-spec.ts` | Que la app arranca y expone la ruta principal |

Cada test cubre un comportamiento observable desde fuera de la aplicación — exactamente como lo haría un cliente real.

---

## Requisitos previos

Antes de clonar o ejecutar el proyecto necesitas tener instalado:

| Herramienta | Versión mínima | Comando de verificación |
|---|---|---|
| Node.js | 18.x o superior | `node -v` |
| pnpm | 8.x o superior | `pnpm -v` |

### Instalar pnpm (si no lo tienes)

```bash
npm install -g pnpm
```

### Instalar Nest CLI (opcional, solo si quieres generar recursos nuevos)

```bash
npm install -g @nestjs/cli
```

---

## Instalación

```bash
# 1. Clonar el repositorio
git clone <url-del-repositorio>
cd SuperTest_users

# 2. Entrar a la carpeta del servidor
cd server

# 3. Instalar todas las dependencias
pnpm install
```

Las dependencias clave que se instalan:

| Paquete | Tipo | Propósito |
|---|---|---|
| `@nestjs/common` | producción | Decoradores, pipes, excepciones |
| `@nestjs/core` | producción | Motor principal de NestJS |
| `@nestjs/platform-express` | producción | Adaptador HTTP Express |
| `class-validator` | producción | Validación de DTOs con `ValidationPipe` |
| `class-transformer` | producción | Transformación de objetos en pipes |
| `supertest` | desarrollo | Peticiones HTTP en tests E2E |
| `@nestjs/testing` | desarrollo | `TestingModule` para montar la app en tests |
| `jest` | desarrollo | Runner de pruebas |
| `ts-jest` | desarrollo | Transpila TypeScript durante los tests |

---

## Ejecutar el proyecto

```bash
# Modo desarrollo con hot-reload
pnpm start:dev

# Modo producción (requiere build previo)
pnpm build
pnpm start:prod
```

El servidor queda disponible en `http://localhost:3000`.

---

## Endpoints disponibles

| Método | Ruta | Descripción | Status |
|---|---|---|---|
| GET | `/users` | Obtener todos los usuarios | 200 |
| GET | `/users/:id` | Obtener un usuario por ID | 200 / 404 |
| POST | `/users` | Crear un nuevo usuario | 201 |

---

## Ejecutar los tests

### Tests E2E con Supertest

```bash
pnpm test:e2e
```

Levanta la app de NestJS en memoria, ejecuta peticiones HTTP reales contra ella y valida las respuestas. No requiere que el servidor esté corriendo.

### Tests unitarios

```bash
pnpm test
```

### Tests con reporte de cobertura

```bash
pnpm test:cov
```

### Tests en modo watch (re-ejecuta al guardar cambios)

```bash
pnpm test:watch
```

---

## ¿Cómo funciona el ciclo de un test E2E?

```
1. beforeEach
   └── TestingModule compila AppModule en memoria
   └── NestJS inicializa controladores, servicios y pipes
   └── Supertest recibe la referencia al servidor HTTP

2. it('should...')
   └── Supertest envía una petición HTTP (GET, POST, etc.)
   └── NestJS procesa la petición normalmente
   └── Supertest recibe la respuesta
   └── Jest ejecuta los expect() sobre status code y body

3. afterEach
   └── La app se cierra y el estado en memoria se descarta
   └── El siguiente test comienza con una instancia limpia
```

Gracias al uso de `beforeEach` / `afterEach`, **cada test es completamente independiente** — el usuario semilla siempre parte del mismo estado.

---

## Salida esperada al correr `pnpm test:e2e`

```
 PASS  test/app.e2e-spec.ts
 PASS  test/users.e2e-spec.ts
  Users API (e2e)
    GET /users
      ✓ should return HTTP status 200
      ✓ should return an array
      ✓ should return at least one user with the correct structure
      ✓ should include the seeded user Jorge
    GET /users/:id
      ✓ should return HTTP status 200 for an existing user
      ✓ should return the correct user for id=1
      ✓ should return HTTP status 404 for a non-existent user
      ✓ should return HTTP status 400 for a non-numeric id
    POST /users
      ✓ should return HTTP status 201
      ✓ should return the newly created user with an id assigned
      ✓ should persist the created user (visible en GET /users)
      ✓ should make the created user retrievable via GET /users/:id

Tests: 13 passed, 13 total
```

---

## Estructura del proyecto

```
SuperTest_users/
├── README.md
└── server/
    ├── src/
    │   ├── users/
    │   │   ├── dto/
    │   │   │   └── create-user.dto.ts
    │   │   ├── entities/
    │   │   │   └── user.entity.ts
    │   │   ├── users.controller.ts
    │   │   ├── users.service.ts
    │   │   └── users.module.ts
    │   ├── app.module.ts
    │   └── main.ts
    ├── test/
    │   ├── users.e2e-spec.ts
    │   └── app.e2e-spec.ts
    ├── package.json
    ├── tsconfig.json
    └── nest-cli.json
```

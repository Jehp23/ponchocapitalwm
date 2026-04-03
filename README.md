# PonchoCapital Wealth Portal

Portal privado para clientes wealth de PonchoCapital.

La app no ejecuta operaciones reales ni reemplaza al broker. Su objetivo es dar una experiencia visual premium para clientes de alto patrimonio y una consola simple para que los asesores mantengan la informacion al dia.

## Que resuelve

- Visualizacion clara y elegante del patrimonio del cliente
- Vista de cartera, movimientos y evolucion historica
- Alta de clientes y portfolios desde una consola interna simple
- Registro manual de movimientos internos
- Importacion inicial desde Excel
- Trazabilidad y separacion entre dato visible, dato cargado e informacion operativa

## Estado actual

El proyecto ya esta en un estado utilizable para prueba interna con asesores.

Hoy funciona:

- Login con roles
- Vista cliente
- Vista asesor
- Alta de cliente
- Apertura de portfolio
- Registro manual de movimientos
- Visualizacion de cartera en ARS o USD
- Base PostgreSQL con Prisma
- Importador preparado con parser basado en `exceljs`

## Arquitectura

Monorepo con dos apps:

- `apps/web`: frontend principal en Next.js
- `apps/api`: backend TypeScript separado para evolucion futura

Carpetas principales:

- `apps/web/src/app`: rutas y pantallas
- `apps/web/src/components`: componentes de UI
- `apps/web/src/modules`: dominio y logica de negocio
- `apps/api/src`: backend modular
- `prisma`: schema y seed
- `docs`: decisiones de producto y arquitectura

## Stack

- Next.js 15
- TypeScript
- Tailwind CSS
- PostgreSQL
- Prisma
- Auth.js
- Zod
- Recharts
- ExcelJS

## Perfiles

### Cliente

Puede ver:

- patrimonio total
- composicion de cartera
- posiciones actuales
- evolucion
- movimientos visibles
- perfil y contexto general

### Asesor / Admin

Puede:

- crear clientes
- abrir portfolios
- registrar movimientos
- revisar clientes
- ver imports, auditoria y notas

## Flujo esperado del MVP

1. El asesor crea un cliente
2. El asesor abre un portfolio
3. El asesor registra movimientos o realiza la carga inicial
4. El cliente entra al portal y ve su patrimonio

## Requisitos

### Opcion recomendada

- Node.js 20+
- Docker Desktop

### Opcion manual

- Node.js 20+
- PostgreSQL local corriendo en `localhost:5432`

## Configuracion local

1. Clonar el repo
2. Crear el archivo `.env`
3. Instalar dependencias
4. Levantar la base
5. Cargar schema y seed
6. Levantar la web

## Variables de entorno

Usar `.env.example` como referencia.

Variables esperadas:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ponchocapitalwm?schema=public"
AUTH_SECRET="una-clave-larga-y-random"
AUTH_TRUST_HOST="true"
```

## Arranque rapido con Docker

```bash
docker compose up -d
npm install
npm run db:setup
npm run dev:web
```

La app web queda disponible en:

```bash
http://localhost:3000
```

Si tambien queres levantar el backend separado:

```bash
npm run dev:api
```

## Scripts utiles

```bash
npm run dev:web
npm run dev:api
npm run build
npm run typecheck
npm run db:generate
npm run db:push
npm run db:seed
npm run db:setup
```

## Usuarios de prueba

### Admin

- Email: `admin@ponchocapital.com`
- Password: `PonchoAdmin123`

### Cliente

- Email: `client@ponchocapital.com`
- Password: `PonchoClient123`

## Demo mode

Si la base no esta disponible, parte de la app puede seguir funcionando en modo demo para desarrollo local.

Esto sirve para explorar UI y login demo, pero no reemplaza la persistencia real con PostgreSQL.

## Validaciones realizadas

Antes de compartir esta version se validaron:

- `npm run typecheck --workspace web`
- `npm run build --workspace web`
- `npm run typecheck --workspace api`

## Notas importantes

- La app no opera mercado real
- La operatoria real sigue ocurriendo fuera del sistema
- La vista `ARS / USD` del cliente es una visualizacion orientativa del MVP
- El importador Excel ya no usa `xlsx`; fue migrado a `exceljs`

## Siguientes mejoras sugeridas

- publicar snapshots reales para cliente
- integrar mejor tabla de tipos y monedas
- robustecer importador contra multiples layouts de Excel
- reconstruir configuracion de ESLint mas estricta
- agregar tests de smoke y seeds mas ricos

## Soporte interno

Si alguien del equipo tiene problemas para levantarlo:

1. revisar que Docker o PostgreSQL esten funcionando
2. verificar `.env`
3. correr nuevamente `npm run db:setup`
4. reiniciar `npm run dev:web`

## Licencia / uso

Proyecto interno de PonchoCapital para pruebas y desarrollo.

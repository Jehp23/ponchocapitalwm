# PonchoCapital Wealth Portal MVP

## Vision general

PonchoCapital Wealth Portal es una capa privada de visualizacion para clientes wealth. No ejecuta operaciones, no reemplaza a Allaria y no busca ser autoservicio financiero. Su objetivo es presentar patrimonio, composicion, evolucion y ultima actualizacion dentro de una experiencia premium de marca PonchoCapital.

Principio rector del MVP: simplicidad operativa. El admin no deberia navegar un backoffice complejo; deberia poder hacer tres cosas rapido:

1. crear cliente,
2. crear portfolio,
3. registrar movimientos y mantener la cartera.

El flujo operativo del MVP es:

1. Un asesor o admin importa el Excel inicial desde Allaria.
2. El sistema crea la cartera base y guarda trazabilidad de la importacion.
3. Luego el equipo interno mantiene la cartera con actualizaciones manuales.
4. Cuando la informacion esta validada, el admin publica un snapshot visible para el cliente.

## Alcance exacto del MVP

### Imprescindible

- Login seguro con roles `ADMIN`, `ADVISOR`, `CLIENT`.
- Alta basica de clientes, portfolios y usuarios.
- Importacion inicial de Excel para bootstrap de cartera.
- Edicion y actualizacion manual posterior de holdings.
- Publicacion de snapshot visible al cliente.
- Dashboard cliente con patrimonio, composicion, evolucion y ultima actualizacion.
- Historial de actualizaciones y notas del asesor.
- Auditoria de cambios relevantes.

### Importante

- Revision de filas importadas con errores o warnings.
- Borrador interno antes de publicar.
- Visualizacion admin consolidada.
- Seeds demo y layout premium listos para iterar.

### Fuera del MVP

- Ejecucion de operaciones.
- Integracion API con Allaria.
- Conciliacion automatica compleja.
- Pricing market data en tiempo real.
- Workflows de aprobacion multinivel.

## Arquitectura recomendada

Se recomienda un monorepo liviano con separacion explicita entre frontend y backend.

Estructura:

- `apps/web`: frontend Next.js con UI, auth, layouts y experiencia cliente/admin.
- `apps/api`: backend TypeScript con rutas, logica de dominio, importacion y publishing.
- `prisma`: schema compartido del portal.
- `docs`: decisiones de producto y arquitectura.

Razones:

- mantiene orden de responsabilidades desde el inicio;
- evita mezclar UI con pipeline de importacion y trazabilidad;
- facilita crecer luego a despliegues independientes;
- preserva velocidad de MVP sin caer en un backoffice desordenado.

Capas backend:

- `routes`: superficie HTTP.
- `modules`: portfolio, imports, publishing, audit.
- `lib`: prisma y utilidades de infraestructura.

Capas frontend:

- `app`: rutas y layouts.
- `components`: piezas reutilizables.
- `modules`: queries, calculos y adaptadores de pantalla.
- `lib`: permisos, auth y helpers.

## Modelo de datos minimo pero correcto

- `User`: identidad y acceso.
- `Client`: cliente wealth y metadatos visibles.
- `Portfolio`: contenedor principal de holdings.
- `Asset`: activo normalizado.
- `PortfolioHolding`: estado vigente editable internamente.
- `PortfolioSnapshot`: version publicada o historica del portfolio.
- `PositionSnapshot`: holdings congelados dentro de un snapshot.
- `ImportBatch`: corrida de importacion inicial.
- `ImportRow`: trazabilidad fila por fila.
- `ManualUpdate`: cambios internos posteriores a la importacion.
- `AdvisorNote`: comentario del asesor, visible o interno.
- `AuditLog`: trazabilidad de acciones.

## Pantallas del MVP

### Cliente

- Login
- Resumen principal
- Movimientos o actualizaciones
- Perfil

### Admin

- Login
- Consola de operacion
- Clientes
- Importacion inicial desde Excel
- Carga manual de actualizacion / movimiento
- Auditoria basica

## Estrategia de importacion inicial + actualizaciones manuales

### Importacion inicial

- Se sube un Excel descargado desde Allaria.
- Se parsea la primera hoja con mapping configurable.
- Cada fila se valida y se guarda como `ImportRow`.
- Las filas validas crean o actualizan `Asset` y `PortfolioHolding`.
- El batch queda persistido con resumen y errores.

### Actualizaciones manuales

- El admin edita el estado vigente de `PortfolioHolding`.
- Cada cambio genera un `ManualUpdate` con payload estructurado.
- El snapshot publicado no cambia hasta que el admin publique una nueva version.
- El cliente siempre ve la ultima version publicada.

## Riesgos y mitigaciones

- Cambio en formato de Excel: mapping configurable y persistencia cruda.
- Confusion entre estado draft y publicado: modelo separado entre `PortfolioHolding` y `PortfolioSnapshot`.
- Riesgo reputacional por datos inconsistentes: auditoria, ultima actualizacion visible y flujo de publicacion.

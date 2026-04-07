-- Esquema de la base de datos D1 para Cute Studio Egresados
-- Ejecutar con: wrangler d1 execute cute-studio-egresados --remote --file=schema.sql

CREATE TABLE IF NOT EXISTS pedidos (
  id             INTEGER  PRIMARY KEY AUTOINCREMENT,
  nombre_alumno  TEXT     NOT NULL,
  curso          TEXT,
  talle          TEXT     NOT NULL DEFAULT 'M',
  color          TEXT,
  cantidad       INTEGER  NOT NULL DEFAULT 1,
  diseno         TEXT,
  imagen_url     TEXT,
  estado         TEXT     NOT NULL DEFAULT 'pendiente'
                          CHECK (estado IN ('pendiente','en_proceso','listo','entregado')),
  notas          TEXT,
  precio         REAL,
  seña           REAL     DEFAULT 0,
  fecha_pedido   TEXT     NOT NULL DEFAULT (datetime('now')),
  fecha_entrega  TEXT
);

-- Índices para acelerar búsquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_pedidos_estado        ON pedidos (estado);
CREATE INDEX IF NOT EXISTS idx_pedidos_nombre        ON pedidos (nombre_alumno);
CREATE INDEX IF NOT EXISTS idx_pedidos_fecha_pedido  ON pedidos (fecha_pedido DESC);

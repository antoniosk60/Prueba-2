-- SQL Schema for Cancha de Fútbol Rápido (MySQL / MariaDB)
-- Includes: Users, Reservations, Payments, Promotions, Photos, Teams, and Players

CREATE DATABASE IF NOT EXISTS futbol_rapido;
USE futbol_rapido;

-- 1. Tabla de Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    rol ENUM('user', 'admin') DEFAULT 'user',
    password_hash VARCHAR(255) NOT NULL, -- Para el administrador
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Reservas
-- Relación: Un usuario puede tener varias reservas
CREATE TABLE IF NOT EXISTS reservas (
    id VARCHAR(50) PRIMARY KEY,
    usuario_id VARCHAR(50),
    nombre_contacto VARCHAR(100) NOT NULL,
    email_contacto VARCHAR(100) NOT NULL,
    telefono_contacto VARCHAR(20) NOT NULL,
    fecha DATE NOT NULL,
    rango_hora VARCHAR(50) NOT NULL, -- Ej: "18:00 - 19:00"
    duracion DECIMAL(3,1) NOT NULL, -- Ej: 1.0 o 1.5 horas
    cancha_id VARCHAR(50) NOT NULL, -- Ej: "principal" o "secundaria"
    cancha_nombre VARCHAR(100) NOT NULL,
    con_luces BOOLEAN DEFAULT FALSE,
    con_balones BOOLEAN DEFAULT FALSE,
    con_casacas BOOLEAN DEFAULT FALSE,
    con_arbitro BOOLEAN DEFAULT FALSE,
    total_precio DECIMAL(10,2) NOT NULL,
    estado ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
    estado_pago ENUM('pending', 'paid') DEFAULT 'pending',
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- Indexar para optimizar búsquedas por fecha de reservación
CREATE INDEX idx_reservas_fecha_hora ON reservas(fecha, rango_hora);

-- 3. Tabla de Pagos
-- Relación: Una reserva puede estar asociada a un pago (1-a-1 o 1-a-Muchos)
CREATE TABLE IF NOT EXISTS pagos (
    id VARCHAR(50) PRIMARY KEY,
    reserva_id VARCHAR(50) NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    metodo_pago ENUM('stripe', 'paypal', 'whatsapp_transfer', 'cash') NOT NULL,
    transaccion_id VARCHAR(100),
    estado ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reserva_id) REFERENCES reservas(id) ON DELETE CASCADE
);

-- 4. Tabla de Promociones
-- Promociones y torneos mostrados en la página principal
CREATE TABLE IF NOT EXISTS promociones (
    id VARCHAR(50) PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT NOT NULL,
    porcentaje_descuento INT DEFAULT 0,
    codigo_promo VARCHAR(50) NULL,
    valido_hasta DATE NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    tipo VARCHAR(50) DEFAULT 'discount' -- 'discount', 'tournament', 'special'
);

-- 5. Tabla de Fotos (Galería administrable)
CREATE TABLE IF NOT EXISTS fotos (
    id VARCHAR(50) PRIMARY KEY,
    url VARCHAR(255) NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    categoria ENUM('facilities', 'matches', 'events') DEFAULT 'facilities',
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Tabla de Equipos
-- Relaciones: Un equipo puede tener varios jugadores
CREATE TABLE IF NOT EXISTS equipos (
    id VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    color_uniforme VARCHAR(50) NOT NULL,
    contacto_capitan VARCHAR(100) NOT NULL,
    goles_favor INT DEFAULT 0,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Tabla de Jugadores
-- Relaciones: Los jugadores pertenecen a un solo equipo (Relación Muchos-a-Uno)
CREATE TABLE IF NOT EXISTS jugadores (
    id VARCHAR(50) PRIMARY KEY,
    equipo_id VARCHAR(50) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    edad INT NOT NULL,
    posicion VARCHAR(50) NOT NULL, -- Ej: "Portero", "Delantero", "Defensa"
    contacto VARCHAR(100),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (equipo_id) REFERENCES equipos(id) ON DELETE CASCADE
);


-- SEED DATA DE PRUEBA (Opcional - para pruebas iniciales)
-- Contraseña de administrador por defecto: "admin123" (encriptada con bcrypt en producción)
-- Insertar administrador por defecto
INSERT INTO usuarios (id, nombre, email, telefono, rol, password_hash)
VALUES ('admin-01', 'Administrador Cancha', 'admin@canchafutbol.com', '+525512345678', 'admin', '$2b$10$7Z2uW2MhNq9D9fB7bC7oOOW27z4R/vPeNqE/sI7Z0XW8r6k587QW6')
ON DUPLICATE KEY UPDATE id=id;

-- Insertar promociones de prueba
INSERT INTO promociones (id, titulo, descripcion, porcentaje_descuento, codigo_promo, valido_hasta, activo, tipo)
VALUES 
('promo-01', 'Lunes Futbolero', '20% de descuento en alquiler de canchas de lunes a miércoles antes de las 17:00 Hrs.', 20, 'LUNESFUT', '2026-12-31', 1, 'discount'),
('promo-02', 'Torneo de Verano 2026', '¡Inscríbete ya! Copa Nocturna con grandes premios en efectivo. Inicio de inscripciones en Junio 2026.', 0, 'COPANOCTURNA', '2026-06-30', 1, 'tournament'),
('promo-03', 'Promoción Estudiantes', 'Presenta tu credencial de estudiante y obtén un 15% de descuento en horario nocturno.', 15, 'ALUMNOS', '2026-12-31', 1, 'discount')
ON DUPLICATE KEY UPDATE id=id;

-- Insertar fotos iniciales
INSERT INTO fotos (id, url, titulo, categoria)
VALUES 
('photo-01', 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1200', 'Cancha Principal Techada con Pasto Sintético Premium', 'facilities'),
('photo-02', 'https://images.unsplash.com/photo-1544698310-74ea9d1c8258?q=80&w=1200', 'Disfruta de partidos emocionantes en la noche', 'matches'),
('photo-03', 'https://images.unsplash.com/photo-1510566337590-2fc1f21d0faa?q=80&w=1200', 'Iluminación LED Profesional para juegos nocturnos nocturna', 'facilities'),
('photo-04', 'https://images.unsplash.com/photo-1579952362864-a623513132a4?q=80&w=1200', 'Entrenamiento y torneos locales los fines de semana', 'events')
ON DUPLICATE KEY UPDATE id=id;

-- Insertar equipos de prueba
INSERT INTO equipos (id, nombre, color_uniforme, contacto_capitan, goles_favor)
VALUES
('team-01', 'Galeones F.C.', 'Azul y Negro', 'Adrián Perea (+5255392817)', 23),
('team-02', 'Deportivo Cuervos', 'Negro Mate', 'Hugo Sánchez (+5255483921)', 19),
('team-03', 'Titanes del Rápido', 'Verde Eléctrico', 'Mateo Reyes (+5255741829)', 31)
ON DUPLICATE KEY UPDATE id=id;

-- Insertar jugadores de prueba
INSERT INTO jugadores (id, equipo_id, nombre, edad, posicion, contacto)
VALUES
('player-01', 'team-01', 'Adrián Perea', 27, 'Defensa / Capitán', '+5255392817'),
('player-02', 'team-01', 'Santiago López', 24, 'Medio', '+5255849301'),
('player-03', 'team-01', 'Daniel Ortiz', 26, 'Delantero', '+5255319203'),
('player-04', 'team-02', 'Hugo Sánchez Jr', 23, 'Delantero / Capitán', '+5255483921'),
('player-05', 'team-02', 'Gerardo Torrado', 29, 'Defensa', '+5255938472'),
('player-06', 'team-03', 'Mateo Reyes', 25, 'Medio / Capitán', '+5255741829'),
('player-07', 'team-03', 'Esteban Paredes', 28, 'Delantero', '+5255019283'),
('player-08', 'team-03', 'Chuy Corona', 31, 'Portero', '+5255374829')
ON DUPLICATE KEY UPDATE id=id;

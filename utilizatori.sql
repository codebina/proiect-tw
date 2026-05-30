DROP TABLE IF EXISTS utilizatori CASCADE;
DROP TABLE IF EXISTS accesari CASCADE;

DROP TYPE IF EXISTS roluri CASCADE;

CREATE TYPE roluri AS ENUM ('admin', 'moderator', 'comun');

CREATE TABLE utilizatori (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    nume VARCHAR(100) NOT NULL,
    prenume VARCHAR(100) NOT NULL,
    parola VARCHAR(500) NOT NULL,
    rol roluri NOT NULL DEFAULT 'comun',
    email VARCHAR(100) NOT NULL,
    culoare_chat VARCHAR(50) NOT NULL,
    data_adaugare TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cod VARCHAR(200),
    confirmat_mail BOOLEAN DEFAULT FALSE,
    poza VARCHAR(200)
);

CREATE TABLE accesari (
    id SERIAL PRIMARY KEY,
    ip VARCHAR(100) NOT NULL,
    user_id INT NULL REFERENCES utilizatori(id) ON DELETE SET NULL,
    pagina VARCHAR(500) NOT NULL,
    data_accesare TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

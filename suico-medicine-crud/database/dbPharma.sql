-- ============================================================
--  Name     : Jannine Daeve Suico
--  Section  : INF241
--  Activity : Medicine Management (React JS + PHP + MySQL CRUD)
--  File     : database/dbPharma.sql
-- ============================================================

-- 1. Create the database
CREATE DATABASE IF NOT EXISTS dbPharma
    DEFAULT CHARACTER SET utf8mb4
    COLLATE utf8mb4_general_ci;

USE dbPharma;

-- 2. Create the medicine table
DROP TABLE IF EXISTS tblMedicine;

CREATE TABLE tblMedicine (
    medicineID        INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    brandName         VARCHAR(100)  NOT NULL,
    genericName       VARCHAR(150)  NOT NULL,
    dateManufactured  DATE          NOT NULL,
    dateExpired       DATE          NOT NULL,
    manufacturer      VARCHAR(100)  NOT NULL,
    batchNumber       VARCHAR(20)   NOT NULL,

    -- Constraints
    CONSTRAINT pk_tblMedicine  PRIMARY KEY (medicineID),
    CONSTRAINT uq_batchNumber  UNIQUE (batchNumber),
    CONSTRAINT chk_notBlank    CHECK (brandName <> '' AND genericName <> '' AND manufacturer <> '' AND batchNumber <> ''),
    CONSTRAINT chk_dateExpired CHECK (dateExpired > dateManufactured)
) ENGINE = InnoDB;

-- 3. Sample records
INSERT INTO tblMedicine
    (brandName, genericName, dateManufactured, dateExpired, manufacturer, batchNumber)
VALUES
    ('Diatabs',       'Loperamide',                      '2024-06-20', '2026-06-19', 'United Laboratories, Inc.', 'DIA240620'),
    ('Ascof Lagundi', 'Lagundi (Vitex negundo L.) Leaf', '2024-11-05', '2027-11-04', 'Pascual Laboratories, Inc.', 'ASC241105'),
    ('Alaxan FR',     'Ibuprofen + Paracetamol',         '2025-03-18', '2028-03-17', 'United Laboratories, Inc.', 'ALX250318'),
    ('Allerta',       'Loratadine',                      '2025-08-02', '2028-08-01', 'United Laboratories, Inc.', 'ALR250802'),
    ('Ventolin',      'Salbutamol',                      '2026-01-12', '2028-01-11', 'GlaxoSmithKline',           'VEN260112');

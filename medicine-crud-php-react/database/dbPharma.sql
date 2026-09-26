-- ============================================================
--  Activity : Medicine Management (React JS + PHP + MySQL)
--  Name     : Jules Aron P. Timbas
--  Section  : INF241
-- ============================================================

-- 1. Create the database
CREATE DATABASE IF NOT EXISTS dbPharma
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_general_ci;

USE dbPharma;

-- 2. Create the medicine table
CREATE TABLE IF NOT EXISTS tblMedicine (
    id                 INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    brand_name         VARCHAR(100)  NOT NULL,
    generic_name       VARCHAR(100)  NOT NULL,
    date_manufactured  DATE          NOT NULL,
    date_expired       DATE          NOT NULL,
    manufacturer       VARCHAR(150)  NOT NULL,
    batch_number       VARCHAR(50)   NOT NULL,

    PRIMARY KEY (id),
    CONSTRAINT uq_batch_number UNIQUE (batch_number),
    CONSTRAINT chk_expiry_date CHECK (date_expired > date_manufactured)
) ENGINE = InnoDB;

-- 3. Sample records
INSERT INTO tblMedicine
    (brand_name, generic_name, date_manufactured, date_expired, manufacturer, batch_number)
VALUES
    ('Biogesic', 'Paracetamol', '2025-03-12', '2028-03-11', 'Unilab, Inc.', 'BGS-2503-118'),
    ('Neozep Forte', 'Phenylephrine + Chlorphenamine + Paracetamol', '2024-11-05', '2026-11-04', 'Unilab, Inc.', 'NZF-2411-052'),
    ('Amoxil', 'Amoxicillin', '2023-08-21', '2025-08-20', 'GlaxoSmithKline', 'AMX-2308-204'),
    ('Lipitor', 'Atorvastatin Calcium', '2025-06-02', '2028-06-01', 'Pfizer, Inc.', 'LPT-2506-331'),
    ('Solmux', 'Carbocisteine', '2025-07-15', '2027-07-14', 'Unilab, Inc.', 'SMX-2507-087');

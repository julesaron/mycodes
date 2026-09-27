# Medicine Management – React JS + PHP + MySQL (CRUD)

**Name:** Jannine Daeve Suico
**Section:** INF241

Create, read, update and delete medicine records. The React JS page calls a PHP (PDO) API, which saves
the data in MySQL.

- Database: `dbPharma`
- Table: `tblMedicine`

## Table structure (`tblMedicine`)

| Column             | Data type      | Constraints                                         |
| ------------------ | -------------- | --------------------------------------------------- |
| `medicineID`       | `INT UNSIGNED` | `PRIMARY KEY`, `AUTO_INCREMENT`, `NOT NULL`         |
| `brandName`        | `VARCHAR(100)` | `NOT NULL`, not blank                               |
| `genericName`      | `VARCHAR(150)` | `NOT NULL`, not blank                               |
| `dateManufactured` | `DATE`         | `NOT NULL`                                          |
| `dateExpired`      | `DATE`         | `NOT NULL`, `CHECK (dateExpired > dateManufactured)` |
| `manufacturer`     | `VARCHAR(100)` | `NOT NULL`, not blank                               |
| `batchNumber`      | `VARCHAR(20)`  | `NOT NULL`, `UNIQUE`, not blank                     |

## Folders

```
database/dbPharma.sql   creates dbPharma, tblMedicine and 5 sample records
htdocs/api/db.php       database connection (PDO)
htdocs/api/index.php    API: GET = read, POST = create, PUT = update, DELETE = delete
medicine-app/           React JS (Vite) – the page is src/App.jsx
submission/             screenshots, Word file and PDF
```

## How to run (XAMPP)

1. Start **Apache** and **MySQL** in the XAMPP Control Panel.
2. Open http://localhost/phpmyadmin → **Import** → choose `database/dbPharma.sql` → **Import**.
3. Copy the `htdocs/api` folder to `C:\xampp\htdocs\` (you should have `C:\xampp\htdocs\api\index.php`).
   Opening http://localhost/api/index.php should show the medicines as JSON.
4. Run the React app (needs Node.js 20.19+ or 22.12+), then open http://localhost:5173

   ```
   cd medicine-app
   npm install
   npm run dev
   ```

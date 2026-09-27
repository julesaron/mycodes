# Medicine Management – React JS + PHP + MySQL (CRUD)

**Name:** Jules Aron P. Timbas
**Section:** INF241

A pharmacy medicine management page where medicines can be **created, read, updated and deleted**.
The React JS front end sends requests to a PHP (PDO) API that is connected to a MySQL database.

- Database: `dbPharma`
- Table: `tblMedicine`

## Table structure (`tblMedicine`)

| Column              | Data type      | Constraints                                        |
| ------------------- | -------------- | -------------------------------------------------- |
| `id`                | `INT UNSIGNED` | `PRIMARY KEY`, `AUTO_INCREMENT`, `NOT NULL`        |
| `brand_name`        | `VARCHAR(100)` | `NOT NULL`                                         |
| `generic_name`      | `VARCHAR(100)` | `NOT NULL`                                         |
| `date_manufactured` | `DATE`         | `NOT NULL`                                         |
| `date_expired`      | `DATE`         | `NOT NULL`, `CHECK (date_expired > date_manufactured)` |
| `manufacturer`      | `VARCHAR(150)` | `NOT NULL`                                         |
| `batch_number`      | `VARCHAR(50)`  | `NOT NULL`, `UNIQUE`                               |

## Folders

```
database/dbPharma.sql   creates the database, the table and 5 sample records
htdocs/api/db.php       database connection (PDO)
htdocs/api/index.php    API: GET (read), POST (create), PUT (update), DELETE (delete)
react-app/              React JS front end (Vite) – the page is in src/App.jsx
submission/             PDF with the screenshots of the code and the output
submission/design-2/    second design (blue theme): App.jsx, favicon.svg, screenshots and a Word file
```

To use design 2, copy `submission/design-2/App.jsx` to `react-app/src/App.jsx` and
`submission/design-2/favicon.svg` to `react-app/public/favicon.svg`. Only the look changes – the CRUD code is the same.

## How to run (XAMPP)

1. Open the XAMPP Control Panel and start **Apache** and **MySQL**.
2. Go to http://localhost/phpmyadmin → **Import** → choose `database/dbPharma.sql` → **Import/Go**.
3. Copy the `htdocs/api` folder into `C:\xampp\htdocs\` so you have `C:\xampp\htdocs\api\index.php`.
   Check it by opening http://localhost/api/index.php – it should show the medicines as JSON.
4. Start the React app:

   ```
   cd react-app
   npm install
   npm run dev
   ```

   Then open http://localhost:5173

## API (`http://localhost/api/index.php`)

| Method   | JSON body                                                                                   | Result                   |
| -------- | ------------------------------------------------------------------------------------------- | ------------------------ |
| `GET`    | –                                                                                           | list of all medicines    |
| `POST`   | `brand_name`, `generic_name`, `date_manufactured`, `date_expired`, `manufacturer`, `batch_number` | adds a medicine          |
| `PUT`    | `id` + the six fields above                                                                 | updates a medicine       |
| `DELETE` | `id`                                                                                        | deletes a medicine       |

Validation (React and PHP): all fields are required, dates must be real dates, the date manufactured
cannot be a future date, the date expired must be later than the date manufactured, and the batch
number must not be used by another medicine.

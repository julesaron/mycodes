<?php
/*
 * Name     : Jannine Daeve Suico
 * Section  : INF241
 * Activity : Medicine Management (React JS + PHP + MySQL CRUD)
 * File     : htdocs/api/index.php - Create, Read, Update and Delete API
 */
require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

// Checks the medicine data sent by React. Returns an error message, or null if valid.
function validateMedicine($data) {
    $fields = ["brandName", "genericName", "dateManufactured", "dateExpired", "manufacturer", "batchNumber"];

    foreach ($fields as $field) {
        $value = $data->$field ?? null;
        if (!is_string($value) || trim($value) === "") {
            return "Incomplete data";
        }
    }
    if (!isValidDate($data->dateManufactured) || !isValidDate($data->dateExpired)) {
        return "Invalid date. Please use the format YYYY-MM-DD";
    }
    if ($data->dateExpired <= $data->dateManufactured) {
        return "Date Expired must be later than Date Manufactured";
    }
    return null;
}

// Returns true if $date is a real calendar date in YYYY-MM-DD format
function isValidDate($date) {
    $d = DateTime::createFromFormat("Y-m-d", $date);
    return $d !== false && $d->format("Y-m-d") === $date;
}

// Values for the named placeholders of the INSERT and UPDATE queries
function medicineValues($data) {
    return [
        ":brandName"        => trim($data->brandName),
        ":genericName"      => trim($data->genericName),
        ":dateManufactured" => $data->dateManufactured,
        ":dateExpired"      => $data->dateExpired,
        ":manufacturer"     => trim($data->manufacturer),
        ":batchNumber"      => trim($data->batchNumber),
    ];
}

try {
    switch ($method) {
        // 1. READ (Get all medicines)
        case 'GET':
            $stmt = $conn->prepare("SELECT * FROM tblMedicine ORDER BY medicineID DESC");
            $stmt->execute();
            $medicines = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($medicines);
            break;

        // 2. CREATE (Add a new medicine)
        case 'POST':
            $data = json_decode(file_get_contents("php://input"));
            $error = validateMedicine($data);

            if ($error === null) {
                $stmt = $conn->prepare("INSERT INTO tblMedicine
                        (brandName, genericName, dateManufactured, dateExpired, manufacturer, batchNumber)
                    VALUES
                        (:brandName, :genericName, :dateManufactured, :dateExpired, :manufacturer, :batchNumber)");

                if ($stmt->execute(medicineValues($data))) {
                    echo json_encode(["status" => "success", "message" => "Medicine added successfully"]);
                } else {
                    echo json_encode(["status" => "error", "message" => "Failed to add medicine"]);
                }
            } else {
                echo json_encode(["status" => "error", "message" => $error]);
            }
            break;

        // 3. UPDATE (Edit medicine details)
        case 'PUT':
            $data = json_decode(file_get_contents("php://input"));
            $error = empty($data->medicineID) ? "Invalid ID" : validateMedicine($data);

            if ($error === null) {
                $stmt = $conn->prepare("UPDATE tblMedicine SET
                        brandName = :brandName,
                        genericName = :genericName,
                        dateManufactured = :dateManufactured,
                        dateExpired = :dateExpired,
                        manufacturer = :manufacturer,
                        batchNumber = :batchNumber
                    WHERE medicineID = :medicineID");

                $values = medicineValues($data);
                $values[":medicineID"] = $data->medicineID;

                if ($stmt->execute($values)) {
                    echo json_encode(["status" => "success", "message" => "Medicine updated successfully"]);
                } else {
                    echo json_encode(["status" => "error", "message" => "Failed to update medicine"]);
                }
            } else {
                echo json_encode(["status" => "error", "message" => $error]);
            }
            break;

        // 4. DELETE (Remove medicine)
        case 'DELETE':
            $data = json_decode(file_get_contents("php://input"));

            if (!empty($data->medicineID)) {
                $stmt = $conn->prepare("DELETE FROM tblMedicine WHERE medicineID = :medicineID");

                if ($stmt->execute([":medicineID" => $data->medicineID])) {
                    echo json_encode(["status" => "success", "message" => "Medicine deleted successfully"]);
                } else {
                    echo json_encode(["status" => "error", "message" => "Failed to delete medicine"]);
                }
            } else {
                echo json_encode(["status" => "error", "message" => "Invalid ID"]);
            }
            break;

        // CORS preflight: the browser sends OPTIONS first before POST, PUT and DELETE
        case 'OPTIONS':
            http_response_code(200);
            break;

        default:
            echo json_encode(["status" => "error", "message" => "Method Not Allowed"]);
            break;
    }
} catch (PDOException $e) {
    // Error 1062 = duplicate value in a UNIQUE column (batchNumber)
    if (($e->errorInfo[1] ?? 0) == 1062) {
        echo json_encode(["status" => "error", "message" => "Batch Number already exists"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
    }
}
?>

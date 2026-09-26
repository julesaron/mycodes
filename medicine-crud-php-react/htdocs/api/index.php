<?php
require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

// Reads the six medicine fields sent by React and removes extra spaces
function getMedicineData($data) {
    $fields = ['brand_name', 'generic_name', 'date_manufactured', 'date_expired', 'manufacturer', 'batch_number'];
    $medicine = [];

    foreach ($fields as $field) {
        $value = $data->$field ?? '';
        $medicine[$field] = is_scalar($value) ? trim((string) $value) : '';
    }
    return $medicine;
}

// Checks the medicine details. Returns an error message, or null if everything is valid.
function validateMedicine($medicine) {
    $labels = [
        'brand_name'        => 'Brand name',
        'generic_name'      => 'Generic name',
        'date_manufactured' => 'Date manufactured',
        'date_expired'      => 'Date expired',
        'manufacturer'      => 'Manufacturer',
        'batch_number'      => 'Batch number',
    ];
    $maxLength = ['brand_name' => 100, 'generic_name' => 100, 'manufacturer' => 150, 'batch_number' => 50];

    foreach ($labels as $field => $label) {
        if ($medicine[$field] === '') {
            return "$label is required";
        }
        if (isset($maxLength[$field]) && mb_strlen($medicine[$field]) > $maxLength[$field]) {
            return "$label must not be longer than {$maxLength[$field]} characters";
        }
    }

    if (!isValidDate($medicine['date_manufactured']) || !isValidDate($medicine['date_expired'])) {
        return "Please enter valid dates (YYYY-MM-DD)";
    }
    if ($medicine['date_manufactured'] > date('Y-m-d')) {
        return "Date manufactured cannot be a future date";
    }
    if ($medicine['date_expired'] <= $medicine['date_manufactured']) {
        return "Date expired must be later than date manufactured";
    }
    return null;
}

// Returns true if the text is a real calendar date in YYYY-MM-DD format
function isValidDate($date) {
    $d = DateTime::createFromFormat('Y-m-d', $date);
    return $d && $d->format('Y-m-d') === $date;
}

// Returns the ID sent by React as a whole number, or false if it is not a valid ID
function getId($data) {
    return filter_var($data->id ?? null, FILTER_VALIDATE_INT, ["options" => ["min_range" => 1]]);
}

// Returns true if a medicine with this ID exists
function medicineExists($conn, $id) {
    $stmt = $conn->prepare("SELECT COUNT(*) FROM tblMedicine WHERE id = :id");
    $stmt->execute(['id' => $id]);
    return $stmt->fetchColumn() > 0;
}

// Turns a database error into a message that is easy to understand
function dbError($e) {
    if (($e->errorInfo[1] ?? 0) == 1062) {
        return "Batch number already exists. Please use a different batch number.";
    }
    return "Database error: " . $e->getMessage();
}

try {
    switch ($method) {
        // 1. READ (Get all medicines)
        case 'GET':
            $stmt = $conn->prepare("SELECT * FROM tblMedicine ORDER BY id DESC");
            $stmt->execute();
            $medicines = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($medicines);
            break;

        // 2. CREATE (Add a new medicine)
        case 'POST':
            $data = json_decode(file_get_contents("php://input"));
            $medicine = getMedicineData($data);
            $error = validateMedicine($medicine);

            if ($error === null) {
                $stmt = $conn->prepare("INSERT INTO tblMedicine
                    (brand_name, generic_name, date_manufactured, date_expired, manufacturer, batch_number)
                    VALUES (:brand_name, :generic_name, :date_manufactured, :date_expired, :manufacturer, :batch_number)");
                $stmt->execute($medicine);
                echo json_encode(["status" => "success", "message" => "Medicine added successfully"]);
            } else {
                echo json_encode(["status" => "error", "message" => $error]);
            }
            break;

        // 3. UPDATE (Edit medicine details)
        case 'PUT':
            $data = json_decode(file_get_contents("php://input"));
            $id = getId($data);
            $medicine = getMedicineData($data);
            $error = validateMedicine($medicine);

            if (!$id || !medicineExists($conn, $id)) {
                echo json_encode(["status" => "error", "message" => "Medicine not found"]);
            } elseif ($error !== null) {
                echo json_encode(["status" => "error", "message" => $error]);
            } else {
                $medicine['id'] = $id;
                $stmt = $conn->prepare("UPDATE tblMedicine SET
                    brand_name = :brand_name, generic_name = :generic_name,
                    date_manufactured = :date_manufactured, date_expired = :date_expired,
                    manufacturer = :manufacturer, batch_number = :batch_number
                    WHERE id = :id");
                $stmt->execute($medicine);
                echo json_encode(["status" => "success", "message" => "Medicine updated successfully"]);
            }
            break;

        // 4. DELETE (Remove medicine)
        case 'DELETE':
            $data = json_decode(file_get_contents("php://input"));
            $id = getId($data);

            if ($id) {
                $stmt = $conn->prepare("DELETE FROM tblMedicine WHERE id = :id");
                $stmt->bindParam(':id', $id);
                $stmt->execute();

                if ($stmt->rowCount() > 0) {
                    echo json_encode(["status" => "success", "message" => "Medicine deleted successfully"]);
                } else {
                    echo json_encode(["status" => "error", "message" => "Medicine not found"]);
                }
            } else {
                echo json_encode(["status" => "error", "message" => "Invalid ID"]);
            }
            break;

        default:
            echo json_encode(["status" => "error", "message" => "Method Not Allowed"]);
            break;
    }
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => dbError($e)]);
}
?>

<?php
/*
 * Name     : Jannine Daeve Suico
 * Section  : INF241
 * Activity : Medicine Management (React JS + PHP + MySQL CRUD)
 * File     : htdocs/api/db.php - database connection
 */
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: *");
header("Content-Type: application/json; charset=UTF-8");

$host = "localhost";
$user = "root";
$pass = ""; // default xampp password is empty
$dbname = "dbPharma";

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $user, $pass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Connection failed: " . $e->getMessage()]);
    exit();
}
?>

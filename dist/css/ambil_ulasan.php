<?php
include 'koneksi.php';

header('Content-Type: application/json');

$query = "SELECT * FROM ulasan ORDER BY id DESC";
$result = mysqli_query($conn, $query);

$ulasan = [];
while ($row = mysqli_fetch_assoc($result)) {
    $ulasan[] = $row;
}

echo json_encode($ulasan);
?>
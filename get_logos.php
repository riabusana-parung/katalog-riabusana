<?php
// d:\xampp\htdocs\rb-katalog-fashion\get_logos.php

header('Content-Type: application/json');

$dir = 'assets/images/logo/';
$logos = [];

if (is_dir($dir)) {
    $files = scandir($dir);
    foreach ($files as $file) {
        if ($file === '.' || $file === '..') continue;
        
        $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
        if (in_array($ext, ['png', 'jpg', 'jpeg', 'webp', 'svg'])) {
            $logos[] = $dir . $file;
        }
    }
}

// Acak urutan logo di sisi server
shuffle($logos);

// Simpan ke logos.json agar bisa terbaca di GitHub Pages (hosting statis)
file_put_contents('logos.json', json_encode($logos));

// Output untuk penggunaan lokal
echo json_encode($logos);
?>
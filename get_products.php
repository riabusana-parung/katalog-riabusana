<?php
// d:\SOFT\XAMP\katalog-fashion\get_products.php

header('Content-Type: application/json');
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");

// Folder utama tempat gambar produk disimpan
$baseDir = 'assets/images/ekatalog/';
$products = [];

// Cek apakah folder ada
if (is_dir($baseDir)) {
    // Scan folder kategori (ANAK, PRIA, WANITA, dll)
    $categories = scandir($baseDir);
    
    foreach ($categories as $category) {
        if ($category === '.' || $category === '..') continue;
        
        $categoryLower = strtolower($category); // Ubah nama kategori ke huruf kecil
        $categoryPath = $baseDir . $category; // Path asli untuk membaca file
        
        // Pastikan ini adalah folder
        if (is_dir($categoryPath)) {
            $files = scandir($categoryPath);
            
            foreach ($files as $file) {
                if ($file === '.' || $file === '..') continue;
                
                // Ambil ekstensi file
                $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
                
                // Hanya ambil file gambar
                if (in_array($ext, ['jpg', 'jpeg', 'png', 'webp'])) {
                    $filePath = $baseDir . $categoryLower . '/' . $file; // Buat path baru dengan folder huruf kecil
                    $realFilePath = $categoryPath . '/' . $file; // Path asli untuk cek filemtime
                    
                    // LOGIKA BARU: Dianggap "New" jika nama file mengandung 'new' DAN umurnya kurang dari 7 hari.
                    $containsNew = stripos($file, 'new') !== false;
                    $fileAgeInSeconds = time() - filemtime($realFilePath);
                    $isRecent = $fileAgeInSeconds < (7 * 24 * 60 * 60); // 7 hari dalam detik

                    // Keduanya harus true agar label "New" muncul
                    $isNew = $containsNew && $isRecent;
                    
                    $products[] = [
                        'src' => "./" . $filePath,      // Path gambar untuk HTML
                        'filter' => $categoryLower, // Nama folder jadi kategori filter
                        'isNew' => $isNew
                    ];
                }
            }
        }
    }
}

// Output data dalam format JSON
echo json_encode($products);
?>

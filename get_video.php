<?php
// d:\xampp\htdocs\rb-katalog-fashion\get_videos.php

header('Content-Type: application/json');

// Folder tempat video disimpan
$baseDir = 'assets/media/';
$videos = [];

if (is_dir($baseDir)) {
    $files = scandir($baseDir);
    
    foreach ($files as $file) {
        if ($file === '.' || $file === '..') continue;
        
        // Ambil ekstensi file
        $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
        
        // Hanya ambil file video
        if (in_array($ext, ['mp4', 'webm', 'ogg'])) {
            // Bersihkan nama file untuk judul (hilangkan ekstensi dan ganti tanda hubung dengan spasi)
            $name = pathinfo($file, PATHINFO_FILENAME);
            $name = str_replace(['-', '_'], ' ', $name);
            $name = ucwords($name);

            $videos[] = [
                'src' => "./" . $baseDir . $file,
                'title' => $name,
                'type' => "video/" . $ext
            ];
        }
    }
}

echo json_encode($videos);
?>

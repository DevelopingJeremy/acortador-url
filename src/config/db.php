<?php
    // Conexión a la base de datos
    global $conn;
    $conn = new mysqli(
        'localhost', // HOST
        'root', // USER
        'root', // PASSWORD
        'acortador'  // DB_NAME
    );

    // Verificar conexión
    if ($conn->connect_error) {
        die("Conexión fallida: " . $conn->connect_error);
    }

    // Establecer codificación UTF-8
    $conn->set_charset("utf8");
?>

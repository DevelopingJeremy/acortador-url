<?php
require_once __DIR__ . "/includes/cors.php";
require_once __DIR__ . "/includes/constantes.php";
    require_once __DIR__ . "/../config/db.php";

    // Verificar metodo
    if ($_SERVER['REQUEST_METHOD'] != 'POST') {
        // Metodo no permitido
        http_response_code(405);
        echo json_encode([
            'success'=>false,
            'message'=>"Método no permitido"
        ]);
        exit;
    }

    try {

        // Obtener datos de body
        $data = json_decode(file_get_contents("php://input"), true);

        if (!$data || !isset($data['codigo'])) {
            // Datos faltantes
            http_response_code(400);
            echo json_encode([
                'success'=>false,
                'message'=>"Datos faltantes"
            ]);
            exit;
        }

        $url = $data['codigo'];
        $limpia = filter_var($url, FILTER_SANITIZE_URL);

        // Encontrar URL
        $stmt = $conn->prepare("SELECT url_vieja FROM urls WHERE url_nueva = ?");
        $stmt->bind_param("s", $limpia);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows == 1) {
            $row = $result->fetch_assoc();

            // Aumentar Link
            $stmt = $conn->prepare("UPDATE urls SET clicks = clicks + 1 WHERE url_nueva = ?;");
            $stmt->bind_param("s", $limpia);

            if ($stmt->execute()) {
                // Aumento de clicks exitoso
                echo json_encode([
                    'success' => true,
                    'message'=> "Redirigiendo al link",
                    'url' => $row['url_vieja']
                ]);
            } else {
                // No se aumenta el click
                throw new Exception("Error al aumentar link");
            }

            $stmt->close();
        } else {
            // No se encuentra el link.
            throw new Exception("No se ha encontrado el link.");
        }


    } catch (Exception $e) {
        // Error al acortar link
        http_response_code(500);
        echo json_encode([
            'success'=>false,
            'message'=>"Error al redirigir: " . $e->getMessage()
        ]);
        exit;
    }


?>
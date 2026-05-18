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

        if (!$data || !isset($data['url'])) {
            // Datos faltantes
            http_response_code(400);
            echo json_encode([
                'success'=>false,
                'message'=>"Datos faltantes"
            ]);
            exit;
        }

        $url = $data['url'];

        // Validar que la URL sea real
        if (!filter_var($url, FILTER_VALIDATE_URL)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => "URL inválida"]);
            exit;
        }

        // Generar ID
        function generarIdCorto($longitud = 6) {
            $caracteres = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
            $maxIndex = strlen($caracteres) - 1;
            $id = '';
            
            for ($i = 0; $i < $longitud; $i++) {
                $id .= $caracteres[random_int(0, $maxIndex)];
            }

            return $id;
        }

        $codigoNuevo = generarIdCorto();

        $stmt = $conn->prepare("INSERT INTO urls(url_vieja, url_nueva) VALUES (?,?)");
        $stmt->bind_param("ss", $url, $codigoNuevo);

        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'message'=> "URL acortada correctamente",
                'url_recibida' => $url,
                'url_nueva' => $dominio . '?u=' . $codigoNuevo
            ]);
            exit;
        } else {
            throw new Exception("Error al ejecutar el insert: " . $stmt->error);
        }

    } catch (Exception $e) {
        // Error al acortar link
        http_response_code(500);
        echo json_encode([
            'success'=>false,
            'message'=>"Error al acortar link" . $e->getMessage()
        ]);
        exit;
    }


?>
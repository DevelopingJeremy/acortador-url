<?php
    require_once __DIR__ . "/includes/cors.php";
    require_once __DIR__ . "/../../vendor/autoload.php";

    use Endroid\QrCode\Builder\Builder;
    use Endroid\QrCode\Encoding\Encoding;
    use Endroid\QrCode\ErrorCorrectionLevel;
    use Endroid\QrCode\RoundBlockSizeMode;
    use Endroid\QrCode\Writer\PngWriter;

    if ($_SERVER['REQUEST_METHOD'] != 'POST') {
        http_response_code(405);
        echo json_encode([
            'success' => false,
            'message' => "Metodo no permitido"
        ]);
        exit;
    }

    try {
        if (!isset($_POST['url'])) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => "Datos faltantes"
            ]);
            exit;
        }

        $url = trim($_POST['url']);

        if (!filter_var($url, FILTER_VALIDATE_URL)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => "URL invalida"
            ]);
            exit;
        }

        $logoPath = '';
        $logoResizeToWidth = null;

        if (isset($_FILES['logo']) && $_FILES['logo']['error'] !== UPLOAD_ERR_NO_FILE) {
            if ($_FILES['logo']['error'] !== UPLOAD_ERR_OK) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => "No se pudo subir la imagen"
                ]);
                exit;
            }

            if ($_FILES['logo']['size'] > 2 * 1024 * 1024) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => "La imagen no debe superar 2 MB"
                ]);
                exit;
            }

            $mimeType = mime_content_type($_FILES['logo']['tmp_name']);
            $allowedMimeTypes = ['image/png', 'image/jpeg', 'image/webp'];

            if (!in_array($mimeType, $allowedMimeTypes, true)) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => "La imagen debe ser PNG, JPG o WebP"
                ]);
                exit;
            }

            $logoPath = $_FILES['logo']['tmp_name'];
            $logoResizeToWidth = 120;
        }

        $builder = new Builder(
            writer: new PngWriter(),
            writerOptions: [],
            validateResult: false,
            data: $url,
            encoding: new Encoding('UTF-8'),
            errorCorrectionLevel: ErrorCorrectionLevel::High,
            size: 550,
            margin: 16,
            roundBlockSizeMode: RoundBlockSizeMode::Margin,
            logoPath: $logoPath,
            logoResizeToWidth: $logoResizeToWidth,
            logoPunchoutBackground: true
        );

        $result = $builder->build();

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => "QR generado correctamente",
            'url_directa' => $url,
            'qr' => $result->getDataUri()
        ]);
        exit;
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => "Error al generar QR: " . $e->getMessage()
        ]);
        exit;
    }
?>

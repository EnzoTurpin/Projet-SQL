<?php

require_once 'lib/cocktail_api.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];
$uri = explode('/', trim($_SERVER['REQUEST_URI'], '/'));
$id = isset($uri[2]) ? (int) $uri[2] : null;

if ($uri[0] !== 'api' || $uri[1] !== 'cocktails') {
    http_response_code(404);
    echo json_encode(["error" => "Endpoint not found"]);
    exit;
}

switch ($method) {
    case 'GET':
        handleGetRequest($id);
        break;
    case 'POST':
        handlePostRequest();
        break;
    case 'PUT':
        if ($id === null) {
            http_response_code(400);
            echo json_encode(["error" => "ID is required for PUT requests"]);
        } else {
            handlePutRequest($id);
        }
        break;
    case 'DELETE':
        if ($id === null) {
            http_response_code(400);
            echo json_encode(["error" => "ID is required for DELETE requests"]);
        } else {
            handleDeleteRequest($id);
        }
        break;
    default:
        http_response_code(405);
        echo json_encode(["error" => "Method not allowed"]);
}
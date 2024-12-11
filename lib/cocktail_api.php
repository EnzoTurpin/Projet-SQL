<?php

require_once 'file_manager.php';

$dataFile = __DIR__ . '/../data/cocktails.json';

function handleGetRequest($id = null) {
    global $dataFile;
    $cocktails = readData($dataFile);

    if ($id === null) {
        echo json_encode($cocktails);
        return;
    }

    $cocktail = array_filter($cocktails, fn($c) => $c['id'] == $id);
    if (!$cocktail) {
        http_response_code(404);
        echo json_encode(["error" => "Cocktail not found"]);
        return;
    }

    echo json_encode(array_values($cocktail)[0]);
}

function handlePostRequest() {
    global $dataFile;
    $cocktails = readData($dataFile);

    $input = json_decode(file_get_contents('php://input'), true);

    if (!isset($input['name'], $input['ingredients'], $input['instructions'], $input['type'])) {
        http_response_code(400);
        echo json_encode(["error" => "Invalid input"]);
        return;
    }

    $newCocktail = [
        "id" => count($cocktails) > 0 ? max(array_column($cocktails, 'id')) + 1 : 1,
        "name" => $input['name'],
        "ingredients" => $input['ingredients'],
        "instructions" => $input['instructions'],
        "type" => $input['type']
    ];

    $cocktails[] = $newCocktail;
    writeData($dataFile, $cocktails);

    http_response_code(201);
    echo json_encode($newCocktail);
}

function handlePutRequest($id) {
    global $dataFile;
    $cocktails = readData($dataFile);

    $index = array_search($id, array_column($cocktails, 'id'));
    if ($index === false) {
        http_response_code(404);
        echo json_encode(["error" => "Cocktail not found"]);
        return;
    }

    $input = json_decode(file_get_contents('php://input'), true);
    $cocktails[$index] = array_merge($cocktails[$index], $input);

    writeData($dataFile, $cocktails);
    echo json_encode($cocktails[$index]);
}

function handleDeleteRequest($id) {
    global $dataFile;
    $cocktails = readData($dataFile);

    $index = array_search($id, array_column($cocktails, 'id'));
    if ($index === false) {
        http_response_code(404);
        echo json_encode(["error" => "Cocktail not found"]);
        return;
    }

    array_splice($cocktails, $index, 1);
    writeData($dataFile, $cocktails);

    echo json_encode(["message" => "Cocktail deleted"]);
}
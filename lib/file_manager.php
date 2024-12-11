<?php

function readData($filePath) {
    if (!file_exists($filePath)) {
        return [];
    }
    $data = file_get_contents($filePath);
    return json_decode($data, true) ?: [];
}

function writeData($filePath, $data) {
    file_put_contents($filePath, json_encode($data, JSON_PRETTY_PRINT));
}
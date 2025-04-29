<?php

namespace App\Scripts;

class ResponseApi {
  public static function sendApiResponse($status, $message, $data = null, $code = 200)
  {
      // If an invalid or missing status code (e.g., 0) is provided, fallback to 200
      $httpCode = ($code && $code >= 100 && $code < 600) ? $code : 200;

      return response()->json([
          'status' => $status,
          'message' => $message,
          'data' => $data
      ], $httpCode);
  }
}

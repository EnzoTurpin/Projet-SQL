<?php

namespace App\Scripts;

class ResponseApi {
  public static function sendApiResponse($status, $message, $data = null, $code = 200)
  {
      return response()->json([
          'status' => $status,
          'message' => $message,
          'data' => $data
      ], $code);
  }
}

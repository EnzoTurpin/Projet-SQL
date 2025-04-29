<?php

namespace App\Http\Middleware;

use Illuminate\Cookie\Middleware\EncryptCookies as Middleware;

class EncryptCookies extends Middleware
{
    /**
     * The names of the cookies that should not be encrypted.
     *
     * @var array<int, string>
     */
    protected $except = [
        //
    ];

    /**
     * Define cookie options for all cookies.
     *
     * @return array
     */
    protected static function cookieOptions()
    {
        return [
            'path' => '/',
            'domain' => null,
            'secure' => false, // Set to false for local development
            'same_site' => 'none', // Allow cross-site cookies
        ];
    }
} 
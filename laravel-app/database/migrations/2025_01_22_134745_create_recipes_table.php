<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('recipes', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->foreignId('ingredient_id')
                ->constrained('ingredients')
                ->onDelete('cascade'); // Supprime les recettes liées à un ingrédient si celui-ci est supprimé
            $table->integer('quantity');
            $table->text('instructions');
            $table->string('category');
            $table->string('glass');
            $table->string('garnish');
            $table->string('mainAlcohol');
            $table->timestamp('created_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('recipes');
    }
};

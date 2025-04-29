import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import {
  IngredientService,
  Ingredient,
} from '../../../services/ingredient.service';
import { GlassService, Glass } from '../../../services/glass.service';
import { GarnishService, Garnish } from '../../../services/garnish.service';

@Component({
  selector: 'app-admin-bar-items',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="bg-white rounded-lg shadow-lg p-4 sm:p-6">
      <!-- Tabs -->
      <div class="flex mb-6 border-b border-gray-200">
        <button
          (click)="activeTab = 'ingredients'"
          [ngClass]="{
            'text-tropical-vibes border-b-2 border-tropical-vibes':
              activeTab === 'ingredients',
            'text-gray-500 hover:text-gray-700': activeTab !== 'ingredients'
          }"
          class="py-2 px-4 font-medium text-sm flex-1 sm:flex-none text-center"
        >
          Ingrédients
        </button>
        <button
          (click)="activeTab = 'glasses'"
          [ngClass]="{
            'text-tropical-vibes border-b-2 border-tropical-vibes':
              activeTab === 'glasses',
            'text-gray-500 hover:text-gray-700': activeTab !== 'glasses'
          }"
          class="py-2 px-4 font-medium text-sm flex-1 sm:flex-none text-center"
        >
          Types de verres
        </button>
        <button
          (click)="activeTab = 'garnishes'"
          [ngClass]="{
            'text-tropical-vibes border-b-2 border-tropical-vibes':
              activeTab === 'garnishes',
            'text-gray-500 hover:text-gray-700': activeTab !== 'garnishes'
          }"
          class="py-2 px-4 font-medium text-sm flex-1 sm:flex-none text-center"
        >
          Garnitures
        </button>
      </div>

      <!-- Message d'erreur -->
      <div
        *ngIf="errorMessage"
        class="mb-4 p-3 bg-red-100 text-red-800 rounded-md text-center"
      >
        {{ errorMessage }}
      </div>

      <!-- Message de succès -->
      <div
        *ngIf="successMessage"
        class="mb-4 p-3 bg-green-100 text-green-800 rounded-md text-center"
      >
        {{ successMessage }}
      </div>

      <!-- Section Ingrédients -->
      <div *ngIf="activeTab === 'ingredients'">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold text-tropical-vibes">
            Liste des ingrédients
          </h2>
          <button
            (click)="toggleAddIngredientForm()"
            class="px-4 py-2 bg-tropical-vibes text-white rounded-md hover:bg-opacity-90 transition-colors"
          >
            {{ showAddIngredientForm ? 'Annuler' : 'Ajouter un ingrédient' }}
          </button>
        </div>

        <!-- Formulaire d'ajout/édition d'un ingrédient -->
        <div
          *ngIf="showAddIngredientForm"
          class="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200"
        >
          <h3 class="text-lg font-semibold mb-3">
            {{ editingIngredient ? 'Modifier' : 'Ajouter' }} un ingrédient
          </h3>
          <form [formGroup]="ingredientForm" (ngSubmit)="saveIngredient()">
            <div class="mb-4">
              <label class="block text-gray-700 mb-2"
                >Nom de l'ingrédient</label
              >
              <input
                type="text"
                formControlName="name"
                class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tropical-vibes"
                placeholder="Ex: Vodka"
              />
              <div
                *ngIf="ingredientForm.get('name')?.errors?.['required'] && ingredientForm.get('name')?.touched"
                class="text-red-500 mt-1 text-sm"
              >
                Le nom est requis
              </div>
            </div>
            <div class="mb-4">
              <label class="block text-gray-700 mb-2"
                >Quantité (optionnel)</label
              >
              <input
                type="text"
                formControlName="quantity"
                class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tropical-vibes"
                placeholder="Ex: 50ml"
              />
            </div>
            <div class="flex justify-end space-x-2">
              <button
                type="button"
                (click)="toggleAddIngredientForm()"
                class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                [disabled]="ingredientForm.invalid || isLoading"
                class="px-4 py-2 bg-tropical-vibes text-white rounded-md hover:bg-opacity-90 transition-colors disabled:opacity-50"
              >
                {{
                  isLoading
                    ? 'Chargement...'
                    : editingIngredient
                    ? 'Modifier'
                    : 'Ajouter'
                }}
              </button>
            </div>
          </form>
        </div>

        <!-- Liste des ingrédients -->
        <div
          *ngIf="ingredients.length === 0"
          class="text-center py-8 text-gray-500"
        >
          Aucun ingrédient trouvé.
        </div>

        <div *ngIf="ingredients.length > 0" class="overflow-x-auto">
          <table class="min-w-full bg-white">
            <thead class="bg-gray-50">
              <tr>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Nom
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Quantité
                </th>
                <th
                  class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr
                *ngFor="let ingredient of ingredients"
                class="hover:bg-gray-50"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  {{ ingredient.name }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  {{ ingredient.quantity || '-' }}
                </td>
                <td
                  class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                >
                  <button
                    (click)="editIngredient(ingredient)"
                    class="text-tropical-vibes hover:text-tropical-vibes-dark mr-3"
                  >
                    Modifier
                  </button>
                  <button
                    (click)="deleteIngredient(ingredient)"
                    class="text-red-600 hover:text-red-900"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Section Garnitures -->
      <div *ngIf="activeTab === 'garnishes'">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold text-tropical-vibes">Garnitures</h2>
          <button
            (click)="toggleAddGarnishForm()"
            class="px-4 py-2 bg-tropical-vibes text-white rounded-md hover:bg-opacity-90 transition-colors"
          >
            {{ showAddGarnishForm ? 'Annuler' : 'Ajouter une garniture' }}
          </button>
        </div>

        <!-- Formulaire garniture -->
        <div
          *ngIf="showAddGarnishForm"
          class="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200"
        >
          <h3 class="text-lg font-semibold mb-3">
            {{ editingGarnish ? 'Modifier' : 'Ajouter' }} une garniture
          </h3>
          <form [formGroup]="garnishForm" (ngSubmit)="saveGarnish()">
            <div class="mb-4">
              <label class="block text-gray-700 mb-2"
                >Nom de la garniture</label
              >
              <input
                type="text"
                formControlName="name"
                class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tropical-vibes"
                placeholder="Ex: Tranche de citron"
              />
              <div
                *ngIf="garnishForm.get('name')?.errors?.['required'] && garnishForm.get('name')?.touched"
                class="text-red-500 mt-1 text-sm"
              >
                Le nom est requis
              </div>
            </div>
            <div class="flex justify-end space-x-2">
              <button
                type="button"
                (click)="toggleAddGarnishForm()"
                class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                [disabled]="garnishForm.invalid || isLoading"
                class="px-4 py-2 bg-tropical-vibes text-white rounded-md hover:bg-opacity-90 transition-colors disabled:opacity-50"
              >
                {{
                  isLoading
                    ? 'Chargement...'
                    : editingGarnish
                    ? 'Modifier'
                    : 'Ajouter'
                }}
              </button>
            </div>
          </form>
        </div>

        <!-- Liste garnitures -->
        <div
          *ngIf="garnishes.length === 0"
          class="text-center py-8 text-gray-500"
        >
          Aucune garniture trouvée.
        </div>

        <div *ngIf="garnishes.length > 0" class="overflow-x-auto">
          <table class="min-w-full bg-white">
            <thead class="bg-gray-50">
              <tr>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Nom
                </th>
                <th
                  class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr *ngFor="let garnish of garnishes" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">{{ garnish.name }}</td>
                <td
                  class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                >
                  <button
                    (click)="editGarnish(garnish)"
                    class="text-tropical-vibes hover:text-tropical-vibes-dark mr-3"
                  >
                    Modifier
                  </button>
                  <button
                    (click)="deleteGarnish(garnish)"
                    class="text-red-600 hover:text-red-900"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Section Verres -->
      <div *ngIf="activeTab === 'glasses'">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold text-tropical-vibes">Types de verres</h2>
          <button
            (click)="toggleAddGlassForm()"
            class="px-4 py-2 bg-tropical-vibes text-white rounded-md hover:bg-opacity-90 transition-colors"
          >
            {{ showAddGlassForm ? 'Annuler' : 'Ajouter un type de verre' }}
          </button>
        </div>

        <!-- Formulaire d'ajout/édition d'un verre -->
        <div
          *ngIf="showAddGlassForm"
          class="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200"
        >
          <h3 class="text-lg font-semibold mb-3">
            {{ editingGlass ? 'Modifier' : 'Ajouter' }} un type de verre
          </h3>
          <form [formGroup]="glassForm" (ngSubmit)="saveGlass()">
            <div class="mb-4">
              <label class="block text-gray-700 mb-2">Nom du verre</label>
              <input
                type="text"
                formControlName="name"
                class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tropical-vibes"
                placeholder="Ex: Verre à martini"
              />
              <div
                *ngIf="glassForm.get('name')?.errors?.['required'] && glassForm.get('name')?.touched"
                class="text-red-500 mt-1 text-sm"
              >
                Le nom est requis
              </div>
            </div>
            <div class="flex justify-end space-x-2">
              <button
                type="button"
                (click)="toggleAddGlassForm()"
                class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                [disabled]="glassForm.invalid || isLoading"
                class="px-4 py-2 bg-tropical-vibes text-white rounded-md hover:bg-opacity-90 transition-colors disabled:opacity-50"
              >
                {{
                  isLoading
                    ? 'Chargement...'
                    : editingGlass
                    ? 'Modifier'
                    : 'Ajouter'
                }}
              </button>
            </div>
          </form>
        </div>

        <!-- Liste des verres -->
        <div
          *ngIf="glasses.length === 0"
          class="text-center py-8 text-gray-500"
        >
          Aucun type de verre trouvé.
        </div>

        <div *ngIf="glasses.length > 0" class="overflow-x-auto">
          <table class="min-w-full bg-white">
            <thead class="bg-gray-50">
              <tr>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Nom
                </th>
                <th
                  class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr *ngFor="let glass of glasses" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  {{ glass.name }}
                </td>
                <td
                  class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                >
                  <button
                    (click)="editGlass(glass)"
                    class="text-tropical-vibes hover:text-tropical-vibes-dark mr-3"
                  >
                    Modifier
                  </button>
                  <button
                    (click)="deleteGlass(glass)"
                    class="text-red-600 hover:text-red-900"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class AdminBarItemsComponent implements OnInit {
  activeTab = 'ingredients';

  // Ingrédients
  ingredients: Ingredient[] = [];
  ingredientForm: FormGroup;
  showAddIngredientForm = false;
  editingIngredient: Ingredient | null = null;

  // Verres
  glasses: Glass[] = [];
  glassForm: FormGroup;
  showAddGlassForm = false;
  editingGlass: Glass | null = null;

  // Garnitures
  garnishes: Garnish[] = [];
  garnishForm: FormGroup;
  showAddGarnishForm = false;
  editingGarnish: Garnish | null = null;

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private ingredientService: IngredientService,
    private glassService: GlassService,
    private garnishService: GarnishService
  ) {
    this.ingredientForm = this.fb.group({
      name: ['', Validators.required],
      quantity: [''],
    });

    this.glassForm = this.fb.group({
      name: ['', Validators.required],
    });

    this.garnishForm = this.fb.group({
      name: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadIngredients();
    this.loadGlasses();
    this.loadGarnishes();
  }

  // *** INGRÉDIENTS ***

  loadIngredients(): void {
    this.isLoading = true;
    this.ingredientService.getAllIngredients().subscribe({
      next: (ingredients: Ingredient[]) => {
        console.log('Ingrédients chargés:', ingredients);
        this.ingredients = ingredients;
        // Tri alphabétique des ingrédients
        this.ingredients.sort((a, b) => a.name.localeCompare(b.name));
        this.isLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erreur chargement ingrédients:', err);
        this.showError(
          'Erreur lors du chargement des ingrédients: ' + err.message
        );
        this.isLoading = false;
      },
    });
  }

  toggleAddIngredientForm(): void {
    this.showAddIngredientForm = !this.showAddIngredientForm;
    if (!this.showAddIngredientForm) {
      this.editingIngredient = null;
      this.ingredientForm.reset();
    }
  }

  editIngredient(ingredient: Ingredient): void {
    console.log('Ingrédient à éditer:', ingredient);
    // Utiliser _id s'il existe, sinon utiliser id
    const ingredientId = ingredient._id || ingredient.id;
    console.log("ID de l'ingrédient:", ingredientId);

    // Assurons-nous que l'ingrédient a un _id pour updateIngredient
    this.editingIngredient = {
      ...ingredient,
      _id: ingredientId,
    };

    this.ingredientForm.patchValue({
      name: ingredient.name,
      quantity: ingredient.quantity || '',
    });
    this.showAddIngredientForm = true;
  }

  saveIngredient(): void {
    if (this.ingredientForm.invalid) {
      return;
    }

    this.isLoading = true;
    const formData: Ingredient = this.ingredientForm.value;
    console.log('Données du formulaire ingrédient:', formData);

    if (
      this.editingIngredient &&
      (this.editingIngredient._id || this.editingIngredient.id)
    ) {
      console.log(
        'Mode édition ingrédient - ID existant:',
        this.editingIngredient._id || this.editingIngredient.id
      );

      // Créer un nouvel ingrédient sans essayer de supprimer l'ancien
      this.ingredientService.createIngredient(formData).subscribe({
        next: (createdIngredient: any) => {
          console.log('Nouvel ingrédient créé:', createdIngredient);
          let newIngredient: Ingredient | null = null;

          if (createdIngredient && createdIngredient.data) {
            newIngredient = createdIngredient.data;
          } else if (createdIngredient) {
            newIngredient = createdIngredient;
          }

          if (newIngredient) {
            // Ajouter le nouvel ingrédient et retirer l'ancien
            this.ingredients = this.ingredients.filter(
              (i) =>
                (i._id || i.id) !==
                (this.editingIngredient?._id || this.editingIngredient?.id)
            );
            this.ingredients.push(newIngredient);
            // Trier la liste par ordre alphabétique
            this.ingredients.sort((a, b) => a.name.localeCompare(b.name));
            this.showSuccess('Ingrédient mis à jour avec succès');
          } else {
            this.loadIngredients();
            this.showSuccess('Ingrédient ajouté, rafraîchissement nécessaire');
          }

          this.toggleAddIngredientForm();
          this.isLoading = false;
        },
        error: (err: HttpErrorResponse) => {
          console.error('Erreur création ingrédient:', err);
          this.showError(
            "Erreur lors de la mise à jour de l'ingrédient: " + err.message
          );
          this.isLoading = false;
        },
      });
    } else {
      console.log('Mode création ingrédient');
      this.ingredientService.createIngredient(formData).subscribe({
        next: (response: any) => {
          console.log('Ingrédient créé:', response);
          let createdIngredient: Ingredient | null = null;

          if (response && response.data) {
            createdIngredient = response.data;
          } else if (response) {
            createdIngredient = response;
          }

          if (createdIngredient) {
            this.ingredients.push(createdIngredient);
            // Trier la liste par ordre alphabétique
            this.ingredients.sort((a, b) => a.name.localeCompare(b.name));
            this.showSuccess('Ingrédient ajouté avec succès');
          } else {
            this.loadIngredients();
            this.showSuccess('Ingrédient ajouté, rafraîchissement nécessaire');
          }

          this.toggleAddIngredientForm();
          this.isLoading = false;
        },
        error: (err: HttpErrorResponse) => {
          console.error('Erreur création ingrédient:', err);
          this.showError(
            "Erreur lors de la création de l'ingrédient: " + err.message
          );
          this.isLoading = false;
        },
      });
    }
  }

  deleteIngredient(ingredient: Ingredient): void {
    // Utiliser _id s'il existe, sinon utiliser id
    const ingredientId = ingredient._id || ingredient.id;

    if (!ingredientId) {
      this.showError("Impossible de supprimer: ID de l'ingrédient manquant");
      return;
    }

    if (
      !confirm(
        `Êtes-vous sûr de vouloir supprimer l'ingrédient "${ingredient.name}" ?`
      )
    ) {
      return;
    }

    this.isLoading = true;
    this.ingredientService.deleteIngredient(ingredientId).subscribe({
      next: () => {
        this.showSuccess('Ingrédient supprimé avec succès');
        this.loadIngredients();
        this.isLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.showError('Erreur lors de la suppression: ' + err.message);
        this.isLoading = false;
      },
    });
  }

  // *** VERRES ***

  loadGlasses(): void {
    this.isLoading = true;
    this.glassService.getAllGlasses().subscribe({
      next: (glasses: Glass[]) => {
        console.log('Verres chargés:', glasses);
        this.glasses = glasses;
        // Tri alphabétique des verres
        this.glasses.sort((a, b) => a.name.localeCompare(b.name));
        this.isLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erreur chargement verres:', err);
        this.showError('Erreur lors du chargement des verres: ' + err.message);
        this.isLoading = false;
      },
    });
  }

  toggleAddGlassForm(): void {
    this.showAddGlassForm = !this.showAddGlassForm;
    if (!this.showAddGlassForm) {
      this.editingGlass = null;
      this.glassForm.reset();
    }
  }

  editGlass(glass: Glass): void {
    const glassId = glass._id || glass.id;
    this.editingGlass = {
      ...glass,
      _id: glassId,
    };
    this.glassForm.patchValue({
      name: glass.name,
    });
    this.showAddGlassForm = true;
  }

  saveGlass(): void {
    if (this.glassForm.invalid) {
      return;
    }

    this.isLoading = true;
    const formData: Glass = this.glassForm.value;
    console.log('Données du formulaire verre:', formData);

    if (this.editingGlass && (this.editingGlass._id || this.editingGlass.id)) {
      console.log(
        'Mode édition verre - ID existant:',
        this.editingGlass._id || this.editingGlass.id
      );

      // Créer un nouveau verre sans essayer de supprimer l'ancien
      this.glassService.createGlass(formData).subscribe({
        next: (createdGlass: any) => {
          console.log('Nouveau verre créé:', createdGlass);
          let newGlass: Glass | null = null;

          if (createdGlass && createdGlass.data) {
            newGlass = createdGlass.data;
          } else if (createdGlass) {
            newGlass = createdGlass;
          }

          if (newGlass) {
            // Ajouter le nouveau verre et retirer l'ancien
            this.glasses = this.glasses.filter(
              (g) =>
                (g._id || g.id) !==
                (this.editingGlass?._id || this.editingGlass?.id)
            );
            this.glasses.push(newGlass);
            // Trier la liste par ordre alphabétique
            this.glasses.sort((a, b) => a.name.localeCompare(b.name));
            this.showSuccess('Verre mis à jour avec succès');
          } else {
            this.loadGlasses();
            this.showSuccess('Verre ajouté, rafraîchissement nécessaire');
          }

          this.toggleAddGlassForm();
          this.isLoading = false;
        },
        error: (err: HttpErrorResponse) => {
          console.error('Erreur création verre:', err);
          this.showError(
            'Erreur lors de la mise à jour du verre: ' + err.message
          );
          this.isLoading = false;
        },
      });
    } else {
      console.log('Mode création verre');
      this.glassService.createGlass(formData).subscribe({
        next: (response: any) => {
          console.log('Verre créé:', response);
          let createdGlass: Glass | null = null;

          if (response && response.data) {
            createdGlass = response.data;
          } else if (response) {
            createdGlass = response;
          }

          if (createdGlass) {
            this.glasses.push(createdGlass);
            // Trier la liste par ordre alphabétique
            this.glasses.sort((a, b) => a.name.localeCompare(b.name));
            this.showSuccess('Verre ajouté avec succès');
          } else {
            this.loadGlasses();
            this.showSuccess('Verre ajouté, rafraîchissement nécessaire');
          }

          this.toggleAddGlassForm();
          this.isLoading = false;
        },
        error: (err: HttpErrorResponse) => {
          console.error('Erreur création verre:', err);
          this.showError('Erreur lors de la création du verre: ' + err.message);
          this.isLoading = false;
        },
      });
    }
  }

  deleteGlass(glass: Glass): void {
    const glassId = glass._id || glass.id;

    if (!glassId) {
      this.showError('Impossible de supprimer: ID du verre manquant');
      return;
    }

    if (
      !confirm(
        `Êtes-vous sûr de vouloir supprimer le type de verre "${glass.name}" ?`
      )
    ) {
      return;
    }

    this.isLoading = true;
    this.glassService.deleteGlass(glassId).subscribe({
      next: () => {
        this.showSuccess('Type de verre supprimé avec succès');
        this.loadGlasses();
        this.isLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.showError('Erreur lors de la suppression: ' + err.message);
        this.isLoading = false;
      },
    });
  }

  // *** GARNITURES ***

  loadGarnishes(): void {
    this.isLoading = true;
    this.garnishService.getAllGarnishes().subscribe({
      next: (garnishes: Garnish[]) => {
        console.log('Garnitures chargées:', garnishes);
        this.garnishes = garnishes;
        // Tri alphabétique des garnitures
        this.garnishes.sort((a, b) => a.name.localeCompare(b.name));
        this.isLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erreur chargement garnitures:', err);
        this.showError(
          'Erreur lors du chargement des garnitures: ' + err.message
        );
        this.isLoading = false;
      },
    });
  }

  toggleAddGarnishForm(): void {
    this.showAddGarnishForm = !this.showAddGarnishForm;
    if (!this.showAddGarnishForm) {
      this.editingGarnish = null;
      this.garnishForm.reset();
    }
  }

  editGarnish(garnish: Garnish): void {
    const garnishId = garnish._id || garnish.id;
    this.editingGarnish = {
      ...garnish,
      _id: garnishId,
    };
    this.garnishForm.patchValue({
      name: garnish.name,
    });
    this.showAddGarnishForm = true;
  }

  saveGarnish(): void {
    if (this.garnishForm.invalid) {
      return;
    }

    this.isLoading = true;
    const formData: Garnish = this.garnishForm.value;
    console.log('Données du formulaire garniture:', formData);

    if (
      this.editingGarnish &&
      (this.editingGarnish._id || this.editingGarnish.id)
    ) {
      console.log(
        'Mode édition garniture - ID existant:',
        this.editingGarnish._id || this.editingGarnish.id
      );

      // Créer une nouvelle garniture sans essayer de supprimer l'ancienne
      this.garnishService.createGarnish(formData).subscribe({
        next: (createdGarnish: any) => {
          console.log('Nouvelle garniture créée:', createdGarnish);
          let newGarnish: Garnish | null = null;

          if (createdGarnish && createdGarnish.data) {
            newGarnish = createdGarnish.data;
          } else if (createdGarnish) {
            newGarnish = createdGarnish;
          }

          if (newGarnish) {
            // Ajouter la nouvelle garniture et retirer l'ancienne
            this.garnishes = this.garnishes.filter(
              (g) =>
                (g._id || g.id) !==
                (this.editingGarnish?._id || this.editingGarnish?.id)
            );
            this.garnishes.push(newGarnish);
            // Trier la liste par ordre alphabétique
            this.garnishes.sort((a, b) => a.name.localeCompare(b.name));
            this.showSuccess('Garniture mise à jour avec succès');
          } else {
            this.loadGarnishes();
            this.showSuccess('Garniture ajoutée, rafraîchissement nécessaire');
          }

          this.toggleAddGarnishForm();
          this.isLoading = false;
        },
        error: (err: HttpErrorResponse) => {
          console.error('Erreur création garniture:', err);
          this.showError(
            'Erreur lors de la mise à jour de la garniture: ' + err.message
          );
          this.isLoading = false;
        },
      });
    } else {
      console.log('Mode création garniture');
      this.garnishService.createGarnish(formData).subscribe({
        next: (response: any) => {
          console.log('Garniture créée:', response);
          let createdGarnish: Garnish | null = null;

          if (response && response.data) {
            createdGarnish = response.data;
          } else if (response) {
            createdGarnish = response;
          }

          if (createdGarnish) {
            this.garnishes.push(createdGarnish);
            // Trier la liste par ordre alphabétique
            this.garnishes.sort((a, b) => a.name.localeCompare(b.name));
            this.showSuccess('Garniture ajoutée avec succès');
          } else {
            this.loadGarnishes();
            this.showSuccess('Garniture ajoutée, rafraîchissement nécessaire');
          }

          this.toggleAddGarnishForm();
          this.isLoading = false;
        },
        error: (err: HttpErrorResponse) => {
          console.error('Erreur création garniture:', err);
          this.showError(
            'Erreur lors de la création de la garniture: ' + err.message
          );
          this.isLoading = false;
        },
      });
    }
  }

  deleteGarnish(garnish: Garnish): void {
    const garnishId = garnish._id || garnish.id;

    if (!garnishId) {
      this.showError('Impossible de supprimer: ID de la garniture manquant');
      return;
    }

    if (
      !confirm(
        `Êtes-vous sûr de vouloir supprimer la garniture "${garnish.name}" ?`
      )
    ) {
      return;
    }

    this.isLoading = true;
    this.garnishService.deleteGarnish(garnishId).subscribe({
      next: () => {
        this.showSuccess('Garniture supprimée avec succès');
        this.loadGarnishes();
        this.isLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.showError('Erreur lors de la suppression: ' + err.message);
        this.isLoading = false;
      },
    });
  }

  // *** UTILITAIRES ***

  showError(message: string): void {
    this.errorMessage = message;
    this.successMessage = '';
    setTimeout(() => {
      this.errorMessage = '';
    }, 5000);
  }

  showSuccess(message: string): void {
    this.successMessage = message;
    this.errorMessage = '';
    setTimeout(() => {
      this.successMessage = '';
    }, 5000);
  }
}

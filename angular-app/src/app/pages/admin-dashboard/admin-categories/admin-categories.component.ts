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
import { CategoryService, Category } from '../../../services/category.service';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="bg-white rounded-lg shadow-lg p-4 sm:p-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold text-tropical-vibes">
          Gestion des catégories
        </h2>
        <button
          (click)="toggleAddCategoryForm()"
          class="px-4 py-2 bg-tropical-vibes text-white rounded-md hover:bg-opacity-90 transition-colors"
        >
          {{ showAddCategoryForm ? 'Annuler' : 'Ajouter une catégorie' }}
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

      <!-- Formulaire d'ajout/édition d'une catégorie -->
      <div
        *ngIf="showAddCategoryForm"
        class="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200"
      >
        <h3 class="text-lg font-semibold mb-3">
          {{ editingCategory ? 'Modifier' : 'Ajouter' }} une catégorie
        </h3>
        <form [formGroup]="categoryForm" (ngSubmit)="saveCategory()">
          <div class="mb-4">
            <label class="block text-gray-700 mb-2">Nom de la catégorie</label>
            <input
              type="text"
              formControlName="name"
              class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tropical-vibes"
              placeholder="Ex: Cocktails d'été"
            />
            <div
              *ngIf="categoryForm.get('name')?.errors?.['required'] && categoryForm.get('name')?.touched"
              class="text-red-500 mt-1 text-sm"
            >
              Le nom est requis
            </div>
          </div>
          <div class="mb-4">
            <label class="flex items-center space-x-2">
              <input
                type="checkbox"
                formControlName="isMocktail"
                class="form-checkbox h-5 w-5 text-tropical-vibes"
              />
              <span class="text-gray-700"
                >Catégorie de mocktails (sans alcool)</span
              >
            </label>
          </div>
          <div class="flex justify-end space-x-2">
            <button
              type="button"
              (click)="toggleAddCategoryForm()"
              class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              [disabled]="categoryForm.invalid || isLoading"
              class="px-4 py-2 bg-tropical-vibes text-white rounded-md hover:bg-opacity-90 transition-colors disabled:opacity-50"
            >
              {{
                isLoading
                  ? 'Chargement...'
                  : editingCategory
                  ? 'Modifier'
                  : 'Ajouter'
              }}
            </button>
          </div>
        </form>
      </div>

      <!-- Liste des catégories -->
      <div
        *ngIf="categories.length === 0"
        class="text-center py-8 text-gray-500"
      >
        Aucune catégorie trouvée.
      </div>

      <div *ngIf="categories.length > 0" class="overflow-x-auto">
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
                Type
              </th>
              <th
                class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr *ngFor="let category of categories" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                {{ category.name }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  [ngClass]="{
                    'bg-blue-100 text-blue-800': !category.isMocktail,
                    'bg-green-100 text-green-800': category.isMocktail
                  }"
                  class="px-2 py-1 rounded-full text-xs font-medium"
                >
                  {{ category.isMocktail ? 'Mocktail' : 'Cocktail' }}
                </span>
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
              >
                <button
                  (click)="editCategory(category)"
                  class="text-tropical-vibes hover:text-tropical-vibes-dark mr-3"
                >
                  Modifier
                </button>
                <button
                  (click)="deleteCategory(category)"
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
  `,
})
export class AdminCategoriesComponent implements OnInit {
  categories: Category[] = [];
  categoryForm: FormGroup;
  editingCategory: Category | null = null;
  showAddCategoryForm = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService
  ) {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required]],
      isMocktail: [false],
    });
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoading = true;
    this.categoryService.getAllCategories().subscribe({
      next: (categories: Category[]) => {
        console.log('Catégories chargées:', categories);
        this.categories = categories;
        // Tri alphabétique des catégories
        this.categories.sort((a, b) => a.name.localeCompare(b.name));
        this.isLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erreur chargement catégories:', err);
        this.showError(
          'Erreur lors du chargement des catégories: ' + err.message
        );
        this.isLoading = false;
      },
    });
  }

  toggleAddCategoryForm(): void {
    this.showAddCategoryForm = !this.showAddCategoryForm;
    if (!this.showAddCategoryForm) {
      this.resetForm();
    }
  }

  resetForm(): void {
    this.categoryForm.reset({
      name: '',
      isMocktail: false,
    });
    this.editingCategory = null;
  }

  editCategory(category: Category): void {
    const categoryId = category._id || category.id;
    this.editingCategory = {
      ...category,
      _id: categoryId,
    };
    this.categoryForm.patchValue({
      name: category.name,
      isMocktail: category.isMocktail || false,
    });
    this.showAddCategoryForm = true;
  }

  saveCategory(): void {
    if (this.categoryForm.invalid) {
      return;
    }

    this.isLoading = true;
    const formData: Category = this.categoryForm.value;
    console.log('Données du formulaire catégorie:', formData);

    if (
      this.editingCategory &&
      (this.editingCategory._id || this.editingCategory.id)
    ) {
      console.log(
        'Mode édition catégorie - ID existant:',
        this.editingCategory._id || this.editingCategory.id
      );

      // Utiliser updateCategory au lieu de createCategory
      const categoryId =
        this.editingCategory._id || this.editingCategory.id || '';
      this.categoryService.updateCategory(categoryId, formData).subscribe({
        next: (updatedCategory: any) => {
          console.log('Catégorie mise à jour:', updatedCategory);

          // Mise à jour de la liste des catégories
          this.loadCategories();
          this.showSuccess('Catégorie mise à jour avec succès');
          this.toggleAddCategoryForm();
          this.isLoading = false;
        },
        error: (err: HttpErrorResponse) => {
          console.error('Erreur mise à jour catégorie:', err);
          this.showError(
            'Erreur lors de la mise à jour de la catégorie: ' + err.message
          );
          this.isLoading = false;
        },
      });
    } else {
      console.log('Mode création catégorie');
      this.categoryService.createCategory(formData).subscribe({
        next: (response: any) => {
          console.log('Catégorie créée:', response);
          let createdCategory: Category | null = null;

          if (response && response.data) {
            createdCategory = response.data;
          } else if (response) {
            createdCategory = response;
          }

          if (createdCategory) {
            this.categories.push(createdCategory);
            // Trier la liste par ordre alphabétique
            this.categories.sort((a, b) => a.name.localeCompare(b.name));
            this.showSuccess('Catégorie ajoutée avec succès');
          } else {
            this.loadCategories();
            this.showSuccess('Catégorie ajoutée, rafraîchissement nécessaire');
          }

          this.toggleAddCategoryForm();
          this.isLoading = false;
        },
        error: (err: HttpErrorResponse) => {
          console.error('Erreur création catégorie:', err);
          this.showError(
            'Erreur lors de la création de la catégorie: ' + err.message
          );
          this.isLoading = false;
        },
      });
    }
  }

  deleteCategory(category: Category): void {
    // Utiliser _id s'il existe, sinon utiliser id
    const categoryId = category._id || category.id;

    if (!categoryId) {
      this.showError('Impossible de supprimer: ID de la catégorie manquant');
      return;
    }

    if (
      !confirm(
        `Êtes-vous sûr de vouloir supprimer la catégorie "${category.name}" ?`
      )
    ) {
      return;
    }

    this.isLoading = true;
    this.categoryService.deleteCategory(categoryId).subscribe({
      next: () => {
        this.showSuccess('Catégorie supprimée avec succès');
        this.loadCategories();
        this.isLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.showError('Erreur lors de la suppression: ' + err.message);
        this.isLoading = false;
      },
    });
  }

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

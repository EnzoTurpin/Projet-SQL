import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  FormControl,
} from '@angular/forms';
import { CocktailService } from '../../../services/cocktail.service';
import { Recette } from '../../../interfaces/recette.interface';
import { GlassService, Glass } from '../../../services/glass.service';
import {
  IngredientService,
  Ingredient,
} from '../../../services/ingredient.service';
import { GarnishService, Garnish } from '../../../services/garnish.service';

@Component({
  selector: 'app-admin-cocktail',
  templateUrl: './admin-cocktail.component.html',
  styleUrls: ['./admin-cocktail.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
})
export class AdminCocktailComponent implements OnInit {
  cocktailForm: FormGroup;
  cocktails: Recette[] = [];
  isLoading = false;
  isEditing = false;
  currentCocktailId: string | null = null;
  formSubmitted = false;
  statusMessage = '';
  isSuccess = false;

  // Propriétés pour la gestion des images
  imagePreview: string | null = null;
  selectedFile: File | null = null;

  difficultyOptions = ['Facile', 'Moyen', 'Difficile'];

  // Données pour les listes déroulantes
  glasses: Glass[] = [];
  allIngredients: Ingredient[] = [];
  garnishes: Garnish[] = [];

  constructor(
    private fb: FormBuilder,
    private cocktailService: CocktailService,
    private glassService: GlassService,
    private ingredientService: IngredientService,
    private garnishService: GarnishService
  ) {
    this.cocktailForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadCocktails();
    this.loadGlasses();
    this.loadIngredients();
    this.loadGarnishes();
  }

  // Charger les types de verres pour la liste déroulante
  loadGlasses(): void {
    this.glassService.getAllGlasses().subscribe({
      next: (data) => {
        this.glasses = data;
        // Tri alphabétique des verres
        this.glasses.sort((a, b) => a.name.localeCompare(b.name));
      },
      error: (error) => {
        console.error('Erreur lors du chargement des verres', error);
      },
    });
  }

  // Charger les ingrédients pour les listes déroulantes
  loadIngredients(): void {
    this.ingredientService.getAllIngredients().subscribe({
      next: (data) => {
        this.allIngredients = data;
        // Tri alphabétique des ingrédients
        this.allIngredients.sort((a, b) => a.name.localeCompare(b.name));
      },
      error: (error) => {
        console.error('Erreur lors du chargement des ingrédients', error);
      },
    });
  }

  // Charger les garnitures pour la liste déroulante
  loadGarnishes(): void {
    this.garnishService.getAllGarnishes().subscribe({
      next: (data) => {
        this.garnishes = data;
        // Tri alphabétique des garnitures
        this.garnishes.sort((a, b) => a.name.localeCompare(b.name));
      },
      error: (error) => {
        console.error('Erreur lors du chargement des garnitures', error);
      },
    });
  }

  createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      image: ['', Validators.required], // Ce champ stockera l'image sous forme de string (base64 ou url)
      difficulty: ['Facile', Validators.required],
      preparationTime: ['', Validators.required],
      ingredients: this.fb.array([this.createIngredient()]),
      instructions: this.fb.array([this.createInstruction()]),
      glassType: [''], // Type de verre
      alcoholLevel: [''], // Niveau d'alcool
      garnish: [''], // Garniture
      isMocktail: [false], // false = cocktail, true = mocktail
    });
  }

  createIngredient(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      quantity: ['', Validators.required],
      unit: [''],
    });
  }

  createInstruction(): FormGroup {
    return this.fb.group({
      step: ['', Validators.required],
    });
  }

  get ingredients(): FormArray {
    return this.cocktailForm.get('ingredients') as FormArray;
  }

  get instructions(): FormArray {
    return this.cocktailForm.get('instructions') as FormArray;
  }

  addIngredient(): void {
    this.ingredients.push(this.createIngredient());
  }

  removeIngredient(index: number): void {
    if (this.ingredients.length > 1) {
      this.ingredients.removeAt(index);
    }
  }

  addInstruction(): void {
    this.instructions.push(this.createInstruction());
  }

  removeInstruction(index: number): void {
    if (this.instructions.length > 1) {
      this.instructions.removeAt(index);
    }
  }

  // Méthode pour gérer la sélection de fichier
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];

      // Vérifier la taille du fichier (5MB max)
      if (this.selectedFile.size > 5 * 1024 * 1024) {
        this.statusMessage = "L'image doit faire moins de 5MB";
        this.isSuccess = false;
        this.selectedFile = null;
        return;
      }

      // Créer un aperçu de l'image
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
        // On stocke juste le fait qu'une image est présente
        this.cocktailForm.patchValue({
          image: 'image_selected',
        });
        this.cocktailForm.get('image')?.markAsDirty();
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  // Méthode pour supprimer l'image sélectionnée
  removeImage(event: Event): void {
    event.stopPropagation(); // Empêcher le déclenchement du click sur le parent
    this.selectedFile = null;
    this.imagePreview = null;
    this.cocktailForm.patchValue({
      image: '',
    });
    this.cocktailForm.get('image')?.markAsDirty();
  }

  loadCocktails(): void {
    this.isLoading = true;
    this.cocktailService.getAllCocktails().subscribe({
      next: (cocktails) => {
        this.cocktails = cocktails;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des cocktails', error);
        this.isLoading = false;
      },
    });
  }

  onSubmit(): void {
    this.formSubmitted = true;

    if (this.cocktailForm.invalid) {
      this.statusMessage = 'Veuillez corriger les erreurs dans le formulaire.';
      this.isSuccess = false;
      return;
    }

    if (!this.selectedFile && !this.isEditing) {
      this.statusMessage = 'Une image est requise pour le cocktail.';
      this.isSuccess = false;
      return;
    }

    // Préparer les données
    const formData = new FormData();
    const rawFormData = this.cocktailForm.value;

    // Ajouter automatiquement "min" au temps de préparation s'il n'y est pas déjà
    let preparationTime = rawFormData.preparationTime;
    if (preparationTime && !preparationTime.toString().includes('min')) {
      preparationTime = `${preparationTime} min`;
    }

    // Ajouter les champs texte
    formData.append('name', rawFormData.name);
    formData.append('description', rawFormData.description);
    formData.append('difficulty', rawFormData.difficulty);
    formData.append('preparationTime', preparationTime);
    formData.append(
      'isMocktail',
      rawFormData.isMocktail === true ? 'true' : 'false'
    );

    // Ajouter l'image si elle existe
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    // Convertir les tableaux en JSON pour le serveur
    formData.append('ingredients', JSON.stringify(rawFormData.ingredients));
    formData.append(
      'instructions',
      JSON.stringify(rawFormData.instructions.map((i: any) => i.step))
    );
    formData.append('glassType', rawFormData.glassType || '');
    formData.append('alcoholLevel', rawFormData.alcoholLevel || '');
    formData.append('garnish', rawFormData.garnish || '');

    this.isLoading = true;

    if (this.isEditing && this.currentCocktailId) {
      // Mise à jour d'un cocktail existant
      this.cocktailService
        .updateCocktail(this.currentCocktailId, formData)
        .subscribe({
          next: () => {
            this.handleSuccess('Cocktail mis à jour avec succès !');
          },
          error: (error) => {
            this.handleError(
              'Erreur lors de la mise à jour du cocktail',
              error
            );
          },
        });
    } else {
      // Création d'un nouveau cocktail
      this.cocktailService.createCocktail(formData).subscribe({
        next: () => {
          this.handleSuccess('Cocktail créé avec succès !');
        },
        error: (error) => {
          this.handleError('Erreur lors de la création du cocktail', error);
        },
      });
    }
  }

  editCocktail(cocktail: Recette): void {
    this.isEditing = true;
    this.currentCocktailId = cocktail.id;
    this.resetForm();

    // Configurer l'aperçu de l'image
    this.imagePreview = cocktail.image;

    // Extraire le nombre de minutes du format "XX min"
    let prepTime = cocktail.preparationTime;
    if (prepTime && prepTime.includes(' min')) {
      prepTime = prepTime.replace(' min', '');
    }

    // Construire les arrays d'ingrédients et d'instructions
    const ingredientsArray = this.fb.array([]);
    const instructionsArray = this.fb.array([]);

    // Ajouter les ingrédients
    if (cocktail.ingredients && cocktail.ingredients.length > 0) {
      cocktail.ingredients.forEach((ing) => {
        const ingredientGroup = this.fb.group({
          name: [ing.name || ing.ingredient_id, Validators.required],
          quantity: [ing.quantity || '', Validators.required],
          unit: [ing.unit || ''],
        });
        (ingredientsArray as FormArray).push(ingredientGroup);
      });
    } else {
      (ingredientsArray as FormArray).push(this.createIngredient());
    }

    // Ajouter les instructions
    let instructions = cocktail.instructions || [];
    if (typeof instructions === 'string') {
      instructions = [instructions];
    }

    if (instructions.length > 0) {
      instructions.forEach((inst) => {
        const instructionGroup = this.fb.group({
          step: [inst, Validators.required],
        });
        (instructionsArray as FormArray).push(instructionGroup);
      });
    } else {
      (instructionsArray as FormArray).push(this.createInstruction());
    }

    // Mettre à jour le formulaire
    this.cocktailForm = this.fb.group({
      name: [cocktail.name, [Validators.required, Validators.minLength(3)]],
      description: [
        cocktail.description,
        [Validators.required, Validators.minLength(10)],
      ],
      image: [cocktail.image, Validators.required],
      difficulty: [cocktail.difficulty, Validators.required],
      preparationTime: [prepTime, Validators.required],
      ingredients: ingredientsArray,
      instructions: instructionsArray,
      glassType: [cocktail.glassType || ''],
      alcoholLevel: [cocktail.alcoholLevel || ''],
      garnish: [cocktail.garnish || ''],
      isMocktail: [cocktail.isMocktail || false],
    });
  }

  deleteCocktail(cocktailOrId: any): void {
    const id =
      typeof cocktailOrId === 'string'
        ? cocktailOrId
        : cocktailOrId?._id || cocktailOrId?.id;

    if (!id) {
      console.error(
        "Impossible de déterminer l'ID du cocktail à supprimer",
        cocktailOrId
      );
      return;
    }

    if (confirm('Êtes-vous sûr de vouloir supprimer ce cocktail?')) {
      this.isLoading = true;
      this.cocktailService.deleteCocktail(id).subscribe({
        next: () => {
          this.loadCocktails();
          this.statusMessage = 'Cocktail supprimé avec succès.';
          this.isSuccess = true;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Erreur lors de la suppression du cocktail', error);
          this.statusMessage = 'Erreur lors de la suppression du cocktail.';
          this.isSuccess = false;
          this.isLoading = false;
        },
      });
    }
  }

  resetForm(): void {
    this.cocktailForm = this.createForm();
    this.isEditing = false;
    this.currentCocktailId = null;
    this.formSubmitted = false;
    this.statusMessage = '';
    this.imagePreview = null;
    this.selectedFile = null;
  }

  private handleSuccess(message: string): void {
    this.loadCocktails();
    this.resetForm();
    this.statusMessage = message;
    this.isSuccess = true;
    this.isLoading = false;
  }

  private handleError(message: string, error: any): void {
    console.error(message, error);
    this.statusMessage = message;
    this.isSuccess = false;
    this.isLoading = false;
  }
}

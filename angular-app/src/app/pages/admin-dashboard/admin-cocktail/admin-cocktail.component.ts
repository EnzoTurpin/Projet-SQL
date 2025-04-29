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
import { Category } from '../../../interfaces/filters.interface';

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
  categories: Category[] = []; // Liste des catégories (Cocktail, Mocktail, etc.)

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
    this.loadCategories();
  }

  // Charger les catégories pour la liste déroulante
  loadCategories(): void {
    this.cocktailService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        // Tri alphabétique des catégories
        this.categories.sort((a, b) => a.name.localeCompare(b.name));
        console.log('Catégories chargées:', this.categories);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des catégories', error);
      },
    });
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
      category_id: ['', Validators.required], // Catégorie obligatoire
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

  // Gérer la soumission du formulaire
  onSubmit(): void {
    this.formSubmitted = true;

    if (this.cocktailForm.invalid) {
      console.error('Formulaire invalide:', this.cocktailForm.errors);
      this.statusMessage = 'Veuillez corriger les erreurs dans le formulaire.';
      this.isSuccess = false;
      return;
    }

    this.isLoading = true;
    const rawFormData = this.cocktailForm.value;

    // Convertir le temps de préparation en nombre
    const preparationTime = parseInt(rawFormData.preparationTime, 10);
    if (isNaN(preparationTime)) {
      this.statusMessage = 'Le temps de préparation doit être un nombre.';
      this.isSuccess = false;
      this.isLoading = false;
      return;
    }

    if (this.isEditing) {
      console.log('Mode édition');
      if (this.selectedFile) {
        // Si une nouvelle image est téléchargée, utiliser FormData
        const formData = new FormData();
        formData.append('name', rawFormData.name);
        formData.append('description', rawFormData.description);
        formData.append('difficulty', rawFormData.difficulty);
        formData.append('preparationTime', preparationTime.toString());

        if (rawFormData.glassType)
          formData.append('glassType', rawFormData.glassType);
        if (rawFormData.alcoholLevel)
          formData.append('alcoholLevel', rawFormData.alcoholLevel);
        if (rawFormData.garnish)
          formData.append('garnish', rawFormData.garnish);

        formData.append('category_id', rawFormData.category_id);

        // Ajouter la nouvelle image
        formData.append('image', this.selectedFile);

        // Convertir les tableaux en JSON strings pour FormData
        formData.append('ingredients', JSON.stringify(rawFormData.ingredients));
        formData.append(
          'instructions',
          JSON.stringify(rawFormData.instructions.map((i: any) => i.step))
        );

        this.updateCocktail(formData);
      } else {
        // Pas de nouvelle image: n'incluons pas le champ image dans la requête
        const updateData = {
          _id: this.currentCocktailId,
          name: rawFormData.name,
          description: rawFormData.description,
          difficulty: rawFormData.difficulty,
          preparationTime: preparationTime,
          glassType: rawFormData.glassType || '',
          alcoholLevel: rawFormData.alcoholLevel || '',
          garnish: rawFormData.garnish || '',
          category_id: rawFormData.category_id,
          // Formater correctement les ingrédients et instructions
          ingredients: rawFormData.ingredients.map((ingredient: any) => ({
            name: ingredient.name,
            quantity: ingredient.quantity,
            unit: ingredient.unit || '',
          })),
          instructions: rawFormData.instructions.map((i: any) => i.step),
          isMocktail: this.isMocktail(rawFormData.category_id)
            ? 'true'
            : 'false',
        };

        this.updateCocktail(updateData);
      }
    } else {
      console.log('Mode création');
      // En mode création, on utilise toujours FormData car une image est obligatoire
      const formData = new FormData();
      formData.append('name', rawFormData.name);
      formData.append('description', rawFormData.description);
      formData.append('difficulty', rawFormData.difficulty);
      formData.append('preparationTime', preparationTime.toString());

      if (rawFormData.glassType)
        formData.append('glassType', rawFormData.glassType);
      if (rawFormData.alcoholLevel)
        formData.append('alcoholLevel', rawFormData.alcoholLevel);
      if (rawFormData.garnish) formData.append('garnish', rawFormData.garnish);

      formData.append('category_id', rawFormData.category_id);

      // Ajouter l'image
      if (this.selectedFile) {
        formData.append('image', this.selectedFile);
      }

      // Convertir les tableaux en JSON strings pour FormData
      formData.append('ingredients', JSON.stringify(rawFormData.ingredients));
      formData.append(
        'instructions',
        JSON.stringify(rawFormData.instructions.map((i: any) => i.step))
      );

      this.createCocktail(formData);
    }
  }

  editCocktail(cocktail: Recette): void {
    console.log('Édition cocktail:', cocktail);
    console.log('ID du cocktail:', cocktail.id);
    console.log('_ID du cocktail:', cocktail._id);
    console.log('Toutes les propriétés:', Object.keys(cocktail));

    this.isEditing = true;
    this.currentCocktailId = cocktail._id || cocktail.id; // Utiliser _id en priorité
    console.log('ID utilisé pour la mise à jour:', this.currentCocktailId);

    // Ne pas appeler resetForm() car cela réinitialiserait isEditing à false
    // Effacer les anciens messages
    this.formSubmitted = false;
    this.statusMessage = '';

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
      category_id: [
        cocktail.category_id ||
          this.getCategoryIdByName(cocktail.category) ||
          '',
        Validators.required,
      ],
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
    // Ne réinitialiser le formulaire que si nous ne sommes pas en mode édition
    // ou si le message indique une création réussie
    if (!this.isEditing || message.includes('créé')) {
      this.resetForm();
    } else {
      // En mode édition, ne pas réinitialiser le formulaire, juste mettre à jour le statut
      this.isLoading = false;
    }
    this.statusMessage = message;
    this.isSuccess = true;
  }

  private handleError(message: string, error: any): void {
    console.error(message, error);
    this.statusMessage = message;

    // Ajouter plus de détails d'erreur si disponibles
    if (error && error.error && error.error.data) {
      let errorDetails = '';
      const errorData = error.error.data;

      // Parcourir les champs d'erreur et ajouter à notre message
      Object.keys(errorData).forEach((field) => {
        if (Array.isArray(errorData[field])) {
          errorData[field].forEach((msg: string) => {
            errorDetails += `\n- ${msg}`;
          });
        }
      });

      if (errorDetails) {
        this.statusMessage += ` Détails: ${errorDetails}`;
      }
    }

    this.isSuccess = false;
    this.isLoading = false;
  }

  // Méthode pour obtenir l'ID de catégorie à partir du nom
  getCategoryIdByName(categoryName: string | undefined): string {
    if (!categoryName || !this.categories || this.categories.length === 0)
      return '';

    const category = this.categories.find(
      (c) => c.name.toLowerCase() === categoryName?.toLowerCase()
    );

    return category?._id || '';
  }

  // Pour vérifier si une recette est un mocktail (pour la rétrocompatibilité)
  isMocktail(categoryId: string): boolean {
    if (!categoryId || !this.categories || this.categories.length === 0)
      return false;

    const category = this.categories.find((c) => c._id === categoryId);
    return category?.name?.toLowerCase() === 'mocktail';
  }

  private updateCocktail(cocktailData: any): void {
    console.log('Mise à jour cocktail avec ID:', this.currentCocktailId);
    console.log('Données envoyées:', cocktailData);

    // Vérifier la présence de la catégorie
    if (cocktailData instanceof FormData) {
      // Vérifier si category_id est présent et défini
      const categoryId = cocktailData.get('category_id');
      console.log('Category ID dans FormData:', categoryId);

      if (!categoryId || categoryId === 'undefined' || categoryId === 'null') {
        console.error('Category ID manquant ou invalide');
        // Si on a la liste des catégories, on peut prendre la première par défaut
        if (this.categories && this.categories.length > 0) {
          const defaultCategory = this.categories[0]._id;
          console.log(
            'Utilisation de la catégorie par défaut:',
            defaultCategory
          );
          // S'assurer que defaultCategory est une chaîne de caractères
          if (defaultCategory) {
            cocktailData.set('category_id', defaultCategory.toString());
          }
        } else {
          this.handleError(
            'Erreur: Catégorie manquante ou invalide',
            new Error('Category ID missing')
          );
          return;
        }
      }

      // Ajouter un log détaillé du contenu final du FormData
      console.log('Contenu final du FormData avant envoi:');
      cocktailData.forEach((value, key) => {
        console.log(`${key}: ${value}`);
      });
    } else {
      // Vérifier si category_id est présent et défini
      if (
        !cocktailData.category_id ||
        cocktailData.category_id === 'undefined'
      ) {
        console.error("Category ID manquant ou invalide dans l'objet JSON");
        // Si on a la liste des catégories, on peut prendre la première par défaut
        if (this.categories && this.categories.length > 0) {
          cocktailData.category_id = this.categories[0]._id;
          console.log(
            'Utilisation de la catégorie par défaut:',
            cocktailData.category_id
          );
        } else {
          this.handleError(
            'Erreur: Catégorie manquante ou invalide',
            new Error('Category ID missing')
          );
          return;
        }
      }
    }

    // Si les données ne sont pas déjà un FormData, assurons-nous que ingredients et instructions sont correctement formatés
    if (!(cocktailData instanceof FormData)) {
      // S'assurer que les tableaux sont des tableaux JavaScript réguliers
      if (cocktailData.ingredients && Array.isArray(cocktailData.ingredients)) {
        // Laisser tel quel, sera converti en JSON string dans le service
      }

      if (
        cocktailData.instructions &&
        Array.isArray(cocktailData.instructions)
      ) {
        // Extraire seulement les étapes si ce n'est pas déjà fait
        if (
          cocktailData.instructions.length > 0 &&
          typeof cocktailData.instructions[0] === 'object'
        ) {
          cocktailData.instructions = cocktailData.instructions.map(
            (i: any) => i.step
          );
        }
      }
    }

    this.isLoading = true;
    this.cocktailService
      .updateCocktail(this.currentCocktailId!, cocktailData)
      .subscribe({
        next: (response) => {
          console.log('Réponse de mise à jour:', response);
          this.handleSuccess('Cocktail mis à jour avec succès.');
        },
        error: (error) => {
          console.error('Erreur complète:', error);
          this.handleError('Erreur lors de la mise à jour du cocktail.', error);
        },
      });
  }

  private createCocktail(formData: FormData): void {
    console.log("Création d'un nouveau cocktail");
    console.log('Données envoyées:', formData);

    this.isLoading = true;
    this.cocktailService.createCocktail(formData).subscribe({
      next: (response) => {
        console.log('Réponse de création:', response);
        this.handleSuccess('Cocktail créé avec succès.');
      },
      error: (error) => {
        console.error('Erreur complète:', error);
        this.handleError('Erreur lors de la création du cocktail.', error);
      },
    });
  }
}

import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PieceService, EquipementType } from '../services/piece';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { MyTranslateService } from '../services/translate.service';

@Component({
  selector: 'app-add-equipement',
  templateUrl: './equipement.html',
  styleUrls: ['./equipement.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule, TranslateModule],
})
export class AddEquipementComponent implements OnInit {
  pieceId!: number;
  equipementForm: FormGroup;
  message: string = '';
  equipementTypes: EquipementType[] = [];
  selectedTypeId: number | null = null;
  selectedType: EquipementType | null = null;

  private translateService = inject(MyTranslateService); // ✅ traduction

  constructor(
    private fb: FormBuilder,
    private pieceService: PieceService,
    private route: ActivatedRoute,
    private router: Router,
    private cd: ChangeDetectorRef
  ) {
    this.equipementForm = this.fb.group({
      description: [''],
      etat: ['Off', Validators.required]
    });
  }
ngOnInit() {
  this.translateService.initLanguage();
  
  // Essai 1 : route param (/equipement/:id)
  const idParam = this.route.snapshot.paramMap.get('id');
  this.pieceId = idParam ? Number(idParam) : 0;
  
  // Essai 2 : query param (/equipement?pieceId=5) en fallback
  if (!this.pieceId || this.pieceId === 0) {
    const queryId = this.route.snapshot.queryParamMap.get('pieceId');
    this.pieceId = queryId ? Number(queryId) : 0;
  }
  
  console.log('✅ pieceId final:', this.pieceId);
  
  if (!this.pieceId || this.pieceId === 0) {
    this.message = 'Erreur : Id de pièce manquant dans l\'URL';
    return;
  }
  
  this.loadEquipementTypes();
}

  loadEquipementTypes() {
    this.pieceService.getEquipementTypes().subscribe({
      next: (data) => {
        console.log('🔍 Types reçus:', JSON.stringify(data));
        this.equipementTypes = data || [];
        if (this.equipementTypes.length > 0) {
          this.selectedTypeId = this.equipementTypes[0].id_type;
          this.onTypeChange();
        }
        this.cd.detectChanges();
      },
      error: (err) => console.error('Erreur getEquipementTypes:', err)
    });
  };

 

  onTypeChange() {
    this.selectedType =
      this.equipementTypes.find(t => t.id_type == this.selectedTypeId) || null;
  }

   getTypeName(type: EquipementType): string {
  const lang = this.translateService.getCurrentLang();
  const name = lang === 'fr' ? type.nomFr : type.nomEn;
  return name || type.nom || 'Sans nom'; // 👈 fallback sur nom
}
  onSubmit() {
    console.log('pieceId au submit:', this.pieceId); // debug

    if (!this.pieceId || this.pieceId === 0) {
      this.message = 'Erreur : Id de pièce manquant';
      return;
    }

    const data = {
      nom: this.selectedType?.nom ?? '',
      description: this.equipementForm.value.description,
      etat: this.equipementForm.value.etat ?? 'Off',
      type_id: this.selectedTypeId ?? undefined
    };

    this.pieceService.addEquipement(this.pieceId, data).subscribe({
      next: () => {
        this.message = 'Équipement ajouté !';
        this.equipementForm.reset({ etat: 'Off' });
        this.router.navigate(['/client-dash']);
      },
      error: (err) => {
        this.message = 'Erreur : ' + (err.error?.message || err.message);
      }
    });
  }
}
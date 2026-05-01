import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PieceService, EquipementType } from '../services/piece';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-add-equipement',
  templateUrl: './equipement.html',
  styleUrls: ['./equipement.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
})
export class AddEquipementComponent implements OnInit {

  pieceId!: number;
  equipementForm: FormGroup;
  message: string = '';

  // ✅ NEW
  equipementTypes: EquipementType[] = [];
  selectedTypeId: number | null = null;
  selectedType: EquipementType | null = null;

  constructor(
    private fb: FormBuilder,
    private pieceService: PieceService,
    private route: ActivatedRoute,
    private router: Router,
    private cd: ChangeDetectorRef 
  ) {
    this.equipementForm = this.fb.group({
      nom: [''],
      description: [''],
      etat: ['Off', Validators.required]
    });
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.pieceId = Number(params.get('id'));
    });

    // ✅ NEW: charger types equipements
    this.loadEquipementTypes();
  }

loadEquipementTypes() {
  this.pieceService.getEquipementTypes().subscribe({
    next: (data) => {
      this.equipementTypes = data || [];
      if (this.equipementTypes.length > 0) {
        this.selectedTypeId = this.equipementTypes[0].id_type;
        this.onTypeChange();
      }
      this.cd.detectChanges();   // ✅ ajouté ici
    },
    error: (err) => console.error('Erreur getEquipementTypes:', err)
  });
}

  onTypeChange() {
    this.selectedType =
      this.equipementTypes.find(t => t.id_type == this.selectedTypeId) || null;
  }

  onSubmit() {
  if (!this.pieceId) {
    this.message = 'Erreur : Id de pièce manquant';
    return;
  }

  if (this.equipementForm.invalid) {
    this.message = 'Veuillez remplir le nom et l’état';
    return;
  }

  const data = {
    nom: this.selectedType?.nom,   // ✅ ICI la correction
    description: this.equipementForm.value.description,
    etat: this.equipementForm.value.etat,
    type_id: this.selectedTypeId ?? undefined
  };

  this.pieceService.addEquipement(this.pieceId, data).subscribe({
    next: () => {
      this.message = 'Équipement ajouté avec succès !';
      this.equipementForm.reset({ etat: 'Off' });
      this.router.navigate(['/client-dash']);
    },
    error: (err) => {
      this.message = 'Erreur : ' + (err.error?.message || err.message);
    }
  });
} }
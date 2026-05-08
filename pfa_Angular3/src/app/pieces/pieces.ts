import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PieceService, Piece, PieceType } from '../services/piece';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { MyTranslateService } from '../services/translate.service';
@Component({
  selector: 'app-pieces',
  templateUrl: './pieces.html',
  styleUrls: ['./pieces.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule,  TranslateModule]
})
export class PiecesComponent implements OnInit {
  pieces: Piece[] = [];
  uniqueTypes: PieceType[] = [];

  newPieceName = '';
  selectedTypeId: number | null = null;

  selectedType: PieceType | null = null;

    private translateService = inject(MyTranslateService);
  translate = this.translateService.translate;


  constructor(private pieceService: PieceService, private router: Router, private cdr: ChangeDetectorRef ,) {}

  ngOnInit(): void {
    this.translateService.initLanguage();
    this.loadPieces();
    this.loadPieceTypes();
  }

  loadPieces() {
    this.pieceService.getPieces().subscribe(data => this.pieces = data);
  }

loadPieceTypes() {
  this.pieceService.getPieceTypes().subscribe({
    next: (data) => {
      console.log('Types reçus:', data); // 🔍 DEBUG — vois ce que retourne l'API
      this.uniqueTypes = [...data];      // ✅ force la détection de changements
      if (data.length > 0) {
        this.selectedTypeId = data[0].id_type;
        this.selectedType = data[0];     // ✅ initialise directement sans onTypeChange
      }
    },
    error: (err) => console.error('Erreur chargement types:', err)
  });
}

  onTypeChange() {
 
  this.selectedType = this.uniqueTypes.find(t => t.id_type == this.selectedTypeId) || null;
}

  addPiece() {
  if (!this.newPieceName.trim() || this.selectedTypeId === null) return;

  const dto = {
    name: this.newPieceName.trim(),
    type_id: this.selectedTypeId
  };

  this.pieceService.addPiece(dto as any).subscribe({
    next: (res: any) => {
      const newPieceId = res.pieceId;
      this.newPieceName = '';
      this.loadPieces();
      this.router.navigate(['/equipement', newPieceId]);
    },
    error: (err) => {
      console.error('Erreur ajout pièce:', err);
      console.error('Message backend:', err?.error?.message);
    }
  });
}

  deletePiece(id: number) {
    this.pieceService.deletePiece(id).subscribe(() => this.loadPieces());
  }

  getTypeName(type: PieceType): string {
  const lang = this.translateService.getCurrentLang();
  return lang === 'fr' ? type.nomFr : type.nomEn;
}

}
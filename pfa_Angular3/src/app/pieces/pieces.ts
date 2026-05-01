import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PieceService, Piece, PieceType } from '../services/piece';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
@Component({
  selector: 'app-pieces',
  templateUrl: './pieces.html',
  styleUrls: ['./pieces.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class PiecesComponent implements OnInit {
  pieces: Piece[] = [];
  uniqueTypes: PieceType[] = [];

  newPieceName = '';
  selectedTypeId: number | null = null;

  selectedType: PieceType | null = null;

  constructor(private pieceService: PieceService, private router: Router, private cdr: ChangeDetectorRef ,) {}

  ngOnInit(): void {
    this.loadPieces();
    this.loadPieceTypes();
  }

  loadPieces() {
    this.pieceService.getPieces().subscribe(data => this.pieces = data);
  }

  loadPieceTypes() {
    this.pieceService.getPieceTypes().subscribe(data => {
      this.uniqueTypes = data;

      if (data.length > 0) {
        this.selectedTypeId = data[0].id_type;
        this.onTypeChange();
      }
      this.cdr.detectChanges();
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

}
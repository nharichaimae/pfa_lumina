import { Component, ChangeDetectorRef, NgZone, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PieceService, PieceType } from '../services/piece';
import { Router } from '@angular/router';
import { ConditionService } from '../services/condition.service';
import RecordRTC, { StereoAudioRecorder } from 'recordrtc';
import { VoiceService } from '../services/voice';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AiNotificationService } from '../ai-notification/ai-notification.service';

@Component({
  selector: 'app-client-dashb',
  templateUrl: './client-dashb.html',
  styleUrl: './client-dashb.scss',
  standalone: true,
 imports: [CommonModule, FormsModule, TranslateModule],
})
export class ClientDashb implements OnInit, OnDestroy {
  pieces: any[] = [];
  pieceTypes: PieceType[] = [];
  private refreshTimer: any;

  stream: MediaStream | null = null;
  recorder: any;
  isRecording = false;
  lastVoiceResult: any = null;

  showFeedback = false;
  feedbackType = '';
  feedbackMessage = '';
  feedbackEquipement = '';
  feedbackText = '';

  constructor(
    private pieceService: PieceService,
    private router: Router,
    private cd: ChangeDetectorRef,
    private zone: NgZone,
    private conditionService: ConditionService,
    private voiceService: VoiceService,
    private aiService: AiNotificationService,
    private translate: TranslateService,
  ) {}
  translatePieceName(name: string): string {
  if (!name) return '';

  const cleanName = name.trim();
  const key = 'PIECE_TYPES.' + cleanName;
  const translated = this.translate.instant(key);

  return translated === key ? cleanName : translated;
}

translateEquipName(name: string): string {
  if (!name) return '';

  const cleanName = name.trim();
  const key = 'EQUIPMENT_TYPES.' + cleanName;
  const translated = this.translate.instant(key);

  return translated === key ? cleanName : translated;
}

  ngOnInit() {
    this.loadPieceTypes();

    this.aiService.equipementAllume$.subscribe(equipId => {
      this.updateEquipementLocalState(equipId, true);
    });

    this.refreshTimer = setInterval(async () => {
      await this.loadEtatsEquipements();
      this.cd.detectChanges();
    }, 60000);
  }

  ngOnDestroy() {
    if (this.refreshTimer) clearInterval(this.refreshTimer);
    this.resetVoice();
  }

  loadPieceTypes() {
    this.pieceService.getPieceTypes().subscribe({
      next: (types) => {
        this.pieceTypes = types || [];
        this.loadPieces();
      },
      error: () => this.loadPieces()
    });
  }

  loadPieces() {
    this.pieceService.getPieces().subscribe({
      next: async (data: any[]) => {
        this.pieces = (data || []).map(p => {
          const typeId = p.typeId ?? p.type_id ?? p.typeID ?? p.type_Id;
          const foundType = this.pieceTypes.find(t => t.id_type === typeId);

          return {
            ...p,
            showMenu: false,
            id: p.id ?? p.id_piece ?? p.id_Piece ?? p.Id_Piece,
            nom: p.nom ?? p.Nom,
            icon: p.icon ?? foundType?.icon ?? '',
            typeNom: p.typeNom ?? foundType?.nom ?? '',
            equipements: (p.equipements ?? p.Equipements ?? []).map((e: any) => ({
              ...e,
              id: e.id ?? e.Id_Equipement ?? e.id_equipement,
              nom: e.nom ?? e.Nom,
              description: e.description ?? e.Description,
              etat: this.normalizeEtat(e)
            }))
          };
        });

        await this.loadEtatsEquipements();
        this.cd.detectChanges();
      },
      error: (err) => console.error('Erreur getPieces:', err)
    });
  }

  private normalizeEtat(e: any): boolean {
    const val = (e.etat ?? e.Etat ?? 'OFF').toString().toUpperCase();
    return val === 'ON';
  }

  async loadEtatsEquipements() {
    const now = new Date();

    for (const piece of this.pieces) {
      for (const equip of piece.equipements) {
        const id = equip.id ?? equip.Id_Equipement ?? equip.id_equipement;

        try {
          await new Promise<void>((resolve) => {
            this.conditionService.getByEquipement(id).subscribe({
              next: (conditions: any[]) => {
                if (conditions && conditions.length > 0) {
                  const autoConditions = conditions.filter(c => c.source === 'auto');

                  if (autoConditions.length > 0) {
                    const sorted = autoConditions.sort((a, b) =>
                      new Date(b.dateHeure).getTime() - new Date(a.dateHeure).getTime()
                    );

                    const derniere = sorted[0];
                    const dateCondition = new Date(derniere.dateHeure);

                    if (dateCondition <= now) {
                      equip.etat = derniere.valeur === 'ON';
                    } else {
                      equip.etat = false;
                    }
                  }
                }

                resolve();
              },
              error: () => resolve()
            });
          });
        } catch {
          
        }
      }
    }
  }

  goToAddEquipement(pieceId: number) {
    this.router.navigate(['/equipement', pieceId]);
  }

  goToCondition(equip: any) {
    const nom = equip.nom?.toLowerCase() || '';
    const desc = equip.description?.toLowerCase() || '';

    let type = 'lampe';

    if (nom.includes('chauf') || desc.includes('chauf')) type = 'chauffage';
    else if (nom.includes('clim') || desc.includes('clim')) type = 'clime';
    else if (nom.includes('tv') || nom.includes('telev') || desc.includes('telev')) type = 'television';
    else if (nom.includes('lamp') || desc.includes('lamp')) type = 'lampe';

    this.router.navigate(['/condition'], {
      queryParams: {
        id: equip.id,
        nom: equip.nom,
        type: type
      }
    });
  }

  deletePiece(id: number) {
    if (confirm("Voulez-vous vraiment supprimer cette pièce ?")) {
      this.pieceService.deletePiece(id).subscribe(() => {
        this.loadPieces();
        this.cd.detectChanges();
      });
    }
  }

  deleteEquip(id: number) {
    if (confirm("Voulez-vous supprimer cet équipement ?")) {
      this.pieceService.deleteEquipement(id).subscribe(() => {
        this.loadPieces();
        this.cd.detectChanges();
      });
    }
  }

  duplicatePiece(id: number) {
    this.pieceService.duplicatePiece(id).subscribe({
      next: () => {
        this.loadPieces();
        this.cd.detectChanges();
      },
      error: (err) => console.error('Erreur duplication:', err)
    });
  }

  toggleEquip(equip: any) {
    const newEtat = equip.etat ? 'OFF' : 'ON';

    this.pieceService.updateEquipementEtat(equip.id, newEtat).subscribe({
      next: () => {
        equip.etat = newEtat === 'ON';
        this.cd.detectChanges();
      },
      error: () => {
        this.cd.detectChanges();
      }
    });
  }

  private updateEquipementLocalState(equipId: any, newEtat: boolean) {
    this.zone.run(() => {
      const idToFind = Number(equipId);

      this.pieces = this.pieces.map(piece => ({
        ...piece,
        equipements: piece.equipements.map((equip: any) => {
          const currentId = Number(
            equip.id ?? equip.Id_Equipement ?? equip.id_equipement
          );

          if (currentId === idToFind) {
            return {
              ...equip,
              etat: newEtat
            };
          }

          return equip;
        })
      }));

      this.cd.detectChanges();
    });
  }

  toggleVoice() {
    if (this.isRecording) {
      this.stopGlobalRecording();
    } else {
      this.startGlobalVoice();
    }
  }

  async startGlobalVoice() {
    if (this.isRecording) return;

    this.zone.run(() => {
      this.isRecording = true;
      this.lastVoiceResult = null;
      this.showFeedback = false;
      this.cd.detectChanges();
    });

    try {
      await this.speak('Vous pouvez commencer à parler');

      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      this.recorder = new RecordRTC(this.stream, {
        type: 'audio',
        mimeType: 'audio/wav',
        recorderType: StereoAudioRecorder,
        numberOfAudioChannels: 1,
        desiredSampRate: 16000
      });

      this.recorder.startRecording();

    } catch (error) {
      console.error('❌ Erreur:', error);
      this.showFeedbackError('Erreur micro ou voix');
      this.resetVoice();
    }
  }

  stopGlobalRecording() {
    if (!this.recorder || !this.isRecording) return;

    this.speak('Veuillez patienter');

    this.recorder.stopRecording(() => {
      const blob = this.recorder.getBlob();

      this.zone.run(() => {
        this.isRecording = false;
        this.cd.detectChanges();
      });

      if (!blob || blob.size < 1000) {
        this.showFeedbackError('Audio trop court');
        this.stopMicro();
        this.resetVoice();
        return;
      }

      this.voiceService.sendGlobalAudio(blob).subscribe({
        next: (response: any) => {
          this.zone.run(() => {
            console.log('✅ Réponse audio:', response);

            if (response.success && response.equipement) {
              const equipId = response.equipement.id;

              const etatValue =
                response.equipement.etatActuel ??
                response.equipement.etat ??
                response.equipement.Etat;

              const newEtat = etatValue?.toString().toUpperCase() === 'ON';

              this.updateEquipementLocalState(equipId, newEtat);
            }

            this.handleVoiceResponse(response);

            if (response.success && response.message) {
              this.speak(response.message);
            } else {
              this.speak('Action non reconnue');
            }

            this.cd.detectChanges();
          });
        },

        error: (err) => {
          this.zone.run(() => {
            console.error('❌ Erreur envoi audio:', err);
            this.showFeedbackError('Erreur serveur');
            this.speak('Erreur serveur');
            this.cd.detectChanges();
          });
        },

        complete: () => {
          this.zone.run(() => {
            this.stopMicro();
            this.resetVoice();
            this.cd.detectChanges();
          });
        }
      });
    });
  }

  stopMicro() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }

  speak(text: string): Promise<void> {
    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      utterance.rate = 1;
      utterance.pitch = 1;

      utterance.onend = () => resolve();

      speechSynthesis.speak(utterance);
    });
  }

  private handleVoiceResponse(response: any) {
    this.lastVoiceResult = response;
    this.showFeedback = true;
    this.feedbackType = response.success ? 'success' : 'error';

    if (response.success) {
      this.feedbackMessage = response.message || 'Commande exécutée';
      this.feedbackEquipement = response.equipement
        ? `${response.equipement.nom} (${response.equipement.piece})`
        : '';
      this.feedbackText = response.textCorrige || response.textBrut || '';
    } else {
      this.feedbackMessage = response.error || "Je n'ai pas compris";
      this.feedbackEquipement = '';
      this.feedbackText = response.textCorrige || response.textBrut || '';
    }

    setTimeout(() => {
      this.zone.run(() => {
        this.showFeedback = false;
        this.cd.detectChanges();
      });
    }, 2500);
  }

  private showFeedbackError(message: string) {
    this.zone.run(() => {
      this.feedbackType = 'error';
      this.feedbackMessage = message;
      this.feedbackEquipement = '';
      this.feedbackText = '';
      this.showFeedback = true;
      this.cd.detectChanges();
    });

    setTimeout(() => {
      this.zone.run(() => {
        this.showFeedback = false;
        this.cd.detectChanges();
      });
    }, 2500);
  }

  private resetVoice() {
    this.zone.run(() => {
      this.isRecording = false;

      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop());
        this.stream = null;
      }

      if (this.recorder) {
        this.recorder = null;
      }

      this.cd.detectChanges();
    });
  }
}
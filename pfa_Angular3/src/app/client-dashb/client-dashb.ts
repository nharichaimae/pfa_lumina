import { Component, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PieceService, PieceType } from '../services/piece';
import { Router } from '@angular/router';
import { ConditionService } from '../services/condition.service';
import RecordRTC, { StereoAudioRecorder } from 'recordrtc';
import { VoiceService } from '../services/voice';
import { AiNotificationService } from '../ai-notification/ai-notification.service';

@Component({
  selector: 'app-client-dashb',
  templateUrl: './client-dashb.html',
  styleUrl: './client-dashb.scss',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class ClientDashb implements OnInit, OnDestroy {
  pieces: any[] = [];
  pieceTypes: PieceType[] = [];
  private refreshTimer: any;
  stream: MediaStream | null = null;
  recorder: any;
  isRecording = false;
  lastVoiceResult: any = null;

  // 🔥 FEEDBACK NOUVEAU
  showFeedback = false;
  feedbackType = '';
  feedbackMessage = '';
  feedbackEquipement = '';
  feedbackText = '';

  constructor(
    private pieceService: PieceService,
    private router: Router,
    private cd: ChangeDetectorRef,
    private conditionService: ConditionService,
    private voiceService: VoiceService,
    private aiService: AiNotificationService,
  ) {}

 ngOnInit() {
  this.loadPieceTypes();

  //  Écouter quand l'IA allume un équipement
  this.aiService.equipementAllume$.subscribe(equipId => {
    this.pieces.forEach(piece => {
      piece.equipements.forEach((equip: any) => {
        if (equip.id === equipId) {
          equip.etat = true; // ← mise à jour immédiate
        }
      });
    });
    this.cd.detectChanges();
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
            etat: (e.etat ?? e.Etat ?? 'Off').toString().toUpperCase() === 'ON' // ✅ état réel
          }))
        };
      });

      await this.loadEtatsEquipements();
      this.cd.detectChanges();
    },
    error: (err) => console.error('Erreur getPieces:', err)
  });
}

  // ✅ Lit seulement les conditions AUTO créées par Hangfire
  async loadEtatsEquipements() {
  const now = new Date(); // Heure actuelle

  for (const piece of this.pieces) {
    for (const equip of piece.equipements) {
      const id = equip.id ?? equip.Id_Equipement ?? equip.id_equipement;
      try {
        await new Promise<void>((resolve) => {
          this.conditionService.getByEquipement(id).subscribe({
            next: (conditions: any[]) => {
              if (conditions && conditions.length > 0) {
                // Filtrer seulement source = "auto" (Hangfire)
                const autoConditions = conditions.filter(c => c.source === 'auto');

                if (autoConditions.length > 0) {
                  // Trier par date et prendre la plus récente
                  const sorted = autoConditions.sort((a, b) =>
                    new Date(b.dateHeure).getTime() - new Date(a.dateHeure).getTime()
                  );

                  const derniere = sorted[0];
                  const dateCondition = new Date(derniere.dateHeure);

                  // 🔹 Appliquer seulement si l'heure est déjà passée
                  if (dateCondition <= now) {
                    equip.etat = derniere.valeur === 'ON';
                  } else {
                    // Optionnel : garder OFF si la condition n'est pas encore arrivée
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
        // ignore
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
      queryParams: { id: equip.id, nom: equip.nom, type: type }
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
  const newEtat = equip.etat ? "OFF" : "ON";

  this.pieceService.updateEquipementEtat(equip.id, newEtat).subscribe({
    next: () => {
      equip.etat = newEtat === "ON";
      this.cd.detectChanges();
    },
    error: () => {
      this.cd.detectChanges();
    }
  });
}

// VOICE

toggleVoice() {
  if (this.isRecording) {
    this.stopGlobalRecording();
  } else {
    this.startGlobalVoice();
  }
}
async startGlobalVoice() {
  if (this.isRecording) return;

  console.log('🎤 Démarrage enregistrement...');
  this.isRecording = true;

  this.lastVoiceResult = null;
  this.showFeedback = false;
  this.cd.detectChanges();

  try {
    // 🗣️ attendre la fin de la voix
    await this.speak('Vous pouvez commencer à parler');

    // 🎤 ensuite démarrer micro
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
    console.log('✅ Enregistrement démarré');

  } catch (error) {
    console.error('❌ Erreur:', error);
    this.showFeedbackError('Erreur micro ou voix');
    this.resetVoice();
  }
}


stopGlobalRecording() {
  if (!this.recorder || !this.isRecording) return;

  // 🗣️ Voix : dire à l'utilisateur d'attendre
  this.speak('Veuillez patienter');

  console.log('⏹️ Arrêt enregistrement...');

  this.recorder.stopRecording(() => {
    const blob = this.recorder.getBlob();

    // 🔴 Arrêter le mode recording
    this.isRecording = false;

    if (!blob || blob.size < 1000) {
      this.showFeedbackError('Audio trop court');
      this.stopMicro();
      this.resetVoice();
      return;
    }

    console.log('📤 Envoi audio:', blob.size, 'bytes');

    this.voiceService.sendGlobalAudio(blob).subscribe({
      next: (response: any) => {
        console.log('✅ Réponse:', response);
        this.handleVoiceResponse(response);

        // 🗣️ VOIX : annoncer l'action exécutée
        if (response.success && response.message) {
          this.speak(response.message);
        } else {
          this.speak("Action non reconnue");
        }

        // 🔄 Mise à jour UI
        if (response.success && response.equipement) {
          const equipId = response.equipement.id;
          const newEtat = response.equipement.etatActuel === 'ON';

          this.pieces.forEach(piece => {
            piece.equipements.forEach((equip: any) => {
              if ((equip.id ?? equip.Id_Equipement ?? equip.id_equipement) === equipId) {
                equip.etat = newEtat;
              }
            });
          });
        }

        this.cd.detectChanges();
      },

      error: (err) => {
        console.error('❌ Erreur envoi audio:', err);
        this.showFeedbackError('Erreur serveur');

        // 🗣️ Voix en cas d’erreur
        this.speak("Erreur serveur");
      },

      complete: () => {
        this.stopMicro();
        this.resetVoice();
      }
    });
  });
}

// éviter que le micro reste actif
stopMicro() {
  if (this.stream) {
    this.stream.getTracks().forEach(track => track.stop());
    this.stream = null;
  }
}

// 🗣️ Parole (Text-to-Speech)
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
  // FEEDBACK
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
    
    //durre 
    setTimeout(() => {
      this.showFeedback = false;
    }, 2500);
  }

  private showFeedbackError(message: string) {
    this.feedbackType = 'error';
    this.feedbackMessage = message;
    this.feedbackEquipement = '';
    this.feedbackText = '';
    this.showFeedback = true;
    setTimeout(() => this.showFeedback = false, 2500);
  }

  private resetVoice() {
    this.isRecording = false;
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.recorder) {
      this.recorder = null;
    }
    this.cd.detectChanges();
  }
}
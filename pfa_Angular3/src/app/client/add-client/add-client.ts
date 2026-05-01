import { Component } from '@angular/core';
import { Router ,RouterModule} from '@angular/router';
import { ClientService } from '../../services/client.service';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';


@Component({
  standalone: true,
  templateUrl: './add-client.html',
  imports: [CommonModule, FormsModule,RouterModule],
})
export class AddClientComponent {

  client = {
    nom: '',
    prenom: '',
    email: '',
    password: '',
    telephone: '',
    cin: ''
  };

  selectedFile!: File; // pour la photo

  constructor(
    private clientService: ClientService,
    private router: Router
  ) {}

  // récupère la photo sélectionnée
  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  onSubmit(f: NgForm) {
    if (f.invalid) return; 

    const formData = new FormData();
    formData.append('nom', this.client.nom);
    formData.append('prenom', this.client.prenom);
    formData.append('email', this.client.email);
    formData.append('password', this.client.password);
    formData.append('telephone', this.client.telephone);
    formData.append('cin', this.client.cin);

    if (this.selectedFile) {
      formData.append('photoProfil', this.selectedFile);
    }

    this.clientService.addClient(formData).subscribe({
      next: () => {
        alert('Client ajouté avec succès ✅');
        this.router.navigate(['/clients']); 
      },
    });
  }
}

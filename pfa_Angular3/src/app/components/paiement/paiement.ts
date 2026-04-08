import { Component, OnInit } from '@angular/core';
import { StripeService } from '../../services/StripeService';
import { loadStripe, Stripe, StripeCardElement, StripeElements } from '@stripe/stripe-js';
import { AuthService } from '../../services/auth';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';


@Component({
  selector: 'app-paiement',
  templateUrl: './paiement.component.html',
  styleUrls: ['./paiement.component.css'],
  
})
export class PaiementComponent implements OnInit {
  montant = 200;           
  userId!: number;
  stripePriceId = 'price_1T8s9I11LDEECuJDWTVPHgGEjaO4tcZvfRxhF7pDrOYLZ3mrpnkcLYJeaJ7ICQqjxRXFThByIFaPua17HMqDLv8j00c7iKfDMu'; 
  stripe: Stripe | null = null;
  elements!: StripeElements;
  card!: StripeCardElement;
  clientSecretOneShot!: string;
  clientSecretAbonnement!: string;
abonnementForm!: FormGroup;
 constructor(
  private stripeService: StripeService,
  private authService: AuthService,
  private fb: FormBuilder
) {}

  async ngOnInit() {
    this.abonnementForm = this.fb.group({
  email: ['', [Validators.required, Validators.email]]
});
    const id = this.authService.getUserId();

  if (!id) {
    alert("Utilisateur non connecté");
    return;
  }

  this.userId = id;
    this.stripe = await loadStripe('pk_test_51T5EZt11LDEECuJDWTVPHgGEjaO4tcZvfRxhF7pDrOYLZ3mrpnkcLYJeaJ7ICQqjxRXFThByIFaPua17HMqDLv8j00c7iKfDMu');
    if (this.stripe) {
      this.elements = this.stripe.elements();
      this.card = this.elements.create('card');
      this.card.mount('#card-element');
    }
  }
async payerOneShot() {
  if (!this.stripe) return;

  try {
    // 1️⃣ Appel backend
    this.clientSecretOneShot = await this.stripeService.payOneShot(this.montant, this.userId);

    // 2️⃣ Confirmation Stripe
    const { paymentIntent, error } = await this.stripe.confirmCardPayment(
      this.clientSecretOneShot,
      {
        payment_method: {
          card: this.card
        }
      }
    );

    // 🔥 AJOUT ICI
    // console.log("RESULTAT STRIPE :", paymentIntent, error);

    if (error) {
      console.error(error);
      alert("Erreur de paiement");
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      alert("Paiement réussi ✅");
    }

  } catch (e) {
    console.error(e);
    alert("Erreur serveur");
  }
}

  async creerAbonnement() {
    if (!this.stripe) return;

    // 1️⃣ Appel backend pour créer l'abonnement et récupérer clientSecret
this.clientSecretAbonnement = await this.stripeService.createAbonnement({
  userId: this.userId,
  email: this.abonnementForm.value.email,
  stripePriceId: this.stripePriceId
});
    // 2️⃣ Confirmer le paiement initial de l’abonnement
    const { paymentIntent, error } = await this.stripe.confirmCardPayment(this.clientSecretAbonnement, {
      payment_method: { card: this.card }
    });

    if (error) {
      console.error(error);
      alert('Erreur lors de la création de l’abonnement');
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      alert('Abonnement créé et payé avec succès !');
    }
  }
}
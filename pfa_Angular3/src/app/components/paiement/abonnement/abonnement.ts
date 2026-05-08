import { Component, OnInit } from '@angular/core';
import { StripeService } from '../../../services/StripeService';
import { AuthService } from '../../../services/auth';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';import { loadStripe, Stripe, StripeCardElement, StripeElements } from '@stripe/stripe-js';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-abonnement',
  templateUrl: './abonnement.component.html',
  styleUrls: ['./abonnement.component.css'],
  imports: [CommonModule, ReactiveFormsModule,TranslateModule],
})
export class AbonnementComponent implements OnInit {

  abonnementForm!: FormGroup;
  stripe: Stripe | null = null;
  elements!: StripeElements;
  card!: StripeCardElement;

  clientSecret!: string;

  stripePriceId = 'price_1T8s9I11LDEECuJDHc0ugP0D';

  userId!: number;

  constructor(
    private stripeService: StripeService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {}

  async ngOnInit() {

    // 1️⃣ récupérer utilisateur connecté
    const id = this.authService.getUserId();

    if (!id) {
      alert("Utilisateur non connecté");
      return;
    }

    this.userId = id;

    // 2️⃣ formulaire
    this.abonnementForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    // 3️⃣ initialiser Stripe
    this.stripe = await loadStripe('pk_test_51T5EZt11LDEECuJDWTVPHgGEjaO4tcZvfRxhF7pDrOYLZ3mrpnkcLYJeaJ7ICQqjxRXFThByIFaPua17HMqDLv8j00c7iKfDMu');

    if (!this.stripe) {
      alert("Erreur chargement Stripe");
      return;
    }

    this.elements = this.stripe.elements();

    this.card = this.elements.create('card');

    this.card.mount('#card-element');
  }

  async creerAbonnement() {

    if (!this.stripe || !this.card) return;

    if (this.abonnementForm.invalid) {
      alert("Veuillez saisir un email valide");
      return;
    }

    try {

      const email = this.abonnementForm.value.email;
      
// console.log("EMAIL envoyé :", email);

      // 1️⃣ créer abonnement côté backend
      const clientSecret = await this.stripeService.createAbonnement({
        userId: this.userId,
        email: email,
        stripePriceId: this.stripePriceId
      });

      // 2️⃣ confirmer paiement Stripe
      const result = await this.stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: this.card,
          billing_details: {
            email: email
          }
        }
      });

      if (result.error) {

        console.error(result.error);
        alert("Erreur paiement : " + result.error.message);

      } else if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {

        alert("Abonnement créé avec succès ✅");

      }

    } catch (error) {

      console.error(error);
      alert("Erreur serveur");

    }

  }

}
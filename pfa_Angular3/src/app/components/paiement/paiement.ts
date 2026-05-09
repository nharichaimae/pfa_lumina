import { Component, OnInit } from '@angular/core';
import { StripeService } from '../../services/StripeService';
import { loadStripe, Stripe, StripeCardElement, StripeElements } from '@stripe/stripe-js';
import { AuthService } from '../../services/auth';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-paiement',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
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
    private fb: FormBuilder,
    private translate: TranslateService
  ) {}

  async ngOnInit() {
    this.abonnementForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    const id = this.authService.getUserId();

    if (!id) {
      alert(this.translate.instant('PAYMENT.USER_NOT_CONNECTED'));
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
      this.clientSecretOneShot = await this.stripeService.payOneShot(this.montant, this.userId);

      const { paymentIntent, error } = await this.stripe.confirmCardPayment(
        this.clientSecretOneShot,
        {
          payment_method: {
            card: this.card
          }
        }
      );

      if (error) {
        console.error(error);
        alert(this.translate.instant('PAYMENT.ERROR_PAYMENT'));
        return;
      }

      if (paymentIntent?.status === "succeeded") {
        alert(this.translate.instant('PAYMENT.SUCCESS_PAYMENT'));
      }

    } catch (e) {
      console.error(e);
      alert(this.translate.instant('PAYMENT.ERROR_SERVER'));
    }
  }

  async creerAbonnement() {
    if (!this.stripe) return;

    this.clientSecretAbonnement = await this.stripeService.createAbonnement({
      userId: this.userId,
      email: this.abonnementForm.value.email,
      stripePriceId: this.stripePriceId
    });

    const { paymentIntent, error } = await this.stripe.confirmCardPayment(this.clientSecretAbonnement, {
      payment_method: { card: this.card }
    });

    if (error) {
      console.error(error);
      alert(this.translate.instant('PAYMENT.ERROR_SUBSCRIPTION'));
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      alert(this.translate.instant('PAYMENT.SUCCESS_SUBSCRIPTION'));
    }
  }
}
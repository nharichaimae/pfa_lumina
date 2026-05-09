import { Component, OnInit } from '@angular/core';
import { StripeService } from '../../../services/StripeService';
import { AuthService } from '../../../services/auth';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { loadStripe, Stripe, StripeCardElement, StripeElements } from '@stripe/stripe-js';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-abonnement',
  standalone: true,
  templateUrl: './abonnement.component.html',
  styleUrls: ['./abonnement.component.css'],
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
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
    private fb: FormBuilder,
    private translate: TranslateService
  ) {}

  async ngOnInit() {

    const id = this.authService.getUserId();

    if (!id) {
      alert(this.translate.instant('SUBSCRIPTION.USER_NOT_CONNECTED'));
      return;
    }

    this.userId = id;

    this.abonnementForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.stripe = await loadStripe('pk_test_51T5EZt11LDEECuJDWTVPHgGEjaO4tcZvfRxhF7pDrOYLZ3mrpnkcLYJeaJ7ICQqjxRXFThByIFaPua17HMqDLv8j00c7iKfDMu');

    if (!this.stripe) {
      alert(this.translate.instant('SUBSCRIPTION.STRIPE_LOAD_ERROR'));
      return;
    }

    this.elements = this.stripe.elements();

    this.card = this.elements.create('card');

    this.card.mount('#card-element');
  }

  async creerAbonnement() {

    if (!this.stripe || !this.card) return;

    if (this.abonnementForm.invalid) {
      alert(this.translate.instant('SUBSCRIPTION.INVALID_EMAIL'));
      return;
    }

    try {

      const email = this.abonnementForm.value.email;

      const clientSecret = await this.stripeService.createAbonnement({
        userId: this.userId,
        email: email,
        stripePriceId: this.stripePriceId
      });

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
        alert(this.translate.instant('SUBSCRIPTION.PAYMENT_ERROR') + result.error.message);

      } else if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {

        alert(this.translate.instant('SUBSCRIPTION.SUCCESS'));

      }

    } catch (error) {

      console.error(error);
      alert(this.translate.instant('SUBSCRIPTION.SERVER_ERROR'));

    }

  }

}
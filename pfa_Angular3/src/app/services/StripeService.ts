// src/app/services/stripe.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StripeService {

  private stripePromise: Promise<Stripe | null>;

  constructor(private http: HttpClient) {
    this.stripePromise = loadStripe('pk_test_51T5EZt11LDEECuJDWTVPHgGEjaO4tcZvfRxhF7pDrOYLZ3mrpnkcLYJeaJ7ICQqjxRXFThByIFaPua17HMqDLv8j00c7iKfDMu');
  }

  // récupérer Stripe si nécessaire
  getStripe(): Promise<Stripe | null> {
    return this.stripePromise;
  }

  // 💳 Paiement simple
  async payOneShot(montant: number, userId: number): Promise<string> {

    const response: any = await firstValueFrom(
      this.http.post(
        'http://localhost:8080/api/paiement/one-shot',
        {
          montant: montant,
          userId: userId
        }
      )
    );

    return response.clientSecret;
  }

  // 🔁 Création abonnement Stripe
  async createAbonnement(abonnementData: {
    userId: number;
    email: string;
    stripePriceId: string;
  }): Promise<string> {

    const response: any = await firstValueFrom(
      this.http.post(
        'http://localhost:8080/api/paiement/create-abonnement',
        abonnementData
      )
    );

    return response.clientSecret;
  }

}
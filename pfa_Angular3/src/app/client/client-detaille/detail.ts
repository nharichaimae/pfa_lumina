import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ClientService } from '../../services/client';

@Component({
  standalone: true,
  selector: 'app-client-detail',
  imports: [CommonModule, RouterModule],
  templateUrl: './detail.html',
  styleUrls: ['./detail.scss']
})
export class ClientDetail implements OnInit {

  client$ = this.clientService.client$;
  loading$ = this.clientService.loading$;

  constructor(
    private route: ActivatedRoute,
    private clientService: ClientService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (id) {
        this.clientService.loadClient(id);
      }
    });
  }
}

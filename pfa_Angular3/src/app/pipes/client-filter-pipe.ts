import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'clientFilter',
  standalone: true
})
export class ClientFilterPipe implements PipeTransform {

  transform(clients: any[], searchText: string): any[] {

    if (!clients) return [];

    if (!searchText) return clients;

    const value = searchText.toLowerCase();

    return clients.filter(client =>
      client.nom?.toLowerCase().includes(value) ||
      client.prenom?.toLowerCase().includes(value) ||
      client.email?.toLowerCase().includes(value) ||
      client.telephone?.toLowerCase().includes(value)
    );
  }
}

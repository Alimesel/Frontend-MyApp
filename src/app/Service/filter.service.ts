// src/app/Service/filter.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface FilterState {
  categoryId?: number;
  searchTerm?: string;
}

@Injectable({
  providedIn: 'root',
})
export class FilterService {
  private filterSubject = new BehaviorSubject<FilterState>({});

  filter$ = this.filterSubject.asObservable();

  updateFilter(filter: FilterState) {
    this.filterSubject.next(filter);
  }
}

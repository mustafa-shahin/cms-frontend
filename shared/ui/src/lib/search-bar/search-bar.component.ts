import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { IconComponent } from '../icon/icon.component';

/**
 * A search bar component with debounce support.
 */
@Component({
  selector: 'cms-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="relative">
      <cms-icon 
        name="search" 
        class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        size="sm"
      ></cms-icon>
      <input
        type="text"
        [(ngModel)]="value"
        (ngModelChange)="onValueChange($event)"
        [placeholder]="placeholder"
        class="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-sm"
      />
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class SearchBarComponent implements OnInit, OnDestroy {
  /** Current search value */
  @Input() value = '';
  /** Placeholder text */
  @Input() placeholder = 'Search...';
  /** Debounce time in milliseconds */
  @Input() debounce = 300;
  /** Emitted when value changes (after debounce) */
  @Output() valueChange = new EventEmitter<string>();
  /** Emitted when search is triggered */
  @Output() searchChange = new EventEmitter<string>();

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.searchSubject.pipe(
      debounceTime(this.debounce),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(value => {
      this.valueChange.emit(value);
      this.searchChange.emit(value);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onValueChange(value: string): void {
    this.searchSubject.next(value);
  }
}

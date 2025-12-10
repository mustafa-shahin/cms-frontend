import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

/** Pagination style variants */
export type PaginationStyle = 'default' | 'simple';

/**
 * A pagination component with multiple style variants.
 */
@Component({
  selector: 'cms-pagination',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div [class]="containerClasses">
      <!-- Info text (default style) -->
      @if (style === 'default') {
        <p class="text-sm text-gray-700 dark:text-gray-400">
          Showing <span class="font-medium">{{ startRecord }}</span> 
          to <span class="font-medium">{{ endRecord }}</span> 
          of <span class="font-medium">{{ totalCount }}</span> results
        </p>
      }
      
      <!-- Navigation buttons -->
      <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
        <button
          [disabled]="currentPage === 1"
          (click)="onPageChange(currentPage - 1)"
          class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <span class="sr-only">Previous</span>
          <cms-icon name="chevron-left" size="sm"></cms-icon>
        </button>
        <button
          [disabled]="currentPage >= totalPages"
          (click)="onPageChange(currentPage + 1)"
          class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <span class="sr-only">Next</span>
          <cms-icon name="chevron-right" size="sm"></cms-icon>
        </button>
      </nav>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class PaginationComponent {
  /** Current page number */
  @Input() currentPage = 1;
  /** Total number of pages */
  @Input() totalPages = 1;
  /** Items per page */
  @Input() pageSize = 10;
  /** Total number of items */
  @Input() totalCount = 0;
  /** Pagination style */
  @Input() style: PaginationStyle = 'default';
  /** Emitted when page changes */
  @Output() pageChange = new EventEmitter<number>();

  get containerClasses(): string {
    return this.style === 'default' 
      ? 'flex items-center justify-between' 
      : 'flex justify-center';
  }

  get startRecord(): number {
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get endRecord(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalCount);
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.pageChange.emit(page);
    }
  }
}

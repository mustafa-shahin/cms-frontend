import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Minimal footer template - simple copyright and links.
 */
@Component({
  selector: 'app-footer-minimal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="bg-gray-50 border-t">
      <div class="mx-auto px-4 sm:px-6 lg:px-8 py-8" [style.max-width.px]="maxWidth()">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
          <!-- Copyright -->
          <div class="text-sm text-gray-600">
            © {{ currentYear }} {{ siteName() }}. All rights reserved.
          </div>

          <!-- Simple Links -->
          <div class="flex items-center gap-6">
            <a href="/privacy" class="text-sm text-gray-600 hover:text-gray-900">Privacy Policy</a>
            <a href="/terms" class="text-sm text-gray-600 hover:text-gray-900">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  `,
})
export class FooterMinimalComponent {
  siteName = input<string>('My Site');
  maxWidth = input<number>(1280);

  get currentYear(): number {
    return new Date().getFullYear();
  }
}

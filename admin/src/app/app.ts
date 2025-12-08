import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ToasterComponent } from '@cms/shared/ui';

@Component({
  imports: [RouterModule, ToasterComponent],
  selector: 'cms-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'admin';
}

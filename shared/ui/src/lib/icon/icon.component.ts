import { Component, Input } from '@angular/core';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faUser,
  faLock,
  faEye,
  faEyeSlash,
  faEnvelope,
  faSpinner,
  faSignOutAlt,
  faSun,
  faMoon,
  faGlobe,
  faCheck,
  faTimes,
  faExclamationTriangle,
  faInfoCircle,
  faHome,
  faCog,
  faPalette,
  faChevronDown,
  faChevronUp,
  faChevronLeft,
  faChevronRight,
  faBars,
  faSearch,
  faPlus,
  faMinus,
  faEdit,
  faTrash,
  faSave,
  faUndo,
  faRedo,
  faLanguage,
  faUsers,
  faFolder,
  faFolderOpen,
  faImage,
  faFile,
  faFileAlt,
  faVideo,
  faMusic,
  faUpload,
  faDownload,
  faCloudUploadAlt,
} from '@fortawesome/free-solid-svg-icons';
import {
  faUser as farUser,
  faEnvelope as farEnvelope,
  faEye as farEye,
  faEyeSlash as farEyeSlash,
  faSun as farSun,
  faMoon as farMoon,
  faCheckCircle as farCheckCircle,
  faTimesCircle as farTimesCircle,
  faEdit as farEdit,
  faTrashAlt as farTrashAlt,
  faSave as farSave,
} from '@fortawesome/free-regular-svg-icons';

export type IconStyle = 'solid' | 'regular' | 'brands';
export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

@Component({
  selector: 'cms-icon',
  standalone: true,
  imports: [FontAwesomeModule],
  template: `
    <fa-icon
      [icon]="iconDefinition"
      [class]="sizeClass"
      [attr.spin]="spin"
      [attr.pulse]="pulse"
      [fixedWidth]="fixedWidth"
    ></fa-icon>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .icon-xs {
        font-size: 0.75rem;
        line-height: 1; /* Ensure line-height doesn't mess up alignment */
      }
      .icon-sm {
        font-size: 0.875rem;
      }
      .icon-md {
        font-size: 1rem;
      }
      .icon-lg {
        font-size: 1.25rem;
      }
      .icon-xl {
        font-size: 1.5rem;
      }
      .icon-2xl {
        font-size: 2rem;
      }
    `,
  ],
})
export class IconComponent {
  @Input({ required: true }) name!: string;
  @Input() style: IconStyle = 'solid';
  @Input() size: IconSize = 'md';
  @Input() spin = false;
  @Input() pulse = false;
  @Input() fixedWidth = false;

  private readonly solidIcons: Record<string, IconDefinition> = {
    user: faUser,
    users: faUsers,
    lock: faLock,
    eye: faEye,
    'eye-slash': faEyeSlash,
    envelope: faEnvelope,
    spinner: faSpinner,
    'sign-out-alt': faSignOutAlt,
    logout: faSignOutAlt,
    sun: faSun,
    moon: faMoon,
    globe: faGlobe,
    language: faLanguage,
    check: faCheck,
    times: faTimes,
    'exclamation-triangle': faExclamationTriangle,
    warning: faExclamationTriangle,
    'info-circle': faInfoCircle,
    info: faInfoCircle,
    home: faHome,
    cog: faCog,
    settings: faCog,
    palette: faPalette,
    'chevron-down': faChevronDown,
    'chevron-up': faChevronUp,
    'chevron-left': faChevronLeft,
    'chevron-right': faChevronRight,
    bars: faBars,
    menu: faBars,
    search: faSearch,
    plus: faPlus,
    minus: faMinus,
    edit: faEdit,
    trash: faTrash,
    save: faSave,
    undo: faUndo,
    redo: faRedo,
    folder: faFolder,
    'folder-open': faFolderOpen,
    image: faImage,
    photo: faImage,
    file: faFile,
    'file-alt': faFileAlt,
    document: faFileAlt,
    video: faVideo,
    music: faMusic,
    audio: faMusic,
    upload: faUpload,
    download: faDownload,
    'cloud-upload': faCloudUploadAlt,
  };

  private readonly regularIcons: Record<string, IconDefinition> = {
    user: farUser,
    envelope: farEnvelope,
    eye: farEye,
    'eye-slash': farEyeSlash,
    sun: farSun,
    moon: farMoon,
    'check-circle': farCheckCircle,
    'times-circle': farTimesCircle,
    edit: farEdit,
    'trash-alt': farTrashAlt,
    trash: farTrashAlt,
    save: farSave,
  };

  get iconDefinition(): IconDefinition {
    const iconMap =
      this.style === 'regular' ? this.regularIcons : this.solidIcons;
    const icon = iconMap[this.name];

    if (!icon) {
      console.warn(
        `Icon "${this.name}" not found for style "${this.style}". Falling back to solid.`
      );
      return this.solidIcons[this.name] || faInfoCircle;
    }

    return icon;
  }

  get sizeClass(): string {
    return `icon-${this.size}`;
  }
}
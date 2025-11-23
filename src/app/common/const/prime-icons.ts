export interface IconCategory {
  name: string;
  label: string;
  icons: string[];
  icon: string;
}


// Default icon categories
  export const  defaultCategories: IconCategory[] = [
  {
    name: 'general',
    label: 'כללי',
    icon: 'pi pi-star',
    icons: [
      'pi pi-star', 'pi pi-star-fill', 'pi pi-star-half', 'pi pi-star-half-fill',
      'pi pi-heart', 'pi pi-heart-fill', 'pi pi-bookmark', 'pi pi-bookmark-fill',
      'pi pi-flag', 'pi pi-flag-fill', 'pi pi-bell', 'pi pi-bell-slash',
      'pi pi-circle', 'pi pi-circle-fill', 'pi pi-circle-off', 'pi pi-circle-on',
      'pi pi-check', 'pi pi-check-circle', 'pi pi-check-square'
    ]
  },
  {
    name: 'navigation',
    label: 'ניווט',
    icon: 'pi pi-arrow-right',
    icons: [
      'pi pi-arrow-down', 'pi pi-arrow-left', 'pi pi-arrow-right', 'pi pi-arrow-up',
      'pi pi-arrow-down-left', 'pi pi-arrow-down-right', 'pi pi-arrow-up-left',
      'pi pi-arrow-up-right', 'pi pi-arrow-circle-down', 'pi pi-arrow-circle-left',
      'pi pi-arrow-circle-right', 'pi pi-arrow-circle-up', 'pi pi-chevron-down',
      'pi pi-chevron-left', 'pi pi-chevron-right', 'pi pi-chevron-up',
      'pi pi-chevron-circle-down', 'pi pi-chevron-circle-left',
      'pi pi-chevron-circle-right', 'pi pi-chevron-circle-up',
      'pi pi-arrow-right-arrow-left', 'pi pi-arrows-h', 'pi pi-arrows-v',
      'pi pi-caret-down', 'pi pi-caret-left', 'pi pi-caret-right', 'pi pi-caret-up'
    ]
  },
  {
    name: 'business',
    label: 'עסקים',
    icon: 'pi pi-briefcase',
    icons: [
      'pi pi-briefcase', 'pi pi-building', 'pi pi-building-columns',
      'pi pi-chart-bar', 'pi pi-chart-line', 'pi pi-chart-pie', 'pi pi-chart-scatter',
      'pi pi-dollar', 'pi pi-euro', 'pi pi-pound', 'pi pi-indian-rupee',
      'pi pi-bitcoin', 'pi pi-ethereum', 'pi pi-percentage', 'pi pi-wallet',
      'pi pi-credit-card', 'pi pi-calculator', 'pi pi-receipt', 'pi pi-shopping-cart',
      'pi pi-cart-plus', 'pi pi-cart-minus', 'pi pi-cart-arrow-down', 'pi pi-shop',
      'pi pi-truck', 'pi pi-warehouse'
    ]
  },
  {
    name: 'social',
    label: 'מדיה חברתית',
    icon: 'pi pi-share-alt',
    icons: [
      'pi pi-facebook', 'pi pi-twitter', 'pi pi-instagram', 'pi pi-linkedin',
      'pi pi-youtube', 'pi pi-discord', 'pi pi-slack', 'pi pi-telegram',
      'pi pi-whatsapp', 'pi pi-tiktok', 'pi pi-pinterest', 'pi pi-reddit',
      'pi pi-vimeo', 'pi pi-twitch', 'pi pi-github', 'pi pi-google',
      'pi pi-microsoft', 'pi pi-amazon', 'pi pi-apple', 'pi pi-android'
    ]
  },
  {
    name: 'communication',
    label: 'תקשורת',
    icon: 'pi pi-envelope',
    icons: [
      'pi pi-envelope', 'pi pi-phone', 'pi pi-comments', 'pi pi-comment',
      'pi pi-at', 'pi pi-share-alt', 'pi pi-megaphone', 'pi pi-microphone',
      'pi pi-video', 'pi pi-wifi', 'pi pi-send', 'pi pi-reply'
    ]
  },
  {
    name: 'user',
    label: 'משתמשים',
    icon: 'pi pi-user',
    icons: [
      'pi pi-user', 'pi pi-users', 'pi pi-user-plus', 'pi pi-user-minus',
      'pi pi-user-edit', 'pi pi-id-card', 'pi pi-eye', 'pi pi-eye-slash',
      'pi pi-thumbs-up', 'pi pi-thumbs-up-fill', 'pi pi-thumbs-down',
      'pi pi-thumbs-down-fill', 'pi pi-graduation-cap', 'pi pi-venus', 'pi pi-mars'
    ]
  },
  {
    name: 'files',
    label: 'קבצות',
    icon: 'pi pi-file',
    icons: [
      'pi pi-file', 'pi pi-file-pdf', 'pi pi-file-excel', 'pi pi-file-word',
      'pi pi-file-plus', 'pi pi-file-check', 'pi pi-file-edit', 'pi pi-file-export',
      'pi pi-file-import', 'pi pi-file-arrow-up', 'pi pi-folder', 'pi pi-folder-open',
      'pi pi-folder-plus', 'pi pi-download', 'pi pi-upload', 'pi pi-cloud',
      'pi pi-cloud-download', 'pi pi-cloud-upload', 'pi pi-database'
    ]
  },
  {
    name: 'editing',
    label: 'עריכה',
    icon: 'pi pi-pencil',
    icons: [
      'pi pi-pencil', 'pi pi-pen-to-square', 'pi pi-eraser', 'pi pi-copy',
      'pi pi-clipboard', 'pi pi-trash', 'pi pi-save', 'pi pi-undo', 'pi pi-redo'
    ]
  },
  {
    name: 'actions',
    label: 'פעולות',
    icon: 'pi pi-play',
    icons: [
      'pi pi-play', 'pi pi-pause', 'pi pi-stop', 'pi pi-forward', 'pi pi-backward',
      'pi pi-fast-forward', 'pi pi-fast-backward', 'pi pi-step-forward',
      'pi pi-step-backward', 'pi pi-replay', 'pi pi-refresh', 'pi pi-sync',
      'pi pi-eject', 'pi pi-power-off'
    ]
  },
  {
    name: 'tools',
    label: 'כלים',
    icon: 'pi pi-cog',
    icons: [
      'pi pi-cog', 'pi pi-wrench', 'pi pi-hammer', 'pi pi-lightbulb',
      'pi pi-microchip', 'pi pi-microchip-ai', 'pi pi-sliders-h', 'pi pi-sliders-v'
    ]
  },
  {
    name: 'sorting',
    label: 'מיון',
    icon: 'pi pi-sort',
    icons: [
      'pi pi-sort', 'pi pi-sort-alpha-down', 'pi pi-sort-alpha-down-alt',
      'pi pi-sort-alpha-up', 'pi pi-sort-alpha-up-alt', 'pi pi-sort-alt',
      'pi pi-sort-alt-slash', 'pi pi-sort-amount-down', 'pi pi-sort-amount-down-alt',
      'pi pi-sort-amount-up', 'pi pi-sort-amount-up-alt', 'pi pi-sort-numeric-down',
      'pi pi-sort-numeric-down-alt', 'pi pi-sort-numeric-up', 'pi pi-sort-numeric-up-alt',
      'pi pi-sort-down', 'pi pi-sort-down-fill', 'pi pi-sort-up', 'pi pi-sort-up-fill'
    ]
  },
  {
    name: 'media',
    label: 'מדיה',
    icon: 'pi pi-image',
    icons: [
      'pi pi-image', 'pi pi-images', 'pi pi-camera', 'pi pi-video',
      'pi pi-volume-up', 'pi pi-volume-down', 'pi pi-volume-off',
      'pi pi-headphones', 'pi pi-microphone'
    ]
  },
  {
    name: 'location',
    label: 'מיקום',
    icon: 'pi pi-map',
    icons: [
      'pi pi-map', 'pi pi-map-marker', 'pi pi-compass', 'pi pi-directions',
      'pi pi-directions-alt', 'pi pi-globe'
    ]
  },
  {
    name: 'time',
    label: 'זמן',
    icon: 'pi pi-clock',
    icons: [
      'pi pi-clock', 'pi pi-calendar', 'pi pi-calendar-plus', 'pi pi-calendar-minus',
      'pi pi-calendar-times', 'pi pi-calendar-clock', 'pi pi-hourglass',
      'pi pi-stopwatch', 'pi pi-history'
    ]
  },
  {
    name: 'technology',
    label: 'טכנולוגיה',
    icon: 'pi pi-desktop',
    icons: [
      'pi pi-desktop', 'pi pi-mobile', 'pi pi-tablet', 'pi pi-server',
      'pi pi-code', 'pi pi-qrcode', 'pi pi-barcode'
    ]
  },
  {
    name: 'alerts',
    label: 'התראות',
    icon: 'pi pi-exclamation-circle',
    icons: [
      'pi pi-exclamation-circle', 'pi pi-exclamation-triangle', 'pi pi-info',
      'pi pi-info-circle', 'pi pi-question', 'pi pi-question-circle',
      'pi pi-ban'
    ]
  },
  {
    name: 'layout',
    label: 'פריסה',
    icon: 'pi pi-th-large',
    icons: [
      'pi pi-th-large', 'pi pi-table', 'pi pi-list', 'pi pi-list-check',
      'pi pi-objects-column', 'pi pi-sitemap', 'pi pi-window-maximize',
      'pi pi-window-minimize'
    ]
  },
  {
    name: 'misc',
    label: 'שונות',
    icon: 'pi pi-home',
    icons: [
      'pi pi-home', 'pi pi-car', 'pi pi-ticket', 'pi pi-tag', 'pi pi-tags',
      'pi pi-paperclip', 'pi pi-link', 'pi pi-external-link', 'pi pi-language',
      'pi pi-moon', 'pi pi-sun', 'pi pi-gauge', 'pi pi-bullseye', 'pi pi-sparkles',
      'pi pi-spinner', 'pi pi-spinner-dotted', 'pi pi-asterisk', 'pi pi-plus',
      'pi pi-minus', 'pi pi-equals', 'pi pi-divide', 'pi pi-times',
      'pi pi-times-circle', 'pi pi-plus-circle', 'pi pi-minus-circle',
      'pi pi-verified', 'pi pi-prime'
    ]
  }
];


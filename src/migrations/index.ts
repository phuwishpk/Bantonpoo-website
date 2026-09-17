import * as migration_20260916_050752_initial from './20260916_050752_initial';
import * as migration_20260916_191415_add_site_favicon from './20260916_191415_add_site_favicon';
import * as migration_20260917_105137_add_color_styles from './20260917_105137_add_color_styles';

export const migrations = [
  {
    up: migration_20260916_050752_initial.up,
    down: migration_20260916_050752_initial.down,
    name: '20260916_050752_initial',
  },
  {
    up: migration_20260916_191415_add_site_favicon.up,
    down: migration_20260916_191415_add_site_favicon.down,
    name: '20260916_191415_add_site_favicon',
  },
  {
    up: migration_20260917_105137_add_color_styles.up,
    down: migration_20260917_105137_add_color_styles.down,
    name: '20260917_105137_add_color_styles'
  },
];

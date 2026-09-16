import * as migration_20260916_050752_initial from './20260916_050752_initial';

export const migrations = [
  {
    up: migration_20260916_050752_initial.up,
    down: migration_20260916_050752_initial.down,
    name: '20260916_050752_initial'
  },
];

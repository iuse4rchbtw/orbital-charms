import * as migration_20261118_111624_orbital_charms_initial from './20261118_111624_orbital_charms_initial';

export const migrations = [
  {
    up: migration_20261118_111624_orbital_charms_initial.up,
    down: migration_20261118_111624_orbital_charms_initial.down,
    name: '20261118_111624_orbital_charms_initial'
  },
];

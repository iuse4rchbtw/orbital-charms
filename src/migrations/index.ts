import * as migration_20261118_111624_orbital_charms_initial from './20261118_111624_orbital_charms_initial';
import * as migration_20261118_114956_orbital_charms_orders from './20261118_114956_orbital_charms_orders';
import * as migration_20261118_124029_orbital_charms_s3_media from './20261118_124029_orbital_charms_s3_media';

export const migrations = [
  {
    up: migration_20261118_111624_orbital_charms_initial.up,
    down: migration_20261118_111624_orbital_charms_initial.down,
    name: '20261118_111624_orbital_charms_initial',
  },
  {
    up: migration_20261118_114956_orbital_charms_orders.up,
    down: migration_20261118_114956_orbital_charms_orders.down,
    name: '20261118_114956_orbital_charms_orders',
  },
  {
    up: migration_20261118_124029_orbital_charms_s3_media.up,
    down: migration_20261118_124029_orbital_charms_s3_media.down,
    name: '20261118_124029_orbital_charms_s3_media'
  },
];

import * as migration_20261119_044401_master from './20261119_044401_master';

export const migrations = [
  {
    up: migration_20261119_044401_master.up,
    down: migration_20261119_044401_master.down,
    name: '20261119_044401_master'
  },
];

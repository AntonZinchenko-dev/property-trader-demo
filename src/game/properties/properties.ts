// src/game/properties.ts
// Простейшая модель собственности: какие клетки покупаемые, их цена и базовая аренда.
// Для MVP: без цветов/монополий/домиков — только покупка и базовая аренда.

export type Property = {
    tile: number;       // индекс клетки по периметру (0..39)
    name: string;
    price: number;
    rent: number;       // базовая аренда без домов
  };
  
  // Набор примерных клеток для покупки (подгони под свою разметку поля).
  export const PROPERTIES: Property[] = [
    { tile: 1,  name: 'Brown 1',  price: 60,  rent: 2  },
    { tile: 3,  name: 'Brown 2',  price: 60,  rent: 4  },
  
    { tile: 6,  name: 'Light Blue 1', price: 100, rent: 6  },
    { tile: 8,  name: 'Light Blue 2', price: 100, rent: 6  },
    { tile: 9,  name: 'Light Blue 3', price: 120, rent: 8  },
  
    { tile: 11, name: 'Pink 1', price: 140, rent: 10 },
    { tile: 13, name: 'Pink 2', price: 140, rent: 10 },
    { tile: 14, name: 'Pink 3', price: 160, rent: 12 },
  
    { tile: 16, name: 'Orange 1', price: 180, rent: 14 },
    { tile: 18, name: 'Orange 2', price: 180, rent: 14 },
    { tile: 19, name: 'Orange 3', price: 200, rent: 16 },
  
    { tile: 21, name: 'Red 1', price: 220, rent: 18 },
    { tile: 23, name: 'Red 2', price: 220, rent: 18 },
    { tile: 24, name: 'Red 3', price: 240, rent: 20 },
  
    { tile: 26, name: 'Yellow 1', price: 260, rent: 22 },
    { tile: 27, name: 'Yellow 2', price: 260, rent: 22 },
    { tile: 29, name: 'Yellow 3', price: 280, rent: 24 },
  
    { tile: 31, name: 'Green 1', price: 300, rent: 26 },
    { tile: 32, name: 'Green 2', price: 300, rent: 26 },
    { tile: 34, name: 'Green 3', price: 320, rent: 28 },
  
    { tile: 37, name: 'Dark Blue 1', price: 350, rent: 35 },
    { tile: 39, name: 'Dark Blue 2', price: 400, rent: 50 },
  ];
  
  const byTile = new Map(PROPERTIES.map(p => [p.tile, p]));
  export function getPropertyByTile(tile: number): Property | undefined {
    return byTile.get(tile);
  }
  export function isPropertyTile(tile: number): boolean {
    return byTile.has(tile);
  }
  
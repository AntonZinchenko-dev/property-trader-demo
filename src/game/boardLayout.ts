import { Vector3 } from 'three'

export const TILES: [number, number, number][] = (() => {
  const pts: [number, number, number][] = []
  const N = 10, s = 1.2 // размер шага клетки
  const base = -s*(N-1)/2
  for (let i=0;i<N;i++) pts.push([base+i*s, 0, base + (N-1)*s])       // низ слева->вправо
  for (let i=1;i<N;i++) pts.push([base + (N-1)*s, 0, base + (N-1-i)*s]) // право низ->верх
  for (let i=1;i<N;i++) pts.push([base + (N-1-i)*s, 0, base])           // верх право->лево
  for (let i=1;i<N-1;i++) pts.push([base, 0, base + i*s])               // лево верх->низ
  return pts
})()

export const tileToVec3 = (index: number) => {
  const i = (index % TILES.length + TILES.length) % TILES.length
  const [x,y,z] = TILES[i]
  return new Vector3(x, y, z)
}

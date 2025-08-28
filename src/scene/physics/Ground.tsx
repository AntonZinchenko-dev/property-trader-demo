import { usePlane } from '@react-three/cannon'


export function Ground() {
  usePlane(() => ({ rotation: [-Math.PI / 2, 0, 0], position: [0, -0.05, 0] }))
    return null
  }
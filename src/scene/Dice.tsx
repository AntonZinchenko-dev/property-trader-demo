import { a, useSpring } from '@react-spring/three'
import { useEffect } from 'react'

export function Dice({ rolling, position = [ -1.8, 1, -1.2 ] as [number,number,number] }: { rolling: boolean, position?: [number, number, number] }) {
    const [{ rx, ry, rz }, api] = useSpring(() => ({
      rx: 0, ry: 0, rz: 0,
      config: { tension: 60, friction: 6 },
    }))
  
    useEffect(() => {
      if (!rolling) return
      api.start({
        to: async (next) => {
          for (let i = 0; i < 6; i++) {
            await next({
              rx: Math.PI * 2 * Math.random(),
              ry: Math.PI * 2 * Math.random(),
              rz: Math.PI * 2 * Math.random(),
            })
          }
        },
      })
    }, [rolling])
  
    return (
      <a.mesh position={position} castShadow rotation-x={rx} rotation-y={ry} rotation-z={rz}>
        <boxGeometry args={[0.6, 0.6, 0.6]} />
        <meshStandardMaterial color="#d9d9d9" />
      </a.mesh>
    )
  }
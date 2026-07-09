import { useEffect, useRef } from 'react'
import { Vector3 } from 'three'
import { CameraControls } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useGame } from '../game/store.ts'

export function CameraRig() {
    const ref = useRef<CameraControls>(null!)
    const focus = useGame(s => s.focusTarget)
    const keysRef = useRef({ w: false, a: false, s: false, d: false })
  
    useEffect(() => {
      if (!focus || !ref.current) return
      const { x,y,z } = focus
      ref.current.setLookAt(
        x+6, y+8, z+8,  
        x,    y+0.8, z, 
        true
      )
    }, [focus])

    useEffect(() => {
      const setKey = (code: string, value: boolean) => {
        if (code === 'KeyW') keysRef.current.w = value
        if (code === 'KeyA') keysRef.current.a = value
        if (code === 'KeyS') keysRef.current.s = value
        if (code === 'KeyD') keysRef.current.d = value
      }
      const onDown = (e: KeyboardEvent) => setKey(e.code, true)
      const onUp = (e: KeyboardEvent) => setKey(e.code, false)
      window.addEventListener('keydown', onDown)
      window.addEventListener('keyup', onUp)
      return () => {
        window.removeEventListener('keydown', onDown)
        window.removeEventListener('keyup', onUp)
      }
    }, [])

    useFrame((_, delta) => {
      const controls = ref.current
      if (!controls) return

      const k = keysRef.current
      if (!k.w && !k.a && !k.s && !k.d) return

      const pos = controls.getPosition(new Vector3())
      const target = controls.getTarget(new Vector3())
      const forward = new Vector3().subVectors(target, pos).setY(0)
      if (forward.lengthSq() < 1e-8) return
      forward.normalize()
      const right = new Vector3().crossVectors(forward, new Vector3(0, 1, 0)).normalize()

      const move = new Vector3()
      if (k.w) move.add(forward)
      if (k.s) move.sub(forward)
      if (k.d) move.add(right)
      if (k.a) move.sub(right)
      if (move.lengthSq() < 1e-8) return

      move.normalize().multiplyScalar(6.2 * delta)
      pos.add(move)
      target.add(move)
      controls.setLookAt(pos.x, pos.y, pos.z, target.x, target.y, target.z, false)
    })
  
    return <CameraControls ref={ref} minDistance={5} maxDistance={30} />
}

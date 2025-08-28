import { useEffect, useRef } from 'react'
import { CameraControls } from '@react-three/drei'
import { useGame } from '../game/store.ts'

export function CameraRig() {
    const ref = useRef<CameraControls>(null!)
    const focus = useGame(s => s.focusTarget)
  
    useEffect(() => {
      if (!focus || !ref.current) return
      const { x,y,z } = focus
      ref.current.setLookAt(
        x+6, y+8, z+8,  
        x,    y+0.8, z, 
        true
      )
    }, [focus])
  
    return <CameraControls ref={ref} minDistance={5} maxDistance={30} />
}

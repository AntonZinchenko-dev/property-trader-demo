// src/scene/physics/DicePhys.tsx
import { useEffect, useMemo, useRef } from 'react'
import { useBox } from '@react-three/cannon'
import * as THREE from 'three'
import { makeDiceMaterials } from './diceTextures.ts'

type Props = {
    position?: [number, number, number]
    onReady?: (throwFn: () => Promise<number>) => void
}

const SIZE = 0.6
const HALF = SIZE / 2
const GROUND_Y = -0.05
const EPS = 0.001

export function DicePhys({ position = [-1.8, 1.2, -1.2], onReady }: Props) {
    const [ref, api] = useBox<THREE.Mesh>(() => ({
        mass: 1,
        args: [SIZE, SIZE, SIZE],
        position,
        rotation: [0, 0, 0],
        linearDamping: 0.6,       // ↑
        angularDamping: 0.85,     // ↑
        allowSleep: true,
        sleepSpeedLimit: 0.18,    // ↑ легче засыпать
        sleepTimeLimit: 0.35,     // ↑ быстрее уходит в сон
    }))

    const materials = useMemo(() => makeDiceMaterials(256), [])

    // ИНИЦИАЛИЗАЦИЯ: положить кость ровно на пол и усыпить, чтобы на старте ничего не дергалось.
    useEffect(() => {
        // ровно лежим на “полу” (y=-0.05), но визуально это прозрачно
        const y = -0.05 + HALF + EPS
        api.position.set(position[0], y, position[2])
        api.quaternion.set(0, 0, 0, 1)
        api.velocity.set(0, 0, 0)
        api.angularVelocity.set(0, 0, 0)
        // принудительно спать
        // @ts-ignore
        api.sleep?.(true)
    }, [])

    function readBodyQuaternion(): Promise<THREE.Quaternion> {
        return new Promise((resolve) => {
            const q = new THREE.Quaternion()
            const unsub = api.quaternion.subscribe((arr) => {
                q.set(arr[0], arr[1], arr[2], arr[3])
                unsub()
                resolve(q)
            })
        })
    }

    function snapQuaternionToRightAngles(qIn: THREE.Quaternion): THREE.Quaternion {
        const e = new THREE.Euler().setFromQuaternion(qIn, 'XYZ')
        const snap = (r: number) => Math.round(r / (Math.PI / 2)) * (Math.PI / 2)
        e.set(snap(e.x), snap(e.y), snap(e.z))
        return new THREE.Quaternion().setFromEuler(e)
    }

    function waitUntilSettled(thLin = 0.08, thAng = 0.08, settleFrames = 20) {
        let v: [number, number, number] = [0, 0, 0]
        let w: [number, number, number] = [0, 0, 0]
        const unsubV = api.velocity.subscribe((nv) => { v = nv as any })
        const unsubW = api.angularVelocity.subscribe((nw) => { w = nw as any })
        let stable = 0
        return new Promise<void>((resolve) => {
            const iv = setInterval(() => {
                const lin = Math.hypot(v[0], v[1], v[2])
                const ang = Math.hypot(w[0], w[1], w[2])
                if (lin < thLin && ang < thAng) {
                    if (++stable >= settleFrames) {
                        clearInterval(iv); unsubV(); unsubW(); resolve()
                    }
                } else stable = 0
            }, 16)
        })
    }

    function getTopFace(qParam?: THREE.Quaternion): number {
        const q = qParam ?? ref.current?.quaternion ?? new THREE.Quaternion()
        const up = new THREE.Vector3(0, 1, 0)
        const dirs = {
            '+x': new THREE.Vector3(1, 0, 0).applyQuaternion(q),
            '-x': new THREE.Vector3(-1, 0, 0).applyQuaternion(q),
            '+y': new THREE.Vector3(0, 1, 0).applyQuaternion(q),
            '-y': new THREE.Vector3(0, -1, 0).applyQuaternion(q),
            '+z': new THREE.Vector3(0, 0, 1).applyQuaternion(q),
            '-z': new THREE.Vector3(0, 0, -1).applyQuaternion(q),
        }
        let best: keyof typeof dirs = '+y', bestDot = -Infinity
        for (const k in dirs) { const d = (dirs as any)[k].dot(up); if (d > bestDot) { bestDot = d; best = k as any } }
        const map: Record<string, number> = { '+y': 1, '-y': 6, '+x': 3, '-x': 4, '+z': 2, '-z': 5 }
        return map[best]
    }

    async function throwDice(): Promise<number> {
        // @ts-ignore — разбудить
        api.sleep?.(false)

        // стартовая поза
        const qStart = new THREE.Quaternion().setFromEuler(
            new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI)
        )
        const startY = GROUND_Y + HALF + 0.9
        const j = () => (Math.random() - 0.5) * 0.25

        api.position.set(position[0] + j(), startY, position[2] + j())
        api.quaternion.set(qStart.x, qStart.y, qStart.z, qStart.w)
        api.velocity.set(0, 0, 0)
        api.angularVelocity.set(0, 0, 0)
        await new Promise<void>(r => requestAnimationFrame(() => r()))

        // импульс
        const dir = new THREE.Vector3(
            (Math.random() - 0.5) * 0.8,
            1.2 + Math.random() * 0.4,
            (Math.random() - 0.5) * 0.8
        ).normalize()
        const force = 5.6 + Math.random() * 1.6
        api.applyImpulse([dir.x * force, dir.y * force, dir.z * force], [0.1, 0.1, 0.1])
        api.angularVelocity.set(
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10
        )

        // ждём затухания
        await waitUntilSettled(0.10, 0.10, 22)

        // ЧИТАЕМ КВАТЕРНИОН ТЕЛА, СНАПИМ И СЧИТАЕМ ЗНАЧЕНИЕ
        const qBody = await readBodyQuaternion()
        const qSnap = snapQuaternionToRightAngles(qBody)
        api.quaternion.set(qSnap.x, qSnap.y, qSnap.z, qSnap.w)

        const value = getTopFace(qSnap)

        // стоп и спать
        api.velocity.set(0, 0, 0)
        api.angularVelocity.set(0, 0, 0)
        // @ts-ignore
        api.sleep?.(true)

        return value
    }

    useEffect(() => { onReady?.(throwDice) }, [onReady])

    return (
        <mesh ref={ref} castShadow>
            <boxGeometry args={[0.6, 0.6, 0.6]} />
            {materials.map((m, i) => <primitive key={i} object={m} attach={`material-${i}`} />)}
        </mesh>
    )
}

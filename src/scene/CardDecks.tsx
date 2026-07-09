import { Text } from '@react-three/drei'
import { a, useSpring } from '@react-spring/three'
import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { Vector3 } from 'three'
import type { CardEffect } from '../game/cards.ts'
import { tileToVec3 } from '../game/boardLayout.ts'
import { useGame } from '../game/store.ts'

const CARD_W = 0.92
const CARD_H = 1.26
const DECK_THICKNESS = 0.08

type DeckSource = 'CHANCE' | 'CHEST'

const sourceTile: Record<DeckSource, number> = {
  CHANCE: 7,
  CHEST: 2,
}

function deckPos(source: DeckSource): [number, number, number] {
  const tile = tileToVec3(sourceTile[source]).lerp(new Vector3(0, 0, 0), 0.23)
  return [tile.x, 0.03, tile.z]
}

function effectGlow(effect?: CardEffect) {
  if (!effect) return '#8fa7d9'
  if (effect.kind === 'go_to_jail') return '#ff6b77'
  if (effect.kind === 'move_to') return '#74d4ff'
  if (effect.kind === 'money') return effect.delta >= 0 ? '#68e0a2' : '#ff9a7a'
  return '#8fa7d9'
}

function DeckStack({ source, active }: { source: DeckSource; active: boolean }) {
  const [x, y, z] = deckPos(source)
  const cardColor = source === 'CHANCE' ? '#7e6bff' : '#5cb4ff'
  const [{ lift, rz }, api] = useSpring(() => ({
    lift: 0,
    rz: source === 'CHANCE' ? 0.12 : -0.12,
    config: { tension: 220, friction: 24 },
  }))

  useEffect(() => {
    api.start({
      lift: active ? 0.04 : 0,
      rz: active ? (source === 'CHANCE' ? 0.18 : -0.18) : (source === 'CHANCE' ? 0.12 : -0.12),
    })
  }, [active, api, source])

  return (
    <a.group position-x={x} position-y={y} position-z={lift.to(v => z + v)} rotation-x={-Math.PI / 2} rotation-y={0} rotation-z={rz}>
      <mesh position={[0, -0.01, 0]}>
        <boxGeometry args={[CARD_W + 0.05, CARD_H + 0.05, 0.06]} />
        <meshStandardMaterial color="#1a2233" roughness={0.9} metalness={0.08} />
      </mesh>
      <mesh position={[0, 0, DECK_THICKNESS * 0.5]}>
        <boxGeometry args={[CARD_W, CARD_H, DECK_THICKNESS]} />
        <meshStandardMaterial color="#f4f7ff" roughness={0.85} metalness={0.02} />
      </mesh>
      <mesh position={[0, CARD_H * 0.33, DECK_THICKNESS * 0.57]}>
        <planeGeometry args={[CARD_W * 0.75, CARD_H * 0.2]} />
        <meshBasicMaterial color={cardColor} transparent opacity={0.92} />
      </mesh>
      <Text
        position={[0, 0, DECK_THICKNESS * 0.58]}
        rotation={[0, 0, 0]}
        color="#162137"
        fontSize={0.12}
        anchorX="center"
        anchorY="middle"
      >
        {source}
      </Text>
    </a.group>
  )
}

export function CardDecks() {
  const pending = useGame(s => s.pendingAction)
  const open = pending?.type === 'CARD'
  const source: DeckSource = open ? pending.source : 'CHANCE'
  const title = open ? pending.card.title : ''
  const text = open ? pending.card.text : ''
  const glowColor = effectGlow(open ? pending.card.effect : undefined)

  const fromPos = useMemo(() => deckPos(source), [source])

  const [{ pos, rx, ry, rz, scale, opacity }, api] = useSpring(() => ({
    pos: [fromPos[0], fromPos[1] + 0.04, fromPos[2]] as [number, number, number],
    rx: -Math.PI / 2,
    ry: 0,
    rz: 0,
    scale: 0.9,
    opacity: 0,
    config: { mass: 1, tension: 220, friction: 24 },
  }))
  const [{ fy, glow }, flipApi] = useSpring(() => ({
    fy: Math.PI,
    glow: 0,
    config: { mass: 1, tension: 200, friction: 22 },
  }))

  useEffect(() => {
    if (open) {
      const [sx, sy, sz] = deckPos(source)
      flipApi.start({ fy: Math.PI, glow: 0 })
      api.start({
        from: {
          pos: [sx, sy + 0.04, sz] as [number, number, number],
          rx: -Math.PI / 2,
          ry: 0,
          rz: source === 'CHANCE' ? -0.15 : 0.15,
          scale: 0.9,
          opacity: 0.2,
        },
        to: {
          pos: [0, 0.26, 0.15] as [number, number, number],
          rx: -1.1,
          ry: 0,
          rz: 0,
          scale: 1,
          opacity: 1,
        },
      })
      flipApi.start({
        to: async (next) => {
          await next({ fy: Math.PI, glow: 0 })
          await next({ fy: 0, glow: 1 })
        },
      })
      return
    }
    const [sx, sy, sz] = deckPos(source)
    flipApi.start({ fy: Math.PI, glow: 0 })
    api.start({
      to: {
        pos: [sx, sy + 0.04, sz] as [number, number, number],
        rx: -Math.PI / 2,
        ry: 0,
        rz: 0,
        scale: 0.9,
        opacity: 0,
      },
    })
  }, [api, flipApi, open, source])

  return (
    <>
      <DeckStack source="CHANCE" active={open && source === 'CHANCE'} />
      <DeckStack source="CHEST" active={open && source === 'CHEST'} />

      <a.group position={pos} rotation-x={rx} rotation-y={ry} rotation-z={rz} scale={scale}>
        <a.group rotation-y={fy}>
          <mesh>
            <boxGeometry args={[CARD_W, CARD_H, 0.04]} />
            <a.meshStandardMaterial color="#f9fbff" roughness={0.55} metalness={0.08} transparent opacity={opacity} />
          </mesh>

          {/* front side */}
          <mesh position={[0, CARD_H * 0.33, 0.022]}>
            <planeGeometry args={[CARD_W * 0.78, CARD_H * 0.2]} />
            <a.meshBasicMaterial
              color={source === 'CHANCE' ? '#7e6bff' : '#5cb4ff'}
              transparent
              opacity={opacity}
            />
          </mesh>
          {open && (
            <>
              <Text
                position={[0, CARD_H * 0.34, 0.024]}
                color="#f4f8ff"
                fontSize={0.08}
                anchorX="center"
                anchorY="middle"
              >
                {source}
              </Text>
              <Text
                position={[0, 0.03, 0.024]}
                color="#1a2436"
                fontSize={0.095}
                maxWidth={CARD_W * 0.78}
                textAlign="center"
                anchorX="center"
                anchorY="middle"
              >
                {title}
              </Text>
              <Text
                position={[0, -0.26, 0.024]}
                color="#344056"
                fontSize={0.055}
                maxWidth={CARD_W * 0.76}
                textAlign="center"
                anchorX="center"
                anchorY="middle"
              >
                {text}
              </Text>
            </>
          )}

          {/* back side */}
          <group rotation-y={Math.PI}>
            <mesh position={[0, 0, 0.021]}>
              <planeGeometry args={[CARD_W * 0.9, CARD_H * 0.9]} />
              <a.meshBasicMaterial
                color={source === 'CHANCE' ? '#40319f' : '#2077b9'}
                transparent
                opacity={opacity}
              />
            </mesh>
            <Text
              position={[0, 0, 0.022]}
              color="#eef5ff"
              fontSize={0.11}
              anchorX="center"
              anchorY="middle"
            >
              {source}
            </Text>
          </group>
        </a.group>

        {/* glow aura by effect type */}
        <mesh position={[0, 0, -0.03]}>
          <planeGeometry args={[CARD_W * 1.2, CARD_H * 1.2]} />
          <a.meshBasicMaterial
            color={glowColor}
            transparent
            opacity={glow.to(v => v * 0.28)}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </a.group>

      {open && (
        <Text
          position={[0, 0.92, 0.15]}
          color="#f0f5ff"
          fontSize={0.16}
          maxWidth={4.5}
          textAlign="center"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.008}
          outlineColor="#121827"
        >
          {`${source} • ${title}`}
        </Text>
      )}
    </>
  )
}

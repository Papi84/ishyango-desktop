import { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import * as THREE from 'three'

interface Commit {
  id: number
  text: string
  page: number
  book_title: string
  tags: string
  created_at: string
}

interface CommitGalaxy3DProps {
  commits: Commit[]
}

function CommitSphere({ commit, position, color }: { 
  commit: Commit
  position: [number, number, number]
  color: string
}) {
      const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.2
      meshRef.current.rotation.y += delta * 0.2
    }
  })
  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? 1.5 : 1}
      >
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      {hovered && (
        <Text
          position={[0, 0.5, 0]}
          fontSize={0.2}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          Page {commit.page}
        </Text>
      )}
    </group>
  )
}

export default function CommitGalaxy3D({ commits }: CommitGalaxy3DProps) {
  if (!commits || commits.length === 0) {
    return (
      <div className="w-full h-[600px] bg-slate-900 rounded-xl flex items-center justify-center">
        <p className="text-white">No commits to display</p>
      </div>
    )
  }

  // Generate positions using Linear Algebra concepts
  const commitData = commits.map((commit, index) => {
    const date = new Date(commit.created_at)
    const z = (date.getTime() / 100000000000) * 10
    const y = (commit.page / 100) * 5
    const x = Math.sin(index * 0.5) * 8
    
    const colors = ['#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#3B82F6']
    const colorIndex = commit.tags.length % colors.length
    const color = colors[colorIndex]
    
    return {
      commit,
      position: [x, y, z] as [number, number, number],
      color
    }
  })

  return (
    <div className="w-full h-[600px] bg-slate-900 rounded-xl relative">
      <Canvas camera={{ position: [0, 0, 15], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        
        {commitData.map(({ commit, position, color }) => (
          <CommitSphere
            key={commit.id}
            commit={commit}
            position={position}
            color={color}
          />
        ))}
        
        <OrbitControls 
          enableZoom={true}
          enablePan={true}
          autoRotate={true}
          autoRotateSpeed={0.5}
        />
      </Canvas>
      
      <div className="absolute top-4 left-4 text-white pointer-events-none">
        <h3 className="text-xl font-bold">🌌 Learning Commit Galaxy</h3>
        <p className="text-sm text-gray-300">
          Rotate: Click + drag | Zoom: Scroll | Hover for details
        </p>
      </div>
    </div>
  )
}

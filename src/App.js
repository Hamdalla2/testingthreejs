/* eslint-disable no-unused-vars */
import { Physics, useBox, usePlane, useSphere } from '@react-three/cannon';
import { Environment, OrbitControls, PerspectiveCamera, TorusKnot, useHelper } from '@react-three/drei';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import React, { Suspense, useRef, useState } from 'react';
import * as THREE from "three";
import { DirectionalLightHelper, HemisphereLightHelper, TextureLoader } from 'three';
import './style.css';

const gameWidth = 1000;

function Loader() {
  //replace with spinner later ###
  return <h1>Loading...</h1>
}

function App() {
  return (
    <Suspense fallback={<Loader />}>
      <Canvas shadows>
        <Physics>
          <Game />
        </Physics>
      </Canvas>
    </Suspense>
  );
}

function Game() {
  return (
    <>
      {/* <Debug> */}
      <Camera />
      <Sky />
      <Sun />
      <Floor />
      <Player />
      <Obstacle />
      <Spinner />
      {/* </Debug> */}
    </>
  )
}

function Camera() {
  const { scene, camera } = useThree();

  // const onDocumentMouseMove = (e) => {
  //   if (document.pointerLockElement) {
  //     pivot.rotation.y -= e.movementX * 0.002
  //     const v = followCam.rotation.x - e.movementY * 0.002
  //     if (v >= -1.0 && v <= 0.4) {
  //       followCam.rotation.x = v
  //       followCam.position.y = -v * followCam.position.z + 1
  //     }
  //   }
  //   return false
  // }

  // const onDocumentMouseWheel = (e) => {
  //   if (document.pointerLockElement) {
  //     const v = followCam.position.z + e.deltaY * 0.002
  //     if (v >= 0.5 && v <= 4) {
  //       followCam.position.z = v
  //     }
  //   }
  //   return false
  // }

  return (
    <>
      <PerspectiveCamera makeDefault for={50} position={[5, 5, 20]} />
      <OrbitControls target={[0, 1, 0]} maxPolarAngle={5} enableZoom={true} enablePan={false} enableRotate={true} />
    </>
  )
}

function Sky() {
  return (
    <Environment background>
      <mesh>
        <sphereGeometry args={[gameWidth, 2 * gameWidth, 2 * gameWidth]} />
        <meshBasicMaterial color="cyan" side={THREE.BackSide} />
      </mesh>
    </Environment>
  )
}

function Sun() {
  // position of the sun
  const [x, setX] = useState(gameWidth);
  // height of the sun
  const [y, setY] = useState(0);
  // intensity of the sunlight
  const [i, setI] = useState(1);
  // size of the sun
  const [s, setS] = useState(35);
  // velocity of the sun
  const velocity = useRef(2);
  const v = velocity.current;
  // object containing directional light rays details
  const ray = useRef(null);
  // object containing hemispherical light details
  const star = useRef(null);
  // object containing details of the sun
  const sun = useRef(null);

  // debug
  useHelper(ray, DirectionalLightHelper, 35, 'gold');
  useHelper(star, HemisphereLightHelper, 50, 'gold');

  // motion logic and calculation
  useFrame(() => {
    [sun, star, ray].forEach((ref) => {
      // sun rise
      if ((x > 0.7 * gameWidth && x <= gameWidth) && (y >= 0)) { setX(x - v); if (y < gameWidth) { setY(y + (2 * v)) }; setI(0.5); setS(35) }
      // morning
      if ((x > 0 * gameWidth && x <= 0.7 * gameWidth) && (y >= 0)) { setX(x - v); setY(y + v); setI(0.7); setS(35) }
      // noon
      if ((x > -0.7 * gameWidth && x <= 0 * gameWidth) && (y >= 0)) { setX(x - v); setY(y - v); setI(0.7); setS(35) }
      // sun set
      if ((x > -gameWidth && x <= -0.7 * gameWidth) && (y >= 0)) { setX(x - v); if (y > -gameWidth) { setY(y - (2 * v)) }; setI(0.5); setS(35) }
      // night
      if ((x >= -gameWidth && x < -0.7 * gameWidth) && (y <= 0)) { setX(x + v); if (y > -gameWidth) { setY(y - (2 * v)) }; setI(0.3); setS(1) }
      // mid night
      if ((x >= -0.7 * gameWidth && x < 0 * gameWidth) && (y <= 0)) { setX(x + v); setY(y - v); setI(0.2); setS(1) }
      // past mid night
      if ((x >= 0 * gameWidth && x < 0.7 * gameWidth) && (y <= 0)) { setX(x + v); setY(y + v); setI(0.2); setS(1) }
      // dawn
      if ((x >= 0.7 * gameWidth && x < gameWidth) && (y <= 0)) { setX(x + v); if (y < gameWidth) { setY(y + (2 * v)) }; setI(0.3); setS(1) }
      ref.current?.position.set(x, y, 0)
    })
  }, [x, y])

  return (
    <>
      <directionalLight ref={ray} position={[x, y, 0]} intensity={i} castShadow />
      <hemisphereLight ref={star} position={[x, y, 0]} intensity={i} />
      <mesh ref={sun} position={[x, y, 0]} receiveShadow>
        <sphereGeometry args={[s, 70, 70]} />
        <meshPhongMaterial color={'gold'} />
      </mesh>
    </>
  )
}

function Floor() {
  const [ref] = usePlane(() => ({ position: [0, 0, 0], rotation: [-Math.PI / 2, 0, 0] }), useRef())
  const texture = useLoader(TextureLoader, 'https://cdn.jsdelivr.net/gh/Sean-Bradley/React-Three-Fiber-Boilerplate@followCam/public/img/grid.png')

  return (
    <mesh ref={ref} receiveShadow>
      <planeGeometry args={[gameWidth, gameWidth]} />
      <meshPhongMaterial map={texture} />
    </mesh>
  )
}

function Player() {
  const [ref] = useBox(() => ({ mass: 1, position: [0, 10, 0] }), useRef())
  return (
    <mesh ref={ref} receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshPhongMaterial color={'blue'} />
    </mesh>
  )
}

function Obstacle() {
  const [ref] = useSphere(() => ({ mass: 1, position: [10, 10, 0] }), useRef())
  return (
    <mesh ref={ref} receiveShadow>
      <sphereGeometry args={[1, 16, 16]} />
      <meshPhongMaterial color={'red'} />
    </mesh>
  )
}

function Spinner() {
  const ref = useRef();
  useFrame(() => { [ref].forEach((ref) => { ref.current?.rotateX(0.001); ref.current?.rotateY(0.002); ref.current?.rotateZ(0.003) }) })
  return (
    <TorusKnot ref={ref} position={[10, 5, 0]} mass={0} receiveShadow>
      <meshPhongMaterial color={'orange'} />
    </TorusKnot>
  )
}

export default App;

import * as THREE from "three";
import { MindARThree } from "mind-ar/dist/mindar-image-three.prod.js";
import { SVGLoader } from "three/examples/jsm/Addons.js";
import target from "./assets/target.mind?url";
import gsap from "gsap";

document.addEventListener("DOMContentLoaded", () => {
  const start = async () => {
    try {
      // Kamera API'sinin varlığını kontrol et
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
          "Tarayıcınız kamera erişimini desteklemiyor. Lütfen modern bir tarayıcı kullanın (Chrome, Firefox, Safari gibi)"
        );
      }

      // HTTPS kontrolü - yerel ağ için özel durum
      const isLocalNetwork =
        /^192\.168\.|^10\.|^172\.(1[6-9]|2[0-9]|3[0-1])\.|^localhost$|^127\.0\.0\.1$/.test(
          location.hostname
        );
      if (location.protocol !== "https:" && !isLocalNetwork) {
        throw new Error(
          "Kamera erişimi için HTTPS gereklidir. Lütfen sayfayı HTTPS üzerinden açın."
        );
      }

      // Kamera erişimi iste
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((track) => track.stop());

      const mindarThree = new MindARThree({
        container: document.body,
        imageTargetSrc: target,
        filterMinCF: 0.001,
        filterBeta: 0.01,
      });

      const { renderer, scene, camera } = mindarThree;

      // Renderer ayarları
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1;

      // Işıkları ekle
      const ambientLight = new THREE.AmbientLight(0xffffff, 2);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
      directionalLight.position.set(0, 1, 1);
      scene.add(directionalLight);

      // SVG yükleyici
      const svgLoader = new SVGLoader();
      let svgGroup = new THREE.Group();

      svgLoader.load(
        "./assets/websiteIcon.svg",
        (data) => {
          const paths = data.paths;
          //const group = new THREE.Group();

          for ( let i = 0; i < paths.length; i ++ ) {

            const path = paths[i];

            const material = new THREE.MeshBasicMaterial( {
              color: path.color || 0x000000,
              side: THREE.DoubleSide,
              depthWrite: false
            } );

            const shapes = SVGLoader.createShapes( path );

            for ( let j = 0; j < shapes.length; j ++ ) {

              const shape = shapes[ j ];
              const geometry = new THREE.ShapeGeometry( shape );
              const mesh = new THREE.Mesh( geometry, material );
              svgGroup.add( mesh );

            }
          }
        },
        (xhr) => {
          console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
        },
        (error) => {
          console.error( 'An error happened', error );
        }
      )

      // Platform (Cylinder)
      const platformGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.05, 32);
      const platformMaterial = new THREE.MeshBasicMaterial({
        color: 0x1b2a47,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8,
      });

      const platformMesh = new THREE.Mesh(platformGeometry, platformMaterial);
      const platformMesh2 = platformMesh.clone();
      const platformMesh3 = platformMesh.clone();
      const platformMesh4 = platformMesh.clone();

      platformMesh.rotation.x = -Math.PI / 2;
      platformMesh2.rotation.x = -Math.PI / 2;
      platformMesh3.rotation.x = -Math.PI / 2;
      platformMesh4.rotation.x = -Math.PI / 2;

      // Modelleri anchor'a ekle
      const anchor = mindarThree.addAnchor(0);
      anchor.group.add(platformMesh);
      anchor.group.add(platformMesh2);
      anchor.group.add(platformMesh3);
      anchor.group.add(platformMesh4);
      anchor.group.add(svgGroup)

      anchor.onTargetFound = () => {
        gsap
          .timeline()
          .fromTo(
            platformMesh.scale,
            { x: 0, y: 0, z: 0 },
            { x: 0.3, y: 0.3, z: 0.3, duration: 1, ease: "power2.inOut" }
          )
          .fromTo(
            platformMesh.position,
            { x: 0, y: 0, z: 0 },
            { x: -0.45, y: -0.4, z: 0, duration: 1, ease: "power2.inOut" }
          )
          .fromTo(
            platformMesh2.scale,
            { x: 0, y: 0, z: 0 },
            { x: 0.3, y: 0.3, z: 0.3, duration: 1, ease: "power2.inOut" }
          )
          .fromTo(
            platformMesh2.position,
            { x: 0, y: 0, z: 0 },
            { x: -0.15, y: -0.4, z: 0, duration: 1, ease: "power2.inOut" }
          )
          .fromTo(
            platformMesh3.scale,
            { x: 0, y: 0, z: 0 },
            { x: 0.3, y: 0.3, z: 0.3, duration: 1, ease: "power2.inOut" }
          )
          .fromTo(
            platformMesh3.position,
            { x: 0, y: 0, z: 0 },
            { x: 0.15, y: -0.4, z: 0, duration: 1, ease: "power2.inOut" }
          )
          .fromTo(
            platformMesh4.scale,
            { x: 0, y: 0, z: 0 },
            { x: 0.3, y: 0.3, z: 0.3, duration: 1, ease: "power2.inOut" }
          )
          .fromTo(
            platformMesh4.position,
            { x: 0, y: 0, z: 0 },
            { x: 0.45, y: -0.4, z: 0, duration: 1, ease: "power2.inOut" }
          );
      };

      // Animation loop
      await mindarThree.start();

      renderer.setAnimationLoop(() => {
        renderer.render(scene, camera);
      });
    } catch (error) {
      console.log("Bir hata oluştu:", error);
      alert("Bir hata oluştu,", error.message);
    }
  };
  start();
});

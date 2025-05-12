import * as THREE from "three";
import { MindARThree } from "mind-ar/dist/mindar-image-three.prod.js";
import { SVGLoader } from "three/examples/jsm/Addons.js";
import target from "./assets/target.mind?url";
import gsap from "gsap";
import { mockWithVideo } from "./libs/camera-mock";

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

      mockWithVideo("./assets/mockvideo.mp4");

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
      let svgGroup2 = new THREE.Group();
      let svgGroup3 = new THREE.Group();
      let svgGroup4 = new THREE.Group();

      svgLoader.load(
        "./assets/website4.svg",
        (data) => {
          const paths = data.paths;
          console.log('SVG yüklendi, yollar:', paths.length);
          
          for ( let i = 0; i < paths.length; i ++ ) {

            const path = paths[i];
            
            // Handle 'currentColor' by providing a default color
            let color;
            if (path.color && path.color.getStyle() === 'currentColor') {
              color = new THREE.Color(0x000000); // Default color (black) when currentColor is encountered
            } else {
              color = path.color || new THREE.Color(0x000000);
            }

            const material = new THREE.MeshBasicMaterial( {
              color: color, // path.color yerine color kullan
              side: THREE.DoubleSide,
              depthWrite: true, // Derinlik yazma aktif
              depthTest: true, // Derinlik testi aktif
              transparent: false, // Transparan değil
              //renderOrder: 100, // Çok yüksek renderOrder değeri
              polygonOffset: true,
              polygonOffsetFactor: -10, // Daha yüksek offset değeri
              polygonOffsetUnits: -10
            } );

            const shapes = SVGLoader.createShapes( path );
            console.log(`Yol ${i} için ${shapes.length} şekil oluşturuldu`);

            for ( let j = 0; j < shapes.length; j ++ ) {

              const shape = shapes[ j ];
              const geometry = new THREE.ShapeGeometry( shape );
              const mesh = new THREE.Mesh( geometry, material );
              svgGroup.add( mesh );

            }
          }
          
          // SVG grubunun merkezini hesapla
          const box = new THREE.Box3().setFromObject(svgGroup);
          const center = box.getCenter(new THREE.Vector3());
          
          // Merkezi ortalamak için grubun içindeki tüm mesh'leri kaydır ve z pozisyonunu artır
          let zOffset = 0.2; // Daha yüksek z ofset değeri - platformun üzerinde olması için
          
          svgGroup.children.forEach((mesh, index) => {
            // Eğer mesh platform mesh değilse (SVG mesh'i ise)
            if (mesh !== platformMesh && mesh !== platformMesh2 && mesh !== platformMesh3 && mesh !== platformMesh4) {
              mesh.position.x -= center.x;
              mesh.position.y -= center.y;
              
              // SVG mesh'lerini platformun üstüne taşı
              mesh.position.z += zOffset + (index * 0.001); // Daha yüksek z pozisyonu
              
              // SVG mesh'lerinin renderOrder'ını çok yüksek yap
              if (mesh.material) {
                mesh.material.renderOrder = 10 + index; // Çok daha yüksek renderOrder
                mesh.renderOrder = 10 + index;
                
                // Z-fighting için ek önlemler
                if (mesh.material.polygonOffset) {
                  mesh.material.polygonOffsetFactor = -1 - (index * 0.1);
                }
              }
            }
          });
          
          // SVG grubunu ölçeklendir ve konumlandır
          svgGroup.scale.set(0.00025, 0.00025, 0.00025); // SVG boyutunu küçült
          svgGroup.rotation.z = -Math.PI; // SVG'yi döndür
          svgGroup.position.z = 0.02; // SVG'yi öne al (yüksek z değeri)
          
          console.log('SVG grubu hazır, mesh sayısı:', svgGroup.children.length);
        },
        (xhr) => {
          console.log( ( xhr.loaded / xhr.total * 100 ) + '% yüklendi' );
        },
        (error) => {
          console.error( 'SVG yüklenirken hata oluştu:', error );
        }
      )

      svgLoader.load(
        "./assets/locationColored2.svg",
        (data) => {
          const paths = data.paths;
          console.log('SVG yüklendi, yollar:', paths.length);
          
          for ( let i = 0; i < paths.length; i ++ ) {

            const path = paths[i];
            
            // Handle 'currentColor' by providing a default color
            let color;
            if (path.color && path.color.getStyle() === 'currentColor') {
              color = new THREE.Color(0x000000); // Default color (black) when currentColor is encountered
            } else {
              color = path.color || new THREE.Color(0x000000);
            }

            const material = new THREE.MeshBasicMaterial( {
              color: color, // path.color yerine color kullan
              side: THREE.DoubleSide,
              depthWrite: true, // Derinlik yazma aktif
              depthTest: true, // Derinlik testi aktif
              transparent: false, // Transparan değil
              //renderOrder: 100, // Çok yüksek renderOrder değeri
              polygonOffset: true,
              polygonOffsetFactor: -10, // Daha yüksek offset değeri
              polygonOffsetUnits: -10
            } );

            const shapes = SVGLoader.createShapes( path );
            console.log(`Yol ${i} için ${shapes.length} şekil oluşturuldu`);

            for ( let j = 0; j < shapes.length; j ++ ) {

              const shape = shapes[ j ];
              const geometry = new THREE.ShapeGeometry( shape );
              const mesh = new THREE.Mesh( geometry, material );
              svgGroup2.add( mesh );

            }
          }
          
          // SVG grubunun merkezini hesapla
          const box = new THREE.Box3().setFromObject(svgGroup2);
          const center = box.getCenter(new THREE.Vector3());
          
          // Merkezi ortalamak için grubun içindeki tüm mesh'leri kaydır ve z pozisyonunu artır
          let zOffset = 0.2; // Daha yüksek z ofset değeri - platformun üzerinde olması için
          
          svgGroup2.children.forEach((mesh, index) => {
            // Eğer mesh platform mesh değilse (SVG mesh'i ise)
            if (mesh !== platformMesh && mesh !== platformMesh2 && mesh !== platformMesh3 && mesh !== platformMesh4) {
              mesh.position.x -= center.x;
              mesh.position.y -= center.y;
              
              // SVG mesh'lerini platformun üstüne taşı
              mesh.position.z += zOffset + (index * 0.001); // Daha yüksek z pozisyonu
              
              // SVG mesh'lerinin renderOrder'ını çok yüksek yap
              if (mesh.material) {
                mesh.material.renderOrder = 10 + index; // Çok daha yüksek renderOrder
                mesh.renderOrder = 10 + index;
                
                // Z-fighting için ek önlemler
                if (mesh.material.polygonOffset) {
                  mesh.material.polygonOffsetFactor = -1 - (index * 0.1);
                }
              }
            }
          });
          
          // SVG grubunu ölçeklendir ve konumlandır
          svgGroup2.scale.set(0.00025, 0.00025, 0.00025); // SVG boyutunu küçült
          svgGroup2.rotation.z = Math.PI; // SVG'yi döndür
          //svgGroup2.rotation.y = Math.PI / 2; // SVG'yi yatay konumlandır
          svgGroup2.position.z = 0.02; // SVG'yi öne al (yüksek z değeri)
          
          console.log('SVG grubu hazır, mesh sayısı:', svgGroup2.children.length);
        },
        (xhr) => {
          console.log( ( xhr.loaded / xhr.total * 100 ) + '% yüklendi' );
        },
        (error) => {
          console.error( 'SVG yüklenirken hata oluştu:', error );
        }
      )

      svgLoader.load(
        "./assets/contacts2.svg",
        (data) => {
          const paths = data.paths;
          console.log('SVG yüklendi, yollar:', paths.length);
          
          for ( let i = 0; i < paths.length; i ++ ) {

            const path = paths[i];
            
            // Handle 'currentColor' by providing a default color
            let color;
            if (path.color && path.color.getStyle() === 'currentColor') {
              color = new THREE.Color(0x000000); // Default color (black) when currentColor is encountered
            } else {
              color = path.color || new THREE.Color(0x000000);
            }

            const material = new THREE.MeshBasicMaterial( {
              color: color, // path.color yerine color kullan
              side: THREE.DoubleSide,
              depthWrite: true, // Derinlik yazma aktif
              depthTest: true, // Derinlik testi aktif
              transparent: false, // Transparan değil
              //renderOrder: 100, // Çok yüksek renderOrder değeri
              polygonOffset: true,
              polygonOffsetFactor: -10, // Daha yüksek offset değeri
              polygonOffsetUnits: -10
            } );

            const shapes = SVGLoader.createShapes( path );
            console.log(`Yol ${i} için ${shapes.length} şekil oluşturuldu`);

            for ( let j = 0; j < shapes.length; j ++ ) {

              const shape = shapes[ j ];
              const geometry = new THREE.ShapeGeometry( shape );
              const mesh = new THREE.Mesh( geometry, material );
              svgGroup3.add( mesh );

            }
          }
          
          // SVG grubunun merkezini hesapla
          const box = new THREE.Box3().setFromObject(svgGroup3);
          const center = box.getCenter(new THREE.Vector3());
          
          // Merkezi ortalamak için grubun içindeki tüm mesh'leri kaydır ve z pozisyonunu artır
          let zOffset = 0.2; // Daha yüksek z ofset değeri - platformun üzerinde olması için
          
          svgGroup3.children.forEach((mesh, index) => {
            // Eğer mesh platform mesh değilse (SVG mesh'i ise)
            if (mesh !== platformMesh && mesh !== platformMesh2 && mesh !== platformMesh3 && mesh !== platformMesh4) {
              mesh.position.x -= center.x;
              mesh.position.y -= center.y;
              
              // SVG mesh'lerini platformun üstüne taşı
              mesh.position.z += zOffset + (index * 0.001); // Daha yüksek z pozisyonu
              
              // SVG mesh'lerinin renderOrder'ını çok yüksek yap
              if (mesh.material) {
                mesh.material.renderOrder = 10 + index; // Çok daha yüksek renderOrder
                mesh.renderOrder = 10 + index;
                
                // Z-fighting için ek önlemler
                if (mesh.material.polygonOffset) {
                  mesh.material.polygonOffsetFactor = -1 - (index * 0.1);
                }
              }
            }
          });
          
          // SVG grubunu ölçeklendir ve konumlandır
          svgGroup3.scale.set(0.00025, 0.00025, 0.00025); // SVG boyutunu küçült
          svgGroup3.rotation.z = Math.PI; // SVG'yi döndür
          //svgGroup2.rotation.y = Math.PI / 2; // SVG'yi yatay konumlandır
          svgGroup3.position.z = 0.02; // SVG'yi öne al (yüksek z değeri)
          
          console.log('SVG grubu hazır, mesh sayısı:', svgGroup3.children.length);
        },
        (xhr) => {
          console.log( ( xhr.loaded / xhr.total * 100 ) + '% yüklendi' );
        },
        (error) => {
          console.error( 'SVG yüklenirken hata oluştu:', error );
        }
      )

      // Platform (Cylinder)
      const platformGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.05, 32);
      const platformMaterial = new THREE.MeshBasicMaterial({
        color: 0xffa901,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 1,
        depthWrite: true,
        //renderOrder: 1 // SVG'den daha düşük renderOrder değeri
      });

      const platformMesh = new THREE.Mesh(platformGeometry, platformMaterial);

      const platformMesh2 = platformMesh.clone();
      const platformMesh3 = platformMesh.clone();
      const platformMesh4 = platformMesh.clone();

      platformMesh.renderOrder = 1; // Düşük renderOrder değeri
      platformMesh2.renderOrder = 1;
      platformMesh3.renderOrder = 1;
      platformMesh4.renderOrder = 1;

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
      anchor.group.add(svgGroup);
      anchor.group.add(svgGroup2);
      anchor.group.add(svgGroup3);

      anchor.onTargetFound = () => {
        gsap
          .timeline()
          .fromTo(
            platformMesh.scale,
            { x: 0, y: 0, z: 0 },
            { x: 0.5, y: 0.5, z: 0.5, duration: 1, ease: "power2.inOut" }
          )
          .fromTo(
            platformMesh.position,
            { x: 0, y: 0 },
            { x: -0.75, y: -0.4, duration: 1, ease: "power2.inOut" }
          )
          .fromTo(
            svgGroup.scale,
            { x: 0, y: 0, z: 0 },
            { x: 0.00045, y: 0.00045, z: 0.00045, duration: 1, ease: "power2.inOut" }, "<"
          )
          .fromTo(
            svgGroup.position,
            { x: 0, y: 0 },
            { x: -0.75, y: -0.4, duration: 1, ease: "power2.inOut" }, "<"
          )
          .fromTo(
            platformMesh2.scale,
            { x: 0, y: 0, z: 0 },
            { x: 0.5, y: 0.5, z: 0.5, duration: 1, ease: "power2.inOut" }
          )
          .fromTo(
            platformMesh2.position,
            { x: 0, y: 0, z: 0 },
            { x: -0.22, y: -0.4, z: 0, duration: 1, ease: "power2.inOut" }
          )
          .fromTo(
            svgGroup2.scale,
            { x: 0, y: 0, z: 0 },
            { x: 0.00040, y: 0.00040, z: 0.00040, duration: 1, ease: "power2.inOut" }, "<"
          )
          .fromTo(
            svgGroup2.position,
            { x: 0, y: 0 },
            { x: -0.22, y: -0.4, duration: 1, ease: "power2.inOut" }, "<"
          )
          .fromTo(
            platformMesh3.scale,
            { x: 0, y: 0, z: 0 },
            { x: 0.5, y: 0.5, z: 0.5, duration: 1, ease: "power2.inOut" }
          )
          .fromTo(
            platformMesh3.position,
            { x: 0, y: 0, z: 0 },
            { x: 0.31, y: -0.4, z: 0, duration: 1, ease: "power2.inOut" }
          )
          .fromTo(
            svgGroup3.scale,
            { x: 0, y: 0, z: 0 },
            { x: 0.007, y: 0.007, z: 0.007, duration: 1, ease: "power2.inOut" }, "<"
          )
          .fromTo(
            svgGroup3.position,
            { x: 0, y: 0 },
            { x: 0.31, y: -0.4, duration: 1, ease: "power2.inOut" }, "<"
          )
          .fromTo(
            platformMesh4.scale,
            { x: 0, y: 0, z: 0 },
            { x: 0.5, y: 0.5, z: 0.5, duration: 1, ease: "power2.inOut" }
          )
          .fromTo(
            platformMesh4.position,
            { x: 0, y: 0, z: 0 },
            { x: 0.84, y: -0.4, z: 0, duration: 1, ease: "power2.inOut" }
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

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { MindARThree } from "mind-ar/dist/mindar-image-three.prod.js";
import { SVGLoader } from "three/examples/jsm/Addons.js";
import target from "./assets/target.mind?url";
import gsap from "gsap";
import { mockWithVideo } from "./libs/camera-mock";
import { TextureLoader } from "three";
import websiteIcon from "./assets/website6.svg"
import locationIcon from "./assets/locationColored2.svg"
import contactsIcon from "./assets/contacts3.svg"
import buttonMatcapTexture from "./assets/buttonMatcap7.png"

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

      // Texture yükleyici
      const textureLoader = new TextureLoader();
      const buttonMatcap = textureLoader.load(buttonMatcapTexture)

      // SVG yükleyici
      const svgLoader = new SVGLoader();
      let svgGroup = new THREE.Group();
      let svgGroup2 = new THREE.Group();
      let svgGroup3 = new THREE.Group();
      let svgGroup4 = new THREE.Group();

      svgLoader.load(
        websiteIcon,
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
              mesh.position.z += zOffset + (index * 0.09); // Daha yüksek z pozisyonu
              
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
          svgGroup.scale.set(0.0008, 0.0008, 0.0008); // SVG boyutunu küçült
          svgGroup.rotation.z = -Math.PI; // SVG'yi döndür
          svgGroup.position.z = 0.08; // SVG'yi öne al (yüksek z değeri)
          
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
        locationIcon,
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
          svgGroup2.scale.set(0.0008, 0.0008, 0.0008); // SVG boyutunu küçült
          svgGroup2.rotation.z = Math.PI; // SVG'yi döndür
          //svgGroup2.rotation.y = Math.PI / 2; // SVG'yi yatay konumlandır
          svgGroup2.position.z = 0.08; // SVG'yi öne al (yüksek z değeri)
          
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
        contactsIcon,
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
              //side: THREE.DoubleSide,
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
          svgGroup3.scale.set(0.0008, 0.0008, 0.0008); // SVG boyutunu küçült
          svgGroup3.rotation.z = Math.PI; // SVG'yi döndür
          //svgGroup2.rotation.y = Math.PI / 2; // SVG'yi yatay konumlandır
          svgGroup3.position.z = 0.08; // SVG'yi öne al (yüksek z değeri)
          
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
      const platformGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.08, 32);
      const platformMaterial = new THREE.MeshMatcapMaterial({
        matcap: buttonMatcap,
        //normalMap: new THREE.TextureLoader().load('path/to/normal-map.png'),
        normalScale: new THREE.Vector2(0.5, 0.5), // Normal map etkisini ayarlayabilirsiniz
        //side: THREE.DoubleSide,
        //flatShading: true,
      })
      // const platformMaterial = new THREE.MeshBasicMaterial({
      //   color: 0xffa901,
      //   side: THREE.DoubleSide,
      //   transparent: true,
      //   opacity: 1,
      //   depthWrite: true,
      //   //renderOrder: 1 // SVG'den daha düşük renderOrder değeri
      // });

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

      const buttonGroup1 = new THREE.Group();
      buttonGroup1.add(platformMesh);
      buttonGroup1.add(svgGroup);

      const buttonGroup2 = new THREE.Group();
      buttonGroup2.add(platformMesh2);
      buttonGroup2.add(svgGroup2);

      const buttonGroup3 = new THREE.Group();
      buttonGroup3.add(platformMesh3);
      buttonGroup3.add(svgGroup3);

      // Modelleri anchor'a ekle
      const anchor = mindarThree.addAnchor(0);
      anchor.group.add(buttonGroup1);
      anchor.group.add(buttonGroup2);
      anchor.group.add(buttonGroup3);
      // anchor.group.add(platformMesh);
      // anchor.group.add(platformMesh2);
      // anchor.group.add(platformMesh3);
      // anchor.group.add(svgGroup);
      // anchor.group.add(svgGroup2);
      // anchor.group.add(svgGroup3);

      anchor.onTargetFound = () => {
        gsap
          .timeline()
          .fromTo(
            buttonGroup1.scale,
            { x: 0, y: 0, z: 0 },
            { x: 0.3, y: 0.3, z: 0.3, duration: 0.35, ease: "power2.inOut" }
          )
          .fromTo(
            buttonGroup1.position,
            { x: 0, y: 0 },
            { x: -0.35, y: -0.5, duration: 0.35, ease: "elastic.out(1,0.75)" }
          )
          .fromTo(
            buttonGroup2.scale,
            { x: 0, y: 0, z: 0 },
            { x: 0.3, y: 0.3, z: 0.3, duration: 0.35, ease: "power2.inOut" }
          )
          .fromTo(
            buttonGroup2.position,
            { x: 0, y: 0, z: 0 },
            { x: 0, y: -0.5, z: 0, duration: 0.35, ease: "elastic.out(1,0.75)" }
          )
          // .fromTo(
          //   platformMesh2.scale,
          //   { x: 0, y: 0, z: 0 },
          //   { x: 0.3, y: 0.3, z: 0.3, duration: 1, ease: "power2.inOut" }
          // )
          // .fromTo(
          //   platformMesh2.position,
          //   { x: 0, y: 0, z: 0 },
          //   { x: 0, y: -0.4, z: 0, duration: 1, ease: "power2.inOut" }
          // )
          // .fromTo(
          //   svgGroup2.scale,
          //   { x: 0, y: 0, z: 0 },
          //   { x: 0.00025, y: 0.00025, z: 0.00025, duration: 1, ease: "power2.inOut" }, "<"
          // )
          // .fromTo(
          //   svgGroup2.position,
          //   { x: 0, y: 0 },
          //   { x: -0, y: -0.4, duration: 1, ease: "power2.inOut" }, "<"
          // )
          .fromTo(
            buttonGroup3.scale,
            { x: 0, y: 0, z: 0 },
            { x: 0.3, y: 0.3, z: 0.3, duration: 0.35, ease: "power2.inOut" }
          )
          .fromTo(
            buttonGroup3.position,
            { x: 0, y: 0, z: 0 },
            { x: 0.35, y: -0.5, z: 0, duration: 0.35, ease: "elastic.out(1,0.75)" }
          )
          .to(svgGroup.scale,{x:0.001,y:0.001,z:0.001,duration:1.5,ease:"power2.inOut",yoyo:true,repeat:-1},"<")
          .to(svgGroup2.scale,{x:0.001,y:0.001,z:0.001,duration:1.5,ease:"power2.inOut",yoyo:true,repeat:-1},"<")
          .to(svgGroup3.scale,{x:0.001,y:0.001,z:0.001,duration:1.5,ease:"power2.inOut",yoyo:true,repeat:-1},"<")
          // .fromTo(
          //   platformMesh3.scale,
          //   { x: 0, y: 0, z: 0 },
          //   { x: 0.3, y: 0.3, z: 0.3, duration: 1, ease: "power2.inOut" }
          // )
          // .fromTo(
          //   platformMesh3.position,
          //   { x: 0, y: 0, z: 0 },
          //   { x: 0.35, y: -0.4, z: 0, duration: 1, ease: "power2.inOut" }
          // )
          // .fromTo(
          //   svgGroup3.scale,
          //   { x: 0, y: 0, z: 0 },
          //   { x: 0.0045, y: 0.0045, z: 0.0045, duration: 1, ease: "power2.inOut" }, "<"
          // )
          // .fromTo(
          //   svgGroup3.position,
          //   { x: 0, y: 0 },
          //   { x: 0.35, y: -0.4, duration: 1, ease: "power2.inOut" }, "<"
          // )
          // .fromTo(
          //   platformMesh4.scale,
          //   { x: 0, y: 0, z: 0 },
          //   { x: 0.3, y: 0.3, z: 0.3, duration: 1, ease: "power2.inOut" }
          // )
          // .fromTo(
          //   platformMesh4.position,
          //   { x: 0, y: 0, z: 0 },
          //   { x: 0.84, y: -0.4, z: 0, duration: 1, ease: "power2.inOut" }
          // );
      };

      // Raycaster setup
      const raycaster = new THREE.Raycaster();
      const pointer = new THREE.Vector2();

      // Click event handler
      const onPointerDown = (event) => {
        // Calculate pointer position in normalized device coordinates (-1 to +1)
        pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // Update the picking ray with the camera and pointer position
        raycaster.setFromCamera(pointer, camera);

        // Calculate objects intersecting the picking ray
        const intersects = raycaster.intersectObjects([buttonGroup1, buttonGroup2, buttonGroup3], true);

        if (intersects.length > 0) {
          // Find the parent buttonGroup of the intersected object
          let buttonGroup = intersects[0].object;
          while (buttonGroup.parent && !(buttonGroup === buttonGroup1 || buttonGroup === buttonGroup2 || buttonGroup === buttonGroup3)) {
            buttonGroup = buttonGroup.parent;
          }

          // Handle button clicks
          if (buttonGroup === buttonGroup1) {
            console.log('buttonGroup1');
            // Mobil cihaz kontrolü
            if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
              window.location.href = 'https://techno-software.com/';
            } else {
              window.open('https://techno-software.com/', '_blank');
            }
          }
          else if (buttonGroup === buttonGroup2) {
            console.log('buttonGroup2');
            // Mobil cihaz kontrolü
            if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
              window.location.href = 'https://maps.app.goo.gl/X2Yek4JLqDF8g7aTA';
            } else {
              window.open('https://maps.app.goo.gl/X2Yek4JLqDF8g7aTA', '_blank');
            }
          }
          else if (buttonGroup === buttonGroup3) {
            console.log('buttonGroup3');
            // Mobil cihaz kontrolü
            if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
              // Mobil cihazlar için alternatif yöntem
              window.location.href = "data:text/x-vcard;urlencoded,BEGIN%3AVCARD%0AVERSION%3A3.0%0AN%3AYap%C4%B1c%C4%B1%3B%C4%B0smail%0AFN%3A%C4%B0smail%20Yap%C4%B1c%C4%B1%0AORG%3ATechno%20Soft%0ATITLE%3ACo-founder%20%26%20CTO%0ATEL%3BTYPE%3DCELL%3A%2B90%20554%20386%207198%0AEMAIL%3Aismail.yapici%40techno-software.com%0AURL%3Ahttps%3A%2F%2Ftechno-software.com%2F%0AADR%3BTYPE%3DWORK%3A%3B%3B%3BTeknopark%20%C4%B0stanbul%3B%3B%3B%0AEND%3AVCARD"
              // const contactInfo = {
              //   name: 'İsmail Yapıcı',
              //   tel: '+90 554 386 7198',
              //   email: 'ismail.yapici@techno-software.com'
              // };

              // // iOS için tel ve mailto linklerini kullan
              // const telLink = document.createElement('a');
              // telLink.href = `tel:${contactInfo.tel}`;
              // telLink.click();

              // setTimeout(() => {
              //   const mailLink = document.createElement('a');
              //   mailLink.href = `mailto:${contactInfo.email}`;
              //   mailLink.click();
              // }, 100);
            } 
            // else {
            //   // Masaüstü için vCard indirme
            //   const vCardData = `BEGIN:VCARD
            //     VERSION:3.0
            //     N:Yapıcı;İsmail
            //     FN:İsmail Yapıcı
            //     ORG:Techno Soft
            //     TITLE:Co-founder & CTO
            //     TEL;TYPE=CELL:+90 554 386 7198
            //     EMAIL:ismail.yapici@techno-software.com
            //     URL:https://techno-software.com/
            //     ADR;TYPE=WORK:;;Teknopark İstanbul;;;
            //     END:VCARD`;

            //   const blob = new Blob([vCardData], { type: 'text/vcard;charset=utf-8' });
            //   const url = window.URL.createObjectURL(blob);
            //   const link = document.createElement('a');
            //   link.href = url;
            //   link.setAttribute('download', 'ismail-yapici.vcf');
            //   document.body.appendChild(link);
            //   link.click();
            //   document.body.removeChild(link);
            //   window.URL.revokeObjectURL(url);
            // }
          }
        }
      };

      // Add click event listener
      document.addEventListener('pointerdown', onPointerDown);

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

import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import objFile from "../src/untitled.obj";
import mtlFile from "../src/untitled.mtl";
import materialCarton from "./images/carton.jpg";
import materialBlanc from "./images/blancjpg.jpg";

const Scene = () => {
  const canvasRef = useRef(null);
  const [sceneInitialized, setSceneInitialized] = useState(false);
  const [isBoxOpen, setIsBoxOpen] = useState(true);
  const [isColorPickerVisible, setColorPickerVisible] = useState(false);
  const [boxColor, setBoxColor] = useState("#95c28c");
  const [materialType, setMaterialType] = useState("matte");
  const [selectedTexture, setSelectedTexture] = useState(null);

  useEffect(() => {
    const initializeScene = async () => {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
      camera.position.z = 5;

      const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current });
      renderer.setClearColor(0xF4F3F2);
      renderer.setSize(window.innerWidth/1.5, window.innerHeight/1.5);

      const controls = new OrbitControls(camera, renderer.domElement);
      

      const objLoader = new OBJLoader();
      const mtlLoader = new MTLLoader();
      const material = await new Promise((resolve, reject) => {
        mtlLoader.load(mtlFile, (mtl) => {
          resolve(mtl);
        });
      });

      objLoader.setMaterials(material);
      objLoader.load(objFile, (object) => {
        object.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            let materialType 
            if (materialType === "carton") {
              child.material = new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load(materialCarton) });
            } else if (materialType === "blanc") {
              child.material = new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load(materialBlanc) });
            } else {
              const texture = selectedTexture ? new THREE.TextureLoader().load(selectedTexture) : null;
              child.material = new THREE.MeshBasicMaterial({ color: boxColor, map: texture });
            }
          }
        });
        scene.add(object);
      });
      

      setSceneInitialized(false);

      const animate = () => {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
        renderer.setClearColor(0xF4F3F2);
      };

      animate();
    };

    if (!sceneInitialized) {
      initializeScene();
    }
  }, [sceneInitialized, boxColor]);

  const toggleBox = () => {
    setIsBoxOpen((prevIsBoxOpen) => !prevIsBoxOpen);
  };

  const handleColorChange = (color) => {
    setBoxColor(color);
    setColorPickerVisible(false);
  };

  const toggleColorPicker = () => {
    setColorPickerVisible(!isColorPickerVisible);
  };

  const handleMaterialTypeChange = (event) => {
    setMaterialType(event.target.value);
  };

  
  return (
    <>
      {isBoxOpen && (
        <div className="box">
          <button onClick={toggleBox}>Fermer la box</button>
        </div>
      )}
      <div className="color-switch">
        <div className="color-picker-container">
          <label htmlFor="colorPicker">Color:</label>
          <input
            type="color"
            id="colorPicker"
            name="colorPicker"
            value={boxColor}
            onChange={(e) => handleColorChange(e.target.value)}
          />
          <div className="real-color">
            <input
              type="text"
              value={boxColor}
              readOnly
              onClick={toggleColorPicker}
            />
          </div>
        </div>
        <div className="input-group1">
          <label>Material</label>
          <div className="material-thumbnails">
            <img src={materialCarton} alt="Carton" onClick={() => setMaterialType("carton")} />
            <img src={materialBlanc} alt="Blanc" onClick={() => setMaterialType("blanc")} />
          </div>
        </div>
      
      </div>
      <canvas ref={canvasRef} className="webgl" />
    </>
  );
};

export default Scene;
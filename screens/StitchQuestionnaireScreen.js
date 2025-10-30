import React, { useState, useEffect } from "react";
import { useNavigation, useRoute, CommonActions } from "@react-navigation/native";
import { View, Platform } from "react-native";
import MobileViewport from "../src/components/MobileViewport";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../src/lib/firebase";

export default function StitchQuestionnaireScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { sessionId, eventTitle, eventDate } = route.params || {};

  const handleGoBack = () => {
    navigation.goBack();
  };

  // Vérifier si le questionnaire a déjà été complété
  const [isAlreadyCompleted, setIsAlreadyCompleted] = useState(false);
  const [isCheckingCompletion, setIsCheckingCompletion] = useState(true);

  useEffect(() => {
    const checkIfAlreadyCompleted = async () => {
      try {
        if (!auth.currentUser || !sessionId) {
          setIsCheckingCompletion(false);
          return;
        }

        // Récupérer l'ID de l'équipe de l'utilisateur
        const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (!userDoc.exists()) {
          setIsCheckingCompletion(false);
          return;
        }

        const userData = userDoc.data();
        const teamId = userData.teamId;
        if (!teamId) {
          setIsCheckingCompletion(false);
          return;
        }

        // Vérifier si une réponse existe déjà
        const responseRef = doc(db, "teams", teamId, "events", sessionId, "responses", auth.currentUser.uid);
        const responseDoc = await getDoc(responseRef);
        
        if (responseDoc.exists()) {
          console.log("❌ Questionnaire déjà complété, accès refusé");
          setIsAlreadyCompleted(true);
        }
      } catch (error) {
        console.error("❌ Erreur lors de la vérification:", error);
      } finally {
        setIsCheckingCompletion(false);
      }
    };

    checkIfAlreadyCompleted();
  }, [sessionId]);

  // Si déjà complété, rediriger vers l'accueil
  useEffect(() => {
    if (isAlreadyCompleted) {
      alert("Ce questionnaire a déjà été complété. Vous ne pouvez y répondre qu'une seule fois.");
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'AthleteMain' }],
        })
      );
    }
  }, [isAlreadyCompleted, navigation]);
  
  const [painToggle, setPainToggle] = useState(false);
  const [painDetails, setPainDetails] = useState({
    discomfort: 50,
    intensity: 50,
    frequency: null, // "first-time", "rarely", "often", "always"
  });
  const [showSubmitButton, setShowSubmitButton] = useState(false);
  const [sliderValues, setSliderValues] = useState({
    averageIntensity: 50,
    highIntensity: 50,
    cardiacImpact: 50,
    muscularImpact: 50,
    fatigue: 50,
    technique: 50,
    tactics: 50,
    dynamism: 50,
    nervousness: 50,
    concentration: 50,
    confidence: 50,
    wellBeing: 50,
    sleepQuality: 50,
  });

  const handleSubmit = async () => {
    try {
      // Get pain markers from 3D model if available
      const painMarkers = window.anatomyModel ? window.anatomyModel.getPainMarkers() : [];
      
      console.log("Questionnaire submitted:", { 
        sessionId, 
        painToggle, 
        painDetails: painToggle ? painDetails : null,
        painMarkers: painToggle ? painMarkers : [],
        sliderValues 
      });

      if (!auth.currentUser) {
        alert("Erreur: Utilisateur non connecté");
        return;
      }

      // Récupérer l'ID de l'équipe de l'utilisateur
      const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
      
      if (!userDoc.exists()) {
        alert("Erreur: Profil utilisateur non trouvé");
        return;
      }

      const userData = userDoc.data();
      console.log("🔍 Données utilisateur:", userData);
      const teamId = userData.teamId;
      console.log("🔍 Team ID:", teamId);

      if (!teamId) {
        alert("Erreur: Aucune équipe associée");
        return;
      }

      // Sauvegarder la réponse dans Firestore
      const responseData = {
        userId: auth.currentUser.uid,
        teamId: teamId,
        eventId: sessionId,
        responses: sliderValues,
        painAssessment: {
          hasPain: painToggle,
          details: painToggle ? painDetails : null,
          markers: painToggle ? painMarkers : []
        },
        submittedAt: serverTimestamp(),
        eventTitle: eventTitle || "Training Session",
        eventDate: eventDate || new Date().toISOString()
      };

      console.log("🔍 Données à sauvegarder:", responseData);
      console.log("🔍 Chemin Firestore: teams/", teamId, "/events/", sessionId, "/responses/", auth.currentUser.uid);

      const responseRef = doc(db, "teams", teamId, "events", sessionId, "responses", auth.currentUser.uid);
      await setDoc(responseRef, responseData);

      console.log("✅ Réponse sauvegardée dans Firestore:", responseData);
      
      // Attendre un peu pour s'assurer que les données sont bien sauvegardées
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Déclencher un événement de stockage pour notifier le rechargement
      if (Platform.OS === 'web') {
        localStorage.setItem('questionnaireSubmitted', Date.now().toString());
        // Déclencher l'événement storage manuellement
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'questionnaireSubmitted',
          newValue: Date.now().toString()
        }));
      }
      
      // Show success message
      alert("Questionnaire submitted successfully!");
      
      // Forcer un rechargement complet de la page pour s'assurer que les données sont mises à jour
      if (Platform.OS === 'web') {
        // Attendre un peu plus pour s'assurer que les données sont bien sauvegardées
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        // Navigate back to Home tab using CommonActions.reset
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'AthleteMain' }],
          })
        );
      }
    } catch (error) {
      console.error("❌ Erreur lors de la sauvegarde:", error);
      alert("Erreur lors de la sauvegarde du questionnaire: " + error.message);
    }
  };

  // Debug: Log the route params
  console.log("🔍 Questionnaire route params:", route.params);
  console.log("🔍 Event title:", eventTitle);
  console.log("🔍 Event date:", eventDate);
  console.log("🔍 Session ID:", sessionId);

  const handleSliderChange = (key, value) => {
    setSliderValues(prev => ({ ...prev, [key]: value }));
  };

  const handlePainDetailChange = (key, value) => {
    setPainDetails(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 50; // 50px tolerance
    setShowSubmitButton(isAtBottom);
  };

  if (Platform.OS === "web") {
    // Add CSS for the new design
    React.useEffect(() => {
      const style = document.createElement('style');
      style.textContent = `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 10px;
          background: #1E222D;
          outline: none;
          border-radius: 9999px;
          transition: background 200ms ease-out;
        }
        .slider::-webkit-slider-runnable-track {
          height: 10px;
          background: linear-gradient(90deg, #00E0FF, #4A67FF);
          border-radius: 9999px;
        }
        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          background: #00E0FF;
          cursor: pointer;
          border-radius: 50%;
          margin-top: -5px;
          box-shadow: 0 0 10px 2px rgba(0, 224, 255, 0.5);
          transition: transform 200ms ease-out, box-shadow 150ms ease-in;
        }
        .slider:active::-webkit-slider-thumb {
          box-shadow: 0 0 15px 5px rgba(0, 224, 255, 0.7);
        }
        .slider::-moz-range-track {
          height: 10px;
          background: linear-gradient(90deg, #00E0FF, #4A67FF);
          border-radius: 9999px;
        }
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: #00E0FF;
          cursor: pointer;
          border-radius: 50%;
          box-shadow: 0 0 10px 2px rgba(0, 224, 255, 0.5);
          border: none;
          transition: transform 200ms ease-out, box-shadow 150ms ease-in;
        }
        .slider:active::-moz-range-thumb {
          box-shadow: 0 0 15px 5px rgba(0, 224, 255, 0.7);
        }
        .card-animate {
            animation: fadeIn 150ms ease-out both;
        }
        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        .pulse-glow {
            animation: pulse-glow 2s infinite ease-in-out;
        }
        @keyframes pulse-glow {
            0%, 100% { box-shadow: 0 0 10px 0 rgba(0, 224, 255, 0.2); }
            50% { box-shadow: 0 0 20px 5px rgba(0, 224, 255, 0.4); }
        }
        @keyframes slideUp {
            from {
                transform: translateY(100%);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
      return () => document.head.removeChild(style);
    }, []);

    // Initialize 3D Anatomy Model with simplified approach
    React.useEffect(() => {
      const initAnatomyModel = async () => {
        // Load Three.js from CDN
        if (!window.THREE) {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
          script.onload = () => {
            initThreeJS();
          };
          document.head.appendChild(script);
        } else {
          initThreeJS();
        }

        function initThreeJS() {
          console.log('🔧 Three.js loaded, initializing...');
          
          const container = document.getElementById('body-viewer');
          const canvas = document.getElementById('anatomyCanvas');
          const loadingIndicator = document.getElementById('loading-indicator');
          
          if (!container || !canvas) {
            console.error('❌ Container or canvas not found');
            return;
          }

          // Show loading indicator
          if (loadingIndicator) {
            loadingIndicator.style.display = 'block';
          }

          // Scene setup
          const scene = new THREE.Scene();
          const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
          const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
          renderer.setSize(container.clientWidth, container.clientHeight);
          renderer.setClearColor(0x000000, 0);
          renderer.shadowMap.enabled = true;
          renderer.shadowMap.type = THREE.PCFSoftShadowMap;

          // Enhanced Lighting
          const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
          scene.add(ambientLight);
          
          // Main directional light (cyan theme)
          const directionalLight = new THREE.DirectionalLight(0x00E0FF, 1.2);
          directionalLight.position.set(5, 5, 5);
          directionalLight.castShadow = true;
          directionalLight.shadow.mapSize.width = 2048;
          directionalLight.shadow.mapSize.height = 2048;
          directionalLight.shadow.camera.near = 0.5;
          directionalLight.shadow.camera.far = 50;
          scene.add(directionalLight);

          // Fill light (blue theme)
          const fillLight = new THREE.DirectionalLight(0x4A67FF, 0.6);
          fillLight.position.set(-3, 2, -2);
          scene.add(fillLight);

          // Rim light for better definition
          const rimLight = new THREE.DirectionalLight(0xFFFFFF, 0.8);
          rimLight.position.set(0, 0, -5);
          scene.add(rimLight);

          // Point light for warmth
          const pointLight = new THREE.PointLight(0xFFE0B0, 0.5, 10);
          pointLight.position.set(2, 3, 2);
          scene.add(pointLight);

          // Create anatomy model
          const createAnatomyModel = () => {
            const group = new THREE.Group();

            // Enhanced Materials
            const muscleMaterial = new THREE.MeshPhongMaterial({ 
              color: 0x8B4513,
              shininess: 30,
              transparent: true,
              opacity: 0.9
            });
            const skinMaterial = new THREE.MeshPhongMaterial({ 
              color: 0xFFDBB5,
              shininess: 50
            });
            const boneMaterial = new THREE.MeshPhongMaterial({ 
              color: 0xF5F5DC,
              shininess: 80
            });

            // Head with more detail
            const headGeometry = new THREE.SphereGeometry(0.6, 32, 32);
            const head = new THREE.Mesh(headGeometry, skinMaterial);
            head.position.y = 2.2;
            head.castShadow = true;
            head.receiveShadow = true;
            head.name = 'head';
            group.add(head);

            // Neck
            const neckGeometry = new THREE.CylinderGeometry(0.15, 0.2, 0.4, 16);
            const neck = new THREE.Mesh(neckGeometry, skinMaterial);
            neck.position.y = 1.6;
            neck.castShadow = true;
            neck.receiveShadow = true;
            neck.name = 'neck';
            group.add(neck);

            // Enhanced Torso with chest and back muscles
            const torsoGeometry = new THREE.CylinderGeometry(0.4, 0.6, 2.5, 32);
            const torso = new THREE.Mesh(torsoGeometry, muscleMaterial);
            torso.position.y = 0.5;
            torso.castShadow = true;
            torso.receiveShadow = true;
            torso.name = 'torso';
            group.add(torso);

            // Chest muscles (Pectorals)
            const chestGeometry = new THREE.BoxGeometry(0.8, 0.3, 0.1);
            const chest = new THREE.Mesh(chestGeometry, muscleMaterial);
            chest.position.set(0, 1.2, 0.4);
            chest.castShadow = true;
            chest.receiveShadow = true;
            chest.name = 'chest';
            group.add(chest);

            // Abdominal muscles
            const absGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.1);
            const abs = new THREE.Mesh(absGeometry, muscleMaterial);
            abs.position.set(0, 0.2, 0.4);
            abs.castShadow = true;
            abs.receiveShadow = true;
            abs.name = 'abs';
            group.add(abs);

            // Shoulders
            const shoulderGeometry = new THREE.SphereGeometry(0.25, 16, 16);
            
            const leftShoulder = new THREE.Mesh(shoulderGeometry, muscleMaterial);
            leftShoulder.position.set(-0.6, 1.8, 0);
            leftShoulder.castShadow = true;
            leftShoulder.receiveShadow = true;
            leftShoulder.name = 'leftShoulder';
            group.add(leftShoulder);

            const rightShoulder = new THREE.Mesh(shoulderGeometry, muscleMaterial);
            rightShoulder.position.set(0.6, 1.8, 0);
            rightShoulder.castShadow = true;
            rightShoulder.receiveShadow = true;
            rightShoulder.name = 'rightShoulder';
            group.add(rightShoulder);

            // Enhanced Arms with biceps and triceps
            const upperArmGeometry = new THREE.CylinderGeometry(0.12, 0.15, 1.2, 16);
            const forearmGeometry = new THREE.CylinderGeometry(0.08, 0.12, 1.0, 16);
            
            // Left arm
            const leftUpperArm = new THREE.Mesh(upperArmGeometry, muscleMaterial);
            leftUpperArm.position.set(-0.7, 1.5, 0);
            leftUpperArm.rotation.z = Math.PI / 6;
            leftUpperArm.castShadow = true;
            leftUpperArm.receiveShadow = true;
            leftUpperArm.name = 'leftUpperArm';
            group.add(leftUpperArm);

            const leftForearm = new THREE.Mesh(forearmGeometry, muscleMaterial);
            leftForearm.position.set(-1.2, 0.8, 0);
            leftForearm.rotation.z = Math.PI / 4;
            leftForearm.castShadow = true;
            leftForearm.receiveShadow = true;
            leftForearm.name = 'leftForearm';
            group.add(leftForearm);

            // Right arm
            const rightUpperArm = new THREE.Mesh(upperArmGeometry, muscleMaterial);
            rightUpperArm.position.set(0.7, 1.5, 0);
            rightUpperArm.rotation.z = -Math.PI / 6;
            rightUpperArm.castShadow = true;
            rightUpperArm.receiveShadow = true;
            rightUpperArm.name = 'rightUpperArm';
            group.add(rightUpperArm);

            const rightForearm = new THREE.Mesh(forearmGeometry, muscleMaterial);
            rightForearm.position.set(1.2, 0.8, 0);
            rightForearm.rotation.z = -Math.PI / 4;
            rightForearm.castShadow = true;
            rightForearm.receiveShadow = true;
            rightForearm.name = 'rightForearm';
            group.add(rightForearm);

            // Enhanced Legs with thigh and calf muscles
            const thighGeometry = new THREE.CylinderGeometry(0.15, 0.2, 1.2, 16);
            const calfGeometry = new THREE.CylinderGeometry(0.12, 0.15, 1.0, 16);
            
            // Left leg
            const leftThigh = new THREE.Mesh(thighGeometry, muscleMaterial);
            leftThigh.position.set(-0.25, -0.3, 0);
            leftThigh.castShadow = true;
            leftThigh.receiveShadow = true;
            leftThigh.name = 'leftThigh';
            group.add(leftThigh);

            const leftCalf = new THREE.Mesh(calfGeometry, muscleMaterial);
            leftCalf.position.set(-0.25, -1.2, 0);
            leftCalf.castShadow = true;
            leftCalf.receiveShadow = true;
            leftCalf.name = 'leftCalf';
            group.add(leftCalf);

            // Right leg
            const rightThigh = new THREE.Mesh(thighGeometry, muscleMaterial);
            rightThigh.position.set(0.25, -0.3, 0);
            rightThigh.castShadow = true;
            rightThigh.receiveShadow = true;
            rightThigh.name = 'rightThigh';
            group.add(rightThigh);

            const rightCalf = new THREE.Mesh(calfGeometry, muscleMaterial);
            rightCalf.position.set(0.25, -1.2, 0);
            rightCalf.castShadow = true;
            rightCalf.receiveShadow = true;
            rightCalf.name = 'rightCalf';
            group.add(rightCalf);

            // Back muscles (Latissimus Dorsi)
            const backGeometry = new THREE.BoxGeometry(0.8, 1.5, 0.2);
            const back = new THREE.Mesh(backGeometry, muscleMaterial);
            back.position.set(0, 0.5, -0.4);
            back.castShadow = true;
            back.receiveShadow = true;
            back.name = 'back';
            group.add(back);

            // Hip muscles
            const hipGeometry = new THREE.SphereGeometry(0.3, 16, 16);
            const leftHip = new THREE.Mesh(hipGeometry, muscleMaterial);
            leftHip.position.set(-0.25, -0.8, 0);
            leftHip.castShadow = true;
            leftHip.receiveShadow = true;
            leftHip.name = 'leftHip';
            group.add(leftHip);

            const rightHip = new THREE.Mesh(hipGeometry, muscleMaterial);
            rightHip.position.set(0.25, -0.8, 0);
            rightHip.castShadow = true;
            rightHip.receiveShadow = true;
            rightHip.name = 'rightHip';
            group.add(rightHip);

            return group;
          };

          const anatomyModel = createAnatomyModel();
          scene.add(anatomyModel);

          // Camera position
          camera.position.z = 5;
          camera.position.y = 1.5;

          // Controls
          let isMouseDown = false;
          let mouseX = 0, mouseY = 0;
          let rotationX = 0, rotationY = 0;

          const handleMouseDown = (event) => {
            isMouseDown = true;
            mouseX = event.clientX;
            mouseY = event.clientY;
            canvas.style.cursor = 'grabbing';
          };

          const handleMouseMove = (event) => {
            if (!isMouseDown) return;
            
            const deltaX = event.clientX - mouseX;
            const deltaY = event.clientY - mouseY;
            
            rotationY += deltaX * 0.01;
            rotationX += deltaY * 0.01;
            
            anatomyModel.rotation.y = rotationY;
            anatomyModel.rotation.x = rotationX;
            
            mouseX = event.clientX;
            mouseY = event.clientY;
          };

          const handleMouseUp = () => {
            isMouseDown = false;
            canvas.style.cursor = 'grab';
          };

          const handleWheel = (event) => {
            camera.position.z += event.deltaY * 0.01;
            camera.position.z = Math.max(2, Math.min(10, camera.position.z));
          };

          // Event listeners
          canvas.addEventListener('mousedown', handleMouseDown);
          canvas.addEventListener('mousemove', handleMouseMove);
          canvas.addEventListener('mouseup', handleMouseUp);
          canvas.addEventListener('wheel', handleWheel);

          // Touch events
          canvas.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
              isMouseDown = true;
              mouseX = e.touches[0].clientX;
              mouseY = e.touches[0].clientY;
            }
          });

          canvas.addEventListener('touchmove', (e) => {
            if (!isMouseDown || e.touches.length !== 1) return;
            e.preventDefault();
            
            const deltaX = e.touches[0].clientX - mouseX;
            const deltaY = e.touches[0].clientY - mouseY;
            
            rotationY += deltaX * 0.01;
            rotationX += deltaY * 0.01;
            
            anatomyModel.rotation.y = rotationY;
            anatomyModel.rotation.x = rotationX;
            
            mouseX = e.touches[0].clientX;
            mouseY = e.touches[0].clientY;
          });

          canvas.addEventListener('touchend', () => {
            isMouseDown = false;
          });

          // Enhanced Pain Markers System
          const painMarkers = [];
          const raycaster = new THREE.Raycaster();
          const mouse = new THREE.Vector2();

          const addPainMarker = (position, bodyPart) => {
            const markerGeometry = new THREE.SphereGeometry(0.05, 16, 16);
            const markerMaterial = new THREE.MeshPhongMaterial({ 
              color: 0xFF0000,
              emissive: 0x440000,
              transparent: true,
              opacity: 0.8
            });
            const marker = new THREE.Mesh(markerGeometry, markerMaterial);
            marker.position.copy(position);
            marker.userData = { bodyPart, timestamp: Date.now() };
            marker.castShadow = true;
            scene.add(marker);
            painMarkers.push(marker);

            // Add pulsing effect
            const pulseAnimation = () => {
              const scale = 1 + 0.3 * Math.sin(Date.now() * 0.01);
              marker.scale.setScalar(scale);
              requestAnimationFrame(pulseAnimation);
            };
            pulseAnimation();

            console.log('📍 Pain marker added at:', position, 'on', bodyPart);
          };

          const getPainMarkers = () => {
            return painMarkers.map(marker => ({
              position: marker.position.toArray(),
              bodyPart: marker.userData.bodyPart,
              timestamp: marker.userData.timestamp
            }));
          };

          const clearPainMarkers = () => {
            painMarkers.forEach(marker => scene.remove(marker));
            painMarkers.length = 0;
            console.log('🗑️ All pain markers cleared');
          };

          // Enhanced click/touch interaction with raycasting
          const handleClick = (event) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(anatomyModel.children, true);

            if (intersects.length > 0) {
              const clickedObject = intersects[0].object;
              const intersectionPoint = intersects[0].point;
              const bodyPart = clickedObject.name || 'unknown';
              
              // Add pain marker
              addPainMarker(intersectionPoint, bodyPart);
              
              // Highlight the clicked body part
              clickedObject.material.emissive.setHex(0x444444);
              setTimeout(() => {
                clickedObject.material.emissive.setHex(0x000000);
              }, 200);
            }
          };

          // Add click event listener
          canvas.addEventListener('click', handleClick);
          canvas.addEventListener('touchend', (e) => {
            if (e.touches.length === 0) {
              handleClick(e);
            }
          });

          // Enhanced reset function
          const resetView = () => {
            anatomyModel.rotation.set(0, 0, 0);
            camera.position.set(0, 1.5, 5);
            clearPainMarkers();
            console.log('🔄 View reset');
          };

          // Expose functions globally
          window.anatomyModel = {
            resetView,
            getPainMarkers,
            clearPainMarkers
          };

          // Animation loop with enhanced effects
          const animate = () => {
            requestAnimationFrame(animate);
            
            // Subtle breathing animation
            const time = Date.now() * 0.001;
            anatomyModel.children.forEach((child, index) => {
              if (child.name === 'torso' || child.name === 'chest') {
                const breathScale = 1 + 0.02 * Math.sin(time * 2 + index);
                child.scale.y = breathScale;
              }
            });

            renderer.render(scene, camera);
          };
          animate();

          // Hide loading indicator
          if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
          }

          console.log('🔧 Enhanced 3D Anatomy model initialized');
        }
      };

      // Initialize when pain toggle becomes true
      if (painToggle) {
        setTimeout(() => {
          initAnatomyModel();
        }, 200);
      }
    }, [painToggle]);

    // Afficher un écran de chargement pendant la vérification
    if (isCheckingCompletion) {
      return (
        <MobileViewport>
          <div style={{
            width: "100%",
            height: "100vh",
            background: "linear-gradient(to bottom, #0B0F1A, #020409)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: "20px"
          }}>
            <div style={{
              width: "40px",
              height: "40px",
              border: "3px solid rgba(0, 224, 255, 0.3)",
              borderTop: "3px solid #00E0FF",
              borderRadius: "50%",
              animation: "spin 1s linear infinite"
            }}></div>
            <div style={{
              color: "#00E0FF",
              fontSize: "16px",
              fontWeight: "600"
            }}>
              Vérification en cours...
            </div>
          </div>
        </MobileViewport>
      );
    }

    return (
      <MobileViewport>
        <div 
          style={{
            width: "100%",
            height: "100vh",
            background: "linear-gradient(to bottom, #0B0F1A, #020409)",
            fontFamily: "'Inter', sans-serif",
            color: "rgba(255, 255, 255, 0.9)",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            maxWidth: "384px",
            margin: "0 auto",
            overflow: "hidden",
          }}
        >
          {/* Background Effect */}
          <div 
            style={{
              position: "absolute",
              top: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: "300px",
              height: "300px",
              background: "radial-gradient(circle, rgba(0, 224, 255, 0.1), transparent 70%)",
              pointerEvents: "none",
              zIndex: 0,
            }} 
          />

          {/* Header with Back Button */}
          <div style={{ 
            position: "relative", 
            zIndex: 20, 
            padding: "24px 24px 0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start"
          }}>
            <button 
              onClick={handleGoBack}
              style={{
                background: "rgba(0, 224, 255, 0.1)",
                border: "1px solid rgba(0, 224, 255, 0.3)",
                borderRadius: "12px",
                padding: "12px 16px",
                color: "#00E0FF",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.2s",
                backdropFilter: "blur(10px)",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "rgba(0, 224, 255, 0.2)";
                e.target.style.borderColor = "rgba(0, 224, 255, 0.5)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "rgba(0, 224, 255, 0.1)";
                e.target.style.borderColor = "rgba(0, 224, 255, 0.3)";
              }}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Back
            </button>
          </div>

          {/* Main Content */}
          <div 
            onScroll={handleScroll}
            style={{ 
              flex: 1, 
              padding: "0 24px", 
              paddingTop: "24px", 
              paddingBottom: "24px", 
              zIndex: 10, 
              overflowY: "auto",
              overflowX: "hidden",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {/* Header */}
            <header style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              paddingBottom: "24px",
              textAlign: "center",
            }}>
              <div style={{ position: "relative" }}>
                <h1 style={{ 
                  fontSize: "30px", 
                  fontWeight: "600", 
                  color: "rgba(255, 255, 255, 0.9)",
                  margin: 0,
                }}>
                  {eventTitle || "Practice"}
                </h1>
                <div style={{
                  position: "absolute",
                  inset: 0,
                  zIndex: -1,
                  filter: "blur(20px)",
                  background: "radial-gradient(circle, rgba(0, 224, 255, 0.2), transparent 70%)",
                }}></div>
              </div>
              <p style={{ 
                fontSize: "18px", 
                fontWeight: "500",
                color: "rgba(154, 163, 178, 0.7)",
                margin: "8px 0 0 0",
              }}>
                {eventDate || "2:00 PM – 3:30 PM"}
              </p>
            </header>

            {/* Questionnaire Sections */}
            <main style={{ 
              display: "flex", 
              flexDirection: "column", 
              gap: "16px", 
              paddingBottom: "40px" // Reduced padding since button appears conditionally
            }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* Slider Sections */}
                {[
                  { key: "averageIntensity", label: "Average Intensity", description: "Average of all effort intensities." },
                  { key: "highIntensity", label: "High Intensity", description: "Average of the most intense effort phases." },
                  { key: "cardiacImpact", label: "Cardiac Impact", description: "Average of cardiovascular solicitations." },
                  { key: "muscularImpact", label: "Muscular Impact", description: "Average of muscular solicitations." },
                  { key: "fatigue", label: "Fatigue", description: "Decrease in available physical resources." },
                ].map((section, index) => (
                  <div 
                    key={section.key} 
                    style={{
                      background: "#141A24",
                      borderRadius: "16px",
                      padding: "16px",
                      border: "1px solid rgba(0, 224, 255, 0.1)",
                      boxShadow: "inset 0 0 0 1px rgba(0, 224, 255, 0.1)",
                      animationDelay: `${50 * (index + 1)}ms`,
                    }}
                    className="card-animate"
                  >
                    <div style={{ marginBottom: "12px" }}>
                      <label 
                        htmlFor={section.key} 
                        style={{
                          fontSize: "18px",
                          fontWeight: "600",
                          color: "white",
                          margin: 0,
                        }}
                      >
                        {section.label}
                      </label>
                      <p style={{
                        fontSize: "14px",
                        color: "rgba(154, 163, 178, 0.7)",
                        margin: "4px 0 0 0",
                      }}>
                        {section.description}
                      </p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ color: "#9AA3B2" }}>
                        <path d="M18 12H6" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <input
                        type="range"
                        id={section.key}
                        min="0"
                        max="100"
                        value={sliderValues[section.key]}
                        onChange={(e) => handleSliderChange(section.key, parseInt(e.target.value))}
                        className="slider"
                      />
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ color: "#9AA3B2" }}>
                        <path d="M12 6v12M18 12H6" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                ))}
              </div>

              {/* Physical Pain Assessment */}
              <div 
                style={{
                  background: "#141A24",
                  borderRadius: "16px",
                  padding: "16px",
                  border: "1px solid rgba(0, 224, 255, 0.1)",
                  boxShadow: "inset 0 0 0 1px rgba(0, 224, 255, 0.1)",
                  animationDelay: `${50 * 6}ms`,
                }}
                className="card-animate"
              >
                <p style={{
                  fontSize: "18px", 
                  fontWeight: "600", 
                  color: "white",
                  margin: 0,
                }}>
                  Did you feel any physical pain?
                </p>
                <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                  <button
                    onClick={() => setPainToggle(false)}
                    className={!painToggle ? "pulse-glow" : ""}
                    style={{
                      flex: 1,
                      padding: "10px 20px",
                      borderRadius: "12px",
                      fontSize: "14px",
                      fontWeight: "500",
                      cursor: "pointer",
                      background: !painToggle 
                        ? "linear-gradient(90deg, #00E0FF, #4A67FF)" 
                        : "#1E222D",
                      color: !painToggle ? "white" : "rgba(154, 163, 178, 0.7)",
                      border: "none",
                      transition: "all 0.2s",
                    }}
                  >
                    No
                  </button>
                  <button
                    onClick={() => setPainToggle(true)}
                    style={{
                      flex: 1,
                      padding: "10px 20px",
                      borderRadius: "12px",
                      fontSize: "14px",
                      fontWeight: "500",
                      cursor: "pointer",
                      background: painToggle 
                        ? "linear-gradient(90deg, #00E0FF, #4A67FF)" 
                        : "#1E222D",
                      color: painToggle ? "white" : "rgba(154, 163, 178, 0.7)",
                      border: "none",
                      transition: "all 0.2s",
                    }}
                  >
                    Yes
                  </button>
                </div>
              </div>

              {/* Pain Details - Only show when pain = Yes */}
              {painToggle && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {/* Human Anatomy Model */}
                  <div style={{
                    background: "#141A24",
                    borderRadius: "16px",
                    padding: "20px",
                    border: "1px solid rgba(0, 224, 255, 0.1)",
                    boxShadow: "inset 0 0 0 1px rgba(0, 224, 255, 0.1)",
                  }}>
                    <div style={{
                      width: "100%",
                      height: "300px",
                      background: "linear-gradient(135deg, #1E222D, #2A2F3A)",
                      borderRadius: "12px",
                      position: "relative",
                      overflow: "hidden",
                      border: "1px solid rgba(0, 224, 255, 0.2)",
                      boxShadow: "inset 0 0 20px rgba(0, 224, 255, 0.1)"
                    }}>
                      <div id="body-viewer" style={{
                        width: "100%",
                        height: "100%",
                        position: "relative",
                        background: "radial-gradient(circle at center, rgba(0, 224, 255, 0.05) 0%, rgba(0, 0, 0, 0.3) 100%)",
                        borderRadius: "12px",
                        overflow: "hidden",
                      }}>
                        <canvas id="anatomyCanvas" style={{
                          width: "100%",
                          height: "100%",
                          cursor: "grab"
                        }}></canvas>
                        
                        {/* Loading indicator */}
                        <div id="loading-indicator" style={{
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                          color: "#00E0FF",
                          fontSize: "14px",
                          display: "none"
                        }}>
                          Loading 3D Model...
                        </div>
                      </div>
                      <div style={{
                        position: "absolute",
                        bottom: "10px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        color: "rgba(154, 163, 178, 0.7)",
                        fontSize: "12px",
                        textAlign: "center",
                        zIndex: 10,
                      }}>
                        <div>SWIPE TO ROTATE · PINCH TO ZOOM · TAP TO MARK</div>
                        <div style={{ marginTop: "4px" }}>
                          <button 
                            id="resetView"
                            onClick={() => {
                              if (window.anatomyModel) {
                                window.anatomyModel.resetView();
                              }
                            }}
                            style={{ 
                              color: "#00E0FF", 
                              textDecoration: "underline",
                              textUnderlineOffset: "2px",
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              fontSize: "12px",
                              transition: "all 0.2s ease"
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.color = "#4A67FF";
                              e.target.style.transform = "scale(1.05)";
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.color = "#00E0FF";
                              e.target.style.transform = "scale(1)";
                            }}
                          >
                            Reset view
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Level of Discomfort */}
                  <div style={{
                    background: "#141A24",
                    borderRadius: "16px",
                    padding: "16px",
                    border: "1px solid rgba(0, 224, 255, 0.1)",
                    boxShadow: "inset 0 0 0 1px rgba(0, 224, 255, 0.1)",
                  }}>
                    <div style={{ marginBottom: "12px" }}>
                      <label 
                        style={{
                          fontSize: "18px",
                          fontWeight: "600",
                          color: "white",
                          margin: 0,
                        }}
                      >
                        Level of Discomfort
                      </label>
                      <p style={{
                        fontSize: "14px",
                        color: "rgba(154, 163, 178, 0.7)",
                        margin: "4px 0 0 0",
                      }}>
                        Extent of perceived unease.
                      </p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ color: "#9AA3B2" }}>
                        <path d="M18 12H6" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={painDetails.discomfort}
                        onChange={(e) => handlePainDetailChange("discomfort", parseInt(e.target.value))}
                        className="slider"
                      />
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ color: "#9AA3B2" }}>
                        <path d="M12 6v12M18 12H6" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>

                  {/* Level of Pain Intensity */}
                  <div style={{
                    background: "#141A24",
                    borderRadius: "16px",
                    padding: "16px",
                    border: "1px solid rgba(0, 224, 255, 0.1)",
                    boxShadow: "inset 0 0 0 1px rgba(0, 224, 255, 0.1)",
                  }}>
                    <div style={{ marginBottom: "12px" }}>
                      <label 
                        style={{
                          fontSize: "18px",
                          fontWeight: "600",
                          color: "white",
                          margin: 0,
                        }}
                      >
                        Level of Pain Intensity
                      </label>
                      <p style={{
                        fontSize: "14px",
                        color: "rgba(154, 163, 178, 0.7)",
                        margin: "4px 0 0 0",
                      }}>
                        Strength of the felt pain.
                      </p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ color: "#9AA3B2" }}>
                        <path d="M18 12H6" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={painDetails.intensity}
                        onChange={(e) => handlePainDetailChange("intensity", parseInt(e.target.value))}
                        className="slider"
                      />
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ color: "#9AA3B2" }}>
                        <path d="M12 6v12M18 12H6" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>

                  {/* Frequency of Appearance */}
                  <div style={{
                    background: "#141A24",
                    borderRadius: "16px",
                    padding: "16px",
                    border: "1px solid rgba(0, 224, 255, 0.1)",
                    boxShadow: "inset 0 0 0 1px rgba(0, 224, 255, 0.1)",
                  }}>
                    <div style={{ marginBottom: "12px" }}>
                      <label 
                        style={{
                          fontSize: "18px",
                          fontWeight: "600",
                          color: "white",
                          margin: 0,
                        }}
                      >
                        Frequency of Appearance
                      </label>
                      <p style={{
                        fontSize: "14px",
                        color: "rgba(154, 163, 178, 0.7)",
                        margin: "4px 0 0 0",
                      }}>
                        How often does this pain appear?
                      </p>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                      {[
                        { key: "first-time", label: "First time" },
                        { key: "rarely", label: "Rarely" },
                        { key: "often", label: "Often" },
                        { key: "always", label: "Always" }
                      ].map((option) => (
                        <button
                          key={option.key}
                          onClick={() => handlePainDetailChange("frequency", option.key)}
                          style={{
                            padding: "12px 16px",
                            borderRadius: "8px",
                            fontSize: "14px",
                            fontWeight: "500",
                            cursor: "pointer",
                            background: painDetails.frequency === option.key 
                              ? "linear-gradient(90deg, #00E0FF, #4A67FF)" 
                              : "#1E222D",
                            color: painDetails.frequency === option.key ? "white" : "rgba(154, 163, 178, 0.7)",
                            border: "none",
                            transition: "all 0.2s",
                          }}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Additional Slider Sections */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {[
                  { key: "technique", label: "Technique", description: "Quality of technical execution." },
                  { key: "tactics", label: "Tactics", description: "Quality of tactical decisions." },
                  { key: "dynamism", label: "Dynamism", description: "Level of energy and enthusiasm." },
                  { key: "nervousness", label: "Nervousness", description: "Level of stress and anxiety." },
                  { key: "concentration", label: "Concentration", description: "Ability to maintain focus." },
                  { key: "confidence", label: "Confidence", description: "Level of self-assurance." },
                  { key: "wellBeing", label: "Well-being", description: "Overall feeling of wellness." },
                  { key: "sleepQuality", label: "Sleep Quality", description: "Quality of rest during the last 24 hours." },
                ].map((section, index) => (
                  <div 
                    key={section.key} 
                    style={{
                      background: "#141A24",
                      borderRadius: "16px",
                      padding: "16px",
                      border: "1px solid rgba(0, 224, 255, 0.1)",
                      boxShadow: "inset 0 0 0 1px rgba(0, 224, 255, 0.1)",
                      animationDelay: `${50 * (index + 7)}ms`,
                    }}
                    className="card-animate"
                  >
                    <div style={{ marginBottom: "12px" }}>
                      <label 
                        htmlFor={section.key} 
                        style={{
                          fontSize: "18px",
                          fontWeight: "600",
                          color: "white",
                          margin: 0,
                        }}
                      >
                        {section.label}
                      </label>
                      <p style={{
                        fontSize: "14px",
                        color: "rgba(154, 163, 178, 0.7)",
                        margin: "4px 0 0 0",
                      }}>
                        {section.description}
                      </p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ color: "#9AA3B2" }}>
                        <path d="M18 12H6" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <input
                        type="range"
                        id={section.key}
                        min="0"
                        max="100"
                        value={sliderValues[section.key]}
                        onChange={(e) => handleSliderChange(section.key, parseInt(e.target.value))}
                        className="slider"
                      />
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ color: "#9AA3B2" }}>
                        <path d="M12 6v12M18 12H6" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </main>

            {/* Submit Button - Only show when scrolled to bottom */}
            {showSubmitButton && (
              <footer style={{ 
                paddingTop: "12px", 
                paddingBottom: "12px",
                position: "fixed",
                bottom: 0,
                left: 0,
                right: 0,
                background: "linear-gradient(to bottom, transparent, #0B0F1A 80%)",
                zIndex: 100,
                maxWidth: "384px",
                margin: "0 auto",
                animation: "slideUp 0.3s ease-out"
              }}>
                <div style={{ padding: "0 24px" }}>
                  <button 
                    onClick={handleSubmit}
                    style={{
                      width: "100%",
                      padding: "16px 0",
                      borderRadius: "12px",
                      fontSize: "16px",
                      fontWeight: "600",
                      cursor: "pointer",
                      background: "linear-gradient(90deg, #00E0FF, #4A67FF)",
                      color: "white",
                      border: "none",
                      boxShadow: "0 0 20px 5px rgba(0, 224, 255, 0.25)",
                      transition: "all 0.2s ease-out",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.filter = "brightness(1.25)";
                      e.target.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.filter = "brightness(1)";
                      e.target.style.transform = "translateY(0)";
                    }}
                    onMouseDown={(e) => {
                      e.target.style.transform = "translateY(2px)";
                      e.target.style.boxShadow = "0 0 10px 2px rgba(0, 224, 255, 0.15)";
                    }}
                    onMouseUp={(e) => {
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow = "0 0 20px 5px rgba(0, 224, 255, 0.25)";
                    }}
                  >
                    Submit
                  </button>
                </div>
              </footer>
            )}
          </div>
        </div>
      </MobileViewport>
    );
  }
}
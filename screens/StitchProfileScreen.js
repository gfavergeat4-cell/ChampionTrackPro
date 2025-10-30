import React, { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { Platform } from "react-native";
import MobileViewport from "../src/components/MobileViewport";
import { signOut } from "firebase/auth";
import { auth, db } from "../services/firebaseConfig";
import { CommonActions } from "@react-navigation/native";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import UnifiedAthleteNavigation from "../src/stitch_components/UnifiedAthleteNavigation";

export default function StitchProfileScreen() {
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    jerseyNumber: "",
    position: ""
  });
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const handleTabNavigation = (tab) => {
    console.log("Navigation vers:", tab);
    if (tab === "Home") {
      navigation.navigate("Home");
    } else if (tab === "Schedule") {
      navigation.navigate("Schedule");
    }
    // Profile est déjà actif, pas besoin de naviguer
  };

  const loadUserData = async () => {
    try {
      console.log("🔍 Loading user data...");
      if (!auth.currentUser) {
        console.log("❌ No authenticated user");
        setLoading(false);
        return;
      }

      console.log("👤 Current user:", auth.currentUser.uid);
      const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
      console.log("📄 User document exists:", userDoc.exists());
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        console.log("📊 User data:", data);
        setUserData(data);
        setFormData({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          jerseyNumber: data.jerseyNumber || "",
          position: data.position || ""
        });
        setProfileImage(data.profileImage || null);
      }
      setLoading(false);
    } catch (error) {
      console.error("❌ Error loading user data:", error);
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    console.log(`📝 ${field} changed:`, value);
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveChanges = async () => {
    try {
      console.log("💾 Saving changes...", formData);
      if (!auth.currentUser) {
        console.log("❌ No authenticated user");
        return;
      }

      console.log("🔍 User ID:", auth.currentUser.uid);
      console.log("🔍 Document path: users/" + auth.currentUser.uid);
      
      // Check if profileImage is too large
      if (profileImage && profileImage.length > 1000000) { // ~1MB limit
        console.log("⚠️ Image too large, compressing...");
        alert("Image is being compressed to fit the size limit...");
      }

      const updateData = {
        ...formData,
        profileImage: profileImage,
        updatedAt: new Date()
      };
      console.log("🔍 Update data:", updateData);

      await updateDoc(doc(db, "users", auth.currentUser.uid), updateData);

      console.log("✅ Profile updated successfully");
      setUserData(prev => ({ ...prev, ...formData }));
      setEditing(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("❌ Error updating profile:", error);
      console.error("❌ Error code:", error.code);
      console.error("❌ Error message:", error.message);
      alert(`Error updating profile: ${error.message}`);
    }
  };

  const compressImage = (file, maxWidth = 300, maxHeight = 300, quality = 0.8) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageUpload = () => {
    console.log("📸 Add Photo button clicked");
    
    // Create file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';
    
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        console.log("📸 File selected:", file.name, "Size:", file.size, "bytes");
        
        try {
          // Compress the image
          const compressedBase64 = await compressImage(file);
          console.log("📸 Image compressed successfully");
          
          setProfileImage(compressedBase64);
          console.log("📸 Image uploaded successfully");
          alert("Photo uploaded successfully!");
        } catch (error) {
          console.error("❌ Error compressing image:", error);
          alert("Error processing image. Please try a different image.");
        }
      }
    };
    
    // Trigger file selection
    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "AuthStack" }],
        })
      );
    } catch (error) {
      console.error("Error during logout:", error);
      alert("Logout failed.");
    }
  };

  if (Platform.OS === "web") {
    return (
      <MobileViewport>
        <div style={{
          width: "100%",
          maxWidth: "375px",
          height: "812px",
          backgroundColor: "#0A0F1A",
          overflow: "hidden",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          fontFamily: Platform.select({ web: "'Inter', sans-serif", default: "System" }),
          color: "white",
          pointerEvents: "auto"
        }}>
          {/* Background Gradient */}
          <div style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            background: "radial-gradient(circle at 50% 0%, rgba(0, 224, 255, 0.1) 0%, rgba(0, 0, 0, 0) 50%), radial-gradient(circle at 0% 100%, rgba(74, 103, 255, 0.1) 0%, rgba(0, 0, 0, 0) 50%)",
            zIndex: 0,
            pointerEvents: "none"
          }} />

          {/* Header */}
          <div style={{
            position: "relative",
            zIndex: 1,
            padding: "20px",
            textAlign: "center",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)"
          }}>
            <h1 style={{
              fontSize: "24px",
              fontWeight: "700",
              margin: "0",
              background: "linear-gradient(135deg, #00E0FF 0%, #4A67FF 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text"
            }}>
              Profile
            </h1>
          </div>

          {/* Main Content */}
          <div style={{
            position: "relative",
            zIndex: 1,
            flex: 1,
            padding: "20px",
            overflowY: "auto"
          }}>
            {loading ? (
              <div style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "200px"
              }}>
                <div style={{
                  fontSize: "16px",
                  color: "#9AA3B2"
                }}>
                  Loading profile...
                </div>
              </div>
            ) : (
              <div>
                {/* Profile Picture Section */}
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  marginBottom: "30px"
                }}>
                  <div style={{
                    width: "120px",
                    height: "120px",
                    borderRadius: "50%",
                    border: "3px solid #00E0FF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "15px",
                    background: "linear-gradient(135deg, #00E0FF 0%, #4A67FF 100%)",
                    boxShadow: "0 0 20px rgba(0, 224, 255, 0.3)"
                  }}>
                    {profileImage ? (
                      <img 
                        src={profileImage} 
                        alt="Profile" 
                        style={{
                          width: "100%",
                          height: "100%",
                          borderRadius: "50%",
                          objectFit: "cover"
                        }}
                      />
                    ) : (
                      <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" fill="white"/>
                        <path d="M12 14C7.58172 14 4 17.5817 4 22H20C20 17.5817 16.4183 14 12 14Z" fill="white"/>
                      </svg>
                    )}
                  </div>
                  <button
                    onClick={handleImageUpload}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "20px",
                      background: "rgba(0, 224, 255, 0.1)",
                      border: "1px solid rgba(0, 224, 255, 0.3)",
                      color: "#00E0FF",
                      fontSize: "14px",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      pointerEvents: "auto"
                    }}
                  >
                    {profileImage ? "Change Photo" : "Add Photo"}
                  </button>
                </div>

                {/* User Information Form */}
            <div style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px"
                }}>
                  {/* First Name */}
                  <div>
                    <label style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "600",
                      marginBottom: "8px",
                      color: "#9AA3B2"
                    }}>
                      First Name
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      disabled={!editing}
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        borderRadius: "8px",
                        background: editing ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.02)",
                        border: editing ? "1px solid rgba(0, 224, 255, 0.3)" : "1px solid rgba(255, 255, 255, 0.1)",
                        color: "white",
                        fontSize: "16px",
                        cursor: editing ? "text" : "default",
                        transition: "all 0.3s ease",
                        pointerEvents: "auto"
                      }}
                      placeholder="Enter your first name"
                    />
                  </div>

                  {/* Last Name */}
                  <div>
                    <label style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "600",
                      marginBottom: "8px",
                      color: "#9AA3B2"
                    }}>
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      disabled={!editing}
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        borderRadius: "8px",
                        background: editing ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.02)",
                        border: editing ? "1px solid rgba(0, 224, 255, 0.3)" : "1px solid rgba(255, 255, 255, 0.1)",
                        color: "white",
                        fontSize: "16px",
                        cursor: editing ? "text" : "default",
                        transition: "all 0.3s ease",
                        pointerEvents: "auto"
                      }}
                      placeholder="Enter your last name"
                    />
                  </div>

                  {/* Jersey Number */}
                  <div>
                    <label style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "600",
                      marginBottom: "8px",
              color: "#9AA3B2"
            }}>
                      Jersey Number
                    </label>
                    <input
                      type="text"
                      value={formData.jerseyNumber}
                      onChange={(e) => handleInputChange('jerseyNumber', e.target.value)}
                      disabled={!editing}
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        borderRadius: "8px",
                        background: editing ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.02)",
                        border: editing ? "1px solid rgba(0, 224, 255, 0.3)" : "1px solid rgba(255, 255, 255, 0.1)",
                        color: "white",
                        fontSize: "16px",
                        cursor: editing ? "text" : "default",
                        transition: "all 0.3s ease",
                        pointerEvents: "auto"
                      }}
                      placeholder="Enter jersey number"
                    />
                  </div>

                  {/* Position */}
                  <div>
                    <label style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "600",
                      marginBottom: "8px",
                      color: "#9AA3B2"
                    }}>
                      Playing Position
                    </label>
                    <select
                      value={formData.position}
                      onChange={(e) => handleInputChange('position', e.target.value)}
                      disabled={!editing}
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        borderRadius: "8px",
                        background: editing ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.02)",
                        border: editing ? "1px solid rgba(0, 224, 255, 0.3)" : "1px solid rgba(255, 255, 255, 0.1)",
                        color: "white",
                        fontSize: "16px",
                        cursor: editing ? "pointer" : "not-allowed",
                        transition: "all 0.3s ease",
                        pointerEvents: "auto"
                      }}
                    >
                      <option value="">Select position</option>
                      <option value="Goalkeeper">Goalkeeper</option>
                      <option value="Defender">Defender</option>
                      <option value="Midfielder">Midfielder</option>
                      <option value="Forward">Forward</option>
                    </select>
              </div>
            </div>

                {/* Action Buttons */}
                <div style={{
                  marginTop: "30px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px"
                }}>
                  {!editing ? (
                    <button
                      onClick={() => {
                        console.log("✏️ Edit button clicked");
                        console.log("📊 Current userData:", userData);
                        console.log("📝 Current formData:", formData);
                        setEditing(true);
                      }}
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        borderRadius: "8px",
                        background: "linear-gradient(135deg, #00E0FF 0%, #4A67FF 100%)",
                        border: "none",
                        color: "white",
                        fontSize: "16px",
                        fontWeight: "600",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        pointerEvents: "auto"
                      }}
                    >
                      Edit Profile
                    </button>
                  ) : (
                    <div style={{
                      display: "flex",
                      gap: "12px"
                    }}>
                      <button
                        onClick={handleSaveChanges}
                        style={{
                          flex: 1,
                          padding: "12px 16px",
                          borderRadius: "8px",
                          background: "linear-gradient(135deg, #00E0FF 0%, #4A67FF 100%)",
                          border: "none",
                          color: "white",
                          fontSize: "16px",
                          fontWeight: "600",
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                        pointerEvents: "auto"
                        }}
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={() => {
                          setEditing(false);
                          setFormData({
                            firstName: userData?.firstName || "",
                            lastName: userData?.lastName || "",
                            jerseyNumber: userData?.jerseyNumber || "",
                            position: userData?.position || ""
                          });
                        }}
                        style={{
                          flex: 1,
                          padding: "12px 16px",
                          borderRadius: "8px",
                          background: "rgba(255, 255, 255, 0.1)",
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                          color: "white",
                          fontSize: "16px",
                          fontWeight: "600",
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                        pointerEvents: "auto"
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  )}

              <button
                onClick={handleLogout}
                style={{
                  width: "100%",
                      padding: "12px 16px",
                      borderRadius: "8px",
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  color: "#EF4444",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                      pointerEvents: "auto"
                }}
              >
                Log out
              </button>
            </div>
              </div>
            )}
          </div>

          {/* Navigation unifiée pour les athlètes */}
          <UnifiedAthleteNavigation 
            activeTab="Profile" 
            onNavigate={handleTabNavigation} 
          />
        </div>
      </MobileViewport>
    );
  }

  return null;
}
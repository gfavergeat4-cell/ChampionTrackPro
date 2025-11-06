import React, { useState, useEffect } from "react";
import { View, Text, Pressable, StyleSheet, Dimensions, Platform, ScrollView, TextInput, Modal } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { collection, getDocs, doc, getDoc, addDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../../services/firebaseConfig";
import { tokens } from "../theme/tokens";

interface Team {
  id: string;
  name: string;
  coach: string;
  athlete: string;
  members: number;
  timeZone: string;
  status: string;
  icsUrl?: string;
}

export default function AdminDashboardNew() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [calendarUrl, setCalendarUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');

  // Load teams
  useEffect(() => {
    const loadTeams = async () => {
      try {
        const teamsSnapshot = await getDocs(collection(db, "teams"));
        const teamsData = teamsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Team));
        setTeams(teamsData);
      } catch (error) {
        console.error("Error loading teams:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTeams();
  }, []);

  const generateTeamCodes = () => {
    const coachCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const athleteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    return { coachCode, athleteCode };
  };

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) return;

    try {
      const { coachCode, athleteCode } = generateTeamCodes();
      
      const teamData = {
        name: newTeamName.trim(),
        coach: coachCode,
        athlete: athleteCode,
        members: 0,
        timeZone: 'Europe/Paris',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await addDoc(collection(db, "teams"), teamData);
      
      setTeams(prev => [...prev, { id: '', ...teamData }]);
      setNewTeamName('');
      setShowCreateModal(false);
    } catch (error) {
      console.error("Error creating team:", error);
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    try {
      await deleteDoc(doc(db, "teams", teamId));
      setTeams(prev => prev.filter(team => team.id !== teamId));
    } catch (error) {
      console.error("Error deleting team:", error);
    }
  };

  const handleImportCalendar = async () => {
    if (!selectedTeam || !calendarUrl.trim()) return;

    try {
      setIsImporting(true);
      
      // Update team with calendar URL
      await updateDoc(doc(db, "teams", selectedTeam.id), {
        icsUrl: calendarUrl.trim(),
        updatedAt: new Date().toISOString()
      });

      // Call import API
      const response = await fetch('http://localhost:3001/api/import-ics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teamId: selectedTeam.id,
          icsUrl: calendarUrl.trim()
        })
      });

      const result = await response.json();
      
      if (result.ok) {
        alert(`✅ Calendar imported for ${selectedTeam.name}\n\n${result.processed} events processed\n• ${result.created} new\n• ${result.updated} updated\n• ${result.skipped} unchanged`);
      } else {
        alert(`⚠️ Error: ${result.error}`);
      }
      
      setShowCalendarModal(false);
      setCalendarUrl('');
      setSelectedTeam(null);
    } catch (error) {
      console.error("Import error:", error);
      alert("Error importing calendar");
    } finally {
      setIsImporting(false);
    }
  };

  const handleViewDetails = (team: Team) => {
    // Navigate to team details
    console.log("View details for team:", team.id);
  };

  if (loading) {
    return (
      <LinearGradient colors={[tokens.colors.bg, tokens.colors.bgSecondary]} style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading teams...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[tokens.colors.bg, tokens.colors.bgSecondary]} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Admin Dashboard</Text>
            <Text style={styles.headerSubtitle}>Team Management</Text>
          </View>
          <Pressable style={styles.logoutButton}>
            <Text style={styles.logoutText}>Logout</Text>
          </Pressable>
        </View>
      </View>

      {/* Create Team Button */}
      <View style={styles.createSection}>
        <Pressable
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <LinearGradient
            colors={tokens.gradients.primary}
            style={styles.createButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.createButtonText}>+ Create New Team</Text>
          </LinearGradient>
        </Pressable>
      </View>

      {/* Teams List */}
      <ScrollView style={styles.teamsList} showsVerticalScrollIndicator={false}>
        {teams.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No teams created yet</Text>
            <Text style={styles.emptySubtext}>Create your first team to get started</Text>
          </View>
        ) : (
          teams.map((team) => (
            <View key={team.id} style={styles.teamCard}>
              <View style={styles.teamHeader}>
                <Text style={styles.teamName}>{team.name}</Text>
                <View style={styles.teamStatus}>
                  <View style={[styles.statusDot, { backgroundColor: tokens.colors.success }]} />
                  <Text style={styles.statusText}>{team.status}</Text>
                </View>
              </View>
              
              <View style={styles.teamInfo}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Members:</Text>
                  <Text style={styles.infoValue}>{team.members}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Timezone:</Text>
                  <Text style={styles.infoValue}>{team.timeZone}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Coach Code:</Text>
                  <Text style={styles.infoValue}>{team.coach}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Athlete Code:</Text>
                  <Text style={styles.infoValue}>{team.athlete}</Text>
                </View>
              </View>

              <View style={styles.teamActions}>
                <Pressable
                  style={styles.actionButton}
                  onPress={() => {
                    setSelectedTeam(team);
                    setShowCalendarModal(true);
                  }}
                >
                  <Text style={styles.actionButtonText}>📅 Import Calendar</Text>
                </Pressable>
                
                <Pressable
                  style={[styles.actionButton, styles.detailsButton]}
                  onPress={() => handleViewDetails(team)}
                >
                  <Text style={[styles.actionButtonText, styles.detailsButtonText]}>📋 View Details</Text>
                </Pressable>
              </View>

              <Pressable
                style={styles.deleteButton}
                onPress={() => handleDeleteTeam(team.id)}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </Pressable>
            </View>
          ))
        )}
      </ScrollView>

      {/* Create Team Modal */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Team</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Team Name"
              placeholderTextColor={tokens.colors.textSecondary}
              value={newTeamName}
              onChangeText={setNewTeamName}
            />
            <View style={styles.modalActions}>
              <Pressable
                style={styles.modalButton}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleCreateTeam}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextPrimary]}>Create</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Calendar Import Modal */}
      <Modal
        visible={showCalendarModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCalendarModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Import Calendar</Text>
            <Text style={styles.modalSubtitle}>
              Enter the public URL of your Google Calendar
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="https://calendar.google.com/calendar/ical/..."
              placeholderTextColor={tokens.colors.textSecondary}
              value={calendarUrl}
              onChangeText={setCalendarUrl}
              multiline
            />
            <View style={styles.modalActions}>
              <Pressable
                style={styles.modalButton}
                onPress={() => setShowCalendarModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalButtonPrimary, isImporting && styles.modalButtonDisabled]}
                onPress={handleImportCalendar}
                disabled={isImporting}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextPrimary]}>
                  {isImporting ? 'Importing...' : 'Import'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.bg,
    paddingTop: Platform.OS === 'web' ? 60 : 0,
  },
  
  header: {
    paddingHorizontal: tokens.spacing.xl,
    paddingTop: tokens.spacing.xl,
    paddingBottom: tokens.spacing.lg,
  },
  
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  headerTitle: {
    fontSize: tokens.fontSizes.xxxl,
    fontWeight: tokens.fontWeights.bold,
    color: tokens.colors.text,
    fontFamily: tokens.typography.ui,
    marginBottom: tokens.spacing.xs,
  },
  
  headerSubtitle: {
    fontSize: tokens.fontSizes.md,
    color: tokens.colors.textSecondary,
    fontFamily: tokens.typography.ui,
  },
  
  logoutButton: {
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.md,
    borderRadius: tokens.radii.md,
    backgroundColor: tokens.colors.surface,
    borderWidth: 1,
    borderColor: tokens.colors.surfaceHover,
  },
  
  logoutText: {
    fontSize: tokens.fontSizes.sm,
    color: tokens.colors.text,
    fontFamily: tokens.typography.ui,
    fontWeight: tokens.fontWeights.medium,
  },
  
  createSection: {
    paddingHorizontal: tokens.spacing.xl,
    marginBottom: tokens.spacing.xl,
  },
  
  createButton: {
    borderRadius: tokens.radii.lg,
    overflow: 'hidden',
    ...tokens.shadows.button,
  },
  
  createButtonGradient: {
    paddingVertical: tokens.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  createButtonText: {
    fontSize: tokens.fontSizes.lg,
    fontWeight: tokens.fontWeights.bold,
    color: tokens.colors.text,
    fontFamily: tokens.typography.ui,
  },
  
  teamsList: {
    flex: 1,
    paddingHorizontal: tokens.spacing.xl,
  },
  
  teamCard: {
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.radii.lg,
    padding: tokens.spacing.xl,
    marginBottom: tokens.spacing.lg,
    borderWidth: 1,
    borderColor: tokens.colors.surfaceHover,
    ...tokens.shadows.card,
  },
  
  teamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacing.lg,
  },
  
  teamName: {
    fontSize: tokens.fontSizes.xl,
    fontWeight: tokens.fontWeights.bold,
    color: tokens.colors.text,
    fontFamily: tokens.typography.ui,
  },
  
  teamStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: tokens.radii.full,
    marginRight: tokens.spacing.sm,
  },
  
  statusText: {
    fontSize: tokens.fontSizes.sm,
    color: tokens.colors.textSecondary,
    fontFamily: tokens.typography.ui,
    textTransform: 'capitalize',
  },
  
  teamInfo: {
    marginBottom: tokens.spacing.lg,
  },
  
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacing.sm,
  },
  
  infoLabel: {
    fontSize: tokens.fontSizes.sm,
    color: tokens.colors.textSecondary,
    fontFamily: tokens.typography.ui,
  },
  
  infoValue: {
    fontSize: tokens.fontSizes.sm,
    color: tokens.colors.text,
    fontFamily: tokens.typography.ui,
    fontWeight: tokens.fontWeights.medium,
  },
  
  teamActions: {
    flexDirection: 'row',
    gap: tokens.spacing.md,
    marginBottom: tokens.spacing.lg,
  },
  
  actionButton: {
    flex: 1,
    paddingVertical: tokens.spacing.md,
    paddingHorizontal: tokens.spacing.lg,
    borderRadius: tokens.radii.md,
    backgroundColor: tokens.colors.primary,
    alignItems: 'center',
    ...tokens.shadows.button,
  },
  
  detailsButton: {
    backgroundColor: tokens.colors.surfaceHover,
  },
  
  actionButtonText: {
    fontSize: tokens.fontSizes.sm,
    fontWeight: tokens.fontWeights.semibold,
    color: tokens.colors.text,
    fontFamily: tokens.typography.ui,
  },
  
  detailsButtonText: {
    color: tokens.colors.textSecondary,
  },
  
  deleteButton: {
    alignSelf: 'center',
    paddingVertical: tokens.spacing.sm,
    paddingHorizontal: tokens.spacing.lg,
    borderRadius: tokens.radii.md,
    backgroundColor: tokens.colors.danger,
  },
  
  deleteButtonText: {
    fontSize: tokens.fontSizes.sm,
    fontWeight: tokens.fontWeights.medium,
    color: tokens.colors.text,
    fontFamily: tokens.typography.ui,
  },
  
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: tokens.spacing.xxxl,
  },
  
  emptyText: {
    fontSize: tokens.fontSizes.xl,
    color: tokens.colors.text,
    fontFamily: tokens.typography.ui,
    fontWeight: tokens.fontWeights.medium,
    marginBottom: tokens.spacing.sm,
  },
  
  emptySubtext: {
    fontSize: tokens.fontSizes.md,
    color: tokens.colors.textSecondary,
    fontFamily: tokens.typography.ui,
    textAlign: 'center',
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  loadingText: {
    fontSize: tokens.fontSizes.lg,
    color: tokens.colors.textSecondary,
    fontFamily: tokens.typography.ui,
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.xl,
  },
  
  modalContent: {
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.radii.xl,
    padding: tokens.spacing.xl,
    width: '100%',
    maxWidth: 400,
    ...tokens.shadows.card,
  },
  
  modalTitle: {
    fontSize: tokens.fontSizes.xl,
    fontWeight: tokens.fontWeights.bold,
    color: tokens.colors.text,
    fontFamily: tokens.typography.ui,
    marginBottom: tokens.spacing.lg,
    textAlign: 'center',
  },
  
  modalSubtitle: {
    fontSize: tokens.fontSizes.sm,
    color: tokens.colors.textSecondary,
    fontFamily: tokens.typography.ui,
    marginBottom: tokens.spacing.lg,
    textAlign: 'center',
  },
  
  modalInput: {
    backgroundColor: tokens.colors.bgSecondary,
    borderRadius: tokens.radii.md,
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.md,
    fontSize: tokens.fontSizes.md,
    color: tokens.colors.text,
    fontFamily: tokens.typography.ui,
    borderWidth: 1,
    borderColor: tokens.colors.surfaceHover,
    marginBottom: tokens.spacing.xl,
  },
  
  modalActions: {
    flexDirection: 'row',
    gap: tokens.spacing.md,
  },
  
  modalButton: {
    flex: 1,
    paddingVertical: tokens.spacing.md,
    paddingHorizontal: tokens.spacing.lg,
    borderRadius: tokens.radii.md,
    backgroundColor: tokens.colors.surfaceHover,
    alignItems: 'center',
  },
  
  modalButtonPrimary: {
    backgroundColor: tokens.colors.primary,
    ...tokens.shadows.button,
  },
  
  modalButtonDisabled: {
    opacity: 0.6,
  },
  
  modalButtonText: {
    fontSize: tokens.fontSizes.md,
    fontWeight: tokens.fontWeights.medium,
    color: tokens.colors.text,
    fontFamily: tokens.typography.ui,
  },
  
  modalButtonTextPrimary: {
    color: tokens.colors.text,
    fontWeight: tokens.fontWeights.semibold,
  },
});



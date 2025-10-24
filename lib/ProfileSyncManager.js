// ==================== FILE 1: lib/ProfileSyncManager.js ====================

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import NetInfo from '@react-native-community/netinfo';
import { decode } from 'base64-arraybuffer';

// ==================== OFFLINE QUEUE MANAGER ====================

export class OfflineQueueManager {
  static QUEUE_KEY = 'profile_sync_queue';

  static async addToQueue(operation) {
    try {
      const queue = await this.getQueue();
      queue.push({
        ...operation,
        id: Date.now().toString(),
        timestamp: Date.now(),
      });
      await AsyncStorage.setItem(this.QUEUE_KEY, JSON.stringify(queue));
      console.log('✓ Operation queued:', operation.type);
    } catch (error) {
      console.error('Error adding to queue:', error);
    }
  }

  static async getQueue() {
    try {
      const queueData = await AsyncStorage.getItem(this.QUEUE_KEY);
      return queueData ? JSON.parse(queueData) : [];
    } catch (error) {
      console.error('Error getting queue:', error);
      return [];
    }
  }

  static async removeFromQueue(operationId) {
    try {
      const queue = await this.getQueue();
      const filtered = queue.filter(op => op.id !== operationId);
      await AsyncStorage.setItem(this.QUEUE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error removing from queue:', error);
    }
  }

  static async clearQueue() {
    try {
      await AsyncStorage.setItem(this.QUEUE_KEY, JSON.stringify([]));
    } catch (error) {
      console.error('Error clearing queue:', error);
    }
  }

  static async getQueueCount() {
    const queue = await this.getQueue();
    return queue.length;
  }
}

// ==================== CONNECTIVITY HANDLER ====================

export class ConnectivityHandler {
  static listeners = [];

  static async isOnline() {
    try {
      const state = await NetInfo.fetch();
      return state.isConnected && state.isInternetReachable;
    } catch (error) {
      console.error('Error checking connectivity:', error);
      return false;
    }
  }

  static startListening(callback) {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected && state.isInternetReachable) {
        console.log('✓ Connection restored - triggering sync');
        callback();
      } else {
        console.log('✗ Connection lost - offline mode');
      }
    });
    this.listeners.push(unsubscribe);
    return unsubscribe;
  }

  static stopListening() {
    this.listeners.forEach(unsubscribe => unsubscribe());
    this.listeners = [];
  }
}

// ==================== PROFILE SYNC SERVICE ====================

export class ProfileSyncService {
  static isSyncing = false;

  static async syncPendingOperations(supabase, onSyncComplete = null) {
    if (this.isSyncing) {
      console.log('Sync already in progress, skipping...');
      return;
    }

    const isOnline = await ConnectivityHandler.isOnline();
    if (!isOnline) {
      console.log('Device is offline, skipping sync');
      return;
    }

    const queue = await OfflineQueueManager.getQueue();
    if (queue.length === 0) {
      console.log('No pending operations to sync');
      return;
    }

    this.isSyncing = true;
    console.log(`⟳ Syncing ${queue.length} pending operation(s)...`);

    let successCount = 0;
    let failCount = 0;

    for (const operation of queue) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          console.warn('No session available for sync, stopping...');
          break;
        }

        const userId = session.user.id;
        let success = false;

        switch (operation.type) {
          case 'upload_picture':
            success = await this.syncUploadPicture(supabase, userId, operation);
            break;
          case 'remove_picture':
            success = await this.syncRemovePicture(supabase, userId, operation);
            break;
          case 'update_username':
            success = await this.syncUpdateUsername(supabase, userId, operation);
            break;
        }

        if (success) {
          await OfflineQueueManager.removeFromQueue(operation.id);
          successCount++;
          console.log(`✓ Synced: ${operation.type}`);
        } else {
          failCount++;
        }
      } catch (error) {
        console.error(`✗ Error syncing ${operation.type}:`, error);
        failCount++;
      }
    }

    this.isSyncing = false;
    console.log(`Sync complete: ${successCount} succeeded, ${failCount} failed`);

    if (onSyncComplete) {
      onSyncComplete({ successCount, failCount });
    }
  }

  static async syncUploadPicture(supabase, userId, operation) {
    const { fileUri, previousImageKey } = operation.data;

    // Check if file still exists locally
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (!fileInfo.exists) {
      console.warn('File no longer exists locally, skipping upload');
      return true; // Remove from queue anyway
    }

    try {
      // Delete previous image if exists
      if (previousImageKey) {
        try {
          await supabase.storage
            .from("profile-pics")
            .remove([previousImageKey]);
          console.log('✓ Deleted old profile picture');
        } catch (error) {
          console.warn('Error deleting previous image:', error);
        }
      }

      // Upload new image
      const base64 = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const fileData = decode(base64);

      const { error: uploadError } = await supabase.storage
        .from("profile-pics")
        .upload(`user_${userId}.jpg`, fileData, {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (uploadError) {
        console.error('Upload failed:', uploadError.message);
        return false;
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from("profile-pics")
        .getPublicUrl(`user_${userId}.jpg`);

      const imageUrl = publicUrlData?.publicUrl;

      if (imageUrl) {
        // Add timestamp to URL to bust cache
        const timestampedUrl = `${imageUrl}?t=${Date.now()}`;
        await AsyncStorage.setItem("profileImageUrl", timestampedUrl);
        await supabase.from("profiles").update({ picture: timestampedUrl }).eq("id", userId);
        console.log('✓ Profile picture uploaded and database updated');
      }

      return true;
    } catch (error) {
      console.error('Error in syncUploadPicture:', error);
      return false;
    }
  }

  static async syncRemovePicture(supabase, userId, operation) {
    const { previousImageKey } = operation.data;

    try {
      // Delete from storage
      if (previousImageKey) {
        const { error: deleteError } = await supabase
          .storage
          .from("profile-pics")
          .remove([previousImageKey]);
        
        if (deleteError) {
          console.error('Error deleting from storage:', deleteError.message);
          return false;
        }
      }

      // Update database
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ picture: null })
        .eq("id", userId);

      if (updateError) {
        console.error('Error updating profile:', updateError.message);
        return false;
      }

      console.log('✓ Profile picture removed from storage and database');
      return true;
    } catch (error) {
      console.error('Error in syncRemovePicture:', error);
      return false;
    }
  }

  static async syncUpdateUsername(supabase, userId, operation) {
    const { username } = operation.data;

    try {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ name: username })
        .eq("id", userId);

      if (updateError) {
        console.error('Error updating username:', updateError.message);
        return false;
      }

      console.log('✓ Username updated in database');
      return true;
    } catch (error) {
      console.error('Error in syncUpdateUsername:', error);
      return false;
    }
  }
}

// ==================== PROFILE MANAGER ====================

export class ProfileManager {
  constructor(supabase, setProfileImage, setUsername, setUser, setPendingSync) {
    this.supabase = supabase;
    this.setProfileImage = setProfileImage;
    this.setUsername = setUsername;
    this.setUser = setUser;
    this.setPendingSync = setPendingSync;
    this.syncListener = null;
    
    // Start listening for connectivity changes
    this.startSyncListener();
    
    // Check pending operations on init
    this.updatePendingSyncCount();
  }

  startSyncListener() {
    this.syncListener = ConnectivityHandler.startListening(() => {
      this.syncPendingOperations();
    });
  }

  async updatePendingSyncCount() {
    if (this.setPendingSync) {
      const count = await OfflineQueueManager.getQueueCount();
      this.setPendingSync(count);
    }
  }

  async syncPendingOperations() {
    await ProfileSyncService.syncPendingOperations(this.supabase, (result) => {
      this.updatePendingSyncCount();
      if (result.successCount > 0) {
        console.log(`✓ Successfully synced ${result.successCount} operation(s)`);
      }
    });
  }

  async handleImagePick(source, ImagePicker, Alert, setShowPhotoOptions) {
    try {
      let result;

      if (source === "camera") {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Error", "Camera permission is required!");
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Error", "Gallery permission is required!");
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets && result.assets[0]) {
        const imageUri = result.assets[0].uri;

        // Get previous image key for deletion
        const user = await AsyncStorage.getItem("user");
        const userData = JSON.parse(user);
        const userId = userData.id || userData.user?.id;

        if (!userId) {
          Alert.alert("Error", "User ID not found");
          return;
        }

        const previousImageUrl = await AsyncStorage.getItem("profileImageUrl");
        let previousImageKey = null;
        if (previousImageUrl) {
          previousImageKey = `user_${userId}.jpg`;
        }

        // Save locally first (offline-first approach)
        const fileName = `profile_${Date.now()}.jpg`;
        const fileUri = `${FileSystem.documentDirectory}${fileName}`;
        await FileSystem.copyAsync({ from: imageUri, to: fileUri });
        await AsyncStorage.setItem("profileImage", fileUri);

        // Update UI immediately
        this.setProfileImage(fileUri);

        // Check if online
        const isOnline = await ConnectivityHandler.isOnline();

        if (isOnline) {
          // Try to upload immediately
          const { data: { session } } = await this.supabase.auth.getSession();
          if (!session) {
            Alert.alert("Saved Locally", "Image saved. Will sync when logged in.");
            await OfflineQueueManager.addToQueue({
              type: 'upload_picture',
              data: { fileUri, previousImageKey }
            });
            this.updatePendingSyncCount();
            return;
          }

          try {
            // Delete previous image
            if (previousImageKey) {
              await this.supabase.storage
                .from("profile-pics")
                .remove([previousImageKey]);
            }

            // Upload new image
            const base64 = await FileSystem.readAsStringAsync(fileUri, {
              encoding: FileSystem.EncodingType.Base64,
            });
            const fileData = decode(base64);

            const { error } = await this.supabase.storage
              .from("profile-pics")
              .upload(`user_${userId}.jpg`, fileData, {
                contentType: "image/jpeg",
                upsert: true,
              });

            if (error) throw error;

            const { data: publicUrlData } = this.supabase.storage
              .from("profile-pics")
              .getPublicUrl(`user_${userId}.jpg`);

            const imageUrl = publicUrlData?.publicUrl;

            if (imageUrl) {
              const timestampedUrl = `${imageUrl}?t=${Date.now()}`;
              await AsyncStorage.setItem("profileImageUrl", timestampedUrl);
              await this.supabase.from("profiles").update({ picture: timestampedUrl }).eq("id", userId);
              Alert.alert("Success", "Profile photo updated!");
            }
          } catch (error) {
            console.error("Upload failed, queuing:", error);
            await OfflineQueueManager.addToQueue({
              type: 'upload_picture',
              data: { fileUri, previousImageKey }
            });
            this.updatePendingSyncCount();
            Alert.alert("Saved Locally", "Image will sync when connection restores.");
          }
        } else {
          // Queue for later
          await OfflineQueueManager.addToQueue({
            type: 'upload_picture',
            data: { fileUri, previousImageKey }
          });
          this.updatePendingSyncCount();
          Alert.alert("Saved Locally", "Image will sync when connection restores.");
        }
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image.");
    } finally {
      setShowPhotoOptions(false);
    }
  }

  async handleRemovePhoto(Alert, setShowPhotoOptions) {
    try {
      // Get user info before removing
      const user = await AsyncStorage.getItem("user");
      const userData = JSON.parse(user);
      const userId = userData.id || userData.user?.id;
      
      const previousImageKey = userId ? `user_${userId}.jpg` : null;

      // Remove locally first (offline-first approach)
      this.setProfileImage(null);
      await AsyncStorage.removeItem("profileImage");
      await AsyncStorage.removeItem("profileImageUrl");

      // Check if online
      const isOnline = await ConnectivityHandler.isOnline();

      if (isOnline) {
        const { data: { session } } = await this.supabase.auth.getSession();
        if (!session) {
          Alert.alert("Photo Removed", "Local photo removed. Will sync when logged in.");
          if (userId) {
            await OfflineQueueManager.addToQueue({
              type: 'remove_picture',
              data: { previousImageKey }
            });
            this.updatePendingSyncCount();
          }
          return;
        }

        try {
          if (userId && previousImageKey) {
            // Delete from storage
            const { error: deleteError } = await this.supabase
              .storage
              .from("profile-pics")
              .remove([previousImageKey]);
            
            if (deleteError) throw deleteError;

            // Update database
            await this.supabase
              .from("profiles")
              .update({ picture: null })
              .eq("id", userId);
          }

          Alert.alert("Success", "Profile photo removed!");
        } catch (error) {
          console.error("Remove failed, queuing:", error);
          if (userId) {
            await OfflineQueueManager.addToQueue({
              type: 'remove_picture',
              data: { previousImageKey }
            });
            this.updatePendingSyncCount();
          }
          Alert.alert("Removed Locally", "Will sync when connection restores.");
        }
      } else {
        // Queue for later
        if (userId) {
          await OfflineQueueManager.addToQueue({
            type: 'remove_picture',
            data: { previousImageKey }
          });
          this.updatePendingSyncCount();
        }
        Alert.alert("Removed Locally", "Will sync when connection restores.");
      }
    } catch (error) {
      console.error("Error removing photo:", error);
      Alert.alert("Error", "Failed to remove photo");
    } finally {
      setShowPhotoOptions(false);
    }
  }

  async handleUpdateUsername(newUsername, Alert, t, setShowUsernameModal, setNewUsername, setLoading) {
    if (!newUsername.trim()) {
      Alert.alert(t.error, "Username cannot be empty");
      return false;
    }

    setLoading(true);

    try {
      // Update locally first (offline-first approach)
      const user = await AsyncStorage.getItem("user");
      const userData = JSON.parse(user);

      const updatedUser = {
        ...userData,
        name: newUsername.trim(),
      };

      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
      this.setUser(updatedUser);
      this.setUsername(newUsername.trim());

      // Check if online
      const isOnline = await ConnectivityHandler.isOnline();

      if (isOnline) {
        const { data: { session } } = await this.supabase.auth.getSession();
        if (!session) {
          Alert.alert(t.success, "Username updated locally. Will sync when logged in.");
          await OfflineQueueManager.addToQueue({
            type: 'update_username',
            data: { username: newUsername.trim() }
          });
          this.updatePendingSyncCount();
          setShowUsernameModal(false);
          setNewUsername("");
          return true;
        }

        try {
          const userId = session.user.id;

          const { error: updateError } = await this.supabase
            .from("profiles")
            .update({ name: newUsername.trim() })
            .eq("id", userId);

          if (updateError) throw updateError;

          Alert.alert(t.success, t.usernameUpdated);
        } catch (error) {
          console.error("Update failed, queuing:", error);
          await OfflineQueueManager.addToQueue({
            type: 'update_username',
            data: { username: newUsername.trim() }
          });
          this.updatePendingSyncCount();
          Alert.alert(t.success, "Username updated locally. Will sync when connection restores.");
        }
      } else {
        // Queue for later
        await OfflineQueueManager.addToQueue({
          type: 'update_username',
          data: { username: newUsername.trim() }
        });
        this.updatePendingSyncCount();
        Alert.alert(t.success, "Username updated locally. Will sync when connection restores.");
      }

      setShowUsernameModal(false);
      setNewUsername("");
      return true;
    } catch (error) {
      console.error("Error updating username:", error);
      Alert.alert(t.error, "Failed to update username");
      return false;
    } finally {
      setLoading(false);
    }
  }

  cleanup() {
    if (this.syncListener) {
      this.syncListener();
    }
    ConnectivityHandler.stopListening();
  }
}
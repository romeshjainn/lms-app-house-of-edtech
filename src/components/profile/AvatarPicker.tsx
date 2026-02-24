import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { COLORS, FONTS } from '@/constants';
import { FONT_SIZES, SHADOWS, SPACING } from '@/theme';

const AVATAR_SIZE = 96;
const BADGE_SIZE = 28;

interface AvatarPickerProps {
  uri: string | null;
  onPick: (uri: string) => void;
  onRemove: () => void;
}

export function AvatarPicker({ uri, onPick, onRemove }: AvatarPickerProps) {
  async function handlePick() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        'Permission required',
        'Please allow access to your photo library to choose a profile picture.',
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      onPick(result.assets[0].uri);
    }
  }

  function handleRemove() {
    Alert.alert('Remove photo', 'Are you sure you want to remove your profile picture?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: onRemove },
    ]);
  }

  return (
    <View style={styles.container}>
      <View style={styles.avatarWrapper}>
        {uri ? (
          <>
            <Image source={{ uri }} style={styles.avatar} />
            <TouchableOpacity
              style={[styles.badge, styles.badgeRemove]}
              onPress={handleRemove}
              activeOpacity={0.8}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Ionicons name="close" size={14} color={COLORS.WHITE} />
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="person" size={40} color={COLORS.GRAY_300} />
          </View>
        )}

        <TouchableOpacity
          style={[styles.badge, styles.badgeCamera]}
          onPress={handlePick}
          activeOpacity={0.8}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Ionicons name="camera" size={14} color={COLORS.WHITE} />
        </TouchableOpacity>
      </View>

      <Text style={styles.hint}>
        {uri ? 'Tap the camera to change' : 'Add a profile photo (optional)'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: SPACING.SM,
  },
  avatarWrapper: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    position: 'relative',
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 2,
    borderColor: COLORS.SECONDARY_LIGHT,
  },
  placeholder: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: COLORS.GRAY_100,
    borderWidth: 2,
    borderColor: COLORS.BORDER,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: BADGE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.WHITE,
    ...SHADOWS.SM,
  },
  badgeCamera: {
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.SECONDARY,
  },
  badgeRemove: {
    top: 0,
    right: 0,
    backgroundColor: COLORS.ERROR,
  },
  hint: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.XS,
    color: COLORS.TEXT_SECONDARY,
  },
});

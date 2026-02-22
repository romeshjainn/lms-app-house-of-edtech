import { Platform } from 'react-native';

const buildShadow = (
  height: number,
  opacity: number,
  radius: number,
  elevation: number,
) => {
  if (Platform.OS === 'android') {
    return { elevation };
  }

  return {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height },
    shadowOpacity: opacity,
    shadowRadius: radius,
  };
};

const SHADOWS = {
  SM: buildShadow(1, 0.05, 2, 2),
  MD: buildShadow(2, 0.08, 4, 4),
  LG: buildShadow(4, 0.12, 8, 8),
  XL: buildShadow(8, 0.16, 16, 12),
};

export default SHADOWS;

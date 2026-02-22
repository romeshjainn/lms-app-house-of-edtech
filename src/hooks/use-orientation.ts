import { useWindowDimensions } from 'react-native';

export interface Orientation {
  isLandscape: boolean;
  isPortrait: boolean;
  width: number;
  height: number;
}

export function useOrientation(): Orientation {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  return {
    isLandscape,
    isPortrait: !isLandscape,
    width,
    height,
  };
}

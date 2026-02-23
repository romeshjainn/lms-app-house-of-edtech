import { Ionicons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import { Image, ScrollView, View, useWindowDimensions, type LayoutChangeEvent } from 'react-native';

import CustomText from '@/components/base/AppText';
import { FONTS } from '@/constants';
import { SPACING } from '@/theme';
import { useTheme } from '@/theme/ThemeContext';

interface ImageSliderProps {
  images: string[];
  height?: number;
}

export function ImageSlider({ images, height = 260 }: ImageSliderProps) {
  const { colors } = useTheme();
  const { width: screenWidth } = useWindowDimensions();

  const [sliderWidth, setSliderWidth] = useState(screenWidth);
  const [activeIndex, setActiveIndex] = useState(0);
  const [errorSet, setErrorSet] = useState<Set<number>>(new Set());

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0) setSliderWidth(w);
  }, []);

  const handleScroll = useCallback(
    (e: { nativeEvent: { contentOffset: { x: number } } }) => {
      if (sliderWidth === 0) return;
      const raw = e.nativeEvent.contentOffset.x / sliderWidth;
      const idx = Math.round(raw);
      setActiveIndex(Math.max(0, Math.min(idx, images.length - 1)));
    },
    [sliderWidth, images.length],
  );

  const markError = useCallback((index: number) => {
    setErrorSet((prev) => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  }, []);

  if (images.length === 0) {
    return (
      <View
        style={{
          width: '100%',
          height,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.GRAY_100,
        }}
      >
        <Ionicons name="image-outline" size={52} color={colors.GRAY_400} />
      </View>
    );
  }

  return (
    <View
      onLayout={handleLayout}
      style={{
        width: '100%',
        height,
        backgroundColor: colors.GRAY_100,
        overflow: 'hidden',
      }}
    >
      <ScrollView
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {images.map((uri, index) => (
          <View
            key={index}
            style={{
              width: sliderWidth,
              height,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.GRAY_100,
            }}
          >
            {errorSet.has(index) ? (
              <Ionicons name="image-outline" size={52} color={colors.GRAY_400} />
            ) : (
              <Image
                source={{ uri: encodeURI(uri) }}
                style={{ width: sliderWidth, height }}
                resizeMode="cover"
                onError={() => markError(index)}
              />
            )}
          </View>
        ))}
      </ScrollView>

      {images.length > 1 && (
        <View
          style={{
            position: 'absolute',
            bottom: SPACING.SM,
            left: 0,
            right: 0,
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 5,
          }}
          pointerEvents="none"
        >
          {images.map((_, i) => (
            <View
              key={i}
              style={{
                height: 6,
                borderRadius: 3,
                width: i === activeIndex ? 20 : 6,
                backgroundColor: i === activeIndex ? '#FFFFFF' : 'rgba(255,255,255,0.5)',
              }}
            />
          ))}
        </View>
      )}

      {images.length > 1 && (
        <View
          style={{
            position: 'absolute',
            top: SPACING.SM,
            right: SPACING.SM,
            backgroundColor: 'rgba(0,0,0,0.52)',
            borderRadius: 10,
            paddingHorizontal: 8,
            paddingVertical: 3,
          }}
          pointerEvents="none"
        >
          <CustomText style={{ color: '#FFFFFF', fontSize: 11, fontFamily: FONTS.MEDIUM }}>
            {activeIndex + 1}/{images.length}
          </CustomText>
        </View>
      )}
    </View>
  );
}

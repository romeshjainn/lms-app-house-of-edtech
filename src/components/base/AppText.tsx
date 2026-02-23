import { Text, TextProps } from 'react-native';

import { FONTS } from '@/constants';

export default function CustomText({ style, ...props }: TextProps) {
  return <Text style={[{ fontFamily: FONTS.REGULAR }, style]} {...props} />;
}

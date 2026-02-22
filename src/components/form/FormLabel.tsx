import { StyleSheet, Text, View } from 'react-native';

import { COLORS, FONTS } from '@/constants';
import { FONT_SIZES } from '@/theme';

interface FormLabelProps {
  label: string;
  required?: boolean;
}

export function FormLabel({ label, required = false }: FormLabelProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      {required && <Text style={styles.asterisk}> *</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_PRIMARY,
  },
  asterisk: {
    fontFamily: FONTS.MEDIUM,
    fontSize: FONT_SIZES.SM,
    color: COLORS.ERROR,
  },
});

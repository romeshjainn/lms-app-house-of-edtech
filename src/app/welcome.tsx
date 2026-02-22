import { Image, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { router } from 'expo-router';

import CustomText from '@/components/base/AppText';
import { COLORS, FONTS, ROUTES } from '@/constants';
import { IMAGES } from 'assets';

export default function WelcomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#F7F6FB]">
      <View className="flex-1 items-center justify-between px-6 py-10">
        <View className="flex-1 justify-center">
          <Image source={IMAGES.welcome} resizeMode="contain" className="w-[280px] h-[280px]" />
        </View>

        <View className="items-center px-4">
          <CustomText
            className="text-3xl text-gray-900 text-center"
            style={{ fontFamily: FONTS.BOLD }}
          >
            Learn Anytime,
          </CustomText>
          <CustomText
            className="text-3xl text-gray-900 text-center mt-1"
            style={{ fontFamily: FONTS.BOLD }}
          >
            Achieve Anywhere.
          </CustomText>

          <CustomText className="text-base text-gray-500 text-center mt-4 leading-6">
            Access high-quality courses, interactive lessons, and expert guidance right from your
            phone.
          </CustomText>
        </View>

        <View className="w-full">
          <TouchableOpacity
            onPress={() => router.push(ROUTES.LOGIN as never)}
            activeOpacity={0.8}
            style={{ backgroundColor: COLORS.PRIMARY }}
            className=" rounded-full py-4 items-center mt-8"
          >
            <Text className="text-white text-base" style={{ fontFamily: FONTS.MEDIUM }}>
              Get Started
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

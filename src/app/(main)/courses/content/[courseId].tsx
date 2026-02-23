import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { WebViewMessageEvent } from 'react-native-webview';
import WebView from 'react-native-webview';

import { COLORS, FONTS } from '@/constants';
import { handleApiError } from '@/services/api/error-handler';
import { courseService } from '@/services/api/modules/course.service';
import { useAppDispatch, useAppSelector } from '@/store';
import { markCourseCompleted, selectIsCompleted, selectIsEnrolled } from '@/store/slices/course.slice';
import { BORDER_RADIUS, FONT_SIZES, SPACING } from '@/theme';
import type { CourseDetail } from '@/types/course.types';
import { buildCourseHtml } from '@/web/buildCourseHtml';

interface WebViewMessage {
  type: 'MARK_COMPLETED';
  courseId: number;
}

export default function CourseContentScreen() {
  const { courseId } = useLocalSearchParams<{ courseId: string }>();
  const id = parseInt(courseId ?? '0', 10);

  const dispatch = useAppDispatch();
  const isCompleted = useAppSelector(selectIsCompleted(id));
  const isEnrolled = useAppSelector(selectIsEnrolled(id));
  const isGuest = useAppSelector((s) => s.auth.isGuest);

  const accessToken = useAppSelector((s) => s.auth.accessToken);

  const webViewRef = useRef<WebView>(null);

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [webViewError, setWebViewError] = useState<string | null>(null);
  const [webViewKey, setWebViewKey] = useState(0);

  const fetchCourse = useCallback(async () => {
    setIsFetching(true);
    setFetchError(null);
    try {
      const data = await courseService.getCourseDetail(id);
      setCourse(data);
    } catch (err) {
      const appError = handleApiError(err);
      setFetchError(appError.message);
    } finally {
      setIsFetching(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  const injectedJS = course
    ? `
      (function() {
        var course = ${JSON.stringify(course)};
        var token  = ${JSON.stringify(accessToken ?? '')};
        var done   = ${JSON.stringify(isCompleted)};
        var isGuest = ${JSON.stringify(isGuest)};
        var isEnrolled = ${JSON.stringify(isEnrolled)};
        window.__AUTH_TOKEN__ = token;
        if (typeof window.__initCourse__ === 'function') {
          window.__initCourse__(course, done, isGuest, isEnrolled);
        }
      })();
    `
    : undefined;

  function handleMessage(event: WebViewMessageEvent) {
    try {
      const msg = JSON.parse(event.nativeEvent.data) as WebViewMessage;
      if (msg.type === 'MARK_COMPLETED' && msg.courseId) {
        dispatch(markCourseCompleted(msg.courseId));
      }
    } catch {}
  }

  function handleWebViewError(event: { nativeEvent: { description: string } }) {
    setWebViewError(event.nativeEvent.description || 'An error occurred in the content view.');
  }

  function handleHttpError(event: { nativeEvent: { statusCode: number } }) {
    const code = event.nativeEvent.statusCode;
    setWebViewError(`Content failed to load (HTTP ${code}). Please try again.`);
  }

  function retryWebView() {
    setWebViewError(null);
    setWebViewKey((k) => k + 1);
  }

  if (isFetching) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <NavBar />
        <View style={styles.centeredState}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          <Text style={styles.stateText}>Loading content…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (fetchError || !course) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <NavBar />
        <View style={styles.centeredState}>
          <Ionicons name="wifi-outline" size={52} color={COLORS.GRAY_300} />
          <Text style={styles.errorTitle}>Content unavailable</Text>
          <Text style={styles.errorSub}>{fetchError ?? 'Unknown error'}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchCourse}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <NavBar title={course.title} />

      {webViewError ? (
        <View style={styles.centeredState}>
          <Ionicons name="warning-outline" size={52} color={COLORS.WARNING} />
          <Text style={styles.errorTitle}>Content failed to load</Text>
          <Text style={styles.errorSub}>{webViewError}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={retryWebView}>
            <Text style={styles.retryText}>Reload</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <WebView
          key={webViewKey}
          ref={webViewRef}
          source={{ html: buildCourseHtml() }}
          injectedJavaScript={injectedJS}
          onMessage={handleMessage}
          onError={handleWebViewError}
          onHttpError={handleHttpError}
          originWhitelist={['*']}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState
          renderLoading={() => (
            <View style={styles.webViewLoader}>
              <ActivityIndicator size="large" color={COLORS.PRIMARY} />
            </View>
          )}
          style={styles.webView}
        />
      )}
    </SafeAreaView>
  );
}

function NavBar({ title }: { title?: string }) {
  return (
    <View style={styles.navBar}>
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.backButton}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="arrow-back" size={22} color={COLORS.TEXT_PRIMARY} />
      </TouchableOpacity>
      {title ? (
        <Text style={styles.navTitle} numberOfLines={1}>
          {title}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },

  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
    paddingRight: SPACING.MD,
    minHeight: 48,
  },
  backButton: {
    padding: SPACING.SM,
    marginLeft: SPACING.XS,
  },
  navTitle: {
    flex: 1,
    fontFamily: FONTS.BOLD,
    fontSize: FONT_SIZES.MD,
    color: COLORS.TEXT_PRIMARY,
    marginLeft: SPACING.XS,
  },

  webView: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  webViewLoader: {
    position: 'absolute',
    inset: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.BACKGROUND,
  },

  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.XL,
    gap: SPACING.SM,
  },
  stateText: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.BASE,
    color: COLORS.TEXT_SECONDARY,
    marginTop: SPACING.SM,
  },
  errorTitle: {
    fontFamily: FONTS.BOLD,
    fontSize: FONT_SIZES.LG,
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
  },
  errorSub: {
    fontFamily: FONTS.REGULAR,
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: FONT_SIZES.SM * 1.6,
  },
  retryBtn: {
    marginTop: SPACING.SM,
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.SM,
    backgroundColor: COLORS.PRIMARY,
    borderRadius: BORDER_RADIUS.MD,
  },
  retryText: {
    fontFamily: FONTS.BOLD,
    fontSize: FONT_SIZES.BASE,
    color: COLORS.WHITE,
  },
});

import CustomText from '@/components/base/AppText';
import { MiniCourseCard } from '@/components/course/MiniCourseCard';
import { FONTS } from '@/constants';
import { askAssistant } from '@/services/ai.service';
import { ANALYTICS_EVENTS, trackEvent } from '@/services/analytics.service';
import { useAppSelector } from '@/store';
import { selectBookmarkedCoursesData } from '@/store/slices/course.slice';
import { useTheme } from '@/theme/ThemeContext';
import { CourseListItem } from '@/types/course.types';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  ListRenderItemInfo,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
};

export default function AiAssistantScreen() {
  const { colors } = useTheme();
  const bookmarkedCourses = useAppSelector(selectBookmarkedCoursesData);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendToAI = async (title: string, description: string, type: 'course' | 'question') => {
    setLoading(true);
    try {
      const reply = await askAssistant({ title, description, type });

      const aiMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        text: reply,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    await sendToAI('User Question', input, 'question');
  };

  const handleAnalyzeBookmarks = async () => {
    if (!bookmarkedCourses.length) return;

    await trackEvent(ANALYTICS_EVENTS.AI_QUESTION);
    const combined = bookmarkedCourses
      .map((c, i) => `${i + 1}. ${c.category} - ${c.title ?? ''}`)
      .join('\n');

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: 'Why should I enroll in my bookmarked courses?',
    };

    setMessages((prev) => [...prev, userMessage]);

    await sendToAI(
      'Bookmarked Courses',
      `Here are my bookmarked courses:\n${combined}\n\nExplain why I should enroll in them.`,
      'course',
    );
  };

  const handleAnalyzeSingleCourse = async (course: CourseListItem) => {
    await trackEvent(ANALYTICS_EVENTS.AI_QUESTION);
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: `Tell me why I should enroll in "${course.title}"`,
    };

    setMessages((prev) => [...prev, userMessage]);

    await sendToAI(
      course.title,
      `Category: ${course.category}
Instructor: ${course.instructor.name}
Price: $${course.price}
Explain why I should enroll in this course.`,
      'course',
    );
  };

  const renderBookmarkedItem = useCallback(
    ({ item }: ListRenderItemInfo<CourseListItem>) => (
      <MiniCourseCard course={item} onPress={() => handleAnalyzeSingleCourse(item)} />
    ),
    [],
  );

  function HorizontalSeparator() {
    return <View style={{ width: 12 }} />;
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <View style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
        <View style={styles.header}>
          <CustomText style={[styles.title, { color: colors.TEXT_PRIMARY }]}>
            AI Assistant
          </CustomText>
          <CustomText style={[styles.subtitle, { color: colors.TEXT_SECONDARY }]}>
            Ask anything about your courses
          </CustomText>
        </View>

        {bookmarkedCourses.length > 0 ? (
          <>
            <TouchableOpacity
              style={[styles.quickAction, { backgroundColor: colors.PRIMARY + '15' }]}
              onPress={handleAnalyzeBookmarks}
            >
              <CustomText style={[styles.quickActionText, { color: colors.PRIMARY }]}>
                Know about your bookmarked courses & why you should enroll
              </CustomText>
            </TouchableOpacity>

            <View style={{ height: 200, marginTop: 12 }}>
              <FlatList
                data={bookmarkedCourses}
                keyExtractor={(item) => String(item.id)}
                renderItem={renderBookmarkedItem}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  paddingHorizontal: 20,
                  paddingVertical: 4,
                }}
                ItemSeparatorComponent={HorizontalSeparator}
              />
            </View>
          </>
        ) : (
          <View
            style={{
              marginHorizontal: 20,
              marginTop: 12,
              borderRadius: 16,
              padding: 20,
              backgroundColor: colors.GRAY_100,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons
              name="bookmark-outline"
              size={28}
              color={colors.GRAY_400}
              style={{ marginBottom: 8 }}
            />
            <CustomText
              style={{
                fontSize: 14,
                color: colors.TEXT_SECONDARY,
                textAlign: 'center',
                lineHeight: 20,
              }}
            >
              Bookmark courses to get AI-based personalized recommendations.
            </CustomText>
          </View>
        )}

        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: 100,
          }}
          renderItem={({ item }) => {
            const isUser = item.role === 'user';

            return (
              <View
                style={[
                  styles.message,
                  {
                    backgroundColor: isUser ? colors.PRIMARY + '20' : colors.SECONDARY + '20',
                    alignSelf: isUser ? 'flex-end' : 'flex-start',
                    borderColor: colors.BORDER,
                  },
                ]}
              >
                <CustomText
                  style={{
                    color: colors.TEXT_PRIMARY,
                  }}
                >
                  {item.text}
                </CustomText>
              </View>
            );
          }}
          style={{ flex: 1 }}
          keyboardShouldPersistTaps="handled"
        />

        {loading && (
          <ActivityIndicator size="small" color={colors.PRIMARY} style={{ marginVertical: 6 }} />
        )}

        <View
          style={[
            styles.inputRow,
            {
              backgroundColor: colors.GRAY_50,
              borderColor: colors.GRAY_300,
            },
          ]}
        >
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask something..."
            placeholderTextColor={colors.TEXT_SECONDARY}
            style={[
              styles.input,
              {
                backgroundColor: colors.WHITE,
                color: colors.TEXT_PRIMARY,
              },
            ]}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendBtn, { backgroundColor: colors.PRIMARY }]}
            onPress={handleSend}
          >
            <CustomText style={{ color: '#fff' }}>Send</CustomText>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 30,
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },

  title: {
    fontSize: 22,
    fontFamily: FONTS.MEDIUM,
  },

  subtitle: {
    fontSize: 13,
    marginTop: 4,
  },

  quickAction: {
    marginHorizontal: 16,
    padding: 14,
    borderRadius: 14,
    marginTop: 10,
  },

  quickActionText: {
    fontSize: 13,
    fontFamily: FONTS.MEDIUM,
  },

  message: {
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
    maxWidth: '85%',
    borderWidth: 1,
  },

  inputRow: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
  },

  input: {
    flex: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxHeight: 100,
  },

  sendBtn: {
    paddingHorizontal: 18,
    justifyContent: 'center',
    borderRadius: 12,
    marginLeft: 8,
  },
});

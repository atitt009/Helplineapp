import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  FlatList,
  GestureHandlerRootView,
  TextInput,
} from 'react-native-gesture-handler';

// NOTE: The HistoryContent interface is now removed.

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const makePhoneCall = (phoneNumber: string) => {
  const cleanNumber = phoneNumber.replace(/[^\d+-]/g, '');
  const phoneUrl = `tel:${cleanNumber}`;
  Linking.canOpenURL(phoneUrl)
    .then((supported) => {
      if (supported) {
        return Linking.openURL(phoneUrl);
      } else {
        console.log('Phone calling is not supported on this device');
      }
    })
    .catch((err) => console.error('Error opening phone app:', err));
};

const MessageTextWithClickableNumbers = ({ text, style }: { text: string; style: any }) => {
  const phoneRegex = /(\b\d{10}\b|\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b|\(\d{3}\)\s*\d{3}[-.\s]?\d{4}|\b\d{3}\b)/g;
  const parts = text.split(phoneRegex);
  return (
    <Text style={style}>
      {parts.map((part, index) => {
        if (part && phoneRegex.test(part)) {
          return (
            <Text key={index} style={[style, styles.phoneLink]} onPress={() => makePhoneCall(part)}>
              {part}
            </Text>
          );
        }
        return part;
      })}
    </Text>
  );
};

// Replace this with your actual backend endpoint
const CHAT_API_ENDPOINT = 'http://127.0.0.1:8000/api/chat/'; 
// TODO: Replace this placeholder with the actual logged-in user's name or ID
const USERNAME = 'admin';

export default function MessagingScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm Aura, your supportive companion. How are you feeling today?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList<Message>>(null);
  
  // NOTE: The conversationHistoryRef has been removed.

  useEffect(() => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages]);

  const sendMessage = async () => {
    const text = inputText.trim();
    if (!text || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Send the username and the new message to your backend
      const response = await fetch(CHAT_API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: USERNAME, // Sending username
          message: text,      // Sending message
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      const data = await response.json();
      const botText = data.text;

      if (!botText) {
          throw new Error("Invalid response from server.");
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botText,
        isUser: false,
        timestamp: new Date(),
      };
      
      // NOTE: History update logic is removed.
      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error("API Error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I'm having trouble connecting right now. Please try again later.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.messageContainer, item.isUser ? styles.userMessageWrapper : styles.systemMessageWrapper]}>
      <View style={[styles.messageBubble, item.isUser ? styles.userMessageBubble : styles.systemMessageBubble]}>
        <MessageTextWithClickableNumbers text={item.text} style={item.isUser ? styles.userMessageText : styles.systemMessageText}/>
        <Text style={[styles.timestamp, !item.isUser && styles.systemTimestamp]}>
          {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <Pressable style={({ pressed }) => [styles.backButton, { opacity: pressed ? 0.7 : 1 }]} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>← Back</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Aura Chat</Text>
          <View style={{ width: 50 }} />
        </View>

        <KeyboardAvoidingView style={styles.keyboardAvoidingContainer} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            style={styles.messagesList}
            contentContainerStyle={styles.messagesListContent}
            ListFooterComponent={isLoading ? <ActivityIndicator style={{ margin: 10 }} /> : null}
          />
          
          <View style={styles.inputArea}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Type a message..."
                placeholderTextColor="#999"
                editable={!isLoading}
              />
              <Pressable
                style={({ pressed }) => [
                  styles.sendButton,
                  (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
                  { opacity: pressed ? 0.7 : 1 }
                ]}
                onPress={sendMessage}
                disabled={!inputText.trim() || isLoading}
              >
                <Text style={styles.sendButtonText}>➤</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: 'white' },
  keyboardAvoidingContainer: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  backButton: { padding: 5 },
  backButtonText: { fontSize: 16, color: '#007AFF' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  messagesList: { flex: 1, backgroundColor: '#F7F8FA' },
  messagesListContent: { padding: 16 },
  messageContainer: { marginVertical: 5, maxWidth: '80%' },
  userMessageWrapper: { alignSelf: 'flex-end' },
  systemMessageWrapper: { alignSelf: 'flex-start' },
  messageBubble: { padding: 12, borderRadius: 18 },
  userMessageBubble: { backgroundColor: '#007AFF' },
  systemMessageBubble: { backgroundColor: '#E5E5EA' },
  userMessageText: { color: 'white', fontSize: 16 },
  systemMessageText: { color: 'black', fontSize: 16 },
  phoneLink: { textDecorationLine: 'underline', color: 'white', fontWeight: 'bold' },
  timestamp: { fontSize: 10, color: '#FFFFFF99', alignSelf: 'flex-end', marginTop: 4 },
  systemTimestamp: { color: '#00000099' },
  inputArea: { borderTopWidth: 1, borderTopColor: '#F0F0F0', backgroundColor: 'white' },
  inputContainer: { flexDirection: 'row', padding: 12, alignItems: 'center' },
  textInput: { flex: 1, backgroundColor: '#F0F2F5', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 16, marginRight: 8 },
  sendButton: { backgroundColor: '#007AFF', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  sendButtonDisabled: { backgroundColor: '#B0C4DE' },
  sendButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});
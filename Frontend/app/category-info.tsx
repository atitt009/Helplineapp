import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

interface CategoryData {
  faqs: FAQ[];
}

export default function CategoryInfoScreen() {
  const router = useRouter();
  const { category, icon } = useLocalSearchParams();
  const [categoryData, setCategoryData] = useState<CategoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  
  const theme = {
    backgroundColor: '#E8F5E8',
    titleColor: '#2E7D32',
    textColor: '#1B5E20',
    accentColor: '#4CAF50'
  };
  
  const handleChatBot = () => {
    router.push('./messaging');
  };

  const fetchFAQData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Replace with your actual backend URL
      // Expected API response format:
      // {
      //   "faqs": [
      //     {
      //       "id": "1",
      //       "question": "What is anxiety?",
      //       "answer": "Anxiety is a natural response to stress and can be helpful in some situations..."
      //     },
      //     {
      //       "id": "2",
      //       "question": "How can I manage stress effectively?",
      //       "answer": "There are several evidence-based techniques for managing stress..."
      //     }
      //   ]
      // }
      // Note: Category name and icon are passed from index.tsx navigation params
      const response = await fetch(`http://127.0.0.1:8000/api/faq/categories/?category=${encodeURIComponent(category as string)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      setCategoryData({
        faqs: data.faqs || []
      });
    } catch (err) {
      console.error('Error fetching FAQ data:', err);
      setError('Failed to load FAQ data. Please try again.');
      
      // Fallback to empty FAQs
      setCategoryData({
        faqs: []
      });
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    if (category) {
      fetchFAQData();
    }
  }, [category, fetchFAQData]);

  const handleFAQPress = (faqId: string) => {
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId);
  };

  const handleBackPress = () => {
    router.back();
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: '#E8F5E8' }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2E7D32" />
          <Text style={styles.loadingText}>Loading FAQ...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!categoryData) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: '#E8F5E8' }]}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load category data</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchFAQData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.backgroundColor }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        
        {/* Header with back button */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>AAROGYA</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Category Icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.categoryIcon}>{icon || '❓'}</Text>
        </View>

        {/* Main Title */}
        <Text style={[styles.mainTitle, { color: theme.titleColor }]}>
          {category} FAQ
        </Text>

        {/* FAQ Section */}
        <View style={styles.faqContainer}>
          {error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{error}</Text>
              <TouchableOpacity onPress={fetchFAQData} style={styles.retryLink}>
                <Text style={styles.retryLinkText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {categoryData.faqs.length === 0 ? (
            <View style={styles.noFAQContainer}>
              <Text style={[styles.noFAQText, { color: theme.textColor }]}>
                No FAQ available for this category yet.
              </Text>
            </View>
          ) : (
            categoryData.faqs.map((faq) => (
              <View key={faq.id} style={styles.faqCard}>
                <TouchableOpacity 
                  style={styles.faqQuestion}
                  onPress={() => handleFAQPress(faq.id)}
                >
                  <Text style={[styles.faqQuestionText, { color: theme.titleColor }]}>
                    {faq.question}
                  </Text>
                  <Text style={[styles.faqToggle, { color: theme.titleColor }]}>
                    {expandedFAQ === faq.id ? '−' : '+'}
                  </Text>
                </TouchableOpacity>
                
                {expandedFAQ === faq.id && (
                  <View style={styles.faqAnswer}>
                    <Text style={[styles.faqAnswerText, { color: theme.textColor }]}>
                      {faq.answer}
                    </Text>
                  </View>
                )}
              </View>
            ))
          )}
        </View>

        {/* Additional Resources Section */}
        <View style={styles.resourcesSection}>
          <Text style={[styles.resourcesTitle, { color: theme.titleColor }]}>
            Need More Help?
          </Text>
          
          <TouchableOpacity style={[styles.resourceButton, styles.chatButton]} onPress={handleChatBot}>
            <Text style={styles.resourceButtonIcon}>🤖</Text>
            <Text style={styles.resourceButtonText}>Chat with Health Bot</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.resourceButton, styles.emergencyButton]}>
            <Text style={styles.resourceButtonIcon}>📞</Text>
            <Text style={styles.resourceButtonText}>Emergency Contact</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 30,
  },
  backButton: {
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4A4A4A',
  },
  placeholder: {
    width: 40,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  categoryIcon: {
    fontSize: 80,
    marginBottom: 10,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  faqContainer: {
    marginBottom: 30,
  },
  errorBanner: {
    backgroundColor: '#ffebee',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorBannerText: {
    color: '#d32f2f',
    fontSize: 14,
    flex: 1,
  },
  retryLink: {
    marginLeft: 10,
  },
  retryLinkText: {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: '600',
  },
  noFAQContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
  },
  noFAQText: {
    fontSize: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  faqCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  faqQuestionText: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 10,
  },
  faqToggle: {
    fontSize: 24,
    fontWeight: 'bold',
    width: 30,
    textAlign: 'center',
  },
  faqAnswer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  faqAnswerText: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'justify',
    marginTop: 15,
  },
  resourcesSection: {
    marginTop: 10,
  },
  resourcesTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  resourceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  chatButton: {
    backgroundColor: '#B2DFDB',
  },
  emergencyButton: {
    backgroundColor: '#FFCDD2',
  },
  resourceButtonIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  resourceButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
});
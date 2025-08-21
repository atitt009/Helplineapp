import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Category {
  id: string;
  category: string;
  icon: string;
  backgroundColor?: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllCategories, setShowAllCategories] = useState(false);

  const handleChatBot = () => {
    router.push('./messaging');
  };

  const handleEmergencyCall = () => {
    Linking.openURL('tel:0987654321');
  };

  const handleCategoryPress = (categoryName: string, categoryIcon: string) => {
    router.push({
      pathname: '/category-info',
      params: { category: categoryName, icon: categoryIcon }
    });
  };

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`http://127.0.0.1:8000/api/faq/categories/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // Filter out duplicate categories
      const uniqueCategories = data.faqs?.reduce((acc: Category[], current: Category) => {
        const isDuplicate = acc.find(item => item.category === current.category);
        if (!isDuplicate) {
          acc.push(current);
        }
        return acc;
      }, []) || [];
      setCategories(uniqueCategories);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories. Using default categories.');
      
      setCategories([
        { id: '1', category: 'Mental Health', icon: '🧠' },
        { id: '2', category: 'Sexual Health', icon: '⚤' },
        { id: '3', category: 'Drug Addiction', icon: '💉' },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <TouchableOpacity 
      style={[styles.categoryCardCarousel, item.backgroundColor && { backgroundColor: item.backgroundColor }]} 
      activeOpacity={0.7}
      onPress={() => handleCategoryPress(item.category, item.icon)}
    >
      <Text style={styles.categoryImage}>{item.icon}</Text>
      <Text style={styles.categoryLabel}>{item.category}</Text>
    </TouchableOpacity>
  );

  const renderCategoriesSection = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2D9C92" />
          <Text style={styles.loadingText}>Loading categories...</Text>
        </View>
      );
    }

    if (error && categories.length === 0) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load categories</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchCategories}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const firstThreeCategories = categories.slice(0, 3);
    const remainingCategories = categories.slice(3);

    return (
      <View style={styles.categoriesContainer}>
        <FlatList
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.categoriesListContainer}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        
        <Text style={styles.logo}>AAROGYA</Text>
        
        <View style={styles.greetingContainer}>
          <Text style={styles.greetingText}>Hello ,</Text>
          <Text style={styles.greetingText}>How may we help you today?</Text>
        </View>

        {error && categories.length > 0 && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>Using default categories</Text>
            <TouchableOpacity onPress={fetchCategories} style={styles.retryLink}>
              <Text style={styles.retryLinkText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

         <TouchableOpacity style={styles.chatBotCard} activeOpacity={0.8} onPress={handleChatBot}>
          <Text style={styles.cardIcon}>🤖</Text>
          <View style={styles.cardTextContainer}>
            <Text style={styles.chatBotTitle}>Chat Bot</Text>
            <Text style={styles.chatBotSubtitle}>Chat with Health Bot</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.emergencyCard} activeOpacity={0.8} onPress={handleEmergencyCall}>
          <Text style={styles.cardIcon}>📞</Text>
          <View style={styles.cardTextContainer}>
            <Text style={styles.emergencyTitle}>Emergency contact</Text>
            <Text style={styles.emergencyNumber}>0987654321</Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.categoriesTitle}>FAQs</Text>

        {renderCategoriesSection()}

       

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F6F2',
  },
  container: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  logo: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4A4A4A',
    marginTop: 20,
    marginBottom: 25,
  },
  greetingContainer: {
    width: '100%',
    alignSelf: 'flex-start',
    marginBottom: 25,
  },
  greetingText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
  },
  searchBarContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  searchBar: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    height: 50,
    paddingLeft: 45,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchIcon: {
    position: 'absolute',
    left: 15,
    fontSize: 20,
    color: '#A0A0A0',
    zIndex: 1, // Ensure icon is on top of the TextInput
  },
  categoriesTitle: {
    width: '100%',
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2D9C92', // Teal color from the image
    marginBottom: 15,
  },
  categoriesRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  categoryCard: {
    backgroundColor: '#E0F2F1',
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
    padding: 15,
    height: 80,
  },
  categoryCardCarousel: {
    backgroundColor: '#E0F2F1',
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
    padding: 15,
    height: 80,
  },
  categoryImage: {
    fontSize: 32,
    marginRight: 15,
  },
  categoryLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  categoriesContainer: {
    width: '100%',
  },
  categoriesListContainer: {
    width: '100%',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: '#2D9C92',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  carouselContainer: {
    paddingHorizontal: 10,
  },
  carouselSeparator: {
    width: 15,
  },
  errorBanner: {
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  errorBannerText: {
    color: '#856404',
    fontSize: 14,
    flex: 1,
  },
  retryLink: {
    marginLeft: 10,
  },
  retryLinkText: {
    color: '#2D9C92',
    fontSize: 14,
    fontWeight: '600',
  },
  carouselSection: {
    marginTop: 10,
    marginBottom: 20,
  },
  carouselHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  moreCategoriesText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D9C92',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2F1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  viewAllText: {
    fontSize: 14,
    color: '#2D9C92',
    fontWeight: '600',
    marginRight: 5,
  },
  arrowIcon: {
    fontSize: 12,
    color: '#2D9C92',
    fontWeight: 'bold',
  },
  // Re-used styles for main action cards
  cardIcon: {
    fontSize: 40,
    marginRight: 15,
  },
  cardTextContainer: {
    flex: 1,
  },
  // Chat Bot Card
  chatBotCard: {
    width: '100%',
    backgroundColor: '#B2DFDB', // Lighter teal from the image
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    marginBottom: 15,
  },
  chatBotTitle: {
    fontSize: 20,
    color: '#004D40', // Darker teal for text
    fontWeight: 'bold',
  },
  chatBotSubtitle: {
    fontSize: 14,
    color: '#004D40',
  },
  // Emergency Card
  emergencyCard: {
    width: '100%',
    backgroundColor: '#FFCDD2', // Salmon/pink color from the image
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    marginBottom: 20,
  },
  emergencyTitle: {
    fontSize: 20,
    color: '#C62828', // Darker red/pink for text
    fontWeight: 'bold',
  },
  emergencyNumber: {
    fontSize: 14,
    color: '#C62828',
    fontWeight: '500',
    marginTop: 2,
  },
});

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, Dimensions, Modal, TouchableOpacity } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import axios from 'axios';

const screenWidth = Dimensions.get('window').width;

const DANGER_INGREDIENTS = {
    'sodium nitrate': 'Used as a preservative; linked to cancer.',
    'sodium nitrite': 'Common in processed meats; linked to heart disease.',
    'sulfites': 'Can trigger asthma and allergic reactions.',
    'azodicarbonamide': 'Used in bread; linked to respiratory issues.',
    'potassium bromate': 'A potential carcinogen found in baked goods.',
    'propyl gallate': 'Preservative that may disrupt hormones.',
    'butylated hydroxyanisole (bha)': 'Preservative linked to cancer in lab animals.',
    'butylated hydroxytoluene (bht)': 'Preservative with potential hormone-disrupting effects.',
    'propylene glycol': 'Used in food and antifreeze; may irritate skin.',
    'monosodium glutamate (msg)': 'Flavor enhancer that may cause headaches.',
    'disodium inosinate': 'Flavor enhancer linked to gout.',
    'disodium guanylate': 'Often used with MSG; can cause allergic reactions.',
    'enriched flour': 'Processed flour with little nutritional value.',
    'sodium benzoate': 'Can form carcinogens when combined with vitamin C.',
    'aspartame': 'Artificial sweetener linked to headaches and nausea.',
    'high-fructose corn syrup (hfcs)': 'Sweetener linked to obesity and diabetes.',
    'artificial food colorings': 'May cause hyperactivity in children.',
    'titanium dioxide': 'Used as a whitening agent; potential carcinogen.',
    'bisphenol a (bpa)': 'Chemical in plastics; disrupts hormones.',
    'phthalates': 'Plasticizer linked to developmental issues.',
    'red 40': 'Artificial dye linked to hyperactivity in children.',
    'yellow 5': 'Artificial dye that may cause allergic reactions.',
    'yellow 6': 'Artificial dye linked to tumors in lab studies.',
    'blue 1': 'Artificial dye linked to hyperactivity.',
    'blue 2': 'Artificial dye with potential carcinogenic effects.',
    'green 3': 'Artificial dye with limited safety testing.',
    'citrus red 2': 'Dye used on oranges; linked to cancer.',
    'artificial color': 'General term for synthetic dyes with health risks.',
    'tbhq': 'Preservative linked to vision and liver problems.',
};

const CAUTION_INGREDIENTS = {
    'guar gum': 'Thickening agent that can cause digestive issues.',
    'xanthan gum': 'Thickening agent that may cause bloating.',
    'caramel color': 'Food coloring with potential carcinogens.',
    'hydrogenated oils': 'Source of trans fats, linked to heart disease.',
    'palm oil': 'Linked to deforestation and health issues.',
    'soy lecithin': 'May cause allergic reactions in sensitive individuals.',
    'sodium carboxymethyl cellulose': 'Thickener that may cause digestive issues.',
    'polysorbate 60': 'Emulsifier with limited safety testing.',
    'propylene glycol alginate': 'Thickener with potential to irritate skin.',
    'refined vegetable oils': 'High in omega-6 fats, linked to inflammation.',
    'corn syrup': 'Sweetener linked to obesity.',
    'artificial flavors': 'Synthetic chemicals with unknown long-term effects.',
    'sodium phosphate': 'Used in processed foods; may affect kidneys.',
    'palm': 'Common in processed foods; linked to environmental harm.',
    'ferrous sulfate': 'Iron additive; excessive amounts may cause issues.',
};

function normalizeIngredient(item) {
  let normalized = item.toLowerCase();
  normalized = normalized.replace(/\./g, '');
  normalized = normalized.replace(/\(.*?\)/g, '');
  normalized = normalized.replace(/,/g, '');
  normalized = normalized.trim();
  return normalized;
}

const DANGER_INGREDIENTS_NORMALIZED = Object.keys(DANGER_INGREDIENTS).map(normalizeIngredient);
const CAUTION_INGREDIENTS_NORMALIZED = Object.keys(CAUTION_INGREDIENTS).map(normalizeIngredient);

export default function DetailsScreen({ route }) {
  const { barcode } = route.params;
  const [foodData, setFoodData] = useState(null);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState(null);

  const API_URL = 'https://world.openfoodfacts.org/api/v2/product/';

  useEffect(() => {
    axios
      .get(`${API_URL}${barcode}.json`)
      .then((response) => {
        if (response.data.status === 1) {
          setFoodData(response.data.product);
          setError(null);
        } else {
          setError('Product not found');
        }
      })
      .catch(() => setError('Unable to fetch product data'));
  }, [barcode]);

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!foodData) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const {
    product_name,
    nutriments,
    image_url,
    ingredients_text,
    brands,
    packaging,
    allergens_tags,
  } = foodData;

  const protein = Math.round(nutriments.proteins || 0);
  const carbs = Math.round(nutriments.carbohydrates || 0);
  const fat = Math.round(nutriments.fat || 0);
  const calories = Math.round(nutriments['energy-kcal'] || 0);

  //detailed
  const sodium = nutriments['sodium'] ? Math.round(nutriments['sodium'] * 1000) : 0; // Convert g to mg
  const cholesterol = nutriments['cholesterol'] ? Math.round(nutriments['cholesterol'] * 1000) : 0; // Convert g to mg
  const sugars = nutriments['sugars'] ? Math.round(nutriments['sugars']) : 0;
  const transFat = nutriments['trans-fat'] ? Math.round(nutriments['trans-fat']) : 0;
  const saturatedFat = nutriments['saturated-fat'] ? Math.round(nutriments['saturated-fat']) : 0;


  const formatIngredientsList = (text) => {
    if (!text) {
      return ['No ingredients information available'];
    }

    let cleaned = text.replace(/\./g, '');
    cleaned = cleaned.replace(/\(/g, ', ').replace(/\)/g, '');
    cleaned = cleaned.replace(/\s+and\s+/gi, ', ');
    let ingredientsArray = cleaned.split(',');
    ingredientsArray = ingredientsArray.map((item) => item.trim()).filter(Boolean);
    ingredientsArray = ingredientsArray.map((item) => {
      return item
        .split(' ')
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join(' ');
    });
    return ingredientsArray;
  };

  const formattedIngredients = formatIngredientsList(ingredients_text);

  const getHighlightStyle = (ingredient) => {
    const normalizedIngredient = normalizeIngredient(ingredient);
    if (DANGER_INGREDIENTS_NORMALIZED.some((danger) => normalizedIngredient.includes(danger))) {
      return { backgroundColor: '#ffb3b3', borderColor: '#ff8080' };
    }
    if (CAUTION_INGREDIENTS_NORMALIZED.some((caution) => normalizedIngredient.includes(caution))) {
      return { backgroundColor: '#fff5b3', borderColor: '#ffe680' };
    }
    return {};
  };

  const getIngredientInfo = (ingredient) => {
    const normalizedIngredient = normalizeIngredient(ingredient);
    
    for (const [key, value] of Object.entries(DANGER_INGREDIENTS)) {
      if (normalizedIngredient.includes(normalizeIngredient(key))) {
        return { type: 'danger', description: value };
      }
    }
    
    for (const [key, value] of Object.entries(CAUTION_INGREDIENTS)) {
      if (normalizedIngredient.includes(normalizeIngredient(key))) {
        return { type: 'caution', description: value };
      }
    }
    
    return null;
  };

  const handleIngredientPress = (ingredient) => {
    const info = getIngredientInfo(ingredient);
    if (info) {
      setSelectedIngredient({
        name: ingredient,
        ...info
      });
      setModalVisible(true);
    }
  };

  const barData = {
    labels: ['Cholesterol', 'Sugars', 'Trans Fat', 'Sat Fat'],
    datasets: [
      {
        data: [cholesterol, sugars, transFat, saturatedFat],
      },
    ],
  };
  
  return (
    <ScrollView style={styles.container}>
      {image_url && <Image source={{ uri: image_url }} style={styles.image} />}
      <Text style={styles.title}>{product_name || 'Unknown Product'}</Text>

      <View style={styles.nutritionRow}>
        <Text style={styles.nutritionLabel}>Calories:</Text>
        <Text style={styles.nutritionValue}>{calories} cals</Text>
      </View>
      <View style={styles.nutritionRow}>
        <Text style={styles.nutritionLabel}>Protein:</Text>
        <Text style={styles.nutritionValue}>{protein} g</Text>
      </View>
      <View style={styles.nutritionRow}>
        <Text style={styles.nutritionLabel}>Carbs:</Text>
        <Text style={styles.nutritionValue}>{carbs} g</Text>
      </View>
      <View style={styles.nutritionRow}>
        <Text style={styles.nutritionLabel}>Fat:</Text>
        <Text style={styles.nutritionValue}>{fat} g</Text>
      </View>

      {packaging && (
        <Text style={styles.infoText}>
          <Text style={styles.infoLabel}>Packaging: </Text>
          {packaging}
        </Text>
      )}

      <Text style={styles.chartTitle}>Nutritional Breakdown</Text>
      <BarChart
        data={barData}
        width={screenWidth - 40}
        height={300} // Adjust height for additional metrics
        chartConfig={{
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#f4f4f4',
            color: (opacity = 1) => `rgba(34, 167, 240, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
            borderRadius: 8,
            },
        }}
        showValuesOnTopOfBars
        fromZero
        style={styles.barChart}
        />


      {brands && (
        <Text style={styles.infoText}>
          <Text style={styles.infoLabel}>Brand: </Text>
          {brands}
        </Text>
      )}

      <Text style={styles.sectionTitle}>Ingredients</Text>
      <View style={styles.ingredientsContainer}>
        {formattedIngredients.map((ingredient, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleIngredientPress(ingredient)}
            style={[styles.ingredientChip, getHighlightStyle(ingredient)]}
          >
            <Text style={styles.ingredientChipText}>{ingredient}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedIngredient && (
              <>
                <Text style={styles.modalTitle}>{selectedIngredient.name}</Text>
                <Text style={[
                  styles.modalType,
                  selectedIngredient.type === 'danger' ? styles.dangerText : styles.cautionText
                ]}>
                  {selectedIngredient.type === 'danger' ? 'Warning' : 'Caution'}
                </Text>
                <Text style={styles.modalDescription}>
                  {selectedIngredient.description}
                </Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {allergens_tags && allergens_tags.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Allergens</Text>
          {allergens_tags.map((allergen, index) => (
            <Text key={index} style={styles.allergenText}>
              {allergen.replace('en:', '').replace(/_/g, ' ')}
            </Text>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  errorText: {
    fontSize: 18,
    color: '#ff4d4d',
    textAlign: 'center',
    marginTop: 20,
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
    marginBottom: 20,
    borderRadius: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'left',
    color: '#222',
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 20,
    textAlign: 'left',
    color: '#222',
  },
  barChart: {
    borderRadius: 8,
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 15,
    color: '#222',
  },
  infoText: {
    fontSize: 16,
    marginVertical: 5,
    color: '#555',
  },
  infoLabel: {
    fontWeight: 'bold',
    color: '#333',
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: '#ffffff',
    marginVertical: 5,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 2,
  },
  nutritionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
  },
  nutritionValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#22a7f0',
  },
  ingredientsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 10,
    marginBottom: 30,
  },
  ingredientChip: {
    backgroundColor: '#e0f7fa',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    margin: 4,
    borderColor: '#b2ebf2',
    borderWidth: 1,
  },
  ingredientChipText: {
    fontSize: 14,
    color: '#00796b',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  modalType: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  dangerText: {
    color: '#ff4d4d',
  },
  cautionText: {
    color: '#ffcc00',
  },
  modalDescription: {
    fontSize: 16,
    textAlign: 'center',
    color: '#555',
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: '#22a7f0',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  allergenText: {
    fontSize: 16,
    color: '#ff6347',
    marginVertical: 2,
  },
});

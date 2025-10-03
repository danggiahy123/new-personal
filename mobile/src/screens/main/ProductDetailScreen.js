import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { productService } from '../../services/productService';
import { useAuth } from '../../contexts/AuthContext';

const ProductDetailScreen = ({ route, navigation }) => {
  const { productId } = route.params;
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const result = await productService.getProduct(productId);
      if (result.success) {
        setProduct(result.product);
      } else {
        Alert.alert('Error', result.message);
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load product');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigation.navigate('CreateProduct', { productId, product });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Product',
      'Are you sure you want to delete this product?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await productService.deleteProduct(productId);
              if (result.success) {
                Alert.alert('Success', 'Product deleted successfully', [
                  { text: 'OK', onPress: () => navigation.goBack() }
                ]);
              } else {
                Alert.alert('Error', result.message);
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete product');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading product...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Text>Product not found</Text>
      </View>
    );
  }

  const canEdit = user?.role === 'admin' || product.createdBy._id === user?.id;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.imageContainer}>
        <View style={styles.productImage}>
          <MaterialIcons name="image" size={80} color="#ccc" />
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productPrice}>
            {product.formattedPrice || `$${product.price}`}
          </Text>
        </View>

        <View style={styles.categoryContainer}>
          <Text style={styles.categoryLabel}>Category:</Text>
          <Text style={styles.categoryValue}>{product.category}</Text>
        </View>

        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionLabel}>Description:</Text>
          <Text style={styles.descriptionText}>{product.description}</Text>
        </View>

        <View style={styles.stockContainer}>
          <Text style={styles.stockLabel}>Stock:</Text>
          <Text style={styles.stockValue}>{product.stock} units</Text>
        </View>

        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Status:</Text>
          <View style={[
            styles.statusBadge,
            { backgroundColor: product.isActive ? '#4CAF50' : '#F44336' }
          ]}>
            <Text style={styles.statusText}>
              {product.isActive ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>

        <View style={styles.createdByContainer}>
          <Text style={styles.createdByLabel}>Created by:</Text>
          <Text style={styles.createdByValue}>{product.createdBy.name}</Text>
        </View>

        <View style={styles.tagsContainer}>
          <Text style={styles.tagsLabel}>Tags:</Text>
          <View style={styles.tagsList}>
            {product.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.datesContainer}>
          <Text style={styles.dateText}>
            Created: {new Date(product.createdAt).toLocaleDateString()}
          </Text>
          <Text style={styles.dateText}>
            Updated: {new Date(product.updatedAt).toLocaleDateString()}
          </Text>
        </View>

        {canEdit && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
              <MaterialIcons name="edit" size={20} color="#fff" />
              <Text style={styles.buttonText}>Edit Product</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
              <MaterialIcons name="delete" size={20} color="#fff" />
              <Text style={styles.buttonText}>Delete Product</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
  },
  productImage: {
    height: 200,
    width: 200,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  categoryContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  categoryValue: {
    fontSize: 16,
    color: '#666',
    textTransform: 'capitalize',
  },
  descriptionContainer: {
    marginBottom: 15,
  },
  descriptionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  stockContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  stockLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  stockValue: {
    fontSize: 16,
    color: '#666',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  createdByContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  createdByLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  createdByValue: {
    fontSize: 16,
    color: '#666',
  },
  tagsContainer: {
    marginBottom: 15,
  },
  tagsLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#1976d2',
  },
  datesContainer: {
    marginBottom: 20,
  },
  dateText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  editButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#F44336',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default ProductDetailScreen;

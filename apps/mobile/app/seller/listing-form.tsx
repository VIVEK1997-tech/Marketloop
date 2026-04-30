import * as ImagePicker from 'expo-image-picker';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Image, Text, View } from 'react-native';
import { FilterChip } from '@/components/marketplace/FilterChip';
import { SectionHeader } from '@/components/marketplace/SectionHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Screen } from '@/components/ui/Screen';
import { getApiErrorMessage } from '@/services/api/client';
import { marketplaceRepository } from '@/services/api/marketplace.repository';

const units = ['Kg', 'Quintal', 'Crate', 'Truck'] as const;

export default function SellerListingFormScreen() {
  const { productId } = useLocalSearchParams<{ productId?: string }>();
  const queryClient = useQueryClient();
  const isEditing = !!productId;
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    location: '',
    quantity: '',
    unit: 'Kg'
  });
  const [image, setImage] = useState<string | null>(null);

  const { data: existingProduct } = useQuery({
    queryKey: ['product', productId, 'seller-edit'],
    queryFn: () => marketplaceRepository.getProduct(String(productId)),
    enabled: isEditing
  });

  useEffect(() => {
    if (!existingProduct) return;
    setForm({
      title: existingProduct.title || '',
      description: existingProduct.description || '',
      price: existingProduct.price ? String(existingProduct.price) : '',
      category: existingProduct.category || '',
      location: existingProduct.location || '',
      quantity: existingProduct.quantity ? String(existingProduct.quantity) : '',
      unit: existingProduct.unit || 'Kg'
    });
    setImage(existingProduct.images?.[0] || null);
  }, [existingProduct]);

  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const canSubmit = useMemo(
    () => Boolean(form.title.trim() && form.description.trim() && form.price.trim() && form.category.trim() && form.location.trim()),
    [form]
  );

  const listingMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      if (image && !image.startsWith('http')) {
        formData.append('images', {
          uri: image,
          name: 'listing.jpg',
          type: 'image/jpeg'
        } as unknown as Blob);
      }

      return isEditing
        ? marketplaceRepository.updateProduct(String(productId), formData)
        : marketplaceRepository.createProduct(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-products'] });
      queryClient.invalidateQueries({ queryKey: ['seller-summary'] });
      Alert.alert(isEditing ? 'Listing updated' : 'Listing created', isEditing ? 'Your product details are updated.' : 'Your product listing is ready.');
      router.replace('/(tabs)/listings');
    },
    onError: (error) => {
      Alert.alert(isEditing ? 'Unable to update listing' : 'Unable to create listing', getApiErrorMessage(error));
    }
  });

  return (
    <Screen>
      <View className="gap-5">
        <SectionHeader
          title={isEditing ? 'Edit listing' : 'Create listing'}
          subtitle="Add product details, quantity, unit of measure, and a lead image so buyers can trust the listing."
        />

        <Card>
          <View className="gap-4">
            <Input value={form.title} onChangeText={(value) => update('title', value)} placeholder="Product title" />
            <Input value={form.description} onChangeText={(value) => update('description', value)} placeholder="Description" multiline />
            <Input value={form.price} onChangeText={(value) => update('price', value)} keyboardType="decimal-pad" placeholder="Price" />
            <Input value={form.quantity} onChangeText={(value) => update('quantity', value)} keyboardType="decimal-pad" placeholder="Quantity" />

            <View className="gap-2">
              <Text className="text-sm font-semibold text-slate-700">Unit</Text>
              <View className="flex-row flex-wrap gap-3">
                {units.map((unit) => (
                  <FilterChip key={unit} label={unit} active={form.unit === unit} onPress={() => update('unit', unit)} />
                ))}
              </View>
            </View>

            <Input value={form.category} onChangeText={(value) => update('category', value)} placeholder="Category" />
            <Input value={form.location} onChangeText={(value) => update('location', value)} placeholder="Location" />
          </View>
        </Card>

        <Card>
          <View className="gap-4">
            <Text className="text-lg font-bold text-slate-900">Listing image</Text>
            <Button label={image ? 'Replace image' : 'Pick image'} variant="secondary" onPress={pickImage} />
            {image ? (
              <Image source={{ uri: image }} className="h-56 w-full rounded-3xl bg-slate-100" />
            ) : (
              <Text className="text-sm text-slate-500">Add one image for the mobile seller card and product detail view.</Text>
            )}
          </View>
        </Card>

        <Button
          label={listingMutation.isPending ? (isEditing ? 'Saving...' : 'Creating...') : (isEditing ? 'Save changes' : 'Create listing')}
          onPress={() => listingMutation.mutate()}
          disabled={!canSubmit || listingMutation.isPending}
        />
      </View>
    </Screen>
  );
}

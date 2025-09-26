import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Linking } from 'react-native';

// START NEW IMPORT
import * as tf from '@tensorflow/tfjs'
import '@tensorflow/tfjs-react-native';
import { bundleResourceIO, decodeJpeg, fetch } from '@tensorflow/tfjs-react-native';
import * as ImageManipulator from 'expo-image-manipulator'; // Import ImageManipulator for format conversion
import * as FileSystem from 'expo-file-system'; // Import FileSystem for reading binary data
// END NEW IMPORT


const { height } = Dimensions.get('window');

const PlantDesc = ({ route }) => {

  const { photoUri } = route.params;
  const [plantInfo, setPlantInfo] = useState(null);

  // START NEW
  const [loading, setLoading] = useState(true); // buat jadi tanda biar pas detection process jalan, screen bisa nunggu dulu (misal nampilin text "processing image")
  const [status, setStatus] = useState() // biar user bisa tau aja skrng di code nya lg jalan apa (ex: load model, process image, predicting, etc)

  // Class mapping
  // ini tau class nya dari dokumentasi nya model yang dipakai, total ada 7 kelas
  // di list class nya disini karena modelnya itu cmn bsa ngereturn index dari class nya, ga bisa namanya langsung
  // makanya kita mesti buat sendiri disini, buat dapetin namanya based on the index
  const classNames = {
    1: 'common guava',
    2: 'ivy tree',
    3: 'garden geranium',
    4: 'painters palette',
    5: 'ti',
    6: 'callistemon hybridus',
    7: 'sago cycad',
  };

  // disini proses load model dan image detectionnya jalan pertama kali
  useEffect(() => {

    const loadModelAndPredict = async () => {
      try {
        await tf.ready();

        // Load the model
        setStatus('Loading model...')
        const modelJson = require('./assets/model.json');
        const modelWeights = require('./assets/group1-shard1of1.bin');
        const model = await tf.loadGraphModel(bundleResourceIO(modelJson, modelWeights));

        // ini buat ngecilin size aja biar prosesnya ga gtu lama
        const manipulateResult = await ImageManipulator.manipulateAsync(
          photoUri,
          [{ resize: { width: 224, height: 224 } }], // Resize before processing
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
        );

        setStatus('Preprocessing image...')
        // Preprocess the image
        // ini format imangenya ada yang perlu di adjust buat diproses lebih lanjut
        const arrayBuffer = await FileSystem.readAsStringAsync(manipulateResult.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const raw = Uint8Array.from(atob(arrayBuffer), (c) => c.charCodeAt(0));

        const imageTensor = decodeJpeg(raw)
          .resizeBilinear([224, 224]) // Resize to 224x224
          .expandDims(0) // Add batch dimension
          .toInt()

        setStatus('Making prediction...')

        // Make a prediction
        const predictions = await model.executeAsync(imageTensor);
        const predictedClassIndicesTensor = predictions[0];
        const predictedClassIndicesArray = await predictedClassIndicesTensor.array();

        const flatClassIndices = predictedClassIndicesArray.flat();
        const classIndexFrequency = {};
        flatClassIndices.forEach((classIndex) => {
          classIndexFrequency[classIndex] = (classIndexFrequency[classIndex] || 0) + 1;
        });
        const mostFrequentClassIndex = Object.keys(classIndexFrequency).reduce((a, b) =>
          classIndexFrequency[a] > classIndexFrequency[b] ? a : b
        );
        const predictedPlantName = classNames[mostFrequentClassIndex];

        // Prediction Explanation:
        /*
           bakal keliatan kalau dia returnnya itu berupa array. jadi dia bakal ngereturn 100 angka berupa array.
           terus tar kita liat dari 100 itu angka apa yang paling banyak muncul.
           angka yang muncul ini range 1-7.
            angka yang paling banyak muncul berarti dia detectnya itu classnya.
        */

        // Clean up tensors > biar ga terlalu penuh aja, jadi di 'clean' gitu
        predictions.forEach((tensor) => tensor.dispose());
        imageTensor.dispose();

        // kalo udah dapet nama plantnya, manggi fungsi fetchPlant buat ambil data dari Wikipedia
        // disini kita ngepass nama plantnya
        if (predictedPlantName) {
          await fetchPlantInfo(predictedPlantName);
        }
      } catch (error) {
        console.error('Error in prediction:', error);
      }
    };

    if (photoUri) {
      loadModelAndPredict();
    }
  }, [photoUri]);

  // END NEW

  const fetchPlantInfo = async (scientificName) => {
    try {
      const wikiResponse = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${scientificName}`);
      const wikiData = await wikiResponse.json();

      const wikidataId = wikiData.wikibase_item;
      const wikidataResponse = await fetch(`https://www.wikidata.org/wiki/Special:EntityData/${wikidataId}.json`);
      const wikidata = await wikidataResponse.json();

      const entity = wikidata.entities[wikidataId];

      const order = entity.claims['P70']?.[0]?.mainsnak?.datavalue?.value?.text || 'N/A'; // P70 = Order
      const family = entity.claims['P71']?.[0]?.mainsnak?.datavalue?.value?.text || 'N/A'; // P71 = Family
      const genus = entity.claims['P74']?.[0]?.mainsnak?.datavalue?.value?.text || 'N/A'; // P74 = Genus

      const plantInfo = {
        title: wikiData.title,
        extract: wikiData.extract || 'No description available.',
        order: order,
        family: family,
        genus: genus,
        englishName: wikiData.displaytitle || 'Unknown Common Name',
        wikipediaUrl: wikiData.content_urls?.desktop?.page || '',
      };
      setPlantInfo(plantInfo);
    } catch (error) {
      console.error('Error fetching plant info:', error);
    } finally {
      setLoading(false);
    };
  }

  const navigation = useNavigation();

  const handleViewOnWikipedia = () => {
    if (plantInfo && plantInfo.wikipediaUrl) {
      Linking.openURL(plantInfo.wikipediaUrl).catch(err =>
        console.error('Failed to open URL:', err)
      );
    } else {
      console.error('Wikipedia URL not available.');
    }
  };

  return (

    <View style={styles.container}>
      <Image source={{ uri: photoUri }} style={styles.backgroundImage} />
      <View style={styles.overlay} />

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="camera" size={24} color="white" />
      </TouchableOpacity>

      <View style={styles.whiteBackground}>
        <ScrollView contentContainerStyle={styles.scrollContent}>

          {/* NEW : ini buat nampilin tampilan kalau datanya masih processing sama kalau udah kelar.
          jadi biar layarnya ga kosong/item aja si kesannya
          */}

          {loading ? (
            // When loading, show the status
            <Text style={styles.scientificName}>{status}</Text>
          ) : (
            // When finished loading, display plant information
            <>
              <Text style={styles.scientificName}>{plantInfo.title}</Text>
              <Text style={styles.englishName}>
                {plantInfo.englishName || 'Unknown Common Name'}
              </Text>
              <View style={styles.divider} />
              <View style={styles.infoContainer}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Order:</Text>
                  <Text style={styles.infoValue}>{plantInfo.order || 'N/A'}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Family:</Text>
                  <Text style={styles.infoValue}>{plantInfo.family || 'N/A'}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Genus:</Text>
                  <Text style={styles.infoValue}>{plantInfo.genus || 'N/A'}</Text>
                </View>
              </View>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.sectionContent}>{plantInfo.extract || 'N/A'}</Text>
            </>
          )}
        </ScrollView>

        {/* BUTTON ONLY AVAILABLE IF DATA ALREADY LOADED */}
        {!loading && (
          <TouchableOpacity style={styles.wikipediaButton} onPress={handleViewOnWikipedia}>
            <Text style={styles.wikipediaButtonText}>View on Wikipedia</Text>
          </TouchableOpacity>
        )}

      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  backButton: {
    position: 'absolute',
    top: 50,
    marginLeft: 15,
    zIndex: 10,
    padding: 8,
  },

  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    zIndex: 0,
  },
  overlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1,
  },
  whiteBackground: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: height * 0.8,
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    zIndex: 2,
    overflow: 'hidden',
  },
  scrollContent: {
    padding: 16,
  },
  scientificName: {
    fontSize: 28,
    fontWeight: 'bold',
    fontStyle: 'italic',
    color: 'black',
    marginBottom: 4,
    margin: 20,
  },
  englishName: {
    fontSize: 16,
    color: 'gray',
    marginHorizontal: 20,

  },
  divider: {
    height: 1,
    backgroundColor: 'gray',
    marginVertical: 12,
    marginHorizontal: 20,
  },
  infoContainer: {

    backgroundColor: 'white',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 8,
    marginBottom: 0,
    marginHorizontal: 20,
  },
  infoItem: {
    borderWidth: 1,
    borderColor: '#86AB88',
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 16,
    marginHorizontal: 4,
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#86AB88',
  },
  infoValue: {
    fontSize: 14,
    color: '#86AB88',
    fontWeight: 'bold',
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
    marginVertical: 8,
    marginHorizontal: 20,
  },
  sectionContent: {
    fontSize: 16,
    color: 'black',
    lineHeight: 22,
    marginBottom: 16,
    marginHorizontal: 20,
    textAlign: 'justify',
  },
  wikipediaButton: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    backgroundColor: '#86AB88',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  wikipediaButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  placeholderText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default PlantDesc

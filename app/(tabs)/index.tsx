import React, { useState, useEffect } from 'react';
import { 
  View, TextInput, Text, FlatList, StyleSheet, Platform, KeyboardAvoidingView, TouchableOpacity, Animated 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts, PlayfairDisplay_400Regular } from '@expo-google-fonts/playfair-display';
import AppLoading from 'expo-app-loading';

const NotesScreen = () => {
  const [note, setNote] = useState('');
  const [notes, setNotes] = useState<string[]>([]);
  const fadeAnim = new Animated.Value(0);
  const titleColor = new Animated.Value(0);

  let [fontsLoaded] = useFonts({
    PlayfairDisplay: PlayfairDisplay_400Regular,
  });

  useEffect(() => {
    loadNotes();
    animateTitle();
  }, []);

  const animateTitle = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(titleColor, { toValue: 1, duration: 800, useNativeDriver: false }),
        Animated.timing(titleColor, { toValue: 0, duration: 800, useNativeDriver: false })
      ])
    ).start();
  };

  const addNote = async () => {
    if (!note.trim()) return;
    const updatedNotes = [...notes, note];
    setNotes(updatedNotes);
    setNote('');
    await AsyncStorage.setItem('notes', JSON.stringify(updatedNotes));
  };

  const loadNotes = async () => {
    try {
      const savedNotes = await AsyncStorage.getItem('notes');
      setNotes(savedNotes ? JSON.parse(savedNotes) : []);
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  if (!fontsLoaded) {
    return <AppLoading />;
  }

  const titleInterpolation = titleColor.interpolate({
    inputRange: [0, 1],
    outputRange: ['#FF006E', '#3A86FF'] // Skift farve fra pink til elektrisk blå
  });

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <Animated.Text style={[styles.title, { color: titleInterpolation }]}>
        NOTES
      </Animated.Text>
      
      <TextInput
        style={styles.input}
        placeholder="Drop a thought..."
        placeholderTextColor="#222"
        value={note}
        onChangeText={setNote}
      />

      <TouchableOpacity style={styles.button} onPress={addNote}>
        <Text style={styles.buttonText}>BLAST IT</Text>
      </TouchableOpacity>

      <FlatList
        data={notes}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={[
            styles.noteCard, 
            { 
              backgroundColor: noteColors[index % noteColors.length], 
              transform: [{ rotate: `${Math.random() * 10 - 5}deg` }], 
              padding: Math.random() > 0.5 ? 15 : 25 // Variation i note-størrelse
            }
          ]}>
            <Text style={styles.noteText}>{item}</Text>
          </View>
        )}
      />
    </KeyboardAvoidingView>
  );
};

const noteColors = ['#FF006E', '#FB5607', '#FFBE0B', '#8338EC', '#3A86FF'];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FDE74C', // Sagmeister gul baggrund
    alignItems: 'center',
  },
  title: {
    fontSize: 72,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 30,
    fontFamily: 'PlayfairDisplay',
    textTransform: 'uppercase',
    letterSpacing: -2, // Kompakt typografi
  },
  input: {
    borderWidth: 2,
    borderColor: '#000',
    backgroundColor: '#FFFFFF',
    borderRadius: 50,
    padding: 20,
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    width: '90%',
    marginBottom: 20, // Mere luft mellem input og knap
  },
  button: {
    backgroundColor: '#3A86FF', // Elektrisk blå knap
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 50,
    alignItems: 'center',
    marginBottom: 30,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  noteCard: {
    borderRadius: 20,
    marginVertical: 8,
    width: '80%', // Giver notes mere variation
    alignSelf: 'center',
  },
  noteText: {
    fontSize: 20,
    color: '#000',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default NotesScreen;






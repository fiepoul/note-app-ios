import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  Text,
  FlatList,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  TouchableOpacity,
  Animated,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  useFonts,
  PlayfairDisplay_400Regular,
} from "@expo-google-fonts/playfair-display";
import AppLoading from "expo-app-loading";
import { IndieFlower_400Regular } from "@expo-google-fonts/indie-flower";

const NotesScreen = () => {
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState<string[]>([]);
  const fadeAnim = new Animated.Value(0);
  const titleColor = new Animated.Value(0);

  let [fontsLoaded] = useFonts({
    PlayfairDisplay: PlayfairDisplay_400Regular,
    IndieFlower: IndieFlower_400Regular,
  });

  useEffect(() => {
    loadNotes();
    animateTitle();
  }, []);

  const animateTitle = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(titleColor, {
          toValue: 1,
          duration: 800,
          useNativeDriver: false,
        }),
        Animated.timing(titleColor, {
          toValue: 0,
          duration: 800,
          useNativeDriver: false,
        }),
      ])
    ).start();
  };

  const addNote = async () => {
    if (!note.trim()) return;
    const updatedNotes = [...notes, note];
    setNotes(updatedNotes);
    setNote("");
    await AsyncStorage.setItem("notes", JSON.stringify(updatedNotes));
  };

  const clearNotes = async () => {
    try {
      await AsyncStorage.removeItem("notes");
      setNotes([]);
    } catch (error) {
      console.error("Error clearing notes:", error);
    }
  };

  const loadNotes = async () => {
    try {
      const savedNotes = await AsyncStorage.getItem("notes");
      setNotes(savedNotes ? JSON.parse(savedNotes) : []);
    } catch (error) {
      console.error("Error loading notes:", error);
    }
  };

  if (!fontsLoaded) {
    return <AppLoading />;
  }

  const titleInterpolation = titleColor.interpolate({
    inputRange: [0, 1],
    outputRange: ["#FF006E", "#3A86FF"],
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
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

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={addNote}>
          <Text style={styles.buttonText}>BLAST IT</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#8338EC" }]}
          onPress={clearNotes}
        >
          <Text style={styles.buttonText}>CLEAR ALL</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notes}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View
            style={[
              styles.noteCard,
              {
                backgroundColor: noteColors[index % noteColors.length],
                transform: [{ rotate: `${Math.random() * 10 - 5}deg` }],
                padding: Math.random() > 0.5 ? 5 : 5,
                marginTop: index === 0 ? 20 : 0,
              },
            ]}
          >
            <Text style={styles.noteText}>{item}</Text>
          </View>
        )}
      />
    </KeyboardAvoidingView>
  );
};

const noteColors = ["#FF006E", "#FB5607", "#FFBE0B", "#8338EC", "#3A86FF"];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#FDE74C",
    alignItems: "center",
  },
  title: {
    fontSize: 72,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 10,
    fontFamily: "PlayfairDisplay",
    textTransform: "uppercase",
    letterSpacing: -2,
  },
  input: {
    borderWidth: 2,
    borderColor: "#000",
    backgroundColor: "#FFFFFF",
    borderRadius: 50,
    padding: 20,
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    width: "90%",
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#3A86FF",
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 50,
    alignItems: "center",
    marginBottom: 10,
    flex: 1,
    marginHorizontal: 5,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  noteCard: {
    borderRadius: 20,
    marginVertical: 2,
    width: "80%",
    alignSelf: "center",
  },
  noteText: {
    fontSize: 18,
    fontFamily: "IndieFlower",
    color: "#000",
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default NotesScreen;

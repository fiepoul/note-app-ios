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
import { MaterialIcons } from "@expo/vector-icons";
import { useFonts, PlayfairDisplay_400Regular } from "@expo-google-fonts/playfair-display";
import AppLoading from "expo-app-loading";
import { IndieFlower_400Regular } from "@expo-google-fonts/indie-flower";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { app, db } from "../../firebaseConfig";
import { Easing } from "react-native-reanimated";

const noteColors = ["#FF006E", "#FB5607", "#FFBE0B", "#8338EC", "#3A86FF"];

type NoteType = {
  id: string;
  text: string;
};

const NotesScreen = () => {
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState<NoteType[]>([]);
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editedText, setEditedText] = useState<string>("");
  const titleColor = new Animated.Value(0);
  const flowerAnim = new Animated.Value(0);

  let [fontsLoaded] = useFonts({
    PlayfairDisplay: PlayfairDisplay_400Regular,
    IndieFlower: IndieFlower_400Regular,
  });

  useEffect(() => {
    loadNotes();
    animateTitle();
    animateFlower();
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

  const animateFlower = () => {
    Animated.loop(
      Animated.timing(flowerAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  };

  const addNote = async () => {
    if (!note.trim()) return;
    try {
      const newNoteRef = await addDoc(collection(db, "notes"), { text: note });
      setNotes((prevNotes) => [...prevNotes, { id: newNoteRef.id, text: note }]);
      setNote("");
    } catch (error) {
      console.error("Error adding note:", error);
    }
  };

  const deleteNote = async (id: string) => {
    try {
      await deleteDoc(doc(db, "notes", id));
      setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
      setExpandedNoteId(null);
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  const saveEditedNote = async (id: string) => {
    try {
      await updateDoc(doc(db, "notes", id), { text: editedText });
      setNotes((prevNotes) =>
        prevNotes.map((note) =>
          note.id === id ? { ...note, text: editedText } : note
        )
      );
      setEditingNoteId(null);
      setEditedText("");
    } catch (error) {
      console.error("Error saving edited note:", error);
    }
  };

  const loadNotes = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "notes"));
      const notesList: NoteType[] = querySnapshot.docs.map((docItem) => ({
        id: docItem.id,
        text: docItem.data().text,
      }));
      setNotes(notesList);
    } catch (error) {
      console.error("Error loading notes:", error);
    }
  };

  if (!fontsLoaded) {
    return <AppLoading />;
  }

  const flowerSpin = flowerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <Animated.Text
        style={[
          styles.title,
          {
            color: titleColor.interpolate({
              inputRange: [0, 1],
              outputRange: ["#FF006E", "#3A86FF"],
            }),
          },
        ]}
      >
        NOTES
      </Animated.Text>

      <TextInput
        style={styles.input}
        placeholder="Drop a thought..."
        placeholderTextColor="#222"
        value={note}
        onChangeText={setNote}
        multiline
        textAlignVertical="top"
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={addNote}>
          <Text style={styles.buttonText}>BLAST IT!!!!!!</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notes}
        numColumns={2}
        keyExtractor={(item) => item.id}
        columnWrapperStyle={styles.columnWrapper}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={
              expandedNoteId === item.id
                ? [
                    styles.expandedNoteCard,
                    {
                      backgroundColor:
                        noteColors[index % noteColors.length],
                    },
                  ]
                : [
                    styles.noteCard,
                    {
                      backgroundColor:
                        noteColors[index % noteColors.length],
                      transform: [
                        { rotate: `${Math.random() * 10 - 5}deg` },
                        { translateY: Math.random() * 10 - 5 },
                        { translateX: Math.random() * 10 - 5 },
                      ],
                    },
                  ]
            }
            onPress={() =>
              setExpandedNoteId(expandedNoteId === item.id ? null : item.id)
            }
          >
            {editingNoteId === item.id ? (
              <TextInput
                style={styles.editInput}
                value={editedText}
                onChangeText={setEditedText}
                multiline
                textAlignVertical="top"
              />
            ) : (
              <Text
                style={styles.expandedNoteText}
                numberOfLines={expandedNoteId === item.id ? undefined : 1}
              >
                {expandedNoteId === item.id
                  ? item.text
                  : item.text?.length > 20
                  ? `${item.text.substring(0, 20)}...`
                  : item.text}
              </Text>
            )}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                onPress={() => {
                  setEditingNoteId(item.id);
                  setEditedText(item.text);
                }}
              >
                <MaterialIcons name="edit" size={16} color="#000" />
              </TouchableOpacity>
              {editingNoteId === item.id && (
                <TouchableOpacity
                  onPress={() => saveEditedNote(item.id)}
                  style={styles.saveIcon}
                >
                  <MaterialIcons name="save" size={16} color="#000" />
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => deleteNote(item.id)}>
                <MaterialIcons name="delete" size={16} color="#000" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />
    </KeyboardAvoidingView>
  );
};

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
    borderRadius: 5,
    padding: 20,
    fontSize: 16,
    fontFamily: "IndieFlower",
    textAlign: "left",
    width: "90%",
    minHeight: 100,
    marginBottom: 20,
    textAlignVertical: "top",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    width: "90%",
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#3A86FF",
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  noteCard: {
    borderRadius: 0,
    marginVertical: 10,
    width: "48%",
    padding: 15,
    justifyContent: "center",
  },
  expandedNoteCard: {
    borderRadius: 0,
    marginVertical: 10,
    width: "100%",
    padding: 20,
    justifyContent: "center",
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
  expandedNoteText: {
    fontSize: 18,
    fontFamily: "IndieFlower",
    color: "#000",
    fontWeight: "bold",
    textAlign: "left",
  },
  editInput: {
    borderWidth: 1,
    borderColor: "#000",
    backgroundColor: "#FFF",
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    fontFamily: "IndieFlower",
    minHeight: 100,
    textAlignVertical: "top",
  },
  saveIcon: {
    marginLeft: 5,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
    alignItems: "center",
    gap: 5,
  },
});

export default NotesScreen;


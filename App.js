import React, { useState, useEffect } from 'react';
import { Button, Image, View, Platform, Alert} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
import { Audio } from 'expo-av';
import firebase from './src/fire';

export default function ImagePickerExample() {
  const [image, setImage] = useState(null);
  const [recording, setRecording] = React.useState();
  const recordingSettings = {
    android: {
      extension: ".m4a",
      outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
      audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
      sampleRate: 44100,
      numberOfChannels: 2,
      bitRate: 128000,
    },
    ios: {
      extension: ".m4a",
      outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC,
      audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_MIN,
      sampleRate: 44100,
      numberOfChannels: 2,
      bitRate: 128000,
      linearPCMBitDepth: 16,
      linearPCMIsBigEndian: false,
      linearPCMIsFloat: false,
    },
  };

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          alert('Sorry, we need camera roll permissions to make this work!');
        }
      }
    })();
  }, []);

  pickImage = async () => {
   let result = await ImagePicker.launchImageLibraryAsync(
    {
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    }
   );
 
    console.log(result.uri);

    if (!result.cancelled) {
      this.uploadImage(result.uri);
    }
  };

  uploadImage = async (urii) =>{
    const response = await fetch(urii);
    const blob = await response.blob();
    var ref  = firebase.storage().ref().child('videos/');
    
    return ref.put(blob);
    
  }
  const [sound, setSound] = React.useState();


  async function startRecording() {
    try {
      console.log('Requesting permissions..');
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      }); 
      console.log('Starting recording..');
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(recordingSettings);
      
      await recording.startAsync(); 
      setRecording(recording);
      console.log('Recording started');
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  async function stopRecording() {
    console.log('Stopping recording..');
    setRecording(undefined);
    await recording.stopAndUnloadAsync();
    const urii = recording.getURI(); 
    this.uploadImage(urii);
    playSound(urii);
    console.log('url cache', urii);
  }
  async function playSound(urii) {
    console.log('Loading Sound');
    console.log('teste play',urii);

    //const { sound } = await Audio.Sound();

     const { sound: playbackObject } = await Audio.Sound.createAsync(
      { uri: urii },
     { shouldPlay: true }
    );
    await playbackObject.loadAsync();
    await playbackObject.playAsync();
    // await sound.loadAsync({uri:urii},{}, true);
    // await sound.playAsync();
    //await soundObject.playAsync();
    // var arr = uri.toString().split("/");
    // var filename= arr[arr.length-1];
    // console.log(filename);     
    // await sound.loadAsync(require(FileSystem.documentDirectory+filename));
    //setSound(sound);

    console.log('Playing Sound');
    
  }
  React.useEffect(() => {
    return sound
      ? () => {
          console.log('Unloading Sound');
          sound.unloadAsync(); }
      : undefined;
  }, [sound]);
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Button title="clique para selecionar video" onPress={this.pickImage} />
      {image && <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />}
      <Button title="Reproduzir Audio" onPress={playSound} />
      <Button
        title={recording ? 'Stop Recording' : 'Start Recording'}
        onPress={recording ? stopRecording : startRecording}
      />
    </View>
    
  );
}

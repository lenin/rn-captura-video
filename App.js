import React, { useState, useEffect } from 'react';
import { Text, View, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Camera } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import * as Permissions from 'expo-permissions';

const App = function () {
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraRef, setCameraRef] = useState(null)
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Permissions.askAsync(Permissions.CAMERA, Permissions.AUDIO_RECORDING);
      setHasPermission(status === 'granted');
    })();
  }, []);

  if (hasPermission === null) {
    return <View />;
  }

  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  if (processing) {
    return <View style={styles.container}><ActivityIndicator size="large" color="#0000ff" /></View>;
  }

  return (
    <View style={styles.container}>
      <Camera style={{ flex: 1 }} type={type} ref={ref => {
        setCameraRef(ref);
      }}>
        <View
          style={{
            flex: 1,
            backgroundColor: 'transparent',
            justifyContent: 'flex-end'
          }}>
          <View style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-evenly'
          }}>
            <TouchableOpacity
              style={{
                flex: 0.1,
                alignSelf: 'flex-end'
              }}
              onPress={() => {
                setType(
                  type === Camera.Constants.Type.back
                    ? Camera.Constants.Type.front
                    : Camera.Constants.Type.back
                );
              }}>
              <Ionicons name={Platform.OS === 'ios' ? "ios-reverse-camera" : 'md-reverse-camera'} size={40} color="white" />

            </TouchableOpacity>
            <TouchableOpacity style={{ alignSelf: 'center' }} onPress={async () => {
              if (cameraRef) {
                let photo = await cameraRef.takePictureAsync();
                console.log('photo', photo);
              }
            }}>
              <View style={{
                borderWidth: 2,
                borderRadius: 25,
                borderColor: 'white',
                height: 50,
                width: 50,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
              >
                <View style={{
                  borderWidth: 2,
                  borderRadius: 25,
                  borderColor: 'white',
                  height: 40,
                  width: 40,
                  backgroundColor: 'white'
                }} >
                </View>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={{ alignSelf: 'center' }} onPress={async () => {
              if (!recording) {
                setRecording(true)
                let video = await cameraRef.recordAsync();
                console.log('video', video);

                setRecording(false);
                setProcessing(true);

                const data = new FormData();
                data.append("video", {
                  name: "mobile-video-upload",
                  type: 'video/mp4',
                  uri: video.uri
                });

                try {
                  await fetch('http://59931e77dda7.ngrok.io/api/upload', {
                    method: "post",
                    body: data
                  });
                } catch (e) {
                  console.error(e);
                }

                setProcessing(false);
              } else {
                setRecording(false);
                cameraRef.stopRecording();
              }
            }}>
              <View style={{
                borderWidth: 2,
                borderRadius: 25,
                borderColor: 'red',
                height: 50,
                width: 50,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
              >
                <View style={{
                  borderWidth: 2,
                  borderRadius: 25,
                  borderColor: recording ? "blue" : 'red',
                  height: 40,
                  width: 40,
                  backgroundColor: recording ? "blue" : 'red'
                }} >
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Camera>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center"
  },
});

export default App;
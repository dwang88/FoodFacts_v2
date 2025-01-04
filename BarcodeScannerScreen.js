import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function BarcodeScannerScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [facing, setFacing] = useState('back'); // 'front' or 'back'

  const handleBarCodeScanned = ({ data }) => {
    setScanned(true);
    navigation.navigate('Details', { barcode: data });
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text>We need your permission to use the camera</Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing={facing}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'ean8', 'upc_e', 'code39', 'code93', 'code128', 'qr'],
        }}
      >
        {/* Corner Overlay */}
        <View style={styles.overlay}>
          <View style={styles.cornerTopLeft} />
          <View style={styles.cornerTopRight} />
          <View style={styles.cornerBottomLeft} />
          <View style={styles.cornerBottomRight} />
        </View>

        {/* Circle Button */}
        <View style={styles.overlay}>
          {scanned && (
            <TouchableOpacity
              onPress={() => setScanned(false)}
              style={styles.outerCircle}
            >
              <View style={styles.middleCircle}>
                <View style={styles.innerCircle} />
              </View>
            </TouchableOpacity>
          )}
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  cornerTopLeft: {
    position: 'absolute',
    top: '40%',
    left: '15%',
    width: 30,
    height: 30,
    borderLeftWidth: 3,
    borderTopWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.5)', // Semi-transparent white
  },
  cornerTopRight: {
    position: 'absolute',
    top: '40%',
    right: '15%',
    width: 30,
    height: 30,
    borderRightWidth: 3,
    borderTopWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.5)', // Semi-transparent white
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: '40%',
    left: '15%',
    width: 30,
    height: 30,
    borderLeftWidth: 3,
    borderBottomWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.5)', // Semi-transparent white
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: '40%',
    right: '15%',
    width: 30,
    height: 30,
    borderRightWidth: 3,
    borderBottomWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.5)', // Semi-transparent white
  },
  outerCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 50,
  },
  middleCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  permissionButton: {
    padding: 10,
    backgroundColor: 'black',
    borderRadius: 5,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
});

import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Text, Button, Dimensions } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';

export default function Gps() {
  const [recording, setRecording] = useState(false);
  const [locations, setLocations] = useState<Location.LocationObject[]>([]);
  const [distance, setDistance] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permissão negada para acessar localização');
      } else {
        const loc = await Location.getCurrentPositionAsync({});
        setCurrentLocation(loc);
      }
    })();
  }, []);

  const startTracking = async () => {
    setRecording(true);
    setLocations([]);
    setDistance(0);
    setStartTime(Date.now());

    locationSubscription.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Highest,
        timeInterval: 2000,
        distanceInterval: 5,
      },
      (location) => {
        setCurrentLocation(location);
        setLocations((prev) => {
          if (prev.length > 0) {
            const last = prev[prev.length - 1];
            const d = getDistanceFromLatLonInKm(
              last.coords.latitude,
              last.coords.longitude,
              location.coords.latitude,
              location.coords.longitude
            );
            setDistance((total) => total + d);
          }
          return [...prev, location];
        });
      }
    );
  };

  const stopTracking = () => {
    locationSubscription.current?.remove();
    locationSubscription.current = null;
    setRecording(false);
  };

  const getElapsedTime = () => {
    if (!startTime) return 0;
    return Math.floor((Date.now() - startTime) / 1000);
  };

  const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d;
  };

  const deg2rad = (deg: number) => deg * (Math.PI / 180);

  return (
    <View style={styles.container}>
      {currentLocation && (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          }}
          region={{
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          }}
          showsUserLocation
        >
          <Polyline
            coordinates={locations.map(loc => ({
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
            }))}
            strokeColor="#007AFF"
            strokeWidth={5}
          />
        </MapView>
      )}

      <View style={styles.info}>
        <Text>Distância: {distance.toFixed(2)} km</Text>
        <Text>Tempo: {getElapsedTime()} s</Text>
        {recording ? (
          <Button title="Parar" onPress={stopTracking} />
        ) : (
          <Button title="Iniciar" onPress={startTracking} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get('window').width,
    height: '80%',
  },
  info: {
    padding: 16,
  },
});

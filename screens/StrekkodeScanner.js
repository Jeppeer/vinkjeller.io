import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Text,
  ToastAndroid,
  Vibration,
  View
} from "react-native";
import * as firebase from "firebase";
import { api } from "../service/api";
import { produktIdSoek, vinmonopolet_config } from "../service/vinmonopoletApi";
import { opprettProduktBasertPaa } from "./Produkt/ProduktHelper";
import { useFocusEffect } from "@react-navigation/native";
import { colors, spinner } from "../styles/common";
import { Camera } from "expo-camera";
import axios from "axios";

const { width } = Dimensions.get("window");

const StrekkodeScanner = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [mountKamera, setMountKamera] = useState(true);
  let firebaseRef = firebase.database();

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  useFocusEffect(
    useCallback(() => {
      setScanned(false);
      setMountKamera(true);
      return () => {
        setScanned(true);
        setMountKamera(false);
      };
    }, [])
  );

  const handleBarCodeScanned = ({ data }) => {
    Vibration.vibrate(30);
    setScanned(true);
    firebaseRef
      .ref("vinmonopolet_db")
      .orderByChild("HovedGTIN")
      .equalTo(data)
      .once("value")
      .then(resultat => {
        if (resultat.val()) {
          axios
            .all([
              api.get(
                produktIdSoek(Object.values(resultat.val())[0].Varenummer),
                vinmonopolet_config
              ),
              firebaseRef
                .ref("kjeller")
                .orderByChild("produktId")
                .equalTo(Object.values(resultat.val())[0].Varenummer)
                .once("value")
            ])
            .then(
              axios.spread((produkt, kjellerelement) => {
                setMountKamera(false);
                const element = kjellerelement.val()
                  ? Object.entries(kjellerelement.val())[0]
                  : undefined;
                navigation.navigate("Produkt", {
                  produkt: {
                    ...opprettProduktBasertPaa(produkt.data[0]),
                    antallIKjeller: element ? element[1].antallIKjeller : 0,
                    drikkevindu: element ? element[1].drikkevindu : undefined,
                    notat: element ? element[1].notat : ""
                  },
                  produktRef: element && element[0]
                });
              })
            );
        } else {
          ToastAndroid.show("Ingen treff.", ToastAndroid.SHORT);
          setTimeout(() => setScanned(false), 3000);
        }
      });
  };

  if (hasPermission === null) {
    return (
      <View style={spinner}>
        <ActivityIndicator color={colors.primaryButton} size="large" />
      </View>
    );
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={{ flex: 1 }}>
      {mountKamera && (
        <Camera
          type={Camera.Constants.Type.back}
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          ratio="16:9"
          style={[StyleSheet.absoluteFillObject]}
        />
      )}
    </View>
  );
};

export default StrekkodeScanner;

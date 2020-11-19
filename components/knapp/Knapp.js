import React from "react";
import { colors } from "../../styles/common";
import { Pressable, Text, StyleSheet } from "react-native";

const Knapp = ({ styles, onPress, knappetekst }) => {
  return (
    <Pressable
      style={({ pressed }) => [
        {
          backgroundColor: pressed
            ? colors.primaryButtonPressed
            : colors.primaryButton
        },
        knappStyles.knapp,
        styles
      ]}
      onPress={onPress}
    >
      <Text style={{ color: "white" }}>{knappetekst}</Text>
    </Pressable>
  );
};

const knappStyles = StyleSheet.create({
  knapp: {
    borderRadius: 50,
    height: 50,
    padding: 20,
    justifyContent: "center",
    alignItems: "center"
  }
});
export default Knapp;

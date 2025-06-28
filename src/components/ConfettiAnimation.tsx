// src/components/ConfettiAnimation.tsx
import React from 'react';
import LottieView from 'lottie-react-native';
import { StyleSheet, View, ViewStyle } from 'react-native'; // <-- Make sure ViewStyle is imported

const confettiAnimation = require('../../assets/animations/confetti.json');

type ConfettiAnimationProps = {
  style?: ViewStyle;
};

const ConfettiAnimation = ({ style }: ConfettiAnimationProps) => {
  return (
    <View style={[StyleSheet.absoluteFillObject, style]} pointerEvents="none">
      <LottieView
        source={confettiAnimation}
        autoPlay={true}
        loop={true}
        resizeMode="cover"
        style={{ flex: 1 }}
      />
    </View>
  );
};

export default ConfettiAnimation;
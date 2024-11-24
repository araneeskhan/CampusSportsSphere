import * as React from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';

const RippleEffect = ({ children, onPress }) => {
  const [rippleAnim] = React.useState(new Animated.Value(0));

  const startRipple = () => {
    rippleAnim.setValue(0);
    Animated.timing(rippleAnim, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      onPress={() => {
        startRipple();
        if (onPress) onPress();
      }}
      style={styles.pressable}
    >
      {children}
      <Animated.View
        style={[
          styles.ripple,
          {
            opacity: rippleAnim,
            transform: [{ scale: rippleAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 2],
              }) }],
          },
        ]}
      />
    </Pressable>
  );
};

const MyComponent = () => {
  function pressed() {
    console.log('pressed');
  }

  return (
    <View style={styles.container}>
      <RippleEffect onPress={pressed}>
        <Feather
          name="clock"
          size={24}
          color="black"
          style={styles.icon}
        />
      </RippleEffect>
    </View>
  );
};

export default MyComponent;

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  pressable: {
    padding: 10,
    backgroundColor: '#F1F1F1',
    borderRadius: 50,
    overflow: 'hidden',
    position: 'relative',
  },
  ripple: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 50,
    backgroundColor: 'rgba(173, 216, 230, 0.5)', 
  },
});

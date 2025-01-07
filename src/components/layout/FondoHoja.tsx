import { PropsWithChildren } from 'react';
import { View, StyleSheet, ImageBackground } from 'react-native';


const fondo = require("../../assets/fondo.jpg")


export const FondoHoja = ({ children }: PropsWithChildren) => {

  return (
    <View style={styles.fondo}>
      <ImageBackground source={fondo} resizeMode="cover" style={styles.image}>
      {children}
      </ImageBackground>
    </View>
  )
}

const styles = StyleSheet.create({
  fondo: {
    flex: 1,
  },
  image: {
    flex: 1,
    justifyContent: 'flex-start',
  }
})
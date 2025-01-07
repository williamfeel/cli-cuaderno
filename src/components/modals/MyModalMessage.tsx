import { PropsWithChildren, ReactElement, useEffect } from 'react';
import { Keyboard, Modal, StyleSheet, TouchableWithoutFeedback, View } from "react-native";



interface Props {
  modalVisible: boolean;
  children: ReactElement<PropsWithChildren>;
  setModalVisible: (modalVisible: boolean) => void;
  setName?: (name: string) => void;
}



export const MyModalMessage = ({ modalVisible, setModalVisible, setName, children }: Props) => {

  if (modalVisible) {
    setTimeout(() => {
      setModalVisible(false)
      if (setName){setName("")}

    }, 5000);
  }

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        setModalVisible(!modalVisible);
      }}>
      <TouchableWithoutFeedback onPress={() => setModalVisible(!modalVisible)}>
        <View style={styles.centeredView}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            {children}
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  )
}

const styles = StyleSheet.create({

  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 80
  },

})
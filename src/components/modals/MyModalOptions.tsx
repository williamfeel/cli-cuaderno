import { PropsWithChildren, ReactElement } from "react";
import { Keyboard, Modal, StyleSheet, TouchableWithoutFeedback, View } from "react-native";


interface Props {
  modalVisible: boolean;
  children: ReactElement<PropsWithChildren>;
  setModalVisible: (modalVisible: boolean) => void;
}

export const MyModalOptions = ({ modalVisible, setModalVisible, children }: Props) => {

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        setModalVisible(!modalVisible);
      }}>
      <TouchableWithoutFeedback onPress={()=>setModalVisible(!modalVisible)}>
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
    justifyContent: 'center',
    alignItems: 'center',
  },

})
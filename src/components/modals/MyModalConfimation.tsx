import { Keyboard, Modal, Pressable, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";



interface Props {
  modalVisible: boolean;
  setModalVisible: (modalVisible: boolean) => void;
  onSubmit: () => void;
}



export const MyModalConfimation = ({ modalVisible, setModalVisible, onSubmit }: Props) => {



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
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(!modalVisible)}>
                  <Text style={{ fontSize: 18 }}>❌</Text>
                </TouchableOpacity>
                <Text style={styles.textStyle}>Confirme para borrar!</Text>
                <TouchableOpacity
                  style={styles.button2}
                  onPress={() => { onSubmit(), setModalVisible(!modalVisible) }}>
                  <Text style={{color:"white", fontWeight:"bold"}}>Aceptar</Text>
                </TouchableOpacity>
              </View>
            </View>
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
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10, // Alineación en la esquina superior derecha
    zIndex: 10, // Asegura que esté por encima del contenido
  },
  button2: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    backgroundColor: '#094293',
    marginHorizontal: 10,
    marginTop: 10
  },
  textStyle: {
    fontSize: 20,
  }

})
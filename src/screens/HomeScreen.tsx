import { useContext, useState } from "react"
import { Button, FlatList, Modal, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, Vibration, View } from "react-native"
import { databaseContext } from "../context/DatabaseProvider"
import { FondoHoja } from "../components/layout/FondoHoja"
import { MyModalMessage } from "../components/modals/MyModalMessage"
import { MyModalOptions } from "../components/modals/MyModalOptions"
import { NavigationProp, useNavigation } from "@react-navigation/native"
import { RootStackParams } from "../navigation/MyStackNavigation"
import { MyModalConfimation } from "../components/modals/MyModalConfimation"


export const HomeScreen = () => {

  const { insertClient, clients, deleteClient, updateClient, transacciones } = useContext(databaseContext)

  const [name, setName] = useState('')
  const [nameUpdate, setNameUpdate] = useState('')
  const [modalVisible, setModalVisible] = useState(false)
  const [modalVisible2, setModalVisible2] = useState(false)
  const [modalVisible3, setModalVisible3] = useState(false)
  const [visibleAgregar, setVisibleAgregar] = useState(false)
  const [itemUpdate, setItemUpdate] = useState(0)
  const [focused, setFocused] = useState(false)
  const [messageModal, setMessageModal] = useState("")


  const onSubmitAgregar = () => {

    let repetidoLst = clients?.map(e => (e.name?.toLowerCase()))
    let repetido = repetidoLst?.includes(name.toLowerCase())

    if (!visibleAgregar) {
      setVisibleAgregar(!visibleAgregar)
    } else {
      if (name === "") {
        setVisibleAgregar(!visibleAgregar)
      } else {
        if (repetido) {
          setMessageModal("El nombre ya existe!")
          setModalVisible(true)

        } else {
          let nameTrim = name.trim()
          insertClient(nameTrim)
          setMessageModal(`${name} se ha añadido a la libreta ✌️`)
          setVisibleAgregar(!visibleAgregar)
          setModalVisible(true)
        }
      }
    }
  }

  const onSubmitEditar = () => {

    let repetidoLst = clients?.map(e => (e.name?.toLowerCase()))
    let repetido = repetidoLst?.includes(nameUpdate.toLowerCase())

    if (nameUpdate === "") {
      return
    } else {
      if (repetido) {
        setMessageModal("El nombre ya existe!")
        setModalVisible(true)

      } else {
        updateClient(itemUpdate, nameUpdate.trim())
        setMessageModal(`${nameUpdate} se ha actualizado ✌️`)
        setModalVisible2(false)
        setModalVisible(true)
      }
    }

  }

  const onSubmitBorrar = () => {

    deleteClient(itemUpdate)
    setModalVisible2(false) 
    setMessageModal(`${nameUpdate} se ha borrado de la libreta ✌️`)
    setModalVisible(true)
  }


  const balance = (id: number | undefined) => {

    if (id === undefined) { return 0 }

    let lst = transacciones?.filter(e => (e.client_id === id))
    let sumaMonto = lst?.reduce((a, b) => (a + (b.monto ? b.monto : 0)), 0)
    return sumaMonto || 0
  }

  const balanceTotal  = () => {
    let sumaMontoTotal = transacciones?.reduce((a, b) => (a + (b.monto ? b.monto : 0)), 0)
    return sumaMontoTotal || 0
  }


  const navigation = useNavigation<NavigationProp<RootStackParams>>();

  return (
    <FondoHoja>
      <MyModalMessage modalVisible={modalVisible} setModalVisible={setModalVisible} setName={setName}>
        <Text style={styles.modalMessage}>{messageModal}</Text>
      </MyModalMessage>
      <MyModalConfimation modalVisible={modalVisible3} setModalVisible={setModalVisible3} onSubmit={onSubmitBorrar}/>
      <MyModalOptions modalVisible={modalVisible2} setModalVisible={setModalVisible2}>
        <View style={styles.modalView}>
          <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible2(false)}>
            <Text style={styles.closeText}>❌</Text>
          </TouchableOpacity>
          <TextInput
            value={nameUpdate}
            onChangeText={value => setNameUpdate(value)}
            style={[styles.TextInput, focused && { borderBottomColor: "blue" }, { width: "100%" }]}
            cursorColor={"blue"}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
          <View style={{ flexDirection: "row", marginTop: 20, justifyContent: "space-around", width: "100%" }}>
            <Pressable
              style={[styles.button2, styles.buttonClose]}
              onPress={() => onSubmitEditar()}>
              <Text style={styles.textStyle}>Editar</Text>
            </Pressable>
            <Pressable
              style={[styles.button2, styles.buttonClose]}
              onPress={() => { setModalVisible2(false), setModalVisible3(true) }}>
              <Text style={styles.textStyle}>Borrar</Text>
            </Pressable>
          </View>
        </View>
      </MyModalOptions>
      <View style={{height:20}}/>
      {visibleAgregar ?
        <TextInput
          value={name}
          onChangeText={value => setName(value)}
          placeholder="Nombre"
          style={[styles.TextInput, { borderBottomColor: focused ? "blue" : "gray" }]}
          cursorColor={"blue"}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        : null}
      <View style={styles.buttonInput} />
      <TouchableOpacity
        onPress={() => onSubmitAgregar()}
        style={styles.button}
      >
        <Text style={{ fontSize: 20, textAlign: "center", color:"black", fontWeight:"bold" }}>{visibleAgregar ? "Guardar" : "➕"}</Text>
      </TouchableOpacity>
      {
        !clients
          ?
          <Text>Cargando...</Text>
          : (
            <FlatList
              data={clients}
              keyExtractor={(item) => (item.id ? item.id.toString() : 'undefined')}
              renderItem={({ item }) =>
                <View style={styles.itemBox}>
                    <Pressable
                      onPress={() => navigation.navigate('CuadernoScreen', { id: item.id && item.id.toString() || 0, name: item.name && item.name || "" })}
                      onLongPress={() => { (item.name && setNameUpdate(item.name), item.id && setItemUpdate(item.id), setModalVisible2(true)), Vibration.vibrate(200) }}>
                      <View style={{flexDirection:"row", justifyContent:"space-between"}}>
                        <Text style={styles.textLista}>{item.name}</Text>
                        <Text style={[styles.textLista, {color: balance(item.id) < 0  ? "red" : balance(item.id)>0 ? "green":"black"}]}>{balance(item.id)?.toLocaleString("en-US")}</Text>
                      </View>
                    </Pressable>
                </View>
              }
            />)
      }
      <Pressable style={styles.btnBalanceTotal} onPress={() => navigation.navigate('LibroScreen')}>
        <Text style={{ fontSize: 22, fontWeight: "semibold" }}>Balance Total = </Text>
        <Text style={{ fontSize: 22, fontWeight: "semibold", color: balanceTotal() < 0  ? "red" : balanceTotal() > 0 ? "green" : "black" }}>{balanceTotal()?.toLocaleString("en-US")}</Text>
      </Pressable>
    </FondoHoja>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  textTitle: {
    fontSize: 20,
    color: 'black',
    fontWeight: 'bold',
    textAlign: "center"
  },
  buttonInput: {
    marginTop: 2,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    backgroundColor: 'rgb(246,246,246)',
    marginHorizontal: 10
  },
  TextInput: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
    fontSize: 20,
    marginHorizontal: 10,
  },
  modalMessage: {
    fontWeight: "bold",
    backgroundColor: "black",
    color: "white",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 25
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
    width: "80%"
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  button2: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10, // Alineación en la esquina superior derecha
    zIndex: 10, // Asegura que esté por encima del contenido
  },
  closeText: {
    fontSize: 18,
  },
  textLista: {
    fontSize: 22,
    paddingHorizontal: 10,
    paddingVertical: 10
  },
  itemBox: {
    marginHorizontal: 10,
    marginVertical: 5,
    paddingVertical: 5,
    backgroundColor: "rgb(246,246,246)",
    elevation: 5
  },
  btnBalanceTotal: {
    flexDirection:"row", 
    marginHorizontal:10, 
    marginBottom:20, 
    paddingVertical:10, 
    alignContent:"center", 
    backgroundColor:"rgb(246,246,246)",
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    justifyContent:"space-between"

  }
})
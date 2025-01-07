import { useContext, useState } from "react"
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native"
import { FondoHoja } from "../components/layout/FondoHoja"
import { DateTime } from 'luxon';
import { databaseContext } from "../context/DatabaseProvider"
import { MyModalMessage } from "../components/modals/MyModalMessage"
import { MyModalConfimation } from "../components/modals/MyModalConfimation"


type TipoType = "Ingreso" | "Egreso"

type CategoriaType = "Préstamo" | "Devolución"

interface ValuesType {
  monto: string;
  fecha: DateTime<true> | DateTime<false>;
  descripcion: string;
  tipo: TipoType | undefined;
  categoria: CategoriaType | undefined;
}


export const LibroScreen = () => {


  const { clients, transacciones, deleteTransaccion } = useContext(databaseContext)

  const [modalVisible, setModalVisible] = useState(false)
  const [modalVisible3, setModalVisible3] = useState(false)
  const [messageModal, setMessageModal] = useState("")
  const [tansaccionId, setTransaccionId] = useState(0)


  const transaccionesByClient = () => {

    let organizarListaFecha = transacciones?.sort((a, b) => {
      return a.fecha && b.fecha && a.fecha > b.fecha ? -1 : a.fecha && b.fecha && a.fecha < b.fecha ? 1 : 0
    }
    )
    return organizarListaFecha
  }


  const formatFecha = (fecha: string | undefined) => {
    if (!fecha) { return "" }
    let nuevaFecha = DateTime.fromISO(fecha)
    return nuevaFecha.setLocale("es").toLocaleString(DateTime.DATE_HUGE)
  }

  const balance = () => {

    let sumaMonto = transacciones?.reduce((a, b) => (a + (b.monto ? b.monto : 0)), 0)
    return sumaMonto || 0
  }

  const onSubmitBorrar = (transaccionId: number) => {
    console.log(transaccionId)
    deleteTransaccion(transaccionId)
    setMessageModal("Transaccione borrada ✌️")
    setModalVisible3(false)
    setModalVisible(true)
  }

  const nombreCliente = (id: number | undefined) => {
    if (!id) { return "" }
    let cliente = clients?.find(e => e.id === id)
    return cliente?.name
  }

  return (
    <FondoHoja>
      <MyModalMessage modalVisible={modalVisible} setModalVisible={setModalVisible}>
        <Text style={styles.modalMessage}>{messageModal}</Text>
      </MyModalMessage>
      <MyModalConfimation modalVisible={modalVisible3} setModalVisible={setModalVisible3} onSubmit={() => onSubmitBorrar(tansaccionId)} />
      <Text style={styles.textTitle}>Todos los Cuadernos</Text>
      <FlatList
        data={transaccionesByClient()}
        keyExtractor={(item) => (item.id ? item.id.toString() : 'undefined')}
        renderItem={({ item }) =>
          <Pressable onLongPress={() => { setTransaccionId(item.id || 0), setModalVisible3(true) }}>
            <View style={styles.itemBox}>
              <Text style={styles.listText}>{formatFecha(item.fecha)}</Text>
              <Text style={{fontWeight:"bold"}}>{nombreCliente(item.client_id)}</Text>
              <Text>{item.descripcion}</Text>
              <Text>{item.tipo}: {item.categoria}</Text>
              <Text style={[styles.montoStyle, { color: item.tipo === "Ingreso" ? "red" : "green" }]}>{item.monto?.toLocaleString("en-US")}</Text>
            </View>
          </Pressable>
        }
      />
      <Pressable style={styles.btnBalanceTotal} onLongPress={() => { }}>
        <Text style={{ fontSize: 22, fontWeight: "semibold" }}>Balance Total = </Text>
        <Text style={{ fontSize: 22, fontWeight: "semibold", color: balance() < 0 ? "red" : balance() > 0 ? "green" : "black" }}>{balance()?.toLocaleString("en-US")}</Text>
      </Pressable>
    </FondoHoja>
  )
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 10,
  },
  input: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
    fontSize: 20,
    marginVertical: 10,
  },
  textTitle: {
    fontSize: 20,
    color: 'black',
    fontWeight: 'bold',
    textAlign: "center",
    marginVertical: 10
  },
  textError: {
    color: "red",
    fontWeight: "bold",
  },
  boxButton: {
    flexDirection: "row",
    marginVertical: 10,
  },
  button: {
    alignItems: 'center',
    backgroundColor: 'rgb(246,246,246)',
    height: 50,
    elevation: 2,
  },
  button2: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    backgroundColor: 'rgb(246,246,246)',
    marginHorizontal: 10
  },
  textStyle: {
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10, // Alineación en la esquina superior derecha
    zIndex: 10, // Asegura que esté por encima del contenido
  },
  listText: {
    fontSize: 18
  },
  itemBox: {
    marginHorizontal: 10,
    marginVertical: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: "rgb(246,246,246)",
    elevation: 5
  },
  montoStyle: {
    position: 'absolute',
    fontWeight: "bold",
    bottom: 10,
    right: 10, // Alineación en la esquina superior derecha
    zIndex: 10, // Asegura que esté por encima del contenido
  },
  modalMessage: {
    fontWeight: "bold",
    backgroundColor: "black",
    color: "white",
    paddingHorizontal: 20,
    paddingVertical: 20
  },
  btnBalanceTotal: {
    flexDirection: "row",
    marginHorizontal: 10,
    marginBottom: 20,
    paddingVertical: 10,
    alignContent: "center",
    backgroundColor: "rgb(246,246,246)",
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    justifyContent: "space-between"

  }
})
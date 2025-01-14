import { useContext, useState } from "react"
import { Button, FlatList, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import DatePicker from "react-native-date-picker"
import { Formik, FormikErrors, FormikValues } from "formik"
import { FondoHoja } from "../components/layout/FondoHoja"
import { DateTime } from 'luxon';
import { databaseContext, SqliteItemPropsTransacciones } from "../context/DatabaseProvider"
import { type RootStackParams } from "../navigation/MyStackNavigation"
import { type NativeStackScreenProps } from "@react-navigation/native-stack"
import { MyModalMessage } from "../components/modals/MyModalMessage"
import { MyModalConfimation } from "../components/modals/MyModalConfimation"
import { createPDFCuaderno } from "../helper/createPdf"

interface Props extends NativeStackScreenProps<RootStackParams, "CuadernoScreen"> { }

type TipoType = "Ingreso" | "Egreso"

type CategoriaType = "Préstamo" | "Devolución"

interface ValuesType {
  monto: string;
  fecha: DateTime<true> | DateTime<false>;
  descripcion: string;
  tipo: TipoType | undefined;
  categoria: CategoriaType | undefined;
}

interface ValidMontoProps {
  monto: string;
  setFieldValue: (field: string, value: any, shouldValidate?: boolean) => Promise<void | FormikErrors<ValuesType>>

}

export const CuadernoScreen = ({ route }: Props) => {

  const { id, name } = route.params;

  const { addTransaction, transacciones, deleteTransaccion } = useContext(databaseContext)

  const [validar, setValidar] = useState(false)
  const [focused, setFocused] = useState("")
  const [openDate, setOpenDate] = useState(false)
  const [openHora, setOpenHora] = useState(false)
  const [limitNum, setLimitNum] = useState(30)
  const [registrar, setRegistrar] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [modalVisible3, setModalVisible3] = useState(false)
  const [messageModal, setMessageModal] = useState("")
  const [tansaccionId, setTransaccionId] = useState(0)
  const [isPosting, setIsPosting] = useState(false)


  const transaccionesByClient = () => {

    let listTransacciones = transacciones?.filter(e => e.client_id?.toString() === id)
    let organizarListaFecha = listTransacciones?.sort((a, b) => {
      return a.fecha && b.fecha && a.fecha > b.fecha ? -1 : a.fecha && b.fecha && a.fecha < b.fecha ? 1 : 0
    }
    )
    return organizarListaFecha
  }


  const validamosValues = (values: ValuesType) => {

    let errors: FormikErrors<FormikValues> = {}
    if (values.monto === '') {
      errors.monto = 'Required'
    }
    if (values.descripcion === "") {
      errors.descripcion = "Required"
    }
    if (!values.tipo) { errors.tipo = "Required" }
    if (!values.categoria) { errors.categoria = "Required" }
    return errors
  }

  const validaMonto = ({ monto, setFieldValue }: ValidMontoProps) => {

    if (monto.includes(".")) {
      let indice = monto.indexOf(".")
      setLimitNum(indice + 3)

    } else { setLimitNum(30) }

    const numero = monto.replace(/[^\d.]/g, '');
    const partes = numero.split('.');
    console.log(partes)
    if (partes.length > 2) { partes.pop() }
    partes[0] = partes[0].replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
    const newValor = partes.join('.');
    setFieldValue("monto", newValor)
  }

  const formatFecha = (fecha: string | undefined) => {
    if (!fecha) { return "" }
    let nuevaFecha = DateTime.fromISO(fecha)
    return nuevaFecha.setLocale("es").toLocaleString(DateTime.DATE_HUGE)
  }

  const balance = () => {

    if (id === undefined) { return 0 }

    let lst = transacciones?.filter(e => (e.client_id?.toString() === id))
    let sumaMonto = lst?.reduce((a, b) => (a + (b.monto ? b.monto : 0)), 0)
    return sumaMonto || 0
  }

  const onSubmitBorrar = (transaccionId: number) => {
    console.log(transaccionId)
    deleteTransaccion(transaccionId)
    setMessageModal("Transaccione borrada ✌️")
    setModalVisible3(false)
    setModalVisible(true)
  }

  return (
    <FondoHoja>
      <MyModalMessage modalVisible={modalVisible} setModalVisible={setModalVisible}>
        <Text style={styles.modalMessage}>{messageModal}</Text>
      </MyModalMessage>
      <MyModalConfimation modalVisible={modalVisible3} setModalVisible={setModalVisible3} onSubmit={() => onSubmitBorrar(tansaccionId)} />
      <View style={styles.container}>
        <Text style={styles.textTitle}>Cuaderno: {name}</Text>
        <Formik
          initialValues={{
            monto: '',
            fecha: DateTime.now().setZone('America/Bogota'),
            descripcion: '',
            tipo: undefined,
            categoria: undefined,
          }}

          validate={validamosValues}

          onSubmit={(values, actions) => {

            let newValuesReq: SqliteItemPropsTransacciones = {}

            newValuesReq["tipo"] = values.tipo
            newValuesReq["client_id"] = Number(id)
            newValuesReq["categoria"] = values.categoria
            newValuesReq["descripcion"] = values.descripcion
            newValuesReq["fecha"] = values.fecha.toString()
            if (values.tipo === "Ingreso") {
              newValuesReq["monto"] = Number(values.monto.replace(/,/g, "")) * -1
            } else {
              newValuesReq["monto"] = Number(values.monto.replace(/,/g, ""))
            }
            addTransaction(newValuesReq)
            actions.resetForm()
            setRegistrar(false)
            setMessageModal("Transacción guardada ✌️")
            setModalVisible(true)

          }}
        >
          {({ handleChange, handleSubmit, values, errors, setFieldValue }) => (
            <View>
              {registrar && (
                <View>
                  <TouchableOpacity style={styles.closeButton} onPress={() => setRegistrar(!registrar)}>
                    <Text style={{ fontSize: 18 }}>❌</Text>
                  </TouchableOpacity>
                  <View style={styles.boxButton}>
                    <Pressable
                      style={[styles.button2, values.tipo === "Ingreso" && { backgroundColor: "#cf1020" }, validar && (errors.tipo && { borderColor: "red", borderWidth: 1 })]}
                      onPress={() => { setFieldValue("tipo", "Ingreso") }}>
                      <Text style={[styles.textStyle, values.tipo === "Ingreso" && { color: "white" }]}>Ingreso</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.button2, values.tipo === "Egreso" && { backgroundColor: "#4d8c57" }, validar && errors.tipo && { borderColor: "red", borderWidth: 1 }]}
                      onPress={() => { setFieldValue("tipo", "Egreso") }}>
                      <Text style={[styles.textStyle, values.tipo === "Egreso" && { color: "white" }]}>Egreso</Text>
                    </Pressable>
                  </View>
                  <TextInput
                    maxLength={limitNum}
                    onChangeText={value => validaMonto({ monto: value, setFieldValue: setFieldValue })}
                    keyboardType="numeric"
                    placeholder="Valor"
                    value={values.monto}
                    style={[styles.input, validar && errors.monto && { borderColor: "red" }, focused === "monto" && { borderColor: "blue" }]}
                    onFocus={() => setFocused("monto")}
                    onBlur={() => setFocused("")}
                  />
                  <View style={styles.boxButton}>
                    <Pressable
                      style={[styles.button2, values.categoria === "Préstamo" && { backgroundColor: "#094293" }, validar && (errors.categoria && { borderColor: "red", borderWidth: 1 })]}
                      onPress={() => { setFieldValue("categoria", "Préstamo") }}>
                      <Text style={[styles.textStyle, values.categoria === "Préstamo" && { color: "white" }]}>Préstamo</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.button2, values.categoria === "Devolución" && { backgroundColor: "#094293" }, validar && (errors.categoria && { borderColor: "red", borderWidth: 1 })]}
                      onPress={() => { setFieldValue("categoria", "Devolución") }}>
                      <Text style={[styles.textStyle, values.categoria === "Devolución" && { color: "white" }]}>Devolución</Text>
                    </Pressable>
                  </View>
                  <TextInput
                    onChangeText={handleChange('descripcion')}
                    placeholder="Detalle"
                    value={values.descripcion}
                    style={[styles.input, validar && errors.descripcion && { borderColor: "red" }, focused === "descripcion" && { borderColor: "blue" }]}
                    onFocus={() => setFocused("descripcion")}
                    onBlur={() => setFocused("")}
                  />
                  <View style={{ flexDirection: "row", justifyContent: "space-around", marginVertical: 10 }}>
                    <Pressable onPress={() => setOpenDate(true)}>
                      <View style={[styles.button2, { flexDirection: "row" }]}>
                        <Text style={{ marginHorizontal: 5 }}>📆</Text>
                        <Text>{values.fecha.setLocale('es').toLocaleString(DateTime.DATE_HUGE)}</Text>
                      </View>
                    </Pressable>
                    <Pressable onPress={() => setOpenHora(true)}>
                      <View style={[styles.button2, { flexDirection: "row" }]}>
                        <Text style={{ marginHorizontal: 5 }}>⌚</Text>
                        <Text>{values.fecha.setLocale('es').toLocaleString(DateTime.TIME_SIMPLE)}</Text>
                      </View>
                    </Pressable>
                  </View>
                  <DatePicker
                    mode="date"
                    modal
                    open={openDate}
                    date={new Date((values.fecha.toFormat("yyyy-MM-dd HH:mm:ss")))}
                    onConfirm={(newDate) => {
                      setOpenDate(false)
                      setFieldValue("fecha", DateTime.fromJSDate(newDate))
                    }}
                    onCancel={() => {
                      setOpenDate(false)
                    }}
                  />
                  <DatePicker
                    mode="time"
                    modal
                    open={openHora}
                    date={new Date((values.fecha.toFormat("yyyy-MM-dd HH:mm:ss")))}
                    onConfirm={(newTime) => {
                      setOpenHora(false)
                      setFieldValue("fecha", DateTime.fromJSDate(newTime))
                    }}
                    onCancel={() => {
                      setOpenHora(false)
                    }}
                  />
                </View>
              )}
              <TouchableOpacity
                onPress={() => {
                  if (!registrar) {
                    setRegistrar(true)
                  } else {
                    setValidar(true)
                    handleSubmit()
                  }
                }
                }
                style={styles.button2}
              >
                <Text style={{ fontSize: 20, textAlign: "center", fontWeight: "bold" }}>{registrar ? "Guardar" : "➕"}</Text>
              </TouchableOpacity>
            </View>
          )}
        </Formik>
      </View >
      <FlatList
        data={transaccionesByClient()}
        keyExtractor={(item) => (item.id ? item.id.toString() : 'undefined')}
        renderItem={({ item }) =>
          <Pressable onLongPress={() => { setTransaccionId(item.id || 0), setModalVisible3(true) }}>
            <View style={styles.itemBox}>
              <Text style={styles.listText}>{formatFecha(item.fecha)}</Text>
              <Text>{item.descripcion}</Text>
              <Text>{item.tipo}: {item.categoria}</Text>
              <Text style={[styles.montoStyle, { color: item.tipo === "Ingreso" ? "red" : "green" }]}>{item.monto?.toLocaleString("en-US")}</Text>
            </View>
          </Pressable>
        }
      />
      <Pressable
        style={styles.btnBalanceTotal}
        onLongPress={() => {createPDFCuaderno({ transacciones, name, setIsPosting }), setIsPosting(true)}}
        disabled={isPosting}
      >
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
    paddingVertical: 20,
    borderRadius: 25
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
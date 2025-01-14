import { Alert } from "react-native";
import { DateTime } from "luxon";
import type { SqliteItemProps, SqliteItemPropsTransacciones } from "../context/DatabaseProvider";
import RNHTMLtoPDF from 'react-native-html-to-pdf';


interface PropsTodos {
  clients: SqliteItemProps[] | undefined,
  transacciones: SqliteItemPropsTransacciones[] | undefined,
  setIsPosting: (x:boolean)=>void
}

interface PropsCuadernos {
  transacciones: SqliteItemPropsTransacciones[] | undefined,
  name: string,
  setIsPosting: (x:boolean)=>void
}

export const createPDFLibro = async ({clients, transacciones, setIsPosting}: PropsTodos) => {


  const formatFecha = (fecha: string | undefined) => {
    if (!fecha) { return "" }
    let nuevaFecha = DateTime.fromISO(fecha)
    return nuevaFecha.setLocale('es').toLocaleString(DateTime.DATE_SHORT)
  }
  const formatHora = (fecha: string | undefined) => {
    if (!fecha) { return "" }
    let nuevaFecha = DateTime.fromISO(fecha)
    return nuevaFecha.setLocale('es').toLocaleString(DateTime.TIME_SIMPLE)
  }

  const fechaActual = DateTime.now().toUTC().setZone('America/Bogota')
  const fechaActualString = fechaActual.setLocale('es').toLocaleString(DateTime.DATE_HUGE)

  const nombreCliente = (id: number | undefined) => {
    if (!id) { return "" }
    let cliente = clients?.find(e => e.id === id)
    return cliente?.name
  }
  
  const balance = () => {

    let sumaMonto = transacciones?.reduce((a, b) => (a + (b.monto ? b.monto : 0)), 0)
    console.log(sumaMonto)
    return sumaMonto || 0
  }
  

  let tableRows = transacciones?.map((row, index) =>
  `<tr>
  <td>${index + 1}</td>
  <td>${formatFecha(row.fecha)}</td>
  <td>${formatHora(row.fecha)}</td>
  <td>${nombreCliente(row.client_id)}</td>
  <td>${row.tipo}</td>
  <td>${row.categoria}</td>
  <td>${row.descripcion}</td>
  <td>${row.monto}</td>
  </tr>
    `).join('')


  let htmlContent = `
      <html>
        <head>
          <style>
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th, td {
              border: 1px solid black;
              padding: 8px;
              text-align: center;
            }
            th {
              background-color: #f1f1f1;
            }
          </style>
        </head>
        <body>
          <table>
            <h1>Todos los Registros Existentes</h1>
            <h3>${fechaActualString}</h3>
            <thead>
              <tr>
                <th>No.</th>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Categoría</th>
                <th>Descripción</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
              <tr>
                <td>Total</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td>${balance()}</td>
              </tr>
            </tbody>
          </table>
        </body>
      </html>
    `;
  const timestamp = new Date().toISOString().replace(/[-:.]/g, '-');
  const fileName = `table_${timestamp}`;
  try {

    console.log("hola muindo")

    let options = {
      html: htmlContent,
      fileName: fileName,
      directory: 'Cuaderno',
    };

    let file = await RNHTMLtoPDF.convert(options);

    Alert.alert('PDF creado', `El PDF ha sido guardado en: ${file.filePath}`);
    setIsPosting(false)

  } catch (error) {
    console.error(error);
    Alert.alert('Error', 'Hubo un error al crear el PDF');
  }

};

export const createPDFCuaderno = async ({transacciones, name, setIsPosting}: PropsCuadernos) => {


  const formatFecha = (fecha: string | undefined) => {
    if (!fecha) { return "" }
    let nuevaFecha = DateTime.fromISO(fecha)
    return nuevaFecha.setLocale('es').toLocaleString(DateTime.DATE_SHORT)
  }
  const formatHora = (fecha: string | undefined) => {
    if (!fecha) { return "" }
    let nuevaFecha = DateTime.fromISO(fecha)
    return nuevaFecha.setLocale('es').toLocaleString(DateTime.TIME_SIMPLE)
  }

  const fechaActual = DateTime.now().toUTC().setZone('America/Bogota')
  const fechaActualString = fechaActual.setLocale('es').toLocaleString(DateTime.DATE_HUGE)
  
  
  const balance = () => {

    let sumaMonto = transacciones?.reduce((a, b) => (a + (b.monto ? b.monto : 0)), 0)
    console.log(sumaMonto)
    return sumaMonto || 0
  }
  

  let tableRows = transacciones?.map((row, index) =>
  `<tr>
  <td>${index + 1}</td>
  <td>${formatFecha(row.fecha)}</td>
  <td>${formatHora(row.fecha)}</td>
  <td>${row.tipo}</td>
  <td>${row.categoria}</td>
  <td>${row.descripcion}</td>
  <td>${row.monto}</td>
  </tr>
    `).join('')


  let htmlContent = `
      <html>
        <head>
          <style>
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th, td {
              border: 1px solid black;
              padding: 8px;
              text-align: center;
            }
            th {
              background-color: #f1f1f1;
            }
          </style>
        </head>
        <body>
          <table>
            <h1>Todos los Registros del cuaderno: ${name}</h1>
            <h3>${fechaActualString}</h3>
            <thead>
              <tr>
                <th>No.</th>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Tipo</th>
                <th>Categoría</th>
                <th>Descripción</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
              <tr>
                <td>Total</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td>${balance()}</td>
              </tr>
            </tbody>
          </table>
        </body>
      </html>
    `;
  const timestamp = new Date().toISOString().replace(/[-:.]/g, '-');
  const fileName = `table_${timestamp}`;
  try {

    let options = {
      html: htmlContent,
      fileName: fileName,
      directory: 'Cuaderno',
    };

    let file = await RNHTMLtoPDF.convert(options);

    Alert.alert('PDF creado', `El PDF ha sido guardado en: ${file.filePath}`);

    setIsPosting(true)

  } catch (error) {
    console.error(error);
    Alert.alert('Error', 'Hubo un error al crear el PDF');
  }

};
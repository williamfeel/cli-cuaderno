import { useContext } from "react";
import { DateTime } from "luxon";
import { databaseContext } from "../context/DatabaseProvider";
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import { Alert } from "react-native";

interface PropsCuadernostodos {
  
}

export const createPDFVentas = async () => {

  const {clients, transacciones} = useContext(databaseContext)

  const formatFecha = (fecha: string | undefined) => {
    if (!fecha) { return "" }
    let nuevaFecha = DateTime.fromISO(fecha)
    return nuevaFecha.setLocale("es").toLocaleString(DateTime.DATE_SHORT)
  }
  const formatHora = (fecha: string | undefined) => {
    if (!fecha) { return "" }
    let nuevaFecha = DateTime.fromISO(fecha)
    return nuevaFecha.setLocale("es").toLocaleString(DateTime.TIME_SIMPLE)
  }

  const fechaActual = DateTime.now().toUTC().setZone('America/Bogota')
  const fechaActualString = fechaActual.setLocale("es").toLocaleString(DateTime.DATE_HUGE)

  const nombreCliente = (id: number | undefined) => {
    if (!id) { return "" }
    let cliente = clients?.find(e => e.id === id)
    return cliente?.name
  }

  const balance = () => {

    let sumaMonto = transacciones?.reduce((a, b) => (a + (b.monto ? b.monto : 0)), 0)
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
            <h3>fecha: ${fechaActualString}</h3>
            <thead>
              <tr>
                <th>No.</th>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Categoría</th>
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
                <td>${balance}</td>
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
      directory: 'Candy',
    };

    let file = await RNHTMLtoPDF.convert(options);

    Alert.alert('PDF creado', `El PDF ha sido guardado en: ${file.filePath}`);
  } catch (error) {
    console.error(error);
    Alert.alert('Error', 'Hubo un error al crear el PDF');
  }
};
import React, { createContext, PropsWithChildren, useEffect, useState } from "react"
import { NitroSQLiteConnection, open, SQLiteItem } from "react-native-nitro-sqlite";


interface DatabaseContextType {
  insertClient: (name: string) => void;
  getClients: () => void;
  deleteClient: (id: number) => void;
  updateClient: (id: number, name: string) => void;
  addTransaction: (client: SqliteItemPropsTransacciones) => void;
  deleteTransaccion: (id: number | undefined) => void;

  clients: SqliteItemProps[] | undefined;
  transacciones: SqliteItemPropsTransacciones[] | undefined;
}

export interface SqliteItemProps extends SQLiteItem {
  id?: number;
  name?: string;
}

export interface SqliteItemPropsTransacciones extends SQLiteItem {
  id?: number;
  client_id?: number;
  fecha?: string;
  descripcion?: string;
  monto?: number;
  tipo?: string;
  categoria?: string;
}


export const databaseContext = createContext({} as DatabaseContextType)

export const DatabaseProvider = ({ children }: PropsWithChildren) => {

  const [db, setDb] = useState<NitroSQLiteConnection | undefined>()
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [clients, setClients] = useState<SqliteItemProps[] | undefined>([])
  const [transacciones, setTransacciones] = useState<SqliteItemPropsTransacciones[] | undefined>([])



  const databaseConnection = () => {

    try {
      if (!db) {
        const data = open({ name: 'myDb.sqlite' })
        setDb(data)
        setIsConnected(true)
        console.log('Conexión a la base de datos exitosa')
      }
    } catch (error) {
      console.log('Error al conectar a la base de datos', error)
    }
  }
 
  const inicializarBaseDeDatos = async () => {

    try {
      await db?.executeAsync('PRAGMA foreign_keys = ON')
      await db?.executeAsync(`
        CREATE TABLE IF NOT EXISTS clients (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        name TEXT
        )`).then(() => console.log('Tabla clients creada correctamente'))
      await db?.executeAsync(`
        CREATE TABLE IF NOT EXISTS transacciones (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        client_id INTEGER, 
        fecha TEXT NOT NULL, 
        descripcion TEXT, 
        monto REAL NOT NULL, 
        tipo TEXT CHECK (tipo IN ("Ingreso", "Egreso")), 
        categoria TEXT NOT NULL CHECK (categoria IN ("Préstamo", "Devolución")), 
        FOREIGN KEY (client_id) REFERENCES clients (id) ON DELETE CASCADE)`
      ).then(() => console.log('Tabla transacciones creada correctamente'))
      console.log('Base de datos inicializada correctamente!!!')
    } catch (error) {
      console.log('Error al inicializar base de datos', error)
    }
  }

  const deleteClient = async (id: number | undefined) => {
    try {
      await db?.executeAsync('DELETE FROM clients WHERE id = ?', [id])
      await getClients()
      await getTransacciones()
      console.log('Cliente eliminado')
    } catch (error) {
      console.log('Error al eliminar cliente', error)
    }
  }

  const updateClient = async (id: number, name: string) => {
    try {
      await db?.executeAsync('UPDATE clients SET name = ? WHERE id = ?', [name, id])
      console.log('Cliente actualizado')
      getClients()
    } catch (error) {
      console.log('Error al actualizar cliente', error)
    }
  }

  const insertClient = async (name: string) => {
    try {
      await db?.executeAsync('INSERT INTO clients (name) VALUES (?)', [name])
      console.log('Cliente insertado')
      getClients()
    } catch (error) {
      console.log('Error al insertar cliente', error)
    }
  }

  const getClients = async () => {
    try {
      const res = await db?.executeAsync('SELECT * FROM clients', [])
      if (res?.rows?._array) {
        setClients(res?.rows?._array)
      } else { setClients([]) }
      console.log('Clientes obtenidos correctamente')
    } catch (error) {
      console.log('Error al obtener clientes', error)
    }
  }

  const getTransacciones = async () => {
    try {
      const res = await db?.executeAsync('SELECT * FROM transacciones', [])
      if (res?.rows?._array) {
        setTransacciones(res?.rows?._array)
      } else { setTransacciones([]) }
      console.log('Transacciones obtenidas correctamente')
    } catch (error) {
      console.log('Error al obtener transaccionesa', error)
    }
  }


  const addTransaction = async (client: SqliteItemPropsTransacciones) => {
    try {
      await db?.executeAsync(`
      INSERT INTO transacciones (
      client_id, 
      fecha, 
      descripcion, 
      monto, 
      tipo, 
      categoria) 
      VALUES (?, ?, ?, ?, ?, ?)
    `, [client.client_id, client.fecha, client.descripcion, client.monto, client.tipo, client.categoria])

      await getTransacciones()

      console.log('Transacción creada')
    } catch (error) {
      console.log('Error al crear transaccióm', error)
    }
  }

  const deleteTransaccion = async (id?: number | undefined) => {
    try {
      await db?.executeAsync('DELETE FROM transacciones WHERE id = ?', [id])
      getTransacciones()
      console.log('Transacción eliminada')
    } catch (error) {
      console.log('Error al eliminar transacción', error)
    }
  }

  const borrarTabla = async () => {
    try {
      await db?.executeAsync('DROP TABLE transacciones')
      await db?.executeAsync('DROP TABLE clients')
    } catch (error) {
      console.log('Error al borrar tablas', error)
    }
  }

  useEffect(() => {
    // Abrir la base de datos
    if (!db) {
      databaseConnection()
    }

    const setupUpDatabase = async () => {
      if (isConnected) {
        await inicializarBaseDeDatos()
        await getClients()
        await getTransacciones()
      }
    }
    setupUpDatabase()

  }, [isConnected]);


  return (
    <databaseContext.Provider value={{
      getClients,
      clients,
      transacciones,
      addTransaction,
      insertClient,
      deleteClient,
      updateClient,
      deleteTransaccion,
    }}>
      {children}
    </databaseContext.Provider>
  )

} 
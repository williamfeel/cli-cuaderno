
import { DatabaseProvider } from "./src/context/DatabaseProvider"
import { MyStackNavigation } from "./src/navigation/MyStackNavigation"


export const App = () => {

  return (
    <DatabaseProvider>
      <MyStackNavigation />
    </DatabaseProvider>
  )
}
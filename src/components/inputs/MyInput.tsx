import { ReactElement, useEffect } from "react"
import { StyleSheet, TextInput } from "react-native"


interface Props {
  
  name: string;
  props: ReactElement<TextInput>;
  focused: boolean;
  setFocused: (x:boolean)=>void;
  setName: (x:string)=>void;
}






export const MyInput = ({props, name, setName, focused, setFocused}:Props) => {

  <TextInput
    value={name}
    onChangeText={value => setName(value)}
    placeholder="Nombre"
    style={[styles.TextInput, focused && { borderBottomColor: "blue" }]}
    cursorColor={"blue"}
    onFocus={() => setFocused(true)}
    onBlur={() => setFocused(false)}
    {...props}
  />

}

const styles = StyleSheet.create({
  TextInput: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
    fontSize: 20,
    marginHorizontal: 10,
  },
})
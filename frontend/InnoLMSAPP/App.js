import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function App() {
  const [data,setData]=useState([]);
  async function sample(){
      const res=await fetch("http://192.168.9.121:5000/LMS/course",{
        method:"GET",
        headers:{"Content-Type":"application/json"},
      })
      const data=await res.json();
      if(!res.ok){
        console.log("Error");
      }else{
        console.log(data)
        console.log("Excuted")
        setData(data.courses);
      }
  }

  return (
    <View style={styles.container}>
      <Text>Hello from innoknowvex</Text>
      <Pressable onPress={sample}>
        <Text>Click me</Text>
        </Pressable>
        {data.map((course,index)=>(
            <Text key={index}>{course.title}</Text>
        ))}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

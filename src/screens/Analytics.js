import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { db } from "../../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
export default function Analytics(){
  const [count,setCount]=useState(0);
  useEffect(()=>{(async()=>{const s=await getDocs(collection(db,"responses"));setCount(s.size);})();},[]);
  return (<View style={{flex:1,padding:24}}><Text style={{fontSize:20,fontWeight:"600"}}>Analytics (placeholder)</Text><Text>Total responses: {count}</Text></View>);
}

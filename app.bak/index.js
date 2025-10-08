import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function Index() {
  const router = useRouter();

  return (
    <View style={{ flex:1, justifyContent:"center", alignItems:"center", backgroundColor:"#fff" }}>
      <Text style={{ fontSize:22, marginBottom:20 }}>ChampionTrack Pro</Text>
      <TouchableOpacity 
        style={{ padding:15, backgroundColor:"blue", borderRadius:8, marginBottom:10 }}
        onPress={() => router.push("/athlete")}>
        <Text style={{ color:"#fff" }}>Login as Athlete</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={{ padding:15, backgroundColor:"green", borderRadius:8 }}
        onPress={() => router.push("/coach")}>
        <Text style={{ color:"#fff" }}>Login as Coach</Text>
      </TouchableOpacity>
    </View>
  );
}

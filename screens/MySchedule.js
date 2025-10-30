import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, Button } from "react-native";
import { collection, query, where, orderBy, onSnapshot, Timestamp } from "firebase/firestore";
import { db } from "../services/firebaseConfig";

const TEAM_ID = "demo-team";

export default function MySchedule({ navigation }) {
  const [events, setEvents] = useState(null);

  useEffect(function () {
    const now = Timestamp.fromDate(new Date());
    const ref = collection(db, "teams", TEAM_ID, "events");
    const q = query(ref, where("start", ">=", now), where("cancelled", "==", false), orderBy("start", "asc"));
    const unsub = onSnapshot(q, function(snap) {
      const items = [];
      snap.forEach(function(d){ items.push({ id: d.id, ...(d.data() || {}) }); });
      setEvents(items);
    });
    return function(){ unsub(); };
  }, []);

  if (!events) {
    return <ActivityIndicator style={{ marginTop: 40 }} />;
  }

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 12 }}>Mes séances à venir</Text>
      <FlatList
        data={events}
        keyExtractor={function(it){ return it.id; }}
        renderItem={function({ item }) {
          const start = (item.start && item.start.toDate) ? item.start.toDate() : new Date();
          const end = (item.end && item.end.toDate) ? item.end.toDate() : new Date(start.getTime() + 3600000);
          return (
            <View style={{ padding: 12, borderWidth: 1, borderColor: "#ddd", borderRadius: 10, marginBottom: 8 }}>
              <Text style={{ fontWeight: "600" }}>{item.title || "(Sans titre)"}</Text>
              <Text>{start.toLocaleString()} → {end.toLocaleTimeString()}</Text>
              {item.location ? <Text>📍 {item.location}</Text> : null}
              <View style={{ marginTop: 8 }}>
                <Button title="Répondre au questionnaire" onPress={function(){
                  if (navigation && navigation.navigate) {
                    navigation.navigate("Questionnaire", { eventId: item.id, teamId: TEAM_ID });
                  }
                }} />
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}
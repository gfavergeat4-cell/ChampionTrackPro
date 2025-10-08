import React, { useEffect, useMemo, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { auth, db } from "../firebaseConfig";
import { collection, getDocs, addDoc, orderBy, query, serverTimestamp } from "firebase/firestore";

/* ============ Utils temps & semaine ============ */
const DAY_LABELS = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"];
const START_HOUR = 6;   // 06:00
const END_HOUR   = 22;  // 22:00

const toYMD = (d)=> new Date(d).toISOString().slice(0,10);
const mondayOf = (base)=>{
  const b = new Date(base);
  const day = b.getDay(); // 0=dim ... 1=lun
  const diff = (day === 0 ? -6 : 1 - day);
  const m = new Date(b); m.setDate(b.getDate()+diff); m.setHours(0,0,0,0); return m;
};
const addDays = (d,n)=>{ const x=new Date(d); x.setDate(x.getDate()+n); return x; };
const toMinutes = (hhmm)=> {
  if(!hhmm || typeof hhmm !== "string") return null;
  const [h,m] = hhmm.split(":").map(n=> parseInt(n,10));
  if(Number.isNaN(h) || Number.isNaN(m)) return null;
  return h*60 + m;
};
const clamp = (v,a,b)=> Math.max(a, Math.min(b, v));

/* ============ Couleurs �v�nements (hash titre) ============ */
function colorFor(title=""){
  const palette = ["#bfdbfe","#a7f3d0","#fde68a","#fecaca","#ddd6fe","#fbcfe8","#c7d2fe"];
  let h=0; for(const ch of title) h = ((h<<5)-h) + ch.charCodeAt(0);
  return palette[Math.abs(h)%palette.length];
}

/* ============ Layout chevauchements pour 1 journ�e ============ */
function layoutDay(events){
  // events: {startMin,endMin, ...}
  const evs = [...events].sort((a,b)=> (a.startMin??0)-(b.startMin??0));
  const clusters = [];
  let active = [];
  for(const e of evs){
    active = active.filter(x=> (x.endMin??0) > (e.startMin??0));
    if(active.length===0) clusters.push([]);
    clusters[clusters.length-1].push(e);
    active.push(e);
  }
  // Dans chaque cluster: affectation colonnes "greedy"
  clusters.forEach(cluster=>{
    const colEnd = []; // endMin par colonne
    cluster.forEach(e=>{
      let col = 0;
      while(colEnd[col] && (e.startMin??0) < colEnd[col]) col++;
      e._colIndex = col;
      colEnd[col] = e.endMin ?? (e.startMin+60);
    });
    const total = colEnd.length;
    cluster.forEach(e=> e._cols = total);
  });
  return evs;
}

/* ============ Composants ============ */
function HourGutter({ hours, hourHeight }){
  return (
    <View style={{ width: 44 }}>
      {hours.map((h,i)=>(
        <View key={i} style={{ height: hourHeight, alignItems:"flex-end" }}>
          <Text style={{ fontSize:12, color:"#6b7280" }}>{String(h).padStart(2,"0")}:00</Text>
        </View>
      ))}
    </View>
  );
}

function DayColumn({ dayIndex, dateLabel, events, hourHeight, onPressEvent }){
  const topPad = 0;
  const totalMins = (END_HOUR-START_HOUR)*60;
  const laid = useMemo(()=> layoutDay(events), [events]);

  return (
    <View style={{ flex:1, borderLeftWidth:1, borderColor:"#f3f4f6" }}>
      {/* En-t�te du jour */}
      <View style={{ height:36, alignItems:"center", justifyContent:"center", borderBottomWidth:1, borderColor:"#f3f4f6", backgroundColor:"#fafafa" }}>
        <Text style={{ fontWeight:"700" }}>{DAY_LABELS[dayIndex]} <Text style={{ color:"#6b7280" }}>{dateLabel}</Text></Text>
      </View>
      {/* Zone de temps avec lignes horaires */}
      <View style={{ height: totalMins/60*hourHeight, position:"relative" }}>
        {Array.from({length:(END_HOUR-START_HOUR)+1},(_,i)=>(
          <View key={i} style={{ position:"absolute", left:0, right:0, top: i*hourHeight, height:1, backgroundColor:"#f3f4f6" }}/>
        ))}
        {/* �v�nements */}
        {laid.map(ev=>{
          const s = clamp((ev.startMin??(START_HOUR*60)) - START_HOUR*60, 0, totalMins);
          const e = clamp((ev.endMin??(ev.startMin+60)) - START_HOUR*60, 0, totalMins);
          const top = (s/60)*hourHeight + topPad;
          const height = Math.max(18, ((e-s)/60)*hourHeight - 2);
          const widthPct = 100 / (ev._cols||1);
          const leftPct = widthPct * (ev._colIndex||0);
          return (
            <TouchableOpacity key={ev.id}
              onPress={()=> onPressEvent?.(ev)}
              style={{
                position:"absolute", top, left:`${leftPct}%`, width:`${widthPct}%`, height,
                padding:6, borderRadius:8, borderWidth:1, borderColor:"#e5e7eb",
                backgroundColor: colorFor(ev.title)
              }}>
              <Text numberOfLines={1} style={{ fontWeight:"800", fontSize:12 }}>{ev.title||"S�ance"}</Text>
              <Text style={{ fontSize:11, color:"#374151" }}>{ev.start||"?"}�{ev.end||"?"}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function TrainingSchedule(){
  const nav = useNavigation();
  const uid = auth.currentUser?.uid;
  const [loading,setLoading] = useState(true);
  const [sessions,setSessions] = useState([]);
  const [weekStart,setWeekStart] = useState(mondayOf(new Date()));
  const [hourHeight,setHourHeight] = useState(64); // zoom

  // Seed: si aucune session => cr�e L->V cette semaine
  async function seedIfEmpty(){
    if(!uid) return;
    const ref = collection(db,"users",uid,"sessions");
    const snap = await getDocs(ref);
    if(snap.empty){
      const m = mondayOf(new Date());
      const titles = ["Terrain","Renfo","Technico-tactique","Cardio","Mobilit�"];
      for(let i=0;i<5;i++){
        const d = addDays(m,i); const ymd = toYMD(d);
        await addDoc(ref, { date: ymd, start:"18:00", end:"19:15", title: titles[i%titles.length], createdAt: serverTimestamp() });
      }
    }
  }

  async function loadAll(){
    if(!uid){ setSessions([]); setLoading(false); return; }
    setLoading(true);
    try{
      const ref = collection(db,"users",uid,"sessions");
      const qy = query(ref, orderBy("date","asc"));
      const snap = await getDocs(qy);
      const all = snap.docs.map(d=>({ id:d.id, ...d.data() }));
      setSessions(all);
    }catch(e){ console.error(e); Alert.alert("Planning", e?.message || String(e)); }
    setLoading(false);
  }

  useEffect(()=>{ (async()=>{ await seedIfEmpty(); await loadAll(); })(); },[uid]);

  // Filtre les sessions de la semaine affich�e
  const weekDays = useMemo(()=> Array.from({length:7},(_,i)=> addDays(weekStart,i)), [weekStart]);
  const sessionsByDay = useMemo(()=>{
    const map = Array.from({length:7},()=>[]);
    const start = toYMD(weekStart);
    const end = toYMD(addDays(weekStart,7));
    sessions.forEach(s=>{
      const d = new Date(s.date || s.sessionDate || Date.now());
      const ymd = toYMD(d);
      if(ymd >= start && ymd < end){
        const jsDay = d.getDay();              // 0..6 (0 = Dim)
        const idx = (jsDay+6)%7;               // 0..6 (0 = Lun)
        map[idx].push({
          ...s,
          dayIndex: idx,
          startMin: toMinutes(s.start) ?? (START_HOUR*60),
          endMin:   toMinutes(s.end)   ?? (toMinutes(s.start)||START_HOUR*60)+60,
        });
      }
    });
    return map;
  },[sessions, weekStart]);

  function openQuestionnaire(ev){
    nav.navigate("Questionnaire", { session: ev });
  }

  if(loading) return <View style={{ padding:16 }}><ActivityIndicator/><Text style={{ marginTop:6 }}>Chargement�</Text></View>;

  const hours = Array.from({length:(END_HOUR-START_HOUR)},(_,i)=> START_HOUR+i);

  return (
    <View style={{ flex:1, backgroundColor:"#fff" }}>
      {/* Barre de contr�le semaine */}
      <View style={{ padding:10, borderBottomWidth:1, borderColor:"#e5e7eb", backgroundColor:"#f9fafb", flexDirection:"row", alignItems:"center", justifyContent:"space-between" }}>
        <View style={{ flexDirection:"row", alignItems:"center" }}>
          <TouchableOpacity onPress={()=> setWeekStart(addDays(weekStart,-7))}
            style={{ paddingHorizontal:10, paddingVertical:8, borderWidth:1, borderColor:"#e5e7eb", borderRadius:8, marginRight:8 }}>
            <Text>?</Text>
          </TouchableOpacity>
          <Text style={{ fontWeight:"800" }}>Semaine du {weekStart.toLocaleDateString()}</Text>
          <TouchableOpacity onPress={()=> setWeekStart(addDays(weekStart,7))}
            style={{ paddingHorizontal:10, paddingVertical:8, borderWidth:1, borderColor:"#e5e7eb", borderRadius:8, marginLeft:8 }}>
            <Text>?</Text>
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection:"row", alignItems:"center" }}>
          <TouchableOpacity onPress={()=> setWeekStart(mondayOf(new Date()))}
            style={{ paddingHorizontal:10, paddingVertical:8, borderWidth:1, borderColor:"#e5e7eb", borderRadius:8, marginRight:8 }}>
            <Text>Aujourd'hui</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={()=> setHourHeight(h=> Math.max(36, h-8))}
            style={{ paddingHorizontal:10, paddingVertical:8, borderWidth:1, borderColor:"#e5e7eb", borderRadius:8, marginRight:6 }}>
            <Text>-</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={()=> setHourHeight(h=> Math.min(96, h+8))}
            style={{ paddingHorizontal:10, paddingVertical:8, borderWidth:1, borderColor:"#e5e7eb", borderRadius:8 }}>
            <Text>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Grille d�filable H/V */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ minWidth: 820 }}>
        <View style={{ flexDirection:"row", flex:1 }}>
          <HourGutter hours={hours} hourHeight={hourHeight}/>
          <ScrollView style={{ flex:1 }} contentContainerStyle={{ flexDirection:"row", flexGrow:1 }}>
            {weekDays.map((d,idx)=>{
              const dd = d.toLocaleDateString(undefined,{ day:"2-digit", month:"2-digit" });
              return (
                <DayColumn
                  key={idx}
                  dayIndex={idx}
                  dateLabel={dd}
                  events={sessionsByDay[idx]}
                  hourHeight={hourHeight}
                  onPressEvent={openQuestionnaire}
                />
              );
            })}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}
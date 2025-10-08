import React, { useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { auth, db } from "../firebaseConfig";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";

const INDICATORS = [
  { key:"intensity_avg",  label:"Intensit� moy." },
  { key:"intensity_high", label:"Hautes intensit�s" },
  { key:"joint_pain",     label:"Douleurs art." },
  { key:"fatigue",        label:"Fatigue" },
  { key:"duration",       label:"Dur�e per�ue" },
  { key:"cardio_impact",  label:"Impact cardio" },
  { key:"muscle_impact",  label:"Impact musculaire" },
  { key:"technique",      label:"Technique" },
  { key:"tactics",        label:"Tactique" },
  { key:"wellbeing",      label:"Bien-�tre" },
];

const toYMD = (d)=> new Date(d).toISOString().slice(0,10);
const mondayOf = (base)=>{ const b=new Date(base); const day=b.getDay(); const diff=(day===0?-6:1-day); const m=new Date(b); m.setDate(b.getDate()+diff); m.setHours(0,0,0,0); return m; };
const addDays = (d,n)=>{ const x=new Date(d); x.setDate(x.getDate()+n); return x; };
function quantile(xs, q){ if(!xs?.length) return 0; const s=[...xs].sort((a,b)=>a-b); const pos=(s.length-1)*q; const base=Math.floor(pos); const rest=pos-base; return s[base] + (s[base+1]? (s[base+1]-s[base])*rest : 0); }

function Toggle({ on, label, onPress }){
  return (
    <TouchableOpacity onPress={onPress} style={{ paddingHorizontal:10, paddingVertical:8, borderRadius:999,
      marginRight:8, marginBottom:8, borderWidth:1, borderColor: on ? "#059669" : "#e5e7eb", backgroundColor: on ? "#d1fae5" : "#fff" }}>
      <Text style={{ fontWeight:"700", color: on ? "#065f46" : "#111827" }}>{on ? "? " : ""}{label}</Text>
    </TouchableOpacity>
  );
}

function BarChart({ data, height=220, barColor="#2563eb" }){
  const pad = 28; const H = height - pad*2;
  const values = data.map(d=> d.value ?? 0);
  const med = quantile(values, .5), q1 = quantile(values, .25), q3 = quantile(values, .75);

  return (
    <View style={{ borderWidth:1, borderColor:"#e5e7eb", borderRadius:12, padding:12, marginBottom:12 }}>
      <Text style={{ fontWeight:"800", marginBottom:8 }}>SCORE (s�lection)</Text>
      <View style={{ height, position:"relative" }}>
        {[{v:q3,c:"#0f766e"},{v:med,c:"#111827"},{v:q1,c:"#0f766e"}].map((l,i)=>{
          const y = pad + (100-(l.v||0))/100*H;
          return <View key={i} style={{ position:"absolute", left:0, right:0, top:y, height:1, backgroundColor:l.c, borderStyle:"dashed", borderWidth:0.5 }}/>;
        })}
        <View style={{ position:"absolute", left:0, right:0, top:pad, bottom:pad, flexDirection:"row", alignItems:"flex-end" }}>
          {data.map((d,i)=>{
            const h = Math.max(1, (d.value||0)/100*H);
            return <View key={i} style={{ flex:1, alignItems:"center", paddingHorizontal:2 }}>
              <View style={{ width:"80%", height:h, backgroundColor:barColor, borderRadius:6 }}/>
            </View>;
          })}
        </View>
      </View>
      <View style={{ flexDirection:"row", marginTop:8 }}>
        <Text style={{ marginRight:16 }}>M�diane: <Text style={{ fontWeight:"800" }}>{Math.round(med)}</Text></Text>
        <Text style={{ marginRight:16 }}>Q1: <Text style={{ fontWeight:"800" }}>{Math.round(q1)}</Text></Text>
        <Text>Q3: <Text style={{ fontWeight:"800" }}>{Math.round(q3)}</Text></Text>
      </View>
      <View style={{ flexDirection:"row", marginTop:6 }}>
        {data.map((d,i)=>(
          <View key={i} style={{ flex:1, alignItems:"center" }}>
            <Text style={{ fontSize:10, color:"#6b7280" }}>{d.xLabel}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function WeekSummary({ sessions }){
  const start = mondayOf(new Date());
  const days = Array.from({length:7},(_,i)=> addDays(start,i));
  return (
    <View style={{ borderWidth:1, borderColor:"#e5e7eb", borderRadius:12, padding:10 }}>
      <Text style={{ fontWeight:"800", marginBottom:8 }}>Semaine en cours</Text>
      {days.map((d,idx)=>{
        const ymd = toYMD(d);
        const list = sessions.filter(s=> s.date===ymd).sort((a,b)=> String(a.start||"").localeCompare(String(b.start||"")));
        return (
          <View key={idx} style={{ marginBottom:8 }}>
            <Text style={{ fontWeight:"700" }}>{d.toLocaleDateString(undefined,{weekday:"long", day:"2-digit"})}</Text>
            {list.length===0 ? <Text style={{ color:"#9ca3af" }}>�</Text> :
              list.map((s,i)=>(
                <View key={i} style={{ paddingVertical:4, paddingHorizontal:8, backgroundColor:"#f3f4f6", borderRadius:8, marginTop:4 }}>
                  <Text style={{ fontWeight:"700" }}>{s.title||"S�ance"}</Text>
                  <Text style={{ fontSize:12, color:"#374151" }}>{s.start||"?"} - {s.end||"?"}</Text>
                </View>
              ))
            }
          </View>
        );
      })}
    </View>
  );
}

export default function MyData(){
  const uid = auth.currentUser?.uid;
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [answers, setAnswers]   = useState({});
  const [checked, setChecked]   = useState(()=> Object.fromEntries(INDICATORS.map(i=>[i.key, true])));
  const [rangeDays, setRangeDays] = useState(30);

  useEffect(()=>{ (async()=>{
    if(!uid){ setSessions([]); setAnswers({}); setLoading(false); return; }
    setLoading(true);
    try{
      const sesSnap = await getDocs(query(collection(db,"users", uid, "sessions"), orderBy("date","asc")));
      const ses = sesSnap.docs.map(d=> ({ id:d.id, ...d.data() }));
      setSessions(ses);
      const ans = {};
      for (const s of ses){
        const rSnap = await getDocs(query(collection(db,"users", uid, "sessions", s.id, "responses"), orderBy("createdAt","desc"), limit(1)));
        if(!rSnap.empty){ ans[s.id] = rSnap.docs[0].data(); }
      }
      setAnswers(ans);
    }catch(e){ console.error("MyData load:", e); }
    setLoading(false);
  })(); },[uid]);

  const selectedKeys = useMemo(()=> Object.entries(checked).filter(([,v])=>v).map(([k])=>k), [checked]);
  const now = new Date(); const from = addDays(now, -rangeDays);

  const graphData = useMemo(()=>{
    const rows = [];
    sessions.forEach(s=>{
      const d = new Date(s.date || s.sessionDate || Date.now());
      if(d < from || d > now) return;
      const a = answers[s.id]; if(!a) return;
      const vals = selectedKeys.map(k => (typeof a[k]==="number" ? a[k] : null)).filter(v=> v!=null);
      if(!vals.length) return;
      const score = vals.reduce((t,x)=>t+x,0)/vals.length;
      rows.push({ xLabel: d.toLocaleDateString(undefined,{ month:"2-digit", day:"2-digit" }), value: Math.max(0, Math.min(100, score)) });
    });
    return rows;
  },[sessions, answers, selectedKeys.join(","), rangeDays]);

  if(loading) return <View style={{ padding:16 }}><ActivityIndicator/><Text style={{ marginTop:8 }}>Chargement�</Text></View>;

  return (
    <ScrollView style={{ flex:1, backgroundColor:"#fff" }} contentContainerStyle={{ padding:16 }}>
      <Text style={{ fontSize:22, fontWeight:"800", marginBottom:12 }}>Mes donn�es</Text>
      <View style={{ marginBottom:8, flexDirection:"row", flexWrap:"wrap" }}>
        {INDICATORS.map(ind=>(
          <Toggle key={ind.key} label={ind.label} on={!!checked[ind.key]} onPress={()=> setChecked(p=>({ ...p, [ind.key]: !p[ind.key] }))}/>
        ))}
      </View>
      <View style={{ flexDirection:"row", marginBottom:10 }}>
        {[30,60,90].map(d=>(
          <TouchableOpacity key={d} onPress={()=> setRangeDays(d)}
            style={{ paddingHorizontal:10, paddingVertical:8, borderWidth:1, borderColor: rangeDays===d ? "#111827" : "#e5e7eb",
                     backgroundColor: rangeDays===d ? "#111827" : "#fff", borderRadius:8, marginRight:8 }}>
            <Text style={{ color: rangeDays===d ? "#fff" : "#111827", fontWeight:"700" }}>{d} j</Text>
          </TouchableOpacity>
        ))}
      </View>
      <BarChart data={graphData} />
      <WeekSummary sessions={sessions} />
    </ScrollView>
  );
}
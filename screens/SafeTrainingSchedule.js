import React from "react";
import TrainingSchedule from "./TrainingSchedule";

class EB extends React.Component{
  constructor(p){ super(p); this.state={err:null}; }
  static getDerivedStateFromError(e){ return { err: e }; }
  componentDidCatch(e,i){ console.error("TrainingSchedule crashed:", e, i); }
  render(){
    if(this.state.err){
      return (
        <div style={{ padding:16 }}>
          <h3>Erreur dans le Planning</h3>
          <pre style={{ whiteSpace:"pre-wrap", color:"#b91c1c", background:"#fef2f2", padding:12, borderRadius:8 }}>
            {String(this.state.err?.message || this.state.err)}
          </pre>
          <p>Ouvre la console (F12 ? Console) pour le d�tail.</p>
        </div>
      );
    }
    return this.props.children;
  }
}
export default function SafeTrainingSchedule(){
  return <EB><TrainingSchedule/></EB>;
}
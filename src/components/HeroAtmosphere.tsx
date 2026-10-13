"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
/** Original video, muted. No video download under reduced-motion or Save-Data. */
export function HeroAtmosphere(){
  const ref=useRef<HTMLVideoElement>(null),container=useRef<HTMLDivElement>(null);const [allowed,setAllowed]=useState(false),[visible,setVisible]=useState(true),[playing,setPlaying]=useState(false),[pageVisible,setPageVisible]=useState(true);
  useEffect(()=>{
    const connection=(navigator as Navigator&{connection?:{saveData?:boolean;effectiveType?:string}}).connection;
    const update=()=>setAllowed(!matchMedia("(prefers-reduced-motion: reduce)").matches&&document.documentElement.dataset.motion==="running"&&!connection?.saveData&&!/^(slow-)?2g$/.test(connection?.effectiveType||""));
    const timer=setTimeout(update,600);window.addEventListener("rosso:motion",update);
    const io=new IntersectionObserver(entries=>setVisible(entries[0]?.isIntersecting??false),{threshold:0});if(container.current)io.observe(container.current);
    const visibility=()=>{setPageVisible(!document.hidden);if(document.hidden){ref.current?.pause();setPlaying(false);}else update();};document.addEventListener("visibilitychange",visibility);
    return()=>{clearTimeout(timer);io.disconnect();window.removeEventListener("rosso:motion",update);document.removeEventListener("visibilitychange",visibility);};
  },[]);
  useEffect(()=>{const v=ref.current;if(!v)return;if(allowed&&visible&&!document.hidden)void v.play().then(()=>setPlaying(true)).catch(()=>setPlaying(false));else{v.pause();setPlaying(false);}},[allowed,visible,pageVisible]);
  return <div className="estate-hero__image estate-hero__atmosphere" ref={container} aria-hidden="true"><Image src="/media/ingreso-abr.webp" alt="" fill priority sizes="100vw"/>{allowed?<video ref={ref} src="/media/ingreso-abr.mp4" poster="/media/ingreso-abr.webp" muted loop playsInline preload="none" className={playing?"is-playing":""} onCanPlay={()=>{if(visible&&!document.hidden)void ref.current?.play().then(()=>setPlaying(true)).catch(()=>setPlaying(false));}} onError={()=>setPlaying(false)}/>:null}</div>;
}

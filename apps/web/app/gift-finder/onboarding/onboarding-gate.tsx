'use client';
import { useEffect, useState } from 'react';
import { readReveal } from '../gift-finder-state';
export default function OnboardingGate(){const [message,setMessage]=useState('Opening your shortlist…');useEffect(()=>{const reveal=readReveal();if(!reveal){setMessage('That shortlist is no longer in this tab. Returning to WanderWrap…');window.setTimeout(()=>location.replace('/gift-finder'),700);return;}location.replace('/gift-finder/recommendations');},[]);return <div className="onboardingLoading">{message}</div>;}

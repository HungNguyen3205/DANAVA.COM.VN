export const sceneNames=['KHỞI ĐẦU / DANAVA','01 / CÔNG NGHỆ','02 / CON NGƯỜI','03 / HỆ SINH THÁI','CÙNG BẠN PHÁT TRIỂN'];
export const sceneCenters=[0,.24,.48,.72,1];
export const clamp=(n:number)=>Math.min(1,Math.max(0,n));
export function sceneWeights(p:number){const boundaries=[.12,.36,.60,.84],blend=.045;return sceneNames.map((_,i)=>Math.min(i===0?1:clamp((p-boundaries[i-1]+blend)/(2*blend)),i===4?1:1-clamp((p-boundaries[i]+blend)/(2*blend))));}
export function sceneAt(p:number){const weights=sceneWeights(p);return weights.indexOf(Math.max(...weights));}
// A single foreground scene owns the headline and artwork, preventing double exposure.
export function sceneFrame(progress:number){const p=clamp(progress),weights=sceneWeights(p),index=sceneAt(p),strength=clamp((weights[index]-.5)/.25),opacity=strength*(2-strength);const starts=[0,.12,.36,.60,.84],ends=[.12,.36,.60,.84,1];return{index,opacity,local:clamp((p-starts[index])/(ends[index]-starts[index])),foreground:weights.map((_,i)=>i===index?opacity:0)}}

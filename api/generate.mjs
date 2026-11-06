// Vercel Function. API key is used only on the server, never sent to the browser.
const buckets = new Map();
const allowed = {season:['봄','여름','가을','겨울'],style:['우아하고 고급스러운','러블리하고 귀여운','트렌디하고 화려한','미니멀하고 심플한'],color:['시즌에 어울리는 색','누드 베이지','핑크','버건디','블루','그린'],level:['하 (간단한 아트)','중 (포인트 아트)','상 (복합 아트)'],price:['39,000원대','49,000원대','59,000원대','69,000원대']};
export default {async fetch(request){
 if(request.method!=='POST')return Response.json({error:'POST 요청만 허용됩니다.'},{status:405});
 const key=process.env.OPENAI_API_KEY,access=process.env.DEMO_ACCESS_CODE;
 if(!key||!access)return Response.json({error:'서버 관리자에게 API 키와 시연 접속 코드 설정을 요청하세요.'},{status:503});
 let body;try{body=await request.json();}catch{return Response.json({error:'요청 형식이 잘못되었습니다.'},{status:400});}
 if(body.code!==access)return Response.json({error:'시연 접속 코드를 확인하세요.'},{status:401});
 for(const [k,values] of Object.entries(allowed)){if(!values.includes(body[k]))return Response.json({error:'잘못된 선택 값입니다: '+k},{status:400});}
 const ip=request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||'unknown', now=Date.now(),slot=buckets.get(ip)||{count:0,reset:now+3600000};
 if(now>slot.reset){slot.count=0;slot.reset=now+3600000;}
 if(slot.count>=5)return Response.json({error:'시연 횟수 제한(시간당 5회)에 도달했습니다.'},{status:429});
 slot.count++;buckets.set(ip,slot); // basic best-effort throttle, NOT a reliable production quota across serverless instances
 const shop=String(body.shop||'네일숍').slice(0,35).replace(/[\r\n]/g,' ');
 const prompt=`Create a single clean, premium nail salon design concept board with EXACTLY FIVE DIFFERENT nail art sets for a Korean nail salon. Each set shows five realistic artificial nail tips neatly arranged in its own equally sized section, for 25 tips total. Five distinct coordinated options with visual consistency, elegant editorial product photograph, clear professional lighting, unobstructed designs, no hands, no text, no letters, no watermarks, 5 columns on a single white or cream background. This is a proposal sheet, not a claim of actual salon work. Season: ${body.season}. Mood: ${body.style}. Colors: ${body.color}. Complexity: ${body.level}. Target salon menu price: ${body.price} (design within plausible labor and material complexity). Focus on physically achievable gel nail techniques and coherent color palettes. Shop context: ${shop}.`;
 try{const upstream=await fetch('https://api.openai.com/v1/images/generations',{method:'POST',headers:{'Authorization':`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({model:process.env.OPENAI_IMAGE_MODEL||'gpt-image-2.5-flare',prompt,size:'1024x1024',quality:'low',n:1,output_format:'png'}),signal:AbortSignal.timeout(115000)});
 const data=await upstream.json().catch(()=>({}));if(!upstream.ok){return Response.json({error:upstream.status===429?'AI 사용량 한도에 도달했습니다.':`AI 서비스 응답 오류 (${upstream.status}). 모델 권한과 결제 설정을 확인하세요.`},{status:502});}
 const b64=data.data?.[0]?.b64_json;if(!b64)return Response.json({error:'AI 이미지가 반환되지 않았습니다.'},{status:502});
 return Response.json({image:'data:image/png;base64,'+b64});
 }catch(e){return Response.json({error:e.name==='TimeoutError'?'이미지 생성 시간이 초과되었습니다.':'AI 서비스 연결에 실패했습니다.'},{status:502});}
 }};

import {put,list,del} from '@vercel/blob';
const reply=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
const auth=(request,body)=>Boolean(process.env.ADMIN_UPLOAD_CODE)&&((request.headers.get('x-admin-code')||body?.code)===process.env.ADMIN_UPLOAD_CODE);
const clean=(s,max=60)=>String(s||'').trim().slice(0,max);
const tags=['봄','여름','가을','겨울'];
const moods=['고급스러운','귀여운','화려한','미니멀한','로맨틱한'];
const colors=['핑크','화이트','버건디','블루','그린','베이지','브라운','블랙','기타'];
const levels=['하','중','상'];
const parseJSON=async req=>{try{return await req.json()}catch{return null}};
const allBlobs=async()=>{let cursor,blobs=[];do{const page=await list({prefix:'nailmonth/meta/',limit:100,cursor});blobs.push(...page.blobs);cursor=page.hasMore?page.cursor:undefined;}while(cursor&&blobs.length<1000);return blobs};
export default {async fetch(request){
 if(!process.env.BLOB_READ_WRITE_TOKEN)return reply({error:'Vercel Blob 저장소를 먼저 연결해 주세요.'},503);
 try{
  if(request.method==='GET'){
   const blobs=await allBlobs();const results=await Promise.all(blobs.map(async b=>{try{const r=await fetch(b.url,{cache:'no-store'});return r.ok?await r.json():null}catch{return null}}));
   return reply({designs:results.filter(Boolean).sort((a,b)=>(b.createdAt||'').localeCompare(a.createdAt||''))});
  }
  if(request.method==='POST'){
   const body=await parseJSON(request);if(!body)return reply({error:'등록 데이터가 올바르지 않습니다.'},400);
   if(!auth(request,body))return reply({error:'관리자 코드가 올바르지 않습니다.'},401);
   if(!tags.includes(body.season)||!moods.includes(body.mood)||!colors.includes(body.color)||!levels.includes(body.level))return reply({error:'디자인 분류를 확인해 주세요.'},400);
   const name=clean(body.name);if(!name)return reply({error:'디자인 이름을 입력해 주세요.'},400);
   const data=String(body.image||'');const m=data.match(/^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/);
   if(!m)return reply({error:'JPEG, PNG, WebP 이미지만 등록할 수 있습니다.'},400);
   const bytes=Buffer.from(m[2],'base64');if(bytes.length>2_000_000||bytes.length<100)return reply({error:'이미지 크기는 2MB 이하여야 합니다.'},413);
   const type=m[1],id=crypto.randomUUID(),ext=type==='jpeg'?'jpg':type;
   const upload=await put(`nailmonth/images/${id}.${ext}`,bytes,{access:'public',contentType:`image/${type}`,addRandomSuffix:false});
   const record={id,name,season:body.season,mood:body.mood,color:body.color,level:body.level,technique:clean(body.technique,100),artist:clean(body.artist,30),minutes:Math.min(240,Math.max(0,Number(body.minutes)||0)),price:Math.min(500000,Math.max(0,Number(body.price)||0)),imageUrl:upload.url,createdAt:new Date().toISOString()};
   try{await put(`nailmonth/meta/${id}.json`,JSON.stringify(record),{access:'public',contentType:'application/json',addRandomSuffix:false});}
   catch(e){await del(upload.url).catch(()=>{});throw e}
   return reply({design:record},201);
  }
  if(request.method==='DELETE'){
   const body=await parseJSON(request);if(!body||!auth(request,body))return reply({error:'관리자 코드를 확인해 주세요.'},401);
   const id=String(body.id||'');if(!/^[0-9a-f-]{36}$/.test(id))return reply({error:'잘못된 디자인 번호입니다.'},400);
   const blobs=await allBlobs();const item=blobs.find(b=>b.pathname===`nailmonth/meta/${id}.json`);
   if(!item)return reply({error:'디자인을 찾을 수 없습니다.'},404);
   const r=await fetch(item.url);if(!r.ok)return reply({error:'데이터를 불러오지 못했습니다.'},502);
   const entry=await r.json();const uploads=await list({prefix:`nailmonth/images/${id}.`,limit:10});
   await del([item.url,...uploads.blobs.map(b=>b.url)]);return reply({ok:true});
  }
  return reply({error:'허용되지 않은 요청입니다.'},405);
 }catch(e){return reply({error:'저장소 처리 중 오류가 발생했습니다. Vercel Logs를 확인하세요.'},500)}
}};

const SB_URL='https://uwqusqjkximldyjkakll.supabase.co';
const SB_KEY='sb_publishable_S63mXGdQNIHqvIueu7WSaQ_aBzirX6d';
const sb=supabase.createClient(SB_URL,SB_KEY);
let currentUser=null;
let originalSave=save;
let originalClearData=clearData;

function dbToLead(r){return {id:Number(r.client_id),source:r.source,service:r.service,link:r.post_url||'',text:r.post_text||'',client:r.client_name||'',location:r.location||'',date:r.event_date||'',guests:r.guests??'',status:r.status,createdAt:r.created_at,score:r.score,intent:r.intent,proposal:r.proposal_text||''}}
function leadToDb(l){return {user_id:currentUser.id,client_id:Number(l.id),source:l.source||'Facebook - Grupo',service:l.service||'A definir',post_url:l.link||null,post_text:l.text||'',client_name:l.client||null,location:l.location||null,event_date:l.date||null,guests:l.guests?Number(l.guests):null,score:Number(l.score||0),intent:l.intent||'Baixa intenção',status:l.status||'Novo',proposal_text:l.proposal||null,updated_at:new Date().toISOString()}}

async function ensureAuth(){const {data}=await sb.auth.getSession();if(!data.session){location.href='login.html';return false}currentUser=data.session.user;return true}

async function loadRemote(){const {data,error}=await sb.from('leads').select('*').order('created_at',{ascending:false});if(error){console.error(error);return}leads=(data||[]).map(dbToLead);localStorage.setItem(KEY,JSON.stringify(leads));renderAll()}

save=async function(){localStorage.setItem(KEY,JSON.stringify(leads));renderAll();if(!currentUser)return;const rows=leads.map(leadToDb);if(!rows.length)return;const {error}=await sb.from('leads').upsert(rows,{onConflict:'client_id'});if(error)console.error('Erro ao sincronizar',error)}

clearData=async function(){if(!confirm('Apagar todos os dados? Esta ação também apaga do banco online.'))return;const {error}=await sb.from('leads').delete().eq('user_id',currentUser.id);if(error){alert('Não foi possível apagar do banco: '+error.message);return}leads=[];localStorage.removeItem(KEY);activeLeadId=null;document.getElementById('analysisBox').style.display='none';document.getElementById('analysisEmpty').style.display='block';renderAll()}

async function boot(){if(!(await ensureAuth()))return;await sb.from('settings').upsert({user_id:currentUser.id,business_name:'Tia Gaby Estações',scan_times:['08:00','15:00','19:00']},{onConflict:'user_id'});await loadRemote();const header=document.querySelector('header');if(header){const b=document.createElement('button');b.className='ghost';b.textContent='Sair';b.onclick=async()=>{await sb.auth.signOut();location.href='login.html'};header.appendChild(b)}}
boot();

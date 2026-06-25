/* ============================================================
   NSWL Teaching & Learning  —  central video configuration
   ------------------------------------------------------------
   HOW TO ADD A VIDEO TO A MODULE
   1. Put your clip in a folder called  videos  in the repo
      (keep it small: about a minute or two, 720p, .mp4 / H.264,
       ideally under ~50 MB — GitHub rejects files over 100 MB).
   2. Find the module's code below (e.g. "2-1") and add an entry
      to its array. Three source types are supported:

        { type:"mp4",     src:"videos/2-1-start.mp4",  title:"Lesson start, Year 4", caption:"Optional one line." }
        { type:"youtube", id:"dQw4w9WgXcQ",            title:"...", caption:"..." }
        { type:"vimeo",   id:"123456789",              title:"...", caption:"..." }

   3. Save this file and commit it. The video appears on that
      module straight away. Several entries = several clips.
      An empty array shows the "to be added" placeholder.
   ============================================================ */
window.NSWL_VIDEOS = {
  // Pillar 1 — Behaviour & Climate
  "1-1": [
    // Example (delete the // to switch on once the file exists):
    // { type:"mp4", src:"videos/1-1-lesson-start.mp4", title:"Video 1 — Lesson start, Year 8 maths", caption:"The lesson-start mantra and 30-Second Reflection." },
    // { type:"mp4", src:"videos/1-1-reset.mp4", title:"Video 2 — Mid-lesson reset, Year 10 English", caption:"Strong position, name the virtue, wait, continue." }
  ],
  "1-2": [], "1-3": [], "1-4": [], "1-5": [], "1-6": [],
  "1-7": [], "1-8": [], "1-9": [],
  // Pillar 2 — Adaptive Teaching & Inclusion
  "2-1": [], "2-2": [], "2-3": [],
  // Pillar 3 — Instruction & Modelling
  "3-1": [], "3-2": [], "3-3": [], "3-4": [], "3-5": [],
  // Pillar 4 — Checking for Understanding
  "4-1": [], "4-2": [], "4-3": [],
  // Pillar 5 — Questioning & Classroom Dialogue
  "5-1": [], "5-2": [], "5-3": [],
  // Pillar 6 — Standards & Curriculum
  "6-1": [], "6-2": [], "6-3": []
};

(function(){
  var V = window.NSWL_VIDEOS || {};
  function el(tag, attrs, html){ var e=document.createElement(tag); if(attrs){ for(var k in attrs){ e.setAttribute(k, attrs[k]); } } if(html!=null){ e.innerHTML=html; } return e; }
  function player(clip){
    var card = el('div', {"class":"video-card"});
    var frame;
    if(clip.type==='mp4'){
      frame = el('video', {controls:'', preload:'metadata', playsinline:'', "class":"video-frame"});
      frame.appendChild(el('source', {src:clip.src, type:'video/mp4'}));
      frame.appendChild(document.createTextNode('Your browser cannot play this video.'));
    } else if(clip.type==='youtube'){
      frame = el('div', {"class":"video-embed"});
      frame.appendChild(el('iframe', {src:'https://www.youtube-nocookie.com/embed/'+clip.id, allow:'accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture', allowfullscreen:'', loading:'lazy'}));
    } else if(clip.type==='vimeo'){
      frame = el('div', {"class":"video-embed"});
      frame.appendChild(el('iframe', {src:'https://player.vimeo.com/video/'+clip.id, allow:'autoplay; fullscreen; picture-in-picture', allowfullscreen:'', loading:'lazy'}));
    } else { return null; }
    card.appendChild(frame);
    if(clip.title){ card.appendChild(el('div', {"class":"video-title"}, clip.title)); }
    if(clip.caption){ card.appendChild(el('div', {"class":"video-caption"}, clip.caption)); }
    return card;
  }
  function placeholder(){
    return el('div', {"class":"video-placeholder"},
      '<div class="icon">\u25B6</div><div class="label">In-house example video \u2014 to be added</div><div class="desc">An exemplar clip will appear here once it has been filmed.</div>');
  }
  function render(){
    document.querySelectorAll('.video-list').forEach(function(list){
      var mod = list.getAttribute('data-module');
      var clips = (V[mod]||[]).filter(function(c){ return c && c.type; });
      list.innerHTML='';
      if(!clips.length){ list.appendChild(placeholder()); return; }
      clips.forEach(function(c){ var p=player(c); if(p){ list.appendChild(p); } });
    });
  }
  if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded', render); } else { render(); }
})();

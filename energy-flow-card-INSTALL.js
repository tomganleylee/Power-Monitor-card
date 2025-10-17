import{css as t,LitElement as i,html as s}from"lit";import{property as e,state as r,query as o,customElement as n}from"lit/decorators.js";import{forceSimulation as a,forceLink as c,forceManyBody as h,forceCollide as d,forceX as l,forceY as f}from"d3-force";function p(t,i,s,e){var r,o=arguments.length,n=o<3?i:null===e?e=Object.getOwnPropertyDescriptor(i,s):e;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(t,i,s,e);else for(var a=t.length-1;a>=0;a--)(r=t[a])&&(n=(o<3?r(n):o>3?r(i,s,n):r(i,s))||n);return o>3&&n&&Object.defineProperty(i,s,n),n}"function"==typeof SuppressedError&&SuppressedError;const u=t`
  :host {
    display: block;
    background-color: var(--ha-card-background, var(--card-background-color, white));
    border-radius: var(--ha-card-border-radius, 12px);
    box-shadow: var(--ha-card-box-shadow, 0 2px 8px rgba(0, 0, 0, 0.1));
    overflow: hidden;
    font-family: var(--primary-font-family, 'Roboto', sans-serif);
    color: var(--primary-text-color, #212121);
  }

  .card-content {
    display: flex;
    flex-direction: column;
    padding: 16px;
    position: relative;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
  }

  .card-title {
    font-size: 18px;
    font-weight: 500;
    color: var(--primary-text-color, #212121);
  }

  .refresh-button {
    cursor: pointer;
    padding: 4px;
    border-radius: 50%;
    background: transparent;
    border: none;
    color: var(--primary-text-color, #212121);
    transition: background-color 0.2s;
  }

  .refresh-button:hover {
    background-color: var(--divider-color, rgba(0, 0, 0, 0.12));
  }

  .canvas-container {
    position: relative;
    width: 100%;
    min-height: 400px;
    background-color: var(--card-background-color, #fafafa);
    border-radius: 8px;
    overflow: hidden;
  }

  canvas {
    display: block;
    width: 100%;
    height: 100%;
    touch-action: none;
  }

  .statistics-panel {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 12px;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px;
    background-color: var(--secondary-background-color, #f5f5f5);
    border-radius: 8px;
  }

  .stat-label {
    font-size: 12px;
    color: var(--secondary-text-color, #757575);
    margin-bottom: 4px;
  }

  .stat-value {
    font-size: 18px;
    font-weight: 500;
    color: var(--primary-text-color, #212121);
  }

  .stat-unit {
    font-size: 12px;
    color: var(--secondary-text-color, #757575);
    margin-left: 2px;
  }

  .warning-banner {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px;
    margin-bottom: 12px;
    background-color: var(--warning-color, #ff9800);
    color: white;
    border-radius: 8px;
    font-size: 14px;
  }

  .warning-icon {
    font-size: 20px;
  }

  .stale-indicator {
    position: absolute;
    top: 8px;
    right: 8px;
    padding: 4px 8px;
    background-color: var(--error-color, #f44336);
    color: white;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
  }

  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 200px;
    color: var(--secondary-text-color, #757575);
  }

  .error {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 8px;
    padding: 24px;
    color: var(--error-color, #f44336);
    text-align: center;
  }

  .error-icon {
    font-size: 48px;
  }

  .error-message {
    font-size: 14px;
  }

  .category-group {
    display: flex;
    flex-direction: column;
    margin-bottom: 8px;
  }

  .category-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    background-color: var(--secondary-background-color, #f5f5f5);
    border-radius: 8px;
    cursor: pointer;
    user-select: none;
    transition: background-color 0.2s;
  }

  .category-header:hover {
    background-color: var(--divider-color, rgba(0, 0, 0, 0.12));
  }

  .category-header.collapsed {
    border-radius: 8px;
  }

  .category-header.expanded {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }

  .category-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 500;
  }

  .category-icon {
    font-size: 20px;
  }

  .category-power {
    font-size: 14px;
    color: var(--secondary-text-color, #757575);
  }

  .category-devices {
    display: flex;
    flex-direction: column;
    padding: 8px 12px;
    background-color: var(--card-background-color, white);
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
    border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
    border-top: none;
  }

  .device-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px;
    border-radius: 4px;
    transition: background-color 0.2s;
  }

  .device-item:hover {
    background-color: var(--secondary-background-color, #f5f5f5);
  }

  .device-name {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
  }

  .device-icon {
    font-size: 18px;
    color: var(--secondary-text-color, #757575);
  }

  .device-power {
    font-size: 13px;
    font-weight: 500;
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .card-content {
      padding: 12px;
    }

    .statistics-panel {
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
    }

    .stat-item {
      padding: 6px;
    }

    .stat-label {
      font-size: 11px;
    }

    .stat-value {
      font-size: 16px;
    }
  }

  @media (max-width: 480px) {
    .card-title {
      font-size: 16px;
    }

    .canvas-container {
      min-height: 300px;
    }

    .statistics-panel {
      grid-template-columns: 1fr;
    }
  }

  /* Animation utilities */
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  .fade-in {
    animation: fadeIn 0.3s ease-out;
  }

  .pulse {
    animation: pulse 2s ease-in-out infinite;
  }

  /* Accessibility */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }

  /* Focus styles */
  *:focus-visible {
    outline: 2px solid var(--primary-color, #03a9f4);
    outline-offset: 2px;
  }
`;class g{constructor(t,i=6e4){this.unsubscribeCallback=null,this.updateCallback=null,this.staleThresholdMs=6e4,this.hass=t,this.sensorStates=new Map,this.staleThresholdMs=i}subscribe(t,i){this.updateCallback=i;for(const i of t)this.updateSensorState(i);this.unsubscribeCallback=this.hass.connection.subscribeEntities(i=>{let s=!1;for(const e of t)if(i[e]){const t=this.sensorStates.get(e);this.updateSensorState(e);const i=this.sensorStates.get(e);t&&t.value===i?.value||(s=!0)}s&&this.updateCallback&&this.updateCallback()})}unsubscribe(){this.unsubscribeCallback&&(this.unsubscribeCallback(),this.unsubscribeCallback=null),this.updateCallback=null}getSensorState(t){return this.sensorStates.get(t)||null}getPowerValue(t){const i=this.sensorStates.get(t);return!i||i.isUnavailable||i.isStale?void 0===i?.lastValidValue||i.isStale?0:i.lastValidValue:i.value}getPercentageValue(t){const i=this.sensorStates.get(t);return!i||i.isUnavailable||i.isStale?0:Math.max(0,Math.min(100,i.value))}getStaleSensors(){const t=[];for(const[i,s]of this.sensorStates)s.isStale&&t.push(i);return t}updateSensorState(t){const i=this.hass.states[t];if(!i)return void this.sensorStates.set(t,{entityId:t,value:0,unit:"",isStale:!1,isUnavailable:!0,lastUpdated:Date.now()});const s="unavailable"===i.state||"unknown"===i.state,e=new Date(i.last_updated).getTime(),r=function(t,i=6e4){return Date.now()-t>i}(e,this.staleThresholdMs);let o,n=0;if(s){const i=this.sensorStates.get(t);o=i?.lastValidValue}else n=this.parseNumericState(i.state),o=n;this.sensorStates.set(t,{entityId:t,value:n,unit:i.attributes.unit_of_measurement||"",isStale:r,isUnavailable:s,lastUpdated:e,lastValidValue:o})}parseNumericState(t){const i=parseFloat(t);return isNaN(i)?0:i}refresh(){for(const t of this.sensorStates.keys())this.updateSensorState(t);this.updateCallback&&this.updateCallback()}getAllStates(){return new Map(this.sensorStates)}clear(){this.sensorStates.clear()}}class v{constructor(t=200){this.particlePool=[],this.activeParticles=new Set,this.nextParticleId=0,this.poolSize=200,this.lastSpawnTime=new Map,this.poolSize=t,this.initializePool()}initializePool(){for(let t=0;t<this.poolSize;t++)this.particlePool.push(this.createParticle(t))}createParticle(t){return{id:t,sourceNode:null,targetNode:null,progress:0,speed:1,lifetime:0,x:0,y:0,color:"#ffffff",radius:3,opacity:1,isActive:!1}}spawnParticles(t,i,s,e){const r=function(t){const i=Math.abs(t)/100;return Math.max(1,Math.min(10,i))}(s),o=1e3/r,n=`${"type"in t?t.type:"device"}_${t.entityId}_${i.entityId}`,a=this.lastSpawnTime.get(n)??0,c=Date.now();if(c-a<o)return;const h=this.acquireParticle();if(h){const e=function(t){const i=Math.abs(t);return i<100?.5:i<1e3?1:i<5e3?1.5:2}(s),r="color"in t?t.color:"#999999";h.sourceNode=t,h.targetNode=i,h.progress=0,h.speed=e,h.lifetime=0,h.x=t.x,h.y=t.y,h.color=r,h.radius=3,h.opacity=1,h.isActive=!0,this.activeParticles.add(h.id),this.lastSpawnTime.set(n,c)}}update(t){const i=[];for(const s of this.activeParticles){const e=this.particlePool[s];if(e&&e.isActive)if(e.lifetime+=t,e.progress+=e.speed*t,e.progress>=1)i.push(s);else{if(e.sourceNode&&e.targetNode){const t=this.easeInOutCubic(e.progress);e.x=e.sourceNode.x+(e.targetNode.x-e.sourceNode.x)*t,e.y=e.sourceNode.y+(e.targetNode.y-e.sourceNode.y)*t}e.progress<.1?e.opacity=e.progress/.1:e.progress>.9?e.opacity=(1-e.progress)/.1:e.opacity=1}else i.push(s)}for(const t of i)this.releaseParticle(t)}render(t){for(const i of this.activeParticles){const s=this.particlePool[i];s&&s.isActive&&(t.save(),t.globalAlpha=s.opacity,t.fillStyle=s.color,t.beginPath(),t.arc(s.x,s.y,s.radius,0,2*Math.PI),t.fill(),t.restore())}}acquireParticle(){for(let t=0;t<this.particlePool.length;t++){const i=this.particlePool[t];if(!i.isActive)return i}if(this.activeParticles.size>0){const t=this.activeParticles.values().next().value;if(void 0!==t)return this.releaseParticle(t),this.particlePool[t]}return null}releaseParticle(t){const i=this.particlePool[t];i&&(i.isActive=!1,i.sourceNode=null,i.targetNode=null,this.activeParticles.delete(t))}easeInOutCubic(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2}getActiveCount(){return this.activeParticles.size}getUtilization(){return this.activeParticles.size/this.poolSize*100}clear(){for(const t of this.activeParticles)this.releaseParticle(t);this.lastSpawnTime.clear()}reset(){this.clear(),this.nextParticleId=0}getActiveParticles(){return Array.from(this.activeParticles).map(t=>this.particlePool[t]).filter(t=>t&&t.isActive)}}class x{constructor(t,i){this.nodes=[],this.links=[],this.width=t,this.height=i,this.initializeSimulation()}initializeSimulation(){this.simulation=a().force("link",c().id(t=>t.id).distance(150).strength(t=>t.strength)).force("charge",h().strength(-300)).force("collide",d().radius(t=>t.radius+10).strength(.7)).force("centerX",l(this.width/2).strength(.05)).force("centerY",f(this.height/2).strength(.05)).alphaDecay(.02).velocityDecay(.4)}updateLayout(t,i){this.nodes=[],this.links=[];for(const i of t)this.nodes.push({id:i.entityId,type:"source",radius:i.radius,x:i.x||.2*this.width,y:i.y||this.height/2,fx:null,fy:null});const s={id:"hub",type:"hub",radius:30,x:this.width/2,y:this.height/2,fx:this.width/2,fy:this.height/2};this.nodes.push(s);for(const t of i)t.isVisible&&this.nodes.push({id:t.entityId,type:"consumption",radius:t.radius,x:t.x||.8*this.width,y:t.y||this.height/2,fx:null,fy:null});for(const i of t)i.isActive&&i.powerWatts>0&&this.links.push({source:i.entityId,target:"hub",strength:.5});for(const t of i)t.isVisible&&t.powerWatts>0&&this.links.push({source:"hub",target:t.entityId,strength:.5});this.simulation.nodes(this.nodes).force("link").links(this.links),this.simulation.alpha(.3).restart()}tick(t=100){for(let i=0;i<t;i++)this.simulation.tick()}applyPositions(t,i){for(const i of t){const t=this.nodes.find(t=>t.id===i.entityId);t&&(i.x=t.x??i.x,i.y=t.y??i.y)}for(const t of i){const i=this.nodes.find(i=>i.id===t.entityId);i&&(t.x=i.x??t.x,t.y=i.y??t.y)}}setSourcePosition(t,i,s){const e=this.nodes.find(i=>i.id===t);if(e){const t=this.height/(s+1);e.fx=.15*this.width,e.fy=t*(i+1)}}setConsumptionPosition(t,i,s){const e=this.nodes.find(i=>i.id===t);if(e){const t=this.height/(s+1);e.fx=.85*this.width,e.fy=t*(i+1)}}releasePositions(){for(const t of this.nodes)"hub"!==t.type&&(t.fx=null,t.fy=null)}resize(t,i){this.width=t,this.height=i,this.simulation.force("centerX",l(t/2).strength(.05)).force("centerY",f(i/2).strength(.05));const s=this.nodes.find(t=>"hub"===t.id);s&&(s.fx=t/2,s.fy=i/2),this.simulation.alpha(.3).restart()}stop(){this.simulation.stop()}getHubPosition(){const t=this.nodes.find(t=>"hub"===t.id);return{x:t?.x??this.width/2,y:t?.y??this.height/2}}useFixedLayout(t,i){const s=this.height/(t.length+1);t.forEach((t,i)=>{t.x=.15*this.width,t.y=s*(i+1)});const e=i.filter(t=>t.isVisible),r=this.height/(e.length+1);e.forEach((t,i)=>{t.x=.85*this.width,t.y=r*(i+1)})}}function b(t){const i=Math.abs(t);return i>=1e6?{value:+(t/1e6).toFixed(2),unit:"MW"}:i>=1e3?{value:+(t/1e3).toFixed(1),unit:"kW"}:{value:Math.round(t),unit:"W"}}function y(t){return`${t.value} ${t.unit}`}class m{constructor(t){this.ctx=t}renderSourceNode(t,i){const s=this.ctx;s.save(),s.beginPath(),s.arc(t.x,t.y,t.radius,0,2*Math.PI);const e=s.createRadialGradient(t.x,t.y,0,t.x,t.y,t.radius);e.addColorStop(0,this.lightenColor(t.color,20)),e.addColorStop(1,t.color),s.fillStyle=e,s.fill(),s.strokeStyle=t.isActive?t.color:"#cccccc",s.lineWidth=3,t.isStale&&s.setLineDash([5,5]),s.stroke(),s.setLineDash([]),s.fillStyle="#ffffff",s.font=`${t.radius}px sans-serif`,s.textAlign="center",s.textBaseline="middle",s.fillText(t.icon,t.x,t.y),"battery"===t.type&&void 0!==i&&this.renderBatteryIndicator(t,i);const r=y(b(Math.abs(t.powerWatts)));s.fillStyle=t.isActive?"#333333":"#999999",s.font="14px sans-serif",s.textAlign="center",s.textBaseline="top",s.fillText(r,t.x,t.y+t.radius+8);const o=this.getTypeLabel(t.type);s.font="12px sans-serif",s.textBaseline="bottom",s.fillStyle="#666666",s.fillText(o,t.x,t.y-t.radius-8),t.isStale&&this.renderStaleIndicator(t.x,t.y-t.radius-5),s.restore()}renderConsumptionNode(t){const i=this.ctx;i.save(),i.beginPath(),i.arc(t.x,t.y,t.radius,0,2*Math.PI);const s=this.getDeviceColor(t.powerWatts),e=i.createRadialGradient(t.x,t.y,0,t.x,t.y,t.radius);e.addColorStop(0,this.lightenColor(s,30)),e.addColorStop(1,s),i.fillStyle=e,i.fill(),i.strokeStyle=t.powerWatts>0?s:"#cccccc",i.lineWidth=2,t.isStale&&i.setLineDash([5,5]),i.stroke(),i.setLineDash([]),i.fillStyle="#ffffff",i.font=.8*t.radius+"px sans-serif",i.textAlign="center",i.textBaseline="middle",i.fillText(t.icon,t.x,t.y);const r=y(b(t.powerWatts));i.fillStyle=t.powerWatts>0?"#333333":"#999999",i.font="12px sans-serif",i.textAlign="center",i.textBaseline="top",i.fillText(r,t.x,t.y+t.radius+6),i.font="11px sans-serif",i.textBaseline="bottom",i.fillStyle="#666666",i.fillText(t.name,t.x,t.y-t.radius-6),t.isStale&&this.renderStaleIndicator(t.x,t.y-t.radius-5),i.restore()}renderBatteryIndicator(t,i){const s=this.ctx,e=1.5*t.radius,r=t.x-e/2,o=t.y+t.radius+28;s.fillStyle="#e0e0e0",s.fillRect(r,o,e,8);const n=e*i/100,a=i>80?"#4caf50":i>20?"#ff9800":"#f44336";s.fillStyle=a,s.fillRect(r,o,n,8),s.strokeStyle="#999999",s.lineWidth=1,s.strokeRect(r,o,e,8);const c=function(t,i=0){return{value:+t.toFixed(i),unit:"%"}}(i,0);s.fillStyle="#333333",s.font="10px sans-serif",s.textAlign="center",s.textBaseline="top",s.fillText(y(c),t.x,o+8+2)}renderStaleIndicator(t,i){const s=this.ctx;s.save(),s.fillStyle="#f44336",s.font="16px sans-serif",s.textAlign="center",s.textBaseline="middle",s.fillText("⚠",t,i),s.restore()}renderConnection(t,i,s,e,r,o=2,n=.3){const a=this.ctx;a.save(),a.globalAlpha=n,a.strokeStyle=r,a.lineWidth=o,a.beginPath(),a.moveTo(t,i),a.lineTo(s,e),a.stroke(),a.restore()}renderHubNode(t,i,s=30){const e=this.ctx;e.save();const r=e.createRadialGradient(t,i,0,t,i,s);r.addColorStop(0,"#ffffff"),r.addColorStop(1,"#e0e0e0"),e.beginPath(),e.arc(t,i,s,0,2*Math.PI),e.fillStyle=r,e.fill(),e.strokeStyle="#999999",e.lineWidth=2,e.stroke(),e.fillStyle="#666666",e.font=.8*s+"px sans-serif",e.textAlign="center",e.textBaseline="middle",e.fillText("⚡",t,i),e.restore()}getDeviceColor(t){return t<=0?"#cccccc":t<100?"#4caf50":t<500?"#2196f3":t<1e3?"#ff9800":"#f44336"}lightenColor(t,i){const s=parseInt(t.replace("#",""),16),e=Math.round(2.55*i);return`#${(16777216+(Math.min(255,(s>>16&255)+e)<<16)+(Math.min(255,(s>>8&255)+e)<<8)+Math.min(255,(255&s)+e)).toString(16).slice(1)}`}getTypeLabel(t){switch(t){case"solar":return"Solar";case"battery":return"Battery";case"grid":return"Grid";case"hub":return"Hub";default:return t}}clear(t,i){this.ctx.clearRect(0,0,t,i)}}let w=class extends i{constructor(){super(...arguments),this.sourceNodes=[],this.consumptionNodes=[],this.warnings=[],this.isLoading=!0,this.errorMessage=null,this.lastFrameTime=0}setConfig(t){if(!t)throw new Error("Invalid configuration");if("custom:energy-flow-card"!==t.type)throw new Error('Invalid card type. Must be "custom:energy-flow-card"');this.config={...t,update_interval:t.update_interval??2e3,show_statistics:t.show_statistics??!0,min_height:t.min_height??400,max_height:t.max_height??800},this.isLoading=!1}getCardSize(){const t=this.config?.min_height??400;return Math.ceil(t/50)}connectedCallback(){super.connectedCallback(),this.initializeSensorManager(),this.startUpdateTimer()}disconnectedCallback(){super.disconnectedCallback(),this.cleanup()}updated(t){super.updated(t),t.has("hass")&&this.handleHassUpdate(),t.has("config")&&this.reinitialize(),this.canvas&&!this.animationFrameId&&(this.initializeCanvas(),this.startAnimationLoop())}render(){if(this.isLoading)return s`
        <div class="card-content">
          <div class="loading">Loading energy flow...</div>
        </div>
      `;if(this.errorMessage)return s`
        <div class="card-content">
          <div class="error">
            <div class="error-icon">⚠️</div>
            <div class="error-message">${this.errorMessage}</div>
          </div>
        </div>
      `;const t=this.config.min_height??400,i=this.config.max_height??800;return s`
      <div class="card-content">
        ${this.renderHeader()}
        ${this.warnings.length>0?this.renderWarnings():""}
        <div class="canvas-container" style="min-height: ${t}px; max-height: ${i}px;">
          <canvas></canvas>
        </div>
        ${this.config.show_statistics?this.renderStatistics():""}
      </div>
    `}renderHeader(){return s`
      <div class="card-header">
        <div class="card-title">Energy Flow</div>
        <button
          class="refresh-button"
          @click=${this.handleRefresh}
          aria-label="Refresh">
          🔄
        </button>
      </div>
    `}renderWarnings(){return s`
      ${this.warnings.map(t=>s`
        <div class="warning-banner">
          <span class="warning-icon">⚠️</span>
          <span>${t}</span>
        </div>
      `)}
    `}renderStatistics(){return s`
      <div class="statistics-panel">
        <div class="stat-item">
          <div class="stat-label">Efficiency</div>
          <div class="stat-value">--<span class="stat-unit">%</span></div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Self-Sufficiency</div>
          <div class="stat-value">--<span class="stat-unit">%</span></div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Solar</div>
          <div class="stat-value">--<span class="stat-unit">W</span></div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Grid</div>
          <div class="stat-value">--<span class="stat-unit">W</span></div>
        </div>
      </div>
    `}initializeSensorManager(){if(!this.hass||!this.config)return;const t=this.getAllEntityIds();this.sensorManager=new g(this.hass,6e4),this.sensorManager.subscribe(t,()=>{this.updateNodeStates(),this.checkWarnings()})}getAllEntityIds(){const t=[];if(this.config.entities?.solar&&t.push(this.config.entities.solar),this.config.entities?.battery&&t.push(this.config.entities.battery),this.config.entities?.battery_soc&&t.push(this.config.entities.battery_soc),this.config.entities?.grid&&t.push(this.config.entities.grid),this.config.devices)for(const i of this.config.devices)t.push(i.entity_id);if(this.config.categories)for(const i of this.config.categories)i.circuit_entity&&t.push(i.circuit_entity);return t}updateNodeStates(){this.sensorManager&&(this.sourceNodes=this.createSourceNodes(),this.consumptionNodes=this.createConsumptionNodes(),this.layoutEngine&&this.canvas&&(this.layoutEngine.updateLayout(this.sourceNodes,this.consumptionNodes),this.layoutEngine.useFixedLayout(this.sourceNodes,this.consumptionNodes),this.layoutEngine.applyPositions(this.sourceNodes,this.consumptionNodes)),this.requestUpdate())}createSourceNodes(){const t=[],i=Date.now();if(this.config.entities?.solar){const s=this.sensorManager?.getPowerValue(this.config.entities.solar)??0,e=this.sensorManager?.getSensorState(this.config.entities.solar);t.push({type:"solar",entityId:this.config.entities.solar,powerWatts:s,isActive:s>10,isStale:e?.isStale??!1,lastUpdated:e?.lastUpdated??i,displayValue:String(Math.round(s)),displayUnit:"W",color:this.config.theme?.solar_color??"#ffa500",icon:"☀️",x:0,y:0,radius:40})}if(this.config.entities?.battery){const e=this.sensorManager?.getPowerValue(this.config.entities.battery)??0,r=this.sensorManager?.getSensorState(this.config.entities.battery),o=(s=e)>10?"discharging":s<-10?"charging":"idle";t.push({type:"battery",entityId:this.config.entities.battery,powerWatts:e,isActive:Math.abs(e)>10,isStale:r?.isStale??!1,lastUpdated:r?.lastUpdated??i,displayValue:String(Math.round(Math.abs(e))),displayUnit:"W",color:this.config.theme?.battery_color??"#4caf50",icon:"charging"===o?"🔋⬆":"discharging"===o?"🔋⬇":"🔋",x:0,y:0,radius:40})}var s,e;if(this.config.entities?.grid){const s=this.sensorManager?.getPowerValue(this.config.entities.grid)??0,r=this.sensorManager?.getSensorState(this.config.entities.grid),o=(e=s)>10?"import":e<-10?"export":"idle";t.push({type:"grid",entityId:this.config.entities.grid,powerWatts:s,isActive:Math.abs(s)>10,isStale:r?.isStale??!1,lastUpdated:r?.lastUpdated??i,displayValue:String(Math.round(Math.abs(s))),displayUnit:"W",color:this.config.theme?.grid_color??"#2196f3",icon:"export"===o?"⚡⬆":"import"===o?"⚡⬇":"⚡",x:0,y:0,radius:40})}return t}createConsumptionNodes(){const t=[],i=Date.now();if(!this.config.devices)return t;for(const s of this.config.devices){const e=this.sensorManager?.getPowerValue(s.entity_id)??0,r=this.sensorManager?.getSensorState(s.entity_id),o=s.show_when_off||e>0;t.push({id:s.id,entityId:s.entity_id,name:s.name??s.id,powerWatts:e,isStale:r?.isStale??!1,lastUpdated:r?.lastUpdated??i,displayValue:String(Math.round(e)),displayUnit:"W",icon:s.icon??"💡",categoryId:s.category,x:0,y:0,radius:30,isVisible:o})}return t}checkWarnings(){const t=[];if(this.sensorManager){const i=this.sensorManager.getStaleSensors();i.length>0&&t.push(`${i.length} sensor(s) not responding`)}if(this.config.warnings?.battery_low&&this.config.entities?.battery_soc){const i=this.sensorManager?.getPercentageValue(this.config.entities.battery_soc)??0;i<this.config.warnings.battery_low&&t.push(`Battery low: ${i}%`)}if(this.config.warnings?.grid_import&&this.config.entities?.grid){const i=this.sensorManager?.getPowerValue(this.config.entities.grid)??0;i>this.config.warnings.grid_import&&t.push(`High grid import: ${Math.round(i)}W`)}this.warnings=t}initializeCanvas(){if(!this.canvas)return;const t=this.canvas.parentElement;if(!t)return;const i=t.getBoundingClientRect();this.canvas.width=i.width,this.canvas.height=i.height;const s=this.canvas.getContext("2d");s&&(this.nodeRenderer=new m(s),this.particleSystem=new v(200),this.layoutEngine=new x(this.canvas.width,this.canvas.height),this.updateNodeStates()),this.resizeObserver=new ResizeObserver(()=>{this.handleResize()}),this.resizeObserver.observe(t)}handleResize(){if(!this.canvas)return;const t=this.canvas.parentElement;if(!t)return;const i=t.getBoundingClientRect();this.canvas.width=i.width,this.canvas.height=i.height,this.layoutEngine&&this.layoutEngine.resize(i.width,i.height),this.updateNodeStates()}startAnimationLoop(){this.lastFrameTime=performance.now();const t=i=>{const s=(i-this.lastFrameTime)/1e3;this.lastFrameTime=i,this.renderCanvas(s),this.animationFrameId=requestAnimationFrame(t)};this.animationFrameId=requestAnimationFrame(t)}renderCanvas(t){if(!this.canvas||!this.nodeRenderer||!this.particleSystem)return;const i=this.canvas.getContext("2d");if(!i)return;this.nodeRenderer.clear(this.canvas.width,this.canvas.height),i.fillStyle="#fafafa",i.fillRect(0,0,this.canvas.width,this.canvas.height);const s=this.canvas.width/2,e=this.canvas.height/2;for(const t of this.sourceNodes)t.isActive&&t.powerWatts>0&&this.nodeRenderer.renderConnection(t.x,t.y,s,e,t.color,2,.3);for(const t of this.consumptionNodes)t.isVisible&&t.powerWatts>0&&this.nodeRenderer.renderConnection(s,e,t.x,t.y,"#999999",2,.3);for(const i of this.sourceNodes)if(i.isActive&&i.powerWatts>0)for(const r of this.consumptionNodes)if(r.isVisible&&r.powerWatts>0){const o={type:"hub",entityId:"hub",x:s,y:e,color:i.color};this.particleSystem.spawnParticles(i,o,i.powerWatts,t),this.particleSystem.spawnParticles(o,r,r.powerWatts,t)}this.particleSystem.update(t),this.particleSystem.render(i),this.nodeRenderer.renderHubNode(s,e,30);const r=this.config.entities?.battery_soc?this.sensorManager?.getPercentageValue(this.config.entities.battery_soc):void 0;for(const t of this.sourceNodes){const i="battery"===t.type?r:void 0;this.nodeRenderer.renderSourceNode(t,i)}for(const t of this.consumptionNodes)t.isVisible&&this.nodeRenderer.renderConsumptionNode(t)}startUpdateTimer(){const t=this.config?.update_interval??2e3;this.updateTimer=window.setInterval(()=>{this.sensorManager&&this.sensorManager.refresh()},t)}handleHassUpdate(){this.hass&&this.config&&(this.sensorManager&&this.sensorManager.unsubscribe(),this.initializeSensorManager())}reinitialize(){this.cleanup(),this.initializeSensorManager(),this.startUpdateTimer()}handleRefresh(){this.sensorManager&&this.sensorManager.refresh()}cleanup(){this.animationFrameId&&(cancelAnimationFrame(this.animationFrameId),this.animationFrameId=void 0),this.updateTimer&&(clearInterval(this.updateTimer),this.updateTimer=void 0),this.sensorManager&&this.sensorManager.unsubscribe(),this.particleSystem&&this.particleSystem.clear(),this.layoutEngine&&this.layoutEngine.stop(),this.resizeObserver&&(this.resizeObserver.disconnect(),this.resizeObserver=void 0)}};w.styles=u,p([e({attribute:!1})],w.prototype,"hass",void 0),p([r()],w.prototype,"config",void 0),p([r()],w.prototype,"sourceNodes",void 0),p([r()],w.prototype,"consumptionNodes",void 0),p([r()],w.prototype,"warnings",void 0),p([r()],w.prototype,"isLoading",void 0),p([r()],w.prototype,"errorMessage",void 0),p([o("canvas")],w.prototype,"canvas",void 0),w=p([n("energy-flow-card")],w),window.customCards=window.customCards||[],window.customCards.push({type:"energy-flow-card",name:"Energy Flow Card",description:"Visualize real-time energy flow between sources and devices"});export{w as EnergyFlowCard};
//# sourceMappingURL=energy-flow-card.js.map

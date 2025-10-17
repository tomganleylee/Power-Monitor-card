var EnergyFlowCard=function(t){"use strict";function i(t,i,s,e){var n,r=arguments.length,o=r<3?i:null===e?e=Object.getOwnPropertyDescriptor(i,s):e;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(t,i,s,e);else for(var a=t.length-1;a>=0;a--)(n=t[a])&&(o=(r<3?n(o):r>3?n(i,s,o):n(i,s))||o);return r>3&&o&&Object.defineProperty(i,s,o),o}"function"==typeof SuppressedError&&SuppressedError;
/**
     * @license
     * Copyright 2019 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */
const s=globalThis,e=s.ShadowRoot&&(void 0===s.ShadyCSS||s.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,n=Symbol(),r=new WeakMap;let o=class{constructor(t,i,s){if(this.i=!0,s!==n)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=i}get styleSheet(){let t=this.o;const i=this.t;if(e&&void 0===t){const s=void 0!==i&&1===i.length;s&&(t=r.get(i)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),s&&r.set(i,t))}return t}toString(){return this.cssText}};const a=(t,...i)=>{const s=1===t.length?t[0]:i.reduce((i,s,e)=>i+(t=>{if(!0===t.i)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+t[e+1],t[0]);return new o(s,t,n)},h=e?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let i="";for(const s of t.cssRules)i+=s.cssText;return(t=>new o("string"==typeof t?t:t+"",void 0,n))(i)})(t):t,{is:c,defineProperty:l,getOwnPropertyDescriptor:f,getOwnPropertyNames:d,getOwnPropertySymbols:u,getPrototypeOf:p}=Object,v=globalThis,g=v.trustedTypes,b=g?g.emptyScript:"",y=v.reactiveElementPolyfillSupport,m=(t,i)=>t,w={toAttribute(t,i){switch(i){case Boolean:t=t?b:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,i){let s=t;switch(i){case Boolean:s=null!==t;break;case Number:s=null===t?null:Number(t);break;case Object:case Array:try{s=JSON.parse(t)}catch(t){s=null}}return s}},x=(t,i)=>!c(t,i),$={attribute:!0,type:String,converter:w,reflect:!1,useDefault:!1,hasChanged:x};
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */Symbol.metadata??=Symbol("metadata"),v.litPropertyMetadata??=new WeakMap;let M=class extends HTMLElement{static addInitializer(t){this.v(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this.m&&[...this.m.keys()]}static createProperty(t,i=$){if(i.state&&(i.attribute=!1),this.v(),this.prototype.hasOwnProperty(t)&&((i=Object.create(i)).wrapped=!0),this.elementProperties.set(t,i),!i.noAccessor){const s=Symbol(),e=this.getPropertyDescriptor(t,s,i);void 0!==e&&l(this.prototype,t,e)}}static getPropertyDescriptor(t,i,s){const{get:e,set:n}=f(this.prototype,t)??{get(){return this[i]},set(t){this[i]=t}};return{get:e,set(i){const r=e?.call(this);n?.call(this,i),this.requestUpdate(t,r,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??$}static v(){if(this.hasOwnProperty(m("elementProperties")))return;const t=p(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(m("finalized")))return;if(this.finalized=!0,this.v(),this.hasOwnProperty(m("properties"))){const t=this.properties,i=[...d(t),...u(t)];for(const s of i)this.createProperty(s,t[s])}const t=this[Symbol.metadata];if(null!==t){const i=litPropertyMetadata.get(t);if(void 0!==i)for(const[t,s]of i)this.elementProperties.set(t,s)}this.m=new Map;for(const[t,i]of this.elementProperties){const s=this.M(t,i);void 0!==s&&this.m.set(s,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const i=[];if(Array.isArray(t)){const s=new Set(t.flat(1/0).reverse());for(const t of s)i.unshift(h(t))}else void 0!==t&&i.push(h(t));return i}static M(t,i){const s=i.attribute;return!1===s?void 0:"string"==typeof s?s:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this.S=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._=null,this.N()}N(){this.A=new Promise(t=>this.enableUpdating=t),this.W=new Map,this.P(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this.U??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this.U?.delete(t)}P(){const t=new Map,i=this.constructor.elementProperties;for(const s of i.keys())this.hasOwnProperty(s)&&(t.set(s,this[s]),delete this[s]);t.size>0&&(this.S=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((t,i)=>{if(e)t.adoptedStyleSheets=i.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const e of i){const i=document.createElement("style"),n=s.litNonce;void 0!==n&&i.setAttribute("nonce",n),i.textContent=e.cssText,t.appendChild(i)}})(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this.U?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this.U?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,i,s){this.D(t,s)}I(t,i){const s=this.constructor.elementProperties.get(t),e=this.constructor.M(t,s);if(void 0!==e&&!0===s.reflect){const n=(void 0!==s.converter?.toAttribute?s.converter:w).toAttribute(i,s.type);this._=t,null==n?this.removeAttribute(e):this.setAttribute(e,n),this._=null}}D(t,i){const s=this.constructor,e=s.m.get(t);if(void 0!==e&&this._!==e){const t=s.getPropertyOptions(e),n="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:w;this._=e;const r=n.fromAttribute(i,t.type);this[e]=r??this.V?.get(e)??r,this._=null}}requestUpdate(t,i,s){if(void 0!==t){const e=this.constructor,n=this[t];if(s??=e.getPropertyOptions(t),!((s.hasChanged??x)(n,i)||s.useDefault&&s.reflect&&n===this.V?.get(t)&&!this.hasAttribute(e.M(t,s))))return;this.C(t,i,s)}!1===this.isUpdatePending&&(this.A=this.R())}C(t,i,{useDefault:s,reflect:e,wrapped:n},r){s&&!(this.V??=new Map).has(t)&&(this.V.set(t,r??i??this[t]),!0!==n||void 0!==r)||(this.W.has(t)||(this.hasUpdated||s||(i=void 0),this.W.set(t,i)),!0===e&&this._!==t&&(this.L??=new Set).add(t))}async R(){this.isUpdatePending=!0;try{await this.A}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this.S){for(const[t,i]of this.S)this[t]=i;this.S=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[i,s]of t){const{wrapped:t}=s,e=this[i];!0!==t||this.W.has(i)||void 0===e||this.C(i,void 0,s,e)}}let t=!1;const i=this.W;try{t=this.shouldUpdate(i),t?(this.willUpdate(i),this.U?.forEach(t=>t.hostUpdate?.()),this.update(i)):this.B()}catch(i){throw t=!1,this.B(),i}t&&this.F(i)}willUpdate(t){}F(t){this.U?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}B(){this.W=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this.A}shouldUpdate(t){return!0}update(t){this.L&&=this.L.forEach(t=>this.I(t,this[t])),this.B()}updated(t){}firstUpdated(t){}};M.elementStyles=[],M.shadowRootOptions={mode:"open"},M[m("elementProperties")]=new Map,M[m("finalized")]=new Map,y?.({ReactiveElement:M}),(v.reactiveElementVersions??=[]).push("2.1.1");
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */
const S=globalThis,k=S.trustedTypes,_=k?k.createPolicy("lit-html",{createHTML:t=>t}):void 0,C="$lit$",N=`lit$${Math.random().toFixed(9).slice(2)}$`,A="?"+N,E=`<${A}>`,W=document,z=()=>W.createComment(""),P=t=>null===t||"object"!=typeof t&&"function"!=typeof t,U=Array.isArray,D="[ \t\n\f\r]",I=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,T=/-->/g,V=/>/g,j=RegExp(`>|${D}(?:([^\\s"'>=/]+)(${D}*=${D}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),O=/'/g,R=/"/g,L=/^(?:script|style|textarea|title)$/i,B=(t,...i)=>({H:1,strings:t,values:i}),F=Symbol.for("lit-noChange"),H=Symbol.for("lit-nothing"),G=new WeakMap,q=W.createTreeWalker(W,129);function Y(t,i){if(!U(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==_?_.createHTML(i):i}const J=(t,i)=>{const s=t.length-1,e=[];let n,r=2===i?"<svg>":3===i?"<math>":"",o=I;for(let i=0;i<s;i++){const s=t[i];let a,h,c=-1,l=0;for(;l<s.length&&(o.lastIndex=l,h=o.exec(s),null!==h);)l=o.lastIndex,o===I?"!--"===h[1]?o=T:void 0!==h[1]?o=V:void 0!==h[2]?(L.test(h[2])&&(n=RegExp("</"+h[2],"g")),o=j):void 0!==h[3]&&(o=j):o===j?">"===h[0]?(o=n??I,c=-1):void 0===h[1]?c=-2:(c=o.lastIndex-h[2].length,a=h[1],o=void 0===h[3]?j:'"'===h[3]?R:O):o===R||o===O?o=j:o===T||o===V?o=I:(o=j,n=void 0);const f=o===j&&t[i+1].startsWith("/>")?" ":"";r+=o===I?s+E:c>=0?(e.push(a),s.slice(0,c)+C+s.slice(c)+N+f):s+N+(-2===c?i:f)}return[Y(t,r+(t[s]||"<?>")+(2===i?"</svg>":3===i?"</math>":"")),e]};class X{constructor({strings:t,H:i},s){let e;this.parts=[];let n=0,r=0;const o=t.length-1,a=this.parts,[h,c]=J(t,i);if(this.el=X.createElement(h,s),q.currentNode=this.el.content,2===i||3===i){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(e=q.nextNode())&&a.length<o;){if(1===e.nodeType){if(e.hasAttributes())for(const t of e.getAttributeNames())if(t.endsWith(C)){const i=c[r++],s=e.getAttribute(t).split(N),o=/([.?@])?(.*)/.exec(i);a.push({type:1,index:n,name:o[2],strings:s,ctor:"."===o[1]?it:"?"===o[1]?st:"@"===o[1]?et:tt}),e.removeAttribute(t)}else t.startsWith(N)&&(a.push({type:6,index:n}),e.removeAttribute(t));if(L.test(e.tagName)){const t=e.textContent.split(N),i=t.length-1;if(i>0){e.textContent=k?k.emptyScript:"";for(let s=0;s<i;s++)e.append(t[s],z()),q.nextNode(),a.push({type:2,index:++n});e.append(t[i],z())}}}else if(8===e.nodeType)if(e.data===A)a.push({type:2,index:n});else{let t=-1;for(;-1!==(t=e.data.indexOf(N,t+1));)a.push({type:7,index:n}),t+=N.length-1}n++}}static createElement(t,i){const s=W.createElement("template");return s.innerHTML=t,s}}function Z(t,i,s=t,e){if(i===F)return i;let n=void 0!==e?s.G?.[e]:s.q;const r=P(i)?void 0:i.Y;return n?.constructor!==r&&(n?.J?.(!1),void 0===r?n=void 0:(n=new r(t),n.X(t,s,e)),void 0!==e?(s.G??=[])[e]=n:s.q=n),void 0!==n&&(i=Z(t,n.Z(t,i.values),n,e)),i}class K{constructor(t,i){this.K=[],this.tt=void 0,this.it=t,this.st=i}get parentNode(){return this.st.parentNode}get et(){return this.st.et}u(t){const{el:{content:i},parts:s}=this.it,e=(t?.creationScope??W).importNode(i,!0);q.currentNode=e;let n=q.nextNode(),r=0,o=0,a=s[0];for(;void 0!==a;){if(r===a.index){let i;2===a.type?i=new Q(n,n.nextSibling,this,t):1===a.type?i=new a.ctor(n,a.name,a.strings,this,t):6===a.type&&(i=new nt(n,this,t)),this.K.push(i),a=s[++o]}r!==a?.index&&(n=q.nextNode(),r++)}return q.currentNode=W,e}p(t){let i=0;for(const s of this.K)void 0!==s&&(void 0!==s.strings?(s.nt(t,s,i),i+=s.strings.length-2):s.nt(t[i])),i++}}class Q{get et(){return this.st?.et??this.rt}constructor(t,i,s,e){this.type=2,this.ot=H,this.tt=void 0,this.ht=t,this.ct=i,this.st=s,this.options=e,this.rt=e?.isConnected??!0}get parentNode(){let t=this.ht.parentNode;const i=this.st;return void 0!==i&&11===t?.nodeType&&(t=i.parentNode),t}get startNode(){return this.ht}get endNode(){return this.ct}nt(t,i=this){t=Z(this,t,i),P(t)?t===H||null==t||""===t?(this.ot!==H&&this.lt(),this.ot=H):t!==this.ot&&t!==F&&this.ft(t):void 0!==t.H?this.$(t):void 0!==t.nodeType?this.T(t):(t=>U(t)||"function"==typeof t?.[Symbol.iterator])(t)?this.k(t):this.ft(t)}O(t){return this.ht.parentNode.insertBefore(t,this.ct)}T(t){this.ot!==t&&(this.lt(),this.ot=this.O(t))}ft(t){this.ot!==H&&P(this.ot)?this.ht.nextSibling.data=t:this.T(W.createTextNode(t)),this.ot=t}$(t){const{values:i,H:s}=t,e="number"==typeof s?this.dt(t):(void 0===s.el&&(s.el=X.createElement(Y(s.h,s.h[0]),this.options)),s);if(this.ot?.it===e)this.ot.p(i);else{const t=new K(e,this),s=t.u(this.options);t.p(i),this.T(s),this.ot=t}}dt(t){let i=G.get(t.strings);return void 0===i&&G.set(t.strings,i=new X(t)),i}k(t){U(this.ot)||(this.ot=[],this.lt());const i=this.ot;let s,e=0;for(const n of t)e===i.length?i.push(s=new Q(this.O(z()),this.O(z()),this,this.options)):s=i[e],s.nt(n),e++;e<i.length&&(this.lt(s&&s.ct.nextSibling,e),i.length=e)}lt(t=this.ht.nextSibling,i){for(this.ut?.(!1,!0,i);t!==this.ct;){const i=t.nextSibling;t.remove(),t=i}}setConnected(t){void 0===this.st&&(this.rt=t,this.ut?.(t))}}class tt{get tagName(){return this.element.tagName}get et(){return this.st.et}constructor(t,i,s,e,n){this.type=1,this.ot=H,this.tt=void 0,this.element=t,this.name=i,this.st=e,this.options=n,s.length>2||""!==s[0]||""!==s[1]?(this.ot=Array(s.length-1).fill(new String),this.strings=s):this.ot=H}nt(t,i=this,s,e){const n=this.strings;let r=!1;if(void 0===n)t=Z(this,t,i,0),r=!P(t)||t!==this.ot&&t!==F,r&&(this.ot=t);else{const e=t;let o,a;for(t=n[0],o=0;o<n.length-1;o++)a=Z(this,e[s+o],i,o),a===F&&(a=this.ot[o]),r||=!P(a)||a!==this.ot[o],a===H?t=H:t!==H&&(t+=(a??"")+n[o+1]),this.ot[o]=a}r&&!e&&this.j(t)}j(t){t===H?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class it extends tt{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===H?void 0:t}}class st extends tt{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==H)}}class et extends tt{constructor(t,i,s,e,n){super(t,i,s,e,n),this.type=5}nt(t,i=this){if((t=Z(this,t,i,0)??H)===F)return;const s=this.ot,e=t===H&&s!==H||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,n=t!==H&&(s===H||e);e&&this.element.removeEventListener(this.name,this,s),n&&this.element.addEventListener(this.name,this,t),this.ot=t}handleEvent(t){"function"==typeof this.ot?this.ot.call(this.options?.host??this.element,t):this.ot.handleEvent(t)}}class nt{constructor(t,i,s){this.element=t,this.type=6,this.tt=void 0,this.st=i,this.options=s}get et(){return this.st.et}nt(t){Z(this,t)}}const rt=S.litHtmlPolyfillSupport;rt?.(X,Q),(S.litHtmlVersions??=[]).push("3.3.1");const ot=globalThis;
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */class at extends M{constructor(){super(...arguments),this.renderOptions={host:this},this.vt=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const i=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this.vt=((t,i,s)=>{const e=s?.renderBefore??i;let n=e.gt;if(void 0===n){const t=s?.renderBefore??null;e.gt=n=new Q(i.insertBefore(z(),t),t,void 0,s??{})}return n.nt(t),n})(i,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this.vt?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this.vt?.setConnected(!1)}render(){return F}}at.bt=!0,at.finalized=!0,ot.litElementHydrateSupport?.({LitElement:at});const ht=ot.litElementPolyfillSupport;ht?.({LitElement:at}),(ot.litElementVersions??=[]).push("4.2.1");
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */
const ct=t=>(i,s)=>{void 0!==s?s.addInitializer(()=>{customElements.define(t,i)}):customElements.define(t,i)},lt={attribute:!0,type:String,converter:w,reflect:!1,hasChanged:x},ft=(t=lt,i,s)=>{const{kind:e,metadata:n}=s;let r=globalThis.litPropertyMetadata.get(n);if(void 0===r&&globalThis.litPropertyMetadata.set(n,r=new Map),"setter"===e&&((t=Object.create(t)).wrapped=!0),r.set(s.name,t),"accessor"===e){const{name:e}=s;return{set(s){const n=i.get.call(this);i.set.call(this,s),this.requestUpdate(e,n,t)},init(i){return void 0!==i&&this.C(e,void 0,t,i),i}}}if("setter"===e){const{name:e}=s;return function(s){const n=this[e];i.call(this,s),this.requestUpdate(e,n,t)}}throw Error("Unsupported decorator location: "+e)};
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */function dt(t){return(i,s)=>"object"==typeof s?ft(t,i,s):((t,i,s)=>{const e=i.hasOwnProperty(s);return i.constructor.createProperty(s,t),e?Object.getOwnPropertyDescriptor(i,s):void 0})(t,i,s)}
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */function ut(t){return dt({...t,state:!0,attribute:!1})}
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */const pt=a`
  :host {
    display: block;
    background: linear-gradient(135deg, #0a1628 0%, #1a2332 100%);
    border-radius: var(--ha-card-border-radius, 12px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
    overflow: hidden;
    font-family: var(--primary-font-family, 'Roboto', sans-serif);
    color: #ffffff;
  }

  .card-content {
    display: flex;
    flex-direction: column;
    padding: 20px;
    position: relative;
    background: linear-gradient(135deg, rgba(10, 22, 40, 0.95) 0%, rgba(26, 35, 50, 0.95) 100%);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .card-title {
    font-size: 20px;
    font-weight: 600;
    color: #ffffff;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }

  .refresh-button {
    cursor: pointer;
    padding: 8px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #ffffff;
    transition: all 0.3s ease;
  }

  .refresh-button:hover {
    background: rgba(255, 255, 255, 0.1);
    box-shadow: 0 0 12px rgba(100, 200, 255, 0.3);
  }

  .canvas-container {
    position: relative;
    width: 100%;
    min-height: 500px;
    background: radial-gradient(ellipse at center, rgba(30, 50, 80, 0.3) 0%, rgba(10, 20, 35, 0.8) 100%);
    border-radius: 12px;
    overflow: hidden;
    box-shadow: inset 0 0 60px rgba(0, 0, 0, 0.5);
  }

  canvas {
    display: block;
    width: 100%;
    height: 100%;
    touch-action: none;
  }

  /* Statistics Panel - Dark styled panel at bottom */
  .statistics-panel {
    display: flex;
    justify-content: center;
    gap: 32px;
    margin-top: 24px;
    padding: 20px 32px;
    background: rgba(0, 0, 0, 0.4);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  .stat-label {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.6);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 500;
  }

  .stat-value {
    font-size: 28px;
    font-weight: 700;
    color: #64b5f6;
    text-shadow: 0 0 20px rgba(100, 181, 246, 0.5);
  }

  .stat-unit {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.5);
    margin-left: 4px;
  }

  /* Warning Banner - Orange alert style */
  .warning-banner {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 20px;
    margin-bottom: 16px;
    background: rgba(255, 152, 0, 0.15);
    border-left: 4px solid #ff9800;
    border-radius: 8px;
    font-size: 14px;
    color: #ffb74d;
    backdrop-filter: blur(10px);
  }

  .warning-icon {
    font-size: 22px;
    filter: drop-shadow(0 0 8px rgba(255, 152, 0, 0.6));
  }

  .stale-indicator {
    position: absolute;
    top: 12px;
    right: 12px;
    padding: 6px 12px;
    background: rgba(244, 67, 54, 0.2);
    border: 1px solid #f44336;
    color: #ff5252;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 300px;
    color: rgba(255, 255, 255, 0.5);
    font-size: 16px;
  }

  .error {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 12px;
    padding: 32px;
    color: #f44336;
    text-align: center;
  }

  .error-icon {
    font-size: 56px;
    filter: drop-shadow(0 0 12px rgba(244, 67, 54, 0.5));
  }

  .error-message {
    font-size: 15px;
    line-height: 1.5;
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .card-content {
      padding: 16px;
    }

    .statistics-panel {
      gap: 20px;
      padding: 16px 20px;
    }

    .stat-value {
      font-size: 24px;
    }

    .canvas-container {
      min-height: 400px;
    }
  }

  @media (max-width: 480px) {
    .card-title {
      font-size: 18px;
    }

    .statistics-panel {
      flex-direction: column;
      gap: 16px;
    }

    .canvas-container {
      min-height: 350px;
    }
  }

  /* Glow animations */
  @keyframes pulse-glow {
    0%, 100% {
      opacity: 1;
      filter: drop-shadow(0 0 8px currentColor);
    }
    50% {
      opacity: 0.7;
      filter: drop-shadow(0 0 16px currentColor);
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .fade-in {
    animation: fadeIn 0.4s ease-out;
  }

  .pulse-glow {
    animation: pulse-glow 2s ease-in-out infinite;
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

  *:focus-visible {
    outline: 2px solid #64b5f6;
    outline-offset: 3px;
    border-radius: 4px;
  }
`;class vt{constructor(t,i=6e4){this.unsubscribeCallback=null,this.updateCallback=null,this.staleThresholdMs=6e4,this.hass=t,this.sensorStates=new Map,this.staleThresholdMs=i}subscribe(t,i){this.updateCallback=i;for(const i of t)this.updateSensorState(i);this.unsubscribeCallback=()=>{}}unsubscribe(){this.unsubscribeCallback&&(this.unsubscribeCallback(),this.unsubscribeCallback=null),this.updateCallback=null}getSensorState(t){return this.sensorStates.get(t)||null}getPowerValue(t){const i=this.sensorStates.get(t);return!i||i.isUnavailable||i.isStale?void 0===i?.lastValidValue||i.isStale?0:i.lastValidValue:i.value}getPercentageValue(t){const i=this.sensorStates.get(t);return!i||i.isUnavailable||i.isStale?0:Math.max(0,Math.min(100,i.value))}getStaleSensors(){const t=[];for(const[i,s]of this.sensorStates)s.isStale&&t.push(i);return t}updateSensorState(t){const i=this.hass.states[t];if(!i)return void this.sensorStates.set(t,{entityId:t,value:0,unit:"",isStale:!1,isUnavailable:!0,lastUpdated:Date.now()});const s="unavailable"===i.state||"unknown"===i.state,e=new Date(i.last_updated).getTime(),n=function(t,i=6e4){return Date.now()-t>i}(e,this.staleThresholdMs);let r,o=0;if(s){const i=this.sensorStates.get(t);r=i?.lastValidValue}else o=this.parseNumericState(i.state),r=o;this.sensorStates.set(t,{entityId:t,value:o,unit:i.attributes.unit_of_measurement||"",isStale:n,isUnavailable:s,lastUpdated:e,lastValidValue:r})}parseNumericState(t){const i=parseFloat(t);return isNaN(i)?0:i}refresh(){for(const t of this.sensorStates.keys())this.updateSensorState(t);this.updateCallback&&this.updateCallback()}getAllStates(){return new Map(this.sensorStates)}clear(){this.sensorStates.clear()}}class gt{constructor(t=500){this.particlePool=[],this.activeParticles=new Set,this.nextParticleId=0,this.poolSize=500,this.lastSpawnTime=new Map,this.poolSize=t,this.initializePool()}initializePool(){for(let t=0;t<this.poolSize;t++)this.particlePool.push(this.createParticle(t))}createParticle(t){return{id:t,sourceNode:null,targetNode:null,lifetime:0,x:0,y:0,vx:0,vy:0,color:"#ffffff",radius:4,opacity:1,isActive:!1,wanderAngle:Math.random()*Math.PI*2,wanderSpeed:.3+.7*Math.random(),maxSpeed:60}}spawnParticles(t,i,s,e){const n=function(t){const i=Math.abs(t)/150;return Math.min(12,Math.max(.5,i))}(s),r=1e3/n,o=`${"type"in t?t.type:"device"}_${t.entityId}_${i.entityId}`,a=this.lastSpawnTime.get(o)??0,h=Date.now();if(h-a<r)return;const c=this.acquireParticle();if(c){const e=function(t){const i=Math.abs(t);return i<100?.08:i<1e3?.12:i<5e3?.18:.25}(s),n="color"in t?t.color:"#999999";c.sourceNode=t,c.targetNode=i,c.lifetime=0;const r=20;c.x=t.x+(Math.random()-.5)*r,c.y=t.y+(Math.random()-.5)*r;const a=i.x-c.x,l=i.y-c.y,f=Math.sqrt(a*a+l*l),d=30*e;c.vx=a/f*d+20*(Math.random()-.5),c.vy=l/f*d+20*(Math.random()-.5),c.color=n,c.opacity=0,c.isActive=!0,c.wanderAngle=Math.random()*Math.PI*2,c.wanderSpeed=.3+.7*Math.random(),c.maxSpeed=270,this.activeParticles.add(c.id),this.lastSpawnTime.set(o,h)}}update(t){const i=[];for(const s of this.activeParticles){const e=this.particlePool[s];if(e&&e.isActive){if(e.lifetime+=t,e.targetNode){const n=e.targetNode.x-e.x,r=e.targetNode.y-e.y,o=Math.sqrt(n*n+r*r);if(o<30){i.push(s);continue}if(e.lifetime>3.5){i.push(s);continue}const a=2040,h=n/o*a*t,c=r/o*a*t;e.wanderAngle+=.4*(Math.random()-.5);const l=8*e.wanderSpeed,f=Math.cos(e.wanderAngle)*l*t,d=Math.sin(e.wanderAngle)*l*t;e.vx+=h+f,e.vy+=c+d;const u=.998;e.vx*=u,e.vy*=u;const p=Math.sqrt(e.vx*e.vx+e.vy*e.vy);p>e.maxSpeed&&(e.vx=e.vx/p*e.maxSpeed,e.vy=e.vy/p*e.maxSpeed),e.x+=e.vx*t,e.y+=e.vy*t}e.lifetime<.2?e.opacity=e.lifetime/.2:e.lifetime>2?e.opacity=Math.max(0,(2.5-e.lifetime)/.5):e.opacity=.9}else i.push(s)}for(const t of i)this.releaseParticle(t)}render(t){for(const i of this.activeParticles){const s=this.particlePool[i];s&&s.isActive&&(t.save(),t.globalAlpha=s.opacity,t.shadowBlur=12,t.shadowColor=s.color,t.fillStyle=s.color,t.beginPath(),t.arc(s.x,s.y,s.radius,0,2*Math.PI),t.fill(),t.shadowBlur=8,t.fillStyle="#ffffff",t.beginPath(),t.arc(s.x,s.y,.4*s.radius,0,2*Math.PI),t.fill(),t.restore())}}acquireParticle(){for(let t=0;t<this.particlePool.length;t++){const i=this.particlePool[t];if(!i.isActive)return i}if(this.activeParticles.size>0){const t=this.activeParticles.values().next().value;if(void 0!==t)return this.releaseParticle(t),this.particlePool[t]}return null}releaseParticle(t){const i=this.particlePool[t];i&&(i.isActive=!1,i.sourceNode=null,i.targetNode=null,this.activeParticles.delete(t))}easeInOutCubic(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2}getActiveCount(){return this.activeParticles.size}getUtilization(){return this.activeParticles.size/this.poolSize*100}clear(){for(const t of this.activeParticles)this.releaseParticle(t);this.lastSpawnTime.clear()}reset(){this.clear(),this.nextParticleId=0}getActiveParticles(){return Array.from(this.activeParticles).map(t=>this.particlePool[t]).filter(t=>t&&t.isActive)}}function bt(t,i,s,e){if(isNaN(i)||isNaN(s))return t;var n,r,o,a,h,c,l,f,d,u=t.yt,p={data:e},v=t.wt,g=t.xt,b=t.$t,y=t.Mt;if(!u)return t.yt=p,t;for(;u.length;)if((c=i>=(r=(v+b)/2))?v=r:b=r,(l=s>=(o=(g+y)/2))?g=o:y=o,n=u,!(u=u[f=l<<1|c]))return n[f]=p,t;if(a=+t.St.call(null,u.data),h=+t.kt.call(null,u.data),i===a&&s===h)return p.next=u,n?n[f]=p:t.yt=p,t;do{n=n?n[f]=new Array(4):t.yt=new Array(4),(c=i>=(r=(v+b)/2))?v=r:b=r,(l=s>=(o=(g+y)/2))?g=o:y=o}while((f=l<<1|c)==(d=(h>=o)<<1|a>=r));return n[d]=u,n[f]=p,t}function yt(t,i,s,e,n){this.node=t,this.x0=i,this.y0=s,this.x1=e,this.y1=n}function mt(t){return t[0]}function wt(t){return t[1]}function xt(t,i,s){var e=new $t(i??mt,s??wt,NaN,NaN,NaN,NaN);return null==t?e:e.addAll(t)}function $t(t,i,s,e,n,r){this.St=t,this.kt=i,this.wt=s,this.xt=e,this.$t=n,this.Mt=r,this.yt=void 0}function Mt(t){for(var i={data:t.data},s=i;t=t.next;)s=s.next={data:t.data};return i}var St=xt.prototype=$t.prototype;function kt(t){return function(){return t}}function _t(t){return 1e-6*(t()-.5)}function Ct(t){return t.x+t.vx}function Nt(t){return t.y+t.vy}function At(t){return t.index}function Et(t,i){var s=t.get(i);if(!s)throw new Error("node not found: "+i);return s}St.copy=function(){var t,i,s=new $t(this.St,this.kt,this.wt,this.xt,this.$t,this.Mt),e=this.yt;if(!e)return s;if(!e.length)return s.yt=Mt(e),s;for(t=[{source:e,target:s.yt=new Array(4)}];e=t.pop();)for(var n=0;n<4;++n)(i=e.source[n])&&(i.length?t.push({source:i,target:e.target[n]=new Array(4)}):e.target[n]=Mt(i));return s},St.add=function(t){const i=+this.St.call(null,t),s=+this.kt.call(null,t);return bt(this.cover(i,s),i,s,t)},St.addAll=function(t){var i,s,e,n,r=t.length,o=new Array(r),a=new Array(r),h=1/0,c=1/0,l=-1/0,f=-1/0;for(s=0;s<r;++s)isNaN(e=+this.St.call(null,i=t[s]))||isNaN(n=+this.kt.call(null,i))||(o[s]=e,a[s]=n,e<h&&(h=e),e>l&&(l=e),n<c&&(c=n),n>f&&(f=n));if(h>l||c>f)return this;for(this.cover(h,c).cover(l,f),s=0;s<r;++s)bt(this,o[s],a[s],t[s]);return this},St.cover=function(t,i){if(isNaN(t=+t)||isNaN(i=+i))return this;var s=this.wt,e=this.xt,n=this.$t,r=this.Mt;if(isNaN(s))n=(s=Math.floor(t))+1,r=(e=Math.floor(i))+1;else{for(var o,a,h=n-s||1,c=this.yt;s>t||t>=n||e>i||i>=r;)switch(a=(i<e)<<1|t<s,(o=new Array(4))[a]=c,c=o,h*=2,a){case 0:n=s+h,r=e+h;break;case 1:s=n-h,r=e+h;break;case 2:n=s+h,e=r-h;break;case 3:s=n-h,e=r-h}this.yt&&this.yt.length&&(this.yt=c)}return this.wt=s,this.xt=e,this.$t=n,this.Mt=r,this},St.data=function(){var t=[];return this.visit(function(i){if(!i.length)do{t.push(i.data)}while(i=i.next)}),t},St.extent=function(t){return arguments.length?this.cover(+t[0][0],+t[0][1]).cover(+t[1][0],+t[1][1]):isNaN(this.wt)?void 0:[[this.wt,this.xt],[this.$t,this.Mt]]},St.find=function(t,i,s){var e,n,r,o,a,h,c,l=this.wt,f=this.xt,d=this.$t,u=this.Mt,p=[],v=this.yt;for(v&&p.push(new yt(v,l,f,d,u)),null==s?s=1/0:(l=t-s,f=i-s,d=t+s,u=i+s,s*=s);h=p.pop();)if(!(!(v=h.node)||(n=h.x0)>d||(r=h.y0)>u||(o=h.x1)<l||(a=h.y1)<f))if(v.length){var g=(n+o)/2,b=(r+a)/2;p.push(new yt(v[3],g,b,o,a),new yt(v[2],n,b,g,a),new yt(v[1],g,r,o,b),new yt(v[0],n,r,g,b)),(c=(i>=b)<<1|t>=g)&&(h=p[p.length-1],p[p.length-1]=p[p.length-1-c],p[p.length-1-c]=h)}else{var y=t-+this.St.call(null,v.data),m=i-+this.kt.call(null,v.data),w=y*y+m*m;if(w<s){var x=Math.sqrt(s=w);l=t-x,f=i-x,d=t+x,u=i+x,e=v.data}}return e},St.remove=function(t){if(isNaN(r=+this.St.call(null,t))||isNaN(o=+this.kt.call(null,t)))return this;var i,s,e,n,r,o,a,h,c,l,f,d,u=this.yt,p=this.wt,v=this.xt,g=this.$t,b=this.Mt;if(!u)return this;if(u.length)for(;;){if((c=r>=(a=(p+g)/2))?p=a:g=a,(l=o>=(h=(v+b)/2))?v=h:b=h,i=u,!(u=u[f=l<<1|c]))return this;if(!u.length)break;(i[f+1&3]||i[f+2&3]||i[f+3&3])&&(s=i,d=f)}for(;u.data!==t;)if(e=u,!(u=u.next))return this;return(n=u.next)&&delete u.next,e?(n?e.next=n:delete e.next,this):i?(n?i[f]=n:delete i[f],(u=i[0]||i[1]||i[2]||i[3])&&u===(i[3]||i[2]||i[1]||i[0])&&!u.length&&(s?s[d]=u:this.yt=u),this):(this.yt=n,this)},St.removeAll=function(t){for(var i=0,s=t.length;i<s;++i)this.remove(t[i]);return this},St.root=function(){return this.yt},St.size=function(){var t=0;return this.visit(function(i){if(!i.length)do{++t}while(i=i.next)}),t},St.visit=function(t){var i,s,e,n,r,o,a=[],h=this.yt;for(h&&a.push(new yt(h,this.wt,this.xt,this.$t,this.Mt));i=a.pop();)if(!t(h=i.node,e=i.x0,n=i.y0,r=i.x1,o=i.y1)&&h.length){var c=(e+r)/2,l=(n+o)/2;(s=h[3])&&a.push(new yt(s,c,l,r,o)),(s=h[2])&&a.push(new yt(s,e,l,c,o)),(s=h[1])&&a.push(new yt(s,c,n,r,l)),(s=h[0])&&a.push(new yt(s,e,n,c,l))}return this},St.visitAfter=function(t){var i,s=[],e=[];for(this.yt&&s.push(new yt(this.yt,this.wt,this.xt,this.$t,this.Mt));i=s.pop();){var n=i.node;if(n.length){var r,o=i.x0,a=i.y0,h=i.x1,c=i.y1,l=(o+h)/2,f=(a+c)/2;(r=n[0])&&s.push(new yt(r,o,a,l,f)),(r=n[1])&&s.push(new yt(r,l,a,h,f)),(r=n[2])&&s.push(new yt(r,o,f,l,c)),(r=n[3])&&s.push(new yt(r,l,f,h,c))}e.push(i)}for(;i=e.pop();)t(i.node,i.x0,i.y0,i.x1,i.y1);return this},St.x=function(t){return arguments.length?(this.St=t,this):this.St},St.y=function(t){return arguments.length?(this.kt=t,this):this.kt};var Wt={value:()=>{}};function zt(){for(var t,i=0,s=arguments.length,e={};i<s;++i){if(!(t=arguments[i]+"")||t in e||/[\s.]/.test(t))throw new Error("illegal type: "+t);e[t]=[]}return new Pt(e)}function Pt(t){this.ft=t}function Ut(t,i){for(var s,e=0,n=t.length;e<n;++e)if((s=t[e]).name===i)return s.value}function Dt(t,i,s){for(var e=0,n=t.length;e<n;++e)if(t[e].name===i){t[e]=Wt,t=t.slice(0,e).concat(t.slice(e+1));break}return null!=s&&t.push({name:i,value:s}),t}Pt.prototype=zt.prototype={constructor:Pt,on:function(t,i){var s,e,n=this.ft,r=(e=n,(t+"").trim().split(/^|\s+/).map(function(t){var i="",s=t.indexOf(".");if(s>=0&&(i=t.slice(s+1),t=t.slice(0,s)),t&&!e.hasOwnProperty(t))throw new Error("unknown type: "+t);return{type:t,name:i}})),o=-1,a=r.length;if(!(arguments.length<2)){if(null!=i&&"function"!=typeof i)throw new Error("invalid callback: "+i);for(;++o<a;)if(s=(t=r[o]).type)n[s]=Dt(n[s],t.name,i);else if(null==i)for(s in n)n[s]=Dt(n[s],t.name,null);return this}for(;++o<a;)if((s=(t=r[o]).type)&&(s=Ut(n[s],t.name)))return s},copy:function(){var t={},i=this.ft;for(var s in i)t[s]=i[s].slice();return new Pt(t)},call:function(t,i){if((s=arguments.length-2)>0)for(var s,e,n=new Array(s),r=0;r<s;++r)n[r]=arguments[r+2];if(!this.ft.hasOwnProperty(t))throw new Error("unknown type: "+t);for(r=0,s=(e=this.ft[t]).length;r<s;++r)e[r].value.apply(i,n)},apply:function(t,i,s){if(!this.ft.hasOwnProperty(t))throw new Error("unknown type: "+t);for(var e=this.ft[t],n=0,r=e.length;n<r;++n)e[n].value.apply(i,s)}};var It,Tt,Vt=0,jt=0,Ot=0,Rt=0,Lt=0,Bt=0,Ft="object"==typeof performance&&performance.now?performance:Date,Ht="object"==typeof window&&window.requestAnimationFrame?window.requestAnimationFrame.bind(window):function(t){setTimeout(t,17)};function Gt(){return Lt||(Ht(qt),Lt=Ft.now()+Bt)}function qt(){Lt=0}function Yt(){this._t=this.Ct=this.Nt=null}function Jt(t,i,s){var e=new Yt;return e.restart(t,i,s),e}function Xt(){Lt=(Rt=Ft.now())+Bt,Vt=jt=0;try{!function(){Gt(),++Vt;for(var t,i=It;i;)(t=Lt-i.Ct)>=0&&i._t.call(void 0,t),i=i.Nt;--Vt}()}finally{Vt=0,function(){for(var t,i,s=It,e=1/0;s;)s._t?(e>s.Ct&&(e=s.Ct),t=s,s=s.Nt):(i=s.Nt,s.Nt=null,s=t?t.Nt=i:It=i);Tt=t,Kt(e)}(),Lt=0}}function Zt(){var t=Ft.now(),i=t-Rt;i>1e3&&(Bt-=i,Rt=t)}function Kt(t){Vt||(jt&&(jt=clearTimeout(jt)),t-Lt>24?(t<1/0&&(jt=setTimeout(Xt,t-Ft.now()-Bt)),Ot&&(Ot=clearInterval(Ot))):(Ot||(Rt=Ft.now(),Ot=setInterval(Zt,1e3)),Vt=1,Ht(Xt)))}Yt.prototype=Jt.prototype={constructor:Yt,restart:function(t,i,s){if("function"!=typeof t)throw new TypeError("callback is not a function");s=(null==s?Gt():+s)+(null==i?0:+i),this.Nt||Tt===this||(Tt?Tt.Nt=this:It=this,Tt=this),this._t=t,this.Ct=s,Kt()},stop:function(){this._t&&(this._t=null,this.Ct=1/0,Kt())}};const Qt=4294967296;function ti(t){return t.x}function ii(t){return t.y}var si=Math.PI*(3-Math.sqrt(5));function ei(t){var i,s,e,n=kt(.1);function r(t){for(var n,r=0,o=i.length;r<o;++r)(n=i[r]).vx+=(e[r]-n.x)*s[r]*t}function o(){if(i){var r,o=i.length;for(s=new Array(o),e=new Array(o),r=0;r<o;++r)s[r]=isNaN(e[r]=+t(i[r],r,i))?0:+n(i[r],r,i)}}return"function"!=typeof t&&(t=kt(null==t?0:+t)),r.initialize=function(t){i=t,o()},r.strength=function(t){return arguments.length?(n="function"==typeof t?t:kt(+t),o(),r):n},r.x=function(i){return arguments.length?(t="function"==typeof i?i:kt(+i),o(),r):t},r}function ni(t){var i,s,e,n=kt(.1);function r(t){for(var n,r=0,o=i.length;r<o;++r)(n=i[r]).vy+=(e[r]-n.y)*s[r]*t}function o(){if(i){var r,o=i.length;for(s=new Array(o),e=new Array(o),r=0;r<o;++r)s[r]=isNaN(e[r]=+t(i[r],r,i))?0:+n(i[r],r,i)}}return"function"!=typeof t&&(t=kt(null==t?0:+t)),r.initialize=function(t){i=t,o()},r.strength=function(t){return arguments.length?(n="function"==typeof t?t:kt(+t),o(),r):n},r.y=function(i){return arguments.length?(t="function"==typeof i?i:kt(+i),o(),r):t},r}class ri{constructor(t,i){this.nodes=[],this.links=[],this.width=t,this.height=i,this.initializeSimulation()}initializeSimulation(){this.simulation=function(t){var i,s=1,e=.001,n=1-Math.pow(e,1/300),r=0,o=.6,a=new Map,h=Jt(f),c=zt("tick","end"),l=function(){let t=1;return()=>(t=(1664525*t+1013904223)%Qt)/Qt}();function f(){d(),c.call("tick",i),s<e&&(h.stop(),c.call("end",i))}function d(e){var h,c,l=t.length;void 0===e&&(e=1);for(var f=0;f<e;++f)for(s+=(r-s)*n,a.forEach(function(t){t(s)}),h=0;h<l;++h)null==(c=t[h]).fx?c.x+=c.vx*=o:(c.x=c.fx,c.vx=0),null==c.fy?c.y+=c.vy*=o:(c.y=c.fy,c.vy=0);return i}function u(){for(var i,s=0,e=t.length;s<e;++s){if((i=t[s]).index=s,null!=i.fx&&(i.x=i.fx),null!=i.fy&&(i.y=i.fy),isNaN(i.x)||isNaN(i.y)){var n=10*Math.sqrt(.5+s),r=s*si;i.x=n*Math.cos(r),i.y=n*Math.sin(r)}(isNaN(i.vx)||isNaN(i.vy))&&(i.vx=i.vy=0)}}function p(i){return i.initialize&&i.initialize(t,l),i}return null==t&&(t=[]),u(),i={tick:d,restart:function(){return h.restart(f),i},stop:function(){return h.stop(),i},nodes:function(s){return arguments.length?(t=s,u(),a.forEach(p),i):t},alpha:function(t){return arguments.length?(s=+t,i):s},alphaMin:function(t){return arguments.length?(e=+t,i):e},alphaDecay:function(t){return arguments.length?(n=+t,i):+n},alphaTarget:function(t){return arguments.length?(r=+t,i):r},velocityDecay:function(t){return arguments.length?(o=1-t,i):1-o},randomSource:function(t){return arguments.length?(l=t,a.forEach(p),i):l},force:function(t,s){return arguments.length>1?(null==s?a.delete(t):a.set(t,p(s)),i):a.get(t)},find:function(i,s,e){var n,r,o,a,h,c=0,l=t.length;for(null==e?e=1/0:e*=e,c=0;c<l;++c)(o=(n=i-(a=t[c]).x)*n+(r=s-a.y)*r)<e&&(h=a,e=o);return h},on:function(t,s){return arguments.length>1?(c.on(t,s),i):c.on(t)}}}().force("link",function(t){var i,s,e,n,r,o,a=At,h=function(t){return 1/Math.min(n[t.source.index],n[t.target.index])},c=kt(30),l=1;function f(e){for(var n=0,a=t.length;n<l;++n)for(var h,c,f,d,u,p,v,g=0;g<a;++g)c=(h=t[g]).source,d=(f=h.target).x+f.vx-c.x-c.vx||_t(o),u=f.y+f.vy-c.y-c.vy||_t(o),d*=p=((p=Math.sqrt(d*d+u*u))-s[g])/p*e*i[g],u*=p,f.vx-=d*(v=r[g]),f.vy-=u*v,c.vx+=d*(v=1-v),c.vy+=u*v}function d(){if(e){var o,h,c=e.length,l=t.length,f=new Map(e.map((t,i)=>[a(t,i,e),t]));for(o=0,n=new Array(c);o<l;++o)(h=t[o]).index=o,"object"!=typeof h.source&&(h.source=Et(f,h.source)),"object"!=typeof h.target&&(h.target=Et(f,h.target)),n[h.source.index]=(n[h.source.index]||0)+1,n[h.target.index]=(n[h.target.index]||0)+1;for(o=0,r=new Array(l);o<l;++o)h=t[o],r[o]=n[h.source.index]/(n[h.source.index]+n[h.target.index]);i=new Array(l),u(),s=new Array(l),p()}}function u(){if(e)for(var s=0,n=t.length;s<n;++s)i[s]=+h(t[s],s,t)}function p(){if(e)for(var i=0,n=t.length;i<n;++i)s[i]=+c(t[i],i,t)}return null==t&&(t=[]),f.initialize=function(t,i){e=t,o=i,d()},f.links=function(i){return arguments.length?(t=i,d(),f):t},f.id=function(t){return arguments.length?(a=t,f):a},f.iterations=function(t){return arguments.length?(l=+t,f):l},f.strength=function(t){return arguments.length?(h="function"==typeof t?t:kt(+t),u(),f):h},f.distance=function(t){return arguments.length?(c="function"==typeof t?t:kt(+t),p(),f):c},f}().id(t=>t.id).distance(150).strength(t=>t.strength)).force("charge",function(){var t,i,s,e,n,r=kt(-30),o=1,a=1/0,h=.81;function c(s){var n,r=t.length,o=xt(t,ti,ii).visitAfter(f);for(e=s,n=0;n<r;++n)i=t[n],o.visit(d)}function l(){if(t){var i,s,e=t.length;for(n=new Array(e),i=0;i<e;++i)s=t[i],n[s.index]=+r(s,i,t)}}function f(t){var i,s,e,r,o,a=0,h=0;if(t.length){for(e=r=o=0;o<4;++o)(i=t[o])&&(s=Math.abs(i.value))&&(a+=i.value,h+=s,e+=s*i.x,r+=s*i.y);t.x=e/h,t.y=r/h}else{(i=t).x=i.data.x,i.y=i.data.y;do{a+=n[i.data.index]}while(i=i.next)}t.value=a}function d(t,r,c,l){if(!t.value)return!0;var f=t.x-i.x,d=t.y-i.y,u=l-r,p=f*f+d*d;if(u*u/h<p)return p<a&&(0===f&&(p+=(f=_t(s))*f),0===d&&(p+=(d=_t(s))*d),p<o&&(p=Math.sqrt(o*p)),i.vx+=f*t.value*e/p,i.vy+=d*t.value*e/p),!0;if(!(t.length||p>=a)){(t.data!==i||t.next)&&(0===f&&(p+=(f=_t(s))*f),0===d&&(p+=(d=_t(s))*d),p<o&&(p=Math.sqrt(o*p)));do{t.data!==i&&(u=n[t.data.index]*e/p,i.vx+=f*u,i.vy+=d*u)}while(t=t.next)}}return c.initialize=function(i,e){t=i,s=e,l()},c.strength=function(t){return arguments.length?(r="function"==typeof t?t:kt(+t),l(),c):r},c.distanceMin=function(t){return arguments.length?(o=t*t,c):Math.sqrt(o)},c.distanceMax=function(t){return arguments.length?(a=t*t,c):Math.sqrt(a)},c.theta=function(t){return arguments.length?(h=t*t,c):Math.sqrt(h)},c}().strength(-300)).force("collide",function(t){var i,s,e,n=1,r=1;function o(){for(var t,o,h,c,l,f,d,u=i.length,p=0;p<r;++p)for(o=xt(i,Ct,Nt).visitAfter(a),t=0;t<u;++t)h=i[t],f=s[h.index],d=f*f,c=h.x+h.vx,l=h.y+h.vy,o.visit(v);function v(t,i,s,r,o){var a=t.data,u=t.r,p=f+u;if(!a)return i>c+p||r<c-p||s>l+p||o<l-p;if(a.index>h.index){var v=c-a.x-a.vx,g=l-a.y-a.vy,b=v*v+g*g;b<p*p&&(0===v&&(b+=(v=_t(e))*v),0===g&&(b+=(g=_t(e))*g),b=(p-(b=Math.sqrt(b)))/b*n,h.vx+=(v*=b)*(p=(u*=u)/(d+u)),h.vy+=(g*=b)*p,a.vx-=v*(p=1-p),a.vy-=g*p)}}}function a(t){if(t.data)return t.r=s[t.data.index];for(var i=t.r=0;i<4;++i)t[i]&&t[i].r>t.r&&(t.r=t[i].r)}function h(){if(i){var e,n,r=i.length;for(s=new Array(r),e=0;e<r;++e)n=i[e],s[n.index]=+t(n,e,i)}}return"function"!=typeof t&&(t=kt(null==t?1:+t)),o.initialize=function(t,s){i=t,e=s,h()},o.iterations=function(t){return arguments.length?(r=+t,o):r},o.strength=function(t){return arguments.length?(n=+t,o):n},o.radius=function(i){return arguments.length?(t="function"==typeof i?i:kt(+i),h(),o):t},o}().radius(t=>t.radius+10).strength(.7)).force("centerX",ei(this.width/2).strength(.05)).force("centerY",ni(this.height/2).strength(.05)).alphaDecay(.02).velocityDecay(.4)}updateLayout(t,i){this.nodes=[],this.links=[];for(const i of t)this.nodes.push({id:i.entityId,type:"source",radius:i.radius,x:i.x||.2*this.width,y:i.y||this.height/2,fx:null,fy:null});const s={id:"hub",type:"hub",radius:30,x:this.width/2,y:this.height/2,fx:this.width/2,fy:this.height/2};this.nodes.push(s);for(const t of i)t.isVisible&&this.nodes.push({id:t.entityId,type:"consumption",radius:t.radius,x:t.x||.8*this.width,y:t.y||this.height/2,fx:null,fy:null});for(const i of t)i.isActive&&i.powerWatts>0&&this.links.push({source:i.entityId,target:"hub",strength:.5});for(const t of i)t.isVisible&&t.powerWatts>0&&this.links.push({source:"hub",target:t.entityId,strength:.5});this.simulation.nodes(this.nodes).force("link").links(this.links),this.simulation.alpha(.3).restart()}tick(t=100){for(let i=0;i<t;i++)this.simulation.tick()}applyPositions(t,i){for(const i of t){const t=this.nodes.find(t=>t.id===i.entityId);t&&(i.x=t.x??i.x,i.y=t.y??i.y)}for(const t of i){const i=this.nodes.find(i=>i.id===t.entityId);i&&(t.x=i.x??t.x,t.y=i.y??t.y)}}setSourcePosition(t,i,s){const e=this.nodes.find(i=>i.id===t);if(e){const t=this.height/(s+1);e.fx=.15*this.width,e.fy=t*(i+1)}}setConsumptionPosition(t,i,s){const e=this.nodes.find(i=>i.id===t);if(e){const t=this.height/(s+1);e.fx=.85*this.width,e.fy=t*(i+1)}}releasePositions(){for(const t of this.nodes)"hub"!==t.type&&(t.fx=null,t.fy=null)}resize(t,i){this.width=t,this.height=i,this.simulation.force("centerX",ei(t/2).strength(.05)).force("centerY",ni(i/2).strength(.05));const s=this.nodes.find(t=>"hub"===t.id);s&&(s.fx=t/2,s.fy=i/2),this.simulation.alpha(.3).restart()}stop(){this.simulation.stop()}getHubPosition(){const t=this.nodes.find(t=>"hub"===t.id);return{x:t?.x??this.width/2,y:t?.y??this.height/2}}useFixedLayout(t,i){const s=this.height/(t.length+1);t.forEach((t,i)=>{t.x=.15*this.width,t.y=s*(i+1)});const e=i.filter(t=>t.isVisible),n=this.height/(e.length+1);e.forEach((t,i)=>{t.x=.85*this.width,t.y=n*(i+1)})}}function oi(t){const i=Math.abs(t);return i>=1e6?{value:+(t/1e6).toFixed(2),unit:"MW"}:i>=1e3?{value:+(t/1e3).toFixed(1),unit:"kW"}:{value:Math.round(t),unit:"W"}}function ai(t){return`${t.value} ${t.unit}`}class hi{constructor(t){this.ctx=t}renderSourceNode(t,i,s,e,n){const r=this.ctx;if(r.save(),n){const i=Date.now()%1500/1500,s=.3+.2*Math.sin(i*Math.PI*2),e=t.radius+12+4*Math.sin(i*Math.PI*2);r.shadowBlur=25,r.shadowColor="#ff0000",r.strokeStyle="#ff0000",r.lineWidth=3,r.globalAlpha=s,r.beginPath(),r.arc(t.x,t.y,e,0,2*Math.PI),r.stroke(),r.globalAlpha=1,r.shadowBlur=0}t.isActive&&(r.shadowBlur=20,r.shadowColor=t.color,r.strokeStyle=t.color,r.lineWidth=1,r.globalAlpha=.3,r.beginPath(),r.arc(t.x,t.y,t.radius+8,0,2*Math.PI),r.stroke(),r.globalAlpha=1,r.shadowBlur=0),r.beginPath(),r.arc(t.x,t.y,t.radius,0,2*Math.PI),r.fillStyle="rgba(15, 25, 40, 0.85)",r.fill(),t.isActive&&(r.shadowBlur=15,r.shadowColor=t.color),r.strokeStyle=t.isActive?t.color:"rgba(255, 255, 255, 0.2)",r.lineWidth=4,t.isStale&&r.setLineDash([8,4]),r.stroke(),r.setLineDash([]),r.shadowBlur=0,r.shadowBlur=8,r.shadowColor=t.isActive?t.color:"rgba(255, 255, 255, 0.5)",r.fillStyle="#ffffff",r.font=`${t.radius}px sans-serif`,r.textAlign="center",r.textBaseline="middle",r.fillText(t.icon,t.x,t.y),r.shadowBlur=0,"battery"===t.type&&void 0!==i&&this.renderBatteryIndicator(t,i,s,e);const o=ai(oi(Math.abs(t.powerWatts)));r.shadowBlur=4,r.shadowColor="rgba(0, 0, 0, 0.8)",r.fillStyle=t.isActive?"#ffffff":"rgba(255, 255, 255, 0.5)",r.font="bold 16px sans-serif",r.textAlign="center",r.textBaseline="top",r.fillText(o,t.x,t.y+t.radius+12),r.shadowBlur=0;const a=this.getTypeLabel(t.type);r.font="13px sans-serif",r.textBaseline="bottom",r.fillStyle="rgba(255, 255, 255, 0.7)",r.fillText(a,t.x,t.y-t.radius-10),t.isStale&&this.renderStaleIndicator(t.x,t.y-t.radius-5),r.restore()}renderConsumptionNode(t){const i=this.ctx;i.save();const s=t.powerWatts>0,e=this.getDeviceColor(t.powerWatts);s&&(i.shadowBlur=15,i.shadowColor=e,i.strokeStyle=e,i.lineWidth=1,i.globalAlpha=.2,i.beginPath(),i.arc(t.x,t.y,t.radius+6,0,2*Math.PI),i.stroke(),i.globalAlpha=1,i.shadowBlur=0),i.beginPath(),i.arc(t.x,t.y,t.radius,0,2*Math.PI),i.fillStyle="rgba(15, 25, 40, 0.85)",i.fill(),s&&(i.shadowBlur=12,i.shadowColor=e),i.strokeStyle=s?e:"rgba(255, 255, 255, 0.15)",i.lineWidth=3,t.isStale&&i.setLineDash([6,3]),i.stroke(),i.setLineDash([]),i.shadowBlur=0,i.shadowBlur=6,i.shadowColor=s?e:"rgba(255, 255, 255, 0.3)",i.fillStyle="#ffffff",i.font=.8*t.radius+"px sans-serif",i.textAlign="center",i.textBaseline="middle",i.fillText(t.icon,t.x,t.y),i.shadowBlur=0;const n=ai(oi(t.powerWatts));i.shadowBlur=3,i.shadowColor="rgba(0, 0, 0, 0.8)",i.fillStyle=s?"#ffffff":"rgba(255, 255, 255, 0.4)",i.font="bold 13px sans-serif",i.textAlign="center",i.textBaseline="top",i.fillText(n,t.x,t.y+t.radius+8),i.shadowBlur=0,i.font="12px sans-serif",i.textBaseline="bottom",i.fillStyle="rgba(255, 255, 255, 0.6)",i.fillText(t.name,t.x,t.y-t.radius-8),t.isStale&&this.renderStaleIndicator(t.x,t.y-t.radius-5),i.restore()}renderCategoryNode(t,i){const s=this.ctx;s.save();const e=t.powerWatts>0,n=this.getDeviceColor(t.powerWatts);e&&(s.shadowBlur=18,s.shadowColor=n,s.strokeStyle=n,s.lineWidth=1,s.globalAlpha=.25,s.beginPath(),s.arc(t.x,t.y,t.radius+8,0,2*Math.PI),s.stroke(),s.globalAlpha=1,s.shadowBlur=0),s.beginPath(),s.arc(t.x,t.y,t.radius,0,2*Math.PI),s.fillStyle="rgba(20, 35, 55, 0.9)",s.fill(),e&&(s.shadowBlur=15,s.shadowColor=n),s.strokeStyle=e?n:"rgba(255, 255, 255, 0.2)",s.lineWidth=4,t.isStale&&s.setLineDash([6,3]),s.stroke(),s.setLineDash([]),s.shadowBlur=0,s.shadowBlur=8,s.shadowColor=e?n:"rgba(255, 255, 255, 0.3)",s.fillStyle="#ffffff",s.font=.9*t.radius+"px sans-serif",s.textAlign="center",s.textBaseline="middle",s.fillText(t.icon,t.x-5,t.y),s.shadowBlur=0;const r=.4*t.radius,o=t.x+.6*t.radius,a=t.y;s.fillStyle=e?"#ffffff":"rgba(255, 255, 255, 0.6)",s.font=`${r}px sans-serif`,s.fillText(i?"▶":"▼",o,a);const h=ai(oi(t.powerWatts));if(s.shadowBlur=4,s.shadowColor="rgba(0, 0, 0, 0.8)",s.fillStyle=e?"#ffffff":"rgba(255, 255, 255, 0.4)",s.font="bold 14px sans-serif",s.textAlign="center",s.textBaseline="top",s.fillText(h,t.x,t.y+t.radius+10),s.shadowBlur=0,s.font="bold 13px sans-serif",s.textBaseline="bottom",s.fillStyle="rgba(255, 255, 255, 0.8)",s.fillText(t.name,t.x,t.y-t.radius-10),i&&t.children&&t.children.length>0){const i=`${t.children.filter(t=>t.powerWatts>0).length}/${t.children.length}`;s.font="10px sans-serif",s.fillStyle="rgba(255, 255, 255, 0.6)",s.fillText(i,t.x,t.y+t.radius+28)}s.restore()}renderRemainderNode(t,i,s){const e=this.ctx;e.save(),e.beginPath(),e.arc(t,i,25,0,2*Math.PI),e.fillStyle="rgba(15, 25, 40, 0.75)",e.fill(),e.strokeStyle="rgba(255, 255, 255, 0.3)",e.lineWidth=2,e.setLineDash([4,4]),e.stroke(),e.setLineDash([]),e.fillStyle="rgba(255, 255, 255, 0.6)",e.font="20px sans-serif",e.textAlign="center",e.textBaseline="middle",e.fillText("❓",t,i);const n=ai(oi(s));e.shadowBlur=3,e.shadowColor="rgba(0, 0, 0, 0.8)",e.fillStyle="rgba(255, 255, 255, 0.6)",e.font="bold 11px sans-serif",e.textAlign="center",e.textBaseline="top",e.fillText(n,t,i+25+8),e.shadowBlur=0,e.font="11px sans-serif",e.textBaseline="bottom",e.fillStyle="rgba(255, 255, 255, 0.5)",e.fillText("Other",t,i-25-8),e.restore()}renderBatteryIndicator(t,i,s,e){const n=this.ctx,r=1.5*t.radius,o=t.x-r/2,a=t.y+t.radius+32;n.fillStyle="rgba(0, 0, 0, 0.4)",n.fillRect(o,a,r,8);const h=r*i/100,c=i>80?"#4caf50":i>20?"#ff9800":"#f44336";let l;n.shadowBlur=8,n.shadowColor=c,n.fillStyle=c,n.fillRect(o,a,h,8),n.shadowBlur=0,n.strokeStyle="rgba(255, 255, 255, 0.3)",n.lineWidth=1,n.strokeRect(o,a,r,8),l=void 0!==s&&s>0?`${i}% (${(s*i/100).toFixed(1)}/${s.toFixed(1)} kWh)`:ai(function(t,i=0){return{value:+t.toFixed(i),unit:"%"}}(i,0)),n.fillStyle="rgba(255, 255, 255, 0.8)",n.font="bold 11px sans-serif",n.textAlign="center",n.textBaseline="top",n.fillText(l,t.x,a+8+4),e&&(n.fillStyle="rgba(255, 255, 255, 0.7)",n.font="10px sans-serif",n.fillText(e,t.x,a+8+18))}renderStaleIndicator(t,i){const s=this.ctx;s.save(),s.shadowBlur=8,s.shadowColor="#ff9800",s.fillStyle="#ff9800",s.font="18px sans-serif",s.textAlign="center",s.textBaseline="middle",s.fillText("⚠",t,i),s.restore()}renderConnection(t,i,s,e,n,r=2,o=.3){const a=this.ctx;a.save(),o>.1&&(a.shadowBlur=10,a.shadowColor=n),a.globalAlpha=o,a.strokeStyle=n,a.lineWidth=r,a.beginPath(),a.moveTo(t,i),a.lineTo(s,e),a.stroke(),a.restore()}renderHubNode(t,i,s=30,e){const n=this.ctx;n.save();const r="#64b5f6";if(n.shadowBlur=18,n.shadowColor=r,n.strokeStyle=r,n.lineWidth=1,n.globalAlpha=.3,n.beginPath(),n.arc(t,i,s+6,0,2*Math.PI),n.stroke(),n.globalAlpha=1,n.shadowBlur=0,n.beginPath(),n.arc(t,i,s,0,2*Math.PI),n.fillStyle="rgba(15, 25, 40, 0.85)",n.fill(),n.shadowBlur=15,n.shadowColor=r,n.strokeStyle=r,n.lineWidth=4,n.stroke(),n.shadowBlur=0,n.shadowBlur=10,n.shadowColor=r,n.fillStyle="#ffffff",n.font=.9*s+"px sans-serif",n.textAlign="center",n.textBaseline="middle",n.fillText("🏠",t,i),n.shadowBlur=0,void 0!==e&&e>0){const r=ai(oi(e));n.shadowBlur=4,n.shadowColor="rgba(0, 0, 0, 0.8)",n.fillStyle="#ffffff",n.font="bold 16px sans-serif",n.textAlign="center",n.textBaseline="top",n.fillText(r,t,i+s+12),n.shadowBlur=0}n.restore()}getDeviceColor(t){return t<=0?"#cccccc":t<100?"#4caf50":t<500?"#2196f3":t<1e3?"#ff9800":"#f44336"}lightenColor(t,i){const s=parseInt(t.replace("#",""),16),e=Math.round(2.55*i);return`#${(16777216+(Math.min(255,(s>>16&255)+e)<<16)+(Math.min(255,(s>>8&255)+e)<<8)+Math.min(255,(255&s)+e)).toString(16).slice(1)}`}getTypeLabel(t){switch(t){case"solar":return"Solar";case"battery":return"Battery";case"grid":return"Grid";case"hub":return"Hub";default:return t}}clear(t,i){this.ctx.clearRect(0,0,t,i)}}class ci{constructor(t){this.powerToWidthScale=.05,this.maxWidth=100,this.ctx=t}powerToWidth(t){return Math.min(Math.abs(t)*this.powerToWidthScale,this.maxWidth)}renderFlow(t){const i=this.ctx;i.save();const s=i.createLinearGradient(t.from.x,t.from.y,t.to.x,t.to.y),e=t.color.includes("rgba")?t.color:t.color.replace("rgb","rgba").replace(")",", 0.6)");s.addColorStop(0,e),s.addColorStop(1,e.replace(/[\d.]+\)$/,"0.3)"));const n=t.to.x-t.from.x;t.to.y,t.from.y;const r=t.from.x+.5*n,o=t.from.y,a=t.to.x-.5*n,h=t.to.y;if(i.lineWidth=t.width,i.strokeStyle=s,i.lineCap="round",i.shadowBlur=20,i.shadowColor=t.color,i.beginPath(),i.moveTo(t.from.x,t.from.y),i.bezierCurveTo(r,o,a,h,t.to.x,t.to.y),i.stroke(),t.label&&t.width>5){const s=(t.from.x+t.to.x)/2,e=(t.from.y+t.to.y)/2;i.shadowBlur=4,i.shadowColor="rgba(0, 0, 0, 0.8)",i.fillStyle="rgba(255, 255, 255, 0.9)",i.font="bold 11px sans-serif",i.textAlign="center",i.textBaseline="middle",i.fillText(t.label,s,e-10)}i.restore()}renderEnergyFlows(t,i,s,e){for(const n of t){const t=i.find(t=>t.type===n.from);if(!t||n.powerWatts<10)continue;let r,o;if("hub"===n.to)r=s,o=e;else{const t=i.find(t=>t.type===n.to);if(!t)continue;r=t.x,o=t.y}const a={from:{x:t.x,y:t.y},to:{x:r,y:o},width:this.powerToWidth(n.powerWatts),color:n.color,label:Math.round(n.powerWatts)+"W"};this.renderFlow(a)}}renderDeviceFlows(t,i,s,e=new Map,n=new Set,r="#64b5f6"){for(const r of t){if(!r.isVisible||r.powerWatts<10||"total_load"===r.id)continue;const t=e.has(r.id),o=n.has(r.id),a={from:{x:i,y:s},to:{x:r.x,y:r.y},width:this.powerToWidth(r.powerWatts),color:"rgba(100, 181, 246, 0.4)",label:Math.round(r.powerWatts)+"W"};if(this.renderFlow(a),t&&!o&&r.children)for(const t of r.children)if(t.isVisible&&t.powerWatts>10){const i={from:{x:r.x,y:r.y},to:{x:t.x,y:t.y},width:this.powerToWidth(t.powerWatts),color:"rgba(100, 181, 246, 0.3)",label:Math.round(t.powerWatts)+"W"};this.renderFlow(i)}}}setPowerScale(t){this.powerToWidthScale=t}setMaxWidth(t){this.maxWidth=t}}let li=class extends at{constructor(){super(...arguments),this.At=[],this.Et="sources"}setConfig(t){this.Wt=t,this.zt(),this.Pt()}connectedCallback(){super.connectedCallback(),this.Pt()}async Pt(){if(!customElements.get("ha-entity-picker"))try{const t=await(window.loadCardHelpers?.());t&&await t.createCardElement({type:"entities",entities:[]})}catch(t){console.warn("Could not load card helpers:",t)}}zt(){this.hass&&(this.At=Object.keys(this.hass.states).filter(t=>t.startsWith("sensor.")).sort())}Ut(t){this.Wt=t;const i=new CustomEvent("config-changed",{detail:{config:t},bubbles:!0,composed:!0});this.dispatchEvent(i)}Dt(t){if(!this.Wt||!this.hass)return;const i=t.target,s=i.configValue;if(!s)return;let e=i.value;if(void 0!==i.checked&&(e=i.checked),this.It(s)===e)return;const n={...this.Wt};if(s.includes(".")){const t=s.split(".");let i=n;for(let s=0;s<t.length-1;s++)i[t[s]]||(i[t[s]]={}),i=i[t[s]];i[t[t.length-1]]=e}else n[s]=e;this.Ut(n)}Tt(){if(!this.Wt)return;const t={id:`device_${Date.now()}`,entity_id:"",name:"New Device",icon:"🔌",show_when_off:!1},i=[...this.Wt.devices||[],t];this.Ut({...this.Wt,devices:i})}Vt(t){if(!this.Wt)return;const i=[...this.Wt.devices||[]];i.splice(t,1),this.Ut({...this.Wt,devices:i})}jt(t,i,s){if(!this.Wt)return;const e=[...this.Wt.devices||[]];e[t]={...e[t],[i]:s},this.Ut({...this.Wt,devices:e})}Ot(){if(!this.Wt)return;const t={id:`category_${Date.now()}`,name:"New Category",icon:"📁"},i=[...this.Wt.categories||[],t];this.Ut({...this.Wt,categories:i})}Rt(t){if(!this.Wt)return;const i=[...this.Wt.categories||[]],s=i[t].id;i.splice(t,1);const e=(this.Wt.devices||[]).map(t=>{if(t.category===s){const{category:i,...s}=t;return s}return t});this.Ut({...this.Wt,categories:i,devices:e})}Lt(t,i,s){if(!this.Wt)return;const e=[...this.Wt.categories||[]];e[t]={...e[t],[i]:s},this.Ut({...this.Wt,categories:e})}It(t){if(!this.Wt)return"";const i=t.split(".");let s=this.Wt;for(const t of i)s=s?.[t];return s??""}render(){return this.Wt&&this.hass?B`
      <div class="card-config">
        <div class="tabs">
          <button
            class="tab ${"sources"===this.Et?"active":""}"
            @click=${()=>this.Et="sources"}
          >
            Energy Sources
          </button>
          <button
            class="tab ${"devices"===this.Et?"active":""}"
            @click=${()=>this.Et="devices"}
          >
            Devices
          </button>
          <button
            class="tab ${"categories"===this.Et?"active":""}"
            @click=${()=>this.Et="categories"}
          >
            Categories
          </button>
          <button
            class="tab ${"display"===this.Et?"active":""}"
            @click=${()=>this.Et="display"}
          >
            Display
          </button>
          <button
            class="tab ${"warnings"===this.Et?"active":""}"
            @click=${()=>this.Et="warnings"}
          >
            Warnings
          </button>
        </div>

        ${"sources"===this.Et?this.Bt():""}
        ${"devices"===this.Et?this.Ft():""}
        ${"categories"===this.Et?this.Ht():""}
        ${"display"===this.Et?this.Gt():""}
        ${"warnings"===this.Et?this.qt():""}
      </div>
    `:B`<div class="card-config">Loading...</div>`}Bt(){return B`
      <div class="option">
        <div class="option-label">
          <div>Solar Power</div>
          <div class="secondary">Sensor measuring solar panel output (watts)</div>
        </div>
        <ha-entity-picker
          .hass=${this.hass}
          .value=${this.It("entities.solar")}
          .configValue=${"entities.solar"}
          @value-changed=${this.Dt}
          allow-custom-entity
        ></ha-entity-picker>
      </div>

      <div class="option">
        <div class="option-label">
          <div>Battery Power</div>
          <div class="secondary">Sensor measuring battery charge/discharge (watts)</div>
        </div>
        <ha-entity-picker
          .hass=${this.hass}
          .value=${this.It("entities.battery")}
          .configValue=${"entities.battery"}
          @value-changed=${this.Dt}
          allow-custom-entity
        ></ha-entity-picker>
      </div>

      <div class="option">
        <div class="option-label">
          <div>Battery State of Charge</div>
          <div class="secondary">Sensor showing battery percentage (0-100%)</div>
        </div>
        <ha-entity-picker
          .hass=${this.hass}
          .value=${this.It("entities.battery_soc")}
          .configValue=${"entities.battery_soc"}
          @value-changed=${this.Dt}
          allow-custom-entity
        ></ha-entity-picker>
      </div>

      <div class="option">
        <div class="option-label">
          <div>Battery Capacity (kWh)</div>
          <div class="secondary">Total battery capacity in kilowatt-hours</div>
        </div>
        <ha-textfield
          type="number"
          .value=${this.It("entities.battery_capacity")}
          .configValue=${"entities.battery_capacity"}
          @input=${this.Dt}
        ></ha-textfield>
      </div>

      <div class="option">
        <div class="option-label">
          <div>Grid Power</div>
          <div class="secondary">Sensor measuring grid import/export (watts)</div>
        </div>
        <ha-entity-picker
          .hass=${this.hass}
          .value=${this.It("entities.grid")}
          .configValue=${"entities.grid"}
          @value-changed=${this.Dt}
          allow-custom-entity
        ></ha-entity-picker>
      </div>
    `}Ft(){const t=this.Wt?.devices||[],i=this.Wt?.categories||[];return B`
      <div class="devices-list">
        ${t.map((t,s)=>B`
          <div class="device-item" style="grid-template-columns: 50px 1fr 200px 150px auto;">
            <div class="device-icon">${t.icon||"🔌"}</div>

            <ha-textfield
              .value=${t.name||""}
              @input=${t=>this.jt(s,"name",t.target.value)}
              label="Name"
            ></ha-textfield>

            <ha-entity-picker
              .hass=${this.hass}
              .value=${t.entity_id}
              @value-changed=${t=>this.jt(s,"entity_id",t.detail.value)}
              allow-custom-entity
            ></ha-entity-picker>

            <ha-select
              .value=${t.category||""}
              @selected=${t=>this.jt(s,"category",t.target.value)}
              label="Category"
            >
              <mwc-list-item value="">None</mwc-list-item>
              ${i.map(t=>B`
                <mwc-list-item value="${t.id}">${t.name}</mwc-list-item>
              `)}
            </ha-select>

            <mwc-icon-button
              @click=${()=>this.Vt(s)}
              title="Remove device"
            >
              <ha-icon icon="mdi:delete"></ha-icon>
            </mwc-icon-button>
          </div>
        `)}
      </div>

      <mwc-button @click=${this.Tt}>
        Add Device
      </mwc-button>
    `}Ht(){const t=this.Wt?.categories||[];return B`
      <div style="margin-bottom: 16px;">
        <p style="color: var(--secondary-text-color); margin-top: 0;">
          Categories allow you to group devices together. Click a category in the card to expand/collapse it.
          Optionally assign a circuit entity to show the total power for the circuit.
        </p>
      </div>

      <div class="devices-list">
        ${t.map((t,i)=>B`
          <div class="device-item" style="grid-template-columns: 50px 1fr 200px auto;">
            <div class="device-icon">${t.icon||"📁"}</div>

            <ha-textfield
              .value=${t.name||""}
              @input=${t=>this.Lt(i,"name",t.target.value)}
              label="Category Name"
            ></ha-textfield>

            <ha-entity-picker
              .hass=${this.hass}
              .value=${t.circuit_entity||""}
              @value-changed=${t=>this.Lt(i,"circuit_entity",t.detail.value)}
              allow-custom-entity
              label="Circuit Entity (Optional)"
            ></ha-entity-picker>

            <mwc-icon-button
              @click=${()=>this.Rt(i)}
              title="Remove category"
            >
              <ha-icon icon="mdi:delete"></ha-icon>
            </mwc-icon-button>
          </div>

          <div style="padding: 8px 16px; font-size: 12px; color: var(--secondary-text-color);">
            ${this.Yt(t.id)} device(s) assigned
          </div>
        `)}
      </div>

      <mwc-button @click=${this.Ot}>
        Add Category
      </mwc-button>
    `}Yt(t){return(this.Wt?.devices||[]).filter(i=>i.category===t).length}Gt(){return B`
      <div class="option">
        <div class="option-label">
          <div>Visualization Mode</div>
          <div class="secondary">Choose particle animation, flow lines, or both</div>
        </div>
        <ha-select
          .value=${this.Wt?.visualization_mode||"particles"}
          .configValue=${"visualization_mode"}
          @selected=${this.Dt}
        >
          <mwc-list-item value="particles">Animated Particles</mwc-list-item>
          <mwc-list-item value="sankey">Sankey Flow Lines</mwc-list-item>
          <mwc-list-item value="both">Both</mwc-list-item>
        </ha-select>
      </div>

      <div class="option">
        <div class="option-label">
          <div>Show Statistics</div>
          <div class="secondary">Display efficiency and self-sufficiency metrics</div>
        </div>
        <ha-switch
          .checked=${this.Wt?.show_statistics??!0}
          .configValue=${"show_statistics"}
          @change=${this.Dt}
        ></ha-switch>
      </div>

      <div class="option">
        <div class="option-label">
          <div>Update Interval (ms)</div>
          <div class="secondary">How often to refresh sensor data</div>
        </div>
        <ha-textfield
          type="number"
          .value=${this.Wt?.update_interval||2e3}
          .configValue=${"update_interval"}
          @input=${this.Dt}
          min="500"
          max="10000"
          step="500"
        ></ha-textfield>
      </div>
    `}qt(){const t=this.Wt?.warnings||{};return B`
      <div class="option">
        <div class="option-label">
          <div>Battery Low Warning (%)</div>
          <div class="secondary">Warn when battery falls below this percentage</div>
        </div>
        <ha-textfield
          type="number"
          .value=${t.battery_low||20}
          .configValue=${"warnings.battery_low"}
          @input=${this.Dt}
          min="0"
          max="100"
          step="5"
        ></ha-textfield>
      </div>

      <div class="option">
        <div class="option-label">
          <div>High Grid Import (W)</div>
          <div class="secondary">Warn when importing more than this from the grid</div>
        </div>
        <ha-textfield
          type="number"
          .value=${t.grid_import||3e3}
          .configValue=${"warnings.grid_import"}
          @input=${this.Dt}
          min="0"
          max="10000"
          step="100"
        ></ha-textfield>
      </div>
    `}};return li.styles=a`
    :host {
      display: block;
    }

    .card-config {
      padding: 16px;
    }

    .tabs {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
      border-bottom: 1px solid var(--divider-color);
    }

    .tab {
      padding: 8px 16px;
      background: none;
      border: none;
      border-bottom: 2px solid transparent;
      color: var(--secondary-text-color);
      cursor: pointer;
      font-size: 14px;
      margin-bottom: -1px;
    }

    .tab:hover {
      color: var(--primary-text-color);
    }

    .tab.active {
      color: var(--primary-color);
      border-bottom-color: var(--primary-color);
    }

    .option {
      padding: 16px 0;
      display: flex;
      align-items: center;
      border-bottom: 1px solid var(--divider-color);
    }

    .option-label {
      flex: 1;
    }

    .option-label .secondary {
      font-size: 12px;
      color: var(--secondary-text-color);
    }

    ha-select,
    ha-textfield {
      width: 200px;
    }

    ha-switch {
      padding: 16px 0;
    }

    .devices-list {
      margin-top: 16px;
    }

    .device-item {
      display: grid;
      grid-template-columns: 50px 1fr 200px auto;
      gap: 8px;
      align-items: center;
      padding: 8px;
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      margin-bottom: 8px;
    }

    .device-icon {
      font-size: 24px;
      text-align: center;
    }

    mwc-button {
      margin-top: 8px;
    }
  `,i([dt({attribute:!1})],li.prototype,"hass",void 0),i([ut()],li.prototype,"_config",void 0),i([ut()],li.prototype,"_entities",void 0),i([ut()],li.prototype,"_selectedTab",void 0),li=i([ct("energy-flow-card-editor")],li),t.EnergyFlowCard=class extends at{constructor(){super(...arguments),this.sourceNodes=[],this.consumptionNodes=[],this.categoryNodes=new Map,this.collapsedCategories=new Set,this.warnings=[],this.isLoading=!0,this.errorMessage=null,this.lastFrameTime=0}setConfig(t){if(!t)throw new Error("Invalid configuration");if("custom:energy-flow-card"!==t.type)throw new Error('Invalid card type. Must be "custom:energy-flow-card"');this.config={...t,update_interval:t.update_interval??2e3,show_statistics:t.show_statistics??!1,visualization_mode:t.visualization_mode??"both",min_height:t.min_height??400,max_height:t.max_height??9999},this.isLoading=!1}getCardSize(){const t=this.config?.min_height??400;return Math.ceil(t/50)}static getConfigElement(){return document.createElement("energy-flow-card-editor")}static getConfigForm(){return{schema:[{name:"",type:"grid",schema:[{name:"entities.solar",label:"Solar Power Entity",selector:{entity:{domain:"sensor"}}},{name:"entities.battery",label:"Battery Power Entity",selector:{entity:{domain:"sensor"}}},{name:"entities.battery_soc",label:"Battery SOC Entity",selector:{entity:{domain:"sensor"}}},{name:"entities.battery_capacity",label:"Battery Capacity (kWh)",selector:{number:{min:0,step:.1,mode:"box"}}},{name:"entities.grid",label:"Grid Power Entity",selector:{entity:{domain:"sensor"}}}]},{name:"",type:"grid",schema:[{name:"visualization_mode",label:"Visualization Mode",selector:{select:{options:[{value:"particles",label:"Animated Particles"},{value:"sankey",label:"Sankey Flow Lines"},{value:"both",label:"Both"}]}}},{name:"show_statistics",label:"Show Statistics",selector:{boolean:{}}},{name:"update_interval",label:"Update Interval (ms)",selector:{number:{min:500,max:1e4,step:500,mode:"box"}}}]},{name:"",type:"grid",schema:[{name:"warnings.battery_low",label:"Battery Low Warning (%)",selector:{number:{min:0,max:100,step:5,mode:"box"}}},{name:"warnings.grid_import",label:"High Grid Import Warning (W)",selector:{number:{min:0,max:1e4,step:100,mode:"box"}}}]}]}}static getStubConfig(){return{type:"custom:energy-flow-card",entities:{},devices:[],update_interval:2e3,show_statistics:!0,visualization_mode:"particles",min_height:400,max_height:700}}connectedCallback(){super.connectedCallback(),this.initializeSensorManager(),this.startUpdateTimer()}disconnectedCallback(){super.disconnectedCallback(),this.cleanup()}updated(t){super.updated(t),t.has("hass")&&this.handleHassUpdate(),t.has("config")&&this.reinitialize(),this.canvas&&!this.animationFrameId&&(this.initializeCanvas(),this.startAnimationLoop())}render(){if(this.isLoading)return B`
        <div class="card-content">
          <div class="loading">Loading energy flow...</div>
        </div>
      `;if(this.errorMessage)return B`
        <div class="card-content">
          <div class="error">
            <div class="error-icon">⚠️</div>
            <div class="error-message">${this.errorMessage}</div>
          </div>
        </div>
      `;const t=this.config.min_height??400;return B`
      <div class="card-content">
        <div class="canvas-container" style="min-height: ${t}px; height: auto;">
          <canvas></canvas>
        </div>
        ${this.config.show_statistics?this.renderStatistics():""}
      </div>
    `}renderHeader(){return B`
      <div class="card-header">
        <div class="card-title">Energy Flow</div>
        <button
          class="refresh-button"
          @click=${this.handleRefresh}
          aria-label="Refresh">
          🔄
        </button>
      </div>
    `}renderWarnings(){return B`
      ${this.warnings.map(t=>B`
        <div class="warning-banner">
          <span class="warning-icon">⚠️</span>
          <span>${t}</span>
        </div>
      `)}
    `}renderStatistics(){const t=this.sourceNodes.find(t=>"solar"===t.type)?.powerWatts??0,i=this.sourceNodes.find(t=>"battery"===t.type)?.powerWatts??0,s=this.sourceNodes.find(t=>"grid"===t.type)?.powerWatts??0,e=this.consumptionNodes.reduce((t,i)=>t+i.powerWatts,0),n=t+Math.max(0,i),r=e>0?Math.min(100,Math.round(n/e*100)):0,o=e>0?Math.min(100,Math.round(n/e*100)):100,a=t=>{const i=Math.abs(t);return i>=1e3?`${(i/1e3).toFixed(2)} kW`:`${Math.round(i)} W`};return B`
      <div class="statistics-panel">
        <div class="stat-item">
          <div class="stat-label">Efficiency</div>
          <div class="stat-value">${r}<span class="stat-unit">%</span></div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Self-Sufficiency</div>
          <div class="stat-value">${o}<span class="stat-unit">%</span></div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Solar</div>
          <div class="stat-value">${a(t)}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Grid</div>
          <div class="stat-value">${a(s)}</div>
        </div>
      </div>
    `}initializeSensorManager(){if(!this.hass||!this.config)return;const t=this.getAllEntityIds();this.sensorManager=new vt(this.hass,6e4),this.sensorManager.subscribe(t,()=>{this.updateNodeStates(),this.checkWarnings()})}getAllEntityIds(){const t=[];if(this.config.entities?.solar&&t.push(this.config.entities.solar),this.config.entities?.battery&&t.push(this.config.entities.battery),this.config.entities?.battery_soc&&t.push(this.config.entities.battery_soc),this.config.entities?.battery_capacity&&t.push(this.config.entities.battery_capacity),this.config.entities?.grid&&t.push(this.config.entities.grid),this.config.devices)for(const i of this.config.devices)t.push(i.entity_id);if(this.config.categories)for(const i of this.config.categories)i.circuit_entity&&t.push(i.circuit_entity);return t}updateNodeStates(){this.sensorManager&&(this.sourceNodes=this.createSourceNodes(),this.consumptionNodes=this.createConsumptionNodes(),this.layoutEngine&&this.canvas&&(this.layoutEngine.updateLayout(this.sourceNodes,this.consumptionNodes),this.layoutEngine.useFixedLayout(this.sourceNodes,this.consumptionNodes),this.layoutEngine.applyPositions(this.sourceNodes,this.consumptionNodes)),this.requestUpdate())}createSourceNodes(){const t=[],i=Date.now(),s=this.canvas?.height??500,e=this.canvas?.width??800;if(this.config.entities?.solar){const n=this.sensorManager?.getPowerValue(this.config.entities.solar)??0,r=this.sensorManager?.getSensorState(this.config.entities.solar);t.push({type:"solar",entityId:this.config.entities.solar,powerWatts:n,isActive:n>10,isStale:r?.isStale??!1,lastUpdated:r?.lastUpdated??i,displayValue:String(Math.round(n)),displayUnit:"W",color:this.config.theme?.solar_color??"#ffa500",icon:"☀️",x:.22*e,y:.2*s,radius:50})}if(this.config.entities?.grid){const r=this.sensorManager?.getPowerValue(this.config.entities.grid)??0,o=this.sensorManager?.getSensorState(this.config.entities.grid),a=(n=r)>10?"import":n<-10?"export":"idle";t.push({type:"grid",entityId:this.config.entities.grid,powerWatts:r,isActive:Math.abs(r)>10,isStale:o?.isStale??!1,lastUpdated:o?.lastUpdated??i,displayValue:String(Math.round(Math.abs(r))),displayUnit:"W",color:this.config.theme?.grid_color??"#f44336",icon:"export"===a?"⚡⬆":"import"===a?"⚡⬇":"⚡",x:.15*e,y:.55*s,radius:45})}var n,r;if(this.config.entities?.battery){const n=this.sensorManager?.getPowerValue(this.config.entities.battery)??0,o=this.sensorManager?.getSensorState(this.config.entities.battery),a=(r=n)>10?"discharging":r<-10?"charging":"idle";t.push({type:"battery",entityId:this.config.entities.battery,powerWatts:n,isActive:Math.abs(n)>10,isStale:o?.isStale??!1,lastUpdated:o?.lastUpdated??i,displayValue:String(Math.round(Math.abs(n))),displayUnit:"W",color:this.config.theme?.battery_color??"#4caf50",icon:"charging"===a?"🔋⬆":"discharging"===a?"🔋⬇":"🔋",x:.22*e,y:.8*s,radius:45})}return t}createConsumptionNodes(){const t=[],i=Date.now();if(!this.config.devices)return t;const s=[];for(const t of this.config.devices){const e=this.sensorManager?.getPowerValue(t.entity_id)??0,n=this.sensorManager?.getSensorState(t.entity_id),r=t.show_when_off||e>0;s.push({id:t.id,entityId:t.entity_id,name:t.name??t.id,powerWatts:e,isStale:n?.isStale??!1,lastUpdated:n?.lastUpdated??i,displayValue:String(Math.round(e)),displayUnit:"W",icon:t.icon??"💡",categoryId:t.category,x:0,y:0,radius:30,isVisible:r})}this.categoryNodes.clear();const e=new Map,n=new Set;if(this.config.categories)for(const r of this.config.categories){const o=s.filter(t=>t.categoryId===r.id);for(const t of o)n.add(t.id);let a=0,h=r.circuit_entity||"";r.circuit_entity?(a=this.sensorManager?.getPowerValue(r.circuit_entity)??0,h=r.circuit_entity):(a=o.reduce((t,i)=>t+i.powerWatts,0),h=`category_${r.id}`);let c=0;if(r.circuit_entity){const t=o.reduce((t,i)=>t+i.powerWatts,0);c=Math.max(0,a-t)}this.collapsedCategories.has(r.id);const l={id:r.id,entityId:h,name:r.name,powerWatts:a,isStale:!1,lastUpdated:i,displayValue:String(Math.round(a)),displayUnit:"W",icon:r.icon??"📁",children:o,calculatedRemainder:c,x:0,y:0,radius:35,isVisible:!0};this.categoryNodes.set(r.id,l),e.set(r.id,o),t.push(l)}const r=s.filter(t=>!t.categoryId&&!n.has(t.id));return t.push(...r),this.positionConsumptionNodes(t),t}positionConsumptionNodes(t){const i=this.canvas?.width??800,s=.75*i,e=.9*i,n=.05*i;let r=60,o=0;for(const i of t){if(!i.isVisible)continue;const t=this.categoryNodes.has(i.id),a=this.collapsedCategories.has(i.id);if(t){if(i.x=o%2==0?s:e,i.y=r,r+=100,o++,!a&&i.children){for(const t of i.children)t.isVisible&&(t.x=(o%2==0?s:e)-n,t.y=r,r+=70,o++);i.calculatedRemainder&&i.calculatedRemainder>10&&(r+=70,o++)}}else i.x=o%2==0?s:e,i.y=r,r+=100,o++}}handleCanvasClick(t){if(!this.canvas)return;const i=this.canvas.getBoundingClientRect(),s=t.clientX-i.left,e=t.clientY-i.top;for(const[t,i]of this.categoryNodes){const n=s-i.x,r=e-i.y;if(Math.sqrt(n*n+r*r)<=i.radius){this.handleCategoryClick(t);break}}}handleCanvasHover(t){if(!this.canvas)return;const i=this.canvas.getBoundingClientRect(),s=t.clientX-i.left,e=t.clientY-i.top;let n=!1;for(const t of this.categoryNodes.values()){const i=s-t.x,r=e-t.y;if(Math.sqrt(i*i+r*r)<=t.radius){n=!0;break}}this.canvas.style.cursor=n?"pointer":"default"}handleCategoryClick(t){this.collapsedCategories.has(t)?this.collapsedCategories.delete(t):this.collapsedCategories.add(t),this.updateNodeStates(),this.requestUpdate()}checkWarnings(){const t=[];if(this.sensorManager){const i=this.sensorManager.getStaleSensors();i.length>0&&t.push(`${i.length} sensor(s) not responding`)}if(this.config.warnings?.battery_low&&this.config.entities?.battery_soc){const i=this.sensorManager?.getPercentageValue(this.config.entities.battery_soc)??0;i<this.config.warnings.battery_low&&t.push(`Battery low: ${i}%`)}if(this.config.warnings?.grid_import&&this.config.entities?.grid){const i=this.sensorManager?.getPowerValue(this.config.entities.grid)??0;i>this.config.warnings.grid_import&&t.push(`High grid import: ${Math.round(i)}W`)}this.warnings=t}initializeCanvas(){if(!this.canvas)return;const t=this.canvas.parentElement;if(!t)return;const i=t.getBoundingClientRect();this.canvas.width=i.width,this.canvas.height=i.height;const s=this.canvas.getContext("2d");s&&(this.nodeRenderer=new hi(s),this.sankeyRenderer=new ci(s),this.particleSystem=new gt(500),this.layoutEngine=new ri(this.canvas.width,this.canvas.height),this.updateNodeStates()),this.resizeObserver=new ResizeObserver(()=>{this.handleResize()}),this.resizeObserver.observe(t),this.canvas.addEventListener("click",t=>{this.handleCanvasClick(t)}),this.canvas.addEventListener("mousemove",t=>{this.handleCanvasHover(t)})}handleResize(){if(!this.canvas)return;const t=this.canvas.parentElement;if(!t)return;const i=t.getBoundingClientRect();this.canvas.width=i.width,this.canvas.height=i.height,this.layoutEngine&&this.layoutEngine.resize(i.width,i.height),this.updateNodeStates()}startAnimationLoop(){this.lastFrameTime=performance.now();const t=i=>{const s=(i-this.lastFrameTime)/1e3;this.lastFrameTime=i,this.renderCanvas(s),this.animationFrameId=requestAnimationFrame(t)};this.animationFrameId=requestAnimationFrame(t)}renderCanvas(t){if(!this.canvas||!this.nodeRenderer)return;const i=this.canvas.getContext("2d");if(!i)return;this.nodeRenderer.clear(this.canvas.width,this.canvas.height);const s=i.createRadialGradient(this.canvas.width/2,this.canvas.height/2,0,this.canvas.width/2,this.canvas.height/2,Math.max(this.canvas.width,this.canvas.height)/2);s.addColorStop(0,"rgba(30, 50, 80, 0.3)"),s.addColorStop(1,"rgba(10, 20, 35, 0.8)"),i.fillStyle=s,i.fillRect(0,0,this.canvas.width,this.canvas.height);const e=this.canvas.width/2,n=this.canvas.height/2,r=this.sourceNodes.find(t=>"solar"===t.type),o=this.sourceNodes.find(t=>"battery"===t.type),a=this.sourceNodes.find(t=>"grid"===t.type),h=this.consumptionNodes.find(t=>"total_load"===t.id),c=function(t){const i=[],s=Math.max(0,t.solar),e=t.battery,n=t.grid,r=e<-10,o=e>10,a=Math.abs(Math.min(0,e)),h=Math.max(0,e),c=n>10,l=n<-10,f=Math.max(0,n),d=Math.abs(Math.min(0,n));if(s>10){let t=s;if(r){const s=Math.min(t,a);s>10&&(i.push({from:"solar",to:"battery",powerWatts:s,color:"#ffa500"}),t-=s)}if(l&&t>10){const s=Math.min(t,d);s>10&&(i.push({from:"solar",to:"grid",powerWatts:s,color:"#ffa500"}),t-=s)}t>10&&i.push({from:"solar",to:"hub",powerWatts:t,color:"#ffa500"})}if(o){let t=h;if(l){const s=Math.min(t,d);s>10&&(i.push({from:"battery",to:"grid",powerWatts:s,color:"#4caf50"}),t-=s)}t>10&&i.push({from:"battery",to:"hub",powerWatts:t,color:"#4caf50"})}if(c){let t=f;if(r){const s=i.find(t=>"solar"===t.from&&"battery"===t.to),e=s?.powerWatts??0,n=Math.max(0,a-e);n>10&&(i.push({from:"grid",to:"battery",powerWatts:Math.min(t,n),color:"#f44336"}),t-=n)}t>10&&i.push({from:"grid",to:"hub",powerWatts:t,color:"#f44336"})}return i}({solar:r?.powerWatts??0,battery:o?.powerWatts??0,grid:a?.powerWatts??0,totalLoad:h?.powerWatts??0}),l=this.config.visualization_mode??"particles";if("sankey"!==l&&"both"!==l||this.sankeyRenderer&&(this.sankeyRenderer.renderEnergyFlows(c,this.sourceNodes,e,n),this.sankeyRenderer.renderDeviceFlows(this.consumptionNodes,e,n,this.categoryNodes,this.collapsedCategories)),"particles"===l){for(const t of c){const i=this.sourceNodes.find(i=>i.type===t.from),s=this.sourceNodes.find(i=>i.type===t.to);i&&s?this.nodeRenderer.renderConnection(i.x,i.y,s.x,s.y,t.color,2,.3):i&&"hub"===t.to&&this.nodeRenderer.renderConnection(i.x,i.y,e,n,t.color,2,.3)}for(const t of this.consumptionNodes){if(!t.isVisible||t.powerWatts<=10||"total_load"===t.id)continue;const i=this.categoryNodes.has(t.id),s=this.collapsedCategories.has(t.id);if(this.nodeRenderer.renderConnection(e,n,t.x,t.y,"#999999",2,.3),i&&!s&&t.children)for(const i of t.children)i.isVisible&&i.powerWatts>10&&this.nodeRenderer.renderConnection(t.x,t.y,i.x,i.y,"#666666",1,.2)}}if(("particles"===l||"both"===l)&&this.particleSystem){const s={type:"hub",entityId:"hub",x:e,y:n,radius:30};for(const i of c){const e=this.sourceNodes.find(t=>t.type===i.from),n="hub"===i.to?s:this.sourceNodes.find(t=>t.type===i.to);e&&n&&i.powerWatts>10&&(s.color=i.color,this.particleSystem.spawnParticles(e,n,i.powerWatts,t))}for(const i of this.consumptionNodes){if(!i.isVisible||i.powerWatts<=10||"total_load"===i.id)continue;const e=this.categoryNodes.has(i.id),n=this.collapsedCategories.has(i.id),r=c.find(t=>"hub"===t.to);if(s.color=r?.color??"#64b5f6",e){if(this.particleSystem.spawnParticles(s,i,i.powerWatts,t),!n&&i.children)for(const s of i.children)s.isVisible&&s.powerWatts>10&&this.particleSystem.spawnParticles(i,s,s.powerWatts,.5*t)}else this.particleSystem.spawnParticles(s,i,i.powerWatts,t)}this.particleSystem.update(t),this.particleSystem.render(i)}const f=this.consumptionNodes.reduce((t,i)=>t+i.powerWatts,0);this.nodeRenderer.renderHubNode(e,n,30,f);const d=this.config.entities?.battery_soc?this.sensorManager?.getPercentageValue(this.config.entities.battery_soc):void 0,u=this.config.entities?.battery_capacity?this.sensorManager?.getPowerValue(this.config.entities.battery_capacity):void 0,p=o?.powerWatts??0;let v;if(void 0!==d&&u){const t=function(t,i,s){if(!i||i<=0)return null;if(Math.abs(s)<10)return null;const e=s<-10;if(s>10){const e=i*t/100/(s/1e3);return Math.round(60*e)}if(e){const e=i*(100-t)/100/(Math.abs(s)/1e3);return Math.round(60*e)}return null}(d,u,p);if(null!==t){const i=function(t){if(null===t||t<=0)return"";const i=Math.floor(t/60),s=Math.round(t%60);return i>0?s>0?`${i}h ${s}m`:`${i}h`:`${s}m`}(t);v=i?`${i} to ${p>10?"empty":"full"}`:void 0}}for(const t of this.sourceNodes){const i="battery"===t.type?d:void 0,s="battery"===t.type?u:void 0,e="battery"===t.type?v:void 0;let n=!1;"battery"===t.type&&void 0!==i&&this.config.warnings?.battery_low?n=i<this.config.warnings.battery_low:"grid"===t.type&&this.config.warnings?.grid_import&&(n=t.powerWatts>this.config.warnings.grid_import),this.nodeRenderer.renderSourceNode(t,i,s,e,n)}for(const t of this.consumptionNodes)if(t.isVisible){const i=this.categoryNodes.has(t.id),s=this.collapsedCategories.has(t.id);if(i){if(this.nodeRenderer.renderCategoryNode(t,s),!s&&t.children){for(const i of t.children)i.isVisible&&this.nodeRenderer.renderConsumptionNode(i);if(t.calculatedRemainder&&t.calculatedRemainder>10){const i=.05*this.canvas.width;this.nodeRenderer.renderRemainderNode(t.x-i,t.children[t.children.length-1]?.y+70||t.y+70,t.calculatedRemainder)}}}else this.nodeRenderer.renderConsumptionNode(t)}}startUpdateTimer(){const t=this.config?.update_interval??2e3;this.updateTimer=window.setInterval(()=>{this.sensorManager&&this.sensorManager.refresh()},t)}handleHassUpdate(){this.hass&&this.config&&(this.sensorManager&&this.sensorManager.unsubscribe(),this.initializeSensorManager())}reinitialize(){this.cleanup(),this.initializeSensorManager(),this.startUpdateTimer()}handleRefresh(){this.sensorManager&&this.sensorManager.refresh()}cleanup(){this.animationFrameId&&(cancelAnimationFrame(this.animationFrameId),this.animationFrameId=void 0),this.updateTimer&&(clearInterval(this.updateTimer),this.updateTimer=void 0),this.sensorManager&&this.sensorManager.unsubscribe(),this.particleSystem&&this.particleSystem.clear(),this.layoutEngine&&this.layoutEngine.stop(),this.resizeObserver&&(this.resizeObserver.disconnect(),this.resizeObserver=void 0)}},t.EnergyFlowCard.styles=pt,i([dt({attribute:!1})],t.EnergyFlowCard.prototype,"hass",void 0),i([ut()],t.EnergyFlowCard.prototype,"config",void 0),i([ut()],t.EnergyFlowCard.prototype,"sourceNodes",void 0),i([ut()],t.EnergyFlowCard.prototype,"consumptionNodes",void 0),i([ut()],t.EnergyFlowCard.prototype,"categoryNodes",void 0),i([ut()],t.EnergyFlowCard.prototype,"collapsedCategories",void 0),i([ut()],t.EnergyFlowCard.prototype,"warnings",void 0),i([ut()],t.EnergyFlowCard.prototype,"isLoading",void 0),i([ut()],t.EnergyFlowCard.prototype,"errorMessage",void 0),i([(t,i,s)=>((t,i,s)=>(s.configurable=!0,s.enumerable=!0,Reflect.decorate&&"object"!=typeof i&&Object.defineProperty(t,i,s),s))(t,i,{get(){return(t=>t.renderRoot?.querySelector("canvas")??null)(this)}})],t.EnergyFlowCard.prototype,"canvas",void 0),t.EnergyFlowCard=i([ct("energy-flow-card")],t.EnergyFlowCard),customElements.get("energy-flow-card")||customElements.define("energy-flow-card",t.EnergyFlowCard),customElements.get("energy-flow-card-editor")||customElements.define("energy-flow-card-editor",class extends HTMLElement{}),window.customCards=window.customCards||[],window.customCards.push({type:"custom:energy-flow-card",name:"Energy Flow Card",description:"Visualize real-time energy flow between sources and devices",preview:!0,documentationURL:"https://github.com/yourusername/energy-flow-card"}),console.log("%c⚡ Energy Flow Card %c1.0.2%c loaded successfully","color: #4caf50; font-weight: bold; font-size: 14px;","color: #64b5f6; font-weight: bold; font-size: 14px; background: #1e3250; padding: 2px 8px; border-radius: 3px;","color: #999; font-size: 12px;"),t}({});
//# sourceMappingURL=energy-flow-card.js.map

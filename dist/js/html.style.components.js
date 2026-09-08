/*! html.style components - MIT - https://html.style */
var kt=0,H=class extends HTMLElement{static observedAttributes=["exclusive"];#t="";#e=null;connectedCallback(){this.#t||(this.#t=`hs-accordion-${++kt}`),this.#e=new MutationObserver(()=>this.#i()),this.#e.observe(this,{childList:!0}),this.addEventListener("toggle",this.#s,!0),this.#i()}disconnectedCallback(){this.#e?.disconnect(),this.#e=null,this.removeEventListener("toggle",this.#s,!0)}attributeChangedCallback(){this.isConnected&&this.#i()}get panels(){return[...this.querySelectorAll(":scope > details")]}openAll(){if(!this.hasAttribute("exclusive"))for(let t of this.panels)t.open=!0}closeAll(){for(let t of this.panels)t.open=!1}#i(){let t=this.hasAttribute("exclusive");for(let e of this.panels)t?e.setAttribute("name",this.#t):e.getAttribute("name")===this.#t&&e.removeAttribute("name")}#s=t=>{let e=t.target;e.parentElement===this&&this.dispatchEvent(new CustomEvent("hs-accordion-toggle",{bubbles:!0,detail:{index:this.panels.indexOf(e),open:e.open}}))}};customElements.define("hs-accordion",H);var St="Dismiss",R=class extends HTMLElement{static observedAttributes=["dismissible","dismiss-label"];connectedCallback(){this.hasAttribute("role")||this.setAttribute("role","alert"),this.#t()}attributeChangedCallback(){this.isConnected&&this.#t()}#t(){let t=this.querySelector(":scope > [data-hs-dismiss]");if(!this.hasAttribute("dismissible")){t?.remove();return}let e=this.getAttribute("dismiss-label")||St;if(t){t.setAttribute("aria-label",e);return}let s=document.createElement("button");s.type="button",s.setAttribute("data-hs-dismiss",""),s.setAttribute("aria-label",e),s.textContent="\xD7",s.addEventListener("click",()=>this.dismiss()),this.append(s)}dismiss(){this.dispatchEvent(new CustomEvent("hs-dismiss",{bubbles:!0,cancelable:!0}))&&this.remove()}};customElements.define("hs-alert",R);var N=class extends HTMLElement{};customElements.define("hs-badge",N);var O=class extends HTMLElement{};customElements.define("hs-card",O);var wt="Copied";var D=class extends HTMLElement{#t=null;#e=null;#i="";#s=0;connectedCallback(){this.#t||(this.#i=this.textContent.trim()||"Copy",this.#t=document.createElement("button"),this.#t.type="button",this.#t.textContent=this.#i,this.#t.addEventListener("click",()=>this.copy()),this.#e=document.createElement("span"),this.#e.className="visually-hidden",this.#e.setAttribute("role","status"),this.replaceChildren(this.#t,this.#e))}disconnectedCallback(){clearTimeout(this.#s)}get text(){let t=this.getAttribute("for");return t?document.getElementById(t)?.textContent??"":this.getAttribute("value")??""}async copy(){let t=this.text;if(t){try{await navigator.clipboard.writeText(t)}catch(e){this.dispatchEvent(new CustomEvent("hs-copy-error",{bubbles:!0,detail:{error:e}}));return}this.#r(),this.dispatchEvent(new CustomEvent("hs-copy",{bubbles:!0,detail:{text:t}}))}}#r(){let t=this.getAttribute("copied-label")||wt;this.#e.textContent=t,this.setAttribute("data-copied",""),clearTimeout(this.#s),this.#s=setTimeout(()=>{this.removeAttribute("data-copied"),this.#e.textContent=""},2e3)}};customElements.define("hs-copy",D);var z=class r extends HTMLElement{static observedAttributes=["open","persistent"];static#t="closedBy"in HTMLDialogElement.prototype;#e=null;connectedCallback(){this.#e||(this.#e=document.createElement("dialog"),this.#e.append(...this.childNodes),this.append(this.#e),this.#e.addEventListener("close",this.#s),r.#t||this.#e.addEventListener("click",this.#r)),this.#i(),this.hasAttribute("open")&&this.show()}attributeChangedCallback(t,e,s){if(!(!this.isConnected||e===s)){if(t==="persistent"){this.#i();return}t==="open"&&(s===null?this.close():this.show())}}#i(){!r.#t||!this.#e||(this.#e.closedBy=this.hasAttribute("persistent")?"closerequest":"any")}get dialog(){return this.#e}get open(){return this.hasAttribute("open")}set open(t){this.toggleAttribute("open",!!t)}show(){!this.#e||this.#e.open||(this.#e.showModal(),this.hasAttribute("open")||this.setAttribute("open",""),this.dispatchEvent(new CustomEvent("hs-open",{bubbles:!0})))}close(t){this.#e?.open&&this.#e.close(t)}#s=()=>{this.removeAttribute("open"),this.dispatchEvent(new CustomEvent("hs-close",{bubbles:!0,detail:{returnValue:this.#e.returnValue}}))};#r=t=>{if(this.hasAttribute("persistent")||t.target!==this.#e)return;let e=this.#e.getBoundingClientRect();t.clientX>=e.left&&t.clientX<=e.right&&t.clientY>=e.top&&t.clientY<=e.bottom||this.close("backdrop")}};customElements.define("hs-dialog",z);var Tt=0,B=class extends HTMLElement{static observedAttributes=["label","hint"];#t=null;#e=null;#i=null;#s=null;#r="";connectedCallback(){this.#t=this.querySelector("input, select, textarea"),this.#t&&(this.#r||(this.#r=this.#t.id||`hs-field-${++Tt}`),this.#t.id=this.#r,this.#n(),this.#a(),this.#u(),this.#o(),this.addEventListener("invalid",this.#l,!0),this.#t.addEventListener("blur",this.#c),this.#t.addEventListener("input",this.#d))}disconnectedCallback(){this.removeEventListener("invalid",this.#l,!0),this.#t?.removeEventListener("blur",this.#c),this.#t?.removeEventListener("input",this.#d)}attributeChangedCallback(){!this.isConnected||!this.#t||(this.#n(),this.#a(),this.#o())}get control(){return this.#t}#n(){let t=this.querySelector(":scope > label");if(t&&t!==this.#e){t.hasAttribute("for")||t.setAttribute("for",this.#r);return}let e=this.getAttribute("label");if(!e){this.#e?.remove(),this.#e=null;return}this.#e||(this.#e=document.createElement("label"),this.#t.before(this.#e)),this.#e.setAttribute("for",this.#r),this.#e.textContent=e}#a(){let t=this.getAttribute("hint");if(!t){this.#i?.remove(),this.#i=null;return}this.#i||(this.#i=document.createElement("p"),this.#i.id=`${this.#r}-hint`,this.#i.setAttribute("data-hs-hint",""),this.#t.after(this.#i)),this.#i.textContent=t}#u(){this.#s||(this.#s=document.createElement("p"),this.#s.id=`${this.#r}-error`,this.#s.setAttribute("data-hs-error",""),this.#s.setAttribute("role","alert"),this.#s.hidden=!0,(this.#i??this.#t).after(this.#s))}#o(){let t=[];this.#i&&t.push(this.#i.id),this.#s&&!this.#s.hidden&&t.push(this.#s.id);let e=new Set([`${this.#r}-hint`,`${this.#r}-error`]),i=[...(this.#t.getAttribute("aria-describedby")??"").split(/\s+/).filter(o=>o&&!e.has(o)),...t];i.length?this.#t.setAttribute("aria-describedby",i.join(" ")):this.#t.removeAttribute("aria-describedby")}#p(t){this.hasAttribute("novalidate")||(this.#s.textContent=t,this.#s.hidden=!1,this.#t.setAttribute("aria-invalid","true"),this.#o())}#h(){this.#s.hidden=!0,this.#s.textContent="",this.#t.removeAttribute("aria-invalid"),this.#o()}#l=t=>{t.target===this.#t&&(this.hasAttribute("novalidate")||(t.preventDefault(),this.#p(this.#t.validationMessage),this.dispatchEvent(new CustomEvent("hs-invalid",{bubbles:!0,detail:{message:this.#t.validationMessage}}))))};#c=()=>{this.hasAttribute("novalidate")||this.#t.value===""||this.#t.checkValidity()&&this.#h()};#d=()=>{!this.#s.hidden&&this.#t.checkValidity()&&this.#h()}};customElements.define("hs-field",B);var I=globalThis,j=I.ShadowRoot&&(I.ShadyCSS===void 0||I.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,G=Symbol(),ht=new WeakMap,x=class{constructor(t,e,s){if(this._$cssResult$=!0,s!==G)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o,e=this.t;if(j&&t===void 0){let s=e!==void 0&&e.length===1;s&&(t=ht.get(e)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),s&&ht.set(e,t))}return t}toString(){return this.cssText}},lt=r=>new x(typeof r=="string"?r:r+"",void 0,G),k=(r,...t)=>{let e=r.length===1?r[0]:t.reduce((s,i,o)=>s+(n=>{if(n._$cssResult$===!0)return n.cssText;if(typeof n=="number")return n;throw Error("Value passed to 'css' function must be a 'css' function result: "+n+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+r[o+1],r[0]);return new x(e,r,G)},ct=(r,t)=>{if(j)r.adoptedStyleSheets=t.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let e of t){let s=document.createElement("style"),i=I.litNonce;i!==void 0&&s.setAttribute("nonce",i),s.textContent=e.cssText,r.appendChild(s)}},J=j?r=>r:r=>r instanceof CSSStyleSheet?(t=>{let e="";for(let s of t.cssRules)e+=s.cssText;return lt(e)})(r):r;var{is:Lt,defineProperty:Pt,getOwnPropertyDescriptor:Mt,getOwnPropertyNames:Ut,getOwnPropertySymbols:Ht,getPrototypeOf:Rt}=Object,q=globalThis,dt=q.trustedTypes,Nt=dt?dt.emptyScript:"",Ot=q.reactiveElementPolyfillSupport,S=(r,t)=>r,X={toAttribute(r,t){switch(t){case Boolean:r=r?Nt:null;break;case Object:case Array:r=r==null?r:JSON.stringify(r)}return r},fromAttribute(r,t){let e=r;switch(t){case Boolean:e=r!==null;break;case Number:e=r===null?null:Number(r);break;case Object:case Array:try{e=JSON.parse(r)}catch{e=null}}return e}},pt=(r,t)=>!Lt(r,t),ut={attribute:!0,type:String,converter:X,reflect:!1,useDefault:!1,hasChanged:pt};Symbol.metadata??=Symbol("metadata"),q.litPropertyMetadata??=new WeakMap;var m=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=ut){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){let s=Symbol(),i=this.getPropertyDescriptor(t,s,e);i!==void 0&&Pt(this.prototype,t,i)}}static getPropertyDescriptor(t,e,s){let{get:i,set:o}=Mt(this.prototype,t)??{get(){return this[e]},set(n){this[e]=n}};return{get:i,set(n){let l=i?.call(this);o?.call(this,n),this.requestUpdate(t,l,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??ut}static _$Ei(){if(this.hasOwnProperty(S("elementProperties")))return;let t=Rt(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(S("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(S("properties"))){let e=this.properties,s=[...Ut(e),...Ht(e)];for(let i of s)this.createProperty(i,e[i])}let t=this[Symbol.metadata];if(t!==null){let e=litPropertyMetadata.get(t);if(e!==void 0)for(let[s,i]of e)this.elementProperties.set(s,i)}this._$Eh=new Map;for(let[e,s]of this.elementProperties){let i=this._$Eu(e,s);i!==void 0&&this._$Eh.set(i,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){let e=[];if(Array.isArray(t)){let s=new Set(t.flat(1/0).reverse());for(let i of s)e.unshift(J(i))}else t!==void 0&&e.push(J(t));return e}static _$Eu(t,e){let s=e.attribute;return s===!1?void 0:typeof s=="string"?s:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){let t=new Map,e=this.constructor.elementProperties;for(let s of e.keys())this.hasOwnProperty(s)&&(t.set(s,this[s]),delete this[s]);t.size>0&&(this._$Ep=t)}createRenderRoot(){let t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return ct(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,s){this._$AK(t,s)}_$ET(t,e){let s=this.constructor.elementProperties.get(t),i=this.constructor._$Eu(t,s);if(i!==void 0&&s.reflect===!0){let o=(s.converter?.toAttribute!==void 0?s.converter:X).toAttribute(e,s.type);this._$Em=t,o==null?this.removeAttribute(i):this.setAttribute(i,o),this._$Em=null}}_$AK(t,e){let s=this.constructor,i=s._$Eh.get(t);if(i!==void 0&&this._$Em!==i){let o=s.getPropertyOptions(i),n=typeof o.converter=="function"?{fromAttribute:o.converter}:o.converter?.fromAttribute!==void 0?o.converter:X;this._$Em=i;let l=n.fromAttribute(e,o.type);this[i]=l??this._$Ej?.get(i)??l,this._$Em=null}}requestUpdate(t,e,s,i=!1,o){if(t!==void 0){let n=this.constructor;if(i===!1&&(o=this[t]),s??=n.getPropertyOptions(t),!((s.hasChanged??pt)(o,e)||s.useDefault&&s.reflect&&o===this._$Ej?.get(t)&&!this.hasAttribute(n._$Eu(t,s))))return;this.C(t,e,s)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,e,{useDefault:s,reflect:i,wrapped:o},n){s&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,n??e??this[t]),o!==!0||n!==void 0)||(this._$AL.has(t)||(this.hasUpdated||s||(e=void 0),this._$AL.set(t,e)),i===!0&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[i,o]of this._$Ep)this[i]=o;this._$Ep=void 0}let s=this.constructor.elementProperties;if(s.size>0)for(let[i,o]of s){let{wrapped:n}=o,l=this[i];n!==!0||this._$AL.has(i)||l===void 0||this.C(i,void 0,o,l)}}let t=!1,e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(s=>s.hostUpdate?.()),this.update(e)):this._$EM()}catch(s){throw t=!1,this._$EM(),s}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(t){}firstUpdated(t){}};m.elementStyles=[],m.shadowRootOptions={mode:"open"},m[S("elementProperties")]=new Map,m[S("finalized")]=new Map,Ot?.({ReactiveElement:m}),(q.reactiveElementVersions??=[]).push("2.1.2");var rt=globalThis,bt=r=>r,V=rt.trustedTypes,mt=V?V.createPolicy("lit-html",{createHTML:r=>r}):void 0,_t="$lit$",g=`lit$${Math.random().toFixed(9).slice(2)}$`,yt="?"+g,Dt=`<${yt}>`,A=document,T=()=>A.createComment(""),L=r=>r===null||typeof r!="object"&&typeof r!="function",ot=Array.isArray,zt=r=>ot(r)||typeof r?.[Symbol.iterator]=="function",Z=`[ 	
\f\r]`,w=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,ft=/-->/g,gt=/>/g,v=RegExp(`>|${Z}(?:([^\\s"'>=/]+)(${Z}*=${Z}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),vt=/'/g,$t=/"/g,Et=/^(?:script|style|textarea|title)$/i,nt=r=>(t,...e)=>({_$litType$:r,strings:t,values:e}),C=nt(1),se=nt(2),ie=nt(3),_=Symbol.for("lit-noChange"),d=Symbol.for("lit-nothing"),At=new WeakMap,$=A.createTreeWalker(A,129);function Ct(r,t){if(!ot(r)||!r.hasOwnProperty("raw"))throw Error("invalid template strings array");return mt!==void 0?mt.createHTML(t):t}var Bt=(r,t)=>{let e=r.length-1,s=[],i,o=t===2?"<svg>":t===3?"<math>":"",n=w;for(let l=0;l<e;l++){let a=r[l],c,u,h=-1,b=0;for(;b<a.length&&(n.lastIndex=b,u=n.exec(a),u!==null);)b=n.lastIndex,n===w?u[1]==="!--"?n=ft:u[1]!==void 0?n=gt:u[2]!==void 0?(Et.test(u[2])&&(i=RegExp("</"+u[2],"g")),n=v):u[3]!==void 0&&(n=v):n===v?u[0]===">"?(n=i??w,h=-1):u[1]===void 0?h=-2:(h=n.lastIndex-u[2].length,c=u[1],n=u[3]===void 0?v:u[3]==='"'?$t:vt):n===$t||n===vt?n=v:n===ft||n===gt?n=w:(n=v,i=void 0);let f=n===v&&r[l+1].startsWith("/>")?" ":"";o+=n===w?a+Dt:h>=0?(s.push(c),a.slice(0,h)+_t+a.slice(h)+g+f):a+g+(h===-2?l:f)}return[Ct(r,o+(r[e]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),s]},P=class r{constructor({strings:t,_$litType$:e},s){let i;this.parts=[];let o=0,n=0,l=t.length-1,a=this.parts,[c,u]=Bt(t,e);if(this.el=r.createElement(c,s),$.currentNode=this.el.content,e===2||e===3){let h=this.el.content.firstChild;h.replaceWith(...h.childNodes)}for(;(i=$.nextNode())!==null&&a.length<l;){if(i.nodeType===1){if(i.hasAttributes())for(let h of i.getAttributeNames())if(h.endsWith(_t)){let b=u[n++],f=i.getAttribute(h).split(g),U=/([.?@])?(.*)/.exec(b);a.push({type:1,index:o,name:U[2],strings:f,ctor:U[1]==="."?tt:U[1]==="?"?et:U[1]==="@"?st:E}),i.removeAttribute(h)}else h.startsWith(g)&&(a.push({type:6,index:o}),i.removeAttribute(h));if(Et.test(i.tagName)){let h=i.textContent.split(g),b=h.length-1;if(b>0){i.textContent=V?V.emptyScript:"";for(let f=0;f<b;f++)i.append(h[f],T()),$.nextNode(),a.push({type:2,index:++o});i.append(h[b],T())}}}else if(i.nodeType===8)if(i.data===yt)a.push({type:2,index:o});else{let h=-1;for(;(h=i.data.indexOf(g,h+1))!==-1;)a.push({type:7,index:o}),h+=g.length-1}o++}}static createElement(t,e){let s=A.createElement("template");return s.innerHTML=t,s}};function y(r,t,e=r,s){if(t===_)return t;let i=s!==void 0?e._$Co?.[s]:e._$Cl,o=L(t)?void 0:t._$litDirective$;return i?.constructor!==o&&(i?._$AO?.(!1),o===void 0?i=void 0:(i=new o(r),i._$AT(r,e,s)),s!==void 0?(e._$Co??=[])[s]=i:e._$Cl=i),i!==void 0&&(t=y(r,i._$AS(r,t.values),i,s)),t}var Q=class{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){let{el:{content:e},parts:s}=this._$AD,i=(t?.creationScope??A).importNode(e,!0);$.currentNode=i;let o=$.nextNode(),n=0,l=0,a=s[0];for(;a!==void 0;){if(n===a.index){let c;a.type===2?c=new M(o,o.nextSibling,this,t):a.type===1?c=new a.ctor(o,a.name,a.strings,this,t):a.type===6&&(c=new it(o,this,t)),this._$AV.push(c),a=s[++l]}n!==a?.index&&(o=$.nextNode(),n++)}return $.currentNode=A,i}p(t){let e=0;for(let s of this._$AV)s!==void 0&&(s.strings!==void 0?(s._$AI(t,s,e),e+=s.strings.length-2):s._$AI(t[e])),e++}},M=class r{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,s,i){this.type=2,this._$AH=d,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=s,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode,e=this._$AM;return e!==void 0&&t?.nodeType===11&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=y(this,t,e),L(t)?t===d||t==null||t===""?(this._$AH!==d&&this._$AR(),this._$AH=d):t!==this._$AH&&t!==_&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):zt(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==d&&L(this._$AH)?this._$AA.nextSibling.data=t:this.T(A.createTextNode(t)),this._$AH=t}$(t){let{values:e,_$litType$:s}=t,i=typeof s=="number"?this._$AC(t):(s.el===void 0&&(s.el=P.createElement(Ct(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===i)this._$AH.p(e);else{let o=new Q(i,this),n=o.u(this.options);o.p(e),this.T(n),this._$AH=o}}_$AC(t){let e=At.get(t.strings);return e===void 0&&At.set(t.strings,e=new P(t)),e}k(t){ot(this._$AH)||(this._$AH=[],this._$AR());let e=this._$AH,s,i=0;for(let o of t)i===e.length?e.push(s=new r(this.O(T()),this.O(T()),this,this.options)):s=e[i],s._$AI(o),i++;i<e.length&&(this._$AR(s&&s._$AB.nextSibling,i),e.length=i)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){let s=bt(t).nextSibling;bt(t).remove(),t=s}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}},E=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,s,i,o){this.type=1,this._$AH=d,this._$AN=void 0,this.element=t,this.name=e,this._$AM=i,this.options=o,s.length>2||s[0]!==""||s[1]!==""?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=d}_$AI(t,e=this,s,i){let o=this.strings,n=!1;if(o===void 0)t=y(this,t,e,0),n=!L(t)||t!==this._$AH&&t!==_,n&&(this._$AH=t);else{let l=t,a,c;for(t=o[0],a=0;a<o.length-1;a++)c=y(this,l[s+a],e,a),c===_&&(c=this._$AH[a]),n||=!L(c)||c!==this._$AH[a],c===d?t=d:t!==d&&(t+=(c??"")+o[a+1]),this._$AH[a]=c}n&&!i&&this.j(t)}j(t){t===d?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}},tt=class extends E{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===d?void 0:t}},et=class extends E{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==d)}},st=class extends E{constructor(t,e,s,i,o){super(t,e,s,i,o),this.type=5}_$AI(t,e=this){if((t=y(this,t,e,0)??d)===_)return;let s=this._$AH,i=t===d&&s!==d||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,o=t!==d&&(s===d||i);i&&this.element.removeEventListener(this.name,this,s),o&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}},it=class{constructor(t,e,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(t){y(this,t)}};var It=rt.litHtmlPolyfillSupport;It?.(P,M),(rt.litHtmlVersions??=[]).push("3.3.3");var xt=(r,t,e)=>{let s=e?.renderBefore??t,i=s._$litPart$;if(i===void 0){let o=e?.renderBefore??null;s._$litPart$=i=new M(t.insertBefore(T(),o),o,void 0,e??{})}return i._$AI(r),i};var at=globalThis,p=class extends m{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){let e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=xt(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return _}};p._$litElement$=!0,p.finalized=!0,at.litElementHydrateSupport?.({LitElement:p});var jt=at.litElementPolyfillSupport;jt?.({LitElement:p});(at.litElementVersions??=[]).push("4.2.2");var F=class extends HTMLElement{};customElements.get("hs-tab-panel")||customElements.define("hs-tab-panel",F);var W=class extends p{static properties={selected:{type:Number,reflect:!0},activation:{type:String,reflect:!0},_labels:{state:!0}};static styles=k`
    /* The global reset stops at the shadow boundary, so restate what matters. */
    *,
    *::before,
    *::after {
      box-sizing: border-box;
    }

    :host {
      display: block;
    }

    [part='tablist'] {
      display: flex;
      gap: var(--hs-tabs-gap, var(--p-space-xs, 0.25rem));
      border-block-end: var(--border-width, 1px) solid
        var(--hs-tabs-border-color, var(--color-border-default, currentColor));
      overflow-x: auto;
    }

    button {
      flex-shrink: 0;
      background: none;
      border: none;
      border-block-end: var(--hs-tabs-indicator-size, var(--border-width-emphasis, 2px))
        solid transparent;
      margin-block-end: calc(-1 * var(--border-width, 1px));
      padding: var(--hs-tabs-tab-padding-block, var(--space-component, 0.5rem))
        var(--hs-tabs-tab-padding-inline, var(--space-inline, 1rem));
      font: inherit;
      color: var(--hs-tabs-tab-color, var(--color-text-secondary, currentColor));
      cursor: pointer;
      transition: color var(--motion-duration, 200ms) var(--motion-ease, ease),
        border-color var(--motion-duration, 200ms) var(--motion-ease, ease);
    }

    button[aria-selected='true'] {
      color: var(--hs-tabs-tab-color-active, var(--color-action-primary, currentColor));
      border-block-end-color: var(--hs-tabs-indicator-color,
        var(--color-action-primary, currentColor));
    }

    button:focus-visible {
      outline: var(--focus-ring-width, 2px) solid var(--focus-ring-color, currentColor);
      outline-offset: calc(-1 * var(--focus-ring-width, 2px));
    }

    [part='panel'] {
      padding-block-start: var(--hs-tabs-panel-spacing, var(--space-block, 1.5rem));
    }

    /* No reduced-motion block: --motion-duration inherits through the shadow
       boundary, so collapsing it on :root reaches these transitions. */
  `;#t=[];constructor(){super(),this.selected=0,this.activation="auto",this._labels=[]}get panels(){return this.#t}#e=()=>{this.#t=[...this.querySelectorAll(":scope > hs-tab-panel")],this.#t.forEach((t,e)=>t.setAttribute("slot",`panel-${e}`)),this._labels=this.#t.map((t,e)=>t.getAttribute("label")||`Tab ${e+1}`),this.selected>=this._labels.length&&(this.selected=0)};#i(t,{focus:e=!1}={}){t===this.selected||t<0||t>=this._labels.length||(this.selected=t,e&&this.#s(t),this.dispatchEvent(new CustomEvent("hs-tab-change",{bubbles:!0,detail:{index:t,label:this._labels[t]}})))}#s(t){this.updateComplete.then(()=>{this.renderRoot.querySelectorAll("button")[t]?.focus()})}#r=t=>{let e=this._labels.length-1,s=Number(t.currentTarget.dataset.index),i=null;switch(t.key){case"ArrowRight":i=s===e?0:s+1;break;case"ArrowLeft":i=s===0?e:s-1;break;case"Home":i=0;break;case"End":i=e;break;case"Enter":case" ":t.preventDefault(),this.#i(s);return;default:return}t.preventDefault(),this.activation==="manual"?(this.#s(i),this.renderRoot.querySelectorAll("button")[i]?.focus()):this.#i(i,{focus:!0})};render(){return C`
      <div part="tablist" role="tablist">
        ${this._labels.map((t,e)=>C`
            <button
              part=${e===this.selected?"tab tab-active":"tab"}
              role="tab"
              id="tab-${e}"
              data-index=${e}
              aria-selected=${e===this.selected?"true":"false"}
              aria-controls="panel-${e}"
              tabindex=${e===this.selected?0:-1}
              @click=${()=>this.#i(e)}
              @keydown=${this.#r}
            >
              ${t}
            </button>
          `)}
      </div>

      ${this._labels.map((t,e)=>C`
          <div
            part="panel"
            role="tabpanel"
            id="panel-${e}"
            aria-labelledby="tab-${e}"
            ?hidden=${e!==this.selected}
            tabindex="0"
          >
            <slot name="panel-${e}"></slot>
          </div>
        `)}

      <!-- Unassigned children land here and stay out of the tab UI. -->
      <slot @slotchange=${this.#e} hidden></slot>
    `}};customElements.define("hs-tabs",W);var qt="theme",Vt="Toggle colour scheme",K=class extends HTMLElement{static observedAttributes=["label"];#t=null;connectedCallback(){this.#t||(this.#t=document.createElement("button"),this.#t.type="button",this.#t.addEventListener("click",()=>this.toggle()),this.append(this.#t)),this.#e()}attributeChangedCallback(){this.isConnected&&this.#e()}get scheme(){let t=document.documentElement.style.colorScheme;return t==="light"||t==="dark"?t:matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}set scheme(t){if(!(t!=="light"&&t!=="dark")){document.documentElement.style.colorScheme=t;try{localStorage.setItem(qt,t)}catch{}this.#e(),this.dispatchEvent(new CustomEvent("hs-theme-change",{bubbles:!0,detail:{scheme:t}}))}}toggle(){this.scheme=this.scheme==="dark"?"light":"dark"}#e(){if(!this.#t)return;let t=this.scheme==="dark";this.#t.setAttribute("aria-label",this.getAttribute("label")||Vt),this.#t.setAttribute("aria-pressed",String(t)),this.#t.textContent=t?"\u263E":"\u2600"}};customElements.define("hs-theme-toggle",K);var Y=class extends p{static formAssociated=!0;static properties={checked:{type:Boolean,reflect:!0},disabled:{type:Boolean,reflect:!0},name:{type:String},value:{type:String}};static styles=k`
    /* The global reset does not cross the shadow boundary, so the component
       restates it. Without this, .track is content-box and its padding adds to
       the declared size — which shows up as a layout shift when the element
       upgrades. Every shadow component needs its own reset. */
    *,
    *::before,
    *::after {
      box-sizing: border-box;
    }

    /* Every dimension and colour is a custom property with a default, so a
       consumer can resize or recolour the switch without ::part() surgery —
       which would otherwise lose to the sizes declared in here. */
    :host {
      --_track-inline: var(--hs-toggle-track-inline-size, 2.5rem);
      --_track-block: var(--hs-toggle-track-block-size, 1.5rem);
      --_track-pad: var(--hs-toggle-track-padding, 0.1875rem);
      --_thumb: var(--hs-toggle-thumb-size, 1.125rem);

      display: inline-flex;
      align-items: center;
      gap: var(--hs-toggle-gap, var(--space-component, 0.5rem));
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }

    :host([disabled]) {
      cursor: not-allowed;
      opacity: 0.5;
    }

    :host(:focus-visible) {
      outline: var(--focus-ring-width, 2px) solid var(--focus-ring-color, currentColor);
      outline-offset: var(--focus-ring-offset, 2px);
      border-radius: var(--p-radius-sm, 0.25rem);
    }

    .track {
      /* The thumb is a <span>, so it stays display:inline and ignores its own
         size unless its parent lays it out. The track escapes that only because
         it is a flex item of :host; the thumb has no such rescue. */
      display: flex;
      align-items: center;
      flex-shrink: 0;
      inline-size: var(--_track-inline);
      block-size: var(--_track-block);
      padding: var(--_track-pad);
      border-radius: var(--hs-toggle-radius, var(--p-radius-full, 9999px));
      background: var(--hs-toggle-track-color, var(--color-border-emphasis, currentColor));
      transition: background var(--motion-duration, 200ms) var(--motion-ease, ease);
    }

    :host([checked]) .track {
      background: var(--hs-toggle-track-color-checked, var(--color-action-primary, currentColor));
    }

    .thumb {
      inline-size: var(--_thumb);
      block-size: var(--_thumb);
      border-radius: var(--hs-toggle-radius, var(--p-radius-full, 9999px));
      background: var(--hs-toggle-thumb-color, var(--color-surface-elevated, #fff));
      transition: translate var(--motion-duration, 200ms) var(--motion-ease, ease);
    }

    /* Derived from the sizes above rather than hardcoded, so resizing the track
       actually moves the thumb the right distance. */
    :host([checked]) .thumb {
      translate: calc(var(--_track-inline) - var(--_thumb) - 2 * var(--_track-pad)) 0;
    }

    /* No reduced-motion block here. --motion-duration is a custom property, and
       custom properties inherit THROUGH the shadow boundary, so collapsing it
       on :root under prefers-reduced-motion reaches this component. */
  `;#t;#e=!1;constructor(){super(),this.checked=!1,this.disabled=!1,this.value="on",this.#t=this.attachInternals(),this.#t.role="switch"}connectedCallback(){super.connectedCallback(),this.#e=this.hasAttribute("checked"),this.#t.setFormValue(this.checked?this.value:null),this.hasAttribute("tabindex")||(this.tabIndex=this.disabled?-1:0),this.addEventListener("click",this.#i),this.addEventListener("keydown",this.#s)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("click",this.#i),this.removeEventListener("keydown",this.#s)}willUpdate(){this.#t.ariaChecked=String(this.checked),this.#t.ariaDisabled=String(this.disabled),this.disabled?this.setAttribute("aria-disabled","true"):this.removeAttribute("aria-disabled"),this.#t.setFormValue(this.checked?this.value:null),(!this.hasAttribute("tabindex")||this.tabIndex>=0||this.disabled)&&(this.tabIndex=this.disabled?-1:0)}#i=()=>this.toggle();#s=t=>{t.key!==" "&&t.key!=="Enter"||(t.preventDefault(),this.toggle())};toggle(){this.disabled||(this.checked=!this.checked,this.dispatchEvent(new Event("change",{bubbles:!0})))}formResetCallback(){this.checked=this.#e}formStateRestoreCallback(t){this.checked=t!==null}render(){return C`
      <span class="track" part="track" aria-hidden="true">
        <span class="thumb" part="thumb"></span>
      </span>
      <slot></slot>
    `}};customElements.define("hs-toggle",Y);export{H as HsAccordion,R as HsAlert,N as HsBadge,O as HsCard,D as HsCopy,z as HsDialog,B as HsField,F as HsTabPanel,W as HsTabs,K as HsThemeToggle,Y as HsToggle};
/*! Bundled license information:

@lit/reactive-element/css-tag.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/reactive-element.js:
lit-html/lit-html.js:
lit-element/lit-element.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/is-server.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)
*/

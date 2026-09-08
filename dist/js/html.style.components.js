/*! html.style components - MIT - https://html.style */
var Ct=0,H=class extends HTMLElement{static observedAttributes=["exclusive"];#t="";#e=null;connectedCallback(){this.#t||(this.#t=`hs-accordion-${++Ct}`),this.#e=new MutationObserver(()=>this.#s()),this.#e.observe(this,{childList:!0}),this.addEventListener("toggle",this.#i,!0),this.#s()}disconnectedCallback(){this.#e?.disconnect(),this.#e=null,this.removeEventListener("toggle",this.#i,!0)}attributeChangedCallback(){this.isConnected&&this.#s()}get panels(){return[...this.querySelectorAll(":scope > details")]}openAll(){if(!this.hasAttribute("exclusive"))for(let t of this.panels)t.open=!0}closeAll(){for(let t of this.panels)t.open=!1}#s(){let t=this.hasAttribute("exclusive");for(let e of this.panels)t?e.setAttribute("name",this.#t):e.getAttribute("name")===this.#t&&e.removeAttribute("name")}#i=t=>{let e=t.target;e.parentElement===this&&this.dispatchEvent(new CustomEvent("hs-accordion-toggle",{bubbles:!0,detail:{index:this.panels.indexOf(e),open:e.open}}))}};customElements.define("hs-accordion",H);var St="Dismiss",O=class extends HTMLElement{static observedAttributes=["dismissible","dismiss-label"];connectedCallback(){this.hasAttribute("role")||this.setAttribute("role","alert"),this.#t()}attributeChangedCallback(){this.isConnected&&this.#t()}#t(){let t=this.querySelector(":scope > [data-hs-dismiss]");if(!this.hasAttribute("dismissible")){t?.remove();return}let e=this.getAttribute("dismiss-label")||St;if(t){t.setAttribute("aria-label",e);return}let s=document.createElement("button");s.type="button",s.setAttribute("data-hs-dismiss",""),s.setAttribute("aria-label",e),s.textContent="\xD7",s.addEventListener("click",()=>this.dismiss()),this.append(s)}dismiss(){this.dispatchEvent(new CustomEvent("hs-dismiss",{bubbles:!0,cancelable:!0}))&&this.remove()}};customElements.define("hs-alert",O);var R=class extends HTMLElement{};customElements.define("hs-badge",R);var N=class extends HTMLElement{};customElements.define("hs-card",N);var D=class r extends HTMLElement{static observedAttributes=["open","persistent"];static#t="closedBy"in HTMLDialogElement.prototype;#e=null;connectedCallback(){this.#e||(this.#e=document.createElement("dialog"),this.#e.append(...this.childNodes),this.append(this.#e),this.#e.addEventListener("close",this.#i),r.#t||this.#e.addEventListener("click",this.#r)),this.#s(),this.hasAttribute("open")&&this.show()}attributeChangedCallback(t,e,s){if(!(!this.isConnected||e===s)){if(t==="persistent"){this.#s();return}t==="open"&&(s===null?this.close():this.show())}}#s(){!r.#t||!this.#e||(this.#e.closedBy=this.hasAttribute("persistent")?"closerequest":"any")}get dialog(){return this.#e}get open(){return this.hasAttribute("open")}set open(t){this.toggleAttribute("open",!!t)}show(){!this.#e||this.#e.open||(this.#e.showModal(),this.hasAttribute("open")||this.setAttribute("open",""),this.dispatchEvent(new CustomEvent("hs-open",{bubbles:!0})))}close(t){this.#e?.open&&this.#e.close(t)}#i=()=>{this.removeAttribute("open"),this.dispatchEvent(new CustomEvent("hs-close",{bubbles:!0,detail:{returnValue:this.#e.returnValue}}))};#r=t=>{if(this.hasAttribute("persistent")||t.target!==this.#e)return;let e=this.#e.getBoundingClientRect();t.clientX>=e.left&&t.clientX<=e.right&&t.clientY>=e.top&&t.clientY<=e.bottom||this.close("backdrop")}};customElements.define("hs-dialog",D);var B=globalThis,z=B.ShadowRoot&&(B.ShadyCSS===void 0||B.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,F=Symbol(),nt=new WeakMap,S=class{constructor(t,e,s){if(this._$cssResult$=!0,s!==F)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o,e=this.t;if(z&&t===void 0){let s=e!==void 0&&e.length===1;s&&(t=nt.get(e)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),s&&nt.set(e,t))}return t}toString(){return this.cssText}},at=r=>new S(typeof r=="string"?r:r+"",void 0,F),x=(r,...t)=>{let e=r.length===1?r[0]:t.reduce((s,i,o)=>s+(n=>{if(n._$cssResult$===!0)return n.cssText;if(typeof n=="number")return n;throw Error("Value passed to 'css' function must be a 'css' function result: "+n+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+r[o+1],r[0]);return new S(e,r,F)},lt=(r,t)=>{if(z)r.adoptedStyleSheets=t.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let e of t){let s=document.createElement("style"),i=B.litNonce;i!==void 0&&s.setAttribute("nonce",i),s.textContent=e.cssText,r.appendChild(s)}},Y=z?r=>r:r=>r instanceof CSSStyleSheet?(t=>{let e="";for(let s of t.cssRules)e+=s.cssText;return at(e)})(r):r;var{is:xt,defineProperty:kt,getOwnPropertyDescriptor:wt,getOwnPropertyNames:Tt,getOwnPropertySymbols:Pt,getPrototypeOf:Lt}=Object,I=globalThis,ht=I.trustedTypes,Ut=ht?ht.emptyScript:"",Mt=I.reactiveElementPolyfillSupport,k=(r,t)=>r,J={toAttribute(r,t){switch(t){case Boolean:r=r?Ut:null;break;case Object:case Array:r=r==null?r:JSON.stringify(r)}return r},fromAttribute(r,t){let e=r;switch(t){case Boolean:e=r!==null;break;case Number:e=r===null?null:Number(r);break;case Object:case Array:try{e=JSON.parse(r)}catch{e=null}}return e}},dt=(r,t)=>!xt(r,t),ct={attribute:!0,type:String,converter:J,reflect:!1,useDefault:!1,hasChanged:dt};Symbol.metadata??=Symbol("metadata"),I.litPropertyMetadata??=new WeakMap;var b=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=ct){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){let s=Symbol(),i=this.getPropertyDescriptor(t,s,e);i!==void 0&&kt(this.prototype,t,i)}}static getPropertyDescriptor(t,e,s){let{get:i,set:o}=wt(this.prototype,t)??{get(){return this[e]},set(n){this[e]=n}};return{get:i,set(n){let h=i?.call(this);o?.call(this,n),this.requestUpdate(t,h,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??ct}static _$Ei(){if(this.hasOwnProperty(k("elementProperties")))return;let t=Lt(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(k("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(k("properties"))){let e=this.properties,s=[...Tt(e),...Pt(e)];for(let i of s)this.createProperty(i,e[i])}let t=this[Symbol.metadata];if(t!==null){let e=litPropertyMetadata.get(t);if(e!==void 0)for(let[s,i]of e)this.elementProperties.set(s,i)}this._$Eh=new Map;for(let[e,s]of this.elementProperties){let i=this._$Eu(e,s);i!==void 0&&this._$Eh.set(i,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){let e=[];if(Array.isArray(t)){let s=new Set(t.flat(1/0).reverse());for(let i of s)e.unshift(Y(i))}else t!==void 0&&e.push(Y(t));return e}static _$Eu(t,e){let s=e.attribute;return s===!1?void 0:typeof s=="string"?s:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){let t=new Map,e=this.constructor.elementProperties;for(let s of e.keys())this.hasOwnProperty(s)&&(t.set(s,this[s]),delete this[s]);t.size>0&&(this._$Ep=t)}createRenderRoot(){let t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return lt(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,s){this._$AK(t,s)}_$ET(t,e){let s=this.constructor.elementProperties.get(t),i=this.constructor._$Eu(t,s);if(i!==void 0&&s.reflect===!0){let o=(s.converter?.toAttribute!==void 0?s.converter:J).toAttribute(e,s.type);this._$Em=t,o==null?this.removeAttribute(i):this.setAttribute(i,o),this._$Em=null}}_$AK(t,e){let s=this.constructor,i=s._$Eh.get(t);if(i!==void 0&&this._$Em!==i){let o=s.getPropertyOptions(i),n=typeof o.converter=="function"?{fromAttribute:o.converter}:o.converter?.fromAttribute!==void 0?o.converter:J;this._$Em=i;let h=n.fromAttribute(e,o.type);this[i]=h??this._$Ej?.get(i)??h,this._$Em=null}}requestUpdate(t,e,s,i=!1,o){if(t!==void 0){let n=this.constructor;if(i===!1&&(o=this[t]),s??=n.getPropertyOptions(t),!((s.hasChanged??dt)(o,e)||s.useDefault&&s.reflect&&o===this._$Ej?.get(t)&&!this.hasAttribute(n._$Eu(t,s))))return;this.C(t,e,s)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,e,{useDefault:s,reflect:i,wrapped:o},n){s&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,n??e??this[t]),o!==!0||n!==void 0)||(this._$AL.has(t)||(this.hasUpdated||s||(e=void 0),this._$AL.set(t,e)),i===!0&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[i,o]of this._$Ep)this[i]=o;this._$Ep=void 0}let s=this.constructor.elementProperties;if(s.size>0)for(let[i,o]of s){let{wrapped:n}=o,h=this[i];n!==!0||this._$AL.has(i)||h===void 0||this.C(i,void 0,o,h)}}let t=!1,e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(s=>s.hostUpdate?.()),this.update(e)):this._$EM()}catch(s){throw t=!1,this._$EM(),s}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(t){}firstUpdated(t){}};b.elementStyles=[],b.shadowRootOptions={mode:"open"},b[k("elementProperties")]=new Map,b[k("finalized")]=new Map,Mt?.({ReactiveElement:b}),(I.reactiveElementVersions??=[]).push("2.1.2");var st=globalThis,ut=r=>r,j=st.trustedTypes,pt=j?j.createPolicy("lit-html",{createHTML:r=>r}):void 0,_t="$lit$",g=`lit$${Math.random().toFixed(9).slice(2)}$`,At="?"+g,Ht=`<${At}>`,A=document,T=()=>A.createComment(""),P=r=>r===null||typeof r!="object"&&typeof r!="function",it=Array.isArray,Ot=r=>it(r)||typeof r?.[Symbol.iterator]=="function",X=`[ 	
\f\r]`,w=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,mt=/-->/g,bt=/>/g,$=RegExp(`>|${X}(?:([^\\s"'>=/]+)(${X}*=${X}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),ft=/'/g,gt=/"/g,yt=/^(?:script|style|textarea|title)$/i,rt=r=>(t,...e)=>({_$litType$:r,strings:t,values:e}),C=rt(1),Xt=rt(2),Gt=rt(3),y=Symbol.for("lit-noChange"),d=Symbol.for("lit-nothing"),$t=new WeakMap,_=A.createTreeWalker(A,129);function vt(r,t){if(!it(r)||!r.hasOwnProperty("raw"))throw Error("invalid template strings array");return pt!==void 0?pt.createHTML(t):t}var Rt=(r,t)=>{let e=r.length-1,s=[],i,o=t===2?"<svg>":t===3?"<math>":"",n=w;for(let h=0;h<e;h++){let a=r[h],c,u,l=-1,m=0;for(;m<a.length&&(n.lastIndex=m,u=n.exec(a),u!==null);)m=n.lastIndex,n===w?u[1]==="!--"?n=mt:u[1]!==void 0?n=bt:u[2]!==void 0?(yt.test(u[2])&&(i=RegExp("</"+u[2],"g")),n=$):u[3]!==void 0&&(n=$):n===$?u[0]===">"?(n=i??w,l=-1):u[1]===void 0?l=-2:(l=n.lastIndex-u[2].length,c=u[1],n=u[3]===void 0?$:u[3]==='"'?gt:ft):n===gt||n===ft?n=$:n===mt||n===bt?n=w:(n=$,i=void 0);let f=n===$&&r[h+1].startsWith("/>")?" ":"";o+=n===w?a+Ht:l>=0?(s.push(c),a.slice(0,l)+_t+a.slice(l)+g+f):a+g+(l===-2?h:f)}return[vt(r,o+(r[e]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),s]},L=class r{constructor({strings:t,_$litType$:e},s){let i;this.parts=[];let o=0,n=0,h=t.length-1,a=this.parts,[c,u]=Rt(t,e);if(this.el=r.createElement(c,s),_.currentNode=this.el.content,e===2||e===3){let l=this.el.content.firstChild;l.replaceWith(...l.childNodes)}for(;(i=_.nextNode())!==null&&a.length<h;){if(i.nodeType===1){if(i.hasAttributes())for(let l of i.getAttributeNames())if(l.endsWith(_t)){let m=u[n++],f=i.getAttribute(l).split(g),M=/([.?@])?(.*)/.exec(m);a.push({type:1,index:o,name:M[2],strings:f,ctor:M[1]==="."?Z:M[1]==="?"?Q:M[1]==="@"?tt:E}),i.removeAttribute(l)}else l.startsWith(g)&&(a.push({type:6,index:o}),i.removeAttribute(l));if(yt.test(i.tagName)){let l=i.textContent.split(g),m=l.length-1;if(m>0){i.textContent=j?j.emptyScript:"";for(let f=0;f<m;f++)i.append(l[f],T()),_.nextNode(),a.push({type:2,index:++o});i.append(l[m],T())}}}else if(i.nodeType===8)if(i.data===At)a.push({type:2,index:o});else{let l=-1;for(;(l=i.data.indexOf(g,l+1))!==-1;)a.push({type:7,index:o}),l+=g.length-1}o++}}static createElement(t,e){let s=A.createElement("template");return s.innerHTML=t,s}};function v(r,t,e=r,s){if(t===y)return t;let i=s!==void 0?e._$Co?.[s]:e._$Cl,o=P(t)?void 0:t._$litDirective$;return i?.constructor!==o&&(i?._$AO?.(!1),o===void 0?i=void 0:(i=new o(r),i._$AT(r,e,s)),s!==void 0?(e._$Co??=[])[s]=i:e._$Cl=i),i!==void 0&&(t=v(r,i._$AS(r,t.values),i,s)),t}var G=class{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){let{el:{content:e},parts:s}=this._$AD,i=(t?.creationScope??A).importNode(e,!0);_.currentNode=i;let o=_.nextNode(),n=0,h=0,a=s[0];for(;a!==void 0;){if(n===a.index){let c;a.type===2?c=new U(o,o.nextSibling,this,t):a.type===1?c=new a.ctor(o,a.name,a.strings,this,t):a.type===6&&(c=new et(o,this,t)),this._$AV.push(c),a=s[++h]}n!==a?.index&&(o=_.nextNode(),n++)}return _.currentNode=A,i}p(t){let e=0;for(let s of this._$AV)s!==void 0&&(s.strings!==void 0?(s._$AI(t,s,e),e+=s.strings.length-2):s._$AI(t[e])),e++}},U=class r{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,s,i){this.type=2,this._$AH=d,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=s,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode,e=this._$AM;return e!==void 0&&t?.nodeType===11&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=v(this,t,e),P(t)?t===d||t==null||t===""?(this._$AH!==d&&this._$AR(),this._$AH=d):t!==this._$AH&&t!==y&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):Ot(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==d&&P(this._$AH)?this._$AA.nextSibling.data=t:this.T(A.createTextNode(t)),this._$AH=t}$(t){let{values:e,_$litType$:s}=t,i=typeof s=="number"?this._$AC(t):(s.el===void 0&&(s.el=L.createElement(vt(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===i)this._$AH.p(e);else{let o=new G(i,this),n=o.u(this.options);o.p(e),this.T(n),this._$AH=o}}_$AC(t){let e=$t.get(t.strings);return e===void 0&&$t.set(t.strings,e=new L(t)),e}k(t){it(this._$AH)||(this._$AH=[],this._$AR());let e=this._$AH,s,i=0;for(let o of t)i===e.length?e.push(s=new r(this.O(T()),this.O(T()),this,this.options)):s=e[i],s._$AI(o),i++;i<e.length&&(this._$AR(s&&s._$AB.nextSibling,i),e.length=i)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){let s=ut(t).nextSibling;ut(t).remove(),t=s}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}},E=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,s,i,o){this.type=1,this._$AH=d,this._$AN=void 0,this.element=t,this.name=e,this._$AM=i,this.options=o,s.length>2||s[0]!==""||s[1]!==""?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=d}_$AI(t,e=this,s,i){let o=this.strings,n=!1;if(o===void 0)t=v(this,t,e,0),n=!P(t)||t!==this._$AH&&t!==y,n&&(this._$AH=t);else{let h=t,a,c;for(t=o[0],a=0;a<o.length-1;a++)c=v(this,h[s+a],e,a),c===y&&(c=this._$AH[a]),n||=!P(c)||c!==this._$AH[a],c===d?t=d:t!==d&&(t+=(c??"")+o[a+1]),this._$AH[a]=c}n&&!i&&this.j(t)}j(t){t===d?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}},Z=class extends E{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===d?void 0:t}},Q=class extends E{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==d)}},tt=class extends E{constructor(t,e,s,i,o){super(t,e,s,i,o),this.type=5}_$AI(t,e=this){if((t=v(this,t,e,0)??d)===y)return;let s=this._$AH,i=t===d&&s!==d||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,o=t!==d&&(s===d||i);i&&this.element.removeEventListener(this.name,this,s),o&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}},et=class{constructor(t,e,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(t){v(this,t)}};var Nt=st.litHtmlPolyfillSupport;Nt?.(L,U),(st.litHtmlVersions??=[]).push("3.3.3");var Et=(r,t,e)=>{let s=e?.renderBefore??t,i=s._$litPart$;if(i===void 0){let o=e?.renderBefore??null;s._$litPart$=i=new U(t.insertBefore(T(),o),o,void 0,e??{})}return i._$AI(r),i};var ot=globalThis,p=class extends b{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){let e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=Et(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return y}};p._$litElement$=!0,p.finalized=!0,ot.litElementHydrateSupport?.({LitElement:p});var Dt=ot.litElementPolyfillSupport;Dt?.({LitElement:p});(ot.litElementVersions??=[]).push("4.2.2");var q=class extends HTMLElement{};customElements.get("hs-tab-panel")||customElements.define("hs-tab-panel",q);var V=class extends p{static properties={selected:{type:Number,reflect:!0},activation:{type:String,reflect:!0},_labels:{state:!0}};static styles=x`
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
      gap: var(--p-space-xs, 0.25rem);
      border-block-end: 1px solid var(--color-border-default, currentColor);
      overflow-x: auto;
    }

    button {
      flex-shrink: 0;
      background: none;
      border: none;
      border-block-end: 2px solid transparent;
      margin-block-end: -1px;
      padding: var(--space-component, 0.5rem) var(--space-inline, 1rem);
      font: inherit;
      color: var(--color-text-secondary, currentColor);
      cursor: pointer;
      transition: color 0.2s ease, border-color 0.2s ease;
    }

    button[aria-selected='true'] {
      color: var(--color-action-primary, currentColor);
      border-block-end-color: var(--color-action-primary, currentColor);
    }

    button:focus-visible {
      outline: 2px solid var(--color-action-primary, currentColor);
      outline-offset: -2px;
    }

    [part='panel'] {
      padding-block-start: var(--space-block, 1.5rem);
    }

    @media (prefers-reduced-motion: reduce) {
      button {
        transition-duration: 0.01ms;
      }
    }
  `;#t=[];constructor(){super(),this.selected=0,this.activation="auto",this._labels=[]}get panels(){return this.#t}#e=()=>{this.#t=[...this.querySelectorAll(":scope > hs-tab-panel")],this.#t.forEach((t,e)=>t.setAttribute("slot",`panel-${e}`)),this._labels=this.#t.map((t,e)=>t.getAttribute("label")||`Tab ${e+1}`),this.selected>=this._labels.length&&(this.selected=0)};#s(t,{focus:e=!1}={}){t===this.selected||t<0||t>=this._labels.length||(this.selected=t,e&&this.#i(t),this.dispatchEvent(new CustomEvent("hs-tab-change",{bubbles:!0,detail:{index:t,label:this._labels[t]}})))}#i(t){this.updateComplete.then(()=>{this.renderRoot.querySelectorAll("button")[t]?.focus()})}#r=t=>{let e=this._labels.length-1,s=Number(t.currentTarget.dataset.index),i=null;switch(t.key){case"ArrowRight":i=s===e?0:s+1;break;case"ArrowLeft":i=s===0?e:s-1;break;case"Home":i=0;break;case"End":i=e;break;case"Enter":case" ":t.preventDefault(),this.#s(s);return;default:return}t.preventDefault(),this.activation==="manual"?(this.#i(i),this.renderRoot.querySelectorAll("button")[i]?.focus()):this.#s(i,{focus:!0})};render(){return C`
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
              @click=${()=>this.#s(e)}
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
    `}};customElements.define("hs-tabs",V);var Bt="theme",zt="Toggle colour scheme",W=class extends HTMLElement{static observedAttributes=["label"];#t=null;connectedCallback(){this.#t||(this.#t=document.createElement("button"),this.#t.type="button",this.#t.addEventListener("click",()=>this.toggle()),this.append(this.#t)),this.#e()}attributeChangedCallback(){this.isConnected&&this.#e()}get scheme(){let t=document.documentElement.style.colorScheme;return t==="light"||t==="dark"?t:matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}set scheme(t){if(!(t!=="light"&&t!=="dark")){document.documentElement.style.colorScheme=t;try{localStorage.setItem(Bt,t)}catch{}this.#e(),this.dispatchEvent(new CustomEvent("hs-theme-change",{bubbles:!0,detail:{scheme:t}}))}}toggle(){this.scheme=this.scheme==="dark"?"light":"dark"}#e(){if(!this.#t)return;let t=this.scheme==="dark";this.#t.setAttribute("aria-label",this.getAttribute("label")||zt),this.#t.setAttribute("aria-pressed",String(t)),this.#t.textContent=t?"\u263E":"\u2600"}};customElements.define("hs-theme-toggle",W);var K=class extends p{static formAssociated=!0;static properties={checked:{type:Boolean,reflect:!0},disabled:{type:Boolean,reflect:!0},name:{type:String},value:{type:String}};static styles=x`
    /* The global reset does not cross the shadow boundary, so the component
       restates it. Without this, .track is content-box and its padding adds to
       the declared size — which shows up as a layout shift when the element
       upgrades. Every shadow component needs its own reset. */
    *,
    *::before,
    *::after {
      box-sizing: border-box;
    }

    :host {
      display: inline-flex;
      align-items: center;
      gap: var(--space-component, 0.5rem);
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }

    :host([disabled]) {
      cursor: not-allowed;
      opacity: 0.5;
    }

    :host(:focus-visible) {
      outline: 2px solid var(--color-action-primary, currentColor);
      outline-offset: 2px;
      border-radius: var(--p-radius-sm, 0.25rem);
    }

    .track {
      /* The thumb is a <span>, so it stays display:inline and ignores its own
         size unless its parent lays it out. The track escapes that only because
         it is a flex item of :host; the thumb has no such rescue. */
      display: flex;
      align-items: center;
      flex-shrink: 0;
      inline-size: 2.5rem;
      block-size: 1.5rem;
      padding: 0.1875rem;
      border-radius: var(--p-radius-full, 9999px);
      background: var(--color-border-emphasis, currentColor);
      transition: background 0.2s ease;
    }

    :host([checked]) .track {
      background: var(--color-action-primary, currentColor);
    }

    .thumb {
      inline-size: 1.125rem;
      block-size: 1.125rem;
      border-radius: var(--p-radius-full, 9999px);
      background: var(--color-surface-elevated, #fff);
      transition: translate 0.2s ease;
    }

    :host([checked]) .thumb {
      translate: 1rem 0;
    }

    /* The framework's global reduced-motion rule cannot reach into a shadow
       root, so each component repeats it for its own internals. */
    @media (prefers-reduced-motion: reduce) {
      .track,
      .thumb {
        transition-duration: 0.01ms;
      }
    }
  `;#t;#e=!1;constructor(){super(),this.checked=!1,this.disabled=!1,this.value="on",this.#t=this.attachInternals(),this.#t.role="switch"}connectedCallback(){super.connectedCallback(),this.#e=this.hasAttribute("checked"),this.#t.setFormValue(this.checked?this.value:null),this.hasAttribute("tabindex")||(this.tabIndex=this.disabled?-1:0),this.addEventListener("click",this.#s),this.addEventListener("keydown",this.#i)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("click",this.#s),this.removeEventListener("keydown",this.#i)}willUpdate(){this.#t.ariaChecked=String(this.checked),this.#t.ariaDisabled=String(this.disabled),this.disabled?this.setAttribute("aria-disabled","true"):this.removeAttribute("aria-disabled"),this.#t.setFormValue(this.checked?this.value:null),(!this.hasAttribute("tabindex")||this.tabIndex>=0||this.disabled)&&(this.tabIndex=this.disabled?-1:0)}#s=()=>this.toggle();#i=t=>{t.key!==" "&&t.key!=="Enter"||(t.preventDefault(),this.toggle())};toggle(){this.disabled||(this.checked=!this.checked,this.dispatchEvent(new Event("change",{bubbles:!0})))}formResetCallback(){this.checked=this.#e}formStateRestoreCallback(t){this.checked=t!==null}render(){return C`
      <span class="track" part="track" aria-hidden="true">
        <span class="thumb" part="thumb"></span>
      </span>
      <slot></slot>
    `}};customElements.define("hs-toggle",K);export{H as HsAccordion,O as HsAlert,R as HsBadge,N as HsCard,D as HsDialog,q as HsTabPanel,V as HsTabs,W as HsThemeToggle,K as HsToggle};
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

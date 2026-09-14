/*! html.style components - MIT - https://html.style */
var It=0,U=class extends HTMLElement{static observedAttributes=["exclusive"];#t="";#e=null;connectedCallback(){this.#t||(this.#t=`hs-accordion-${++It}`),this.#e=new MutationObserver(()=>this.#s()),this.#e.observe(this,{childList:!0}),this.addEventListener("toggle",this.#i,!0),this.#s()}disconnectedCallback(){this.#e?.disconnect(),this.#e=null,this.removeEventListener("toggle",this.#i,!0)}attributeChangedCallback(){this.isConnected&&this.#s()}get panels(){return[...this.querySelectorAll(":scope > details")]}openAll(){if(!this.hasAttribute("exclusive"))for(let t of this.panels)t.open=!0}closeAll(){for(let t of this.panels)t.open=!1}#s(){let t=this.hasAttribute("exclusive");for(let e of this.panels)t?e.setAttribute("name",this.#t):e.getAttribute("name")===this.#t&&e.removeAttribute("name")}#i=t=>{let e=t.target;e.parentElement===this&&this.dispatchEvent(new CustomEvent("hs-accordion-toggle",{bubbles:!0,detail:{index:this.panels.indexOf(e),open:e.open}}))}};customElements.define("hs-accordion",U);var jt="Dismiss",N=class extends HTMLElement{static observedAttributes=["dismissible","dismiss-label"];connectedCallback(){this.hasAttribute("role")||this.setAttribute("role","alert"),this.#t()}attributeChangedCallback(){this.isConnected&&this.#t()}#t(){let t=this.querySelector(":scope > [data-hs-dismiss]");if(!this.hasAttribute("dismissible")){t?.remove();return}let e=this.getAttribute("dismiss-label")||jt;if(t){t.setAttribute("aria-label",e);return}let s=document.createElement("button");s.type="button",s.setAttribute("data-hs-dismiss",""),s.setAttribute("aria-label",e),s.textContent="\xD7",s.addEventListener("click",()=>this.dismiss()),this.append(s)}dismiss(){this.dispatchEvent(new CustomEvent("hs-dismiss",{bubbles:!0,cancelable:!0}))&&this.remove()}};customElements.define("hs-alert",N);var O=class extends HTMLElement{};customElements.define("hs-badge",O);var D=class extends HTMLElement{};customElements.define("hs-card",D);var z=globalThis,B=z.ShadowRoot&&(z.ShadyCSS===void 0||z.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,ot=Symbol(),gt=new WeakMap,w=class{constructor(t,e,s){if(this._$cssResult$=!0,s!==ot)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o,e=this.t;if(B&&t===void 0){let s=e!==void 0&&e.length===1;s&&(t=gt.get(e)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),s&&gt.set(e,t))}return t}toString(){return this.cssText}},yt=r=>new w(typeof r=="string"?r:r+"",void 0,ot),f=(r,...t)=>{let e=r.length===1?r[0]:t.reduce((s,i,o)=>s+(n=>{if(n._$cssResult$===!0)return n.cssText;if(typeof n=="number")return n;throw Error("Value passed to 'css' function must be a 'css' function result: "+n+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+r[o+1],r[0]);return new w(e,r,ot)},At=(r,t)=>{if(B)r.adoptedStyleSheets=t.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let e of t){let s=document.createElement("style"),i=z.litNonce;i!==void 0&&s.setAttribute("nonce",i),s.textContent=e.cssText,r.appendChild(s)}},nt=B?r=>r:r=>r instanceof CSSStyleSheet?(t=>{let e="";for(let s of t.cssRules)e+=s.cssText;return yt(e)})(r):r;var{is:Ft,defineProperty:Vt,getOwnPropertyDescriptor:Wt,getOwnPropertyNames:Kt,getOwnPropertySymbols:Yt,getPrototypeOf:Gt}=Object,q=globalThis,_t=q.trustedTypes,Jt=_t?_t.emptyScript:"",Xt=q.reactiveElementPolyfillSupport,C=(r,t)=>r,at={toAttribute(r,t){switch(t){case Boolean:r=r?Jt:null;break;case Object:case Array:r=r==null?r:JSON.stringify(r)}return r},fromAttribute(r,t){let e=r;switch(t){case Boolean:e=r!==null;break;case Number:e=r===null?null:Number(r);break;case Object:case Array:try{e=JSON.parse(r)}catch{e=null}}return e}},$t=(r,t)=>!Ft(r,t),Et={attribute:!0,type:String,converter:at,reflect:!1,useDefault:!1,hasChanged:$t};Symbol.metadata??=Symbol("metadata"),q.litPropertyMetadata??=new WeakMap;var v=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=Et){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){let s=Symbol(),i=this.getPropertyDescriptor(t,s,e);i!==void 0&&Vt(this.prototype,t,i)}}static getPropertyDescriptor(t,e,s){let{get:i,set:o}=Wt(this.prototype,t)??{get(){return this[e]},set(n){this[e]=n}};return{get:i,set(n){let h=i?.call(this);o?.call(this,n),this.requestUpdate(t,h,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??Et}static _$Ei(){if(this.hasOwnProperty(C("elementProperties")))return;let t=Gt(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(C("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(C("properties"))){let e=this.properties,s=[...Kt(e),...Yt(e)];for(let i of s)this.createProperty(i,e[i])}let t=this[Symbol.metadata];if(t!==null){let e=litPropertyMetadata.get(t);if(e!==void 0)for(let[s,i]of e)this.elementProperties.set(s,i)}this._$Eh=new Map;for(let[e,s]of this.elementProperties){let i=this._$Eu(e,s);i!==void 0&&this._$Eh.set(i,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){let e=[];if(Array.isArray(t)){let s=new Set(t.flat(1/0).reverse());for(let i of s)e.unshift(nt(i))}else t!==void 0&&e.push(nt(t));return e}static _$Eu(t,e){let s=e.attribute;return s===!1?void 0:typeof s=="string"?s:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){let t=new Map,e=this.constructor.elementProperties;for(let s of e.keys())this.hasOwnProperty(s)&&(t.set(s,this[s]),delete this[s]);t.size>0&&(this._$Ep=t)}createRenderRoot(){let t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return At(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,s){this._$AK(t,s)}_$ET(t,e){let s=this.constructor.elementProperties.get(t),i=this.constructor._$Eu(t,s);if(i!==void 0&&s.reflect===!0){let o=(s.converter?.toAttribute!==void 0?s.converter:at).toAttribute(e,s.type);this._$Em=t,o==null?this.removeAttribute(i):this.setAttribute(i,o),this._$Em=null}}_$AK(t,e){let s=this.constructor,i=s._$Eh.get(t);if(i!==void 0&&this._$Em!==i){let o=s.getPropertyOptions(i),n=typeof o.converter=="function"?{fromAttribute:o.converter}:o.converter?.fromAttribute!==void 0?o.converter:at;this._$Em=i;let h=n.fromAttribute(e,o.type);this[i]=h??this._$Ej?.get(i)??h,this._$Em=null}}requestUpdate(t,e,s,i=!1,o){if(t!==void 0){let n=this.constructor;if(i===!1&&(o=this[t]),s??=n.getPropertyOptions(t),!((s.hasChanged??$t)(o,e)||s.useDefault&&s.reflect&&o===this._$Ej?.get(t)&&!this.hasAttribute(n._$Eu(t,s))))return;this.C(t,e,s)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,e,{useDefault:s,reflect:i,wrapped:o},n){s&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,n??e??this[t]),o!==!0||n!==void 0)||(this._$AL.has(t)||(this.hasUpdated||s||(e=void 0),this._$AL.set(t,e)),i===!0&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[i,o]of this._$Ep)this[i]=o;this._$Ep=void 0}let s=this.constructor.elementProperties;if(s.size>0)for(let[i,o]of s){let{wrapped:n}=o,h=this[i];n!==!0||this._$AL.has(i)||h===void 0||this.C(i,void 0,o,h)}}let t=!1,e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(s=>s.hostUpdate?.()),this.update(e)):this._$EM()}catch(s){throw t=!1,this._$EM(),s}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(t){}firstUpdated(t){}};v.elementStyles=[],v.shadowRootOptions={mode:"open"},v[C("elementProperties")]=new Map,v[C("finalized")]=new Map,Xt?.({ReactiveElement:v}),(q.reactiveElementVersions??=[]).push("2.1.2");var bt=globalThis,xt=r=>r,I=bt.trustedTypes,kt=I?I.createPolicy("lit-html",{createHTML:r=>r}):void 0,Pt="$lit$",y=`lit$${Math.random().toFixed(9).slice(2)}$`,Ht="?"+y,Zt=`<${Ht}>`,E=document,T=()=>E.createComment(""),L=r=>r===null||typeof r!="object"&&typeof r!="function",mt=Array.isArray,Qt=r=>mt(r)||typeof r?.[Symbol.iterator]=="function",ht=`[ 	
\f\r]`,S=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,wt=/-->/g,Ct=/>/g,A=RegExp(`>|${ht}(?:([^\\s"'>=/]+)(${ht}*=${ht}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),St=/'/g,Tt=/"/g,Mt=/^(?:script|style|textarea|title)$/i,ft=r=>(t,...e)=>({_$litType$:r,strings:t,values:e}),p=ft(1),Se=ft(2),Te=ft(3),$=Symbol.for("lit-noChange"),u=Symbol.for("lit-nothing"),Lt=new WeakMap,_=E.createTreeWalker(E,129);function Rt(r,t){if(!mt(r)||!r.hasOwnProperty("raw"))throw Error("invalid template strings array");return kt!==void 0?kt.createHTML(t):t}var te=(r,t)=>{let e=r.length-1,s=[],i,o=t===2?"<svg>":t===3?"<math>":"",n=S;for(let h=0;h<e;h++){let a=r[h],l,d,c=-1,m=0;for(;m<a.length&&(n.lastIndex=m,d=n.exec(a),d!==null);)m=n.lastIndex,n===S?d[1]==="!--"?n=wt:d[1]!==void 0?n=Ct:d[2]!==void 0?(Mt.test(d[2])&&(i=RegExp("</"+d[2],"g")),n=A):d[3]!==void 0&&(n=A):n===A?d[0]===">"?(n=i??S,c=-1):d[1]===void 0?c=-2:(c=n.lastIndex-d[2].length,l=d[1],n=d[3]===void 0?A:d[3]==='"'?Tt:St):n===Tt||n===St?n=A:n===wt||n===Ct?n=S:(n=A,i=void 0);let g=n===A&&r[h+1].startsWith("/>")?" ":"";o+=n===S?a+Zt:c>=0?(s.push(l),a.slice(0,c)+Pt+a.slice(c)+y+g):a+y+(c===-2?h:g)}return[Rt(r,o+(r[e]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),s]},P=class r{constructor({strings:t,_$litType$:e},s){let i;this.parts=[];let o=0,n=0,h=t.length-1,a=this.parts,[l,d]=te(t,e);if(this.el=r.createElement(l,s),_.currentNode=this.el.content,e===2||e===3){let c=this.el.content.firstChild;c.replaceWith(...c.childNodes)}for(;(i=_.nextNode())!==null&&a.length<h;){if(i.nodeType===1){if(i.hasAttributes())for(let c of i.getAttributeNames())if(c.endsWith(Pt)){let m=d[n++],g=i.getAttribute(c).split(y),R=/([.?@])?(.*)/.exec(m);a.push({type:1,index:o,name:R[2],strings:g,ctor:R[1]==="."?ct:R[1]==="?"?dt:R[1]==="@"?ut:k}),i.removeAttribute(c)}else c.startsWith(y)&&(a.push({type:6,index:o}),i.removeAttribute(c));if(Mt.test(i.tagName)){let c=i.textContent.split(y),m=c.length-1;if(m>0){i.textContent=I?I.emptyScript:"";for(let g=0;g<m;g++)i.append(c[g],T()),_.nextNode(),a.push({type:2,index:++o});i.append(c[m],T())}}}else if(i.nodeType===8)if(i.data===Ht)a.push({type:2,index:o});else{let c=-1;for(;(c=i.data.indexOf(y,c+1))!==-1;)a.push({type:7,index:o}),c+=y.length-1}o++}}static createElement(t,e){let s=E.createElement("template");return s.innerHTML=t,s}};function x(r,t,e=r,s){if(t===$)return t;let i=s!==void 0?e._$Co?.[s]:e._$Cl,o=L(t)?void 0:t._$litDirective$;return i?.constructor!==o&&(i?._$AO?.(!1),o===void 0?i=void 0:(i=new o(r),i._$AT(r,e,s)),s!==void 0?(e._$Co??=[])[s]=i:e._$Cl=i),i!==void 0&&(t=x(r,i._$AS(r,t.values),i,s)),t}var lt=class{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){let{el:{content:e},parts:s}=this._$AD,i=(t?.creationScope??E).importNode(e,!0);_.currentNode=i;let o=_.nextNode(),n=0,h=0,a=s[0];for(;a!==void 0;){if(n===a.index){let l;a.type===2?l=new H(o,o.nextSibling,this,t):a.type===1?l=new a.ctor(o,a.name,a.strings,this,t):a.type===6&&(l=new pt(o,this,t)),this._$AV.push(l),a=s[++h]}n!==a?.index&&(o=_.nextNode(),n++)}return _.currentNode=E,i}p(t){let e=0;for(let s of this._$AV)s!==void 0&&(s.strings!==void 0?(s._$AI(t,s,e),e+=s.strings.length-2):s._$AI(t[e])),e++}},H=class r{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,s,i){this.type=2,this._$AH=u,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=s,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode,e=this._$AM;return e!==void 0&&t?.nodeType===11&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=x(this,t,e),L(t)?t===u||t==null||t===""?(this._$AH!==u&&this._$AR(),this._$AH=u):t!==this._$AH&&t!==$&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):Qt(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==u&&L(this._$AH)?this._$AA.nextSibling.data=t:this.T(E.createTextNode(t)),this._$AH=t}$(t){let{values:e,_$litType$:s}=t,i=typeof s=="number"?this._$AC(t):(s.el===void 0&&(s.el=P.createElement(Rt(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===i)this._$AH.p(e);else{let o=new lt(i,this),n=o.u(this.options);o.p(e),this.T(n),this._$AH=o}}_$AC(t){let e=Lt.get(t.strings);return e===void 0&&Lt.set(t.strings,e=new P(t)),e}k(t){mt(this._$AH)||(this._$AH=[],this._$AR());let e=this._$AH,s,i=0;for(let o of t)i===e.length?e.push(s=new r(this.O(T()),this.O(T()),this,this.options)):s=e[i],s._$AI(o),i++;i<e.length&&(this._$AR(s&&s._$AB.nextSibling,i),e.length=i)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){let s=xt(t).nextSibling;xt(t).remove(),t=s}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}},k=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,s,i,o){this.type=1,this._$AH=u,this._$AN=void 0,this.element=t,this.name=e,this._$AM=i,this.options=o,s.length>2||s[0]!==""||s[1]!==""?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=u}_$AI(t,e=this,s,i){let o=this.strings,n=!1;if(o===void 0)t=x(this,t,e,0),n=!L(t)||t!==this._$AH&&t!==$,n&&(this._$AH=t);else{let h=t,a,l;for(t=o[0],a=0;a<o.length-1;a++)l=x(this,h[s+a],e,a),l===$&&(l=this._$AH[a]),n||=!L(l)||l!==this._$AH[a],l===u?t=u:t!==u&&(t+=(l??"")+o[a+1]),this._$AH[a]=l}n&&!i&&this.j(t)}j(t){t===u?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}},ct=class extends k{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===u?void 0:t}},dt=class extends k{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==u)}},ut=class extends k{constructor(t,e,s,i,o){super(t,e,s,i,o),this.type=5}_$AI(t,e=this){if((t=x(this,t,e,0)??u)===$)return;let s=this._$AH,i=t===u&&s!==u||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,o=t!==u&&(s===u||i);i&&this.element.removeEventListener(this.name,this,s),o&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}},pt=class{constructor(t,e,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(t){x(this,t)}};var ee=bt.litHtmlPolyfillSupport;ee?.(P,H),(bt.litHtmlVersions??=[]).push("3.3.3");var Ut=(r,t,e)=>{let s=e?.renderBefore??t,i=s._$litPart$;if(i===void 0){let o=e?.renderBefore??null;s._$litPart$=i=new H(t.insertBefore(T(),o),o,void 0,e??{})}return i._$AI(r),i};var vt=globalThis,b=class extends v{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){let e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=Ut(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return $}};b._$litElement$=!0,b.finalized=!0,vt.litElementHydrateSupport?.({LitElement:b});var se=vt.litElementPolyfillSupport;se?.({LitElement:b});(vt.litElementVersions??=[]).push("4.2.2");var j=class extends HTMLElement{};customElements.get("hs-option")||customElements.define("hs-option",j);var F=class extends b{static formAssociated=!0;static properties={name:{type:String},value:{type:String,reflect:!0},label:{type:String},placeholder:{type:String},disabled:{type:Boolean,reflect:!0},open:{type:Boolean,reflect:!0},_query:{state:!0,attribute:!1},_active:{state:!0,attribute:!1},_options:{state:!0,attribute:!1}};static styles=f`
    /* The global reset does not cross the shadow boundary, so the component
       restates it. Without this the input is content-box and its padding adds
       to the declared width, which surfaces as a layout shift on upgrade. */
    *,
    *::before,
    *::after {
      box-sizing: border-box;
    }

    /* Every dimension and colour is a custom property with a default, so a
       consumer can resize or recolour without ::part() surgery — which would
       otherwise lose to the sizes declared in here. */
    :host {
      --_radius: var(--hs-combobox-radius, var(--p-radius-md, 0.375rem));
      --_border: var(--hs-combobox-border-color, var(--color-border-default, currentColor));
      --_bg: var(--hs-combobox-background, var(--color-surface-elevated, #fff));

      /* The listbox is absolutely positioned against this, which is why the
         host is a containing block. See docs/positioning.md for why it is not
         a popover. */
      position: relative;
      display: inline-flex;
      flex-direction: column;
      gap: var(--hs-combobox-gap, var(--space-component, 0.5rem));
      inline-size: var(--hs-combobox-inline-size, 100%);
      color: var(--hs-combobox-color, var(--color-text-primary, currentColor));
    }

    :host([disabled]) {
      cursor: not-allowed;
      opacity: 0.5;
    }

    label {
      font-weight: 500;
    }

    input {
      inline-size: 100%;
      padding-block: var(--hs-combobox-padding-block, 0.5rem);
      padding-inline: var(--hs-combobox-padding-inline, 0.75rem);
      border: var(--border-width, 1px) solid var(--_border);
      border-radius: var(--_radius);
      background: var(--_bg);
      color: inherit;
      font: inherit;
    }

    input:focus-visible {
      outline: var(--focus-ring-width, 2px) solid
        var(--focus-ring-color, var(--color-action-primary, currentColor));
      outline-offset: var(--focus-ring-offset, 2px);
    }

    .listbox {
      position: absolute;
      inset-block-start: 100%;
      inset-inline: 0;
      z-index: var(--p-layer-raised, 10);
      margin-block-start: var(--space-component, 0.5rem);
      max-block-size: var(--hs-combobox-listbox-max-block-size, 16rem);
      overflow-y: auto;
      padding: 0;
      border: var(--border-width, 1px) solid var(--_border);
      border-radius: var(--_radius);
      background: var(--_bg);
      box-shadow: var(--p-shadow-md, none);
      list-style: none;
    }

    /* Closed is absent from the accessibility tree, not merely invisible. */
    :host(:not([open])) .listbox {
      display: none;
    }

    .option {
      padding-block: var(--hs-combobox-padding-block, 0.5rem);
      padding-inline: var(--hs-combobox-padding-inline, 0.75rem);
      cursor: pointer;
    }

    .option[aria-selected='true'],
    .option.is-active {
      background: var(--hs-combobox-option-background-active, var(--color-surface-sunken, currentColor));
    }

    /* An empty list with no message is a dead end for a screen reader user, so
       the listbox always says something. */
    .empty {
      padding-block: var(--hs-combobox-padding-block, 0.5rem);
      padding-inline: var(--hs-combobox-padding-inline, 0.75rem);
      color: var(--hs-combobox-empty-color, var(--color-text-secondary, currentColor));
    }

    /* No reduced-motion block. --motion-duration is a custom property and
       custom properties inherit THROUGH the shadow boundary, so collapsing it
       on :root reaches this component. */
  `;#t;#e="";#s="";constructor(){super(),this.value="",this.label="",this.placeholder="",this.disabled=!1,this.open=!1,this._query=null,this._active=-1,this._options=[],this.#t=this.attachInternals()}connectedCallback(){super.connectedCallback(),this.#e=this.getAttribute("value")??"",this.#i(),this.#t.setFormValue(this.value||null)}#i(){this._options=[...this.querySelectorAll("hs-option")].map((t,e)=>({index:e,value:t.getAttribute("value")??t.textContent.trim(),text:t.textContent.trim()}))}get#r(){if(this._query===null||this._query==="")return this._options;let t=this._query.toLowerCase();return this._options.filter(e=>e.text.toLowerCase().includes(t))}get#o(){return this._query!==null?this._query:this._options.find(t=>t.value===this.value)?.text??""}willUpdate(){this.#t.setFormValue(this.value||null),this.#t.ariaDisabled=String(this.disabled),this.disabled?this.setAttribute("aria-disabled","true"):this.removeAttribute("aria-disabled")}#a(){this.open||this.disabled||(this.open=!0,this.dispatchEvent(new Event("hs-open",{bubbles:!0})))}#n(){this.open&&(this.open=!1,this._active=-1,this.dispatchEvent(new Event("hs-close",{bubbles:!0})))}#h=()=>{this.#s=this.value};#p=t=>{this._query=t.target.value,this._active=this.#r.length>0?this.#r[0].index:-1,this.#a()};#c=t=>{let e=this.#r,s=i=>e.findIndex(o=>o.index===i);switch(t.key){case"ArrowDown":case"ArrowUp":{if(t.preventDefault(),!this.open){this.#a(),e.length>0&&(this._active=e[0].index);return}if(e.length===0)return;let i=t.key==="ArrowDown"?1:-1,n=(s(this._active)+i+e.length)%e.length;this._active=e[n].index;return}case"Home":case"End":if(!this.open||e.length===0)return;t.preventDefault(),this._active=(t.key==="Home"?e[0]:e.at(-1)).index;return;case"Enter":{if(!this.open||this._active<0)return;t.preventDefault(),this.#b(this._active);return}case"Escape":if(!this.open)return;t.preventDefault(),this.#u();return;case"Tab":this.#l();return;default:}};#d=()=>this.#l();#l(){this._query=null,this.#n()}#u(){this._query=null,this.value!==this.#s&&(this.value=this.#s),this.#n()}#b(t){let e=this._options[t];if(!e||e.value===this.value){this.#l();return}this.value=e.value,this.#s=e.value,this._query=null,this.#n(),this.dispatchEvent(new Event("change",{bubbles:!0}))}formResetCallback(){this.value=this.#e,this._query=null,this.#n()}formStateRestoreCallback(t){this.value=t??""}refresh(){this.#i()}render(){let t=this.#r;return p`
      ${this.label?p`<label part="label" for="input">${this.label}</label>`:null}
      <input
        id="input"
        part="input"
        type="text"
        role="combobox"
        autocomplete="off"
        aria-expanded=${this.open?"true":"false"}
        aria-controls="listbox"
        aria-autocomplete="list"
        aria-activedescendant=${this.open&&this._active>=0?`option-${this._active}`:""}
        ?disabled=${this.disabled}
        placeholder=${this.placeholder}
        .value=${this.#o}
        @focus=${this.#h}
        @input=${this.#p}
        @keydown=${this.#c}
        @blur=${this.#d}
      />
      <ul id="listbox" part="listbox" class="listbox" role="listbox">
        ${t.length===0?p`<li class="empty" role="presentation">No matches</li>`:t.map(e=>p`
                <li
                  id="option-${e.index}"
                  part=${e.index===this._active?"option option-active":"option"}
                  class="option ${e.index===this._active?"is-active":""}"
                  role="option"
                  aria-selected=${e.value===this.value?"true":"false"}
                  @mousedown=${s=>{s.preventDefault(),this.#b(e.index)}}
                >
                  ${e.text}
                </li>
              `)}
      </ul>
    `}};customElements.define("hs-combobox",F);var ie="Copied";var V=class extends HTMLElement{#t=null;#e=null;#s="";#i=0;connectedCallback(){this.#t||(this.#s=this.textContent.trim()||"Copy",this.#t=document.createElement("button"),this.#t.type="button",this.#t.textContent=this.#s,this.#t.addEventListener("click",()=>this.copy()),this.#e=document.createElement("span"),this.#e.className="visually-hidden",this.#e.setAttribute("role","status"),this.replaceChildren(this.#t,this.#e))}disconnectedCallback(){clearTimeout(this.#i)}get text(){let t=this.getAttribute("for");return t?document.getElementById(t)?.textContent??"":this.getAttribute("value")??""}async copy(){let t=this.text;if(t){try{await navigator.clipboard.writeText(t)}catch(e){this.dispatchEvent(new CustomEvent("hs-copy-error",{bubbles:!0,detail:{error:e}}));return}this.#r(),this.dispatchEvent(new CustomEvent("hs-copy",{bubbles:!0,detail:{text:t}}))}}#r(){let t=this.getAttribute("copied-label")||ie;this.#e.textContent=t,this.setAttribute("data-copied",""),clearTimeout(this.#i),this.#i=setTimeout(()=>{this.removeAttribute("data-copied"),this.#e.textContent=""},2e3)}};customElements.define("hs-copy",V);var W=class r extends HTMLElement{static observedAttributes=["open","persistent"];static#t="closedBy"in HTMLDialogElement.prototype;#e=null;connectedCallback(){this.#e||(this.#e=document.createElement("dialog"),this.#e.append(...this.childNodes),this.append(this.#e),this.#e.addEventListener("close",this.#i),r.#t||this.#e.addEventListener("click",this.#r)),this.#s(),this.hasAttribute("open")&&this.show()}attributeChangedCallback(t,e,s){if(!(!this.isConnected||e===s)){if(t==="persistent"){this.#s();return}t==="open"&&(s===null?this.close():this.show())}}#s(){!r.#t||!this.#e||(this.#e.closedBy=this.hasAttribute("persistent")?"closerequest":"any")}get dialog(){return this.#e}get open(){return this.hasAttribute("open")}set open(t){this.toggleAttribute("open",!!t)}show(){!this.#e||this.#e.open||(this.#e.showModal(),this.hasAttribute("open")||this.setAttribute("open",""),this.dispatchEvent(new CustomEvent("hs-open",{bubbles:!0})))}close(t){this.#e?.open&&this.#e.close(t)}#i=()=>{this.removeAttribute("open"),this.dispatchEvent(new CustomEvent("hs-close",{bubbles:!0,detail:{returnValue:this.#e.returnValue}}))};#r=t=>{if(this.hasAttribute("persistent")||t.target!==this.#e)return;let e=this.#e.getBoundingClientRect();t.clientX>=e.left&&t.clientX<=e.right&&t.clientY>=e.top&&t.clientY<=e.bottom||this.close("backdrop")}};customElements.define("hs-dialog",W);var re=0,K=class extends HTMLElement{static observedAttributes=["label","hint"];#t=null;#e=null;#s=null;#i=null;#r="";connectedCallback(){this.#t=this.querySelector("input, select, textarea"),this.#t&&(this.#r||(this.#r=this.#t.id||`hs-field-${++re}`),this.#t.id=this.#r,this.#o(),this.#a(),this.#n(),this.#h(),this.addEventListener("invalid",this.#d,!0),this.#t.addEventListener("blur",this.#l),this.#t.addEventListener("input",this.#u))}disconnectedCallback(){this.removeEventListener("invalid",this.#d,!0),this.#t?.removeEventListener("blur",this.#l),this.#t?.removeEventListener("input",this.#u)}attributeChangedCallback(){!this.isConnected||!this.#t||(this.#o(),this.#a(),this.#h())}get control(){return this.#t}#o(){let t=this.querySelector(":scope > label");if(t&&t!==this.#e){t.hasAttribute("for")||t.setAttribute("for",this.#r);return}let e=this.getAttribute("label");if(!e){this.#e?.remove(),this.#e=null;return}this.#e||(this.#e=document.createElement("label"),this.#t.before(this.#e)),this.#e.setAttribute("for",this.#r),this.#e.textContent=e}#a(){let t=this.getAttribute("hint");if(!t){this.#s?.remove(),this.#s=null;return}this.#s||(this.#s=document.createElement("p"),this.#s.id=`${this.#r}-hint`,this.#s.setAttribute("data-hs-hint",""),this.#t.after(this.#s)),this.#s.textContent=t}#n(){this.#i||(this.#i=document.createElement("p"),this.#i.id=`${this.#r}-error`,this.#i.setAttribute("data-hs-error",""),this.#i.setAttribute("role","alert"),this.#i.hidden=!0,(this.#s??this.#t).after(this.#i))}#h(){let t=[];this.#s&&t.push(this.#s.id),this.#i&&!this.#i.hidden&&t.push(this.#i.id);let e=new Set([`${this.#r}-hint`,`${this.#r}-error`]),i=[...(this.#t.getAttribute("aria-describedby")??"").split(/\s+/).filter(o=>o&&!e.has(o)),...t];i.length?this.#t.setAttribute("aria-describedby",i.join(" ")):this.#t.removeAttribute("aria-describedby")}#p(t){this.hasAttribute("novalidate")||(this.#i.textContent=t,this.#i.hidden=!1,this.#t.setAttribute("aria-invalid","true"),this.#h())}#c(){this.#i.hidden=!0,this.#i.textContent="",this.#t.removeAttribute("aria-invalid"),this.#h()}#d=t=>{t.target===this.#t&&(this.hasAttribute("novalidate")||(t.preventDefault(),this.#p(this.#t.validationMessage),this.dispatchEvent(new CustomEvent("hs-invalid",{bubbles:!0,detail:{message:this.#t.validationMessage}}))))};#l=()=>{this.hasAttribute("novalidate")||this.#t.value===""||this.#t.checkValidity()&&this.#c()};#u=()=>{!this.#i.hidden&&this.#t.checkValidity()&&this.#c()}};customElements.define("hs-field",K);var oe=CSS.supports("position-anchor: --hs"),ne={"block-end start":"block-end span-inline-end","block-end end":"block-end span-inline-start","block-end center":"block-end span-all","block-start start":"block-start span-inline-end","block-start end":"block-start span-inline-start","block-start center":"block-start span-all"},ae={"block-end":"block-start","block-start":"block-end",start:"end",end:"start"},M=new CSSStyleSheet;M.replaceSync(`
  [data-hs-anchored] {
    position: fixed;
    /* A popover's UA styles centre it with inset: 0 and margin: auto. Clear
       both, then let the rules below set one inset per axis. */
    inset: auto;
    /* The gap is a block-axis margin and never a uniform one: an inline margin
       would push the box off the very edge it is being lined up with. */
    margin-block: var(--hs-anchor-gap, var(--space-component, 0.5rem));
    margin-inline: 0;
  }

  @supports (position-anchor: --hs) {
    [data-hs-anchored='declarative'] {
      position-anchor: var(--hs-anchor-name);
      position-area: var(--hs-anchor-area);
      position-try-fallbacks: flip-block, flip-inline, flip-block flip-inline;
    }
  }

  [data-hs-placement='block-end'] {
    inset-block-start: var(--hs-anchor-after);
  }

  [data-hs-placement='block-start'] {
    inset-block-end: var(--hs-anchor-before);
  }

  [data-hs-align='start'] {
    inset-inline-start: var(--hs-anchor-start);
  }

  [data-hs-align='end'] {
    inset-inline-end: var(--hs-anchor-end);
  }

  /* Centring is the one case that writes a PHYSICAL inset, and the one that
     moves the box with translate rather than an inset. Physical because
     centring has no handedness \u2014 the box sits on the anchor's midpoint in
     either direction, so there is nothing for a logical property to get right.
     Translate because a percentage there resolves against the element's OWN
     size: the box goes to the midpoint and then back by half itself, without
     its layout position changing and without the width feeding back into it. */
  [data-hs-align='center'] {
    left: 0;
    translate: calc(var(--hs-anchor-center) - 50%);
  }
`);function zt(r){r.adoptedStyleSheets.includes(M)||(r.adoptedStyleSheets=[...r.adoptedStyleSheets,M])}var he=0;function Y(r,t,e={}){let{placement:s="block-end",align:i="start",strategy:o="auto"}=e;return(o==="auto"?oe:o==="declarative")?le(r,t,s,i):de(r,t,s,i)}function le(r,t,e,s){let i=`--hs-anchor-${++he}`;return t.style.setProperty("anchor-name",i),r.style.setProperty("--hs-anchor-name",i),r.style.setProperty("--hs-anchor-area",ne[`${e} ${s}`]),r.dataset.hsAnchored="declarative",()=>{t.style.removeProperty("anchor-name"),r.style.removeProperty("--hs-anchor-name"),r.style.removeProperty("--hs-anchor-area"),delete r.dataset.hsAnchored}}var ce=["--hs-anchor-after","--hs-anchor-before","--hs-anchor-start","--hs-anchor-end","--hs-anchor-center"];function de(r,t,e,s){r.dataset.hsAnchored="script";let i=0,o=()=>{i||(i=requestAnimationFrame(()=>{i=0,Nt(r,t,e,s)}))};Nt(r,t,e,s);let n={capture:!0,passive:!0};document.addEventListener("scroll",o,n),window.addEventListener("resize",o,n);let h=new ResizeObserver(o);return h.observe(r),h.observe(t),()=>{cancelAnimationFrame(i),document.removeEventListener("scroll",o,n),window.removeEventListener("resize",o,n),h.disconnect();for(let a of ce)r.style.removeProperty(a);delete r.dataset.hsAnchored,delete r.dataset.hsPlacement,delete r.dataset.hsAlign}}function Nt(r,t,e,s){let i=t.getBoundingClientRect();if(i.width===0&&i.height===0)return;let o=document.documentElement,n=getComputedStyle(r).direction==="rtl";if(r.style.setProperty("--hs-anchor-after",`${i.bottom}px`),r.style.setProperty("--hs-anchor-before",`${o.clientHeight-i.top}px`),r.style.setProperty("--hs-anchor-start",`${n?o.clientWidth-i.right:i.left}px`),r.style.setProperty("--hs-anchor-end",`${n?i.left:o.clientWidth-i.right}px`),r.dataset.hsPlacement=Ot(r,"hsPlacement",e,"block"),s==="center"){r.dataset.hsAlign="center",ue(r,i,o);return}r.dataset.hsAlign=Ot(r,"hsAlign",s,"inline")}function ue(r,t,e){let s=(t.left+t.right)/2;r.style.setProperty("--hs-anchor-center",`${s}px`);let i=r.getBoundingClientRect(),o=i.right-e.clientWidth,n=-i.left;if(o>0)s-=o;else if(n>0)s+=n;else return;r.style.setProperty("--hs-anchor-center",`${s}px`)}function Ot(r,t,e,s){r.dataset[t]=e;let i=Dt(r,s);if(i===0)return e;let o=ae[e];return r.dataset[t]=o,Dt(r,s)<i?o:e}function Dt(r,t){let e=r.getBoundingClientRect(),s=document.documentElement,[i,o,n]=t==="block"?[e.top,e.bottom,s.clientHeight]:[e.left,e.right,s.clientWidth];return Math.max(0,-i)+Math.max(0,o-n)}var G=class extends HTMLElement{};customElements.get("hs-menu-item")||customElements.define("hs-menu-item",G);var pe=500,be=r=>r.key.length===1&&r.key!==" "&&!r.ctrlKey&&!r.metaKey&&!r.altKey,J=class extends b{static properties={label:{type:String},disabled:{type:Boolean,reflect:!0},open:{type:Boolean,reflect:!0},_items:{state:!0,attribute:!1},_active:{state:!0,attribute:!1}};static styles=[M,f`
      /* The global reset does not cross the shadow boundary, so restate it.
         Without border-box the trigger's padding adds to its width and the
         element resizes the moment it upgrades. */
      *,
      *::before,
      *::after {
        box-sizing: border-box;
      }

      :host {
        display: inline-block;
      }

      /* The trigger mirrors the button atom, because the global stylesheet
         cannot reach in to style it and a trigger that looked nothing like the
         buttons beside it would be worse than one that does. */
      [part='trigger'] {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: var(--p-space-xs, 0.25rem);
        border: none;
        border-radius: var(--hs-menu-radius, var(--p-radius-md, 0.375rem));
        padding: var(--hs-menu-trigger-padding-block, var(--space-component, 0.5rem))
          var(--hs-menu-trigger-padding-inline, var(--space-inline, 1rem));
        background: var(--hs-menu-trigger-background, var(--color-action-primary, currentColor));
        color: var(--hs-menu-trigger-color, var(--color-text-inverse, canvas));
        font: inherit;
        font-variation-settings: 'wght' 500;
        cursor: pointer;
        transition: background var(--motion-duration, 200ms) var(--motion-ease, ease);
      }

      [part='trigger']:hover:not(:disabled) {
        background: var(--hs-menu-trigger-background-hover, var(--color-action-hover, currentColor));
      }

      [part='trigger']:disabled {
        background: var(--color-action-disabled, currentColor);
        cursor: not-allowed;
      }

      [part='trigger']:focus-visible {
        outline: var(--focus-ring-width, 2px) solid
          var(--focus-ring-color, var(--color-action-primary, currentColor));
        outline-offset: var(--focus-ring-offset, 2px);
      }

      /* position, inset and the gap all come from anchorStyles. What is left is
         what the box looks like. */
      [part='menu'] {
        min-inline-size: var(--hs-menu-min-inline-size, 12rem);
        padding: var(--hs-menu-padding, var(--p-space-xs, 0.25rem));
        border: var(--border-width, 1px) solid
          var(--hs-menu-border-color, var(--color-border-default, currentColor));
        border-radius: var(--hs-menu-radius, var(--p-radius-md, 0.375rem));
        background: var(--hs-menu-background, var(--color-surface-elevated, canvas));
        color: var(--hs-menu-color, var(--color-text-primary, currentColor));
        box-shadow: var(--hs-menu-shadow, var(--p-shadow-md, none));
      }

      [part='item'] {
        display: block;
        inline-size: 100%;
        border: none;
        border-radius: var(--hs-menu-item-radius, var(--p-radius-sm, 0.25rem));
        padding: var(--hs-menu-item-padding-block, var(--space-component, 0.5rem))
          var(--hs-menu-item-padding-inline, var(--space-inline, 1rem));
        background: none;
        color: inherit;
        font: inherit;
        text-align: start;
        cursor: pointer;
      }

      [part='item']:hover,
      [part='item']:focus-visible {
        background: var(--hs-menu-item-background-active, var(--color-surface-sunken, currentColor));
      }

      /* Inset, because an item is flush with the edge of the menu box and an
         outset ring would be clipped by it. */
      [part='item']:focus-visible {
        outline: var(--focus-ring-width, 2px) solid
          var(--focus-ring-color, var(--color-action-primary, currentColor));
        outline-offset: calc(-1 * var(--focus-ring-width, 2px));
      }

      /* No reduced-motion block. --motion-duration is a custom property and
         custom properties inherit THROUGH the shadow boundary, so collapsing it
         on :root reaches the transition above. */
    `];#t=null;#e=0;#s=!1;#i="";#r=0;constructor(){super(),this.label="",this.disabled=!1,this.open=!1,this._items=[],this._active=0}connectedCallback(){super.connectedCallback(),this.#n()}disconnectedCallback(){super.disconnectedCallback(),this.#t?.(),this.#t=null,clearTimeout(this.#r)}get#o(){return this.renderRoot?.querySelector('[part="menu"]')}get#a(){return this.renderRoot?.querySelector('[part="trigger"]')}#n(){this._items=[...this.querySelectorAll(":scope > hs-menu-item")].map((t,e)=>({index:e,value:t.getAttribute("value")??t.textContent.trim(),label:t.textContent.trim()})),this._active>=this._items.length&&(this._active=0)}refresh(){this.#n()}updated(t){!t.has("open")||!this.#o||this.open!==this.#s&&(this.#s=this.open,this.open?this.#o.showPopover():this.#o.hidePopover())}#h=t=>{this.#s=t.newState==="open",this.open=this.#s};#p=t=>{t.newState==="open"?this.#c():this.#d()};#c(){this.#t=Y(this.#o,this.#a,{placement:"block-end",align:"start"}),this.#l(this.#e),this.dispatchEvent(new Event("hs-open",{bubbles:!0}))}#d(){this.#t?.(),this.#t=null,this.#e=0,this.#i="",(this.#o.contains(this.renderRoot.activeElement)||document.activeElement===document.body)&&this.#a?.focus(),this.dispatchEvent(new Event("hs-close",{bubbles:!0}))}#l(t){let e=this._items.length;e!==0&&(this._active=(t+e)%e,this.updateComplete.then(()=>{this.renderRoot.querySelectorAll('[part="item"]')[this._active]?.focus()}))}#u=t=>{t.key!=="ArrowDown"&&t.key!=="ArrowUp"||this.open||(t.preventDefault(),this.#e=t.key==="ArrowDown"?0:this._items.length-1,this.#o.showPopover())};#b=t=>{switch(t.key){case"ArrowDown":t.preventDefault(),this.#l(this._active+1);return;case"ArrowUp":t.preventDefault(),this.#l(this._active-1);return;case"Home":t.preventDefault(),this.#l(0);return;case"End":t.preventDefault(),this.#l(this._items.length-1);return;case"Tab":this.#o.hidePopover();return;case"Escape":return;default:}be(t)&&(t.preventDefault(),this.#m(t.key))};#m(t){clearTimeout(this.#r),this.#r=setTimeout(()=>{this.#i=""},pe),this.#i+=t.toLowerCase();let e=this._items.length,s=this.#i.length===1?this._active+1:this._active;for(let i=0;i<e;i++){let o=(s+i)%e;if(this._items[o].label.toLowerCase().startsWith(this.#i)){this.#l(o);return}}}#f(t){let e=this._items[t];e&&(this.dispatchEvent(new CustomEvent("hs-menu-select",{bubbles:!0,detail:{value:e.value,label:e.label,index:t}})),this.#o.hidePopover())}render(){return p`
      <button
        part="trigger"
        id="trigger"
        type="button"
        popovertarget="menu"
        aria-haspopup="menu"
        aria-expanded=${this.open?"true":"false"}
        aria-controls="menu"
        ?disabled=${this.disabled}
        @keydown=${this.#u}
      >
        <slot name="trigger">${this.label}</slot>
      </button>

      <div
        part="menu"
        id="menu"
        popover
        role="menu"
        aria-labelledby="trigger"
        @beforetoggle=${this.#h}
        @toggle=${this.#p}
        @keydown=${this.#b}
      >
        ${this._items.map(t=>p`
            <button
              part="item"
              type="button"
              role="menuitem"
              tabindex=${t.index===this._active?0:-1}
              @click=${()=>this.#f(t.index)}
            >
              ${t.label}
            </button>
          `)}
      </div>
    `}};customElements.define("hs-menu",J);var me=new Intl.Collator(void 0,{numeric:!0}),Bt="data-hs-sort",X=class extends HTMLElement{connectedCallback(){this.#t()}get table(){return this.querySelector(":scope > table")}get sortedBy(){return this.table?.querySelector('thead th[aria-sort="ascending"], thead th[aria-sort="descending"]')??null}refresh(){this.#t()}#t(){let t=this.table;if(t)for(let e of t.querySelectorAll("thead th[data-sort]"))e.colSpan>1||this.#e(e)}#e(t){if(t.querySelector(`:scope > button[${Bt}]`))return;let e=document.createElement("button");e.type="button",e.setAttribute(Bt,""),e.append(...t.childNodes),t.append(e),t.hasAttribute("aria-sort")||t.setAttribute("aria-sort","none"),e.addEventListener("click",()=>this.sort(t))}sort(t,e){let s=this.table;if(!s)return;let i=typeof t=="number"?[...s.tHead?.rows[0]?.cells??[]].find(l=>this.#s(l)===t):t;if(!i)return;let o=e??(i.getAttribute("aria-sort")==="ascending"?"descending":"ascending"),n=this.#s(i);for(let l of s.querySelectorAll("thead th[aria-sort]"))l.setAttribute("aria-sort",l===i?o:"none");let h=i.dataset.sort==="number",a=o==="ascending"?1:-1;for(let l of s.tBodies){let d=[...l.rows];d.sort((c,m)=>fe(qt(c,n),qt(m,n),h,a)),l.append(...d)}this.dispatchEvent(new CustomEvent("hs-sort",{bubbles:!0,detail:{column:n,direction:o,header:i}}))}#s(t){let e=0;for(let s of t.parentElement.cells){if(s===t)return e;e+=s.colSpan||1}return e}};function qt(r,t){let e=r.cells[t];return e?e.dataset.sortValue??e.textContent.trim():""}function fe(r,t,e,s){if(!e)return s*me.compare(r,t);let i=Number(r),o=Number(t),n=Number.isNaN(i),h=Number.isNaN(o);return n||h?n&&h?0:n?1:-1:s*(i-o)}customElements.define("hs-sortable",X);var Z=class extends HTMLElement{};customElements.get("hs-tab-panel")||customElements.define("hs-tab-panel",Z);var Q=class extends b{static properties={selected:{type:Number,reflect:!0},activation:{type:String,reflect:!0},_labels:{state:!0,attribute:!1}};static styles=f`
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
  `;#t=[];constructor(){super(),this.selected=0,this.activation="auto",this._labels=[]}get panels(){return this.#t}#e=()=>{this.#t=[...this.querySelectorAll(":scope > hs-tab-panel")],this.#t.forEach((t,e)=>t.setAttribute("slot",`panel-${e}`)),this._labels=this.#t.map((t,e)=>t.getAttribute("label")||`Tab ${e+1}`),this.selected>=this._labels.length&&(this.selected=0)};#s(t,{focus:e=!1}={}){t===this.selected||t<0||t>=this._labels.length||(this.selected=t,e&&this.#i(t),this.dispatchEvent(new CustomEvent("hs-tab-change",{bubbles:!0,detail:{index:t,label:this._labels[t]}})))}#i(t){this.updateComplete.then(()=>{this.renderRoot.querySelectorAll("button")[t]?.focus()})}#r=t=>{let e=this._labels.length-1,s=Number(t.currentTarget.dataset.index),i=null;switch(t.key){case"ArrowRight":i=s===e?0:s+1;break;case"ArrowLeft":i=s===0?e:s-1;break;case"Home":i=0;break;case"End":i=e;break;case"Enter":case" ":t.preventDefault(),this.#s(s);return;default:return}t.preventDefault(),this.activation==="manual"?(this.#i(i),this.renderRoot.querySelectorAll("button")[i]?.focus()):this.#s(i,{focus:!0})};render(){return p`
      <div part="tablist" role="tablist">
        ${this._labels.map((t,e)=>p`
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

      ${this._labels.map((t,e)=>p`
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
    `}};customElements.define("hs-tabs",Q);var tt=class extends HTMLElement{#t=0;#e=0;#s=0;#i=!1;#r=!1;connectedCallback(){!this.hasAttribute("role")&&this.getAttribute("variant")==="error"&&this.setAttribute("role","alert"),this.addEventListener("mouseenter",this.#n),this.addEventListener("mouseleave",this.#h),this.addEventListener("focusin",this.#n),this.addEventListener("focusout",this.#h),this.#e=this.duration,this.#o()}disconnectedCallback(){clearTimeout(this.#t),this.#t=0,this.removeEventListener("mouseenter",this.#n),this.removeEventListener("mouseleave",this.#h),this.removeEventListener("focusin",this.#n),this.removeEventListener("focusout",this.#h)}get duration(){if(!this.hasAttribute("duration"))return 5e3;let t=Number(this.getAttribute("duration"));return Number.isFinite(t)&&t>=0?t:5e3}set duration(t){this.setAttribute("duration",String(t))}get remaining(){return this.#t?Math.max(0,this.#e-(performance.now()-this.#s)):Math.max(0,this.#e)}get paused(){return this.#i||this.#r}#o(){this.paused||this.#t||this.#e<=0||(this.#s=performance.now(),this.#t=setTimeout(()=>this.dismiss(),this.#e))}#a(){this.#t&&(clearTimeout(this.#t),this.#t=0,this.#e=Math.max(0,this.#e-(performance.now()-this.#s)))}#n=t=>{t.type==="mouseenter"?this.#i=!0:this.#r=!0,this.#a()};#h=t=>{t.type==="mouseleave"?this.#i=!1:this.contains(t.relatedTarget)||(this.#r=!1),this.#o()};dismiss(){let t=this.dispatchEvent(new CustomEvent("hs-dismiss",{bubbles:!0,cancelable:!0}));return t&&this.remove(),t}};customElements.get("hs-toast")||customElements.define("hs-toast",tt);var et=class extends HTMLElement{connectedCallback(){this.hasAttribute("role")||this.setAttribute("role","status"),this.hasAttribute("aria-live")||this.setAttribute("aria-live","polite"),this.hasAttribute("aria-atomic")||this.setAttribute("aria-atomic","false")}get toasts(){return[...this.querySelectorAll(":scope > hs-toast")]}show(t,e={}){let{variant:s,duration:i}=e,o=document.createElement("hs-toast");return s&&o.setAttribute("variant",s),i!==void 0&&o.setAttribute("duration",String(i)),o.textContent=t,this.append(o),o}clear(){for(let t of this.toasts)t.dismiss()}};customElements.get("hs-toast-region")||customElements.define("hs-toast-region",et);var ve=0,st=class extends HTMLElement{static observedAttributes=["for"];#t=null;#e=null;connectedCallback(){zt(this.getRootNode()),this.popover="manual",this.hasAttribute("role")||this.setAttribute("role","tooltip"),this.id||(this.id=`hs-tooltip-${++ve}`),this.addEventListener("toggle",this.#n),this.#s()}disconnectedCallback(){this.#i(),this.removeEventListener("toggle",this.#n),this.#e?.(),this.#e=null}attributeChangedCallback(t,e,s){!this.isConnected||e===s||(this.#i(),this.#s())}get trigger(){return this.#t}#s(){let t=this.getAttribute("for");this.#t=t?this.getRootNode().getElementById?.(t)??null:null,this.#t&&(this.#r(this.#t),this.#t.addEventListener("mouseenter",this.show),this.#t.addEventListener("mouseleave",this.hide),this.#t.addEventListener("focus",this.show),this.#t.addEventListener("blur",this.hide),this.#t.addEventListener("keydown",this.#a))}#i(){this.#t&&(this.#o(this.#t),this.#t.removeEventListener("mouseenter",this.show),this.#t.removeEventListener("mouseleave",this.hide),this.#t.removeEventListener("focus",this.show),this.#t.removeEventListener("blur",this.hide),this.#t.removeEventListener("keydown",this.#a),this.#t=null)}#r(t){let e=(t.getAttribute("aria-describedby")??"").split(/\s+/).filter(Boolean);e.includes(this.id)||t.setAttribute("aria-describedby",[...e,this.id].join(" "))}#o(t){let e=(t.getAttribute("aria-describedby")??"").split(/\s+/).filter(s=>s&&s!==this.id);e.length>0?t.setAttribute("aria-describedby",e.join(" ")):t.removeAttribute("aria-describedby")}show=()=>{this.#t&&!this.matches(":popover-open")&&this.showPopover()};hide=()=>{this.matches(":popover-open")&&this.hidePopover()};#a=t=>{t.key!=="Escape"||!this.matches(":popover-open")||(t.preventDefault(),this.hide())};#n=t=>{if(t.newState==="open"){this.#e=Y(this,this.#t,{placement:this.getAttribute("placement")==="block-start"?"block-start":"block-end",align:"center"}),this.dispatchEvent(new Event("hs-open",{bubbles:!0}));return}this.#e?.(),this.#e=null,this.dispatchEvent(new Event("hs-close",{bubbles:!0}))}};customElements.define("hs-tooltip",st);var ge="theme",ye="Toggle colour scheme",it=class extends HTMLElement{static observedAttributes=["label"];#t=null;connectedCallback(){this.#t||(this.#t=document.createElement("button"),this.#t.type="button",this.#t.addEventListener("click",()=>this.toggle()),this.append(this.#t)),this.#e()}attributeChangedCallback(){this.isConnected&&this.#e()}get scheme(){let t=document.documentElement.style.colorScheme;return t==="light"||t==="dark"?t:matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}set scheme(t){if(!(t!=="light"&&t!=="dark")){document.documentElement.style.colorScheme=t;try{localStorage.setItem(ge,t)}catch{}this.#e(),this.dispatchEvent(new CustomEvent("hs-theme-change",{bubbles:!0,detail:{scheme:t}}))}}toggle(){this.scheme=this.scheme==="dark"?"light":"dark"}#e(){if(!this.#t)return;let t=this.scheme==="dark";this.#t.setAttribute("aria-label",this.getAttribute("label")||ye),this.#t.setAttribute("aria-pressed",String(t)),this.#t.textContent=t?"\u263E":"\u2600"}};customElements.define("hs-theme-toggle",it);var rt=class extends b{static formAssociated=!0;static properties={checked:{type:Boolean,reflect:!0},disabled:{type:Boolean,reflect:!0},name:{type:String},value:{type:String}};static styles=f`
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
  `;#t;#e=!1;constructor(){super(),this.checked=!1,this.disabled=!1,this.value="on",this.#t=this.attachInternals(),this.#t.role="switch"}connectedCallback(){super.connectedCallback(),this.#e=this.hasAttribute("checked"),this.#t.setFormValue(this.checked?this.value:null),this.hasAttribute("tabindex")||(this.tabIndex=this.disabled?-1:0),this.addEventListener("click",this.#s),this.addEventListener("keydown",this.#i)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("click",this.#s),this.removeEventListener("keydown",this.#i)}willUpdate(){this.#t.ariaChecked=String(this.checked),this.#t.ariaDisabled=String(this.disabled),this.disabled?this.setAttribute("aria-disabled","true"):this.removeAttribute("aria-disabled"),this.#t.setFormValue(this.checked?this.value:null),(!this.hasAttribute("tabindex")||this.tabIndex>=0||this.disabled)&&(this.tabIndex=this.disabled?-1:0)}#s=()=>this.toggle();#i=t=>{t.key!==" "&&t.key!=="Enter"||(t.preventDefault(),this.toggle())};toggle(){this.disabled||(this.checked=!this.checked,this.dispatchEvent(new Event("change",{bubbles:!0})))}formResetCallback(){this.checked=this.#e}formStateRestoreCallback(t){this.checked=t!==null}render(){return p`
      <span class="track" part="track" aria-hidden="true">
        <span class="thumb" part="thumb"></span>
      </span>
      <slot></slot>
    `}};customElements.define("hs-toggle",rt);export{U as HsAccordion,N as HsAlert,O as HsBadge,D as HsCard,F as HsCombobox,V as HsCopy,W as HsDialog,K as HsField,J as HsMenu,G as HsMenuItem,j as HsOption,X as HsSortable,Z as HsTabPanel,Q as HsTabs,it as HsThemeToggle,tt as HsToast,et as HsToastRegion,rt as HsToggle,st as HsTooltip};
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

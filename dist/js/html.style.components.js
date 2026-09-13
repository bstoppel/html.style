/*! html.style components - MIT - https://html.style */
var Rt=0,U=class extends HTMLElement{static observedAttributes=["exclusive"];#t="";#e=null;connectedCallback(){this.#t||(this.#t=`hs-accordion-${++Rt}`),this.#e=new MutationObserver(()=>this.#i()),this.#e.observe(this,{childList:!0}),this.addEventListener("toggle",this.#s,!0),this.#i()}disconnectedCallback(){this.#e?.disconnect(),this.#e=null,this.removeEventListener("toggle",this.#s,!0)}attributeChangedCallback(){this.isConnected&&this.#i()}get panels(){return[...this.querySelectorAll(":scope > details")]}openAll(){if(!this.hasAttribute("exclusive"))for(let t of this.panels)t.open=!0}closeAll(){for(let t of this.panels)t.open=!1}#i(){let t=this.hasAttribute("exclusive");for(let e of this.panels)t?e.setAttribute("name",this.#t):e.getAttribute("name")===this.#t&&e.removeAttribute("name")}#s=t=>{let e=t.target;e.parentElement===this&&this.dispatchEvent(new CustomEvent("hs-accordion-toggle",{bubbles:!0,detail:{index:this.panels.indexOf(e),open:e.open}}))}};customElements.define("hs-accordion",U);var Ot="Dismiss",R=class extends HTMLElement{static observedAttributes=["dismissible","dismiss-label"];connectedCallback(){this.hasAttribute("role")||this.setAttribute("role","alert"),this.#t()}attributeChangedCallback(){this.isConnected&&this.#t()}#t(){let t=this.querySelector(":scope > [data-hs-dismiss]");if(!this.hasAttribute("dismissible")){t?.remove();return}let e=this.getAttribute("dismiss-label")||Ot;if(t){t.setAttribute("aria-label",e);return}let s=document.createElement("button");s.type="button",s.setAttribute("data-hs-dismiss",""),s.setAttribute("aria-label",e),s.textContent="\xD7",s.addEventListener("click",()=>this.dismiss()),this.append(s)}dismiss(){this.dispatchEvent(new CustomEvent("hs-dismiss",{bubbles:!0,cancelable:!0}))&&this.remove()}};customElements.define("hs-alert",R);var O=class extends HTMLElement{};customElements.define("hs-badge",O);var D=class extends HTMLElement{};customElements.define("hs-card",D);var z=globalThis,N=z.ShadowRoot&&(z.ShadyCSS===void 0||z.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,Q=Symbol(),pt=new WeakMap,w=class{constructor(t,e,s){if(this._$cssResult$=!0,s!==Q)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o,e=this.t;if(N&&t===void 0){let s=e!==void 0&&e.length===1;s&&(t=pt.get(e)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),s&&pt.set(e,t))}return t}toString(){return this.cssText}},bt=r=>new w(typeof r=="string"?r:r+"",void 0,Q),f=(r,...t)=>{let e=r.length===1?r[0]:t.reduce((s,i,o)=>s+(n=>{if(n._$cssResult$===!0)return n.cssText;if(typeof n=="number")return n;throw Error("Value passed to 'css' function must be a 'css' function result: "+n+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+r[o+1],r[0]);return new w(e,r,Q)},mt=(r,t)=>{if(N)r.adoptedStyleSheets=t.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let e of t){let s=document.createElement("style"),i=z.litNonce;i!==void 0&&s.setAttribute("nonce",i),s.textContent=e.cssText,r.appendChild(s)}},tt=N?r=>r:r=>r instanceof CSSStyleSheet?(t=>{let e="";for(let s of t.cssRules)e+=s.cssText;return bt(e)})(r):r;var{is:Dt,defineProperty:zt,getOwnPropertyDescriptor:Nt,getOwnPropertyNames:Bt,getOwnPropertySymbols:qt,getPrototypeOf:It}=Object,B=globalThis,ft=B.trustedTypes,Vt=ft?ft.emptyScript:"",jt=B.reactiveElementPolyfillSupport,C=(r,t)=>r,et={toAttribute(r,t){switch(t){case Boolean:r=r?Vt:null;break;case Object:case Array:r=r==null?r:JSON.stringify(r)}return r},fromAttribute(r,t){let e=r;switch(t){case Boolean:e=r!==null;break;case Number:e=r===null?null:Number(r);break;case Object:case Array:try{e=JSON.parse(r)}catch{e=null}}return e}},gt=(r,t)=>!Dt(r,t),vt={attribute:!0,type:String,converter:et,reflect:!1,useDefault:!1,hasChanged:gt};Symbol.metadata??=Symbol("metadata"),B.litPropertyMetadata??=new WeakMap;var v=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=vt){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){let s=Symbol(),i=this.getPropertyDescriptor(t,s,e);i!==void 0&&zt(this.prototype,t,i)}}static getPropertyDescriptor(t,e,s){let{get:i,set:o}=Nt(this.prototype,t)??{get(){return this[e]},set(n){this[e]=n}};return{get:i,set(n){let l=i?.call(this);o?.call(this,n),this.requestUpdate(t,l,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??vt}static _$Ei(){if(this.hasOwnProperty(C("elementProperties")))return;let t=It(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(C("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(C("properties"))){let e=this.properties,s=[...Bt(e),...qt(e)];for(let i of s)this.createProperty(i,e[i])}let t=this[Symbol.metadata];if(t!==null){let e=litPropertyMetadata.get(t);if(e!==void 0)for(let[s,i]of e)this.elementProperties.set(s,i)}this._$Eh=new Map;for(let[e,s]of this.elementProperties){let i=this._$Eu(e,s);i!==void 0&&this._$Eh.set(i,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){let e=[];if(Array.isArray(t)){let s=new Set(t.flat(1/0).reverse());for(let i of s)e.unshift(tt(i))}else t!==void 0&&e.push(tt(t));return e}static _$Eu(t,e){let s=e.attribute;return s===!1?void 0:typeof s=="string"?s:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){let t=new Map,e=this.constructor.elementProperties;for(let s of e.keys())this.hasOwnProperty(s)&&(t.set(s,this[s]),delete this[s]);t.size>0&&(this._$Ep=t)}createRenderRoot(){let t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return mt(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,s){this._$AK(t,s)}_$ET(t,e){let s=this.constructor.elementProperties.get(t),i=this.constructor._$Eu(t,s);if(i!==void 0&&s.reflect===!0){let o=(s.converter?.toAttribute!==void 0?s.converter:et).toAttribute(e,s.type);this._$Em=t,o==null?this.removeAttribute(i):this.setAttribute(i,o),this._$Em=null}}_$AK(t,e){let s=this.constructor,i=s._$Eh.get(t);if(i!==void 0&&this._$Em!==i){let o=s.getPropertyOptions(i),n=typeof o.converter=="function"?{fromAttribute:o.converter}:o.converter?.fromAttribute!==void 0?o.converter:et;this._$Em=i;let l=n.fromAttribute(e,o.type);this[i]=l??this._$Ej?.get(i)??l,this._$Em=null}}requestUpdate(t,e,s,i=!1,o){if(t!==void 0){let n=this.constructor;if(i===!1&&(o=this[t]),s??=n.getPropertyOptions(t),!((s.hasChanged??gt)(o,e)||s.useDefault&&s.reflect&&o===this._$Ej?.get(t)&&!this.hasAttribute(n._$Eu(t,s))))return;this.C(t,e,s)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,e,{useDefault:s,reflect:i,wrapped:o},n){s&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,n??e??this[t]),o!==!0||n!==void 0)||(this._$AL.has(t)||(this.hasUpdated||s||(e=void 0),this._$AL.set(t,e)),i===!0&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[i,o]of this._$Ep)this[i]=o;this._$Ep=void 0}let s=this.constructor.elementProperties;if(s.size>0)for(let[i,o]of s){let{wrapped:n}=o,l=this[i];n!==!0||this._$AL.has(i)||l===void 0||this.C(i,void 0,o,l)}}let t=!1,e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(s=>s.hostUpdate?.()),this.update(e)):this._$EM()}catch(s){throw t=!1,this._$EM(),s}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(t){}firstUpdated(t){}};v.elementStyles=[],v.shadowRootOptions={mode:"open"},v[C("elementProperties")]=new Map,v[C("finalized")]=new Map,jt?.({ReactiveElement:v}),(B.reactiveElementVersions??=[]).push("2.1.2");var ht=globalThis,yt=r=>r,q=ht.trustedTypes,_t=q?q.createPolicy("lit-html",{createHTML:r=>r}):void 0,wt="$lit$",y=`lit$${Math.random().toFixed(9).slice(2)}$`,Ct="?"+y,Wt=`<${Ct}>`,A=document,T=()=>A.createComment(""),P=r=>r===null||typeof r!="object"&&typeof r!="function",lt=Array.isArray,Ft=r=>lt(r)||typeof r?.[Symbol.iterator]=="function",st=`[ 	
\f\r]`,S=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,$t=/-->/g,At=/>/g,_=RegExp(`>|${st}(?:([^\\s"'>=/]+)(${st}*=${st}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),xt=/'/g,Et=/"/g,St=/^(?:script|style|textarea|title)$/i,ct=r=>(t,...e)=>({_$litType$:r,strings:t,values:e}),p=ct(1),ve=ct(2),ge=ct(3),x=Symbol.for("lit-noChange"),d=Symbol.for("lit-nothing"),kt=new WeakMap,$=A.createTreeWalker(A,129);function Tt(r,t){if(!lt(r)||!r.hasOwnProperty("raw"))throw Error("invalid template strings array");return _t!==void 0?_t.createHTML(t):t}var Kt=(r,t)=>{let e=r.length-1,s=[],i,o=t===2?"<svg>":t===3?"<math>":"",n=S;for(let l=0;l<e;l++){let a=r[l],c,u,h=-1,m=0;for(;m<a.length&&(n.lastIndex=m,u=n.exec(a),u!==null);)m=n.lastIndex,n===S?u[1]==="!--"?n=$t:u[1]!==void 0?n=At:u[2]!==void 0?(St.test(u[2])&&(i=RegExp("</"+u[2],"g")),n=_):u[3]!==void 0&&(n=_):n===_?u[0]===">"?(n=i??S,h=-1):u[1]===void 0?h=-2:(h=n.lastIndex-u[2].length,c=u[1],n=u[3]===void 0?_:u[3]==='"'?Et:xt):n===Et||n===xt?n=_:n===$t||n===At?n=S:(n=_,i=void 0);let g=n===_&&r[l+1].startsWith("/>")?" ":"";o+=n===S?a+Wt:h>=0?(s.push(c),a.slice(0,h)+wt+a.slice(h)+y+g):a+y+(h===-2?l:g)}return[Tt(r,o+(r[e]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),s]},L=class r{constructor({strings:t,_$litType$:e},s){let i;this.parts=[];let o=0,n=0,l=t.length-1,a=this.parts,[c,u]=Kt(t,e);if(this.el=r.createElement(c,s),$.currentNode=this.el.content,e===2||e===3){let h=this.el.content.firstChild;h.replaceWith(...h.childNodes)}for(;(i=$.nextNode())!==null&&a.length<l;){if(i.nodeType===1){if(i.hasAttributes())for(let h of i.getAttributeNames())if(h.endsWith(wt)){let m=u[n++],g=i.getAttribute(h).split(y),M=/([.?@])?(.*)/.exec(m);a.push({type:1,index:o,name:M[2],strings:g,ctor:M[1]==="."?rt:M[1]==="?"?ot:M[1]==="@"?nt:k}),i.removeAttribute(h)}else h.startsWith(y)&&(a.push({type:6,index:o}),i.removeAttribute(h));if(St.test(i.tagName)){let h=i.textContent.split(y),m=h.length-1;if(m>0){i.textContent=q?q.emptyScript:"";for(let g=0;g<m;g++)i.append(h[g],T()),$.nextNode(),a.push({type:2,index:++o});i.append(h[m],T())}}}else if(i.nodeType===8)if(i.data===Ct)a.push({type:2,index:o});else{let h=-1;for(;(h=i.data.indexOf(y,h+1))!==-1;)a.push({type:7,index:o}),h+=y.length-1}o++}}static createElement(t,e){let s=A.createElement("template");return s.innerHTML=t,s}};function E(r,t,e=r,s){if(t===x)return t;let i=s!==void 0?e._$Co?.[s]:e._$Cl,o=P(t)?void 0:t._$litDirective$;return i?.constructor!==o&&(i?._$AO?.(!1),o===void 0?i=void 0:(i=new o(r),i._$AT(r,e,s)),s!==void 0?(e._$Co??=[])[s]=i:e._$Cl=i),i!==void 0&&(t=E(r,i._$AS(r,t.values),i,s)),t}var it=class{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){let{el:{content:e},parts:s}=this._$AD,i=(t?.creationScope??A).importNode(e,!0);$.currentNode=i;let o=$.nextNode(),n=0,l=0,a=s[0];for(;a!==void 0;){if(n===a.index){let c;a.type===2?c=new H(o,o.nextSibling,this,t):a.type===1?c=new a.ctor(o,a.name,a.strings,this,t):a.type===6&&(c=new at(o,this,t)),this._$AV.push(c),a=s[++l]}n!==a?.index&&(o=$.nextNode(),n++)}return $.currentNode=A,i}p(t){let e=0;for(let s of this._$AV)s!==void 0&&(s.strings!==void 0?(s._$AI(t,s,e),e+=s.strings.length-2):s._$AI(t[e])),e++}},H=class r{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,s,i){this.type=2,this._$AH=d,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=s,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode,e=this._$AM;return e!==void 0&&t?.nodeType===11&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=E(this,t,e),P(t)?t===d||t==null||t===""?(this._$AH!==d&&this._$AR(),this._$AH=d):t!==this._$AH&&t!==x&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):Ft(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==d&&P(this._$AH)?this._$AA.nextSibling.data=t:this.T(A.createTextNode(t)),this._$AH=t}$(t){let{values:e,_$litType$:s}=t,i=typeof s=="number"?this._$AC(t):(s.el===void 0&&(s.el=L.createElement(Tt(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===i)this._$AH.p(e);else{let o=new it(i,this),n=o.u(this.options);o.p(e),this.T(n),this._$AH=o}}_$AC(t){let e=kt.get(t.strings);return e===void 0&&kt.set(t.strings,e=new L(t)),e}k(t){lt(this._$AH)||(this._$AH=[],this._$AR());let e=this._$AH,s,i=0;for(let o of t)i===e.length?e.push(s=new r(this.O(T()),this.O(T()),this,this.options)):s=e[i],s._$AI(o),i++;i<e.length&&(this._$AR(s&&s._$AB.nextSibling,i),e.length=i)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){let s=yt(t).nextSibling;yt(t).remove(),t=s}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}},k=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,s,i,o){this.type=1,this._$AH=d,this._$AN=void 0,this.element=t,this.name=e,this._$AM=i,this.options=o,s.length>2||s[0]!==""||s[1]!==""?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=d}_$AI(t,e=this,s,i){let o=this.strings,n=!1;if(o===void 0)t=E(this,t,e,0),n=!P(t)||t!==this._$AH&&t!==x,n&&(this._$AH=t);else{let l=t,a,c;for(t=o[0],a=0;a<o.length-1;a++)c=E(this,l[s+a],e,a),c===x&&(c=this._$AH[a]),n||=!P(c)||c!==this._$AH[a],c===d?t=d:t!==d&&(t+=(c??"")+o[a+1]),this._$AH[a]=c}n&&!i&&this.j(t)}j(t){t===d?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}},rt=class extends k{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===d?void 0:t}},ot=class extends k{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==d)}},nt=class extends k{constructor(t,e,s,i,o){super(t,e,s,i,o),this.type=5}_$AI(t,e=this){if((t=E(this,t,e,0)??d)===x)return;let s=this._$AH,i=t===d&&s!==d||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,o=t!==d&&(s===d||i);i&&this.element.removeEventListener(this.name,this,s),o&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}},at=class{constructor(t,e,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(t){E(this,t)}};var Gt=ht.litHtmlPolyfillSupport;Gt?.(L,H),(ht.litHtmlVersions??=[]).push("3.3.3");var Pt=(r,t,e)=>{let s=e?.renderBefore??t,i=s._$litPart$;if(i===void 0){let o=e?.renderBefore??null;s._$litPart$=i=new H(t.insertBefore(T(),o),o,void 0,e??{})}return i._$AI(r),i};var dt=globalThis,b=class extends v{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){let e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=Pt(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return x}};b._$litElement$=!0,b.finalized=!0,dt.litElementHydrateSupport?.({LitElement:b});var Yt=dt.litElementPolyfillSupport;Yt?.({LitElement:b});(dt.litElementVersions??=[]).push("4.2.2");var I=class extends HTMLElement{};customElements.get("hs-option")||customElements.define("hs-option",I);var V=class extends b{static formAssociated=!0;static properties={name:{type:String},value:{type:String,reflect:!0},label:{type:String},placeholder:{type:String},disabled:{type:Boolean,reflect:!0},open:{type:Boolean,reflect:!0},_query:{state:!0,attribute:!1},_active:{state:!0,attribute:!1},_options:{state:!0,attribute:!1}};static styles=f`
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
  `;#t;#e="";#i="";constructor(){super(),this.value="",this.label="",this.placeholder="",this.disabled=!1,this.open=!1,this._query=null,this._active=-1,this._options=[],this.#t=this.attachInternals()}connectedCallback(){super.connectedCallback(),this.#e=this.getAttribute("value")??"",this.#s(),this.#t.setFormValue(this.value||null)}#s(){this._options=[...this.querySelectorAll("hs-option")].map((t,e)=>({index:e,value:t.getAttribute("value")??t.textContent.trim(),text:t.textContent.trim()}))}get#r(){if(this._query===null||this._query==="")return this._options;let t=this._query.toLowerCase();return this._options.filter(e=>e.text.toLowerCase().includes(t))}get#o(){return this._query!==null?this._query:this._options.find(t=>t.value===this.value)?.text??""}willUpdate(){this.#t.setFormValue(this.value||null),this.#t.ariaDisabled=String(this.disabled),this.disabled?this.setAttribute("aria-disabled","true"):this.removeAttribute("aria-disabled")}#h(){this.open||this.disabled||(this.open=!0,this.dispatchEvent(new Event("hs-open",{bubbles:!0})))}#a(){this.open&&(this.open=!1,this._active=-1,this.dispatchEvent(new Event("hs-close",{bubbles:!0})))}#l=()=>{this.#i=this.value};#p=t=>{this._query=t.target.value,this._active=this.#r.length>0?this.#r[0].index:-1,this.#h()};#c=t=>{let e=this.#r,s=i=>e.findIndex(o=>o.index===i);switch(t.key){case"ArrowDown":case"ArrowUp":{if(t.preventDefault(),!this.open){this.#h(),e.length>0&&(this._active=e[0].index);return}if(e.length===0)return;let i=t.key==="ArrowDown"?1:-1,n=(s(this._active)+i+e.length)%e.length;this._active=e[n].index;return}case"Home":case"End":if(!this.open||e.length===0)return;t.preventDefault(),this._active=(t.key==="Home"?e[0]:e.at(-1)).index;return;case"Enter":{if(!this.open||this._active<0)return;t.preventDefault(),this.#b(this._active);return}case"Escape":if(!this.open)return;t.preventDefault(),this.#u();return;case"Tab":this.#n();return;default:}};#d=()=>this.#n();#n(){this._query=null,this.#a()}#u(){this._query=null,this.value!==this.#i&&(this.value=this.#i),this.#a()}#b(t){let e=this._options[t];if(!e||e.value===this.value){this.#n();return}this.value=e.value,this.#i=e.value,this._query=null,this.#a(),this.dispatchEvent(new Event("change",{bubbles:!0}))}formResetCallback(){this.value=this.#e,this._query=null,this.#a()}formStateRestoreCallback(t){this.value=t??""}refresh(){this.#s()}render(){let t=this.#r;return p`
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
        @focus=${this.#l}
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
    `}};customElements.define("hs-combobox",V);var Jt="Copied";var j=class extends HTMLElement{#t=null;#e=null;#i="";#s=0;connectedCallback(){this.#t||(this.#i=this.textContent.trim()||"Copy",this.#t=document.createElement("button"),this.#t.type="button",this.#t.textContent=this.#i,this.#t.addEventListener("click",()=>this.copy()),this.#e=document.createElement("span"),this.#e.className="visually-hidden",this.#e.setAttribute("role","status"),this.replaceChildren(this.#t,this.#e))}disconnectedCallback(){clearTimeout(this.#s)}get text(){let t=this.getAttribute("for");return t?document.getElementById(t)?.textContent??"":this.getAttribute("value")??""}async copy(){let t=this.text;if(t){try{await navigator.clipboard.writeText(t)}catch(e){this.dispatchEvent(new CustomEvent("hs-copy-error",{bubbles:!0,detail:{error:e}}));return}this.#r(),this.dispatchEvent(new CustomEvent("hs-copy",{bubbles:!0,detail:{text:t}}))}}#r(){let t=this.getAttribute("copied-label")||Jt;this.#e.textContent=t,this.setAttribute("data-copied",""),clearTimeout(this.#s),this.#s=setTimeout(()=>{this.removeAttribute("data-copied"),this.#e.textContent=""},2e3)}};customElements.define("hs-copy",j);var W=class r extends HTMLElement{static observedAttributes=["open","persistent"];static#t="closedBy"in HTMLDialogElement.prototype;#e=null;connectedCallback(){this.#e||(this.#e=document.createElement("dialog"),this.#e.append(...this.childNodes),this.append(this.#e),this.#e.addEventListener("close",this.#s),r.#t||this.#e.addEventListener("click",this.#r)),this.#i(),this.hasAttribute("open")&&this.show()}attributeChangedCallback(t,e,s){if(!(!this.isConnected||e===s)){if(t==="persistent"){this.#i();return}t==="open"&&(s===null?this.close():this.show())}}#i(){!r.#t||!this.#e||(this.#e.closedBy=this.hasAttribute("persistent")?"closerequest":"any")}get dialog(){return this.#e}get open(){return this.hasAttribute("open")}set open(t){this.toggleAttribute("open",!!t)}show(){!this.#e||this.#e.open||(this.#e.showModal(),this.hasAttribute("open")||this.setAttribute("open",""),this.dispatchEvent(new CustomEvent("hs-open",{bubbles:!0})))}close(t){this.#e?.open&&this.#e.close(t)}#s=()=>{this.removeAttribute("open"),this.dispatchEvent(new CustomEvent("hs-close",{bubbles:!0,detail:{returnValue:this.#e.returnValue}}))};#r=t=>{if(this.hasAttribute("persistent")||t.target!==this.#e)return;let e=this.#e.getBoundingClientRect();t.clientX>=e.left&&t.clientX<=e.right&&t.clientY>=e.top&&t.clientY<=e.bottom||this.close("backdrop")}};customElements.define("hs-dialog",W);var Xt=0,F=class extends HTMLElement{static observedAttributes=["label","hint"];#t=null;#e=null;#i=null;#s=null;#r="";connectedCallback(){this.#t=this.querySelector("input, select, textarea"),this.#t&&(this.#r||(this.#r=this.#t.id||`hs-field-${++Xt}`),this.#t.id=this.#r,this.#o(),this.#h(),this.#a(),this.#l(),this.addEventListener("invalid",this.#d,!0),this.#t.addEventListener("blur",this.#n),this.#t.addEventListener("input",this.#u))}disconnectedCallback(){this.removeEventListener("invalid",this.#d,!0),this.#t?.removeEventListener("blur",this.#n),this.#t?.removeEventListener("input",this.#u)}attributeChangedCallback(){!this.isConnected||!this.#t||(this.#o(),this.#h(),this.#l())}get control(){return this.#t}#o(){let t=this.querySelector(":scope > label");if(t&&t!==this.#e){t.hasAttribute("for")||t.setAttribute("for",this.#r);return}let e=this.getAttribute("label");if(!e){this.#e?.remove(),this.#e=null;return}this.#e||(this.#e=document.createElement("label"),this.#t.before(this.#e)),this.#e.setAttribute("for",this.#r),this.#e.textContent=e}#h(){let t=this.getAttribute("hint");if(!t){this.#i?.remove(),this.#i=null;return}this.#i||(this.#i=document.createElement("p"),this.#i.id=`${this.#r}-hint`,this.#i.setAttribute("data-hs-hint",""),this.#t.after(this.#i)),this.#i.textContent=t}#a(){this.#s||(this.#s=document.createElement("p"),this.#s.id=`${this.#r}-error`,this.#s.setAttribute("data-hs-error",""),this.#s.setAttribute("role","alert"),this.#s.hidden=!0,(this.#i??this.#t).after(this.#s))}#l(){let t=[];this.#i&&t.push(this.#i.id),this.#s&&!this.#s.hidden&&t.push(this.#s.id);let e=new Set([`${this.#r}-hint`,`${this.#r}-error`]),i=[...(this.#t.getAttribute("aria-describedby")??"").split(/\s+/).filter(o=>o&&!e.has(o)),...t];i.length?this.#t.setAttribute("aria-describedby",i.join(" ")):this.#t.removeAttribute("aria-describedby")}#p(t){this.hasAttribute("novalidate")||(this.#s.textContent=t,this.#s.hidden=!1,this.#t.setAttribute("aria-invalid","true"),this.#l())}#c(){this.#s.hidden=!0,this.#s.textContent="",this.#t.removeAttribute("aria-invalid"),this.#l()}#d=t=>{t.target===this.#t&&(this.hasAttribute("novalidate")||(t.preventDefault(),this.#p(this.#t.validationMessage),this.dispatchEvent(new CustomEvent("hs-invalid",{bubbles:!0,detail:{message:this.#t.validationMessage}}))))};#n=()=>{this.hasAttribute("novalidate")||this.#t.value===""||this.#t.checkValidity()&&this.#c()};#u=()=>{!this.#s.hidden&&this.#t.checkValidity()&&this.#c()}};customElements.define("hs-field",F);var Zt=CSS.supports("position-anchor: --hs"),Qt={"block-end start":"block-end span-inline-end","block-end end":"block-end span-inline-start","block-start start":"block-start span-inline-end","block-start end":"block-start span-inline-start"},te={"block-end":"block-start","block-start":"block-end",start:"end",end:"start"},ut=new CSSStyleSheet;ut.replaceSync(`
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
`);var ee=0;function Ut(r,t,e={}){let{placement:s="block-end",align:i="start",strategy:o="auto"}=e;return(o==="auto"?Zt:o==="declarative")?se(r,t,s,i):re(r,t,s,i)}function se(r,t,e,s){let i=`--hs-anchor-${++ee}`;return t.style.setProperty("anchor-name",i),r.style.setProperty("--hs-anchor-name",i),r.style.setProperty("--hs-anchor-area",Qt[`${e} ${s}`]),r.dataset.hsAnchored="declarative",()=>{t.style.removeProperty("anchor-name"),r.style.removeProperty("--hs-anchor-name"),r.style.removeProperty("--hs-anchor-area"),delete r.dataset.hsAnchored}}var ie=["--hs-anchor-after","--hs-anchor-before","--hs-anchor-start","--hs-anchor-end"];function re(r,t,e,s){r.dataset.hsAnchored="script";let i=0,o=()=>{i||(i=requestAnimationFrame(()=>{i=0,Lt(r,t,e,s)}))};Lt(r,t,e,s);let n={capture:!0,passive:!0};document.addEventListener("scroll",o,n),window.addEventListener("resize",o,n);let l=new ResizeObserver(o);return l.observe(r),l.observe(t),()=>{cancelAnimationFrame(i),document.removeEventListener("scroll",o,n),window.removeEventListener("resize",o,n),l.disconnect();for(let a of ie)r.style.removeProperty(a);delete r.dataset.hsAnchored,delete r.dataset.hsPlacement,delete r.dataset.hsAlign}}function Lt(r,t,e,s){let i=t.getBoundingClientRect();if(i.width===0&&i.height===0)return;let o=document.documentElement,n=getComputedStyle(r).direction==="rtl";r.style.setProperty("--hs-anchor-after",`${i.bottom}px`),r.style.setProperty("--hs-anchor-before",`${o.clientHeight-i.top}px`),r.style.setProperty("--hs-anchor-start",`${n?o.clientWidth-i.right:i.left}px`),r.style.setProperty("--hs-anchor-end",`${n?i.left:o.clientWidth-i.right}px`),r.dataset.hsPlacement=Ht(r,"hsPlacement",e,"block"),r.dataset.hsAlign=Ht(r,"hsAlign",s,"inline")}function Ht(r,t,e,s){r.dataset[t]=e;let i=Mt(r,s);if(i===0)return e;let o=te[e];return r.dataset[t]=o,Mt(r,s)<i?o:e}function Mt(r,t){let e=r.getBoundingClientRect(),s=document.documentElement,[i,o,n]=t==="block"?[e.top,e.bottom,s.clientHeight]:[e.left,e.right,s.clientWidth];return Math.max(0,-i)+Math.max(0,o-n)}var K=class extends HTMLElement{};customElements.get("hs-menu-item")||customElements.define("hs-menu-item",K);var oe=500,ne=r=>r.key.length===1&&r.key!==" "&&!r.ctrlKey&&!r.metaKey&&!r.altKey,G=class extends b{static properties={label:{type:String},disabled:{type:Boolean,reflect:!0},open:{type:Boolean,reflect:!0},_items:{state:!0,attribute:!1},_active:{state:!0,attribute:!1}};static styles=[ut,f`
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
    `];#t=null;#e=0;#i=!1;#s="";#r=0;constructor(){super(),this.label="",this.disabled=!1,this.open=!1,this._items=[],this._active=0}connectedCallback(){super.connectedCallback(),this.#a()}disconnectedCallback(){super.disconnectedCallback(),this.#t?.(),this.#t=null,clearTimeout(this.#r)}get#o(){return this.renderRoot?.querySelector('[part="menu"]')}get#h(){return this.renderRoot?.querySelector('[part="trigger"]')}#a(){this._items=[...this.querySelectorAll(":scope > hs-menu-item")].map((t,e)=>({index:e,value:t.getAttribute("value")??t.textContent.trim(),label:t.textContent.trim()})),this._active>=this._items.length&&(this._active=0)}refresh(){this.#a()}updated(t){!t.has("open")||!this.#o||this.open!==this.#i&&(this.#i=this.open,this.open?this.#o.showPopover():this.#o.hidePopover())}#l=t=>{this.#i=t.newState==="open",this.open=this.#i};#p=t=>{t.newState==="open"?this.#c():this.#d()};#c(){this.#t=Ut(this.#o,this.#h,{placement:"block-end",align:"start"}),this.#n(this.#e),this.dispatchEvent(new Event("hs-open",{bubbles:!0}))}#d(){this.#t?.(),this.#t=null,this.#e=0,this.#s="",(this.#o.contains(this.renderRoot.activeElement)||document.activeElement===document.body)&&this.#h?.focus(),this.dispatchEvent(new Event("hs-close",{bubbles:!0}))}#n(t){let e=this._items.length;e!==0&&(this._active=(t+e)%e,this.updateComplete.then(()=>{this.renderRoot.querySelectorAll('[part="item"]')[this._active]?.focus()}))}#u=t=>{t.key!=="ArrowDown"&&t.key!=="ArrowUp"||this.open||(t.preventDefault(),this.#e=t.key==="ArrowDown"?0:this._items.length-1,this.#o.showPopover())};#b=t=>{switch(t.key){case"ArrowDown":t.preventDefault(),this.#n(this._active+1);return;case"ArrowUp":t.preventDefault(),this.#n(this._active-1);return;case"Home":t.preventDefault(),this.#n(0);return;case"End":t.preventDefault(),this.#n(this._items.length-1);return;case"Tab":this.#o.hidePopover();return;case"Escape":return;default:}ne(t)&&(t.preventDefault(),this.#m(t.key))};#m(t){clearTimeout(this.#r),this.#r=setTimeout(()=>{this.#s=""},oe),this.#s+=t.toLowerCase();let e=this._items.length,s=this.#s.length===1?this._active+1:this._active;for(let i=0;i<e;i++){let o=(s+i)%e;if(this._items[o].label.toLowerCase().startsWith(this.#s)){this.#n(o);return}}}#f(t){let e=this._items[t];e&&(this.dispatchEvent(new CustomEvent("hs-menu-select",{bubbles:!0,detail:{value:e.value,label:e.label,index:t}})),this.#o.hidePopover())}render(){return p`
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
        @beforetoggle=${this.#l}
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
    `}};customElements.define("hs-menu",G);var Y=class extends HTMLElement{};customElements.get("hs-tab-panel")||customElements.define("hs-tab-panel",Y);var J=class extends b{static properties={selected:{type:Number,reflect:!0},activation:{type:String,reflect:!0},_labels:{state:!0,attribute:!1}};static styles=f`
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
  `;#t=[];constructor(){super(),this.selected=0,this.activation="auto",this._labels=[]}get panels(){return this.#t}#e=()=>{this.#t=[...this.querySelectorAll(":scope > hs-tab-panel")],this.#t.forEach((t,e)=>t.setAttribute("slot",`panel-${e}`)),this._labels=this.#t.map((t,e)=>t.getAttribute("label")||`Tab ${e+1}`),this.selected>=this._labels.length&&(this.selected=0)};#i(t,{focus:e=!1}={}){t===this.selected||t<0||t>=this._labels.length||(this.selected=t,e&&this.#s(t),this.dispatchEvent(new CustomEvent("hs-tab-change",{bubbles:!0,detail:{index:t,label:this._labels[t]}})))}#s(t){this.updateComplete.then(()=>{this.renderRoot.querySelectorAll("button")[t]?.focus()})}#r=t=>{let e=this._labels.length-1,s=Number(t.currentTarget.dataset.index),i=null;switch(t.key){case"ArrowRight":i=s===e?0:s+1;break;case"ArrowLeft":i=s===0?e:s-1;break;case"Home":i=0;break;case"End":i=e;break;case"Enter":case" ":t.preventDefault(),this.#i(s);return;default:return}t.preventDefault(),this.activation==="manual"?(this.#s(i),this.renderRoot.querySelectorAll("button")[i]?.focus()):this.#i(i,{focus:!0})};render(){return p`
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
              @click=${()=>this.#i(e)}
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
    `}};customElements.define("hs-tabs",J);var ae="theme",he="Toggle colour scheme",X=class extends HTMLElement{static observedAttributes=["label"];#t=null;connectedCallback(){this.#t||(this.#t=document.createElement("button"),this.#t.type="button",this.#t.addEventListener("click",()=>this.toggle()),this.append(this.#t)),this.#e()}attributeChangedCallback(){this.isConnected&&this.#e()}get scheme(){let t=document.documentElement.style.colorScheme;return t==="light"||t==="dark"?t:matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}set scheme(t){if(!(t!=="light"&&t!=="dark")){document.documentElement.style.colorScheme=t;try{localStorage.setItem(ae,t)}catch{}this.#e(),this.dispatchEvent(new CustomEvent("hs-theme-change",{bubbles:!0,detail:{scheme:t}}))}}toggle(){this.scheme=this.scheme==="dark"?"light":"dark"}#e(){if(!this.#t)return;let t=this.scheme==="dark";this.#t.setAttribute("aria-label",this.getAttribute("label")||he),this.#t.setAttribute("aria-pressed",String(t)),this.#t.textContent=t?"\u263E":"\u2600"}};customElements.define("hs-theme-toggle",X);var Z=class extends b{static formAssociated=!0;static properties={checked:{type:Boolean,reflect:!0},disabled:{type:Boolean,reflect:!0},name:{type:String},value:{type:String}};static styles=f`
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
  `;#t;#e=!1;constructor(){super(),this.checked=!1,this.disabled=!1,this.value="on",this.#t=this.attachInternals(),this.#t.role="switch"}connectedCallback(){super.connectedCallback(),this.#e=this.hasAttribute("checked"),this.#t.setFormValue(this.checked?this.value:null),this.hasAttribute("tabindex")||(this.tabIndex=this.disabled?-1:0),this.addEventListener("click",this.#i),this.addEventListener("keydown",this.#s)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("click",this.#i),this.removeEventListener("keydown",this.#s)}willUpdate(){this.#t.ariaChecked=String(this.checked),this.#t.ariaDisabled=String(this.disabled),this.disabled?this.setAttribute("aria-disabled","true"):this.removeAttribute("aria-disabled"),this.#t.setFormValue(this.checked?this.value:null),(!this.hasAttribute("tabindex")||this.tabIndex>=0||this.disabled)&&(this.tabIndex=this.disabled?-1:0)}#i=()=>this.toggle();#s=t=>{t.key!==" "&&t.key!=="Enter"||(t.preventDefault(),this.toggle())};toggle(){this.disabled||(this.checked=!this.checked,this.dispatchEvent(new Event("change",{bubbles:!0})))}formResetCallback(){this.checked=this.#e}formStateRestoreCallback(t){this.checked=t!==null}render(){return p`
      <span class="track" part="track" aria-hidden="true">
        <span class="thumb" part="thumb"></span>
      </span>
      <slot></slot>
    `}};customElements.define("hs-toggle",Z);export{U as HsAccordion,R as HsAlert,O as HsBadge,D as HsCard,V as HsCombobox,j as HsCopy,W as HsDialog,F as HsField,G as HsMenu,K as HsMenuItem,I as HsOption,Y as HsTabPanel,J as HsTabs,X as HsThemeToggle,Z as HsToggle};
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

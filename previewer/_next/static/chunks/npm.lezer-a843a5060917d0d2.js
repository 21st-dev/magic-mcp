"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[3068],{50936:()=>{var e;let t=0;class r{constructor(e,t){this.from=e,this.to=t}}class i{constructor(e={}){this.id=t++,this.perNode=!!e.perNode,this.deserialize=e.deserialize||(()=>{throw Error("This node type doesn't define a deserialize function")})}add(e){if(this.perNode)throw RangeError("Can't add per-node props to node types");return"function"!=typeof e&&(e=o.match(e)),t=>{let r=e(t);return void 0===r?null:[this,r]}}}i.closedBy=new i({deserialize:e=>e.split(" ")}),i.openedBy=new i({deserialize:e=>e.split(" ")}),i.group=new i({deserialize:e=>e.split(" ")}),i.isolate=new i({deserialize:e=>{if(e&&"rtl"!=e&&"ltr"!=e&&"auto"!=e)throw RangeError("Invalid value for isolate: "+e);return e||"auto"}}),i.contextHash=new i({perNode:!0}),i.lookAhead=new i({perNode:!0}),i.mounted=new i({perNode:!0});class n{constructor(e,t,r){this.tree=e,this.overlay=t,this.parser=r}static get(e){return e&&e.props&&e.props[i.mounted.id]}}let s=Object.create(null);class o{constructor(e,t,r,i=0){this.name=e,this.props=t,this.id=r,this.flags=i}static define(e){let t=e.props&&e.props.length?Object.create(null):s,r=(e.top?1:0)|(e.skipped?2:0)|(e.error?4:0)|(null==e.name?8:0),i=new o(e.name||"",t,e.id,r);if(e.props){for(let r of e.props)if(Array.isArray(r)||(r=r(i)),r){if(r[0].perNode)throw RangeError("Can't store a per-node prop on a node type");t[r[0].id]=r[1]}}return i}prop(e){return this.props[e.id]}get isTop(){return(1&this.flags)>0}get isSkipped(){return(2&this.flags)>0}get isError(){return(4&this.flags)>0}get isAnonymous(){return(8&this.flags)>0}is(e){if("string"==typeof e){if(this.name==e)return!0;let t=this.prop(i.group);return!!t&&t.indexOf(e)>-1}return this.id==e}static match(e){let t=Object.create(null);for(let r in e)for(let i of r.split(" "))t[i]=e[r];return e=>{for(let r=e.prop(i.group),n=-1;n<(r?r.length:0);n++){let i=t[n<0?e.name:r[n]];if(i)return i}}}}o.none=new o("",Object.create(null),0,8);let l=new WeakMap,h=new WeakMap;!function(e){e[e.ExcludeBuffers=1]="ExcludeBuffers",e[e.IncludeAnonymous=2]="IncludeAnonymous",e[e.IgnoreMounts=4]="IgnoreMounts",e[e.IgnoreOverlays=8]="IgnoreOverlays"}(e||(e={}));class f{constructor(e,t,r,i,n){if(this.type=e,this.children=t,this.positions=r,this.length=i,this.props=null,n&&n.length)for(let[e,t]of(this.props=Object.create(null),n))this.props["number"==typeof e?e:e.id]=t}toString(){let e=n.get(this);if(e&&!e.overlay)return e.tree.toString();let t="";for(let e of this.children){let r=e.toString();r&&(t&&(t+=","),t+=r)}return this.type.name?(/\W/.test(this.type.name)&&!this.type.isError?JSON.stringify(this.type.name):this.type.name)+(t.length?"("+t+")":""):t}cursor(e=0){return new v(this.topNode,e)}cursorAt(e,t=0,r=0){let i=new v(l.get(this)||this.topNode);return i.moveTo(e,t),l.set(this,i._tree),i}get topNode(){return new g(this,0,0,null)}resolve(e,t=0){let r=c(l.get(this)||this.topNode,e,t,!1);return l.set(this,r),r}resolveInner(e,t=0){let r=c(h.get(this)||this.topNode,e,t,!0);return h.set(this,r),r}resolveStack(e,t=0){return function(e,t,r){let i=e.resolveInner(t,r),s=null;for(let e=i instanceof g?i:i.context.parent;e;e=e.parent)if(e.index<0){let n=e.parent;(s||(s=[i])).push(n.resolve(t,r)),e=n}else{let o=n.get(e.tree);if(o&&o.overlay&&o.overlay[0].from<=t&&o.overlay[o.overlay.length-1].to>=t){let n=new g(o.tree,o.overlay[0].from+e.from,-1,e);(s||(s=[i])).push(c(n,t,r,!1))}}return s?k(s):i}(this,e,t)}iterate(t){let{enter:r,leave:i,from:n=0,to:s=this.length}=t,o=t.mode||0,l=(o&e.IncludeAnonymous)>0;for(let t=this.cursor(o|e.IncludeAnonymous);;){let e=!1;if(t.from<=s&&t.to>=n&&(!l&&t.type.isAnonymous||!1!==r(t))){if(t.firstChild())continue;e=!0}for(;e&&i&&(l||!t.type.isAnonymous)&&i(t),!t.nextSibling();){if(!t.parent())return;e=!0}}}prop(e){return e.perNode?this.props?this.props[e.id]:void 0:this.type.prop(e)}get propValues(){let e=[];if(this.props)for(let t in this.props)e.push([+t,this.props[t]]);return e}balance(e={}){return this.children.length<=8?this:A(o.none,this.children,this.positions,0,this.children.length,0,this.length,(e,t,r)=>new f(this.type,e,t,r,this.propValues),e.makeTree||((e,t,r)=>new f(o.none,e,t,r)))}static build(e){return function(e){var t;let{buffer:r,nodeSet:n,maxBufferLength:s=1024,reused:o=[],minRepeatType:l=n.types.length}=e,h=Array.isArray(r)?new a(r,r.length):r,d=n.types,c=0,p=0;function g(e,t,r,i,s,o,l,h,f){let a=[],u=[];for(;e.length>i;)a.push(e.pop()),u.push(t.pop()+r-s);e.push(m(n.types[l],a,u,o-s,h-o,f)),t.push(s-r)}function m(e,t,r,n,s,o,l){if(o){let e=[i.contextHash,o];l=l?[e].concat(l):[e]}if(s>25){let e=[i.lookAhead,s];l=l?[e].concat(l):[e]}return new f(e,t,r,n,l)}let x=[],y=[];for(;h.pos>0;)!function e(t,r,a,x,y,b){let{id:k,start:w,end:v,size:_}=h,N=p,C=c;for(;_<0;){if(h.next(),-1==_){let e=o[k];a.push(e),x.push(w-t);return}if(-3==_){c=k;return}if(-4==_){p=k;return}throw RangeError(`Unrecognized record size: ${_}`)}let S=d[k],I,O,B=w-t;if(v-w<=s&&(O=function(e,t){let r=h.fork(),i=0,n=0,o=0,f=r.end-s,a={size:0,start:0,skip:0};e:for(let s=r.pos-e;r.pos>s;){let e=r.size;if(r.id==t&&e>=0){a.size=i,a.start=n,a.skip=o,o+=4,i+=4,r.next();continue}let h=r.pos-e;if(e<0||h<s||r.start<f)break;let u=r.id>=l?4:0,d=r.start;for(r.next();r.pos>h;){if(r.size<0){if(-3==r.size)u+=4;else break e}else r.id>=l&&(u+=4);r.next()}n=d,i+=e,o+=u}return(t<0||i==e)&&(a.size=i,a.start=n,a.skip=o),a.size>4?a:void 0}(h.pos-r,y))){let e=new Uint16Array(O.size-O.skip),r=h.pos-O.size,i=e.length;for(;h.pos>r;)i=function e(t,r,i){let{id:n,start:s,end:o,size:f}=h;if(h.next(),f>=0&&n<l){let l=i;if(f>4){let n=h.pos-(f-4);for(;h.pos>n;)i=e(t,r,i)}r[--i]=l,r[--i]=o-t,r[--i]=s-t,r[--i]=n}else -3==f?c=n:-4==f&&(p=n);return i}(O.start,e,i);I=new u(e,v-O.start,n),B=O.start-t}else{let t=h.pos-_;h.next();let r=[],o=[],a=k>=l?k:-1,d=0,c=v;for(;h.pos>t;)a>=0&&h.id==a&&h.size>=0?(h.end<=c-s&&(g(r,o,w,d,h.end,c,a,N,C),d=r.length,c=h.end),h.next()):b>2500?function(e,t,r,i){let o=[],l=0,f=-1;for(;h.pos>t;){let{id:e,start:t,end:r,size:i}=h;if(i>4)h.next();else if(f>-1&&t<f)break;else f<0&&(f=r-s),o.push(e,t,r),l++,h.next()}if(l){let t=new Uint16Array(4*l),s=o[o.length-2];for(let e=o.length-3,r=0;e>=0;e-=3)t[r++]=o[e],t[r++]=o[e+1]-s,t[r++]=o[e+2]-s,t[r++]=r;r.push(new u(t,o[2]-s,n)),i.push(s-e)}}(w,t,r,o):e(w,t,r,o,a,b+1);if(a>=0&&d>0&&d<r.length&&g(r,o,w,d,w,c,a,N,C),r.reverse(),o.reverse(),a>-1&&d>0){let e=function(e,t){return(r,n,s)=>{let o=0,l=r.length-1,h,a;if(l>=0&&(h=r[l])instanceof f){if(!l&&h.type==e&&h.length==s)return h;(a=h.prop(i.lookAhead))&&(o=n[l]+h.length+a)}return m(e,r,n,s,o,t)}}(S,C);I=A(S,r,o,0,r.length,0,v-w,e,e)}else I=m(S,r,o,v-w,N-v,C)}a.push(I),x.push(B)}(e.start||0,e.bufferStart||0,x,y,-1,0);let b=null!==(t=e.length)&&void 0!==t?t:x.length?y[0]+x[0].length:0;return new f(d[e.topID],x.reverse(),y.reverse(),b)}(e)}}f.empty=new f(o.none,[],[],0);class a{constructor(e,t){this.buffer=e,this.index=t}get id(){return this.buffer[this.index-4]}get start(){return this.buffer[this.index-3]}get end(){return this.buffer[this.index-2]}get size(){return this.buffer[this.index-1]}get pos(){return this.index}next(){this.index-=4}fork(){return new a(this.buffer,this.index)}}class u{constructor(e,t,r){this.buffer=e,this.length=t,this.set=r}get type(){return o.none}toString(){let e=[];for(let t=0;t<this.buffer.length;)e.push(this.childString(t)),t=this.buffer[t+3];return e.join(",")}childString(e){let t=this.buffer[e],r=this.buffer[e+3],i=this.set.types[t],n=i.name;if(/\W/.test(n)&&!i.isError&&(n=JSON.stringify(n)),r==(e+=4))return n;let s=[];for(;e<r;)s.push(this.childString(e)),e=this.buffer[e+3];return n+"("+s.join(",")+")"}findChild(e,t,r,i,n){let{buffer:s}=this,o=-1;for(let l=e;l!=t&&(!d(n,i,s[l+1],s[l+2])||(o=l,!(r>0)));l=s[l+3]);return o}slice(e,t,r){let i=this.buffer,n=new Uint16Array(t-e),s=0;for(let o=e,l=0;o<t;){n[l++]=i[o++],n[l++]=i[o++]-r;let t=n[l++]=i[o++]-r;n[l++]=i[o++]-e,s=Math.max(s,t)}return new u(n,s,this.set)}}function d(e,t,r,i){switch(e){case -2:return r<t;case -1:return i>=t&&r<t;case 0:return r<t&&i>t;case 1:return r<=t&&i>t;case 2:return i>t;case 4:return!0}}function c(t,r,i,n){for(var s;t.from==t.to||(i<1?t.from>=r:t.from>r)||(i>-1?t.to<=r:t.to<r);){let e=!n&&t instanceof g&&t.index<0?null:t.parent;if(!e)return t;t=e}let o=n?0:e.IgnoreOverlays;if(n)for(let e=t,n=e.parent;n;n=(e=n).parent)e instanceof g&&e.index<0&&(null===(s=n.enter(r,i,o))||void 0===s?void 0:s.from)!=e.from&&(t=n);for(;;){let e=t.enter(r,i,o);if(!e)return t;t=e}}class p{cursor(e=0){return new v(this,e)}getChild(e,t=null,r=null){let i=m(this,e,t,r);return i.length?i[0]:null}getChildren(e,t=null,r=null){return m(this,e,t,r)}resolve(e,t=0){return c(this,e,t,!1)}resolveInner(e,t=0){return c(this,e,t,!0)}matchContext(e){return x(this.parent,e)}enterUnfinishedNodesBefore(e){let t=this.childBefore(e),r=this;for(;t;){let e=t.lastChild;if(!e||e.to!=t.to)break;e.type.isError&&e.from==e.to?(r=t,t=e.prevSibling):t=e}return r}get node(){return this}get next(){return this.parent}}class g extends p{constructor(e,t,r,i){super(),this._tree=e,this.from=t,this.index=r,this._parent=i}get type(){return this._tree.type}get name(){return this._tree.type.name}get to(){return this.from+this._tree.length}nextChild(t,r,i,s,o=0){for(let l=this;;){for(let{children:h,positions:f}=l._tree,a=r>0?h.length:-1;t!=a;t+=r){let a=h[t],c=f[t]+l.from;if(d(s,i,c,c+a.length)){if(a instanceof u){if(o&e.ExcludeBuffers)continue;let n=a.findChild(0,a.buffer.length,r,i-c,s);if(n>-1)return new b(new y(l,a,t,c),null,n)}else if(o&e.IncludeAnonymous||!a.type.isAnonymous||_(a)){let h;if(!(o&e.IgnoreMounts)&&(h=n.get(a))&&!h.overlay)return new g(h.tree,c,t,l);let f=new g(a,c,t,l);return o&e.IncludeAnonymous||!f.type.isAnonymous?f:f.nextChild(r<0?a.children.length-1:0,r,i,s)}}}if(o&e.IncludeAnonymous||!l.type.isAnonymous||(t=l.index>=0?l.index+r:r<0?-1:l._parent._tree.children.length,!(l=l._parent)))return null}}get firstChild(){return this.nextChild(0,1,0,4)}get lastChild(){return this.nextChild(this._tree.children.length-1,-1,0,4)}childAfter(e){return this.nextChild(0,1,e,2)}childBefore(e){return this.nextChild(this._tree.children.length-1,-1,e,-2)}enter(t,r,i=0){let s;if(!(i&e.IgnoreOverlays)&&(s=n.get(this._tree))&&s.overlay){let e=t-this.from;for(let{from:t,to:i}of s.overlay)if((r>0?t<=e:t<e)&&(r<0?i>=e:i>e))return new g(s.tree,s.overlay[0].from+this.from,-1,this)}return this.nextChild(0,1,t,r,i)}nextSignificantParent(){let e=this;for(;e.type.isAnonymous&&e._parent;)e=e._parent;return e}get parent(){return this._parent?this._parent.nextSignificantParent():null}get nextSibling(){return this._parent&&this.index>=0?this._parent.nextChild(this.index+1,1,0,4):null}get prevSibling(){return this._parent&&this.index>=0?this._parent.nextChild(this.index-1,-1,0,4):null}get tree(){return this._tree}toTree(){return this._tree}toString(){return this._tree.toString()}}function m(e,t,r,i){let n=e.cursor(),s=[];if(!n.firstChild())return s;if(null!=r){for(let e=!1;!e;)if(e=n.type.is(r),!n.nextSibling())return s}for(;;){if(null!=i&&n.type.is(i))return s;if(n.type.is(t)&&s.push(n.node),!n.nextSibling())return null==i?s:[]}}function x(e,t,r=t.length-1){for(let i=e;r>=0;i=i.parent){if(!i)return!1;if(!i.type.isAnonymous){if(t[r]&&t[r]!=i.name)return!1;r--}}return!0}class y{constructor(e,t,r,i){this.parent=e,this.buffer=t,this.index=r,this.start=i}}class b extends p{get name(){return this.type.name}get from(){return this.context.start+this.context.buffer.buffer[this.index+1]}get to(){return this.context.start+this.context.buffer.buffer[this.index+2]}constructor(e,t,r){super(),this.context=e,this._parent=t,this.index=r,this.type=e.buffer.set.types[e.buffer.buffer[r]]}child(e,t,r){let{buffer:i}=this.context,n=i.findChild(this.index+4,i.buffer[this.index+3],e,t-this.context.start,r);return n<0?null:new b(this.context,this,n)}get firstChild(){return this.child(1,0,4)}get lastChild(){return this.child(-1,0,4)}childAfter(e){return this.child(1,e,2)}childBefore(e){return this.child(-1,e,-2)}enter(t,r,i=0){if(i&e.ExcludeBuffers)return null;let{buffer:n}=this.context,s=n.findChild(this.index+4,n.buffer[this.index+3],r>0?1:-1,t-this.context.start,r);return s<0?null:new b(this.context,this,s)}get parent(){return this._parent||this.context.parent.nextSignificantParent()}externalSibling(e){return this._parent?null:this.context.parent.nextChild(this.context.index+e,e,0,4)}get nextSibling(){let{buffer:e}=this.context,t=e.buffer[this.index+3];return t<(this._parent?e.buffer[this._parent.index+3]:e.buffer.length)?new b(this.context,this._parent,t):this.externalSibling(1)}get prevSibling(){let{buffer:e}=this.context,t=this._parent?this._parent.index+4:0;return this.index==t?this.externalSibling(-1):new b(this.context,this._parent,e.findChild(t,this.index,-1,0,4))}get tree(){return null}toTree(){let e=[],t=[],{buffer:r}=this.context,i=this.index+4,n=r.buffer[this.index+3];if(n>i){let s=r.buffer[this.index+1];e.push(r.slice(i,n,s)),t.push(0)}return new f(this.type,e,t,this.to-this.from)}toString(){return this.context.buffer.childString(this.index)}}function k(e){if(!e.length)return null;let t=0,r=e[0];for(let i=1;i<e.length;i++){let n=e[i];(n.from>r.from||n.to<r.to)&&(r=n,t=i)}let i=r instanceof g&&r.index<0?null:r.parent,n=e.slice();return i?n[t]=i:n.splice(t,1),new w(n,r)}class w{constructor(e,t){this.heads=e,this.node=t}get next(){return k(this.heads)}}class v{get name(){return this.type.name}constructor(e,t=0){if(this.mode=t,this.buffer=null,this.stack=[],this.index=0,this.bufferNode=null,e instanceof g)this.yieldNode(e);else{this._tree=e.context.parent,this.buffer=e.context;for(let t=e._parent;t;t=t._parent)this.stack.unshift(t.index);this.bufferNode=e,this.yieldBuf(e.index)}}yieldNode(e){return!!e&&(this._tree=e,this.type=e.type,this.from=e.from,this.to=e.to,!0)}yieldBuf(e,t){this.index=e;let{start:r,buffer:i}=this.buffer;return this.type=t||i.set.types[i.buffer[e]],this.from=r+i.buffer[e+1],this.to=r+i.buffer[e+2],!0}yield(e){return!!e&&(e instanceof g?(this.buffer=null,this.yieldNode(e)):(this.buffer=e.context,this.yieldBuf(e.index,e.type)))}toString(){return this.buffer?this.buffer.buffer.childString(this.index):this._tree.toString()}enterChild(e,t,r){if(!this.buffer)return this.yield(this._tree.nextChild(e<0?this._tree._tree.children.length-1:0,e,t,r,this.mode));let{buffer:i}=this.buffer,n=i.findChild(this.index+4,i.buffer[this.index+3],e,t-this.buffer.start,r);return!(n<0)&&(this.stack.push(this.index),this.yieldBuf(n))}firstChild(){return this.enterChild(1,0,4)}lastChild(){return this.enterChild(-1,0,4)}childAfter(e){return this.enterChild(1,e,2)}childBefore(e){return this.enterChild(-1,e,-2)}enter(t,r,i=this.mode){return this.buffer?!(i&e.ExcludeBuffers)&&this.enterChild(1,t,r):this.yield(this._tree.enter(t,r,i))}parent(){if(!this.buffer)return this.yieldNode(this.mode&e.IncludeAnonymous?this._tree._parent:this._tree.parent);if(this.stack.length)return this.yieldBuf(this.stack.pop());let t=this.mode&e.IncludeAnonymous?this.buffer.parent:this.buffer.parent.nextSignificantParent();return this.buffer=null,this.yieldNode(t)}sibling(e){if(!this.buffer)return!!this._tree._parent&&this.yield(this._tree.index<0?null:this._tree._parent.nextChild(this._tree.index+e,e,0,4,this.mode));let{buffer:t}=this.buffer,r=this.stack.length-1;if(e<0){let e=r<0?0:this.stack[r]+4;if(this.index!=e)return this.yieldBuf(t.findChild(e,this.index,-1,0,4))}else{let e=t.buffer[this.index+3];if(e<(r<0?t.buffer.length:t.buffer[this.stack[r]+3]))return this.yieldBuf(e)}return r<0&&this.yield(this.buffer.parent.nextChild(this.buffer.index+e,e,0,4,this.mode))}nextSibling(){return this.sibling(1)}prevSibling(){return this.sibling(-1)}atLastNode(t){let r,i,{buffer:n}=this;if(n){if(t>0){if(this.index<n.buffer.buffer.length)return!1}else for(let e=0;e<this.index;e++)if(n.buffer.buffer[e+3]<this.index)return!1;({index:r,parent:i}=n)}else({index:r,_parent:i}=this._tree);for(;i;{index:r,_parent:i}=i)if(r>-1)for(let n=r+t,s=t<0?-1:i._tree.children.length;n!=s;n+=t){let t=i._tree.children[n];if(this.mode&e.IncludeAnonymous||t instanceof u||!t.type.isAnonymous||_(t))return!1}return!0}move(e,t){if(t&&this.enterChild(e,0,4))return!0;for(;;){if(this.sibling(e))return!0;if(this.atLastNode(e)||!this.parent())return!1}}next(e=!0){return this.move(1,e)}prev(e=!0){return this.move(-1,e)}moveTo(e,t=0){for(;(this.from==this.to||(t<1?this.from>=e:this.from>e)||(t>-1?this.to<=e:this.to<e))&&this.parent(););for(;this.enterChild(1,e,t););return this}get node(){if(!this.buffer)return this._tree;let e=this.bufferNode,t=null,r=0;if(e&&e.context==this.buffer)e:for(let i=this.index,n=this.stack.length;n>=0;){for(let s=e;s;s=s._parent)if(s.index==i){if(i==this.index)return s;t=s,r=n+1;break e}i=this.stack[--n]}for(let e=r;e<this.stack.length;e++)t=new b(this.buffer,t,this.stack[e]);return this.bufferNode=new b(this.buffer,t,this.index)}get tree(){return this.buffer?null:this._tree._tree}iterate(e,t){for(let r=0;;){let i=!1;if(this.type.isAnonymous||!1!==e(this)){if(this.firstChild()){r++;continue}this.type.isAnonymous||(i=!0)}for(;;){if(i&&t&&t(this),i=this.type.isAnonymous,!r)return;if(this.nextSibling())break;this.parent(),r--,i=!0}}}matchContext(e){if(!this.buffer)return x(this.node.parent,e);let{buffer:t}=this.buffer,{types:r}=t.set;for(let i=e.length-1,n=this.stack.length-1;i>=0;n--){if(n<0)return x(this._tree,e,i);let s=r[t.buffer[this.stack[n]]];if(!s.isAnonymous){if(e[i]&&e[i]!=s.name)return!1;i--}}return!0}}function _(e){return e.children.some(e=>e instanceof u||!e.type.isAnonymous||_(e))}let N=new WeakMap;function C(e,t){if(!e.isAnonymous||t instanceof u||t.type!=e)return 1;let r=N.get(t);if(null==r){for(let i of(r=1,t.children)){if(i.type!=e||!(i instanceof f)){r=1;break}r+=C(e,i)}N.set(t,r)}return r}function A(e,t,r,i,n,s,o,l,h){let f=0;for(let r=i;r<n;r++)f+=C(e,t[r]);let a=Math.ceil(1.5*f/8),u=[],d=[];return!function t(r,i,n,o,l){for(let f=n;f<o;){let n=f,c=i[f],p=C(e,r[f]);for(f++;f<o;f++){let t=C(e,r[f]);if(p+t>=a)break;p+=t}if(f==n+1){if(p>a){let e=r[n];t(e.children,e.positions,0,e.children.length,i[n]+l);continue}u.push(r[n])}else{let t=i[f-1]+r[f-1].length-c;u.push(A(e,r,i,n,f,c,t,null,h))}d.push(c+l-s)}}(t,r,i,n,0),(l||h)(u,d,o)}class S{constructor(e,t,r,i,n=!1,s=!1){this.from=e,this.to=t,this.tree=r,this.offset=i,this.open=(n?1:0)|(s?2:0)}get openStart(){return(1&this.open)>0}get openEnd(){return(2&this.open)>0}static addTree(e,t=[],r=!1){let i=[new S(0,e.length,e,0,!1,r)];for(let r of t)r.to>e.length&&i.push(r);return i}static applyChanges(e,t,r=128){if(!t.length)return e;let i=[],n=1,s=e.length?e[0]:null;for(let o=0,l=0,h=0;;o++){let f=o<t.length?t[o]:null,a=f?f.fromA:1e9;if(a-l>=r)for(;s&&s.from<a;){let t=s;if(l>=t.from||a<=t.to||h){let e=Math.max(t.from,l)-h,r=Math.min(t.to,a)-h;t=e>=r?null:new S(e,r,t.tree,t.offset+h,o>0,!!f)}if(t&&i.push(t),s.to>a)break;s=n<e.length?e[n++]:null}if(!f)break;l=f.toA,h=f.toA-f.toB}return i}}let I=new i({perNode:!0});class O{constructor(t,r){this.offset=r,this.done=!1,this.cursor=t.cursor(e.IncludeAnonymous|e.IgnoreMounts)}moveTo(t){let{cursor:r}=this,i=t-this.offset;for(;!this.done&&r.from<i;)r.to>=t&&r.enter(i,1,e.IgnoreOverlays|e.ExcludeBuffers)||r.next(!1)||(this.done=!0)}hasNode(e){if(this.moveTo(e.from),!this.done&&this.cursor.from+this.offset==e.from&&this.cursor.tree)for(let t=this.cursor.tree;;){if(t==e.tree)return!0;if(t.children.length&&0==t.positions[0]&&t.children[0]instanceof f)t=t.children[0];else break}return!1}}let B=0;class z{constructor(e,t,r,i){this.name=e,this.set=t,this.base=r,this.modified=i,this.id=B++}toString(){let{name:e}=this;for(let t of this.modified)t.name&&(e=`${t.name}(${e})`);return e}static define(e,t){if(e instanceof z&&(t=e),null==t?void 0:t.base)throw Error("Can not derive from a modified tag");let r=new z("string"==typeof e?e:"?",[],null,[]);if(r.set.push(r),t)for(let e of t.set)r.set.push(e);return r}static defineModifier(e){let t=new M(e);return e=>e.modified.indexOf(t)>-1?e:M.get(e.base||e,e.modified.concat(t).sort((e,t)=>e.id-t.id))}}let E=0;class M{constructor(e){this.name=e,this.instances=[],this.id=E++}static get(e,t){if(!t.length)return e;let r=t[0].instances.find(r=>{var i;return r.base==e&&(i=r.modified,t.length==i.length&&t.every((e,t)=>e==i[t]))});if(r)return r;let i=[],n=new z(e.name,i,e,t);for(let e of t)e.instances.push(n);let s=function(e){let t=[[]];for(let r=0;r<e.length;r++)for(let i=0,n=t.length;i<n;i++)t.push(t[i].concat(e[r]));return t.sort((e,t)=>t.length-e.length)}(t);for(let t of e.set)if(!t.modified.length)for(let e of s)i.push(M.get(t,e));return n}}new i;class T{constructor(e,t,r,i){this.tags=e,this.mode=t,this.context=r,this.next=i}get opaque(){return 0==this.mode}get inherit(){return 1==this.mode}sort(e){return!e||e.depth<this.depth?(this.next=e,this):(e.next=this.sort(e.next),e)}get depth(){return this.context?this.context.length:0}}T.empty=new T([],2,null);let j=z.define,U=j(),W=j(),K=j(W),P=j(W),R=j(),q=j(R),V=j(R),$=j(),H=j($),J=j(),L=j(),D=j(),F=j(D),G=j(),Q={comment:U,lineComment:j(U),blockComment:j(U),docComment:j(U),name:W,variableName:j(W),typeName:K,tagName:j(K),propertyName:P,attributeName:j(P),className:j(W),labelName:j(W),namespace:j(W),macroName:j(W),literal:R,string:q,docString:j(q),character:j(q),attributeValue:j(q),number:V,integer:j(V),float:j(V),bool:j(R),regexp:j(R),escape:j(R),color:j(R),url:j(R),keyword:J,self:j(J),null:j(J),atom:j(J),unit:j(J),modifier:j(J),operatorKeyword:j(J),controlKeyword:j(J),definitionKeyword:j(J),moduleKeyword:j(J),operator:L,derefOperator:j(L),arithmeticOperator:j(L),logicOperator:j(L),bitwiseOperator:j(L),compareOperator:j(L),updateOperator:j(L),definitionOperator:j(L),typeOperator:j(L),controlOperator:j(L),punctuation:D,separator:j(D),bracket:F,angleBracket:j(F),squareBracket:j(F),paren:j(F),brace:j(F),content:$,heading:H,heading1:j(H),heading2:j(H),heading3:j(H),heading4:j(H),heading5:j(H),heading6:j(H),contentSeparator:j($),list:j($),quote:j($),emphasis:j($),strong:j($),link:j($),monospace:j($),strikethrough:j($),inserted:j(),deleted:j(),changed:j(),invalid:j(),meta:G,documentMeta:j(G),annotation:j(G),processingInstruction:j(G),definition:z.defineModifier("definition"),constant:z.defineModifier("constant"),function:z.defineModifier("function"),standard:z.defineModifier("standard"),local:z.defineModifier("local"),special:z.defineModifier("special")};for(let e in Q){let t=Q[e];t instanceof z&&(t.name=e)}!function(e,t){let r=Object.create(null);for(let t of e)if(Array.isArray(t.tag))for(let e of t.tag)r[e.id]=t.class;else r[t.tag.id]=t.class;let{scope:i,all:n=null}={}}([{tag:Q.link,class:"tok-link"},{tag:Q.heading,class:"tok-heading"},{tag:Q.emphasis,class:"tok-emphasis"},{tag:Q.strong,class:"tok-strong"},{tag:Q.keyword,class:"tok-keyword"},{tag:Q.atom,class:"tok-atom"},{tag:Q.bool,class:"tok-bool"},{tag:Q.url,class:"tok-url"},{tag:Q.labelName,class:"tok-labelName"},{tag:Q.inserted,class:"tok-inserted"},{tag:Q.deleted,class:"tok-deleted"},{tag:Q.literal,class:"tok-literal"},{tag:Q.string,class:"tok-string"},{tag:Q.number,class:"tok-number"},{tag:[Q.regexp,Q.escape,Q.special(Q.string)],class:"tok-string2"},{tag:Q.variableName,class:"tok-variableName"},{tag:Q.local(Q.variableName),class:"tok-variableName tok-local"},{tag:Q.definition(Q.variableName),class:"tok-variableName tok-definition"},{tag:Q.special(Q.variableName),class:"tok-variableName2"},{tag:Q.definition(Q.propertyName),class:"tok-propertyName tok-definition"},{tag:Q.typeName,class:"tok-typeName"},{tag:Q.namespace,class:"tok-namespace"},{tag:Q.className,class:"tok-className"},{tag:Q.macroName,class:"tok-macroName"},{tag:Q.propertyName,class:"tok-propertyName"},{tag:Q.operator,class:"tok-operator"},{tag:Q.comment,class:"tok-comment"},{tag:Q.meta,class:"tok-meta"},{tag:Q.invalid,class:"tok-invalid"},{tag:Q.punctuation,class:"tok-punctuation"}])}}]);
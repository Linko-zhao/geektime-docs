你好，我是winter。

在前面的课程中，我们已经学习了DOM相关的API，狭义的DOM API仅仅包含DOM树形结构相关的内容。今天，我们再来学习一类新的API：CSSOM。

我想，你在最初接触浏览器API的时候，应该都有跟我类似的想法：“好想要element.width、element.height这样的API啊”。

这样的API可以直接获取元素的显示相关信息，它们是非常符合人的第一印象直觉的设计，但是，偏偏 DOM API 中没有这样的内容。

随着学习的深入，我才知道，这样的设计是有背后的逻辑的，正如HTML和CSS分别承担了语义和表现的分工，DOM和CSSOM也有语义和表现的分工。

DOM中的所有的属性都是用来表现语义的属性，CSSOM的则都是表现的属性，width和height这类显示相关的属性，都属于我们今天要讲的CSSOM。

顾名思义，CSSOM是CSS的对象模型，在W3C标准中，它包含两个部分：描述样式表和规则等CSS的模型部分（CSSOM），和跟元素视图相关的View部分（CSSOM View）。

在实际使用中，CSSOM View比CSSOM更常用一些，因为我们很少需要用代码去动态地管理样式表。

在今天的文章中，我来分别为你介绍这两部分的API。

## CSSOM

首先我们来介绍下CSS中样式表的模型，也就是CSSOM的本体。

我们通常创建样式表也都是使用HTML标签来做到的，我们用style标签和link标签创建样式表，例如：

```
<style title="Hello">
a {
  color:red;
}
</style>
<link rel="stylesheet" title="x" href="data:text/css,p%7Bcolor:blue%7D">
```

我们创建好样式表后，还有可能要对它进行一些操作。如果我们以DOM的角度去理解的话，这些标签在DOM中是一个节点，它们有节点的内容、属性，这两个标签中，CSS代码有的在属性、有的在子节点。这两个标签也遵循DOM节点的操作规则，所以可以使用DOM API去访问。

但是，这样做的后果是我们需要去写很多分支逻辑，并且，要想解析CSS代码结构也不是一件简单的事情，所以，这种情况下，我们直接使用CSSOM API去操作它们生成的样式表，这是一个更好的选择。

我们首先了解一下CSSOM API的基本用法，一般来说，我们需要先获取文档中所有的样式表：

```
document.styleSheets
```

document的styleSheets属性表示文档中的所有样式表，这是一个只读的列表，我们可以用方括号运算符下标访问样式表，也可以使用item方法来访问，它有length属性表示文档中的样式表数量。

样式表只能使用style标签或者link标签创建（对XML来说，还可以使用，咱们暂且不表）。

我们虽然无法用CSSOM API来创建样式表，但是我们可以修改样式表中的内容。

```JavaScript
document.styleSheets[0].insertRule("p { color:pink; }", 0)
document.styleSheets[0].removeRule(0)
```

更进一步，我们可以获取样式表中特定的规则（Rule），并且对它进行一定的操作，具体来说，就是使用它的cssRules属性来实现：

```JavaScript
document.styleSheets[0].cssRules
```

这里取到的规则列表，同样是支持item、length和下标运算。

不过，这里的Rules可就没那么简单了，它可能是CSS的at-rule，也可能是普通的样式规则。不同的rule类型，具有不同的属性。

我们在CSS语法部分，已经为你整理过at-rule的完整列表，多数at-rule都对应着一个rule类型：

- CSSStyleRule
- CSSCharsetRule
- CSSImportRule
- CSSMediaRule
- CSSFontFaceRule
- CSSPageRule
- CSSNamespaceRule
- CSSKeyframesRule
- CSSKeyframeRule
- CSSSupportsRule

具体的规则支持的属性，建议你可以用到的时候，再去查阅MDN或者W3C的文档，在我们的文章中，仅为你详细介绍最常用的 CSSStyleRule。

CSSStyleRule有两个属性：selectorText 和 style，分别表示一个规则的选择器部分和样式部分。

selector部分是一个字符串，这里显然偷懒了没有设计进一步的选择器模型，我们按照选择器语法设置即可。

style部分是一个样式表，它跟我们元素的style属性是一样的类型，所以我们可以像修改内联样式一样，直接改变属性修改规则中的具体CSS属性定义，也可以使用cssText这样的工具属性。

此外，CSSOM还提供了一个非常重要的方法，来获取一个元素最终经过CSS计算得到的属性：

```
window.getComputedStyle(elt, pseudoElt);
```

其中第一个参数就是我们要获取属性的元素，第二个参数是可选的，用于选择伪元素。

好了，到此为止，我们可以使用CSSOM API自由地修改页面已经生效的样式表了。接下来，我们来一起关注一下视图的问题。

## CSSOM View

CSSOM View 这一部分的API，可以视为DOM API的扩展，它在原本的Element接口上，添加了显示相关的功能，这些功能，又可以分成三个部分：窗口部分，滚动部分和布局部分，下面我来分别带你了解一下。

## 窗口 API

窗口API用于操作浏览器窗口的位置、尺寸等。

- moveTo(x, y) 窗口移动到屏幕的特定坐标；
- moveBy(x, y) 窗口移动特定距离；
- resizeTo(x, y) 改变窗口大小到特定尺寸；
- resizeBy(x, y) 改变窗口大小特定尺寸。

此外，窗口API还规定了 window.open() 的第三个参数：

```
window.open("about:blank", "_blank" ,"width=100,height=100,left=100,right=100" )
```

一些浏览器出于安全考虑没有实现，也不适用于移动端浏览器，这部分你仅需简单了解即可。下面我们来了解一下滚动API。

## 滚动 API

要想理解滚动，首先我们必须要建立一个概念，在PC时代，浏览器可视区域的滚动和内部元素的滚动关系是比较模糊的，但是在移动端越来越重要的今天，两者必须分开看待，两者的性能和行为都有区别。

### 视口滚动API

可视区域（视口）滚动行为由window对象上的一组API控制，我们先来了解一下：

- scrollX 是视口的属性，表示X方向上的当前滚动距离，有别名 pageXOffset；
- scrollY 是视口的属性，表示Y方向上的当前滚动距离，有别名 pageYOffset；
- scroll(x, y) 使得页面滚动到特定的位置，有别名scrollTo，支持传入配置型参数 {top, left}；
- scrollBy(x, y) 使得页面滚动特定的距离，支持传入配置型参数 {top, left}。

通过这些属性和方法，我们可以读取视口的滚动位置和操纵视口滚动。不过，要想监听视口滚动事件，我们需要在document对象上绑定事件监听函数：

```
document.addEventListener("scroll", function(event){
  //......
})
```

视口滚动API是页面的顶层容器的滚动，大部分移动端浏览器都会采用一些性能优化，它和元素滚动不完全一样，请大家一定建立这个区分的意识。

### 元素滚动API

接下来我们来认识一下元素滚动API，在Element类（参见DOM部分），为了支持滚动，加入了以下API。

- scrollTop 元素的属性，表示Y方向上的当前滚动距离。
- scrollLeft 元素的属性，表示X方向上的当前滚动距离。
- scrollWidth 元素的属性，表示元素内部的滚动内容的宽度，一般来说会大于等于元素宽度。
- scrollHeight 元素的属性，表示元素内部的滚动内容的高度，一般来说会大于等于元素高度。
- scroll(x, y) 使得元素滚动到特定的位置，有别名scrollTo，支持传入配置型参数 {top, left}。
- scrollBy(x, y) 使得元素滚动到特定的位置，支持传入配置型参数 {top, left}。
- scrollIntoView(arg) 滚动元素所在的父元素，使得元素滚动到可见区域，可以通过arg来指定滚到中间、开始或者就近。

除此之外，可滚动的元素也支持scroll事件，我们在元素上监听它的事件即可：

```
element.addEventListener("scroll", function(event){
  //......
})
```

这里你需要注意一点，元素部分的API设计与视口滚动命名风格上略有差异，你在使用的时候不要记混。

## 布局API

最后我们来介绍一下布局API，这是整个CSSOM中最常用到的部分，我们同样要分成全局API和元素上的API。

### 全局尺寸信息

window对象上提供了一些全局的尺寸信息，它是通过属性来提供的，我们一起来了解一下来这些属性。

![](https://static001.geekbang.org/resource/image/b6/10/b6c7281d86eb7214edf17069f95ae610.png?wh=1134%2A424)

- window.innerHeight, window.innerWidth 这两个属性表示视口的大小。
- window.outerWidth, window.outerHeight 这两个属性表示浏览器窗口占据的大小，很多浏览器没有实现，一般来说这两个属性无关紧要。
- window.devicePixelRatio 这个属性非常重要，表示物理像素和CSS像素单位的倍率关系，Retina屏这个值是2，后来也出现了一些3倍的Android屏。
- window.screen （屏幕尺寸相关的信息）

  - window.screen.width, window.screen.height 设备的屏幕尺寸。
  - window.screen.availWidth, window.screen.availHeight 设备屏幕的可渲染区域尺寸，一些Android机器会把屏幕的一部分预留做固定按钮，所以有这两个属性，实际上一般浏览器不会实现的这么细致。
  - window.screen.colorDepth, window.screen.pixelDepth 这两个属性是固定值24，应该是为了以后预留。

虽然window有这么多相关信息，在我看来，我们主要使用的是innerHeight、innerWidth和devicePixelRatio三个属性，因为我们前端开发工作只需要跟视口打交道，其它信息大概了解即可。

### 元素的布局信息

最后我们来到了本节课一开始提到的问题，我们是否能够取到一个元素的宽（width）和高（height）呢？

实际上，我们首先应该从脑中消除“元素有宽高”这样的概念，我们课程中已经多次提到了，有些元素可能产生多个盒，事实上，只有盒有宽和高，元素是没有的。

所以我们获取宽高的对象应该是“盒”，于是CSSOM View为Element类添加了两个方法：

- getClientRects();
- getBoundingClientRect()。

getClientRects 会返回一个列表，里面包含元素对应的每一个盒所占据的客户端矩形区域，这里每一个矩形区域可以用 x, y, width, height 来获取它的位置和尺寸。

getBoundingClientRect ，这个API的设计更接近我们脑海中的元素盒的概念，它返回元素对应的所有盒的包裹的矩形区域，需要注意，这个API获取的区域会包括当overflow为visible时的子元素区域。

根据实际的精确度需要，我们可以选择何时使用这两个API。

这两个API获取的矩形区域都是相对于视口的坐标，这意味着，这些区域都是受滚动影响的。

如果我们要获取相对坐标，或者包含滚动区域的坐标，需要一点小技巧：

```JavaScript
var offsetX = document.documentElement.getBoundingClientRect().x - element.getBoundingClientRect().x;
```

如这段代码所示，我们只需要获取文档跟节点的位置，再相减即可得到它们的坐标。

这两个API的兼容性非常好，定义又非常清晰，建议你如果是用JavaScript实现视觉效果时，尽量使用这两个API。

## 结语

今天我们一起学习了CSSOM这一类型的API。我们首先就说到了，就像HTML和CSS分别承担了语义和表现的分工，DOM和CSSOM也有语义和表现的分工。

CSSOM是CSS的对象模型，在W3C标准中，它包含两个部分：描述样式表和规则等CSS的模型部分（CSSOM），和跟元素视图相关的View部分（CSSOM View）。

最后留给你一个问题，写好欢迎留言来讨论，请找一个网页，用我们今天讲的API，把页面上的所有盒的轮廓画到一个canvas元素上。

# 猜你喜欢

[![unpreview](https://static001.geekbang.org/resource/image/1a/08/1a49758821bdbdf6f0a8a1dc5bf39f08.jpg?wh=1032%2A330)](https://time.geekbang.org/course/intro/163?utm_term=zeusMTA7L&utm_source=app&utm_medium=chongxueqianduan&utm_campaign=163-presell)
<div><strong>精选留言（15）</strong></div><ul>
<li><span>Geek_ianp87</span> 👍（1） 💬（1）<p>display:inline;的元素会不会产生盒？</p>2019-10-09</li><br/><li><span>Russell</span> 👍（0） 💬（1）<p>这个咋换行啊。。。 不好意思，老师好，我想咨询浏览器API的种类。 我可以认为是，DOM，BOM，CSSOM这几类么？</p>2019-04-03</li><br/><li><span>阿成</span> 👍（61） 💬（2）<p>Look via gist: https:&#47;&#47;gist.github.com&#47;aimergenge&#47;2bcf41ac4c4d2586e48ccd5cec5c9768

void function () {
const canvas = document.createElement(&#39;canvas&#39;)

canvas.width = document.documentElement.offsetWidth
canvas.height = document.documentElement.offsetHeight

canvas.style.position = &#39;absolute&#39;
canvas.style.left = &#39;0&#39;
canvas.style.right = &#39;0&#39;
canvas.style.top = &#39;0&#39;
canvas.style.bottom = &#39;0&#39;
canvas.style.zIndex = &#39;99999&#39;

document.body.appendChild(canvas)

const ctx = canvas.getContext(&#39;2d&#39;)
draw(ctx, getAllRects())

function draw (ctx, rects) {
let i = 0
ctx.strokeStyle = &#39;red&#39;
window.requestAnimationFrame(_draw)

    function _draw () {
      let {x, y, width, height} = rects[i++]
      ctx.strokeRect(x, y, width, height)
      if (i &lt; rects.length) {
        window.requestAnimationFrame(_draw)
      } else {
        console.log(&#39;%cDONE&#39;, &#39;background-color: green; color: white; padding: 0.3em 0.5em;&#39;)
      }
    }

}

function getAllRects () {
const allElements = document.querySelectorAll(&#39;*&#39;)
const rects = []
const {x: htmlX, y: htmlY} = document.documentElement.getBoundingClientRect()
allElements.forEach(element =&gt; {
const eachElRects = Array.from(element.getClientRects()).filter(rect =&gt; {
return rect.width || rect.height
}).map(rect =&gt; {
return {
x: rect.x - htmlX,
y: rect.y - htmlY,
width: rect.width,
height: rect.height
}
})
rects.push(...eachElRects)
})
return rects
}
}()
</p>2019-03-16</li><br/><li><span>welkin</span> 👍（14） 💬（6）<p>希望作者能讲一下虚拟dom
还有浏览器的重绘和重排
以及性能优化，跨域的常用操作(希望细致一点)
包括一些漏洞和攻击，比如xss，sql注入
还有一些技术栈，和一些对于前端需要了解的方案，比如离线方案等</p>2019-03-25</li><br/><li><span>热心网友好宅💫</span> 👍（3） 💬（0）<p>一直忍着没问，哪来这么多猫片🤣</p>2019-04-25</li><br/><li><span>周飞</span> 👍（3） 💬（0）<p>&lt;body&gt;
 &lt;canvas id=&quot;rect&quot;&gt;&lt;&#47;canvas&gt; 
&lt;script type=&quot;text&#47;javascript&quot;&gt;    
             const canvas = document.getElementById(&#39;rect&#39;);
             canvas.width =document.documentElement.getBoundingClientRect().width;
             canvas.height = document.documentElement.getBoundingClientRect().height;
             canvas.style.position=&quot;absolute&quot;;
             canvas.style.top=0;
             canvas.style.left=0;
             canvas.style.border=&#39;1px solid red&#39;;
             const ctx = canvas.getContext(&#39;2d&#39;);
             function travaldom(root){                    
               if(root.tagName &amp;&amp; root.tagName !==&#39;text&#39; &amp;&amp; root.tagName!==&#39;canvas&#39;){
                  const startX = root.getBoundingClientRect().x;
                  const startY = root.getBoundingClientRect().y;
                  const width = root.getBoundingClientRect().width;
                  const height = root.getBoundingClientRect().height;
                  ctx.beginPath();
                  ctx.lineWidth=&quot;1&quot;;
                  ctx.strokeStyle=&quot;blue&quot;;
                  ctx.rect(startX,startY,width,height);
                  ctx.stroke();
               }
               root.childNodes.forEach(node=&gt;{
                   travaldom(node);
               });
             }
             travaldom(document);
        &lt;&#47;script&gt;	
&lt;&#47;body&gt;</p>2019-04-07</li><br/><li><span>痕近痕远</span> 👍（3） 💬（0）<p>请问老师，如何解决UI自动化测试，定位标签显示元素不可见的问题</p>2019-03-17</li><br/><li><span>宋宋</span> 👍（3） 💬（0）<p>前面讲浏览器渲染时有讲到，CSS经过词法分析和语法分析被解析成一颗抽象语法树。
这个抽象语法树和CSSOM有什么关联么？因为很多文章都讲CSS经过词法分析和语法分析被解析成CSSOM，感觉很疑惑。</p>2019-03-16</li><br/><li><span>pcxpccccx_</span> 👍（1） 💬（0）<p>冲冲冲</p>2020-03-22</li><br/><li><span>Russell</span> 👍（1） 💬（0）<p>emm~~ 我又读了一遍文档，发现了对我来说很关键词，“狭义的”。 那我现在的理解是酱紫的。  广义的理解，就是BOM+DOM，CSSOM是DOM扩展的一部分；如果狭义的认为DOM就是树形结构的话，就可以分出来DOM、CSSOM两部分内容了。 我这样想对么？</p>2019-04-03</li><br/><li><span>非洲小白狼</span> 👍（0） 💬（0）<p>function elementTreeDFS(el, callback) {
    if (el instanceof HTMLElement) {
        callback(el);
        const children = Array.from(el.children);
        children.forEach(element =&gt; elementTreeDFS(element, callback));
    }
}
function renderCanvas() {
    const canvas = document.createElement(&#39;canvas&#39;);
    const ctx = canvas.getContext(&#39;2d&#39;);
    canvas.width = document.documentElement.offsetWidth || document.body.offsetWidth;
    canvas.height = document.documentElement.offsetHeight || document.body.offsetHeight;
    elementTreeDFS(document.documentElement, (el) =&gt; {
        const bounding = el.getBoundingClientRect();
        if (bounding.left || bounding.top || bounding.right || bounding.bottom || bounding.width || bounding.height) {
            ctx?.strokeRect(bounding.left, bounding.top, bounding.width, bounding.height);
        }
    });
    canvas.toBlob((blob) =&gt; {
        console.log(URL.createObjectURL(blob));
    }, &#39;image&#47;jpg&#39;, 1);
}
renderCanvas();
</p>2024-08-27</li><br/><li><span>Fiona B Y Fan</span> 👍（0） 💬（0）<p>通过document.getStyleSheets修改style以及window.getComputedStyle window.getBoundingClientRect window.getClientRects方法会导致重排和重绘，影响性能，不是应该少用吗</p>2022-04-17</li><br/><li><span>pasico</span> 👍（0） 💬（0）<p>

function dfs(top, callback){
let node = top
let stack = Array.from(node.children).reverse()
callback(node)
while(stack.length){
node = stack.pop()
callback(node)
stack.push(...Array.from(node.children).reverse())
}
}

function traverse(){
let body = document.body
&#47;&#47; let color = 0
let time = 0
let count = 0
let can = document.createElement(&#39;canvas&#39;)
can.style.position = &#39;fixed&#39;
can.style.top=0
can.style.left=0
let ctx = can.getContext(&#39;2d&#39;)
const callback=(node)=&gt;{
time+=50
count++
setTimeout(()=&gt;{  
var {x,y,width,height} = node.getBoundingClientRect()
console.log(&#39;count&#39;, count, node, x, y, width, height)
if(node === body){
can.style.width = width
can.width = width
can.style.height = height
can.height = height
}
&#47;&#47; color++
&#47;&#47; ctx.fillStyle=`rgb(${color%255},${color%255},${color%255})`;
&#47;&#47; ctx.fillRect(x,y,width, height)
ctx.strokeStyle = &#39;green&#39;;
ctx.strokeRect(x, y, width, height);
}, time)
}
dfs(body, callback)
body.appendChild(can)
}

traverse()</p>2022-02-17</li><br/><li><span>胡永</span> 👍（0） 💬（0）<p>
const newWindow = window.open(&quot;about:blank&quot;, &quot;_blank&quot;, &quot;width=100,height=100,left=100,right=100&quot;)
const canvas = newWindow.document.body.appendChild(newWindow.document.createElement(&#39;canvas&#39;));
canvas.width = document.documentElement.offsetWidth
canvas.height = document.documentElement.offsetHeight

    canvas.style.position = &#39;absolute&#39;
    canvas.style.left = &#39;0&#39;
    canvas.style.right = &#39;0&#39;
    canvas.style.top = &#39;0&#39;
    canvas.style.bottom = &#39;0&#39;
    canvas.style.zIndex = &#39;99999&#39;

    const ctx = canvas.getContext(&#39;2d&#39;);
    const { x: htmlX, y: htmlY } = document.documentElement.getBoundingClientRect()

    let tagsArr = new Set();
    void function getAllElementsTag() {
        const body = document.body;
        const { width, height } = document.documentElement.getBoundingClientRect();
        return recurtion(body);
    }()


    function drawCanvas(ele) {
        const offsetX = ele.getBoundingClientRect().x - htmlX;
        const offsetY = ele.getBoundingClientRect().y - htmlY;
        const { width, height } = ele.getBoundingClientRect();
        ctx.strokeStyle = &#39;red&#39;;
        ctx.strokeRect(offsetX, offsetY, width, height);
    }


    function recurtion(ele) {
        tagsArr.add(ele.nodeName.slice(0).toLowerCase());
        drawCanvas(ele)
        if (!ele.hasChildNodes()) return;
        ele.childNodes.forEach(item =&gt; {
            if (item.hasChildNodes()) {
                return recurtion(item)
            }
            if (!&#47;#&#47;.test(item.nodeName)) {
                drawCanvas(item)
            }

            tagsArr.add(item.nodeName.slice(0).toLowerCase())
        })
    }</p>2021-06-16</li><br/><li><span>Peter</span> 👍（0） 💬（0）<p>

&#47;&#47; 创建覆盖在网页上方的canvas
const cvs = document.createElement(&#39;canvas&#39;)
cvs.width = document.documentElement.scrollWidth;
cvs.height = document.documentElement.scrollHeight;
cvs.style.position = &#39;absolute&#39;;
cvs.style.zIndex = 1000;
cvs.style.left = 0;
cvs.style.top = 0;
ctx = cvs.getContext(&#39;2d&#39;);
ctx.strokeStyle=&quot;red&quot;;

&#47;&#47; 查找所有块元素，计算位置并在对应坐标绘制边框在canvas上。
const BlockLevel = [&#39;block&#39;, &#39;inline-block&#39;, &#39;inline-table&#39;, &#39;table&#39;, &#39;flex&#39;, &#39;grid&#39;, &#39;flow-root&#39;];
[].forEach.call(document.body.getElementsByTagName(&#39;*&#39;), (item) =&gt; {
if (BlockLevel.indexOf(getComputedStyle(item).display) &gt; -1) {
const rect = item.getBoundingClientRect();
const { x, y, width, height } = rect;
ctx.strokeRect(x, y, width, height);
}
})

document.body.append(cvs);
</p>2020-06-30</li><br/>
</ul>

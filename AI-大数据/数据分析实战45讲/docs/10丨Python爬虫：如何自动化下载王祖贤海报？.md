上一讲中我给你讲了如何使用八爪鱼采集数据，对于数据采集刚刚入门的人来说，像八爪鱼这种可视化的采集是一种非常好的方式。它最大的优点就是上手速度快，当然也存在一些问题，比如运行速度慢、可控性差等。

相比之下，爬虫可以很好地避免这些问题，今天我来分享下如何通过编写爬虫抓取数据。

## 爬虫的流程

相信你对“爬虫”这个词已经非常熟悉了，爬虫实际上是用浏览器访问的方式模拟了访问网站的过程，整个过程包括三个阶段：打开网页、提取数据和保存数据。

在Python中，这三个阶段都有对应的工具可以使用。

在“打开网页”这一步骤中，可以使用 Requests 访问页面，得到服务器返回给我们的数据，这里包括HTML页面以及JSON数据。

在“提取数据”这一步骤中，主要用到了两个工具。针对HTML页面，可以使用 XPath 进行元素定位，提取数据；针对JSON数据，可以使用JSON进行解析。

在最后一步“保存数据”中，我们可以使用 Pandas 保存数据，最后导出CSV文件。

下面我来分别介绍下这些工具的使用。

**Requests访问页面**

Requests是Python HTTP的客户端库，编写爬虫的时候都会用到，编写起来也很简单。它有两种访问方式：Get和Post。这两者最直观的区别就是：Get把参数包含在url中，而Post通过request body来传递参数。

假设我们想访问豆瓣，那么用Get访问的话，代码可以写成下面这样的：

```
r = requests.get('http://www.douban.com')
```

代码里的“r”就是Get请求后的访问结果，然后我们可以使用r.text或r.content来获取HTML的正文。

如果我们想要使用Post进行表单传递，代码就可以这样写：

```
r = requests.post('http://xxx.com', data = {'key':'value'})
```

这里data就是传递的表单参数，data的数据类型是个字典的结构，采用key和value的方式进行存储。

**XPath定位**

XPath是XML的路径语言，实际上是通过元素和属性进行导航，帮我们定位位置。它有几种常用的路径表达方式。

![](https://static001.geekbang.org/resource/image/3b/ea/3bcb311361c76bfbeb90d360b21195ea.jpg?wh=518%2A690)

我来给你简单举一些例子：

1. xpath(‘node’) 选取了node节点的所有子节点；
2. xpath(’/div’) 从根节点上选取div节点；
3. xpath(’//div’) 选取所有的div节点；
4. xpath(’./div’) 选取当前节点下的div节点；
5. xpath(’…’) 回到上一个节点；
6. xpath(’//@id’) 选取所有的id属性；
7. xpath(’//book\[@id]’) 选取所有拥有名为id的属性的book元素；
8. xpath(’//book\[@id=“abc”]’) 选取所有book元素，且这些book元素拥有id= "abc"的属性；
9. xpath(’//book/title | //book/price’) 选取book元素的所有title和price元素。

上面我只是列举了XPath的部分应用，XPath的选择功能非常强大，它可以提供超过100个内建函数，来做匹配。我们想要定位的节点，几乎都可以使用XPath来选择。

使用XPath定位，你会用到Python的一个解析库lxml。这个库的解析效率非常高，使用起来也很简便，只需要调用HTML解析命令即可，然后再对HTML进行XPath函数的调用。

比如我们想要定位到HTML中的所有列表项目，可以采用下面这段代码。

```
from lxml import etree
html = etree.HTML(html)
result = html.xpath('//li')
```

**JSON对象**

JSON是一种轻量级的交互方式，在Python中有JSON库，可以让我们将Python对象和JSON对象进行转换。为什么要转换呢？原因也很简单。将JSON对象转换成为Python对象，我们对数据进行解析就更方便了。

![](https://static001.geekbang.org/resource/image/9a/43/9a6d6564a64cf2b1c256265eea78c543.png?wh=477%2A237)

这是一段将JSON格式转换成Python对象的代码，你可以自己运行下这个程序的结果。

```
import json
jsonData = '{"a":1,"b":2,"c":3,"d":4,"e":5}';
input = json.loads(jsonData)
print input
```

接下来，我们就要进行实战了，我会从两个角度给你讲解如何使用Python爬取海报，一个是通过JSON数据爬取，一个是通过XPath定位爬取。

## 如何使用JSON数据自动下载王祖贤的海报

我在上面讲了Python爬虫的基本原理和实现的工具，下面我们来实战一下。如果想要从豆瓣图片中下载王祖贤的海报，你应该先把我们日常的操作步骤整理下来：

1. 打开网页；
2. 输入关键词“王祖贤”；
3. 在搜索结果页中选择“图片”；
4. 下载图片页中的所有海报。

这里你需要注意的是，如果爬取的页面是动态页面，就需要关注XHR数据。因为动态页面的原理就是通过原生的XHR数据对象发出HTTP请求，得到服务器返回的数据后，再进行处理。XHR会用于在后台与服务器交换数据。

你需要使用浏览器的插件查看XHR数据，比如在Chrome浏览器中使用开发者工具。

在豆瓣搜索中，我们对“王祖贤”进行了模拟，发现XHR数据中有一个请求是这样的：

[https://www.douban.com/j/search\_photo?q=%E7%8E%8B%E7%A5%96%E8%B4%A4&amp;limit=20&amp;start=0](https://www.douban.com/j/search_photo?q=%E7%8E%8B%E7%A5%96%E8%B4%A4&limit=20&start=0)

url中的乱码正是中文的url编码，打开后，我们看到了很清爽的JSON格式对象，展示的形式是这样的：

```
{"images":
       [{"src": …, "author": …, "url":…, "id": …, "title": …, "width":…, "height":…},
    …
	 {"src": …, "author": …, "url":…, "id": …, "title": …, "width":…, "height":…}],
 "total":22471,"limit":20,"more":true}
```

从这个JSON对象中，我们能看到，王祖贤的图片一共有22471张，其中一次只返回了20张，还有更多的数据可以请求。数据被放到了images对象里，它是个数组的结构，每个数组的元素是个字典的类型，分别告诉了src、author、url、id、title、width和height字段，这些字段代表的含义分别是原图片的地址、作者、发布地址、图片ID、标题、图片宽度、图片高度等信息。

有了这个JSON信息，你很容易就可以把图片下载下来。当然你还需要寻找XHR请求的url规律。

如何查看呢，我们再来重新看下这个网址本身。

[https://www.douban.com/j/search\_photo?q=王祖贤&amp;limit=20&amp;start=0](https://www.douban.com/j/search_photo?q=%E7%8E%8B%E7%A5%96%E8%B4%A4&limit=20&start=0)

你会发现，网址中有三个参数：q、limit和start。start实际上是请求的起始ID，这里我们注意到它对图片的顺序标识是从0开始计算的。所以如果你想要从第21个图片进行下载，你可以将start设置为20。

王祖贤的图片一共有22471张，你可以写个for循环来跑完所有的请求，具体的代码如下：

```
# coding:utf-8
import requests
import json
query = '王祖贤'
''' 下载图片 '''
def download(src, id):
	dir = './' + str(id) + '.jpg'
	try:
		pic = requests.get(src, timeout=10)
		fp = open(dir, 'wb')
		fp.write(pic.content)
		fp.close()
	except requests.exceptions.ConnectionError:
		print('图片无法下载')

''' for 循环 请求全部的 url '''
for i in range(0, 22471, 20):
	url = 'https://www.douban.com/j/search_photo?q='+query+'&limit=20&start='+str(i)
	html = requests.get(url).text    # 得到返回结果
	response = json.loads(html,encoding='utf-8') # 将 JSON 格式转换成 Python 对象
	for image in response['images']:
		print(image['src']) # 查看当前下载的图片网址
		download(image['src'], image['id']) # 下载一张图片
```

## 如何使用XPath自动下载王祖贤的电影海报封面

如果你遇到JSON的数据格式，那么恭喜你，数据结构很清爽，通过Python的JSON库就可以解析。

但有时候，网页会用JS请求数据，那么只有JS都加载完之后，我们才能获取完整的HTML文件。XPath可以不受加载的限制，帮我们定位想要的元素。

比如，我们想要从豆瓣电影上下载王祖贤的电影封面，需要先梳理下人工的操作流程：

1. [打开网页movie.douban.com](http://xn--movie-hr2j95qrv1e8j7b.douban.com)；
2. 输入关键词“王祖贤”；
3. 下载图片页中的所有电影封面。

这里你需要用XPath定位图片的网址，以及电影的名称。

一个快速定位XPath的方法就是采用浏览器的XPath Helper插件，使用Ctrl+Shift+X快捷键的时候，用鼠标选中你想要定位的元素，就会得到类似下面的结果。

![](https://static001.geekbang.org/resource/image/0e/c7/0e0fef601ee043f4bea8dd2874e788c7.png?wh=865%2A111)

XPath Helper插件中有两个参数，一个是Query，另一个是Results。Query其实就是让你来输入XPath语法，然后在Results里看到匹配的元素的结果。

我们看到，这里选中的是一个元素，我们要匹配上所有的电影海报，就需要缩减XPath表达式。你可以在Query中进行XPath表达式的缩减，尝试去掉XPath表达式中的一些内容，在Results中会自动出现匹配的结果。

经过缩减之后，你可以得到电影海报的XPath（假设为变量src\_xpath）：

```
//div[@class='item-root']/a[@class='cover-link']/img[@class='cover']/@src
```

以及电影名称的XPath（假设为变量title\_xpath）：

```
//div[@class='item-root']/div[@class='detail']/div[@class='title']/a[@class='title-text']
```

但有时候当我们直接用Requests获取HTML的时候，发现想要的XPath并不存在。这是因为HTML还没有加载完，因此你需要一个工具，来进行网页加载的模拟，直到完成加载后再给你完整的HTML。

在Python中，这个工具就是Selenium库，使用方法如下：

```
from selenium import webdriver
driver = webdriver.Chrome()
driver.get(request_url)
```

Selenium是Web应用的测试工具，可以直接运行在浏览器中，它的原理是模拟用户在进行操作，支持当前多种主流的浏览器。

这里我们模拟Chrome浏览器的页面访问。

你需要先引用Selenium中的WebDriver库。WebDriver实际上就是Selenium 2，是一种用于Web应用程序的自动测试工具，提供了一套友好的API，方便我们进行操作。

然后通过WebDriver创建一个Chrome浏览器的drive，再通过drive获取访问页面的完整HTML。

当你获取到完整的HTML时，就可以对HTML中的XPath进行提取，在这里我们需要找到图片地址srcs和电影名称titles。这里通过XPath语法匹配到了多个元素，因为是多个元素，所以我们需要用for循环来对每个元素进行提取。

```
srcs = html.xpath(src_xpath)
titles = html.xpath(title_path)
for src, title in zip(srcs, titles):
	download(src, title.text)
```

然后使用上面我编写好的download函数进行图片下载。

## 总结

好了，这样就大功告成了，程序可以源源不断地采集你想要的内容。这节课，我想让你掌握的是：

1. Python爬虫的流程；
2. 了解XPath定位，JSON对象解析；
3. 如何使用lxml库，进行XPath的提取；
4. 如何在Python中使用Selenium库来帮助你模拟浏览器，获取完整的HTML。

其中，Python + Selenium + 第三方浏览器可以让我们处理多种复杂场景，包括网页动态加载、JS响应、Post表单等。因为Selenium模拟的就是一个真实的用户的操作行为，就不用担心cookie追踪和隐藏字段的干扰了。

当然，Python还给我们提供了数据处理工具，比如lxml库和JSON库，这样就可以提取想要的内容了。

![](https://static001.geekbang.org/resource/image/eb/ab/eb3e48f714ca857a79948d831de521ab.jpg?wh=3200%2A1800)

最后，你不妨来实践一下，你最喜欢哪个明星？如果想要自动下载这个明星的图片，该如何操作呢？欢迎和我在评论区进行探讨。

你也可以把这篇文章分享给你的朋友或者同事，一起动手练习一下。
<div><strong>精选留言（15）</strong></div><ul>
<li><span>滢</span> 👍（63） 💬（2）<p>说明两点问题：
（一）.留言里有人评论说用XPath下载的图片打不开，其原因是定义的下载函数保存路径后缀名为&#39;.jpg&#39;，但是用XPath下载获得的图片url为&#39;https:&#47;&#47;img3.doubanio.com&#47;view&#47;celebrity&#47;s_ratio_celebrity&#47;public&#47;p616.webp&#39;，本身图片为webp格式，所以若保存为jpg格式，肯定是打不开的。
(二).  老师在文章内讲的用XPath下载代码只能下载第一页的内容，并不是全部的数据，不知道大家有没有查看用xpath函数获得的数组，大家留言里的代码似乎和老师的一样，只能得到首页的内容，所以也是需要模拟翻页操作才能获得完整的数据。

以下是课后练习题：爬取宫崎骏的电影海报， Python3.6 IDLE
&gt;&gt;&gt; import json
&gt;&gt;&gt; import requests as req
&gt;&gt;&gt; from lxml import etree
&gt;&gt;&gt; from selenium import webdriver
&gt;&gt;&gt; import os
&gt;&gt;&gt; request_url = &#39;https:&#47;&#47;movie.douban.com&#47;subject_search?search_text=宫崎骏&amp;cat=1002&#39;
&gt;&gt;&gt; src_xpath = &quot;&#47;&#47;div[@class=&#39;item-root&#39;]&#47;a[@class=&#39;cover-link&#39;]&#47;img[@class=&#39;cover&#39;]&#47;@src&quot;
&gt;&gt;&gt; title_xpath = &quot;&#47;&#47;div[@class=&#39;item-root&#39;]&#47;div[@class=&#39;detail&#39;]&#47;div[@class=&#39;title&#39;]&#47;a[@class=&#39;title-text&#39;]&quot;
&gt;&gt;&gt; driver = webdriver.Chrome(&#39;&#47;Users&#47;apple&#47;Downloads&#47;chromedriver&#39;)
&gt;&gt;&gt; driver.get(request_url)
&gt;&gt;&gt; html = etree.HTML(driver.page_source)
&gt;&gt;&gt; srcs = html.xpath(src_xpath)
&gt;&gt;&gt; print (srcs) #大家可要看下打印出来的数据是否只是一页的内容，以及图片url的后缀格式
&gt;&gt;&gt; picpath = &#39;&#47;Users&#47;apple&#47;Downloads&#47;宫崎骏电影海报&#39;
&gt;&gt;&gt; if not os.path.isdir(picpath):
os.mkdir(picpath)
&gt;&gt;&gt; def download(src, id):
dic = picpath + &#39;&#47;&#39; + str(id) + &#39;.webp&#39;
try:
pic = req.get(src, timeout = 30)
fp = open(dic, &#39;wb&#39;)
fp.write(pic.content)
fp.close()
except req.exceptions.ConnectionError:
print (&#39;图片无法下载&#39;)
&gt;&gt;&gt; for i in range(0, 150, 15):
url = request_url + &#39;&amp;start=&#39; + str(i)
driver.get(url)
html = etree.HTML(driver.page_source)
srcs = html.xpath(src_xpath)
titles = html.xpath(title_xpath)
for src,title in zip(srcs, titles):
download(src, title.text)
</p>2019-04-10</li><br/><li><span>rOMEo罗密欧</span> 👍（46） 💬（4）<p>老师请问一下：如果是需要用户登陆后才能爬取的数据该怎么用python来实现呢？</p>2019-01-04</li><br/><li><span>Bayes</span> 👍（18） 💬（8）<p>老师你这跳过了太多步骤了，表示对于python跟着你前几节课入门的人什么都不会，按着你的代码运行，要不就是没有定义，要不就是没有这个函数。刚开始的人也不知道哪个函数在哪个库，建议老师按照流程来一步一步给代码，要不就在最后给一个完整的代码示例，真的是学的很困难加上想放弃</p>2019-07-30</li><br/><li><span>LY</span> 👍（16） 💬（1）<p>#环境：Mac Python3
#pip install selenium
#下载chromedriver，放到项目路径下（https:&#47;&#47;npm.taobao.org&#47;mirrors&#47;chromedriver&#47;2.33&#47;）
# coding:utf-8
import requests
import json
import os
from lxml import etree
from selenium import webdriver

query = &#39;张柏芝&#39;
downloadPath = &#39;&#47;Users&#47;yong&#47;Desktop&#47;Python&#47;xpath&#47;images&#47;&#39;

&#39;&#39;&#39; 下载图片 &#39;&#39;&#39;
def download(src, id):
dir = downloadPath + str(id) + &#39;.jpg&#39;
try:
pic = requests.get(src, timeout=10)
except requests.exceptions.ConnectionError: # print &#39;error, %d 当前图片无法下载&#39;, %id
print(&#39;图片无法下载&#39;)
if not os.path.exists(downloadPath):
os.mkdir(downloadPath)
if os.path.exists(dir):
print(&#39;已存在:&#39;+ id)
return
fp = open(dir, &#39;wb&#39;)
fp.write(pic.content)
fp.close()

def searchImages():
&#39;&#39;&#39; for 循环 请求全部的 url &#39;&#39;&#39;
for i in range(0, 22471, 20):
url = &#39;https:&#47;&#47;www.douban.com&#47;j&#47;search_photo?q=&#39;+query+&#39;&amp;limit=20&amp;start=&#39;+str(i)
html = requests.get(url).text # 得到返回结果
print(&#39;html:&#39;+html)
response = json.loads(html,encoding=&#39;utf-8&#39;) # 将 JSON 格式转换成 Python 对象
for image in response[&#39;images&#39;]:
print(image[&#39;src&#39;]) # 查看当前下载的图片网址
download(image[&#39;src&#39;], image[&#39;id&#39;]) # 下载一张图片

def getMovieImages():
url = &#39;https:&#47;&#47;movie.douban.com&#47;subject_search?search_text=&#39;+ query +&#39;&amp;cat=1002&#39;
driver = webdriver.Chrome(&#39;&#47;Users&#47;yong&#47;Desktop&#47;Python&#47;xpath&#47;libs&#47;chromedriver&#39;)
driver.get(url)
html = etree.HTML(driver.page_source) # 使用xpath helper, ctrl+shit+x 选中元素，如果要匹配全部，则需要修改query 表达式
src_xpath = &quot;&#47;&#47;div[@class=&#39;item-root&#39;]&#47;a[@class=&#39;cover-link&#39;]&#47;img[@class=&#39;cover&#39;]&#47;@src&quot;
title_xpath = &quot;&#47;&#47;div[@class=&#39;item-root&#39;]&#47;div[@class=&#39;detail&#39;]&#47;div[@class=&#39;title&#39;]&#47;a[@class=&#39;title-text&#39;]&quot;

    srcs = html.xpath(src_xpath)
    titles = html.xpath(title_xpath)
    for src, title in zip(srcs, titles):
        print(&#39;\t&#39;.join([str(src),str(title.text)]))
        download(src, title.text)

    driver.close()

getMovieImages()</p>2019-01-04</li><br/><li><span>伪君子</span> 👍（16） 💬（2）<p>那些用 ChromeDriver 的出现报错的可能是没有安装 ChromeDriver，或者是没给出 ChromeDriver 的路径，具体可以看看下面这篇文章。
https:&#47;&#47;mp.weixin.qq.com&#47;s&#47;UL0bcLr3KOb-qpI9oegaIQ</p>2019-01-04</li><br/><li><span>飘</span> 👍（9） 💬（3）<p>感谢作者以及评论区的各位大神，终于完成了爬虫代码，总结一下小白编写时遇到的几个问题：
1）获取xpath时，chrome浏览器需要安装插件xpatn-helper；
2）使用python3.7，提前引入模块requests，lxml，selenium，安装这些模块需要更新pip至20版本；
3）模拟用户访问浏览器，需要下载chromedriver.exe,放入python.exe所在目录；
4）图片路径中出现导致编译失败的字符，使用replace替换报错字符。
具体代码如下：
import os
import requests
from lxml import etree
from selenium import webdriver

search_text = &quot;王祖贤&quot;
start = 0
limit = 15
total = 90

def download(img, title):
dir = &quot;D:\\数据分析\\python test\\query\\&quot; + search_text + &quot;\\&quot;
id = title.replace(u&#39;\u200e&#39;, u&#39;&#39;).replace(u&#39;?&#39;, u&#39;&#39;) .replace(u&#39;&#47;&#39;, u&#39;or&#39;)
if not os.path.exists(dir):
os.makedirs(dir)
try:  
pic = requests.get(img, timeout=10)
img_path = dir + str(id) + &#39;.jpg&#39;  
fp = open(img_path, &#39;wb&#39;)  
fp.write(pic.content)  
fp.close()  
except requests.exceptions.ConnectionError:  
print(&#39;图片无法下载&#39;)

def crawler_xpath():
src_img = &quot;&#47;&#47;div[@class=&#39;item-root&#39;]&#47;a[@class=&#39;cover-link&#39;]&#47;img[@class=&#39;cover&#39;]&#47;@src&quot;
src_title = &quot;&#47;&#47;div[@class=&#39;item-root&#39;]&#47;div[@class=&#39;detail&#39;]&#47;div[@class=&#39;title&#39;]&#47;a[@class=&#39;title-text&#39;]&quot;

    for i in range(start,total,limit):
    	request_url = &quot;https:&#47;&#47;search.douban.com&#47;movie&#47;subject_search?search_text=&quot;+search_text+&quot;&amp;cat=1002&amp;start=&quot;+str(i)
    	driver = webdriver.Chrome()
    	driver.get(request_url)
    	html = etree.HTML(driver.page_source)
    	imgs = html.xpath(src_img)
    	titles = html.xpath(src_title)
    	print(imgs,titles)
    	for img, title in zip(imgs, titles):
    		download(img, title.text)

if **name** == &#39;**main**&#39;:
crawler_xpath()
</p>2020-04-08</li><br/><li><span>germany</span> 👍（6） 💬（2）<p>老师：为什么我在豆瓣网查询图片的网址与你不一样？https:&#47;&#47;www.douban.com&#47;search?cat=1025&amp;q=王祖贤&amp;source=suggest  。是什么原因？</p>2019-01-04</li><br/><li><span>許敲敲</span> 👍（5） 💬（1）<p>要下载所有James 哈登的图片</p>2019-01-04</li><br/><li><span>Geek_2008d9</span> 👍（4） 💬（3）<p>为什么我总是response=json.loads那一行显示json.decoder.JSONDecoderError:expecting value:line 1 column 1(char 0) 呢，怎么解决啊，各位大佬</p>2019-12-14</li><br/><li><span>Geek_c45626</span> 👍（3） 💬（7）<p>老师，运行代码总是出错：JSONDecodeError: Expecting value: line 1 column 1 (char 0)，这个怎么解决？</p>2019-12-06</li><br/><li><span>qinggeouye</span> 👍（3） 💬（1）<p>https:&#47;&#47;github.com&#47;qinggeouye&#47;GeekTime&#47;blob&#47;master&#47;DataAnalysis&#47;10_crawl_xpath.py

import os
import requests
from lxml import etree
from selenium import webdriver

search_text = &#39;王祖贤&#39;
start = 0 # 请求 url 的 start 从 0 开始，每一页间隔 15，有 6 页
total = 90
limit = 15

# 电影海报图片地址

src_xpath = &quot;&#47;&#47;div[@class=&#39;item-root&#39;]&#47;a[@class=&#39;cover-link&#39;]&#47;img[@class=&#39;cover&#39;]&#47;@src&quot;

# 电影海报图片title

title_xpath = &quot;&#47;&#47;div[@class=&#39;item-root&#39;]&#47;div[@class=&#39;detail&#39;]&#47;div[@class=&#39;title&#39;]&#47;a[@class=&#39;title-text&#39;]&quot;

# 保存目录

pic_path = &#39;10&#47;xpath&#39; # 相对目录

# WebDriver 创建一个 Chrome 浏览器的 drive

driver = webdriver.Chrome(&#39;.&#47;chromedriver&#39;) # MAC 版本

# 创建图片保存路径

def mk_save_path(pic_path_):
if not os.path.exists(pic_path_):
os.makedirs(pic_path_)
return os.getcwd() + &#39;&#47;&#39; + pic_path_ + &#39;&#47;&#39;

# 下载图片

def download(src, pic_id, save_path_):
directory = save_path_ + str(pic_id) + &#39;.jpg&#39;
try:
pic = requests.get(src, timeout=10)
fp = open(directory, &#39;wb&#39;)
fp.write(pic.content)
fp.close()
except requests.exceptions.ConnectionError:
print(&#39;图片如无法下载&#39;)

def get_response_xpath():
save_path = mk_save_path(pic_path)
for i in range(start, total, limit):
requests_url = &#39;https:&#47;&#47;search.douban.com&#47;movie&#47;subject_search?search_text=&#39; + search_text + &#39;&amp;cat=1002&#39; + \
&#39;&amp;start=&#39; + str(i)
driver.get(url=requests_url)
html = etree.HTML(driver.page_source)
src_list = html.xpath(src_xpath)
title_list = html.xpath(title_xpath)
for src, title in zip(src_list, title_list):
download(src, title.text, save_path)

if **name** == &#39;**main**&#39;:
get_response_xpath()</p>2019-11-06</li><br/><li><span>Yezhiwei</span> 👍（3） 💬（1）<p>用Scrapy爬取数据更方便哈，请问老师怎么做一个通用的爬虫呢？比如要爬取文章标题和内容，不同的网站Xpath结构不一样，如果源少的话可以分别配置，但如果要爬取几百上千的网站数据，分别配置Xpath挺麻烦的。请问这个问题有什么解决方案吗？谢谢</p>2019-01-04</li><br/><li><span>qinggeouye</span> 👍（2） 💬（2）<p>https:&#47;&#47;github.com&#47;qinggeouye&#47;GeekTime&#47;blob&#47;master&#47;DataAnalysis&#47;10_crawl.py

# coding: utf-8

import os

import requests
import json

# 下载图片

def download(src, pic_id, save_path_):
directory = save_path_ + str(pic_id) + &#39;.jpg&#39;

    try:
        pic = requests.get(src, timeout=10)
        fp = open(directory, &#39;wb&#39;)
        fp.write(pic.content)
        fp.close()
    except requests.exceptions.ConnectionError:
        print(&#39;图片如无法下载&#39;)

# 获取返回页面内容

def get_resp(query_, limit_, start_):
url_ = &#39;https:&#47;&#47;www.douban.com&#47;j&#47;search_photo?q=&#39; + query_ + &#39;&amp;limit=&#39; + str(limit_) + &#39;&amp;start=&#39; + str(start_)
html_ = requests.get(url_).text # 得到返回结果
response_ = json.loads(html_, encoding=&#39;utf-8&#39;) # 将 JSON 格式转换为 Python 对象
return response_

query = &#39;王祖贤&#39;
limit = 20
start = 0

&#39;&#39;&#39; 获取图片总数量 &#39;&#39;&#39;
total = get_resp(query, limit, start)[&#39;total&#39;]
print(total)

pic_path = &#39;10&#39; # 相对目录
if not os.path.exists(pic_path):
os.mkdir(pic_path)
save_path = os.getcwd() + &#39;&#47;&#39; + pic_path + &#39;&#47;&#39;

# 循环 请求全部的 url

for i in range(start, total, limit):
response = get_resp(query, limit, i)
for image in response[&#39;images&#39;]:
print(image[&#39;src&#39;]) # 查看当前下载的图片地址
download(image[&#39;src&#39;], image[&#39;id&#39;], save_path) # 下载一张图片
</p>2019-11-05</li><br/><li><span>爱喝酸奶的程序员</span> 👍（2） 💬（1）<p>有个问题selenium，是用来自动化测试的，他回打开浏览器……我做爬虫是不想让代码打开浏览器，只想要他爬取的动作～要怎么办呢？</p>2019-02-26</li><br/><li><span>十六。</span> 👍（1） 💬（1）<p>由于python学习是爬虫上手的，爬虫还是会一点的，哈哈，去下一章了ღ( ´･ᴗ･` )</p>2020-03-27</li><br/>
</ul>

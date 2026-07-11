上一节我讲了Python的基本语法，今天我来给你讲下Python中一个非常重要的第三方库NumPy。

它不仅是Python中使用最多的第三方库，而且还是SciPy、Pandas等数据科学的基础库。它所提供的数据结构比Python自身的“更高级、更高效”，可以这么说，NumPy所提供的数据结构是Python数据分析的基础。

我上次讲到了Python数组结构中的列表list，它实际上相当于一个数组的结构。而NumPy中一个关键数据类型就是关于数组的，那为什么还存在这样一个第三方的数组结构呢？

实际上，标准的Python中，用列表list保存数组的数值。由于列表中的元素可以是任意的对象，所以列表中list保存的是对象的指针。虽然在Python编程中隐去了指针的概念，但是数组有指针，Python的列表list其实就是数组。这样如果我要保存一个简单的数组\[0,1,2]，就需要有3个指针和3个整数的对象，这样对于Python来说是非常不经济的，浪费了内存和计算时间。

## 使用NumPy让你的Python科学计算更高效

为什么要用NumPy数组结构而不是Python本身的列表list？这是因为列表list的元素在系统内存中是分散存储的，而NumPy数组存储在一个均匀连续的内存块中。这样数组计算遍历所有的元素，不像列表list还需要对内存地址进行查找，从而节省了计算资源。

另外在内存访问模式中，缓存会直接把字节块从RAM加载到CPU寄存器中。因为数据连续的存储在内存中，NumPy直接利用现代CPU的矢量化指令计算，加载寄存器中的多个连续浮点数。另外NumPy中的矩阵计算可以采用多线程的方式，充分利用多核CPU计算资源，大大提升了计算效率。

当然除了使用NumPy外，你还需要一些技巧来提升内存和提高计算资源的利用率。一个重要的规则就是：**避免采用隐式拷贝，而是采用就地操作的方式**。举个例子，如果我想让一个数值x是原来的两倍，可以直接写成x\*=2，而不要写成y=x\*2。

这样速度能快到2倍甚至更多。

既然NumPy这么厉害，你该从哪儿入手学习呢？在NumPy里有两个重要的对象：ndarray（N-dimensional array object）解决了多维数组问题，而ufunc（universal function object）则是解决对数组进行处理的函数。下面，我就带你一一来看。

**ndarray对象**

ndarray实际上是多维数组的含义。在NumPy数组中，维数称为秩（rank），一维数组的秩为1，二维数组的秩为2，以此类推。在NumPy中，每一个线性的数组称为一个轴（axes），其实秩就是描述轴的数量。

下面，你来看ndarray对象是如何创建数组的，又是如何处理结构数组的呢？

**创建数组**

```
import numpy as np
a = np.array([1, 2, 3])
b = np.array([[1, 2, 3], [4, 5, 6], [7, 8, 9]])
b[1,1]=10
print a.shape
print b.shape
print a.dtype
print b
```

运行结果：

```
(3L,)
(3L, 3L)
int32
[[ 1  2  3]
 [ 4 10  6]
 [ 7  8  9]]
```

创建数组前，你需要引用NumPy库，可以直接通过array函数创建数组，如果是多重数组，比如示例里的b，那么该怎么做呢？你可以先把一个数组作为一个元素，然后嵌套起来，比如示例b中的\[1,2,3]就是一个元素，然后\[4,5,6]\[7,8,9]也是作为元素，然后把三个元素再放到\[]数组里，赋值给变量b。

当然数组也是有属性的，比如你可以通过函数shape属性获得数组的大小，通过dtype获得元素的属性。如果你想对数组里的数值进行修改的话，直接赋值即可，注意下标是从0开始计的，所以如果你想对b数组，九宫格里的中间元素进行修改的话，下标应该是\[1,1]。

**结构数组**

如果你想统计一个班级里面学生的姓名、年龄，以及语文、英语、数学成绩该怎么办？当然你可以用数组的下标来代表不同的字段，比如下标为0的是姓名、下标为1的是年龄等，但是这样不显性。

实际上在C语言里，可以定义结构数组，也就是通过struct定义结构类型，结构中的字段占据连续的内存空间，每个结构体占用的内存大小都相同，那在NumPy中是怎样操作的呢？

```
import numpy as np
persontype = np.dtype({
    'names':['name', 'age', 'chinese', 'math', 'english'],
    'formats':['S32','i', 'i', 'i', 'f']})
peoples = np.array([("ZhangFei",32,75,100, 90),("GuanYu",24,85,96,88.5),
       ("ZhaoYun",28,85,92,96.5),("HuangZhong",29,65,85,100)],
    dtype=persontype)
ages = peoples[:]['age']
chineses = peoples[:]['chinese']
maths = peoples[:]['math']
englishs = peoples[:]['english']
print np.mean(ages)
print np.mean(chineses)
print np.mean(maths)
print np.mean(englishs)
```

运行结果：

```
28.25
77.5
93.25
93.75
```

你看下这个例子，首先在NumPy中是用dtype定义的结构类型，然后在定义数组的时候，用array中指定了结构数组的类型dtype=persontype，这样你就可以自由地使用自定义的persontype了。比如想知道每个人的语文成绩，就可以用chineses = peoples\[:]\[‘chinese’]，当然NumPy中还有一些自带的数学运算，比如计算平均值使用np.mean。

**ufunc运算**

ufunc是universal function的缩写，是不是听起来就感觉功能非常强大？确如其名，它能对数组中每个元素进行函数操作。NumPy中很多ufunc函数计算速度非常快，因为都是采用C语言实现的。

**连续数组的创建**

NumPy可以很方便地创建连续数组，比如我使用arange或linspace函数进行创建：

```
x1 = np.arange(1,11,2)
x2 = np.linspace(1,9,5)
```

np.arange和np.linspace起到的作用是一样的，都是创建等差数组。这两个数组的结果x1,x2都是\[1 3 5 7 9]。结果相同，但是你能看出来创建的方式是不同的。

arange()类似内置函数range()，通过指定**初始值、终值、步长**来创建等差数列的一维数组，默认是不包括终值的。

linspace是linear space的缩写，代表线性等分向量的含义。linspace()通过指定**初始值、终值、元素个数**来创建等差数列的一维数组，默认是包括终值的。

**算数运算**

通过NumPy可以自由地创建等差数组，同时也可以进行加、减、乘、除、求n次方和取余数。

```
x1 = np.arange(1,11,2)
x2 = np.linspace(1,9,5)
print np.add(x1, x2)
print np.subtract(x1, x2)
print np.multiply(x1, x2)
print np.divide(x1, x2)
print np.power(x1, x2)
print np.remainder(x1, x2)
```

运行结果：

```
[ 2.  6. 10. 14. 18.]
[0. 0. 0. 0. 0.]
[ 1.  9. 25. 49. 81.]
[1. 1. 1. 1. 1.]
[1.00000000e+00 2.70000000e+01 3.12500000e+03 8.23543000e+05
 3.87420489e+08]
[0. 0. 0. 0. 0.]
```

我还以x1, x2数组为例，求这两个数组之间的加、减、乘、除、求n次方和取余数。在n次方中，x2数组中的元素实际上是次方的次数，x1数组的元素为基数。

在取余函数里，你既可以用np.remainder(x1, x2)，也可以用np.mod(x1, x2)，结果是一样的。

**统计函数**

如果你想要对一堆数据有更清晰的认识，就需要对这些数据进行描述性的统计分析，比如了解这些数据中的最大值、最小值、平均值，是否符合正态分布，方差、标准差多少等等。它们可以让你更清楚地对这组数据有认知。

下面我来介绍下在NumPy中如何使用这些统计函数。

**计数组/矩阵中的最大值函数amax()，最小值函数amin()**

```
import numpy as np
a = np.array([[1,2,3], [4,5,6], [7,8,9]])
print np.amin(a)
print np.amin(a,0)
print np.amin(a,1)
print np.amax(a)
print np.amax(a,0)
print np.amax(a,1)
```

运行结果：

```
1
[1 2 3]
[1 4 7]
9
[7 8 9]
[3 6 9]
```

amin() 用于计算数组中的元素沿指定轴的最小值。对于一个二维数组a，amin(a)指的是数组中全部元素的最小值，amin(a,0)是延着axis=0轴的最小值，axis=0轴是把元素看成了\[1,4,7], \[2,5,8], \[3,6,9]三个元素，所以最小值为\[1,2,3]，amin(a,1)是延着axis=1轴的最小值，axis=1轴是把元素看成了\[1,2,3], \[4,5,6], \[7,8,9]三个元素，所以最小值为\[1,4,7]。同理amax()是计算数组中元素沿指定轴的最大值。

**统计最大值与最小值之差 ptp()**

```
a = np.array([[1,2,3], [4,5,6], [7,8,9]])
print np.ptp(a)
print np.ptp(a,0)
print np.ptp(a,1)
```

运行结果：

```
8
[6 6 6]
[2 2 2]
```

对于相同的数组a，np.ptp(a)可以统计数组中最大值与最小值的差，即9-1=8。同样ptp(a,0)统计的是沿着axis=0轴的最大值与最小值之差，即7-1=6（当然8-2=6,9-3=6，第三行减去第一行的ptp差均为6），ptp(a,1)统计的是沿着axis=1轴的最大值与最小值之差，即3-1=2（当然6-4=2, 9-7=2，即第三列与第一列的ptp差均为2）。

**统计数组的百分位数 percentile()**

```
a = np.array([[1,2,3], [4,5,6], [7,8,9]])
print np.percentile(a, 50)
print np.percentile(a, 50, axis=0)
print np.percentile(a, 50, axis=1)
```

运行结果：

```
5.0
[4. 5. 6.]
[2. 5. 8.]
```

同样，percentile()代表着第 p 个百分位数，这里p的取值范围是0-100，如果p=0，那么就是求最小值，如果p=50就是求平均值，如果p=100就是求最大值。同样你也可以求得在axis=0 和 axis=1两个轴上的p%的百分位数。

**统计数组中的中位数median()、平均数mean()**

```
a = np.array([[1,2,3], [4,5,6], [7,8,9]])
#求中位数
print np.median(a)
print np.median(a, axis=0)
print np.median(a, axis=1)
#求平均数
print np.mean(a)
print np.mean(a, axis=0)
print np.mean(a, axis=1)
```

运行结果：

```
5.0
[4. 5. 6.]
[2. 5. 8.]
5.0
[4. 5. 6.]
[2. 5. 8.]
```

你可以用median()和mean()求数组的中位数、平均值，同样也可以求得在axis=0和1两个轴上的中位数、平均值。你可以自己练习下看看运行结果。

**统计数组中的加权平均值average()**

```
a = np.array([1,2,3,4])
wts = np.array([1,2,3,4])
print np.average(a)
print np.average(a,weights=wts)
```

运行结果：

```
2.5
3.0
```

average()函数可以求加权平均，加权平均的意思就是每个元素可以设置个权重，默认情况下每个元素的权重是相同的，所以np.average(a)=(1+2+3+4)/4=2.5，你也可以指定权重数组wts=\[1,2,3,4]，这样加权平均np.average(a,weights=wts)=(1\*1+2\*2+3\*3+4\*4)/(1+2+3+4)=3.0。

**统计数组中的标准差std()、方差var()**

```
a = np.array([1,2,3,4])
print np.std(a)
print np.var(a)
```

运行结果：

```
1.118033988749895
1.25
```

方差的计算是指每个数值与平均值之差的平方求和的平均值，即mean((x - x.mean())\** 2)。标准差是方差的算术平方根。在数学意义上，代表的是一组数据离平均值的分散程度。所以np.var(a)=1.25, np.std(a)=1.118033988749895。

**NumPy排序**

排序是算法中使用频率最高的一种，也是在数据分析工作中常用的方法，计算机专业的同学会在大学期间的算法课中学习。

那么这些排序算法在NumPy中实现起来其实非常简单，一条语句就可以搞定。这里你可以使用sort函数，sort(a, axis=-1, kind=‘quicksort’, order=None)，默认情况下使用的是快速排序；在kind里，可以指定quicksort、mergesort、heapsort分别表示快速排序、合并排序、堆排序。同样axis默认是-1，即沿着数组的最后一个轴进行排序，也可以取不同的axis轴，或者axis=None代表采用扁平化的方式作为一个向量进行排序。另外order字段，对于结构化的数组可以指定按照某个字段进行排序。

```
a = np.array([[4,3,2],[2,4,1]])
print np.sort(a)
print np.sort(a, axis=None)
print np.sort(a, axis=0)
print np.sort(a, axis=1)
```

运行结果：

```
[[2 3 4]
 [1 2 4]]
[1 2 2 3 4 4]
[[2 3 1]
 [4 4 2]]
[[2 3 4]
 [1 2 4]]
```

你可以自己计算下这个运行结果，然后再跑一遍比对下。

## 总结

在NumPy学习中，你重点要掌握的就是对数组的使用，因为这是NumPy和标准Python最大的区别。在NumPy中重新对数组进行了定义，同时提供了算术和统计运算，你也可以使用NumPy自带的排序功能，一句话就搞定各种排序算法。

当然要理解NumPy提供的数据结构为什么比Python自身的“更高级、更高效”，要从对数据指针的引用角度进行理解。

![](https://static001.geekbang.org/resource/image/7b/66/7ba74ca7776ac29a5dc94c272d72ff66.jpg?wh=1142%2A564)  
我今天重点讲了NumPy的数据结构，你能用自己的话说明一下为什么要用NumPy而不是Python的列表list吗？除此之外，你还知道那些数据结构类型？

**练习题：统计全班的成绩**

假设一个团队里有5名学员，成绩如下表所示。你可以用NumPy统计下这些人在语文、英语、数学中的平均成绩、最小成绩、最大成绩、方差、标准差。然后把这些人的总成绩排序，得出名次进行成绩输出。

![](https://static001.geekbang.org/resource/image/44/5c/442a89eed30c13b543e5f717c538325c.jpg?wh=1142%2A1031)

期待你的答案，也欢迎点击“请朋友读”，把这篇文章分享给你的朋友或者同事。
<div><strong>精选留言（15）</strong></div><ul>
<li><span>mickey</span> 👍（64） 💬（8）<p>#!&#47;usr&#47;bin&#47;python
#vim: set fileencoding:utf-8
import numpy as np

&#39;&#39;&#39;
假设一个团队里有5名学员，成绩如下表所示。
1.用NumPy统计下这些人在语文、英语、数学中的平均成绩、最小成绩、最大成绩、方差、标准差。
2.总成绩排序，得出名次进行成绩输出。
&#39;&#39;&#39;

scoretype = np.dtype({
&#39;names&#39;: [&#39;name&#39;, &#39;chinese&#39;, &#39;english&#39;, &#39;math&#39;],
&#39;formats&#39;: [&#39;S32&#39;, &#39;i&#39;, &#39;i&#39;, &#39;i&#39;]})

peoples = np.array(
[
(&quot;zhangfei&quot;, 66, 65, 30),
(&quot;guanyu&quot;, 95, 85, 98),
(&quot;zhaoyun&quot;, 93, 92, 96),
(&quot;huangzhong&quot;, 90, 88, 77),
(&quot;dianwei&quot;, 80, 90, 90)
], dtype=scoretype)

#print(peoples)

name = peoples[:][&#39;name&#39;]
wuli = peoples[:][&#39;chinese&#39;]
zhili = peoples[:][&#39;english&#39;]
tili = peoples[:][&#39;math&#39;]

def show(name,cj):
print name,
print &quot; |&quot;,
print np.mean(cj),
print &quot; | &quot;,
print np.min(cj),
print &quot; | &quot;,
print np.max(cj),
print &quot; | &quot;,
print np.var(cj),
print &quot; | &quot;,
print np.std(cj)

print(&quot;科目 | 平均成绩 | 最小成绩 | 最大成绩 | 方差 | 标准差&quot;)
show(&quot;语文&quot;, wuli)
show(&quot;英语&quot;, zhili)
show(&quot;数学&quot;, tili)

print(&quot;排名:&quot;)
ranking =sorted(peoples,cmp = lambda x,y: cmp(x[1]+x[2]+x[3],y[1]+y[2]+y[3]), reverse=True)
print(ranking)</p>2018-12-21</li><br/><li><span>么春‮脸小的你了亲并‭</span> 👍（110） 💬（9）<p>排名第一的同学是用 Python 2 的写法，我用 Python 3 也写一遍，供大家参考。

# -_- coding: utf-8 -_-

&quot;&quot;&quot;
Created on Sun Jan 20 00:51:28 2019

@author: Dachun Li
&quot;&quot;&quot;
import numpy as np
a = np.array([[4,3,2],[2,4,1]])
print(np.sort(a))
print(np.sort(a, axis=None))
print(np.sort(a, axis=0))
print(np.sort(a, axis=1))

print(&quot;\npart 6 作业\n&quot;)

persontype = np.dtype({
&#39;names&#39;:[&#39;name&#39;, &#39;chinese&#39;,&#39;english&#39;,&#39;math&#39; ],
&#39;formats&#39;:[&#39;S32&#39;, &#39;i&#39;, &#39;i&#39;, &#39;i&#39;]})
peoples = np.array([(&quot;ZhangFei&quot;,66,65,30),(&quot;GuanYu&quot;,95,85,98),
(&quot;ZhaoYun&quot;,93,92,96),(&quot;HuangZhong&quot;,90,88,77),
(&quot;DianWei&quot;,80,90,90)],dtype=persontype)
#指定的竖列
name = peoples[:][&#39;name&#39;]
chinese = peoples[:][&#39;chinese&#39;]
english = peoples[:][&#39;english&#39;]
math = peoples[:][&#39;math&#39;]
#定义函数用于显示每一排的内容
def show(name,cj):
print(&#39;{} | {} | {} | {} | {} | {} &#39;
.format(name,np.mean(cj),np.min(cj),np.max(cj),np.var(cj),np.std(cj)))

print(&quot;科目 | 平均成绩 | 最小成绩 | 最大成绩 | 方差 | 标准差&quot;)
show(&quot;语文&quot;, chinese)
show(&quot;英语&quot;, english)
show(&quot;数学&quot;, math)

print(&quot;排名:&quot;)
#用sorted函数进行排序
ranking = sorted(peoples,key=lambda x:x[1]+x[2]+x[3], reverse=True)
print(ranking)

</p>2019-01-20</li><br/><li><span>Zahputor</span> 👍（68） 💬（6）<p>老师你好，我想问一下axis=0,axis=1,这个应该怎么理解？看得不是很明白</p>2018-12-21</li><br/><li><span>Kylin</span> 👍（44） 💬（4）<p>基本上…没听懂，一脸懵逼的听完了，老师还能抢救一下吗？是缺点什么基础知识？</p>2018-12-24</li><br/><li><span>蜉蝣</span> 👍（12） 💬（1）<p>关于axis参数的问题，我也有点模糊，后来知乎上看到这篇文章，思路清晰多了，也推荐大家看一下：https:&#47;&#47;zhuanlan.zhihu.com&#47;p&#47;30960190</p>2019-03-24</li><br/><li><span>何楚</span> 👍（12） 💬（7）<p>#!&#47;usr&#47;bin&#47;env python3
# -*- coding: utf-8 -*-

import numpy as np
persontype = np.dtype({
&#39;names&#39;: [&#39;name&#39;, &#39;chinese&#39;, &#39;math&#39;, &#39;english&#39;],
&#39;formats&#39;: [&#39;S32&#39;, &#39;i&#39;, &#39;i&#39;, &#39;i&#39;]})
peoples = np.array([(&quot;ZhangFei&quot;, 66, 65, 30), (&quot;GuanYu&quot;, 95, 85, 98),
(&quot;ZhaoYun&quot;, 93, 92, 96), (&quot;HuangZhong&quot;, 90, 88, 77),
(&quot;DianWei&quot;, 80, 90, 90)],
dtype=persontype)
for col in peoples.dtype.names:

# print(col)

    if col is &quot;name&quot;:
        continue
    print(&quot;mean of {}: {}&quot;.format(col, peoples[col].mean()))
    print(&quot;min of {}: {}&quot;.format(col, peoples[col].min()))
    print(&quot;max of {}: {}&quot;.format(col, peoples[col].max()))
    print(&quot;var of {}: {}&quot;.format(col, peoples[col].var()))
    print(&quot;std of {}: {}&quot;.format(col, peoples[col].std()))

report = np.empty([0, 0])
for i in range(peoples.size):
sum_score = peoples[&#39;chinese&#39;][i] + peoples[&#39;english&#39;][i] + peoples[&#39;math&#39;][i]
#print(sum_score)
report = np.append(report, [ sum_score])
report = -np.sort(-report)
print(&quot;sorted score:&quot;)
print(report)

怎么在 numpy 里作成绩求和还不是很清楚。另外，想把成绩和名字按排序后打印出来，要用索引，赶时间没研究，等看别人的结果。</p>2018-12-21</li><br/><li><span>从未在此</span> 👍（9） 💬（2）<p>根据我在网上找的学习资料，axis＝0，代表跨行；=1代表跨列，这样很容易理解。</p>2018-12-21</li><br/><li><span>Ben</span> 👍（7） 💬（1）<p>scoretype = np.dtype({&#39;names&#39;: [&#39;name&#39;, &#39;chinese&#39;, &#39;english&#39;, &#39;math&#39;],
&#39;formats&#39;: [&#39;S32&#39;, &#39;i&#39;, &#39;i&#39;, &#39;i&#39;]})
peoples = np.array(
[
(&quot;zhangfei&quot;, 66, 65, 30),
(&quot;guanyu&quot;, 95, 85, 98),
(&quot;zhaoyun&quot;, 93, 92, 96),
(&quot;huangzhong&quot;, 90, 88, 77),
(&quot;dianwei&quot;, 80, 90, 90)
], dtype=scoretype)
print(&quot;科目 | 平均成绩 | 最小成绩 | 最大成绩 | 方差 | 标准差&quot;)
courses = {&#39;语文&#39;: peoples[:][&#39;chinese&#39;],
&#39;英文&#39;: peoples[:][&#39;english&#39;], &#39;数学&#39;: peoples[:][&#39;math&#39;]}
for course, scores in courses.items():
print(course, np.mean(scores), np.amin(scores), np.amax(scores), np.std(scores),
np.var(scores))
print(&#39;Ranking&#39;)
ranking = sorted(peoples, key=lambda x: x[1]+x[2]+x[3], reverse=True)
print(ranking)</p>2019-07-01</li><br/><li><span>夕子</span> 👍（5） 💬（2）<p>一、为什么用numpy而不用list？
①存储上，list需要同时存储元素和指针，而numpy数组只存储元素，节省内存和计算时间。
②list的元素在系统内存中分散存储，而numpy数组存储在一个均匀连续的内存块中，遍历元素时不需要查找内存地址，节省计算资源。
③在内存访问模式中，缓存会直接把子节块从RAM加载到CPU寄存器中。因为数据连续的存储在内存中，numpy直接利用现代CPU的矢量化指令计算，加载寄存器中的多个连续浮点数。另外numpy中的矩阵计算可以采用多线程的方式，充分利用多核CPU计算资源，大大提升了计算效率。

二、其他数据结构类型：字典、元组、字符串

三、练习题
scoretype = np.dtype({&#39;names&#39;:[&#39;name&#39;,&#39;chinese&#39;,&#39;english&#39;,&#39;math&#39;,&#39;total&#39;], &#39;formats&#39;:[&#39;S32&#39;,&#39;i&#39;, &#39;i&#39;, &#39;i&#39;,&#39;i&#39;]})
peoples = np.array([(&#39;ZhangFei&#39;,66,65,30,0),(&#39;GuanYu&#39;,95,85,98,0),(&#39;ZhaoYun&#39;,93,92,96,0),(&#39;HuangZhong&#39;,90,88,77,0),(&#39;DianWei&#39;,80,90,90,0)], dtype=scoretype)
chineses = peoples[:][&#39;chinese&#39;]
englishes = peoples[:][&#39;english&#39;]
maths = peoples[:][&#39;math&#39;]
print(&#39;语文成绩：&#39;)
print(&#39;平均成绩&#39;,np.mean(chineses))
print(&#39;最小成绩&#39;,np.amin(chineses))
print(&#39;最大成绩&#39;,np.amax(chineses))
print(&#39;方差&#39;,np.var(chineses))
print(&#39;标准差&#39;,np.std(chineses))
print(&#39;-&#39;*30)
print(&#39;英语成绩：&#39;)
print(&#39;平均成绩&#39;,np.mean(englishes))
print(&#39;最小成绩&#39;,np.amin(englishes))
print(&#39;最大成绩&#39;,np.amax(englishes))
print(&#39;方差&#39;,np.var(englishes))
print(&#39;标准差&#39;,np.std(englishes))
print(&#39;-&#39;*30)
print(&#39;数学成绩：&#39;)
print(&#39;平均成绩&#39;,np.mean(maths))
print(&#39;最小成绩&#39;,np.amin(maths))
print(&#39;最大成绩&#39;,np.amax(maths))
print(&#39;方差&#39;,np.var(maths))
print(&#39;标准差&#39;,np.std(maths))
peoples[:][&#39;total&#39;] = peoples[:][&#39;chinese&#39;]+peoples[:][&#39;english&#39;]+peoples[:][&#39;math&#39;]
print(np.sort(peoples,order=&#39;total&#39;))

输出结果为：
语文成绩：
平均成绩 84.8
最小成绩 66
最大成绩 95
方差 114.96000000000001
标准差 10.721940122944169
------------------------------

英语成绩：
平均成绩 84.0
最小成绩 65
最大成绩 92
方差 95.6
标准差 9.777525249264253
------------------------------

数学成绩：
平均成绩 78.2
最小成绩 30
最大成绩 98
方差 634.56
标准差 25.19047439013406

[(b&#39;ZhangFei&#39;, 66, 65, 30, 161) (b&#39;HuangZhong&#39;, 90, 88, 77, 255)
(b&#39;DianWei&#39;, 80, 90, 90, 260) (b&#39;GuanYu&#39;, 95, 85, 98, 278)
(b&#39;ZhaoYun&#39;, 93, 92, 96, 281)]

我对结构数组不太熟悉，求总分那里试了对切片求和报错了，看了评论里老师的解答才知道在定义里做，这个要注意多练习。</p>2020-03-21</li><br/><li><span>抢地瓜的阿姨</span> 👍（4） 💬（1）<p>Dataframe 即将登场！哈哈哈</p>2018-12-22</li><br/><li><span>王张</span> 👍（3） 💬（2）<p> &#39;formats&#39;:[&#39;S32&#39;,&#39;i&#39;, &#39;i&#39;, &#39;i&#39;, &#39;f&#39;] 是什么意思？</p>2019-07-20</li><br/><li><span>小葱拌豆腐</span> 👍（3） 💬（1）<p>老师，请问一下您，没学过高数，没接触过计算机语言，要提前去把各种函数搞清楚吗？有没有推荐的办法，书籍，课程？</p>2018-12-21</li><br/><li><span>qinggeouye</span> 👍（2） 💬（2）<p>import numpy as np

people_type = np.dtype({&#39;names&#39;: [&#39;name&#39;, &#39;chinese&#39;, &#39;math&#39;, &#39;english&#39;, &#39;total&#39;],
&#39;formats&#39;: [&#39;S32&#39;, &#39;i&#39;, &#39;i&#39;, &#39;f&#39;, &#39;f&#39;]})
peoples = np.array([(&#39;ZhangFei&#39;, 60, 65, 30, 0), (&#39;GuanYu&#39;, 95, 85, 98, 0),
(&#39;ZhaoYun&#39;, 93, 92, 96, 0), (&#39;HuangZhong&#39;, 90, 88, 77, 0),
(&#39;DianWei&#39;, 80, 90, 90, 0)], dtype=people_type)

chinese = peoples[:][&#39;chinese&#39;]
math = peoples[:][&#39;math&#39;]
english = peoples[:][&#39;english&#39;]

peoples[:][&#39;total&#39;] = chinese + math + english
print(&quot;rank of total scores is \n %s&quot; % np.sort(peoples, order=&#39;total&#39;))
print(&quot;\n&quot;)

for key in list(people_type.fields.keys())[1:4]:
print(&quot;mean of %s is %s&quot; % (key, np.mean(peoples[:][key])))
print(&quot;max of %s is %s&quot; % (key, np.amax(peoples[:][key])))
print(&quot;min of %s is %s&quot; % (key, np.amin(peoples[:][key])))
print(&quot;std of %s is %s&quot; % (key, np.std(peoples[:][key])))
print(&quot;var of %s is %s&quot; % (key, np.var(peoples[:][key])))
print(&quot;\n&quot;)</p>2019-10-31</li><br/><li><span>建强</span> 👍（2） 💬（1）<p>#简易学生成绩档案管理
import numpy as np
student_type = np.dtype({&#39;names&#39;:[&#39;studentname&#39;,&#39;Chinese&#39;,&#39;English&#39;,&#39;Math&#39;,&#39;Total&#39;],&#39;formats&#39;:[&#39;U10&#39;,&#39;i&#39;,&#39;i&#39;,&#39;i&#39;,&#39;f&#39;]})
students = np.array([ (&quot;张飞&quot;,66,65,30,None),(&quot;关羽&quot;,95,85,98,None),(&quot;赵云&quot;,93,92,96,None),(&quot;黄忠&quot;,90,88,77,None),(&quot;典韦&quot;,80,90,90,None)]
,dtype = student_type)
Chinese = students[:][&#39;Chinese&#39;]
English = students[:][&#39;English&#39;]
Math = students[:][&#39;Math&#39;]

#指标分析
score_analy={&#39;平均成绩&#39;:{&#39;语文&#39;:np.mean(Chinese),&#39;英语&#39;: np.mean(English),&#39;数学&#39;:np.mean(Math)}
,&#39;最小成绩&#39;:{&#39;语文&#39;:np.amin(Chinese),&#39;英语&#39;: np.amin(English),&#39;数学&#39;:np.amin(Math)}
,&#39;最大成绩&#39;:{&#39;语文&#39;:np.amax(Chinese),&#39;英语&#39;: np.amax(English),&#39;数学&#39;:np.amax(Math)}
,&#39;标准差&#39; :{&#39;语文&#39;:np.std(Chinese) ,&#39;英语&#39;: np.std(English) ,&#39;数学&#39;: np.std(Math)}
,&#39;方差&#39; :{&#39;语文&#39;:np.var(Chinese) ,&#39;英语&#39;: np.var(English) ,&#39;数学&#39;: np.var(Math)}}

#统计总成绩
for i in range(len(students)):
students[i][&#39;Total&#39;] = sum(list(students[i])[1:-1])

#输出分析指标
print(&quot; 指标项 \t\t 语文 \t\t 英语 \t\t 数学 &quot;)
print((&quot;-&quot; * 10 +&quot;\t\t&quot;)*4)
for index in score_analy:
report = f&quot;{index:10}&quot;.format(index) + &quot;\t\t{语文:&gt;10.2f}\t\t{英语:&gt;10.2f}\t\t{数学:&gt;10.2f}&quot;
print(report.format_map(score_analy[index]))

print((&quot;-&quot; * 82))

#按总成绩输出排名
print(&quot;名次\t\t姓名\t\t总分&quot;)
print((&quot;-&quot; * 4 +&quot;\t\t&quot;)*3)

s = np.sort(students,order=&#39;Total&#39;)
for i in range(len(s)):
k=-1 * (i+1)
print(&#39;{rank:4}\t\t{name:4}\t\t{score:&gt;4}&#39;.format(rank=i+1,name=s[k][&#39;studentname&#39;],score=s[k][&#39;Total&#39;]))
</p>2019-06-15</li><br/><li><span>Geek_ce3c1f</span> 👍（2） 💬（1）<p>import numpy as np
persontype = np.dtype({
    &#39;names&#39;:[&#39;name&#39;, &#39;chinese&#39;, &#39;english&#39;, &#39;math&#39;],
    &#39;formats&#39;:[&#39;S32&#39;, &#39;i&#39;, &#39;i&#39;, &#39;f&#39;]})
peoples = np.array([(&quot;ZhangFei&quot;,66,65,30),(&quot;GuanYu&quot;,95,85,90),
                    (&quot;ZhaoYun&quot;,93,92,96),(&quot;HuangZhong&quot;,90,88,77),
                    (&quot;Dianwei&quot;,80,90,90)],dtype=persontype)

chineses = peoples[:][&#39;chinese&#39;]
maths = peoples[:][&#39;math&#39;]
englishs = peoples[:][&#39;english&#39;]

print(&quot;语文平均分%.2f，最小成绩%d，最大成绩%d，方差%.2f，标准差%.2f&quot; %(np.mean(chineses),np.amin(chineses),np.amax(chineses),np.var(chineses),np.std(chineses)))
print(&quot;数学平均分%d, 最小成绩%d，最大成绩%d，方差%d，标准差%d&quot; %(np.mean(maths),np.amin(maths),np.amax(maths),np.var(maths),np.std(maths)))
print(&quot;英语平均分%d, 最小成绩%d，最大成绩%d，方差%d，标准差%d&quot; %(np.mean(englishs),np.amin(englishs),np.amax(englishs),np.var(englishs),np.std(englishs)))

# chengji = np.array([[66,65,30],[95,85,90],[93,92,96],[90,88,77],[80,90,90]])

rank = np.sort(peoples, axis=None, kind=&#39;mergesort&#39;, order=(&#39;chinese&#39;,&#39;english&#39;,&#39;math&#39;))
print(rank)</p>2019-03-11</li><br/>
</ul>

你好，我是朱涛。

时光飞逝，不知不觉间，我们就已经完成了基础篇的学习，并且也已经完成了三个实战项目，但这终归是不够过瘾的。想要完全掌握Kotlin的基础语法，我们还需要更多的练习。我相信，你现在的心情就像是一个手握屠龙刀的勇士，热切希望找一些对手来验证自己的学习成果。

其实，我自己在学习一门新的编程语言的时候，有一个高效的方法，也分享给你。这里我以Kotlin为例，假设我现在是一个新手，想快速掌握Kotlin的话，我会这样做：

- 第一步，我会**去Google搜索一些语言特性对比的文章**。比如，我熟悉Java，想学Kotlin，我就会去搜“from Java to Kotlin”，然后去看一些Java、Kotlin语法对比的文章。这时候，我大脑里就会建立起Java与Kotlin的语法联系。
- 第二步，我会打开[Kotlin官方文档](https://kotlinlang.org/docs/basic-syntax.html)，花几个小时的时间粗略看一遍，对Kotlin的语法有个大致印象。
- 最后一步，我会**打开LeetCode之类的网站**，开始用Kotlin刷题。在刷题的过程中，我也会先从模拟类的题目开始，之后再到数组、链表、Map、二叉树之类的数据结构。整个过程由易到难，刚开始的时候，我会选择“简单题”，等熟练以后，再选择“中等题”，心情好的时候，我偶尔会做个“困难题”挑战一下。

当然，对于你来说，第一步和第二步都已经不是问题了，通过前面十几节课程的学习，你已经有了牢固的Kotlin基础。现在欠缺的，只是大量的练习而已。

说回来，其实我认为，我这种学习编程的方法是个一举多得的，比如它可以让我们：

- **快速掌握一门新的编程语言**。
- **夯实基本功**。通过刷算法题，可以进一步巩固自己的数据结构与算法知识，这对于以后的工作也会有很大的帮助。所谓软件的架构，其实一定程度上就是在选择不同的数据结构与算法解决问题。而基本功的扎实程度，也决定了一名开发者的能力上限。
- **面试加分**。众所周知，顶级的IT公司面试的时候，都是要做算法题的。假如你是一名Android或Java工程师，如果你能用Kotlin写出漂亮的题解，那将会是大大加分项。

另外，由于语法的简洁性，你会发现，用Kotlin做算法题，**比Java要“爽”很多**。同样的一道题目，用Java你可能要写很多代码，但Kotlin却只需要简单的几行。

所以接下来的春节假期呢，我就会带你来一起刷题，希望你在假期放松休息、陪伴家人之余，也不要停下学习的脚步。好，那么今天，我们就先来看几个简单的题目，就当作是热身了。

## 热身1：移除字符串当中的“元音字母”

这是LeetCode的1119号题。题意大致是这样的：程序的输入是一个字符串s。题目要求我们移除当中的所有元音字母a、e、i、o、u，然后返回。

这个问题，如果我们用Java来实现的话，大致会是这样的：

```java
public String removeVowels(String s) {
    StringBuilder builder = new StringBuilder();
    char[] array = s.toCharArray();

    for(char c: array) {
        // 不是元音字母，才会拼接
        if(c != 'a' && c != 'e' && c != 'i' && c !='o' && c != 'u') {
            builder.append(c);
        }
    }

    return builder.toString();
}
```

但如果是用Kotlin，我们一行代码就可以搞定：

```plain
fun removeVowels(s: String): String =
        s.filter { it !in setOf('a', 'e', 'i', 'o', 'u') }
```

这里，我们是使用了字符串的扩展函数filter，轻松就实现了前面的功能。这个题目很简单，同时也比较极端，下面我们来看一个更复杂的例子。

## 热身2：最常见的单词

这是LeetCode的819号题。题意大致如下：程序的输入是一段英语文本（paragraph），一个禁用单词列表（banned）返回出现次数最多、同时不在禁用列表中的单词。

这个题目其实跟我们第2次的实战项目“[英语词频统计](https://time.geekbang.org/column/article/477295)”有点类似，我们之前实现的是完整的单词频率，并且降序。这个题目只需要我们找到频率最高的单词，不过就是多了一个**单词黑名单**而已。

那么，这个题目如果我们用Java来实现，肯定是要不少代码的，但如果用Kotlin，简单的几行代码就可以搞定了：

```plain
fun mostCommonWord1(paragraph: String, banned: Array<String>) =
            paragraph.toLowerCase()
                .replace("[^a-zA-Z ]".toRegex(), " ")
                .split("\\s+".toRegex())
                .filter { it !in banned.toSet() }
                .groupBy { it }
                .mapValues { it.value.size }
                .maxBy { it.value }
                ?.key?:throw IllegalArgumentException()
```

可以看到，这段代码我们只需要在原有TextProcessor的基础上，做一点修改，就完成了。

另外，你可能也发现了，我们前面的两个例子都是用函数式思维来解决的，这其实是因为这两个问题用命令式会更复杂。而对于一些其他的问题，我们其实仍然可以选择命令式来解决。比如：手写排序算法。

## 热身3：用Kotlin实现冒泡排序

冒泡排序，是计算机里最基础的一种排序算法。如果你忘了它的实现方式，也没关系，我做了一个动图，让你可以清晰地看到算法的执行过程。

![图片](https://static001.geekbang.org/resource/image/89/14/896c2b92f5837fa05aa8e0d17d16e514.gif?wh=1080x608)

那么针对冒泡排序法，如果我们用Kotlin来实现，命令式的方式会更加直观一些，就像下面这样：

```plain
fun sort(array: IntArray): IntArray {
    for (end in (array.size - 1) downTo 1) {
        for (begin in 1..end) {
            if (array[begin - 1] > array[begin]) {
                val temp = array[begin - 1]
                array[begin - 1] = array[begin]
                array[begin] = temp
            }
        }
    }
    return array
}
```

这里，我们需要格外注意的是，在逆序遍历数组的时候，我们是使用了**逆序**的Range：“(array.size - 1) downTo 1”，而如果这里是用“1…(array.size - 1)”的话，其实是会出问题的。因为Kotlin当中的Range要求必须是右边不能小于左边，比如“1…3”是可以的，而“3…1”是不行的。

好了，到这里，相信你对用Kotlin刷算法题已经有了一定认识了。正如Kotlin官方所宣传的那样，Kotlin是一门多范式的编程语言，对于不同的问题，我们完全可以选择不同范式来进行编程。说到底就是：**怎么爽就怎么来**。

## 小作业

好，最后也再给你留一个小作业，请你用Kotlin来完成[LeetCode的165号题《版本号判断》](https://leetcode-cn.com/problems/compare-version-numbers/)。

**注意：**LeetCode中文站使用的Kotlin版本，仍然停留在1.3.10。如果你是使用Kotlin 1.6解题，代码在IDE当中编译通过了，而LeetCode显示编译出错，那么你就需要修改一下对应的实现。或者，你也可以将新版本的库函数一起拷贝到Solution当中去。

这道题目我会在下节课给出答案解析，我们下节课再见。
<div><strong>精选留言（10）</strong></div><ul>
<li><span>郑峰</span> 👍（5） 💬（1）<p>```Kotlin
fun compareVersion(version1: String, version2: String): Int {
  val v1 = version1.split(&quot;.&quot;).map { it.toInt() }
  val v2 = version2.split(&quot;.&quot;).map { it.toInt() }

for (i in 0 until maxOf(v1.size, v2.size)) {
val diff = (v1.getOrElse(i) { 0 } - v2.getOrElse(i) { 0 })
if (diff != 0) return if (diff &gt; 0) 1 else -1
}
return 0;
}

```</p>2022-01-30</li><br/><li><span>白乾涛</span> 👍（2） 💬（2）<p>我知道为啥找不到 maxBy 了，估计是因为这个方法在 1.6 版本中隐藏了

@DeprecatedSinceKotlin(warningSince = &quot;1.4&quot;, errorSince = &quot;1.5&quot;, hiddenSince = &quot;1.6&quot;)
public inline fun &lt;T, R : Comparable&lt;R&gt;&gt; Sequence&lt;T&gt;.maxBy(selector: (T) -&gt; R): T? {
    return maxByOrNull(selector)
}</p>2022-03-02</li><br/><li><span>Geek_Adr</span> 👍（2） 💬（1）<p>&#47;&#47; 我能找到的最大程度的函数式
    fun compareVersion(version1: String, version2: String): Int {
        return (version1.split(&quot;.&quot;).map { it.toInt() }
                to version2.split(&quot;.&quot;).map { it.toInt() })
            .run {
                (0 until maxOf(first.size, second.size))
                    .fold(0) { acc, i -&gt;
                        if (acc != 0) acc
                        else first.getOrElse(i) { 0 }.compareTo(second.getOrElse(i) { 0 })
                    }
            }
    }
</p>2022-02-07</li><br/><li><span>梁中华</span> 👍（1） 💬（1）<p>
fun mostCommonWord1(paragraph: String, banned: Array&lt;String&gt;) =
            paragraph.toLowerCase()
                .replace(&quot;[^a-zA-Z ]&quot;.toRegex(), &quot; &quot;)
                .split(&quot;\\s+&quot;.toRegex())
                .filter { it !in banned.toSet() }
                .groupBy { it }
                .mapValues { it.value.size }
               &#47;&#47; .maxBy { it.value }  &#47;&#47;这里编译不过，我改了下
               &#47;&#47; ?.key?:throw IllegalArgumentException()
             .toList()   &#47;&#47;先转成List才能用MaxBy
            .maxByOrNull { it.second }</p>2022-03-19</li><br/><li><span>PoPlus</span> 👍（1） 💬（1）<p>涛哥，校招生还推荐用 kotlin 来写算法吗，感觉有些简化的太过了 😅</p>2022-03-04</li><br/><li><span>Geek_Adr</span> 👍（1） 💬（1）<p>&#47;&#47; 函数式 176ms 击败19%
    fun compareVersion(version1: String, version2: String): Int {
        return (version1.split(&quot;.&quot;).map { it.toInt() }
                to version2.split(&quot;.&quot;).map { it.toInt() })
            .run {
                (0 until max(first.size, second.size))
                    .fold(0) { acc, i -&gt;
                        if (acc != 0) acc
                        else first.getOrElse(i) { 0 } - second.getOrElse(i) { 0 }
                    }
            }.let {
                when {
                    it &gt; 0 -&gt; 1
                    it &lt; 0 -&gt; -1
                    else -&gt; 0
                }
            }
    }

&#47;&#47; java  156ms 击败70%
    fun compareVersion(version1: String, version2: String): Int {
        val v1 = version1.split(&quot;.&quot;).map { it.toInt() }
        val v2 = version2.split(&quot;.&quot;).map { it.toInt() }
        var idx = 0
        while (idx &lt; v1.size &amp;&amp; idx &lt; v2.size) {
            if (v1[idx] &gt; v2[idx]) {
                return 1
            } else if (v1[idx] &lt; v2[idx]) {
                return -1
            }
            idx++
        }
        while (idx &lt; v1.size) {
            if (v1[idx++] &gt; 0) {
                return 1
            }
        }
        while (idx &lt; v2.size) {
            if (v2[idx++] &gt; 0) {
                return -1
            }
        }
        return 0
    }

</p>2022-02-07</li><br/><li><span>jim</span> 👍（1） 💬（1）<p>春节还更新吗？</p>2022-01-28</li><br/><li><span>爱学习的小羊</span> 👍（0） 💬（1）<p>我这个算是半java半kotlin编程了吧
fun compareVersion(version1: String, version2: String): Int {
        val nums1 = version1.split(&quot;.&quot;)
        val nums2 = version2.split(&quot;.&quot;)
        for (i in 0..maxOf(nums1.size,nums2.size)){
            var a = 0
            var b = 0
            if (i &lt; nums1.size) a = nums1[i].toInt()
            if (i&lt;nums2.size) b = nums2[i].toInt()
            val data = a - b
            when {
                data &gt; 0 -&gt; return 1
                data &lt; 0 -&gt; return -1
            }

        }
        return 0
    }</p>2022-03-21</li><br/><li><span>浅色的风</span> 👍（0） 💬（1）<p>是不是java思维
fun compareVersion(version1: String, version2: String): Int {
        val listV1 = version1.split(&quot;.&quot;).toList()
        val listV2 = version2.split(&quot;.&quot;).toList()

        val result = if (listV1.size &gt; listV2.size) 1 else -1

        val maxList = if (listV1.size &gt; listV2.size) listV1 else listV2
        val minList = if (listV1.size &lt;= listV2.size) listV1 else listV2

        for(i in 0..minList.size - 1){
            if(listV1[i].toInt() &gt; listV2[i].toInt()){
                return 1
            }else if(listV1[i].toInt() &lt; listV2[i].toInt()){
                return -1
            }
        }

        for(j in minList.size..maxList.size - 1){
            if(maxList[j].toInt() &gt; 0){
                return result
            }
        }

        return 0

    }</p>2022-03-02</li><br/><li><span>$Kotlin</span> 👍（0） 💬（1）<p>    fun compareVersion(version1: String, version2: String): Int {
        val versionList1 = version1.split(&quot;.&quot;).toMutableList()
        val versionList2 = version2.split(&quot;.&quot;).toMutableList()
        if (versionList1.size &gt; versionList2.size) {
            repeat(versionList1.size - versionList2.size) {
                versionList2.add(&quot;0&quot;)
            }
        } else {
            repeat(versionList2.size - versionList1.size) {
                versionList1.add(&quot;0&quot;)
            }
        }
        for (index in 0..versionList1.size-1) {
            val v1Int = versionList1[index].toInt()
            val v2Int = versionList2[index].toInt()
            if (v1Int &gt; v2Int) {
                return 1
            } else if (v1Int &lt; v2Int) {
                return -1
            }
        }
        return 0
    }</p>2022-01-28</li><br/>
</ul>
```

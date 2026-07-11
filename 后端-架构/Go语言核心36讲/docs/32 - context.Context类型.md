我们在上篇文章中讲到了`sync.WaitGroup`类型：一个可以帮我们实现一对多goroutine协作流程的同步工具。

**在使用`WaitGroup`值的时候，我们最好用“先统一`Add`，再并发`Done`，最后`Wait`”的标准模式来构建协作流程。**

如果在调用该值的`Wait`方法的同时，为了增大其计数器的值，而并发地调用该值的`Add`方法，那么就很可能会引发panic。

这就带来了一个问题，如果我们不能在一开始就确定执行子任务的goroutine的数量，那么使用`WaitGroup`值来协调它们和分发子任务的goroutine，就是有一定风险的。一个解决方案是：分批地启用执行子任务的goroutine。

## 前导内容：WaitGroup值补充知识

我们都知道，`WaitGroup`值是可以被复用的，但需要保证其计数周期的完整性。尤其是涉及对其`Wait`方法调用的时候，它的下一个计数周期必须要等到，与当前计数周期对应的那个`Wait`方法调用完成之后，才能够开始。

我在前面提到的可能会引发panic的情况，就是由于没有遵循这条规则而导致的。

只要我们在严格遵循上述规则的前提下，分批地启用执行子任务的goroutine，就肯定不会有问题。具体的实现方式有不少，其中最简单的方式就是使用`for`循环来作为辅助。这里的代码如下：

```
func coordinateWithWaitGroup() {
 total := 12
 stride := 3
 var num int32
 fmt.Printf("The number: %d [with sync.WaitGroup]\n", num)
 var wg sync.WaitGroup
 for i := 1; i <= total; i = i + stride {
  wg.Add(stride)
  for j := 0; j < stride; j++ {
   go addNum(&num, i+j, wg.Done)
  }
  wg.Wait()
 }
 fmt.Println("End.")
}
```

这里展示的`coordinateWithWaitGroup`函数，就是上一篇文章中同名函数的改造版本。而其中调用的`addNum`函数，则是上一篇文章中同名函数的简化版本。这两个函数都已被放置在了demo67.go文件中。

我们可以看到，经过改造后的`coordinateWithWaitGroup`函数，循环地使用了由变量`wg`代表的`WaitGroup`值。它运用的依然是“先统一`Add`，再并发`Done`，最后`Wait`”的这种模式，只不过它利用`for`语句，对此进行了复用。

好了，至此你应该已经对`WaitGroup`值的运用有所了解了。不过，我现在想让你使用另一种工具来实现上面的协作流程。

**我们今天的问题就是：怎样使用`context`包中的程序实体，实现一对多的goroutine协作流程？**

更具体地说，我需要你编写一个名为`coordinateWithContext`的函数。这个函数应该具有上面`coordinateWithWaitGroup`函数相同的功能。

显然，你不能再使用`sync.WaitGroup`了，而要用`context`包中的函数和`Context`类型作为实现工具。这里注意一点，是否分批启用执行子任务的goroutine其实并不重要。

我在这里给你一个参考答案。

```
func coordinateWithContext() {
 total := 12
 var num int32
 fmt.Printf("The number: %d [with context.Context]\n", num)
 cxt, cancelFunc := context.WithCancel(context.Background())
 for i := 1; i <= total; i++ {
  go addNum(&num, i, func() {
   if atomic.LoadInt32(&num) == int32(total) {
    cancelFunc()
   }
  })
 }
 <-cxt.Done()
 fmt.Println("End.")
}
```

在这个函数体中，我先后调用了`context.Background`函数和`context.WithCancel`函数，并得到了一个可撤销的`context.Context`类型的值（由变量`cxt`代表），以及一个`context.CancelFunc`类型的撤销函数（由变量`cancelFunc`代表）。

在后面那条唯一的`for`语句中，我在每次迭代中都通过一条`go`语句，异步地调用`addNum`函数，调用的总次数只依据了`total`变量的值。

请注意我给予`addNum`函数的最后一个参数值。它是一个匿名函数，其中只包含了一条`if`语句。这条`if`语句会“原子地”加载`num`变量的值，并判断它是否等于`total`变量的值。

如果两个值相等，那么就调用`cancelFunc`函数。其含义是，如果所有的`addNum`函数都执行完毕，那么就立即通知分发子任务的goroutine。

这里分发子任务的goroutine，即为执行`coordinateWithContext`函数的goroutine。它在执行完`for`语句后，会立即调用`cxt`变量的`Done`函数，并试图针对该函数返回的通道，进行接收操作。

由于一旦`cancelFunc`函数被调用，针对该通道的接收操作就会马上结束，所以，这样做就可以实现“等待所有的`addNum`函数都执行完毕”的功能。

## 问题解析

`context.Context`类型（以下简称`Context`类型）是在Go 1.7发布时才被加入到标准库的。而后，标准库中的很多其他代码包都为了支持它而进行了扩展，包括：`os/exec`包、`net`包、`database/sql`包，以及`runtime/pprof`包和`runtime/trace`包，等等。

`Context`类型之所以受到了标准库中众多代码包的积极支持，主要是因为它是一种非常通用的同步工具。它的值不但可以被任意地扩散，而且还可以被用来传递额外的信息和信号。

更具体地说，`Context`类型可以提供一类代表上下文的值。此类值是并发安全的，也就是说它可以被传播给多个goroutine。

由于`Context`类型实际上是一个接口类型，而`context`包中实现该接口的所有私有类型，都是基于某个数据类型的指针类型，所以，如此传播并不会影响该类型值的功能和安全。

`Context`类型的值（以下简称`Context`值）是可以繁衍的，这意味着我们可以通过一个`Context`值产生出任意个子值。这些子值可以携带其父值的属性和数据，也可以响应我们通过其父值传达的信号。

正因为如此，所有的`Context`值共同构成了一颗代表了上下文全貌的树形结构。这棵树的树根（或者称上下文根节点）是一个已经在`context`包中预定义好的`Context`值，它是全局唯一的。通过调用`context.Background`函数，我们就可以获取到它（我在`coordinateWithContext`函数中就是这么做的）。

这里注意一下，这个上下文根节点仅仅是一个最基本的支点，它不提供任何额外的功能。也就是说，它既不可以被撤销（cancel），也不能携带任何数据。

除此之外，`context`包中还包含了四个用于繁衍`Context`值的函数，即：`WithCancel`、`WithDeadline`、`WithTimeout`和`WithValue`。

这些函数的第一个参数的类型都是`context.Context`，而名称都为`parent`。顾名思义，这个位置上的参数对应的都是它们将会产生的`Context`值的父值。

`WithCancel`函数用于产生一个可撤销的`parent`的子值。在`coordinateWithContext`函数中，我通过调用该函数，获得了一个衍生自上下文根节点的`Context`值，和一个用于触发撤销信号的函数。

而`WithDeadline`函数和`WithTimeout`函数则都可以被用来产生一个会定时撤销的`parent`的子值。至于`WithValue`函数，我们可以通过调用它，产生一个会携带额外数据的`parent`的子值。

到这里，我们已经对`context`包中的函数和`Context`类型有了一个基本的认识了。不过这还不够，我们再来扩展一下。

## 知识扩展

### 问题1：“可撤销的”在`context`包中代表着什么？“撤销”一个`Context`值又意味着什么？

我相信很多初识`context`包的Go程序开发者，都会有这样的疑问。确实，“可撤销的”（cancelable）这个词在这里是比较抽象的，很容易让人迷惑。我这里再来解释一下。

这需要从`Context`类型的声明讲起。这个接口中有两个方法与“撤销”息息相关。`Done`方法会返回一个元素类型为`struct{}`的接收通道。不过，这个接收通道的用途并不是传递元素值，而是让调用方去感知“撤销”当前`Context`值的那个信号。

一旦当前的`Context`值被撤销，这里的接收通道就会被立即关闭。我们都知道，对于一个未包含任何元素值的通道来说，它的关闭会使任何针对它的接收操作立即结束。

正因为如此，在`coordinateWithContext`函数中，基于调用表达式`cxt.Done()`的接收操作，才能够起到感知撤销信号的作用。

除了让`Context`值的使用方感知到撤销信号，让它们得到“撤销”的具体原因，有时也是很有必要的。后者即是`Context`类型的`Err`方法的作用。该方法的结果是`error`类型的，并且其值只可能等于`context.Canceled`变量的值，或者`context.DeadlineExceeded`变量的值。

前者用于表示手动撤销，而后者则代表：由于我们给定的过期时间已到，而导致的撤销。

你可能已经感觉到了，对于`Context`值来说，“撤销”这个词如果当名词讲，指的其实就是被用来表达“撤销”状态的信号；如果当动词讲，指的就是对撤销信号的传达；而“可撤销的”指的则是具有传达这种撤销信号的能力。

我在前面讲过，当我们通过调用`context.WithCancel`函数产生一个可撤销的`Context`值时，还会获得一个用于触发撤销信号的函数。

通过调用这个函数，我们就可以触发针对这个`Context`值的撤销信号。一旦触发，撤销信号就会立即被传达给这个`Context`值，并由它的`Done`方法的结果值（一个接收通道）表达出来。

撤销函数只负责触发信号，而对应的可撤销的`Context`值也只负责传达信号，它们都不会去管后边具体的“撤销”操作。实际上，我们的代码可以在感知到撤销信号之后，进行任意的操作，`Context`值对此并没有任何的约束。

最后，若再深究的话，这里的“撤销”最原始的含义其实就是，终止程序针对某种请求（比如HTTP请求）的响应，或者取消对某种指令（比如SQL指令）的处理。这也是Go语言团队在创建`context`代码包，和`Context`类型时的初衷。

如果我们去查看`net`包和`database/sql`包的API和源码的话，就可以了解它们在这方面的典型应用。

### 问题2：撤销信号是如何在上下文树中传播的？

我在前面讲了，`context`包中包含了四个用于繁衍`Context`值的函数。其中的`WithCancel`、`WithDeadline`和`WithTimeout`都是被用来基于给定的`Context`值产生可撤销的子值的。

`context`包的`WithCancel`函数在被调用后会产生两个结果值。第一个结果值就是那个可撤销的`Context`值，而第二个结果值则是用于触发撤销信号的函数。

在撤销函数被调用之后，对应的`Context`值会先关闭它内部的接收通道，也就是它的`Done`方法会返回的那个通道。

然后，它会向它的所有子值（或者说子节点）传达撤销信号。这些子值会如法炮制，把撤销信号继续传播下去。最后，这个`Context`值会断开它与其父值之间的关联。

![](https://static001.geekbang.org/resource/image/a8/9e/a801f8f2b5e89017ec2857bc1815fc9e.png?wh=1112%2A647)

（在上下文树中传播撤销信号）

我们通过调用`context`包的`WithDeadline`函数或者`WithTimeout`函数生成的`Context`值也是可撤销的。它们不但可以被手动撤销，还会依据在生成时被给定的过期时间，自动地进行定时撤销。这里定时撤销的功能是借助它们内部的计时器来实现的。

当过期时间到达时，这两种`Context`值的行为与`Context`值被手动撤销时的行为是几乎一致的，只不过前者会在最后停止并释放掉其内部的计时器。

最后要注意，通过调用`context.WithValue`函数得到的`Context`值是不可撤销的。撤销信号在被传播时，若遇到它们则会直接跨过，并试图将信号直接传给它们的子值。

### 问题 3：怎样通过`Context`值携带数据？怎样从中获取数据？

既然谈到了`context`包的`WithValue`函数，我们就来说说`Context`值携带数据的方式。

`WithValue`函数在产生新的`Context`值（以下简称含数据的`Context`值）的时候需要三个参数，即：父值、键和值。与“字典对于键的约束”类似，这里键的类型必须是可判等的。

原因很简单，当我们从中获取数据的时候，它需要根据给定的键来查找对应的值。不过，这种`Context`值并不是用字典来存储键和值的，后两者只是被简单地存储在前者的相应字段中而已。

`Context`类型的`Value`方法就是被用来获取数据的。在我们调用含数据的`Context`值的`Value`方法时，它会先判断给定的键，是否与当前值中存储的键相等，如果相等就把该值中存储的值直接返回，否则就到其父值中继续查找。

如果其父值中仍然未存储相等的键，那么该方法就会沿着上下文根节点的方向一路查找下去。

注意，除了含数据的`Context`值以外，其他几种`Context`值都是无法携带数据的。因此，`Context`值的`Value`方法在沿路查找的时候，会直接跨过那几种值。

如果我们调用的`Value`方法的所属值本身就是不含数据的，那么实际调用的就将会是其父辈或祖辈的`Value`方法。这是由于这几种`Context`值的实际类型，都属于结构体类型，并且它们都是通过“将其父值嵌入到自身”，来表达父子关系的。

最后，提醒一下，`Context`接口并没有提供改变数据的方法。因此，在通常情况下，我们只能通过在上下文树中添加含数据的`Context`值来存储新的数据，或者通过撤销此种值的父值丢弃掉相应的数据。如果你存储在这里的数据可以从外部改变，那么必须自行保证安全。

## 总结

我们今天主要讨论的是`context`包中的函数和`Context`类型。该包中的函数都是用于产生新的`Context`类型值的。`Context`类型是一个可以帮助我们实现多goroutine协作流程的同步工具。不但如此，我们还可以通过此类型的值传达撤销信号或传递数据。

`Context`类型的实际值大体上分为三种，即：根`Context`值、可撤销的`Context`值和含数据的`Context`值。所有的`Context`值共同构成了一颗上下文树。这棵树的作用域是全局的，而根`Context`值就是这棵树的根。它是全局唯一的，并且不提供任何额外的功能。

可撤销的`Context`值又分为：只可手动撤销的`Context`值，和可以定时撤销的`Context`值。

我们可以通过生成它们时得到的撤销函数来对其进行手动的撤销。对于后者，定时撤销的时间必须在生成时就完全确定，并且不能更改。不过，我们可以在过期时间达到之前，对其进行手动的撤销。

一旦撤销函数被调用，撤销信号就会立即被传达给对应的`Context`值，并由该值的`Done`方法返回的接收通道表达出来。

“撤销”这个操作是`Context`值能够协调多个goroutine的关键所在。撤销信号总是会沿着上下文树叶子节点的方向传播开来。

含数据的`Context`值可以携带数据。每个值都可以存储一对键和值。在我们调用它的`Value`方法的时候，它会沿着上下文树的根节点的方向逐个值的进行查找。如果发现相等的键，它就会立即返回对应的值，否则将在最后返回`nil`。

含数据的`Context`值不能被撤销，而可撤销的`Context`值又无法携带数据。但是，由于它们共同组成了一个有机的整体（即上下文树），所以在功能上要比`sync.WaitGroup`强大得多。

## 思考题

今天的思考题是：`Context`值在传达撤销信号的时候是广度优先的，还是深度优先的？其优势和劣势都是什么？

[戳此查看Go语言专栏文章配套详细代码。](https://github.com/hyper0x/Golang_Puzzlers)
<div><strong>精选留言（15）</strong></div><ul>
<li><span>拂尘</span> 👍（8） 💬（4）<p>@郝老师 有几点疑问烦劳回答下，谢谢！
1、在coordinateWithContext的例子中，总共有12个子goroutine被创建，第12个即最后一个子goroutine在运行结束时，会通过计算defer表达式从而触发cancelFunc的调用，从而通知主goroutine结束在ctx.Done上获取通道的接收等待。我的问题是，在第12个子goroutine计算defer表达式的时候，会不会存在if条件不满足，未执行到cancelFunc的情况？或者说，在此时，第1到第11的子goroutine中，会存在自旋cas未执行完的情况吗？如果这种情况有，是否会导致主goroutine永远阻塞的情况？
2、在撤销函数被调用的时候，在当前context上，通过contex.Done获取的通道会马上感知到吗？还是会同步等待，使撤销信号在当前context的所有subtree上的所有context传播完成后，再感知到？还是有其他情况？
3、WithDeadline和WithTimeout的区别是什么？具体说，deadline是针对某个具体时间，而timeout是针对当前时间的延时来定义自动撤销时间吗？
感谢回复！</p>2020-09-05</li><br/><li><span>Shawn</span> 👍（8） 💬（1）<p>看代码是深度优先，但是我自己写了demo，顺序是乱的，求老师讲解</p>2018-10-25</li><br/><li><span>mclee</span> 👍（4） 💬（4）<p>
实测了下，context.WithValue 得到的新的 ctx 当其 parent context cancle 时也能收到 done 信号啊，并不是文中说的那样会跳过！

package main

import (
&quot;context&quot;
&quot;fmt&quot;
&quot;time&quot;
)

func main() {
ctx1, cancelFun := context.WithCancel(context.Background())
ctx2 := context.WithValue(ctx1, &quot;&quot;, &quot;&quot;)
ctx3, _ := context.WithCancel(ctx1)

    go watch(ctx1, &quot;ctx1&quot;)
    go watch(ctx2, &quot;ctx2&quot;)
    go watch(ctx3, &quot;ctx3&quot;)

    time.Sleep(2 * time.Second)
    fmt.Println(&quot;可以了，通知监控停止&quot;)
    cancelFun()

    &#47;&#47;为了检测监控过是否停止，如果没有监控输出，就表示停止了
    time.Sleep(5 * time.Second)

}

func watch(ctx context.Context, name string) {
for {
select {
case &lt;-ctx.Done():
fmt.Println(name,&quot;监控退出，停止了...&quot;)
return
default:
fmt.Println(name,&quot;goroutine监控中...&quot;)
time.Sleep(2 * time.Second)
}
}
}
</p>2022-02-11</li><br/><li><span>茴香根</span> 👍（4） 💬（1）<p>留言区很多人说Context 是深度优先，但是我在想每个goroutine 被调用的顺序都是不确定的，因此在编写goroutine 代码时，实际的撤销响应不能假定其父或子context 所在的goroutine一定先或者后结束。</p>2019-07-25</li><br/><li><span>Cutler</span> 👍（4） 💬（3）<p>cotext.backround()和cotext.todo()有什么区别</p>2019-04-09</li><br/><li><span>鲲鹏飞九万里</span> 👍（1） 💬（1）<p>老师，您还能看到我的留言吗，现在已经是2023年了。您看我下面的代码，比您的代码少了一句time.Sleep(time.Millisecond * 200)， 之后，打印的结果就是错的，只打印了12个数，您能给解释一下吗。（我运行环境是：go version go1.18.3 darwin&#47;amd64， 2.3 GHz 四核Intel Core i5）
func main() {
	&#47;&#47; coordinateWithWaitGroup()
	coordinateWithContext()
}

func coordinateWithContext() {
total := 12
var num int32
fmt.Printf(&quot;The number: %d [with context.Context]\n&quot;, num)
cxt, cancelFunc := context.WithCancel(context.Background())
for i := 1; i &lt;= total; i++ {
go addNum(&amp;num, i, func() {
&#47;&#47; 如果所有的addNum函数都执行完毕，那么就立即分发子任务的goroutine
&#47;&#47; 这里分发子任务的goroutine，就是执行 coordinateWithContext 函数的goroutine.
if atomic.LoadInt32(&amp;num) == int32(total) {
&#47;&#47; &lt;-cxt.Done() 针对该函数返回的通道进行接收操作。
&#47;&#47; cancelFunc() 函数被调用，针对该通道的接收会马上结束。
&#47;&#47; 所以，这样做就可以实现“等待所有的addNum函数都执行完毕”的功能
cancelFunc()
}
})
}
&lt;-cxt.Done()
fmt.Println(&quot;end.&quot;)
}

func addNum(numP *int32, id int, deferFunc func()) {
defer func() {
deferFunc()
}()
for i := 0; ; i++ {
currNum := atomic.LoadInt32(numP)
newNum := currNum + 1
&#47;&#47; time.Sleep(time.Millisecond * 200)
if atomic.CompareAndSwapInt32(numP, currNum, newNum) {
fmt.Printf(&quot;The number: %d [%d-%d]\n&quot;, newNum, id, i)
break
} else {
fmt.Printf(&quot;The CAS option failed. [%d-%d]\n&quot;, id, i)
}
}
}

运行的结果为：
$ go run demo01.go
The number: 0 [with context.Context]
The number: 1 [12-0]
The number: 2 [1-0]
The number: 3 [2-0]
The number: 4 [3-0]
The number: 5 [4-0]
The number: 6 [9-0]
The number: 7 [10-0]
The number: 8 [11-0]
The number: 10 [6-0]
The number: 11 [5-0]
The number: 9 [8-0]
end.

</p>2023-01-09</li><br/><li><span>hunterlodge</span> 👍（1） 💬（1）<p>“由于Context类型实际上是一个接口类型，而context包中实现该接口的所有私有类型，都是基于某个数据类型的指针类型，所以，如此传播并不会影响该类型值的功能和安全。”
请问老师，这句话中的「所以」二字怎么理解呢？指针不是会导致数据共享和竞争吗？为什么反而是安全的呢？谢谢！</p>2021-05-05</li><br/><li><span>moooofly</span> 👍（1） 💬（2）<p>“它会向它的所有子值（或者说子节点）传达撤销信号。这些子值会如法炮制，把撤销信号继续传播下去。最后，这个 Context 值会断开它与其父值之间的关联。”--这里有一个问题，我能理解，当在这个上下文树上的某个 node 上触发 cancel 信号时，以该 node 为根的子上下文树会从原来的树上断开；而文中又提到“撤销信号在被传播时，若遇到它们（调用 context.WithValue 函数得到的 Context 值）则会直接跨过” ，那么，这些被“跨过”的 node ，在上面说的子上下文树断开的过程里，是一起断开了？还是仍旧会和更上层的 node 节点有关联？</p>2019-09-30</li><br/><li><span>海盗船长</span> 👍（1） 💬（1）<p>实际使用中 http.ReverseProxy经常会报 proxy error：context canceled 请问老师有哪些原因可能导致这个问题</p>2019-09-02</li><br/><li><span>闫飞</span> 👍（1） 💬（1）<p>繁衍一词的翻译有些生硬，是否能换一个好理解一些的中文词汇</p>2019-07-16</li><br/><li><span>尚恩</span> 👍（0） 💬（1）<p>老师，你的图是用什么工具画的？
</p>2024-02-19</li><br/><li><span>寻风</span> 👍（0） 💬（1）<p>Context可以看作是某个父goroutine的一个变量,并且这个变量是线程安全的, 当这个变量传入子的goroutine后, 就意味着父goroutine和子goroutine可以通过这个变量来进行信息交互?
或者Context是一个独立申请的的内存区域, 父goroutine和子goroutine都有一个指针指向它, 这样就可以通过这块共享的内存进行信息交互了?
</p>2022-05-11</li><br/><li><span>jxs1211</span> 👍（0） 💬（1）<p>coordinateWithContext中，如果改成WithTimeout创建ctx的话，主goroutine只要&lt;-ctx.Done()接收到挂壁通道的信号后就会立马解除阻塞，而执行退出，这个时候即使for中的子goroutine还没有执行完成也会被强制退出了，这样情况下某个子goroutine执行到一半的时候，会被‘中断’，感觉上没有得到公平的对待，个人理解的cpu在goroutine中调度，如果足够公平的话，至少要在等到当前执行的goroutine阻塞而让出cpu，才切到其他goroutine执行，还是我理解错了，cpu就是不停的在各个goroutine间切来来去的执行，而不管某个goroutine有没有阻塞</p>2021-11-23</li><br/><li><span>jxs1211</span> 👍（0） 💬（2）<p>waitgroup的改进版中，每批就是一个wg的技术周期，当前循环的计数周期没有完成，下一次不会开始，也就是说每stride这么多个个goroutine执行完成之前，是不会开起下一批goroutine的，这样的话，其实每一批之间是串行的，并不是并发total那么多goroutine，而是只并发了stride个goroutine，对吗？</p>2021-11-20</li><br/><li><span>jxs1211</span> 👍（0） 💬（1）<p>func defaultCompareAndSwapInt32(addr *int32, old, new int32) (swapped bool) {
	if old != *addr {
		return false
	}
	*addr = new
	return true
}
这是我自己写的一个没有原子操作的defaultCompareAndSwapInt32，替换atomic.CompareAndSwapInt32，total := 120，测试的数据好像没有错乱，每个goroutine的交换都是都是递增的，是我理解错了吗
added from 0 to 1 --2 
added from 1 to 2 --4 
added from 2 to 3 --3 
added from 3 to 4 --5 
added from 4 to 5 --6 
added from 5 to 6 --7 
added from 6 to 7 --9 
added from 7 to 8 --8 
added from 8 to 9 --10 
added from 9 to 10 --11 
added from 10 to 11 --12 
added from 11 to 12 --13 
added from 12 to 13 --15 
added from 13 to 14 --14 
added from 14 to 15 --16 
added from 15 to 16 --18 
added from 16 to 17 --17 
added from 17 to 18 --19 
added from 18 to 19 --20 
added from 19 to 20 --22 
added from 20 to 21 --21 
added from 21 to 22 --23 
added from 22 to 23 --24 
added from 23 to 24 --25 
added from 24 to 25 --27 
added from 25 to 26 --28 
added from 26 to 27 --26 
。。。。
added from 83 to 84 --85 
added from 84 to 85 --87 
added from 85 to 86 --86 
added from 86 to 87 --88 
added from 87 to 88 --89 
added from 88 to 89 --91 
added from 89 to 90 --90 
added from 90 to 91 --93 
added from 91 to 92 --94 
added from 92 to 93 --92 
added from 93 to 94 --96 
added from 94 to 95 --97 
added from 95 to 96 --95 
added from 96 to 97 --98 
added from 97 to 98 --99 
added from 98 to 99 --100 
added from 99 to 100 --103 
added from 100 to 101 --101 
added from 101 to 102 --102 
added from 102 to 103 --104 
added from 103 to 104 --105 
added from 104 to 105 --106 
added from 105 to 106 --107 
added from 106 to 107 --108 
added from 107 to 108 --109 
added from 108 to 109 --112 
added from 109 to 110 --110 
added from 110 to 111 --111 
added from 111 to 112 --114 
added from 112 to 113 --113 
added from 113 to 114 --115 
added from 114 to 115 --117 
added from 115 to 116 --118 
added from 116 to 117 --116 
added from 117 to 118 --120 
added from 118 to 119 --119 
added from 119 to 120 --121 
</p>2021-10-26</li><br/>
</ul>

你好，我是朱涛。

在前面的课程里，我们一直在研究如何使用Kotlin协程，比如，如何启动协程，如何使用挂起函数，如何使用Channel、Flow等API。但到目前为止，我们只知道该怎么用协程，对它内部的运行机制并没有深究。

现在我们都知道，launch、async可以创建、启动新的协程，但我们只能通过调试参数，通过log看到协程。比如我们可以回过头来看下[第13讲](https://time.geekbang.org/column/article/485632)当中的代码：

```plain
// 代码段1

// 代码中一共启动了两个协程
fun main() = runBlocking {
    println(Thread.currentThread().name)

    launch {
        println(Thread.currentThread().name)
        delay(100L)
    }

    Thread.sleep(1000L)
}

/*
输出结果：
main @coroutine#1
main @coroutine#2
*/
```

现在回过头来看，这段代码无疑是非常简单的，runBlocking{} 启动了第一个协程，launch{} 启动了第二个协程。可是，有一个问题，我们一直都没有找到答案：**协程到底是如何创建的？它对应的源代码，到底在哪个类？具体在哪一行？**

我们常说Java线程的源代码是Thread.java，这样说虽然不一定准确，但我们起码能看到几个暴露出来的方法。那么，在Kotlin协程当中，有没有类似Coroutine.kt的类呢？对于这些问题，我们唯有去阅读Kotlin协程的源码、去分析launch的启动流程，才能找到答案。

这节课，我就将从[第26讲](https://time.geekbang.org/column/article/495862)当中提到的createCoroutine{}、startCoroutine{} 这两个函数开始说起，在认识了这两个协程基础元素以后，我们就会进入协程的“中间层”，开始分析launch的源代码。我相信，学完这节课以后，你一定会对Kotlin协程有一个更加透彻的认识。

## 协程启动的基础API

在第26讲里，我给你留了一个思考题，在[Continuation.kt](https://github.com/JetBrains/kotlin/blob/master/libraries/stdlib/src/kotlin/coroutines/Continuation.kt)这个文件当中，还有两个重要的扩展函数：

```plain
// 代码段2

public fun <T> (suspend () -> T).createCoroutine(
    completion: Continuation<T>
): Continuation<Unit> =
    SafeContinuation(createCoroutineUnintercepted(completion).intercepted(), COROUTINE_SUSPENDED)

public fun <T> (suspend () -> T).startCoroutine(
    completion: Continuation<T>
) {
    createCoroutineUnintercepted(completion).intercepted().resume(Unit)
}
```

其实，createCoroutine{}、startCoroutine{}这两个函数，就是Kotlin协程当中最基础的两个创建协程的API。

我们在[第14讲](https://time.geekbang.org/column/article/486305)里曾经提到过，启动协程有三种常见的方式：launch、runBlocking、async。它们其实属于协程中间层提供的API，而它们的底层都在某种程度上调用了“基础层”的协程API。

那么，这是不是就意味着：**我们使用协程的基础层API，也可以创建协程呢？**

答案当然是肯定的。我们可以来分析一下代码段2当中的函数签名。

createCoroutine{}、startCoroutine{}，它们都是扩展函数，其扩展接收者类型是一个函数类型：`suspend () -> T`，代表了“无参数，返回值为T的挂起函数或者Lambda”。而对于函数本身，它们两个都接收一个 `Continuation<T>` 类型的参数，其中一个函数，还会返回一个 `Continuation<Unit>` 类型的返回值。

也许你对于“给函数类型增加扩展”这样的行为会感到不太适应。不过，在Kotlin当中，**函数就是一等公民**，普通的类型可以有扩展，那么，函数类型自然也可以有扩展。因此，我们完全可以写出像下面这样的代码：

```plain
// 代码段3

fun main() {
    testStartCoroutine()
    Thread.sleep(2000L)
}

val block = suspend {
    println("Hello!")
    delay(1000L)
    println("World!")
    "Result"
}

private fun testStartCoroutine() {

    val continuation = object : Continuation<String> {
        override val context: CoroutineContext
            get() = EmptyCoroutineContext

        override fun resumeWith(result: Result<String>) {
            println("Result is: ${result.getOrNull()}")
        }
    }

    block.startCoroutine(continuation)
}

/*
输出结果
Hello!
World!
Result is: Result
*/
```

在这段代码中，我们定义了一个Lambda表达式block，它的类型就是 `suspend () -> T`。这样一来，我们就可以用block.startCoroutine()来启动协程了。这里，我们还创建了一个匿名内部类对象continuation，作为startCoroutine()的参数。

在[加餐](https://time.geekbang.org/column/article/497868)里，我们提到过Continuation主要有两种用法，一种是在实现挂起函数的时候，用于**传递挂起函数的执行结果**；另一种是在调用挂起函数的时候，以匿名内部类的方式，用于**接收挂起函数的执行结果**。而代码段3中Continuation的作用，则明显属于后者。

从代码段3的执行结果中，我们可以看出来，startCoroutine()的作用其实就是创建一个新的协程，并且执行block当中的逻辑，等协程执行完毕以后，将结果返回给Continuation对象。而这个逻辑，我们使用 **createCoroutine()** 这个方法其实也可以实现。

```plain
代码段4

private fun testCreateCoroutine() {

    val continuation = object : Continuation<String> {
        override val context: CoroutineContext
            get() = EmptyCoroutineContext

        override fun resumeWith(result: Result<String>) {
            println("Result is: ${result.getOrNull()}")
        }
    }

    val coroutine = block.createCoroutine(continuation)

    coroutine.resume(Unit)
}

/*
输出结果
Hello!
World!
Result is: Result
*/
```

根据以上代码，我们可以看到，createCoroutine()的作用其实就是创建一个协程，并暂时先不启动它。等我们想要启动它的时候，直接调用resume()即可。如果我们再进一步分析代码段2当中的源代码，会发现createCoroutine()、startCoroutine()的源代码差别也并不大，只是前者没有调用resume()，而后者调用了resume()。

换句话说，startCoroutine()之所以可以创建并同时启动协程的原因就在于，它在源码中直接调用了resume(Unit)，所以，我们在代码段3当中就不需要自己调用resume()方法了。

那么下面，我们就以startCoroutine()为例，来研究下它的实现原理。我们把代码段3反编译成Java，看看它会变成什么样子：

```java
// 代码段5

public final class LaunchUnderTheHoodKt {
    // 1
    public static final void main() {
        testStartCoroutine();
        Thread.sleep(2000L);
    }

    // 2
    private static final Function1<Continuation<? super String>, Object> block = new LaunchUnderTheHoodKt$block$1(null);

    // 3
    public static final Function1<Continuation<? super String>, Object> getBlock() {
        return block;
    }
    // 4
    static final class LaunchUnderTheHoodKt$block$1 extends SuspendLambda implements Function1<Continuation<? super String>, Object> {
        int label;

        LaunchUnderTheHoodKt$block$1(Continuation $completion) {
          super(1, $completion);
        }

        @Nullable
        public final Object invokeSuspend(@NotNull Object $result) {
          Object object = IntrinsicsKt.getCOROUTINE_SUSPENDED();
          switch (this.label) {
            case 0:
              ResultKt.throwOnFailure(SYNTHETIC_LOCAL_VARIABLE_1);
              System.out
                .println("Hello!");
              this.label = 1;
              if (DelayKt.delay(1000L, (Continuation)this) == object)
                return object;
              DelayKt.delay(1000L, (Continuation)this);
              System.out
                .println("World!");
              return "Result";
            case 1:
              ResultKt.throwOnFailure(SYNTHETIC_LOCAL_VARIABLE_1);
              System.out.println("World!");
              return "Result";
          }
          throw new IllegalStateException("call to 'resume' before 'invoke' with coroutine");
        }

        @NotNull
        public final Continuation<Unit> create(@NotNull Continuation<? super LaunchUnderTheHoodKt$block$1> $completion) {
          return (Continuation<Unit>)new LaunchUnderTheHoodKt$block$1($completion);
        }

        @Nullable
        public final Object invoke(@Nullable Continuation<?> p1) {
          return ((LaunchUnderTheHoodKt$block$1)create(p1)).invokeSuspend(Unit.INSTANCE);
        }
    }

    // 5
    private static final void testStartCoroutine() {
        LaunchUnderTheHoodKt$testStartCoroutine$continuation$1 continuation = new LaunchUnderTheHoodKt$testStartCoroutine$continuation$1();
        ContinuationKt.startCoroutine(block, continuation);
    }

    // 6
    public static final class LaunchUnderTheHoodKt$testStartCoroutine$continuation$1 implements Continuation<String> {
        @NotNull
        public CoroutineContext getContext() {
          return (CoroutineContext)EmptyCoroutineContext.INSTANCE;
        }

        public void resumeWith(@NotNull Object result) {
          System.out.println(Intrinsics.stringPlus("Result is: ", Result.isFailure-impl(result) ? null : result));
        }
    }
}


internal abstract class SuspendLambda(
    public override val arity: Int,
    completion: Continuation<Any?>?
) : ContinuationImpl(completion), FunctionBase<Any?>, SuspendFunction {}
```

上面的反编译代码中，一共有6个注释，我们一个个来看：

- 注释1，是我们的main()函数。由于它本身只是一个普通的函数，因此反编译之后，逻辑并没有什么变化。
- 注释2、3，它们是Kotlin为block变量生成的静态变量以及方法。
- 注释4，`LaunchUnderTheHoodKt$block$1`，其实就是block具体的实现类。这个类继承自SuspendLambda，而SuspendLambda是ContinuationImpl的子类，因此它也间接实现了Continuation接口。其中的invokeSuspend()，也就是我们在上节课分析过的**协程状态机逻辑**。除此之外，它还有一个create()方法，我们在后面会来分析它。
- 注释5，它对应了testStartCoroutine()这个方法，原本的 `block.startCoroutine(continuation)` 变成了“`ContinuationKt.startCoroutine(block, continuation)`”，这其实就体现出了扩展函数的原理。
- 注释6，其实就是continuation变量对应的匿名内部类。

那么接下来，我们就可以对照着反编译代码，来分析整个代码的执行流程了。

首先，main()函数会调用testStartCoroutine()函数，接着，就会调用startCoroutine()方法。

```plain
// 代码段6

public fun <T> (suspend () -> T).startCoroutine(
    completion: Continuation<T>
) {
//        注意这里
//           ↓
createCoroutineUnintercepted(completion).intercepted().resume(Unit)
}
```

从代码段6里，我们可以看到，在startCoroutine()当中，首先会调用createCoroutineUnintercepted()方法。如果我们直接去看它的源代码，会发现它只存在一个声明，并没有具体实现：

```plain
// 代码段7

//    注意这里
//       ↓
public expect fun <T> (suspend () -> T).createCoroutineUnintercepted(
    completion: Continuation<T>
): Continuation<Unit>
```

上面代码中的expect，我们可以把它理解为一种**声明**，由于Kotlin是面向多个平台的，具体的实现，就需要在特定的平台实现。所以在这里，我们就需要打开Kotlin的源代码，找到JVM平台对应的实现：

```plain
// 代码段8

//    1，注意这里
//       ↓
public actual fun <T> (suspend () -> T).createCoroutineUnintercepted(
    completion: Continuation<T>
): Continuation<Unit> {
    val probeCompletion = probeCoroutineCreated(completion)
    //             2，注意这里
    //               ↓
    return if (this is BaseContinuationImpl)
        create(probeCompletion)
    else
        createCoroutineFromSuspendFunction(probeCompletion) {
            (this as Function1<Continuation<T>, Any?>).invoke(it)
        }
}
```

请留意这里的注释1，这个actual，代表了createCoroutineUnintercepted()在JVM平台的实现。

另外，我们可以看到，createCoroutineUnintercepted()仍然还是一个扩展函数，注释2处的this，其实就代表了前面代码段3当中的block变量。我们结合代码段5反编译出来的 `LaunchUnderTheHoodKt$block$1`，可以知道block其实就是SuspendLambda的子类，而SuspendLambda则是ContinuationImpl的子类。

因此，注释2处的 `(this is BaseContinuationImpl)` 条件一定是为 **true** 的。这时候，它就会调用 `create(probeCompletion)`。

然后，如果你去查看create()的源代码，会看到这样的代码：

```plain
// 代码段9

public open fun create(completion: Continuation<*>): Continuation<Unit> {
    throw UnsupportedOperationException("create(Continuation) has not been overridden")
}
```

可以看到，在默认情况下，这个create()方法是会抛出异常的，它的提示信息是：create()方法没有被重写！潜台词就是，create()方法应该被重写！如果不被重写，就会抛出异常。

那么，**create()方法是在哪里被重写的呢？**答案其实就在代码段5的“`LaunchUnderTheHoodKt$block$1`”这个block的实现类当中。

```java
// 代码段10

static final class LaunchUnderTheHoodKt$block$1 extends SuspendLambda implements Function1<Continuation<? super String>, Object> {
    int label;

    LaunchUnderTheHoodKt$block$1(Continuation $completion) {
      super(1, $completion);
    }

    @Nullable
    public final Object invokeSuspend(@NotNull Object $result) {
      Object object = IntrinsicsKt.getCOROUTINE_SUSPENDED();
      switch (this.label) {
        case 0:
          ResultKt.throwOnFailure(SYNTHETIC_LOCAL_VARIABLE_1);
          System.out
            .println("Hello!");
          this.label = 1;
          if (DelayKt.delay(1000L, (Continuation)this) == object)
            return object;
          DelayKt.delay(1000L, (Continuation)this);
          System.out
            .println("World!");
          return "Result";
        case 1:
          ResultKt.throwOnFailure(SYNTHETIC_LOCAL_VARIABLE_1);
          System.out.println("World!");
          return "Result";
      }
      throw new IllegalStateException("call to 'resume' before 'invoke' with coroutine");
    }

    // 1，注意这里
    public final Continuation<Unit> create(@NotNull Continuation<? super LaunchUnderTheHoodKt$block$1> $completion) {
      return (Continuation<Unit>)new LaunchUnderTheHoodKt$block$1($completion);
    }

    @Nullable
    public final Object invoke(@Nullable Continuation<?> p1) {
      return ((LaunchUnderTheHoodKt$block$1)create(p1)).invokeSuspend(Unit.INSTANCE);
    }
}
```

这里，你可以留意下代码里的注释1，这个其实就是重写之后的create()方法。换句话说，代码段8当中的 `create(probeCompletion)`，最终会调用代码段10的create()方法，它最终会返回“`LaunchUnderTheHoodKt$block$1`”这个block实现类，对应的Continuation对象。

**这行代码，其实就对应着协程被创建的时刻。**

好，到这里，协程创建的逻辑就分析完了，我们再回到startCoroutine()的源码，看看它后续的逻辑。

```plain
// 代码段11

public fun <T> (suspend () -> T).startCoroutine(
    completion: Continuation<T>
) {
//                                           注意这里
//                                             ↓
createCoroutineUnintercepted(completion).intercepted().resume(Unit)
}
```

类似的，intercepted()这个方法的源代码，我们也需要去Kotlin的源代码当中找到对应的JVM实现。

```plain
// 代码段12

public actual fun <T> Continuation<T>.intercepted(): Continuation<T> =
    (this as? ContinuationImpl)?.intercepted() ?: this
```

它的逻辑很简单，只是将Continuation强转成了ContinuationImpl，调用了它的intercepted()。这里有个细节，由于this的类型是“`LaunchUnderTheHoodKt$block$1`”，它是ContinuationImpl的子类，所以这个类型转换一定可以成功。

接下来，我们看看ContinuationImpl的源代码。

```plain
// 代码段13

internal abstract class ContinuationImpl(
    completion: Continuation<Any?>?,
    private val _context: CoroutineContext?
) : BaseContinuationImpl(completion) {

    @Transient
    private var intercepted: Continuation<Any?>? = null

    public fun intercepted(): Continuation<Any?> =
        intercepted
            ?: (context[ContinuationInterceptor]?.interceptContinuation(this) ?: this)
                .also { intercepted = it }
}
```

这里其实就是通过ContinuationInterceptor，对Continuation进行拦截，从而将程序的执行逻辑派发到特定的线程之上，这部分的逻辑我们在下一讲会再展开。

让我们回到startCoroutine()的源码，看看它的最后一步 **resume(Unit)**。

```plain
// 代码段14

public fun <T> (suspend () -> T).startCoroutine(
    completion: Continuation<T>
) {
//                                                   注意这里
//                                                      ↓
createCoroutineUnintercepted(completion).intercepted().resume(Unit)
}
```

这里的 `resume(Unit)`，作用其实就相当于启动了协程。

好，现在我们已经弄清楚了startCoroutine()这个协程的基础API是如何启动协程的了。接下来，我们来看看中间层的launch{} 函数是如何启动协程的。

## launch是如何启动协程的？

在研究launch的源代码之前，我们先来写一个简单的Demo：

```plain
// 代码段15

fun main() {
    testLaunch()
    Thread.sleep(2000L)
}

private fun testLaunch() {
    val scope = CoroutineScope(Job())
    scope.launch {
        println("Hello!")
        delay(1000L)
        println("World!")
    }
}

/*
输出结果：
Hello!
World!
*/
```

然后，我们还是通过反编译，来看看它对应的Java代码长什么样：

```java
// 代码段16

public final class LaunchUnderTheHoodKt {
  public static final void main() {
    testLaunch();
    Thread.sleep(2000L);
  }

  private static final void testLaunch() {
    CoroutineScope scope = CoroutineScopeKt.CoroutineScope((CoroutineContext)JobKt.Job$default(null, 1, null));
    BuildersKt.launch$default(scope, null, null, new LaunchUnderTheHoodKt$testLaunch$1(null), 3, null);
  }

  static final class LaunchUnderTheHoodKt$testLaunch$1 extends SuspendLambda implements Function2<CoroutineScope, Continuation<? super Unit>, Object> {
    int label;

    LaunchUnderTheHoodKt$testLaunch$1(Continuation $completion) {
      super(2, $completion);
    }

    @Nullable
    public final Object invokeSuspend(@NotNull Object $result) {
      Object object = IntrinsicsKt.getCOROUTINE_SUSPENDED();
      switch (this.label) {
        case 0:
          ResultKt.throwOnFailure(SYNTHETIC_LOCAL_VARIABLE_1);
          System.out
            .println("Hello!");
          this.label = 1;
          if (DelayKt.delay(1000L, (Continuation)this) == object)
            return object;
          DelayKt.delay(1000L, (Continuation)this);
          System.out
            .println("World!");
          return Unit.INSTANCE;
        case 1:
          ResultKt.throwOnFailure(SYNTHETIC_LOCAL_VARIABLE_1);
          System.out.println("World!");
          return Unit.INSTANCE;
      }
      throw new IllegalStateException("call to 'resume' before 'invoke' with coroutine");
    }

    @NotNull
    public final Continuation<Unit> create(@Nullable Object value, @NotNull Continuation<? super LaunchUnderTheHoodKt$testLaunch$1> $completion) {
      return (Continuation<Unit>)new LaunchUnderTheHoodKt$testLaunch$1($completion);
    }

    @Nullable
    public final Object invoke(@NotNull CoroutineScope p1, @Nullable Continuation<?> p2) {
      return ((LaunchUnderTheHoodKt$testLaunch$1)create(p1, p2)).invokeSuspend(Unit.INSTANCE);
    }
  }
}
```

有了前面的经验，上面的代码对我们来说就很简单了。唯一需要注意的是“`LaunchUnderTheHoodKt$testLaunch$1`”这个类，它其实对应的就是我们launch当中的Lambda。

为了让它们之间的对应关系更加明显，我们可以换一种写法：

```plain
// 代码段17

private fun testLaunch() {
    val scope = CoroutineScope(Job())
    val block: suspend CoroutineScope.() -> Unit = {
        println("Hello!")
        delay(1000L)
        println("World!")
    }
    scope.launch(block = block)
}
```

这段代码中的block，其实就对应着“`LaunchUnderTheHoodKt$testLaunch$1`”这个类。这里的block，**本质上仍然是一个Continuation**。

好，接下来，我们来看看launch{} 的源代码。

```plain
public fun CoroutineScope.launch(
    context: CoroutineContext = EmptyCoroutineContext,
    start: CoroutineStart = CoroutineStart.DEFAULT,
    block: suspend CoroutineScope.() -> Unit
): Job {
    // 1
    val newContext = newCoroutineContext(context)
    // 2
    val coroutine = if (start.isLazy)
        LazyStandaloneCoroutine(newContext, block) else
        StandaloneCoroutine(newContext, active = true)
    // 3
    coroutine.start(start, coroutine, block)
    return coroutine
}
```

上面的代码一共有三个注释，我们也来分析一下：

- 注释1，launch会根据传入的CoroutineContext创建出新的Context。
- 注释2，launch会根据传入的启动模式来创建对应的协程对象。这里有两种，一种是标准的，一种是懒加载的。
- 注释3，尝试启动协程。

我们跟进coroutine.start()这个方法，会进入AbstractCoroutine这个抽象类：

```plain
public abstract class AbstractCoroutine<in T>(
    parentContext: CoroutineContext,
    initParentJob: Boolean,
    active: Boolean
) : JobSupport(active), Job, Continuation<T>, CoroutineScope {

    // 省略

    public fun <R> start(start: CoroutineStart, receiver: R, block: suspend R.() -> T) {
        start(block, receiver, this)
    }
}
```

到这里，我们其实就能看到，Java当中有Thread.java对应线程的逻辑，而Kotlin协程当中，也有AbstractCoroutine.kt这个类对应协程的抽象逻辑。AbstractCoroutine有一个start()方法，专门用于启动协程。

我们继续跟进 `start(block, receiver, this)`，就会进入CoroutineStart.invoke()。

```plain
public enum class CoroutineStart {
    public operator fun <T> invoke(block: suspend () -> T, completion: Continuation<T>): Unit =
        when (this) {
            DEFAULT -> block.startCoroutineCancellable(completion)
            ATOMIC -> block.startCoroutine(completion)
            UNDISPATCHED -> block.startCoroutineUndispatched(completion)
            LAZY -> Unit // will start lazily
        }
}
```

在这个invoke()方法当中，它会根据launch传入的启动模式，以不同的方式启动协程。当我们的启动模式是ATOMIC的时候，就会调用 `block.startCoroutine(completion)`。**而这个，其实就是我们在课程最开始研究过的startCoroutine()这个协程基础API。**

而另外两个方法，`startCoroutineUndispatched(completion)` 和 `startCoroutineCancellable(completion)`，我们从名字上也能判断出，它们只是在startCoroutine()的基础上增加了一些额外的功能而已。前者代表启动协程以后就不会被分发，后者代表启动以后可以响应取消。

然后，对于代码段15的launch逻辑而言，由于我们没有传入特定的启动模式，因此，这里会**执行默认的模式**，也就是调用“s`tartCoroutineCancellable(completion)`”这个方法。

```plain
public fun <T> (suspend () -> T).startCoroutineCancellable(completion: Continuation<T>): Unit = runSafely(completion) {
    // 1
    createCoroutineUnintercepted(completion).intercepted().resumeCancellableWith(Result.success(Unit))
}

public actual fun <T> (suspend () -> T).createCoroutineUnintercepted(
    completion: Continuation<T>
): Continuation<Unit> {
    val probeCompletion = probeCoroutineCreated(completion)

    return if (this is BaseContinuationImpl)
        // 2
        create(probeCompletion)
    else
        createCoroutineFromSuspendFunction(probeCompletion) {
            (this as Function1<Continuation<T>, Any?>).invoke(it)
        }
}
```

那么，通过查看startCoroutineCancellable()的源代码，我们能发现，它最终还是会调用我们之前分析过的 **createCoroutineUnintercepted()**，而在它的内部，仍然会像我们之前分析过的，去调用 **create(probeCompletion)**，然后最终会调用代码段16当中“`LaunchUnderTheHoodKt$testLaunch$1`”的 **create()** 方法。

至此，launch启动协程的整个过程，我们就已经分析完了。其实，launch这个API，只是对协程的基础元素startCoroutine()等方法进行了一些封装而已。

看完这么多的代码和文字，相信你可能已经有一些感觉了，不过可能对整个流程还是有些模糊。这里我做了一个视频，描述了launch的执行流程。

## 小结

createCoroutine{}、startCoroutine{}，它们是Kotlin提供的两个底层API，前者是用来创建协程的，后者是用来创建并同时启动协程的。

通过反编译，我们发现，startCoroutine{} 最终会调用createCoroutineUnintercepted()这个函数，而它在JVM平台的实现，就是调用Lambda对应的实现类“`LaunchUnderTheHoodKt$block$1`”当中的create()方法。

另外，Kotlin协程框架在**中间层**实现了launch、async之类的协程构建器（Builder），你要知道，它们只是对协程底层API进行了更好的封装而已。它们除了拥有启动协程的基础能力，还支持传入CoroutineContext、CoroutineStart等参数，前者可以帮我们实现结构化并发，后者可以支持更灵活的启动模式。

## 思考题

在代码段3当中，我们使用的是 `suspend {}` 启动的协程，它的类型是 `suspend () -> String`。那么，我们是否可以使用挂起函数启动协程呢？就像下面这样：

```plain
private suspend fun func(): String {
    println("Hello!")
    delay(1000L)
    println("World!")
    return "Result"
}

private fun testStartCoroutineForSuspend() {
    val block = ::func

    val continuation = object : Continuation<String> {
        override val context: CoroutineContext
            get() = EmptyCoroutineContext

        override fun resumeWith(result: Result<String>) {
            println("Result is: ${result.getOrNull()}")
        }
    }

    block.startCoroutine(continuation)
}
```

如果使用这种方式启动协程，它的整体执行流程和代码段3会有什么不一样吗？欢迎在留言区分享你的答案，也欢迎你把今天的内容分享给更多的朋友。
<div><strong>精选留言（15）</strong></div><ul>
<li><span>辉哥</span> 👍（5） 💬（1）<p>startCoroutine -&gt; createCoroutineUnintercepted -&gt; createCoroutineFromSuspendFunction,最终返回一个RestrictedContinuationImpl对象,然后调用其resume方法,从而调用block的invoke方法.最终调起协程.</p>2022-03-29</li><br/><li><span>杨小妞</span> 👍（1） 💬（1）<p>createCoroutineUnintercepted这个函数的JVM实现在哪个包，哪个类下呢？</p>2022-04-06</li><br/><li><span>Paul Shan</span> 👍（1） 💬（1）<p>思考题：调试了一下，结果是一样的。唯一的区别可能在于block原来被反编译成一个函数对象直接用实现状态机的Continuation对象赋值。加入函数赋值以后，block对象被实现为一个简单的内部类，这个内部类的invoke函数再去调用Continuation对象。</p>2022-03-28</li><br/><li><span>ACE_Killer09</span> 👍（0） 💬（1）<p>代码段16中，
我理解resume 之后 会回到 LaunchUnderTheHoodKt$testLaunch$1 # invoke ，再进一步到invokeSuspend 进入状态机的流程。那么 Continuation#resume -&gt; invoke这个过程是怎么调用过来的？</p>2022-04-16</li><br/><li><span>L先生</span> 👍（0） 💬（1）<p>反编译了一下，block最终会转成function1。(this as Function1, Any?&gt;).invoke(it)中的invoke是指的这个Function1中的invoke吗</p>2022-03-28</li><br/><li><span>L先生</span> 👍（0） 💬（2）<p>打印没啥区别啊。应该是走这里了。createCoroutineFromSuspendFunction(probeCompletion) { (this as Function1, Any?&gt;).invoke(it) }。但是我看不太懂。this指什么，it又指什么参数</p>2022-03-28</li><br/><li><span>Allen</span> 👍（0） 💬（1）<p>关于思考题的思考：

我认为执行流程及结果和代码段 3 中是完全一样的。因为
private suspend fun func(): String {
println(&quot;Hello!&quot;)
delay(1000L)
println(&quot;World!&quot;)
return &quot;Result&quot;
} 和

val block = suspend {
println(&quot;Hello!&quot;)
delay(1000L)
println(&quot;World!&quot;)
&quot;Result&quot;
}

完全是等价的写法。
</p>2022-03-28</li><br/><li><span>郑峰</span> 👍（1） 💬（0）<p>深层认识：
suspend function type 底层被实现为Continuation。所以协程启动就是Continuation的resume。协程的启动实际上是Continuation的一个应用。</p>2022-08-23</li><br/><li><span>anmi</span> 👍（0） 💬（2）<p>start(block, receiver, this)是三个参数，是怎么跳转到只有两个参数的
public operator fun invoke(block: suspend () -&gt; T, completion: Continuation): Unit
的？</p>2024-04-16</li><br/><li><span>Temme</span> 👍（0） 💬（1）<p>”注释 2 处的 (this is BaseContinuationImpl) 条件一定是为 true 的“
这句话好像是错的SuspendLambda并不是BaseContinuationImpl的子类</p>2024-02-16</li><br/><li><span>anmi</span> 👍（0） 💬（0）<p>完了，现在编译后没有block这个类</p>2024-01-15</li><br/><li><span>anmi</span> 👍（0） 💬（0）<p>为什么调用resume(Unit)就是启动协程？怎么启动的？
这个方法不是直接返回异步执行结果的吗？</p>2024-01-14</li><br/><li><span>anmi</span> 👍（0） 💬（0）<p>前排提醒，本课程的一个重要基础：学会invoke操作符和Function系列接口</p>2024-01-12</li><br/><li><span>anmi</span> 👍（0） 💬（1）<p>在看的过程中我的想法一直在变。我在想，coroutine到底是什么？
是coroutinecontext？是cotinuation？是job？是挂起函数？</p>2023-12-12</li><br/><li><span>zs</span> 👍（0） 💬（0）<p>BaseContinuationImpl 里面的resumeWith()方法里面会判断 completion 是不是 BaseContinuationImpl，在挂起函数恢复的实话都是调用的suspendLambda的 resumeWith方法，所以才会调用suspendLambda 的invokeSuspend方法，那什么时候调用AbstractCoroutine()的resumeWith方法恢复整个协程呢</p>2022-09-19</li><br/>
</ul>

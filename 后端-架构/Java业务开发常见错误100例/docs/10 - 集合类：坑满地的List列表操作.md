你好，我是朱晔。今天，我来和你说说List列表操作有哪些坑。

Pascal之父尼克劳斯 · 维尔特（Niklaus Wirth），曾提出一个著名公式“程序=数据结构+算法”。由此可见，数据结构的重要性。常见的数据结构包括List、Set、Map、Queue、Tree、Graph、Stack等，其中List、Set、Map、Queue可以从广义上统称为集合类数据结构。

现代编程语言一般都会提供各种数据结构的实现，供我们开箱即用。Java也是一样，比如提供了集合类的各种实现。Java的集合类包括Map和Collection两大类。Collection包括List、Set和Queue三个小类，其中List列表集合是最重要也是所有业务代码都会用到的。所以，今天我会重点介绍List的内容，而不会集中介绍Map以及Collection中其他小类的坑。

今天，我们就从把数组转换为List集合、对List进行切片操作、List搜索的性能问题等几个方面着手，来聊聊其中最可能遇到的一些坑。

## 使用Arrays.asList把数据转换为List的三个坑

Java 8中Stream流式处理的各种功能，大大减少了集合类各种操作（投影、过滤、转换）的代码量。所以，在业务开发中，我们常常会把原始的数组转换为List类数据结构，来继续展开各种Stream操作。

你可能也想到了，使用Arrays.asList方法可以把数组一键转换为List，但其实没这么简单。接下来，就让我们看看其中的缘由，以及使用Arrays.asList把数组转换为List的几个坑。

在如下代码中，我们初始化三个数字的int\[]数组，然后使用Arrays.asList把数组转换为List：

```
int[] arr = {1, 2, 3};
List list = Arrays.asList(arr);
log.info("list:{} size:{} class:{}", list, list.size(), list.get(0).getClass());
```

但，这样初始化的List并不是我们期望的包含3个数字的List。通过日志可以发现，这个List包含的其实是一个int数组，整个List的元素个数是1，元素类型是整数数组。

```
12:50:39.445 [main] INFO org.geekbang.time.commonmistakes.collection.aslist.AsListApplication - list:[[I@1c53fd30] size:1 class:class [I
```

其原因是，只能是把int装箱为Integer，不可能把int数组装箱为Integer数组。我们知道，Arrays.asList方法传入的是一个泛型T类型可变参数，最终int数组整体作为了一个对象成为了泛型类型T：

```
public static <T> List<T> asList(T... a) {
    return new ArrayList<>(a);
}
```

直接遍历这样的List必然会出现Bug，修复方式有两种，如果使用Java8以上版本可以使用Arrays.stream方法来转换，否则可以把int数组声明为包装类型Integer数组：

```
int[] arr1 = {1, 2, 3};
List list1 = Arrays.stream(arr1).boxed().collect(Collectors.toList());
log.info("list:{} size:{} class:{}", list1, list1.size(), list1.get(0).getClass());


Integer[] arr2 = {1, 2, 3};
List list2 = Arrays.asList(arr2);
log.info("list:{} size:{} class:{}", list2, list2.size(), list2.get(0).getClass());
```

修复后的代码得到如下日志，可以看到List具有三个元素，元素类型是Integer：

```
13:10:57.373 [main] INFO org.geekbang.time.commonmistakes.collection.aslist.AsListApplication - list:[1, 2, 3] size:3 class:class java.lang.Integer
```

可以看到第一个坑是，**不能直接使用Arrays.asList来转换基本类型数组**。那么，我们获得了正确的List，是不是就可以像普通的List那样使用了呢？我们继续往下看。

把三个字符串1、2、3构成的字符串数组，使用Arrays.asList转换为List后，将原始字符串数组的第二个字符修改为4，然后为List增加一个字符串5，最后数组和List会是怎样呢？

```
String[] arr = {"1", "2", "3"};
List list = Arrays.asList(arr);
arr[1] = "4";
try {
    list.add("5");
} catch (Exception ex) {
    ex.printStackTrace();
}
log.info("arr:{} list:{}", Arrays.toString(arr), list);
```

可以看到，日志里有一个UnsupportedOperationException，为List新增字符串5的操作失败了，而且把原始数组的第二个元素从2修改为4后，asList获得的List中的第二个元素也被修改为4了：

```
java.lang.UnsupportedOperationException
	at java.util.AbstractList.add(AbstractList.java:148)
	at java.util.AbstractList.add(AbstractList.java:108)
	at org.geekbang.time.commonmistakes.collection.aslist.AsListApplication.wrong2(AsListApplication.java:41)
	at org.geekbang.time.commonmistakes.collection.aslist.AsListApplication.main(AsListApplication.java:15)
13:15:34.699 [main] INFO org.geekbang.time.commonmistakes.collection.aslist.AsListApplication - arr:[1, 4, 3] list:[1, 4, 3]
```

这里，又引出了两个坑。

第二个坑，**Arrays.asList返回的List不支持增删操作。**Arrays.asList返回的List并不是我们期望的java.util.ArrayList，而是Arrays的内部类ArrayList。ArrayList内部类继承自AbstractList类，并没有覆写父类的add方法，而父类中add方法的实现，就是抛出UnsupportedOperationException。相关源码如下所示：

```
public static <T> List<T> asList(T... a) {
    return new ArrayList<>(a);
}

private static class ArrayList<E> extends AbstractList<E>
    implements RandomAccess, java.io.Serializable
{
    private final E[] a;


    ArrayList(E[] array) {
        a = Objects.requireNonNull(array);
    }
...

    @Override
    public E set(int index, E element) {
        E oldValue = a[index];
        a[index] = element;
        return oldValue;
    }
    ...
}

public abstract class AbstractList<E> extends AbstractCollection<E> implements List<E> {
...
public void add(int index, E element) {
        throw new UnsupportedOperationException();
    }
}
```

第三个坑，**对原始数组的修改会影响到我们获得的那个List**。看一下ArrayList的实现，可以发现ArrayList其实是直接使用了原始的数组。所以，我们要特别小心，把通过Arrays.asList获得的List交给其他方法处理，很容易因为共享了数组，相互修改产生Bug。

修复方式比较简单，重新new一个ArrayList初始化Arrays.asList返回的List即可：

```
String[] arr = {"1", "2", "3"};
List list = new ArrayList(Arrays.asList(arr));
arr[1] = "4";
try {
    list.add("5");
} catch (Exception ex) {
    ex.printStackTrace();
}
log.info("arr:{} list:{}", Arrays.toString(arr), list);
```

修改后的代码实现了原始数组和List的“解耦”，不再相互影响。同时，因为操作的是真正的ArrayList，add也不再出错：

```
13:34:50.829 [main] INFO org.geekbang.time.commonmistakes.collection.aslist.AsListApplication - arr:[1, 4, 3] list:[1, 2, 3, 5]
```

## 使用List.subList进行切片操作居然会导致OOM？

业务开发时常常要对List做切片处理，即取出其中部分元素构成一个新的List，我们通常会想到使用List.subList方法。但，和Arrays.asList的问题类似，List.subList返回的子List不是一个普通的ArrayList。这个子List可以认为是原始List的视图，会和原始List相互影响。如果不注意，很可能会因此产生OOM问题。接下来，我们就一起分析下其中的坑。

如下代码所示，定义一个名为data的静态List来存放Integer的List，也就是说data的成员本身是包含了多个数字的List。循环1000次，每次都从一个具有10万个Integer的List中，使用subList方法获得一个只包含一个数字的子List，并把这个子List加入data变量：

```
private static List<List<Integer>> data = new ArrayList<>();

private static void oom() {
    for (int i = 0; i < 1000; i++) {
        List<Integer> rawList = IntStream.rangeClosed(1, 100000).boxed().collect(Collectors.toList());
        data.add(rawList.subList(0, 1));
    }
}
```

你可能会觉得，这个data变量里面最终保存的只是1000个具有1个元素的List，不会占用很大空间，但程序运行不久就出现了OOM：

```
Exception in thread "main" java.lang.OutOfMemoryError: Java heap space
	at java.util.Arrays.copyOf(Arrays.java:3181)
	at java.util.ArrayList.grow(ArrayList.java:265)
```

**出现OOM的原因是，循环中的1000个具有10万个元素的List始终得不到回收，因为它始终被subList方法返回的List强引用。**那么，返回的子List为什么会强引用原始的List，它们又有什么关系呢？我们再继续做实验观察一下这个子List的特性。

首先初始化一个包含数字1到10的ArrayList，然后通过调用subList方法取出2、3、4；随后删除这个SubList中的元素数字3，并打印原始的ArrayList；最后为原始的ArrayList增加一个元素数字0，遍历SubList输出所有元素：

```
List<Integer> list = IntStream.rangeClosed(1, 10).boxed().collect(Collectors.toList());
List<Integer> subList = list.subList(1, 4);
System.out.println(subList);
subList.remove(1);
System.out.println(list);
list.add(0);
try {
    subList.forEach(System.out::println);
} catch (Exception ex) {
    ex.printStackTrace();
}
```

代码运行后得到如下输出：

```
[2, 3, 4]
[1, 2, 4, 5, 6, 7, 8, 9, 10]
java.util.ConcurrentModificationException
	at java.util.ArrayList$SubList.checkForComodification(ArrayList.java:1239)
	at java.util.ArrayList$SubList.listIterator(ArrayList.java:1099)
	at java.util.AbstractList.listIterator(AbstractList.java:299)
	at java.util.ArrayList$SubList.iterator(ArrayList.java:1095)
	at java.lang.Iterable.forEach(Iterable.java:74)
```

可以看到两个现象：

- 原始List中数字3被删除了，说明删除子List中的元素影响到了原始List；
- 尝试为原始List增加数字0之后再遍历子List，会出现ConcurrentModificationException。

我们分析下ArrayList的源码，看看为什么会是这样。

```
public class ArrayList<E> extends AbstractList<E>
        implements List<E>, RandomAccess, Cloneable, java.io.Serializable
{
    protected transient int modCount = 0;
	private void ensureExplicitCapacity(int minCapacity) {
        modCount++;
        // overflow-conscious code
        if (minCapacity - elementData.length > 0)
            grow(minCapacity);
    }
	public void add(int index, E element) {
		rangeCheckForAdd(index);

		ensureCapacityInternal(size + 1);  // Increments modCount!!
		System.arraycopy(elementData, index, elementData, index + 1,
		                 size - index);
		elementData[index] = element;
		size++;
	}

	public List<E> subList(int fromIndex, int toIndex) {
		subListRangeCheck(fromIndex, toIndex, size);
		return new SubList(this, offset, fromIndex, toIndex);
	}

	private class SubList extends AbstractList<E> implements RandomAccess {
		private final AbstractList<E> parent;
		private final int parentOffset;
		private final int offset;
		int size;

		SubList(AbstractList<E> parent,
	        int offset, int fromIndex, int toIndex) {
		    this.parent = parent;
		    this.parentOffset = fromIndex;
		    this.offset = offset + fromIndex;
		    this.size = toIndex - fromIndex;
		    this.modCount = ArrayList.this.modCount;
		}

        public E set(int index, E element) {
            rangeCheck(index);
            checkForComodification();
            return l.set(index+offset, element);
        }

		public ListIterator<E> listIterator(final int index) {
		            checkForComodification();
		            ...
		}

		private void checkForComodification() {
		    if (ArrayList.this.modCount != this.modCount)
		        throw new ConcurrentModificationException();
		}
		...
	}
}
```

第一，ArrayList维护了一个叫作modCount的字段，表示集合结构性修改的次数。所谓结构性修改，指的是影响List大小的修改，所以add操作必然会改变modCount的值。

第二，分析第21到24行的subList方法可以看到，获得的List其实是**内部类SubList**，并不是普通的ArrayList，在初始化的时候传入了this。

第三，分析第26到39行代码可以发现，这个SubList中的parent字段就是原始的List。SubList初始化的时候，并没有把原始List中的元素复制到独立的变量中保存。我们可以认为SubList是原始List的视图，并不是独立的List。双方对元素的修改会相互影响，而且SubList强引用了原始的List，所以大量保存这样的SubList会导致OOM。

第四，分析第47到55行代码可以发现，遍历SubList的时候会先获得迭代器，比较原始ArrayList modCount的值和SubList当前modCount的值。获得了SubList后，我们为原始List新增了一个元素修改了其modCount，所以判等失败抛出ConcurrentModificationException异常。

既然SubList相当于原始List的视图，那么避免相互影响的修复方式有两种：

- 一种是，不直接使用subList方法返回的SubList，而是重新使用new ArrayList，在构造方法传入SubList，来构建一个独立的ArrayList；
- 另一种是，对于Java 8使用Stream的skip和limit API来跳过流中的元素，以及限制流中元素的个数，同样可以达到SubList切片的目的。

```
//方式一：
List<Integer> subList = new ArrayList<>(list.subList(1, 4));

//方式二：
List<Integer> subList = list.stream().skip(1).limit(3).collect(Collectors.toList());
```

修复后代码输出如下：

```
[2, 3, 4]
[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
2
4
```

可以看到，删除SubList的元素不再影响原始List，而对原始List的修改也不会再出现List迭代异常。

## 一定要让合适的数据结构做合适的事情

在介绍[并发工具](https://time.geekbang.org/column/article/209494)时，我提到要根据业务场景选择合适的并发工具或容器。在使用List集合类的时候，不注意使用场景也会遇见两个常见误区。

**第一个误区是，使用数据结构不考虑平衡时间和空间**。

首先，定义一个只有一个int类型订单号字段的Order类：

```
@Data
@NoArgsConstructor
@AllArgsConstructor
static class Order {
    private int orderId;
}
```

然后，定义一个包含elementCount和loopCount两个参数的listSearch方法，初始化一个具有elementCount个订单对象的ArrayList，循环loopCount次搜索这个ArrayList，每次随机搜索一个订单号：

```
private static Object listSearch(int elementCount, int loopCount) {
    List<Order> list = IntStream.rangeClosed(1, elementCount).mapToObj(i -> new Order(i)).collect(Collectors.toList());
    IntStream.rangeClosed(1, loopCount).forEach(i -> {
        int search = ThreadLocalRandom.current().nextInt(elementCount);
        Order result = list.stream().filter(order -> order.getOrderId() == search).findFirst().orElse(null);
        Assert.assertTrue(result != null && result.getOrderId() == search);
    });
    return list;
}
```

随后，定义另一个mapSearch方法，从一个具有elementCount个元素的Map中循环loopCount次查找随机订单号。Map的Key是订单号，Value是订单对象：

```
private static Object mapSearch(int elementCount, int loopCount) {
    Map<Integer, Order> map = IntStream.rangeClosed(1, elementCount).boxed().collect(Collectors.toMap(Function.identity(), i -> new Order(i)));
    IntStream.rangeClosed(1, loopCount).forEach(i -> {
        int search = ThreadLocalRandom.current().nextInt(elementCount);
        Order result = map.get(search);
        Assert.assertTrue(result != null && result.getOrderId() == search);
    });
    return map;
}
```

我们知道，搜索ArrayList的时间复杂度是O(n)，而HashMap的get操作的时间复杂度是O(1)。**所以，要对大List进行单值搜索的话，可以考虑使用HashMap，其中Key是要搜索的值，Value是原始对象，会比使用ArrayList有非常明显的性能优势。**

如下代码所示，对100万个元素的ArrayList和HashMap，分别调用listSearch和mapSearch方法进行1000次搜索：

```
int elementCount = 1000000;
int loopCount = 1000;
StopWatch stopWatch = new StopWatch();
stopWatch.start("listSearch");
Object list = listSearch(elementCount, loopCount);
System.out.println(ObjectSizeCalculator.getObjectSize(list));
stopWatch.stop();
stopWatch.start("mapSearch");
Object map = mapSearch(elementCount, loopCount);
stopWatch.stop();
System.out.println(ObjectSizeCalculator.getObjectSize(map));
System.out.println(stopWatch.prettyPrint());
```

可以看到，仅仅是1000次搜索，listSearch方法耗时3.3秒，而mapSearch耗时仅仅108毫秒。

```
20861992
72388672
StopWatch '': running time = 3506699764 ns
---------------------------------------------
ns         %     Task name
---------------------------------------------
3398413176  097%  listSearch
108286588  003%  mapSearch
```

即使我们要搜索的不是单值而是条件区间，也可以尝试使用HashMap来进行“搜索性能优化”。如果你的条件区间是固定的话，可以提前把HashMap按照条件区间进行分组，Key就是不同的区间。

的确，如果业务代码中有频繁的大ArrayList搜索，使用HashMap性能会好很多。类似，如果要对大ArrayList进行去重操作，也不建议使用contains方法，而是可以考虑使用HashSet进行去重。说到这里，还有一个问题，使用HashMap是否会牺牲空间呢？

为此，我们使用ObjectSizeCalculator工具打印ArrayList和HashMap的内存占用，可以看到ArrayList占用内存21M，而HashMap占用的内存达到了72M，是List的三倍多。进一步使用MAT工具分析堆可以再次证明，ArrayList在内存占用上性价比很高，77%是实际的数据（如第1个图所示，16000000/20861992），**而HashMap的“含金量”只有22%**（如第2个图所示，16000000/72386640）。

![](https://static001.geekbang.org/resource/image/1e/24/1e8492040dd4b1af6114a6eeba06e524.png?wh=1428%2A226)

![](https://static001.geekbang.org/resource/image/53/c7/53d53e3ce2efcb081f8d9fa496cb8ec7.png?wh=1762%2A290)

所以，在应用内存吃紧的情况下，我们需要考虑是否值得使用更多的内存消耗来换取更高的性能。这里我们看到的是平衡的艺术，空间换时间，还是时间换空间，只考虑任何一个方面都是不对的。

**第二个误区是，过于迷信教科书的大O时间复杂度**。

数据结构中要实现一个列表，有基于连续存储的数组和基于指针串联的链表两种方式。在Java中，有代表性的实现是ArrayList和LinkedList，前者背后的数据结构是数组，后者则是（双向）链表。

在选择数据结构的时候，我们通常会考虑每种数据结构不同操作的时间复杂度，以及使用场景两个因素。查看[这里](https://www.bigocheatsheet.com/)，你可以看到数组和链表大O时间复杂度的显著差异：

- 对于数组，随机元素访问的时间复杂度是O(1)，元素插入操作是O(n)；
- 对于链表，随机元素访问的时间复杂度是O(n)，元素插入操作是O(1)。

那么，在大量的元素插入、很少的随机访问的业务场景下，是不是就应该使用LinkedList呢？接下来，我们写一段代码测试下两者随机访问和插入的性能吧。

定义四个参数一致的方法，分别对元素个数为elementCount的LinkedList和ArrayList，循环loopCount次，进行随机访问和增加元素到随机位置的操作：

```
//LinkedList访问
private static void linkedListGet(int elementCount, int loopCount) {
    List<Integer> list = IntStream.rangeClosed(1, elementCount).boxed().collect(Collectors.toCollection(LinkedList::new));
    IntStream.rangeClosed(1, loopCount).forEach(i -> list.get(ThreadLocalRandom.current().nextInt(elementCount)));
}

//ArrayList访问
private static void arrayListGet(int elementCount, int loopCount) {
    List<Integer> list = IntStream.rangeClosed(1, elementCount).boxed().collect(Collectors.toCollection(ArrayList::new));
    IntStream.rangeClosed(1, loopCount).forEach(i -> list.get(ThreadLocalRandom.current().nextInt(elementCount)));
}

//LinkedList插入
private static void linkedListAdd(int elementCount, int loopCount) {
    List<Integer> list = IntStream.rangeClosed(1, elementCount).boxed().collect(Collectors.toCollection(LinkedList::new));
    IntStream.rangeClosed(1, loopCount).forEach(i -> list.add(ThreadLocalRandom.current().nextInt(elementCount),1));
}

//ArrayList插入
private static void arrayListAdd(int elementCount, int loopCount) {
    List<Integer> list = IntStream.rangeClosed(1, elementCount).boxed().collect(Collectors.toCollection(ArrayList::new));
    IntStream.rangeClosed(1, loopCount).forEach(i -> list.add(ThreadLocalRandom.current().nextInt(elementCount),1));
}
```

测试代码如下，10万个元素，循环10万次：

```
int elementCount = 100000;
int loopCount = 100000;
StopWatch stopWatch = new StopWatch();
stopWatch.start("linkedListGet");
linkedListGet(elementCount, loopCount);
stopWatch.stop();
stopWatch.start("arrayListGet");
arrayListGet(elementCount, loopCount);
stopWatch.stop();
System.out.println(stopWatch.prettyPrint());


StopWatch stopWatch2 = new StopWatch();
stopWatch2.start("linkedListAdd");
linkedListAdd(elementCount, loopCount);
stopWatch2.stop();
stopWatch2.start("arrayListAdd");
arrayListAdd(elementCount, loopCount);
stopWatch2.stop();
System.out.println(stopWatch2.prettyPrint());
```

运行结果可能会让你大跌眼镜。在随机访问方面，我们看到了ArrayList的绝对优势，耗时只有11毫秒，而LinkedList耗时6.6秒，这符合上面我们所说的时间复杂度；**但，随机插入操作居然也是LinkedList落败，耗时9.3秒，ArrayList只要1.5秒**：

```
---------------------------------------------
ns         %     Task name
---------------------------------------------
6604199591  100%  linkedListGet
011494583  000%  arrayListGet


StopWatch '': running time = 10729378832 ns
---------------------------------------------
ns         %     Task name
---------------------------------------------
9253355484  086%  linkedListAdd
1476023348  014%  arrayListAdd
```

翻看LinkedList源码发现，插入操作的时间复杂度是O(1)的前提是，你已经有了那个要插入节点的指针。但，在实现的时候，我们需要先通过循环获取到那个节点的Node，然后再执行插入操作。前者也是有开销的，不可能只考虑插入操作本身的代价：

```
public void add(int index, E element) {
    checkPositionIndex(index);

    if (index == size)
        linkLast(element);
    else
        linkBefore(element, node(index));
}

Node<E> node(int index) {
    // assert isElementIndex(index);

    if (index < (size >> 1)) {
        Node<E> x = first;
        for (int i = 0; i < index; i++)
            x = x.next;
        return x;
    } else {
        Node<E> x = last;
        for (int i = size - 1; i > index; i--)
            x = x.prev;
        return x;
    }
}
```

所以，对于插入操作，LinkedList的时间复杂度其实也是O(n)。继续做更多实验的话你会发现，在各种常用场景下，LinkedList几乎都不能在性能上胜出ArrayList。

讽刺的是，LinkedList的作者约书亚 · 布洛克（Josh Bloch），在其推特上回复别人时说，虽然LinkedList是我写的但我从来不用，有谁会真的用吗？

![](https://static001.geekbang.org/resource/image/12/cc/122a469eb03f16ab61d893ec57b34acc.png?wh=2658%2A1210)

这告诉我们，任何东西理论上和实际上是有差距的，请勿迷信教科书的理论，最好在下定论之前实际测试一下。抛开算法层面不谈，由于CPU缓存、内存连续性等问题，链表这种数据结构的实现方式对性能并不友好，即使在它最擅长的场景都不一定可以发挥威力。

## 重点回顾

今天，我分享了若干和List列表相关的错误案例，基本都是由“想当然”导致的。

第一，想当然认为，Arrays.asList和List.subList得到的List是普通的、独立的ArrayList，在使用时出现各种奇怪的问题。

- Arrays.asList得到的是Arrays的内部类ArrayList，List.subList得到的是ArrayList的内部类SubList，不能把这两个内部类转换为ArrayList使用。
- Arrays.asList直接使用了原始数组，可以认为是共享“存储”，而且不支持增删元素；List.subList直接引用了原始的List，也可以认为是共享“存储”，而且对原始List直接进行结构性修改会导致SubList出现异常。
- 对Arrays.asList和List.subList容易忽略的是，新的List持有了原始数据的引用，可能会导致原始数据也无法GC的问题，最终导致OOM。

第二，想当然认为，Arrays.asList一定可以把所有数组转换为正确的List。当传入基本类型数组的时候，List的元素是数组本身，而不是数组中的元素。

第三，想当然认为，内存中任何集合的搜索都是很快的，结果在搜索超大ArrayList的时候遇到性能问题。我们考虑利用HashMap哈希表随机查找的时间复杂度为O(1)这个特性来优化性能，不过也要考虑HashMap存储空间上的代价，要平衡时间和空间。

第四，想当然认为，链表适合元素增删的场景，选用LinkedList作为数据结构。在真实场景中读写增删一般是平衡的，而且增删不可能只是对头尾对象进行操作，可能在90%的情况下都得不到性能增益，建议使用之前通过性能测试评估一下。

今天用到的代码，我都放在了GitHub上，你可以点击[这个链接](https://github.com/JosephZhu1983/java-common-mistakes)查看。

## 思考与讨论

最后，我给你留下与ArrayList在删除元素方面的坑有关的两个思考题吧。

1. 调用类型是Integer的ArrayList的remove方法删除元素，传入一个Integer包装类的数字和传入一个int基本类型的数字，结果一样吗？
2. 循环遍历List，调用remove方法删除元素，往往会遇到ConcurrentModificationException异常，原因是什么，修复方式又是什么呢？

你还遇到过与集合类相关的其他坑吗？我是朱晔，欢迎在评论区与我留言分享你的想法，也欢迎你把这篇文章分享给你的朋友或同事，一起交流。
<div><strong>精选留言（15）</strong></div><ul>
<li><span>Darren</span> 👍（107） 💬（4）<p>哈哈，好巧，前两年有段时间比较闲，研究ArrayList和LinkedList，也对于所谓的ArrayList查询快，增删慢以及LinkedList查询慢，增删快提出过疑问，也做过类似的实验，然后去年给19年校招生入职培训的时候还专门分享过。要打破常规思维，多问为什么，要多听多看，多实验。
回答下问题：
1、int类型是index，也就是索引，是按照元素位置删除的；Integer是删除某个元素，内部是通过遍历数组然后对比，找到指定的元素，然后删除；两个都需要进行数组拷贝，是通过System.arraycopy进行的
2、以foreach为例说，遍历删除实质是变化为迭代器实现，不管是迭代器里面的remove()还是next()方法,都会checkForComodification();而这个方法是判断modCount和expectedModCount是否相等，这个modCount是这个list集合修改的次数，每一次add或者remove都会增加这个变量，然后迭代器每次去next或者去remove的时候检查checkForComodification();发现expectedModCount(这个迭代器修改的次数)和modCount(这个集合实际修改的次数)不相等，就会抛出ConcurrentModificationException，迭代器里面没有add方法，用迭代器时，可以删除原来集合的元素，但是！一定要用迭代器的remove方法而不是集合自身的remove方法，否则抛异常。</p>2020-03-31</li><br/><li><span>eazonshaw</span> 👍（39） 💬（1）<p>思考题：
1. 不一样。使用 ArrayList 的 remove方法，如果传参是 Integer类型的话，表示的是删除元素，如果传参是int类型的话，表示的是删除相对应索引位置的元素。
同时，做了个小实验，如果是String类型的ArrayList，传参是Integer类型时，remove方法只是返回false，视为元素不存在。
2. 原因：查看源码可以发现，remove方法会发生结构化修改，也就是 modCount 会增加。当循环过程中，比较当前 List 的 modCount 与初始的 modCount 不相等，就会报 ConcurrentModificationException。解决方法：1.使用 ArrayList 的迭代器 iterator，并调用之中的remove方法。查看源码可以发现，内部类的remove方法，会维护一个expectedModCount，使其与 ArrayList 的modCount保持一致。2.如果是java 8，可以使用removeIf方法进行删除操作。

````
int expectedModCount = modCount;
public void remove() {
    ...
    checkForComodification();

    try {
        ...
        expectedModCount = modCount;
    } catch (IndexOutOfBoundsException ex) {
        throw new ConcurrentModificationException();
    }
}
final void checkForComodification() {
    if (modCount != expectedModCount)
        throw new ConcurrentModificationException();
}
```</p>2020-03-31</li><br/><li><span>👽</span> 👍（15） 💬（1）<p>思考题2：
便利通常的实现方式for冒号的实现，其实底层还是用Iterator 删除元素，查看class文件大概是这样：

Iterator var2 = list.iterator();
    while(var2.hasNext()) {
      Integer integer = (Integer)var2.next();
      list.remove(integer);
    }

删除元素后会调用next方法，next调用checkForComodification方法：
final void checkForComodification() {
            if (modCount != expectedModCount)
                throw new ConcurrentModificationException();
        }
expectedModCount是初始化时，数组的modCount ，也就是说——初始化的数组长度和调用next方法时数组长度不一样时，就会ConcurrentModificationException，理论上讲，不仅仅remove，甚至是add也一样会报错。

尝试测试，将remove改为add：
while(var2.hasNext()) {
      Integer integer = (Integer)var2.next();
      list.add(integer);
    }
确实会报错。

知道了报错的原因，要修复倒也不难。
首先，摒弃for冒号，使用迭代器（其实迭代器也是for冒号）
既然，迭代器在List长度与迭代器初始化时识别到的List长度不一致就会报错。那就顺着它的意思来处理，每次List长度修改时，重新初始化迭代器。相当于长度重新初始化。

假设数组初始长度时10，形成的结果就是：
Iterator 初始化 expectedModCount = 10；
然后删除某元素，数组长度9，Iterator 长度10，这时候如果调用next就会报错，所以，在这时候，重新初始化Iterator
Iterator  长度初始化为9，与数组长度一致，就避免了报错。
代码实现如下：
Iterator var2 = list.iterator();
    while(var2.hasNext()) {
      Integer integer = (Integer)var2.next();
      if (integer.equals(2)){
        list.remove(integer);
        var2 = list.iterator();
      }
    }

代码写的比较随意，可能存在纰漏。欢迎指点

</p>2020-03-31</li><br/><li><span>失火的夏天</span> 👍（6） 💬（2）<p>1.remove包装类数字是删除对象，基本类型的int数字是删除下标。
2.好像是modcount和什么东西对不上来着，具体忘记了，看看其他大佬怎么说。解决这玩意就是改用迭代器遍历，调用迭代器的remove方法。

话说到这个linkedlist，真是感觉全面被arraylist压制。那这数据结构还留着干嘛呢？为什么不删掉算了。。。我个人感觉linekdlist只有在头尾加入删除元素的时候有一点点优势了吧。用队列或者双端队列的时候会偶然用到。但是感觉用对应的数组模式实现，效率会更高些，就是要考虑扩容的问题。

老师能帮忙解答一下linkedlist留下没删是因为什么吗？</p>2020-03-31</li><br/><li><span>👽</span> 👍（5） 💬（1）<p>感触颇深：
Arrays的asList和subList，使用过程中需要谨慎，甚至可以考虑直接不用。
要熟悉数据结构。ArrayList 和 HashMap就是典型对比，ArrayList更适合随机访问，节约内存空间，大多数情况下性能不错。但，因为其本质上是数组，所以，无法实现快速找到想要的值。
LinkedList  没有想象中好用，使用前请考虑清楚。
</p>2020-03-31</li><br/><li><span>hellojd</span> 👍（5） 💬（1）<p>学习到了老师的探索精神，linedlist随机插入性能居然不高，刷新了认知。</p>2020-03-31</li><br/><li><span>看不到de颜色</span> 👍（4） 💬（1）<p>老师这期的课程太让人产生共鸣了。之前生产就出过问题。调用方法，达到了用Arrays.asList返回的集合，然后对集合操作时就出了一场。当时看了asList的源码时才发现JDK居然还有这种坑。subList也确实是一个很容易采坑的地方，subList本质上就是把原List报了层皮返回了。关于ListList，头插的话性能应该是会碾压ArrayList，但是就看有没有这种场景了。
课后练习：
1.根据API可以看出，remove(int index) &#47; remove(Object element)
2.Iterator过程中集合结构不能发生变化，通常是遍历过程中其他线程对集合进行了add&#47;remove。可以用CopyOnWrite集合来避免。
</p>2020-04-02</li><br/><li><span>大大大熊myeh</span> 👍（3） 💬（1）<p>巧了，思考题1与我之前遇到的问题一样，List#remove方法竟然没删掉里面的元素，最后才发现原来是重载方法的锅，int是删List中该索引的元素，Integer是删除List中值为该Integer的元素。

当时还写了篇博客记录，恬不知耻的放上来：https:&#47;&#47;planeswalker23.github.io&#47;2018&#47;09&#47;10&#47;List-remove&#47;

本篇收获颇多，特别是关于LinkedList的增删复杂度，之前也没看过LinkedList源码，于是一直以为增删很快。

得到一个结论：任何总结，还是得以源码为基础。所有不看源码的总结都是耍流氓。</p>2020-04-11</li><br/><li><span>蚂蚁内推+v</span> 👍（2） 💬（3）<p>int[] arr = {1, 2, 3};
List list = Arrays.asList(arr);
System.out.println(list + &quot; &quot; + list.size() + &quot; &quot; + list.get(0).getClass());


[1, 2, 3] 3 class java.lang.Integer 为何我本地和老师演示的不一样？？</p>2020-04-02</li><br/><li><span>pedro</span> 👍（2） 💬（1）<p>第二个问题，使用 for-each 或者 iterator 进行迭代删除 remove 时，容易导致 next() 检测的 modCount 不等于 expectedModCount 从而引发 ConcurrentModificationException。
在单线程下，推荐使用 next() 得到元素，然后直接调用 remove(),注意是无参的 remove; 多线程情况下还是使用并发容器吧😃</p>2020-03-31</li><br/><li><span>jacy</span> 👍（1） 💬（1）<p>问题二可以用迭代器进行删除。
看源码遍历的remove是代参数的remove方法,会导致ModCount++，但expectedModCount不会改变，next会检查两值是否相等，因此会抛异常。从代码上也可以读出作者的想法，就是通过此种方式来禁止遍历时直接remove。

迭代器删除是用的无参数remove，删除后会执行expectedModCount = modCount，将两值置为相等。</p>2020-09-09</li><br/><li><span>Avalon</span> 👍（1） 💬（1）<p>我有一个疑问，在LinkedList中addFirst方法调用的私有方法linkFirst方法如下：
````

    private void linkFirst(E e) {
        LinkedList.Node&lt;E&gt; f = this.first;
        LinkedList.Node&lt;E&gt; newNode = new LinkedList.Node((LinkedList.Node)null, e, f);
        this.first = newNode;
        if (f == null) {
            this.last = newNode;
        } else {
            f.prev = newNode;
        }

        ++this.size;
        ++this.modCount;
    }

```
这段代码里面仅针对一个位置进行了增加节点的操作，为什么addFirst的性能还是不及ArrayList的add方法呢？
</p>2020-06-18</li><br/><li><span>LovePeace</span> 👍（1） 💬（1）<p>大量的业务开发其实没那么大的数据,linkendList在插入小量数据的时候还是比arraylist有优势的
        int loopCount = 100;
        StopWatch stopWatch = new StopWatch();
        stopWatch.start(&quot;linkedListadd&quot;);
        linkedListadd(loopCount);
        stopWatch.stop();
        stopWatch.start(&quot;arrayListadd&quot;);
        arrayListadd(loopCount);
        stopWatch.stop();
        System.out.println(stopWatch.prettyPrint());
    }

    private static void linkedListadd(int loopCount) {
        List&lt;Integer&gt; list = new LinkedList&lt;&gt;();
        for (int i = 0; i &lt; loopCount; i++) {
            list.add(i);
        }
    }

    private static void arrayListadd(int loopCount) {
        List&lt;Integer&gt; list = new ArrayList&lt;&gt;();
        for (int i = 0; i &lt; loopCount; i++) {
            list.add(i);
        }
    }
######################################
StopWatch &#39;&#39;: running time = 93300 ns
---------------------------------------------
ns         %     Task name
---------------------------------------------
000025500  027%  linkedListadd
000067800  073%  arrayListadd</p>2020-05-19</li><br/><li><span>苏暮沉觞</span> 👍（1） 💬（1）<p>老师，对于ArrayList和LinkedList插入性能测试有点疑问：我们这是测量10W的数据量下的结果，如果数据量达到100W，推论还是成立吗？（想测试100W数据量，但是数据量逐步提高到30W以后，程序就运行很久很久）。判断两种数据类型的速度，能不能简单归纳为判断LinkedList查找下一个节点的时间和（ArrayList数组后移一个数据时间+扩容平均时间）哪个比较短？</p>2020-05-09</li><br/><li><span>csyangchsh</span> 👍（1） 💬（1）<p>ArrayList分配的内存空间是连续的，对会CPU Cache很友好。LinkedList还要包装成Node，又增加了开销。这个测试使用JMH，根据CPU Cache大小，定义不同的元素个数，可能更严谨一点。</p>2020-03-31</li><br/>
</ul>
```

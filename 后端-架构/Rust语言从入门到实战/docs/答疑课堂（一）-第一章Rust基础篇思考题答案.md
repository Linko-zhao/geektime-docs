你好，我是Mike。

恭喜你学完前两章的内容了，基础篇和进阶篇一共有20讲，每一讲的内容都很重要，算是你入门Rust的重要基础，所以一定要多读几遍，争取学透。为了让你学思结合，我们在每节课的最后设计了对应的思考题，这节课我们就来处理这些问题。

我也看到很多同学在课程的后面回答了这些问题，此外还有一些其他的问题，提得也很精彩，所以我挑出一并放在这里，希望能为你解惑，对你有所启发，话不多说，我们马上开始吧！

做完思考题再来看答案会更有收获。

## **基础篇**

### [01｜快速入门：Rust 中有哪些你不得不了解的基础语法？](https://time.geekbang.org/column/article/718865?utm_campaign=geektime_search&utm_content=geektime_search&utm_medium=geektime_search&utm_source=geektime_search&utm_term=geektime_search)

#### 思考题

- Rust 中能否实现类似 JS 中的 number 这种通用的数字类型呢？
- Rust 中能否实现 Python 中那种无限大小的数字类型呢？

#### 答案

在 Rust 中，有多种数字类型，包括有符号和无符号整数、浮点数、复数等。和 JS 中的 number 类型相似，Rust 中的数字类型也支持基本的数学运算，例如加减乘除和取模等。不过，和 JS 的 number 不同，Rust 的数字类型都具有固定的位数，这意味着不同的数字类型有不同的取值范围。

此外，Rust 中的数值类型需要在编译时就确定它们的类型和大小，这些类型可以通过使用 Rust 内置的类型注解，或是灵活的小数点和后缀表示法来声明。而 crates.io 上有 num crate 可以用来表示通用的数字类型，具体是通过trait机制来实现的。

关于实现 Python 中无限大小的数字类型，Rust 不直接支持这个特性，但可以通过使用第三方库来实现。常用的第三方库包括 rug 和 num-bigint 等，它们提供了实现高精度计算的数据类型和函数，使 Rust 可以处理更大的整数和浮点数。这些库采用的是类似于 Python 的动态内存分配和存储机制，能够进行几乎无限大小的数字计算。

### [02｜所有权（上）：Rust 如何管理程序中的资源？](https://time.geekbang.org/column/article/718916?utm_campaign=geektime_search&utm_content=geektime_search&utm_medium=geektime_search&utm_source=geektime_search&utm_term=geektime_search)

#### 思考题

1. 下面的示例将输出什么？

```plain
fn main() {
    let s = "I am a superman.".to_string();
    
    for i in 1..10 {
        let tmp_s = s;
        println!("s is {}", tmp_s);
    }
}
```

2. 一个由固定尺寸类型组成的结构体变量，如下面示例中的Point类型，在赋值给另一个变量时，采用的移动方式还是复制方式？

```plain
struct Point {
  x: i64,
  y: i64,
  z: i64
}
```

#### 答案

1. 无法通过编译，可以将第 5 行代码修改为：let tmp\_s = s.clone();。

修改后如下：

```plain
fn main() {
    let s = "I am a superman.".to_string();

    for _ in 1..10 {
        let tmp_s = s.clone();
        println!("s is {}", tmp_s);
    }
}
```

2. 由于 Point 没有实现 Copy trait，所以在赋值过程中会产生 Move。如果结构体实现了 Copy trait，则会进行复制而不是移动。

答案来自二夕Thrower 和 Forest

### [03｜所有权（下）：Rust 中借用与引用的规则是怎样的？](https://time.geekbang.org/column/article/720128?utm_campaign=geektime_search&utm_content=geektime_search&utm_medium=geektime_search&utm_source=geektime_search&utm_term=geektime_search)

#### 思考题

1. 请思考，为何在不可变引用存在的情况下（只是读操作），原所有权变量也无法写入？

```plain
fn main() {
    let mut a: u32 = 10;
    let b = &a;
    a = 20;
    
    println!("{}", b);
}
```

2. 请回答，可变引用复制的时候，为什么不允许copy，而是move？

#### 答案

1. 不可变引用的作用域跨越了所有权变量的写入过程，意味着同一个作用域同时存在可变引用和不可变引用，编译器为了防止读取错误，不能通过编译。可以把a = 20放到引用之前，即可编译通过。
2. 可变引用如果可以Copy，就违反了可变引用不能同时存在的规则，因此只能Move。

不可变借用，从字面理解就是借出去了就不能变了，所以既然保证不变了，那这样的借用当然可以被借出去N次（原变量不可变是只限于在借出去的变量的有效生命周期内）。可变借用就是借出去随时有被改变的可能，在同一生命周期内借出去多次，有不确定性的被改变的风险，尤其在多线程中，所以就只让你借出去一次，既然存在有不确定性的被修改的可能，那这个时期肯定就不会让你再有不可以变借用了（因为随时会改变了，不可变借用本身也就不成立了）。Rust这个逻辑看似很繁杂，实则逻辑环环相扣清晰很符合常规。

答案来自Andylinge和Citroen

### [04｜字符串：对号入座，字符串其实没那么可怕！](https://time.geekbang.org/column/article/720426?utm_campaign=geektime_search&utm_content=geektime_search&utm_medium=geektime_search&utm_source=geektime_search&utm_term=geektime_search)

#### 思考题

`chars` 函数是定义在 str 上的，为什么 String 类型能直接调用 str 上定义的方法？实际上 str 上所有的方法，String 都能调用，请问这是为什么呢？

#### 答案

因此在String上实现了Deref trait，target为str。

另外补充一些字符串相关知识点。

Rust中 `char`是用于存放unicode单个字符的类型（固定4个字节）。String类型只能放在堆上，通过引用所有权的形式和变量绑定，它的存储方式不是简单的char数组，而是utf8编码的字节序列，所以单独取这个序列的某一段切片，不一定能解析出具体的字符（程序里的 `String[a..b]`，这里的a和b已经是经过特殊处理的保证截取的有效性）。

```plain
fn main() {
    let s = "abcdefghijk".to_string();
    let a = &s[..5];

    let s = "我爱中国".to_string();
    let a = &s[..5];
}
     Running `target/debug/playground`
thread 'main' panicked at src/main.rs:7:15:
byte index 5 is not a char boundary; it is inside '爱' (bytes 3..6) of `我爱中国`
```

如果能取得有效的序列片段那就是str类型，但是程序里凡是用到绑定str类型变量的地方，则必须都是引用形式存在的（&amp;str），因为str是引用的原始片段的那段真实数据，而&amp;str类型是一个FatPointer，它包括引用目标的起始地址和长度，所以str和&amp;str是完全两个不同的概念。

u8就是一个存储0到255大小的类型，因为一个字节就是8位，所以\[u8, N]可以看做是程序的任何类型数据的二进制表示形式。

答案来自 Citroen

### [05｜复合类型（上）：结构体与面向对象特性](https://time.geekbang.org/column/article/720991?utm_campaign=geektime_search&utm_content=geektime_search&utm_medium=geektime_search&utm_source=geektime_search&utm_term=geektime_search)

#### 思考题

可以给 i8 类型做 impl 吗？

#### 答案

基本数据类型无法实现impl，不过我们可以通过 trait给基本数据类型添加操作的方式来实现。

```plain
trait Operate {
  fn plus(self) -> Self;
}

impl Operate for i8 {
    fn plus(self) -> Self {
        self + self
    }
}

fn main() {
    let  a = 1i8;
    println!("{}",a.plus());
}
```

另外可以用newtype模式对 `i8` 封装一下，再impl。

答案来自下雨天和约书亚

### [06｜复合类型（下）：枚举与模式匹配](https://time.geekbang.org/column/article/720999?utm_campaign=geektime_search&utm_content=geektime_search&utm_medium=geektime_search&utm_source=geektime_search&utm_term=geektime_search)

#### 思考题

match 表达式的各个分支中，如果有不同的返回类型的情况，应该如何处理？

#### 答案

作为静态类型语言，match 返回的类型必须在编译期就被确定，也就意味着 match 必须返回相同的类型。在这个前提下，如果要返回不同的类型，那么切入点就只能是：“返回同一个类型，但是这个类型能表示（承载）不同的类型”，那就只能是本节课讲的枚举 enum 了。

```rust
enum Number {
    Int(i32),
    Float(f64),
    None
}

fn get_number(condition: i32) -> Number {
    match condition {
        1 => Number::Int(10),
        2 => Number::Float(3.14),
        _ => Number::None
    }
}

fn main() {
    let value = get_number(1);
    match value {
        Number::Int(i) => println!("int {}", i),
        Number::Float(f) => println!("float {}", f),
        Number::None => println!("not number"),
    }

    let value = get_number(2);
    match value {
        Number::Int(i) => println!("int {}", i),
        Number::Float(f) => println!("float {}", f),
        Number::None => println!("not number"),
    }

    let value = get_number(3);
    match value {
        Number::Int(i) => println!("int {}", i),
        Number::Float(f) => println!("float {}", f),
        Number::None => println!("not number"),
    }
}
```

答案来自-Hedon 🍭

### [07｜类型与类型参数：如何给 Rust 小助手提供更多信息？](https://time.geekbang.org/column/article/722240?utm_campaign=geektime_search&utm_content=geektime_search&utm_medium=geektime_search&utm_source=geektime_search&utm_term=geektime_search)

#### 思考题

如果你给某个泛型实现了一个方法，那么还能为它的一个具化类型再实现同样的方法吗？

#### 答案

“为泛型实现了一个方法，能否再为具化类型实现一个同名方法”，取决于这个泛型能否表示相应的具化类型。比如为泛型 T 和 String 实现了相同的方法，由于 T 没有施加任何约束，它可以代表 String。那么当调用方法时，对于具化类型 String 来说，要调用哪一个呢？因此会出现歧义，编译器会报错：方法被重复定义了。

但如果给泛型 T 施加了一个 Copy 约束，要求 T 必须实现了 Copy trait，那么就不会报错了，因为此时 T 代表不了 String，所以调用方法不会出现歧义。但如果再为 `i32` 实现一个同名方法就会报错了，因为 `i32` 实现了 Copy，它可以被 T 表示。

答案来自古明地觉

### [08｜Option、Result、迭代器及实际类型中所有权问题](https://time.geekbang.org/column/article/722702?utm_campaign=geektime_search&utm_content=geektime_search&utm_medium=geektime_search&utm_source=geektime_search&utm_term=geektime_search)

#### 思考题

你可以用同样的思路去研究一下，看看如何拿到 HashMap 中值的所有权。[https://doc.rust-lang.org/std/collections/struct.HashMap.html](https://doc.rust-lang.org/std/collections/struct.HashMap.html)

#### 答案

HashMap实现了 `into_iter()`，因此可以用for语句获取其所有权。

```plain
for (k, v) in myhash { //`myhash` moved due to this implicit call to `.into_iter()`
    // todo:
    // 这里会获得v的所有权，并且消耗掉myhash
}

println!("{:?}", myhash); //value borrowed here after move
```

答案来自PEtFiSh和Ransang

### [09｜初识Trait：协议约束与能力配置](https://time.geekbang.org/column/article/723496?utm_campaign=geektime_search&utm_content=geektime_search&utm_medium=geektime_search&utm_source=geektime_search&utm_term=geektime_search)

#### 思考题

如果你学习或者了解过 Java、C++ 等面向对象语言的话，可以聊一聊 trait 的依赖和 OOP 继承的区别在哪里。

#### 答案

trait 的依赖：小明要听从数学老师，语文老师，英语老师的话。老师之间是平等关系，多个依赖平等，最小依赖选择自己喜欢的功能。

OOP 继承：小明要听他爸、他爷爷、他曾祖父的话。继承之间存在父子关系，继承过来一堆破属性和方法，也许根本不是自己想要的，还要负重前行。

答案来自下雨天

### [10｜再探Trait：Trait + 类型 = Rust 的大脑](https://time.geekbang.org/column/article/724776?utm_campaign=geektime_search&utm_content=geektime_search&utm_medium=geektime_search&utm_source=geektime_search&utm_term=geektime_search)

#### 思考题

请谈谈在函数参数中传入 `&dyn TraitA` 与 `Box` 两种类型的区别。

#### 答案

Rust生命周期的独特设计，导致了该语言需要设计一些处理方式应对特殊情况，比如生命周期的标注（主要是给编译器进行代码处理时的提示）。事实上，我们在日常开发中应该避免一些陷入复杂情况的方式：比如，传入参数都用引用（borrow），传出结果都应该是owner。Rust也为我们提供了处理各种情况的工具。所以，一般来说，我们应该在传入参数的时候用 `&dyn T`，传出结果用 `Box<dyn T>`。

此外，`&dyn TraitA` 没有所有权，而 `Box<dyn TraitA>` 有所有权。`&dyn TraitA` 是借用，Box 会转移所有权。

通过下面的程序可以测试出来：

```plain
fn doit3(t1: &dyn TraitA, t2: Box) {
     println!("{:?}", t1);
     println!("{:?}", t2)
 }
fn main() {
     let a = AType;
     let b = BType;
     doit3(&a, Box::new(b));
     println!("{:?}", a);
     println!("{:?}", b);
 }
输出：
error[E0382]: borrow of moved value: b
   --> examples/trait_object.rs:29:22
    |
 26 |     let b = BType;
    |         - move occurs because b has type BType, which does not implement the Copy trait
 27 |     doit3(&a, Box::new(b));
    |                        - value moved here
 28 |     println!("{:?}", a);
 29 |     println!("{:?}", b);
    |                      ^ value borrowed here after move
```

答案来自哄哄、鸠摩智和-Hedon 🍭

### [11｜常见 Trait 解析：标准库中的常用 Trait 应该怎么用？](https://time.geekbang.org/column/article/724942?utm_campaign=geektime_search&utm_content=geektime_search&utm_medium=geektime_search&utm_source=geektime_search&utm_term=geektime_search)

#### 思考题

请举例说明 Deref 与 AsRef 的区别。

#### 答案

在 Rust 中，Deref 和 AsRef 都是与引用相关的 trait，它们可以使某些类型在使用时具有类似于指针的行为，但它们的具体用途有所不同。

**Deref trait 通常与智能指针一起使用**。当我们编写 Rust 代码时，分配在堆上的值通常不是通过拷贝的方式传递或返回，而是通过使用指向它们的指针（智能指针）来传递或返回。Deref trait 可以强制将智能指针转换成指针，从而可以使用类似于 * 操作符这样的解引用语法访问指针指向的值。例如：

```plain
struct MyInt(i32);

impl Deref for MyInt {
    type Target = i32;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

fn main() {
    let my_int = MyInt(42);
    assert_eq!(*my_int, 42);
}
```

在上面的代码中，我们定义了一个 `MyInt` 结构体，它包含一个 i32 类型的值。我们实现了 Deref trait，并指定了目标类型为 i32。我们在 `deref` 方法中返回了 `self.0`，即指向 `MyInt` 中的 i32 值的引用。这样，我们就可以在 `main` 函数中使用 `*my_int` 访问这个 i32 值。

相比之下，**AsRef trait 更加通用**。它只是将类型的引用转换为其他类型的引用。一种常见的用途是将各种字符串类型统一转换为&amp;str类型。例如：

```plain
fn do_something<T: AsRef<str>>(input: T) {
    let bytes = input.as_ref().as_bytes();
    // Do something with the bytes...
}

fn main() {
    let my_str = "hello".to_string();
    do_something(my_str);
}
```

在上面的代码中，我们定义了一个 `do_something` 函数，它接受任何实现了 `AsRef<str>` trait 的值。在函数内部，我们首先使用 `as_ref` 方法将输入值转换为 `&str` 类型，然后使用 `as_bytes` 方法将 `&str` 类型转换为 `&[u8]` 类型。这样，我们就可以在函数中使用字节数组操作 `bytes` 了。在 `main` 函数中，我们传递了一个所有权字符串，它在函数中，使用 as\_ref() 转换成了`&str` 类型。

好了，以上就是我们第一章基础篇的思考题与答案，希望你对照着答案看一下自己的思路对不对，如果你有不同的见解，也欢迎你在评论区分享出来，我们一起讨论。我们下节课再见！
<div><strong>精选留言（5）</strong></div><ul>
<li><span>不忘初心</span> 👍（2） 💬（1）<p>可以给 i8 类型做 impl 吗？基本数据类型无法实现 impl. 
准确点说, 应该是自身crate之外的都无法直接impl, 但可以impl trait</p>2023-12-06</li><br/><li><span>thanks</span> 👍（1） 💬（1）<p>03｜所有权（下）：Rust 中借用与引用的规则是怎样的？
第一个问题，从现象看是 rust 的规则不允许这么写，但是不允许这么写的原因是为啥</p>2023-12-11</li><br/><li><span>伯阳</span> 👍（1） 💬（1）<p>多刷两遍，期待老师的实战课程，能讲讲tikio么，老师</p>2023-12-06</li><br/><li><span>Distance</span> 👍（0） 💬（2）<p>啊这 按照大纲今天不应该是 axum 嘛，我还以为这周 axum 能更完😂</p>2023-12-06</li><br/><li><span>知足</span> 👍（0） 💬（0）<p>impl&lt;T: Display + Copy&gt; Point&lt;T&gt; {
    fn print(&amp;self) {
        println!(&quot;x&quot;);
    }
}

impl Point&lt;String&gt; {
fn print(&amp;self) {
println!(&quot;NotDisplay: x: {}, y: {}&quot;, self.x, self.y);
}
}

这样还是不行：
error[E0592]: duplicate definitions with name `print`
--&gt; src&#47;main.rs:13:5
|
13 | fn print(&amp;self) {
| ^^^^^^^^^^^^^^^ duplicate definitions for `print`
...
19 | fn print(&amp;self) {
| --------------- other definition for `print`
|
= note: upstream crates may add a new impl of trait `std::marker::Copy` for type `std::string::String` in future versions</p>2024-11-01</li><br/>
</ul>

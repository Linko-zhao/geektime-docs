你好，我是陈皓，网名左耳朵耗子。

这节课，我们来讨论一下Functional Options这个编程模式。这是一个函数式编程的应用案例，编程技巧也很好，是目前Go语言中最流行的一种编程模式。

但是，在正式讨论这个模式之前，我们先来看看要解决什么样的问题。

## 配置选项问题

在编程中，我们经常需要对一个对象（或是业务实体）进行相关的配置。比如下面这个业务实体（注意，这只是一个示例）：

```
type Server struct {
    Addr     string
    Port     int
    Protocol string
    Timeout  time.Duration
    MaxConns int
    TLS      *tls.Config
}
```

在这个 `Server` 对象中，我们可以看到：

- 要有侦听的IP地址 `Addr` 和端口号 `Port` ，这两个配置选项是必填的（当然，IP地址和端口号都可以有默认值，不过这里我们用于举例，所以是没有默认值，而且不能为空，需要是必填的）。
- 然后，还有协议 `Protocol` 、 `Timeout` 和`MaxConns` 字段，这几个字段是不能为空的，但是有默认值的，比如，协议是TCP，超时`30`秒 和 最大链接数`1024`个。
- 还有一个 `TLS` ，这个是安全链接，需要配置相关的证书和私钥。这个是可以为空的。

所以，针对这样的配置，我们需要有多种不同的创建不同配置 `Server` 的函数签名，如下所示：

```
func NewDefaultServer(addr string, port int) (*Server, error) {
  return &Server{addr, port, "tcp", 30 * time.Second, 100, nil}, nil
}

func NewTLSServer(addr string, port int, tls *tls.Config) (*Server, error) {
  return &Server{addr, port, "tcp", 30 * time.Second, 100, tls}, nil
}

func NewServerWithTimeout(addr string, port int, timeout time.Duration) (*Server, error) {
  return &Server{addr, port, "tcp", timeout, 100, nil}, nil
}

func NewTLSServerWithMaxConnAndTimeout(addr string, port int, maxconns int, timeout time.Duration, tls *tls.Config) (*Server, error) {
  return &Server{addr, port, "tcp", 30 * time.Second, maxconns, tls}, nil
}
```

因为Go语言不支持重载函数，所以，你得用不同的函数名来应对不同的配置选项。

## 配置对象方案

要解决这个问题，最常见的方式是使用一个配置对象，如下所示：

```
type Config struct {
    Protocol string
    Timeout  time.Duration
    Maxconns int
    TLS      *tls.Config
}
```

我们把那些非必输的选项都移到一个结构体里，这样一来， `Server` 对象就会变成：

```
type Server struct {
    Addr string
    Port int
    Conf *Config
}
```

于是，我们就只需要一个 `NewServer()` 的函数了，在使用前需要构造 `Config` 对象。

```
func NewServer(addr string, port int, conf *Config) (*Server, error) {
    //...
}

//Using the default configuratrion
srv1, _ := NewServer("localhost", 9000, nil)

conf := ServerConfig{Protocol:"tcp", Timeout: 60*time.Duration}
srv2, _ := NewServer("locahost", 9000, &conf)
```

这段代码算是不错了，大多数情况下，我们可能就止步于此了。但是，对于有洁癖的、有追求的程序员来说，他们会看到其中不太好的一点，那就是`Config` 并不是必需的，所以，你需要判断是否是 `nil` 或是 Empty—— `Config{}`会让我们的代码感觉不太干净。

## Builder模式

如果你是一个Java程序员，熟悉设计模式的一定会很自然地使用Builder模式。比如下面的代码：

```
User user = new User.Builder()
  .name("Hao Chen")
  .email("haoel@hotmail.com")
  .nickname("左耳朵")
  .build();
```

仿照这个模式，我们可以把刚刚的代码改写成下面的样子（注：下面的代码没有考虑出错处理，其中关于出错处理的更多内容，你可以再回顾下[上节课](https://time.geekbang.org/column/article/332602)）：

```
//使用一个builder类来做包装
type ServerBuilder struct {
  Server
}

func (sb *ServerBuilder) Create(addr string, port int) *ServerBuilder {
  sb.Server.Addr = addr
  sb.Server.Port = port
  //其它代码设置其它成员的默认值
  return sb
}

func (sb *ServerBuilder) WithProtocol(protocol string) *ServerBuilder {
  sb.Server.Protocol = protocol
  return sb
}

func (sb *ServerBuilder) WithMaxConn( maxconn int) *ServerBuilder {
  sb.Server.MaxConns = maxconn
  return sb
}

func (sb *ServerBuilder) WithTimeOut( timeout time.Duration) *ServerBuilder {
  sb.Server.Timeout = timeout
  return sb
}

func (sb *ServerBuilder) WithTLS( tls *tls.Config) *ServerBuilder {
  sb.Server.TLS = tls
  return sb
}

func (sb *ServerBuilder) Build() (Server) {
  return  sb.Server
}
```

这样一来，就可以使用这样的方式了：

```
sb := ServerBuilder{}
server, err := sb.Create("127.0.0.1", 8080).
  WithProtocol("udp").
  WithMaxConn(1024).
  WithTimeOut(30*time.Second).
  Build()
```

这种方式也很清楚，不需要额外的Config类，使用链式的函数调用的方式来构造一个对象，只需要多加一个Builder类。你可能会觉得，这个Builder类似乎有点多余，我们似乎可以直接在`Server` 上进行这样的 Builder 构造，的确是这样的。但是，在处理错误的时候可能就有点麻烦，不如一个包装类更好一些。

如果我们想省掉这个包装的结构体，就要请出Functional Options上场了：函数式编程。

## Functional Options

首先，我们定义一个函数类型：

```
type Option func(*Server)
```

然后，我们可以使用函数式的方式定义一组如下的函数：

```
func Protocol(p string) Option {
    return func(s *Server) {
        s.Protocol = p
    }
}
func Timeout(timeout time.Duration) Option {
    return func(s *Server) {
        s.Timeout = timeout
    }
}
func MaxConns(maxconns int) Option {
    return func(s *Server) {
        s.MaxConns = maxconns
    }
}
func TLS(tls *tls.Config) Option {
    return func(s *Server) {
        s.TLS = tls
    }
}
```

这组代码传入一个参数，然后返回一个函数，返回的这个函数会设置自己的 `Server` 参数。例如，当我们调用其中的一个函数 `MaxConns(30)` 时，其返回值是一个 `func(s* Server) { s.MaxConns = 30 }` 的函数。

这个叫高阶函数。在数学上，这有点像是计算长方形面积的公式为： `rect(width, height) = width * height;` 这个函数需要两个参数，我们包装一下，就可以变成计算正方形面积的公式：`square(width) = rect(width, width)` 。也就是说，`squre(width)`返回了另外一个函数，这个函数就是`rect(w,h)` ，只不过它的两个参数是一样的，即：`f(x) = g(x, x)`。

好了，现在我们再定一个 `NewServer()`的函数，其中，有一个可变参数 `options` ，它可以传出多个上面的函数，然后使用一个for-loop来设置我们的 `Server` 对象。

```
func NewServer(addr string, port int, options ...func(*Server)) (*Server, error) {

  srv := Server{
    Addr:     addr,
    Port:     port,
    Protocol: "tcp",
    Timeout:  30 * time.Second,
    MaxConns: 1000,
    TLS:      nil,
  }
  for _, option := range options {
    option(&srv)
  }
  //...
  return &srv, nil
}
```

于是，我们在创建 `Server` 对象的时候，就可以像下面这样：

```
s1, _ := NewServer("localhost", 1024)
s2, _ := NewServer("localhost", 2048, Protocol("udp"))
s3, _ := NewServer("0.0.0.0", 8080, Timeout(300*time.Second), MaxConns(1000))
```

怎么样，是不是高度整洁和优雅？这不但解决了“使用 `Config` 对象方式的需要有一个config参数，但在不需要的时候，是放 `nil` 还是放 `Config{}`”的选择困难问题，也不需要引用一个Builder的控制对象，直接使用函数式编程，在代码阅读上也很优雅。

所以，以后，你要玩类似的代码时，我强烈推荐你使用Functional Options这种方式，这种方式至少带来了6个好处：

- 直觉式的编程；
- 高度的可配置化；
- 很容易维护和扩展；
- 自文档；
- 新来的人很容易上手；
- 没有什么令人困惑的事（是nil 还是空）。

## 参考文档

- [Self referential functions and design](http://commandcenter.blogspot.com.au/2014/01/self-referential-functions-and-design.html)， by Rob Pike

好了，这节课就到这里。如果你觉得今天的内容对你有所帮助，欢迎你帮我分享给更多人。
<div><strong>精选留言（15）</strong></div><ul>
<li><span>汪辉</span> 👍（9） 💬（0）<p>之前看到mq的初始化可选配置的时候有用到Functional Options这个模式，没想到在这里找到源头了。</p>2021-01-19</li><br/><li><span>Geek_a754be</span> 👍（7） 💬（1）<p>之前在公司自研的微服务框架里面看到大规模使用，原来有个学名叫Functional Options</p>2021-02-09</li><br/><li><span>萧</span> 👍（3） 💬（0）<p>太强了，受益匪浅</p>2021-02-18</li><br/><li><span>后青春期的Keats</span> 👍（0） 💬（0）<p>雅，太雅了
必要参数放在入参列表，非必要参数以函数式编程可变参的形式传入。</p>2024-08-29</li><br/><li><span>紫陌桑田</span> 👍（0） 💬（0）<p>各种初始化对象时用的特别多，相比于 builder 模式，省了不少代码，而且更为优雅</p>2024-07-11</li><br/><li><span>Geek_sevn</span> 👍（0） 💬（0）<p>如沐春风</p>2023-07-30</li><br/><li><span>辰星</span> 👍（0） 💬（0）<p>太强了</p>2022-12-04</li><br/><li><span>拉欧</span> 👍（0） 💬（0）<p>option 意味选项，本身就有函数的意思</p>2022-04-14</li><br/><li><span>Geek_Huahui</span> 👍（0） 💬（0）<p>真的牛逼</p>2022-03-14</li><br/><li><span>今年也没有猫</span> 👍（0） 💬（0）<p>简单理解  就是一种闭包的组织形式。</p>2022-02-04</li><br/><li><span>方勇(gopher)</span> 👍（0） 💬（0）<p>确实很多中间件的传参都这么设计，有时候可能要考虑，函数放在client端，还是server端</p>2021-12-17</li><br/><li><span>青阳</span> 👍（0） 💬（0）<p>和函数科里化是一回事吗</p>2021-11-12</li><br/><li><span>图个啥呢</span> 👍（0） 💬（0）<p>厉害了！</p>2021-06-25</li><br/><li><span>👻 小二</span> 👍（0） 💬（0）<p>这种接口也很友好， 就是苦了作者

````go
package main

import (
	&quot;crypto&#47;tls&quot;
	&quot;time&quot;
)

type Option struct {
	Timeout *time.Duration
	TLS     *tls.Config
}

func (option *Option) SetTimeOut(timeout time.Duration) *Option {
	option.Timeout = &amp;timeout
	return option
}

func (option *Option) SetTLS(tls *tls.Config) *Option {
	option.TLS = tls
	return option
}

func MergeOptions(options ...*Option) *Option {

	&#47;&#47;把option合并起来
	return nil
}

type Server struct {
	Addr    string
	Port    int
	Timeout time.Duration
	TLS     *tls.Config
}

func NewOptions() *Option {
	return new(Option)
}
func NewServer(addr string, port int, options ...*Option) (*Server, error) {

	srv := Server{
		Addr:    addr,
		Port:    port,
		Timeout: 30 * time.Second,
		TLS:     nil,
	}

	op := MergeOptions(options...)

	if op.Timeout != nil {
		srv.Timeout = *op.Timeout
	}

	if op.TLS != nil {
		srv.TLS = op.TLS
	}

	&#47;&#47;...
	return &amp;srv, nil
}
func main() {
	_, _ = NewServer(&quot;127.0.0.1&quot;, 80)
	_, _ = NewServer(&quot;127.0.0.1&quot;, 80, NewOptions().SetTimeOut(100))
	_, _ = NewServer(&quot;127.0.0.1&quot;, 80, NewOptions().SetTimeOut(100).SetTLS(nil))
}

```</p>2021-06-10</li><br/><li><span>轻飘飘过</span> 👍（0） 💬（0）<p>对比js的...解构和函数式编程的compose?</p>2021-05-20</li><br/>
</ul>
````

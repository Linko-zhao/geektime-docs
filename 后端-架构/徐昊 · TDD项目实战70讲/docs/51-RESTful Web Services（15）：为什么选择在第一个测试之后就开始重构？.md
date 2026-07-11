你好，我是徐昊。今天我们继续使用TDD的方式实现RESTful Web Services。

## 回顾架构愿景与任务列表

目前我们的架构愿景如下：

![](https://static001.geekbang.org/resource/image/59/24/59ee2d534a4ae87623a736157e848924.jpg?wh=2284x1285)  
![](https://static001.geekbang.org/resource/image/2e/a4/2ef7e84ba450b36d1df67cfce9e61da4.jpg?wh=2284x1285)

任务列表如下：

- ResourceRouter

  - 将Resource Method的返回值包装为Response对象

    - 根据与Path匹配结果，降序排列RootResource，选择第一个的RootResource
    - 如果没有匹配的RootResource，则构造404的Response
    - 如果返回的RootResource中无法匹配剩余Path，则构造404的Response
    - 如果ResourceMethod返回null，则构造204的Response

代码目前是：

```
class DefaultResourceRouter implements ResourceRouter {
    private Runtime runtime;
    private List<RootResource> rootResources;
    public DefaultResourceRouter(Runtime runtime, List<RootResource> rootResources) {
        this.runtime = runtime;
        this.rootResources = rootResources;
    }
    @Override
    public OutboundResponse dispatch(HttpServletRequest request, ResourceContext resourceContext) {
        String path = request.getServletPath();
        UriInfoBuilder uri = runtime.createUriInfoBuilder(request);
        Optional<RootResource> matched = rootResources.stream().map(resource -> new Result(resource.getUriTemplate().match(path), resource))
                .filter(result -> result.matched.isPresent()).map(Result::resource)
                .findFirst();
        Optional<ResourceMethod> method = matched.flatMap(resource -> resource.match(path, request.getMethod(),
                Collections.list(request.getHeaders(HttpHeaders.ACCEPT)).toArray(String[]::new), uri));
        GenericEntity<?> entity = method.map(m -> m.call(resourceContext, uri)).get();
        return (OutboundResponse) Response.ok(entity).build();
    }
    record Result(Optional<UriTemplate.MatchResult> matched, RootResource resource) {
    }
}

```

## 视频演示

下面进入今日的开发：

## 思考题

我们为什么选择在第一个测试之后就开始重构？

欢迎把你的想法分享在留言区，也欢迎把你的项目代码分享出来。相信经过你的思考与实操，学习效果会更好！
<div><strong>精选留言（4）</strong></div><ul>
<li><span>忘川</span> 👍（1） 💬（0）<p>- 可读性
	- 让测试代码的可读性更好 更方便自己理解 当初的思路 而不需要每次都从头到尾思考上下文 才能理解代码在做什么
- 复用性
	- 让后续的测试代码 能够更快的复用之前的代码 同时也能更好的管控 后续的扩展点 方便后续的调整 都有统一的出入口
- 结构性
	- 通过对替身代码的整理 让自己理解 自己是基于什么样的结构 和什么样的约定的前提下 进行的测试开发
</p>2023-01-08</li><br/><li><span>Jason</span> 👍（0） 💬（0）<p>降序排列不应该值大的在前面吗？</p>2022-08-08</li><br/><li><span>Jason</span> 👍（0） 💬（0）<p>因为测试的setup部分都是相同的，如果不重构测试代码就有很多重复，且难以理解。</p>2022-08-08</li><br/><li><span>aoe</span> 👍（0） 💬（0）<p>原来 inline 的目的是让代码更紧凑</p>2022-07-12</li><br/>
</ul>

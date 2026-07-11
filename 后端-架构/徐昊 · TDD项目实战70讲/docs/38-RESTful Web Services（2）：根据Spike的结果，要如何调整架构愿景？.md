你好，我是徐昊。今天我们继续使用TDD的方式实现RESTful Web Services。

在上节课，我们通过Spike实现了一个非常简略的版本，可以通过Root Resource以及对应的方法处理请求，并使用MessageBodyWriter扩展点，将内容写入Http响应中。代码如下：

```
static class ResourceServlet extends HttpServlet {

    private Application application;

    private Providers providers;

    public ResourceServlet(Application application, Providers providers) {
        this.application = application;
        this.providers = providers;
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        Stream<Class<?>> rootResources = application.getClasses().stream().filter(c -> c.isAnnotationPresent(Path.class));
        Object result = dispatch(req, rootResources);
        MessageBodyWriter<Object> writer = (MessageBodyWriter<Object>) providers.getMessageBodyWriter(result.getClass(), null, null, null);
        writer.writeTo(result, null, null, null, null, null, resp.getOutputStream());
    }

    Object dispatch(HttpServletRequest req, Stream<Class<?>> rootResources) {
        try {
            Class<?> rootClass = rootResources.findFirst().get();
            Object rootResource = rootClass.getConstructor().newInstance();
            Method method = Arrays.stream(rootClass.getMethods()).filter(m -> m.isAnnotationPresent(GET.class)).findFirst().get();
            return method.invoke(rootResource);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
```

在这个Spike的基础上，我们可以进一步细化架构的愿景：

![](https://static001.geekbang.org/resource/image/16/e1/165d9ce2d5223bf6498b9c1ceffa71e1.jpg?wh=8000x4500)

通过结合JAX-RS的Application和Providers，我们大致清楚了ResourceServlet如何使用Application和Providers，以及大致在什么地方需要使用依赖注入容器。

说到依赖注入，在JAX-RS中存在两种依赖注入：对于Application Scope的Inject注入，以及对于Request Scope的Context注入。这仍然是不太清晰的部分，我们需要进一步Spike：

## 思考题

根据Spike的结果，接下来要如何进一步调整架构愿景？

欢迎把你的想法分享在留言区，也欢迎把你的项目代码分享出来。相信经过你的思考与实操，学习效果会更好！
<div><strong>精选留言（3）</strong></div><ul>
<li><span>张铁林</span> 👍（2） 💬（0）<p>我再贡献一个情况，之前di-container项目没有加任何包名，就是放在java下面，在融合后，默认找不到ContextCofnig，给di-container加一个包名后，就能引入了。</p>2022-06-17</li><br/><li><span>aoe</span> 👍（2） 💬（0）<p>问题一：gradle 如何引入子模块
答：implementation(project(&#39;:container&#39;))。参考专栏 《程序员的测试课》| 01 | 实战：实现一个 ToDo 的应用（上）中的项目 https:&#47;&#47;github.com&#47;dreamhead&#47;geektime-todo。在 GitHub 中打开后按.(句号)可以切换到在线 VsCode，方便查阅代码

问题二：之前 di-container 中没有这个方法 config.component(wirteClass, wirteClass) （视频 03:53）也没有之后出现的 config.from 方法。
答：35课，老师对代码做了重构，只贴了代码，没有视频。（感谢完美的红国王解答）</p>2022-06-11</li><br/><li><span>张铁林</span> 👍（1） 💬（0）<p>https:&#47;&#47;github.com&#47;vfbiby&#47;tdd-restful
把之前的代码移到restful子模块，再引用了前面一个兄弟的di container作为git submodule，直接完成了这一节，手册也在里面了。多次提交，如果不会子模块的，可以参考一下。</p>2022-06-17</li><br/>
</ul>

今天我带你用AdaBoost算法做一个实战项目。AdaBoost不仅可以用于分类问题，还可以用于回归分析。

我们先做个简单回忆，什么是分类，什么是回归呢？实际上分类和回归的本质是一样的，都是对未知事物做预测。不同之处在于输出结果的类型，分类输出的是一个离散值，因为物体的分类数有限的，而回归输出的是连续值，也就是在一个区间范围内任何取值都有可能。

这次我们的主要目标是使用AdaBoost预测房价，这是一个回归问题。除了对项目进行编码实战外，我希望你能掌握：

1. AdaBoost工具的使用，包括使用AdaBoost进行分类，以及回归分析。
2. 使用其他的回归工具，比如决策树回归，对比AdaBoost回归和决策树回归的结果。

## 如何使用AdaBoost工具

我们可以直接在sklearn中使用AdaBoost。如果我们要用AdaBoost进行分类，需要在使用前引用代码：

```
from sklearn.ensemble import AdaBoostClassifier
```

我们之前讲到过，如果你看到了Classifier这个类，一般都会对应着Regressor类。AdaBoost也不例外，回归工具包的引用代码如下：

```
from sklearn.ensemble import AdaBoostRegressor
```

我们先看下如何在sklearn中创建AdaBoost分类器。

我们需要使用AdaBoostClassifier(base\_estimator=None, n\_estimators=50, learning\_rate=1.0, algorithm=’SAMME.R’, random\_state=None)这个函数，其中有几个比较主要的参数，我分别来讲解下：

1. base\_estimator：代表的是弱分类器。在AdaBoost的分类器和回归器中都有这个参数，在AdaBoost中默认使用的是决策树，一般我们不需要修改这个参数，当然你也可以指定具体的分类器。
2. n\_estimators：算法的最大迭代次数，也是分类器的个数，每一次迭代都会引入一个新的弱分类器来增加原有的分类器的组合能力。默认是50。
3. learning\_rate：代表学习率，取值在0-1之间，默认是1.0。如果学习率较小，就需要比较多的迭代次数才能收敛，也就是说学习率和迭代次数是有相关性的。当你调整learning\_rate的时候，往往也需要调整n\_estimators这个参数。
4. algorithm：代表我们要采用哪种boosting算法，一共有两种选择：SAMME 和SAMME.R。默认是SAMME.R。这两者之间的区别在于对弱分类权重的计算方式不同。
5. random\_state：代表随机数种子的设置，默认是None。随机种子是用来控制随机模式的，当随机种子取了一个值，也就确定了一种随机规则，其他人取这个值可以得到同样的结果。如果不设置随机种子，每次得到的随机数也就不同。

那么如何创建AdaBoost回归呢？

我们可以使用AdaBoostRegressor(base\_estimator=None, n\_estimators=50, learning\_rate=1.0, loss=‘linear’, random\_state=None)这个函数。

你能看出来回归和分类的参数基本是一致的，不同点在于回归算法里没有algorithm这个参数，但多了一个loss参数。

loss代表损失函数的设置，一共有3种选择，分别为linear、square和exponential，它们的含义分别是线性、平方和指数。默认是线性。一般采用线性就可以得到不错的效果。

创建好AdaBoost分类器或回归器之后，我们就可以输入训练集对它进行训练。我们使用fit函数，传入训练集中的样本特征值train\_X和结果train\_y，模型会自动拟合。使用predict函数进行预测，传入测试集中的样本特征值test\_X，然后就可以得到预测结果。

## 如何用AdaBoost对房价进行预测

了解了AdaBoost工具包之后，我们看下sklearn中自带的波士顿房价数据集。

这个数据集一共包括了506条房屋信息数据，每一条数据都包括了13个指标，以及一个房屋价位。

13个指标的含义，可以参考下面的表格：

![](https://static001.geekbang.org/resource/image/42/b7/426dec532f34d7f458e36ee59a6617b7.png?wh=468%2A447)  
这些指标分析得还是挺细的，但实际上，我们不用关心具体的含义，要做的就是如何通过这13个指标推导出最终的房价结果。

如果你学习了之前的算法实战，这个数据集的预测并不复杂。

首先加载数据，将数据分割成训练集和测试集，然后创建AdaBoost回归模型，传入训练集数据进行拟合，再传入测试集数据进行预测，就可以得到预测结果。最后将预测的结果与实际结果进行对比，得到两者之间的误差。具体代码如下：

```
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error
from sklearn.datasets import load_boston
from sklearn.ensemble import AdaBoostRegressor
# 加载数据
data=load_boston()
# 分割数据
train_x, test_x, train_y, test_y = train_test_split(data.data, data.target, test_size=0.25, random_state=33)
# 使用AdaBoost回归模型
regressor=AdaBoostRegressor()
regressor.fit(train_x,train_y)
pred_y = regressor.predict(test_x)
mse = mean_squared_error(test_y, pred_y)
print("房价预测结果 ", pred_y)
print("均方误差 = ",round(mse,2))
```

运行结果：

```
房价预测结果  [20.2        10.4137931  14.63820225 17.80322581 24.58931298 21.25076923
 27.52222222 17.8372093  31.79642857 20.86428571 27.87431694 31.09142857
 12.81666667 24.13131313 12.81666667 24.58931298 17.80322581 17.66333333
 27.83       24.58931298 17.66333333 20.90823529 20.10555556 20.90823529
 28.20877193 20.10555556 21.16882129 24.58931298 13.27619048 31.09142857
 17.08095238 26.19217391  9.975      21.03404255 26.74583333 31.09142857
 25.83960396 11.859375   13.38235294 24.58931298 14.97931034 14.46699029
 30.12777778 17.66333333 26.19217391 20.10206186 17.70540541 18.45909091
 26.19217391 20.10555556 17.66333333 33.31025641 14.97931034 17.70540541
 24.64421053 20.90823529 25.83960396 17.08095238 24.58931298 21.43571429
 19.31617647 16.33733333 46.04888889 21.25076923 17.08095238 25.83960396
 24.64421053 11.81470588 17.80322581 27.63636364 23.59731183 17.94444444
 17.66333333 27.7253886  20.21465517 46.04888889 14.97931034  9.975
 17.08095238 24.13131313 21.03404255 13.4        11.859375   26.19214286
 21.25076923 21.03404255 47.11395349 16.33733333 43.21111111 31.65730337
 30.12777778 20.10555556 17.8372093  18.40833333 14.97931034 33.31025641
 24.58931298 22.88813559 18.27179487 17.80322581 14.63820225 21.16882129
 26.91538462 24.64421053 13.05       14.97931034  9.975      26.19217391
 12.81666667 26.19214286 49.46511628 13.27619048 17.70540541 25.83960396
 31.09142857 24.13131313 21.25076923 21.03404255 26.91538462 21.03404255
 21.16882129 17.8372093  12.81666667 21.03404255 21.03404255 17.08095238
 45.16666667]
均方误差 =  18.05
```

这个数据集是比较规范的，我们并不需要在数据清洗，数据规范化上花太多精力，代码编写起来比较简单。

同样，我们可以使用不同的回归分析模型分析这个数据集，比如使用决策树回归和KNN回归。

编写代码如下：

```
# 使用决策树回归模型
dec_regressor=DecisionTreeRegressor()
dec_regressor.fit(train_x,train_y)
pred_y = dec_regressor.predict(test_x)
mse = mean_squared_error(test_y, pred_y)
print("决策树均方误差 = ",round(mse,2))
# 使用KNN回归模型
knn_regressor=KNeighborsRegressor()
knn_regressor.fit(train_x,train_y)
pred_y = knn_regressor.predict(test_x)
mse = mean_squared_error(test_y, pred_y)
print("KNN均方误差 = ",round(mse,2))
```

运行结果：

```
决策树均方误差 =  23.84
KNN均方误差 =  27.87
```

你能看到相比之下，AdaBoost的均方误差更小，也就是结果更优。虽然AdaBoost使用了弱分类器，但是通过50个甚至更多的弱分类器组合起来而形成的强分类器，在很多情况下结果都优于其他算法。因此AdaBoost也是常用的分类和回归算法之一。

## AdaBoost与决策树模型的比较

在sklearn中AdaBoost默认采用的是决策树模型，我们可以随机生成一些数据，然后对比下AdaBoost中的弱分类器（也就是决策树弱分类器）、决策树分类器和AdaBoost模型在分类准确率上的表现。

如果想要随机生成数据，我们可以使用sklearn中的make\_hastie\_10\_2函数生成二分类数据。假设我们生成12000个数据，取前2000个作为测试集，其余作为训练集。

有了数据和训练模型后，我们就可以编写代码。我设置了AdaBoost的迭代次数为200，代表AdaBoost由200个弱分类器组成。针对训练集，我们用三种模型分别进行训练，然后用测试集进行预测，并将三个分类器的错误率进行可视化对比，可以看到这三者之间的区别：

```
import numpy as np
import matplotlib.pyplot as plt
from sklearn import datasets
from sklearn.metrics import zero_one_loss
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import  AdaBoostClassifier
# 设置AdaBoost迭代次数
n_estimators=200
# 使用
X,y=datasets.make_hastie_10_2(n_samples=12000,random_state=1)
# 从12000个数据中取前2000行作为测试集，其余作为训练集
train_x, train_y = X[2000:],y[2000:]
test_x, test_y = X[:2000],y[:2000]
# 弱分类器
dt_stump = DecisionTreeClassifier(max_depth=1,min_samples_leaf=1)
dt_stump.fit(train_x, train_y)
dt_stump_err = 1.0-dt_stump.score(test_x, test_y)
# 决策树分类器
dt = DecisionTreeClassifier()
dt.fit(train_x,  train_y)
dt_err = 1.0-dt.score(test_x, test_y)
# AdaBoost分类器
ada = AdaBoostClassifier(base_estimator=dt_stump,n_estimators=n_estimators)
ada.fit(train_x,  train_y)
# 三个分类器的错误率可视化
fig = plt.figure()
# 设置plt正确显示中文
plt.rcParams['font.sans-serif'] = ['SimHei']
ax = fig.add_subplot(111)
ax.plot([1,n_estimators],[dt_stump_err]*2, 'k-', label=u'决策树弱分类器 错误率')
ax.plot([1,n_estimators],[dt_err]*2,'k--', label=u'决策树模型 错误率')
ada_err = np.zeros((n_estimators,))
# 遍历每次迭代的结果 i为迭代次数, pred_y为预测结果
for i,pred_y in enumerate(ada.staged_predict(test_x)):
     # 统计错误率
    ada_err[i]=zero_one_loss(pred_y, test_y)
# 绘制每次迭代的AdaBoost错误率
ax.plot(np.arange(n_estimators)+1, ada_err, label='AdaBoost Test 错误率', color='orange')
ax.set_xlabel('迭代次数')
ax.set_ylabel('错误率')
leg=ax.legend(loc='upper right',fancybox=True)
plt.show()
```

运行结果：

![](https://static001.geekbang.org/resource/image/8a/35/8ad4bb6a8c6848f2061ff6f442568735.png?wh=865%2A659)  
从图中你能看出来，弱分类器的错误率最高，只比随机分类结果略好，准确率稍微大于50%。决策树模型的错误率明显要低很多。而AdaBoost模型在迭代次数超过25次之后，错误率有了明显下降，经过125次迭代之后错误率的变化形势趋于平缓。

因此我们能看出，虽然单独的一个决策树弱分类器效果不好，但是多个决策树弱分类器组合起来形成的AdaBoost分类器，分类效果要好于决策树模型。

## 总结

今天我带你用AdaBoost回归分析对波士顿房价进行了预测。因为这是个回归分析的问题，我们直接使用sklearn中的AdaBoostRegressor即可。如果是分类，我们使用AdaBoostClassifier。

另外我们将AdaBoost分类器、弱分类器和决策树分类器做了对比，可以看出经过多个弱分类器组合形成的AdaBoost强分类器，准确率要明显高于决策树算法。所以AdaBoost的优势在于框架本身，它通过一种迭代机制让原本性能不强的分类器组合起来，形成一个强分类器。

其实在现实工作中，我们也能找到类似的案例。IBM服务器追求的是单个服务器性能的强大，比如打造超级服务器。而Google在创建集群的时候，利用了很多PC级的服务器，将它们组成集群，整体性能远比一个超级服务器的性能强大。

再比如我们讲的“三个臭皮匠，顶个诸葛亮”，也就是AdaBoost的价值所在。

![](https://static001.geekbang.org/resource/image/6c/17/6c4fcd75a65dc354bc65590c18e77d17.png?wh=1638%2A822)  
今天我们用AdaBoost分类器与决策树分类做对比的时候，使用到了sklearn中的make\_hastie\_10\_2函数生成数据。实际上在[第19篇](http://time.geekbang.org/column/article/79072)，我们对泰坦尼克号的乘客做生存预测的时候，也讲到了决策树工具的使用。你能不能编写代码，使用AdaBoost算法对泰坦尼克号乘客的生存做预测，看看它和决策树模型，谁的准确率更高？

你也可以把这篇文章分享给你的朋友或者同事，一起切磋一下。
<div><strong>精选留言（15）</strong></div><ul>
<li><span>TKbook</span> 👍（18） 💬（1）<p>源代码中：
# 从 12000 个数据中取前 2000 行作为测试集，其余作为训练集
test_x, test_y = X[2000:],y[2000:]
train_x, train_y = X[:2000],y[:2000]

这个部分的代码写错了吧
应该是：
test_x, test_y = x[: 2000], y[: 2000]
train_x, train_y = x[2000:], y[2000:]</p>2019-03-05</li><br/><li><span>third</span> 👍（7） 💬（1）<p>结果仍然为AdaBoost算法最优。
个人发现，前两个分类器出结果很快
分析最优：
1.AdaBoost算法经过了更多运算，特别是在迭代弱分类器和组合上
2.良好组合起来的个体，能够创造更大的价值。

决策树弱分类器准确率为 0.7867
决策树分类器准确率为 0.7891
AdaBoost 分类器准确率为 0.8138

import numpy as np
import pandas as pd
from sklearn.model_selection import cross_val_score
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import AdaBoostClassifier
from sklearn.feature_extraction import DictVectorizer

# 1.数据加载

train_data=pd.read_csv(&#39;.&#47;Titanic_Data&#47;train.csv&#39;)
test_data=pd.read_csv(&#39;.&#47;Titanic_Data&#47;test.csv&#39;)

# 2.数据清洗

# 使用平均年龄来填充年龄中的 NaN 值

train_data[&#39;Age&#39;].fillna(train_data[&#39;Age&#39;].mean(),inplace=True)
test_data[&#39;Age&#39;].fillna(test_data[&#39;Age&#39;].mean(),inplace=True)

# 均价填充

train_data[&#39;Fare&#39;].fillna(train_data[&#39;Fare&#39;].mean(),inplace=True)
test_data[&#39;Fare&#39;].fillna(test_data[&#39;Fare&#39;].mean(),inplace=True)

# 使用登陆最多的港口来填充

train_data[&#39;Embarked&#39;].fillna(&#39;S&#39;,inplace=True)
test_data[&#39;Embarked&#39;].fillna(&#39;S&#39;,inplace=True)

# 特征选择

features=[&#39;Pclass&#39;,&#39;Sex&#39;,&#39;Age&#39;,&#39;SibSp&#39;,&#39;Parch&#39;,&#39;Fare&#39;,&#39;Embarked&#39;]
train_features=train_data[features]
train_labels=train_data[&#39;Survived&#39;]
test_features=test_data[features]

# 将符号化的Embarked对象抽象处理成0&#47;1进行表示

dvec=DictVectorizer(sparse=False)
train_features=dvec.fit_transform(train_features.to_dict(orient=&#39;record&#39;))
test_features=dvec.transform(test_features.to_dict(orient=&#39;record&#39;))

# 决策树弱分类器

dt_stump = DecisionTreeClassifier(max_depth=1,min_samples_leaf=1)
dt_stump.fit(train_features, train_labels)

print(u&#39;决策树弱分类器准确率为 %.4lf&#39; % np.mean(cross_val_score(dt_stump, train_features, train_labels, cv=10)))

# 决策树分类器

dt = DecisionTreeClassifier()
dt.fit(train_features, train_labels)

print(u&#39;决策树分类器准确率为 %.4lf&#39; % np.mean(cross_val_score(dt, train_features, train_labels, cv=10)))

# AdaBoost 分类器

ada = AdaBoostClassifier(base_estimator=dt_stump,n_estimators=200)
ada.fit(train_features, train_labels)

print(u&#39;AdaBoost 分类器准确率为 %.4lf&#39; % np.mean(cross_val_score(ada, train_features, train_labels, cv=10)))</p>2019-03-04</li><br/><li><span>Geek_hve78z</span> 👍（6） 💬（1）<p>由于乘客测试集缺失真实值，采用 K 折交叉验证准确率
--------------------

运行结果：
决策树弱分类器准确率为 0.7867
决策树分类器准确率为 0.7813
AdaBoost 分类器准确率为 0.8138
-------------------------

代码：
import numpy as np
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import AdaBoostClassifier
import pandas as pd
from sklearn.feature_extraction import DictVectorizer
from sklearn.model_selection import cross_val_score

# 设置 AdaBoost 迭代次数

n_estimators=200

# 数据加载

train_data=pd.read_csv(&#39;.&#47;Titanic_Data&#47;train.csv&#39;)
test_data=pd.read_csv(&#39;.&#47;Titanic_Data&#47;test.csv&#39;)

# 模块 2：数据清洗

# 使用平均年龄来填充年龄中的 NaN 值

train_data[&#39;Age&#39;].fillna(train_data[&#39;Age&#39;].mean(),inplace=True)
test_data[&#39;Age&#39;].fillna(test_data[&#39;Age&#39;].mean(),inplace=True)

# 使用票价的均值填充票价中的 nan 值

train_data[&#39;Fare&#39;].fillna(train_data[&#39;Fare&#39;].mean(),inplace=True)
test_data[&#39;Fare&#39;].fillna(test_data[&#39;Fare&#39;].mean(),inplace=True)

# 使用登录最多的港口来填充登录港口Embarked的 nan 值

train_data[&#39;Embarked&#39;].fillna(&#39;S&#39;,inplace=True)
test_data[&#39;Embarked&#39;].fillna(&#39;S&#39;,inplace=True)

# 特征选择

features=[&#39;Pclass&#39;,&#39;Sex&#39;,&#39;Age&#39;,&#39;SibSp&#39;,&#39;Parch&#39;,&#39;Fare&#39;,&#39;Embarked&#39;]
train_features=train_data[features]
train_labels=train_data[&#39;Survived&#39;]
test_features=test_data[features]

# 将符号化的Embarked对象处理成0&#47;1进行表示

dvec=DictVectorizer(sparse=False)
train_features=dvec.fit_transform(train_features.to_dict(orient=&#39;record&#39;))
test_features=dvec.transform(test_features.to_dict(orient=&#39;record&#39;))

# 决策树弱分类器

dt_stump = DecisionTreeClassifier(max_depth=1,min_samples_leaf=1)
dt_stump.fit(train_features, train_labels)

print(u&#39;决策树弱分类器准确率为 %.4lf&#39; % np.mean(cross_val_score(dt_stump, train_features, train_labels, cv=10)))

# 决策树分类器

dt = DecisionTreeClassifier()
dt.fit(train_features, train_labels)

print(u&#39;决策树分类器准确率为 %.4lf&#39; % np.mean(cross_val_score(dt, train_features, train_labels, cv=10)))

# AdaBoost 分类器

ada = AdaBoostClassifier(base_estimator=dt_stump,n_estimators=n_estimators)
ada.fit(train_features, train_labels)

print(u&#39;AdaBoost 分类器准确率为 %.4lf&#39; % np.mean(cross_val_score(ada, train_features, train_labels, cv=10)))</p>2019-03-04</li><br/><li><span>梁林松</span> 👍（3） 💬（1）<p>跑第二块代码是需要引入两个模块
from sklearn.tree import DecisionTreeRegressor
from sklearn.neighbors import KNeighborsRegressor
</p>2019-03-04</li><br/><li><span>Liam</span> 👍（2） 💬（1）<p>ax = fig.add_subplot(111)ax.plot([1,n_estimators],[dt_stump_err]*2, &#39;k-&#39;, label=u&#39;决策树弱分类器 错误率&#39;)ax.plot([1,n_estimators],[dt_err]*2,&#39;k--&#39;, label=u&#39;决策树模型 错误率&#39;)ada_err = np.zeros((n_estimators,)).  疑问：这里*2是什么意思，能解析下代码吗？</p>2021-03-26</li><br/><li><span>滢</span> 👍（1） 💬（1）<p>得到结果：
CART决策树K折交叉验证准确率: 0.39480897860892333
AdaBoostK折交叉验证准确率: 0.4376641797318339

from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import AdaBoostRegressor
from sklearn.feature_extraction import DictVectorizer
from sklearn.model_selection import cross_val_predict
import pandas as pd
import numpy as np

#读取数据
path = &#39;&#47;Users&#47;apple&#47;Desktop&#47;GitHubProject&#47;Read mark&#47;数据分析&#47;geekTime&#47;data&#47;&#39;
train_data = pd.read_csv(path + &#39;Titannic_Data_train.csv&#39;)
test_data = pd.read_csv(path + &#39;Titannic_Data_test.csv&#39;)

#数据清洗
train_data[&#39;Age&#39;].fillna(train_data[&#39;Age&#39;].mean(),inplace=True)
test_data[&#39;Age&#39;].fillna(test_data[&#39;Age&#39;].mean(), inplace=True)
train_data[&#39;Embarked&#39;].fillna(&#39;S&#39;, inplace=True)
test_data[&#39;Embarked&#39;].fillna(&#39;S&#39;, inplace=True)

#特征选择
features = [&#39;Pclass&#39;,&#39;Sex&#39;,&#39;Age&#39;,&#39;SibSp&#39;,&#39;Parch&#39;,&#39;Embarked&#39;]
train_features = train_data[features]
train_result = train_data[&#39;Survived&#39;]
test_features = test_data[features]
devc = DictVectorizer(sparse=False)
train_features = devc.fit_transform(train_features.to_dict(orient=&#39;record&#39;))
test_features = devc.fit_transform(test_features.to_dict(orient=&#39;record&#39;))

#构造决策树，进行预测
tree_regressor = DecisionTreeRegressor()
tree_regressor.fit(train_features,train_result)
predict_tree = tree_regressor.predict(test_features)
#交叉验证准确率
print(&#39;CART决策树K折交叉验证准确率:&#39;, np.mean(cross_val_predict(tree_regressor,train_features,train_result,cv=10)))

#构造AdaBoost
ada_regressor = AdaBoostRegressor()
ada_regressor.fit(train_features,train_result)
predict_ada = ada_regressor.predict(test_features)
#交叉验证准确率
print(&#39;AdaBoostK折交叉验证准确率:&#39;,np.mean(cross_val_predict(ada_regressor,train_features,train_result,cv=10)))
</p>2019-04-21</li><br/><li><span>小晨</span> 👍（0） 💬（1）<p>弱分类器准确率为 0.7868
决策树分类器准确率为 0.7823
AdaBoost分类器准确率为:0.8115

#!&#47;usr&#47;bin&#47;env python

# -_- coding:utf-8 -_-

# Author:Peter

import numpy as np
import pandas as pd
from sklearn.ensemble import AdaBoostClassifier
from sklearn.feature_extraction import DictVectorizer
from sklearn.model_selection import cross_val_score
from sklearn.tree import DecisionTreeClassifier

# 迭代次数

n_estimators = 200
train_data = pd.read_csv(r&#39;data&#47;Titanic_Data_train.csv&#39;)
test_data = pd.read_csv(r&#39;data&#47;Titanic_Data_Test.csv&#39;)

# 用平均年龄将缺失的年龄补齐

train_data[&#39;Age&#39;].fillna(train_data[&#39;Age&#39;].mean(), inplace=True)
test_data[&#39;Age&#39;].fillna(test_data[&#39;Age&#39;].mean(), inplace=True)

# 用平均票价将缺失的票价补齐

train_data[&#39;Fare&#39;].fillna(train_data[&#39;Fare&#39;].mean(), inplace=True)
test_data[&#39;Fare&#39;].fillna(test_data[&#39;Fare&#39;].mean(), inplace=True)

# 用登船港口最多的S补齐缺失

train_data[&#39;Embarked&#39;].fillna(&#39;S&#39;, inplace=True)
test_data[&#39;Embarked&#39;].fillna(&#39;S&#39;, inplace=True)

# 将可用来分类的数据放到训练集中

features = [&#39;Pclass&#39;, &#39;Sex&#39;, &#39;Age&#39;, &#39;SibSp&#39;, &#39;Parch&#39;, &#39;Fare&#39;, &#39;Embarked&#39;]
train_features = train_data[features]
train_labels = train_data[&#39;Survived&#39;]
test_features = test_data[features]

# 字符串数据规范化，转为int型

dvec = DictVectorizer(sparse=False)
train_features = dvec.fit_transform(train_features.to_dict(orient=&#39;record&#39;))
test_features = dvec.transform(test_features.to_dict(orient=&#39;record&#39;))

# 弱分类器

dt_stump = DecisionTreeClassifier(max_depth=1, min_samples_leaf=1)
dt_stump.fit(train_features, train_labels)
print(u&#39;弱分类器准确率为 %.4lf&#39; % dt_stump.score(train_features, train_labels))

# 决策树分类器

dt = DecisionTreeClassifier()
dt.fit(train_features, train_labels)
print(u&#39;决策树分类器准确率为 %.4lf&#39; % np.mean(cross_val_score(dt, train_features, train_labels, cv=10)))

# AdaBoost分类器

ada = AdaBoostClassifier(base_estimator=dt_stump, n_estimators=n_estimators)
ada.fit(train_features, train_labels)
ada_score = np.mean(cross_val_score(ada, train_features, train_labels, cv=10))
print(&quot;AdaBoost分类器准确率为:%.4lf&quot; % ada_score)
</p>2021-03-10</li><br/><li><span>萌辰</span> 👍（0） 💬（1）<p>在AdaBoost、决策树回归、KNN房价预测对比中发现，随机种子对决策树的预测结果有影响。
分别测试了三种不同的随机种子：
dec_regressor=DecisionTreeRegressor(random_state=1)
dec_regressor=DecisionTreeRegressor(random_state=20)
dec_regressor=DecisionTreeRegressor(random_state=30)
测试结果为：
决策树均方误差1 =  36.65
决策树均方误差20 =  25.54
决策树均方误差30 =  37.19
思考：
此处考虑这里没有限制种子的随机性，对比的结果可能过于随机了，无法真实反映算法效果，两种算法原理中随机种子的应用情况不同。思考是不是采用多次随机MSE结果求平均的方法作为【比较项】更为合适
KNN算法无随机种子影响。</p>2020-07-05</li><br/><li><span>§mc²ompleXWr</span> 👍（0） 💬（1）<p>使用自带的数据集就不用做数据规范化么？</p>2020-06-09</li><br/><li><span>鲨鱼鲸鱼鳄鱼</span> 👍（0） 💬（1）<p>老师，请问AdaBoost模型在预测前需不需要对数据进行标准化或者归一化，做有什么好处，不做有什么好处呢</p>2020-05-25</li><br/><li><span>张贺</span> 👍（0） 💬（1）<p>老师讲的很清晰</p>2020-03-27</li><br/><li><span>滨滨</span> 👍（0） 💬（1）<p>分类和回归都是做预测，分类是离散值，回归是连续值</p>2019-04-21</li><br/><li><span>JingZ</span> 👍（0） 💬（1）<p># AdaBoost
一开始竟然蓦然惯性用了AdaBoostRegressor，得到0.33的准确率，最后看了小伙伴代码，立马修正

感觉算法代码不复杂，关键要自己从空白开始写，还需多实战

from sklearn.ensemble import AdaBoostClassifier

# 使用 Adaboost 分类模型

ada = AdaBoostClassifier()
ada.fit(train_features, train_labels)

pred_labels = ada.predict(test_features)

acc_ada_classifier = round(ada.score(train_features, train_labels), 6)
print(u&#39;Adaboost score 准确率为 %.4lf&#39; % acc_ada_classifier)
print(u&#39;Adaboost cross_val_score 准确率为 %.4lf&#39; % np.mean(cross_val_score(ada, train_features, train_labels, cv=10)))

运行
Adaboost score 准确率为 0.8339
Adaboost cross_val_score 准确率为 0.8104</p>2019-03-05</li><br/><li><span>FORWARD―MOUNT</span> 👍（0） 💬（1）<p>老师，房价预测这个算法，50个弱分类器是怎么来的？</p>2019-03-05</li><br/><li><span>佳佳的爸</span> 👍（0） 💬（1）<p>你好老师，完整的源代码在哪里可以下载到? 我说的是每节课里边的源代码。</p>2019-03-04</li><br/>
</ul>

你好，我是王争。今天是节后的第一个工作日，也是我们“春节七天练”的最后一篇。

---

## 几种算法思想必知必会的代码实现

### 回溯

- 利用回溯算法求解八皇后问题
- 利用回溯算法求解0-1背包问题

### 分治

- 利用分治算法求一组数据的逆序对个数

### 动态规划

- 0-1背包问题
- 最小路径和（详细可看@Smallfly整理的 Minimum Path Sum）
- 编程实现莱文斯坦最短编辑距离
- 编程实现查找两个字符串的最长公共子序列
- 编程实现一个数据序列的最长递增子序列

## 对应的LeetCode练习题（@Smallfly 整理）

- Regular Expression Matching（正则表达式匹配）

英文版：[https://leetcode.com/problems/regular-expression-matching/](https://leetcode.com/problems/regular-expression-matching/)

中文版：[https://leetcode-cn.com/problems/regular-expression-matching/](https://leetcode-cn.com/problems/regular-expression-matching/)

- Minimum Path Sum（最小路径和）

英文版：[https://leetcode.com/problems/minimum-path-sum/](https://leetcode.com/problems/minimum-path-sum/)

中文版：[https://leetcode-cn.com/problems/minimum-path-sum/](https://leetcode-cn.com/problems/minimum-path-sum/)

- Coin Change （零钱兑换）

英文版：[https://leetcode.com/problems/coin-change/](https://leetcode.com/problems/coin-change/)

中文版：[https://leetcode-cn.com/problems/coin-change/](https://leetcode-cn.com/problems/coin-change/)

- Best Time to Buy and Sell Stock（买卖股票的最佳时机）

英文版：[https://leetcode.com/problems/best-time-to-buy-and-sell-stock/](https://leetcode.com/problems/best-time-to-buy-and-sell-stock/)

中文版：[https://leetcode-cn.com/problems/best-time-to-buy-and-sell-stock/](https://leetcode-cn.com/problems/best-time-to-buy-and-sell-stock/)

- Maximum Product Subarray（乘积最大子序列）

英文版：[https://leetcode.com/problems/maximum-product-subarray/](https://leetcode.com/problems/maximum-product-subarray/)

中文版：[https://leetcode-cn.com/problems/maximum-product-subarray/](https://leetcode-cn.com/problems/maximum-product-subarray/)

- Triangle（三角形最小路径和）

英文版：[https://leetcode.com/problems/triangle/](https://leetcode.com/problems/triangle/)

中文版：[https://leetcode-cn.com/problems/triangle/](https://leetcode-cn.com/problems/triangle/)

---

到此为止，七天的练习就结束了。这些题目都是我精选出来的，是基础数据结构和算法中最核心的内容。建议你一定要全部手写练习。如果一遍搞不定，你可以结合前面的章节，多看几遍，反复练习，直到能够全部搞定为止。

学习数据结构和算法，最好的方法就是练习和实践。我相信这在任何知识的学习过程中都适用。

最后，祝你工作顺利！学业进步！
<div><strong>精选留言（15）</strong></div><ul>
<li><span>kai</span> 👍（13） 💬（2）<p>听了老师的课程，第一遍的时候，只是在读，现在开始回顾：
课程相关的知识点，做了笔记：https:&#47;&#47;github.com&#47;guokaide&#47;algorithm&#47;blob&#47;master&#47;summary&#47;algorithm.md
课程涉及的题目，也在逐步总结当中：
https:&#47;&#47;github.com&#47;guokaide&#47;algorithm&#47;blob&#47;master&#47;questions&#47;questions.md

希望和大家一起进步，欢迎小伙伴们一起来讨论~
</p>2019-02-11</li><br/><li><span>Richard</span> 👍（2） 💬（1）<p>老师留的题都很不错，正在刷之前没做过的LeetCode题。
参与下答对三题送课程的活动:
Day 1：
1.求众数(Python)
class Solution:
    def majorityElement(self, nums):
        return sorted(nums)[len(nums) &#47;&#47; 2]
2.缺失的第一个正数(Golang)
func firstMissingPositive(nums []int) int {
    if len(nums) == 0 {
		return 1
	}

    var arr = make([]bool, len(nums)+1)
    var idx = 1
    for i := 0; i &lt; len(nums); i++ {
    	if nums[i] &gt;= 0 &amp;&amp; nums[i] &lt; len(arr) {
    		arr[nums[i]] = true
    	}
    }

    for i := 1; i &lt; len(arr); i++ {
    	if arr[i] == false {
    		idx = i
    		break
    	} else {
    		idx = i + 1
    	}
    }

    return idx

}
Day 7: 3. 买卖股票的最佳时机(Python)
class Solution:
def maxProfit(self, prices):
if not prices:
return 0
min_price = prices[0]
res = 0
for i in prices[1:]:
min_price = min(min_price, i)
if res &lt; i - min_price:
res = i - min_price
return res
</p>2019-02-11</li><br/><li><span>明翼</span> 👍（0） 💬（1）<p>请教下老师，遇到一个问题，给多个银行账号，假如每个账号每天都有交易，这样在坐标中可以画出时间和交易金额的曲线，求哪个曲线的更平滑或波动更大，银行账号的交易额度可能相差很大，银行账号交易梳理可能多个。</p>2019-09-03</li><br/><li><span>好运连连</span> 👍（0） 💬（1）<p>老师，请教下。关于物流中转路线，应该采用哪种算法合适？</p>2019-07-10</li><br/><li><span>黄丹</span> 👍（4） 💬（0）<p>课程的最后一天，也是新年上班的第一天，感谢王老师的教育和陪伴，祝您生活开心，工作顺利。
今天的题目比前几天的都难一点，只做了三题，太累了TaT。对于动态规划和贪心总觉得很巧妙，如果想不到动态转移方程式，就很难做，但要是想到了，真的是豁然开朗。对于这一类题，还是要多锻炼，找动态转移方程式要从最后一个结果出发，去想这个结果可以由什么得到，知道之前所有结点的信息，如何推导出当前结点的信息，其实和高中学的归纳法有一点点像。 
下面给出我今天做的三题的解题思路和代码
1.	Problem 121. Best Time to Buy and Sell Stock
解题思路：这道题很久以前做的，我们可以维持两个变量 - 分别对应于最小谷值和最大利润（销售价格和最低价格之间的最大差异）的minprice 和maxprofit。
代码：https:&#47;&#47;github.com&#47;yyxd&#47;leetcode&#47;blob&#47;master&#47;src&#47;leetcode&#47;array&#47;easy&#47;Problem121.java
2.	Problem 120. Triangle
解题思路：这道题给一个由整数组成的三角形，自上而下寻找顶点到三角形边的最短的一条路径，设置一个数组A[0...n-1][0...n-1]，A[i][j]代表到达第i行第j列结点的最短路径 * DP转移方程式为：A[i][j]=min(A[i-1][j-1],A[i-1][j])+triangle[i][j] * 其中二维数组可以简化为一维数组，因为我们只需要上一行结点的信息 * 然后遍历到达最后一行的节点的路径，找到最短路径的值
代码：https:&#47;&#47;github.com&#47;yyxd&#47;leetcode&#47;blob&#47;master&#47;src&#47;leetcode&#47;dp&#47;Problem120_Triangle.java
3.	Problem 322. Coin Change
解题思路：这道题是给定具有n个不同金额的硬币（硬币个数无限）coins[0...n-1]，给一个整数amount，是否给的硬币能正好达到整数，给出能组成整数最少需要的硬币个数. 解法是设置一个数组A[0...amount],进行初始化A[0]=0;A[1...amount] = -1;保存的是当给定金额为i时，所需要的最少的硬币。 * dp转移方程式为 A[k] = 1+min(A[k-coins[0]],A[k-coins[1]],....A[k-coins[n-1]]). * 这里要注意的是判断A[k]是否有解
代码：https:&#47;&#47;github.com&#47;yyxd&#47;leetcode&#47;blob&#47;master&#47;src&#47;leetcode&#47;dp&#47;Problem322_CoinChange.java
课程完结撒花，真的学到好多，自己以后还会反复回顾的，再次感谢王争老师，还有每天负责朗读的声音好好听的修阳小哥哥。
</p>2019-02-11</li><br/><li><span>李皮皮皮皮皮</span> 👍（3） 💬（0）<p>每天一道算法题，风雨无阻（过年偷懒不算😛）</p>2019-02-11</li><br/><li><span>kai</span> 👍（3） 💬（0）<p>动态规划，感觉是面试必考内容，今天跟着这些题目再来复习一遍~</p>2019-02-11</li><br/><li><span>纯洁的憎恶</span> 👍（3） 💬（0）<p>这冲刺压力有点大了😓</p>2019-02-10</li><br/><li><span>kai</span> 👍（2） 💬（0）<p>8皇后问题

public class EightQueen {

    private static final int QUEEN_NUMBER = 8;      &#47;&#47; 皇后个数
    private int[] columns = new int[QUEEN_NUMBER];  &#47;&#47; 每个皇后存储的列 (row, col), row天然不相等
    private int total = 0;

    public int solution() {
        queen(0);
        return total;
    }

    private void queen(int row) {
        if (row == QUEEN_NUMBER) {
            total++;
        } else {
            for (int col = 0; col != QUEEN_NUMBER; col++) {
                columns[row] = col;
                if (isPut(row)) {
                    queen(row+1);
                }
            }
        }
    }

    private boolean isPut(int row) {
         for (int i = 0; i != row; i++) {
             if (columns[row] == columns[i] || row - i == Math.abs(columns[row]-columns[i])) {
                 return false;
             }
         }
         return true;
    }

}</p>2019-02-11</li><br/><li><span>mgxian</span> 👍（1） 💬（0）<p>买卖股票的最佳时机 go 语言实现
package main

import &quot;fmt&quot;

func maxProfit(prices []int) int {
max := -1
for i := 0; i &lt; len(prices); i++ {
for j := i + 1; j &lt; len(prices); j++ {
profit := prices[j] - prices[i]
if profit &gt; 0 &amp;&amp; profit &gt; max {
max = profit
}
}
}

    if max == -1 {
    	return 0
    }

    return max

}

func main() {
testData1 := []int{7, 1, 5, 3, 6, 4}
testData2 := []int{7, 6, 4, 3, 1}

    fmt.Println(maxProfit(testData1))
    fmt.Println(maxProfit(testData2))

}
</p>2019-02-11</li><br/><li><span>虎虎❤️</span> 👍（1） 💬（0）<p>正则表达式
public boolean isMatch(String s, String p) {

    if (s == null || p == null) {
        return false;
    }
    boolean[][] dp = new boolean[s.length()+1][p.length()+1];
    dp[0][0] = true;
    for (int i = 0; i &lt; p.length(); i++) {
        if (p.charAt(i) == &#39;*&#39; &amp;&amp; dp[0][i-1]) {
            dp[0][i+1] = true;
        }
    }
    for (int i = 0 ; i &lt; s.length(); i++) {
        for (int j = 0; j &lt; p.length(); j++) {
            if (p.charAt(j) == &#39;.&#39;) {
                dp[i+1][j+1] = dp[i][j];
            }
            if (p.charAt(j) == s.charAt(i)) {
                dp[i+1][j+1] = dp[i][j];
            }
            if (p.charAt(j) == &#39;*&#39;) {
                if (p.charAt(j-1) != s.charAt(i) &amp;&amp; p.charAt(j-1) != &#39;.&#39;) {
                    dp[i+1][j+1] = dp[i+1][j-1];
                } else {
                    dp[i+1][j+1] = (dp[i+1][j] || dp[i][j+1] || dp[i+1][j-1]);
                }
            }
        }
    }
    return dp[s.length()][p.length()];

}

leetcode的排名第一的答案，搬过来了</p>2019-02-10</li><br/><li><span>云之崖</span> 👍（0） 💬（0）<p>1年左右断断续续，终于学完了所有章节，这些练习题大部分不看提示都能搞得定了。</p>2021-01-22</li><br/><li><span>xxxxL</span> 👍（0） 💬（0）<p>请问这个在哪里呢（详细可看 @Smallfly 整理的 Minimum Path Sum）</p>2020-01-18</li><br/><li><span>大风歌</span> 👍（0） 💬（0）<p>第一遍</p>2020-01-09</li><br/><li><span>好运连连</span> 👍（0） 💬（0）<p>老师，具体的是这样，比如物流公司，用户下单，需要根据最短路线或者最少花费来找出合适的中转路线。 比如需要送货到B城市，A城市发货，但是，很多路线，需要选最合适的路线，比如A到D中转再到E中转最后送货到B。</p>2019-07-10</li><br/>
</ul>

你好，我是王争。初三好！

为了帮你巩固所学，真正掌握数据结构和算法，我整理了数据结构和算法中，必知必会的30个代码实现，分7天发布出来，供你复习巩固所用。今天是第三篇。

和昨天一样，你可以花一点时间，来完成测验。测验完成后，你可以根据结果，回到相应章节，有针对性地进行复习。

前两天的内容，是关于数组和链表、排序和二分查找的。如果你错过了，点击文末的“上一篇”，即可进入测试。

---

## 关于排序和二分查找的几个必知必会的代码实现

### 排序

- 实现归并排序、快速排序、插入排序、冒泡排序、选择排序
- 编程实现O(n)时间复杂度内找到一组数据的第K大元素

### 二分查找

- 实现一个有序数组的二分查找算法
- 实现模糊二分查找算法（比如大于等于给定值的第一个元素）

## 对应的LeetCode练习题（@Smallfly 整理）

- Sqrt(x) （x 的平方根）

英文版：[https://leetcode.com/problems/sqrtx/](https://leetcode.com/problems/sqrtx/)

中文版：[https://leetcode-cn.com/problems/sqrtx/](https://leetcode-cn.com/problems/sqrtx/)

---

做完题目之后，你可以点击“请朋友读”，把测试题分享给你的朋友，说不定就帮他解决了一个难题。

祝你取得好成绩！明天见！
<div><strong>精选留言（15）</strong></div><ul>
<li><span>TryTs</span> 👍（6） 💬（1）<p>虽然现在有很多排序算法自己不会亲自写，但是作为算法的基础，分治，归并，冒泡等排序算法在时间复杂度，空间复杂度以及原地排序这些算法知识上的理解非常有帮助。递归分治这些算法思想在简单的算法中也能体现出来，其实更多的是思维方式的训练。</p>2019-02-07</li><br/><li><span>Monster</span> 👍（1） 💬（2）<p>&#47;**
 * O(n)时间复杂度内求无序数组中第K大元素
 *&#47;
public class TopK {

    public int findTopK(int[] arr, int k) {
        return findTopK(arr, 0, arr.length - 1, k);
    }

    private int findTopK(int[] arr, int left, int right, int k) {
        if (arr.length &lt; k) {
            return -1;
        }
        int pivot = partition(arr, left, right);
        if (pivot + 1 &lt; k) {
            findTopK(arr, pivot + 1, right, k);
        } else if (pivot + 1 &gt; k) {
            findTopK(arr, left, pivot - 1, k);
        }
        return arr[pivot];
    }


    private int partition(int[] array, int left, int right) {
        int pivotValue = array[right];
        int i = left;

        &#47;&#47;小于分区点放在左边 大于分区点放在右边
        for (int j = left; j &lt; right; j++) {
            if (array[j] &lt; pivotValue) {
                int tmp = array[i];
                array[i] = array[j];
                array[j] = tmp;
                i++;
            }
        }
        &#47;&#47;与分区点交换
        int tmp = array[i];
        array[i] = array[right];
        array[right] = tmp;
        return i;
    }

}</p>2019-02-13</li><br/><li><span>C_love</span> 👍（1） 💬（1）<p>Use Binary Search

class Solution {
public int mySqrt(int x) {
if (x == 0 || x == 1) {
return x;
}

        int start = 0;
        int end = (x &gt;&gt; 1) + 1;

        while (start + 1 &lt; end) {
            final int mid = start + ((end - start) &gt;&gt; 1);
            final int quotient = x &#47; mid;
            if (quotient == mid) {
                return mid;
            } else if (quotient &lt; mid) {
                end = mid;
            } else {
                start = mid;
            }
        }

        return start;
    }

}</p>2019-02-07</li><br/><li><span>涤生</span> 👍（0） 💬（1）<p>使用了二分法和牛顿法来解决平方根的求解问题。
二分法：
class Solution:
def mySqrt(self, x):
&quot;&quot;&quot;
:type x: int
:rtype: int
&quot;&quot;&quot;
if x == 1:
return 1
def binarysearch(l, r, x):
while(l&lt;=r):
mid = l + ((r-l)&gt;&gt;1)
if abs(mid*mid-x)&lt;1:
return mid
elif mid*mid &gt; x:
r = mid - 1
else:
l = mid + 1
return r
return binarysearch(0, x&#47;&#47;2, x)
牛顿法：
class Solution:
def mySqrt(self, x):
&quot;&quot;&quot;
:type x: int
:rtype: int
&quot;&quot;&quot;
if x == 1:
return 1
ans = x&#47;&#47;2
while(ans * ans - x&gt;0): # 可以是其他精度
ans = (x &#47;&#47; ans + ans) &#47;&#47; 2
return ans</p>2019-02-07</li><br/><li><span>李皮皮皮皮皮</span> 👍（13） 💬（0）<p>各种排序算法真要说起来实际中使用的最多的也就是快排了。然而各种编程语言内置的标准库都包含排序算法的实现，基本没有自己动手实现的必要。然后作为经典的算法，自己实现一遍，分析分析时间空间复杂度对自己的算法设计大有裨益。需要注意的是为了高效，在实际的实现中，多种排序算法往往是组合使用的。例如c标准库中总体上是快排，但当数据量小于一定程度，会转而使用选择或插入排序。
求平方根使用牛顿法二分逼近😄</p>2019-02-06</li><br/><li><span>虎虎❤️</span> 👍（5） 💬（0）<p>基本排序算法的关注点分为：

1. 时间复杂度。如n的平方（冒泡，选择，插入）；插入排序的优化希尔排序，则把复杂度降低到n的3&#47;2次方；n乘以logn(快排，归并排序，堆排序）。
2. 是否为原地排序。如，归并排序需要额外的辅助空间。
3. 算法的稳定性。稳定排序（by nature）如冒泡，插入，归并。如果把次序考虑在内，可以把其他的排序（如快排，堆排序）也实现为稳定排序。
4. 算法的实现。同为时间复杂度同为n平方的算法中，插入排序的效率更高。但是如果算法实现的不好，可能会降低算法的效率，甚至让稳定的算法变得不稳定。又如，快速排序有不同的实现方式，如三路快排可以更好的应对待排序数组中有大量重复元素的情况。堆排序可以通过自上而下的递归方式实现，也可以通过自下而上的方式实现。
5. 不同算法的特点，如对于近乎有序的数组进行排序，首选插入排序，时间复杂度近乎是n，而快速排序则退化为n平方。

二分查找，需要注意 (l+r)&#47;2可能存在越界问题。

leetcode题，用二分查找找到x*x &gt; n 且(x-1)的平方小于n的数，则n-1就是结果。或者 x的平方小于n且x+1的平方大于n,则返回x。</p>2019-02-07</li><br/><li><span>失火的夏天</span> 👍（4） 💬（0）<p>牛顿法或者二分逼近都可以解决平方根问题，leetcode上有些大神的思路真的很厉害，经常醍醐灌顶</p>2019-02-06</li><br/><li><span>hopeful</span> 👍（3） 💬（0）<p>#O(n)时间复杂度时间复杂度内找到一组数据的第 n大元素
import random
import time

def Array(n):
a = []
for i in range(n):
a.append(random.randint(0 , n))
return a
def QuickSort(n):
array = Array(100)
if n &gt; len(array) or n &lt; 1:
print(&quot;超出范围，找不到&quot;)
return
n = n-1
a = qsort(0 , len(array)-1 , array , n)
print(sorted(array))
print(&quot;-----------------------------&quot;)
print(a)

def qsort(start , end , array , n):
if start == end:
res = array[start]
if start &lt; end:
key = partation(array , start , end)
print(start , key , end)
if key &gt; n :
res = qsort(start , key-1 , array , n)
elif key &lt; n:
res = qsort(key+1 , end , array , n)
else:
res = array[key]
return res

def swap(array , start , end):
temp = array[start]
array[start] = array[end]
array[end] = temp

def partation(array , start , end):
temp = array[start]
while start &lt; end :
while start&lt;end and array[end]&lt;=temp:
end-=1
swap(array , start , end)
while start&lt;end and array[start]&gt;=temp:
start+=1
swap(array , start , end)
return start</p>2019-02-16</li><br/><li><span>kai</span> 👍（2） 💬（0）<p>实现模糊二分查找算法2:

public class BinarySearch {
&#47;&#47; 3. 查找第一个大于等于给定值的元素
public static int bsFistGE(int[] array, int target) {
int lo = 0;
int hi = array.length - 1;

        while (lo &lt;= hi) {
            int mid = lo + ((hi - lo) &gt;&gt; 1);

            if (array[mid] &gt;= target) {
                if (mid == 0 || array[mid-1] &lt; target) {
                    return mid;
                } else {
                    hi = mid - 1;
                }
            } else {
                lo = mid + 1;
            }
        }

        return -1;
    }

    &#47;&#47; 4. 查找最后一个小于等于给定值的元素
    public static int bsLastLE(int[] array, int target) {
        int lo = 0;
        int hi = array.length - 1;

        while (lo &lt;= hi) {
            int mid = lo + ((hi - lo) &gt;&gt; 1);

            if (array[mid] &lt;= target) {
                if (mid == hi || array[mid+1] &gt; target) {
                    return mid;
                } else {
                    lo = mid + 1;
                }
            } else {
                hi = mid - 1;
            }
        }

        return -1;
    }

}</p>2019-02-11</li><br/><li><span>TryTs</span> 👍（1） 💬（0）<p>#include&lt;iostream&gt;
#include&lt;cmath&gt;
using namespace std;
double a = 1e-6;
double sqrt(double n){
double low = 0.0;
double high = n;

int i = 1000;

    while(i--){
    	double mid = low + (high - low) &#47; 2.0;
    	&#47;&#47;cout&lt;&lt;&quot;n:&quot;&lt;&lt;n&lt;&lt;endl;
    	double square = mid * mid;
    	&#47;&#47;cout&lt;&lt;&quot;sq:&quot;&lt;&lt;square&lt;&lt;endl;
    	&#47;&#47;cout&lt;&lt;&quot;s:&quot;&lt;&lt;abs(square - n)&lt;&lt;endl;
    	if(abs(mid * mid - n) &lt; a){
    		return mid;
    	}
    	else{

    		if(square &gt; n){
    			high = mid;
    		}
    		else{
    		    low = mid;
    		}
    	}
    }
    return -2.0;

}
int main(){
double t;
while(true){
cin&gt;&gt;t;
cout&lt;&lt;sqrt(t)&lt;&lt;endl;
}
}</p>2019-02-14</li><br/><li><span>EidLeung</span> 👍（1） 💬（0）<p>编程实现 O(n) 时间复杂度内找到一组数据的第 K 大元素。
这个的时间复杂路应该是n·logk吧？</p>2019-02-12</li><br/><li><span>Abner</span> 👍（1） 💬（0）<p>java实现冒泡排序
代码如下：
package sort;

public class BubbleSort {

    public int[] bubbleSort(int[] array) {
        for (int i = 0;i &lt; array.length - 1;i++) {
            for (int j = 0;j &lt; array.length - i - 1;j++) {
                if (array[j] &gt; array[j + 1]) {
                    int temp = array[j + 1];
                    array[j + 1] = array[j];
                    array[j] = temp;
                }
            }
        }
        return array;
    }

    public static void main(String[] args) {
        int[] array = {10, 9, 8, 7, 6, 5, 4, 3, 2, 1};
        BubbleSort bubbleSort = new BubbleSort();
        int[] result = bubbleSort.bubbleSort(array);
        for (int i = 0;i &lt; result.length;i++) {
            System.out.print(result[i] + &quot; &quot;);
        }
    }

}
</p>2019-02-11</li><br/><li><span>kai</span> 👍（1） 💬（0）<p>实现模糊二分查找算法1:

public class BinarySearch {

    &#47;&#47; 1. 查找第一个值等于给定值的元素
    public static int bsFirst(int[] array, int target) {
        int lo = 0;
        int hi = array.length - 1;

        while (lo &lt;= hi) {
            int mid = lo + ((hi - lo) &gt;&gt; 1);

            if (array[mid] &gt; target) {
                hi = mid - 1;
            } else if (array[mid] &lt; target) {
                lo = mid + 1;
            } else {
                if (mid == lo || array[mid-1] != array[mid]) {
                    return mid;
                } else {
                    hi = mid - 1;
                }
            }
        }

        return -1;
    }

    &#47;&#47; 2. 查找最后一个值等于给定值的元素
    public static int bsLast(int[] array, int target) {
        int lo = 0;
        int hi = array.length - 1;

        while (lo &lt;= hi) {
            int mid = lo + ((hi - lo) &gt;&gt; 1);

            if (array[mid] &gt; target) {
                hi = mid - 1;
            } else if (array[mid] &lt; target) {
                lo = mid + 1;
            } else {
                if (mid == hi || array[mid] != array[mid+1]) {
                    return mid;
                } else {
                    lo = mid + 1;
                }
            }
        }

        return -1;
    }

}</p>2019-02-11</li><br/><li><span>kai</span> 👍（1） 💬（0）<p>实现一个有序数组的二分查找算法:

public class BinarySearch {
&#47;&#47; 最简单的二分查找算法：针对有序无重复元素数组
&#47;&#47; 迭代
public static int binarySearch(int[] array, int target) {
if (array == null) return -1;

        int lo = 0;
        int hi = array.length-1; &#47;&#47; 始终在[lo, hi]范围内查找target

        while (lo &lt;= hi) {
            int mid = lo + ((hi - lo) &gt;&gt; 1); &#47;&#47; 这里若是 (lo + hi) &#47; 2 有可能造成整型溢出

            if (array[mid] &gt;  target) {
                hi = mid - 1;
            } else if (array[mid] &lt; target) {
                lo = mid + 1;
            } else {
                return mid;
            }
        }

        return -1;
    }

    &#47;&#47; 递归
    public static int binarySearchRecur(int[] array, int target) {
        if (array == null) return -1;
        return bs(array, target, 0, array.length-1);
    }

    private static int bs(int[] array, int target, int lo, int hi) {
        if (lo &lt;= hi) {
            int mid = lo + ((hi - lo) &gt;&gt; 1);
            if (array[mid] &gt; target) {
                return bs(array, target, lo, mid-1);
            } else if (array[mid] &lt; target) {
                return bs(array, target, mid+1, hi);
            } else {
                return mid;
            }
        }

        return -1;
    }

}</p>2019-02-11</li><br/><li><span>纯洁的憎恶</span> 👍（1） 💬（0）<p>这道题似乎可以等价于从1到x中找到一个数y，使得y*y小于等于x，且（y+1）*（y+1）大于x。那么可以从1到x逐个尝试，提高效率可以采用二分查找方法，时间复杂度为O（logx）。</p>2019-02-09</li><br/>
</ul>

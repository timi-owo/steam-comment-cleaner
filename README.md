# 🚮 **steam-comment-cleaner**
*📌 a simple and useful tool for deleting all comments on your steam profile.*

![usage](/screenshot/usage.png)

![result](/screenshot/result.png)

![confirm](/screenshot/confirm.png)
![deleting](/screenshot/deleting.png)
![done](/screenshot/done.png)

## 📌 问题反馈（Feedback）

- 如果使用过程中弹出了错误提示，或在某个环节无响应，请先重试几次。
- 若还是没有解决，请返回 `DevTools` 窗口中的 `Console` 选项卡，将里面的所有内容复制，最好截图一份。
- 返回到 Github 页面上方，找到并切换至 `Issues` 选项卡，然后点击 `New Issues`，提交内容和截图。
-
- If an error prompt is displayed or there is no respond during progress, please try again several times first.
- If it's still not solved, please copy all contents from `Console` tab of the `DevTools` window, preferably take a screenshot.
- Back to the top of the GitHub page, find and switch to the `Issues` tab, then click `New Issues` to submit your problem.

## 📌 实现原理（How it works）

- 使用 `XMLHttpRequest` 构建并发送 `Steam Web API` 请求。
- 不存在 VAC 或其它账号安全问题，可以放心使用。
- **注意不要运行未知来源的代码，以免造成损失。**
-
- Using `XMLHttpRequest` build and sent the `Steam Web API` request.
- There is no VAC or other account security problem, you can rest assured to use.
- **Be careful don't running code from unknown sources to avoid account risk.**


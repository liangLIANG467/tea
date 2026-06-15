# 六堡茶AI智能助手

一个基于微信小程序的六堡茶智能助手，结合本地Ollama大模型和TensorFlow深度学习，提供AI问答、病害识别、地图导览和茶园管理等功能。

## 项目概述

本项目是一个完整的前后端分离应用：
- **前端**：微信小程序原生开发（WXML + WXSS + JS）
- **后端**：Python Flask，接入本地Ollama大模型 + TensorFlow病害识别模型
- **特色**：完全本地化运行，无需任何云端API，诊断图片保存至后端统一管理

## 项目结构
六堡茶AI助手/
├── miniprogram/ # 小程序前端
│ ├── app.js # 应用入口
│ ├── app.json # 应用配置
│ ├── app.wxss # 全局样式
│ ├── project.config.json # 项目配置
│ ├── sitemap.json # sitemap配置
│ ├── pages/ # 页面目录
│ │ ├── index/ # 首页
│ │ ├── chat/ # AI茶博士问答
│ │ ├── diagnose/ # 病害识别
│ │ ├── history/ # 诊断历史
│ │ ├── map/ # 地图导览
│ │ ├── garden/ # 我的茶园
│ │ ├── detail/ # 文章详情
│ │ └── profile/ # 我的
│ ├── utils/
│ │ └── api.js # API封装
│ ├── components/ # 公共组件
│ └── images/ # 图片资源
├── backend/ # Python后端
│ ├── app.py # Flask主文件
│ ├── train_model.py # 模型训练脚本
│ ├── requirements.txt # Python依赖
│ ├── models/ # 训练好的模型
│ ├── dataset/ # 数据集
│ │ └── images/ # 诊断图片存储
│ ├── uploads/ # 临时上传目录
│ └── venv/ # Python虚拟环境
└── README.md # 项目说明

text

## 功能模块

### 1. 首页 (index)
- 品牌展示横幅
- 功能入口卡片
- 今日茶知识（每日随机更新）

### 2. AI茶博士问答 (chat)
- 智能对话交互
- 支持6个推荐问题快速问答
- 其他问题调用本地DeepSeek/qwen模型
- 会话历史保存

### 3. 病害识别 (diagnose)
- 拍照/相册上传
- AI病害分析（TensorFlow模型）
- 置信度评估
- 防治建议（化学防治+农业措施）
- 诊断图片自动保存至后端 `dataset/images/` 目录
- 图片命名格式：`病害名称_年月日_时分秒.jpg`

### 4. 诊断历史 (history)
- 查看所有诊断图片
- 图片预览
- 保存到相册
- 单张/批量删除

### 5. 地图导览 (map)
- 茶园位置展示
- 地点搜索
- 导航功能

### 6. 我的茶园 (garden)
- 茶园状态监控
- AI巡检分析
- 生长进度追踪

### 7. 我的 (profile)
- 用户信息编辑
- 使用统计（诊断次数、提问次数、收藏数量）
- 功能设置

### 8. 文章知识库 (detail)
- 六堡茶历史文化
- 冲泡技巧
- 制作工艺
- 养生知识

## 快速开始

### 环境要求

- Python 3.9+
- Node.js (微信开发者工具)
- Ollama (本地大模型)

### 后端部署

**1. 进入后端目录**
```bash
cd D:\weixin\zuoye\liubao_tea_ai-master\backend
2. 创建Python虚拟环境

bash
python -m venv venv
3. 激活虚拟环境

bash
# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate
4. 安装依赖

bash
pip install -r requirements.txt
5. 训练病害识别模型（首次运行需要）

bash
python train_model.py
模型训练需要将病害图片放入 dataset/train/ 目录，按类别分文件夹存放

6. 安装并配置Ollama

bash
# 下载安装Ollama (https://ollama.com/download)

# 下载模型（推荐）
ollama pull deepseek-r1:1.5b
# 或
ollama pull qwen2.5

# 启动Ollama服务（会自动后台运行）
ollama serve
7. 启动Flask后端服务

bash
python app.py
启动成功后会显示：

text
✅ 模型加载成功: models/tea_disease_model.h5
✅ 图片目录已找到: .../miniprogram/images
* Running on http://127.0.0.1:5000
* Running on http://192.168.x.x:5000
小程序配置
1. 下载并安装微信开发者工具

访问：https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html

2. 导入项目

打开微信开发者工具

选择"导入项目"

项目路径选择 D:\weixin\zuoye\liubao_tea_ai-master\miniprogram

AppID：使用测试号或注册小程序

3. 配置后端地址

编辑 miniprogram/utils/api.js

修改 BASE_URL 为实际后端地址：

javascript
// 开发者工具调试
const BASE_URL = 'http://127.0.0.1:5000';

// 真机调试（需要同一WiFi）
const BASE_URL = 'http://192.168.x.x:5000';  // 替换为电脑IP
4. 关闭域名校验

在微信开发者工具中：详情 → 本地设置 → 勾选"不校验合法域名"

5. 运行项目

点击"编译"按钮

在模拟器中查看效果

设计规范
配色方案
颜色名称	色值	用途
主色-深棕	#5D4037	导航栏、主要按钮
辅色-墨绿	#2E7D32	功能按钮、强调元素
背景-暖米	#F5F0E8 / #FAF7F2	页面背景
卡片-白	#FFFFFF	卡片背景
强调-棕红	#8D6E63	次要强调
浅绿	#A5D6A7	进度条、成功状态
文字-深棕	#3E2723	主要文字
文字-灰	#9E9E9E	次要文字
圆角规范
小圆角：12rpx（标签、小按钮）

中圆角：16rpx（输入框）

大圆角：24rpx（卡片、主按钮）

阴影规范
卡片阴影：0 2rpx 8rpx rgba(93, 64, 55, 0.1)

按钮阴影：0 4rpx 12rpx rgba(46, 125, 50, 0.3)

后端API
接口	方法	描述
/api/chat	POST	AI问答
/api/diagnose	POST	病害识别
/api/diagnose/save	POST	保存诊断图片
/api/diagnose/images/list	GET	获取诊断图片列表
/api/diagnose/image/<filename>	GET	获取诊断图片
/api/diagnose/image/delete/<filename>	DELETE	删除图片
/api/diagnose/images/delete-all	DELETE	删除所有图片
/api/inspect	POST	茶园巡检
/api/tea_knowledge	GET	茶知识
/api/articles	GET	文章列表
/api/article/<id>	GET	文章详情
/api/model_info	GET	模型信息
/health	GET	健康检查
技术栈
前端
微信小程序原生框架

WXML + WXSS + JavaScript

微信小程序地图组件

wx.request 网络请求

后端
Python 3.9+

Flask (Web框架)

TensorFlow 2.13 (深度学习)

MobileNetV2 / EfficientNetB0 (病害识别)

Ollama (本地大模型)

Pillow (图像处理)

NumPy (数值计算)

数据存储说明
数据类型	存储位置	说明
诊断图片	backend/dataset/images/	命名格式：病害名称_时间.jpg
文章数据	app.py 中的 ARTICLES 字典	可扩展为数据库
聊天记录	小程序本地存储 chat_history	用于统计提问次数
会话列表	小程序本地存储 chat_sessions	保存对话会话
用户信息	小程序本地存储 userInfo	用户昵称、头像
注意事项
本地运行：本项目设计为本地运行，后端服务需要与微信开发者工具运行在同一机器或可网络访问的位置

Ollama服务：确保Ollama服务已启动，默认地址为 http://localhost:11434

模型要求：

病害识别模型：需先运行 train_model.py 训练生成

文本对话：支持 deepseek-r1:1.5b、qwen2.5 等

图片存储：诊断图片保存至 backend/dataset/images/，删除图片会同时删除文件

微信开发者工具：

需要使用微信开发者工具的"本地项目"模式

需关闭域名校验进行测试

真机调试需确保手机与电脑在同一WiFi

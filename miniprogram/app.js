/**
 * 小程序应用入口文件
 * 六堡茶AI智能助手
 */

// app.js

App({
  // 全局数据
  globalData: {
    userInfo: null,
    sessionId: '',
    baseUrl: 'http://localhost:8000',
    // Ollama配置
    ollamaUrl: 'http://localhost:11434'
  },

  /**
   * 小程序初始化
   * 当小程序初始化完成时触发
   */
  onLaunch() {
    // 生成会话ID
    this.generateSessionId();
    
    // 检查登录状态
    this.checkLoginStatus();
    
    // 获取系统信息
    this.getSystemInfo();
    
    console.log('六堡茶AI助手已启动');
  },

  /**
   * 生成唯一的会话ID
   * 用于标识用户的对话会话
   */
  generateSessionId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    this.globalData.sessionId = `liupao_${timestamp}_${random}`;
  },

  /**
   * 检查登录状态
   * 模拟登录，实际项目中可结合微信登录
   */
  checkLoginStatus() {
    // 模拟已登录用户
    this.globalData.userInfo = {
      nickName: '茶友_007',
      avatarUrl: '/images/default_avatar.png',
      joinDays: 365,
      userId: 'LP007'
    };
  },

  /**
   * 获取系统信息
   * 用于适配不同设备
   */
  getSystemInfo() {
    try {
      const systemInfo = wx.getSystemInfoSync();
      this.globalData.systemInfo = systemInfo;
      this.globalData.statusBarHeight = systemInfo.statusBarHeight;
      this.globalData.navBarHeight = 44;
    } catch (e) {
      console.error('获取系统信息失败', e);
    }
  },

  /**
   * 显示加载提示
   * @param {string} title 提示内容
   * @param {boolean} mask 是否显示透明蒙层
   */
  showLoading(title = '加载中...', mask = true) {
    wx.showLoading({
      title: title,
      mask: mask
    });
  },

  /**
   * 隐藏加载提示
   */
  hideLoading() {
    wx.hideLoading();
  },

  /**
   * 显示成功提示
   * @param {string} title 提示内容
   * @param {function} callback 回调函数
   */
  showSuccess(title = '成功', callback) {
    wx.showToast({
      title: title,
      icon: 'success',
      duration: 1500,
      success: () => {
        if (callback) {
          setTimeout(callback, 1500);
        }
      }
    });
  },

  /**
   * 显示错误提示
   * @param {string} title 提示内容
   */
  showError(title = '出错了') {
    wx.showToast({
      title: title,
      icon: 'none',
      duration: 2000
    });
  },

  /**
   * 发起网络请求
   * @param {object} options 请求选项
   */
  request(options) {
    const app = this;
    const defaultOptions = {
      url: '',
      method: 'GET',
      data: {},
      header: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    };

    const requestOptions = Object.assign({}, defaultOptions, options);
    
    // 添加完整的URL
    if (!requestOptions.url.startsWith('http')) {
      requestOptions.url = app.globalData.baseUrl + requestOptions.url;
    }

    return new Promise((resolve, reject) => {
      wx.request({
        ...requestOptions,
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data);
          } else {
            reject(new Error(`请求失败: ${res.statusCode}`));
          }
        },
        fail: (err) => {
          console.error('请求失败', err);
          reject(err);
        }
      });
    });
  },

  /**
   * 上传文件
   * @param {string} filePath 文件路径
   * @param {string} formData 附加数据
   */
  uploadFile(filePath, formData = {}) {
    return new Promise((resolve, reject) => {
      wx.uploadFile({
        url: this.globalData.baseUrl + '/api/diagnose',
        filePath: filePath,
        name: 'image',
        formData: formData,
        success: (res) => {
          if (res.statusCode === 200) {
            const data = JSON.parse(res.data);
            resolve(data);
          } else {
            reject(new Error(`上传失败: ${res.statusCode}`));
          }
        },
        fail: (err) => {
          reject(err);
        }
      });
    });
  }
});

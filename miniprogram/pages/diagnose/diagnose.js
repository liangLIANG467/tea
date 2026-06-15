/**
 * 病害识别页面逻辑
 * 六堡茶AI智能助手 - 连接真实后端
 */

Page({
  data: {
    currentStep: 1,
    selectedImagePath: '',
    diagnoseResult: null,
    isLoading: false,
    steps: [
      { id: 1, title: '拍摄叶片', icon: '📷', status: 'active' },
      { id: 2, title: 'AI分析', icon: '🔬', status: 'wait' },
      { id: 3, title: '获取处方', icon: '💊', status: 'wait' }
    ]
  },

  // 统一的后端地址
  BASE_URL: 'http://127.0.0.1:5000',

  onLoad: function(options) {},

  onShow: function() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 2 });
    }
    // 每次显示时更新统计数据
    this.updateStatsCount();
  },

  /**
   * 更新统计数据（从后端 images 文件夹获取图片数量）
   */
  updateStatsCount: function() {
    wx.request({
      url: `${this.BASE_URL}/api/diagnose/images/list`,
      method: 'GET',
      success: (res) => {
        if (res.data && res.data.success) {
          const diagnoseCount = res.data.total;
          // 保存到全局或本地存储，供 profile 页面使用
          const app = getApp();
          if (app.globalData) {
            app.globalData.diagnoseCount = diagnoseCount;
          }
          wx.setStorageSync('diagnose_count', diagnoseCount);
          console.log('📊 更新诊断次数:', diagnoseCount);
        }
      },
      fail: (err) => {
        console.error('获取诊断次数失败:', err);
      }
    });
  },

  chooseImage: function() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      cameraDevice: 'back',
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        this.setData({
          selectedImagePath: tempFilePath,
          currentStep: 2
        });
        this.updateSteps(2);
        this.startDiagnose(tempFilePath);
      },
      fail: (err) => {
        console.error('选择图片失败', err);
        wx.showToast({ title: '请允许访问相机/相册', icon: 'none' });
      }
    });
  },

  retakePhoto: function() {
    this.chooseImage();
  },

  startDiagnose: function(filePath) {
    this.setData({ isLoading: true });
    this.updateSteps(2);
    
    wx.uploadFile({
      url: `${this.BASE_URL}/api/diagnose`,
      filePath: filePath,
      name: 'image',
      formData: { detailed: 'true' },
      success: (res) => {
        wx.hideLoading();
        console.log('后端返回原始数据:', res.data);
        
        try {
          const data = JSON.parse(res.data);
          
          const diagnoseResult = {
            disease: data.disease || '未知病害',
            confidence: data.confidence || 0,
            treatment: data.treatment || data.advice || '请咨询专业人士',
            prevention: data.prevention || '',
            symptoms: data.symptoms || '',
            ai_suggestion: data.ai_suggestion || '',
            confidencePercent: ((data.confidence || 0) * 100).toFixed(0) + '%'
          };
          
          this.setData({
            diagnoseResult: diagnoseResult,
            isLoading: false,
            currentStep: 3
          });
          this.updateSteps(3);
          
          wx.showToast({ title: '识别完成', icon: 'success' });
          
        } catch (e) {
          console.error('解析结果失败', e);
          wx.showToast({ title: '数据解析失败', icon: 'error' });
          this.resetDiagnose();
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('网络请求失败', err);
        wx.showModal({
          title: '提示',
          content: `连接服务器失败\n请确保后端服务已启动`,
          showCancel: false,
          success: () => this.resetDiagnose()
        });
        this.setData({ isLoading: false });
      }
    });
  },

  updateSteps: function(activeStep) {
    const steps = this.data.steps.map((step, index) => {
      let status = 'wait';
      if (step.id < activeStep) status = 'finish';
      else if (step.id === activeStep) status = 'active';
      return { ...step, status: status };
    });
    this.setData({ steps: steps });
  },

  resetDiagnose: function() {
    this.setData({
      currentStep: 1,
      selectedImagePath: '',
      diagnoseResult: null,
      isLoading: false
    });
    this.updateSteps(1);
  },

  /**
   * 保存图片和诊断记录到后端
   */
  saveResult: function() {
    if (!this.data.diagnoseResult) {
      wx.showToast({ title: '没有识别结果', icon: 'none' });
      return;
    }
    
    if (!this.data.selectedImagePath) {
      wx.showToast({ title: '没有可保存的图片', icon: 'none' });
      return;
    }
    
    wx.showLoading({ title: '保存中...', mask: true });
    
    const diagnoseResult = this.data.diagnoseResult;
    
    // 构建表单数据
    const formData = {
      disease: diagnoseResult.disease,
      confidence: diagnoseResult.confidence,
      confidencePercent: diagnoseResult.confidencePercent,
      treatment: diagnoseResult.treatment,
      prevention: diagnoseResult.prevention || '',
      symptoms: diagnoseResult.symptoms || ''
    };
    
    // 上传图片和表单数据到后端
    wx.uploadFile({
      url: `${this.BASE_URL}/api/diagnose/save`,
      filePath: this.data.selectedImagePath,
      name: 'image',
      formData: formData,
      success: (res) => {
        console.log('保存响应:', res.data);
        
        try {
          const data = JSON.parse(res.data);
          if (data.success) {
            wx.hideLoading();
            wx.showToast({ title: '已保存', icon: 'success' });
            
            // 保存成功后更新统计数据
            this.updateStatsCount();
          } else {
            wx.hideLoading();
            wx.showToast({ title: data.message || '保存失败', icon: 'error' });
          }
        } catch (e) {
          wx.hideLoading();
          console.error('解析响应失败', e);
          wx.showToast({ title: '保存失败', icon: 'error' });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('保存到后端失败:', err);
        wx.showToast({ title: '网络错误，保存失败', icon: 'error' });
      }
    });
  },

  /**
   * 格式化时间（用于显示）
   */
  formatTime: function(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  },

  viewHistory: function() {
    wx.navigateTo({ url: '/pages/history/history' });
  },

  navigateBack: function() {
    wx.navigateBack();
  },

  onShareAppMessage: function() {
    return {
      title: '六堡茶病害识别 - AI智能诊断茶树健康',
      path: '/pages/diagnose/diagnose'
    };
  }
});
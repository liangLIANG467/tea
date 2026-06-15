/**
 * 地图导览页面逻辑
 * 六堡茶AI智能助手
 */

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 地图中心坐标（广西苍梧县六堡镇）
    centerLatitude: 23.5985,
    centerLongitude: 111.4228,
    // 缩放级别
    scale: 12,
    // 标记点列表
    markers: [],
    // 当前选中的地点
    selectedPlace: null,
    // 是否显示底部信息卡
    showInfoCard: false,
    // 搜索关键词
    searchKeyword: '',
    // 地点列表
    places: [
      {
        id: 1,
        name: '六堡镇',
        latitude: 23.5985,
        longitude: 111.4228,
        distance: '0km',
        description: '六堡茶的发源地，中国黑茶的重要产区。六堡镇气候温和，雨量充沛，土壤肥沃，非常适合茶树生长。',
        features: ['茶文化发源地', '千年古茶树', '六堡茶集散地'],
        icon: '🏘️',
        address: '广西壮族自治区梧州市苍梧县六堡镇',
        openingHours: '全天开放',
        phone: ''
      },
      {
        id: 2,
        name: '苍梧茶园',
        latitude: 23.6123,
        longitude: 111.4356,
        distance: '2.5km',
        description: '现代化生态茶园，采用有机种植方式。茶园面积超过3000亩，年产优质六堡茶50吨。',
        features: ['有机茶园', '生态示范', '观光体验'],
        icon: '🌱',
        address: '广西壮族自治区梧州市苍梧县六堡镇苍梧茶园',
        openingHours: '08:00-18:00',
        phone: '0774-1234567'
      },
      {
        id: 3,
        name: '茶博园',
        latitude: 23.5856,
        longitude: 111.4089,
        distance: '3.8km',
        description: '六堡茶文化博物馆和体验中心，展示六堡茶的历史文化、制作工艺，可以体验采茶和制茶。',
        features: ['茶文化展示', '制茶体验', '品茗休闲'],
        icon: '🏛️',
        address: '广西壮族自治区梧州市苍梧县六堡镇茶博园',
        openingHours: '09:00-17:00',
        phone: '0774-7654321'
      }
    ],
    // 是否正在加载
    isLoading: false,
    // 用户位置
    userLatitude: null,
    userLongitude: null,
    // 是否获得位置权限
    hasLocationAuth: false
  },

  /**
   * 生命周期函数 - 监听页面加载
   */
  onLoad: function(options) {
    // 检查位置权限
    this.checkLocationAuth();
    // 初始化标记点
    this.initMarkers();
    // 获取用户位置
    this.getUserLocation();
  },

  /**
   * 生命周期函数 - 监听页面显示
   */
  onShow: function() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 2
      });
    }
  },

  /**
   * 检查位置权限
   */
  checkLocationAuth: function() {
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.userLocation']) {
          this.setData({ hasLocationAuth: true });
        }
      }
    });
  },

  /**
   * 初始化地图标记点
   */
  initMarkers: function() {
    const markers = this.data.places.map((place, index) => ({
      id: place.id,
      latitude: place.latitude,
      longitude: place.longitude,
      width: 40,
      height: 40,
      iconPath: '/miniprogram/images/marker.png',
      callout: {
        content: place.name,
        color: '#3E2723',
        fontSize: 14,
        borderRadius: 10,
        padding: 10,
        bgColor: '#FFFFFF',
        display: 'ALWAYS'
      },
      label: {
        content: place.name,
        color: '#5D4037',
        fontSize: 12,
        borderRadius: 8,
        bgColor: '#FFFFFF',
        padding: 6,
        anchorX: 0,
        anchorY: -20
      }
    }));
    
    this.setData({ markers });
  },

  /**
   * 获取用户位置
   */
  getUserLocation: function() {
    this.setData({ isLoading: true });
    
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        console.log('用户位置', res);
        this.setData({
          userLatitude: res.latitude,
          userLongitude: res.longitude,
          hasLocationAuth: true,
          isLoading: false
        });
        // 计算各地点距离
        this.calculateDistances();
        // 添加用户位置标记
        this.addUserMarker(res.latitude, res.longitude);
      },
      fail: (err) => {
        console.log('获取位置失败', err);
        this.setData({ isLoading: false });
        
        if (err.errMsg.indexOf('auth deny') > -1) {
          wx.showModal({
            title: '位置权限',
            content: '需要获取您的位置信息，以便提供附近茶园导航服务',
            confirmText: '去设置',
            success: (res) => {
              if (res.confirm) {
                wx.openSetting();
              }
            }
          });
        } else {
          wx.showToast({
            title: '获取位置失败',
            icon: 'none'
          });
        }
      }
    });
  },

  /**
   * 添加用户位置标记
   */
  addUserMarker: function(latitude, longitude) {
    const userMarker = {
      id: 999,
      latitude: latitude,
      longitude: longitude,
      width: 30,
      height: 30,
      callout: {
        content: '我的位置',
        color: '#2E7D32',
        fontSize: 12,
        borderRadius: 8,
        padding: 6,
        bgColor: '#FFFFFF',
        display: 'ALWAYS'
      }
    };
    
    const markers = [...this.data.markers, userMarker];
    this.setData({ markers });
  },

  /**
   * 计算各地点距离
   */
  calculateDistances: function() {
    if (!this.data.userLatitude) return;
    
    const places = this.data.places.map(place => {
      const distance = this.getDistance(
        this.data.userLatitude,
        this.data.userLongitude,
        place.latitude,
        place.longitude
      );
      return {
        ...place,
        distance: distance
      };
    });
    
    // 按距离排序
    places.sort((a, b) => {
      const distA = parseFloat(a.distance) || Infinity;
      const distB = parseFloat(b.distance) || Infinity;
      return distA - distB;
    });
    
    this.setData({ places });
  },

  /**
   * 计算两点间距离（Haversine公式）
   */
  getDistance: function(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    if (distance < 1) {
      return Math.round(distance * 1000) + 'm';
    }
    return distance.toFixed(1) + 'km';
  },

  /**
   * 度数转弧度
   */
  deg2rad: function(deg) {
    return deg * (Math.PI / 180);
  },

  /**
   * 监听搜索输入
   */
  onSearchInput: function(e) {
    this.setData({
      searchKeyword: e.detail.value
    });
  },

  /**
   * 清除搜索
   */
  clearSearch: function() {
    this.setData({
      searchKeyword: '',
      showInfoCard: false,
      selectedPlace: null
    });
  },

  /**
   * 执行搜索
   */
  doSearch: function() {
    const keyword = this.data.searchKeyword.trim();
    if (!keyword) {
      wx.showToast({
        title: '请输入搜索关键词',
        icon: 'none'
      });
      return;
    }
    
    // 在地点列表中搜索
    const found = this.data.places.find(place => 
      place.name.includes(keyword) || 
      place.description.includes(keyword) ||
      place.features.some(f => f.includes(keyword))
    );
    
    if (found) {
      this.setData({
        centerLatitude: found.latitude,
        centerLongitude: found.longitude,
        scale: 14
      });
      this.showPlaceInfo(found);
    } else {
      wx.showToast({
        title: '未找到相关地点',
        icon: 'none'
      });
    }
  },

  /**
   * 点击标记点
   */
  onMarkerTap: function(e) {
    const markerId = e.detail.markerId;
    // 跳过用户位置标记
    if (markerId === 999) return;
    
    const place = this.data.places.find(p => p.id === markerId);
    if (place) {
      this.showPlaceInfo(place);
    }
  },

  /**
   * 点击地图其他区域
   */
  onMapTap: function() {
    this.setData({
      showInfoCard: false,
      selectedPlace: null
    });
  },

  /**
   * 显示地点信息卡
   */
  showPlaceInfo: function(place) {
    this.setData({
      selectedPlace: place,
      showInfoCard: true
    });
  },

  /**
   * 隐藏信息卡
   */
  hideInfoCard: function() {
    this.setData({
      showInfoCard: false,
      selectedPlace: null
    });
  },

  /**
   * 开始导航
   */
  startNavigation: function() {
    const place = this.data.selectedPlace;
    if (!place) return;
    
    wx.openLocation({
      latitude: place.latitude,
      longitude: place.longitude,
      name: place.name,
      address: place.address,
      scale: 16
    });
  },

  /**
   * 查看详情
   */
  viewDetail: function() {
    const place = this.data.selectedPlace;
    if (!place) return;
    
    wx.showModal({
      title: place.name,
      content: `${place.description}\n\n📍 地址：${place.address}\n🕐 营业时间：${place.openingHours}\n🏷️ 特色：${place.features.join('、')}`,
      confirmText: '开始导航',
      cancelText: '关闭',
      success: (res) => {
        if (res.confirm) {
          this.startNavigation();
        }
      }
    });
  },

  /**
   * 切换地点（列表点击）
   */
  selectPlace: function(e) {
    const placeId = e.currentTarget.dataset.id;
    const place = this.data.places.find(p => p.id === placeId);
    
    if (place) {
      this.setData({
        centerLatitude: place.latitude,
        centerLongitude: place.longitude,
        scale: 14
      });
      this.showPlaceInfo(place);
    }
  },

  /**
   * 重新定位到用户位置
   */
  relocateToUser: function() {
    if (this.data.userLatitude && this.data.userLongitude) {
      this.setData({
        centerLatitude: this.data.userLatitude,
        centerLongitude: this.data.userLongitude,
        scale: 14,
        showInfoCard: false,
        selectedPlace: null
      });
      wx.showToast({
        title: '已定位到您的位置',
        icon: 'success',
        duration: 1500
      });
    } else {
      this.getUserLocation();
    }
  },

  /**
   * 分享
   */
  onShareAppMessage: function() {
    return {
      title: '六堡茶茶园地图导览',
      path: '/miniprogram/pages/map/map'
    };
  },

  /**
   * 返回上一页
   */
  navigateBack: function() {
    wx.navigateBack();
  }
});
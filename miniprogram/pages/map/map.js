/**
 * 地图导览页面逻辑
 * 六堡茶AI智能助手
 */

const api = require('../../utils/api.js');

Page({
  data: {
    provinces: [],
    currentProvince: 'guangxi',
    currentProvinceName: '广西',
    centerLatitude: 23.5985,
    centerLongitude: 111.4228,
    scale: 12,
    markers: [],
    selectedPlace: null,
    showInfoCard: false,
    places: [],
    isLoading: false,
    userLatitude: null,
    userLongitude: null,
    hasLocationAuth: false
  },

  onLoad: function(options) {
    this.loadProvinces();
    this.checkLocationAuth();
    this.getUserLocation();
  },

  onShow: function() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 2 });
    }
  },

  /**
   * 加载省份列表
   */
  loadProvinces: function() {
    const BASE_URL = api.BASE_URL || 'http://172.18.106.153:5000';
    
    const defaultProvinces = [
      { id: 'guangxi', name: '广西' },
      { id: 'yunnan', name: '云南' },
      { id: 'fujian', name: '福建' },
      { id: 'zhejiang', name: '浙江' },
      { id: 'anhui', name: '安徽' },
      { id: 'sichuan', name: '四川' },
      { id: 'guizhou', name: '贵州' },
      { id: 'hunan', name: '湖南' },
      { id: 'jiangsu', name: '江苏' },
      { id: 'henan', name: '河南' }
    ];
    
    this.setData({ 
      provinces: defaultProvinces,
      currentProvince: 'guangxi',
      currentProvinceName: '广西'
    });
    
    this.loadGardensByProvince('guangxi');
    
    wx.request({
      url: `${BASE_URL}/api/provinces`,
      method: 'GET',
      success: (res) => {
        if (res.data && res.data.success && res.data.data.length > 0) {
          this.setData({ provinces: res.data.data });
        }
      },
      fail: (err) => {
        console.error('加载省份失败，使用默认数据');
      }
    });
  },

  /**
   * 根据省份加载茶园数据
   */
  loadGardensByProvince: function(provinceId) {
    const BASE_URL = api.BASE_URL || 'http://172.18.106.153:5000';
    
    this.setData({ isLoading: true });
    
    wx.request({
      url: `${BASE_URL}/api/gardens/${provinceId}`,
      method: 'GET',
      success: (res) => {
        console.log('茶园数据返回:', res.data);
        if (res.data && res.data.success) {
          const data = res.data.data;
          const places = data.gardens.map(garden => ({
            ...garden,
            distance: garden.distance || '0km'
          }));
          
          console.log('解析后的地点数据:', places);
          
          this.setData({
            places: places,
            centerLatitude: data.center.latitude,
            centerLongitude: data.center.longitude,
            currentProvinceName: data.province,
            isLoading: false
          });
          
          this.initMarkers();
          this.calculateDistances();
        }
      },
      fail: (err) => {
        console.error('加载茶园数据失败', err);
        this.setData({ isLoading: false });
        wx.showToast({ title: '加载失败', icon: 'error' });
      }
    });
  },

  /**
   * 选择省份
   */
  selectProvince: function(e) {
    const id = e.currentTarget.dataset.id;
    const province = this.data.provinces.find(p => p.id === id);
    
    if (province) {
      this.setData({
        currentProvince: id,
        currentProvinceName: province.name,
        showInfoCard: false,
        selectedPlace: null
      });
      
      this.loadGardensByProvince(id);
    }
  },

  /**
   * 初始化地图标记点
   */
  initMarkers: function() {
    const places = this.data.places || [];
    const markers = places.map((place, index) => ({
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
      }
    }));
    
    // 添加用户位置标记
    if (this.data.userLatitude && this.data.userLongitude) {
      markers.push({
        id: 999,
        latitude: this.data.userLatitude,
        longitude: this.data.userLongitude,
        width: 30,
        height: 30,
        callout: {
          content: '📍 我的位置',
          color: '#2E7D32',
          fontSize: 12,
          borderRadius: 8,
          padding: 6,
          bgColor: '#FFFFFF',
          display: 'ALWAYS'
        }
      });
    }
    
    this.setData({ markers });
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
        this.calculateDistances();
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
          wx.showToast({ title: '获取位置失败', icon: 'none' });
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
        content: '📍 我的位置',
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
   * 点击标记点
   */
  onMarkerTap: function(e) {
    const markerId = e.detail.markerId;
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
      wx.showToast({ title: '已定位到您的位置', icon: 'success', duration: 1500 });
    } else {
      this.getUserLocation();
    }
  },

  onShareAppMessage: function() {
    return {
      title: '六堡茶茶园地图导览',
      path: '/pages/map/map'
    };
  },

  navigateBack: function() {
    wx.navigateBack();
  }
});
